import re
import socketio
import requests
import asyncio
import nest_asyncio
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from mapping import JOBSTREET_MAPPING
from mapping import GLINTS_MAPPING
from datetime import datetime, timedelta
from playwright.async_api import async_playwright

sio = socketio.Server(cors_allowed_origins="*", async_mode='eventlet')
app = socketio.WSGIApp(sio)
active_scraping_processes = {}
nest_asyncio.apply()

class Scrapper:
    def __init__(self):
        self.jobstreet_url = "https://id.jobstreet.com"
    
    def get_posted_date(self, text: str) -> str:        
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

    def normalize_category(self, category_text: str, source: str = "jobstreet") -> str:        
        if not category_text:
            return None 
        if source == "jobstreet":
            cleaned = re.sub(r"[()]", "", category_text).strip()
            return JOBSTREET_MAPPING.get(cleaned, None)
        elif source == "glints":
            return GLINTS_MAPPING.get(category_text, None)            
        return None
   
    def get_work_type(self, job_data, url_detail: str, session: requests.Session) -> str:        
        work_type_element = job_data.find("span", {"data-automation": "job-detail-work-type"})
        if work_type_element:
            a_element = work_type_element.find("a")
            return self.extract_text(a_element) or self.extract_text(work_type_element)
        
        if url_detail:
            detail_resp = session.get(url_detail)
            if detail_resp.status_code == 200:
                detail_soup = BeautifulSoup(detail_resp.text, "lxml")
                detail_element = detail_soup.find("span", {"data-automation": "job-detail-work-type"})
                if detail_element:
                    a_element = detail_element.find("a")
                    return self.extract_text(a_element) or self.extract_text(detail_element)
                return None
            return None
        return None

    def parse_jobstreet_job_card(self, job_data, base_url: str, session: requests.Session) -> dict:        
        job_id = job_data.get('data-job-id')
        if not job_id:
            return None
        title_element = job_data.find("a", {"data-automation": "jobTitle"})
        title = self.extract_text(title_element, None)
        url_detail = title_element.get("href") if title_element else None
        if url_detail:
            url_detail = urljoin(base_url, url_detail)
        location = self.extract_text(job_data.find('span', {'data-automation': 'jobCardLocation'}), None)
        category_element = job_data.find('span', {'data-automation': 'jobClassification'})
        category = self.extract_text(category_element, None)
        if category:
            category = re.sub(r"[()]", "", category).strip()
        sub_category = self.extract_text(job_data.find('span', {'data-automation' : 'jobSubClassification'}), None)
        normalized_category = self.normalize_category(category, "jobstreet")
        work_type = self.get_work_type(job_data, url_detail, session) 
        salary = self.extract_text(job_data.find("span", {"data-automation": "jobSalary"}), None)        
        posted_element = job_data.find("span", {"data-automation": "jobListingDate"})
        posted_text = self.extract_text(posted_element)
        job_posted = self.get_posted_date(posted_text) if posted_text else None

        return {
            "Job ID": job_id,
            "Title": title,
            "Sub Category": sub_category,
            "Category": category,
            "Normalized Category": normalized_category,
            "Location": location,
            "Work Type": work_type,
            "Salary": salary,
            "Job Posted": job_posted,
            "URL Detail": url_detail,
        }

    def handle_scrape_jobstreet(self, data, sid):
        active_scraping_processes["jobstreet"] = True
        session_id = data.get("sessionId", "unknown")
        base_url = "https://id.jobstreet.com"
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
        batch_size = 10

        session = requests.Session()
        session.headers.update(headers)

        total_jobs_data_estimation = total_pages * 32
        jobs_data_processed = 0
        
        try:
            for page_num in range(1, total_pages + 1):
                url = f"{base_url}/id/jobs?sortmode=ListedDate" if page_num == 1 else f"{base_url}/id/jobs?page={page_num}&sortmode=ListedDate"
                sio.emit('scrape_log', f"Mengambil data dari halaman JobStreet {page_num}: {url}", to=sid)

                resp = session.get(url)
                if resp.status_code != 200:
                    msg = f"Gagal mengambil halaman {page_num}. Status Code: {resp.status_code}"
                    print(msg)
                    sio.emit('scrape_log', msg, to=sid)
                    continue
                soup = BeautifulSoup(resp.text, "lxml")
                job_cards = soup.find_all("article", {"data-automation": "normalJob"})

                for index, job_card in enumerate(job_cards, start=1):
                    job = self.parse_jobstreet_job_card(job_card, base_url, session)
                    if job:
                        jobs_data.append(job)
                        jobs_batch.append(job) 
                        jobs_data_processed +=1
                        total_jobs_data = jobs_data_processed  

                        log_message = f"Job ke-{total_jobs_data}: {job['Title']} - {job['Location']}"
                        print(log_message)
                        
                        if len(jobs_batch) >= batch_size:
                            sio.emit("scrape_result", {"source": "jobstreet",  "jobs": jobs_batch, "sessionId": session_id }, to=sid)
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
                            sio.emit("loading", loading_info, to=sid)
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
            sio.emit('scrape_log', completion_message, to=sid)

            sio.emit("loading", final_loading_info, to=sid)
            if jobs_batch:
                sio.emit("scrape_result", {"source": "jobstreet",  "jobs": jobs_batch, "sessionId": session_id }, to=sid)
            sio.emit("scrape_done", {"source": "jobstreet", "total_jobs": len(jobs_data), "sessionId": session_id}, to=sid)
            
        except Exception as e:
            error_message = f'Error while scraping JobStreet: {str(e)}'
            print(error_message)
            sio.emit("scrape_error", {"source": "jobstreet", "message": error_message, "sessionId": session_id}, to=sid)
        
        finally:
            active_scraping_processes["jobstreet"] = False

    def parse_glints_job_card(self, job_data, base_url: str, session: requests.Session) -> dict: 
        job_id = job_data.get('data-gtm-job-id')
        if not job_id: 
            return None   
        title_element = job_data.select_one('a[class*="CompactOpportunityCardsc__JobCardTitleNoStyleAnchor"]')
        title = self.extract_text(title_element)
        url_detail = urljoin(base_url, title_element['href']) if title_element else None
        location_element = job_data.select('a[class*="CompactOpportunityCardsc__JobCardLocationNoStyleAnchor"]')
        location = ', '.join([self.extract_text(anchor) for anchor in location_element]) if location_element else None
        category = job_data.get('data-gtm-job-category', None)
        sub_category = job_data.get('data-gtm-job-sub-category', None)    
        normalized_category = self.normalize_category(category, "glints")
        work_type = job_data.get('data-gtm-job-type', '')
        salary_element = job_data.select_one('span[class*="CompactOpportunityCardsc__SalaryWrapper"]')
        salary = self.extract_text(salary_element)
        posted_element = job_data.select_one('span[class*="CompactOpportunityCardsc__UpdatedAtMessage"]')
        posted_text = self.extract_text(posted_element)
        job_posted = self.get_posted_date(posted_text) if posted_text else None

        return { 
            "Job ID": job_id,
            "Title": title, 
            "Sub Category": sub_category,
            "Category": category,
            "Normalized Category": normalized_category,
            "Location": location,
            "Work Type": work_type,
            "Salary": salary,
            "Job Posted": job_posted,
            "URL Detail": url_detail,
        }
    
    async def handle_scrape_glints(self, data, sid):        
        active_scraping_processes["glints"] = True
        base_url = "https://glints.com/id/opportunities/jobs/explore?country=ID&locationName=All+Cities%2FProvinces&sortBy=LATEST"
        total_pages = data.get("total_pages", 2)
        email = data.get("email", "sifayi1338@downlor.com")  
        password = data.get("password", "Tes1234567890") 
        jobs_data = []
        processed_job_ids = set()

        total_jobs_data_estimation = total_pages * 30 
        jobs_data_processed = 0
        login_completed = False 

        try: 
            async with async_playwright() as p: 
                browser = await p.chromium.launch(headless=True)
                context = await browser.new_context(
                    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
                )
                session_id = data.get("sessionId", "unknown")
                page = await context.new_page()

                for page_num in range(1, total_pages + 1):
                    url = base_url if page_num == 1 else f"{base_url}&page={page_num}"
                    print(f"Accessing Glints page {page_num}: {url}")
                    sio.emit('scrape_log', f"Fetching data from Glints page {page_num}: {url}", to=sid)

                    await page.goto(url, wait_until="domcontentloaded")                                
                    if page_num > 1 and not login_completed:                
                        await page.wait_for_timeout(2000)
                    
                        login_nudge = await page.query_selector('#see-more-jobs-login-nudge')
                        if login_nudge:
                            print("Login nudge detected, attempting to login...")
                            sio.emit('scrape_log', "Login required. Attempting to log in...", to=sid)
                                                    
                            login_button = await page.query_selector('#see-more-jobs-login-button')
                            if login_button:
                                await login_button.click()
                                print("Clicked login button")                                                        
                                await page.wait_for_timeout(1500)                                                        
                                email_login_selector = 'a[aria-label="Login with Email button"]'
                                await page.wait_for_selector(email_login_selector, timeout=5000)
                                await page.click(email_login_selector)
                                print("Selected email login option")                            
                                await page.wait_for_selector('#login-form-email', timeout=5000)
                                await page.wait_for_timeout(1000)                            
                                await page.fill('#login-form-email', email)
                                await page.fill('#login-form-password', password)
                                print("Filled login credentials")                                                        
                                submit_button = await page.query_selector('.gtm-login-button button[type="submit"]')
                                if submit_button:
                                    await submit_button.click()
                                    print("Submitted login form")                                                                
                                    await page.wait_for_timeout(5000)
                                    await page.wait_for_load_state("networkidle")                                                                
                                    login_completed = True                                                                
                                    await page.goto(url, wait_until="domcontentloaded")
                                    sio.emit('scrape_log', "Login successful. Continuing with scraping...", to=sid)
                                else:
                                    print("Could not find login submit button")
                                    sio.emit('scrape_log', "Login failed: Could not find submit button", to=sid)
                                                                    
                    for _ in range(5):
                        await page.evaluate("window.scrollBy(0, document.body.scrollHeight)")
                        await asyncio.sleep(1)
                                    
                    job_cards = await page.query_selector_all("div[data-gtm-job-id]")
                    cards_count = len(job_cards)
                    print(f"Found {cards_count} job cards on page {page_num}")
                    sio.emit('scrape_log', f"Found {cards_count} job cards on page {page_num}", to=sid)
                                
                    if page_num == 1:
                        total_jobs_data_estimation = cards_count * total_pages
                        print(f"Updated total estimation: {total_jobs_data_estimation} jobs")
                
                    for index, job_card in enumerate(job_cards, start=1):
                        try:                            
                            job_id = await job_card.get_attribute("data-gtm-job-id")                                            
                            if job_id in processed_job_ids:
                                print(f"Skipping duplicate job ID: {job_id}")
                                continue
                            processed_job_ids.add(job_id)
                            title_selector = "a[class*='CompactOpportunityCardsc__JobCardTitleNoStyleAnchor']"
                            title_elem = await job_card.query_selector(title_selector)
                            title = await title_elem.inner_text() if title_elem else None                                                    
                            url_detail = await title_elem.get_attribute("href") if title_elem else None
                            if url_detail:
                                url_detail = f"https://glints.com{url_detail}"                                                
                            location_selector = "a[class*='CompactOpportunityCardsc__JobCardLocationNoStyleAnchor']"
                            location_elems = await job_card.query_selector_all(location_selector)
                            locations = []
                            for loc_elem in location_elems:
                                loc_text = await loc_elem.inner_text()
                                if loc_text:
                                    locations.append(loc_text)
                            location = ", ".join(locations) if locations else None                                                
                            category = await job_card.get_attribute("data-gtm-job-category")                                            
                            sub_category = await job_card.get_attribute("data-gtm-job-sub-category")                                                
                            work_type = await job_card.get_attribute("data-gtm-job-type")                        
                            salary_selector = "span[class*='CompactOpportunityCardsc__SalaryWrapper']"
                            salary_elem = await job_card.query_selector(salary_selector)
                            salary = await salary_elem.inner_text() if salary_elem else None                                                
                            posted_selector = "span[class*='CompactOpportunityCardsc__UpdatedAtMessage']"
                            posted_elem = await job_card.query_selector(posted_selector)
                            posted_text = await posted_elem.inner_text() if posted_elem else ""                        
                            job_posted = self.get_posted_date(posted_text) if posted_text else None                                            
                            normalized_category = self.normalize_category(category, "glints")
                                                
                            job = {
                                "Job ID": job_id,
                                "Title": title,
                                "Sub Category": sub_category,
                                "Category": category,
                                "Normalized Category": normalized_category,
                                "Location": location,
                                "Work Type": work_type,
                                "Salary": salary,
                                "Job Posted": job_posted,
                                "URL Detail": url_detail
                            }
                        
                            jobs_data.append(job)
                            jobs_data_processed += 1                            
                        
                            log_message = f"Job ke-{jobs_data_processed}: {job['Title']} - {job['Location']}"
                            print(log_message)
                            
                            loading_info = {
                            'source': 'glints',
                            'jobs_data_processed': jobs_data_processed,
                            'total_jobs_data_estimation': total_jobs_data_estimation,
                            'percentage': min(int((jobs_data_processed / total_jobs_data_estimation) * 100), 99),
                            'sessionId': session_id 
                            }
                        
                            if jobs_data_processed % 10 == 0:
                                eventlet.sleep(0.1)  
                                sio.emit('loading', loading_info, to=sid)
                                eventlet.sleep(0.1)
                    
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
            sio.emit('scrape_log', completion_message, to=sid)

            sio.emit("loading", final_loading_info, to=sid)
            sio.emit("scrape_result", {"source": "glints", "jobs": jobs_data, "sessionId": session_id}, to=sid)
            sio.emit("scrape_done", {"source": "glints", "total_jobs": len(jobs_data), "sessionId": session_id}, to=sid)            
    
        except Exception as e:
            error_message = f'Error while scraping Glints: {str(e)}'
            print(error_message)
            sio.emit("scrape_error", { "source": "glints",  "message": error_message, "sessionId": session_id }, to=sid)
    
        finally:
            active_scraping_processes["glints"] = False
                                            
    def handle_action(self, data, sid):
        action = data.get("action", "scrape")
        if action == "scrape":
            source = data.get("source")
            if source == "jobstreet":
                print("🔎 Starting scraping jobstreet website...")
                self.handle_scrape_jobstreet(data, sid)
            elif source == "glints":
                print("🔎 Starting scraping glints website...")                
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                loop.run_until_complete(self.handle_scrape_glints(data, sid))
                loop.close()
            else:
                sio.emit("scrape_error", {"source": source, "message": f"Sumber '{source}' tidak didukung"}, to=sid)
        else:
            sio.emit("scrape_log", f"Aksi tidak dikenal: {action}", to=sid)

scrapper = Scrapper()

@sio.event
def connect(sid, environ):
    print("Client connected:", sid)
    sio.emit("scrape_log", "Connected to server!", to=sid)

@sio.event
def disconnect(sid):
    print("Client disconnected:", sid)

@sio.event
def scraping_request(sid, data):
    print(f"Scraping request received from {sid}:", data)
    eventlet.spawn(scrapper.handle_action, data, sid)

@sio.event
def check_status(sid, data):
    source = data.get("source", "unknown")
    is_active = active_scraping_processes.get(source, False)
    print(f"Status check for {source}: {is_active}")
    sio.emit("status_response", {"source": source, "active": is_active}, to=sid)

if __name__ == "__main__":
    import eventlet
    import eventlet.wsgi
    import logging
    import sys

    logging.basicConfig(stream=sys.stdout, level=logging.INFO)
    print("🌐 Running Socket.IO server at http://localhost:8765")
    eventlet.wsgi.server(eventlet.listen(("0.0.0.0", 8765)), app)