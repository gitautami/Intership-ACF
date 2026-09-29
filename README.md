# ACF Eduhub — Web Application & Backend API

Aplikasi Web Resmi **ACF Eduhub** (Social Enterprise untuk Pendidikan Indonesia) terintegrasi dengan **Backend REST API (PHP PDO)** dan **Database MySQL (phpMyAdmin)**.

---

## 📁 Struktur Direktori Proyek

```text
Intership-ACF/
├── BACKEND/
│   ├── api/
│   │   ├── articles.php        # REST API Kabar & Artikel (CRUD, filter, search, view count)
│   │   ├── auth.php            # REST API Login & Autentikasi Admin (BCrypt Hash & Session)
│   │   ├── categories.php      # REST API Manajemen Kategori Artikel
│   │   ├── mitra.php           # REST API Formulir Pendaftaran Mitra Kemitraan
│   │   ├── prayers.php         # REST API Live Stream Doa & Harapan Donatur
│   │   ├── relawan.php         # REST API Formulir Pendaftaran Relawan Eduhub
│   │   ├── stats.php           # REST API Statistik & Ringkasan Metrik Dashboard
│   │   └── upload.php          # Endpoint Upload Gambar / Media ke Server
│   └── config/
│       └── database.php        # Konfigurasi Koneksi PDO MySQL & Header CORS
├── database/
│   └── acf_database.sql        # Skema Database Lengkap & Data Awal (Import di phpMyAdmin)
├── FRONTEND/
│   ├── assets/                 # Asset Gambar, Logo, dan Media
│   ├── css/                    # Stylesheet CSS Modular
│   ├── html/                   # Halaman HTML Web & Admin Portal
│   └── js/
│       ├── admin.js            # Dual Admin Portal Management Logic
│       ├── api.js              # Centralized REST API Client dengan Offline Fallback
│       ├── donasi.js           # Live Doa & Donasi Channel Handler
│       ├── form-kerjasama.js   # Handler Formulir Mitra & Relawan
│       ├── home.js             # Homepage Interactivity & Kabar Terkini Loader
│       ├── kabar.js            # Kabar / Artikel Dynamic Reader & Filter
│       ├── main.js             # Global Utilities & Scroll Animation
│       └── navbar.js           # Navigasi & Mobile Menu Handler
└── README.md
```

---

## 🗄️ Langkah Instalasi & Setup Database MySQL (phpMyAdmin)

### 1. Persiapan Web Server (XAMPP / Laragon)
1. Pastikan Anda telah menginstal **XAMPP** atau **Laragon**.
2. Nyalakan service **Apache** dan **MySQL** dari Control Panel XAMPP/Laragon.
3. Tempatkan folder proyek `Intership-ACF` ke dalam direktori `htdocs` (jika menggunakan XAMPP, biasanya di `C:\xampp\htdocs\Intership-ACF`).

### 2. Import Database ke phpMyAdmin
1. Buka browser dan akses [http://localhost/phpmyadmin](http://localhost/phpmyadmin).
2. Klik tombol **New** (Baru) pada panel kiri phpMyAdmin.
3. Buat database baru dengan nama:
   ```sql
   db_acf
   ```
   *(Pilih collation `utf8mb4_unicode_ci`)*.
4. Klik tab **Import** (Impor) di bagian atas.
5. Klik **Choose File** (Pilih File) dan pilih file:
   ```text
   database/acf_database.sql
   ```
6. Klik tombol **Import** di bagian bawah halaman.
7. Database `db_acf` beserta seluruh tabel (`admin_users`, `articles`, `categories`, `mitra`, `relawan`, `donations_prayers`) dan data awalnya kini telah siap digunakan.

---

## 🔑 Kredensial Login Admin Default

- **URL Admin Portal**: `http://localhost/Intership-ACF/FRONTEND/html/admin.html` (atau buka `admin.html`)
- **Username**: `admin`
- **Password**: `adminacf2026`

---

## 🌐 Menjalankan Aplikasi

### Opsi A: Melalui XAMPP / Apache
Akses langsung melalui browser:
- **Halaman Utama (Beranda)**: [http://localhost/Intership-ACF/FRONTEND/html/index.html](http://localhost/Intership-ACF/FRONTEND/html/index.html)
- **Halaman Kabar & Artikel**: [http://localhost/Intership-ACF/FRONTEND/html/kabar.html](http://localhost/Intership-ACF/FRONTEND/html/kabar.html)
- **Halaman Donasi & Doa**: [http://localhost/Intership-ACF/FRONTEND/html/donasi.html](http://localhost/Intership-ACF/FRONTEND/html/donasi.html)
- **Admin Portal**: [http://localhost/Intership-ACF/FRONTEND/html/admin.html](http://localhost/Intership-ACF/FRONTEND/html/admin.html)

### Opsi B: Menggunakan PHP Built-in Server (Terminal / CMD)
Buka terminal pada root folder proyek dan jalankan:
```bash
php -S localhost:8000
```
Lalu buka [http://localhost:8000/FRONTEND/html/index.html](http://localhost:8000/FRONTEND/html/index.html).

---

## 🛡️ Fitur Keamanan & Desain API
1. **PDO Prepared Statements**: Mencegah serangan SQL Injection di semua endpoint.
2. **BCrypt Password Hashing**: Kredensial admin dienkripsi menggunakan standar industri PHP `password_hash()` dan `password_verify()`.
3. **CORS Support**: Endpoint mendukung panggilan asinkron `fetch()` dengan preflight options & JSON response.
4. **Resilient Offline Fallback**: Jika server backend belum dinyalakan, Frontend JS (`api.js`) secara otomatis menyediakan fallback data lokal sehingga antarmuka tetap berjalan mulus.