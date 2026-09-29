<?php
/**
 * ACF EDUHUB — CATEGORIES REST API ENDPOINT
 */

require_once __DIR__ . '/../config/database.php';

$db = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];

// Helper function slugify
function slugifyText($text) {
    $text = preg_replace('~[^\pL\d]+~u', '-', $text);
    $text = iconv('utf-8', 'us-ascii//TRANSLIT', $text);
    $text = preg_replace('~[^-\w]+~', '', $text);
    $text = trim($text, '-');
    $text = preg_replace('~-+~', '-', $text);
    $text = strtolower($text);
    return empty($text) ? 'kategori-' . time() : $text;
}

// 1. GET ALL CATEGORIES
if ($method === 'GET') {
    $stmt = $db->query("SELECT slug, label FROM categories ORDER BY id ASC");
    $categories = $stmt->fetchAll();
    jsonSuccess($categories, 'Data kategori berhasil dimuat.');
}

// 2. CREATE NEW CATEGORY
if ($method === 'POST') {
    $input = getJsonInput();
    $label = trim($input['label'] ?? '');
    $slug = trim($input['slug'] ?? '');

    if (empty($label)) {
        jsonError('Nama label kategori wajib diisi.', 422);
    }

    if (empty($slug)) {
        $slug = slugifyText($label);
    }

    $stmt = $db->prepare("INSERT INTO categories (slug, label) VALUES (:slug, :label) ON DUPLICATE KEY UPDATE label = :label2");
    $stmt->execute([
        ':slug'   => $slug,
        ':label'  => $label,
        ':label2' => $label
    ]);

    jsonSuccess([
        'slug'  => $slug,
        'label' => $label
    ], 'Kategori berhasil disimpan.', 201);
}

// 3. DELETE CATEGORY
if ($method === 'DELETE') {
    $input = getJsonInput();
    $slug = trim($input['slug'] ?? ($_GET['slug'] ?? ''));

    if (empty($slug)) {
        jsonError('Slug kategori yang ingin dihapus wajib disertakan.', 422);
    }

    $stmt = $db->prepare("DELETE FROM categories WHERE slug = :slug");
    $stmt->execute([':slug' => $slug]);

    jsonSuccess(null, 'Kategori berhasil dihapus.');
}

jsonError('Metode HTTP tidak didukung pada endpoint kategori.', 405);
