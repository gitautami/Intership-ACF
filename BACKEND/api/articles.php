<?php
/**
 * ACF EDUHUB — ARTICLES (KABAR) REST API ENDPOINT
 */

require_once __DIR__ . '/../config/database.php';

$db = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];

// Helper function slugify
function slugifyArticle($text) {
    $text = preg_replace('~[^\pL\d]+~u', '-', $text);
    $text = iconv('utf-8', 'us-ascii//TRANSLIT', $text);
    $text = preg_replace('~[^-\w]+~', '', $text);
    $text = trim($text, '-');
    $text = preg_replace('~-+~', '-', $text);
    $text = strtolower($text);
    return empty($text) ? 'artikel-' . time() : $text;
}

// 1. GET ARTICLES (LIST / SINGLE / FILTER / SEARCH)
if ($method === 'GET') {
    $id = $_GET['id'] ?? null;
    $slug = $_GET['slug'] ?? null;

    // Single article request
    if (!empty($id) || !empty($slug)) {
        if (!empty($id)) {
            $stmt = $db->prepare("SELECT id, title, slug, category_slug as category, category_label as categoryLabel, author, date_display as date, cover_image as cover, excerpt, content, status, views, created_at FROM articles WHERE id = :id LIMIT 1");
            $stmt->execute([':id' => $id]);
        } else {
            $stmt = $db->prepare("SELECT id, title, slug, category_slug as category, category_label as categoryLabel, author, date_display as date, cover_image as cover, excerpt, content, status, views, created_at FROM articles WHERE slug = :slug LIMIT 1");
            $stmt->execute([':slug' => $slug]);
        }

        $art = $stmt->fetch();
        if ($art) {
            // Increment views counter
            $upd = $db->prepare("UPDATE articles SET views = views + 1 WHERE id = :id");
            $upd->execute([':id' => $art['id']]);
            $art['views'] = (int)$art['views'] + 1;

            jsonSuccess($art, 'Detail artikel berhasil dimuat.');
        } else {
            jsonError('Artikel tidak ditemukan.', 404);
        }
    }

    // List articles request
    $status = $_GET['status'] ?? null; // 'Terbit', 'Draf', or null/all
    $category = $_GET['category'] ?? null;
    $search = $_GET['search'] ?? null;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : null;
    $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;

    $where = [];
    $params = [];

    if (!empty($status) && $status !== 'all') {
        $where[] = "status = :status";
        $params[':status'] = $status;
    }

    if (!empty($category) && $category !== 'all') {
        $where[] = "category_slug = :cat";
        $params[':cat'] = $category;
    }

    if (!empty($search)) {
        $where[] = "(title LIKE :s1 OR excerpt LIKE :s2 OR content LIKE :s3)";
        $params[':s1'] = "%{$search}%";
        $params[':s2'] = "%{$search}%";
        $params[':s3'] = "%{$search}%";
    }

    $whereSql = !empty($where) ? "WHERE " . implode(" AND ", $where) : "";
    $sql = "SELECT id, title, slug, category_slug as category, category_label as categoryLabel, author, date_display as date, cover_image as cover, excerpt, content, status, views, created_at FROM articles {$whereSql} ORDER BY created_at DESC, id DESC";

    if ($limit !== null && $limit > 0) {
        $sql .= " LIMIT {$limit} OFFSET {$offset}";
    }

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $articles = $stmt->fetchAll();

    jsonSuccess($articles, 'Daftar artikel berhasil dimuat.');
}

// 2. CREATE NEW ARTICLE
if ($method === 'POST') {
    $input = getJsonInput();

    $title = trim($input['title'] ?? '');
    if (empty($title)) {
        jsonError('Judul artikel wajib diisi.', 422);
    }

    $categorySlug = trim($input['category'] ?? ($input['category_slug'] ?? 'artikel'));
    $categoryLabel = trim($input['categoryLabel'] ?? ($input['category_label'] ?? 'Artikel Pendidikan'));
    $author = trim($input['author'] ?? 'Tim Redaksi ACF');
    $status = in_array($input['status'] ?? 'Terbit', ['Terbit', 'Draf']) ? $input['status'] : 'Terbit';
    $cover = trim($input['cover'] ?? ($input['cover_image'] ?? 'assets/logo-acf/LOGO_ACF-removebg-preview.png'));
    $excerpt = trim($input['excerpt'] ?? '');
    $content = $input['content'] ?? '';

    // Auto excerpt if empty
    if (empty($excerpt) && !empty($content)) {
        $plain = strip_tags($content);
        $excerpt = mb_substr($plain, 0, 180) . (mb_strlen($plain) > 180 ? '...' : '');
    }

    // Auto ID generation if not supplied
    $id = trim($input['id'] ?? '');
    if (empty($id)) {
        $prefix = 'ART-';
        if (strpos($categorySlug, 'daya-setara') !== false) {
            $prefix = 'ART-SDS';
        } elseif (strpos($categorySlug, 'juara') !== false) {
            $prefix = 'ART-SJ';
        }
        $id = $prefix . date('ymd') . '-' . substr(str_shuffle('0123456789ABCDEF'), 0, 4);
    }

    // Auto Date Display
    $dateDisplay = trim($input['date'] ?? ($input['date_display'] ?? date('M j, Y')));
    $slug = slugifyArticle($title);

    // Pastikan kategori terdaftar di tabel categories
    $catCheck = $db->prepare("INSERT INTO categories (slug, label) VALUES (:slug, :label) ON DUPLICATE KEY UPDATE label = :label2");
    $catCheck->execute([':slug' => $categorySlug, ':label' => $categoryLabel, ':label2' => $categoryLabel]);

    // Insert artikel
    $stmt = $db->prepare("INSERT INTO articles (id, title, slug, category_slug, category_label, author, date_display, cover_image, excerpt, content, status) 
                          VALUES (:id, :title, :slug, :cat_slug, :cat_label, :author, :date_d, :cover, :excerpt, :content, :status)
                          ON DUPLICATE KEY UPDATE 
                          title = VALUES(title), slug = VALUES(slug), category_slug = VALUES(category_slug),
                          category_label = VALUES(category_label), author = VALUES(author), date_display = VALUES(date_display),
                          cover_image = VALUES(cover_image), excerpt = VALUES(excerpt), content = VALUES(content), status = VALUES(status)");

    $stmt->execute([
        ':id'        => $id,
        ':title'     => $title,
        ':slug'      => $slug,
        ':cat_slug'  => $categorySlug,
        ':cat_label' => $categoryLabel,
        ':author'    => $author,
        ':date_d'    => $dateDisplay,
        ':cover'     => $cover,
        ':excerpt'   => $excerpt,
        ':content'   => $content,
        ':status'    => $status
    ]);

    jsonSuccess([
        'id'            => $id,
        'title'         => $title,
        'slug'          => $slug,
        'category'      => $categorySlug,
        'categoryLabel' => $categoryLabel,
        'author'        => $author,
        'date'          => $dateDisplay,
        'cover'         => $cover,
        'excerpt'       => $excerpt,
        'content'       => $content,
        'status'        => $status
    ], 'Artikel berhasil disimpan.', 201);
}

// 3. UPDATE ARTICLE (PUT / PATCH)
if ($method === 'PUT' || $method === 'PATCH') {
    $input = getJsonInput();
    $id = trim($input['id'] ?? ($_GET['id'] ?? ''));

    if (empty($id)) {
        jsonError('ID artikel yang akan diupdate wajib disertakan.', 422);
    }

    // Ambil artikel lama
    $stmt = $db->prepare("SELECT * FROM articles WHERE id = :id LIMIT 1");
    $stmt->execute([':id' => $id]);
    $existing = $stmt->fetch();

    if (!$existing) {
        jsonError('Artikel tidak ditemukan.', 404);
    }

    $title = isset($input['title']) ? trim($input['title']) : $existing['title'];
    $slug = !empty($title) ? slugifyArticle($title) : $existing['slug'];
    $categorySlug = isset($input['category']) ? trim($input['category']) : (isset($input['category_slug']) ? trim($input['category_slug']) : $existing['category_slug']);
    $categoryLabel = isset($input['categoryLabel']) ? trim($input['categoryLabel']) : (isset($input['category_label']) ? trim($input['category_label']) : $existing['category_label']);
    $author = isset($input['author']) ? trim($input['author']) : $existing['author'];
    $dateDisplay = isset($input['date']) ? trim($input['date']) : (isset($input['date_display']) ? trim($input['date_display']) : $existing['date_display']);
    $cover = isset($input['cover']) ? trim($input['cover']) : (isset($input['cover_image']) ? trim($input['cover_image']) : $existing['cover_image']);
    $excerpt = isset($input['excerpt']) ? trim($input['excerpt']) : $existing['excerpt'];
    $content = isset($input['content']) ? $input['content'] : $existing['content'];
    $status = isset($input['status']) && in_array($input['status'], ['Terbit', 'Draf']) ? $input['status'] : $existing['status'];

    $upd = $db->prepare("UPDATE articles SET 
        title = :title,
        slug = :slug,
        category_slug = :cat_slug,
        category_label = :cat_label,
        author = :author,
        date_display = :date_d,
        cover_image = :cover,
        excerpt = :excerpt,
        content = :content,
        status = :status
        WHERE id = :id");

    $upd->execute([
        ':title'     => $title,
        ':slug'      => $slug,
        ':cat_slug'  => $categorySlug,
        ':cat_label' => $categoryLabel,
        ':author'    => $author,
        ':date_d'    => $dateDisplay,
        ':cover'     => $cover,
        ':excerpt'   => $excerpt,
        ':content'   => $content,
        ':status'    => $status,
        ':id'        => $id
    ]);

    jsonSuccess([
        'id'            => $id,
        'title'         => $title,
        'slug'          => $slug,
        'category'      => $categorySlug,
        'categoryLabel' => $categoryLabel,
        'author'        => $author,
        'date'          => $dateDisplay,
        'cover'         => $cover,
        'excerpt'       => $excerpt,
        'content'       => $content,
        'status'        => $status
    ], 'Artikel berhasil diperbarui.');
}

// 4. DELETE ARTICLE
if ($method === 'DELETE') {
    $input = getJsonInput();
    $id = trim($input['id'] ?? ($_GET['id'] ?? ''));

    if (empty($id)) {
        jsonError('ID artikel yang akan dihapus wajib disertakan.', 422);
    }

    $stmt = $db->prepare("DELETE FROM articles WHERE id = :id");
    $stmt->execute([':id' => $id]);

    jsonSuccess(['id' => $id], 'Artikel berhasil dihapus.');
}

jsonError('Metode HTTP tidak didukung pada endpoint artikel.', 405);
