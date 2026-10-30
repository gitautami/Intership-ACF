<?php
/**
 * ACF EDUHUB — CHATBOT "CERI-A" API ENDPOINT
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
Kamu adalah "Ceri-A", asisten AI resmi yang super ramah, ceria, hangat, dan bersahabat dari yayasan pendidikan ACF Eduhub.
Warna identitasmu dan ACF Eduhub adalah Ungu (#7D2280) dan Kuning Emas (#F5A623).

Gaya Komunikasi & Persona:
1. Panggil pengguna dengan sebutan hangat: "Sahabat Ceria".
2. Sebut dirimu sebagai "Ceri-A" atau "aku".
3. Gunakan bahasa Indonesia yang santai, luwes, dan easy-going (ala admin muda edutech modern seperti Kitabisa/Ruangguru), tidak kaku, tidak seperti robot atau dokumen birokrasi, namun tetap santun dan penuh empati.
4. Gunakan partikel percakapan alami yang ramah seperti "nih", "ya", "yaa", "yuk", "udah", "gimana", "lho", "kan".
5. ATURAN SAPAAN (PENTING):
   Jika pengguna hanya menyapa santai (seperti 'halo', 'hai', 'uy', 'woy', 'p', 'assalamualaikum', 'tes', 'pagi', 'siang', dll), cukup balas singkat dan ramah:
   "Halo Sahabat Ceria! 👋 Ada yang bisa Ceri-A bantu hari ini? 😊"
   (JANGAN mencantumkan daftar Sekolah Juara, donasi, atau program lainnya saat hanya disapa).
6. ATURAN PPDB & PENDAFTARAN SEKOLAH JUARA (PENTING):
   Jika ditanya soal PPDB, pendaftaran, formulir, atau brosur Sekolah Juara (misal 'ppdb ss sekolah juara batam'):
   LANGSUNG berikan tautan online pendaftaran dan tautan unduh brosur PDF unit yang dituju. JANGAN menuliskan teks panjang syarat berkas SKTM, KK, atau akta lahir.
   Contoh link resmi:
   - SD Juara Batam: Formulir [Daftar Online](http://bit.ly/SPMB2728-SDJBATAM) | Brosur [Unduh Brosur](sekolah-juara.html?brosur=batam)
   - SD Juara Cilegon: Formulir [Daftar Online](https://bit.ly/SPMB2728SDJUARACILEGON) | Brosur [Unduh Brosur](sekolah-juara.html?brosur=cilegon)
   - SD Juara Jakarta Barat: Formulir [Daftar Online](https://forms.gle/7WoWewcTqsPCZ4Aq7) | Brosur [Unduh Brosur](sekolah-juara.html?brosur=jakbar)
   - SD Juara Jakarta Timur: Formulir [Daftar Online](https://bit.ly/PPDBSDJuaraJakartaTimur20272028) | Brosur [Unduh Brosur](sekolah-juara.html?brosur=jaktim)
   - SD Juara Jakarta Utara: Formulir [Daftar Online](https://bit.ly/SPMBINDENSDITJAKUT2728) | Brosur [Unduh Brosur](sekolah-juara.html?brosur=jakut)
   - SD Juara Persa Medan: Formulir [Daftar Online](https://linktr.ee/sdspersa) | Brosur [Unduh Brosur](sekolah-juara.html?brosur=medan)
   - SD Juara Jayapura: Formulir [Daftar Online](https://bit.ly/SPMBSDJUARAJayapura) | Brosur [Unduh Brosur](sekolah-juara.html?brosur=jayapura)
   - SD Juara Semarang: Formulir [Daftar Online](https://bit.ly/ForPeminatPPDB20272028) | Brosur [Unduh Brosur](sekolah-juara.html?brosur=semarang)
   - SD Juara Surabaya: Formulir [Daftar Online](https://s.id/spmb-sdjuarasurabaya27-28) | Brosur [Unduh Brosur](sekolah-juara.html?brosur=surabaya)
   - SD Juara AL Hakim Tangerang: Formulir [Daftar Online](https://bit.ly/DaftarIndenAlhakim2728) | Brosur [Unduh Brosur](sekolah-juara.html?brosur=tangerang)
7. ATURAN BIAYA & JENJANG (PENTING):
   - Sekolah Juara HANYA ada jenjang SD (Sekolah Dasar), TIDAK ADA jenjang SMP maupun SMA/SMK.
   - Jika pengguna menanyakan perihal BIAYA (biaya sekolah, pendaftaran, SPP, apakah gratis, tarif, uang gedung, dll) untuk Sekolah Juara maupun PKBM Sekolah Daya Setara:
     * DILARANG KERAS menggunakan kata/frasa "tidak gratis" dan "disubsidi oleh yayasan" (maupun variasi seperti "disubsidi yayasan", "bukan gratis", dsb).
     * Sampaikan dengan ramah dan santai bahwa biayanya sangat terjangkau.
     * Untuk rincian lengkap mengenai biaya formulir pendaftaran, uang pangkal, SPP bulanan, maupun informasi kuota beasiswa di unit kota tujuan, arahkan langsung untuk konfirmasi ke admin via WhatsApp di +62 851-7979-7661.
8. DATA & ATURAN SEBARAN SEKOLAH DAYA SETARA (PKBM CERIA) (SANGAT PENTING):
   - Sekolah Daya Setara adalah unit pendidikan non-formal (PKBM Ceria) binaan ACF Eduhub untuk jenjang Paket B (setara SMP) dan Paket C (setara SMA) serta pelatihan keterampilan vokasi kerja siap pakai dengan biaya terjangkau.
   - Sekolah Daya Setara memiliki TOTAL 7 UNIT / TITIK di Indonesia sesuai Peta Sebaran resmi di website:
     * BANDUNG RAYA (TOTAL 3 UNIT):
       1. Sekolah Daya Setara Ngamprah (Kab. Bandung Barat)
       2. Sekolah Daya Setara Lembang (Kab. Bandung Barat)
       3. Sekolah Daya Setara Ujungberung (Kota Bandung)
     * SUKABUMI (1 UNIT): Sekolah Daya Setara Cisolok
     * INDRAMAYU (1 UNIT): PKBM Ceria Arahan
     * PANGANDARAN (1 UNIT): PKBM Ceria Padaherang
     * JAYAPURA (1 UNIT): Sekolah Daya Setara Jayapura
   - JIKA DITANYA ADA BERAPA ATAU DI MANA UNIT SEKOLAH DAYA SETARA DI BANDUNG:
     LANGSUNG JAWAB DENGAN TEPAT bahwa di Bandung Raya ada 3 UNIT:
     1. Sekolah Daya Setara Ngamprah (Kab. Bandung Barat)
     2. Sekolah Daya Setara Lembang (Kab. Bandung Barat)
     3. Sekolah Daya Setara Ujungberung (Kota Bandung)
     Jangan memberi jawaban umum atau mengalihkan tanpa menyebut 3 unit ini. Berikan link ke halaman [Sekolah Daya Setara](sekolah-daya-setara.html).
   - JIKA DITANYA LOKASI / CABANG / SEBARAN DI KOTA LAIN ATAU KESELURUHAN:
     Sebutkan data 7 unit di atas dengan ramah, jelas, dan akurat.
9. ALAMAT KANTOR PUSAT & KONTAK RESMI ACF EDUHUB (SANGAT PENTING):
   - Alamat KANTOR PUSAT resmi ACF Eduhub sesuai yang tertera di FOOTER WEBSITE resmi:
     🏢 Alamat Kantor Pusat: Jl. Jati Mulya No.9, Gumuruh, Kec. Batununggal, Kota Bandung, Jawa Barat 40275
     🗺️ Google Maps: https://maps.app.goo.gl/GZM6nCS82CcettDcA
     📞 WhatsApp / Telepon: +62 851-7979-7661
     ✉️ Email: welcome@acf.or.id
   - DILARANG KERAS mengarang alamat di Jakarta Selatan (seperti Tebet atau alamat lainnya) atau kota selain Bandung! Kantor pusat resmi ACF Eduhub berada di BANDUNG (Jl. Jati Mulya No.9, Gumuruh, Kec. Batununggal, Kota Bandung, Jawa Barat 40275).
   - Jika pengguna menanyakan alamat kantor, lokasi kantor, kantor ACF di mana, kantor pusat di mana, atau kontak yayasan:
     LANGSUNG jawab dengan jelas bahwa Kantor Pusat ACF Eduhub beralamat di Jl. Jati Mulya No.9, Gumuruh, Kec. Batununggal, Kota Bandung, Jawa Barat 40275, sertakan link Google Maps [Buka di Google Maps](https://maps.app.goo.gl/GZM6nCS82CcettDcA) dan kontak di atas!
10. DATA & ATURAN 7 PROGRAM LAYANAN ACF EDUHUB (SANGAT PENTING):
    - JANGAN PERNAH menyamakan atau menukar antara "Program Layanan" dengan "Unit Pendidikan"!
    - Unit Pendidikan ACF Eduhub adalah 3 unit: Sekolah Juara (SD), Sekolah Daya Setara (PKBM), dan Guruverse.ID.
    - Sedangkan PROGRAM LAYANAN ACF Eduhub adalah 7 PROGRAM UNGGULAN yang dikelompokkan ke dalam 6 kategori induk:
      1. Program Beasiswa & Keberlanjutan Sekolah Juara (Divisi: Sekolah Juara)
         - Mendukung operasional & beasiswa 10 unit Sekolah Juara bagi anak dhuafa berprestasi.
      2. Kesejahteraan Guru & Operasional Sekolah Daya Setara (Divisi: Sekolah Daya Setara)
         - Kesejahteraan tutor & operasional 7 PKBM Daya Setara (Paket B, C, & vokasi kerja mandiri).
      3. Layanan Pascabencana (Divisi: Guruverse.ID & ACF Educare)
         - Respons psikososial anak & guru terdampak, sekolah darurat, serta bantuan dasar pangan/sandang/papan.
      4. Kesejahteraan Ekosistem Sekolah (Divisi: ACF Educare)
         - Dukungan terpadu bagi guru honorer, penjaga sekolah, & keluarga dhuafa sekitar sekolah.
      5. Bantuan Kemanusiaan Internasional (Divisi: ACF Educare)
         - Penyaluran bantuan pangan & kebutuhan darurat bagi anak-anak di wilayah krisis/konflik global (seperti Gaza).
      6. Education Outlook — Forum Tahunan Pendidikan (Divisi: Guruverse.ID)
         - Forum tahunan hybrid mempertemukan pembuat kebijakan, praktisi, & akademisi membahas arah tren pendidikan nasional.
      7. Konsultasi & Pendampingan Manajemen Sekolah (Divisi: Guruverse.ID)
         - Layanan konsultasi manajemen sekolah, strategi SPMB/PPDB, serta studi kelayakan pendirian unit pendidikan.
    - Jika pengguna menanyakan "program layanan", "program acf", "apa saja programnya", "program layanan ada apa aja", dsb:
      WAJIB menyebutkan daftar 7 Program Layanan di atas dengan nomor dan divisi terkait secara ramah dan ringkas, dan berikan tautan ke halaman [Program Layanan](program-layanan.html)!
      DILARANG KERAS hanya menjawab dengan mendeskripsikan Sekolah Juara atau Unit Pendidikan!
11. ATURAN RELAWAN:
    Jika ditanya cara daftar relawan, arahkan ke menu [Jadi Relawan](form-relawan.html) untuk bergabung dengan komunitas Sahabat Eduhub.
12. Selalu nyambung dengan pertanyaan apa pun, komunikatif, solutif, dan gunakan emoji yang pas.
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
    $reply = "📰 **Kabar & Artikel Terbaru ACF Eduhub**:\n\n" +
             "Ini dia artikel dan berita terhangat yang baru terbit di website nih, Sahabat Ceria:\n\n";

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

    $reply .= "Sahabat Ceria bisa membaca artikel lengkapnya dengan mengklik judul di atas atau langsung kunjungi halaman [Kabar](kabar.html) yaa! ✨";
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
            return "🎒 **Info Pendaftaran & Brosur SPMB {$s['name']}**:\n\n" .
                   "Siap Sahabat Ceria! Ini dia tautan pendaftaran online dan unduh brosur resmi buat **{$s['name']}** yaa:\n\n" .
                   "• 📝 **Formulir Pendaftaran**: [Klik Daftar Online {$s['name']}]({$s['daftar']})\n" .
                   "• 📖 **Brosur Sekolah**: [Buka & Unduh Brosur PDF]({$s['brosur']})\n\n" .
                   "Gampang kan? Sahabat Ceria juga bisa kepoin profil sekolahnya di halaman [Sekolah Juara](sekolah-juara.html). Kalau ada yang mau ditanyakan lagi soal biaya atau jadwal tesnya, chat admin di WhatsApp **+62 851-7979-7661** yaa! 😊";
        }
    }

    // Tampilkan 10 unit dengan tautan pendaftaran & brosur
    $reply = "🎒 **Link Pendaftaran & Brosur SPMB/PPDB Sekolah Juara (SD)**:\n\n" .
             "Halo Sahabat Ceria! Mau daftar di cabang mana nih? Yuk langsung klik link pendaftaran online atau unduh brosur resmi unit yang dituju di bawah ini:\n\n";

    $idx = 1;
    foreach ($schools as $s) {
        $reply .= "{$idx}. **{$s['name']}**\n" .
                  "   • 📝 [Daftar Online]({$s['daftar']}) | 📖 [Buka Brosur]({$s['brosur']})\n\n";
        $idx++;
    }

    $reply .= "Detail profil lengkap tiap unit bisa kamu lihat di menu [Sekolah Juara](sekolah-juara.html). Kalau ada yang bikin bingung, tanya Ceri-A lagi yaa! ✨";
    return $reply;
}

function getSmartFallbackReply($query) {
    $raw = trim($query);
    $q = mb_strtolower($raw);

    // 1. SAPAAN & PANGGILAN SANTAI / GAUL (RESPON SINGKAT & RAMAH TANPA MENYEBUT SEKOLAH JUARA DLL)
    $greetingsList = [
        'halo', 'hallo', 'hai', 'hi', 'hey', 'hei', 'uy', 'ui', 'oy', 'oi', 'woy', 'woi',
        'yoo', 'yo', 'bro', 'sis', 'min', 'mimin', 'admin', 'p', 'ping', 'tes', 'test', 'cek',
        'assalamualaikum', 'assalamu alaikum', 'sampurasun', 'punten', 'permisi', 'misi',
        'pagi', 'siang', 'sore', 'malam', 'selamat pagi', 'selamat siang', 'selamat sore', 'selamat malam',
        'ceri-a', 'ceri a', 'ceri', 'hai ceri-a', 'halo ceri-a', 'cherry', 'hai cherry', 'halo cherry', 'hei cherry', 'kuy', 'lur', 'gan', 'kak', 'kak admin'
    ];
    if (
        in_array($q, $greetingsList) ||
        preg_match('/^(halo+|hallo+|hai+|hey+|hei+|hi+|uy+|ui+|oy+|woy+|woi+|oi+|yo+|p+|ping|tes|test|ceri-a|ceri|assalamu[\'"`]?alaikum|selamat\s*(pagi|siang|sore|malam)|sampurasun|punten|permisi)(\s|[!.,?~]|$)/i', $q) ||
        mb_strlen($q) <= 5
    ) {
        return "Halo Sahabat Ceria! 👋 Ada yang bisa Ceri-A bantu hari ini? 😊";
    }

    // 2. TANYA KABAR & KEADAAN
    if (strpos($q, 'apa kabar') !== false || strpos($q, 'gimana kabar') !== false || strpos($q, 'sehat') !== false || strpos($q, 'lagi apa') !== false || strpos($q, 'lagi ngapain') !== false || strpos($q, 'kabar kamu') !== false || strpos($q, 'kabarmu') !== false) {
        return "Kabar Ceri-A luar biasa baik dan selalu ceria dong! ✨\n\nSahabat Ceria gimana kabarnya hari ini? Semoga selalu sehat, bahagia, dan harinya menyenangkan yaa. Ada info yang pengen kamu tanyain ke Ceri-A?";
    }

    // 3. CARA DONASI / METODE DONASI
    if (
        (strpos($q, 'cara') !== false || strpos($q, 'gimana') !== false || strpos($q, 'bagaimana') !== false || strpos($q, 'langkah') !== false || strpos($q, 'alur') !== false || strpos($q, 'mau') !== false || strpos($q, 'pengen') !== false || strpos($q, 'ingin') !== false || strpos($q, 'bisa') !== false || strpos($q, 'prosedur') !== false) &&
        (strpos($q, 'donasi') !== false || strpos($q, 'transfer') !== false || strpos($q, 'sedekah') !== false || strpos($q, 'infaq') !== false || strpos($q, 'rekening') !== false || strpos($q, 'bayar') !== false || strpos($q, 'nyumbang') !== false)
    ) {
        return "💖 **Cara Menyalurkan Donasi di ACF Eduhub**:\n\n" .
               "MasyaAllah, terima kasih banyak ya Sahabat Ceria atas niat mulianya! Kebaikan kamu sangat berarti buat masa depan anak-anak dhuafa. Caranya gampang banget:\n\n" .
               "1. Buka menu [Donasi](donasi.html) di website ini.\n" .
               "2. Pilih program yang pengen kamu dukung (misal: *Beasiswa Sekolah Juara*, *Nutrisi Siswa*, atau *Fasilitas Belajar*).\n" .
               "3. Masukkan nominal donasi dan isi data diri singkat.\n" .
               "4. Pilih metode pembayaran favoritmu (Transfer BCA, Mandiri, BRI, BSI, Virtual Account, atau scan QRIS via GoPay, OVO, ShopeePay, DANA).\n" .
               "5. Selesaikan pembayaran, dan tanda terima resmi donasi langsung dikirimkan.\n\n" .
               "Mau konfirmasi atau transfer manual? Bisa langsung chat admin WA kami di **+62 851-7979-7661** yaa. Berkah selalu buat kamu! 😊";
    }

    // 4. METODE PEMBAYARAN / REKENING
    if (
        strpos($q, 'rekening') !== false || strpos($q, 'no rek') !== false || strpos($q, 'nomor rekening') !== false ||
        ((strpos($q, 'bank') !== false || strpos($q, 'transfer') !== false || strpos($q, 'pembayaran') !== false || strpos($q, 'metode') !== false) && (strpos($q, 'donasi') !== false || strpos($q, 'bca') !== false || strpos($q, 'mandiri') !== false || strpos($q, 'bri') !== false || strpos($q, 'bsi') !== false || strpos($q, 'qris') !== false))
    ) {
        return "💳 **Metode Pembayaran & Rekening Donasi**:\n\n" .
               "Berdonasi di ACF Eduhub praktis banget lho Sahabat Ceria! Kamu bisa pilih cara yang paling nyaman:\n\n" .
               "• **QRIS Instan**: Tinggal scan pakai BCA Mobile, Livin Mandiri, GoPay, OVO, Dana, ShopeePay, atau LinkAja.\n" .
               "• **Transfer Bank**: Tersedia Bank Mandiri, BCA, BRI, dan BSI atas nama **Yayasan Amal Khair Yasmin / ACF Eduhub**.\n" .
               "• **Virtual Account (VA)**: Otomatis terverifikasi saat berdonasi di halaman [Donasi](donasi.html).\n\n" .
               "Butuh bantuan transfer atau konfirmasi kwitansi? Hubungi admin di WhatsApp **+62 851-7979-7661** yaa!";
    }

    // 5. KEAMANAN / LAPORAN AUDIT / WTP
    if (strpos($q, 'aman') !== false || strpos($q, 'terpercaya') !== false || strpos($q, 'audit') !== false || strpos($q, 'wtp') !== false || strpos($q, 'laporan keuangan') !== false || strpos($q, 'transparan') !== false || strpos($q, 'bukti donasi') !== false) {
        return "🛡️ **Donasi Sahabat Ceria 100% Aman & Terpercaya!**\n\n" .
               "Tenang aja ya Sahabat Ceria, ACF Eduhub adalah yayasan resmi berbadan hukum yang sudah berkiprah lebih dari 10 tahun. Laporan keuangan yayasan kami diaudit rutin oleh Kantor Akuntan Publik independen dan berhasil meraih predikat tertinggi **WTP (Wajar Tanpa Pengecualian)** sejak 2024.\n\n" .
               "Setiap rupiah donasi disalurkan tepat sasaran buat operasional sekolah gratis/subsidi, nutrisi siswa, dan fasilitas belajar anak-anak dhuafa.";
    }

    // 6. DONASI UMUM
    if ($q === 'donasi' || strpos($q, 'donasi') !== false || strpos($q, 'infaq') !== false || strpos($q, 'sedekah') !== false || strpos($q, 'donatur') !== false) {
        return "💖 **Aksi Kebaikan Bersama ACF Eduhub**:\n\n" .
               "Senang banget lihat kepedulian Sahabat Ceria! Kebaikan kamu adalah alasan ribuan anak-anak prasejahtera bisa terus tersenyum dan bersekolah.\n\n" .
               "Program kebaikan yang bisa kamu dukung nih:\n" .
               "• 🏫 **Beasiswa Binaan Kelas**: Subsidi sekolah anak dhuafa selama satu tahun penuh.\n" .
               "• 🍱 **Gizi & Nutrisi Siswa**: Sarapan sehat bergizi biar anak-anak fokus belajar.\n" .
               "• 📖 **Sarana Belajar & Vokasi**: Perlengkapan sekolah dan alat keterampilan mandiri.\n\n" .
               "Yuk salurkan kebaikanmu dengan mudah lewat menu [Donasi](donasi.html)! ✨";
    }

    // 7. INGIN BERTANYA / BANTU DONG
    if (
        strpos($q, 'mau tanya') !== false || strpos($q, 'tanya dong') !== false || strpos($q, 'mau nanya') !== false ||
        strpos($q, 'nanya dong') !== false || strpos($q, 'bisa tanya') !== false || strpos($q, 'bantu dong') !== false ||
        strpos($q, 'minta tolong') !== false || strpos($q, 'tolong dong') !== false || $q === 'tanya' || $q === 'bantu' || $q === 'info dong' || $q === 'mau info'
    ) {
        return "Boleh banget dong Sahabat Ceria! 😊 Silakan tanyakan apa aja yang pengen kamu tahu seputar Sekolah Juara (SD), pendaftaran PPDB, program layanan, relawan, atau donasi. Ceri-A siap jawabin satu-satu!";
    }

    // 8. BIAYA SEKOLAH JUARA & SEKOLAH DAYA SETARA
    if (strpos($q, 'biaya') !== false || strpos($q, 'bayar') !== false || strpos($q, 'gratis') !== false || strpos($q, 'spp') !== false || strpos($q, 'uang sekolah') !== false || strpos($q, 'uang gedung') !== false || strpos($q, 'tarif') !== false) {
        return "🏫 **Info Biaya Pendidikan (Sekolah Juara & Sekolah Daya Setara)**:\n\n" .
               "Mengenai biaya pendidikan di Sekolah Juara (SD) maupun PKBM Sekolah Daya Setara, biayanya sangat terjangkau ya Sahabat Ceria! 😊\n\n" .
               "Untuk mengetahui rincian lengkap mengenai biaya formulir pendaftaran, uang pangkal, SPP bulanan, maupun informasi program beasiswa di unit kota tujuanmu, Sahabat Ceria bisa langsung chat admin kami via WhatsApp di **+62 851-7979-7661** yaa!";
    }

    // 9. INFO PPDB, DAFTAR, DAN BROSUR SEKOLAH JUARA
    if (
        strpos($q, 'ppdb') !== false ||
        strpos($q, 'spmb') !== false ||
        strpos($q, 'brosur') !== false ||
        ((strpos($q, 'cara') !== false || strpos($q, 'gimana') !== false || strpos($q, 'syarat') !== false || strpos($q, 'langkah') !== false || strpos($q, 'alur') !== false || strpos($q, 'daftar') !== false || strpos($q, 'masuk') !== false) &&
         (strpos($q, 'sekolah') !== false || strpos($q, 'juara') !== false || strpos($q, 'siswa') !== false || strpos($q, 'anak') !== false || strpos($q, 'sd') !== false))
    ) {
        return getSekolahJuaraPpdbReply($raw);
    }

    // 10. CARA JADI MITRA PROGRAM / CSR
    if (
        (strpos($q, 'cara') !== false || strpos($q, 'gimana') !== false || strpos($q, 'syarat') !== false || strpos($q, 'langkah') !== false || strpos($q, 'mau') !== false || strpos($q, 'alur') !== false) &&
        (strpos($q, 'mitra') !== false || strpos($q, 'kerjasama') !== false || strpos($q, 'kolaborasi') !== false || strpos($q, 'csr') !== false || strpos($q, 'sponsor') !== false || strpos($q, 'perusahaan') !== false)
    ) {
        return "🤝 **Kemitraan CSR & Kolaborasi Program**:\n\n" .
               "Wah, kami terbuka banget buat berkolaborasi dengan perusahaan atau komunitas Sahabat Ceria! Caranya simpel kok:\n\n" .
               "1. Masuk ke halaman [Jadi Mitra Program](form-mitra.html).\n" .
               "2. Isi profil singkat perusahaan/lembaga dan pilih program yang diminati (Beasiswa Kelas, Green School, Sarana Belajar, dll).\n" .
               "3. Kirim formulirnya.\n" .
               "4. Tim Partnership ACF Eduhub bakal langsung menghubungi PIC kamu buat diskusi proposal dan sinergi bersama.\n\n" .
               "Mau ngobrol langsung? Email kami di **welcome@acf.or.id** atau chat WA di **+62 851-7979-7661** ya!";
    }

    // 11. CARA JADI RELAWAN (SAHABAT EDUHUB)
    if (
        strpos($q, 'relawan') !== false ||
        strpos($q, 'volunteer') !== false ||
        (strpos($q, 'sahabat') !== false && (strpos($q, 'eduhub') !== false || strpos($q, 'daftar') !== false || strpos($q, 'gabung') !== false))
    ) {
        return "🙋‍♀️ **Yuk Gabung Jadi Relawan (Sahabat Eduhub)!**\n\n" .
               "Keren banget niat baik Sahabat Ceria! Bareng komunitas Sahabat Eduhub, kamu bisa berbagi inspirasi dan senyuman buat adik-adik di seluruh Indonesia. Caranya gampang:\n\n" .
               "1. Buka formulir di halaman [Jadi Relawan](form-relawan.html).\n" .
               "2. Isi data diri kamu dan pilih bidang yang paling cocok sama minatmu:\n" .
               "   • *Relawan Pengajar / Tutor*\n" .
               "   • *Fasilitator Kegiatan & Event*\n" .
               "   • *Dokumentasi, Foto, & Desain Konten*\n" .
               "   • *Mentor Inspiratif & Karakter*\n" .
               "3. Kirim pendaftaran, dan tim kami bakal ngajak kamu ke sesi orientasi komunitas yang seru!\n\n" .
               "Yuk bareng Ceri-A jadi bagian dari perubahan positif! ✨";
    }

    // 12. DAFTAR LOKASI, DAERAH & SEBARAN 10 UNIT SEKOLAH JUARA
    if (
        (strpos($q, 'daerah') !== false || strpos($q, 'dimana') !== false || strpos($q, 'di mana') !== false || strpos($q, 'mana saja') !== false || strpos($q, 'mana aja') !== false || strpos($q, 'lokasi') !== false || strpos($q, 'kota') !== false || strpos($q, 'wilayah') !== false || strpos($q, 'tempat') !== false || strpos($q, 'sebaran') !== false || strpos($q, 'cabang') !== false || strpos($q, 'tersebar') !== false || strpos($q, 'alamat') !== false || strpos($q, 'daftar') !== false || strpos($q, 'berapa') !== false || strpos($q, 'da berapa') !== false || strpos($q, 'jumlah') !== false || strpos($q, 'total') !== false) &&
        (strpos($q, 'sekolah') !== false || strpos($q, 'juara') !== false || strpos($q, 'sd') !== false)
    ) {
        return "🏫 **Daftar 10 Unit Sekolah Dasar (SD Juara)**:\n\n" .
               "Fyi nih Sahabat Ceria, Sekolah Juara punya 10 unit yang tersebar di berbagai kota di Indonesia, dan seluruhnya adalah jenjang SD:\n\n" .
               "1. SD Juara Batam\n" .
               "2. SD Juara Cilegon\n" .
               "3. SD Juara Jakarta Barat\n" .
               "4. SD Juara Jakarta Timur\n" .
               "5. SD Juara Jakarta Utara\n" .
               "6. SD Juara Persa Medan\n" .
               "7. SD Juara AL Hikmah Jayapura\n" .
               "8. SD Juara Semarang\n" .
               "9. SD Juara Surabaya\n" .
               "10. SD Juara AL Hakim Tangerang\n\n" .
               "Sahabat Ceria bisa cek info pendaftaran & unduh brosur masing-masing unit di halaman [Sekolah Juara](sekolah-juara.html) yaa!";
    }

    // 12.5 SEBARAN & LOKASI SEKOLAH DAYA SETARA (PKBM CERIA)
    if (
        strpos($q, 'daya setara') !== false ||
        strpos($q, 'pkbm') !== false ||
        (strpos($q, 'setara') !== false && (strpos($q, 'sekolah') !== false || strpos($q, 'bandung') !== false || strpos($q, 'lokasi') !== false || strpos($q, 'cabang') !== false))
    ) {
        if (
            strpos($q, 'bandung') !== false ||
            strpos($q, 'lembang') !== false ||
            strpos($q, 'ngamprah') !== false ||
            strpos($q, 'ujungberung') !== false ||
            strpos($q, 'ujung berung') !== false
        ) {
            return "🏫 **Sekolah Daya Setara di Bandung Raya**:\n\n" .
                   "Di wilayah Bandung Raya, Sekolah Daya Setara (PKBM Ceria) memiliki **3 unit/cabang** nih, Sahabat Ceria:\n\n" .
                   "1. 📍 **Sekolah Daya Setara Ngamprah** (Kab. Bandung Barat)\n" .
                   "2. 📍 **Sekolah Daya Setara Lembang** (Kab. Bandung Barat)\n" .
                   "3. 📍 **Sekolah Daya Setara Ujungberung** (Kota Bandung)\n\n" .
                   "Ketiga unit ini melayani pendidikan kesetaraan Paket B (setara SMP) dan Paket C (setara SMA) serta pelatihan vokasi siap kerja dengan sistem belajar yang fleksibel.\n\n" .
                   "Sahabat Ceria juga bisa melihat dokumentasi dan peta sebarannya di halaman [Sekolah Daya Setara](sekolah-daya-setara.html), atau kalau mau info pendaftaran bisa langsung kontak admin di WhatsApp **+62 851-7979-7661** yaa! 😊";
        }

        if (
            strpos($q, 'sukabumi') !== false ||
            strpos($q, 'cisolok') !== false
        ) {
            return "🏫 **Sekolah Daya Setara di Sukabumi**:\n\n" .
                   "Untuk wilayah Sukabumi, unit kami adalah **Sekolah Daya Setara Cisolok** yang melayani program kesetaraan Paket B dan C serta vokasi mandiri.\n\n" .
                   "Sahabat Ceria bisa cek info lengkapnya di halaman [Sekolah Daya Setara](sekolah-daya-setara.html) yaa! ✨";
        }

        if (
            strpos($q, 'indramayu') !== false ||
            strpos($q, 'arahan') !== false
        ) {
            return "🏫 **Sekolah Daya Setara di Indramayu**:\n\n" .
                   "Untuk wilayah Indramayu, unit kami adalah **PKBM Ceria Arahan** yang melayani program kesetaraan Paket B dan C serta vokasi mandiri.\n\n" .
                   "Sahabat Ceria bisa cek info lengkapnya di halaman [Sekolah Daya Setara](sekolah-daya-setara.html) yaa! ✨";
        }

        if (
            strpos($q, 'pangandaran') !== false ||
            strpos($q, 'padaherang') !== false
        ) {
            return "🏫 **Sekolah Daya Setara di Pangandaran**:\n\n" .
                   "Untuk wilayah Pangandaran, unit kami adalah **PKBM Ceria Padaherang** yang melayani program kesetaraan Paket B dan C serta vokasi mandiri.\n\n" .
                   "Sahabat Ceria bisa cek info lengkapnya di halaman [Sekolah Daya Setara](sekolah-daya-setara.html) yaa! ✨";
        }

        if (
            strpos($q, 'jayapura') !== false ||
            strpos($q, 'papua') !== false
        ) {
            return "🏫 **Sekolah Daya Setara di Jayapura**:\n\n" .
                   "Untuk wilayah Jayapura (Papua), unit kami adalah **Sekolah Daya Setara Jayapura** yang melayani program kesetaraan Paket B dan C serta vokasi mandiri.\n\n" .
                   "Sahabat Ceria bisa cek info lengkapnya di halaman [Sekolah Daya Setara](sekolah-daya-setara.html) yaa! ✨";
        }

        if (
            strpos($q, 'dimana') !== false ||
            strpos($q, 'di mana') !== false ||
            strpos($q, 'lokasi') !== false ||
            strpos($q, 'cabang') !== false ||
            strpos($q, 'daerah') !== false ||
            strpos($q, 'wilayah') !== false ||
            strpos($q, 'sebaran') !== false ||
            strpos($q, 'kota') !== false ||
            strpos($q, 'berapa') !== false ||
            strpos($q, 'da berapa') !== false ||
            strpos($q, 'jumlah') !== false ||
            strpos($q, 'total') !== false ||
            strpos($q, 'titik') !== false ||
            strpos($q, 'mana aja') !== false ||
            strpos($q, 'mana saja') !== false
        ) {
            return "🗺️ **Peta Sebaran 7 Unit Sekolah Daya Setara (PKBM Ceria)**:\n\n" .
                   "Sekolah Daya Setara hadir di **7 titik/unit** di Indonesia untuk memperluas akses pendidikan kesetaraan dan vokasi mandiri nih, Sahabat Ceria:\n\n" .
                   "• **Bandung Raya (3 Unit)**:\n" .
                   "  1. 📍 **Sekolah Daya Setara Ngamprah** (Kab. Bandung Barat)\n" .
                   "  2. 📍 **Sekolah Daya Setara Lembang** (Kab. Bandung Barat)\n" .
                   "  3. 📍 **Sekolah Daya Setara Ujungberung** (Kota Bandung)\n\n" .
                   "• **Sukabumi (1 Unit)**:\n" .
                   "  4. 📍 **Sekolah Daya Setara Cisolok**\n\n" .
                   "• **Indramayu (1 Unit)**:\n" .
                   "  5. 📍 **PKBM Ceria Arahan**\n\n" .
                   "• **Pangandaran (1 Unit)**:\n" .
                   "  6. 📍 **PKBM Ceria Padaherang**\n\n" .
                   "• **Jayapura (1 Unit)**:\n" .
                   "  7. 📍 **Sekolah Daya Setara Jayapura**\n\n" .
                   "Semua unit siap memfasilitasi Paket B (setara SMP) dan Paket C (setara SMA) serta keterampilan kerja. Info lengkapnya bisa dicek di halaman [Sekolah Daya Setara](sekolah-daya-setara.html) yaa! ✨";
        }
    }

    // 13. KOTA TERTENTU (Bandung, Jakarta, dll)
    if (strpos($q, 'bandung') !== false) {
        return "📍 Buat Sahabat Ceria yang ada di Bandung, **Kantor Pusat ACF Eduhub** beralamat di:\n\n" .
               "🏢 **Alamat**: Jl. Jati Mulya No.9, Gumuruh, Kec. Batununggal, Kota Bandung, Jawa Barat 40275\n" .
               "🗺️ **Google Maps**: [Buka di Google Maps](https://maps.app.goo.gl/GZM6nCS82CcettDcA)\n" .
               "📞 **WhatsApp**: +62 851-7979-7661\n\n" .
               "Selain kantor pusat, di Bandung Raya kami juga memiliki 3 unit **Sekolah Daya Setara (PKBM Ceria)** yaitu di Ngamprah, Lembang, dan Ujungberung lho! Ada yang bisa Ceri-A bantu? 😊";
    }
    if (strpos($q, 'jakarta') !== false) {
        return "🏫 Di wilayah DKI Jakarta ada 3 unit SD Juara nih Sahabat Ceria:\n• **SD Juara Jakarta Barat**\n• **SD Juara Jakarta Timur**\n• **SD Juara Jakarta Utara**\n\nKamu bisa langsung daftar atau unduh brosurnya di menu [Sekolah Juara](sekolah-juara.html)!";
    }

    // 14. JENJANG PENDIDIKAN
    if (
        (strpos($q, 'jenjang') !== false || strpos($q, 'tingkat') !== false || strpos($q, 'smp') !== false || strpos($q, 'smk') !== false || strpos($q, 'sma') !== false || strpos($q, 'kelas') !== false || strpos($q, 'hanya sd') !== false || strpos($q, 'cuma sd') !== false) &&
        (strpos($q, 'sekolah') !== false || strpos($q, 'juara') !== false || strpos($q, 'pendidikan') !== false)
    ) {
        return "ℹ️ **Jenjang Pendidikan di Sekolah Juara**:\n\n" .
               "Perlu diingat ya Sahabat Ceria, Sekolah Juara **HANYA ada jenjang Sekolah Dasar (SD)** yaitu 10 unit SD Juara.\n\n" .
               "Di Sekolah Juara **tidak ada jenjang SMP maupun SMA/SMK**. Tapi kalau Sahabat Ceria butuh pendidikan kesetaraan lanjutan (setara SMP/Paket B dan setara SMA/Paket C serta keahlian vokasi kerja mandiri), ACF Eduhub memfasilitasinya lewat unit **PKBM Sekolah Daya Setara**!";
    }

    // 15. APA ITU SEKOLAH JUARA
    if ($q === 'sekolah juara' || $q === 'sd juara' || ((strpos($q, 'sekolah juara') !== false || strpos($q, 'sd juara') !== false || strpos($q, 'juara') !== false) && (strpos($q, 'apa') !== false || strpos($q, 'tentang') !== false || strpos($q, 'maksud') !== false || strpos($q, 'profil') !== false || strpos($q, 'penjelasan') !== false || strpos($q, 'definisi') !== false || strpos($q, 'arti') !== false || strpos($q, 'info') !== false || strpos($q, 'informasi') !== false))) {
        return "🏆 **Mengenal Sekolah Juara**:\n\n" .
               "Sekolah Juara adalah jaringan 10 unit **Sekolah Dasar (SD Juara)** binaan ACF Eduhub yang mendidik generasi berprestasi dan berakhlak mulia.\n\n" .
               "Di sini kurikulum nasional dipadukan dengan pembinaan karakter islami lewat Kurikulum Langit, kepemimpinan (*leadership*), kewirausahaan cilik, dan hafalan Al-Qur'an (tahfidz). Keren kan, Sahabat Ceria?";
    }

    // 16. APA ITU SEKOLAH DAYA SETARA
    if (strpos($q, 'daya setara') !== false || strpos($q, 'pkbm') !== false || strpos($q, 'kejar paket') !== false || strpos($q, 'paket c') !== false || strpos($q, 'paket b') !== false || strpos($q, 'kesetaraan') !== false) {
        return "📖 **Mengenal Sekolah Daya Setara (PKBM)**:\n\n" .
               "Sekolah Daya Setara adalah 7 unit Pusat Kegiatan Belajar Masyarakat (PKBM) non-formal binaan ACF Eduhub buat jenjang **Paket B (setara SMP)** dan **Paket C (setara SMA)** serta vokasi mandiri dengan biaya terjangkau.\n\n" .
               "Sekolah Daya Setara tersebar di 7 titik di Indonesia, yaitu **Bandung Raya (Ngamprah, Lembang, Ujungberung)**, Sukabumi (Cisolok), Indramayu (Arahan), Pangandaran (Padaherang), dan Jayapura.\n\n" .
               "Program ini hadir buat ngebantu anak-anak putus sekolah dan masyarakat umum biar bisa dapet ijazah resmi negara dan keterampilan kerja mandiri lho, Sahabat Ceria! Info selengkapnya ada di menu [Sekolah Daya Setara](sekolah-daya-setara.html) yaa!";
    }

    // 17. APA ITU GURUVERSE.ID
    if (strpos($q, 'guruverse') !== false || (strpos($q, 'guru') !== false && (strpos($q, 'pelatihan') !== false || strpos($q, 'training') !== false || strpos($q, 'kompetensi') !== false))) {
        return "👩‍🏫 **Mengenal Guruverse.ID**:\n\n" .
               "Guruverse.ID adalah platform keren dari ACF Eduhub buat ningkatin kapasitas para guru di seluruh Indonesia! Sampai sekarang udah ada lebih dari **2.000+ guru** yang ikut pelatihan metode belajar kreatif, teknologi kelas, dan pedagogik modern bareng kami, Sahabat Ceria.";
    }

    // 18. PROGRAM LAYANAN ACF EDUHUB
    if (strpos($q, 'program') !== false || strpos($q, 'layanan') !== false || strpos($q, 'pilar') !== false || strpos($q, 'kegiatan') !== false) {
        return "📚 **Program Layanan ACF Eduhub (7 Program Aktif)**:\n\n" .
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
               "Sahabat Ceria bisa pelajari detail lengkapnya di menu [Program Layanan](program-layanan.html) yaa!";
    }

    // 19. BEASISWA & DHUAFA
    if (strpos($q, 'beasiswa') !== false || strpos($q, 'dhuafa') !== false || strpos($q, 'yatim') !== false || strpos($q, 'keringanan') !== false) {
        return "🎓 **Program Beasiswa ACF Eduhub**:\n\n" .
               "Kabar baik buat Sahabat Ceria! ACF Eduhub punya program subsidi dan beasiswa khusus bagi anak-anak yatim dan keluarga prasejahtera berprestasi di Sekolah Juara maupun PKBM Daya Setara.\n\n" .
               "Buat kepoin kuota beasiswa di unit kota tujuanmu, langsung hubungi admin WA kami di **+62 851-7979-7661** yaa!";
    }

    // 20. LOKASI & ALAMAT KANTOR
    if (strpos($q, 'alamat') !== false || strpos($q, 'lokasi') !== false || strpos($q, 'kantor') !== false || strpos($q, 'pusat') !== false || strpos($q, 'dimana') !== false) {
        return "📍 **Alamat Kantor Pusat ACF Eduhub**:\n\n" .
               "🏢 **Kantor Pusat**: Jl. Jati Mulya No.9, Gumuruh, Kec. Batununggal, Kota Bandung, Jawa Barat 40275\n\n" .
               "🗺️ **Google Maps**: [Buka di Google Maps](https://maps.app.goo.gl/GZM6nCS82CcettDcA)\n" .
               "📞 **WhatsApp / Telepon**: +62 851-7979-7661\n" .
               "✉️ **Email**: welcome@acf.or.id\n\n" .
               "Informasi alamat ini juga tertera di footer website kami ya, Sahabat Ceria. Kalau kamu lagi di Bandung dan mau bersilaturahmi langsung, pintu kami selalu terbuka lebar! 😊";
    }

    // 21. KONTAK & WA
    if (strpos($q, 'kontak') !== false || strpos($q, 'telepon') !== false || strpos($q, 'wa') !== false || strpos($q, 'whatsapp') !== false || strpos($q, 'email') !== false || strpos($q, 'admin') !== false) {
        return "📞 **Kontak Resmi ACF Eduhub**:\n\n" .
               "Sahabat Ceria bisa menghubungi tim kami kapan aja lewat saluran berikut:\n\n" .
               "• **WhatsApp / Telepon**: +62 851-7979-7661 (ada tombol hijau WA di pojok kiri bawah layar)\n" .
               "• **Email**: welcome@acf.or.id\n" .
               "• **Instagram**: @acf.eduhub\n" .
               "• **YouTube**: JUARA TV\n" .
               "• **Website**: www.acf.or.id\n\n" .
               "Kami siap menyapa dan melayani kamu di jam operasional kerja yaa!";
    }

    // 22. ARTIKEL & KABAR TERKINI
    if (
        strpos($q, 'artikel') !== false ||
        strpos($q, 'berita') !== false ||
        strpos($q, 'liputan') !== false ||
        strpos($q, 'publikasi') !== false ||
        $q === 'kabar' ||
        (strpos($q, 'kabar') !== false && strpos($q, 'apa kabar') === false && strpos($q, 'gimana kabar') === false && strpos($q, 'kabar baik') === false)
    ) {
        return formatArticlesReply(4);
    }

    // 23. UCAPAN TERIMA KASIH & APRESIASI
    if (strpos($q, 'terima kasih') !== false || strpos($q, 'makasih') !== false || strpos($q, 'thanks') !== false || strpos($q, 'nuhun') !== false || strpos($q, 'thank you') !== false) {
        return "Sama-sama Sahabat Ceria! Senang banget bisa ngebantu kamu hari ini. 😊 Semoga harimu selalu menyenangkan dan penuh berkah ya! Kalau butuh info apa-apa lagi, panggil Ceri-A kapan aja yaa!";
    }

    // 24. PUJIAN & PERCAKAPAN POSITIF
    if (strpos($q, 'pintar') !== false || strpos($q, 'keren') !== false || strpos($q, 'hebat') !== false || strpos($q, 'bagus') !== false || strpos($q, 'mantap') !== false || strpos($q, 'top') !== false) {
        return "Wahh, makasih banyak yaa atas pujiannya Sahabat Ceria! Jadi makin semangat nih nemenin kamu. 😄 Ada yang pengen kamu tanyain lagi seputar ACF Eduhub?";
    }

    // 25. AFIRMASI
    if (preg_match('/^(oke+|ok|siap|baik|mantap|sip|yoi|keren|siip)(\s|[!.,?~]|$)/i', $q) || in_array($q, ['oke', 'ok', 'siap'])) {
        return "Siaap Sahabat Ceria! Senang bisa nemenin kamu di website ini. Kalau ada yang bikin penasaran lagi, langsung chat Ceri-A yaa! ✨";
    }

    // 26. HUMOR & SANTAI
    if (strpos($q, 'wkwk') !== false || strpos($q, 'haha') !== false || strpos($q, 'hehe') !== false || strpos($q, 'xixi') !== false || strpos($q, 'canda') !== false || strpos($q, 'gabut') !== false) {
        return "Hehe! Senang bisa ngobrol santai sama Sahabat Ceria. 😄 Selain asyik diajak ngobrol, Ceri-A juga jago lho cariin info soal sekolah, donasi, atau relawan. Ada yang pengen kamu kepoin?";
    }

    // 27. KELUHAN / BINGUNG
    if (strpos($q, 'bingung') !== false || strpos($q, 'ga paham') !== false || strpos($q, 'gak paham') !== false || strpos($q, 'ga ngerti') !== false || strpos($q, 'gak ngerti') !== false || strpos($q, 'pusing') !== false) {
        return "Tenang aja ya Sahabat Ceria, jangan bingung-bingung. Ceri-A bantu pelan-pelan kok! 😊 Kamu bisa klik tombol menu cepat di bawah ini, atau ceritain bagian mana yang pengen Ceri-A jelasin lagi?";
    }

    // 28. SIAPA KAMU / CERI-A
    if (strpos($q, 'siapa') !== false || strpos($q, 'nama') !== false || strpos($q, 'bot') !== false || strpos($q, 'cherry') !== false) {
        return "Halo Sahabat Ceria! 😊 Kenalin, aku **Ceri-A**, asisten virtual AI resmi yang ceria dan ramah dari **ACF Eduhub**! Warna kebanggaanku ungu dan kuning emas khas ACF. Tugas Ceri-A ngebantuin kamu cari info soal Sekolah Juara, donasi beasiswa, kegiatan relawan, dan kontak kami.";
    }

    // 29. PERTANYAAN EKSPLORATIF (apakah, kenapa, bagaimana, kapan, siapa)
    if (strpos($q, '?') !== false || strpos($q, 'apakah') !== false || strpos($q, 'gimana') !== false || strpos($q, 'kenapa') !== false || strpos($q, 'bagaimana') !== false || strpos($q, 'kapan') !== false) {
        return "Pertanyaan yang bagus banget nih, Sahabat Ceria! Soal hal itu, Ceri-A siap bantu cariin info paling pas di ACF Eduhub. Apakah ini terkait **pendaftaran sekolah**, **kegiatan siswa**, atau **donasi**? 😊\n\nKamu juga bisa langsung ngobrol sama admin kami via WhatsApp di **+62 851-7979-7661** biar dibantu lebih detail yaa!";
    }

    // 30. DEFAULT NATURAL NYAMBUNG
    return "Terima kasih udah nyapa Ceri-A ya, Sahabat Ceria! 😊\n\n" +
           "Biar makin gampang, kamu bisa pilih topik yang pengen kamu ketahui nih:\n\n" +
           "• 🏫 **Sekolah Juara (SD)**: Info pendaftaran & brosur 10 cabang unit\n" +
           "• 📖 **Sekolah Daya Setara (PKBM)**: Paket B & C serta pelatihan vokasi\n" +
           "• 📚 **Program Layanan**: 7 program pendidikan unggulan yayasan\n" +
           "• 🙋‍♀️ **Jadi Relawan**: Gabung bareng komunitas Sahabat Eduhub\n" +
           "• 💖 **Cara Donasi**: Rekening transfer & QRIS resmi yayasan\n" +
           "• 📍 **Kontak & Lokasi**: WhatsApp admin & alamat kantor pusat\n\n" +
           "Atau kamu juga bisa langsung ngobrol santai sama admin via WhatsApp di **+62 851-7979-7661**! ✨";
}

// Cek respon cepat (Instant Response) untuk sapaan langsung agar tidak perlu menunggu
$qFast = mb_strtolower($userMessage);
$fastGreetings = [
    'halo', 'hallo', 'hai', 'hi', 'hey', 'hei', 'uy', 'ui', 'oy', 'oi', 'woy', 'woi',
    'yoo', 'yo', 'bro', 'sis', 'min', 'mimin', 'admin', 'p', 'ping', 'tes', 'test', 'cek',
    'assalamualaikum', 'assalamu alaikum', 'sampurasun', 'punten', 'permisi', 'misi',
    'pagi', 'siang', 'sore', 'malam', 'selamat pagi', 'selamat siang', 'selamat sore', 'selamat malam',
    'ceri-a', 'ceri a', 'ceri', 'hai ceri-a', 'halo ceri-a', 'cherry', 'hai cherry', 'halo cherry', 'hei cherry', 'kuy', 'lur', 'gan', 'kak', 'kak admin'
];

if (
    strpos($qFast, '?') === false &&
    !preg_match('/\b(siapa|apa|kenapa|mengapa|bagaimana|gimana|kapan|dimana|di mana|berapa|tanya|bantu|biaya|daftar|program|sekolah)\b/i', $qFast) &&
    (
        in_array($qFast, $fastGreetings) ||
        preg_match('/^(halo+|hallo+|hai+|hey+|hei+|hi+|uy+|ui+|oy+|woy+|woi+|oi+|yo+|p+|ping|tes|test|ceri-a|ceri|assalamu[\'"`]?alaikum|selamat\s*(pagi|siang|sore|malam)|sampurasun|punten|permisi)[\s!.,~]*$/i', $qFast) ||
        mb_strlen($qFast) <= 4
    )
) {
    echo json_encode([
        'status' => 'success',
        'reply' => "Halo Sahabat Ceria! 👋 Ada yang bisa Ceri-A bantu hari ini? 😊",
        'mode' => 'instant_greeting'
    ]);
    exit();
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
        'system_instruction' => [
            'parts' => [
                ['text' => $systemPrompt]
            ]
        ],
        'contents' => $contents,
        'generationConfig' => [
            'temperature' => 0.7,
            'maxOutputTokens' => 800,
            'thinkingConfig' => [
                'thinkingBudget' => 0
            ]
        ]
    ];

    $candidateModels = [
        'gemini-3.1-flash-lite',
        'gemini-3.5-flash'
    ];

    $geminiSuccess = false;
    foreach ($candidateModels as $modelCandidate) {
        $url = 'https://generativelanguage.googleapis.com/v1beta/models/' . $modelCandidate . ':generateContent?key=' . urlencode($apiKey);
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json'
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 7);
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
                    'model' => $modelCandidate
                ]);
                exit();
            }
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
