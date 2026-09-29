<?php
/**
 * ACF EDUHUB — RELAWAN (SAHABAT EDUHUB) REST API ENDPOINT
 */

require_once __DIR__ . '/../config/database.php';

$db = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];

// 1. GET ALL RELAWAN REGISTRATIONS (ADMIN DASHBOARD)
if ($method === 'GET') {
    $id = $_GET['id'] ?? null;

    if (!empty($id)) {
        $stmt = $db->prepare("SELECT id, nama_lengkap as namaLengkap, email, no_wa as noWA, domisili, profesi, peran_relawan as peranRelawan, komitmen_waktu as komitmenWaktu, keahlian_utama as keahlianUtama, motivasi, status, catatan_admin as catatanAdmin, DATE_FORMAT(created_at, '%d/%m/%Y %H:%i:%s') as timestamp FROM relawan WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        $data = $stmt->fetch();
        if ($data) {
            jsonSuccess($data);
        } else {
            jsonError('Data relawan tidak ditemukan.', 404);
        }
    }

    $status = $_GET['status'] ?? null;
    $search = $_GET['search'] ?? null;

    $where = [];
    $params = [];

    if (!empty($status) && $status !== 'all') {
        $where[] = "status = :status";
        $params[':status'] = $status;
    }

    if (!empty($search)) {
        $where[] = "(nama_lengkap LIKE :s1 OR email LIKE :s2 OR no_wa LIKE :s3 OR domisili LIKE :s4 OR profesi LIKE :s5)";
        $params[':s1'] = "%{$search}%";
        $params[':s2'] = "%{$search}%";
        $params[':s3'] = "%{$search}%";
        $params[':s4'] = "%{$search}%";
        $params[':s5'] = "%{$search}%";
    }

    $whereSql = !empty($where) ? "WHERE " . implode(" AND ", $where) : "";
    $sql = "SELECT id, nama_lengkap as namaLengkap, email, no_wa as noWA, domisili, profesi, peran_relawan as peranRelawan, komitmen_waktu as komitmenWaktu, keahlian_utama as keahlianUtama, motivasi, status, catatan_admin as catatanAdmin, DATE_FORMAT(created_at, '%d/%m/%Y %H:%i:%s') as timestamp, created_at FROM relawan {$whereSql} ORDER BY created_at DESC, id DESC";

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $list = $stmt->fetchAll();

    jsonSuccess($list, 'Data relawan berhasil dimuat.');
}

// 2. SUBMIT NEW RELAWAN REGISTRATION (FROM PUBLIC FORM)
if ($method === 'POST') {
    $input = getJsonInput();

    $namaLengkap = trim($input['namaLengkap'] ?? ($input['namaRelawan'] ?? ($input['nama_lengkap'] ?? '')));
    $email = trim($input['email'] ?? ($input['emailRelawan'] ?? ''));
    $noWA = trim($input['noWA'] ?? ($input['noWARelawan'] ?? ($input['no_wa'] ?? '')));

    if (empty($namaLengkap) || empty($email) || empty($noWA)) {
        jsonError('Nama Lengkap, Email, dan Nomor WhatsApp wajib diisi.', 422);
    }

    $domisili = trim($input['domisili'] ?? ($input['domisiliRelawan'] ?? '-'));
    $profesi = trim($input['profesi'] ?? ($input['profesiRelawan'] ?? '-'));
    $peranRelawan = is_array($input['peranRelawan'] ?? null) ? implode(', ', $input['peranRelawan']) : trim($input['peranRelawan'] ?? ($input['peran_relawan'] ?? '-'));
    $komitmenWaktu = trim($input['komitmenWaktu'] ?? ($input['komitmen_waktu'] ?? '-'));
    $keahlianUtama = trim($input['keahlianUtama'] ?? ($input['keahlian_utama'] ?? '-'));
    $motivasi = trim($input['motivasi'] ?? ($input['motivasiRelawan'] ?? '-'));
    $status = 'Menunggu';

    $id = trim($input['id'] ?? ('REL-' . date('ymd') . '-' . substr(str_shuffle('0123456789'), 0, 4)));

    $stmt = $db->prepare("INSERT INTO relawan (id, nama_lengkap, email, no_wa, domisili, profesi, peran_relawan, komitmen_waktu, keahlian_utama, motivasi, status)
                          VALUES (:id, :nama_lengkap, :email, :no_wa, :domisili, :profesi, :peran_relawan, :komitmen_waktu, :keahlian_utama, :motivasi, :status)");

    $stmt->execute([
        ':id'             => $id,
        ':nama_lengkap'   => $namaLengkap,
        ':email'          => $email,
        ':no_wa'          => $noWA,
        ':domisili'       => $domisili,
        ':profesi'        => $profesi,
        ':peran_relawan'  => $peranRelawan,
        ':komitmen_waktu' => $komitmenWaktu,
        ':keahlian_utama' => $keahlianUtama,
        ':motivasi'       => $motivasi,
        ':status'         => $status
    ]);

    jsonSuccess([
        'id'          => $id,
        'namaLengkap' => $namaLengkap,
        'email'       => $email,
        'status'      => $status,
        'timestamp'   => date('d/m/Y H:i:s')
    ], 'Pendaftaran relawan berhasil dikirim.', 201);
}

// 3. UPDATE STATUS / NOTES (ADMIN)
if ($method === 'PUT' || $method === 'PATCH') {
    $input = getJsonInput();
    $id = trim($input['id'] ?? ($_GET['id'] ?? ''));

    if (empty($id)) {
        jsonError('ID relawan yang akan diupdate wajib disertakan.', 422);
    }

    $updates = [];
    $params = [':id' => $id];

    if (isset($input['status'])) {
        $allowed = ['Menunggu', 'Dihubungi', 'Diproses', 'Diterima', 'Ditolak'];
        if (in_array($input['status'], $allowed)) {
            $updates[] = "status = :status";
            $params[':status'] = $input['status'];
        }
    }

    if (isset($input['catatanAdmin']) || isset($input['catatan_admin'])) {
        $updates[] = "catatan_admin = :catatan";
        $params[':catatan'] = trim($input['catatanAdmin'] ?? $input['catatan_admin']);
    }

    if (empty($updates)) {
        jsonError('Tidak ada field yang diupdate.', 400);
    }

    $sql = "UPDATE relawan SET " . implode(", ", $updates) . " WHERE id = :id";
    $stmt = $db->prepare($sql);
    $stmt->execute($params);

    jsonSuccess(['id' => $id], 'Status relawan berhasil diperbarui.');
}

// 4. DELETE RELAWAN ENTRY
if ($method === 'DELETE') {
    $input = getJsonInput();
    $id = trim($input['id'] ?? ($_GET['id'] ?? ''));

    if (empty($id)) {
        jsonError('ID relawan yang akan dihapus wajib disertakan.', 422);
    }

    $stmt = $db->prepare("DELETE FROM relawan WHERE id = :id");
    $stmt->execute([':id' => $id]);

    jsonSuccess(['id' => $id], 'Data relawan berhasil dihapus.');
}

jsonError('Metode HTTP tidak didukung pada endpoint relawan.', 405);
