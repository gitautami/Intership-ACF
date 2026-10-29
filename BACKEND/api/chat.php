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
- Yayasan sosial pendidikan yang sudah 10+ tahun berdedikasi memutus rantai kemiskinan di Indonesia melalui pendidikan gratis & berkualitas bagi dhuafa.
- Mengelola 17 Unit Pendidikan Aktif: 10 Sekolah Juara (HANYA jenjang Sekolah Dasar / SD Juara bebas biaya 100% untuk yatim & dhuafa prasejahtera, TIDAK ADA SMP atau SMA/SMK di Sekolah Juara) dan 7 PKBM Sekolah Daya Setara (pendidikan kesetaraan Paket A, B, C dan vokasi mandiri).
- PENTING: Jika pengguna menanyakan tentang jenjang atau tingkat Sekolah Juara, tegaskan bahwa Sekolah Juara HANYA ada jenjang SD (Sekolah Dasar). Jenjang lanjutan SMP dan SMA dikelola melalui unit PKBM Sekolah Daya Setara (Paket B dan Paket C).
- Mengelola Guruverse.ID (pelatihan 2.000+ guru di berbagai penjuru Indonesia).
- 4 Pilar Program: Keberlanjutan Unit Pendidikan, Pemberdayaan Berbasis Sekolah, Kemanusiaan Internasional, dan Bantuan Langsung Berkelanjutan.
- Kantor Pusat: Jl. Jati Mulya No.9, Gumuruh, Kec. Batununggal, Kota Bandung, Jawa Barat 40275.
- Kontak WA/Telepon: +62 851-7979-7661 | Email: welcome@acf.or.id.
- Akuntabilitas: Opini audit Wajar Tanpa Pengecualian (WTP) sejak 2024.

Gaya Komunikasi:
- Berbicaralah dengan sangat ramah, hangat, komunikatif, solutif, dan NYAMBUNG dengan pertanyaan pengguna.
- Jika pengguna bertanya 'cara donasi', berikan langkah-langkah praktis dan metode transfernya.
- Jika pengguna bertanya biaya sekolah, tegaskan bahwa Sekolah Juara 100% GRATIS untuk yatim dan dhuafa.
- Format teks dengan rapi dan gunakan emoji yang pas.
EOT;

// Local Knowledge Fallback Engine
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
               "Setiap dana disalurkan langsung untuk operasional sekolah gratis, beasiswa, dan nutrisi siswa prasejahtera.";
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
        return "Boleh banget! Mau tanya tentang apa nih? 😊\n\nSilakan langsung ketik pertanyaannya, Cherry siap bantu jelaskan seputar:\n" .
               "• 🏫 Sekolah Juara (biaya gratis 100%, syarat daftar, kurikulum)\n" .
               "• 💖 Cara Donasi & metode transfer\n" .
               "• 🤝 Cara jadi Mitra CSR atau Relawan\n" .
               "• 📍 Alamat kantor pusat Bandung & kontak WhatsApp admin";
    }

    // 6. SAPAAN / GREETINGS
    if (
        preg_match('/^(halo+|hallo+|hai+|hey+|hei+|hi+|p|tes|test|assalamu[\'"`]?alaikum|selamat\s*(pagi|siang|sore|malam)|sampurasun|punten|permisi)(\s|[!.,?~]|$)/i', $q) ||
        in_array($q, ['halo', 'hallo', 'hai', 'hi', 'hey', 'hei', 'p'])
    ) {
        return "Halo! 👋 Senang bisa menyapa Anda. Saya **Cherry**, asisten virtual resmi ACF Eduhub.\n\nAda yang bisa Cherry bantu seputar Sekolah Juara yang gratis, cara donasi, program beasiswa, atau informasi lainnya hari ini? 😊";
    }

    // 7. BIAYA SEKOLAH / APAKAH GRATIS?
    if (strpos($q, 'biaya') !== false || strpos($q, 'bayar') !== false || strpos($q, 'gratis') !== false || strpos($q, 'spp') !== false || strpos($q, 'uang sekolah') !== false || strpos($q, 'uang gedung') !== false || strpos($q, 'tarif') !== false) {
        return "✨ **Pendidikan di Sekolah Juara 100% GRATIS!**\n\n" .
               "Anak-anak yatim dan dhuafa tidak dipungut biaya sepeser pun, bebas dari uang SPP bulanan, uang gedung/pangkal, seragam, sepatu, hingga buku pelajaran dan nutrisi sarapan.\n\n" .
               "Seluruh biaya didanai penuh oleh beasiswa ACF Eduhub berkat dukungan para donatur dan mitra program kami.";
    }

    // 8. CARA DAFTAR SEKOLAH JUARA / SYARAT MASUK / PPDB
    if (
        (strpos($q, 'cara') !== false || strpos($q, 'gimana') !== false || strpos($q, 'syarat') !== false || strpos($q, 'daftar') !== false || strpos($q, 'masuk') !== false || strpos($q, 'ppdb') !== false) &&
        (strpos($q, 'sekolah') !== false || strpos($q, 'juara') !== false || strpos($q, 'siswa') !== false || strpos($q, 'anak') !== false)
    ) {
        return "📝 **Cara & Syarat Pendaftaran Siswa Sekolah Juara (100% Gratis)**:\n\n" .
               "**1. Kriteria Calon Siswa**:\n" .
               "• Anak yatim, piatu, atau berasal dari keluarga dhuafa prasejahtera.\n" .
               "• Memiliki semangat tinggi untuk belajar.\n\n" .
               "**2. Dokumen Persyaratan**:\n" .
               "• Surat Keterangan Tidak Mampu (SKTM) dari Kelurahan/Desa.\n" .
               "• Fotokopi Kartu Keluarga (KK) dan Akta Kelahiran anak.\n" .
               "• Rapor/ijazah jenjang sebelumnya.\n\n" .
               "**3. Alur Pendaftaran**:\n" .
               "• Isi formulir pendaftaran di unit Sekolah Juara terdekat.\n" .
               "• Verifikasi berkas & survei kunjungan rumah (*home visit*).\n" .
               "• Pengumuman kelulusan beasiswa pendidikan penuh.\n\n" .
               "Untuk info jadwal PPDB terkini di cabang kota Anda, silakan hubungi narahubung kami di WhatsApp **+62 851-7979-7661** ya!";
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
               "4. Tim Partnership ACF Eduhub akan menghubungi PIC Anda dalam 1x24 jam untuk diskusi proposal dan sinergi bersama.\n\n" .
               "Ingin berdiskusi langsung? Hubungi email kemitraan di **welcome@acf.or.id** atau WA di **+62 851-7979-7661**.";
    }

    // 10. CARA JADI RELAWAN (SAHABAT EDUHUB)
    if (
        (strpos($q, 'cara') !== false || strpos($q, 'gimana') !== false || strpos($q, 'syarat') !== false || strpos($q, 'daftar') !== false || strpos($q, 'gabung') !== false) &&
        (strpos($q, 'relawan') !== false || strpos($q, 'volunteer') !== false || strpos($q, 'sahabat') !== false)
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
        (strpos($q, 'berapa') !== false || strpos($q, 'da berapa') !== false || strpos($q, 'jumlah') !== false || strpos($q, 'total') !== false || strpos($q, 'sebaran') !== false || strpos($q, 'cabang') !== false) &&
        (strpos($q, 'sekolah') !== false || strpos($q, 'juara') !== false || strpos($q, 'sd') !== false)
    ) {
        return "🏫 **Sekolah Juara memiliki total 10 unit**, dan seluruhnya adalah jenjang **Sekolah Dasar (SD Juara)** yang 100% GRATIS untuk anak-anak yatim dan dhuafa:\n\n" .
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
               "*(Catatan: Sekolah Juara HANYA ada jenjang SD saja. Untuk jenjang lanjutan seperti setara SMP & SMA dilayani melalui unit PKBM Sekolah Daya Setara).*";
    }

    // 10.6 JENJANG / TINGKAT / SMP / SMK / HANYA SD
    if (
        (strpos($q, 'jenjang') !== false || strpos($q, 'tingkat') !== false || strpos($q, 'smp') !== false || strpos($q, 'smk') !== false || strpos($q, 'sma') !== false || strpos($q, 'kelas') !== false || strpos($q, 'hanya sd') !== false || strpos($q, 'cuma sd') !== false) &&
        (strpos($q, 'sekolah') !== false || strpos($q, 'juara') !== false || strpos($q, 'pendidikan') !== false)
    ) {
        return "ℹ️ **Jenjang Pendidikan di Sekolah Juara**:\n\n" .
               "Sekolah Juara **HANYA ada jenjang Sekolah Dasar (SD)** yaitu 10 unit SD Juara bebas biaya 100% bagi dhuafa & yatim.\n\n" .
               "Di Sekolah Juara **tidak ada jenjang SMP maupun SMK/SMA**. Namun bagi yang memerlukan jenjang lanjutan (setara SMP / Paket B dan setara SMA / Paket C serta vokasi mandiri), ACF Eduhub memfasilitasinya melalui unit **PKBM Sekolah Daya Setara**.";
    }

    // 11. APA ITU SEKOLAH JUARA
    if (strpos($q, 'sekolah juara') !== false || (strpos($q, 'juara') !== false && (strpos($q, 'apa') !== false || strpos($q, 'tentang') !== false || strpos($q, 'itu') !== false))) {
        return "🏆 **Sekolah Juara** adalah jaringan 10 unit **Sekolah Dasar (SD Juara)** formal berkualitas bebas biaya (gratis 100%) yang dikelola oleh ACF Eduhub untuk mendidik anak-anak dhuafa dan yatim di Indonesia.\n\n" .
               "Sekolah Juara memadukan kurikulum nasional dengan pembinaan akhlak mulia melalui Kurikulum Langit, kepemimpinan (*leadership*), kewirausahaan, serta kecintaan terhadap Al-Qur'an.\n\n" .
               "*(Catatan: Sekolah Juara HANYA khusus jenjang SD saja. Jenjang SMP dan SMA sederajat diselenggarakan melalui unit PKBM Sekolah Daya Setara).*";
    }

    // 12. APA ITU SEKOLAH DAYA SETARA / PKBM
    if (strpos($q, 'daya setara') !== false || strpos($q, 'pkbm') !== false || strpos($q, 'kejar paket') !== false || strpos($q, 'paket c') !== false) {
        return "📖 **Sekolah Daya Setara** adalah 7 unit PKBM (Pusat Kegiatan Belajar Masyarakat) pendidikan non-formal kesetaraan (Paket A setara SD, Paket B setara SMP, Paket C setara SMA) yang diselenggarakan gratis/terjangkau.\n\n" .
               "Program ini membantu anak-anak putus sekolah dan masyarakat prasejahtera untuk mendapatkan ijazah resmi negara serta pelatihan keterampilan vokasi kerja mandiri.";
    }

    // 13. APA ITU GURUVERSE
    if (strpos($q, 'guruverse') !== false || (strpos($q, 'guru') !== false && (strpos($q, 'pelatihan') !== false || strpos($q, 'training') !== false))) {
        return "👩‍🏫 **Guruverse.ID** adalah ekosistem peningkatan kapasitas guru yang diinisiasi oleh ACF Eduhub. Hingga kini telah melatih lebih dari **2.000+ guru** di seluruh pelosok Indonesia mengenai metode belajar aktif, pedagogik kreatif, dan pemanfaatan teknologi kelas.";
    }

    // 14. 4 PILAR PROGRAM
    if (strpos($q, 'program') !== false || strpos($q, 'layanan') !== false || strpos($q, 'pilar') !== false) {
        return "📚 **4 Pilar Program Layanan ACF Eduhub**:\n\n" .
               "1. 🏫 **Keberlanjutan Unit Pendidikan**: Pembiayaan operasional & beasiswa penuh bagi 10 Sekolah Juara dan 7 PKBM Daya Setara.\n" .
               "2. 🥗 **Pemberdayaan Berbasis Sekolah**: Inovasi gizi kantin sehat, green school, dan literasi digital siswa.\n" .
               "3. 🕊️ **Kemanusiaan Internasional**: Penyaluran bantuan pangan dan pendidikan darurat bagi anak-anak di daerah konflik kemanusiaan.\n" .
               "4. 🎒 **Bantuan Langsung Berkelanjutan**: Penyaluran rutin seragam, buku paket, sepatu, dan gizi sarapan.\n\n" .
               "Pelajari detailnya di menu [Program Layanan](program-layanan.html)!";
    }

    // 15. LOKASI & ALAMAT KANTOR
    if (strpos($q, 'alamat') !== false || strpos($q, 'lokasi') !== false || strpos($q, 'kantor') !== false || strpos($q, 'dimana') !== false) {
        return "📍 **Alamat & Lokasi Kantor ACF Eduhub**:\n\n" .
               "🏢 **Kantor Pusat**: Jl. Jati Mulya No.9, Gumuruh, Kec. Batununggal, Kota Bandung, Jawa Barat 40275\n" .
               "🏫 **Jangkauan**: 17 Unit Pendidikan tersebar di 12 Kota/Kabupaten di Indonesia (Bandung, Cimahi, Jakarta, Tangerang, Yogya, Pekanbaru, Medan, Surabaya, dll).\n\n" .
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
           "• 🏫 **Pendaftaran Sekolah Juara (Gratis 100%)**\n" .
           "• 📚 **4 Pilar Program Layanan Pendidikan**\n" .
           "• 🤝 **Kerjasama Mitra CSR & Relawan**\n" .
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
