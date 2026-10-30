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
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${encodeURIComponent(apiKey)}`;
    const systemPrompt = `Kamu adalah "Cherry", asisten AI resmi yang super ramah, ceria, hangat, dan bersahabat dari yayasan pendidikan ACF Eduhub.
Warna identitasmu dan ACF Eduhub adalah Ungu (#7D2280) dan Kuning Emas (#F5A623).

Gaya Komunikasi & Persona:
1. Panggil pengguna dengan sebutan hangat: "Sahabat Ceria".
2. Sebut dirimu sebagai "Cherry" atau "aku".
3. Gunakan bahasa Indonesia yang santai, luwes, dan easy-going (ala admin muda edutech modern seperti Kitabisa/Ruangguru), tidak kaku, tidak seperti robot atau birokrasi, namun tetap santun dan penuh empati.
4. Gunakan partikel percakapan alami yang ramah seperti "nih", "ya", "yaa", "yuk", "udah", "gimana", "lho", "kan".
5. ATURAN SAPAAN (PENTING):
   Jika pengguna hanya menyapa santai (seperti 'halo', 'hai', 'uy', 'woy', 'p', 'assalamualaikum', 'tes', 'pagi', 'siang', dll), cukup balas singkat dan ramah:
   "Halo Sahabat Ceria! 👋 Ada yang bisa Cherry bantu hari ini? 😊"
   (JANGAN mencantumkan daftar Sekolah Juara, donasi, atau program lainnya saat hanya disapa).
6. ATURAN PPDB & PENDAFTARAN SEKOLAH JUARA (PENTING):
   Jika ditanya soal PPDB, pendaftaran, formulir, atau brosur Sekolah Juara (misal 'ppdb ss sekolah juara batam'):
   LANGSUNG berikan tautan online pendaftaran dan tautan unduh brosur PDF unit yang dituju. JANGAN menuliskan teks panjang soal syarat berkas SKTM, KK, atau akta lahir.
   Contoh link:
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
    Jika ditanya cara daftar jadi relawan, arahkan ke menu [Jadi Relawan](form-relawan.html) untuk bergabung dengan komunitas Sahabat Eduhub.
12. Selalu nyambung dengan pertanyaan apa pun, komunikatif, solutif, dan gunakan emoji yang pas.`;

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
          maxOutputTokens: 800,
          thinkingConfig: {
            thinkingBudget: 0
          }
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
    const list = getDynamicPrograms();
    let reply = "📚 **Program Layanan ACF Eduhub (7 Program Aktif)**:\n\n" +
                "Ini dia 7 inisiatif program layanan pendidikan yang dikelola oleh ACF Eduhub nih, Sahabat Ceria:\n\n";

    list.forEach((p, idx) => {
      const num = idx + 1;
      const title = p.title || 'Program Layanan';
      const divisi = p.divisi ? ` *(Divisi: ${p.divisi})*` : '';
      const desc = p.quote || p.categoryDesc || '';
      reply += `${num}. 🎯 **${title}**${divisi}\n`;
      if (desc) {
        reply += `   ${desc}\n`;
      }
    });

    reply += "\nSeluruh program di atas terintegrasi dalam ekosistem pendidikan ACF Eduhub. Sahabat Ceria bisa pelajari detail lengkap atau ajukan kemitraan di menu [Program Layanan](program-layanan.html) yaa! 😊";
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
                "Ini dia artikel dan berita terhangat yang baru terbit di website nih, Sahabat Ceria:\n\n";

    list.forEach((art, idx) => {
      const num = idx + 1;
      const title = art.title || 'Artikel Edukasi ACF';
      const cat = art.categoryLabel || (art.category && art.category.includes('juara') ? 'Artikel Sekolah Juara' : 'Artikel Sekolah Daya Setara');
      const date = art.date ? ` • 📅 ${art.date}` : '';
      const link = art.id ? `kabar.html?id=${encodeURIComponent(art.id)}` : 'kabar.html';
      const excerpt = art.excerpt ? `\n   ${art.excerpt.substring(0, 115).trim()}...` : '';

      reply += `${num}. 📝 **[${title}](${link})**\n   🏷️ *${cat}*${date}${excerpt}\n\n`;
    });

    reply += "Sahabat Ceria bisa membaca artikel lengkapnya dengan mengklik judul di atas atau langsung kunjungi halaman [Kabar](kabar.html) yaa! ✨";
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
        return `🎒 **Info Pendaftaran & Brosur SPMB ${s.name}**:\n\n` +
               `Siap Sahabat Ceria! Ini dia tautan pendaftaran online dan unduh brosur resmi buat **${s.name}** yaa:\n\n` +
               `• 📝 **Formulir Pendaftaran**: [Klik Daftar Online ${s.name}](${s.daftar})\n` +
               `• 📖 **Brosur Sekolah**: [Buka & Unduh Brosur PDF](${s.brosur})\n\n` +
               `Gampang kan? Sahabat Ceria juga bisa kepoin profil sekolahnya di halaman [Sekolah Juara](sekolah-juara.html). Kalau ada yang mau ditanyakan lagi soal biaya atau jadwal tesnya, chat admin di WhatsApp **+62 851-7979-7661** yaa! 😊`;
      }
    }

    // Tampilkan seluruh 10 unit dengan tautan pendaftaran & brosur
    let reply = "🎒 **Link Pendaftaran & Brosur SPMB/PPDB Sekolah Juara (SD)**:\n\n" +
                "Halo Sahabat Ceria! Mau daftar di cabang mana nih? Yuk langsung klik link pendaftaran online atau unduh brosur resmi unit yang dituju di bawah ini:\n\n";

    SJ_SCHOOLS.forEach((s, idx) => {
      reply += `${idx + 1}. **${s.name}**\n` +
               `   • 📝 [Daftar Online](${s.daftar}) | 📖 [Buka Brosur](${s.brosur})\n\n`;
    });

    reply += "Detail profil lengkap tiap unit bisa kamu lihat di menu [Sekolah Juara](sekolah-juara.html). Kalau ada yang bikin bingung, tanya Cherry lagi yaa! ✨";
    return reply;
  }

  function getLocalKnowledgeReply(query) {
    const raw = (query || '').trim();
    const q = raw.toLowerCase();

    // 1. SAPAAN & PANGGILAN SANTAI / GAUL (RESPON SINGKAT & RAMAH TANPA MENYEBUT SEKOLAH JUARA DLL)
    const greetingsList = [
      'halo', 'hallo', 'hai', 'hi', 'hey', 'hei', 'uy', 'ui', 'oy', 'oi', 'woy', 'woi',
      'yoo', 'yo', 'bro', 'sis', 'min', 'mimin', 'admin', 'p', 'ping', 'tes', 'test', 'cek',
      'assalamualaikum', 'assalamu alaikum', 'sampurasun', 'punten', 'permisi', 'misi',
      'pagi', 'siang', 'sore', 'malam', 'selamat pagi', 'selamat siang', 'selamat sore', 'selamat malam',
      'cherry', 'hai cherry', 'halo cherry', 'hei cherry', 'kuy', 'lur', 'gan', 'kak', 'kak admin'
    ];
    if (
      greetingsList.includes(q) ||
      q.match(/^(halo+|hallo+|hai+|hey+|hei+|hi+|uy+|ui+|oy+|woy+|woi+|oi+|yo+|p+|ping|tes|test|assalamu['`]?alaikum|selamat\s*(pagi|siang|sore|malam)|sampurasun|punten|permisi)(\s|[!.,?~]|$)/i) ||
      q.length <= 5
    ) {
      return "Halo Sahabat Ceria! 👋 Ada yang bisa Cherry bantu hari ini? 😊";
    }

    // 2. TANYA KABAR & KEADAAN
    if (q.includes('apa kabar') || q.includes('gimana kabar') || q.includes('sehat') || q.includes('lagi apa') || q.includes('lagi ngapain') || q.includes('kabar kamu') || q.includes('kabarmu')) {
      return "Kabar Cherry luar biasa baik dan selalu ceria dong! ✨\n\nSahabat Ceria gimana kabarnya hari ini? Semoga selalu sehat, bahagia, dan harinya menyenangkan yaa. Ada info yang pengen kamu tanyain ke Cherry?";
    }

    // 3. CARA DONASI / METODE DONASI
    if (
      (q.includes('cara') || q.includes('gimana') || q.includes('bagaimana') || q.includes('langkah') || q.includes('alur') || q.includes('mau') || q.includes('pengen') || q.includes('ingin') || q.includes('bisa') || q.includes('tata cara') || q.includes('prosedur')) &&
      (q.includes('donasi') || q.includes('transfer') || q.includes('sedekah') || q.includes('infaq') || q.includes('rekening') || q.includes('bayar') || q.includes('nyumbang'))
    ) {
      return "💖 **Cara Menyalurkan Donasi di ACF Eduhub**:\n\n" +
             "MasyaAllah, terima kasih banyak ya Sahabat Ceria atas niat mulianya! Kebaikan kamu sangat berarti buat masa depan anak-anak dhuafa. Caranya gampang banget:\n\n" +
             "1. Buka menu [Donasi](donasi.html) di website ini.\n" +
             "2. Pilih program yang pengen kamu dukung (misal: *Beasiswa Sekolah Juara*, *Nutrisi Siswa*, atau *Fasilitas Belajar*).\n" +
             "3. Masukkan nominal donasi dan isi data diri singkat.\n" +
             "4. Pilih metode pembayaran favoritmu (Transfer BCA, Mandiri, BRI, BSI, Virtual Account, atau scan QRIS via GoPay, OVO, ShopeePay, DANA).\n" +
             "5. Selesaikan pembayaran, dan tanda terima resmi donasi langsung dikirimkan.\n\n" +
             "Mau konfirmasi atau transfer manual? Bisa langsung chat admin WA kami di **+62 851-7979-7661** yaa. Berkah selalu buat kamu! 😊";
    }

    // 4. METODE PEMBAYARAN / REKENING DONASI / BANK
    if (
      q.includes('rekening') || q.includes('no rek') || q.includes('nomor rekening') ||
      ((q.includes('bank') || q.includes('transfer') || q.includes('pembayaran') || q.includes('metode')) && (q.includes('donasi') || q.includes('bca') || q.includes('mandiri') || q.includes('bri') || q.includes('bsi') || q.includes('qris')))
    ) {
      return "💳 **Metode Pembayaran & Rekening Donasi**:\n\n" +
             "Berdonasi di ACF Eduhub praktis banget lho Sahabat Ceria! Kamu bisa pilih cara yang paling nyaman:\n\n" +
             "• **QRIS Instan**: Tinggal scan pakai BCA Mobile, Livin Mandiri, GoPay, OVO, Dana, ShopeePay, atau LinkAja.\n" +
             "• **Transfer Bank**: Tersedia Bank Mandiri, BCA, BRI, dan BSI atas nama **Yayasan Amal Khair Yasmin / ACF Eduhub**.\n" +
             "• **Virtual Account (VA)**: Otomatis terverifikasi saat berdonasi di halaman [Donasi](donasi.html).\n\n" +
             "Butuh bantuan transfer atau konfirmasi kwitansi? Hubungi admin di WhatsApp **+62 851-7979-7661** yaa!";
    }

    // 5. KEAMANAN / LAPORAN AUDIT / WTP
    if (q.includes('aman') || q.includes('terpercaya') || q.includes('audit') || q.includes('wtp') || q.includes('laporan keuangan') || q.includes('transparan') || q.includes('bukti donasi')) {
      return "🛡️ **Donasi Sahabat Ceria 100% Aman & Terpercaya!**\n\n" +
             "Tenang aja ya Sahabat Ceria, ACF Eduhub adalah yayasan resmi berbadan hukum yang sudah berkiprah lebih dari 10 tahun. Laporan keuangan yayasan kami diaudit rutin oleh Kantor Akuntan Publik independen dan berhasil meraih predikat tertinggi **WTP (Wajar Tanpa Pengecualian)** sejak 2024.\n\n" +
             "Setiap rupiah donasi disalurkan tepat sasaran buat operasional sekolah gratis/subsidi, nutrisi siswa, dan fasilitas belajar anak-anak dhuafa.";
    }

    // 6. DONASI UMUM
    if (q === 'donasi' || q.includes('donasi') || q.includes('infaq') || q.includes('sedekah') || q.includes('donatur')) {
      return "💖 **Aksi Kebaikan Bersama ACF Eduhub**:\n\n" +
             "Senang banget lihat kepedulian Sahabat Ceria! Kebaikan kamu adalah alasan ribuan anak-anak prasejahtera bisa terus tersenyum dan bersekolah.\n\n" +
             "Program kebaikan yang bisa kamu dukung nih:\n" +
             "• 🏫 **Beasiswa Binaan Kelas**: Subsidi sekolah anak dhuafa selama satu tahun penuh.\n" +
             "• 🍱 **Gizi & Nutrisi Siswa**: Sarapan sehat bergizi biar anak-anak fokus belajar.\n" +
             "• 📖 **Sarana Belajar & Vokasi**: Perlengkapan sekolah dan alat keterampilan mandiri.\n\n" +
             "Yuk salurkan kebaikanmu dengan mudah lewat menu [Donasi](donasi.html)! ✨";
    }

    // 7. INGIN BERTANYA / BANTU DONG
    if (
      q.includes('mau tanya') || q.includes('tanya dong') || q.includes('mau nanya') ||
      q.includes('nanya dong') || q.includes('bisa tanya') || q.includes('bantu dong') ||
      q.includes('minta tolong') || q.includes('tolong dong') || q === 'tanya' || q === 'bantu' || q === 'info dong' || q === 'mau info'
    ) {
      return "Boleh banget dong Sahabat Ceria! 😊 Silakan tanyakan apa aja yang pengen kamu tahu seputar Sekolah Juara (SD), pendaftaran PPDB, program layanan, relawan, atau donasi. Cherry siap jawabin satu-satu!";
    }

    // 8. BIAYA SEKOLAH JUARA & SEKOLAH DAYA SETARA
    if (q.includes('biaya') || q.includes('bayar') || q.includes('gratis') || q.includes('spp') || q.includes('uang sekolah') || q.includes('uang gedung') || q.includes('tarif')) {
      return "🏫 **Info Biaya Pendidikan (Sekolah Juara & Sekolah Daya Setara)**:\n\n" +
             "Mengenai biaya pendidikan di Sekolah Juara (SD) maupun PKBM Sekolah Daya Setara, biayanya sangat terjangkau ya Sahabat Ceria! 😊\n\n" +
             "Untuk mengetahui rincian lengkap mengenai biaya formulir pendaftaran, uang pangkal, SPP bulanan, maupun informasi program beasiswa di unit kota tujuanmu, Sahabat Ceria bisa langsung chat admin kami via WhatsApp di **+62 851-7979-7661** yaa!";
    }

    // 9. INFO PPDB, DAFTAR, DAN BROSUR SEKOLAH JUARA
    if (
      q.includes('ppdb') ||
      q.includes('spmb') ||
      q.includes('brosur') ||
      ((q.includes('cara') || q.includes('gimana') || q.includes('syarat') || q.includes('langkah') || q.includes('alur') || q.includes('daftar') || q.includes('masuk')) &&
       (q.includes('sekolah') || q.includes('juara') || q.includes('siswa') || q.includes('anak') || q.includes('sd')))
    ) {
      return getSekolahJuaraPpdbReply(raw);
    }

    // 10. CARA JADI MITRA PROGRAM / CSR
    if (
      (q.includes('cara') || q.includes('gimana') || q.includes('syarat') || q.includes('langkah') || q.includes('mau') || q.includes('alur') || q.includes('tata')) &&
      (q.includes('mitra') || q.includes('kerjasama') || q.includes('kolaborasi') || q.includes('csr') || q.includes('sponsor') || q.includes('perusahaan'))
    ) {
      return "🤝 **Kemitraan CSR & Kolaborasi Program**:\n\n" +
             "Wah, kami terbuka banget buat berkolaborasi dengan perusahaan atau komunitas Sahabat Ceria! Caranya simpel kok:\n\n" +
             "1. Masuk ke halaman [Jadi Mitra Program](form-mitra.html).\n" +
             "2. Isi profil singkat perusahaan/lembaga dan pilih program yang diminati (Beasiswa Kelas, Green School, Sarana Belajar, dll).\n" +
             "3. Kirim formulirnya.\n" +
             "4. Tim Partnership ACF Eduhub bakal langsung menghubungi PIC kamu buat diskusi proposal dan sinergi bersama.\n\n" +
             "Mau ngobrol langsung? Email kami di **welcome@acf.or.id** atau chat WA di **+62 851-7979-7661** ya!";
    }

    // 11. CARA JADI RELAWAN (SAHABAT EDUHUB)
    if (
      q.includes('relawan') ||
      q.includes('volunteer') ||
      (q.includes('sahabat') && (q.includes('eduhub') || q.includes('daftar') || q.includes('gabung')))
    ) {
      return "🙋‍♀️ **Yuk Gabung Jadi Relawan (Sahabat Eduhub)!**\n\n" +
             "Keren banget niat baik Sahabat Ceria! Bareng komunitas Sahabat Eduhub, kamu bisa berbagi inspirasi dan senyuman buat adik-adik di seluruh Indonesia. Caranya gampang:\n\n" +
             "1. Buka formulir di halaman [Jadi Relawan](form-relawan.html).\n" +
             "2. Isi data diri kamu dan pilih bidang yang paling cocok sama minatmu:\n" +
             "   • *Relawan Pengajar / Tutor*\n" +
             "   • *Fasilitator Kegiatan & Event*\n" +
             "   • *Dokumentasi, Foto, & Desain Konten*\n" +
             "   • *Mentor Inspiratif & Karakter*\n" +
             "3. Kirim pendaftaran, dan tim kami bakal ngajak kamu ke sesi orientasi komunitas yang seru!\n\n" +
             "Yuk bareng Cherry jadi bagian dari perubahan positif! ✨";
    }

    // 12. DAFTAR LOKASI, DAERAH & SEBARAN 10 UNIT SEKOLAH JUARA (SD JUARA)
    if (
      (q.includes('daerah') || q.includes('dimana') || q.includes('di mana') || q.includes('mana saja') || q.includes('mana aja') || q.includes('lokasi') || q.includes('kota') || q.includes('wilayah') || q.includes('tempat') || q.includes('sebaran') || q.includes('cabang') || q.includes('tersebar') || q.includes('alamat') || q.includes('daftar') || q.includes('berapa') || q.includes('da berapa') || q.includes('jumlah') || q.includes('total')) &&
      (q.includes('sekolah') || q.includes('juara') || q.includes('sd'))
    ) {
      return "🏫 **Daftar 10 Unit Sekolah Dasar (SD Juara)**:\n\n" +
             "Fyi nih Sahabat Ceria, Sekolah Juara punya 10 unit yang tersebar di berbagai kota di Indonesia, dan seluruhnya adalah jenjang SD:\n\n" +
             "1. SD Juara Batam\n" +
             "2. SD Juara Cilegon\n" +
             "3. SD Juara Jakarta Barat\n" +
             "4. SD Juara Jakarta Timur\n" +
             "5. SD Juara Jakarta Utara\n" +
             "6. SD Juara Persa Medan\n" +
             "7. SD Juara AL Hikmah Jayapura\n" +
             "8. SD Juara Semarang\n" +
             "9. SD Juara Surabaya\n" +
             "10. SD Juara AL Hakim Tangerang\n\n" +
             "Sahabat Ceria bisa cek info pendaftaran & unduh brosur masing-masing unit di halaman [Sekolah Juara](sekolah-juara.html) yaa!";
    }

    // 12.5 SEBARAN & LOKASI SEKOLAH DAYA SETARA (PKBM CERIA)
    if (
      q.includes('daya setara') ||
      q.includes('pkbm') ||
      (q.includes('setara') && (q.includes('sekolah') || q.includes('bandung') || q.includes('lokasi') || q.includes('cabang')))
    ) {
      if (
        q.includes('bandung') ||
        q.includes('lembang') ||
        q.includes('ngamprah') ||
        q.includes('ujungberung') ||
        q.includes('ujung berung')
      ) {
        return "🏫 **Sekolah Daya Setara di Bandung Raya**:\n\n" +
               "Di wilayah Bandung Raya, Sekolah Daya Setara (PKBM Ceria) memiliki **3 unit/cabang** nih, Sahabat Ceria:\n\n" +
               "1. 📍 **Sekolah Daya Setara Ngamprah** (Kab. Bandung Barat)\n" +
               "2. 📍 **Sekolah Daya Setara Lembang** (Kab. Bandung Barat)\n" +
               "3. 📍 **Sekolah Daya Setara Ujungberung** (Kota Bandung)\n\n" +
               "Ketiga unit ini melayani pendidikan kesetaraan Paket B (setara SMP) dan Paket C (setara SMA) serta pelatihan vokasi siap kerja dengan sistem belajar yang fleksibel.\n\n" +
               "Sahabat Ceria juga bisa melihat dokumentasi dan peta sebarannya di halaman [Sekolah Daya Setara](sekolah-daya-setara.html), atau kalau mau info pendaftaran bisa langsung kontak admin di WhatsApp **+62 851-7979-7661** yaa! 😊";
      }

      if (q.includes('sukabumi') || q.includes('cisolok')) {
        return "🏫 **Sekolah Daya Setara di Sukabumi**:\n\n" +
               "Untuk wilayah Sukabumi, unit kami adalah **Sekolah Daya Setara Cisolok** yang melayani program kesetaraan Paket B dan C serta vokasi mandiri.\n\n" +
               "Sahabat Ceria bisa cek info lengkapnya di halaman [Sekolah Daya Setara](sekolah-daya-setara.html) yaa! ✨";
      }

      if (q.includes('indramayu') || q.includes('arahan')) {
        return "🏫 **Sekolah Daya Setara di Indramayu**:\n\n" +
               "Untuk wilayah Indramayu, unit kami adalah **PKBM Ceria Arahan** yang melayani program kesetaraan Paket B dan C serta vokasi mandiri.\n\n" +
               "Sahabat Ceria bisa cek info lengkapnya di halaman [Sekolah Daya Setara](sekolah-daya-setara.html) yaa! ✨";
      }

      if (q.includes('pangandaran') || q.includes('padaherang')) {
        return "🏫 **Sekolah Daya Setara di Pangandaran**:\n\n" +
               "Untuk wilayah Pangandaran, unit kami adalah **PKBM Ceria Padaherang** yang melayani program kesetaraan Paket B dan C serta vokasi mandiri.\n\n" +
               "Sahabat Ceria bisa cek info lengkapnya di halaman [Sekolah Daya Setara](sekolah-daya-setara.html) yaa! ✨";
      }

      if (q.includes('jayapura') || q.includes('papua')) {
        return "🏫 **Sekolah Daya Setara di Jayapura**:\n\n" +
               "Untuk wilayah Jayapura (Papua), unit kami adalah **Sekolah Daya Setara Jayapura** yang melayani program kesetaraan Paket B dan C serta vokasi mandiri.\n\n" +
               "Sahabat Ceria bisa cek info lengkapnya di halaman [Sekolah Daya Setara](sekolah-daya-setara.html) yaa! ✨";
      }

      if (
        q.includes('dimana') ||
        q.includes('di mana') ||
        q.includes('lokasi') ||
        q.includes('cabang') ||
        q.includes('daerah') ||
        q.includes('wilayah') ||
        q.includes('sebaran') ||
        q.includes('kota') ||
        q.includes('berapa') ||
        q.includes('da berapa') ||
        q.includes('jumlah') ||
        q.includes('total') ||
        q.includes('titik') ||
        q.includes('mana aja') ||
        q.includes('mana saja')
      ) {
        return "🗺️ **Peta Sebaran 7 Unit Sekolah Daya Setara (PKBM Ceria)**:\n\n" +
               "Sekolah Daya Setara hadir di **7 titik/unit** di Indonesia untuk memperluas akses pendidikan kesetaraan dan vokasi mandiri nih, Sahabat Ceria:\n\n" +
               "• **Bandung Raya (3 Unit)**:\n" +
               "  1. 📍 **Sekolah Daya Setara Ngamprah** (Kab. Bandung Barat)\n" +
               "  2. 📍 **Sekolah Daya Setara Lembang** (Kab. Bandung Barat)\n" +
               "  3. 📍 **Sekolah Daya Setara Ujungberung** (Kota Bandung)\n\n" +
               "• **Sukabumi (1 Unit)**:\n" +
               "  4. 📍 **Sekolah Daya Setara Cisolok**\n\n" +
               "• **Indramayu (1 Unit)**:\n" +
               "  5. 📍 **PKBM Ceria Arahan**\n\n" +
               "• **Pangandaran (1 Unit)**:\n" +
               "  6. 📍 **PKBM Ceria Padaherang**\n\n" +
               "• **Jayapura (1 Unit)**:\n" +
               "  7. 📍 **Sekolah Daya Setara Jayapura**\n\n" +
               "Semua unit siap memfasilitasi Paket B (setara SMP) dan Paket C (setara SMA) serta keterampilan kerja. Info lengkapnya bisa dicek di halaman [Sekolah Daya Setara](sekolah-daya-setara.html) yaa! ✨";
      }
    }

    // 13. KOTA TERTENTU (Bandung, Jakarta, Batam, dll)
    if (q.includes('bandung')) {
      return "📍 Buat Sahabat Ceria yang ada di Bandung, **Kantor Pusat ACF Eduhub** beralamat di:\n\n" +
             "🏢 **Alamat**: Jl. Jati Mulya No.9, Gumuruh, Kec. Batununggal, Kota Bandung, Jawa Barat 40275\n" +
             "🗺️ **Google Maps**: [Buka di Google Maps](https://maps.app.goo.gl/GZM6nCS82CcettDcA)\n" +
             "📞 **WhatsApp**: +62 851-7979-7661\n\n" +
             "Selain kantor pusat, di Bandung Raya kami juga memiliki 3 unit **Sekolah Daya Setara (PKBM Ceria)** yaitu di Ngamprah, Lembang, dan Ujungberung lho! Ada yang bisa Cherry bantu? 😊";
    }
    if (q.includes('jakarta')) {
      return "🏫 Di wilayah DKI Jakarta ada 3 unit SD Juara nih Sahabat Ceria:\n• **SD Juara Jakarta Barat**\n• **SD Juara Jakarta Timur**\n• **SD Juara Jakarta Utara**\n\nKamu bisa langsung daftar atau unduh brosurnya di menu [Sekolah Juara](sekolah-juara.html)!";
    }

    // 14. JENJANG PENDIDIKAN
    if (
      (q.includes('jenjang') || q.includes('tingkat') || q.includes('smp') || q.includes('smk') || q.includes('sma') || q.includes('kelas') || q.includes('hanya sd') || q.includes('cuma sd')) &&
      (q.includes('sekolah') || q.includes('juara') || q.includes('pendidikan'))
    ) {
      return "ℹ️ **Jenjang Pendidikan di Sekolah Juara**:\n\n" +
             "Perlu diingat ya Sahabat Ceria, Sekolah Juara **HANYA ada jenjang Sekolah Dasar (SD)** yaitu 10 unit SD Juara.\n\n" +
             "Di Sekolah Juara **tidak ada jenjang SMP maupun SMA/SMK**. Tapi kalau Sahabat Ceria butuh pendidikan kesetaraan lanjutan (setara SMP/Paket B dan setara SMA/Paket C serta keahlian vokasi kerja mandiri), ACF Eduhub memfasilitasinya lewat unit **PKBM Sekolah Daya Setara**!";
    }

    // 15. APA ITU SEKOLAH JUARA
    if (q === 'sekolah juara' || q === 'sd juara' || ((q.includes('sekolah juara') || q.includes('sd juara') || q.includes('juara')) && (q.includes('apa') || q.includes('tentang') || q.includes('maksud') || q.includes('profil') || q.includes('penjelasan') || q.includes('definisi') || q.includes('arti') || q.includes('info') || q.includes('informasi')))) {
      return "🏆 **Mengenal Sekolah Juara**:\n\n" +
             "Sekolah Juara adalah jaringan 10 unit **Sekolah Dasar (SD Juara)** binaan ACF Eduhub yang mendidik generasi berprestasi dan berakhlak mulia.\n\n" +
             "Di sini kurikulum nasional dipadukan dengan pembinaan karakter islami lewat Kurikulum Langit, kepemimpinan (*leadership*), kewirausahaan cilik, dan hafalan Al-Qur'an (tahfidz). Keren kan, Sahabat Ceria?";
    }

    // 16. APA ITU SEKOLAH DAYA SETARA / PKBM
    if (q.includes('daya setara') || q.includes('pkbm') || q.includes('kejar paket') || q.includes('paket c') || q.includes('paket b') || q.includes('kesetaraan')) {
      return "📖 **Mengenal Sekolah Daya Setara (PKBM)**:\n\n" +
             "Sekolah Daya Setara adalah 7 unit Pusat Kegiatan Belajar Masyarakat (PKBM) non-formal binaan ACF Eduhub buat jenjang **Paket B (setara SMP)** dan **Paket C (setara SMA)** serta vokasi mandiri dengan biaya terjangkau.\n\n" +
             "Sekolah Daya Setara tersebar di 7 titik di Indonesia, yaitu **Bandung Raya (Ngamprah, Lembang, Ujungberung)**, Sukabumi (Cisolok), Indramayu (Arahan), Pangandaran (Padaherang), dan Jayapura.\n\n" +
             "Program ini hadir buat ngebantu anak-anak putus sekolah dan masyarakat umum biar bisa dapet ijazah resmi negara dan keterampilan kerja mandiri lho, Sahabat Ceria! Info selengkapnya ada di menu [Sekolah Daya Setara](sekolah-daya-setara.html) yaa!";
    }

    // 17. APA ITU GURUVERSE.ID
    if (q.includes('guruverse') || (q.includes('guru') && (q.includes('pelatihan') || q.includes('training') || q.includes('kompetensi')))) {
      return "👩‍🏫 **Mengenal Guruverse.ID**:\n\n" +
             "Guruverse.ID adalah platform keren dari ACF Eduhub buat ningkatin kapasitas para guru di seluruh Indonesia! Sampai sekarang udah ada lebih dari **2.000+ guru** yang ikut pelatihan metode belajar kreatif, teknologi kelas, dan pedagogik modern bareng kami, Sahabat Ceria.";
    }

    // 18. PROGRAM LAYANAN ACF EDUHUB
    if (q.includes('program layanan') || q.includes('layanan acf') || q.includes('pilar program') || q.includes('7 program') || q === 'program') {
      return formatDynamicProgramsReply();
    }

    // 19. BEASISWA & DHUAFA
    if (q.includes('beasiswa') || q.includes('dhuafa') || q.includes('yatim') || q.includes('keringanan')) {
      return "🎓 **Program Beasiswa ACF Eduhub**:\n\n" +
             "Kabar baik buat Sahabat Ceria! ACF Eduhub punya program subsidi dan beasiswa khusus bagi anak-anak yatim dan keluarga prasejahtera berprestasi di Sekolah Juara maupun PKBM Daya Setara.\n\n" +
             "Buat kepoin kuota beasiswa di unit kota tujuanmu, langsung hubungi admin WA kami di **+62 851-7979-7661** yaa!";
    }

    // 20. LOKASI & ALAMAT KANTOR
    if (q.includes('alamat') || q.includes('lokasi') || q.includes('kantor') || q.includes('pusat') || q.includes('dimana') || q.includes('di mana')) {
      return "📍 **Alamat Kantor Pusat ACF Eduhub**:\n\n" +
             "🏢 **Kantor Pusat**: Jl. Jati Mulya No.9, Gumuruh, Kec. Batununggal, Kota Bandung, Jawa Barat 40275\n\n" +
             "🗺️ **Google Maps**: [Buka di Google Maps](https://maps.app.goo.gl/GZM6nCS82CcettDcA)\n" +
             "📞 **WhatsApp / Telepon**: +62 851-7979-7661\n" +
             "✉️ **Email**: welcome@acf.or.id\n\n" +
             "Informasi alamat ini juga tertera di footer website kami ya, Sahabat Ceria. Kalau kamu lagi di Bandung dan mau bersilaturahmi langsung, pintu kami selalu terbuka lebar! 😊";
    }

    // 21. KONTAK RESMI & SOSIAL MEDIA
    if (q.includes('kontak') || q.includes('telepon') || q.includes('wa') || q.includes('whatsapp') || q.includes('email') || q.includes('admin') || q.includes('hubungi') || q.includes('nomor') || q.includes('instagram') || q.includes('youtube')) {
      return "📞 **Kontak Resmi ACF Eduhub**:\n\n" +
             "Sahabat Ceria bisa menghubungi tim kami kapan aja lewat saluran berikut:\n\n" +
             "• **WhatsApp / Telepon**: +62 851-7979-7661 (ada tombol hijau WA di pojok kiri bawah layar)\n" +
             "• **Email**: welcome@acf.or.id\n" +
             "• **Instagram**: @acf.eduhub\n" +
             "• **YouTube**: JUARA TV\n" +
             "• **Website**: www.acf.or.id\n\n" +
             "Kami siap menyapa dan melayani kamu di jam operasional kerja yaa!";
    }

    // 22. TENTANG YAYASAN ACF EDUHUB
    if (q.includes('apa itu acf') || q.includes('tentang acf') || q.includes('profil acf') || q.includes('yayasan') || q.includes('sejarah') || q.includes('visi') || q.includes('misi')) {
      return "🏫 **Tentang ACF Eduhub**:\n\n" +
             "ACF Eduhub (Yayasan Amal Khair Yasmin) adalah yayasan sosial pendidikan yang udah lebih dari 10 tahun berdedikasi memutus rantai kemiskinan lewat pendidikan berkualitas buat keluarga prasejahtera.\n\n" +
             "• **17 Unit Pendidikan Aktif** (10 SD Juara + 7 PKBM Daya Setara)\n" +
             "• **1.812+ Siswa Terdampak** langsung subsidi beasiswa\n" +
             "• **2.000+ Guru Terlatih** lewat program Guruverse.ID\n" +
             "• **Opini WTP** Audit Keuangan Akuntabel sejak 2024.\n\n" +
             "Senang banget bisa berbagi cerita ini sama Sahabat Ceria! ✨";
    }

    // 23. ARTIKEL & KABAR TERKINI
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

    // 24. UCAPAN TERIMA KASIH & APRESIASI
    if (q.includes('terima kasih') || q.includes('makasih') || q.includes('thanks') || q.includes('nuhun') || q.includes('tengkyu') || q.includes('syukron') || q.includes('thank you')) {
      return "Sama-sama Sahabat Ceria! Senang banget bisa ngebantu kamu hari ini. 😊 Semoga harimu selalu menyenangkan dan penuh berkah ya! Kalau butuh info apa-apa lagi, panggil Cherry kapan aja yaa!";
    }

    // 25. PUJIAN & PERCAKAPAN POSITIF
    if (q.includes('pintar') || q.includes('keren') || q.includes('hebat') || q.includes('bagus') || q.includes('lucu') || q.includes('cantik') || q.includes('top') || q.includes('mantap')) {
      return "Wahh, makasih banyak yaa atas pujiannya Sahabat Ceria! Jadi makin semangat nih nemenin kamu. 😄 Ada yang pengen kamu tanyain lagi seputar ACF Eduhub?";
    }

    // 26. AFIRMASI
    if (q.match(/^(oke+|ok|siap|baik|mantap|sip|yoi|keren|siip)(\s|[!.,?~]|$)/i) || q === 'oke' || q === 'ok' || q === 'siap') {
      return "Siaap Sahabat Ceria! Senang bisa nemenin kamu di website ini. Kalau ada yang bikin penasaran lagi, langsung chat Cherry yaa! ✨";
    }

    // 27. HUMOR & SANTAI
    if (q.includes('wkwk') || q.includes('haha') || q.includes('hehe') || q.includes('xixi') || q.includes('canda') || q.includes('bercanda') || q.includes('gabut')) {
      return "Hehe! Senang bisa ngobrol santai sama Sahabat Ceria. 😄 Selain asyik diajak ngobrol, Cherry juga jago lho cariin info soal sekolah, donasi, atau relawan. Ada yang pengen kamu kepoin?";
    }

    // 28. KELUHAN / BINGUNG
    if (q.includes('bingung') || q.includes('ga paham') || q.includes('gak paham') || q.includes('ga ngerti') || q.includes('gak ngerti') || q.includes('pusing') || q.includes('ribet')) {
      return "Tenang aja ya Sahabat Ceria, jangan bingung-bingung. Cherry bantu pelan-pelan kok! 😊 Kamu bisa klik tombol menu cepat di bawah ini, atau ceritain bagian mana yang pengen Cherry jelasin lagi?";
    }

    // 29. SIAPA KAMU / CHERRY
    if (q.includes('siapa') || q.includes('nama') || q.includes('bot') || q.includes('cherry') || q.includes('robot') || q.includes('ai')) {
      return "Halo Sahabat Ceria! 😊 Kenalin, aku **Cherry**, asisten virtual AI resmi yang ceria dan ramah dari **ACF Eduhub**! Warna kebanggaanku ungu dan kuning emas khas ACF. Tugas Cherry ngebantuin kamu cari info soal Sekolah Juara, donasi beasiswa, kegiatan relawan, dan kontak kami.";
    }

    // 30. PERTANYAAN EKSPLORATIF (apakah, kenapa, bagaimana, kapan, siapa)
    if (q.includes('?') || q.includes('apakah') || q.includes('gimana') || q.includes('kenapa') || q.includes('bagaimana') || q.includes('kapan')) {
      return "Pertanyaan yang bagus banget nih, Sahabat Ceria! Soal hal itu, Cherry siap bantu cariin info paling pas di ACF Eduhub. Apakah ini terkait **pendaftaran sekolah**, **kegiatan siswa**, atau **donasi**? 😊\n\nKamu juga bisa langsung ngobrol sama admin kami via WhatsApp di **+62 851-7979-7661** biar dibantu lebih detail yaa!";
    }

    // 31. DEFAULT NATURAL NYAMBUNG
    return "Terima kasih udah nyapa Cherry ya, Sahabat Ceria! 😊\n\n" +
           "Biar makin gampang, kamu bisa pilih topik yang pengen kamu ketahui nih:\n\n" +
           "• 🏫 **Sekolah Juara (SD)**: Info pendaftaran & brosur 10 cabang unit\n" +
           "• 📖 **Sekolah Daya Setara (PKBM)**: Paket B & C serta pelatihan vokasi\n" +
           "• 📚 **Program Layanan**: 7 program pendidikan unggulan yayasan\n" +
           "• 🙋‍♀️ **Jadi Relawan**: Gabung bareng komunitas Sahabat Eduhub\n" +
           "• 💖 **Cara Donasi**: Rekening transfer & QRIS resmi yayasan\n" +
           "• 📍 **Kontak & Lokasi**: WhatsApp admin & alamat kantor pusat\n\n" +
           "Atau kamu juga bisa langsung ngobrol santai sama admin via WhatsApp di **+62 851-7979-7661**! ✨";
  }

  // Deteksi pesan cepat (Sapaan & Quick Chips) agar tidak perlu menunggu lama (loading instan 220ms)
  function getInstantLocalReply(query) {
    const raw = (query || '').trim();
    const q = raw.toLowerCase();

    const greetingsList = [
      'halo', 'hallo', 'hai', 'hi', 'hey', 'hei', 'uy', 'ui', 'oy', 'oi', 'woy', 'woi',
      'yoo', 'yo', 'bro', 'sis', 'min', 'mimin', 'admin', 'p', 'ping', 'tes', 'test', 'cek',
      'assalamualaikum', 'assalamu alaikum', 'sampurasun', 'punten', 'permisi', 'misi',
      'pagi', 'siang', 'sore', 'malam', 'selamat pagi', 'selamat siang', 'selamat sore', 'selamat malam',
      'cherry', 'hai cherry', 'halo cherry', 'hei cherry', 'kuy', 'lur', 'gan', 'kak', 'kak admin'
    ];
    if (
      greetingsList.includes(q) ||
      q.match(/^(halo+|hallo+|hai+|hey+|hei+|hi+|uy+|ui+|oy+|woy+|woi+|oi+|yo+|p+|ping|tes|test|assalamu['`]?alaikum|selamat\s*(pagi|siang|sore|malam)|sampurasun|punten|permisi)(\s|[!.,?~]|$)/i) ||
      (q.length <= 4 && !q.includes('?'))
    ) {
      return "Halo Sahabat Ceria! 👋 Ada yang bisa Cherry bantu hari ini? 😊";
    }

    // Quick chips matching
    if (q === 'cara donasi' || q.includes('cara donasi') || q === 'metode donasi' || q === 'rekening donasi') {
      return getLocalKnowledgeReply('cara donasi');
    }
    if (q === 'informasi sekolah juara' || q === 'info sekolah juara') {
      return getLocalKnowledgeReply('sekolah juara');
    }
    if (q === 'sekolah daya setara') {
      return getLocalKnowledgeReply('daya setara');
    }
    if (q === 'guruverse' || q === 'guruverse.id') {
      return getLocalKnowledgeReply('guruverse');
    }
    if (
      q === 'program layanan' ||
      q.includes('program layanan') ||
      (q.includes('program') && (q.includes('layanan') || q.includes('apa aja') || q.includes('apa saja') || q.includes('di acf') || q.includes('ada apa') || q.includes('daftar program') || q.includes('7 program') || q.includes('pilar')))
    ) {
      return formatDynamicProgramsReply();
    }
    if (q === 'artikel dan kabar terbaru' || q === 'artikel & kabar') {
      return formatDynamicArticlesReply();
    }
    if (q === 'cara jadi mitra csr' || q === 'jadi mitra') {
      return getLocalKnowledgeReply('mitra');
    }
    if (q === 'cara jadi relawan' || q === 'jadi relawan') {
      return getLocalKnowledgeReply('relawan');
    }
    if (
      q === 'lokasi kantor dan kontak wa' ||
      q === 'alamat & kontak' ||
      q === 'kantor acf' ||
      q === 'alamat kantor' ||
      q === 'lokasi kantor' ||
      q === 'alamat acf' ||
      q.includes('alamat kantor') ||
      q.includes('kantor acf') ||
      q.includes('lokasi kantor acf') ||
      (q.includes('kantor') && (q.includes('dimana') || q.includes('di mana') || q.includes('mana')))
    ) {
      return getLocalKnowledgeReply('alamat');
    }

    return null;
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
              <p>Halo <strong>Sahabat Ceria</strong>! 👋 Senang banget bisa ketemu kamu. Kenalin, aku <strong>Cherry</strong>, asisten AI resmi dari <strong>ACF Eduhub</strong>.</p>
              <p>Cherry siap nemenin dan bantu kamu cari info seputar:</p>
              <ul class="cherry-list">
                <li>💖 <strong>Cara & Metode Donasi</strong></li>
                <li>🏫 <strong>Sekolah Juara (SD)</strong>: Info PPDB, Pendaftaran & Brosur</li>
                <li>📖 <strong>Sekolah Daya Setara (PKBM)</strong>: Paket B, Paket C & Vokasi</li>
                <li>👩‍🏫 <strong>Guruverse.ID</strong>: Pelatihan Guru Indonesia</li>
                <li>📚 <strong>Program Layanan</strong>: Inisiatif Pendidikan ACF Eduhub</li>
                <li>🤝 <strong>Kemitraan CSR</strong>: Kolaborasi Program & Perusahaan</li>
                <li>🙋‍♀️ <strong>Jadi Relawan</strong>: Gabung Sahabat Eduhub</li>
                <li>📰 <strong>Artikel & Kabar</strong>: Kabar Edukasi & Kegiatan Terkini</li>
                <li>📍 <strong>Alamat & Kontak WhatsApp Admin</strong></li>
              </ul>
              <p>Ada yang lagi pengen kamu tanyain ke Cherry hari ini? Klik pilihan cepat di bawah atau langsung ketik chat apa aja yaa! 😊✨</p>
              <span class="cherry-msg-time">Sekarang</span>
            </div>
          </div>
        </div>

        <!-- Quick Action Chips Slider -->
        <div class="cherry-quick-chips-wrapper" id="cherryChipsWrapper">
          <button type="button" class="cherry-chips-nav prev" id="cherryChipsPrev" aria-label="Slide ke kiri" title="Geser ke kiri">
            <svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <div class="cherry-quick-chips" id="cherryQuickChips" role="region" aria-label="Menu Cepat Rekomendasi">
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
          <button type="button" class="cherry-chips-nav next" id="cherryChipsNext" aria-label="Slide ke kanan" title="Geser ke kanan">
            <svg viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
          </button>
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

    // Handle Quick Action Chips Slider Control
    const chipsWrapper = document.getElementById('cherryChipsWrapper');
    const chipsPrevBtn = document.getElementById('cherryChipsPrev');
    const chipsNextBtn = document.getElementById('cherryChipsNext');

    if (quickChips) {
      let isDragging = false;
      let startX = 0;
      let scrollLeftPos = 0;
      let hasDragged = false;

      const updateChipsNavState = () => {
        if (!chipsPrevBtn || !chipsNextBtn) return;
        const sl = Math.ceil(quickChips.scrollLeft);
        const maxScroll = quickChips.scrollWidth - quickChips.clientWidth;
        chipsPrevBtn.disabled = sl <= 2;
        chipsNextBtn.disabled = sl >= maxScroll - 2;
      };

      if (chipsPrevBtn && chipsNextBtn) {
        chipsPrevBtn.addEventListener('click', () => {
          quickChips.scrollBy({ left: -160, behavior: 'smooth' });
        });

        chipsNextBtn.addEventListener('click', () => {
          quickChips.scrollBy({ left: 160, behavior: 'smooth' });
        });
      }

      quickChips.addEventListener('scroll', updateChipsNavState, { passive: true });

      // Convert vertical mouse wheel into horizontal slide
      quickChips.addEventListener('wheel', (e) => {
        if (e.deltaY !== 0) {
          e.preventDefault();
          quickChips.scrollLeft += e.deltaY;
          updateChipsNavState();
        }
      }, { passive: false });

      // Drag to scroll for mouse users
      quickChips.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        isDragging = true;
        hasDragged = false;
        quickChips.classList.add('is-dragging');
        startX = e.pageX - quickChips.offsetLeft;
        scrollLeftPos = quickChips.scrollLeft;
      });

      window.addEventListener('mouseup', () => {
        if (!isDragging) return;
        isDragging = false;
        quickChips.classList.remove('is-dragging');
      });

      quickChips.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - quickChips.offsetLeft;
        const walk = (x - startX) * 1.5;
        if (Math.abs(walk) > 4) {
          hasDragged = true;
        }
        quickChips.scrollLeft = scrollLeftPos - walk;
        updateChipsNavState();
      });

      // Handle Quick Action Chip Click
      quickChips.addEventListener('click', (e) => {
        if (hasDragged) {
          hasDragged = false;
          return;
        }
        const chip = e.target.closest('.cherry-chip');
        if (!chip) return;
        const query = chip.dataset.query;
        if (query) {
          sendUserMessage(query);
        }
      });

      setTimeout(updateChipsNavState, 150);
      window.addEventListener('resize', updateChipsNavState);
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

      // Respon instan super cepat untuk sapaan dan tombol menu (220ms natural delay)
      const instantReply = getInstantLocalReply(userText);
      if (instantReply) {
        setTimeout(() => {
          hideTypingIndicator();
          appendMessage('bot', instantReply);
          chatHistory.push({ role: 'model', text: instantReply });
          isAwaitingResponse = false;
          chatInput.focus();
        }, 220);
        return;
      }

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
      const timeoutId = setTimeout(() => controller.abort(), 7500);

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
