<?php
/**
 * ACF EDUHUB — CHATBOT "CHERRY" API ENDPOINT
 * Powered by Google Gemini Free API with Local Knowledge Fallback
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/gemini_config.php';

// Method check
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed. Use POST.']);
    exit();
}

// Read JSON input
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

// Resolve API Key
$apiKey = !empty($clientApiKey) ? $clientApiKey : GEMINI_API_KEY;

// System Prompt for Gemini
$systemPrompt = <<<EOT
Kamu adalah "Cherry", asisten virtual AI resmi dan representasi ramah dari yayasan pendidikan ACF Eduhub.
Warna identitasmu dan ACF Eduhub adalah Ungu (#7D2280) dan Kuning Emas (#F5A623).

Tentang ACF Eduhub:
- Yayasan sosial pendidikan yang sudah 10+ tahun berdedikasi memutus rantai kemiskinan di Indonesia melalui pendidikan berkualitas bagi dhuafa.
- Mengelola 17 Unit Pendidikan Aktif: 10 Sekolah Juara (HANYA jenjang Sekolah Dasar / SD Juara; Sekolah Juara TIDAK GRATIS / memiliki biaya pendidikan) dan 7 PKBM Sekolah Daya Setara (pendidikan kesetaraan HANYA Paket B setara SMP dan Paket C setara SMA, serta vokasi mandiri).
- PENTING:
  1. Sekolah Juara HANYA ada jenjang SD (Sekolah Dasar), TIDAK ADA jenjang SMP maupun SMA/SMK.
  2. Sekolah Juara (SD) dan PKBM Sekolah Daya Setara TIDAK GRATIS. Jika ditanya apakah gratis atau ditanya biaya sekolah, tegaskan bahwa Sekolah Juara dan Sekolah Daya Setara tidak gratis dan memiliki biaya pendidikan, serta arahkan untuk konfirmasi rincian biaya ke admin WhatsApp +62 851-7979-7661.
  3. Sekolah Daya Setara HANYA ada jenjang Paket B (setara SMP) dan Paket C (setara SMA) serta pelatihan vokasi mandiri.
  4. Jangan menampilkan teks '*(Catatan: ...)*' pada akhir jawaban.
- Mengelola Guruverse.ID (pelatihan 2.000+ guru di berbagai penjuru Indonesia).
- Program Layanan: Memiliki program layanan pendidikan komprehensif (saat ini 7 program terbit yang dikelompokkan ke dalam kategori keberlanjutan unit, tanggap bencana, kesejahteraan ekosistem, kemanusiaan internasional, forum advokasi, dan manajemen sekolah).
- Kantor Pusat: Jl. Jati Mulya No.9, Gumuruh, Kec. Batununggal, Kota Bandung, Jawa Barat 40275.
- Kontak WA/Telepon: +62 851-7979-7661 | Email: welcome@acf.or.id.
- Akuntabilitas: Opini audit Wajar Tanpa Pengecualian (WTP) sejak 2024.

Gaya Komunikasi:
- Berbicaralah dengan sangat ramah, hangat, komunikatif, solutif, dan NYAMBUNG dengan pertanyaan pengguna.
- Jika pengguna hanya menyapa (seperti 'halo', 'hai', 'p', 'assalamualaikum', 'selamat pagi/siang/malam'), cukup balas singkat dan ramah: 'Halo! 👋 Senang bisa menyapa Anda. Ada yang bisa Cherry bantu hari ini? 😊' tanpa perlu menyebutkan Sekolah Juara atau daftar program.
- Jika pengguna bertanya tentang PPDB, syarat masuk, pendaftaran, atau brosur Sekolah Juara (misalnya 'ppdb ss sekolah juara batam'), langsung berikan tautan pendaftaran online dan tautan brosur unit yang dituju (misal: Batam daftar di http://bit.ly/SPMB2728-SDJBATAM dan brosur di sekolah-juara.html?brosur=batam) tanpa menuliskan syarat berkas panjang seperti SKTM atau KK.
- Jika pengguna bertanya 'cara donasi', berikan langkah-langkah praktis dan metode transfernya.
- Jika pengguna bertanya biaya sekolah atau apakah gratis, tegaskan bahwa Sekolah Juara TIDAK GRATIS dan memiliki biaya pendidikan.
- Format teks dengan rapi dan gunakan emoji yang pas.
EOT;

// Local Knowledge Fallback Engine
// Ambil artikel terbaru dari database MySQL secara dinamis
function getLatestArticlesFromDb($limit = 4) {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        $stmt = $pdo->prepare("SELECT id, title, category_slug as category, category_label as categoryLabel, date_display as date, excerpt FROM articles WHERE status = 'Terbit' ORDER BY created_at DESC, id DESC LIMIT :limit");
        $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
        $stmt->execute();
        $rows = $stmt->fetchAll();
        if (!empty($rows)) {
            return $rows;
        }
    } catch (Throwable $e) {
        // Fallback jika database offline atau tabel belum tersedia
    }

    return [
        [
            'id' => 'ART-SDS07',
            'title' => 'Menyalakan Kembali Api Harapan: Kisah Pejuang PKBM Ceria Taklukkan ANBK 2025',
            'categoryLabel' => 'Artikel Sekolah Daya Setara',
            'date' => '14 Agu 2025',
            'excerpt' => 'Kisah 16 pejuang program Paket C PKBM Ceria yang membuktikan semangat belajar tanpa batas usia dalam ANBK.'
        ],
        [
            'id' => 'ART-SDS06',
            'title' => 'Sebuah Langkah Kecil Hari Ini, Lompatan Besar di Masa Depan: Pelepasan Lulusan Sekolah Daya Setara 2025/2026',
            'categoryLabel' => 'Artikel Sekolah Daya Setara',
            'date' => '7 Agu 2026',
            'excerpt' => 'Pelepasan peserta didik Paket B dan Paket C yang sukses menyelesaikan studi kesetaraan di PKBM Lembang.'
        ],
        [
            'id' => 'ART-SJ06',
            'title' => 'Haflah Tahfidz Qur’an SD Persa Juara Medan: Wisuda 61 Siswa Penghafal Qur’an',
            'categoryLabel' => 'Artikel Sekolah Juara',
            'date' => '3 Jul 2026',
            'excerpt' => 'Sebanyak 61 siswa SD Juara Medan diwisuda tahfidz dengan hafalan hingga 6 juz dalam suasana khidmat dan haru.'
        ],
        [
            'id' => 'ART-SJ03',
            'title' => 'Tasyakuran Tahsin Metode Tilawati SD Juara Cilegon: Uji Publik & Wisuda Jilid 1–6',
            'categoryLabel' => 'Artikel Sekolah Juara',
            'date' => '18 Jun 2026',
            'excerpt' => 'Uji publik bacaan Al-Qur’an bersama Kepala Cabang Tilawati Banten bagi siswa yang menyelesaikan jilid 1 hingga 6.'
        ]
    ];
}

function formatArticlesReply($limit = 4) {
    $articles = getLatestArticlesFromDb($limit);
    $reply = "📰 **Kabar & Artikel Terbaru ACF Eduhub**:\n\n" .
             "Berikut adalah artikel dan publikasi berita terhangat yang terbit di website:\n\n";

    $i = 1;
    foreach ($articles as $art) {
        $title = !empty($art['title']) ? $art['title'] : 'Artikel Edukasi ACF';
        $cat = !empty($art['categoryLabel']) ? $art['categoryLabel'] : (!empty($art['category']) ? $art['category'] : 'Kabar Edukasi');
        $date = !empty($art['date']) ? " • 📅 {$art['date']}" : '';
        $link = !empty($art['id']) ? "kabar.html?id=" . urlencode($art['id']) : 'kabar.html';
        $excerpt = !empty($art['excerpt']) ? "\n   " . mb_substr(trim($art['excerpt']), 0, 115) . "..." : '';

        $reply .= "{$i}. 📝 **[{$title}]({$link})**\n   🏷️ *{$cat}*{$date}{$excerpt}\n\n";
        $i++;
    }

    $reply .= "Anda dapat membaca artikel lengkapnya dengan mengklik tautan judul di atas atau mengunjungi halaman [Kabar](kabar.html)! ✨";
    return $reply;
}

// Data 10 Unit Sekolah Juara (SD) lengkap dengan link pendaftaran & brosur
function getSekolahJuaraPpdbReply($query) {
    $q = mb_strtolower(trim($query));
    
    $schools = [
        ['key' => 'batam', 'name' => 'SD Juara Batam', 'daftar' => 'http://bit.ly/SPMB2728-SDJBATAM', 'brosur' => 'sekolah-juara.html?brosur=batam'],
        ['key' => 'cilegon', 'name' => 'SD Juara Cilegon', 'daftar' => 'https://bit.ly/SPMB2728SDJUARACILEGON', 'brosur' => 'sekolah-juara.html?brosur=cilegon'],
        ['key' => 'jakbar', 'name' => 'SD Juara Jakarta Barat', 'aliases' => ['jakarta barat', 'jakbar'], 'daftar' => 'https://forms.gle/7WoWewcTqsPCZ4Aq7', 'brosur' => 'sekolah-juara.html?brosur=jakbar'],
        ['key' => 'jaktim', 'name' => 'SD Juara Jakarta Timur', 'aliases' => ['jakarta timur', 'jaktim'], 'daftar' => 'https://bit.ly/PPDBSDJuaraJakartaTimur20272028', 'brosur' => 'sekolah-juara.html?brosur=jaktim'],
        ['key' => 'jakut', 'name' => 'SD Juara Jakarta Utara', 'aliases' => ['jakarta utara', 'jakut'], 'daftar' => 'https://bit.ly/SPMBINDENSDITJAKUT2728', 'brosur' => 'sekolah-juara.html?brosur=jakut'],
        ['key' => 'medan', 'name' => 'SD Juara Persa Medan', 'aliases' => ['medan', 'persa'], 'daftar' => 'https://linktr.ee/sdspersa', 'brosur' => 'sekolah-juara.html?brosur=medan'],
        ['key' => 'jayapura', 'name' => 'SD Juara AL Hikmah Jayapura', 'aliases' => ['jayapura', 'hikmah', 'papua'], 'daftar' => 'https://bit.ly/SPMBSDJUARAJayapura', 'brosur' => 'sekolah-juara.html?brosur=jayapura'],
        ['key' => 'semarang', 'name' => 'SD Juara Semarang', 'daftar' => 'https://bit.ly/ForPeminatPPDB20272028', 'brosur' => 'sekolah-juara.html?brosur=semarang'],
        ['key' => 'surabaya', 'name' => 'SD Juara Surabaya', 'daftar' => 'https://s.id/spmb-sdjuarasurabaya27-28', 'brosur' => 'sekolah-juara.html?brosur=surabaya'],
        ['key' => 'tangerang', 'name' => 'SD Juara AL Hakim Tangerang', 'aliases' => ['tangerang', 'hakim'], 'daftar' => 'https://bit.ly/DaftarIndenAlhakim2728', 'brosur' => 'sekolah-juara.html?brosur=tangerang']
    ];

    // Cek apakah menanyakan cabang kota spesifik
    foreach ($schools as $s) {
        $match = strpos($q, $s['key']) !== false;
        if (!$match && !empty($s['aliases'])) {
            foreach ($s['aliases'] as $alias) {
                if (strpos($q, $alias) !== false) {
                    $match = true;
                    break;
                }
            }
        }
        if ($match) {
            return "🎒 **Pendaftaran & Brosur SPMB {$s['name']}**:\n\n" .
                   "Berikut adalah tautan resmi pendaftaran dan dokumen brosur untuk **{$s['name']}**:\n\n" .
                   "• 📝 **Link Pendaftaran**: [Daftar Online {$s['name']}]({$s['daftar']})\n" .
                   "• 📖 **Brosur Resmi**: [Lihat & Unduh Brosur]({$s['brosur']})\n\n" .
                   "Anda juga dapat melihat profil lengkap unit ini di halaman [Sekolah Juara](sekolah-juara.html). Bantuan lebih lanjut hubungi WhatsApp admin di **+62 851-7979-7661**! 😊";
        }
    }

    // Tampilkan 10 unit dengan tautan pendaftaran & brosur
    $reply = "🎒 **Link Pendaftaran & Brosur SPMB/PPDB Sekolah Juara (SD)**:\n\n" .
             "Silakan klik tautan di bawah ini untuk langsung mengisi formulir pendaftaran atau mengunduh brosur resmi unit yang dituju:\n\n";

    $idx = 1;
    foreach ($schools as $s) {
        $reply .= "{$idx}. **{$s['name']}**\n" .
                  "   • 📝 [Formulir Pendaftaran]({$s['daftar']})\n" .
                  "   • 📖 [Lihat & Unduh Brosur]({$s['brosur']})\n\n";
        $idx++;
    }

    $reply .= "Detail profil seluruh unit dapat Anda lihat di menu [Sekolah Juara](sekolah-juara.html)! ✨";
    return $reply;
}

function getSmartFallbackReply($query) {
    $raw = trim($query);
    $q = mb_strtolower($raw);

    // 1. CARA DONASI / MAU DONASI / LANGKAH BERDONASI
    if (
        (strpos($q, 'cara') !== false || strpos($q, 'gimana') !== false || strpos($q, 'bagaimana') !== false || strpos($q, 'langkah') !== false || strpos($q, 'alur') !== false || strpos($q, 'mau') !== false || strpos($q, 'pengen') !== false || strpos($q, 'ingin') !== false || strpos($q, 'bisa') !== false || strpos($q, 'prosedur') !== false) &&
        (strpos($q, 'donasi') !== false || strpos($q, 'transfer') !== false || strpos($q, 'sedekah') !== false || strpos($q, 'infaq') !== false || strpos($q, 'rekening') !== false || strpos($q, 'bayar') !== false || strpos($q, 'nyumbang') !== false)
    ) {
        return "💖 **Cara Menyalurkan Donasi di ACF Eduhub**:\n\n" .
               "1. Buka halaman [Donasi](donasi.html) di website ini (atau klik menu **Donasi**).\n" .
               "2. Pilih program yang ingin Anda dukung (contoh: *Beasiswa Sekolah Juara*, *Nutrisi & Sarapan Siswa*, atau *Fasilitas Belajar*).\n" .
               "3. Masukkan nominal donasi dan lengkapi data diri Anda.\n" .
               "4. Pilih metode pembayaran yang diinginkan (Transfer Bank BCA, Mandiri, BRI, BSI, Virtual Account, atau QRIS / E-Wallet Gopay, OVO, ShopeePay, DANA).\n" .
               "5. Selesaikan pembayaran, dan tanda terima resmi donasi akan langsung dikirimkan.\n\n" .
               "Anda juga bisa transfer langsung atau konfirmasi lewat WhatsApp admin di **+62 851-7979-7661**. Terima kasih banyak atas kebaikan Anda! 😊";
    }

    // 2. METODE PEMBAYARAN / REKENING DONASI
    if (
        strpos($q, 'rekening') !== false || strpos($q, 'no rek') !== false || strpos($q, 'nomor rekening') !== false ||
        ((strpos($q, 'bank') !== false || strpos($q, 'transfer') !== false || strpos($q, 'pembayaran') !== false) && (strpos($q, 'donasi') !== false || strpos($q, 'bca') !== false || strpos($q, 'mandiri') !== false || strpos($q, 'bri') !== false || strpos($q, 'bsi') !== false || strpos($q, 'qris') !== false))
    ) {
        return "💳 **Metode Pembayaran & Rekening Donasi ACF Eduhub**:\n\n" .
               "Anda dapat berdonasi secara praktis melalui:\n" .
               "• **QRIS Instan**: Scan via BCA Mobile, Livin Mandiri, GoPay, OVO, Dana, ShopeePay, atau LinkAja.\n" .
               "• **Transfer Bank**: Tersedia Bank Mandiri, BCA, BRI, dan Bank Syariah Indonesia (BSI) atas nama **Yayasan Amal Khair Yasmin / ACF Eduhub**.\n" .
               "• **Virtual Account (VA)**: Otomatis terverifikasi saat berdonasi di halaman [Donasi](donasi.html).\n\n" .
               "Butuh bantuan transfer manual atau kwitansi? Hubungi WhatsApp kami di **+62 851-7979-7661** ya!";
    }

    // 3. KEAMANAN / AUDIT / WTP
    if (strpos($q, 'aman') !== false || strpos($q, 'terpercaya') !== false || strpos($q, 'audit') !== false || strpos($q, 'wtp') !== false || strpos($q, 'laporan keuangan') !== false || strpos($q, 'transparan') !== false) {
        return "🛡️ **Donasi Anda 100% Aman & Terpercaya**:\n\n" .
               "ACF Eduhub adalah yayasan resmi berbadan hukum yang telah berkiprah 10+ tahun. Laporan keuangan yayasan diaudit secara berkala oleh Kantor Akuntan Publik independen dan berhasil meraih predikat tertinggi **WTP (Wajar Tanpa Pengecualian)** sejak 2024.\n\n" .
               "Setiap dana disalurkan langsung untuk operasional unit pendidikan, subsidi beasiswa, dan nutrisi siswa prasejahtera.";
    }

    // 4. DONASI UMUM
    if ($q === 'donasi' || strpos($q, 'donasi') !== false || strpos($q, 'infaq') !== false || strpos($q, 'sedekah') !== false || strpos($q, 'donatur') !== false) {
        return "💖 **Donasi Pendidikan ACF Eduhub**:\n\n" .
               "Setiap rupiah donasi Anda membantu membiayai sekolah, seragam, buku, dan nutrisi siswa dhuafa di 10 Sekolah Juara dan 7 PKBM Daya Setara.\n\n" .
               "• Ingin berdonasi sekarang? Buka halaman [Donasi](donasi.html).\n" .
               "• Ingin tahu cara dan alur transfernya? Ketik **'cara donasi'** dan Cherry siap jelaskan langkah-langkahnya! 😊";
    }

    // 5. KEINGINAN BERTANYA
    if (
        preg_match('/^(aku\s+)?(mau|pengen|bisa|boleh)\s+(tanya|nanya|bertanya)/i', $q) ||
        preg_match('/^(tanya|nanya)\s+(dong|nih|ya|aja|sesuatu)/i', $q) ||
        preg_match('/^(bisa\s+(bantu|tolong)|tolong\s+bantu)/i', $q) ||
        $q === 'tanya' || $q === 'nanya'
    ) {
        return "Boleh banget! Mau tanya tentang apa nih? 😊\n\nSilakan langsung ketik pertanyaannya, Cherry siap bantu jelaskan secara lengkap seputar:\n" .
               "• 💖 **Cara & Metode Donasi**: Rekening transfer bank, QRIS, & audit WTP\n" .
               "• 🏫 **Sekolah Juara (SD)**: 10 unit SD formal, Kurikulum Langit & PPDB\n" .
               "• 📖 **Sekolah Daya Setara (PKBM)**: Paket B & C serta vokasi mandiri\n" .
               "• 👩‍🏫 **Guruverse.ID**: Platform peningkatan kapasitas guru Indonesia\n" .
               "• 📚 **Program Layanan**: Keberlanjutan pendidikan & kemanusiaan\n" .
               "• 🤝 **Kemitraan CSR & Relawan**: Mitra program & Sahabat Eduhub\n" .
               "• 📰 **Artikel & Kabar**: Update berita kegiatan & publikasi edukasi terbaru\n" .
               "• 🏢 **Profil Yayasan**: Visi misi, 10+ tahun kiprah & kemitraan\n" .


               "• 📍 **Alamat & Kontak**: Lokasi kantor Bandung & WhatsApp resmi admin";
    }

    // 6. SAPAAN / GREETINGS
    if (
        preg_match('/^(halo+|hallo+|hai+|hey+|hei+|hi+|p|tes|test|assalamu[\'"`]?alaikum|selamat\s*(pagi|siang|sore|malam)|sampurasun|punten|permisi)(\s|[!.,?~]|$)/i', $q) ||
        in_array($q, ['halo', 'hallo', 'hai', 'hi', 'hey', 'hei', 'p'])
    ) {
        return "Halo! 👋 Senang bisa menyapa Anda. Ada yang bisa Cherry bantu hari ini? 😊";
    }

    // 7. BIAYA SEKOLAH / APAKAH GRATIS?
    if (strpos($q, 'biaya') !== false || strpos($q, 'bayar') !== false || strpos($q, 'gratis') !== false || strpos($q, 'spp') !== false || strpos($q, 'uang sekolah') !== false || strpos($q, 'uang gedung') !== false || strpos($q, 'tarif') !== false) {
        return "🏫 **Informasi Biaya Pendidikan (Sekolah Juara & Sekolah Daya Setara)**:\n\n" .
               "Sekolah Juara (SD) maupun PKBM Sekolah Daya Setara **TIDAK GRATIS**. Keduanya merupakan unit pendidikan binaan ACF Eduhub dengan biaya pendidikan terjangkau untuk menunjang mutu belajar dan fasilitas siswa.\n\n" .
               "Untuk rincian lengkap mengenai biaya formulir pendaftaran, uang pangkal, SPP bulanan, maupun informasi beasiswa khusus, silakan hubungi narahubung kami di WhatsApp **+62 851-7979-7661**.";
    }

    // 8. INFO PPDB, DAFTAR, DAN BROSUR SEKOLAH JUARA
    if (
        strpos($q, 'ppdb') !== false ||
        strpos($q, 'spmb') !== false ||
        strpos($q, 'brosur') !== false ||
        ((strpos($q, 'cara') !== false || strpos($q, 'gimana') !== false || strpos($q, 'syarat') !== false || strpos($q, 'langkah') !== false || strpos($q, 'alur') !== false || strpos($q, 'daftar') !== false || strpos($q, 'masuk') !== false) &&
         (strpos($q, 'sekolah') !== false || strpos($q, 'juara') !== false || strpos($q, 'siswa') !== false || strpos($q, 'anak') !== false || strpos($q, 'sd') !== false))
    ) {
        return getSekolahJuaraPpdbReply($raw);
    }

    // 9. CARA JADI MITRA PROGRAM / CSR
    if (
        (strpos($q, 'cara') !== false || strpos($q, 'gimana') !== false || strpos($q, 'syarat') !== false || strpos($q, 'langkah') !== false || strpos($q, 'mau') !== false) &&
        (strpos($q, 'mitra') !== false || strpos($q, 'kerjasama') !== false || strpos($q, 'kolaborasi') !== false || strpos($q, 'csr') !== false || strpos($q, 'sponsor') !== false || strpos($q, 'perusahaan') !== false)
    ) {
        return "🤝 **Cara Menjadi Mitra Program / Kerjasama CSR**:\n\n" .
               "1. Masuk ke halaman formulir [Jadi Mitra Program](form-mitra.html).\n" .
               "2. Isi formulir dengan profil perusahaan/lembaga dan program kemitraan yang diminati (Beasiswa Binaan Kelas, Pembangunan Fasilitas, Green School, dll).\n" .
               "3. Kirim formulir pendaftaran.\n" .
               "4. Tim Partnership ACF Eduhub akan menghubungi PIC Anda untuk diskusi proposal dan sinergi bersama.\n\n" .
               "Ingin berdiskusi langsung? Hubungi email kemitraan di **welcome@acf.or.id** atau WA di **+62 851-7979-7661**.";
    }

    // 10. CARA JADI RELAWAN (SAHABAT EDUHUB)
    if (
        strpos($q, 'relawan') !== false ||
        strpos($q, 'volunteer') !== false ||
        (strpos($q, 'sahabat') !== false && (strpos($q, 'eduhub') !== false || strpos($q, 'daftar') !== false || strpos($q, 'gabung') !== false))
    ) {
        return "🙋‍♀️ **Cara Mendaftar Jadi Relawan (Sahabat Eduhub)**:\n\n" .
               "1. Buka formulir pendaftaran di halaman [Jadi Relawan](form-relawan.html).\n" .
               "2. Lengkapi identitas diri dan pilih bidang yang diminati:\n" .
               "   • *Relawan Pengajar / Tutor*\n" .
               "   • *Fasilitator Kegiatan & Event*\n" .
               "   • *Dokumentasi, Foto, & Desain Konten*\n" .
               "   • *Mentor Inspiratif & Karakter*\n" .
               "3. Kirim formulir pendaftaran.\n" .
               "4. Tim relawan kami akan mengundang Anda ke sesi orientasi komunitas.\n\n" .
               "Mari berbagi inspirasi dan senyuman untuk anak-anak Indonesia! ✨";
    }

    // 10.5 JUMLAH & SEBARAN SEKOLAH JUARA (10 SD JUARA)
    if (
        (strpos($q, 'daerah') !== false || strpos($q, 'dimana') !== false || strpos($q, 'di mana') !== false || strpos($q, 'mana saja') !== false || strpos($q, 'mana aja') !== false || strpos($q, 'lokasi') !== false || strpos($q, 'kota') !== false || strpos($q, 'wilayah') !== false || strpos($q, 'tempat') !== false || strpos($q, 'sebaran') !== false || strpos($q, 'cabang') !== false || strpos($q, 'tersebar') !== false || strpos($q, 'alamat') !== false || strpos($q, 'daftar') !== false || strpos($q, 'berapa') !== false || strpos($q, 'da berapa') !== false || strpos($q, 'jumlah') !== false || strpos($q, 'total') !== false) &&
        (strpos($q, 'sekolah') !== false || strpos($q, 'juara') !== false || strpos($q, 'sd') !== false)
    ) {
        return "🏫 **Sekolah Juara memiliki total 10 unit**, dan seluruhnya adalah jenjang **Sekolah Dasar (SD Juara)** binaan ACF Eduhub:\n\n" .
               "1. SD Juara Batam\n" .
               "2. SD Juara Cilegon\n" .
               "3. SD Juara Jakarta Barat\n" .
               "4. SD Juara Jakarta Timur\n" .
               "5. SD Juara Jakarta Utara\n" .
               "6. SD Juara Persa Medan\n" .
               "7. SD Juara AL Hikmah Jayapura\n" .
               "8. SD Juara Semarang\n" .
               "9. SD Juara Surabaya\n" .
               "10. SD Juara AL Hakim Tangerang";
    }

    // 10.6 JENJANG / TINGKAT / SMP / SMK / HANYA SD
    if (
        (strpos($q, 'jenjang') !== false || strpos($q, 'tingkat') !== false || strpos($q, 'smp') !== false || strpos($q, 'smk') !== false || strpos($q, 'sma') !== false || strpos($q, 'kelas') !== false || strpos($q, 'hanya sd') !== false || strpos($q, 'cuma sd') !== false) &&
        (strpos($q, 'sekolah') !== false || strpos($q, 'juara') !== false || strpos($q, 'pendidikan') !== false)
    ) {
        return "ℹ️ **Jenjang Pendidikan di Sekolah Juara**:\n\n" .
               "Sekolah Juara **HANYA ada jenjang Sekolah Dasar (SD)** yaitu 10 unit SD Juara binaan ACF Eduhub.\n\n" .
               "Di Sekolah Juara **tidak ada jenjang SMP maupun SMK/SMA**. Namun bagi yang memerlukan jenjang lanjutan (setara SMP / Paket B dan setara SMA / Paket C serta vokasi mandiri), ACF Eduhub memfasilitasinya melalui unit **PKBM Sekolah Daya Setara**.";
    }

    // 11. APA ITU SEKOLAH JUARA
    if ($q === 'sekolah juara' || $q === 'sd juara' || ((strpos($q, 'sekolah juara') !== false || strpos($q, 'sd juara') !== false || strpos($q, 'juara') !== false) && (strpos($q, 'apa') !== false || strpos($q, 'tentang') !== false || strpos($q, 'maksud') !== false || strpos($q, 'profil') !== false || strpos($q, 'penjelasan') !== false || strpos($q, 'definisi') !== false || strpos($q, 'arti') !== false || strpos($q, 'info') !== false || strpos($q, 'informasi') !== false))) {
        return "🏆 **Sekolah Juara** adalah jaringan 10 unit **Sekolah Dasar (SD Juara)** formal berkualitas yang dikelola oleh ACF Eduhub untuk mendidik generasi penerus bangsa.\n\n" .
               "Sekolah Juara memadukan kurikulum nasional dengan pembinaan akhlak mulia melalui Kurikulum Langit, kepemimpinan (*leadership*), kewirausahaan, serta kecintaan terhadap Al-Qur'an.";
    }

    // 12. APA ITU SEKOLAH DAYA SETARA / PKBM
    if (strpos($q, 'daya setara') !== false || strpos($q, 'pkbm') !== false || strpos($q, 'kejar paket') !== false || strpos($q, 'paket c') !== false || strpos($q, 'paket b') !== false) {
        return "📖 **Sekolah Daya Setara** adalah 7 unit PKBM (Pusat Kegiatan Belajar Masyarakat) pendidikan non-formal kesetaraan yang berfokus pada **Paket B (setara SMP)** dan **Paket C (setara SMA)** serta pelatihan vokasi mandiri binaan ACF Eduhub dengan biaya terjangkau.\n\n" .
               "Sekolah Daya Setara khusus melayani jenjang Paket B dan Paket C. Program ini membantu anak-anak putus sekolah dan masyarakat prasejahtera mendapatkan ijazah resmi negara serta keahlian kerja mandiri.";
    }

    // 13. APA ITU GURUVERSE
    if (strpos($q, 'guruverse') !== false || (strpos($q, 'guru') !== false && (strpos($q, 'pelatihan') !== false || strpos($q, 'training') !== false))) {
        return "👩‍🏫 **Guruverse.ID** adalah ekosistem peningkatan kapasitas guru yang diinisiasi oleh ACF Eduhub. Hingga kini telah melatih lebih dari **2.000+ guru** di seluruh pelosok Indonesia mengenai metode belajar aktif, pedagogik kreatif, dan pemanfaatan teknologi kelas.";
    }

    // 14. PROGRAM LAYANAN ACF EDUHUB (7 PROGRAM TERBIT)
    if (strpos($q, 'program') !== false || strpos($q, 'layanan') !== false || strpos($q, 'pilar') !== false || strpos($q, 'kegiatan') !== false) {
        return "📚 **Program Layanan ACF Eduhub (7 Program)**:\n\n" .
               "1. 🎯 **Program Beasiswa & Keberlanjutan Sekolah Juara** *(Divisi: Sekolah Juara)*\n" .
               "   Mendukung operasional & beasiswa 10 unit Sekolah Juara bagi anak dhuafa berprestasi.\n" .
               "2. 🎯 **Kesejahteraan Guru & Operasional Sekolah Daya Setara** *(Divisi: Sekolah Daya Setara)*\n" .
               "   Kesejahteraan tutor & operasional 7 PKBM Daya Setara (Paket B, C, & vokasi mandiri).\n" .
               "3. 🎯 **Layanan Pascabencana** *(Divisi: Guruverse.ID & ACF Educare)*\n" .
               "   Respons psikososial anak & guru terdampak, sekolah darurat, serta bantuan pangan/sandang/papan.\n" .
               "4. 🎯 **Kesejahteraan Ekosistem Sekolah** *(Divisi: ACF Educare)*\n" .
               "   Dukungan terpadu bagi guru honorer, penjaga sekolah, & keluarga dhuafa sekitar sekolah.\n" .
               "5. 🎯 **Bantuan Kemanusiaan Internasional** *(Divisi: ACF Educare)*\n" .
               "   Penyaluran bantuan pangan & kebutuhan darurat bagi anak-anak di wilayah konflik global.\n" .
               "6. 🎯 **Education Outlook — Forum Tahunan Pendidikan** *(Divisi: Guruverse.ID)*\n" .
               "   Forum tahunan mempertemukan pembuat kebijakan & akademisi membahas arah pendidikan nasional.\n" .
               "7. 🎯 **Konsultasi & Pendampingan Manajemen Sekolah** *(Divisi: Guruverse.ID)*\n" .
               "   Layanan konsultasi manajemen sekolah, strategi SPMB/PPDB, serta studi kelayakan pendirian sekolah.\n\n" .




               "Pelajari detailnya di menu [Program Layanan](program-layanan.html)!";
    }

    // 15. LOKASI & ALAMAT KANTOR
    if (strpos($q, 'alamat') !== false || strpos($q, 'lokasi') !== false || strpos($q, 'kantor') !== false || strpos($q, 'dimana') !== false) {
        return "📍 **Alamat & Lokasi Kantor ACF Eduhub**:\n\n" .
               "🏢 **Kantor Pusat**: Jl. Jati Mulya No.9, Gumuruh, Kec. Batununggal, Kota Bandung, Jawa Barat 40275\n\n" .
               "📞 **WhatsApp / Telepon**: +62 851-7979-7661\n" .
               "✉️ **Email**: welcome@acf.or.id";
    }

    // 16. KONTAK & WA
    if (strpos($q, 'kontak') !== false || strpos($q, 'telepon') !== false || strpos($q, 'wa') !== false || strpos($q, 'whatsapp') !== false || strpos($q, 'email') !== false || strpos($q, 'admin') !== false) {
        return "📞 **Kontak Resmi ACF Eduhub**:\n\n" .
               "• **WhatsApp / Telepon**: +62 851-7979-7661 (tersedia juga tombol hijau WA di pojok kiri bawah layar Anda)\n" .
               "• **Email**: welcome@acf.or.id\n" .
               "• **Instagram**: @acf.eduhub\n" .
               "• **YouTube**: JUARA TV\n\n" .
               "Tim kami siap melayani Anda pada jam operasional kerja.";
    }

    // 16.5 ARTIKEL & KABAR TERKINI
    if (strpos($q, 'artikel') !== false || strpos($q, 'berita') !== false || strpos($q, 'liputan') !== false || strpos($q, 'publikasi') !== false || $q === 'kabar' || (strpos($q, 'kabar') !== false && strpos($q, 'apa kabar') === false && strpos($q, 'gimana kabar') === false && strpos($q, 'kabar baik') === false)) {
        return formatArticlesReply(4);
    }


    // 17. UCAPAN TERIMA KASIH
    if (strpos($q, 'terima kasih') !== false || strpos($q, 'makasih') !== false || strpos($q, 'thanks') !== false || strpos($q, 'nuhun') !== false) {
        return "Sama-sama! Senang sekali bisa membantu Anda. 😊 Jika ada hal lain yang ingin ditanyakan lagi tentang program kami, jangan ragu untuk menyapa Cherry lagi ya!";
    }

    // 18. AFIRMASI
    if (preg_match('/^(oke+|ok|siap|baik|mantap|sip|yoi|keren|siip)(\s|[!.,?~]|$)/i', $q) || in_array($q, ['oke', 'ok', 'siap'])) {
        return "Sip! Senang bisa mendampingi Anda. Jika ada informasi atau bantuan lain yang diperlukan di website ini, kabari Cherry ya! ✨";
    }

    // 19. SIAPA KAMU / CHERRY
    if (strpos($q, 'siapa') !== false || strpos($q, 'nama') !== false || strpos($q, 'bot') !== false || strpos($q, 'cherry') !== false) {
        return "Halo! 😊 Saya **Cherry**, asisten virtual AI ramah dari **ACF Eduhub**! Warna identitas saya ungu dan kuning emas khas ACF. Tugas saya menjawab pertanyaan Anda tentang Sekolah Juara, donasi, program beasiswa, relawan, dan kontak kami.";
    }

    // 20. DEFAULT NATURAL NYAMBUNG
    return "Terima kasih atas pertanyaannya! 😊 Mengenai **" . htmlspecialchars($raw, ENT_QUOTES, 'UTF-8') . "**, Cherry siap bantu jelaskan lebih dalam. Anda bisa menanyakan hal spesifik seputar:\n\n" .
           "• 💖 **Cara Donasi & Metode Pembayaran**\n" .
           "• 🏫 **Sekolah Juara (SD)**: Kurikulum & Info PPDB\n" .
           "• 📖 **Sekolah Daya Setara (PKBM)**: Paket B & C serta Vokasi\n" .
           "• 👩‍🏫 **Guruverse.ID**: Ekosistem Pelatihan Guru Indonesia\n" .
           "• 📚 **Program Layanan**\n" .
           "• 🤝 **Kerjasama Mitra CSR & Relawan**\n" .
           "• 📰 **Artikel & Kabar Berita Terkini**\n" .
           "• 🏢 **Profil Yayasan & Visi Misi**\n" .
           "• 📍 **Alamat Kantor Bandung & Kontak WhatsApp**\n\n" .
           "Atau Anda bisa langsung chat admin kami via WhatsApp di **+62 851-7979-7661** (tombol hijau di pojok kiri bawah).";
}

// Check if API key is empty
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

// Call Google Gemini API
try {
    $url = GEMINI_API_URL . '?key=' . urlencode($apiKey);

    $contents = [];
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

    $contents[] = [
        'role' => 'user',
        'parts' => [
            ['text' => (count($contents) === 0) ? ($systemPrompt . "\n\nPertanyaan pengguna:\n" . $userMessage) : $userMessage]
        ]
    ];

    $payload = [
        'contents' => $contents,
        'generationConfig' => [
            'temperature' => 0.7,
            'maxOutputTokens' => 800
        ]
    ];

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json'
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
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

    // Fallback if Gemini quota exceeded or failed
    $reply = getSmartFallbackReply($userMessage);
    echo json_encode([
        'status' => 'success',
        'reply' => $reply,
        'mode' => 'smart_fallback'
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
