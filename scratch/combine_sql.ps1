$baseSql = @"
-- ==============================================================================
-- DATABASE SCHEMA: ACF EDUHUB (db_acf)
-- Diimpor langsung melalui phpMyAdmin / MySQL CLI
-- Berisi seluruh 52 artikel publikasi lengkap dari website ACF
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS ``db_acf`` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ``db_acf``;

-- ------------------------------------------------------------------------------
-- 1. TABEL: admin_users (Autentikasi Akun Administrator)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ``admin_users`` (
  ``id`` INT AUTO_INCREMENT PRIMARY KEY,
  ``username`` VARCHAR(50) NOT NULL UNIQUE,
  ``password`` VARCHAR(255) NOT NULL,
  ``full_name`` VARCHAR(100) NOT NULL DEFAULT 'Administrator ACF',
  ``email`` VARCHAR(100) NULL,
  ``role`` VARCHAR(20) NOT NULL DEFAULT 'superadmin',
  ``last_login`` DATETIME NULL,
  ``created_at`` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ``updated_at`` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Default Admin Account: username = admin, password = adminacf2026
INSERT INTO ``admin_users`` (``id``, ``username``, ``password``, ``full_name``, ``email``, ``role``)
VALUES (1, 'admin', '$2y$10$w09Z32n6X0rEhyHqgCg6h.O3d42rYfIqD1Gv0s9K9F3x3fVnQW.eW', 'Admin Utama ACF Eduhub', 'admin@acf.or.id', 'superadmin')
ON DUPLICATE KEY UPDATE ``username`` = VALUES(``username``);

-- ------------------------------------------------------------------------------
-- 2. TABEL: categories (Kategori Kabar & Artikel)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ``categories`` (
  ``id`` INT AUTO_INCREMENT PRIMARY KEY,
  ``slug`` VARCHAR(100) NOT NULL UNIQUE,
  ``label`` VARCHAR(150) NOT NULL,
  ``created_at`` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO ``categories`` (``slug``, ``label``) VALUES
('kabar-sekolah-daya-setara', 'Artikel Sekolah Daya Setara'),
('kabar-sekolah-juara', 'Artikel Sekolah Juara'),
('artikel', 'Artikel Pendidikan'),
('liputan', 'Liputan Lapangan'),
('vokasi', 'Program Vokasi'),
('opini', 'Kolaborasi & Opini')
ON DUPLICATE KEY UPDATE ``label`` = VALUES(``label``);

-- ------------------------------------------------------------------------------
-- 3. TABEL: articles (Data Kabar & Artikel Publikasi - 52 Artikel Lengkap)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ``articles`` (
  ``id`` VARCHAR(50) NOT NULL PRIMARY KEY,
  ``title`` VARCHAR(255) NOT NULL,
  ``slug`` VARCHAR(255) NULL,
  ``category_slug`` VARCHAR(100) NOT NULL,
  ``category_label`` VARCHAR(150) NOT NULL,
  ``author`` VARCHAR(100) DEFAULT 'Tim Redaksi ACF',
  ``date_display`` VARCHAR(50) DEFAULT 'Terbaru',
  ``cover_image`` TEXT NULL,
  ``excerpt`` TEXT NULL,
  ``content`` LONGTEXT NOT NULL,
  ``status`` ENUM('Terbit', 'Draf') DEFAULT 'Terbit',
  ``views`` INT DEFAULT 0,
  ``created_at`` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ``updated_at`` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX ``idx_cat_slug`` (``category_slug``),
  INDEX ``idx_status`` (``status``)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

"@

$articlesSeed = [System.IO.File]::ReadAllText("c:\Kuliah\INTERSHIP\INTERSHIP ACF\Github\Intership-ACF\database\all_articles_seed.sql", [System.Text.Encoding]::UTF8)

$footerSql = @"

-- ------------------------------------------------------------------------------
-- 4. TABEL: mitra (Form Data Kemitraan Program)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ``mitra`` (
  ``id`` VARCHAR(50) NOT NULL PRIMARY KEY,
  ``nama_instansi`` VARCHAR(150) NOT NULL,
  ``jenis_instansi`` VARCHAR(100) NOT NULL,
  ``kota_instansi`` VARCHAR(100) NOT NULL,
  ``nama_pic`` VARCHAR(100) NOT NULL,
  ``jabatan_pic`` VARCHAR(100) NOT NULL,
  ``email`` VARCHAR(100) NOT NULL,
  ``no_wa`` VARCHAR(30) NOT NULL,
  ``fokus_program`` TEXT NULL,
  ``jenis_kemitraan`` VARCHAR(100) NULL,
  ``estimasi_waktu`` VARCHAR(100) NULL,
  ``pesan`` TEXT NULL,
  ``status`` ENUM('Menunggu', 'Dihubungi', 'Diproses', 'Selesai', 'Ditolak') DEFAULT 'Menunggu',
  ``catatan_admin`` TEXT NULL,
  ``created_at`` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ``updated_at`` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX ``idx_mitra_status`` (``status``)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 5. TABEL: relawan (Form Pendaftaran Sahabat Eduhub / Relawan)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ``relawan`` (
  ``id`` VARCHAR(50) NOT NULL PRIMARY KEY,
  ``nama_lengkap`` VARCHAR(150) NOT NULL,
  ``email`` VARCHAR(100) NOT NULL,
  ``no_wa`` VARCHAR(30) NOT NULL,
  ``domisili`` VARCHAR(100) NOT NULL,
  ``profesi`` VARCHAR(100) NOT NULL,
  ``peran_relawan`` TEXT NULL,
  ``komitmen_waktu`` VARCHAR(100) NULL,
  ``keahlian_utama`` TEXT NULL,
  ``motivasi`` TEXT NULL,
  ``status`` ENUM('Menunggu', 'Dihubungi', 'Diproses', 'Diterima', 'Ditolak') DEFAULT 'Menunggu',
  ``catatan_admin`` TEXT NULL,
  ``created_at`` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ``updated_at`` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX ``idx_relawan_status`` (``status``)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 6. TABEL: donations_prayers (Doa & Harapan dari Halaman Donasi)
-- Catatan: Tabel dibiarkan bersih (kosong) dan akan terisi saat ada donasi/doa masuk
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ``donations_prayers`` (
  ``id`` INT AUTO_INCREMENT PRIMARY KEY,
  ``donator_name`` VARCHAR(150) NOT NULL DEFAULT 'Hamba Allah',
  ``is_anonymous`` TINYINT(1) DEFAULT 0,
  ``prayer_text`` TEXT NOT NULL,
  ``program_target`` VARCHAR(100) DEFAULT 'Umum',
  ``created_at`` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

"@

$bt = [char]96
$baseClean = $baseSql.Replace("``", "$bt")
$footerClean = $footerSql.Replace("``", "$bt")

$fullSql = $baseClean + "`r`n" + $articlesSeed + "`r`n" + $footerClean

[System.IO.File]::WriteAllText("c:\Kuliah\INTERSHIP\INTERSHIP ACF\Github\Intership-ACF\database\acf_database.sql", $fullSql, [System.Text.Encoding]::UTF8)
Write-Host "acf_database.sql successfully updated with all 52 articles!"
