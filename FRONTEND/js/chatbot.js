/**
 * ACF EDUHUB — CHATBOT "CHERRY"
 * Asisten AI Virtual Cerdas & Ramah khas ACF Eduhub
 * Warna Identitas: Ungu (#7D2280) & Kuning Emas (#F5A623)
 */

(function () {
  'use strict';

  // Prevent multiple initializations
  if (window.CherryChatbotInitialized) return;
  window.CherryChatbotInitialized = true;

  // Storage Keys
  const STORAGE_SIZE_KEY = 'cherry_chat_size';
  const STORAGE_KEY_API = 'cherry_gemini_api_key';
  let chatHistory = [];
  let isAwaitingResponse = false;

  // Resolve API Base URL for backend chat endpoint
  function getChatApiUrl() {
    if (window.ACF_CUSTOM_API_URL) {
      return `${window.ACF_CUSTOM_API_URL}/chat.php`;
    }

    const loc = window.location;

    // Live Server or file:// protocol
    if ((loc.port && loc.port !== '80' && loc.port !== '443') || loc.protocol === 'file:') {
      return 'http://localhost/Intership-ACF/BACKEND/api/chat.php';
    }

    // Laragon virtual hosts (*.test / *.local)
    if (loc.hostname.endsWith('.test') || loc.hostname.endsWith('.local')) {
      return `${loc.origin}/BACKEND/api/chat.php`;
    }

    // Localhost standard
    if (loc.hostname === 'localhost' || loc.hostname === '127.0.0.1') {
      const pathname = loc.pathname;
      const match = pathname.match(/^(.*?\/(?:Intership-ACF|intership-acf|acf))\//i);
      if (match) {
        return `${loc.origin}${match[1]}/BACKEND/api/chat.php`;
      }
      if (pathname.includes('/FRONTEND/')) {
        return `${loc.origin}${pathname.split('/FRONTEND/')[0]}/BACKEND/api/chat.php`;
      }
      return `${loc.origin}/Intership-ACF/BACKEND/api/chat.php`;
    }

    // Default relative fallback
    return '../../BACKEND/api/chat.php';
  }

  // Panggilan langsung ke Google Gemini API dari browser
  async function callGeminiClientSide(userText, apiKey) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
    const systemPrompt = `Kamu adalah "Cherry", asisten virtual AI resmi dan representasi ramah dari yayasan pendidikan ACF Eduhub.
Warna identitasmu dan ACF adalah Ungu (#7D2280) dan Kuning Emas (#F5A623).

Tentang ACF Eduhub:
- Yayasan sosial pendidikan yang sudah 10+ tahun berdedikasi memutus rantai kemiskinan di Indonesia melalui pendidikan gratis & bermutu bagi dhuafa.
- Mengelola 17 Unit Pendidikan Aktif: 10 Sekolah Juara (HANYA jenjang Sekolah Dasar / SD Juara; Sekolah Juara TIDAK GRATIS / memiliki biaya pendidikan) dan 7 PKBM Sekolah Daya Setara (pendidikan kesetaraan Paket A, B, C dan vokasi mandiri).
- PENTING:
  1. Sekolah Juara HANYA ada jenjang Sekolah Dasar (SD Juara) saja, tidak ada jenjang SMP maupun SMA/SMK.
  2. Sekolah Juara TIDAK GRATIS. Jika ditanya biaya atau apakah gratis, tegaskan bahwa Sekolah Juara tidak gratis dan memiliki biaya pendidikan, serta sarankan konfirmasi rincian biaya ke admin WhatsApp +62 851-7979-7661.
  3. Jangan menampilkan teks '*(Catatan: ...)*' pada akhir jawaban.
- Mengelola Guruverse.ID (pelatihan 2.000+ guru di pelosok Indonesia).
- 4 Pilar Program: Keberlanjutan Unit Pendidikan, Pemberdayaan Berbasis Sekolah, Kemanusiaan Internasional, dan Bantuan Langsung Berkelanjutan.
- Kantor Pusat: Jl. Jati Mulya No.9, Gumuruh, Kec. Batununggal, Kota Bandung, Jawa Barat 40275.
- Kontak Telepon / WhatsApp: +62 851-7979-7661 | Email: welcome@acf.or.id.
- Akuntabilitas: Opini audit Wajar Tanpa Pengecualian (WTP) sejak 2024.

Gaya Komunikasi:
- Berbicaralah dengan sangat ramah, hangat, komunikatif, solutif, dan NYAMBUNG dengan pertanyaan pengguna.
- Jika pengguna bertanya 'cara donasi', jelaskan langkah-langkah praktis cara menyalurkan donasi.
- Jika pengguna bertanya biaya sekolah atau apakah gratis, tegaskan bahwa Sekolah Juara TIDAK GRATIS dan memiliki biaya pendidikan.
- Format teks dengan rapi dan gunakan emoji yang pas.`;

    const contents = [];
    chatHistory.slice(-6).forEach(turn => {
      contents.push({
        role: turn.role === 'user' ? 'user' : 'model',
        parts: [{ text: turn.text }]
      });
    });

    const promptWithContext = contents.length === 0 
      ? `${systemPrompt}\n\nPertanyaan pengguna: ${userText}`
      : userText;

    contents.push({
      role: 'user',
      parts: [{ text: promptWithContext }]
    });

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800
        }
      })
    });

    if (!res.ok) throw new Error(`Gemini client error ${res.status}`);
    const data = await res.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!reply) throw new Error('Empty reply from Gemini');
    return reply.trim();
  }

  /**
   * Conversational Brain: Sangat responsif, cerdas, dan nyambung dengan semua perkataan user
   */
  function getLocalKnowledgeReply(query) {
    const raw = (query || '').trim();
    const q = raw.toLowerCase();

    // 1. CARA DONASI / MAU DONASI / LANGKAH BERDONASI
    if (
      (q.includes('cara') || q.includes('gimana') || q.includes('bagaimana') || q.includes('langkah') || q.includes('alur') || q.includes('mau') || q.includes('pengen') || q.includes('ingin') || q.includes('bisa') || q.includes('tata cara') || q.includes('prosedur')) &&
      (q.includes('donasi') || q.includes('transfer') || q.includes('sedekah') || q.includes('infaq') || q.includes('rekening') || q.includes('bayar') || q.includes('nyumbang'))
    ) {
      return "💖 **Cara Menyalurkan Donasi di ACF Eduhub**:\n\n" +
             "1. Buka halaman [Donasi](donasi.html) di website ini (atau klik menu **Donasi**).\n" +
             "2. Pilih program yang ingin Anda dukung (contoh: *Beasiswa Sekolah Juara*, *Nutrisi & Sarapan Siswa*, atau *Fasilitas Belajar*).\n" +
             "3. Masukkan nominal donasi dan lengkapi data diri Anda.\n" +
             "4. Pilih metode pembayaran yang diinginkan (Transfer Bank BCA, Mandiri, BRI, BSI, Virtual Account, atau QRIS / E-Wallet Gopay, OVO, ShopeePay, DANA).\n" +
             "5. Selesaikan pembayaran, dan tanda terima resmi donasi akan langsung dikirimkan.\n\n" +
             "Anda juga bisa transfer langsung atau konfirmasi lewat WhatsApp admin di **+62 851-7979-7661**. Terima kasih banyak atas kebaikan Anda! 😊";
    }

    // 2. METODE PEMBAYARAN / REKENING DONASI / BANK APA SAJA
    if (
      q.includes('rekening') || q.includes('no rek') || q.includes('nomor rekening') ||
      ((q.includes('bank') || q.includes('transfer') || q.includes('pembayaran') || q.includes('metode')) && (q.includes('donasi') || q.includes('bca') || q.includes('mandiri') || q.includes('bri') || q.includes('bsi') || q.includes('qris')))
    ) {
      return "💳 **Metode Pembayaran & Rekening Donasi ACF Eduhub**:\n\n" +
             "Anda dapat berdonasi secara praktis melalui:\n" +
             "• **QRIS Instan**: Scan via BCA Mobile, Livin Mandiri, GoPay, OVO, Dana, ShopeePay, atau LinkAja.\n" +
             "• **Transfer Bank**: Tersedia Bank Mandiri, BCA, BRI, dan Bank Syariah Indonesia (BSI) atas nama **Yayasan Amal Khair Yasmin / ACF Eduhub**.\n" +
             "• **Virtual Account (VA)**: Otomatis terverifikasi saat berdonasi di halaman [Donasi](donasi.html).\n\n" +
             "Butuh bantuan transfer manual atau kwitansi? Hubungi WhatsApp kami di **+62 851-7979-7661** ya!";
    }

    // 3. KEAMANAN / LAPORAN AUDIT / WTP
    if (q.includes('aman') || q.includes('terpercaya') || q.includes('audit') || q.includes('wtp') || q.includes('laporan keuangan') || q.includes('transparan') || q.includes('bukti donasi')) {
      return "🛡️ **Donasi Anda 100% Aman & Terpercaya**:\n\n" +
             "ACF Eduhub adalah yayasan resmi berbadan hukum yang telah berkiprah 10+ tahun. Laporan keuangan yayasan diaudit secara berkala oleh Kantor Akuntan Publik independen dan berhasil meraih predikat tertinggi **WTP (Wajar Tanpa Pengecualian)** sejak 2024.\n\n" +
             "Setiap dana disalurkan langsung untuk operasional sekolah gratis, beasiswa, dan nutrisi siswa prasejahtera.";
    }

    // 4. DONASI UMUM / INFAQ / SEDEKAH
    if (q === 'donasi' || q.includes('donasi') || q.includes('infaq') || q.includes('sedekah') || q.includes('donatur')) {
      return "💖 **Donasi Pendidikan ACF Eduhub**:\n\n" +
             "Setiap rupiah donasi Anda membantu membiayai sekolah, seragam, buku, dan nutrisi siswa dhuafa di 10 Sekolah Juara dan 7 PKBM Daya Setara.\n\n" +
             "• Ingin berdonasi sekarang? Buka halaman [Donasi](donasi.html).\n" +
             "• Ingin tahu cara dan alur transfernya? Ketik **'cara donasi'** dan Cherry siap jelaskan langkah-langkahnya! 😊";
    }

    // 5. KEINGINAN BERTANYA (aku mau tanya nih, mau nanya dong, dll)
    if (
      q.match(/^(aku\s+)?(mau|pengen|bisa|boleh)\s+(tanya|nanya|bertanya)/i) ||
      q.match(/^(tanya|nanya)\s+(dong|nih|ya|aja|sesuatu)/i) ||
      q.match(/^(bisa\s+(bantu|tolong)|tolong\s+bantu)/i) ||
      q === 'tanya' || q === 'nanya'
    ) {
      return "Boleh banget! Mau tanya tentang apa nih? 😊\n\nSilakan langsung ketik pertanyaannya, Cherry siap bantu jelaskan seputar:\n" +
             "• 🏫 Sekolah Juara (biaya gratis 100%, syarat daftar, kurikulum)\n" +
             "• 💖 Cara Donasi & metode transfer\n" +
             "• 🤝 Cara jadi Mitra CSR atau Relawan\n" +
             "• 📍 Alamat kantor pusat Bandung & kontak WhatsApp admin";
    }

    // 6. SAPAAN / GREETINGS (halo, hallo, hai, hei, p, assalamualaikum, dll)
    if (
      q.match(/^(halo+|hallo+|hai+|hey+|hei+|hi+|p|tes|test|assalamu['`]?alaikum|selamat\s*(pagi|siang|sore|malam)|sampurasun|punten|permisi)(\s|[!.,?~]|$)/i) ||
      ['halo', 'hallo', 'hai', 'hi', 'hey', 'hei', 'p'].includes(q)
    ) {
      return "Halo! 👋 Senang bisa menyapa Anda. Saya **Cherry**, asisten virtual resmi ACF Eduhub.\n\nAda yang bisa Cherry bantu seputar Sekolah Juara (SD), program pendidikan, cara donasi, atau informasi lainnya hari ini? 😊";
    }

    // 7. BIAYA SEKOLAH / APAKAH GRATIS?
    if (q.includes('biaya') || q.includes('bayar') || q.includes('gratis') || q.includes('spp') || q.includes('uang sekolah') || q.includes('uang gedung') || q.includes('tarif')) {
      return "🏫 **Informasi Biaya Pendidikan di Sekolah Juara**:\n\n" +
             "Sekolah Juara **tidak gratis**. Sekolah Juara merupakan jaringan sekolah formal jenjang SD (Sekolah Dasar) berkualitas binaan ACF Eduhub dengan biaya pendidikan terjangkau.\n\n" +
             "Untuk rincian lengkap mengenai biaya formulir pendaftaran, uang pangkal, SPP bulanan, maupun program beasiswa khusus, silakan hubungi narahubung kami di WhatsApp **+62 851-7979-7661**.";
    }

    // 8. CARA DAFTAR SEKOLAH JUARA / SYARAT MASUK / PPDB
    if (
      (q.includes('cara') || q.includes('gimana') || q.includes('syarat') || q.includes('langkah') || q.includes('alur') || q.includes('daftar') || q.includes('masuk') || q.includes('ppdb')) &&
      (q.includes('sekolah') || q.includes('juara') || q.includes('siswa') || q.includes('anak') || q.includes('sd') || q.includes('smp') || q.includes('smk'))
    ) {
      return "📝 **Cara & Syarat Pendaftaran Siswa Sekolah Juara (SD)**:\n\n" +
             "**1. Kriteria Calon Siswa**:\n" +
             "• Anak yatim, piatu, atau berasal dari keluarga dhuafa prasejahtera.\n" +
             "• Memiliki semangat tinggi untuk belajar.\n\n" +
             "**2. Dokumen Persyaratan**:\n" +
             "• Surat Keterangan Tidak Mampu (SKTM) dari Kelurahan/Desa.\n" +
             "• Fotokopi Kartu Keluarga (KK) dan Akta Kelahiran anak.\n" +
             "• Rapor/ijazah jenjang sebelumnya.\n\n" +
             "**3. Alur Pendaftaran**:\n" +
             "• Isi formulir pendaftaran di unit Sekolah Juara terdekat.\n" +
             "• Verifikasi berkas & survei kunjungan rumah (*home visit*).\n" +
             "• Pengumuman kelulusan beasiswa pendidikan penuh.\n\n" +
             "Untuk info jadwal PPDB terkini di cabang kota Anda, silakan hubungi narahubung kami di WhatsApp **+62 851-7979-7661** ya!";
    }

    // 9. CARA JADI MITRA PROGRAM / CSR
    if (
      (q.includes('cara') || q.includes('gimana') || q.includes('syarat') || q.includes('langkah') || q.includes('mau') || q.includes('alur') || q.includes('tata')) &&
      (q.includes('mitra') || q.includes('kerjasama') || q.includes('kolaborasi') || q.includes('csr') || q.includes('sponsor') || q.includes('perusahaan'))
    ) {
      return "🤝 **Cara Menjadi Mitra Program / Kerjasama CSR**:\n\n" +
             "1. Masuk ke halaman formulir [Jadi Mitra Program](form-mitra.html).\n" +
             "2. Isi formulir dengan profil perusahaan/lembaga dan program kemitraan yang diminati (Beasiswa Binaan Kelas, Pembangunan Fasilitas, Green School, dll).\n" +
             "3. Kirim formulir pendaftaran.\n" +
             "4. Tim Partnership ACF Eduhub akan menghubungi PIC Anda dalam 1x24 jam untuk diskusi proposal dan sinergi bersama.\n\n" +
             "Ingin berdiskusi langsung? Hubungi email kemitraan di **welcome@acf.or.id** atau WA di **+62 851-7979-7661**.";
    }

    // 10. CARA JADI RELAWAN (SAHABAT EDUHUB)
    if (
      (q.includes('cara') || q.includes('gimana') || q.includes('syarat') || q.includes('langkah') || q.includes('mau') || q.includes('alur') || q.includes('daftar') || q.includes('gabung')) &&
      (q.includes('relawan') || q.includes('volunteer') || q.includes('sahabat') || q.includes('mengajar'))
    ) {
      return "🙋‍♀️ **Cara Mendaftar Jadi Relawan (Sahabat Eduhub)**:\n\n" +
             "1. Buka formulir pendaftaran di halaman [Jadi Relawan](form-relawan.html).\n" +
             "2. Lengkapi identitas diri dan pilih bidang yang diminati:\n" +
             "   • *Relawan Pengajar / Tutor*\n" +
             "   • *Fasilitator Kegiatan & Event*\n" +
             "   • *Dokumentasi, Foto, & Desain Konten*\n" +
             "   • *Mentor Inspiratif & Karakter*\n" +
             "3. Kirim formulir pendaftaran.\n" +
             "4. Tim relawan kami akan mengundang Anda ke sesi orientasi komunitas.\n\n" +
             "Mari berbagi inspirasi dan senyuman untuk anak-anak Indonesia! ✨";
    }

    // 10.5 JUMLAH & SEBARAN SEKOLAH JUARA (10 SD JUARA)
    if (
      (q.includes('berapa') || q.includes('da berapa') || q.includes('jumlah') || q.includes('total') || q.includes('sebaran') || q.includes('cabang')) &&
      (q.includes('sekolah') || q.includes('juara') || q.includes('sd'))
    ) {
      return "🏫 **Sekolah Juara memiliki total 10 unit**, dan seluruhnya adalah jenjang **Sekolah Dasar (SD Juara)** binaan ACF Eduhub:\n\n" +
             "1. SD Juara Batam\n" +
             "2. SD Juara Cilegon\n" +
             "3. SD Juara Jakarta Barat\n" +
             "4. SD Juara Jakarta Timur\n" +
             "5. SD Juara Jakarta Utara\n" +
             "6. SD Juara Persa Medan\n" +
             "7. SD Juara AL Hikmah Jayapura\n" +
             "8. SD Juara Semarang\n" +
             "9. SD Juara Surabaya\n" +
             "10. SD Juara AL Hakim Tangerang";
    }

    // 10.6 JENJANG / TINGKAT / SMP / SMK / HANYA SD
    if (
      (q.includes('jenjang') || q.includes('tingkat') || q.includes('smp') || q.includes('smk') || q.includes('sma') || q.includes('kelas') || q.includes('hanya sd') || q.includes('cuma sd')) &&
      (q.includes('sekolah') || q.includes('juara') || q.includes('pendidikan'))
    ) {
      return "ℹ️ **Jenjang Pendidikan di Sekolah Juara**:\n\n" +
             "Sekolah Juara **HANYA ada jenjang Sekolah Dasar (SD)** yaitu 10 unit SD Juara binaan ACF Eduhub.\n\n" +
             "Di Sekolah Juara **tidak ada jenjang SMP atau SMK**. Bagi yang memerlukan pendidikan kesetaraan lanjutan (setara SMP / Paket B dan setara SMA / Paket C serta vokasi), ACF Eduhub memfasilitasinya melalui unit **PKBM Sekolah Daya Setara**.";
    }

    // 11. APA ITU SEKOLAH JUARA / PENJELASAN SEKOLAH JUARA
    if (q.includes('sekolah juara') || (q.includes('juara') && (q.includes('apa') || q.includes('tentang') || q.includes('itu') || q.includes('maksud')))) {
      return "🏆 **Sekolah Juara** adalah jaringan 10 unit **Sekolah Dasar (SD Juara)** formal berkualitas binaan ACF Eduhub yang mendidik generasi penerus bangsa.\n\n" +
             "Sekolah Juara memadukan kurikulum nasional dengan pembinaan akhlak mulia melalui Kurikulum Langit, kepemimpinan (*leadership*), kewirausahaan, serta kecintaan terhadap Al-Qur'an.";
    }

    // 12. APA ITU SEKOLAH DAYA SETARA / PKBM / KEJAR PAKET
    if (q.includes('daya setara') || q.includes('pkbm') || q.includes('kejar paket') || q.includes('paket c') || q.includes('paket b') || q.includes('paket a')) {
      return "📖 **Sekolah Daya Setara** adalah 7 unit PKBM (Pusat Kegiatan Belajar Masyarakat) pendidikan non-formal kesetaraan (Paket A setara SD, Paket B setara SMP, Paket C setara SMA) yang diselenggarakan gratis/terjangkau.\n\n" +
             "Program ini membantu anak-anak putus sekolah dan masyarakat prasejahtera untuk mendapatkan ijazah resmi negara serta pelatihan keterampilan vokasi kerja mandiri.";
    }

    // 13. APA ITU GURUVERSE
    if (q.includes('guruverse') || (q.includes('guru') && (q.includes('pelatihan') || q.includes('training') || q.includes('kompetensi')))) {
      return "👩‍🏫 **Guruverse.ID** adalah ekosistem peningkatan kapasitas guru yang diinisiasi oleh ACF Eduhub. Hingga kini telah melatih lebih dari **2.000+ guru** di seluruh pelosok Indonesia mengenai metode belajar aktif, pedagogik kreatif, dan pemanfaatan teknologi kelas.";
    }

    // 14. 4 PILAR PROGRAM LAYANAN
    if (q.includes('program') || q.includes('layanan') || q.includes('pilar') || q.includes('kegiatan')) {
      return "📚 **4 Pilar Program Layanan ACF Eduhub**:\n\n" +
             "1. 🏫 **Keberlanjutan Unit Pendidikan**: Pembiayaan operasional & beasiswa penuh bagi 10 Sekolah Juara dan 7 PKBM Daya Setara.\n" +
             "2. 🥗 **Pemberdayaan Berbasis Sekolah**: Inovasi gizi kantin sehat, green school, dan literasi digital siswa.\n" +
             "3. 🕊️ **Kemanusiaan Internasional**: Penyaluran bantuan pangan dan pendidikan darurat bagi anak-anak di daerah konflik kemanusiaan.\n" +
             "4. 🎒 **Bantuan Langsung Berkelanjutan**: Penyaluran rutin seragam, buku paket, sepatu, dan gizi sarapan.\n\n" +
             "Pelajari detailnya di menu [Program Layanan](program-layanan.html)!";
    }

    // 15. LOKASI CABANG KOTA TERTENTU
    if (q.includes('jogja') || q.includes('yogyakarta')) {
      return "🏫 **Sekolah Juara Yogyakarta** adalah salah satu unit aktif kami di wilayah D.I. Yogyakarta! Unit ini melayani pendidikan berkualitas bebas biaya untuk anak-anak dhuafa. Ingin informasi pendaftaran atau kunjungan di unit Yogyakarta?";
    }
    if (q.includes('bandung') || q.includes('cimahi')) {
      return "🏫 Di wilayah **Bandung dan Cimahi** terdapat kantor pusat yayasan kami serta beberapa unit SD Juara aktif. Kantor pusat beralamat di Jl. Jati Mulya No.9, Gumuruh, Kec. Batununggal, Kota Bandung.";
    }
    if (q.includes('jakarta') || q.includes('tangerang') || q.includes('jabodetabek')) {
      return "🏫 Di wilayah **Jabodetabek (Jakarta & Tangerang)** kami mengoperasikan beberapa unit Sekolah Juara dan PKBM Daya Setara untuk anak-anak prasejahtera. Anda bisa menghubungi kontak pusat kami untuk detail lokasi tiap unit!";
    }
    if (q.includes('pekanbaru') || q.includes('medan') || q.includes('surabaya')) {
      return "🏫 Ya, unit Sekolah Juara juga hadir di kota-kota besar di luar pulau Jawa seperti **Pekanbaru** dan **Medan**, serta di Jawa Timur seperti **Surabaya**. Total terdapat 17 unit di 12 kota/kabupaten di Indonesia.";
    }

    // 16. LOKASI & ALAMAT KANTOR
    if (q.includes('alamat') || q.includes('lokasi') || q.includes('kantor') || q.includes('dimana') || q.includes('di mana')) {
      return "📍 **Alamat & Lokasi Kantor ACF Eduhub**:\n\n" +
             "🏢 **Kantor Pusat**: Jl. Jati Mulya No.9, Gumuruh, Kec. Batununggal, Kota Bandung, Jawa Barat 40275\n" +
             "🏫 **Jangkauan**: 17 Unit Pendidikan tersebar di 12 Kota/Kabupaten di Indonesia (Bandung, Cimahi, Jakarta, Tangerang, Yogya, Pekanbaru, Medan, Surabaya, dll).\n\n" +
             "📞 **WhatsApp / Telepon**: +62 851-7979-7661\n" +
             "✉️ **Email**: welcome@acf.or.id";
    }

    // 17. KONTAK RESMI & SOSIAL MEDIA
    if (q.includes('kontak') || q.includes('telepon') || q.includes('wa') || q.includes('whatsapp') || q.includes('email') || q.includes('admin') || q.includes('hubungi') || q.includes('nomor') || q.includes('instagram') || q.includes('youtube')) {
      return "📞 **Kontak Resmi ACF Eduhub**:\n\n" +
             "• **WhatsApp / Telepon**: +62 851-7979-7661 (tersedia juga tombol hijau WA di pojok kiri bawah layar Anda)\n" +
             "• **Email**: welcome@acf.or.id\n" +
             "• **Instagram**: @acf.eduhub\n" +
             "• **YouTube**: JUARA TV\n" +
             "• **Website**: www.acf.or.id\n\n" +
             "Tim kami siap melayani Anda pada jam operasional kerja.";
    }

    // 18. TENTANG YAYASAN ACF EDUHUB
    if (q.includes('apa itu acf') || q.includes('tentang acf') || q.includes('profil acf') || q.includes('yayasan') || q.includes('sejarah') || q.includes('visi') || q.includes('misi')) {
      return "🏫 **Tentang ACF Eduhub**:\n\n" +
             "ACF Eduhub (Amal Khair Yasmin Foundation) adalah yayasan sosial pendidikan yang telah berdedikasi selama lebih dari 10 tahun memutus rantai kemiskinan di Indonesia melalui pendidikan gratis & berkualitas bagi dhuafa.\n\n" +
             "• **17 Unit Pendidikan Aktif** (10 Sekolah Juara + 7 PKBM Daya Setara)\n" +
             "• **1.812+ Siswa Terdampak** langsung beasiswa penuh\n" +
             "• **2.000+ Guru Terlatih** lewat Guruverse.ID\n" +
             "• **Opini WTP** Akuntabilitas Audit Keuangan sejak 2024.";
    }

    // 19. TANYA KABAR (Apa kabar, sehat, dll)
    if (q.includes('kabar') || q.includes('sehat') || q.includes('lagi apa')) {
      return "Kabar saya luar biasa baik dan selalu bersemangat! ✨ Terima kasih sudah menanyakan. Semoga hari Anda juga menyenangkan dan penuh berkah! Ada informasi tentang ACF Eduhub yang bisa Cherry bantu carikan?";
    }

    // 20. UCAPAN TERIMA KASIH (Makasih, thanks, nuhun)
    if (q.includes('terima kasih') || q.includes('makasih') || q.includes('thanks') || q.includes('nuhun') || q.includes('tengkyu') || q.includes('syukron')) {
      return "Sama-sama! Senang sekali bisa membantu Anda. 😊 Jika ada hal lain yang ingin ditanyakan lagi tentang program kami, jangan ragu untuk menyapa Cherry lagi ya!";
    }

    // 21. AFIRMASI (Oke, siap, baik, mantap, sip)
    if (q.match(/^(oke+|ok|siap|baik|mantap|sip|yoi|keren|siip)(\s|[!.,?~]|$)/i) || q === 'oke' || q === 'ok') {
      return "Sip! Senang bisa mendampingi Anda. Jika ada informasi atau bantuan lain yang diperlukan di website ini, kabari Cherry ya! ✨";
    }

    // 22. PUJIAN (Pintar, keren, hebat)
    if (q.includes('pintar') || q.includes('keren') || q.includes('hebat') || q.includes('bagus') || q.includes('lucu') || q.includes('cantik')) {
      return "Wah, terima kasih banyak atas pujiannya! Senang sekali bisa membantu Anda dengan baik. Ada yang ingin Anda tanyakan lagi seputar ACF Eduhub? 😊";
    }

    // 23. SIAPA KAMU / CHERRY / BOT
    if (q.includes('siapa') || q.includes('nama') || q.includes('bot') || q.includes('cherry') || q.includes('robot') || q.includes('ai')) {
      return "Halo! 😊 Saya **Cherry**, asisten virtual AI ramah dari **ACF Eduhub**! Warna identitas saya ungu dan kuning emas khas ACF. Tugas saya menjawab pertanyaan Anda tentang Sekolah Juara, donasi, program beasiswa, relawan, dan kontak kami.";
    }

    // 24. DAMPAK & STATISTIK CAPAIAN
    if (q.includes('dampak') || q.includes('statistik') || q.includes('capaian') || q.includes('angka') || q.includes('berapa siswa')) {
      return "📊 **Capaian Dampak Nyata ACF Eduhub**:\n\n" +
             "• **17 Unit Pendidikan Aktif** (10 Sekolah Juara + 7 PKBM Daya Setara)\n" +
             "• **12 Kota & Kabupaten** wilayah jangkauan\n" +
             "• **1.812+ Siswa Terdampak** langsung beasiswa pendidikan gratis\n" +
             "• **2.000+ Guru Terlatih** lewat Guruverse.ID\n" +
             "• **Opini Audit WTP** (Wajar Tanpa Pengecualian) sejak 2024.";
    }

    // 25. KAMU BISA APA / BANTU APA / MENU
    if (q.includes('bisa apa') || q.includes('fitur') || q.includes('bantu apa') || q.includes('menu') || q.includes('panduan')) {
      return "Cherry bisa membantu Anda menemukan informasi lengkap di ACF Eduhub seputar:\n\n" +
             "1. 💖 **Donasi**: Cara donasi, metode transfer bank/QRIS, dan laporan audit.\n" +
             "2. 🏫 **Sekolah Juara**: Pendidikan 100% gratis, syarat pendaftaran, dan kurikulum.\n" +
             "3. 📖 **Sekolah Daya Setara**: Pendidikan kesetaraan Paket A, B, C dan vokasi.\n" +
             "4. 🤝 **Kemitraan & Relawan**: Cara berkolaborasi program CSR atau gabung relawan.\n" +
             "5. 📍 **Lokasi & Kontak**: Alamat kantor Bandung dan nomor WhatsApp admin.\n\n" +
             "Silakan ketik pertanyaan Anda!";
    }

    // 26. DEFAULT NATURAL RESPONSE (NYAMBUNG DAN FLEKSIBEL)
    return `Terima kasih atas pertanyaannya! 😊 Mengenai **"${escapeHtml(raw)}"**, Cherry siap bantu jelaskan lebih dalam. Anda bisa menanyakan hal spesifik seputar:\n\n` +
           "• 💖 **Cara Donasi & Metode Pembayaran**\n" +
           "• 🏫 **Pendaftaran Sekolah Juara (SD)**\n" +
           "• 📚 **4 Pilar Program Layanan Pendidikan**\n" +
           "• 🤝 **Kerjasama Mitra CSR & Relawan**\n" +
           "• 📍 **Alamat Kantor Bandung & Kontak WhatsApp**\n\n" +
           "Atau Anda bisa langsung chat admin kami via WhatsApp di **+62 851-7979-7661** (tombol hijau di pojok kiri bawah).";
  }

  // Escape HTML helper
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Markdown Formatter (Bold, Italic, Links, Bullet Lists, Numbered Lists)
  function formatMarkdown(text) {
    if (!text) return '';
    let html = escapeHtml(text);

    // Bold **text**
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Italic *text*
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Markdown Links [title](url)
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="cherry-inline-link" target="_blank" rel="noopener noreferrer">$1</a>');

    // Format newlines into paragraphs and lists
    const lines = html.split('\n');
    let inList = false;
    let listType = '';
    let result = [];

    lines.forEach(line => {
      const trimmed = line.trim();
      const bulletMatch = trimmed.match(/^[•\-*]\s+(.*)$/);
      const numberMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);

      if (bulletMatch) {
        if (!inList || listType !== 'ul') {
          if (inList) result.push(`</${listType}>`);
          result.push('<ul class="cherry-list">');
          inList = true;
          listType = 'ul';
        }
        result.push(`<li>${bulletMatch[1]}</li>`);
      } else if (numberMatch) {
        if (!inList || listType !== 'ol') {
          if (inList) result.push(`</${listType}>`);
          result.push('<ol class="cherry-list numbered">');
          inList = true;
          listType = 'ol';
        }
        result.push(`<li>${numberMatch[2]}</li>`);
      } else {
        if (inList) {
          result.push(`</${listType}>`);
          inList = false;
          listType = '';
        }
        if (trimmed.length > 0) {
          result.push(`<p>${trimmed}</p>`);
        }
      }
    });

    if (inList) {
      result.push(`</${listType}>`);
    }

    return result.join('');
  }

  // Build Floating UI & Modal Window
  function initChatbotUI() {
    if (document.getElementById('cherryChatbotRoot')) return;

    const root = document.createElement('div');
    root.id = 'cherryChatbotRoot';
    root.className = 'cherry-chatbot-container';

    const savedSize = localStorage.getItem(STORAGE_SIZE_KEY) || 'size-m';

    root.innerHTML = `
      <!-- Floating Trigger Button -->
      <button type="button" class="cherry-trigger-btn" id="cherryTriggerBtn" aria-label="Buka Chat AI Cherry" title="Tanya Cherry AI">
        <!-- Chat Bubble Icon with 3 Dots -->
        <span class="cherry-btn-icon icon-chat">
          <svg viewBox="0 0 24 24" width="30" height="30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 2H4C2.34 2 1 3.34 1 5V15C1 16.66 2.34 18 4 18H6V22L10.5 18H20C21.66 18 23 16.66 23 15V5C23 3.34 21.66 2 20 2Z" fill="#FFFFFF"/>
            <circle cx="7.5" cy="10" r="1.6" class="cherry-icon-dot"/>
            <circle cx="12" cy="10" r="1.6" class="cherry-icon-dot"/>
            <circle cx="16.5" cy="10" r="1.6" class="cherry-icon-dot"/>
          </svg>
        </span>
        <!-- Close Icon -->
        <span class="cherry-btn-icon icon-close">
          <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </span>
      </button>

      <!-- Chat Modal Window -->
      <div class="cherry-chat-window ${savedSize}" id="cherryChatWindow" role="dialog" aria-modal="true" aria-label="Jendela Chat Cherry">
        <!-- Header -->
        <div class="cherry-header cherry-chat-header">
          <div class="cherry-header-left">
            <div class="cherry-header-avatar">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="#7D2280">
                <circle cx="8" cy="15" r="4"/>
                <circle cx="16" cy="15" r="4"/>
                <path d="M8 11c1-4 4-7 8-9" stroke="#F5A623" stroke-width="2.5" fill="none" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="cherry-header-meta">
              <div class="cherry-header-title">
                <span class="cherry-name">Cherry</span>
                <span class="cherry-badge-acf">ACF AI</span>
              </div>
              <div class="cherry-header-sub">AI Assistant</div>
            </div>
          </div>

          <div class="cherry-header-actions">
            <!-- Size Toggle (S, M, L) -->
            <div class="cherry-size-switcher cherry-size-toggle" title="Ubah Ukuran Jendela Chat">
              <button type="button" class="cherry-size-btn ${savedSize === 'size-s' ? 'active' : ''}" data-size="size-s">S</button>
              <button type="button" class="cherry-size-btn ${savedSize === 'size-m' ? 'active' : ''}" data-size="size-m">M</button>
              <button type="button" class="cherry-size-btn ${savedSize === 'size-l' ? 'active' : ''}" data-size="size-l">L</button>
            </div>

            <!-- Close Window Button -->
            <button type="button" class="cherry-close-btn cherry-minimize-btn" id="cherryCloseBtn" aria-label="Tutup Chat" title="Tutup Chat">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <!-- Chat Body (Messages Stream) -->
        <div class="cherry-body" id="cherryBody">
          <!-- Initial Welcome Message from Cherry -->
          <div class="cherry-msg-row bot">
            <div class="cherry-msg-avatar">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="#7D2280">
                <circle cx="8" cy="15" r="4"/>
                <circle cx="16" cy="15" r="4"/>
                <path d="M8 11c1-4 4-7 8-9" stroke="#F5A623" stroke-width="2" fill="none"/>
              </svg>
            </div>
            <div class="cherry-bubble">
              <p>Halo! 👋 Saya <strong>Cherry</strong>, asisten AI resmi dari <strong>ACF Eduhub</strong>.</p>
              <p>Saya siap menjawab pertanyaan Anda mengenai:</p>
              <ul class="cherry-list">
                <li>💖 <strong>Cara & Metode Donasi</strong></li>
                <li>🏫 <strong>Sekolah Juara (SD)</strong>: Kurikulum & Info Pendaftaran</li>
                <li>📚 <strong>4 Pilar Program Layanan</strong></li>
                <li>🤝 <strong>Kemitraan CSR & Relawan</strong></li>
              </ul>
              <p>Ada yang ingin Anda tanyakan hari ini? 😊</p>
              <span class="cherry-msg-time">Sekarang</span>
            </div>
          </div>
        </div>

        <!-- Quick Action Chips -->
        <div class="cherry-quick-chips" id="cherryQuickChips">
          <button type="button" class="cherry-chip" data-query="cara donasi">💖 Cara Donasi</button>
          <button type="button" class="cherry-chip" data-query="informasi sekolah juara">🏫 Info Sekolah Juara</button>
          <button type="button" class="cherry-chip" data-query="cara jadi mitra csr">🤝 Jadi Mitra</button>
          <button type="button" class="cherry-chip" data-query="lokasi kantor dan kontak wa">📍 Alamat & Kontak</button>
        </div>

        <!-- Input Footer Form -->
        <form class="cherry-footer" id="cherryForm">
          <input
            type="text"
            class="cherry-input"
            id="cherryInput"
            placeholder="Ketik pesan untuk Cherry..."
            autocomplete="off"
            required
            maxlength="400"
          />
          <button type="submit" class="cherry-send-btn" id="cherrySendBtn" aria-label="Kirim Pesan">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </div>
    `;

    document.body.appendChild(root);

    // Elements
    const triggerBtn = document.getElementById('cherryTriggerBtn');
    const chatWindow = document.getElementById('cherryChatWindow');
    const closeBtn = document.getElementById('cherryCloseBtn');
    const chatBody = document.getElementById('cherryBody');
    const chatForm = document.getElementById('cherryForm');
    const chatInput = document.getElementById('cherryInput');
    const quickChips = document.getElementById('cherryQuickChips');
    const sizeButtons = root.querySelectorAll('.cherry-size-btn');

    // Toggle Chat Window
    function toggleChat(forceOpen) {
      const willOpen = typeof forceOpen === 'boolean' ? forceOpen : !chatWindow.classList.contains('active');
      if (willOpen) {
        chatWindow.classList.add('active');
        triggerBtn.classList.add('open');
        setTimeout(() => {
          chatInput.focus();
          scrollToBottom();
        }, 150);
      } else {
        chatWindow.classList.remove('active');
        triggerBtn.classList.remove('open');
      }
    }

    triggerBtn.addEventListener('click', () => toggleChat());
    closeBtn.addEventListener('click', () => toggleChat(false));

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && chatWindow.classList.contains('active')) {
        toggleChat(false);
      }
    });

    // Handle Size Switching (S / M / L)
    sizeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetSize = btn.dataset.size;
        chatWindow.classList.remove('size-s', 'size-m', 'size-l');
        chatWindow.classList.add(targetSize);

        sizeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        localStorage.setItem(STORAGE_SIZE_KEY, targetSize);
        scrollToBottom();
      });
    });

    // Handle Quick Action Chips
    if (quickChips) {
      quickChips.addEventListener('click', (e) => {
        const chip = e.target.closest('.cherry-chip');
        if (!chip) return;
        const query = chip.dataset.query;
        if (query) {
          sendUserMessage(query);
        }
      });
    }

    // Handle Form Submit
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const message = chatInput.value.trim();
      if (!message || isAwaitingResponse) return;
      chatInput.value = '';
      sendUserMessage(message);
    });

    // Auto-scroll to bottom
    function scrollToBottom() {
      setTimeout(() => {
        chatBody.scrollTop = chatBody.scrollHeight;
      }, 50);
    }

    // Append Message to UI
    function appendMessage(sender, text, isMarkdown = true) {
      const row = document.createElement('div');
      row.className = `cherry-msg-row ${sender}`;

      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      if (sender === 'bot') {
        row.innerHTML = `
          <div class="cherry-msg-avatar">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="#7D2280">
              <circle cx="8" cy="15" r="4"/>
              <circle cx="16" cy="15" r="4"/>
              <path d="M8 11c1-4 4-7 8-9" stroke="#F5A623" stroke-width="2" fill="none"/>
            </svg>
          </div>
          <div class="cherry-bubble">
            ${isMarkdown ? formatMarkdown(text) : escapeHtml(text)}
            <span class="cherry-msg-time">${timeStr}</span>
          </div>
        `;
      } else {
        row.innerHTML = `
          <div class="cherry-bubble">
            <p>${escapeHtml(text)}</p>
            <span class="cherry-msg-time">${timeStr}</span>
          </div>
        `;
      }

      chatBody.appendChild(row);
      scrollToBottom();
    }

    // Typing Indicator
    let typingRow = null;
    function showTypingIndicator() {
      if (typingRow) return;
      typingRow = document.createElement('div');
      typingRow.className = 'cherry-msg-row bot cherry-typing-row';
      typingRow.innerHTML = `
        <div class="cherry-msg-avatar">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="#7D2280">
            <circle cx="8" cy="15" r="4"/>
            <circle cx="16" cy="15" r="4"/>
            <path d="M8 11c1-4 4-7 8-9" stroke="#F5A623" stroke-width="2" fill="none"/>
          </svg>
        </div>
        <div class="cherry-typing-bubble">
          <span class="cherry-dot"></span>
          <span class="cherry-dot"></span>
          <span class="cherry-dot"></span>
        </div>
      `;
      chatBody.appendChild(typingRow);
      scrollToBottom();
    }

    function hideTypingIndicator() {
      if (typingRow) {
        typingRow.remove();
        typingRow = null;
      }
    }

    // Send Message Handler
    async function sendUserMessage(userText) {
      appendMessage('user', userText);
      chatHistory.push({ role: 'user', text: userText });

      isAwaitingResponse = true;
      showTypingIndicator();

      const clientApiKey = localStorage.getItem(STORAGE_KEY_API) || '';

      // 1. Jika ada Google Gemini API Key di browser, gunakan Google Gemini langsung
      if (clientApiKey) {
        try {
          const aiReply = await callGeminiClientSide(userText, clientApiKey);
          hideTypingIndicator();
          appendMessage('bot', aiReply);
          chatHistory.push({ role: 'model', text: aiReply });
          isAwaitingResponse = false;
          chatInput.focus();
          return;
        } catch (err) {
          console.warn('Direct Gemini call failed, falling back:', err);
        }
      }

      // 2. Hubungi backend API dengan timeout singkat 2 detik
      const apiUrl = getChatApiUrl();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            message: userText,
            history: chatHistory.slice(-6),
            clientApiKey: clientApiKey
          }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          if (data && data.reply) {
            hideTypingIndicator();
            appendMessage('bot', data.reply);
            chatHistory.push({ role: 'model', text: data.reply });
            isAwaitingResponse = false;
            chatInput.focus();
            return;
          }
        }
        throw new Error('Local fallback preferred');
      } catch (err) {
        clearTimeout(timeoutId);
        // Delay natural 300ms agar animasi mengetik halus, lalu berikan jawaban yang cerdas & nyambung
        setTimeout(() => {
          hideTypingIndicator();
          const fallback = getLocalKnowledgeReply(userText);
          appendMessage('bot', fallback);
          chatHistory.push({ role: 'model', text: fallback });
          isAwaitingResponse = false;
          chatInput.focus();
        }, 300);
      }
    }
  }

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatbotUI);
  } else {
    initChatbotUI();
  }
})();
