<?php
/**
 * ACF EDUHUB — CHATBOT "CHERRY" API ENDPOINT
 * Powered by Google Gemini Free API with Local Knowledge Fallback
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/gemini_config.php';

// Pastikan method adalah POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed. Use POST.']);
    exit();
}

// Ambil input JSON
$inputRaw = file_get_contents('php://input');
$data = json_decode($inputRaw, true);

if (!$data || !isset($data['message']) || trim($data['message']) === '') {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Parameter "message" diperlukan.']);
    exit();
}

$userMessage = trim($data['message']);
$conversationHistory = isset($data['history']) && is_array($data['history']) ? $data['history'] : [];
$clientApiKey = isset($data['clientApiKey']) ? trim($data['clientApiKey']) : '';

// Tentukan API Key (prioritaskan clientApiKey jika ada, lalu GEMINI_API_KEY)
$apiKey = !empty($clientApiKey) ? $clientApiKey : GEMINI_API_KEY;

// Knowledge Base Prompt untuk Cherry
$systemPrompt = <<<EOT
Kamu adalah "Cherry", asisten virtual AI resmi dan representasi ramah dari ACF Eduhub.
Warna identitasmu dan ACF Eduhub adalah Ungu (#7D2280) dan Kuning Emas (#F5A623).

Tentang ACF Eduhub:
- Yayasan sosial berbasis misi pendidikan yang telah berdiri dan berdedikasi selama lebih dari 10 tahun untuk memutus rantai kemiskinan di Indonesia.
- Kantor Pusat: Jl. Jati Mulya No.9, Gumuruh, Kec. Batununggal, Kota Bandung, Jawa Barat 40275.
- Kontak Telepon / WhatsApp: +62 851-7979-7661.
- Email: welcome@acf.or.id.
- Instagram: @acf.eduhub | YouTube: @JUARATV.
- Opini Audit Keuangan: Wajar Tanpa Pengecualian (WTP) sejak tahun 2024.

Dampak & Capaian:
- 17 Unit Pendidikan Aktif (10 Sekolah Juara + 7 Sekolah Daya Setara).
- 12 Kota/Kabupaten Jangkauan Wilayah.
- 1.812+ Siswa Terdampak (1.662 Sekolah Juara + 150 Sekolah Daya Setara).
- 2.000+ Guru Terlatih lewat platform Guruverse.ID.

Unit Pendidikan ACF Eduhub:
1. Sekolah Juara: 10 unit sekolah formal (SD/SMP/SMA) bebas biaya (gratis 100%) dan berakreditasi baik bagi anak-anak yatim dan dhuafa dari keluarga prasejahtera.
2. PKBM Sekolah Daya Setara: 7 unit Pusat Kegiatan Belajar Masyarakat (Pendidikan Kesetaraan Paket A, B, C, serta pelatihan vokasi kerja) bagi anak putus sekolah dan masyarakat marginal.
3. Guruverse.ID: Ekosistem pelatihan dan pemberdayaan kapasitas guru honorer dan pendidik di pelosok Indonesia.

4 Kategori Program Layanan:
1. Keberlanjutan Unit Pendidikan: Dukungan beasiswa, operasional Sekolah Juara, dan tunjangan tutor PKBM.
2. Pemberdayaan Berbasis Sekolah: Inovasi kantin sehat, green school berbasis lingkungan, dan literasi digital anak.
3. Kemanusiaan Internasional: Penyaluran bantuan darurat & kebutuhan dasar bagi anak-anak di daerah konflik kemanusiaan.
4. Bantuan Langsung Berkelanjutan: Bantuan nutrisi bergizi, seragam, sepatu, buku pelajaran, dan peralatan belajar siswa prasejahtera.

Kemitraan & Partisipasi:
- Kerjasama Mitra / CSR: Perusahaan atau lembaga dapat berkolaborasi program CSR atau beasiswa binaan melalui halaman "Jadi Mitra Program" (form-mitra.html).
- Relawan (Sahabat Eduhub): Mahasiswa dan masyarakat umum dapat mendaftar menjadi relawan pengajar / event melalui "Jadi Relawan" (form-relawan.html).
- Donasi: Donatur dapat menyalurkan infak, sedekah, dan beasiswa mandiri secara mudah lewat halaman "Donasi" (donasi.html).

Instruksi Gaya Menjawab:
- Berikan jawaban yang ramah, sopan, komunikatif, empatik, dan akurat seputar ACF Eduhub.
- Gunakan bahasa Indonesia yang santun dengan sentuhan ceria khas Cherry.
- Format teks dengan rapi (gunakan poin-poin bila ada daftar).
- Jika pengguna bertanya hal di luar ACF atau pendidikan sosial, jawab dengan sopan dan hubungkan kembali ke cara ACF dapat membantu masyarakat.
EOT;

// Fungsi respons fallback cerdas jika API Key belum tersedia atau kuota habis
function getSmartFallbackReply($query) {
    $q = mb_strtolower($query);

    if (preg_match('/(siapa|kamu|nama|cherry|bot)/i', $q) && !preg_match('/sekolah|mitra|program/i', $q)) {
        return "Halo! 😊 Saya **Cherry**, asisten virtual AI resmi dari **ACF Eduhub**. Saya siap membantu menjawab pertanyaan Anda seputar program pendidikan, Sekolah Juara, donasi, kemitraan, hingga kontak kami!";
    }

    if (preg_match('/(unit|sekolah|sekolah juara|daya setara|pkbm|guruverse)/i', $q)) {
        return "🏫 **Unit Pendidikan ACF Eduhub** saat ini mengelola 17 unit pendidikan aktif:\n\n" .
               "1. **Sekolah Juara (10 Unit)**: Sekolah formal gratis berkualitas bagi anak-anak yatim dan dhuafa prasejahtera (membina 1.662+ siswa).\n" .
               "2. **Sekolah Daya Setara / PKBM (7 Unit)**: Pendidikan non-formal kesetaraan (Paket A, B, C) serta vokasi kecakapan kerja untuk anak putus sekolah.\n" .
               "3. **Guruverse.ID**: Platform pengembangan kompetensi dan pelatihan untuk lebih dari 2.000+ guru di Indonesia.\n\n" .
               "Ingin mengetahui pendaftaran atau lokasi unit terdekat?";
    }

    if (preg_match('/(program|layanan|pemberdayaan|kemanusiaan)/i', $q)) {
        return "📚 **4 Pilar Program Layanan ACF Eduhub**:\n\n" .
               "1. **Keberlanjutan Unit Pendidikan**: Dukungan kuota beasiswa dan operasional sekolah dhuafa.\n" .
               "2. **Pemberdayaan Berbasis Sekolah**: Program kantin sehat, green school, dan literasi anak.\n" .
               "3. **Kemanusiaan Internasional**: Penyaluran bantuan anak-anak di wilayah bencana/krisis kemanusiaan.\n" .
               "4. **Bantuan Langsung Berkelanjutan**: Distribusi paket gizi, seragam, dan buku paket belajar.\n\n" .
               "Anda dapat melihat detail lengkapnya di menu **Program Layanan** pada website kami!";
    }

    if (preg_match('/(mitra|kerjasama|kolaborasi|csr|sponsor)/i', $q)) {
        return "🤝 **Kolaborasi Kemitraan Bersama ACF Eduhub**\n\n" .
               "Kami membuka peluang sinergi bagi perusahaan, yayasan, komunitas, dan institusi untuk mewujudkan program CSR berkelanjutan, beasiswa binaan, maupun sarana fasilitas belajar.\n\n" .
               "Silakan kunjungi menu **Kerjasama** atau langsung isi formulir pengajuan di halaman **Jadi Mitra Program** (`form-mitra.html`). Tim kami akan segera menindaklanjuti!";
    }

    if (preg_match('/(relawan|volunteer|sahabat)/i', $q)) {
        return "🙋‍♀️ **Gabung Menjadi Relawan (Sahabat Eduhub)**\n\n" .
               "Anda dapat berpartisipasi aktif menjadi relawan pengajar, fasilitator kegiatan, dokumentasi, maupun mentor siswa. Pendaftaran terbuka melalui formulir di halaman **Jadi Relawan** (`form-relawan.html`). Mari bersama menginspirasi tunas-tunas bangsa!";
    }

    if (preg_match('/(donasi|donatur|infaq|sedekah|bayar|transfer|rekening)/i', $q)) {
        return "💖 **Salurkan Donasi Pendidikan Anda**\n\n" .
               "Setiap donasi yang disalurkan digunakan 100% transparan untuk mensubsidi biaya sekolah, buku paket, seragam, dan gizi sarapan siswa yatim/dhuafa. ACF Eduhub telah meraih opini audit WTP (Wajar Tanpa Pengecualian) sejak 2024.\n\n" .
               "Untuk berdonasi secara aman dan mudah, silakan klik tombol **Salurkan Donasi** atau kunjungi halaman **Donasi** (`donasi.html`). Terima kasih atas kebaikan Anda!";
    }

    if (preg_match('/(alamat|lokasi|kantor|kontak|telepon|wa|whatsapp|email|hubungi)/i', $q)) {
        return "📍 **Kontak & Lokasi Kantor ACF Eduhub**:\n\n" .
               "🏢 **Alamat**: Jl. Jati Mulya No.9, Gumuruh, Kec. Batununggal, Kota Bandung, Jawa Barat 40275\n" .
               "📞 **Telepon / WhatsApp**: +62 851-7979-7661 (tersedia tombol hijau WA di pojok kiri bawah layar)\n" .
               "✉️ **Email**: welcome@acf.or.id\n" .
               "📸 **Instagram**: @acf.eduhub | **YouTube**: JUARA TV";
    }

    if (preg_match('/(dampak|statistik|capaian|angka|wtp)/i', $q)) {
        return "📊 **Capaian Dampak ACF Eduhub (10 Tahun Berjalan)**:\n\n" .
               "• **17 Unit Pendidikan**: 10 Sekolah Juara + 7 Sekolah Daya Setara\n" .
               "• **12 Kota/Kabupaten** wilayah jangkauan operasional\n" .
               "• **1.812+ Siswa Terdampak** langsung beasiswa penuh\n" .
               "• **2.000+ Guru Terlatih** lewat program Guruverse.ID\n" .
               "• **Opini WTP (Wajar Tanpa Pengecualian)** sejak 2024 untuk akuntabilitas publik.";
    }

    // Default friendly answer
    return "Terima kasih atas pertanyaannya! 😊\n\n" .
           "Saya **Cherry**, asisten AI ACF Eduhub. Saya dapat memberikan informasi lengkap seputar:\n" .
           "• 🏫 **Unit Pendidikan**: Sekolah Juara & PKBM Daya Setara\n" .
           "• 📚 **Program Layanan**: 4 pilar program pendidikan & beasiswa\n" .
           "• 🤝 **Kemitraan & Relawan**: Cara berkolaborasi bersama ACF\n" .
           "• 💖 **Donasi**: Penyaluran bantuan pendidikan dhuafa\n" .
           "• 📍 **Kontak & Alamat**: Layanan informasi dan konsultasi\n\n" .
           "Ada bagian tertentu yang ingin Anda tanyakan lebih lanjut?";
}

// Jika tidak ada API key, gunakan Smart Fallback
if (empty($apiKey)) {
    $reply = getSmartFallbackReply($userMessage);
    echo json_encode([
        'status' => 'success',
        'reply' => $reply,
        'mode' => 'smart_knowledge_base',
        'source' => 'ACF Eduhub Core Knowledge'
    ]);
    exit();
}

// Jika ada API Key, panggil Google Gemini API
try {
    $url = GEMINI_API_URL . '?key=' . urlencode($apiKey);

    // Siapkan riwayat percakapan untuk Gemini
    $contents = [];

    // Tambahkan system instruction lewat prompt awal
    $systemPreamble = $systemPrompt . "\n\nPertanyaan pengguna:";

    // Format chat history
    foreach ($conversationHistory as $turn) {
        if (!empty($turn['role']) && !empty($turn['text'])) {
            $role = ($turn['role'] === 'user') ? 'user' : 'model';
            $contents[] = [
                'role' => $role,
                'parts' => [
                    ['text' => $turn['text']]
                ]
            ];
        }
    }

    // Tambahkan pesan saat ini
    $contents[] = [
        'role' => 'user',
        'parts' => [
            ['text' => (count($contents) === 0) ? ($systemPreamble . "\n" . $userMessage) : $userMessage]
        ]
    ];

    $payload = [
        'contents' => $contents,
        'generationConfig' => [
            'temperature' => 0.7,
            'topK' => 40,
            'topP' => 0.95,
            'maxOutputTokens' => 1024
        ]
    ];

    // Jika didukung model, masukkan systemInstruction
    if (strpos(GEMINI_MODEL, '1.5') !== false || strpos(GEMINI_MODEL, '2.0') !== false) {
        $payload['systemInstruction'] = [
            'parts' => [
                ['text' => $systemPrompt]
            ]
        ];
    }

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json'
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 20);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlErr = curl_error($ch);
    curl_close($ch);

    if ($httpCode === 200 && $response) {
        $respJson = json_decode($response, true);
        if (isset($respJson['candidates'][0]['content']['parts'][0]['text'])) {
            $replyText = $respJson['candidates'][0]['content']['parts'][0]['text'];
            echo json_encode([
                'status' => 'success',
                'reply' => trim($replyText),
                'mode' => 'gemini_ai',
                'model' => GEMINI_MODEL
            ]);
            exit();
        }
    }

    // Jika gagal terhubung ke Google atau kuota limit, beralih ke Smart Fallback
    $reply = getSmartFallbackReply($userMessage);
    echo json_encode([
        'status' => 'success',
        'reply' => $reply,
        'mode' => 'smart_fallback',
        'note' => 'Gemini API call redirected to local ACF knowledge base.'
    ]);

} catch (Exception $e) {
    $reply = getSmartFallbackReply($userMessage);
    echo json_encode([
        'status' => 'success',
        'reply' => $reply,
        'mode' => 'smart_fallback',
        'error' => $e->getMessage()
    ]);
}

