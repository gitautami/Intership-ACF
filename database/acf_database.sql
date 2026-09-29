-- ==============================================================================
-- DATABASE SCHEMA: ACF EDUHUB (db_acf)
-- Diimpor langsung melalui phpMyAdmin / MySQL CLI
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS `db_acf` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `db_acf`;

-- ------------------------------------------------------------------------------
-- 1. TABEL: admin_users (Autentikasi Akun Administrator)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `admin_users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(100) NOT NULL DEFAULT 'Administrator ACF',
  `email` VARCHAR(100) NULL,
  `role` VARCHAR(20) NOT NULL DEFAULT 'superadmin',
  `last_login` DATETIME NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Default Admin Account: username = admin, password = adminacf2026
INSERT INTO `admin_users` (`id`, `username`, `password`, `full_name`, `email`, `role`)
VALUES (1, 'admin', '$2y$10$w09Z32n6X0rEhyHqgCg6h.O3d42rYfIqD1Gv0s9K9F3x3fVnQW.eW', 'Admin Utama ACF Eduhub', 'admin@acf.or.id', 'superadmin')
ON DUPLICATE KEY UPDATE `username` = VALUES(`username`);

-- ------------------------------------------------------------------------------
-- 2. TABEL: categories (Kategori Kabar & Artikel)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `label` VARCHAR(150) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `categories` (`slug`, `label`) VALUES
('kabar-sekolah-daya-setara', 'Artikel Sekolah Daya Setara'),
('kabar-sekolah-juara', 'Artikel Sekolah Juara'),
('artikel', 'Artikel Pendidikan'),
('liputan', 'Liputan Lapangan'),
('vokasi', 'Program Vokasi'),
('opini', 'Kolaborasi & Opini')
ON DUPLICATE KEY UPDATE `label` = VALUES(`label`);

-- ------------------------------------------------------------------------------
-- 3. TABEL: articles (Data Kabar & Artikel Publikasi)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `articles` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NULL,
  `category_slug` VARCHAR(100) NOT NULL,
  `category_label` VARCHAR(150) NOT NULL,
  `author` VARCHAR(100) DEFAULT 'Tim Redaksi ACF',
  `date_display` VARCHAR(50) DEFAULT 'Terbaru',
  `cover_image` TEXT NULL,
  `excerpt` TEXT NULL,
  `content` LONGTEXT NOT NULL,
  `status` ENUM('Terbit', 'Draf') DEFAULT 'Terbit',
  `views` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_cat_slug` (`category_slug`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample Initial Articles
INSERT INTO `articles` (`id`, `title`, `slug`, `category_slug`, `category_label`, `author`, `date_display`, `cover_image`, `excerpt`, `content`, `status`) VALUES
(
  'ART-SDS07',
  'Menyalakan Kembali Api Harapan: Kisah Pejuang PKBM Ceria Taklukkan ANBK 2025',
  'menyalakan-kembali-api-harapan-kisah-pejuang-pkbm-ceria-taklukkan-anbk-2025',
  'kabar-sekolah-daya-setara',
  'Artikel Sekolah Daya Setara',
  'cerianak',
  'Aug 14, 2025',
  'assets/kabar-sekolahdayasetara/2.png',
  'Bandung – Di sudut keheningan, sering terdengar keraguan yang membisik, “Kesempatanmu sudah lewat.” Sebuah kalimat yang mampu memadamkan semangat dan mengubur mimpi. Namun, di tengah riuhnya kota Bandung...',
  '<p><strong>Bandung</strong> – Di sudut keheningan, sering terdengar keraguan yang membisik, <em>“Kesempatanmu sudah lewat.”</em> Sebuah kalimat yang mampu memadamkan semangat dan mengubur mimpi. Namun, di tengah riuhnya kota Bandung, ada sebuah cerita yang membuktikan sebaliknya. Sebuah kisah tentang keberanian untuk mencoba, tentang kepercayaan diri yang kembali menyala.</p><p>Pada tanggal 9 dan 10 Agustus 2025 yang bersejarah, udara di PKBM Bina Cipta, Ujungberung, terasa berbeda. Bukan sekadar udara biasa, melainkan udara yang dipenuhi ketegangan, harapan, dan tekad baja. Sebanyak 16 pejuang dari program Paket C PKBM Ceria Ngamprah dan Pusat melangkah masuk, bukan sebagai siswa biasa, tetapi sebagai gladiator di arena pembuktian diri: Asesmen Nasional Berbasis Komputer (ANBK).</p>',
  'Terbit'
),
(
  'ART-SDS06',
  'Sebuah Langkah Kecil Hari Ini, Lompatan Besar di Masa Depan: Selamat kepada Lulusan Sekolah Daya Setara 2025/2026',
  'sebuah-langkah-kecil-hari-ini-lompatan-besar-di-masa-depan',
  'kabar-sekolah-daya-setara',
  'Artikel Sekolah Daya Setara',
  'cerianak',
  'Aug 7, 2026',
  'assets/kabar-sekolahdayasetara/25.png',
  'Sebuah langkah kecil hari ini akan menjadi lompatan besar di masa depan. Kalimat itu terasa pas untuk menggambarkan momen yang dirayakan Sekolah Daya Setara pada 19 Juli 2026 di PKBM Daya Setara Lembang...',
  '<p>Sebuah langkah kecil hari ini akan menjadi lompatan besar di masa depan. Kalimat itu terasa pas untuk menggambarkan momen yang dirayakan Sekolah Daya Setara pada 19 Juli 2026 di PKBM Daya Setara Lembang: pelepasan peserta didik Tahun Ajaran 2025/2026 yang telah berhasil menyelesaikan perjalanan belajarnya melalui jalur pendidikan kesetaraan Paket B dan Paket C.</p>',
  'Terbit'
),
(
  'ART-SDS05',
  'Tujuh Kisah, Satu Semangat yang Sama: Perjalanan Lulusan Sekolah Daya Setara 2025/2026',
  'tujuh-kisah-satu-semangat-yang-sama-perjalanan-lulusan-sekolah-daya-setara-2025-2026',
  'kabar-sekolah-daya-setara',
  'Artikel Sekolah Daya Setara',
  'cerianak',
  'Aug 7, 2026',
  'assets/kabar-sekolahdayasetara/27 (2).png',
  'Sebuah langkah kecil hari ini akan menjadi lompatan besar di masa depan. Kalimat itu terasa pas untuk menggambarkan momen yang dirayakan Sekolah Daya Setara pada 19 Juli 2026 di PKBM Daya Setara Lembang...',
  '<p>Di balik setiap ijazah yang diraih, ada jalan berliku yang berbeda-beda. Beberapa harus berhenti sekolah karena keadaan ekonomi, beberapa lainnya memilih bekerja lebih dulu sebelum kembali ke bangku belajar, dan tak sedikit yang sempat kehilangan arah sebelum akhirnya menemukan kembali alasan untuk terus belajar.</p>',
  'Terbit'
),
(
  'ART-SDS04',
  'PKBM Ceria di Lembang Resmi di-Launching',
  'pkbm-ceria-di-lembang-resmi-di-launching',
  'kabar-sekolah-daya-setara',
  'Artikel Sekolah Daya Setara',
  'acforid',
  'Sep 12, 2024',
  'assets/kabar-sekolahdayasetara/Foto-Artikel-September-03.jpg',
  'Bandung Barat, 7 September 2024 – Rumah Zakat dan ACF (Anak Ceria Foundation) berkolaborasi dengan Pemerintah Kabupaten Bandung Barat meresmikan Pusat Kegiatan Belajar Masyarakat (PKBM)...',
  '<p><strong>Bandung Barat, 7 September 2024</strong> – Rumah Zakat dan ACF berkolaborasi dengan Pemerintah Kabupaten Bandung Barat meresmikan Pusat Kegiatan Belajar Masyarakat (PKBM) di Desa Mekarwangi, Lembang.</p>',
  'Terbit'
),
(
  'ART-SJ08',
  'Penyuluhan Pencegahan dan Pemberantasan Penyalahgunaan Narkoba: Membangun Generasi Cerdas, Sehat, dan Berprestasi',
  'penyuluhan-pencegahan-dan-pemberantasan-penyalahgunaan-narkoba',
  'kabar-sekolah-juara',
  'Artikel Sekolah Juara',
  'cerianak',
  'Jul 3, 2026',
  'assets/kabar-sekolahjuara/15.png',
  'Tangerang – SD Juara Al Hakim menyelenggarakan kegiatan Penyuluhan Pencegahan dan Pemberantasan Penyalahgunaan Narkoba (P4GN) yang menghadirkan narasumber dari Satresnarkoba Polres Metro Tangerang Kota...',
  '<p><strong>Tangerang</strong> – SD Juara Al Hakim menyelenggarakan kegiatan Penyuluhan Pencegahan dan Pemberantasan Penyalahgunaan Narkoba (P4GN) yang menghadirkan narasumber dari Satresnarkoba Polres Metro Tangerang Kota, AKP Philipus Sudarmanto, S.H., M.H., selaku Kanit 3 Satresnarkoba.</p>',
  'Terbit'
)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

-- ------------------------------------------------------------------------------
-- 4. TABEL: mitra (Form Data Kemitraan Program)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `mitra` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `nama_instansi` VARCHAR(150) NOT NULL,
  `jenis_instansi` VARCHAR(100) NOT NULL,
  `kota_instansi` VARCHAR(100) NOT NULL,
  `nama_pic` VARCHAR(100) NOT NULL,
  `jabatan_pic` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `no_wa` VARCHAR(30) NOT NULL,
  `fokus_program` TEXT NULL,
  `jenis_kemitraan` VARCHAR(100) NULL,
  `estimasi_waktu` VARCHAR(100) NULL,
  `pesan` TEXT NULL,
  `status` ENUM('Menunggu', 'Dihubungi', 'Diproses', 'Selesai', 'Ditolak') DEFAULT 'Menunggu',
  `catatan_admin` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_mitra_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 5. TABEL: relawan (Form Pendaftaran Sahabat Eduhub / Relawan)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `relawan` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `nama_lengkap` VARCHAR(150) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `no_wa` VARCHAR(30) NOT NULL,
  `domisili` VARCHAR(100) NOT NULL,
  `profesi` VARCHAR(100) NOT NULL,
  `peran_relawan` TEXT NULL,
  `komitmen_waktu` VARCHAR(100) NULL,
  `keahlian_utama` TEXT NULL,
  `motivasi` TEXT NULL,
  `status` ENUM('Menunggu', 'Dihubungi', 'Diproses', 'Diterima', 'Ditolak') DEFAULT 'Menunggu',
  `catatan_admin` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_relawan_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 6. TABEL: donations_prayers (Doa & Harapan dari Halaman Donasi)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `donations_prayers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `donator_name` VARCHAR(150) NOT NULL DEFAULT 'Hamba Allah',
  `is_anonymous` TINYINT(1) DEFAULT 0,
  `prayer_text` TEXT NOT NULL,
  `program_target` VARCHAR(100) DEFAULT 'Umum',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample Initial Prayers
INSERT INTO `donations_prayers` (`donator_name`, `is_anonymous`, `prayer_text`, `program_target`) VALUES
('Ahmad Fauzi', 0, 'Semoga anak-anak pejuang PKBM dan Sekolah Juara selalu diberikan kemudahan dan kelancaran dalam menuntut ilmu.', 'Sekolah Juara'),
('Hamba Allah', 1, 'Bismillah, semoga berkah untuk kemajuan pendidikan anak Indonesia.', 'Umum'),
('Siti Rahmawati', 0, 'Semoga ACF semakin meluas manfaatnya ke seluruh penjuru pelosok nusantara. Aamiin.', 'Sekolah Daya Setara')
ON DUPLICATE KEY UPDATE `prayer_text` = VALUES(`prayer_text`);
