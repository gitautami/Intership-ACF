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

$processedSuccessfully = false;
$finalSize = $file['size'];

// Sisi Server Safety Fallback: Normalisasi resolusi & EXIF menggunakan GD jika tersedia
if (extension_loaded('gd') && in_array($fileExt, ['jpg', 'jpeg', 'png', 'webp'])) {
    try {
        $imageInfo = @getimagesize($file['tmp_name']);
        if ($imageInfo) {
            $origW = $imageInfo[0];
            $origH = $imageInfo[1];
            $srcImg = null;

            switch ($imageInfo[2]) {
                case IMAGETYPE_JPEG:
                    $srcImg = @imagecreatefromjpeg($file['tmp_name']);
                    // Perbaiki rotasi orientasi EXIF untuk foto kamera HP
                    if ($srcImg && function_exists('exif_read_data')) {
                        $exif = @exif_read_data($file['tmp_name']);
                        if (!empty($exif['Orientation'])) {
                            switch ($exif['Orientation']) {
                                case 3: $srcImg = imagerotate($srcImg, 180, 0); break;
                                case 6: $srcImg = imagerotate($srcImg, -90, 0); break;
                                case 8: $srcImg = imagerotate($srcImg, 90, 0); break;
                            }
                            $origW = imagesx($srcImg);
                            $origH = imagesy($srcImg);
                        }
                    }
                    break;
                case IMAGETYPE_PNG:
                    $srcImg = @imagecreatefrompng($file['tmp_name']);
                    break;
                case IMAGETYPE_WEBP:
                    if (function_exists('imagecreatefromwebp')) {
                        $srcImg = @imagecreatefromwebp($file['tmp_name']);
                    }
                    break;
            }

            if ($srcImg) {
                // Batasi dimensi maksimal agar server tidak menyimpan foto raksasa > 1600px
                $maxDim = 1600;
                $newW = $origW;
                $newH = $origH;

                if ($origW > $maxDim || $origH > $maxDim) {
                    $ratio = min($maxDim / $origW, $maxDim / $origH);
                    $newW = (int)round($origW * $ratio);
                    $newH = (int)round($origH * $ratio);
                }

                $dstImg = imagecreatetruecolor($newW, $newH);

                // Pertahankan transparansi untuk PNG & WebP
                if ($imageInfo[2] === IMAGETYPE_PNG || $imageInfo[2] === IMAGETYPE_WEBP) {
                    imagealphablending($dstImg, false);
                    imagesavealpha($dstImg, true);
                    $transparent = imagecolorallocatealpha($dstImg, 255, 255, 255, 127);
                    imagefilledrectangle($dstImg, 0, 0, $newW, $newH, $transparent);
                }

                imagecopyresampled($dstImg, $srcImg, 0, 0, 0, 0, $newW, $newH, $origW, $origH);

                // Simpan hasil kompresi
                if ($fileExt === 'png') {
                    imagepng($dstImg, $targetPath, 8);
                } elseif ($fileExt === 'webp' && function_exists('imagewebp')) {
                    imagewebp($dstImg, $targetPath, 85);
                } else {
                    imagejpeg($dstImg, $targetPath, 84);
                }

                imagedestroy($dstImg);
                imagedestroy($srcImg);

                if (file_exists($targetPath)) {
                    $processedSuccessfully = true;
                    $finalSize = filesize($targetPath);
                }
            }
        }
    } catch (\Throwable $e) {
        $processedSuccessfully = false;
    }
}

// Fallback standar jika GD tidak aktif atau file non-raster (misal SVG)
if (!$processedSuccessfully) {
    if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
        jsonError('Gagal memindahkan file yang diunggah ke folder tujuan.', 500);
    }
}

$relativePath = '../assets/uploads/' . $newFileName;
jsonSuccess([
    'url'      => $relativePath,
    'filename' => $newFileName,
    'size'     => $finalSize,
    'mime'     => $mimeType
], 'Gambar berhasil diproses dan diunggah.', 201);
