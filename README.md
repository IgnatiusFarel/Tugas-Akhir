# Modul Job Trend Information 🚀
<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" alt="NestJS" width="80"/>
  <img src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" alt="React" width="80"/>
  <img src="https://www.python.org/static/community_logos/python-logo.png" alt="Python" width="180"/>
</p>
<p align="center">
  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/JOBSTREET_small_scale.png/500px-JOBSTREET_small_scale.png" alt="JobStreet" height="40"/>
  <img src="https://upload.wikimedia.org/wikipedia/commons/d/df/GLINTS_LOGO293.png" alt="Glints" height="40"/>
</p>

## 1. Latar Belakang 🌐
Dalam era digital, platform lowongan kerja daring menjadi sarana utama pencari kerja untuk mengakses informasi dan melamar pekerjaan dengan mudah.  
DIGITEFA (Digital Teaching Factory) hadir sebagai platform yang menghubungkan pencari kerja, perusahaan, institusi pendidikan, dan freelancer.  
Namun, setiap platform lowongan memiliki struktur data yang berbeda sehingga sulit untuk mengetahui **tren lowongan pekerjaan** secara cepat.

Modul **Job Trend Information** hadir sebagai solusi untuk:
- Mengambil data lowongan pekerjaan dari **JobStreet** <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/JOBSTREET_small_scale.png/500px-JOBSTREET_small_scale.png" alt="JobStreet" height="16"/> dan **Glints** <img src="https://upload.wikimedia.org/wikipedia/commons/d/df/GLINTS_LOGO293.png" alt="Glints" height="16"/>.
- Menyajikan data tren lowongan dalam bentuk tabel dan grafik.
- Mendukung pengambilan keputusan berdasarkan informasi pasar kerja terbaru.

---

## 2. Tujuan 🎯
1. **Mengambil data lowongan** secara otomatis (real-time & terjadwal).  
2. **Mengelola data** agar mudah dicari, difilter, dan diekspor (CSV/JSON).  
3. **Menyediakan visualisasi** tren lowongan pekerjaan (kategori, lokasi, gaji, tipe kerja).  
4. **Mempermudah adaptasi** jika struktur halaman sumber berubah dengan fitur konfigurasi scraping.

---

## 3. Manfaat Produk 🤝
- **DIGITEFA** → Mendukung pengembangan sistem pemantauan tren pekerjaan.  
- **Perusahaan** → Membantu menentukan strategi bisnis & pengembangan kursus daring.  
- **Universitas** → Menyelaraskan kurikulum akademik dengan kebutuhan industri.  
- **Penulis/Developer** → Pengalaman membangun sistem berbasis scraping secara end-to-end.

---

## 4. Deskripsi Produk 🔍
Modul Job Trend Information adalah **solusi integratif berbasis teknik web scraping** untuk:
- Menarik data dari dua sumber platform terkemuka (**Jobstreet** & **Glints**).  
- Menyimpan dan mengelola data hanya yang **terbaru** (tidak duplikat).  
- Menyediakan fitur **riwayat scraping** lengkap dengan status & progres.  
- Menyediakan opsi **ekspor data** (CSV & JSON).  
- Menampilkan **visualisasi data** dalam bentuk grafik interaktif.

---

## 5. Kebutuhan Fungsional 📋
| No  | Kode  | Kebutuhan Fungsional                                                                                      | Aktor    |
| --- | ----- | --------------------------------------------------------------------------------------------------------- | -------- |
| 1   | FR01  | Proses scraping langsung dari Jobstreet & Glints.                                                         | Pengguna |
| 2   | FR02  | Penjadwalan scraping otomatis.                                                                            | Pengguna |
| 3   | FR03  | Pencatatan log aktivitas scraping (URL, waktu, status, progres).                                          | Pengguna |
| 4   | FR04  | Penyimpanan & tampilan detail hasil scraping per aktivitas.                                               | Pengguna |
| 5   | FR05  | Unduhan hasil scraping (CSV & JSON).                                                                      | Pengguna |
| 6   | FR06  | Penyimpanan & tampilan seluruh data hasil scraping.                                                       | Pengguna |
| 7   | FR07  | Filter & sort data berdasarkan platform dan waktu.                                                        | Pengguna |
| 8   | FR08  | Visualisasi data dalam bentuk grafik interaktif.                                                          | Pengguna |
| 9   | FR09  | Konfigurasi elemen scraping agar dinamis (selector HTML, metode, atribut).                               | Pengguna |

---

## 6. Arsitektur Produk 🏗
Modul ini dibangun dengan:
- **Frontend** → React + Vite + Ant Design  
- **Backend** → NestJS + Prisma ORM  
- **Scraping Engine** → Python + BeautifulSoup + Playwright  

Semua komponen saling terhubung:
**Frontend** ↔ **Backend (API)** ↔ **Python Scraper**

---

## 7. Panduan Instalasi Global ⚙️

### 7.1 Backend
Panduan lengkap: [📄 README.md Backend](backend/README.md)

### 7.2 Frontend
Panduan lengkap: [📄 README.md Frontend](frontend/README.md)

### 7.3 Python Scraper
Script berada di folder `backend/python`.

#### a. Masuk ke folder Python
```bash
cd backend/python
````

#### b. Install dependencies

```bash
pip install -r requirements.txt
```

#### c. Jalankan script scraping

```bash
python scrape.py
```

---

## 8. Tampilan Menu 🖼

### 8.1 Extract Data

![Extract Data](docs/Halaman%20Extract%20Data.png)

### 8.2 Data Collection

![Data Collection](docs/Halaman%20Data%20Collection.png)

### 8.3 Data Visualization

![Data Visualization](docs/Halaman%20Data%20Visualization.png)

### 8.4 Scrape Config

![Scrape Config](docs/Halaman%20Scrape%20Config.png)

---

## 9. User Manual 📚 
Panduan lengkap penggunaan sistem: ![User Manual 👨🏻‍💻](docs/User%20Manual.pdf)
---

## 10. Teknologi yang Digunakan 🛠

* **NestJS** (Backend API)
* **React** (Frontend)
* **Python** (Scraping Engine)
* **Prisma ORM** (Database Abstraction)
* **Playwright + BeautifulSoup** (Web Scraping)
* **Ant Design** (UI Framework)

---

## 11. Lisensi ©

Proyek ini dikembangkan untuk kebutuhan internal platform **DIGITEFA**.

> **Note:**  
> Ini hanya merupakan potongan modul Tugas Akhir dari ekosistem penuh platform **Job Portal DIGITEFA**.  

