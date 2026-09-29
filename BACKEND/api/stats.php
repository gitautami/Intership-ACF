<?php
/**
 * ACF EDUHUB — DASHBOARD METRICS & SUMMARY STATS API
 */

require_once __DIR__ . '/../config/database.php';

$db = getDbConnection();

try {
    // Mitra statistics
    $totalMitra = (int)$db->query("SELECT COUNT(*) FROM mitra")->fetchColumn();
    $pendingMitra = (int)$db->query("SELECT COUNT(*) FROM mitra WHERE status = 'Menunggu'")->fetchColumn();

    // Relawan statistics
    $totalRelawan = (int)$db->query("SELECT COUNT(*) FROM relawan")->fetchColumn();
    $pendingRelawan = (int)$db->query("SELECT COUNT(*) FROM relawan WHERE status = 'Menunggu'")->fetchColumn();

    // Articles statistics
    $totalArticles = (int)$db->query("SELECT COUNT(*) FROM articles")->fetchColumn();
    $publishedArticles = (int)$db->query("SELECT COUNT(*) FROM articles WHERE status = 'Terbit'")->fetchColumn();
    $draftArticles = (int)$db->query("SELECT COUNT(*) FROM articles WHERE status = 'Draf'")->fetchColumn();
    $totalViews = (int)$db->query("SELECT COALESCE(SUM(views), 0) FROM articles")->fetchColumn();

    // Categories count
    $totalCategories = (int)$db->query("SELECT COUNT(*) FROM categories")->fetchColumn();

    // Donations prayers count
    $totalPrayers = (int)$db->query("SELECT COUNT(*) FROM donations_prayers")->fetchColumn();

    jsonSuccess([
        'mitra' => [
            'total'   => $totalMitra,
            'pending' => $pendingMitra
        ],
        'relawan' => [
            'total'   => $totalRelawan,
            'pending' => $pendingRelawan
        ],
        'forms' => [
            'total'   => $totalMitra + $totalRelawan,
            'pending' => $pendingMitra + $pendingRelawan
        ],
        'articles' => [
            'total'     => $totalArticles,
            'published' => $publishedArticles,
            'draft'     => $draftArticles,
            'views'     => $totalViews
        ],
        'categories' => $totalCategories,
        'prayers'    => $totalPrayers
    ], 'Statistik dashboard berhasil dimuat.');

} catch (Exception $e) {
    jsonError('Gagal memuat statistik dashboard: ' . $e->getMessage(), 500);
}
