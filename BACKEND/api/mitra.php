<?php
/**
 * ACF EDUHUB — MITRA PROGRAM PARTNERSHIPS REST API ENDPOINT
 */

require_once __DIR__ . '/../config/database.php';

$db = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];

// 1. GET ALL MITRA APPLICATIONS (ADMIN DASHBOARD)
if ($method === 'GET') {
    $id = $_GET['id'] ?? null;

    if (!empty($id)) {
        $stmt = $db->prepare("SELECT id, nama_instansi as namaInstansi, jenis_instansi as jenisInstansi, kota_instansi as kotaInstansi, nama_pic as namaPIC, jabatan_pic as jabatanPIC, email, no_wa as noWA, fokus_program as fokusProgram, jenis_kemitraan as jenisKemitraan, estimasi_waktu as estimasiWaktu, pesan, status, catatan_admin as catatanAdmin, DATE_FORMAT(created_at, '%d/%m/%Y %H:%i:%s') as timestamp FROM mitra WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        $data = $stmt->fetch();
        if ($data) {
            jsonSuccess($data);
        } else {
            jsonError('Data mitra tidak ditemukan.', 404);
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
        $where[] = "(nama_instansi LIKE :s1 OR nama_pic LIKE :s2 OR kota_instansi LIKE :s3 OR email LIKE :s4 OR no_wa LIKE :s5)";
        $params[':s1'] = "%{$search}%";
        $params[':s2'] = "%{$search}%";
        $params[':s3'] = "%{$search}%";
        $params[':s4'] = "%{$search}%";
        $params[':s5'] = "%{$search}%";
    }

    $whereSql = !empty($where) ? "WHERE " . implode(" AND ", $where) : "";
    $sql = "SELECT id, nama_instansi as namaInstansi, jenis_instansi as jenisInstansi, kota_instansi as kotaInstansi, nama_pic as namaPIC, jabatan_pic as jabatanPIC, email, no_wa as noWA, fokus_program as fokusProgram, jenis_kemitraan as jenisKemitraan, estimasi_waktu as estimasiWaktu, pesan, status, catatan_admin as catatanAdmin, DATE_FORMAT(created_at, '%d/%m/%Y %H:%i:%s') as timestamp, created_at FROM mitra {$whereSql} ORDER BY created_at DESC, id DESC";

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $list = $stmt->fetchAll();

    jsonSuccess($list, 'Data kemitraan berhasil dimuat.');
}

// 2. SUBMIT NEW MITRA APPLICATION (FROM PUBLIC FORM)
if ($method === 'POST') {
    $input = getJsonInput();

    $namaInstansi = trim($input['namaInstansi'] ?? ($input['nama_instansi'] ?? ''));
    $namaPIC = trim($input['namaPIC'] ?? ($input['nama_pic'] ?? ''));
    $email = trim($input['email'] ?? ($input['emailPIC'] ?? ''));
    $noWA = trim($input['noWA'] ?? ($input['no_wa'] ?? ''));

    if (empty($namaInstansi) || empty($namaPIC) || empty($noWA)) {
        jsonError('Nama Instansi, Nama PIC, dan Nomor WhatsApp wajib diisi.', 422);
    }

    $jenisInstansi = trim($input['jenisInstansi'] ?? ($input['jenis_instansi'] ?? '-'));
    $kotaInstansi = trim($input['kotaInstansi'] ?? ($input['kota_instansi'] ?? '-'));
    $jabatanPIC = trim($input['jabatanPIC'] ?? ($input['jabatan_pic'] ?? '-'));
    $fokusProgram = is_array($input['fokusProgram'] ?? null) ? implode(', ', $input['fokusProgram']) : trim($input['fokusProgram'] ?? ($input['fokus_program'] ?? '-'));
    $jenisKemitraan = trim($input['jenisKemitraan'] ?? ($input['jenis_kemitraan'] ?? '-'));
    $estimasiWaktu = trim($input['estimasiWaktu'] ?? ($input['estimasi_waktu'] ?? '-'));
    $pesan = trim($input['pesan'] ?? '-');
    $status = 'Menunggu';

    $id = trim($input['id'] ?? ('MITRA-' . date('ymd') . '-' . substr(str_shuffle('0123456789'), 0, 4)));

    $stmt = $db->prepare("INSERT INTO mitra (id, nama_instansi, jenis_instansi, kota_instansi, nama_pic, jabatan_pic, email, no_wa, fokus_program, jenis_kemitraan, estimasi_waktu, pesan, status)
                          VALUES (:id, :nama_instansi, :jenis_instansi, :kota_instansi, :nama_pic, :jabatan_pic, :email, :no_wa, :fokus_program, :jenis_kemitraan, :estimasi_waktu, :pesan, :status)");

    $stmt->execute([
        ':id'              => $id,
        ':nama_instansi'   => $namaInstansi,
        ':jenis_instansi'  => $jenisInstansi,
        ':kota_instansi'   => $kotaInstansi,
        ':nama_pic'        => $namaPIC,
        ':jabatan_pic'     => $jabatanPIC,
        ':email'           => $email,
        ':no_wa'           => $noWA,
        ':fokus_program'   => $fokusProgram,
        ':jenis_kemitraan' => $jenisKemitraan,
        ':estimasi_waktu'  => $estimasiWaktu,
        ':pesan'           => $pesan,
        ':status'          => $status
    ]);

    jsonSuccess([
        'id'            => $id,
        'namaInstansi'  => $namaInstansi,
        'namaPIC'       => $namaPIC,
        'status'        => $status,
        'timestamp'     => date('d/m/Y H:i:s')
    ], 'Formulir kemitraan berhasil dikirim.', 201);
}

// 3. UPDATE STATUS / NOTES (ADMIN)
if ($method === 'PUT' || $method === 'PATCH') {
    $input = getJsonInput();
    $id = trim($input['id'] ?? ($_GET['id'] ?? ''));

    if (empty($id)) {
        jsonError('ID mitra yang akan diupdate wajib disertakan.', 422);
    }

    $updates = [];
    $params = [':id' => $id];

    if (isset($input['status'])) {
        $allowed = ['Menunggu', 'Dihubungi', 'Diproses', 'Selesai', 'Ditolak'];
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

    $sql = "UPDATE mitra SET " . implode(", ", $updates) . " WHERE id = :id";
    $stmt = $db->prepare($sql);
    $stmt->execute($params);

    jsonSuccess(['id' => $id], 'Status mitra berhasil diperbarui.');
}

// 4. DELETE MITRA ENTRY
if ($method === 'DELETE') {
    $input = getJsonInput();
    $id = trim($input['id'] ?? ($_GET['id'] ?? ''));

    if (empty($id)) {
        jsonError('ID mitra yang akan dihapus wajib disertakan.', 422);
    }

    $stmt = $db->prepare("DELETE FROM mitra WHERE id = :id");
    $stmt->execute([':id' => $id]);

    jsonSuccess(['id' => $id], 'Data mitra berhasil dihapus.');
}

jsonError('Metode HTTP tidak didukung pada endpoint mitra.', 405);
