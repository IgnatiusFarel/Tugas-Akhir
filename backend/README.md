# ⚙️ Backend - Modul Job Trend Information

![NestJS](https://nestjs.com/img/logo_text.svg)  
Backend ini merupakan layanan utama untuk mengelola proses scraping, penyimpanan data, konfigurasi scraping, dan penyajian API untuk frontend Modul Job Trend Information.  
Dibangun menggunakan **NestJS** dengan ORM **Prisma** sehingga mendukung berbagai database (MySQL, PostgreSQL, dll).

---

## 🛠️ Prasyarat
- **Node.js** LTS (v16+)
- **npm** (v8+)
- **Database** (MySQL, PostgreSQL, atau lainnya yang kompatibel dengan Prisma)

---

## 1. 📥 Clone Repository
```bash
git clone <https://gitd3ti.vokasi.uns.ac.id/IgnatiusFarel/tugas-akhir.git>
cd <backend>
````

---

## 2. 📦 Pasang Dependencies

```bash
npm install
```

---

## 3. ⚙️ Konfigurasi Environment

Buat file `.env` di root project dan isi dengan konfigurasi database.

### Contoh untuk MySQL

```env
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/NAMA_DATABASE"
```

### Contoh untuk PostgreSQL

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/NAMA_DATABASE?schema=public"
```

> 💡 **Tips:** Alternatif, gunakan file **`ta-digitefa.sql`** yang sudah tersedia di repository untuk mengimpor struktur awal database.

---

## 4. 🗄️ Setup Prisma (Database)

Jalankan perintah berikut untuk mempersiapkan schema database:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

---

## 5. 🚀 Menjalankan Aplikasi (Development)

```bash
npm run start:dev
```

Aplikasi akan berjalan di:
[http://localhost:3000](http://localhost:3000)

---

## 📚 Referensi Dokumentasi

* [Prisma](https://www.prisma.io/docs)
* [NestJS](https://docs.nestjs.com)


