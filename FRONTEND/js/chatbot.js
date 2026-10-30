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
- Yayasan sosial pendidikan yang sudah 10+ tahun berdedikasi memutus rantai kemiskinan di Indonesia melalui pendidikan berkualitas bagi dhuafa.
- Mengelola 17 Unit Pendidikan Aktif: 10 Sekolah Juara (HANYA jenjang Sekolah Dasar / SD Juara; Sekolah Juara TIDAK GRATIS / memiliki biaya pendidikan) dan 7 PKBM Sekolah Daya Setara (pendidikan kesetaraan HANYA Paket B setara SMP dan Paket C setara SMA, serta vokasi mandiri).
- PENTING:
  1. Sekolah Juara HANYA ada jenjang Sekolah Dasar (SD Juara) saja, tidak ada jenjang SMP maupun SMA/SMK.
  2. Sekolah Juara (SD) dan PKBM Sekolah Daya Setara TIDAK GRATIS (memiliki biaya pendidikan). Jika ditanya biaya atau apakah gratis, tegaskan bahwa Sekolah Juara dan Sekolah Daya Setara tidak gratis dan memiliki biaya pendidikan, serta sarankan konfirmasi rincian biaya ke admin WhatsApp +62 851-7979-7661.
  3. Sekolah Daya Setara HANYA ada jenjang Paket B (setara SMP) dan Paket C (setara SMA) serta pelatihan vokasi mandiri.
  4. Jangan menampilkan teks '*(Catatan: ...)*' pada akhir jawaban.
- Mengelola Guruverse.ID (pelatihan 2.000+ guru di pelosok Indonesia).
- Program Layanan: Memiliki inisiatif program layanan pendidikan komprehensif (saat ini 7 program terbit yang dikelompokkan ke dalam kategori keberlanjutan unit pendidikan, tanggap bencana & pemulihan, kesejahteraan ekosistem sekolah, kemanusiaan internasional, forum advokasi pendidikan, dan kepemimpinan manajemen sekolah).
- Kantor Pusat: Jl. Jati Mulya No.9, Gumuruh, Kec. Batununggal, Kota Bandung, Jawa Barat 40275.
- Kontak Telepon / WhatsApp: +62 851-7979-7661 | Email: welcome@acf.or.id.
- Akuntabilitas: Opini audit Wajar Tanpa Pengecualian (WTP) sejak 2024.

Gaya Komunikasi:
- Berbicaralah dengan sangat ramah, hangat, komunikatif, solutif, dan NYAMBUNG dengan pertanyaan pengguna.
- Jika pengguna hanya menyapa (seperti 'halo', 'hai', 'p', 'assalamualaikum', 'selamat pagi/siang/malam'), cukup respon singkat dan ramah: 'Halo! 👋 Senang bisa menyapa Anda. Ada yang bisa Cherry bantu hari ini? 😊' tanpa perlu menyebutkan Sekolah Juara atau daftar program.
- Jika pengguna bertanya tentang PPDB, syarat masuk, pendaftaran, atau brosur Sekolah Juara (misalnya 'ppdb ss sekolah juara batam'), langsung berikan tautan pendaftaran online dan tautan brosur unit yang dituju (misal: Batam daftar di http://bit.ly/SPMB2728-SDJBATAM dan brosur di sekolah-juara.html?brosur=batam) tanpa menuliskan syarat berkas panjang seperti SKTM atau KK.
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
   * Mengambil data Program Layanan secara dinamis dari localStorage (Portal Admin)
   * atau fallback ke daftar program terbit saat ini di website.
   * Jika nanti di web bertambah (melalui Admin Portal), chatbot otomatis langsung membaca dan menambahkannya!
   */
  function getDynamicPrograms() {
    try {
      const stored = localStorage.getItem('acf_programs_data');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const active = parsed.filter(p => !p.status || p.status === 'Terbit');
          if (active.length > 0) return active;
        }
      }
    } catch (e) {
      console.warn('[Cherry AI] Gagal membaca acf_programs_data:', e);
    }

    if (typeof DEFAULT_PROGRAMS !== 'undefined' && Array.isArray(DEFAULT_PROGRAMS) && DEFAULT_PROGRAMS.length > 0) {
      return DEFAULT_PROGRAMS.filter(p => !p.status || p.status === 'Terbit');
    }

    return [
      {
        id: 'PRG-01',
        title: 'Program Beasiswa & Keberlanjutan Sekolah Juara',
        divisi: 'Sekolah Juara',
        quote: 'Mendukung operasional dan beasiswa 10 unit Sekolah Juara agar akses pendidikan formal berkualitas tetap gratis bagi anak-anak dhuafa berprestasi.'
      },
      {
        id: 'PRG-02',
        title: 'Kesejahteraan Guru & Operasional Sekolah Daya Setara',
        divisi: 'Sekolah Daya Setara',
        quote: 'Mendukung kesejahteraan tutor/guru dan operasional PKBM Sekolah Daya Setara (Paket B, C, & vokasi mandiri).'
      },
      {
        id: 'PRG-03',
        title: 'Layanan Pascabencana',
        divisi: 'Guruverse.ID & ACF Educare',
        quote: 'Respons terintegrasi pascabencana: dukungan psikososial anak, pelatihan psikososial guru terdampak, dan bantuan pangan/sandang/papan darurat.'
      },
      {
        id: 'PRG-04',
        title: 'Kesejahteraan Ekosistem Sekolah',
        divisi: 'ACF Educare',
        quote: 'Dukungan berkelanjutan bagi guru honorer, penjaga sekolah, dan keluarga prasejahtera di lingkungan sekitar sekolah.'
      },
      {
        id: 'PRG-05',
        title: 'Bantuan Kemanusiaan Internasional',
        divisi: 'ACF Educare',
        quote: 'Penyaluran bantuan pangan dan kebutuhan dasar darurat bagi anak-anak di wilayah konflik dan krisis kemanusiaan global.'
      },
      {
        id: 'PRG-06',
        title: 'Education Outlook — Forum Tahunan Pendidikan',
        divisi: 'Guruverse.ID',
        quote: 'Forum hybrid tahunan yang mempertemukan praktisi, akademisi, dan pembuat kebijakan untuk mendiskusikan arah tren pendidikan nasional.'
      },
      {
        id: 'PRG-07',
        title: 'Konsultasi & Pendampingan Manajemen Sekolah',
        divisi: 'Guruverse.ID',
        quote: 'Layanan konsultasi manajemen sekolah, strategi SPMB/PPDB, serta studi kelayakan pendirian atau pengembangan unit pendidikan.'
      }
    ];
  }

  function formatDynamicProgramsReply() {
    const progs = getDynamicPrograms();
    const count = progs.length;
    let reply = `📚 **Program Layanan ACF Eduhub (${count} Program)**:\n\n`;

    progs.forEach((p, idx) => {
      const num = idx + 1;
      const title = p.title || 'Program Pendidikan';
      const divisi = p.divisi ? ` *(Divisi: ${p.divisi})*` : '';
      const desc = p.quote || p.categoryDesc || '';
      reply += `${num}. 🎯 **${title}**${divisi}\n`;
      if (desc) {
        reply += `   ${desc}\n`;
      }
    });

    reply += `\nSeluruh program di atas terintegrasi dalam ekosistem pendidikan ACF Eduhub. Pelajari detail lengkap atau ajukan kemitraan di menu [Program Layanan](program-layanan.html)! 😊`;
    return reply;
  }

  let cachedLatestArticles = [];

  // Sinkronisasi data Artikel & Berita langsung dari server / website secara berkala
  async function syncLatestArticlesFromWeb() {
    try {
      if (window.ACF_API && window.ACF_API.articles) {
        const fetched = await window.ACF_API.articles.getAll({ status: 'Terbit', limit: 4 });
        if (Array.isArray(fetched) && fetched.length > 0) {
          cachedLatestArticles = fetched;
          return;
        }
      }
      const apiEndpoint = getChatApiUrl().replace('chat.php', 'articles.php');
      const res = await fetch(`${apiEndpoint}?status=Terbit&limit=4`);
      if (res.ok) {
        const json = await res.json();
        if (json && json.success && Array.isArray(json.data) && json.data.length > 0) {
          cachedLatestArticles = json.data;
          return;
        }
      }
    } catch (e) {
      // offline/fallback
    }

    try {
      const stored = localStorage.getItem('acf_articles_data');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          cachedLatestArticles = parsed.filter(a => !a.status || a.status === 'Terbit').slice(0, 4);
        }
      }
    } catch (e) {}
  }

  function getDynamicArticles(limit = 4) {
    if (Array.isArray(cachedLatestArticles) && cachedLatestArticles.length > 0) {
      return cachedLatestArticles.slice(0, limit);
    }

    try {
      const stored = localStorage.getItem('acf_articles_data');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const published = parsed.filter(a => !a.status || a.status === 'Terbit');
          if (published.length > 0) return published.slice(0, limit);
        }
      }
    } catch (e) {}

    // Fallback artikel terbit resmi website
    return [
      {
        id: 'ART-SDS07',
        title: 'Menyalakan Kembali Api Harapan: Kisah Pejuang PKBM Ceria Taklukkan ANBK 2025',
        categoryLabel: 'Artikel Sekolah Daya Setara',
        date: '14 Agu 2025',
        excerpt: 'Kisah 16 pejuang program Paket C PKBM Ceria yang membuktikan semangat belajar tanpa batas usia dalam ANBK.'
      },
      {
        id: 'ART-SDS06',
        title: 'Sebuah Langkah Kecil Hari Ini, Lompatan Besar di Masa Depan: Pelepasan Lulusan Sekolah Daya Setara 2025/2026',
        categoryLabel: 'Artikel Sekolah Daya Setara',
        date: '7 Agu 2026',
        excerpt: 'Pelepasan peserta didik Paket B dan Paket C yang sukses menyelesaikan studi kesetaraan di PKBM Lembang.'
      },
      {
        id: 'ART-SJ06',
        title: 'Haflah Tahfidz Qur’an SD Persa Juara Medan: Wisuda 61 Siswa Penghafal Qur’an',
        categoryLabel: 'Artikel Sekolah Juara',
        date: '3 Jul 2026',
        excerpt: 'Sebanyak 61 siswa SD Juara Medan diwisuda tahfidz dengan hafalan hingga 6 juz dalam suasana khidmat dan haru.'
      },
      {
        id: 'ART-SJ03',
        title: 'Tasyakuran Tahsin Metode Tilawati SD Juara Cilegon: Uji Publik & Wisuda Jilid 1–6',
        categoryLabel: 'Artikel Sekolah Juara',
        date: '18 Jun 2026',
        excerpt: 'Uji publik bacaan Al-Qur’an bersama Kepala Cabang Tilawati Banten bagi siswa yang menyelesaikan jilid 1 hingga 6.'
      }
    ];
  }

  function formatDynamicArticlesReply() {
    const list = getDynamicArticles(4);
    let reply = "📰 **Kabar & Artikel Terbaru ACF Eduhub**:\n\n" +
                "Berikut adalah artikel dan publikasi berita terhangat yang terbit di website:\n\n";

    list.forEach((art, idx) => {
      const num = idx + 1;
      const title = art.title || 'Artikel Edukasi ACF';
      const cat = art.categoryLabel || (art.category && art.category.includes('juara') ? 'Artikel Sekolah Juara' : 'Artikel Sekolah Daya Setara');
      const date = art.date ? ` • 📅 ${art.date}` : '';
      const link = art.id ? `kabar.html?id=${encodeURIComponent(art.id)}` : 'kabar.html';
      const excerpt = art.excerpt ? `\n   ${art.excerpt.substring(0, 115).trim()}...` : '';

      reply += `${num}. 📝 **[${title}](${link})**\n   🏷️ *${cat}*${date}${excerpt}\n\n`;
    });

    reply += "Anda dapat membaca artikel lengkapnya dengan mengklik tautan judul di atas atau mengunjungi halaman [Kabar](kabar.html)! ✨";
    return reply;
  }

  /**
   * Conversational Brain: Sangat responsif, cerdas, dan nyambung dengan semua perkataan user
   */
  // Data 10 Unit Sekolah Juara (SD) lengkap dengan link pendaftaran & brosur
  const SJ_SCHOOLS = [
    { key: 'batam', name: 'SD Juara Batam', daftar: 'http://bit.ly/SPMB2728-SDJBATAM', brosur: 'sekolah-juara.html?brosur=batam' },
    { key: 'cilegon', name: 'SD Juara Cilegon', daftar: 'https://bit.ly/SPMB2728SDJUARACILEGON', brosur: 'sekolah-juara.html?brosur=cilegon' },
    { key: 'jakbar', name: 'SD Juara Jakarta Barat', aliases: ['jakarta barat', 'jakbar'], daftar: 'https://forms.gle/7WoWewcTqsPCZ4Aq7', brosur: 'sekolah-juara.html?brosur=jakbar' },
    { key: 'jaktim', name: 'SD Juara Jakarta Timur', aliases: ['jakarta timur', 'jaktim'], daftar: 'https://bit.ly/PPDBSDJuaraJakartaTimur20272028', brosur: 'sekolah-juara.html?brosur=jaktim' },
    { key: 'jakut', name: 'SD Juara Jakarta Utara', aliases: ['jakarta utara', 'jakut'], daftar: 'https://bit.ly/SPMBINDENSDITJAKUT2728', brosur: 'sekolah-juara.html?brosur=jakut' },
    { key: 'medan', name: 'SD Juara Persa Medan', aliases: ['medan', 'persa'], daftar: 'https://linktr.ee/sdspersa', brosur: 'sekolah-juara.html?brosur=medan' },
    { key: 'jayapura', name: 'SD Juara AL Hikmah Jayapura', aliases: ['jayapura', 'hikmah', 'papua'], daftar: 'https://bit.ly/SPMBSDJUARAJayapura', brosur: 'sekolah-juara.html?brosur=jayapura' },
    { key: 'semarang', name: 'SD Juara Semarang', daftar: 'https://bit.ly/ForPeminatPPDB20272028', brosur: 'sekolah-juara.html?brosur=semarang' },
    { key: 'surabaya', name: 'SD Juara Surabaya', daftar: 'https://s.id/spmb-sdjuarasurabaya27-28', brosur: 'sekolah-juara.html?brosur=surabaya' },
    { key: 'tangerang', name: 'SD Juara AL Hakim Tangerang', aliases: ['tangerang', 'hakim'], daftar: 'https://bit.ly/DaftarIndenAlhakim2728', brosur: 'sekolah-juara.html?brosur=tangerang' }
  ];

  function getSekolahJuaraPpdbReply(query) {
    const q = (query || '').toLowerCase();
    
    // Jika menanyakan unit spesifik tertentu
    for (const s of SJ_SCHOOLS) {
      const matchKey = q.includes(s.key);
      const matchAlias = s.aliases && s.aliases.some(a => q.includes(a));
      if (matchKey || matchAlias) {
        return `🎒 **Pendaftaran & Brosur SPMB ${s.name}**:\n\n` +
               `Berikut adalah tautan resmi pendaftaran dan dokumen brosur untuk **${s.name}**:\n\n` +
               `• 📝 **Link Pendaftaran**: [Daftar Online ${s.name}](${s.daftar})\n` +
               `• 📖 **Brosur Resmi**: [Lihat & Unduh Brosur](${s.brosur})\n\n` +
               `Anda juga dapat melihat profil lengkap unit ini di halaman [Sekolah Juara](sekolah-juara.html). Bantuan lebih lanjut hubungi WhatsApp admin di **+62 851-7979-7661**! 😊`;
      }
    }

    // Tampilkan seluruh 10 unit dengan tautan pendaftaran & brosur
    let reply = "🎒 **Link Pendaftaran & Brosur SPMB/PPDB Sekolah Juara (SD)**:\n\n" +
                "Silakan klik tautan di bawah ini untuk langsung mengisi formulir pendaftaran atau mengunduh brosur resmi unit yang dituju:\n\n";

    SJ_SCHOOLS.forEach((s, idx) => {
      reply += `${idx + 1}. **${s.name}**\n` +
               `   • 📝 [Formulir Pendaftaran](${s.daftar})\n` +
               `   • 📖 [Lihat & Unduh Brosur](${s.brosur})\n\n`;
    });

    reply += "Detail profil seluruh unit dapat Anda lihat di menu [Sekolah Juara](sekolah-juara.html)! ✨";
    return reply;
  }

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
             "Setiap dana disalurkan langsung untuk operasional unit pendidikan, subsidi beasiswa, dan nutrisi siswa prasejahtera.";
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
      return "Boleh banget! Mau tanya tentang apa nih? 😊\n\nSilakan langsung ketik pertanyaannya, Cherry siap bantu jelaskan secara lengkap seputar:\n" +
             "• 💖 **Cara & Metode Donasi**: Donasi beasiswa, nutrisi, rekening transfer, QRIS & audit WTP\n" +
             "• 🏫 **Sekolah Juara (SD)**: 10 unit SD formal, Kurikulum Langit & syarat pendaftaran PPDB\n" +
             "• 📖 **Sekolah Daya Setara (PKBM)**: Pendidikan kesetaraan Paket B & C serta vokasi mandiri\n" +
             "• 👩‍🏫 **Guruverse.ID**: Platform peningkatan kapasitas dan pelatihan guru Indonesia\n" +
             "• 📚 **Program Layanan**: Keberlanjutan pendidikan, pemberdayaan & bantuan langsung\n" +
             "• 🤝 **Kemitraan CSR & Relawan**: Kolaborasi mitra program CSR & relawan Sahabat Eduhub\n" +
             "• 📰 **Artikel & Kabar**: Update berita kegiatan & publikasi edukasi terbaru\n" +
             "• 🏢 **Profil Yayasan**: Visi misi, cerita perjalanan 10+ tahun & kemitraan\n" +
             "• 📍 **Alamat & Kontak Admin**: Alamat kantor pusat Bandung & nomor WhatsApp resmi";
    }

    // 6. SAPAAN / GREETINGS (halo, hallo, hai, hei, p, assalamualaikum, dll)
    if (
      q.match(/^(halo+|hallo+|hai+|hey+|hei+|hi+|p|tes|test|assalamu['`]?alaikum|selamat\s*(pagi|siang|sore|malam)|sampurasun|punten|permisi)(\s|[!.,?~]|$)/i) ||
      ['halo', 'hallo', 'hai', 'hi', 'hey', 'hei', 'p'].includes(q)
    ) {
      return "Halo! 👋 Senang bisa menyapa Anda. Ada yang bisa Cherry bantu hari ini? 😊";
    }

    // 7. BIAYA SEKOLAH JUARA & SEKOLAH DAYA SETARA / APAKAH GRATIS?
    if (q.includes('biaya') || q.includes('bayar') || q.includes('gratis') || q.includes('spp') || q.includes('uang sekolah') || q.includes('uang gedung') || q.includes('tarif')) {
      return "🏫 **Informasi Biaya Pendidikan (Sekolah Juara & Sekolah Daya Setara)**:\n\n" +
             "Sekolah Juara (SD) maupun PKBM Sekolah Daya Setara **TIDAK GRATIS**. Keduanya merupakan unit pendidikan binaan ACF Eduhub dengan biaya pendidikan terjangkau untuk menunjang mutu belajar dan fasilitas siswa.\n\n" +
             "Untuk rincian lengkap mengenai biaya formulir pendaftaran, uang pangkal, SPP bulanan, maupun program beasiswa, silakan hubungi narahubung kami di WhatsApp **+62 851-7979-7661**.";
    }

    // 8. INFO PPDB, DAFTAR, DAN BROSUR SEKOLAH JUARA
    if (
      q.includes('ppdb') ||
      q.includes('spmb') ||
      q.includes('brosur') ||
      ((q.includes('cara') || q.includes('gimana') || q.includes('syarat') || q.includes('langkah') || q.includes('alur') || q.includes('daftar') || q.includes('masuk')) &&
       (q.includes('sekolah') || q.includes('juara') || q.includes('siswa') || q.includes('anak') || q.includes('sd')))
    ) {
      return getSekolahJuaraPpdbReply(raw);
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
             "4. Tim Partnership ACF Eduhub akan menghubungi PIC Anda untuk diskusi proposal dan sinergi bersama.\n\n" +
             "Ingin berdiskusi langsung? Hubungi email kemitraan di **welcome@acf.or.id** atau WA di **+62 851-7979-7661**.";
    }

    // 10. CARA JADI RELAWAN (SAHABAT EDUHUB)
    if (
      q.includes('relawan') ||
      q.includes('volunteer') ||
      (q.includes('sahabat') && (q.includes('eduhub') || q.includes('daftar') || q.includes('gabung')))
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

    // 10.5 DAFTAR LOKASI, DAERAH & SEBARAN 10 UNIT SEKOLAH JUARA (SD JUARA)
    if (
      (q.includes('daerah') || q.includes('dimana') || q.includes('di mana') || q.includes('mana saja') || q.includes('mana aja') || q.includes('lokasi') || q.includes('kota') || q.includes('wilayah') || q.includes('tempat') || q.includes('sebaran') || q.includes('persebaran') || q.includes('cabang') || q.includes('tersebar') || q.includes('alamat') || q.includes('daftar') || q.includes('apa saja') || q.includes('apa aja') || q.includes('berapa') || q.includes('da berapa') || q.includes('jumlah') || q.includes('total')) &&
      (q.includes('sekolah') || q.includes('juara') || q.includes('sd') || q.includes('unit'))
    ) {
      return "🏫 **Daftar & Sebaran 10 Unit Sekolah Juara (SD Juara)** binaan ACF Eduhub di Indonesia:\n\n" +
             "1. 📍 **SD Juara Batam** (Kepulauan Riau)\n" +
             "2. 📍 **SD Juara Cilegon** (Banten)\n" +
             "3. 📍 **SD Juara Jakarta Barat** (DKI Jakarta)\n" +
             "4. 📍 **SD Juara Jakarta Timur** (DKI Jakarta)\n" +
             "5. 📍 **SD Juara Jakarta Utara** (DKI Jakarta)\n" +
             "6. 📍 **SD Juara Persa Medan** (Sumatera Utara)\n" +
             "7. 📍 **SD Juara AL Hikmah Jayapura** (Papua)\n" +
             "8. 📍 **SD Juara Semarang** (Jawa Tengah)\n" +
             "9. 📍 **SD Juara Surabaya** (Jawa Timur)\n" +
             "10. 📍 **SD Juara AL Hakim Tangerang** (Banten)\n\n" +
             "Seluruh 10 unit di atas adalah jenjang **Sekolah Dasar (SD)** formal berkualitas. Untuk kontak alamat cabang terdekat atau info kunjungan, silakan hubungi narahubung kami di WhatsApp **+62 851-7979-7661** 😊";
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

    // 10.7 KURIKULUM / KURIKULUM LANGIT / KEGIATAN BELAJAR
    if (q.includes('kurikulum') || q.includes('kurikulum langit') || q.includes('belajar apa') || q.includes('pembelajaran') || q.includes('pelajaran') || q.includes('tahfidz') || q.includes('akhlak')) {
      return "📖 **Kurikulum Pembelajaran di Sekolah Juara**:\n\n" +
             "Sekolah Juara memadukan **Kurikulum Nasional (Kemendikbudristek)** dengan ciri khas keunggulan ACF Eduhub yaitu **Kurikulum Langit**:\n\n" +
             "• 🌟 **Kurikulum Langit**: Pembinaan tauhid, akhlak mulia, adab islami, serta tahsin & tahfidz Al-Qur'an harian.\n" +
             "• 💡 **Leadership & Entrepreneurship**: Melatih kepemimpinan, kemandirian, dan pola pikir wirausaha sejak dini.\n" +
             "• 💻 **Literasi Digital**: Pengenalan teknologi modern dan pembelajaran berbasis digital yang menyenangkan.\n\n" +
             "Tujuannya adalah melahirkan generasi berprestasi (Juara) yang berkepribadian tangguh dan berakhlak mulia.";
    }

    // 10.8 FASILITAS SEKOLAH JUARA
    if (q.includes('fasilitas') || q.includes('sarana') || q.includes('gedung') || q.includes('prasarana')) {
      return "🏫 **Fasilitas di Unit Sekolah Juara**:\n\n" +
             "Setiap unit Sekolah Juara dilengkapi dengan fasilitas pendukung belajar ramah anak:\n" +
             "• Ruang kelas nyaman, bersih, dan berpendingin/ventilasi sehat\n" +
             "• Pojok baca & perpustakaan literasi anak\n" +
             "• Laboratorium komputer & multimedia digital\n" +
             "• Sarana olahraga dan area bermain siswa\n" +
             "• Ruang ibadah / musholla bersih\n" +
             "• Program nutrisi & sarapan sehat siswa";
    }

    // 11. APA ITU SEKOLAH JUARA / PENJELASAN SEKOLAH JUARA (HANYA JIKA BERTANYA DEFINISI)
    if (
      q === 'sekolah juara' || q === 'sd juara' ||
      ((q.includes('sekolah juara') || q.includes('sd juara') || q.includes('juara')) &&
       (q.includes('apa') || q.includes('tentang') || q.includes('maksud') || q.includes('profil') || q.includes('penjelasan') || q.includes('definisi') || q.includes('arti') || q.includes('info') || q.includes('informasi')))
    ) {
      return "🏆 **Sekolah Juara** adalah jaringan 10 unit **Sekolah Dasar (SD Juara)** formal berkualitas binaan ACF Eduhub yang mendidik generasi penerus bangsa.\n\n" +
             "Sekolah Juara memadukan kurikulum nasional dengan pembinaan akhlak mulia melalui Kurikulum Langit, kepemimpinan (*leadership*), kewirausahaan, serta kecintaan terhadap Al-Qur'an.\n\n" +
             "• Ingin tahu daftar 10 lokasinya? Ketik **'lokasi sekolah juara'**.\n" +
             "• Ingin tahu info biaya & pendaftaran? Ketik **'biaya sekolah juara'** atau **'syarat daftar'**.";
    }

    // 12. APA ITU SEKOLAH DAYA SETARA / PKBM / KEJAR PAKET
    if (q.includes('daya setara') || q.includes('pkbm') || q.includes('kejar paket') || q.includes('paket c') || q.includes('paket b')) {
      return "📖 **Sekolah Daya Setara** adalah 7 unit PKBM (Pusat Kegiatan Belajar Masyarakat) pendidikan non-formal kesetaraan yang berfokus pada **Paket B (setara SMP)** dan **Paket C (setara SMA)** serta pelatihan vokasi mandiri binaan ACF Eduhub dengan biaya terjangkau.\n\n" +
             "Sekolah Daya Setara khusus melayani jenjang Paket B dan Paket C. Program ini membantu anak-anak putus sekolah dan masyarakat prasejahtera mendapatkan ijazah resmi negara serta keahlian kerja mandiri.";
    }

    // 13. APA ITU GURUVERSE
    if (q.includes('guruverse') || (q.includes('guru') && (q.includes('pelatihan') || q.includes('training') || q.includes('kompetensi')))) {
      return "👩‍🏫 **Guruverse.ID** adalah ekosistem peningkatan kapasitas guru yang diinisiasi oleh ACF Eduhub. Hingga kini telah melatih lebih dari **2.000+ guru** di seluruh pelosok Indonesia mengenai metode belajar aktif, pedagogik kreatif, dan pemanfaatan teknologi kelas.";
    }

    // 14. PROGRAM LAYANAN ACF EDUHUB (DINAMIS SESUAI WEBSITE & ADMIN PORTAL)
    if (q.includes('program') || q.includes('layanan') || q.includes('pilar') || q.includes('kegiatan')) {
      return formatDynamicProgramsReply();
    }

    // 15. LOKASI CABANG KOTA TERTENTU
    if (q.includes('jogja') || q.includes('yogyakarta')) {
      return "🏫 **Sekolah Juara Yogyakarta** adalah salah satu unit aktif kami di wilayah D.I. Yogyakarta! Unit ini melayani pendidikan berkualitas dengan biaya terjangkau binaan ACF Eduhub. Ingin informasi pendaftaran atau kunjungan di unit Yogyakarta?";
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
             "🏢 **Kantor Pusat**: Jl. Jati Mulya No.9, Gumuruh, Kec. Batununggal, Kota Bandung, Jawa Barat 40275\n\n" +
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

    // 19. ARTIKEL & KABAR TERKINI (DINAMIS DARI WEBSITE & DATABASE)
    if (
      q.includes('artikel') ||
      q.includes('berita') ||
      q.includes('liputan') ||
      q.includes('publikasi') ||
      q === 'kabar' ||
      (q.includes('kabar') && !q.includes('apa kabar') && !q.includes('gimana kabar') && !q.includes('kabar baik') && !q.includes('kabar mu') && !q.includes('kabarmu'))
    ) {
      return formatDynamicArticlesReply();
    }

    // 19.1 TANYA KABAR (Apa kabar, sehat, dll)
    if (q.includes('apa kabar') || q.includes('gimana kabar') || q.includes('sehat') || q.includes('lagi apa')) {
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
             "• **1.812+ Siswa Terdampak** langsung subsidi beasiswa pendidikan\n" +
             "• **2.000+ Guru Terlatih** lewat Guruverse.ID\n" +
             "• **Opini Audit WTP** (Wajar Tanpa Pengecualian) sejak 2024.";
    }

    // 25. KAMU BISA APA / BANTU APA / MENU
    if (q.includes('bisa apa') || q.includes('fitur') || q.includes('bantu apa') || q.includes('menu') || q.includes('panduan')) {
      return "Cherry bisa membantu Anda menemukan informasi lengkap di ACF Eduhub seputar:\n\n" +
             "1. 💖 **Cara & Metode Donasi**: Alur donasi, rekening transfer/QRIS, dan transparansi laporan audit WTP.\n" +
             "2. 🏫 **Sekolah Juara (SD)**: Pendidikan formal SD, Kurikulum Langit, syarat PPDB, dan 10 lokasi unit.\n" +
             "3. 📖 **Sekolah Daya Setara (PKBM)**: Pendidikan kesetaraan Paket B (SMP), Paket C (SMA) & pelatihan vokasi mandiri.\n" +
             "4. 👩‍🏫 **Guruverse.ID**: Platform digital pelatihan guru dan pengembangan kompetensi pedagogik.\n" +
             "5. 📚 **Program Layanan**: Keberlanjutan unit, pemberdayaan sekolah, kemanusiaan, dan bantuan langsung.\n" +
             "6. 🤝 **Kemitraan CSR & Relawan**: Menjadi mitra program perusahaan atau relawan Sahabat Eduhub.\n" +
             "7. 📰 **Artikel & Kabar**: Liputan inisiatif, dokumentasi kegiatan, dan publikasi edukasi terkini.\n" +
             "8. 🏢 **Profil Yayasan**: Sejarah 10+ tahun, visi misi, legalitas WTP, dan kemitraan.\n" +
             "9. 📍 **Lokasi & Kontak**: Alamat kantor pusat Bandung dan nomor WhatsApp resmi admin.\n\n" +
             "Silakan ketik pertanyaan Anda!";
    }

    // 26. DEFAULT NATURAL RESPONSE (NYAMBUNG DAN FLEKSIBEL)
    return `Terima kasih atas pertanyaannya! 😊 Mengenai **"${escapeHtml(raw)}"**, Cherry siap bantu jelaskan lebih dalam. Anda bisa menanyakan hal spesifik seputar:\n\n` +
           "• 💖 **Cara Donasi & Metode Pembayaran**\n" +
           "• 🏫 **Sekolah Juara (SD)**: Kurikulum & Info Pendaftaran\n" +
           "• 📖 **Sekolah Daya Setara (PKBM)**: Paket B & C serta Vokasi\n" +
           "• 👩‍🏫 **Guruverse.ID**: Ekosistem Pelatihan Guru Indonesia\n" +
           "• 📚 **Program Layanan**\n" +
           "• 🤝 **Kerjasama Mitra CSR & Relawan (Sahabat Eduhub)**\n" +
           "• 📰 **Artikel & Kabar Berita Terkini**\n" +
           "• 🏢 **Profil Yayasan & Visi Misi**\n" +
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
                <li>📖 <strong>Sekolah Daya Setara (PKBM)</strong>: Paket B & C serta Vokasi</li>
                <li>👩‍🏫 <strong>Guruverse.ID</strong>: Pelatihan Guru Indonesia</li>
                <li>📚 <strong>Program Layanan</strong></li>
                <li>🤝 <strong>Kemitraan CSR</strong></li>
                <li>🙋‍♀️ <strong>Jadi Relawan</strong>: Sahabat Eduhub</li>
                <li>📰 <strong>Artikel & Kabar</strong>: Berita Kegiatan & Edukasi Terbaru</li>
                <li>🏢 <strong>Profil Yayasan</strong>: Visi Misi, Cerita Kami & Mitra</li>
                <li>📍 <strong>Alamat & Kontak WhatsApp Admin</strong></li>
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
          <button type="button" class="cherry-chip" data-query="sekolah daya setara">📖 Sekolah Daya Setara</button>
          <button type="button" class="cherry-chip" data-query="guruverse">👩‍🏫 Guruverse.ID</button>
          <button type="button" class="cherry-chip" data-query="program layanan">📚 Program Layanan</button>
          <button type="button" class="cherry-chip" data-query="artikel dan kabar terbaru">📰 Artikel & Kabar</button>
          <button type="button" class="cherry-chip" data-query="cara jadi mitra csr">🤝 Jadi Mitra</button>
          <button type="button" class="cherry-chip" data-query="cara jadi relawan">🙋‍♀️ Jadi Relawan</button>
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

    // Sinkronkan artikel terbaru secara dinamis dari database / API
    syncLatestArticlesFromWeb();

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
    function scrollToBottom(smooth = false) {
      setTimeout(() => {
        if (!chatBody) return;
        if (smooth) {
          chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: 'smooth' });
        } else {
          chatBody.scrollTop = chatBody.scrollHeight;
        }
      }, 50);
    }

    // Isolate scrolling to Chat Window (prevent background webpage from scrolling)
    chatWindow.addEventListener('wheel', (e) => {
      if (!chatBody) return;
      chatBody.scrollTop += e.deltaY;
      e.stopPropagation();
      e.preventDefault();
    }, { passive: false });

    // Touch events for mobile to prevent background page scroll chaining
    let touchStartY = 0;
    chatWindow.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    chatWindow.addEventListener('touchmove', (e) => {
      if (!chatBody) return;
      const touchY = e.touches[0].clientY;
      const touchDiff = touchStartY - touchY;
      if (!e.target.closest('#cherryBody')) {
        e.preventDefault();
        chatBody.scrollTop += touchDiff;
        touchStartY = touchY;
      } else {
        const atTop = chatBody.scrollTop <= 0 && touchDiff < 0;
        const atBottom = (chatBody.scrollTop + chatBody.clientHeight >= chatBody.scrollHeight - 1) && touchDiff > 0;
        if (atTop || atBottom) {
          e.preventDefault();
        }
      }
    }, { passive: false });

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
