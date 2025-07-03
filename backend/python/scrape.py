import re
import asyncio
import socketio
import requests
import eventlet
import nest_asyncio
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from datetime import datetime, timedelta
from playwright.async_api import async_playwright

sio = socketio.Server(cors_allowed_origins="*", async_mode='eventlet')
app = socketio.WSGIApp(sio)

nest_asyncio.apply()
active_sessions = {}
active_scraping_processes = {}

class Scrapper:
    def __init__(self, platform: str):
        self.platform = platform
        self.base_url = {
            "jobstreet": "https://id.jobstreet.com",
            "glints" : "https://glints.com/id"
        }.get(platform, "")
        self.scrape_rules = self.fetch_scrape_rules()

    def fetch_scrape_rules(self): 
        try:
            url = f"http://localhost:3000/api/scrape-config?platform={self.platform}" 
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            raw_rules = response.json()['data']
            return {rule['field_name']: rule for rule in raw_rules}
        except Exception as e: 
            print(f"[ERROR] Gagal fetch config {self.platform}: {e}")
            return {}
        
    def start_heartbeat(self, sid, source, session_id):
        def heartbeat_loop():
            while active_scraping_processes.get(source, False):
                print(f"[Heartbeat] {source} still running")
                sio.emit("scrape_log", f"🟢 Still scraping {source}...", room=session_id)
                sio.emit("status_response", {
                    "source": source,
                    "active": True,
                    "sessionId": session_id
                },room=session_id)
                eventlet.sleep(10) 
        eventlet.spawn(heartbeat_loop)
    
    def get_posted_date(self, text: str) -> str:
        if not text: 
            return None
            
        now = datetime.now()
        if match := re.search(r'(\d+)\s+minutes', text, re.IGNORECASE):
            minutes = int(match.group(1))
            return (now - timedelta(minutes=minutes)).strftime('%Y-%m-%d %H:%M')
        if match := re.search(r'(\d+)\s+hours', text, re.IGNORECASE):
            hours = int(match.group(1))
            return (now - timedelta(hours=hours)).strftime('%Y-%m-%d %H:%M')
        if match := re.search(r'(\d+)\s+days', text, re.IGNORECASE):
            days = int(match.group(1))
            return (now - timedelta(days=days)).strftime('%Y-%m-%d')
        return None

    def extract_text(self, element, default: str = "") -> str:        
        return element.get_text(strip=True) if element else default

    def normalize_salary(self, salary_text: str) -> str:
        if not salary_text:  
            return salary_text
            
        parts = re.findall(r'[\d\.]+', salary_text)
        if not parts: 
            return salary_text
        
        jt_values = []
        for part in parts: 
            raw = int(part.replace('.',''))
            juta = raw / 1_000_000

            s = str(int(juta)) if juta.is_integer() else f"{juta:.1f}"
            jt_values.append(f"{s} jt")
        
        sep = " – " if "–" in salary_text else " - "
        return sep.join(jt_values)
    
    def normalize_work_type(self, work_type_text: str) -> str:
        if not work_type_text: 
            return work_type_text
        
        return work_type_text.replace("_", " ").title()
        
    def get_work_type(self, job_data, url_detail: str, session: requests.Session) -> str:        
        rule = self.scrape_rules.get("work_type")
        if not rule: 
            return None
        
        selector = rule.get("selector_value")
        attr_raw = rule.get("attribute")
        attr = {}
        if attr_raw and "=" in attr_raw:
            k, v = attr_raw.split("=", 1)
            attr[k] = v
        work_type_element = job_data.find(selector, attr)
        if work_type_element: 
            a_element = work_type_element.find("a")
            return self.extract_text(a_element) or self.extract_text(work_type_element)
        
        if url_detail: 
            try:
                detail_resp = session.get(url_detail)
                if detail_resp.status_code == 200:
                    detail_soup = BeautifulSoup(detail_resp.text, "lxml")
                    detail_element = detail_soup.find(selector, attr)
                    if detail_element: 
                        a_element = detail_element.find("a")
                        return self.extract_text(a_element) or self.extract_text(detail_element)
            except Exception as e:
                print(f"Error fetching work_type from detail page: {e}")
        return None
    
    def apply_scrape_rule(self, job_data, field_name: str):
        rule = self.scrape_rules.get(field_name)
        if not rule: 
            return None 
        
        method = rule.get("method")
        selector_value = rule.get("selector_value")
        attribute = rule.get("attribute")

        attr_dict = {}

        if attribute and "=" in attribute:
            k, v = attribute.split("=", 1)
            attr_dict[k] = v

        if method == "get_attribute":
           return job_data.get(attribute)
        
        if method == "find":             
            element = job_data.find(selector_value, attr_dict)                                    
            if not element:
                return None                 
                        
            if field_name == "url_detail":
                href = element.get("href")
                return urljoin(self.base_url, href) if href else None
            return self.extract_text(element)
        
        if method == 'find_all': 
            elements = job_data.find_all(selector_value, attr_dict)
            return " | ".join([self.extract_text(e) for e in elements])
        
        return None
    
    def convert_field_to_output(self, field):
        return {
            "job_id": "Job ID",
            "title": "Title",
            "sub_category": "Sub Category",
            "category": "Category",
            "location": "Location",
            "salary": "Salary",
            "work_type": "Work Type",
            "job_posted": "Job Posted", 
            "url_detail": "URL Detail",                     
        }.get(field, field)
    
    def parse_jobstreet_job_card(self, job_data, session: requests.Session) -> dict:        
        job = {}
        for field in self.scrape_rules:             
            if field == "work_type":
                url_detail = self.apply_scrape_rule(job_data, "url_detail") 
                job["Work Type"] = self.get_work_type(job_data, url_detail, session)
                job["URL Detail"] = url_detail
            else: 
                val = self.apply_scrape_rule(job_data, field)
                if field == "salary" and val:
                    val = self.normalize_salary(val)
                elif field == "job_posted" and val: 
                    val = self.get_posted_date(val)
                elif field == "category":
                    raw = val or ""
                    cleaned = re.sub(r"[()]", "", raw).strip()
                    job["Category"] = cleaned                                        
                    continue
                job[self.convert_field_to_output(field)] = val 
        
        return job if job.get("Job ID") else None      

    def handle_scrape_jobstreet(self, data, sid):
        self.scrape_rules = self.fetch_scrape_rules()
        active_scraping_processes["jobstreet"] = True
        session_id = data.get("sessionId", "unknown")
        sio.enter_room(sid, session_id)
        base_url = "https://id.jobstreet.com/id/jobs"
        total_pages = data.get("total_pages", 2)
        jobs_data = []
        headers = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/114.0.0.0 Safari/537.36"
            )
        }
        jobs_batch = []  
        batch_size = 30

        session = requests.Session()
        session.headers.update(headers)

        total_jobs_data_estimation = total_pages * 32
        jobs_data_processed = 0
        
        try:
            for page_num in range(1, total_pages + 1):
                url = f"{base_url}?sortmode=ListedDate" if page_num == 1 else f"{base_url}?page={page_num}&sortmode=ListedDate"
                sio.emit('scrape_log', f"Mengambil data dari halaman JobStreet {page_num}: {url}", room=session_id)

                resp = session.get(url)
                if resp.status_code != 200:
                    msg = f"Gagal mengambil halaman {page_num}. Status Code: {resp.status_code}"
                    print(msg)
                    sio.emit('scrape_log', msg, room=session_id)
                    continue
                soup = BeautifulSoup(resp.text, "lxml")
                job_cards = soup.find_all("article", {"data-automation": "normalJob"})

                for job_card in job_cards:
                    job = self.parse_jobstreet_job_card(job_card, session)
                    if job:
                        jobs_data.append(job)
                        jobs_batch.append(job) 
                        jobs_data_processed +=1
                        total_jobs_data = jobs_data_processed  

                        log_message = f"Job ke-{total_jobs_data}: {job.get('Title', '[NO TITLE]')} - {job.get('Location', '[NO LOCATION]')}"
                        print(log_message)
                        
                        if len(jobs_batch) >= batch_size:
                            sio.emit("scrape_result", {"source": "jobstreet",  "jobs": jobs_batch, "sessionId": session_id }, room=session_id)
                            jobs_batch = []

                        if jobs_data_processed % 10 == 0:
                            eventlet.sleep(0.1)  
                            percentage = min(int((jobs_data_processed / total_jobs_data_estimation) * 100), 99)
                            loading_info = {
                                'source': 'jobstreet',
                                'jobs_data_processed': jobs_data_processed,
                                'total_jobs_data_estimation': total_jobs_data_estimation,
                                'percentage' : percentage,
                                'sessionId': session_id 
                            }
                            sio.emit("loading", loading_info, room=session_id)
                            active_sessions[session_id] = {
                                "source": "jobstreet",
                                "percentage": loading_info["percentage"]
                            }

                            eventlet.sleep(0.1)
        
            final_loading_info = {
                'source': 'jobstreet',
                'jobs_data_processed': jobs_data_processed,
                'total_jobs_data_estimation': total_jobs_data_estimation,
                'percentage' : 100,
                'sessionId': session_id 
            }
            completion_message = f'✅ SCRAPING COMPLETE: Successfully extracted {len(jobs_data)} jobs from Jobstreet website!'
            print(completion_message)
            sio.emit('scrape_log', completion_message, room=session_id)

            sio.emit("loading", final_loading_info, room=session_id)
            if jobs_batch:
                sio.emit("scrape_result", {"source": "jobstreet",  "jobs": jobs_batch, "sessionId": session_id }, room=session_id)
            sio.emit("scrape_done", {"source": "jobstreet", "total_jobs": len(jobs_data), "sessionId": session_id}, room=session_id)
            
        except Exception as e:
            error_message = f'Error while scraping JobStreet: {str(e)}'
            print(error_message)
            sio.emit("scrape_error", {"source": "jobstreet", "message": error_message, "sessionId": session_id}, room=session_id)
        
        finally:
            active_scraping_processes["jobstreet"] = False   
            active_sessions.pop(session_id, None)

    async def apply_scrape_rule_async(self, job_elem, field_name: str):
        rule = self.scrape_rules.get(field_name)
        if not rule:
            return None

        method = rule.get("method")
        selector_value = rule.get("selector_value")
        attribute = rule.get("attribute")

        try:
            if method == "get_attribute":
                return await job_elem.get_attribute(attribute)

            elif method == "find":
                if attribute and "=" in attribute:
                    k, v = attribute.split("=", 1)
                    selector = f"{selector_value}[{k}='{v}']"
                else:
                    selector = selector_value
                
                el = await job_elem.query_selector(selector)
                if el is None:
                    return None
                if field_name == "url_detail":
                    href = await el.get_attribute("href")
                    return href if href else None
                                
                text = await el.inner_text()
                return text.strip() if text else None                

            elif method == "find_all":
                if attribute and "=" in attribute:
                    k, v = attribute.split("=", 1)
                    selector = f"{selector_value}[{k}='{v}']"
                else:
                    selector = selector_value
                
                elements = await job_elem.query_selector_all(selector)
                if not elements: 
                    return None 
                
                texts = []
                for e in elements:
                    if e is None:
                        continue
                    try:
                        text = await e.inner_text()
                        if text and text.strip():
                            texts.append(text.strip())
                    except Exception as inner_e:
                        print(f"[WARNING] Gagal ambil text dari element: {inner_e}")
                        continue
                return " | ".join(texts) if texts else None

        except Exception as e:
            print(f"Error in apply_scrape_rule_async for {field_name}: {e}")
            return None
        
    async def parse_glints_job_card(self, job_data, base_url: str) -> dict:  
        job = {}

        for field, rule in self.scrape_rules.items():
            # if field == "category":
            #     continue 
            if not rule:
                continue  
            try:                          
                val = await self.apply_scrape_rule_async(job_data, field)                

                if field == "job_posted":
                    val = self.get_posted_date(val) if val else None

                elif field == "url_detail":               
                    if val and not val.startswith("http"):
                        val = f"https://glints.com{val}"
                    job["URL Detail"] = val
                    continue

                elif field == "work_type":
                    val = self.normalize_work_type(val)

                elif field == "location": 
                    if isinstance(val, str):
                        parts = [p.strip() for p in val.split(" | ")]
                        if len(parts) >=2: 
                            val = parts[1]
                        else: 
                            val = val
            
                job[self.convert_field_to_output(field)] = val
            except Exception as e: 
                print(f"[ERROR] Field `{field}` gagal diproses: {e}")
                continue

        return job if job.get("Job ID") else None
    
    def _run_glints_sync(self, data, sid):      
        try:
            asyncio.run(self.handle_scrape_glints(data, sid))
        except Exception as e:
            session_id = data.get("sessionId", "unknown")
            error_message = f"Error di _run_glints_sync: {e}"
            print(error_message)
            sio.emit("scrape_error", {
                "source": "glints",
                "message": error_message,
                "sessionId": session_id
            }, room=session_id)
    
    async def handle_scrape_glints(self, data, sid):        
        active_scraping_processes["glints"] = True
        session_id = data.get("sessionId", "unknown")
        sio.enter_room(sid, session_id)
        self.start_heartbeat(sid, "glints", session_id)

        base_url = "https://glints.com/id/opportunities/jobs/explore?country=ID&locationName=All+Cities%2FProvinces&sortBy=LATEST"
        total_pages = data.get("total_pages", 2)
        email = data.get("email", "sifayi1338@downlor.com")  
        password = data.get("password", "Tes1234567890") 
        jobs_data = []
        processed_job_ids = set()

        total_jobs_data_estimation = total_pages * 30 
        jobs_data_processed = 0
        login_completed = False 
        jobs_batch = []
        batch_size = 30

        try: 
            async with async_playwright() as p: 
                browser = await p.chromium.launch(headless=True,  args=[ '--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--disable-extensions', '--disable-plugins', '--disable-images', '--aggressive-cache-discard', '--memory-pressure-off', '--max_old_space_size=4096'])
                context = await browser.new_context( user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36")
                session_id = data.get("sessionId", "unknown")
                page = await context.new_page()

                for page_num in range(1, total_pages + 1):
                    url = base_url if page_num == 1 else f"{base_url}&page={page_num}"
                    print(f"Accessing Glints page {page_num}: {url}")
                    sio.emit('scrape_log', f"Fetching data from Glints page {page_num}: {url}",room=session_id)

                    await page.goto(url, timeout=90000, wait_until="domcontentloaded")                                
                                        
                    if page_num > 1 and not login_completed:                
                        await page.wait_for_timeout(5000)
                    
                        login_nudge = await page.query_selector('#see-more-jobs-login-nudge')
                        if login_nudge:
                            print("🔐 Login nudge detected, attempting to login...")
                            sio.emit('scrape_log', "Login required. Attempting to log in...", room=session_id)
                                                    
                            login_button = await page.query_selector('#see-more-jobs-login-button')
                            if login_button:
                                await login_button.click()
                                print("Clicked login button")                                                        
                                await page.wait_for_timeout(2000)                                                        
                                email_login_selector = 'a[aria-label="Login with Email button"]'
                                await page.wait_for_selector(email_login_selector, timeout=10000)
                                await page.click(email_login_selector)
                                print("Selected email login option")                            
                                await page.wait_for_selector('#login-form-email', timeout=10000)
                                await page.wait_for_timeout(1000)                            
                                await page.fill('#login-form-email', email)
                                await page.fill('#login-form-password', password)
                                print("Filled login credentials")                                                        
                                submit_button = await page.query_selector('.gtm-login-button button[type="submit"]')
                                if submit_button:
                                    await submit_button.click()
                                    print("Submitted login form")                                                                
                                    await page.wait_for_timeout(5000)
                                    await page.wait_for_load_state("networkidle", timeout=30000)                                                                
                                    login_completed = True                                                                
                                    await page.goto(url, wait_until="domcontentloaded", timeout=100000)
                                    sio.emit('scrape_log', "Login successful. Continuing with scraping...", room=session_id)
                                else:
                                    print("Could not find login submit button")
                                    sio.emit('scrape_log', "Login failed: Could not find submit button", room=session_id)
                                                                                        
                    for _ in range(5):
                        await page.evaluate("window.scrollBy(0, document.body.scrollHeight)")
                        await asyncio.sleep(1)
                                    
                    job_cards = await page.query_selector_all("div[data-gtm-job-id]")
                    cards_count = len(job_cards)
                    print(f"Found {cards_count} job cards on page {page_num}")
                    sio.emit('scrape_log', f"Found {cards_count} job cards on page {page_num}", room=session_id)
                                
                    if page_num == 1:
                        total_jobs_data_estimation = cards_count * total_pages
                        print(f"Updated total estimation: {total_jobs_data_estimation} jobs")
                
                    for job_elem in job_cards:
                        try:
                            if job_elem is None:
                                continue
                            job_id = await self.apply_scrape_rule_async(job_elem, "job_id")

                            if not job_id or job_id in processed_job_ids:
                                continue
                            processed_job_ids.add(job_id)                                                    

                            job = await self.parse_glints_job_card(job_elem, base_url)
                                                                           
                            if job:
                                jobs_data.append(job)
                                jobs_batch.append(job)
                                jobs_data_processed += 1

                                log_message = f"Job ke-{jobs_data_processed}: {job.get('Title', '[NO TITLE]')} - {job.get('Location', '[NO LOCATION]')}"
                                print(log_message)
                                
                                if len(jobs_batch) >= batch_size:
                                    sio.emit("scrape_result", {"source": "glints", "jobs": jobs_batch, "sessionId": session_id}, room=session_id)
                                    jobs_batch = []
                                
                                if jobs_data_processed % 10 == 0:
                                    progress = {
                                        "source": "glints",
                                        "jobs_data_processed": jobs_data_processed,
                                        "total_jobs_data_estimation": total_jobs_data_estimation,
                                        "percentage": min(int((jobs_data_processed / total_jobs_data_estimation) * 100), 99),
                                        "sessionId": session_id
                                    }
                                    sio.emit("loading", progress, room=session_id)
                                    active_sessions[session_id] = {
                                        "source": "glints",
                                        "percentage": progress["percentage"]
                                    }

                                    # await asyncio.sleep(0.1) 
                                    await sio.sleep(0.1)
                    
                        except Exception as e:
                            print(f"Error processing job card: {e}")
                          
                    await asyncio.sleep(2)
            
                await browser.close()
                    
            final_loading_info = {
                'source': 'glints',
                'jobs_data_processed': jobs_data_processed,
                'total_jobs_data_estimation': total_jobs_data_estimation,
                'percentage': 100,
                'sessionId': session_id            
            }
            completion_message = f'✅ SCRAPING COMPLETE: Successfully extracted {len(jobs_data)} jobs from Glints website!'
            print(completion_message)
            sio.emit('scrape_log', completion_message, room=session_id)

            sio.emit("loading", final_loading_info, room=session_id)
                        
            if jobs_batch:
                sio.emit("scrape_result", {"source": "glints", "jobs": jobs_batch, "sessionId": session_id}, room=session_id)
            
            sio.emit("scrape_done", {"source": "glints", "total_jobs": len(jobs_data), "sessionId": session_id}, room=session_id)            
    
        except Exception as e:
            error_message = f'Error while scraping Glints: {str(e)}'
            print(error_message)
            sio.emit("scrape_error", { "source": "glints",  "message": error_message, "sessionId": session_id }, room=session_id)
    
        finally:
            active_scraping_processes["glints"] = False
            active_sessions.pop(session_id, None)
                                            
    def handle_action(self, data, sid,):
        session_id = data.get("sessionId", "unknown")
        action = data.get("action", "scrape")
        if action != "scrape":
            sio.emit("scrape_log", f"Aksi tidak dikenal: {action}", room=session_id)
            return

        source = data.get("source")
        if source == "jobstreet":
            print("🔎 Starting scraping jobstreet website...")
            self.handle_scrape_jobstreet(data, sid)

        elif source == "glints":
            print("🔎 Starting scraping glints website (via Eventlet + asyncio.run)...")            
            eventlet.spawn(self._run_glints_sync, data, sid)

        else:
            sio.emit("scrape_error", {
                "source": source,
                "message": f"Sumber '{source}' tidak didukung",
                "sessionId": data.get("sessionId", "unknown")
            }, room=session_id)

@sio.event
def connect(sid,  environ):
    print("Client connected:", sid)
    sio.emit("scrape_log", "Connected to server!", to=sid)
    for sessionId, progress in active_sessions.items():
        sio.enter_room(sid, sessionId)
        sio.emit("loading", {
            "source": progress["source"],
            "percentage": progress["percentage"],
            "sessionId": sessionId,
        },  to=sid)        
        source = progress["source"]
        is_active = active_scraping_processes.get(source, False)
        sio.emit("status_response", {
            "source": source,
            "active": is_active,
            "sessionId": sessionId
        },  to=sid)

@sio.event
def disconnect(sid):
    print("Client disconnected:", sid)

@sio.event
def scraping_request(sid, data):
    print(f"Scraping request received from {sid}:", data)
    scrapper_instance = Scrapper(data.get("source"))
    eventlet.spawn(scrapper_instance.handle_action, data, sid)

@sio.event
def check_status(sid, data):
    source = data.get("source", "unknown")
    session_id = data.get("sessionId")
    is_active = active_scraping_processes.get(source, False)
    print(f"Status check for {source}: {is_active}")
    sio.emit("status_response", {"source": source, "active": is_active,  "sessionId": session_id}, room=session_id)

if __name__ == "__main__":
    import eventlet
    import eventlet.wsgi
    import logging
    import sys

    logging.basicConfig(stream=sys.stdout, level=logging.INFO)
    print("🌐 Running Socket.IO server at http://localhost:8765")
    eventlet.wsgi.server(eventlet.listen(("0.0.0.0", 8765)), app)