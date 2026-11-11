<?php
/**
 * ACF EDUHUB — FLIPBOOK MANAGEMENT & UPLOAD REST API
 * Mengelola upload dokumen PDF, konfigurasi target halaman, posisi, dan status flipbook.
 */

require_once __DIR__ . '/../config/database.php';

$db = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];

// Handle _method override for PUT/PATCH/DELETE from multipart forms
if ($method === 'POST' && isset($_POST['_method'])) {
    $method = strtoupper($_POST['_method']);
}

// Ensure table exists & seed default if empty
ensureFlipbookTableExists($db);

// -----------------------------------------------------------------------------
// 1. GET: Ambil Flipbook
// -----------------------------------------------------------------------------
if ($method === 'GET') {
    $id = $_GET['id'] ?? null;
    $targetPage = $_GET['page'] ?? null;
    $status = $_GET['status'] ?? null;

    // A. Single by ID
    if (!empty($id)) {
        $stmt = $db->prepare("SELECT * FROM flipbooks WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        $data = $stmt->fetch();
        if ($data) {
            jsonSuccess($data);
        } else {
            jsonError('Dokumen Flipbook tidak ditemukan.', 404);
        }
    }

    // B. Public Page Consumer (Mengambil flipbook aktif untuk halaman tertentu)
    if (!empty($targetPage)) {
        $cleanPage = strtolower(trim(basename($targetPage)));
        if ($cleanPage === '' || $cleanPage === '/') {
            $cleanPage = 'index.html';
        }
        if (!str_contains($cleanPage, '.')) {
            $cleanPage .= '.html';
        }

        $stmt = $db->prepare("SELECT * FROM flipbooks WHERE LOWER(target_halaman) = :page AND status = 'Aktif' ORDER BY updated_at DESC, id DESC LIMIT 1");
        $stmt->execute([':page' => $cleanPage]);
        $activeDoc = $stmt->fetch();
        if ($activeDoc) {
            $activeDoc['position'] = $activeDoc['posisi'];
            $activeDoc['target_page'] = $activeDoc['target_halaman'];
            $activeDoc['title'] = $activeDoc['judul'];
            $activeDoc['description'] = $activeDoc['deskripsi'];
        }
        jsonSuccess($activeDoc ?: null, $activeDoc ? 'Flipbook aktif ditemukan' : 'Tidak ada flipbook aktif untuk halaman ini');
    }

    // C. Admin List
    $where = [];
    $params = [];

    if (!empty($status) && $status !== 'all') {
        $where[] = "status = :status";
        $params[':status'] = $status;
    }

    $whereSql = !empty($where) ? "WHERE " . implode(" AND ", $where) : "";
    $stmt = $db->prepare("SELECT * FROM flipbooks {$whereSql} ORDER BY updated_at DESC, id DESC");
    $stmt->execute($params);
    $items = $stmt->fetchAll();

    foreach ($items as &$it) {
        $it['position'] = $it['posisi'];
        $it['target_page'] = $it['target_halaman'];
        $it['title'] = $it['judul'];
        $it['description'] = $it['deskripsi'];
    }

    jsonSuccess([
        'total' => count($items),
        'items' => $items
    ]);
}

// -----------------------------------------------------------------------------
// 2. POST: Upload Dokumen PDF Baru & Buat Flipbook
// -----------------------------------------------------------------------------
if ($method === 'POST') {
    $isMultipart = !empty($_FILES);

    $judul = trim($_POST['judul'] ?? ($_POST['title'] ?? ''));
    $deskripsi = trim($_POST['deskripsi'] ?? ($_POST['description'] ?? ''));
    $targetHalaman = trim($_POST['target_halaman'] ?? ($_POST['target_page'] ?? 'kisah-kami.html'));
    $posisi = trim($_POST['posisi'] ?? ($_POST['position'] ?? 'bawah_deskripsi_sejarah'));
    $buttonLabel = trim($_POST['button_label'] ?? ($_POST['buttonLabel'] ?? 'Profil Lembaga ACF Eduhub'));
    $rawStatus = trim($_POST['status'] ?? 'Aktif');
    $status = (strcasecmp($rawStatus, 'nonaktif') === 0) ? 'Nonaktif' : 'Aktif';

    if (!$isMultipart) {
        $input = getJsonInput();
        $judul = trim($input['judul'] ?? ($input['title'] ?? ''));
        $deskripsi = trim($input['deskripsi'] ?? ($input['description'] ?? ''));
        $targetHalaman = trim($input['target_halaman'] ?? ($input['target_page'] ?? 'kisah-kami.html'));
        $posisi = trim($input['posisi'] ?? ($input['position'] ?? 'bawah_deskripsi_sejarah'));
        $buttonLabel = trim($input['button_label'] ?? ($input['buttonLabel'] ?? 'Profil Lembaga ACF Eduhub'));
        $rawStatus = trim($input['status'] ?? 'Aktif');
        $status = (strcasecmp($rawStatus, 'nonaktif') === 0) ? 'Nonaktif' : 'Aktif';
    }

    if (empty($judul)) {
        jsonError('Judul dokumen wajib diisi.', 400);
    }

    $fileUrl = '';
    $fileName = '';
    $fileSize = 0;
    $totalPages = 0;

    // Handle Upload File PDF
    if ($isMultipart && (isset($_FILES['pdf']) || isset($_FILES['file']))) {
        $file = $_FILES['pdf'] ?? $_FILES['file'];

        if ($file['error'] !== UPLOAD_ERR_OK) {
            jsonError('Gagal mengunggah file PDF. Kode error: ' . $file['error'], 400);
        }

        // Batas maksimal 60MB
        $maxSize = 60 * 1024 * 1024;
        if ($file['size'] > $maxSize) {
            jsonError('Ukuran file PDF terlalu besar. Maksimal 60MB.', 400);
        }

        $origName = $file['name'];
        $ext = strtolower(pathinfo($origName, PATHINFO_EXTENSION));

        if ($ext !== 'pdf') {
            jsonError('Format file tidak didukung. Harap unggah file dokumen PDF (.pdf).', 400);
        }

        // Target direktori upload
        $uploadDir = __DIR__ . '/../../FRONTEND/assets/uploads/flipbook/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $safeBase = preg_replace('/[^a-zA-Z0-9_\-\.]/', '_', pathinfo($origName, PATHINFO_FILENAME));
        $newFileName = 'flip_' . date('Ymd_His') . '_' . substr($safeBase, 0, 30) . '.' . $ext;
        $targetPath = $uploadDir . $newFileName;

        if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
            jsonError('Gagal menyimpan file PDF ke server.', 500);
        }

        $fileUrl = '../assets/uploads/flipbook/' . $newFileName;
        $fileName = $origName;
        $fileSize = $file['size'];

        // Coba hitung jumlah halaman PDF secara otomatis
        $totalPages = countPdfPages($targetPath);
    } else {
        // Jika menggunakan URL file yang sudah ada
        $fileUrl = trim($_POST['file_url'] ?? ($input['file_url'] ?? ''));
        $fileName = trim($_POST['file_name'] ?? ($input['file_name'] ?? basename($fileUrl)));
        $fileSize = intval($_POST['file_size'] ?? ($input['file_size'] ?? 0));
        $totalPages = intval($_POST['total_pages'] ?? ($input['total_pages'] ?? 0));

        if (empty($fileUrl)) {
            jsonError('File PDF dokumen wajib diunggah.', 400);
        }
    }

    $existingId = intval($_POST['id'] ?? ($input['id'] ?? 0));

    // Jika diset sebagai Aktif, kita bisa opsional menonaktifkan flipbook lain pada target_halaman yang sama
    if ($status === 'Aktif') {
        $deactivateStmt = $db->prepare("UPDATE flipbooks SET status = 'Nonaktif' WHERE target_halaman = :target" . ($existingId > 0 ? " AND id != :exId" : ""));
        $params = [':target' => $targetHalaman];
        if ($existingId > 0) $params[':exId'] = $existingId;
        $deactivateStmt->execute($params);
    }

    if ($existingId > 0) {
        $stmt = $db->prepare("UPDATE flipbooks 
                              SET judul = :judul, 
                                  deskripsi = :deskripsi, 
                                  file_url = :file_url, 
                                  file_name = :file_name, 
                                  file_size = :file_size, 
                                  total_pages = :total_pages, 
                                  target_halaman = :target_halaman, 
                                  posisi = :posisi, 
                                  button_label = :button_label, 
                                  status = :status,
                                  updated_at = CURRENT_TIMESTAMP
                              WHERE id = :id");
        $stmt->execute([
            ':judul'          => $judul,
            ':deskripsi'      => $deskripsi ?: null,
            ':file_url'       => $fileUrl,
            ':file_name'      => $fileName ?: basename($fileUrl),
            ':file_size'      => $fileSize,
            ':total_pages'    => $totalPages,
            ':target_halaman' => $targetHalaman,
            ':posisi'         => $posisi,
            ':button_label'   => $buttonLabel ?: 'Profil Lembaga ACF Eduhub',
            ':status'         => $status === 'Aktif' ? 'Aktif' : 'Nonaktif',
            ':id'             => $existingId
        ]);

        jsonSuccess([
            'id'             => $existingId,
            'judul'          => $judul,
            'title'          => $judul,
            'file_url'       => $fileUrl,
            'target_halaman' => $targetHalaman,
            'target_page'    => $targetHalaman,
            'posisi'         => $posisi,
            'position'       => $posisi,
            'status'         => $status
        ], 'Dokumen Flipbook berhasil diperbarui.');
    } else {
        $stmt = $db->prepare("INSERT INTO flipbooks (judul, deskripsi, file_url, file_name, file_size, total_pages, target_halaman, posisi, button_label, status)
                              VALUES (:judul, :deskripsi, :file_url, :file_name, :file_size, :total_pages, :target_halaman, :posisi, :button_label, :status)");

        $stmt->execute([
            ':judul'          => $judul,
            ':deskripsi'      => $deskripsi ?: null,
            ':file_url'       => $fileUrl,
            ':file_name'      => $fileName ?: basename($fileUrl),
            ':file_size'      => $fileSize,
            ':total_pages'    => $totalPages,
            ':target_halaman' => $targetHalaman,
            ':posisi'         => $posisi,
            ':button_label'   => $buttonLabel ?: 'Profil Lembaga ACF Eduhub',
            ':status'         => $status === 'Aktif' ? 'Aktif' : 'Nonaktif'
        ]);

        $newId = (int) $db->lastInsertId();

        jsonSuccess([
            'id'             => $newId,
            'judul'          => $judul,
            'title'          => $judul,
            'file_url'       => $fileUrl,
            'target_halaman' => $targetHalaman,
            'target_page'    => $targetHalaman,
            'posisi'         => $posisi,
            'position'       => $posisi,
            'status'         => $status
        ], 'Dokumen Flipbook berhasil diunggah dan dikonfigurasi.', 201);
    }
}

// -----------------------------------------------------------------------------
// 3. PUT / PATCH: Update Metadata & Status Flipbook
// -----------------------------------------------------------------------------
if ($method === 'PUT' || $method === 'PATCH') {
    $input = getJsonInput();

    // Jika parameter bersarang di dalam key 'id'
    if (isset($input['id']) && is_array($input['id'])) {
        $nested = $input['id'];
        unset($input['id']);
        $input = array_merge($nested, $input);
    }

    $rawId = $_GET['id'] ?? ($input['id'] ?? ($_POST['id'] ?? 0));
    $id = is_numeric($rawId) ? intval($rawId) : intval($input['id'] ?? 0);

    if ($id <= 0) {
        jsonError('ID flipbook tidak valid.', 400);
    }

    $stmtCheck = $db->prepare("SELECT * FROM flipbooks WHERE id = :id LIMIT 1");
    $stmtCheck->execute([':id' => $id]);
    $current = $stmtCheck->fetch();

    if (!$current) {
        jsonError('Dokumen Flipbook tidak ditemukan.', 404);
    }

    $judul         = isset($input['judul']) ? trim($input['judul']) : (isset($input['title']) ? trim($input['title']) : $current['judul']);
    $deskripsi     = isset($input['deskripsi']) ? trim($input['deskripsi']) : (isset($input['description']) ? trim($input['description']) : $current['deskripsi']);
    $targetHalaman = isset($input['target_halaman']) ? trim($input['target_halaman']) : (isset($input['target_page']) ? trim($input['target_page']) : $current['target_halaman']);
    $posisi        = isset($input['posisi']) ? trim($input['posisi']) : (isset($input['position']) ? trim($input['position']) : $current['posisi']);
    $buttonLabel   = isset($input['button_label']) ? trim($input['button_label']) : (isset($input['buttonLabel']) ? trim($input['buttonLabel']) : $current['button_label']);
    
    if (isset($input['status'])) {
        $status = (strcasecmp(trim($input['status']), 'nonaktif') === 0) ? 'Nonaktif' : 'Aktif';
    } else {
        $status = $current['status'];
    }

    // Jika mengaktifkan ini, nonaktifkan flipbook lain pada target_halaman yang sama
    if ($status === 'Aktif') {
        $deactivateStmt = $db->prepare("UPDATE flipbooks SET status = 'Nonaktif' WHERE target_halaman = :target AND id != :id");
        $deactivateStmt->execute([':target' => $targetHalaman, ':id' => $id]);
    }

    $updateSql = "UPDATE flipbooks 
                  SET judul = :judul, 
                      deskripsi = :deskripsi, 
                      target_halaman = :target_halaman, 
                      posisi = :posisi, 
                      button_label = :button_label, 
                      status = :status,
                      updated_at = CURRENT_TIMESTAMP
                  WHERE id = :id";

    $stmtUpdate = $db->prepare($updateSql);
    $stmtUpdate->execute([
        ':judul'          => $judul,
        ':deskripsi'      => $deskripsi,
        ':target_halaman' => $targetHalaman,
        ':posisi'         => $posisi,
        ':button_label'   => $buttonLabel,
        ':status'         => $status,
        ':id'             => $id
    ]);

    jsonSuccess([
        'id'             => $id,
        'judul'          => $judul,
        'title'          => $judul,
        'target_halaman' => $targetHalaman,
        'target_page'    => $targetHalaman,
        'posisi'         => $posisi,
        'position'       => $posisi,
        'button_label'   => $buttonLabel,
        'status'         => $status
    ], 'Data flipbook berhasil diperbarui.');
}

// -----------------------------------------------------------------------------
// 4. DELETE: Hapus Dokumen Flipbook
// -----------------------------------------------------------------------------
if ($method === 'DELETE') {
    $input = getJsonInput();
    $id = intval($input['id'] ?? ($_GET['id'] ?? ($_POST['id'] ?? 0)));

    if ($id <= 0) {
        jsonError('ID flipbook tidak valid.', 400);
    }

    $stmt = $db->prepare("SELECT * FROM flipbooks WHERE id = :id LIMIT 1");
    $stmt->execute([':id' => $id]);
    $item = $stmt->fetch();

    if (!$item) {
        jsonError('Flipbook tidak ditemukan.', 404);
    }

    // Hapus record dari database
    $delStmt = $db->prepare("DELETE FROM flipbooks WHERE id = :id");
    $delStmt->execute([':id' => $id]);

    // Hapus file fisik jika tersimpan di folder uploads/flipbook/
    $fileUrl = $item['file_url'];
    if (strpos($fileUrl, 'uploads/flipbook/') !== false) {
        $fullPath = __DIR__ . '/../../FRONTEND/' . ltrim(str_replace('../', '', $fileUrl), '/');
        if (file_exists($fullPath)) {
            @unlink($fullPath);
        }
    }

    jsonSuccess(null, 'Dokumen Flipbook berhasil dihapus.');
}

// Method not allowed
jsonError('Metode HTTP tidak diizinkan.', 405);

// =============================================================================
// Helper Functions
// =============================================================================

function ensureFlipbookTableExists($db) {
    try {
        $db->exec("CREATE TABLE IF NOT EXISTS `flipbooks` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `judul` VARCHAR(255) NOT NULL,
            `deskripsi` TEXT NULL,
            `file_url` VARCHAR(500) NOT NULL,
            `file_name` VARCHAR(255) NOT NULL,
            `file_size` BIGINT NULL DEFAULT 0,
            `total_pages` INT DEFAULT 0,
            `target_halaman` VARCHAR(100) NOT NULL DEFAULT 'kisah-kami.html',
            `posisi` VARCHAR(100) NOT NULL DEFAULT 'bawah_deskripsi_sejarah',
            `button_label` VARCHAR(100) NOT NULL DEFAULT 'Profil Lembaga ACF Eduhub',
            `status` ENUM('Aktif', 'Nonaktif') DEFAULT 'Aktif',
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX `idx_flipbooks_target` (`target_halaman`, `status`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

        // Cek jika kosong, lakukan seeding profil default
        $count = $db->query("SELECT COUNT(*) FROM flipbooks")->fetchColumn();
        if ($count == 0) {
            $db->exec("INSERT INTO `flipbooks` (`id`, `judul`, `deskripsi`, `file_url`, `file_name`, `file_size`, `total_pages`, `target_halaman`, `posisi`, `button_label`, `status`)
                       VALUES (1, 'Profil Lembaga ACF Eduhub', 'Dokumen Resmi Profil & Portofolio Dampak Yayasan', '../assets/tentang/Profil Lembaga - ACF Eduhub.pdf', 'Profil Lembaga - ACF Eduhub.pdf', 35036553, 31, 'kisah-kami.html', 'bawah_deskripsi_sejarah', 'Profil Lembaga ACF Eduhub', 'Aktif');");
        }
    } catch (Exception $e) {
        // Table might already exist or DB error
    }
}

function countPdfPages($filePath) {
    if (!file_exists($filePath)) return 0;
    $fp = @fopen($filePath, 'rb');
    if (!$fp) return 0;

    $maxLines = 10000;
    $count = 0;
    while (!feof($fp) && $maxLines-- > 0) {
        $line = fgets($fp, 2048);
        if (preg_match('/\/Type\s*\/Page\b/', $line)) {
            $count++;
        }
    }
    fclose($fp);
    return $count > 0 ? $count : 0;
}
