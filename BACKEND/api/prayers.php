<?php
/**
 * ACF EDUHUB — DONATION PRAYERS & BLESSINGS REST API ENDPOINT
 */

require_once __DIR__ . '/../config/database.php';

$db = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];

// Helper time elapsed string
function timeElapsedString($datetime, $full = false) {
    $now = new DateTime;
    $ago = new DateTime($datetime);
    $diff = $now->diff($ago);

    if ($diff->d == 0 && $diff->h == 0 && $diff->i < 1) {
        return 'Baru saja';
    }

    $string = array(
        'y' => 'tahun',
        'm' => 'bulan',
        'd' => 'hari',
        'h' => 'jam',
        'i' => 'menit',
        's' => 'detik',
    );
    foreach ($string as $k => &$v) {
        if ($diff->$k) {
            $v = $diff->$k . ' ' . $v;
        } else {
            unset($string[$k]);
        }
    }

    if (!$full) $string = array_slice($string, 0, 1);
    return $string ? implode(', ', $string) . ' yang lalu' : 'Baru saja';
}

// 1. GET ALL PRAYERS
if ($method === 'GET') {
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;

    $stmt = $db->prepare("SELECT id, donator_name as name, is_anonymous as isAnonymous, prayer_text as prayerText, program_target as programTarget, created_at as createdAt FROM donations_prayers ORDER BY created_at DESC, id DESC LIMIT :limit");
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->execute();
    $prayers = $stmt->fetchAll();

    $formatted = array_map(function($p) {
        $name = ($p['isAnonymous'] == 1 || empty($p['name'])) ? 'Hamba Allah' : $p['name'];
        return [
            'id'            => $p['id'],
            'name'          => $name,
            'isAnonymous'   => (bool)$p['isAnonymous'],
            'prayerText'    => $p['prayerText'],
            'programTarget' => $p['programTarget'],
            'timeDisplay'   => timeElapsedString($p['createdAt']),
            'createdAt'     => $p['createdAt']
        ];
    }, $prayers);

    jsonSuccess($formatted, 'Daftar doa donatur berhasil dimuat.');
}

// 2. SUBMIT NEW PRAYER
if ($method === 'POST') {
    $input = getJsonInput();

    $prayerText = trim($input['prayerText'] ?? ($input['prayer_text'] ?? ($input['doa'] ?? '')));
    if (empty($prayerText)) {
        jsonError('Teks doa atau harapan wajib diisi.', 422);
    }

    $isAnonymous = !empty($input['isAnonymous']) || !empty($input['anonim']) || !empty($input['is_anonymous']) ? 1 : 0;
    $donatorName = trim($input['name'] ?? ($input['donator_name'] ?? ($input['nama'] ?? '')));

    if ($isAnonymous || empty($donatorName)) {
        $donatorName = 'Hamba Allah';
    }

    $programTarget = trim($input['programTarget'] ?? ($input['program_target'] ?? 'Umum'));

    $stmt = $db->prepare("INSERT INTO donations_prayers (donator_name, is_anonymous, prayer_text, program_target) VALUES (:name, :anon, :prayer, :program)");
    $stmt->execute([
        ':name'    => $donatorName,
        ':anon'    => $isAnonymous,
        ':prayer'  => $prayerText,
        ':program' => $programTarget
    ]);

    $insertId = $db->lastInsertId();

    jsonSuccess([
        'id'            => $insertId,
        'name'          => $donatorName,
        'isAnonymous'   => (bool)$isAnonymous,
        'prayerText'    => $prayerText,
        'programTarget' => $programTarget,
        'timeDisplay'   => 'Baru saja'
    ], 'Doa kebaikan Anda telah terkirim. Terima kasih!', 201);
}

jsonError('Metode HTTP tidak didukung pada endpoint doa donasi.', 405);
