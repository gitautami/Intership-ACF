<?php
/**
 * ACF EDUHUB — MEDIA UPLOAD API ENDPOINT
 * Handles image uploads for article covers and embedded content
 */

require_once __DIR__ . '/../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
    jsonError('Metode tidak diizinkan. Gunakan POST multipart/form-data.', 405);
}

if (!isset($_FILES['image']) && !isset($_FILES['file']) && !isset($_FILES['cover'])) {
    jsonError('Tidak ada file yang diunggah. Pastikan field name adalah `image`, `file`, atau `cover`.', 400);
}

$file = $_FILES['image'] ?? ($_FILES['file'] ?? $_FILES['cover']);

if ($file['error'] !== UPLOAD_ERR_OK) {
    jsonError('Terjadi kesalahan saat mengunggah file. Kode error: ' . $file['error'], 400);
}

// Validasi ukuran file (Max 5MB)
$maxSize = 5 * 1024 * 1024;
if ($file['size'] > $maxSize) {
    jsonError('Ukuran file terlalu besar. Maksimal 5MB.', 400);
}

// Validasi ekstensi dan MIME type
$allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'];
$allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

$fileExt = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!in_array($fileExt, $allowedExtensions) || !in_array($mimeType, $allowedMimes)) {
    jsonError('Format file tidak didukung. Hanya gambar (JPG, PNG, WEBP, GIF, SVG) yang diperbolehkan.', 400);
}

// Direktori tujuan upload
$uploadDir = __DIR__ . '/../../FRONTEND/assets/uploads/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Generate nama file unik
$newFileName = 'img_' . date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.' . $fileExt;
$targetPath = $uploadDir . $newFileName;

if (move_uploaded_file($file['tmp_name'], $targetPath)) {
    $relativePath = 'assets/uploads/' . $newFileName;
    jsonSuccess([
        'url'      => $relativePath,
        'filename' => $newFileName,
        'size'     => $file['size'],
        'mime'     => $mimeType
    ], 'Gambar berhasil diunggah.', 201);
} else {
    jsonError('Gagal memindahkan file yang diunggah ke folder tujuan.', 500);
}
