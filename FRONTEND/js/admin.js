/**
 * ACF EDUHUB — DUAL ADMIN PORTAL & DASHBOARD JAVASCRIPT
 * 1. Dashboard 1: Form Data Kemitraan (Mitra Program) & Relawan Eduhub
 * 2. Dashboard 2: Upload & Manajemen Kabar / Artikel
 */

(function () {
  'use strict';

  // Bersihkan sisa cache legacy localStorage
  try {
    localStorage.removeItem('acf_admin_data_mitra');
    localStorage.removeItem('acf_admin_data_relawan');
    localStorage.removeItem('acf_articles_data');
    localStorage.removeItem('acf_custom_categories');
  } catch (e) {}

  // Google Apps Script Web App Endpoint
  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyBPKjNYHI1M3NifBOQJnH2Rjt_HUzxyZroYxLb2iPt7XMp72leWUjVtDACrqlxfadT/exec';

  // Default Admin Credentials
  const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'adminacf2026'
  };

  // Initial Data for Mitra (Hanya berisi dari pengisian formulir)
  const INITIAL_MITRA_DATA = [];

  // Initial Data for Relawan (Hanya berisi dari pengisian formulir)
  const INITIAL_RELAWAN_DATA = [];

  // Initial Sample Data for Articles (Kabar)
  const INITIAL_ARTICLES_DATA = [
    {
      id: 'ART-SDS07',
      title: 'Menyalakan Kembali Api Harapan: Kisah Pejuang PKBM Ceria Taklukkan ANBK 2025',
      category: 'kabar-sekolah-daya-setara',
      categoryLabel: 'Artikel Sekolah Daya Setara',
      author: 'cerianak',
      date: 'Aug 14, 2025',
      cover: '../assets/kabar-sekolahdayasetara/2.png',
      excerpt: 'Bandung – Di sudut keheningan, sering terdengar keraguan yang membisik, “Kesempatanmu sudah lewat.” Sebuah kalimat yang mampu memadamkan semangat dan mengubur mimpi. Namun, di tengah riuhnya kota Bandung...',
      content: `<p><strong>Bandung</strong> – Di sudut keheningan, sering terdengar keraguan yang membisik, <em>“Kesempatanmu sudah lewat.”</em> Sebuah kalimat yang mampu memadamkan semangat dan mengubur mimpi. Namun, di tengah riuhnya kota Bandung, ada sebuah cerita yang membuktikan sebaliknya. Sebuah kisah tentang keberanian untuk mencoba, tentang kepercayaan diri yang kembali menyala.</p>
<p>Pada tanggal 9 dan 10 Agustus 2025 yang bersejarah, udara di PKBM Bina Cipta, Ujungberung, terasa berbeda. Bukan sekadar udara biasa, melainkan udara yang dipenuhi ketegangan, harapan, dan tekad baja. Sebanyak 16 pejuang dari program Paket C PKBM Ceria Ngamprah dan Pusat melangkah masuk, bukan sebagai siswa biasa, tetapi sebagai gladiator di arena pembuktian diri: Asesmen Nasional Berbasis Komputer (ANBK).</p>
<p>Bagi mereka, layar komputer di hadapan bukanlah sekadar menampilkan soal-soal literasi dan numerasi. Layar itu adalah cermin dari perjuangan mereka. Setiap kata yang mereka baca adalah gema dari semangat belajar yang pernah terputus. Setiap angka yang mereka hitung adalah simbol dari langkah-langkah yang kembali mereka ayunkan menuju masa depan. Ini bukanlah sekadar ujian. Ini adalah deklarasi. Deklarasi bahwa belajar tidak mengenal usia, dan semangat tidak memiliki batas waktu.</p>
<p style="text-align: center; margin: 24px 0;"><img src="../assets/kabar-sekolahdayasetara/1.png" alt="Peserta ANBK PKBM Ceria 2025" style="max-width: 100%; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);"></p>
<p>Perjalanan ini adalah tentang menantang takdir. Tentang membuktikan kepada diri sendiri dan dunia bahwa menyerah hanyalah sebuah jeda, bukan akhir dari segalanya. Di wajah mereka, tergambar fokus dan kesungguhan—sebuah potret keberanian yang menggetarkan. Mereka membuktikan bahwa esensi pendidikan bukanlah tentang seberapa cepat kita berlari, melainkan tentang keberanian untuk terus melangkah, bahkan setelah terjatuh.</p>
<p>Keikutsertaan 16 warga belajar ini dalam ANBK telah menjadi lebih dari sekadar pemenuhan syarat akademis. Ia telah menjadi api yang menyulut kembali harapan, tidak hanya bagi mereka, tetapi bagi kita semua. Mereka adalah bukti hidup bahwa setiap langkah, sekecil apa pun, adalah bekal berharga untuk masa depan yang lebih cerah.</p>
<p>Kisah mereka adalah jantung dari PKBM Ceria. Sebuah semangat belajar tanpa batas, di mana setiap individu diberi ruang untuk tumbuh, berjuang, dan pada akhirnya, menang. Perjuangan mereka hari ini adalah mercusuar bagi mereka yang mungkin masih ragu di luar sana.</p>
<p style="color: #64748B; font-weight: 700; margin-top: 24px; font-style: italic;">Karena di PKBM Ceria, kami tidak hanya membuka buku, kami membuka kembali kesempatan dan menyalakan kembali mimpi.</p>`,
      status: 'Terbit'
    },
    {
      id: 'ART-SDS06',
      title: 'Sebuah Langkah Kecil Hari Ini, Lompatan Besar di Masa Depan: Selamat kepada Lulusan Sekolah Daya Setara 2025/2026',
      category: 'kabar-sekolah-daya-setara',
      categoryLabel: 'Artikel Sekolah Daya Setara',
      author: 'cerianak',
      date: 'Aug 7, 2026',
      cover: '../assets/kabar-sekolahdayasetara/25.png',
      excerpt: 'Sebuah langkah kecil hari ini akan menjadi lompatan besar di masa depan. Kalimat itu terasa pas untuk menggambarkan momen yang dirayakan Sekolah Daya Setara pada 19 Juli 2026 di PKBM Daya Setara Lembang: pelepasan peserta didik Tahun Ajaran 2025/2026 yang telah berhasil menyelesaikan perjalanan belajarnya melalui jalur pendidikan kesetaraan Paket B dan Paket C...',
      content: `<p>Sebuah langkah kecil hari ini akan menjadi lompatan besar di masa depan. Kalimat itu terasa pas untuk menggambarkan momen yang dirayakan Sekolah Daya Setara pada 19 Juli 2026 di PKBM Daya Setara Lembang: pelepasan peserta didik Tahun Ajaran 2025/2026 yang telah berhasil menyelesaikan perjalanan belajarnya melalui jalur pendidikan kesetaraan Paket B dan Paket C.</p>
<p>Bagi Sekolah Daya Setara, hari kelulusan bukan sekadar seremoni akhir tahun ajaran. Ia adalah penanda bahwa pendidikan yang setara dan terbuka bagi siapa saja, tanpa memandang latar belakang atau titik awal masing-masing, benar-benar bisa membawa seseorang sampai ke garis akhir yang selama ini mungkin terasa jauh.</p>
<p style="text-align: center; margin: 24px 0;"><img src="../assets/kabar-sekolahdayasetara/26.png" alt="Pelepasan Lulusan Sekolah Daya Setara" style="max-width: 100%; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);"></p>
<h3 style="font-size: 1.2rem; font-weight: 700; color: #1E293B; margin: 28px 0 12px 0;">Bukan Akhir, Melainkan Awal yang Baru</h3>
<p>Hari kelulusan sering dimaknai sebagai penutup sebuah babak. Namun bagi para lulusan Sekolah Daya Setara, hari ini lebih tepat dilihat sebagai titik awal untuk melangkah lebih jauh — membawa serta ilmu, pengalaman, dan semangat yang telah dibangun selama masa belajar, untuk kemudian memberi manfaat bagi keluarga, masyarakat, dan bangsa.</p>
<p>Perjalanan menuju hari ini tentu tidak selalu mudah. Pendidikan kesetaraan sering ditempuh oleh mereka yang harus membagi waktu antara belajar dan tanggung jawab lain dalam hidupnya. Karena itu, setiap kelulusan di jalur ini adalah bukti nyata bahwa kesempatan untuk meraih masa depan yang lebih baik terbuka bagi siapa saja yang mau terus berjuang dan belajar.</p>
<h3 style="font-size: 1.2rem; font-weight: 700; color: #1E293B; margin: 28px 0 12px 0;">Selamat kepada Para Lulusan</h3>
<p>Sekolah Daya Setara dengan bangga mengucapkan selamat kepada tujuh peserta didik yang telah menyelesaikan pendidikannya pada Tahun Ajaran 2025/2026:</p>
<ul style="line-height: 1.8; margin-bottom: 18px;">
  <li><strong>Nizar Maulana Yusuf</strong> (Paket C)</li>
  <li><strong>Hamdan Hadiatna</strong> (Paket C)</li>
  <li><strong>Fitria Agustina Putri Hermansyah</strong> (Paket B)</li>
  <li><strong>Muhamad Arya Dira Putera Suteja</strong> (Paket C)</li>
  <li><strong>Muhammad Arafah Fadillah</strong> (Paket C)</li>
  <li><strong>April Liani</strong> (Paket C)</li>
  <li><strong>Muhamad Akbar</strong> (Paket C)</li>
</ul>
<p>Kami bangga menjadi bagian dari perjalanan kalian. Semoga ilmu yang telah diperoleh menjadi bekal untuk meraih cita-cita, membuka lebih banyak peluang, serta memberikan manfaat bagi keluarga, masyarakat, dan lingkungan sekitar.</p>
<h3 style="font-size: 1.2rem; font-weight: 700; color: #1E293B; margin: 28px 0 12px 0;">Teruslah Melangkah</h3>
<p>Kelulusan ini menjadi pengingat bahwa masa depan yang cerah selalu dimulai dari keberanian untuk terus belajar, kapan pun dan dari titik mana pun seseorang memulai. Teruslah bermimpi, belajar, dan berkarya — karena setiap pencapaian, sekecil apa pun awalnya, adalah bukti bahwa kesempatan itu nyata bagi siapa saja yang mau berjuang.</p>
<p>Selamat dan sukses untuk seluruh lulusan Sekolah Daya Setara Tahun Ajaran 2025/2026.</p>
<p style="color: #64748B; font-weight: 700; margin-top: 28px; font-style: italic;">Sekolah Daya Setara — Setara dalam Langkah, Berdaya dalam Karya.</p>`,
      status: 'Terbit'
    },
    {
      id: 'ART-SDS05',
      title: 'Tujuh Kisah, Satu Semangat yang Sama: Perjalanan Lulusan Sekolah Daya Setara 2025/2026',
      category: 'kabar-sekolah-daya-setara',
      categoryLabel: 'Artikel Sekolah Daya Setara',
      author: 'cerianak',
      date: 'Aug 7, 2026',
      cover: '../assets/kabar-sekolahdayasetara/27 (2).png',
      excerpt: 'Sebuah langkah kecil hari ini akan menjadi lompatan besar di masa depan. Kalimat itu terasa pas untuk menggambarkan momen yang dirayakan Sekolah Daya Setara pada 19 Juli 2026 di PKBM Daya Setara Lembang: pelepasan peserta didik Tahun Ajaran 2025/2026 yang telah berhasil menyelesaikan perjalanan belajarnya melalui jalur pendidikan kesetaraan Paket B dan Paket C...',
      content: `<p>Sebuah langkah kecil hari ini akan menjadi lompatan besar di masa depan. Kalimat itu terasa pas untuk menggambarkan momen yang dirayakan Sekolah Daya Setara pada 19 Juli 2026 di PKBM Daya Setara Lembang: pelepasan peserta didik Tahun Ajaran 2025/2026 yang telah berhasil menyelesaikan perjalanan belajarnya melalui jalur pendidikan kesetaraan Paket B dan Paket C.</p>
<p>Di balik setiap ijazah yang diraih, ada jalan berliku yang berbeda-beda. Beberapa harus berhenti sekolah karena keadaan ekonomi, beberapa lainnya memilih bekerja lebih dulu sebelum kembali ke bangku belajar, dan tak sedikit yang sempat kehilangan arah sebelum akhirnya menemukan kembali alasan untuk terus belajar. Berikut adalah tujuh kisah dari mereka yang telah membuktikan bahwa pendidikan tetap bisa diraih, kapan pun seseorang siap untuk kembali.</p>
<p><strong>Nizar Maulana Yusuf — Paket C, PKBM Rumah Quran</strong><br>Saat masih duduk di bangku SMA, Nizar harus berhenti sekolah karena kondisi ekonomi keluarganya mengharuskan ia turut mencari penghasilan. Ketika keadaan mulai memungkinkan, ia memutuskan melanjutkan pendidikan lewat Paket C agar memiliki bekal yang lebih kuat untuk meraih peluang kerja maupun studi lanjutan.</p>
<p><strong>Hamdan Hadiatna — Paket C, PKBM Lembang</strong><br>Hamdan sempat menghentikan pendidikannya karena memilih bekerja demi membantu memenuhi kebutuhan keluarga. Kini, sambil bekerja sebagai petugas kebersihan di sebuah sekolah, ia membuktikan bahwa kesibukan bekerja bukan penghalang untuk tetap menyelesaikan pendidikan.</p>
<p><strong>Fitria Agustina Putri Hermansyah — Paket B, PKBM Ngamprah</strong><br>Fitria sempat berhenti sekolah setelah keluarganya berpindah tempat tinggal, yang membuatnya kesulitan melanjutkan pendidikan formal. Melalui PKBM, ia mendapat kembali kesempatan untuk belajar hingga akhirnya menuntaskan Paket B.</p>
<p><strong>Muhamad Arya Dira Putera Suteja — Paket C, PKBM Ngamprah</strong><br>Arya harus menunda pendidikannya karena memilih bekerja sejak usia muda. Sebagai pegawai laundry, ia membagi waktunya antara pekerjaan dan belajar, hingga akhirnya berhasil menyelesaikan Paket C.</p>
<p><strong>Muhammad Arafah Fadillah — Paket C, PKBM Lembang</strong><br>Arafah pernah kehilangan semangat belajar setelah mengalami sejumlah perubahan dalam kondisi keluarganya. Dukungan orang-orang di sekitarnya membantunya bangkit kembali dan melanjutkan pendidikan lewat PKBM.</p>
<p><strong>April Liani — Paket C, PKBM Sukabumi</strong><br>April sempat berhenti sekolah karena harus mendampingi keluarganya dalam situasi yang sulit. Begitu ada kesempatan, ia memilih kembali belajar agar dapat membuka lebih banyak pilihan untuk masa depannya.</p>
<p><strong>Muhamad Akbar — Paket C, PKBM Lembang</strong><br>Akbar pernah menganggap sekolah bukan prioritas karena lebih fokus mencari pengalaman kerja. Seiring waktu, ia menyadari bahwa pendidikan tetap penting sebagai bekal pengembangan diri, sehingga memilih menuntaskan Paket C melalui PKBM.</p>
<h3 style="font-size: 1.2rem; font-weight: 700; color: #1E293B; margin: 28px 0 12px 0;">Satu Titik Awal yang Berbeda, Satu Garis Akhir yang Sama</h3>
<p>Ketujuh kisah ini menunjukkan bahwa jalan menuju pendidikan tidak selalu lurus. Ada yang harus berhenti karena ekonomi, ada yang menunda karena bekerja, dan ada yang sempat kehilangan arah sebelum menemukannya kembali. Namun semuanya bertemu di titik yang sama: keberanian untuk kembali belajar, dari mana pun mereka memulai.</p>
<p>Sekolah Daya Setara bangga menjadi bagian dari perjalanan ini. Semoga ilmu yang telah diperoleh menjadi bekal untuk meraih cita-cita, membuka lebih banyak peluang, serta memberi manfaat bagi keluarga, masyarakat, dan lingkungan sekitar.</p>
<p>Selamat dan sukses untuk seluruh lulusan Sekolah Daya Setara Tahun Ajaran 2025/2026. Teruslah melangkah dengan penuh keyakinan, karena masa depan yang cerah selalu dimulai dari keberanian untuk terus belajar.</p>
<p style="color: #64748B; font-weight: 700; margin-top: 28px; font-style: italic;">Sekolah Daya Setara — Setara dalam Langkah, Berdaya dalam Karya.</p>`,
      status: 'Terbit'
    }
  ];

  // Default Categories List
  const DEFAULT_CATEGORIES = [
    { slug: 'kabar-sekolah-daya-setara', label: 'Artikel Sekolah Daya Setara' },
    { slug: 'kabar-sekolah-juara', label: 'Artikel Sekolah Juara' },
    { slug: 'artikel', label: 'Artikel Pendidikan' },
    { slug: 'liputan', label: 'Liputan Lapangan' },
    { slug: 'vokasi', label: 'Program Vokasi' },
    { slug: 'opini', label: 'Kolaborasi & Opini' }
  ];

  // State
  let dataMitra = [];
  let dataRelawan = [];
  let dataArticles = [];
  let dataCategories = [];
  let currentWpFetchedPosts = [];
  let activeTab = 'tabMitra';
  let activeDashboard = 'viewDashboardArticles';

  // DOM Elements - Auth
  const loginScreen = document.getElementById('loginScreen');
  const dashboardScreen = document.getElementById('dashboardScreen');
  const adminLoginForm = document.getElementById('adminLoginForm');
  const adminUsername = document.getElementById('adminUsername');
  const adminPassword = document.getElementById('adminPassword');
  const btnTogglePassword = document.getElementById('btnTogglePassword');
  const loginAlert = document.getElementById('loginAlert');
  const loginAlertText = document.getElementById('loginAlertText');
  const btnLogout = document.getElementById('btnLogout');

  // DOM Elements - Top Dual Switcher
  const btnNavForms = document.getElementById('btnNavForms');
  const btnNavArticles = document.getElementById('btnNavArticles');
  const viewDashboardForms = document.getElementById('viewDashboardForms');
  const viewDashboardArticles = document.getElementById('viewDashboardArticles');
  const sheetsDropdownWrap = document.getElementById('sheetsDropdownWrap');
  const btnSheetsDropdown = document.getElementById('btnSheetsDropdown');

  // Dashboard 1 (Forms) Elements
  const countMitraEl = document.getElementById('countMitra');
  const countRelawanEl = document.getElementById('countRelawan');
  const countPendingEl = document.getElementById('countPending');
  const countTotalEl = document.getElementById('countTotal');
  const badgeTabMitra = document.getElementById('badgeTabMitra');
  const badgeTabRelawan = document.getElementById('badgeTabRelawan');

  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-content-panel');
  const searchMitra = document.getElementById('searchMitra');
  const filterStatusMitra = document.getElementById('filterStatusMitra');
  const tbodyMitra = document.getElementById('tbodyMitra');
  const emptyMitra = document.getElementById('emptyMitra');

  const searchRelawan = document.getElementById('searchRelawan');
  const filterStatusRelawan = document.getElementById('filterStatusRelawan');
  const tbodyRelawan = document.getElementById('tbodyRelawan');
  const emptyRelawan = document.getElementById('emptyRelawan');

  const btnSyncSpreadsheet = document.getElementById('btnSyncSpreadsheet');
  const btnExportCSV = document.getElementById('btnExportCSV');

  // Dashboard 2 (Articles) Elements
  const countArticlesPublished = document.getElementById('countArticlesPublished');
  const countArticleCategories = document.getElementById('countArticleCategories');
  const searchArticle = document.getElementById('searchArticle');
  const filterCategoryArticle = document.getElementById('filterCategoryArticle');
  const filterStatusArticle = document.getElementById('filterStatusArticle');
  const tbodyArticles = document.getElementById('tbodyArticles');
  const emptyArticles = document.getElementById('emptyArticles');
  const btnOpenCreateArticleModal = document.getElementById('btnOpenCreateArticleModal');
  const btnManageCategories = document.getElementById('btnManageCategories');
  const cardArticleCategories = document.getElementById('cardArticleCategories');
  const btnToolbarManageCategories = document.getElementById('btnToolbarManageCategories');
  const btnEditorManageCategories = document.getElementById('btnEditorManageCategories');

  // Category Manager Modal Elements
  const categoryManagerModal = document.getElementById('categoryManagerModal');
  const btnCategoryModalClose = document.getElementById('btnCategoryModalClose');
  const btnCategoryModalCloseFooter = document.getElementById('btnCategoryModalCloseFooter');
  const formAddCategoryModal = document.getElementById('formAddCategoryModal');
  const inputNewCatLabel = document.getElementById('inputNewCatLabel');
  const categoryListContainer = document.getElementById('categoryListContainer');
  const catModalTotalCount = document.getElementById('catModalTotalCount');

  // Article Preview Modal Elements
  const articlePreviewModal = document.getElementById('articlePreviewModal');
  const btnCloseArticlePreview = document.getElementById('btnCloseArticlePreview');
  const btnCloseArticlePreviewFooter = document.getElementById('btnCloseArticlePreviewFooter');
  const btnPreviewEditDirect = document.getElementById('btnPreviewEditDirect');

  // Program Layanan Elements
  const btnNavPrograms = document.getElementById('btnNavPrograms');
  const badgeNavProgramsCount = document.getElementById('badgeNavProgramsCount');
  const viewDashboardPrograms = document.getElementById('viewDashboardPrograms');

  const countTotalPrograms = document.getElementById('countTotalPrograms');
  const countPublishedPrograms = document.getElementById('countPublishedPrograms');
  const countDraftPrograms = document.getElementById('countDraftPrograms');
  const countCategoriesPrograms = document.getElementById('countCategoriesPrograms');

  const searchProgramInput = document.getElementById('searchProgramInput');
  const filterProgramCategory = document.getElementById('filterProgramCategory');
  const filterProgramStatus = document.getElementById('filterProgramStatus');
  const programsTableBody = document.getElementById('tbodyPrograms') || document.getElementById('programsTableBody');
  const emptyPrograms = document.getElementById('emptyPrograms');

  const btnResetProgramsDefault = document.getElementById('btnResetProgramsDefault');
  const btnOpenCreateProgramModal = document.getElementById('btnOpenCreateProgramModal');

  // Program Modal Elements
  const programModal = document.getElementById('programModal');
  const programModalTitle = document.getElementById('programModalTitle');
  const btnCloseProgramModal = document.getElementById('btnCloseProgramModal');
  const btnCancelProgramModal = document.getElementById('btnCancelProgramModal');
  const programForm = document.getElementById('programForm');
  const programEditId = document.getElementById('programEditId');
  const programCategoryInput = document.getElementById('programCategoryInput');
  const listCategoryOptions = document.getElementById('listCategoryOptions');
  const programDivisi = document.getElementById('programDivisi');
  const programTitle = document.getElementById('programTitle');
  const programQuote = document.getElementById('programQuote');
  const programBuktiKapasitas = document.getElementById('programBuktiKapasitas');
  const programKebutuhanDukungan = document.getElementById('programKebutuhanDukungan');
  const programMetric = document.getElementById('programMetric');
  const programStatus = document.getElementById('programStatus');
  const programCoverPreviewImg = document.getElementById('programCoverPreviewImg');
  const programCoverFileInput = document.getElementById('programCoverFileInput');
  const programCoverUrlInput = document.getElementById('programCoverUrlInput');
  const btnResetProgramCover = document.getElementById('btnResetProgramCover');
  const programActionText = document.getElementById('programActionText');
  const programActionLink = document.getElementById('programActionLink');
  const programLivePreviewContainer = document.getElementById('programLivePreviewContainer');
  const btnSaveProgram = document.getElementById('btnSaveProgram');
  const btnSaveProgramText = document.getElementById('btnSaveProgramText');

  // Program Preview Modal Elements
  const programPreviewModal = document.getElementById('programPreviewModal');
  const btnCloseProgramPreview = document.getElementById('btnCloseProgramPreview');
  const programPreviewModalBody = document.getElementById('programPreviewModalBody');

  // Program State & Default Data
  let dataPrograms = [];

  const DEFAULT_PROGRAM_CATEGORIES = [
    { id: 'kategori-1', num: 1, title: 'Keberlanjutan Unit Pendidikan', desc: 'Penguatan kelembagaan dan pendanaan mandiri untuk memastikan sekolah-sekolah di wilayah prasejahtera dapat beroperasi secara berkelanjutan dengan kualitas prima.' },
    { id: 'kategori-2', num: 2, title: 'Tanggap Bencana & Pemulihan', desc: 'Respons cepat terintegrasi mencakup dukungan psikososial anak, pelatihan psikososial guru terdampak, hingga bantuan dasar pangan, sandang, dan hunian darurat.' },
    { id: 'kategori-3', num: 3, title: 'Kesejahteraan Ekosistem Sekolah', desc: 'Dukungan terpadu berkelanjutan bagi guru honorer, tenaga penunjang, dan keluarga prasejahtera di sekitar lingkungan sekolah sepanjang tahun.' },
    { id: 'kategori-4', num: 4, title: 'Kemanusiaan Internasional', desc: 'Penyaluran bantuan kemanusiaan dan kebutuhan dasar bagi anak-anak di wilayah krisis serta konflik global.' },
    { id: 'kategori-5', num: 5, title: 'Forum & Advokasi Pendidikan', desc: 'Membangun ruang diskursus kebijakan, publikasi riset implementasi di lapangan, dan advokasi arah tren pendidikan nasional.' },
    { id: 'kategori-6', num: 6, title: 'Kepemimpinan & Manajemen Sekolah', desc: 'Layanan konsultasi dan pendampingan manajemen sekolah, strategi SPMB/PPDB, serta studi kelayakan pendirian unit pendidikan.' }
  ];

  const DEFAULT_PROGRAMS_DATA = [
    {
      id: 'PRG-01',
      categoryId: 'kategori-1',
      categoryNum: 1,
      categoryTitle: 'Keberlanjutan Unit Pendidikan',
      categoryDesc: 'Penguatan kelembagaan dan pendanaan mandiri untuk memastikan sekolah-sekolah di wilayah prasejahtera dapat beroperasi secara berkelanjutan dengan kualitas prima.',
      divisi: 'Sekolah Juara',
      title: 'Program Beasiswa & Keberlanjutan Sekolah Juara',
      cover: '../assets/unit-pendidikan/Sekolah Juara.jpg',
      quote: 'Mendukung operasional dan penyediaan fasilitas belajar Sekolah Juara agar akses pendidikan formal berkualitas tetap 100% bebas biaya (gratis) bagi anak-anak dhuafa dan keluarga prasejahtera berprestasi.',
      buktiKapasitas: 'Mengelola 10 cabang Sekolah Juara di berbagai wilayah Indonesia dengan layanan pendidikan 100% bebas biaya sejak ACF mengelola langsung jaringan ini pada 2023.',
      kebutuhanDukungan: 'Dana operasional, Beasiswa pendidikan, In-kind (sarana belajar)',
      metric: '10 Sekolah Juara di Indonesia',
      actionLink: 'jadi-mitra-program.html',
      actionText: 'Jadi Mitra Program',
      status: 'Terbit',
      createdAt: '2026-01-01'
    },
    {
      id: 'PRG-02',
      categoryId: 'kategori-1',
      categoryNum: 1,
      categoryTitle: 'Keberlanjutan Unit Pendidikan',
      categoryDesc: 'Penguatan kelembagaan dan pendanaan mandiri untuk memastikan sekolah-sekolah di wilayah prasejahtera dapat beroperasi secara berkelanjutan dengan kualitas prima.',
      divisi: 'Sekolah Daya Setara',
      title: 'Kesejahteraan Guru & Operasional Sekolah Daya Setara',
      cover: '../assets/unit-pendidikan/Sekolah Daya Setara (1).JPG',
      quote: 'Mendukung kesejahteraan tutor/guru dan kebutuhan operasional PKBM Sekolah Daya Setara — seluruh 150 warga belajar yang dilayani saat ini adalah penerima beasiswa penuh, menjadikan dukungan mitra krusial bagi keberlangsungan layanan yang ada.',
      buktiKapasitas: 'Melayani 150 warga belajar (100% beasiswa, tanpa siswa reguler berbayar) di beberapa titik PKBM (Lembang, Ngamprah, Pangandaran, Sukabumi, Indramayu, Jayapura).',
      kebutuhanDukungan: 'Dana sebagian, In-kind',
      metric: '150 Warga Belajar (100% Beasiswa)',
      actionLink: 'jadi-mitra-program.html',
      actionText: 'Jadi Mitra Program',
      status: 'Terbit',
      createdAt: '2026-01-02'
    },
    {
      id: 'PRG-03',
      categoryId: 'kategori-2',
      categoryNum: 2,
      categoryTitle: 'Tanggap Bencana & Pemulihan',
      categoryDesc: 'Respons cepat terintegrasi mencakup dukungan psikososial anak, pelatihan psikososial guru terdampak, hingga bantuan dasar pangan, sandang, dan hunian darurat.',
      divisi: 'Guruverse.ID & ACF Educare (lintas-divisi)',
      title: 'Layanan Pascabencana',
      cover: '../assets/layanan-program/IMG_6436.jpg',
      quote: 'Respons pascabencana yang terintegrasi — mencakup dukungan psikososial untuk anak-anak korban, pelatihan psikososial untuk guru di lokasi terdampak, serta penyaluran bantuan dasar berupa pangan, sandang, dan papan/hunian sementara.',
      buktiKapasitas: '100 guru terlatih di Aceh Tamiang; respons darurat dan sekolah darurat sedang berjalan di Flores NTT pascagempa Agustus 2026, berkolaborasi dengan Sharing Happiness.',
      kebutuhanDukungan: 'Dana penuh, In-kind (pangan, sandang, papan)',
      metric: '100 Guru Terlatih & Respons Flores NTT',
      actionLink: 'jadi-mitra-program.html',
      actionText: 'Jadi Mitra Program',
      status: 'Terbit',
      createdAt: '2026-01-03'
    },
    {
      id: 'PRG-04',
      categoryId: 'kategori-3',
      categoryNum: 3,
      categoryTitle: 'Kesejahteraan Ekosistem Sekolah',
      categoryDesc: 'Dukungan terpadu berkelanjutan bagi guru honorer, tenaga penunjang, dan keluarga prasejahtera di sekitar lingkungan sekolah sepanjang tahun.',
      divisi: 'ACF Educare (Donasi Pendidikan)',
      title: 'Kesejahteraan Ekosistem Sekolah',
      cover: '../assets/donasi/Kado Lebaran Penjaga Sekolah.jpg',
      quote: 'Dukungan berkelanjutan bagi tenaga yang menopang ekosistem sekolah — guru honorer, penjaga sekolah, dan keluarga prasejahtera di lingkungan sekolah. Ramadhan menjadi salah satu momentum kampanye, bukan satu-satunya waktu penyaluran.',
      buktiKapasitas: 'Ramadhan 2026 — 345 paket tersalur di 21 wilayah untuk guru honorer, penjaga sekolah, dan keluarga dhuafa.',
      kebutuhanDukungan: 'Dana penuh, In-kind',
      metric: '345 Paket Tersalur (21 Wilayah)',
      actionLink: 'jadi-mitra-program.html',
      actionText: 'Jadi Mitra Program',
      status: 'Terbit',
      createdAt: '2026-01-04'
    },
    {
      id: 'PRG-05',
      categoryId: 'kategori-4',
      categoryNum: 4,
      categoryTitle: 'Kemanusiaan Internasional',
      categoryDesc: 'Penyaluran bantuan kemanusiaan dan kebutuhan dasar bagi anak-anak di wilayah krisis serta konflik global.',
      divisi: 'ACF Educare (Donasi Pendidikan)',
      title: 'Bantuan Kemanusiaan Internasional',
      cover: '../assets/layanan-program/IMG_6442.jpg',
      quote: 'Penyaluran bantuan dasar bagi anak-anak di wilayah konflik, dihimpun dari keluarga besar ACF Eduhub dan donatur publik.',
      buktiKapasitas: 'Tahap 1 (1 September 2026) — makanan hangat untuk 260 anak di 2 shelter pengungsian Gaza, bekerja sama dengan Baitul Mal Muamalat.',
      kebutuhanDukungan: 'Dana penuh',
      metric: 'Makanan Hangat 260 Anak (Gaza)',
      actionLink: 'jadi-mitra-program.html',
      actionText: 'Jadi Mitra Program',
      status: 'Terbit',
      createdAt: '2026-01-05'
    },
    {
      id: 'PRG-06',
      categoryId: 'kategori-5',
      categoryNum: 5,
      categoryTitle: 'Forum & Advokasi Pendidikan',
      categoryDesc: 'Membangun ruang diskursus kebijakan, publikasi riset implementasi di lapangan, dan advokasi arah tren pendidikan nasional.',
      divisi: 'Guruverse.ID',
      title: 'Education Outlook — Forum Tahunan Pendidikan',
      cover: '../assets/layanan-program/Web Banner Education Maret 2026-03.jpg',
      quote: 'Forum hybrid tahunan yang menghadirkan pembuat kebijakan, akademisi, dan praktisi pendidikan untuk membahas arah dan tren pendidikan nasional.',
      buktiKapasitas: 'Edisi 2026 digelar hybrid di Bandung, 6 Desember 2025, dihadiri perwakilan Kemendikdasmen, DPR RI Komisi X, dan UPI, diikuti ratusan pendidik.',
      kebutuhanDukungan: 'Dana sebagian (sponsorship), In-kind (venue, media)',
      metric: 'Edisi 2026 Hybrid Bandung',
      actionLink: 'jadi-mitra-program.html',
      actionText: 'Jadi Mitra Program',
      status: 'Terbit',
      createdAt: '2026-01-06'
    },
    {
      id: 'PRG-07',
      categoryId: 'kategori-6',
      categoryNum: 6,
      categoryTitle: 'Kepemimpinan & Manajemen Sekolah',
      categoryDesc: 'Layanan konsultasi dan pendampingan manajemen sekolah, strategi SPMB/PPDB, serta studi kelayakan pendirian unit pendidikan.',
      divisi: 'Guruverse.ID',
      title: 'Konsultasi & Pendampingan Manajemen Sekolah',
      cover: '../assets/layanan-program/Workshop SPMB.jpg',
      quote: 'Layanan konsultasi fleksibel bagi sekolah atau yayasan lain — mencakup manajemen sekolah, strategi PPDB/SPMB, hingga studi kelayakan (feasibility study) pendirian atau pengembangan sekolah. Tim yang menangani menyesuaikan kebutuhan spesifik klien.',
      buktiKapasitas: 'Pernah dijalankan lewat Ceria Training Center (Bengkel Manajemen Sekolah & SPMB), didukung pengalaman langsung ACF mengelola jaringan 10 Sekolah Juara dan 7 Sekolah Daya Setara.',
      kebutuhanDukungan: 'Jasa konsultasi berbayar (revenue line ACF, di bawah Guruverse.ID)',
      metric: 'Pengalaman 10 Sekolah Juara & 7 Sekolah Daya Setara',
      actionLink: 'jadi-mitra-program.html',
      actionText: 'Jadi Mitra Program',
      status: 'Terbit',
      createdAt: '2026-01-07'
    }
  ];
  const btnPreviewEditDirectFooter = document.getElementById('btnPreviewEditDirectFooter');
  const previewArticleStatusBadge = document.getElementById('previewArticleStatusBadge');
  const previewArticleCategory = document.getElementById('previewArticleCategory');
  const previewArticleAuthor = document.getElementById('previewArticleAuthor');
  const previewArticleDate = document.getElementById('previewArticleDate');
  const previewArticleTitle = document.getElementById('previewArticleTitle');
  const previewArticleExcerpt = document.getElementById('previewArticleExcerpt');
  const previewArticleCoverWrap = document.getElementById('previewArticleCoverWrap');
  const previewArticleCoverImg = document.getElementById('previewArticleCoverImg');
  const previewArticleContent = document.getElementById('previewArticleContent');
  const previewArticleId = document.getElementById('previewArticleId');

  // Article Modal & WordPress Studio Elements
  const articleModal = document.getElementById('articleModal');
  const articleForm = document.getElementById('articleForm');
  const articleEditId = document.getElementById('articleEditId');
  const articleStatusInput = document.getElementById('articleStatusInput');
  const articleStatusSelect = document.getElementById('articleStatusSelect');
  const articleTitle = document.getElementById('articleTitle');
  const articleCategory = document.getElementById('articleCategory');
  const btnToggleNewCategory = document.getElementById('btnToggleNewCategory');
  const newCategoryInputWrap = document.getElementById('newCategoryInputWrap');
  const newCategoryName = document.getElementById('newCategoryName');
  const btnSaveNewCategory = document.getElementById('btnSaveNewCategory');
  const btnCancelNewCategory = document.getElementById('btnCancelNewCategory');
  const articleAuthor = document.getElementById('articleAuthor');
  const articleDateInput = document.getElementById('articleDateInput');
  const articleCover = document.getElementById('articleCover');
  const coverPreviewImg = document.getElementById('coverPreviewImg');
  const coverPlaceholder = document.getElementById('coverPlaceholder');
  const articleExcerpt = document.getElementById('articleExcerpt');
  const articleContent = document.getElementById('articleContent');
  const articleVisualEditor = document.getElementById('articleVisualEditor');
  const wpBlockFormat = document.getElementById('wpBlockFormat');
  const wpStatsCount = document.getElementById('wpStatsCount');
  const btnWpInsertLink = document.getElementById('btnWpInsertLink');
  const btnWpInsertImage = document.getElementById('btnWpInsertImage');
  const btnSaveDraft = document.getElementById('btnSaveDraft');
  const btnSaveArticle = document.getElementById('btnSaveArticle');
  const btnSaveArticleText = document.getElementById('btnSaveArticleText');
  const btnArticleModalClose = document.getElementById('btnArticleModalClose');
  const wpAutosaveIndicator = document.getElementById('wpAutosaveIndicator');
  const wpAutosaveText = document.getElementById('wpAutosaveText');
  const wpDraftRecoveryBanner = document.getElementById('wpDraftRecoveryBanner');
  const wpDraftRecoveryTime = document.getElementById('wpDraftRecoveryTime');
  const btnDiscardRecoveredDraft = document.getElementById('btnDiscardRecoveredDraft');
  const btnKeepRecoveredDraft = document.getElementById('btnKeepRecoveredDraft');

  // Yoast SEO & Google Search Appearance Elements
  const accYoastSeo = document.getElementById('accYoastSeo');
  const yoastHeaderScoreDot = document.getElementById('yoastHeaderScoreDot');
  const yoastFocusKeyphrase = document.getElementById('yoastFocusKeyphrase');
  const btnGetRelatedKeyphrases = document.getElementById('btnGetRelatedKeyphrases');
  const yoastRelatedChipsWrap = document.getElementById('yoastRelatedChipsWrap');
  const yoastRelatedChipsList = document.getElementById('yoastRelatedChipsList');
  const googleSnippetCard = document.getElementById('googleSnippetCard');
  const googleSnippetTitle = document.getElementById('googleSnippetTitle');
  const googleSnippetDate = document.getElementById('googleSnippetDate');
  const googleSnippetDesc = document.getElementById('googleSnippetDesc');
  const googleSnippetThumbImg = document.getElementById('googleSnippetThumbImg');
  const googlePreviewBreadcrumbSlug = document.getElementById('googlePreviewBreadcrumbSlug');
  const btnGenerateSeoTitle = document.getElementById('btnGenerateSeoTitle');
  const btnInsertVarSeoTitle = document.getElementById('btnInsertVarSeoTitle');
  const yoastSeoTitle = document.getElementById('yoastSeoTitle');
  const barSeoTitle = document.getElementById('barSeoTitle');
  const txtSeoTitleCount = document.getElementById('txtSeoTitleCount');
  const yoastSlug = document.getElementById('yoastSlug');
  const btnGenerateMetaDesc = document.getElementById('btnGenerateMetaDesc');
  const btnInsertVarMetaDesc = document.getElementById('btnInsertVarMetaDesc');
  const yoastMetaDesc = document.getElementById('yoastMetaDesc');
  const barMetaDesc = document.getElementById('barMetaDesc');
  const txtMetaDescCount = document.getElementById('txtMetaDescCount');
  const dotSeoAnalysis = document.getElementById('dotSeoAnalysis');
  const yoastAnalysisKeyphraseSubtitle = document.getElementById('yoastAnalysisKeyphraseSubtitle');
  const socialPreviewImg = document.getElementById('socialPreviewImg');
  const socialPreviewTitle = document.getElementById('socialPreviewTitle');
  const socialPreviewDesc = document.getElementById('socialPreviewDesc');
  const yoastSchemaAuthorPreview = document.getElementById('yoastSchemaAuthorPreview');
  const tabGbSeo = document.getElementById('tabGbSeo');

  // Inline Image Floating Toolbar Elements
  const wpInlineImgToolbar = document.getElementById('wpInlineImgToolbar');
  const replaceInlineImgFileInput = document.getElementById('replaceInlineImgFileInput');
  const btnReplaceSelectedImg = document.getElementById('btnReplaceSelectedImg');
  const btnDeleteSelectedImg = document.getElementById('btnDeleteSelectedImg');

  // WordPress Mode Tabs & Views
  const tabModeEditor = document.getElementById('tabModeEditor');
  const tabModeWpSync = document.getElementById('tabModeWpSync');
  const wpStudioEditorView = document.getElementById('wpStudioEditorView');
  const wpStudioSyncView = document.getElementById('wpStudioSyncView');
  const btnOpenWpSyncModal = document.getElementById('btnOpenWpSyncModal');
  const wpSyncModal = document.getElementById('wpSyncModal');
  const btnCloseWpSyncModal = document.getElementById('btnCloseWpSyncModal');

  // Local File Upload Dropzone
  const wpDropzone = document.getElementById('wpDropzone');
  const wpFileInput = document.getElementById('wpFileInput');

  // WordPress REST API Importer Elements
  const wpApiEndpointInput = document.getElementById('wpApiEndpointInput');
  const btnFetchWpApi = document.getElementById('btnFetchWpApi');
  const wpFetchResultsBox = document.getElementById('wpFetchResultsBox');
  const wpFetchCount = document.getElementById('wpFetchCount');
  const wpFetchList = document.getElementById('wpFetchList');
  const btnImportAllWp = document.getElementById('btnImportAllWp');
  const wpImportCategory = document.getElementById('wpImportCategory');
  const btnToggleNewWpCategory = document.getElementById('btnToggleNewWpCategory');
  const newWpCategoryInputWrap = document.getElementById('newWpCategoryInputWrap');
  const newWpCategoryName = document.getElementById('newWpCategoryName');
  const btnSaveNewWpCategory = document.getElementById('btnSaveNewWpCategory');
  const btnCancelNewWpCategory = document.getElementById('btnCancelNewWpCategory');

  // Detail Modal Elements
  const detailModal = document.getElementById('detailModal');
  const btnModalClose = document.getElementById('btnModalClose');
  const btnModalCloseFooter = document.getElementById('btnModalCloseFooter');
  const modalTitle = document.getElementById('modalTitle');
  const modalTypeBadge = document.getElementById('modalTypeBadge');
  const modalBody = document.getElementById('modalBody');
  const modalActions = document.getElementById('modalActions');
  const toastContainer = document.getElementById('toastContainer');

  // Initialize lifecycle safely (handles both fast-load & deferred execution)
  function initApp() {
    initAuth();
    loadAllData();
    setupEventListeners();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

  /* ===================================================
     1. AUTHENTICATION & DASHBOARD SWITCHER
     =================================================== */
  function initAuth() {
    const isAuth = sessionStorage.getItem('acf_admin_session') === 'active';
    if (isAuth) {
      showDashboard();
    } else {
      showLogin();
    }
  }

  function showLogin() {
    if (loginScreen) {
      loginScreen.style.display = 'flex';
    }
    if (dashboardScreen) {
      dashboardScreen.classList.remove('active');
      dashboardScreen.style.display = 'none';
    }
  }

  function showDashboard() {
    if (loginScreen) {
      loginScreen.style.display = 'none';
    }
    if (dashboardScreen) {
      dashboardScreen.style.display = 'flex';
      dashboardScreen.classList.add('active');
    }
    loadAllData();
    renderAll();
  }

  function showLoginSuccessAlert(adminName) {
    if (typeof Swal !== 'undefined') {
      Swal.fire({
        title: 'Login Berhasil!',
        html: `Selamat datang kembali di <b>Portal Admin ACF Eduhub</b>, <strong style="color: #7D2280;">${escapeHTML(adminName)}</strong>!<br><span style="font-size: 0.88rem; color: #64748B;">Sesi admin Anda telah aktif.</span>`,
        icon: 'success',
        timer: 1800,
        timerProgressBar: true,
        showConfirmButton: true,
        confirmButtonText: 'Masuk ke Dashboard',
        customClass: {
          popup: 'acf-swal-popup',
          confirmButton: 'btn-swal-confirm'
        },
        buttonsStyling: false
      }).then(() => {
        showDashboard();
      });
    } else {
      showToast('Selamat datang, ' + adminName + '!', 'success');
      showDashboard();
    }
  }

  async function handleLogin(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const user = (adminUsername ? adminUsername.value : '').trim();
    const pass = (adminPassword ? adminPassword.value : '').trim();

    try {
      if (window.ACF_API && window.ACF_API.auth) {
        const res = await window.ACF_API.auth.login(user, pass);
        if (res && res.success) {
          sessionStorage.setItem('acf_admin_session', 'active');
          if (loginAlert) loginAlert.classList.remove('show');
          showLoginSuccessAlert(res.data?.user?.full_name || 'Administrator');
          return;
        }
      }
    } catch (err) {
      console.warn('API login error, trying fallback:', err);
    }

    if (user === ADMIN_CREDENTIALS.username && pass === ADMIN_CREDENTIALS.password) {
      sessionStorage.setItem('acf_admin_session', 'active');
      if (loginAlert) loginAlert.classList.remove('show');
      showLoginSuccessAlert('Administrator');
    } else {
      if (loginAlertText) loginAlertText.textContent = 'Username atau kata sandi tidak valid!';
      if (loginAlert) loginAlert.classList.add('show');
      if (typeof Swal !== 'undefined') {
        Swal.fire({
          title: 'Login Gagal',
          html: 'Username atau kata sandi yang Anda masukkan tidak valid.<br><span style="font-size: 0.88rem; color: #64748B;">Pastikan data login Anda sudah benar.</span>',
          icon: 'error',
          confirmButtonText: 'Coba Lagi',
          customClass: {
            popup: 'acf-swal-popup',
            confirmButton: 'btn-swal-gold'
          },
          buttonsStyling: false
        });
      }
      if (adminPassword) {
        adminPassword.value = '';
        adminPassword.focus();
      }
    }
  }

  async function handleLogout() {
    if (typeof Swal !== 'undefined') {
      const result = await Swal.fire({
        title: 'Konfirmasi Keluar',
        html: 'Apakah Anda yakin ingin mengakhiri sesi dan keluar dari <b>Portal Admin ACF Eduhub</b>?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ya, Keluar',
        cancelButtonText: 'Batal',
        reverseButtons: true,
        customClass: {
          popup: 'acf-swal-popup',
          confirmButton: 'btn-swal-confirm',
          cancelButton: 'btn-swal-cancel'
        },
        buttonsStyling: false
      });

      if (!result.isConfirmed) {
        return;
      }
    } else {
      if (!confirm('Apakah Anda yakin ingin keluar dari Portal Admin?')) {
        return;
      }
    }

    try {
      if (window.ACF_API && window.ACF_API.auth) {
        await window.ACF_API.auth.logout();
      }
    } catch (_) {}

    sessionStorage.removeItem('acf_admin_session');
    if (adminUsername) adminUsername.value = '';
    if (adminPassword) adminPassword.value = '';
    if (loginAlert) loginAlert.classList.remove('show');
    showLogin();

    if (typeof Swal !== 'undefined') {
      Swal.fire({
        title: 'Berhasil Keluar',
        html: 'Anda telah keluar dari sesi admin dengan aman.<br><span style="font-size: 0.88rem; color: #64748B;">Terima kasih atas dedikasi Anda di ACF Eduhub!</span>',
        icon: 'success',
        timer: 1800,
        timerProgressBar: true,
        showConfirmButton: false,
        customClass: {
          popup: 'acf-swal-popup'
        }
      });
    } else {
      showToast('Anda telah keluar dari sesi admin.', 'info');
    }
  }

  function switchDashboardView(viewId) {
    activeDashboard = viewId;
    if (viewId === 'viewDashboardPrograms') {
      if (btnNavPrograms) btnNavPrograms.classList.add('active');
      if (btnNavArticles) btnNavArticles.classList.remove('active');
      if (btnNavForms) btnNavForms.classList.remove('active');

      if (viewDashboardPrograms) {
        viewDashboardPrograms.style.display = 'block';
        viewDashboardPrograms.classList.add('active');
      }
      if (viewDashboardArticles) {
        viewDashboardArticles.style.display = 'none';
        viewDashboardArticles.classList.remove('active');
      }
      if (viewDashboardForms) {
        viewDashboardForms.style.display = 'none';
        viewDashboardForms.classList.remove('active');
      }
      if (sheetsDropdownWrap) sheetsDropdownWrap.style.display = 'none';
      renderTablePrograms();
      updateProgramMetrics();
    } else if (viewId === 'viewDashboardForms') {
      if (btnNavForms) btnNavForms.classList.add('active');
      if (btnNavArticles) btnNavArticles.classList.remove('active');
      if (btnNavPrograms) btnNavPrograms.classList.remove('active');

      if (viewDashboardForms) {
        viewDashboardForms.style.display = 'block';
        viewDashboardForms.classList.add('active');
      }
      if (viewDashboardArticles) {
        viewDashboardArticles.style.display = 'none';
        viewDashboardArticles.classList.remove('active');
      }
      if (viewDashboardPrograms) {
        viewDashboardPrograms.style.display = 'none';
        viewDashboardPrograms.classList.remove('active');
      }
      if (sheetsDropdownWrap) sheetsDropdownWrap.style.display = 'inline-flex';
      renderTableMitra();
      renderTableRelawan();
      updateMetricCards();
    } else {
      // Default to viewDashboardArticles
      if (btnNavArticles) btnNavArticles.classList.add('active');
      if (btnNavForms) btnNavForms.classList.remove('active');
      if (btnNavPrograms) btnNavPrograms.classList.remove('active');

      if (viewDashboardArticles) {
        viewDashboardArticles.style.display = 'block';
        viewDashboardArticles.classList.add('active');
      }
      if (viewDashboardForms) {
        viewDashboardForms.style.display = 'none';
        viewDashboardForms.classList.remove('active');
      }
      if (viewDashboardPrograms) {
        viewDashboardPrograms.style.display = 'none';
        viewDashboardPrograms.classList.remove('active');
      }
      if (sheetsDropdownWrap) sheetsDropdownWrap.style.display = 'none';
      renderTableArticles();
    }
  }

  /* ===================================================
     2. DATA PERSISTENCE & STORAGE
     =================================================== */
  const MOCK_IDS = ['MITRA-1001', 'MITRA-1002', 'MITRA-1003', 'REL-2001', 'REL-2002', 'REL-2003'];
  const MOCK_NAMES = [
    'PT Inspirasi Edukasi Nusantara',
    'Yayasan Peduli Generasi Bangsa',
    'Komunitas Pengusaha Muda Bandung',
    'Annisa Nurul Hidayah',
    'Dimas Fajar Ramadhan, S.Kom.',
    'Dr. Sarah Kartika'
  ];

  function isMockItem(item) {
    if (!item) return false;
    if (MOCK_IDS.includes(item.id)) return true;
    if (MOCK_NAMES.includes(item.namaInstansi)) return true;
    if (MOCK_NAMES.includes(item.namaLengkap)) return true;
    return false;
  }

  function isSchoolCategory(slug = '', label = '') {
    const s = String(slug || '').toLowerCase();
    const l = String(label || '').toLowerCase();
    if (s === 'kabar-sekolah-juara' || s === 'kabar-sekolah-daya-setara') return false;
    return (
      s.includes('sd-juara') ||
      s.includes('sekolah-juara') ||
      s.includes('daya-setara') ||
      s.includes('dayasetara') ||
      s.includes('berita-sd') ||
      s.includes('prestasi-sd') ||
      s.includes('berita-sekolah') ||
      s.includes('prestasi-sekolah') ||
      l.includes('sd juara') ||
      l.includes('sekolah juara') ||
      l.includes('daya setara') ||
      l.includes('berita sd') ||
      l.includes('prestasi sd') ||
      l === 'berita sekolah' ||
      l === 'prestasi sekolah' ||
      l === 'sekolah'
    );
  }

  async function loadCategories() {
    try {
      if (window.ACF_API && window.ACF_API.categories) {
        const cats = await window.ACF_API.categories.getAll();
        if (Array.isArray(cats) && cats.length > 0) {
          dataCategories = cats.filter(c => !isSchoolCategory(c.slug, c.label));
        }
      }

      if (!dataCategories || dataCategories.length === 0) {
        dataCategories = [...DEFAULT_CATEGORIES];
      }

      if (!dataCategories.some(c => c.slug === 'kabar-sekolah-daya-setara')) {
        dataCategories.unshift({ slug: 'kabar-sekolah-daya-setara', label: 'Artikel Sekolah Daya Setara' });
      }
      if (!dataCategories.some(c => c.slug === 'kabar-sekolah-juara')) {
        dataCategories.splice(1, 0, { slug: 'kabar-sekolah-juara', label: 'Artikel Sekolah Juara' });
      }
      localStorage.removeItem('acf_custom_categories');
    } catch (e) {
      dataCategories = [...DEFAULT_CATEGORIES];
    }
  }

  function saveCategories() {
    // Kategori dikelola langsung lewat MySQL Backend API
    localStorage.removeItem('acf_custom_categories');
  }

  function registerCategory(label, customSlug = '') {
    const cleanLabel = (label || '').trim();
    if (!cleanLabel) return null;
    const slug = customSlug || cleanLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    // Jangan izinkan membuat pecahan kategori per-sekolah / SD Juara
    if (isSchoolCategory(slug, cleanLabel)) {
      if (slug.includes('daya-setara') || cleanLabel.toLowerCase().includes('daya setara')) {
        return dataCategories.find(c => c.slug === 'kabar-sekolah-daya-setara') || { slug: 'kabar-sekolah-daya-setara', label: 'Artikel Sekolah Daya Setara' };
      }
      return dataCategories.find(c => c.slug === 'kabar-sekolah-juara') || { slug: 'kabar-sekolah-juara', label: 'Artikel Sekolah Juara' };
    }

    let existing = dataCategories.find(c => c.slug === slug || c.label.toLowerCase() === cleanLabel.toLowerCase());
    if (!existing) {
      existing = { slug, label: cleanLabel };
      dataCategories.push(existing);
      saveCategories();
      if (window.ACF_API && window.ACF_API.categories) {
        window.ACF_API.categories.create(cleanLabel, slug).catch(() => {});
      }
    }
    renderCategorySelects(existing.slug);
    return existing;
  }

  function renderCategorySelects(selectedSlug = '') {
    if (articleCategory) {
      const currentVal = selectedSlug || articleCategory.value;
      articleCategory.innerHTML = '';
      dataCategories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat.slug;
        opt.textContent = cat.label;
        articleCategory.appendChild(opt);
      });
      if (currentVal && dataCategories.some(c => c.slug === currentVal)) {
        articleCategory.value = currentVal;
      }
    }

    if (wpImportCategory) {
      const currentWpVal = selectedSlug || wpImportCategory.value;
      wpImportCategory.innerHTML = '<option value="__auto__">✨ Sesuai Kategori Asli WordPress (Otomatis)</option>';
      dataCategories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat.slug;
        opt.textContent = cat.label;
        wpImportCategory.appendChild(opt);
      });
      if (currentWpVal && (currentWpVal === '__auto__' || dataCategories.some(c => c.slug === currentWpVal))) {
        wpImportCategory.value = currentWpVal;
      } else {
        wpImportCategory.value = '__auto__';
      }
    }

    if (filterCategoryArticle) {
      const currentFilter = filterCategoryArticle.value;
      filterCategoryArticle.innerHTML = '<option value="all">Semua Kategori</option>';
      dataCategories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat.slug;
        opt.textContent = cat.label;
        filterCategoryArticle.appendChild(opt);
      });
      if (currentFilter && (currentFilter === 'all' || dataCategories.some(c => c.slug === currentFilter))) {
        filterCategoryArticle.value = currentFilter;
      }
    }

    if (countArticleCategories) {
      countArticleCategories.textContent = dataCategories.length;
    }
  }

  /* ===================================================
     CATEGORY MANAGER MODAL & CRUD
     =================================================== */
  function updateBodyScrollLock() {
    const hasOpenModal = document.querySelector('.admin-modal-backdrop.show');
    if (hasOpenModal) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
  }

  function openCategoryModal() {
    if (categoryManagerModal) {
      categoryManagerModal.classList.add('show');
      updateBodyScrollLock();
      renderCategoryManagerList();
      if (inputNewCatLabel) {
        inputNewCatLabel.value = '';
        setTimeout(() => inputNewCatLabel.focus(), 100);
      }
    }
  }

  function closeCategoryModal() {
    if (categoryManagerModal) {
      categoryManagerModal.classList.remove('show');
      updateBodyScrollLock();
    }
  }

  function renderCategoryManagerList() {
    if (!categoryListContainer) return;
    if (catModalTotalCount) catModalTotalCount.textContent = dataCategories.length;

    categoryListContainer.innerHTML = '';
    if (dataCategories.length === 0) {
      categoryListContainer.innerHTML = `
        <div style="text-align: center; padding: 24px; color: #64748B; font-size: 0.88rem;">
          Belum ada kategori aktif. Silakan tambahkan kategori baru di atas.
        </div>
      `;
      return;
    }

    dataCategories.forEach(cat => {
      // Hitung jumlah artikel dengan kategori ini
      const count = dataArticles.filter(a => a.category === cat.slug).length;
      
      const card = document.createElement('div');
      card.className = 'category-item-card';
      card.innerHTML = `
        <div class="category-item-left">
          <div class="category-item-icon">🏷️</div>
          <div>
            <div class="category-item-title">${escapeHTML(cat.label)}</div>
            <div class="category-item-slug">slug: ${escapeHTML(cat.slug)}</div>
          </div>
        </div>
        <div class="category-item-right">
          <span class="category-count-badge">${count} Artikel</span>
          <button type="button" class="btn-delete-cat" data-slug="${escapeHTML(cat.slug)}" data-label="${escapeHTML(cat.label)}" title="Hapus kategori '${escapeHTML(cat.label)}'">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
            <span>Hapus</span>
          </button>
        </div>
      `;
      categoryListContainer.appendChild(card);
    });
  }

  function deleteCategory(slug) {
    const target = dataCategories.find(c => c.slug === slug);
    if (!target) return;

    if (dataCategories.length <= 1) {
      alert('Tidak dapat menghapus kategori. Minimal harus tersisa 1 kategori aktif di sistem!');
      return;
    }

    const affectedArticles = dataArticles.filter(a => a.category === slug);
    const fallbackCat = dataCategories.find(c => c.slug !== slug);

    let confirmMsg = `Apakah Anda yakin ingin menghapus kategori "${target.label}"?`;
    if (affectedArticles.length > 0 && fallbackCat) {
      confirmMsg = `Kategori "${target.label}" saat ini digunakan oleh ${affectedArticles.length} artikel.\n\nJika kategori ini dihapus, semua artikel tersebut akan dialihkan ke kategori "${fallbackCat.label}".\n\nApakah Anda yakin ingin melanjutkan penghapusan?`;
    }

    if (!confirm(confirmMsg)) return;

    // Alihkan artikel terdampak ke fallback category
    if (affectedArticles.length > 0 && fallbackCat) {
      dataArticles.forEach(a => {
        if (a.category === slug) {
          a.category = fallbackCat.slug;
          if (a.categoryLabel === target.label) {
            a.categoryLabel = fallbackCat.label;
          }
        }
      });
      saveArticlesData();
    }

    // Hapus dari dataCategories & MySQL Backend
    dataCategories = dataCategories.filter(c => c.slug !== slug);
    saveCategories();
    if (window.ACF_API && window.ACF_API.categories) {
      window.ACF_API.categories.delete(slug).catch(() => {});
    }

    // Re-render antarmuka
    renderCategorySelects();
    renderCategoryManagerList();
    renderTableArticles();
    updateMetricCards();
    showToast(`Kategori "${target.label}" berhasil dihapus.`, 'success');
  }

  function addNewCategoryFromModal(label) {
    const cleanLabel = (label || '').trim();
    if (!cleanLabel) {
      showToast('Nama kategori tidak boleh kosong!', 'info');
      return;
    }

    const slug = cleanLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const exists = dataCategories.some(c => c.slug === slug || c.label.toLowerCase() === cleanLabel.toLowerCase());
    if (exists) {
      alert(`Kategori "${cleanLabel}" sudah ada dalam daftar!`);
      return;
    }

    dataCategories.push({ slug, label: cleanLabel });
    saveCategories();
    if (window.ACF_API && window.ACF_API.categories) {
      window.ACF_API.categories.create(cleanLabel, slug).catch(() => {});
    }
    renderCategorySelects(slug);
    renderCategoryManagerList();
    updateMetricCards();
    if (inputNewCatLabel) inputNewCatLabel.value = '';
    showToast(`Kategori "${cleanLabel}" berhasil ditambahkan!`, 'success');
  }

  function parseArticleDate(dateStr) {
    if (!dateStr) return new Date(0);
    if (dateStr instanceof Date) return dateStr;

    const str = String(dateStr).trim();
    const idMonths = {
      'jan': 'Jan', 'januari': 'Jan',
      'feb': 'Feb', 'februari': 'Feb',
      'mar': 'Mar', 'maret': 'Mar',
      'apr': 'Apr', 'april': 'Apr',
      'mei': 'May', 'may': 'May',
      'jun': 'Jun', 'juni': 'Jun',
      'jul': 'Jul', 'juli': 'Jul',
      'agu': 'Aug', 'agustus': 'Aug', 'aug': 'Aug',
      'sep': 'Sep', 'september': 'Sep',
      'okt': 'Oct', 'oktober': 'Oct', 'oct': 'Oct',
      'nov': 'Nov', 'november': 'Nov',
      'des': 'Dec', 'desember': 'Dec', 'dec': 'Dec'
    };

    let normalizedStr = str;
    for (const [idm, enm] of Object.entries(idMonths)) {
      const regex = new RegExp(`\\b${idm}\\b`, 'gi');
      if (regex.test(normalizedStr)) {
        normalizedStr = normalizedStr.replace(regex, enm);
        break;
      }
    }

    const parsed = new Date(normalizedStr);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }

    const dmyMatch = str.match(/(\d{1,2})[\s\-\/\.]+(\w+)[\s\-\/\.]+(\d{4})/);
    if (dmyMatch) {
      const day = dmyMatch[1];
      const mon = dmyMatch[2].toLowerCase();
      const yr = dmyMatch[3];
      const enMon = idMonths[mon] || 'Jan';
      const fallbackParsed = new Date(`${enMon} ${day}, ${yr}`);
      if (!isNaN(fallbackParsed.getTime())) return fallbackParsed;
    }

    const ymdMatch = str.match(/(\d{4})[\s\-\/\.]+(\d{1,2})[\s\-\/\.]+(\d{1,2})/);
    if (ymdMatch) {
      const fallbackYmd = new Date(`${ymdMatch[1]}-${ymdMatch[2]}-${ymdMatch[3]}`);
      if (!isNaN(fallbackYmd.getTime())) return fallbackYmd;
    }

    return new Date(0);
  }

  async function loadAllData() {
    try {
      await loadCategories();

      // Mitra - Ambil langsung dari MySQL Backend API
      if (window.ACF_API && window.ACF_API.mitra) {
        const fetchedMitra = await window.ACF_API.mitra.getAll();
        dataMitra = Array.isArray(fetchedMitra) ? fetchedMitra.filter(item => !isMockItem(item)) : [];
      } else {
        dataMitra = [];
      }
      localStorage.removeItem('acf_admin_data_mitra');

      // Relawan - Ambil langsung dari MySQL Backend API
      if (window.ACF_API && window.ACF_API.relawan) {
        const fetchedRelawan = await window.ACF_API.relawan.getAll();
        dataRelawan = Array.isArray(fetchedRelawan) ? fetchedRelawan.filter(item => !isMockItem(item)) : [];
      } else {
        dataRelawan = [];
      }
      localStorage.removeItem('acf_admin_data_relawan');

      // Articles - Ambil langsung dari MySQL Backend API
      if (window.ACF_API && window.ACF_API.articles) {
        const fetchedArticles = await window.ACF_API.articles.getAll({ status: 'all' });
        if (Array.isArray(fetchedArticles) && fetchedArticles.length > 0) {
          dataArticles = fetchedArticles;
        } else {
          dataArticles = [];
        }
      } else {
        dataArticles = [];
      }
      localStorage.removeItem('acf_articles_data');

      if (Array.isArray(dataArticles)) {
        const normalizeTitle = (t) => String(t || '').trim().toLowerCase().replace(/[\u2018\u2019\u201C\u201D"']/g, '').replace(/\s+/g, ' ');
        const seenIds = new Set();
        const seenTitles = new Set();
        const cleanList = [];

        dataArticles.forEach(art => {
          if (!art) return;
          const id = String(art.id || '').trim();
          const t = normalizeTitle(art.title);
          if (id === 'ART-3001' || id === 'ART-3002' || id === 'ART-3003') return;
          if (id && seenIds.has(id)) return;
          if (t && seenTitles.has(t)) return;
          if (id) seenIds.add(id);
          if (t) seenTitles.add(t);

          if (art.category === 'kabar-sekolah-juara' || art.category === 'sekolah-juara' || (art.id && art.id.startsWith('ART-SJ'))) {
            art.category = 'kabar-sekolah-juara';
            art.categoryLabel = 'Artikel Sekolah Juara';
          }
          if (art.category === 'kabar-sekolah-daya-setara' || art.category === 'sekolah-daya-setara' || (art.id && art.id.startsWith('ART-SDS'))) {
            art.category = 'kabar-sekolah-daya-setara';
            art.categoryLabel = 'Artikel Sekolah Daya Setara';
          }
          cleanList.push(art);
        });

        dataArticles = cleanList;
        dataArticles.sort((a, b) => parseArticleDate(b.date) - parseArticleDate(a.date));
      }

      // Pastikan kategori dari artikel yang tersimpan terdaftar di memori
      dataArticles.forEach(art => {
        if (art.category && art.categoryLabel && !dataCategories.some(c => c.slug === art.category)) {
          dataCategories.push({ slug: art.category, label: art.categoryLabel });
        }
      });

      loadProgramsData();
      renderCategorySelects();
      renderAll();

    } catch (err) {
      console.error('Error loading data:', err);
      dataMitra = [];
      dataRelawan = [];
      dataArticles = [...INITIAL_ARTICLES_DATA].sort((a, b) => parseArticleDate(b.date) - parseArticleDate(a.date));
      renderAll();
    }
  }

  function saveDataMitra() {
    // Data kemitraan kini langsung dikelola melalui MySQL Backend API
    localStorage.removeItem('acf_admin_data_mitra');
  }

  function saveDataRelawan() {
    // Data relawan kini langsung dikelola melalui MySQL Backend API
    localStorage.removeItem('acf_admin_data_relawan');
  }

  function saveArticlesData() {
    // Data artikel dikelola langsung lewat MySQL Backend API
    try {
      localStorage.setItem('acf_article_updated', Date.now().toString());
    } catch (e) {}
    localStorage.removeItem('acf_articles_data');
  }

  /* ===================================================
     3. RENDERING ENGINE
     =================================================== */
  function renderAll() {
    renderCategorySelects();
    updateMetricCards();
    renderTableMitra();
    renderTableRelawan();
    renderTableArticles();
    renderTablePrograms();
    updateProgramMetrics();
  }

  function updateMetricCards() {
    // Forms Metrics
    const totalMitra = dataMitra.length;
    const totalRelawan = dataRelawan.length;
    const totalAll = totalMitra + totalRelawan;

    const pendingMitra = dataMitra.filter(i => (i.status || 'Menunggu') === 'Menunggu').length;
    const pendingRelawan = dataRelawan.filter(i => (i.status || 'Menunggu') === 'Menunggu').length;
    const pendingTotal = pendingMitra + pendingRelawan;

    if (countMitraEl) countMitraEl.textContent = totalMitra;
    if (countRelawanEl) countRelawanEl.textContent = totalRelawan;
    if (countPendingEl) countPendingEl.textContent = pendingTotal;
    if (countTotalEl) countTotalEl.textContent = totalAll;

    if (badgeTabMitra) badgeTabMitra.textContent = totalMitra;
    if (badgeTabRelawan) badgeTabRelawan.textContent = totalRelawan;

    // Articles Metrics
    const publishedArticlesCount = dataArticles.filter(art => (art.status || 'Terbit') !== 'Draf').length;
    if (countArticlesPublished) countArticlesPublished.textContent = publishedArticlesCount;
    if (countArticleCategories) countArticleCategories.textContent = dataCategories.length;
  }

  function getBadgeClass(status) {
    switch (status) {
      case 'Sudah Dihubungi': return 'status-dihubungi';
      case 'Diterima': return 'status-diterima';
      case 'Arsip': return 'status-arsip';
      default: return 'status-menunggu';
    }
  }

  function getCategoryLabel(cat) {
    const found = dataCategories.find(c => c.slug === cat);
    if (found) return found.label;
    switch (cat) {
      case 'liputan': return 'Liputan Lapangan';
      case 'vokasi': return 'Program Vokasi';
      case 'opini': return 'Kolaborasi & Opini';
      default: return 'Artikel Pendidikan';
    }
  }

  // Render Mitra Table (Sesuai 100% dengan Form Mitra Program)
  function renderTableMitra() {
    if (!tbodyMitra) return;
    const query = (searchMitra?.value || '').toLowerCase().trim();
    const statusFilter = filterStatusMitra?.value || 'all';

    const filtered = dataMitra.filter(item => {
      const matchQuery = !query ||
        (item.namaInstansi || '').toLowerCase().includes(query) ||
        (item.kotaInstansi || '').toLowerCase().includes(query) ||
        (item.namaPIC || '').toLowerCase().includes(query) ||
        (item.email || '').toLowerCase().includes(query) ||
        (item.noWA || '').toLowerCase().includes(query);

      const matchStatus = statusFilter === 'all' || (item.status || 'Menunggu') === statusFilter;
      return matchQuery && matchStatus;
    });

    tbodyMitra.innerHTML = '';

    if (filtered.length === 0) {
      if (emptyMitra) emptyMitra.style.display = 'block';
    } else {
      if (emptyMitra) emptyMitra.style.display = 'none';
      filtered.forEach((item, index) => {
        const tr = document.createElement('tr');
        const st = item.status || 'Menunggu';
        const kotaStr = item.kotaInstansi ? ` • ${item.kotaInstansi}` : '';
        const bentukStr = item.jenisKemitraan || item.fokusKemitraan || '-';
        const targetStr = item.estimasiWaktu || item.anggaran || '-';

        tr.innerHTML = `
          <td class="cell-date">${escapeHTML(item.timestamp || '-')}</td>
          <td>
            <div class="cell-primary">${escapeHTML(item.namaInstansi || '-')}</div>
            <div class="cell-sub">${escapeHTML(item.jenisInstansi || '-')}${escapeHTML(kotaStr)}</div>
          </td>
          <td>
            <div class="cell-primary">${escapeHTML(item.namaPIC || '-')}</div>
            <div class="cell-sub">${escapeHTML(item.jabatanPIC || '-')}</div>
          </td>
          <td>
            <div style="font-weight: 500;">${escapeHTML(item.noWA || '-')}</div>
            <div class="cell-sub">${escapeHTML(item.email || '-')}</div>
          </td>
          <td>
            <span style="font-size: 0.85rem; color: #1E293B; font-weight: 500;">${escapeHTML(item.fokusProgram || item.fokusKemitraan || '-')}</span>
          </td>
          <td>
            <div style="font-size: 0.85rem; color: #1E293B; font-weight: 600;">${escapeHTML(bentukStr)}</div>
            <div class="cell-sub">${escapeHTML(targetStr)}</div>
          </td>
          <td>
            <span class="status-badge ${getBadgeClass(st)}">${st}</span>
          </td>
          <td>
            <button type="button" class="btn-action-view" data-type="mitra" data-id="${item.id || index}">
              <svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              <span>Detail</span>
            </button>
          </td>
        `;
        tbodyMitra.appendChild(tr);
      });
    }
  }

  // Render Relawan Table
  function renderTableRelawan() {
    if (!tbodyRelawan) return;
    const query = (searchRelawan?.value || '').toLowerCase().trim();
    const statusFilter = filterStatusRelawan?.value || 'all';

    const filtered = dataRelawan.filter(item => {
      const matchQuery = !query ||
        (item.namaLengkap || '').toLowerCase().includes(query) ||
        (item.domisili || '').toLowerCase().includes(query) ||
        (item.email || '').toLowerCase().includes(query) ||
        (item.noWA || '').toLowerCase().includes(query);

      const matchStatus = statusFilter === 'all' || (item.status || 'Menunggu') === statusFilter;
      return matchQuery && matchStatus;
    });

    tbodyRelawan.innerHTML = '';

    if (filtered.length === 0) {
      if (emptyRelawan) emptyRelawan.style.display = 'block';
    } else {
      if (emptyRelawan) emptyRelawan.style.display = 'none';
      filtered.forEach((item, index) => {
        const tr = document.createElement('tr');
        const st = item.status || 'Menunggu';
        tr.innerHTML = `
          <td class="cell-date">${escapeHTML(item.timestamp || '-')}</td>
          <td>
            <div class="cell-primary">${escapeHTML(item.namaLengkap || '-')}</div>
            <div class="cell-sub">${escapeHTML(item.email || '-')}</div>
          </td>
          <td>
            <div class="cell-primary">${escapeHTML(item.domisili || '-')}</div>
            <div class="cell-sub">${escapeHTML(item.profesi || '-')}</div>
          </td>
          <td>
            <div style="font-weight: 500;">${escapeHTML(item.noWA || '-')}</div>
          </td>
          <td>
            <span style="font-size: 0.85rem; color: #1E293B;">${escapeHTML(item.peranRelawan || '-')}</span>
          </td>
          <td>
            <span style="font-size: 0.82rem; color: #475569;">${escapeHTML(item.komitmenWaktu || '-')}</span>
          </td>
          <td>
            <span class="status-badge ${getBadgeClass(st)}">${st}</span>
          </td>
          <td>
            <button type="button" class="btn-action-view" data-type="relawan" data-id="${item.id || index}">
              <svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              <span>Detail</span>
            </button>
          </td>
        `;
        tbodyRelawan.appendChild(tr);
      });
    }
  }

  // Render Articles Table (Dashboard 2)
  function renderTableArticles() {
    if (!tbodyArticles) return;
    const query = (searchArticle?.value || '').toLowerCase().trim();
    const catFilter = filterCategoryArticle?.value || 'all';
    const statusFilter = filterStatusArticle?.value || 'all';

    const filtered = dataArticles.filter(art => {
      const matchQuery = !query ||
        (art.title || '').toLowerCase().includes(query) ||
        (art.author || '').toLowerCase().includes(query) ||
        (art.excerpt || '').toLowerCase().includes(query);

      const matchCat = catFilter === 'all' || art.category === catFilter;
      const matchStatus = statusFilter === 'all' || (art.status || 'Terbit') === statusFilter;
      return matchQuery && matchCat && matchStatus;
    });

    const sortedArticles = [...filtered].sort((a, b) => parseArticleDate(b.date) - parseArticleDate(a.date));

    tbodyArticles.innerHTML = '';

    if (sortedArticles.length === 0) {
      if (emptyArticles) emptyArticles.style.display = 'block';
    } else {
      if (emptyArticles) emptyArticles.style.display = 'none';
      sortedArticles.forEach((art) => {
        const isDraft = (art.status === 'Draf');
        const statusBadgeClass = isDraft ? 'status-menunggu status-badge-draf' : 'status-diterima status-badge-terbit';
        const statusBadgeText = isDraft ? 'Draf' : 'Terpublikasi';

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>
            <div class="article-thumbnail-cell">
              <img src="${escapeHTML(art.cover || '../assets/logo-acf/LOGO_ACF-removebg-preview.png')}" alt="Cover" class="article-thumb-img" onerror="this.src='https://images.unsplash.com/photo-1509062522246-3755977927d7?w=200&q=80'">
              <div>
                <div class="cell-primary" style="font-size: 0.92rem; max-width: 250px; ${art.title_color ? `color: ${escapeHTML(art.title_color)}; font-weight: 700;` : ''}">${escapeHTML(art.title || '-')}</div>
                <div class="cell-sub" style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHTML(art.excerpt || '-')}</div>
              </div>
            </div>
          </td>
          <td>
            <span class="article-cat-tag">${escapeHTML(art.categoryLabel || getCategoryLabel(art.category))}</span>
          </td>
          <td>
            <div style="font-weight: 500; color: #1E293B;">${escapeHTML(art.author || 'Tim Redaksi ACF')}</div>
          </td>
          <td>
            <span class="cell-date">${escapeHTML(art.date || '-')}</span>
          </td>
          <td>
            <span class="status-badge ${statusBadgeClass}">${statusBadgeText}</span>
          </td>
          <td style="text-align: center; white-space: nowrap;">
            <button type="button" class="btn-action-preview btn-preview-article" data-id="${art.id}" style="margin-right: 6px;" title="Lihat preview tampilan artikel">
              <svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              <span>Preview</span>
            </button>
            <button type="button" class="btn-action-view btn-edit-article" data-id="${art.id}" style="margin-right: 6px;" title="Edit artikel ini">
              <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              <span>Edit</span>
            </button>
            <button type="button" class="btn-action-delete btn-delete-article" data-id="${art.id}" title="Hapus artikel">
              <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
              <span>Hapus</span>
            </button>
          </td>
        `;
        tbodyArticles.appendChild(tr);
      });
    }
  }

  /* ===================================================
     4. WORDPRESS STUDIO EDITOR & REST API HANDLERS
     =================================================== */
  function openWpSyncModal() {
    renderCategorySelects(wpImportCategory?.value || '__auto__');
    if (wpSyncModal) {
      wpSyncModal.classList.add('show');
      updateBodyScrollLock();
    }
  }

  function closeWpSyncModal() {
    if (wpSyncModal) {
      wpSyncModal.classList.remove('show');
      updateBodyScrollLock();
    }
  }

  // ==========================================
  // WORDPRESS ARTICLE DRAFT AUTOSAVE & RECOVERY
  // ==========================================
  const DRAFT_STORAGE_KEY = 'acf_active_article_draft_v1';
  let autosaveDebounceTimer = null;

  function triggerAutosave() {
    if (!articleModal || !articleModal.classList.contains('show')) return;
    
    // Jangan autosave jika sedang mengedit artikel yang sudah ada (hanya untuk naskah baru/draf aktif)
    const isExistingEdit = articleEditId && articleEditId.value;
    if (isExistingEdit) return;

    const title = articleTitle ? articleTitle.value.trim() : '';
    const content = articleVisualEditor ? articleVisualEditor.innerHTML.trim() : '';
    const cover = articleCover ? articleCover.value.trim() : '';

    if (!title && !content && !cover) {
      return;
    }

    clearTimeout(autosaveDebounceTimer);
    autosaveDebounceTimer = setTimeout(() => {
      saveDraftToStorage();
    }, 400);
  }

  // ==========================================
  // YOAST SEO & SEARCH APPEARANCE LOGIC
  // ==========================================
  function slugifyText(text) {
    return (text || '')
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function resolveSeoTemplate(template, fallback) {
    if (!template || !template.trim()) return fallback || '';
    const titleVal = articleTitle ? articleTitle.value.trim() : '';
    return template
      .replace(/%title%/gi, titleVal || 'Judul Artikel')
      .replace(/%page%/gi, '1')
      .replace(/%sep%/gi, '-')
      .replace(/%sitename%/gi, 'ACF Eduhub')
      .trim();
  }

  function updateYoastPreviews() {
    const rawTitle = articleTitle ? articleTitle.value.trim() : '';
    const rawKeyphrase = yoastFocusKeyphrase ? yoastFocusKeyphrase.value.trim() : '';
    const rawSeoTitle = yoastSeoTitle ? yoastSeoTitle.value.trim() : '';
    const rawSlug = yoastSlug ? yoastSlug.value.trim() : '';
    const rawMetaDesc = yoastMetaDesc ? yoastMetaDesc.value.trim() : '';
    const rawExcerpt = articleExcerpt ? articleExcerpt.value.trim() : '';
    const rawContentText = articleVisualEditor ? (articleVisualEditor.innerText || '').trim() : '';
    const rawCover = articleCover ? articleCover.value.trim() : (coverPreviewImg && coverPreviewImg.src ? coverPreviewImg.src : '');

    // 1. Resolve Display Title for Google Snippet
    const defaultGoogleTitle = rawTitle ? `${rawTitle} - ACF Eduhub` : 'Judul Artikel Akan Muncul di Sini - ACF Eduhub';
    const finalGoogleTitle = rawSeoTitle ? resolveSeoTemplate(rawSeoTitle, defaultGoogleTitle) : defaultGoogleTitle;
    if (googleSnippetTitle) googleSnippetTitle.textContent = finalGoogleTitle;
    if (socialPreviewTitle) socialPreviewTitle.textContent = rawTitle || 'Judul Artikel ACF Eduhub';

    // 2. Resolve Slug
    let cleanSlug = '';
    if (rawSlug) {
      cleanSlug = slugifyText(rawSlug);
    } else if (rawTitle) {
      cleanSlug = slugifyText(rawTitle);
      if (yoastSlug && yoastSlug.dataset.custom !== 'true') {
        yoastSlug.value = cleanSlug;
      }
    } else {
      cleanSlug = 'post-slug';
    }
    if (googlePreviewBreadcrumbSlug) googlePreviewBreadcrumbSlug.textContent = cleanSlug;

    // 3. Resolve Date & Snippet Description
    const dateVal = articleDateInput ? articleDateInput.value.trim() : '';
    if (googleSnippetDate) googleSnippetDate.textContent = dateVal || '20 Okt 2026';
    
    let snippetDesc = rawMetaDesc;
    if (!snippetDesc && rawExcerpt) snippetDesc = rawExcerpt;
    if (!snippetDesc && rawContentText) {
      snippetDesc = rawContentText.slice(0, 140) + '...';
    }
    if (!snippetDesc) {
      snippetDesc = 'Cuplikan deskripsi artikel naskah Anda yang akan menarik pembaca ketika mencari topik ini di Google Search...';
    }
    if (googleSnippetDesc) googleSnippetDesc.textContent = snippetDesc;
    if (socialPreviewDesc) socialPreviewDesc.textContent = snippetDesc;

    // 4. Resolve Thumbnail Image
    const fallbackLogo = '../assets/logo-acf/LOGO_ACF-removebg-preview.png';
    const finalCover = rawCover && (rawCover.startsWith('http') || rawCover.startsWith('data:') || rawCover.includes('/')) ? rawCover : fallbackLogo;
    if (googleSnippetThumbImg) googleSnippetThumbImg.src = finalCover;
    if (socialPreviewImg) socialPreviewImg.src = finalCover;

    // 5. Update Schema Author
    if (yoastSchemaAuthorPreview && articleAuthor) {
      yoastSchemaAuthorPreview.textContent = articleAuthor.value.trim() || 'Tim Redaksi ACF';
    }

    // 6. Character Count & Progress Bars
    // SEO Title: Optimal 45-60 characters
    const seoTitleLen = rawSeoTitle ? rawSeoTitle.length : (rawTitle ? rawTitle.length : 0);
    if (txtSeoTitleCount) txtSeoTitleCount.textContent = `${seoTitleLen} karakter`;
    if (barSeoTitle) {
      barSeoTitle.className = 'yoast-progress-fill';
      if (seoTitleLen === 0) {
        barSeoTitle.style.width = '0%';
      } else if (seoTitleLen < 35) {
        barSeoTitle.style.width = Math.min(100, Math.round((seoTitleLen / 60) * 100)) + '%';
        barSeoTitle.classList.add('bar-orange');
      } else if (seoTitleLen <= 60) {
        barSeoTitle.style.width = Math.min(100, Math.round((seoTitleLen / 60) * 100)) + '%';
        barSeoTitle.classList.add('bar-green');
      } else {
        barSeoTitle.style.width = '100%';
        barSeoTitle.classList.add('bar-red');
      }
    }

    // Meta Description: Optimal 120-160 characters
    const metaDescLen = rawMetaDesc ? rawMetaDesc.length : (rawExcerpt ? rawExcerpt.length : 0);
    if (txtMetaDescCount) txtMetaDescCount.textContent = `${metaDescLen} karakter`;
    if (barMetaDesc) {
      barMetaDesc.className = 'yoast-progress-fill';
      if (metaDescLen === 0) {
        barMetaDesc.style.width = '0%';
      } else if (metaDescLen < 80) {
        barMetaDesc.style.width = Math.min(100, Math.round((metaDescLen / 160) * 100)) + '%';
        barMetaDesc.classList.add('bar-orange');
      } else if (metaDescLen <= 160) {
        barMetaDesc.style.width = Math.min(100, Math.round((metaDescLen / 160) * 100)) + '%';
        barMetaDesc.classList.add('bar-green');
      } else {
        barMetaDesc.style.width = '100%';
        barMetaDesc.classList.add('bar-red');
      }
    }

    // 7. SEO Analysis Checklist Evaluation
    if (yoastAnalysisKeyphraseSubtitle) {
      yoastAnalysisKeyphraseSubtitle.textContent = rawKeyphrase ? `Fokus: "${rawKeyphrase}"` : '(Masukkan fokus frasa kunci untuk analisis mendalam)';
    }

    const kp = rawKeyphrase.toLowerCase().trim();
    let scoreGreen = 0;

    const setCheckItem = (id, isPass, isAmber) => {
      const el = document.getElementById(id);
      if (!el) return;
      const dot = el.querySelector('.yoast-item-dot');
      if (!dot) return;
      dot.className = 'yoast-item-dot';
      if (isPass) {
        dot.classList.add('dot-green');
        dot.textContent = '●';
        scoreGreen++;
      } else if (isAmber) {
        dot.classList.add('dot-amber');
        dot.textContent = '●';
      } else {
        dot.classList.add('dot-red');
        dot.textContent = '●';
      }
    };

    // Check 1: Keyphrase in Title
    setCheckItem('chkSeoKeyphraseInTitle', kp && rawTitle.toLowerCase().includes(kp));

    // Check 2: Keyphrase in SEO Title
    setCheckItem('chkSeoKeyphraseInSeoTitle', kp && finalGoogleTitle.toLowerCase().includes(kp));

    // Check 3: Keyphrase in Slug
    setCheckItem('chkSeoKeyphraseInSlug', kp && cleanSlug.includes(slugifyText(kp)));

    // Check 4: Keyphrase in Meta Description
    setCheckItem('chkSeoKeyphraseInMeta', kp && (rawMetaDesc.toLowerCase().includes(kp) || snippetDesc.toLowerCase().includes(kp)));

    // Check 5: Keyphrase in Intro Paragraph
    const firstP = articleVisualEditor ? (articleVisualEditor.querySelector('p')?.innerText || '').toLowerCase() : '';
    setCheckItem('chkSeoKeyphraseInIntro', kp && (firstP.includes(kp) || rawContentText.toLowerCase().slice(0, 200).includes(kp)));

    // Check 6: SEO Title Length
    const titleLenForCheck = finalGoogleTitle.length;
    const seoTitleOptimal = (titleLenForCheck >= 35 && titleLenForCheck <= 65);
    const seoTitleAmber = (titleLenForCheck >= 20 && titleLenForCheck <= 75);
    setCheckItem('chkSeoTitleLength', seoTitleOptimal, seoTitleAmber);

    // Check 7: Meta Description Length
    const metaLenForCheck = snippetDesc.length;
    const metaOptimal = (metaLenForCheck >= 80 && metaLenForCheck <= 160);
    const metaAmber = (metaLenForCheck >= 40 && metaLenForCheck <= 200);
    setCheckItem('chkSeoMetaLength', metaOptimal, metaAmber);

    // Check 8: Cover Image Set
    const hasCover = rawCover && rawCover !== fallbackLogo && (rawCover.startsWith('http') || rawCover.startsWith('data:') || rawCover.includes('/'));
    setCheckItem('chkSeoCoverImage', Boolean(hasCover));

    // Check 9: Content Length (word count)
    const words = rawContentText ? rawContentText.split(/\s+/).filter(Boolean).length : 0;
    setCheckItem('chkSeoContentLength', words >= 300, words >= 150);

    // 8. Overall Badge Status Dot
    let overallDot = '🔴';
    if (scoreGreen >= 6) {
      overallDot = '🟢';
    } else if (scoreGreen >= 3) {
      overallDot = '🟠';
    } else {
      overallDot = '🔴';
    }

    if (yoastHeaderScoreDot) yoastHeaderScoreDot.textContent = overallDot;
    if (dotSeoAnalysis) dotSeoAnalysis.textContent = overallDot;
    if (tabGbSeo) {
      const tabDot = tabGbSeo.querySelector('span');
      if (tabDot) {
        tabDot.style.background = overallDot === '🟢' ? '#16A34A' : (overallDot === '🟠' ? '#EA580C' : '#DC2626');
      }
    }
    const subtabDotSeo = document.getElementById('subtabDotSeo');
    if (subtabDotSeo) {
      subtabDotSeo.className = 'subtab-dot ' + (overallDot === '🟢' ? 'dot-green' : (overallDot === '🟠' ? 'dot-amber' : 'dot-red'));
    }

    // Readability checks
    const chkReadParagraphLength = document.getElementById('chkReadParagraphLength');
    if (chkReadParagraphLength) {
      let tooLongP = false;
      if (articleVisualEditor) {
        articleVisualEditor.querySelectorAll('p').forEach(p => {
          const pWords = (p.innerText || '').split(/\s+/).filter(Boolean).length;
          if (pWords > 150) tooLongP = true;
        });
      }
      const dot = chkReadParagraphLength.querySelector('.yoast-item-dot');
      if (dot) dot.className = 'yoast-item-dot ' + (!tooLongP ? 'dot-green' : 'dot-red');
    }

    const chkReadHeadings = document.getElementById('chkReadHeadings');
    if (chkReadHeadings) {
      const hasHeadings = articleVisualEditor && Boolean(articleVisualEditor.querySelector('h2, h3, h4'));
      const dot = chkReadHeadings.querySelector('.yoast-item-dot');
      if (dot) dot.className = 'yoast-item-dot ' + (hasHeadings ? 'dot-green' : 'dot-amber');
    }
  }

  function saveDraftToStorage() {
    try {
      const nowStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      const draftData = {
        title: articleTitle ? articleTitle.value : '',
        title_color: articleTitle ? (articleTitle.style.color || '') : '',
        seo_title: yoastSeoTitle ? yoastSeoTitle.value : '',
        focus_keyphrase: yoastFocusKeyphrase ? yoastFocusKeyphrase.value : '',
        slug: yoastSlug ? yoastSlug.value : '',
        meta_desc: yoastMetaDesc ? yoastMetaDesc.value : '',
        content: articleVisualEditor ? articleVisualEditor.innerHTML : '',
        excerpt: articleExcerpt ? articleExcerpt.value : '',
        cover: articleCover ? articleCover.value : '',
        category: articleCategory ? articleCategory.value : 'artikel',
        author: articleAuthor ? articleAuthor.value : 'Tim Redaksi ACF',
        status: articleStatusSelect ? articleStatusSelect.value : 'Terbit',
        date: articleDateInput ? articleDateInput.value : '',
        savedAt: nowStr
      };

      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData));

      if (wpAutosaveIndicator && wpAutosaveText) {
        wpAutosaveText.textContent = `Draf tersimpan (${nowStr})`;
        wpAutosaveIndicator.style.display = 'inline-flex';
      }
    } catch (e) {
      console.warn('Gagal menyimpan draf otomatis:', e);
    }
  }

  function clearActiveDraftSession() {
    try {
      clearTimeout(autosaveDebounceTimer);
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      if (wpAutosaveIndicator) wpAutosaveIndicator.style.display = 'none';
      if (wpDraftRecoveryBanner) wpDraftRecoveryBanner.style.display = 'none';
    } catch (e) {}
  }

  function checkAndRestoreDraft() {
    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!raw) return false;
      const draft = JSON.parse(raw);
      if (!draft || (!draft.title && !draft.content && !draft.cover)) {
        clearActiveDraftSession();
        return false;
      }

      if (articleTitle) {
        articleTitle.value = draft.title || '';
        articleTitle.style.color = draft.title_color || '';
        if (draft.title_color) articleTitle.setAttribute('data-color', draft.title_color);
        else articleTitle.removeAttribute('data-color');
      }
      if (articleVisualEditor) articleVisualEditor.innerHTML = draft.content || '';
      if (articleContent) articleContent.value = draft.content || '';
      if (articleExcerpt) articleExcerpt.value = draft.excerpt || '';
      if (articleCover) articleCover.value = draft.cover || '';
      if (articleAuthor) articleAuthor.value = draft.author || 'Tim Redaksi ACF';
      if (draft.date && articleDateInput) articleDateInput.value = draft.date;

      if (draft.seo_title && yoastSeoTitle) yoastSeoTitle.value = draft.seo_title;
      if (draft.focus_keyphrase && yoastFocusKeyphrase) yoastFocusKeyphrase.value = draft.focus_keyphrase;
      if (draft.slug && yoastSlug) {
        yoastSlug.value = draft.slug;
        yoastSlug.dataset.custom = 'true';
      }
      if (draft.meta_desc && yoastMetaDesc) yoastMetaDesc.value = draft.meta_desc;

      if (draft.category && articleCategory) {
        renderCategorySelects(draft.category);
        articleCategory.value = draft.category;
      }

      if (draft.status) {
        if (articleStatusSelect) articleStatusSelect.value = draft.status;
        if (articleStatusInput) articleStatusInput.value = draft.status;
      }

      updateCoverPreview(draft.cover || '');
      updateWpStats();
      updateYoastPreviews();

      if (wpDraftRecoveryBanner) {
        if (wpDraftRecoveryTime && draft.savedAt) {
          wpDraftRecoveryTime.textContent = `Tersimpan otomatis pukul ${draft.savedAt}. Anda dapat melanjutkan atau membuang draf ini.`;
        }
        wpDraftRecoveryBanner.style.display = 'flex';
      }

      if (wpAutosaveIndicator && wpAutosaveText) {
        wpAutosaveText.textContent = `Draf tersimpan (${draft.savedAt || ''})`;
        wpAutosaveIndicator.style.display = 'inline-flex';
      }

      return true;
    } catch (e) {
      console.warn('Gagal memulihkan draf:', e);
      return false;
    }
  }

  // Helper: Update Active State of Toolbar Buttons & Format Dropdown
  function updateToolbarState() {
    if (!articleVisualEditor) return;

    const commands = ['bold', 'italic', 'underline', 'strikeThrough', 'justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull', 'insertUnorderedList', 'insertOrderedList'];
    commands.forEach(cmd => {
      const btn = document.querySelector(`.wp-tool-btn[data-cmd="${cmd}"]`);
      if (btn) {
        try {
          const isActive = document.queryCommandState(cmd);
          btn.classList.toggle('active', Boolean(isActive));
        } catch(e) {}
      }
    });

    // Synchronize Format dropdown and Drop Cap
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      let node = sel.anchorNode;
      if (node && node.nodeType === 3) node = node.parentNode;
      if (node && node.closest && node.closest('#articleVisualEditor')) {
        const block = node.closest('h2, h3, h4, blockquote, .wp-callout-box, p.article-lead, p');
        if (block && wpBlockFormat) {
          if (block.tagName === 'H2') wpBlockFormat.value = 'h2';
          else if (block.tagName === 'H3') wpBlockFormat.value = 'h3';
          else if (block.tagName === 'H4') wpBlockFormat.value = 'h4';
          else if (block.tagName === 'BLOCKQUOTE') wpBlockFormat.value = 'blockquote';
          else if (block.classList.contains('wp-callout-box')) wpBlockFormat.value = 'callout';
          else if (block.classList.contains('article-lead')) wpBlockFormat.value = 'lead-p';
          else wpBlockFormat.value = 'p';
        }

        const pBlock = node.closest('p');
        const chkDropCap = document.getElementById('chkDropCap');
        if (chkDropCap) {
          chkDropCap.checked = Boolean(pBlock && pBlock.classList.contains('has-drop-cap'));
        }
      }
    }

    // Helper convert RGB to Hex
    function rgbToHex(color) {
      if (!color) return '';
      if (color.startsWith('#')) return color.toLowerCase();
      const match = color.match(/\d+/g);
      if (match && match.length >= 3) {
        const r = parseInt(match[0], 10).toString(16).padStart(2, '0');
        const g = parseInt(match[1], 10).toString(16).padStart(2, '0');
        const b = parseInt(match[2], 10).toString(16).padStart(2, '0');
        return `#${r}${g}${b}`.toLowerCase();
      }
      return color;
    }

    // Synchronize text color indicator
    try {
      const foreColor = document.queryCommandValue('foreColor');
      if (foreColor) {
        const hex = rgbToHex(foreColor);
        const ind = document.getElementById('toolbarColorIndicator');
        if (ind) ind.style.backgroundColor = foreColor;
        document.querySelectorAll('.wp-color-circle').forEach(c => {
          const dataCol = c.getAttribute('data-color');
          c.classList.toggle('active', dataCol === hex || dataCol === foreColor);
        });
      }
    } catch(e) {}
  }

  // Yoast Subtabs Controller (SEO, Keterbacaan, Schema, Sosial)
  const yoastTabDefs = [
    { subtab: 'seo', btnId: 'subtabYoastSeo', paneId: 'paneYoastSeo' },
    { subtab: 'readability', btnId: 'subtabYoastReadability', paneId: 'paneYoastReadability' },
    { subtab: 'schema', btnId: 'subtabYoastSchema', paneId: 'paneYoastSchema' },
    { subtab: 'social', btnId: 'subtabYoastSocial', paneId: 'paneYoastSocial' }
  ];

  function switchYoastSubtab(targetSubtab) {
    yoastTabDefs.forEach(def => {
      const btn = document.getElementById(def.btnId);
      const pane = document.getElementById(def.paneId);
      const isMatch = def.subtab === targetSubtab;

      if (btn) {
        if (isMatch) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      }

      if (pane) {
        pane.style.display = isMatch ? 'block' : 'none';
        if (isMatch) pane.classList.add('active');
        else pane.classList.remove('active');
      }
    });
  }

  // ==========================================
  // MODAL CONTROLLERS & FORM HANDLERS
  // ==========================================
  function openCreateArticleModal() {
    if (articleForm) articleForm.reset();
    if (articleEditId) articleEditId.value = '';
    if (articleStatusInput) articleStatusInput.value = 'Terbit';
    if (articleStatusSelect) articleStatusSelect.value = 'Terbit';
    if (articleAuthor) articleAuthor.value = 'Tim Redaksi ACF';
    if (newCategoryInputWrap) newCategoryInputWrap.style.display = 'none';
    if (newCategoryName) newCategoryName.value = '';
    
    // Set default tanggal hari ini
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const now = new Date();
    if (articleDateInput) articleDateInput.value = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;

    // Reset visual editor & title styling
    if (articleTitle) {
      articleTitle.style.color = '';
      articleTitle.removeAttribute('data-color');
    }
    if (articleVisualEditor) articleVisualEditor.innerHTML = '';
    if (articleContent) articleContent.value = '';
    const chkDropCap = document.getElementById('chkDropCap');
    if (chkDropCap) chkDropCap.checked = false;

    // Reset Yoast SEO fields
    if (yoastFocusKeyphrase) yoastFocusKeyphrase.value = '';
    if (yoastSeoTitle) yoastSeoTitle.value = '';
    if (yoastSlug) {
      yoastSlug.value = '';
      yoastSlug.dataset.custom = 'false';
    }
    if (yoastMetaDesc) yoastMetaDesc.value = '';
    if (yoastRelatedChipsWrap) yoastRelatedChipsWrap.style.display = 'none';

    renderCategorySelects('artikel');
    updateWpStats();
    updateCoverPreview('');
    updateYoastPreviews();
    if (btnSaveArticleText) btnSaveArticleText.textContent = 'Terbitkan';

    // Cek apakah ada draf tersimpan yang bisa dipulihkan
    const hasRestored = checkAndRestoreDraft();
    if (!hasRestored && wpDraftRecoveryBanner) {
      wpDraftRecoveryBanner.style.display = 'none';
    }

    if (articleModal) {
      articleModal.classList.add('show');
      updateBodyScrollLock();
      switchYoastSubtab('seo');
      setTimeout(updateToolbarState, 100);
    }
  }

  /* ===================================================
     ARTICLE PREVIEW MODAL LOGIC
     =================================================== */
  let currentPreviewArticleId = null;

  function openPreviewArticleModal(id) {
    const art = dataArticles.find(a => String(a.id) === String(id));
    if (!art) {
      showToast('Data artikel tidak ditemukan.', 'error');
      return;
    }

    currentPreviewArticleId = art.id;

    // Status Badge
    const isDraft = (art.status === 'Draf');
    if (previewArticleStatusBadge) {
      previewArticleStatusBadge.textContent = isDraft ? 'Draf' : 'Terpublikasi';
      previewArticleStatusBadge.className = isDraft 
        ? 'preview-badge-status preview-status-draf' 
        : 'preview-badge-status preview-status-terbit';
    }

    // Category
    if (previewArticleCategory) {
      previewArticleCategory.textContent = art.categoryLabel || getCategoryLabel(art.category);
    }

    // Author & Date
    if (previewArticleAuthor) {
      previewArticleAuthor.textContent = art.author || 'Tim Redaksi ACF';
    }
    if (previewArticleDate) {
      previewArticleDate.textContent = art.date || '-';
    }

    // Title & Color
    if (previewArticleTitle) {
      previewArticleTitle.textContent = art.title || 'Tanpa Judul';
      if (art.title_color) {
        previewArticleTitle.style.color = art.title_color;
      } else {
        previewArticleTitle.style.color = '';
      }
    }

    // Excerpt
    if (previewArticleExcerpt) {
      if (art.excerpt && art.excerpt.trim()) {
        previewArticleExcerpt.textContent = art.excerpt.trim();
        previewArticleExcerpt.style.display = 'block';
      } else {
        previewArticleExcerpt.style.display = 'none';
      }
    }

    // Cover Image
    if (previewArticleCoverImg && previewArticleCoverWrap) {
      const coverUrl = (art.cover || '').trim();
      if (coverUrl) {
        previewArticleCoverImg.src = coverUrl;
        previewArticleCoverWrap.style.display = 'block';
      } else {
        previewArticleCoverWrap.style.display = 'none';
      }
    }

    // Prose / Full Content
    if (previewArticleContent) {
      let contentHtml = (art.content && art.content.trim()) ? art.content : '';
      if (!contentHtml && art.excerpt && art.excerpt.trim()) {
        contentHtml = `<p>${escapeHTML(art.excerpt)}</p>`;
      }
      if (!contentHtml) {
        contentHtml = '<p style="color: #94A3B8; font-style: italic;">Belum ada isi konten artikel yang ditulis.</p>';
      }
      previewArticleContent.innerHTML = contentHtml;
    }

    // Article ID
    if (previewArticleId) {
      previewArticleId.textContent = art.id || '-';
    }

    if (articlePreviewModal) {
      articlePreviewModal.classList.add('show');
      updateBodyScrollLock();
    }
  }

  function closePreviewArticleModal() {
    if (articlePreviewModal) {
      articlePreviewModal.classList.remove('show');
      updateBodyScrollLock();
    }
  }

  function handlePreviewEditDirect() {
    if (currentPreviewArticleId) {
      const targetId = currentPreviewArticleId;
      closePreviewArticleModal();
      openEditArticleModal(targetId);
    }
  }

  function openEditArticleModal(id) {
    const art = dataArticles.find(a => a.id === id);
    if (!art) return;

    if (wpDraftRecoveryBanner) wpDraftRecoveryBanner.style.display = 'none';
    if (wpAutosaveIndicator) wpAutosaveIndicator.style.display = 'none';

    if (articleEditId) articleEditId.value = art.id;
    if (btnSaveArticleText) btnSaveArticleText.textContent = 'Perbarui';
    if (newCategoryInputWrap) newCategoryInputWrap.style.display = 'none';
    if (newCategoryName) newCategoryName.value = '';

    if (articleTitle) {
      articleTitle.value = art.title || '';
      articleTitle.style.color = art.title_color || '';
      if (art.title_color) articleTitle.setAttribute('data-color', art.title_color);
      else articleTitle.removeAttribute('data-color');
    }
    renderCategorySelects(art.category || 'artikel');
    if (articleCategory) articleCategory.value = art.category || 'artikel';
    if (articleAuthor) articleAuthor.value = art.author || 'Tim Redaksi ACF';
    if (articleDateInput) articleDateInput.value = art.date || '';
    if (articleCover) articleCover.value = art.cover || '';
    if (articleExcerpt) articleExcerpt.value = art.excerpt || '';
    
    // Populate Yoast SEO fields
    if (yoastFocusKeyphrase) yoastFocusKeyphrase.value = art.focus_keyphrase || '';
    if (yoastSeoTitle) yoastSeoTitle.value = art.seo_title || '';
    if (yoastSlug) {
      yoastSlug.value = art.slug || slugifyText(art.title || '');
      yoastSlug.dataset.custom = art.slug ? 'true' : 'false';
    }
    if (yoastMetaDesc) yoastMetaDesc.value = art.excerpt || '';
    if (yoastRelatedChipsWrap) yoastRelatedChipsWrap.style.display = 'none';

    const contentHTML = art.content || art.excerpt || '';
    if (articleVisualEditor) articleVisualEditor.innerHTML = contentHTML;
    if (articleContent) articleContent.value = contentHTML;

    const st = art.status || 'Terbit';
    if (articleStatusSelect) articleStatusSelect.value = st;
    if (articleStatusInput) articleStatusInput.value = st;

    updateCoverPreview(art.cover || '');
    updateWpStats();
    updateYoastPreviews();
    if (articleModal) {
      articleModal.classList.add('show');
      updateBodyScrollLock();
      switchYoastSubtab('seo');
      setTimeout(updateToolbarState, 100);
    }
  }

  function closeArticleModal() {
    deselectInlineFigure();
    if (articleModal) {
      articleModal.classList.remove('show');
      updateBodyScrollLock();
    }
  }

  function updateCoverPreview(url) {
    if (!coverPreviewImg || !coverPlaceholder) return;
    const cleanUrl = (url || '').trim();
    const coverHoverOverlay = document.getElementById('coverHoverOverlay');
    const btnRemoveCoverDirect = document.getElementById('btnRemoveCoverDirect');

    if (cleanUrl && (cleanUrl.startsWith('http') || cleanUrl.startsWith('data:image') || cleanUrl.startsWith('../assets') || cleanUrl.startsWith('assets/') || cleanUrl.includes('/'))) {
      coverPreviewImg.src = cleanUrl;
      coverPreviewImg.style.display = 'block';
      coverPlaceholder.style.display = 'none';
      if (coverHoverOverlay) coverHoverOverlay.style.display = 'flex';
      if (btnRemoveCoverDirect) btnRemoveCoverDirect.style.display = 'inline-flex';
    } else {
      coverPreviewImg.src = '';
      coverPreviewImg.style.display = 'none';
      coverPlaceholder.style.display = 'flex';
      if (coverHoverOverlay) coverHoverOverlay.style.display = 'none';
      if (btnRemoveCoverDirect) btnRemoveCoverDirect.style.display = 'none';
    }

    if (typeof updateYoastPreviews === 'function') {
      updateYoastPreviews();
    }
  }

  function updateWpStats() {
    if (!articleVisualEditor || !wpStatsCount) return;
    const text = (articleVisualEditor.innerText || '').trim();
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
    const chars = text.length;
    const readingTime = Math.max(1, Math.ceil(words / 180));
    wpStatsCount.innerHTML = `<strong>${words}</strong> Kata &nbsp;•&nbsp; <strong>${chars}</strong> Karakter &nbsp;•&nbsp; ⏱️ <strong>~${words > 0 ? readingTime : 0} mnt</strong> baca`;
    if (articleContent) articleContent.value = articleVisualEditor.innerHTML;
  }

  async function handleArticleSubmit(targetStatus) {
    if (targetStatus && targetStatus.preventDefault) targetStatus.preventDefault();

    const title = articleTitle?.value.trim() || '';
    if (!title) {
      showToast('Judul artikel wajib diisi!', 'warning');
      articleTitle?.focus();
      return;
    }

    const category = articleCategory?.value || 'artikel';
    const categoryLabel = getCategoryLabel(category);
    const author = articleAuthor?.value.trim() || 'Tim Redaksi ACF';
    const cover = articleCover?.value.trim() || 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&q=80';
    const excerpt = articleExcerpt?.value.trim() || (articleVisualEditor ? articleVisualEditor.innerText.slice(0, 140) + '...' : '');
    const content = (articleVisualEditor && articleVisualEditor.innerHTML.trim()) || excerpt;
    
    // Pastikan status akurat sesuai tombol yang ditekan (Draf vs Terbit)
    let status = 'Terbit';
    if (typeof targetStatus === 'string' && (targetStatus === 'Draf' || targetStatus === 'Terbit')) {
      status = targetStatus;
    } else if (articleStatusInput && (articleStatusInput.value === 'Draf' || articleStatusInput.value === 'Terbit')) {
      status = articleStatusInput.value;
    } else if (articleStatusSelect && (articleStatusSelect.value === 'Draf' || articleStatusSelect.value === 'Terbit')) {
      status = articleStatusSelect.value;
    }

    const editId = articleEditId?.value || '';

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const now = new Date();
    const dateStr = articleDateInput?.value.trim() || `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;

    const titleColor = articleTitle ? (articleTitle.style.color || '') : '';
    const seoTitle = yoastSeoTitle ? yoastSeoTitle.value.trim() : '';
    const focusKeyphrase = yoastFocusKeyphrase ? yoastFocusKeyphrase.value.trim() : '';
    const slug = yoastSlug && yoastSlug.value.trim() ? slugifyText(yoastSlug.value.trim()) : slugifyText(title);

    const payload = {
      title,
      title_color: titleColor,
      seo_title: seoTitle,
      focus_keyphrase: focusKeyphrase,
      slug: slug,
      category,
      categoryLabel,
      author,
      date: dateStr,
      cover,
      excerpt,
      content,
      status
    };

    if (editId) {
      // Update existing
      const idx = dataArticles.findIndex(a => a.id === editId);
      if (idx !== -1) {
        dataArticles[idx] = { ...dataArticles[idx], ...payload };
      }
      if (window.ACF_API && window.ACF_API.articles) {
        try {
          await window.ACF_API.articles.update(editId, payload);
        } catch (err) {
          console.warn('API update error, saved to local cache:', err);
        }
      }
      showToast('Artikel berhasil diperbarui!', 'success');
    } else {
      // Create new
      let createdId = 'ART-' + Date.now().toString().slice(-4);
      if (window.ACF_API && window.ACF_API.articles) {
        try {
          const res = await window.ACF_API.articles.create(payload);
          if (res && res.id) createdId = res.id;
        } catch (err) {
          console.warn('API create error, saved to local cache:', err);
        }
      }
      dataArticles.unshift({ id: createdId, ...payload });
      showToast(status === 'Draf' ? 'Artikel disimpan sebagai Draf!' : 'Artikel baru berhasil dipublikasikan!', 'success');
    }

    clearActiveDraftSession();
    saveArticlesData();
    renderTableArticles();
    updateMetricCards();
    closeArticleModal();
  }

  async function deleteArticle(id) {
    const art = dataArticles.find(a => a.id === id);
    if (!art) return;

    if (confirm(`Apakah Anda yakin ingin menghapus artikel "${art.title}"?`)) {
      dataArticles = dataArticles.filter(a => a.id !== id);
      saveArticlesData();
      if (window.ACF_API && window.ACF_API.articles) {
        try {
          await window.ACF_API.articles.delete(id);
        } catch (err) {
          console.warn('API delete error:', err);
        }
      }
      renderTableArticles();
      updateMetricCards();
      showToast('Artikel telah dihapus.', 'info');
    }
  }

  // --- Local File Image Reader & Server Uploader (Gambar Unggulan) ---
  async function handleLocalImageUpload(file) {
    if (!file || !file.type.startsWith('image/')) {
      showToast('Harap pilih file gambar (JPG, PNG, WEBP).', 'info');
      return;
    }

    // 1. Tampilkan pratinjau lokal SECARA INSTAN agar tidak ada jeda
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Url = e.target.result;
      if (articleCover) articleCover.value = base64Url;
      resetCoverPlaceholder();
      updateCoverPreview(base64Url);
      triggerAutosave();
    };
    reader.readAsDataURL(file);

    showToast('Mengunggah foto sampul ke server...', 'info');

    // 2. Unggah ke Backend Server secara asinkron di latar belakang
    if (window.ACF_API && window.ACF_API.articles) {
      try {
        const uploadRes = await window.ACF_API.articles.uploadImage(file);
        if (uploadRes && uploadRes.url) {
          if (articleCover) articleCover.value = uploadRes.url;
          resetCoverPlaceholder();
          updateCoverPreview(uploadRes.url);
          triggerAutosave();
          showToast('Foto sampul berhasil tersimpan di server!', 'success');
          return;
        }
      } catch (uploadErr) {
        console.warn('Upload backend gagal, pratinjau lokal tetap aktif:', uploadErr);
        showToast('Foto sampul lokal dimuat.', 'info');
      }
    }
  }

  function resetCoverPlaceholder() {
    if (coverPlaceholder) {
      coverPlaceholder.innerHTML = `
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        <span>Tetapkan gambar unggulan</span>
        <small style="font-size: 0.72rem; color: #94A3B8; margin-top: 2px;">Klik untuk upload file foto</small>
      `;
    }
  }

  // ==========================================
  // INLINE IMAGE IN-PLACE GUTENBERG BLOCK EDITING
  // ==========================================
  let activeSelectedFigure = null;

  function selectInlineFigure(figure) {
    if (!figure || !wpInlineImgToolbar) return;
    deselectInlineFigure();

    activeSelectedFigure = figure;
    activeSelectedFigure.classList.add('is-selected');

    const canvasWrap = document.querySelector('.wp-content-canvas-wrap');
    if (!canvasWrap) return;

    const wrapRect = canvasWrap.getBoundingClientRect();
    const figRect = figure.getBoundingClientRect();

    const top = figRect.top - wrapRect.top - 46;
    const left = (figRect.left - wrapRect.left) + (figRect.width / 2);

    wpInlineImgToolbar.style.top = `${Math.max(8, top)}px`;
    wpInlineImgToolbar.style.left = `${left}px`;
    wpInlineImgToolbar.style.transform = 'translateX(-50%)';
    wpInlineImgToolbar.style.display = 'flex';

    const isLeft = figure.classList.contains('align-left');
    const isRight = figure.classList.contains('align-right');
    const currentAlign = isLeft ? 'left' : (isRight ? 'right' : 'center');

    document.querySelectorAll('.btn-img-tool[data-align]').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-align') === currentAlign);
    });
  }

  function deselectInlineFigure() {
    if (activeSelectedFigure) {
      activeSelectedFigure.classList.remove('is-selected');
      activeSelectedFigure = null;
    }
    if (wpInlineImgToolbar) {
      wpInlineImgToolbar.style.display = 'none';
    }
  }

  function insertInlineImageToEditor(imageUrl, align = 'center', caption = '') {
    if (!articleVisualEditor) return null;
    articleVisualEditor.focus();

    const alignClass = `align-${align || 'center'}`;
    const cleanUrl = String(imageUrl || '').trim();
    const captionHtml = caption
      ? `<figcaption contenteditable="true">${escapeHTML(caption)}</figcaption>`
      : `<figcaption contenteditable="true" placeholder="Tulis keterangan foto (opsional)..."></figcaption>`;

    const figureHtml = `<figure class="wp-editor-figure ${alignClass}" contenteditable="false"><img src="${cleanUrl}" alt="Foto Artikel" loading="lazy">${captionHtml}</figure><p><br></p>`;

    try {
      document.execCommand('insertHTML', false, figureHtml);
    } catch (e) {
      articleVisualEditor.innerHTML += figureHtml;
    }

    articleVisualEditor.focus();
    updateWpStats();
    triggerAutosave();

    const allFigures = articleVisualEditor.querySelectorAll('figure.wp-editor-figure');
    const newFigure = allFigures.length ? allFigures[allFigures.length - 1] : null;
    if (newFigure) {
      selectInlineFigure(newFigure);
    }
    return newFigure;
  }

  async function handleInlineImageFile(file, align = 'center', caption = '') {
    if (!file || !file.type.startsWith('image/')) {
      showToast('Harap pilih file gambar (JPG, PNG, WEBP).', 'info');
      return;
    }

    // 1. Tampilkan langsung secara instan
    const reader = new FileReader();
    reader.onload = async (e) => {
      const localDataUrl = e.target.result;
      const insertedFigure = insertInlineImageToEditor(localDataUrl, align, caption);

      // 2. Di latar belakang, unggah ke server backend
      if (window.ACF_API && window.ACF_API.articles) {
        try {
          const uploadRes = await window.ACF_API.articles.uploadImage(file);
          if (uploadRes && uploadRes.url && insertedFigure) {
            const targetImg = insertedFigure.querySelector('img');
            if (targetImg) {
              targetImg.src = uploadRes.url;
              triggerAutosave();
            }
          }
        } catch (err) {
          console.warn('Upload inline backend gagal, foto lokal tetap aktif:', err);
        }
      }
    };
    reader.readAsDataURL(file);
    showToast('Foto berhasil disisipkan ke naskah!', 'success');
  }

  // --- Helper: Decode HTML Entities in text from WordPress ---
  function decodeHtmlEntities(str) {
    if (!str) return '';
    const txt = document.createElement('textarea');
    txt.innerHTML = str;
    return txt.value;
  }

  // --- Helper: Auto-resolve WordPress URL/Endpoint ---
  function resolveWordPressEndpoint(inputUrl) {
    let clean = (inputUrl || '').trim();
    if (!clean) return { postsUrl: '', categoriesUrl: '', isSinglePost: false, hostname: '' };
    if (!/^https?:\/\//i.test(clean)) {
      clean = 'https://' + clean;
    }

    try {
      const urlObj = new URL(clean);
      const hostname = urlObj.hostname;
      const pathname = urlObj.pathname.replace(/\/+$/, ''); // hapus trailing slash
      const pathSegments = pathname.split('/').filter(Boolean);

      // Cek apakah URL mengarah ke postingan spesifik (misal: /2024/01/25/tugas-5 atau /tugas-5)
      let postSlug = '';
      if (pathSegments.length > 0 && !pathname.includes('wp-json') && !pathname.includes('wp-admin') && !pathname.includes('/category/')) {
        const lastSeg = pathSegments[pathSegments.length - 1];
        // Jika segmen terakhir bukan murni angka (bukan tahun/bulan/nomor halaman)
        if (!/^\d+$/.test(lastSeg)) {
          postSlug = lastSeg;
        }
      }

      // 1. Format WordPress.com
      if (hostname.endsWith('.wordpress.com')) {
        if (clean.includes('/wp/v2/sites/')) {
          return {
            postsUrl: clean,
            categoriesUrl: `https://public-api.wordpress.com/wp/v2/sites/${hostname}/categories?per_page=100`,
            isSinglePost: false,
            hostname
          };
        }
        if (postSlug) {
          return {
            postsUrl: `https://public-api.wordpress.com/wp/v2/sites/${hostname}/posts?slug=${encodeURIComponent(postSlug)}&_embed=true`,
            categoriesUrl: `https://public-api.wordpress.com/wp/v2/sites/${hostname}/categories?per_page=100`,
            isSinglePost: true,
            hostname
          };
        }
        return {
          postsUrl: `https://public-api.wordpress.com/wp/v2/sites/${hostname}/posts?per_page=100&_embed=true`,
          categoriesUrl: `https://public-api.wordpress.com/wp/v2/sites/${hostname}/categories?per_page=100`,
          isSinglePost: false,
          hostname
        };
      }

      // 2. Format Self-hosted WordPress
      const basePath = `${urlObj.protocol}//${urlObj.host}`;
      if (clean.includes('/wp-json/wp/v2/posts')) {
        let basePostsUrl = clean;
        if (!basePostsUrl.includes('per_page=')) {
          basePostsUrl += (basePostsUrl.includes('?') ? '&' : '?') + 'per_page=100';
        }
        if (!basePostsUrl.includes('_embed')) {
          basePostsUrl += '&_embed=true';
        }
        return {
          postsUrl: basePostsUrl,
          categoriesUrl: `${basePath}/wp-json/wp/v2/categories?per_page=100`,
          isSinglePost: clean.includes('slug='),
          hostname
        };
      }

      if (postSlug) {
        return {
          postsUrl: `${basePath}/wp-json/wp/v2/posts?slug=${encodeURIComponent(postSlug)}&_embed=true`,
          categoriesUrl: `${basePath}/wp-json/wp/v2/categories?per_page=100`,
          isSinglePost: true,
          hostname
        };
      }

      return {
        postsUrl: `${basePath}/wp-json/wp/v2/posts?per_page=100&_embed=true`,
        categoriesUrl: `${basePath}/wp-json/wp/v2/categories?per_page=100`,
        isSinglePost: false,
        hostname
      };

    } catch (e) {
      return { postsUrl: clean, categoriesUrl: '', isSinglePost: false, hostname: '' };
    }
  }

  // --- WordPress REST API Importer ---
  async function fetchWordPressPosts() {
    const rawInput = wpApiEndpointInput?.value.trim();
    if (!rawInput) {
      showToast('Harap masukkan URL Blog atau Endpoint WordPress REST API.', 'info');
      return;
    }

    const { postsUrl, categoriesUrl, isSinglePost, hostname } = resolveWordPressEndpoint(rawInput);

    if (!btnFetchWpApi) return;
    const originalText = btnFetchWpApi.innerHTML;
    btnFetchWpApi.disabled = true;
    btnFetchWpApi.innerHTML = `<span>Menghubungi WordPress...</span>`;

    try {
      showToast('Menghubungkan ke WordPress & membaca seluruh kategori...', 'info');

      // 1. Fetch Categories concurrently to populate dataCategories & category lookup map
      const categoryMap = {}; // { [id]: { id, name, slug } }

      if (categoriesUrl) {
        try {
          let catRes = await fetch(categoriesUrl);
          if (!catRes.ok && hostname && !categoriesUrl.includes('public-api.wordpress.com')) {
            // Fallback for WP.com sites on custom domains
            try {
              const fallbackCatUrl = `https://public-api.wordpress.com/wp/v2/sites/${hostname}/categories?per_page=100`;
              const fbCat = await fetch(fallbackCatUrl);
              if (fbCat.ok) catRes = fbCat;
            } catch (_) {}
          }
          if (catRes && catRes.ok) {
            const rawCats = await catRes.json();
            if (Array.isArray(rawCats)) {
              rawCats.forEach(c => {
                const cleanName = decodeHtmlEntities(c.name || '').trim();
                let catSlug = (c.slug || '').trim();
                if (!cleanName || catSlug === 'uncategorized') return;
                
                if (isSchoolCategory(catSlug, cleanName)) {
                  if (catSlug.includes('daya-setara') || cleanName.toLowerCase().includes('daya setara')) {
                    categoryMap[c.id] = { id: c.id, name: 'Artikel Sekolah Daya Setara', slug: 'kabar-sekolah-daya-setara' };
                  } else {
                    categoryMap[c.id] = { id: c.id, name: 'Artikel Sekolah Juara', slug: 'kabar-sekolah-juara' };
                  }
                  return;
                }
                
                const reg = registerCategory(cleanName, catSlug);
                categoryMap[c.id] = { id: c.id, name: reg ? reg.label : cleanName, slug: reg ? reg.slug : catSlug };
              });
            }
          }
        } catch (catErr) {
          console.warn('WP Categories fetch error (fallback to embedded terms):', catErr);
        }
      }

      // 2. Fetch Posts (Page 1)
      let initialUrl = postsUrl.includes('page=') ? postsUrl : `${postsUrl}&page=1`;
      let res = await fetch(initialUrl);

      // Fallback jika direct wp-json gagal pada custom domain yang memakai WP.com
      if (!res.ok && hostname && !postsUrl.includes('public-api.wordpress.com')) {
        try {
          const wpComUrl = isSinglePost
            ? `https://public-api.wordpress.com/wp/v2/sites/${hostname}/posts?slug=${encodeURIComponent(postsUrl.split('slug=')[1] || '')}&_embed=true`
            : `https://public-api.wordpress.com/wp/v2/sites/${hostname}/posts?per_page=100&_embed=true&page=1`;
          const fallbackRes = await fetch(wpComUrl);
          if (fallbackRes.ok) {
            res = fallbackRes;
          }
        } catch (_) {}
      }

      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);

      // Read total pages & total posts from WordPress HTTP headers
      const totalPagesHeader = res.headers.get('x-wp-totalpages') || res.headers.get('X-WP-TotalPages');
      const totalPostsHeader = res.headers.get('x-wp-total') || res.headers.get('X-WP-Total');
      const totalPages = parseInt(totalPagesHeader, 10) || 1;
      const totalPosts = parseInt(totalPostsHeader, 10) || 0;

      let page1Posts = await res.json();
      if (!Array.isArray(page1Posts)) {
        page1Posts = page1Posts ? [page1Posts] : [];
      }

      if (page1Posts.length === 0) {
        showToast('Tidak ada artikel ditemukan dari link WordPress tersebut.', 'info');
        btnFetchWpApi.disabled = false;
        btnFetchWpApi.innerHTML = originalText;
        return;
      }

      let allPosts = [...page1Posts];

      // 3. Fetch subsequent pages if totalPages > 1 and not single post
      if (totalPages > 1 && !isSinglePost) {
        const maxPagesToFetch = Math.min(totalPages, 20); // safe limit up to 2,000 articles
        showToast(`Memuat halaman 1/${totalPages} (${totalPosts || allPosts.length} total artikel)...`, 'info');

        for (let p = 2; p <= maxPagesToFetch; p++) {
          try {
            btnFetchWpApi.innerHTML = `<span>Memuat Hal ${p}/${totalPages}...</span>`;
            const nextPageUrl = postsUrl.replace(/&page=\d+/, '') + `&page=${p}`;
            const nextRes = await fetch(nextPageUrl);
            if (nextRes.ok) {
              const morePosts = await nextRes.json();
              if (Array.isArray(morePosts) && morePosts.length > 0) {
                allPosts.push(...morePosts);
              } else {
                break;
              }
            } else {
              break;
            }
          } catch (pageErr) {
            console.warn(`Failed fetching WP page ${p}:`, pageErr);
            break;
          }
        }
      }

      // 4. Extract embedded terms and map authentic category to each post
      allPosts.forEach(p => {
        // Look for embedded category terms
        const termsArr = p._embedded && p._embedded['wp:term'] ? p._embedded['wp:term'] : [];
        const catTerms = Array.isArray(termsArr) && termsArr.length > 0 ? (termsArr[0] || []) : [];

        let postCategorySlug = '';
        let postCategoryLabel = '';

        if (Array.isArray(catTerms) && catTerms.length > 0) {
          // Register all discovered terms in embedded data
          catTerms.forEach(t => {
            const cleanTName = decodeHtmlEntities(t.name || '').trim();
            let tSlug = (t.slug || '').trim();
            if (!cleanTName || tSlug === 'uncategorized') return;
            if (isSchoolCategory(tSlug, cleanTName)) {
              if (tSlug.includes('daya-setara') || cleanTName.toLowerCase().includes('daya setara')) {
                categoryMap[t.id] = { id: t.id, name: 'Artikel Sekolah Daya Setara', slug: 'kabar-sekolah-daya-setara' };
              } else {
                categoryMap[t.id] = { id: t.id, name: 'Artikel Sekolah Juara', slug: 'kabar-sekolah-juara' };
              }
              return;
            }
            const reg = registerCategory(cleanTName, tSlug);
            categoryMap[t.id] = { id: t.id, name: reg ? reg.label : cleanTName, slug: reg ? reg.slug : tSlug };
          });

          // Pick the best category (prefer non-uncategorized and non-generic 'artikel' if more specific exists)
          const validTerms = catTerms.filter(t => t.slug !== 'uncategorized');
          const specificTerm = validTerms.find(t => t.slug !== 'artikel' && t.slug !== 'uncategorized') || validTerms[0];
          if (specificTerm) {
            const foundInMap = categoryMap[specificTerm.id];
            postCategorySlug = foundInMap ? foundInMap.slug : specificTerm.slug;
            postCategoryLabel = foundInMap ? foundInMap.name : decodeHtmlEntities(specificTerm.name);
          }
        }

        // If not found in embedded terms, check p.categories array via categoryMap
        if (!postCategorySlug && Array.isArray(p.categories) && p.categories.length > 0) {
          for (const catId of p.categories) {
            if (categoryMap[catId]) {
              postCategorySlug = categoryMap[catId].slug;
              postCategoryLabel = categoryMap[catId].name;
              if (postCategorySlug !== 'artikel' && postCategorySlug !== 'uncategorized') break;
            }
          }
        }

        // Fallback default
        if (!postCategorySlug || postCategorySlug === 'uncategorized') {
          postCategorySlug = 'artikel';
          postCategoryLabel = 'Artikel Pendidikan';
        }

        p._wpDetectedCategorySlug = postCategorySlug;
        p._wpDetectedCategoryLabel = postCategoryLabel;
      });

      // Update dropdowns with all newly registered categories
      renderCategorySelects('__auto__');

      currentWpFetchedPosts = allPosts;
      renderWpFetchedList(allPosts);
      showToast(`Berhasil menemukan SEMUA (${allPosts.length}) artikel & seluruh kategori dari WordPress!`, 'success');
    } catch (err) {
      console.error('WP Fetch error:', err);
      showToast('Gagal menghubungi WordPress. Pastikan alamat URL benar & blog bersifat publik.', 'info');
    } finally {
      btnFetchWpApi.disabled = false;
      btnFetchWpApi.innerHTML = originalText;
    }
  }

  function renderWpFetchedList(posts) {
    if (!wpFetchList || !wpFetchResultsBox || !wpFetchCount) return;
    wpFetchCount.textContent = posts.length;
    wpFetchResultsBox.style.display = 'block';
    wpFetchList.innerHTML = '';

    const globalSelectedCat = wpImportCategory?.value || '__auto__';

    posts.forEach((p, idx) => {
      const cleanTitle = decodeHtmlEntities(p.title?.rendered || 'Tanpa Judul').replace(/<[^>]*>?/gm, '').trim();
      const cleanExcerpt = decodeHtmlEntities(p.excerpt?.rendered || '').replace(/<[^>]*>?/gm, '').slice(0, 120) + '...';
      const rawDate = p.date ? new Date(p.date) : new Date();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      const dateStr = `${rawDate.getDate()} ${months[rawDate.getMonth()]} ${rawDate.getFullYear()}`;
      
      let cover = p.jetpack_featured_media_url || (p._embedded && p._embedded['wp:featuredmedia'] && p._embedded['wp:featuredmedia'][0]?.source_url) || 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&q=80';

      const isAlreadyInKabar = dataArticles.some(a => (a.title || '').trim().toLowerCase() === cleanTitle.trim().toLowerCase());

      // Tentukan kategori terpilih: Jika user memilih kategori spesifik di top selector, ikuti top selector; jika __auto__, gunakan p._wpDetectedCategorySlug
      const activeCatSlug = (globalSelectedCat && globalSelectedCat !== '__auto__') 
        ? globalSelectedCat 
        : (p._wpDetectedCategorySlug || 'artikel');

      const optionsHTML = dataCategories.map(cat => 
        `<option value="${cat.slug}" ${cat.slug === activeCatSlug ? 'selected' : ''}>${escapeHTML(cat.label)}</option>`
      ).join('');

      const itemDiv = document.createElement('div');
      itemDiv.className = 'wp-fetch-item';
      itemDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 14px; flex: 1; min-width: 260px;">
          <img src="${cover}" alt="Cover" style="width: 56px; height: 42px; border-radius: 6px; object-fit: cover;" onerror="this.src='https://images.unsplash.com/photo-1509062522246-3755977927d7?w=200&q=80'">
          <div>
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <span style="font-weight: 700; color: #0F172A; font-size: 0.9rem;">${escapeHTML(cleanTitle)}</span>
              ${isAlreadyInKabar ? '<span style="background: #E0F2FE; color: #0369A1; font-size: 0.72rem; padding: 2px 7px; border-radius: 4px; font-weight: 600;">✓ Sudah Ada di Kabar</span>' : ''}
              ${p._wpDetectedCategoryLabel ? `<span style="background: #F1F5F9; color: #475569; font-size: 0.72rem; padding: 2px 7px; border-radius: 4px; font-weight: 600;">🏷️ ${escapeHTML(p._wpDetectedCategoryLabel)}</span>` : ''}
            </div>
            <div style="font-size: 0.78rem; color: #64748B;">${dateStr} • ${escapeHTML(cleanExcerpt)}</div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
          <select class="wp-select wp-item-cat-select" data-wp-idx="${idx}" style="font-size: 0.8rem; padding: 6px 10px; width: 180px; background: #FFF;">
            ${optionsHTML}
          </select>
          <button type="button" class="btn-create-article btn-import-single-wp" data-wp-idx="${idx}" style="padding: 7px 14px; font-size: 0.8rem; white-space: nowrap; ${isAlreadyInKabar ? 'background: #0284C7;' : ''}">
            ${isAlreadyInKabar ? '🔄 Perbarui Artikel' : '📥 Impor Artikel'}
          </button>
        </div>
      `;
      wpFetchList.appendChild(itemDiv);
    });
  }

  function importSingleWordPressPost(postObj, customSlug = '', customLabel = '') {
    if (!postObj) return;
    const cleanTitle = decodeHtmlEntities(postObj.title?.rendered || 'Artikel WordPress').replace(/<[^>]*>?/gm, '').trim();
    const cleanExcerpt = decodeHtmlEntities(postObj.excerpt?.rendered || '').replace(/<[^>]*>?/gm, '').slice(0, 160).trim();
    const contentHTML = postObj.content?.rendered || postObj.excerpt?.rendered || cleanExcerpt;
    const rawDate = postObj.date ? new Date(postObj.date) : new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const dateStr = `${rawDate.getDate()} ${months[rawDate.getMonth()]} ${rawDate.getFullYear()}`;
    const cover = postObj.jetpack_featured_media_url || (postObj._embedded && postObj._embedded['wp:featuredmedia'] && postObj._embedded['wp:featuredmedia'][0]?.source_url) || 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80';

    let catSlug = customSlug;
    if (!catSlug || catSlug === '__auto__') {
      catSlug = postObj._wpDetectedCategorySlug || (wpImportCategory?.value !== '__auto__' ? wpImportCategory?.value : 'artikel') || 'artikel';
    }
    const foundCat = dataCategories.find(c => c.slug === catSlug);
    const catLabel = customLabel || (foundCat ? foundCat.label : (postObj._wpDetectedCategoryLabel || 'Artikel Pendidikan'));

    // Cek apakah artikel dengan judul sama sudah ada agar tidak terjadi duplikasi ganda
    const existingIndex = dataArticles.findIndex(a => (a.title || '').trim().toLowerCase() === cleanTitle.trim().toLowerCase());
    
    if (existingIndex !== -1) {
      // Perbarui artikel yang sudah ada
      const existingId = dataArticles[existingIndex].id;
      dataArticles[existingIndex] = {
        ...dataArticles[existingIndex],
        title: cleanTitle,
        category: catSlug,
        categoryLabel: catLabel,
        excerpt: cleanExcerpt,
        content: contentHTML,
        cover: cover || dataArticles[existingIndex].cover,
        date: dateStr,
        status: 'Terbit'
      };
      if (window.ACF_API && window.ACF_API.articles) {
        window.ACF_API.articles.update(existingId, dataArticles[existingIndex]).catch(err => console.warn('Gagal sync update WP ke MySQL:', err));
      }
      showToast(`Artikel "${cleanTitle.slice(0, 30)}..." berhasil diperbarui di Kabar!`, 'success');
    } else {
      // Tambah artikel baru
      const newArt = {
        id: 'ART-' + Date.now().toString().slice(-4) + Math.floor(Math.random() * 90 + 10),
        title: cleanTitle,
        category: catSlug,
        categoryLabel: catLabel,
        author: (postObj._embedded && postObj._embedded.author && postObj._embedded.author[0]?.name) || 'Tim Redaksi WordPress',
        date: dateStr,
        cover,
        excerpt: cleanExcerpt,
        content: contentHTML,
        status: 'Terbit'
      };
      dataArticles.unshift(newArt);
      if (window.ACF_API && window.ACF_API.articles) {
        window.ACF_API.articles.create(newArt).then(res => {
          if (res && res.id) newArt.id = res.id;
        }).catch(err => console.warn('Gagal sync insert WP ke MySQL:', err));
      }
      showToast(`"${cleanTitle.slice(0, 30)}..." berhasil diimpor sebagai "${catLabel}"!`, 'success');
    }

    saveArticlesData();
    renderTableArticles();
    updateMetricCards();
  }

  function importAllWordPressPosts() {
    if (!currentWpFetchedPosts.length) return;

    currentWpFetchedPosts.forEach((p, idx) => {
      const itemEl = wpFetchList?.querySelectorAll('.wp-fetch-item')[idx];
      const perCatSel = itemEl?.querySelector('.wp-item-cat-select');
      const itemSlug = perCatSel ? perCatSel.value : (p._wpDetectedCategorySlug || 'artikel');
      const itemFound = dataCategories.find(c => c.slug === itemSlug);
      const itemLabel = itemFound ? itemFound.label : (p._wpDetectedCategoryLabel || 'Artikel Pendidikan');

      importSingleWordPressPost(p, itemSlug, itemLabel);
    });

    showToast(`Semua (${currentWpFetchedPosts.length}) artikel WordPress berhasil disinkronkan ke Kabar!`, 'success');
    closeWpSyncModal();
  }

  /* ===================================================
     5. DETAIL MODAL (FORMS) HANDLER
     =================================================== */
  function openDetailModal(type, id) {
    const list = type === 'mitra' ? dataMitra : dataRelawan;
    const item = list.find((d, idx) => (d.id === id || String(idx) === String(id)));

    if (!item) return;

    modalTypeBadge.textContent = type === 'mitra' ? 'Mitra Program' : 'Relawan Eduhub';
    modalTitle.textContent = type === 'mitra' ? (item.namaInstansi || 'Detail Mitra') : (item.namaLengkap || 'Detail Relawan');

    // Phone format for WhatsApp
    const rawWA = (item.noWA || '').replace(/\D/g, '');
    let cleanWA = rawWA;
    if (cleanWA.startsWith('0')) cleanWA = '62' + cleanWA.substring(1);
    const waLink = cleanWA ? `https://wa.me/${cleanWA}?text=Halo%20${encodeURIComponent(item.namaPIC || item.namaLengkap || '')},%20salam%20dari%20Tim%20ACF%20Eduhub.` : '#';
    const emailLink = item.email ? `mailto:${item.email}?subject=Konfirmasi%20Pendaftaran%20ACF%20Eduhub` : '#';

    // Current Status
    const st = item.status || 'Menunggu';

    let bodyHTML = '';
    if (type === 'mitra') {
      bodyHTML = `
        <div class="detail-grid">
          <div class="detail-item">
            <div class="detail-item-label">Waktu Pendaftaran</div>
            <div class="detail-item-value">${escapeHTML(item.timestamp || '-')}</div>
          </div>
          <div class="detail-item">
            <div class="detail-item-label">Bentuk Lembaga</div>
            <div class="detail-item-value">${escapeHTML(item.jenisInstansi || '-')}</div>
          </div>
          <div class="detail-item">
            <div class="detail-item-label">Nama Lembaga / Perusahaan</div>
            <div class="detail-item-value highlight">${escapeHTML(item.namaInstansi || '-')}</div>
          </div>
          <div class="detail-item">
            <div class="detail-item-label">Kota / Domisili Kantor</div>
            <div class="detail-item-value">${escapeHTML(item.kotaInstansi || '-')}</div>
          </div>
          <div class="detail-item">
            <div class="detail-item-label">Nama Lengkap PIC</div>
            <div class="detail-item-value highlight">${escapeHTML(item.namaPIC || '-')}</div>
          </div>
          <div class="detail-item">
            <div class="detail-item-label">Jabatan / Posisi PIC</div>
            <div class="detail-item-value">${escapeHTML(item.jabatanPIC || '-')}</div>
          </div>
          <div class="detail-item">
            <div class="detail-item-label">No. WhatsApp Aktif</div>
            <div class="detail-item-value">${escapeHTML(item.noWA || '-')}</div>
          </div>
          <div class="detail-item">
            <div class="detail-item-label">Email Resmi PIC</div>
            <div class="detail-item-value">${escapeHTML(item.email || '-')}</div>
          </div>
          <div class="detail-item full-width">
            <div class="detail-item-label">Fokus Program yang Diminati</div>
            <div class="detail-item-value" style="color: #7D2280; font-weight: 600;">${escapeHTML(item.fokusProgram || item.fokusKemitraan || '-')}</div>
          </div>
          <div class="detail-item">
            <div class="detail-item-label">Bentuk Dukungan Utama</div>
            <div class="detail-item-value">${escapeHTML(item.jenisKemitraan || item.fokusKemitraan || '-')}</div>
          </div>
          <div class="detail-item">
            <div class="detail-item-label">Target Waktu Pelaksanaan</div>
            <div class="detail-item-value">${escapeHTML(item.estimasiWaktu || item.anggaran || '-')}</div>
          </div>
          <div class="detail-item full-width">
            <div class="detail-item-label">Catatan Tambahan / Gambaran Rencana Kolaborasi</div>
            <div class="detail-item-value" style="white-space: pre-wrap;">${escapeHTML(item.pesan || '-')}</div>
          </div>
        </div>

        <div class="status-change-section">
          <div class="detail-item-label">Ubah Status Tindak Lanjut:</div>
          <div class="status-options-row">
            <button type="button" class="btn-status-choice ${st === 'Menunggu' ? 'active' : ''}" data-status="Menunggu">Menunggu</button>
            <button type="button" class="btn-status-choice ${st === 'Sudah Dihubungi' ? 'active' : ''}" data-status="Sudah Dihubungi">Sudah Dihubungi</button>
            <button type="button" class="btn-status-choice ${st === 'Diterima' ? 'active' : ''}" data-status="Diterima">Diterima</button>
            <button type="button" class="btn-status-choice ${st === 'Arsip' ? 'active' : ''}" data-status="Arsip">Arsip</button>
          </div>
        </div>
      `;
    } else {
      bodyHTML = `
        <div class="detail-grid">
          <div class="detail-item">
            <div class="detail-item-label">Waktu Pendaftaran</div>
            <div class="detail-item-value">${escapeHTML(item.timestamp || '-')}</div>
          </div>
          <div class="detail-item">
            <div class="detail-item-label">Nama Lengkap</div>
            <div class="detail-item-value highlight">${escapeHTML(item.namaLengkap || '-')}</div>
          </div>
          <div class="detail-item">
            <div class="detail-item-label">Kota / Domisili Saat Ini</div>
            <div class="detail-item-value">${escapeHTML(item.domisili || '-')}</div>
          </div>
          <div class="detail-item">
            <div class="detail-item-label">Status / Profesi</div>
            <div class="detail-item-value">${escapeHTML(item.profesi || '-')}</div>
          </div>
          <div class="detail-item">
            <div class="detail-item-label">No. WhatsApp Aktif</div>
            <div class="detail-item-value">${escapeHTML(item.noWA || '-')}</div>
          </div>
          <div class="detail-item">
            <div class="detail-item-label">Email Aktif</div>
            <div class="detail-item-value">${escapeHTML(item.email || '-')}</div>
          </div>
          <div class="detail-item full-width">
            <div class="detail-item-label">Peran Relawan yang Diminati</div>
            <div class="detail-item-value" style="color: #7D2280; font-weight: 600;">${escapeHTML(item.peranRelawan || '-')}</div>
          </div>
          <div class="detail-item">
            <div class="detail-item-label">Ketersediaan Waktu</div>
            <div class="detail-item-value">${escapeHTML(item.komitmenWaktu || '-')}</div>
          </div>
          <div class="detail-item">
            <div class="detail-item-label">Keahlian / Bidang Studi</div>
            <div class="detail-item-value">${escapeHTML(item.keahlianUtama || '-')}</div>
          </div>
          <div class="detail-item full-width">
            <div class="detail-item-label">Motivasi Singkat Bergabung</div>
            <div class="detail-item-value" style="white-space: pre-wrap;">${escapeHTML(item.motivasi || '-')}</div>
          </div>
        </div>

        <div class="status-change-section">
          <div class="detail-item-label">Ubah Status Tindak Lanjut:</div>
          <div class="status-options-row">
            <button type="button" class="btn-status-choice ${st === 'Menunggu' ? 'active' : ''}" data-status="Menunggu">Menunggu</button>
            <button type="button" class="btn-status-choice ${st === 'Sudah Dihubungi' ? 'active' : ''}" data-status="Sudah Dihubungi">Sudah Dihubungi</button>
            <button type="button" class="btn-status-choice ${st === 'Diterima' ? 'active' : ''}" data-status="Diterima">Diterima</button>
            <button type="button" class="btn-status-choice ${st === 'Arsip' ? 'active' : ''}" data-status="Arsip">Arsip</button>
          </div>
        </div>
      `;
    }

    modalBody.innerHTML = bodyHTML;

    // Attach Status Click Handlers
    modalBody.querySelectorAll('.btn-status-choice').forEach(btn => {
      btn.addEventListener('click', async () => {
        const newStatus = btn.getAttribute('data-status');
        item.status = newStatus;
        if (type === 'mitra') {
          if (window.ACF_API && window.ACF_API.mitra) {
            window.ACF_API.mitra.updateStatus(item.id, newStatus).catch(() => {});
          }
        } else {
          if (window.ACF_API && window.ACF_API.relawan) {
            window.ACF_API.relawan.updateStatus(item.id, newStatus).catch(() => {});
          }
        }
        renderAll();
        modalBody.querySelectorAll('.btn-status-choice').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        showToast(`Status berhasil diperbarui: ${newStatus}`, 'success');
      });
    });

    // Action buttons in modal footer
    modalActions.innerHTML = `
      <button type="button" class="btn-action-delete" id="btnDeleteFormEntry" style="padding: 10px 16px; border-radius: 8px; font-weight: 600; font-size: 0.88rem; display: inline-flex; align-items: center; gap: 6px; border: 1px solid #FECDD3; background: #FFF1F2; color: #E11D48; cursor: pointer; margin-right: auto;">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
        <span>Hapus Pendaftar</span>
      </button>
      ${cleanWA ? `
        <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="btn-wa-action">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0012.04 2zm.01 1.67c4.54 0 8.24 3.7 8.24 8.24 0 2.2-.86 4.27-2.42 5.83a8.19 8.19 0 01-5.82 2.41c-1.42 0-2.82-.37-4.06-1.07l-.29-.17-3.02.79.81-2.94-.19-.3a8.21 8.21 0 01-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24zm4.5 11.66c-.25-.13-1.47-.73-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.65.81-.8 1-.15.19-.3.21-.55.08-.25-.13-1.05-.39-2-1.23-.74-.66-1.24-1.48-1.39-1.73-.15-.25-.02-.38.11-.51.11-.11.25-.29.37-.44.12-.15.16-.25.25-.42.08-.17.04-.32-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.48-.4-.42-.56-.43h-.48c-.16 0-.42.06-.65.31-.22.25-.86.84-.86 2.05 0 1.21.88 2.38 1 2.55.13.17 1.73 2.64 4.19 3.7 2.46 1.07 2.46.71 2.9.67.44-.04 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.47-.29z"/></svg>
          <span>Chat WhatsApp</span>
        </a>
      ` : ''}
      ${item.email ? `
        <a href="${emailLink}" class="btn-email-action">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          <span>Kirim Email</span>
        </a>
      ` : ''}
    `;

    const btnDelete = document.getElementById('btnDeleteFormEntry');
    if (btnDelete) {
      btnDelete.addEventListener('click', async () => {
        const targetName = type === 'mitra' ? (item.namaInstansi || 'data mitra') : (item.namaLengkap || 'data relawan');
        if (confirm(`Hapus data ${targetName} dari dashboard?`)) {
          if (type === 'mitra') {
            dataMitra = dataMitra.filter(m => m.id !== item.id);
            if (window.ACF_API && window.ACF_API.mitra) {
              window.ACF_API.mitra.delete(item.id).catch(() => {});
            }
          } else {
            dataRelawan = dataRelawan.filter(r => r.id !== item.id);
            if (window.ACF_API && window.ACF_API.relawan) {
              window.ACF_API.relawan.delete(item.id).catch(() => {});
            }
          }
          renderAll();
          closeDetailModal();
          showToast('Data berhasil dihapus.', 'info');
        }
      });
    }

    detailModal.classList.add('show');
    updateBodyScrollLock();
  }

  function closeDetailModal() {
    detailModal.classList.remove('show');
    updateBodyScrollLock();
  }

  /* ===================================================
     6. EXPORT CSV (FORMS)
     =================================================== */
  function exportActiveTabToCSV() {
    let filename = '';
    let csvContent = '\uFEFF'; // UTF-8 BOM

    if (activeTab === 'tabMitra') {
      filename = `ACF_Data_Mitra_Program_${getFormattedDateForFile()}.csv`;
      const headers = ['ID', 'Waktu Masuk', 'Nama Lembaga / Perusahaan', 'Bentuk Lembaga', 'Kota Domisili Kantor', 'Nama Lengkap PIC', 'Jabatan PIC', 'No WhatsApp', 'Email Resmi', 'Fokus Program Diminati', 'Bentuk Dukungan Utama', 'Target Waktu Pelaksanaan', 'Catatan Tambahan', 'Status'];
      csvContent += headers.map(escapeCSVCell).join(',') + '\r\n';

      dataMitra.forEach(item => {
        const row = [
          item.id || '',
          item.timestamp || '',
          item.namaInstansi || '',
          item.jenisInstansi || '',
          item.kotaInstansi || '',
          item.namaPIC || '',
          item.jabatanPIC || '',
          item.noWA || '',
          item.email || '',
          item.fokusProgram || item.fokusKemitraan || '',
          item.jenisKemitraan || '',
          item.estimasiWaktu || item.anggaran || '',
          item.pesan || '',
          item.status || 'Menunggu'
        ];
        csvContent += row.map(escapeCSVCell).join(',') + '\r\n';
      });
    } else {
      filename = `ACF_Data_Relawan_Eduhub_${getFormattedDateForFile()}.csv`;
      const headers = ['ID', 'Waktu Masuk', 'Nama Lengkap', 'Kota Domisili', 'Status / Profesi', 'No WhatsApp', 'Email Aktif', 'Peran Relawan Diminati', 'Ketersediaan Waktu', 'Keahlian / Bidang Studi', 'Motivasi Singkat', 'Status'];
      csvContent += headers.map(escapeCSVCell).join(',') + '\r\n';

      dataRelawan.forEach(item => {
        const row = [
          item.id || '',
          item.timestamp || '',
          item.namaLengkap || '',
          item.domisili || '',
          item.profesi || '',
          item.noWA || '',
          item.email || '',
          item.peranRelawan || '',
          item.komitmenWaktu || '',
          item.keahlianUtama || '',
          item.motivasi || '',
          item.status || 'Menunggu'
        ];
        csvContent += row.map(escapeCSVCell).join(',') + '\r\n';
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`File ${filename} berhasil diunduh!`, 'success');
  }

  function escapeCSVCell(val) {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  }

  function getFormattedDateForFile() {
    const d = new Date();
    return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  }

  /* ===================================================
     7. SPREADSHEET SYNC
     =================================================== */
  async function syncFromSpreadsheet() {
    if (!btnSyncSpreadsheet) return;
    btnSyncSpreadsheet.classList.add('spinning');
    btnSyncSpreadsheet.disabled = true;

    try {
      showToast('Menghubungi Google Apps Script...', 'info');

      const response = await fetch(APPS_SCRIPT_URL + '?action=getData', {
        method: 'GET',
        mode: 'cors'
      });

      if (response.ok) {
        const resJson = await response.json();
        if (resJson && resJson.status === 'success') {
          if (Array.isArray(resJson.mitra) && resJson.mitra.length > 0) {
            dataMitra = resJson.mitra;
          }
          if (Array.isArray(resJson.relawan) && resJson.relawan.length > 0) {
            dataRelawan = resJson.relawan;
          }
          renderAll();
          showToast('Data berhasil disinkronkan dari Google Spreadsheet!', 'success');
        } else {
          showToast('Spreadsheet aktif. Data dashboard siap digunakan.', 'info');
        }
      } else {
        showToast('Koneksi normal. Menggunakan database lokal.', 'info');
      }
    } catch (err) {
      console.warn('Sync note:', err);
      showToast('Koneksi online selesai. Data dashboard siap.', 'success');
    } finally {
      btnSyncSpreadsheet.classList.remove('spinning');
      btnSyncSpreadsheet.disabled = false;
      renderAll();
    }
  }

  /* ===================================================
     8. TOAST NOTIFICATIONS & UTILS
     =================================================== */
  function showToast(message, type = 'info', duration = 3500) {
    if (!toastContainer) return;

    // Batasi maksimal 2 toast aktif agar tidak menumpuk di layar
    const currentToasts = toastContainer.querySelectorAll('.admin-toast:not(.toast-hiding)');
    if (currentToasts.length >= 2) {
      for (let i = 0; i <= currentToasts.length - 2; i++) {
        removeToastElement(currentToasts[i]);
      }
    }

    const toast = document.createElement('div');
    toast.className = `admin-toast toast-${type}`;
    toast.style.setProperty('--toast-duration', `${duration}ms`);

    let iconHtml = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.6"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
    if (type === 'success') {
      iconHtml = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.8"><polyline points="20 6 9 17 4 12"/></svg>';
    } else if (type === 'error' || type === 'danger') {
      iconHtml = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.6"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
    } else if (type === 'warning') {
      iconHtml = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
    }

    toast.innerHTML = `
      <div class="toast-icon">${iconHtml}</div>
      <div class="toast-body">${escapeHTML(message)}</div>
      <button type="button" class="toast-close-btn" aria-label="Tutup notifikasi">✕</button>
    `;

    function removeToastElement(el) {
      if (!el || el.classList.contains('toast-hiding')) return;
      el.classList.add('toast-hiding');
      setTimeout(() => {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 250);
    }

    const closeBtn = toast.querySelector('.toast-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeToastElement(toast);
      });
    }

    let hideTimer = setTimeout(() => {
      removeToastElement(toast);
    }, duration);

    toast.addEventListener('mouseenter', () => clearTimeout(hideTimer));
    toast.addEventListener('mouseleave', () => {
      hideTimer = setTimeout(() => removeToastElement(toast), 1500);
    });

    toastContainer.appendChild(toast);
  }

  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /* ===================================================
     8.5. PROGRAM LAYANAN MANAGEMENT ENGINE
     =================================================== */
  function loadProgramsData() {
    try {
      const stored = localStorage.getItem('acf_programs_data');
      if (stored) {
        dataPrograms = JSON.parse(stored);
      }
    } catch (e) {
      dataPrograms = [];
    }

    if (!Array.isArray(dataPrograms) || dataPrograms.length === 0) {
      dataPrograms = JSON.parse(JSON.stringify(DEFAULT_PROGRAMS_DATA));
      saveProgramsData();
    }

    populateProgramCategoryOptions();
    updateProgramMetrics();
  }

  function saveProgramsData() {
    try {
      localStorage.setItem('acf_programs_data', JSON.stringify(dataPrograms));
    } catch (e) {
      console.error('Gagal menyimpan program ke localStorage:', e);
    }
    updateProgramMetrics();
  }

  function updateProgramMetrics() {
    const total = dataPrograms.length;
    const published = dataPrograms.filter(p => p.status === 'Terbit').length;
    const draft = total - published;

    const uniqueCats = new Set(dataPrograms.map(p => p.categoryId || 'kategori-1'));
    const catCount = uniqueCats.size || DEFAULT_PROGRAM_CATEGORIES.length;

    if (countTotalPrograms) countTotalPrograms.textContent = total;
    if (countPublishedPrograms) countPublishedPrograms.textContent = published;
    if (countDraftPrograms) countDraftPrograms.textContent = draft;
    if (countCategoriesPrograms) countCategoriesPrograms.textContent = catCount;
    if (badgeNavProgramsCount) badgeNavProgramsCount.textContent = total;
  }

  function populateProgramCategoryOptions() {
    // Kumpulkan seluruh kategori yang ada
    const catMap = new Map();
    DEFAULT_PROGRAM_CATEGORIES.forEach(c => catMap.set(c.id, c));
    dataPrograms.forEach(p => {
      const cid = p.categoryId || 'kategori-1';
      if (!catMap.has(cid)) {
        catMap.set(cid, {
          id: cid,
          num: p.categoryNum || (catMap.size + 1),
          title: (p.categoryTitle || '').replace(/\s*\(\d+\s*Program\)/i, '').trim(),
          desc: p.categoryDesc || ''
        });
      }
    });

    const categories = Array.from(catMap.values()).sort((a, b) => (a.num || 0) - (b.num || 0));

    // 1. Populate filter dropdown di tabel
    if (filterProgramCategory) {
      const currentVal = filterProgramCategory.value;
      filterProgramCategory.innerHTML = '<option value="all">Semua Kategori Induk</option>';
      categories.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = `${c.num}. ${c.title}`;
        filterProgramCategory.appendChild(opt);
      });
      if (currentVal && categories.some(c => c.id === currentVal)) {
        filterProgramCategory.value = currentVal;
      }
    }

    // 2. Populate modal category datalist
    if (listCategoryOptions) {
      listCategoryOptions.innerHTML = '';
      categories.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.title;
        listCategoryOptions.appendChild(opt);
      });
    }
  }

  function getProgramCategoryMeta(categoryId) {
    const found = DEFAULT_PROGRAM_CATEGORIES.find(c => c.id === categoryId);
    if (found) return found;
    const prog = dataPrograms.find(p => p.categoryId === categoryId);
    if (prog) {
      return {
        id: prog.categoryId,
        num: prog.categoryNum || 1,
        title: prog.categoryTitle || 'Kategori Program',
        desc: prog.categoryDesc || ''
      };
    }
    return {
      id: categoryId,
      num: 1,
      title: 'Kategori Program',
      desc: ''
    };
  }

  // Render Table Program Layanan
  function renderTablePrograms() {
    const tbody = document.getElementById('tbodyPrograms') || document.getElementById('programsTableBody');
    if (!tbody) return;

    const query = (searchProgramInput?.value || '').toLowerCase().trim();
    const catFilter = filterProgramCategory?.value || 'all';
    const statusFilter = filterProgramStatus?.value || 'all';

    const filtered = dataPrograms.filter(prog => {
      const matchQuery = !query ||
        (prog.title || '').toLowerCase().includes(query) ||
        (prog.divisi || '').toLowerCase().includes(query) ||
        (prog.quote || '').toLowerCase().includes(query) ||
        (prog.metric || '').toLowerCase().includes(query);

      const matchCat = catFilter === 'all' || prog.categoryId === catFilter;
      const matchStatus = statusFilter === 'all' || (prog.status || 'Terbit') === statusFilter;

      return matchQuery && matchCat && matchStatus;
    });

    tbody.innerHTML = '';

    if (filtered.length === 0) {
      if (emptyPrograms) emptyPrograms.style.display = 'block';
    } else {
      if (emptyPrograms) emptyPrograms.style.display = 'none';

      filtered.forEach((prog, idx) => {
        const isDraft = (prog.status === 'Draf');
        const statusBadgeClass = isDraft ? 'status-menunggu status-badge-draf' : 'status-diterima status-badge-terbit';
        const statusBadgeText = isDraft ? 'Draf' : 'Terpublikasi';
        const catMeta = getProgramCategoryMeta(prog.categoryId);

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td style="font-weight: 600; color: #64748B; text-align: center;">${idx + 1}</td>
          <td>
            <div class="article-thumbnail-cell" style="gap: 10px;">
              <img src="${escapeHTML(prog.cover || '../assets/unit-pendidikan/Sekolah Juara.jpg')}" alt="Cover" class="article-thumb-img" style="width: 72px; height: 50px; border-radius: 8px; object-fit: cover;" onerror="this.src='../assets/unit-pendidikan/Sekolah Juara.jpg'">
            </div>
          </td>
          <td>
            <div class="cell-primary" style="font-size: 0.92rem; font-weight: 700; color: #1E293B; margin-bottom: 3px;">
              ${escapeHTML(prog.title || '-')}
            </div>
            <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
              <span class="program-table-divisi-badge">Divisi: ${escapeHTML(prog.divisi || '-')}</span>
              <span style="font-size: 0.78rem; color: #64748B;">ID: ${escapeHTML(prog.id || '-')}</span>
            </div>
            <div class="cell-sub" style="margin-top: 4px; line-height: 1.4; max-width: 440px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; color: #64748B;">
              ${escapeHTML(prog.quote || '')}
            </div>
          </td>
          <td>
            <span class="article-cat-tag">
              ${catMeta.num}. ${escapeHTML(catMeta.title)}
            </span>
          </td>
          <td>
            <div style="font-size: 0.85rem; font-weight: 600; color: #1E293B;">
              ${escapeHTML(prog.metric || '-')}
            </div>
            <div style="font-size: 0.76rem; color: #64748B; margin-top: 2px;">
              ${escapeHTML(prog.kebutuhanDukungan || '-')}
            </div>
          </td>
          <td style="text-align: center;">
            <span class="status-badge ${statusBadgeClass}" onclick="window.handleToggleProgramStatusDirect('${prog.id}')" title="Klik untuk mengubah status (Terbit / Draf)" style="cursor: pointer; user-select: none;">
              ${statusBadgeText}
            </span>
          </td>
          <td style="text-align: center; white-space: nowrap;">
            <button type="button" class="btn-action-preview" onclick="window.handlePreviewProgramDirect('${prog.id}')" style="margin-right: 6px;" title="Lihat pratinjau kartu program">
              <svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              <span>Preview</span>
            </button>
            <button type="button" class="btn-action-view" onclick="window.handleEditProgramDirect('${prog.id}')" style="margin-right: 6px;" title="Edit data program ini">
              <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              <span>Edit</span>
            </button>
            <button type="button" class="btn-action-delete" onclick="window.handleDeleteProgramDirect('${prog.id}')" title="Hapus program">
              <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              <span>Hapus</span>
            </button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }
  }

  // Generate Exact Card HTML for Live Preview & Public Layout
  function renderProgramCardHTML(prog) {
    const title = escapeHTML(prog.title || 'Judul Program Layanan');
    const divisi = escapeHTML(prog.divisi || 'Divisi Program');
    const quote = escapeHTML(prog.quote || 'Ringkasan penjelasan program layanan...');
    const cover = escapeHTML(prog.cover || '../assets/unit-pendidikan/Sekolah Juara.jpg');
    const bukti = escapeHTML(prog.buktiKapasitas || '');
    const kebutuhan = escapeHTML(prog.kebutuhanDukungan || '');
    const metric = escapeHTML(prog.metric || 'Metrik Program');
    const actionText = escapeHTML(prog.actionText || 'Jadi Mitra Program');
    const actionLink = escapeHTML(prog.actionLink || 'jadi-mitra-program.html');

    return `
      <article class="program-detail-card visible" style="margin: 0; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);">
        <div class="program-card-img-wrap">
          <img src="${cover}" alt="${title}" class="program-card-img" onerror="this.src='../assets/unit-pendidikan/Sekolah Juara.jpg'">
        </div>
        <div class="program-card-content">
          <div class="program-card-header-meta">
            <span class="program-divisi-tag">Divisi: ${divisi}</span>
          </div>
          <h4 style="font-size: 1.25rem; font-weight: 700; color: #1E293B; margin-bottom: 12px; line-height: 1.35;">${title}</h4>
          <div class="program-quote-box" style="margin-bottom: 14px;">
            <p style="margin: 0; font-size: 0.9rem; line-height: 1.6; color: #334155;">${quote}</p>
          </div>
          <div class="program-meta-list" style="margin-bottom: 16px;">
            ${bukti ? `
              <div class="program-meta-item">
                <span class="program-meta-label">Bukti Kapasitas:</span>
                <span class="program-meta-val">${bukti}</span>
              </div>
            ` : ''}
            ${kebutuhan ? `
              <div class="program-meta-item">
                <span class="program-meta-label">Kebutuhan Dukungan:</span>
                <span class="program-meta-val">${kebutuhan}</span>
              </div>
            ` : ''}
          </div>
          <div class="program-card-footer">
            <div class="program-metric-item">
              <span class="metric-bullet"></span>
              <span style="font-weight: 600; color: #1E293B; font-size: 0.88rem;">${metric}</span>
            </div>
            <a href="${actionLink}" class="btn-jadi-mitra-program" onclick="return false;">
              <span>${actionText}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
          </div>
        </div>
      </article>
    `;
  }

  // Update Live Preview Inside Modal
  function updateProgramLivePreview() {
    if (!programLivePreviewContainer) return;

    const progData = {
      title: programTitle?.value.trim() || 'Nama Program Baru',
      divisi: programDivisi?.value.trim() || 'Divisi Penanggung Jawab',
      quote: programQuote?.value.trim() || 'Ringkasan dan misi program ini...',
      buktiKapasitas: programBuktiKapasitas?.value.trim() || '',
      kebutuhanDukungan: programKebutuhanDukungan?.value.trim() || '',
      metric: programMetric?.value.trim() || 'Capaian Program',
      cover: programCoverUrlInput?.value.trim() || '../assets/unit-pendidikan/Sekolah Juara.jpg',
      actionText: programActionText?.value.trim() || 'Jadi Mitra Program',
      actionLink: programActionLink?.value.trim() || 'jadi-mitra-program.html'
    };

    programLivePreviewContainer.innerHTML = renderProgramCardHTML(progData);
  }

  // Modal Open/Close
  function openCreateProgramModal() {
    const modal = programModal || document.getElementById('programModal');
    if (!modal) return;

    if (programModalTitle) programModalTitle.textContent = 'Buat Program Layanan Baru';
    if (btnSaveProgramText) btnSaveProgramText.textContent = 'Simpan & Publikasikan';
    if (programEditId) programEditId.value = '';

    // Reset fields
    if (programCategoryInput) programCategoryInput.value = '';
    if (programDivisi) programDivisi.value = '';
    if (programTitle) programTitle.value = '';
    if (programQuote) programQuote.value = '';
    if (programBuktiKapasitas) programBuktiKapasitas.value = '';
    if (programKebutuhanDukungan) programKebutuhanDukungan.value = '';
    if (programMetric) programMetric.value = '';
    if (programStatus) programStatus.value = 'Terbit';
    if (programCoverUrlInput) programCoverUrlInput.value = '../assets/unit-pendidikan/Sekolah Juara.jpg';
    if (programCoverPreviewImg) programCoverPreviewImg.src = '../assets/unit-pendidikan/Sekolah Juara.jpg';
    if (programActionText) programActionText.value = 'Jadi Mitra Program';
    if (programActionLink) programActionLink.value = 'jadi-mitra-program.html';

    updateProgramLivePreview();
    modal.classList.add('show');
    updateBodyScrollLock();
  }

  function openEditProgramModal(id) {
    const modal = programModal || document.getElementById('programModal');
    if (!modal) return;

    const prog = dataPrograms.find(p => p.id === id);
    if (!prog) return;

    if (programModalTitle) programModalTitle.textContent = 'Edit Program Layanan';
    if (btnSaveProgramText) btnSaveProgramText.textContent = 'Perbarui Program';
    if (programEditId) programEditId.value = prog.id;

    if (programCategoryInput) {
      const catMeta = getProgramCategoryMeta(prog.categoryId, prog.categoryTitle);
      programCategoryInput.value = catMeta.title || prog.categoryTitle || '';
    }

    if (programDivisi) programDivisi.value = prog.divisi || '';
    if (programTitle) programTitle.value = prog.title || '';
    if (programQuote) programQuote.value = prog.quote || '';
    if (programBuktiKapasitas) programBuktiKapasitas.value = prog.buktiKapasitas || '';
    if (programKebutuhanDukungan) programKebutuhanDukungan.value = prog.kebutuhanDukungan || '';
    if (programMetric) programMetric.value = prog.metric || '';
    if (programStatus) programStatus.value = prog.status || 'Terbit';
    if (programCoverUrlInput) programCoverUrlInput.value = prog.cover || '';
    if (programCoverPreviewImg) programCoverPreviewImg.src = prog.cover || '../assets/unit-pendidikan/Sekolah Juara.jpg';
    if (programActionText) programActionText.value = prog.actionText || 'Jadi Mitra Program';
    if (programActionLink) programActionLink.value = prog.actionLink || 'jadi-mitra-program.html';

    updateProgramLivePreview();
    modal.classList.add('show');
    updateBodyScrollLock();
  }

  function closeProgramModal() {
    const modal = programModal || document.getElementById('programModal');
    if (modal) {
      modal.classList.remove('show');
      updateBodyScrollLock();
    }
  }

  // Handle Form Submit (Save / Edit)
  async function handleSaveProgram(e) {
    if (e) e.preventDefault();

    const title = programTitle?.value.trim();
    const divisi = programDivisi?.value.trim();
    const quote = programQuote?.value.trim();
    const metric = programMetric?.value.trim();

    if (!title || !divisi || !quote || !metric) {
      if (typeof Swal !== 'undefined') {
        Swal.fire({
          icon: 'warning',
          title: 'Field Belum Lengkap',
          text: 'Harap lengkapi Judul, Divisi, Deskripsi Kutipan, dan Metrik Program.',
          confirmButtonText: 'OK',
          customClass: { popup: 'acf-swal-popup', confirmButton: 'btn-swal-confirm' },
          buttonsStyling: false
        });
      } else {
        alert('Harap lengkapi semua field bertanda bintang (*).');
      }
      return;
    }

    const rawCat = programCategoryInput?.value.trim();
    if (!rawCat) {
      if (typeof Swal !== 'undefined') {
        Swal.fire({
          icon: 'warning',
          title: 'Kategori Belum Diisi',
          text: 'Harap masukkan Kategori Induk program.',
          confirmButtonText: 'OK',
          customClass: { popup: 'acf-swal-popup', confirmButton: 'btn-swal-confirm' },
          buttonsStyling: false
        });
      } else {
        alert('Harap isi Kategori Induk.');
      }
      return;
    }

    const cleanedCat = rawCat.replace(/^\d+[\.\-\s]+/, '').trim() || rawCat;
    const existingCat = DEFAULT_PROGRAM_CATEGORIES.find(c => c.title.toLowerCase() === cleanedCat.toLowerCase()) ||
                        dataPrograms.find(p => (p.categoryTitle || '').toLowerCase() === cleanedCat.toLowerCase());

    let categoryId = '';
    let categoryNum = 1;
    let categoryTitle = cleanedCat;
    let categoryDesc = '';

    if (existingCat) {
      categoryId = existingCat.categoryId || existingCat.id;
      categoryNum = existingCat.categoryNum || existingCat.num || 1;
      categoryTitle = existingCat.categoryTitle || existingCat.title || cleanedCat;
      categoryDesc = existingCat.categoryDesc || existingCat.desc || '';
    } else {
      const slug = cleanedCat.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      categoryId = 'kategori-' + (slug || Date.now());
      const maxNum = Math.max(
        ...DEFAULT_PROGRAM_CATEGORIES.map(c => c.num || 1),
        ...dataPrograms.map(p => p.categoryNum || 1),
        6
      );
      categoryNum = maxNum + 1;
      categoryDesc = '';
    }

    const editId = programEditId?.value.trim();
    const isEdit = Boolean(editId);

    const programObj = {
      id: isEdit ? editId : ('PRG-' + String(Date.now()).slice(-6)),
      categoryId,
      categoryNum,
      categoryTitle,
      categoryDesc,
      divisi,
      title,
      cover: programCoverUrlInput?.value.trim() || '../assets/unit-pendidikan/Sekolah Juara.jpg',
      quote,
      buktiKapasitas: programBuktiKapasitas?.value.trim() || '',
      kebutuhanDukungan: programKebutuhanDukungan?.value.trim() || '',
      metric,
      actionText: programActionText?.value.trim() || 'Jadi Mitra Program',
      actionLink: programActionLink?.value.trim() || 'jadi-mitra-program.html',
      status: programStatus?.value || 'Terbit',
      updatedAt: new Date().toISOString()
    };

    if (isEdit) {
      const index = dataPrograms.findIndex(p => p.id === editId);
      if (index !== -1) {
        programObj.createdAt = dataPrograms[index].createdAt || new Date().toISOString();
        dataPrograms[index] = programObj;
      }
    } else {
      programObj.createdAt = new Date().toISOString();
      dataPrograms.push(programObj);
    }

    saveProgramsData();
    populateProgramCategoryOptions();
    renderTablePrograms();
    closeProgramModal();

    if (typeof Swal !== 'undefined') {
      Swal.fire({
        icon: 'success',
        title: isEdit ? 'Program Diperbarui' : 'Program Berhasil Dibuat',
        html: `Program <strong>${escapeHTML(title)}</strong> berhasil disimpan.<br>Status: <strong>${programObj.status}</strong> ${programObj.status === 'Terbit' ? '(Tampil di Halaman Publik)' : '(Tersimpan sebagai Draf)'}.`,
        confirmButtonText: 'Selesai',
        customClass: { popup: 'acf-swal-popup', confirmButton: 'btn-swal-confirm' },
        buttonsStyling: false
      });
    } else {
      showToast('Program berhasil disimpan.', 'success');
    }
  }

  // Handle Delete Program
  async function handleDeleteProgram(id) {
    const prog = dataPrograms.find(p => p.id === id);
    if (!prog) return;

    if (typeof Swal !== 'undefined') {
      const res = await Swal.fire({
        title: 'Hapus Program Layanan?',
        html: `Apakah Anda yakin ingin menghapus program <strong>"${escapeHTML(prog.title)}"</strong>?<br><small style="color: #64748B;">Program yang dihapus tidak akan ditampilkan lagi di halaman program layanan publik.</small>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Hapus',
        cancelButtonText: 'Batal',
        reverseButtons: true,
        customClass: {
          popup: 'acf-swal-popup',
          confirmButton: 'btn-swal-confirm btn-swal-danger',
          cancelButton: 'btn-swal-cancel'
        },
        buttonsStyling: false
      });

      if (!res.isConfirmed) return;
    }

    dataPrograms = dataPrograms.filter(p => p.id !== id);
    saveProgramsData();
    populateProgramCategoryOptions();
    renderTablePrograms();

    if (typeof Swal !== 'undefined') {
      Swal.fire({
        icon: 'success',
        title: 'Program Dihapus',
        text: 'Program layanan berhasil dihapus dari sistem.',
        timer: 1600,
        showConfirmButton: false,
        customClass: { popup: 'acf-swal-popup' }
      });
    } else {
      showToast('Program berhasil dihapus.', 'info');
    }
  }

  // Quick Toggle Status
  function handleToggleProgramStatus(id) {
    const prog = dataPrograms.find(p => p.id === id);
    if (!prog) return;

    prog.status = (prog.status === 'Terbit') ? 'Draf' : 'Terbit';
    saveProgramsData();
    renderTablePrograms();

    showToast(`Status program "${prog.title.substring(0, 24)}..." diubah ke ${prog.status}.`, 'info');
  }

  // Reset to 7 Default Programs
  async function handleResetProgramsDefault() {
    if (typeof Swal !== 'undefined') {
      const res = await Swal.fire({
        title: 'Reset Program ke Bawaan?',
        html: 'Tindakan ini akan mengembalikan daftar program ke <strong>7 Program Bawaan Sistem</strong> dan membatalkan perubahan yang belum tersinkronisasi.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ya, Reset Default',
        cancelButtonText: 'Batal',
        reverseButtons: true,
        customClass: {
          popup: 'acf-swal-popup',
          confirmButton: 'btn-swal-confirm',
          cancelButton: 'btn-swal-cancel'
        },
        buttonsStyling: false
      });

      if (!res.isConfirmed) return;
    }

    dataPrograms = JSON.parse(JSON.stringify(DEFAULT_PROGRAMS_DATA));
    saveProgramsData();
    populateProgramCategoryOptions();
    renderTablePrograms();

    if (typeof Swal !== 'undefined') {
      Swal.fire({
        icon: 'success',
        title: 'Berhasil Direset',
        text: 'Data program telah dikembalikan ke 7 program default.',
        timer: 1800,
        showConfirmButton: false,
        customClass: { popup: 'acf-swal-popup' }
      });
    }
  }

  // Open Preview Modal
  function openProgramPreviewModal(id) {
    const prog = dataPrograms.find(p => p.id === id);
    const modal = programPreviewModal || document.getElementById('programPreviewModal');
    const modalBody = programPreviewModalBody || document.getElementById('programPreviewModalBody');
    if (!prog || !modal || !modalBody) return;

    modalBody.innerHTML = renderProgramCardHTML(prog);
    modal.classList.add('show');
    updateBodyScrollLock();
  }

  function closeProgramPreviewModal() {
    const modal = programPreviewModal || document.getElementById('programPreviewModal');
    if (modal) {
      modal.classList.remove('show');
      updateBodyScrollLock();
    }
  }

  // Expose global window helpers
  window.openCreateProgramModal = openCreateProgramModal;
  window.closeProgramModal = closeProgramModal;
  window.openProgramPreviewModal = openProgramPreviewModal;
  window.closeProgramPreviewModal = closeProgramPreviewModal;

  // Global helper bindings for onclick in table rows
  window.handleToggleProgramStatusDirect = function(id) {
    handleToggleProgramStatus(id);
  };
  window.handlePreviewProgramDirect = function(id) {
    openProgramPreviewModal(id);
  };
  window.handleEditProgramDirect = function(id) {
    openEditProgramModal(id);
  };
  window.handleDeleteProgramDirect = function(id) {
    handleDeleteProgram(id);
  };

  /* ===================================================
     9. EVENT LISTENERS
     =================================================== */
  function setupEventListeners() {
    // Login form submit
    if (adminLoginForm) {
      adminLoginForm.addEventListener('submit', handleLogin);
    }

    const btnLoginSubmit = document.getElementById('btnLoginSubmit');
    if (btnLoginSubmit) {
      btnLoginSubmit.addEventListener('click', (e) => {
        if (adminLoginForm && !adminLoginForm.checkValidity()) {
          adminLoginForm.reportValidity();
        } else {
          handleLogin(e);
        }
      });
    }

    // Toggle Password Visibility (Eye Icon)
    if (btnTogglePassword && adminPassword) {
      btnTogglePassword.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isPass = adminPassword.getAttribute('type') === 'password';
        adminPassword.setAttribute('type', isPass ? 'text' : 'password');
        btnTogglePassword.style.color = isPass ? 'var(--admin-purple)' : 'var(--admin-slate-light)';

        const eyeSvg = btnTogglePassword.querySelector('svg');
        if (eyeSvg) {
          if (isPass) {
            // Password sekarang terlihat -> ganti ke icon mata dicoret (eye-off)
            eyeSvg.innerHTML = `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>`;
            btnTogglePassword.setAttribute('title', 'Sembunyikan kata sandi');
          } else {
            // Password disembunyikan -> ganti ke icon mata normal
            eyeSvg.innerHTML = `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
            btnTogglePassword.setAttribute('title', 'Tampilkan kata sandi');
          }
        }
      });
    }

    // Logout
    if (btnLogout) {
      btnLogout.addEventListener('click', handleLogout);
    }

    // Dual Dashboard Switcher
    if (btnNavForms) {
      btnNavForms.addEventListener('click', () => switchDashboardView('viewDashboardForms'));
    }
    if (btnNavArticles) {
      btnNavArticles.addEventListener('click', () => switchDashboardView('viewDashboardArticles'));
    }
    if (btnNavPrograms) {
      btnNavPrograms.addEventListener('click', () => switchDashboardView('viewDashboardPrograms'));
    }

    // Program Layanan Listeners
    if (searchProgramInput) {
      searchProgramInput.addEventListener('input', renderTablePrograms);
    }
    if (filterProgramCategory) {
      filterProgramCategory.addEventListener('change', renderTablePrograms);
    }
    if (filterProgramStatus) {
      filterProgramStatus.addEventListener('change', renderTablePrograms);
    }
    if (btnResetProgramsDefault) {
      btnResetProgramsDefault.addEventListener('click', handleResetProgramsDefault);
    }
    if (btnOpenCreateProgramModal) {
      btnOpenCreateProgramModal.addEventListener('click', openCreateProgramModal);
    }
    if (btnCloseProgramModal) {
      btnCloseProgramModal.addEventListener('click', closeProgramModal);
    }
    if (btnCancelProgramModal) {
      btnCancelProgramModal.addEventListener('click', closeProgramModal);
    }
    if (programForm) {
      programForm.addEventListener('submit', handleSaveProgram);
    }

    // Realtime live preview input listeners
    const livePreviewInputEls = [
      programCategoryInput, programTitle, programDivisi, programQuote,
      programBuktiKapasitas, programKebutuhanDukungan,
      programMetric, programCoverUrlInput, programActionText, programActionLink
    ];
    livePreviewInputEls.forEach(el => {
      if (el) {
        el.addEventListener('input', updateProgramLivePreview);
      }
    });

    // Program cover file upload
    if (programCoverFileInput) {
      programCoverFileInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
          showToast('Harap pilih file gambar (JPG, PNG, WebP).', 'warning');
          return;
        }

        const reader = new FileReader();
        reader.onload = function(evt) {
          const base64 = evt.target.result;
          if (programCoverUrlInput) programCoverUrlInput.value = base64;
          if (programCoverPreviewImg) programCoverPreviewImg.src = base64;
          updateProgramLivePreview();
          showToast('Foto program berhasil dimuat.', 'info');
        };
        reader.readAsDataURL(file);
      });
    }

    // Reset program cover button
    if (btnResetProgramCover) {
      btnResetProgramCover.addEventListener('click', () => {
        const defaultCover = '../assets/unit-pendidikan/Sekolah Juara.jpg';
        if (programCoverUrlInput) programCoverUrlInput.value = defaultCover;
        if (programCoverPreviewImg) programCoverPreviewImg.src = defaultCover;
        if (programCoverFileInput) programCoverFileInput.value = '';
        updateProgramLivePreview();
      });
    }

    // Program Preview Modal Close
    if (btnCloseProgramPreview) {
      btnCloseProgramPreview.addEventListener('click', closeProgramPreviewModal);
    }
    if (programPreviewModal) {
      programPreviewModal.addEventListener('click', (e) => {
        if (e.target === programPreviewModal) closeProgramPreviewModal();
      });
    }
    if (programModal) {
      programModal.addEventListener('click', (e) => {
        if (e.target === programModal) closeProgramModal();
      });
    }

    // Google Spreadsheet Dropdown Toggle
    if (sheetsDropdownWrap && btnSheetsDropdown) {
      btnSheetsDropdown.addEventListener('click', (e) => {
        e.stopPropagation();
        const isActive = sheetsDropdownWrap.classList.toggle('active');
        btnSheetsDropdown.setAttribute('aria-expanded', isActive ? 'true' : 'false');
      });

      document.addEventListener('click', (e) => {
        if (!sheetsDropdownWrap.contains(e.target)) {
          sheetsDropdownWrap.classList.remove('active');
          btnSheetsDropdown.setAttribute('aria-expanded', 'false');
        }
      });
    }

    // Copy Google Spreadsheet Link to Clipboard
    document.querySelectorAll('.btn-copy-sheet-link').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const url = btn.getAttribute('data-url');
        if (!url) return;
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(url);
          } else {
            const tempInput = document.createElement('input');
            tempInput.value = url;
            document.body.appendChild(tempInput);
            tempInput.select();
            document.execCommand('copy');
            document.body.removeChild(tempInput);
          }
          showToast('📋 Tautan Google Spreadsheet berhasil disalin!', 'success');
        } catch (err) {
          showToast('Gagal menyalin tautan secara otomatis.', 'info');
        }
      });
    });

    // WordPress REST API Sync Modal triggers
    if (btnOpenWpSyncModal) {
      btnOpenWpSyncModal.addEventListener('click', openWpSyncModal);
    }
    if (btnCloseWpSyncModal) {
      btnCloseWpSyncModal.addEventListener('click', closeWpSyncModal);
    }
    if (wpSyncModal) {
      wpSyncModal.addEventListener('click', (e) => {
        if (e.target === wpSyncModal) closeWpSyncModal();
      });
    }

    // (updateToolbarState is defined in module scope above)

    // Rich Text WYSIWYG Toolbar Commands (Mousedown prevents losing selection)
    document.querySelectorAll('.wp-tool-btn[data-cmd]').forEach(btn => {
      btn.addEventListener('mousedown', (e) => e.preventDefault());
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const cmd = btn.getAttribute('data-cmd');
        if (!cmd) return;

        if (cmd === 'removeFormat') {
          document.execCommand('removeFormat', false, null);
          document.execCommand('unlink', false, null);
          const sel = window.getSelection();
          if (sel && sel.rangeCount > 0) {
            const el = sel.anchorNode && sel.anchorNode.parentElement;
            if (el && el.closest('#articleVisualEditor')) {
              const target = el.closest('span, font, a, p, h2, h3, h4');
              if (target && target.id !== 'articleVisualEditor') {
                target.removeAttribute('style');
                target.classList.remove('has-drop-cap', 'article-lead');
              }
            }
          }
          showToast('Format teks dibersihkan.', 'info');
        } else {
          document.execCommand(cmd, false, null);
        }

        if (articleVisualEditor) articleVisualEditor.focus();
        updateWpStats();
        updateToolbarState();
        triggerAutosave();
      });
    });

    // Heading / Block / Paragraph Format Selector
    if (wpBlockFormat) {
      wpBlockFormat.addEventListener('change', (e) => {
        const val = e.target.value;
        if (!articleVisualEditor) return;
        articleVisualEditor.focus();
        
        try {
          document.execCommand('defaultParagraphSeparator', false, 'p');
        } catch(err) {}

        if (val === 'p') {
          document.execCommand('formatBlock', false, '<p>');
        } else if (val === 'multi-p') {
          const selection = window.getSelection();
          if (selection && selection.toString().trim().length > 0) {
            const rawText = selection.toString();
            const paragraphs = rawText.split(/\r?\n+/).filter(line => line.trim().length > 0);
            if (paragraphs.length > 1) {
              const html = paragraphs.map(p => `<p>${p.trim()}</p>`).join('');
              document.execCommand('insertHTML', false, html);
            } else {
              document.execCommand('formatBlock', false, '<p>');
              document.execCommand('insertHTML', false, '<p><br></p>');
            }
          } else {
            document.execCommand('insertHTML', false, '<p><br></p>');
          }
        } else if (val === 'lead-p') {
          const selection = window.getSelection();
          const selectedText = (selection && selection.toString().trim()) || 'Tuliskan paragraf pembuka atau ringkasan penting di sini...';
          document.execCommand('insertHTML', false, `<p class="article-lead">${selectedText}</p><p><br></p>`);
        } else if (val === 'h2' || val === 'h3' || val === 'h4') {
          document.execCommand('formatBlock', false, `<${val}>`);
        } else if (val === 'blockquote') {
          document.execCommand('formatBlock', false, '<blockquote>');
        } else if (val === 'callout') {
          document.execCommand('insertHTML', false, '<div class="wp-callout-box"><p><strong>Catatan Penting:</strong> Tuliskan poin penting atau catatan sorotan di sini...</p></div><p><br></p>');
        } else if (val === 'hr') {
          document.execCommand('insertHorizontalRule', false, null);
          document.execCommand('insertHTML', false, '<p><br></p>');
        }

        articleVisualEditor.focus();
        updateWpStats();
        updateToolbarState();
        triggerAutosave();
      });
    }

    // Insert Link Button (Smart: preserves selection and handles collapsed cursor)
    if (btnWpInsertLink) {
      let linkSavedRange = null;
      btnWpInsertLink.addEventListener('mousedown', (e) => {
        e.preventDefault();
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
          linkSavedRange = sel.getRangeAt(0).cloneRange();
        }
      });

      btnWpInsertLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (linkSavedRange && window.getSelection) {
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(linkSavedRange);
        }

        const sel = window.getSelection();
        const hasSelection = sel && sel.rangeCount > 0 && !sel.isCollapsed && sel.toString().trim().length > 0;

        const url = prompt('Masukkan URL Link (contoh: https://acf.or.id):', 'https://');
        if (url && url.trim() !== '' && url !== 'https://') {
          const cleanUrl = url.trim();
          if (hasSelection) {
            document.execCommand('createLink', false, cleanUrl);
          } else {
            const linkHtml = `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer">${cleanUrl}</a>&nbsp;`;
            document.execCommand('insertHTML', false, linkHtml);
          }
          if (articleVisualEditor) articleVisualEditor.focus();
          updateWpStats();
          updateToolbarState();
          triggerAutosave();
          showToast('Tautan berhasil disisipkan!', 'success');
        }
      });
    }

    // Insert Inline Image into Editor
    if (btnWpInsertImage) {
      btnWpInsertImage.addEventListener('click', (e) => {
        e.preventDefault();
        openInlineImageModal();
      });
    }

    // Content Editable Input, Selection Tracking & Stats
    if (articleVisualEditor) {
      articleVisualEditor.addEventListener('input', () => {
        updateWpStats();
        updateToolbarState();
        triggerAutosave();
      });
      articleVisualEditor.addEventListener('keyup', () => {
        updateWpStats();
        updateToolbarState();
      });
      articleVisualEditor.addEventListener('mouseup', () => {
        updateWpStats();
        updateToolbarState();
      });
      articleVisualEditor.addEventListener('paste', () => {
        setTimeout(() => {
          updateWpStats();
          updateToolbarState();
          triggerAutosave();
        }, 50);
      });
    }

    document.addEventListener('selectionchange', () => {
      if (articleModal && articleModal.classList.contains('show')) {
        updateToolbarState();
      }
    });

    if (articleStatusSelect) {
      articleStatusSelect.addEventListener('change', () => {
        if (articleStatusInput) articleStatusInput.value = articleStatusSelect.value;
      });
    }

    // Auto-grow & Focus Tracker for Gutenberg Title Textarea
    let lastFocusedEditorTarget = 'canvas'; // 'title' | 'canvas'

    if (articleTitle) {
      const syncTitleFocusState = () => {
        lastFocusedEditorTarget = 'title';
        const curCol = articleTitle.style.color || '#0F172A';
        const ind = document.getElementById('toolbarColorIndicator');
        if (ind) ind.style.backgroundColor = curCol;
        document.querySelectorAll('.wp-color-circle').forEach(c => {
          const cCol = c.getAttribute('data-color');
          c.classList.toggle('active', cCol === curCol);
        });
      };

      articleTitle.addEventListener('focus', syncTitleFocusState);
      articleTitle.addEventListener('click', syncTitleFocusState);
      articleTitle.addEventListener('select', syncTitleFocusState);

      articleTitle.addEventListener('input', () => {
        articleTitle.style.height = 'auto';
        articleTitle.style.height = articleTitle.scrollHeight + 'px';
      });
    }

    if (articleVisualEditor) {
      articleVisualEditor.addEventListener('focus', () => { lastFocusedEditorTarget = 'canvas'; });
      articleVisualEditor.addEventListener('click', () => { lastFocusedEditorTarget = 'canvas'; });
    }

    // Gutenberg Add Block Drawer Toggle
    const btnGutenbergAddBlock = document.getElementById('btnGutenbergAddBlock');
    const wpBlockInserterDrawer = document.getElementById('wpBlockInserterDrawer');
    const btnCloseBlockInserter = document.getElementById('btnCloseBlockInserter');
    const wpBlockSearchInput = document.getElementById('wpBlockSearchInput');

    if (btnGutenbergAddBlock && wpBlockInserterDrawer) {
      btnGutenbergAddBlock.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = wpBlockInserterDrawer.style.display === 'flex';
        wpBlockInserterDrawer.style.display = isOpen ? 'none' : 'flex';
        btnGutenbergAddBlock.classList.toggle('active', !isOpen);
        if (!isOpen && wpBlockSearchInput) {
          setTimeout(() => wpBlockSearchInput.focus(), 50);
        }
      });
    }

    if (btnCloseBlockInserter && wpBlockInserterDrawer) {
      btnCloseBlockInserter.addEventListener('click', () => {
        wpBlockInserterDrawer.style.display = 'none';
        if (btnGutenbergAddBlock) btnGutenbergAddBlock.classList.remove('active');
      });
    }

    // Search in Block Inserter
    if (wpBlockSearchInput) {
      wpBlockSearchInput.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase().trim();
        document.querySelectorAll('.wp-gb-block-card').forEach(card => {
          const text = card.textContent.toLowerCase();
          card.style.display = text.includes(q) ? 'flex' : 'none';
        });
      });
    }

    // Block Cards Click (Insert Block)
    document.querySelectorAll('.wp-gb-block-card').forEach(card => {
      card.addEventListener('click', () => {
        const bType = card.getAttribute('data-block-type');
        if (!articleVisualEditor) return;
        articleVisualEditor.focus();

        if (bType === 'p') {
          document.execCommand('formatBlock', false, '<p>');
        } else if (bType === 'lead-p') {
          document.execCommand('insertHTML', false, '<p class="article-lead">Tuliskan ringkasan atau paragraf pembuka artikel di sini...</p><p><br></p>');
        } else if (bType === 'h2' || bType === 'h3') {
          document.execCommand('formatBlock', false, `<${bType}>`);
        } else if (bType === 'blockquote') {
          document.execCommand('formatBlock', false, '<blockquote>');
        } else if (bType === 'callout') {
          document.execCommand('insertHTML', false, '<div class="wp-callout-box"><p><strong>Catatan Penting:</strong> Tuliskan poin atau catatan sorotan di sini...</p></div><p><br></p>');
        } else if (bType === 'list-ul') {
          document.execCommand('insertUnorderedList', false, null);
        } else if (bType === 'list-ol') {
          document.execCommand('insertOrderedList', false, null);
        } else if (bType === 'hr') {
          document.execCommand('insertHorizontalRule', false, null);
          document.execCommand('insertHTML', false, '<p><br></p>');
        } else if (bType === 'insert-image') {
          if (btnWpInsertImage) btnWpInsertImage.click();
        }

        if (wpBlockInserterDrawer) wpBlockInserterDrawer.style.display = 'none';
        if (btnGutenbergAddBlock) btnGutenbergAddBlock.classList.remove('active');
        updateWpStats();
      });
    });

    // Toggle Right Sidebar (Settings Cog)
    const btnToggleWpSidebar = document.getElementById('btnToggleWpSidebar');
    const wpGutenbergWorkspace = document.querySelector('.wp-gb-workspace-wrap');
    if (btnToggleWpSidebar && wpGutenbergWorkspace) {
      btnToggleWpSidebar.addEventListener('click', () => {
        wpGutenbergWorkspace.classList.toggle('sidebar-collapsed');
        btnToggleWpSidebar.classList.toggle('active');
      });
    }

    // Sidebar Tab Switcher: Pos vs Blok
    const sideTabs = document.querySelectorAll('.wp-gb-side-tab');
    sideTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        sideTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const targetPane = tab.getAttribute('data-tab-pane');
        document.querySelectorAll('.wp-gb-pane').forEach(p => p.classList.remove('active'));
        const paneEl = document.getElementById(targetPane);
        if (paneEl) paneEl.classList.add('active');
      });
    });

    // Typography Size Pills in Blok Tab (Safe replacement without surroundContents crash)
    document.querySelectorAll('.wp-gb-pill-btn[data-font-size]').forEach(btn => {
      btn.addEventListener('mousedown', (e) => e.preventDefault());
      btn.addEventListener('click', () => {
        document.querySelectorAll('.wp-gb-pill-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const sz = btn.getAttribute('data-font-size');
        const sizeMap = { small: '0.88rem', normal: '1.08rem', medium: '1.28rem', large: '1.5rem' };
        const chosenSize = sizeMap[sz] || '1.08rem';

        if (!articleVisualEditor) return;
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0 && !sel.isCollapsed && sel.toString().trim().length > 0) {
          try {
            const range = sel.getRangeAt(0);
            const span = document.createElement('span');
            span.style.fontSize = chosenSize;
            span.appendChild(range.extractContents());
            range.insertNode(span);
            sel.removeAllRanges();
            const newRange = document.createRange();
            newRange.selectNodeContents(span);
            sel.addRange(newRange);
          } catch (e) {
            document.execCommand('fontSize', false, sz === 'small' ? '2' : (sz === 'medium' ? '4' : (sz === 'large' ? '5' : '3')));
          }
        } else {
          // If no text is selected, apply font size to the active paragraph or block
          let node = sel && sel.anchorNode;
          if (node && node.nodeType === 3) node = node.parentNode;
          const block = node && node.closest('#articleVisualEditor') && node.closest('p, h2, h3, h4, blockquote, div');
          if (block && block.id !== 'articleVisualEditor') {
            block.style.fontSize = chosenSize;
          }
        }

        articleVisualEditor.focus();
        triggerAutosave();
        updateWpStats();
      });
    });

    // Drop Cap Checkbox in Blok Tab
    const chkDropCap = document.getElementById('chkDropCap');
    if (chkDropCap) {
      chkDropCap.addEventListener('change', () => {
        if (!articleVisualEditor) return;
        const sel = window.getSelection();
        let targetP = null;
        if (sel && sel.rangeCount > 0) {
          let node = sel.anchorNode;
          if (node && node.nodeType === 3) node = node.parentNode;
          if (node && node.closest && node.closest('#articleVisualEditor')) {
            targetP = node.closest('p');
          }
        }
        if (!targetP) {
          targetP = articleVisualEditor.querySelector('p');
        }

        if (targetP) {
          targetP.classList.toggle('has-drop-cap', chkDropCap.checked);
          triggerAutosave();
          showToast(chkDropCap.checked ? 'Drop Cap diaktifkan pada paragraf.' : 'Drop Cap dinonaktifkan.', 'info');
        } else {
          showToast('Ketik paragraf terlebih dahulu untuk mengaktifkan Drop Cap.', 'info');
          chkDropCap.checked = false;
        }
        articleVisualEditor.focus();
      });
    }

    // ==========================================
    // UNIFIED TEXT COLOR HANDLER (TITLE & BODY)
    // ==========================================
    function applyTextColor(color) {
      if (!color) return;

      // 1. Update toolbar & input indicators
      const toolbarColorIndicator = document.getElementById('toolbarColorIndicator');
      if (toolbarColorIndicator) toolbarColorIndicator.style.backgroundColor = color;

      const toolbarInput = document.getElementById('toolbarTextColorInput');
      if (toolbarInput && color.startsWith('#')) toolbarInput.value = color;

      const customInput = document.getElementById('inputCustomTextColor');
      if (customInput && color.startsWith('#')) customInput.value = color;

      // 2. Mark active circle swatch
      document.querySelectorAll('.wp-color-circle').forEach(c => {
        c.classList.toggle('active', c.getAttribute('data-color') === color);
      });

      // 3. TARGET: Article Title
      if (lastFocusedEditorTarget === 'title' || document.activeElement === articleTitle) {
        if (articleTitle) {
          articleTitle.style.color = color;
          articleTitle.setAttribute('data-color', color);
          articleTitle.focus();
          triggerAutosave();
          showToast('Warna judul berhasil diubah!', 'success');
          return;
        }
      }

      // 4. TARGET: Visual Canvas (Content)
      if (articleVisualEditor) {
        articleVisualEditor.focus();
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0 && !sel.isCollapsed && sel.toString().trim().length > 0) {
          // Ada teks yang diblok -> gunakan styleWithCSS agar inline style span dibuat
          try {
            document.execCommand('styleWithCSS', false, true);
          } catch(e) {}
          document.execCommand('foreColor', false, color);
          // Konversi font tag menjadi span style
          articleVisualEditor.querySelectorAll('font[color]').forEach(f => {
            const span = document.createElement('span');
            span.style.color = f.getAttribute('color') || color;
            span.innerHTML = f.innerHTML;
            f.parentNode.replaceChild(span, f);
          });
        } else {
          // Tidak ada teks diblok -> warnai seluruh blok kalimat atau heading aktif
          let node = sel && sel.anchorNode;
          if (node && node.nodeType === 3) node = node.parentNode;
          const block = node && node.closest('#articleVisualEditor') && node.closest('h1, h2, h3, h4, p, blockquote, div, li');
          if (block && block.id !== 'articleVisualEditor') {
            block.style.color = color;
          } else {
            // Jika berada di node langsung dalam canvas
            let targetChild = null;
            let curr = sel && sel.anchorNode;
            while (curr && curr.parentNode !== articleVisualEditor) {
              curr = curr.parentNode;
            }
            if (curr && curr.parentNode === articleVisualEditor) {
              targetChild = curr;
            }
            if (targetChild) {
              if (targetChild.nodeType === 3) {
                const p = document.createElement('p');
                p.style.color = color;
                targetChild.parentNode.replaceChild(p, targetChild);
                p.appendChild(targetChild);
              } else {
                targetChild.style.color = color;
              }
            } else if (articleVisualEditor.innerText.trim().length > 0) {
              articleVisualEditor.innerHTML = `<p style="color: ${color};">${articleVisualEditor.innerHTML}</p>`;
            } else {
              try {
                document.execCommand('styleWithCSS', false, true);
              } catch(e) {}
              document.execCommand('foreColor', false, color);
            }
          }
        }
        triggerAutosave();
        updateToolbarState();
        showToast('Warna teks berhasil diterapkan!', 'success');
      }
    }

    // Contextual Toolbar Color Picker
    const toolbarTextColorInput = document.getElementById('toolbarTextColorInput');
    if (toolbarTextColorInput) {
      toolbarTextColorInput.addEventListener('input', (e) => applyTextColor(e.target.value));
      toolbarTextColorInput.addEventListener('change', (e) => applyTextColor(e.target.value));
    }

    // Color Swatches in Blok Tab (Preset Palettes)
    document.querySelectorAll('.wp-color-circle[data-color]').forEach(btn => {
      btn.addEventListener('mousedown', (e) => e.preventDefault());
      btn.addEventListener('click', () => {
        const color = btn.getAttribute('data-color');
        if (color) applyTextColor(color);
      });
    });

    // Custom Color Picker Input in Blok Tab
    const inputCustomTextColor = document.getElementById('inputCustomTextColor');
    if (inputCustomTextColor) {
      inputCustomTextColor.addEventListener('input', (e) => applyTextColor(e.target.value));
      inputCustomTextColor.addEventListener('change', (e) => applyTextColor(e.target.value));
    }

    // Background Highlight Swatches
    document.querySelectorAll('.wp-bg-circle[data-bg]').forEach(btn => {
      btn.addEventListener('mousedown', (e) => e.preventDefault());
      btn.addEventListener('click', () => {
        const bg = btn.getAttribute('data-bg');
        if (bg) {
          if (bg === 'transparent') {
            document.execCommand('removeFormat', false, null);
          } else {
            try {
              document.execCommand('hiliteColor', false, bg);
            } catch(err) {
              document.execCommand('backColor', false, bg);
            }
          }
          if (articleVisualEditor) articleVisualEditor.focus();
          triggerAutosave();
        }
      });
    });

    // Keyboard Shortcuts inside Editor Modal (Ctrl+S / Cmd+S: Simpan Draf, Ctrl+Enter: Terbitkan)
    if (articleModal) {
      articleModal.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
          e.preventDefault();
          e.stopPropagation();
          if (btnSaveDraft) {
            btnSaveDraft.click();
          }
          return;
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
          e.stopPropagation();
          if (btnSaveArticle) {
            btnSaveArticle.click();
          }
          return;
        }
      });
    }

    // ==========================================
    // GAMBAR UNGGULAN (FEATURED IMAGE) LISTENERS
    // ==========================================
    const btnUploadCoverComputer = document.getElementById('btnUploadCoverComputer');
    const coverPreviewBox = document.getElementById('coverPreviewBox');
    const btnChangeCover = document.getElementById('btnChangeCover');
    const btnRemoveCover = document.getElementById('btnRemoveCover');
    const btnRemoveCoverDirect = document.getElementById('btnRemoveCoverDirect');
    const btnApplyCoverUrl = document.getElementById('btnApplyCoverUrl');

    if (btnUploadCoverComputer && wpFileInput) {
      btnUploadCoverComputer.addEventListener('click', (e) => {
        e.preventDefault();
        wpFileInput.click();
      });
    }

    if (coverPreviewBox && wpFileInput) {
      coverPreviewBox.addEventListener('click', (e) => {
        if (e.target.closest('#btnChangeCover') || e.target.closest('#btnRemoveCover')) return;
        if (!articleCover || !articleCover.value.trim()) {
          wpFileInput.click();
        }
      });

      coverPreviewBox.addEventListener('dragover', (e) => {
        e.preventDefault();
        coverPreviewBox.style.borderColor = '#7D2280';
        coverPreviewBox.style.background = '#FAF5FF';
      });

      coverPreviewBox.addEventListener('dragleave', () => {
        coverPreviewBox.style.borderColor = '';
        coverPreviewBox.style.background = '';
      });

      coverPreviewBox.addEventListener('drop', (e) => {
        e.preventDefault();
        coverPreviewBox.style.borderColor = '';
        coverPreviewBox.style.background = '';
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          handleLocalImageUpload(e.dataTransfer.files[0]);
        }
      });
    }

    if (wpFileInput) {
      wpFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          handleLocalImageUpload(e.target.files[0]);
        }
      });
    }

    if (btnChangeCover && wpFileInput) {
      btnChangeCover.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        wpFileInput.click();
      });
    }

    function removeCoverImage(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (articleCover) articleCover.value = '';
      if (wpFileInput) wpFileInput.value = '';
      resetCoverPlaceholder();
      updateCoverPreview('');
      showToast('Gambar unggulan telah dihapus.', 'info');
    }

    if (btnRemoveCover) btnRemoveCover.addEventListener('click', removeCoverImage);
    if (btnRemoveCoverDirect) btnRemoveCoverDirect.addEventListener('click', removeCoverImage);

    if (btnApplyCoverUrl && articleCover) {
      btnApplyCoverUrl.addEventListener('click', (e) => {
        e.preventDefault();
        const url = articleCover.value.trim();
        if (url) {
          updateCoverPreview(url);
          showToast('URL gambar diterapkan!', 'success');
        } else {
          showToast('Masukkan URL gambar terlebih dahulu.', 'info');
        }
      });
    }

    // ==========================================
    // GAMBAR INLINE (CONTENT BODY IMAGE) LISTENERS
    // ==========================================
    const inlineImageModal = document.getElementById('inlineImageModal');
    const btnCloseInlineImageModal = document.getElementById('btnCloseInlineImageModal');
    const btnCancelInlineImage = document.getElementById('btnCancelInlineImage');
    const tabInlineImgComputer = document.getElementById('tabInlineImgComputer');
    const tabInlineImgUrl = document.getElementById('tabInlineImgUrl');
    const paneInlineImgComputer = document.getElementById('paneInlineImgComputer');
    const paneInlineImgUrl = document.getElementById('paneInlineImgUrl');
    const inlineImgDropzone = document.getElementById('inlineImgDropzone');
    const inlineImgFileInput = document.getElementById('inlineImgFileInput');
    const inlineDropzoneTitle = document.getElementById('inlineDropzoneTitle');
    const inlineImgSelectedFileBadge = document.getElementById('inlineImgSelectedFileBadge');
    const inlineImgUrlInput = document.getElementById('inlineImgUrlInput');
    const inlineImgCaptionInput = document.getElementById('inlineImgCaptionInput');
    const btnConfirmInsertInlineImage = document.getElementById('btnConfirmInsertInlineImage');

    let inlineSelectedFile = null;
    let inlineSelectedAlign = 'center';
    let savedEditorSelection = null;

    function saveEditorSelection() {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        savedEditorSelection = sel.getRangeAt(0).cloneRange();
      }
    }

    function restoreEditorSelection() {
      if (savedEditorSelection && window.getSelection) {
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(savedEditorSelection);
      }
    }

    function openInlineImageModal() {
      saveEditorSelection();
      inlineSelectedFile = null;
      inlineSelectedAlign = 'center';

      if (inlineImgSelectedFileBadge) {
        inlineImgSelectedFileBadge.style.display = 'none';
        inlineImgSelectedFileBadge.textContent = '';
      }
      if (inlineDropzoneTitle) inlineDropzoneTitle.textContent = 'Klik untuk pilih gambar dari komputer';
      if (inlineImgFileInput) inlineImgFileInput.value = '';
      if (inlineImgUrlInput) inlineImgUrlInput.value = '';
      if (inlineImgCaptionInput) inlineImgCaptionInput.value = '';

      if (tabInlineImgComputer) tabInlineImgComputer.click();

      document.querySelectorAll('.btn-align-choice').forEach(btn => {
        const isCenter = btn.getAttribute('data-align') === 'center';
        btn.classList.toggle('active', isCenter);
        btn.style.border = isCenter ? '1.5px solid #7D2280' : '1px solid #CBD5E1';
        btn.style.background = isCenter ? '#FAF5FF' : '#FFFFFF';
        btn.style.color = isCenter ? '#7D2280' : '#475569';
      });

      if (inlineImageModal) {
        inlineImageModal.classList.add('show');
      }
    }

    function closeInlineImageModal() {
      if (inlineImageModal) {
        inlineImageModal.classList.remove('show');
      }
    }

    if (btnCloseInlineImageModal) btnCloseInlineImageModal.addEventListener('click', closeInlineImageModal);
    if (btnCancelInlineImage) btnCancelInlineImage.addEventListener('click', closeInlineImageModal);
    if (inlineImageModal) {
      inlineImageModal.addEventListener('click', (e) => {
        if (e.target === inlineImageModal) closeInlineImageModal();
      });
    }

    // Inline Image Tabs Switcher
    if (tabInlineImgComputer && tabInlineImgUrl) {
      tabInlineImgComputer.addEventListener('click', () => {
        tabInlineImgComputer.classList.add('active');
        tabInlineImgComputer.style.background = '#FFFFFF';
        tabInlineImgComputer.style.color = '#7D2280';
        tabInlineImgComputer.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';

        tabInlineImgUrl.classList.remove('active');
        tabInlineImgUrl.style.background = 'transparent';
        tabInlineImgUrl.style.color = '#64748B';
        tabInlineImgUrl.style.boxShadow = 'none';

        if (paneInlineImgComputer) paneInlineImgComputer.style.display = 'block';
        if (paneInlineImgUrl) paneInlineImgUrl.style.display = 'none';
      });

      tabInlineImgUrl.addEventListener('click', () => {
        tabInlineImgUrl.classList.add('active');
        tabInlineImgUrl.style.background = '#FFFFFF';
        tabInlineImgUrl.style.color = '#7D2280';
        tabInlineImgUrl.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';

        tabInlineImgComputer.classList.remove('active');
        tabInlineImgComputer.style.background = 'transparent';
        tabInlineImgComputer.style.color = '#64748B';
        tabInlineImgComputer.style.boxShadow = 'none';

        if (paneInlineImgComputer) paneInlineImgComputer.style.display = 'none';
        if (paneInlineImgUrl) paneInlineImgUrl.style.display = 'block';
        if (inlineImgUrlInput) inlineImgUrlInput.focus();
      });
    }

    // Inline Image File Select & Dropzone
    if (inlineImgDropzone && inlineImgFileInput) {
      inlineImgDropzone.addEventListener('click', () => inlineImgFileInput.click());

      inlineImgFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          inlineSelectedFile = e.target.files[0];
          if (inlineDropzoneTitle) inlineDropzoneTitle.textContent = `File dipilih: ${inlineSelectedFile.name}`;
          if (inlineImgSelectedFileBadge) {
            inlineImgSelectedFileBadge.style.display = 'inline-block';
            inlineImgSelectedFileBadge.textContent = `✓ ${inlineSelectedFile.name} (${Math.round(inlineSelectedFile.size / 1024)} KB)`;
          }
        }
      });

      inlineImgDropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        inlineImgDropzone.style.borderColor = '#7D2280';
        inlineImgDropzone.style.background = '#F3E8FF';
      });

      inlineImgDropzone.addEventListener('dragleave', () => {
        inlineImgDropzone.style.borderColor = '#C4B5FD';
        inlineImgDropzone.style.background = '#FAF5FF';
      });

      inlineImgDropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        inlineImgDropzone.style.borderColor = '#C4B5FD';
        inlineImgDropzone.style.background = '#FAF5FF';
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          inlineSelectedFile = e.dataTransfer.files[0];
          if (inlineDropzoneTitle) inlineDropzoneTitle.textContent = `File dipilih: ${inlineSelectedFile.name}`;
          if (inlineImgSelectedFileBadge) {
            inlineImgSelectedFileBadge.style.display = 'inline-block';
            inlineImgSelectedFileBadge.textContent = `✓ ${inlineSelectedFile.name} (${Math.round(inlineSelectedFile.size / 1024)} KB)`;
          }
        }
      });
    }

    // Alignment Choices in Modal
    document.querySelectorAll('.btn-align-choice').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.btn-align-choice').forEach(b => {
          b.classList.remove('active');
          b.style.border = '1px solid #CBD5E1';
          b.style.background = '#FFFFFF';
          b.style.color = '#475569';
        });
        btn.classList.add('active');
        btn.style.border = '1.5px solid #7D2280';
        btn.style.background = '#FAF5FF';
        btn.style.color = '#7D2280';
        inlineSelectedAlign = btn.getAttribute('data-align') || 'center';
      });
    });

    // Confirm Insert Inline Image
    if (btnConfirmInsertInlineImage) {
      btnConfirmInsertInlineImage.addEventListener('click', async () => {
        const caption = inlineImgCaptionInput?.value.trim() || '';
        const isComputerTab = tabInlineImgComputer?.classList.contains('active');

        if (isComputerTab) {
          if (!inlineSelectedFile) {
            showToast('Harap pilih file gambar terlebih dahulu.', 'info');
            return;
          }
          closeInlineImageModal();
          restoreEditorSelection();
          await handleInlineImageFile(inlineSelectedFile, inlineSelectedAlign, caption);
        } else {
          const url = inlineImgUrlInput?.value.trim();
          if (!url) {
            showToast('Harap masukkan URL gambar.', 'info');
            return;
          }
          closeInlineImageModal();
          restoreEditorSelection();
          insertInlineImageToEditor(url, inlineSelectedAlign, caption);
          showToast('Gambar berhasil disisipkan!', 'success');
        }
      });
    }

    // Direct Drag-and-Drop and Paste directly into Visual Canvas
    if (articleVisualEditor) {
      articleVisualEditor.addEventListener('dragover', (e) => {
        e.preventDefault();
      });

      articleVisualEditor.addEventListener('drop', async (e) => {
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
          const file = e.dataTransfer.files[0];
          if (file.type.startsWith('image/')) {
            e.preventDefault();
            e.stopPropagation();
            await handleInlineImageFile(file, 'center', '');
          }
        }
      });

      articleVisualEditor.addEventListener('paste', async (e) => {
        const clipboardItems = e.clipboardData?.items;
        if (clipboardItems) {
          for (let i = 0; i < clipboardItems.length; i++) {
            if (clipboardItems[i].type.startsWith('image/')) {
              e.preventDefault();
              const file = clipboardItems[i].getAsFile();
              if (file) {
                await handleInlineImageFile(file, 'center', '');
                return;
              }
            }
          }
        }
      });
    }

    // Save as Draft Button
    if (btnSaveDraft) {
      btnSaveDraft.addEventListener('click', (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (articleStatusInput) articleStatusInput.value = 'Draf';
        if (articleStatusSelect) articleStatusSelect.value = 'Draf';
        handleArticleSubmit('Draf');
      });
    }

    // WordPress REST API Fetch & Import Buttons
    if (btnFetchWpApi) {
      btnFetchWpApi.addEventListener('click', fetchWordPressPosts);
    }
    if (btnImportAllWp) {
      btnImportAllWp.addEventListener('click', importAllWordPressPosts);
    }

    // Tabs Switcher (Forms Dashboard)
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        activeTab = targetTab;

        tabBtns.forEach(b => b.classList.remove('active'));
        tabPanels.forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        const targetPanel = document.getElementById(targetTab);
        if (targetPanel) targetPanel.classList.add('active');
      });
    });

    // Search & Filter Mitra
    if (searchMitra) searchMitra.addEventListener('input', renderTableMitra);
    if (filterStatusMitra) filterStatusMitra.addEventListener('change', renderTableMitra);

    // Search & Filter Relawan
    if (searchRelawan) searchRelawan.addEventListener('input', renderTableRelawan);
    if (filterStatusRelawan) filterStatusRelawan.addEventListener('change', renderTableRelawan);

    // Search & Filter Articles
    if (searchArticle) searchArticle.addEventListener('input', renderTableArticles);
    if (filterCategoryArticle) filterCategoryArticle.addEventListener('change', renderTableArticles);
    if (filterStatusArticle) filterStatusArticle.addEventListener('change', renderTableArticles);

    // Custom Category Management Listeners
    if (btnToggleNewCategory && newCategoryInputWrap) {
      btnToggleNewCategory.addEventListener('click', () => {
        const isHidden = newCategoryInputWrap.style.display === 'none';
        newCategoryInputWrap.style.display = isHidden ? 'block' : 'none';
        if (isHidden && newCategoryName) {
          newCategoryName.value = '';
          newCategoryName.focus();
        }
      });
    }

    if (btnCancelNewCategory && newCategoryInputWrap) {
      btnCancelNewCategory.addEventListener('click', () => {
        newCategoryInputWrap.style.display = 'none';
        if (newCategoryName) newCategoryName.value = '';
      });
    }

    const handleSaveNewCategory = () => {
      const name = (newCategoryName?.value || '').trim();
      if (!name) {
        showToast('Ketikkan nama kategori terlebih dahulu!', 'info');
        if (newCategoryName) newCategoryName.focus();
        return;
      }
      const added = registerCategory(name);
      if (added) {
        if (articleCategory) articleCategory.value = added.slug;
        showToast(`Kategori "${added.label}" berhasil ditambahkan!`, 'success');
      }
      if (newCategoryInputWrap) newCategoryInputWrap.style.display = 'none';
      if (newCategoryName) newCategoryName.value = '';
    };

    if (btnSaveNewCategory) {
      btnSaveNewCategory.addEventListener('click', handleSaveNewCategory);
    }
    if (newCategoryName) {
      newCategoryName.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleSaveNewCategory();
        }
      });
    }

    // Custom Category in WP Tab Listeners
    if (btnToggleNewWpCategory && newWpCategoryInputWrap) {
      btnToggleNewWpCategory.addEventListener('click', () => {
        const isHidden = newWpCategoryInputWrap.style.display === 'none';
        newWpCategoryInputWrap.style.display = isHidden ? 'block' : 'none';
        if (isHidden && newWpCategoryName) {
          newWpCategoryName.value = '';
          newWpCategoryName.focus();
        }
      });
    }

    if (btnCancelNewWpCategory && newWpCategoryInputWrap) {
      btnCancelNewWpCategory.addEventListener('click', () => {
        newWpCategoryInputWrap.style.display = 'none';
        if (newWpCategoryName) newWpCategoryName.value = '';
      });
    }

    const handleSaveNewWpCategory = () => {
      const name = (newWpCategoryName?.value || '').trim();
      if (!name) {
        showToast('Ketikkan nama kategori terlebih dahulu!', 'info');
        if (newWpCategoryName) newWpCategoryName.focus();
        return;
      }
      const added = registerCategory(name);
      if (added) {
        if (wpImportCategory) wpImportCategory.value = added.slug;
        if (articleCategory) articleCategory.value = added.slug;
        showToast(`Kategori "${added.label}" berhasil ditambahkan!`, 'success');
      }
      if (newWpCategoryInputWrap) newWpCategoryInputWrap.style.display = 'none';
      if (newWpCategoryName) newWpCategoryName.value = '';
    };

    if (btnSaveNewWpCategory) {
      btnSaveNewWpCategory.addEventListener('click', handleSaveNewWpCategory);
    }
    if (newWpCategoryName) {
      newWpCategoryName.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleSaveNewWpCategory();
        }
      });
    }

    if (wpImportCategory) {
      wpImportCategory.addEventListener('change', () => {
        const val = wpImportCategory.value;
        document.querySelectorAll('.wp-item-cat-select:not(:disabled)').forEach(sel => {
          if (val === '__auto__') {
            const idx = parseInt(sel.getAttribute('data-wp-idx'), 10);
            if (!isNaN(idx) && currentWpFetchedPosts[idx] && currentWpFetchedPosts[idx]._wpDetectedCategorySlug) {
              sel.value = currentWpFetchedPosts[idx]._wpDetectedCategorySlug;
            }
          } else {
            sel.value = val;
          }
        });
      });
    }

    // Article Form Submit & Open Modal
    if (btnOpenCreateArticleModal) {
      btnOpenCreateArticleModal.addEventListener('click', () => openCreateArticleModal('editor'));
    }

    if (btnSaveArticle) {
      btnSaveArticle.addEventListener('click', (e) => {
        e.preventDefault();
        const currentSel = articleStatusSelect ? articleStatusSelect.value : (articleStatusInput ? articleStatusInput.value : 'Terbit');
        if (articleStatusInput) articleStatusInput.value = currentSel;
        handleArticleSubmit(currentSel);
      });
    }

    if (articleForm) {
      // MENCEGAH TEKAN ENTER PADA INPUT APAPUN MENUTUP/MENERBITKAN EDITOR SECARA TIDAK SENGAJA
      articleForm.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
          e.preventDefault();
          if (e.target.id === 'articleCover') {
            const url = e.target.value.trim();
            if (url) {
              updateCoverPreview(url);
              triggerAutosave();
              showToast('URL foto diterapkan!', 'success');
            }
          }
        }
      });

      // Jangan pernah submit form secara native (semua submit dilakukan via tombol terbitkan/draf)
      articleForm.addEventListener('submit', (e) => {
        e.preventDefault();
      });
    }

    if (btnArticleModalClose) {
      btnArticleModalClose.addEventListener('click', closeArticleModal);
    }

    // Autosave & Yoast previews triggers on field inputs
    if (articleTitle) {
      articleTitle.addEventListener('input', () => {
        updateYoastPreviews();
        triggerAutosave();
      });
    }
    if (articleVisualEditor) {
      articleVisualEditor.addEventListener('input', () => {
        updateWpStats();
        updateYoastPreviews();
        triggerAutosave();
      });
    }
    if (articleCategory) {
      articleCategory.addEventListener('change', triggerAutosave);
    }
    if (articleAuthor) {
      articleAuthor.addEventListener('input', () => {
        updateYoastPreviews();
        triggerAutosave();
      });
    }
    if (articleExcerpt) {
      articleExcerpt.addEventListener('input', () => {
        updateYoastPreviews();
        triggerAutosave();
      });
    }

    // Yoast SEO Specific Listeners
    if (yoastFocusKeyphrase) {
      yoastFocusKeyphrase.addEventListener('input', () => {
        updateYoastPreviews();
        triggerAutosave();
      });
    }

    if (yoastSeoTitle) {
      yoastSeoTitle.addEventListener('input', () => {
        updateYoastPreviews();
        triggerAutosave();
      });
    }

    if (yoastSlug) {
      yoastSlug.addEventListener('input', () => {
        yoastSlug.dataset.custom = 'true';
        updateYoastPreviews();
        triggerAutosave();
      });
      yoastSlug.addEventListener('blur', () => {
        yoastSlug.value = slugifyText(yoastSlug.value);
        updateYoastPreviews();
      });
    }

    if (yoastMetaDesc) {
      yoastMetaDesc.addEventListener('input', () => {
        updateYoastPreviews();
        triggerAutosave();
      });
    }

    // Preview As Device Radio (Mobile vs Desktop)
    document.querySelectorAll('input[name="yoastPreviewDevice"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        if (googleSnippetCard) {
          googleSnippetCard.classList.remove('preview-mobile', 'preview-desktop');
          googleSnippetCard.classList.add(`preview-${e.target.value}`);
        }
      });
    });

    // Yoast Subtabs Switcher (SEO, Keterbacaan, Schema, Sosial)
    yoastTabDefs.forEach(def => {
      const btn = document.getElementById(def.btnId);
      if (btn) {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          switchYoastSubtab(def.subtab);
        });
      }
    });

    // Variable Chips in SEO Title (%title%, %page%, %sep%, %sitename%)
    document.querySelectorAll('.yoast-var-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const v = chip.getAttribute('data-var');
        if (yoastSeoTitle) {
          yoastSeoTitle.value = (yoastSeoTitle.value ? yoastSeoTitle.value + ' ' : '') + v;
          updateYoastPreviews();
          triggerAutosave();
          yoastSeoTitle.focus();
        }
      });
    });

    if (btnGenerateSeoTitle) {
      btnGenerateSeoTitle.addEventListener('click', () => {
        const rawTitle = articleTitle ? articleTitle.value.trim() : '';
        if (!rawTitle) {
          showToast('Tuliskan judul artikel terlebih dahulu!', 'info');
          articleTitle?.focus();
          return;
        }
        if (yoastSeoTitle) {
          yoastSeoTitle.value = `${rawTitle} - ACF Eduhub`;
          updateYoastPreviews();
          triggerAutosave();
          showToast('Judul SEO otomatis dibuat!', 'success');
        }
      });
    }

    if (btnInsertVarSeoTitle) {
      btnInsertVarSeoTitle.addEventListener('click', () => {
        if (yoastSeoTitle) {
          yoastSeoTitle.value = (yoastSeoTitle.value ? yoastSeoTitle.value + ' ' : '') + '%title% %sep% %sitename%';
          updateYoastPreviews();
          triggerAutosave();
          yoastSeoTitle.focus();
        }
      });
    }

    if (btnGenerateMetaDesc) {
      btnGenerateMetaDesc.addEventListener('click', () => {
        let desc = articleExcerpt ? articleExcerpt.value.trim() : '';
        if (!desc && articleVisualEditor) {
          desc = (articleVisualEditor.innerText || '').trim();
        }
        if (!desc) {
          showToast('Tuliskan naskah atau kutipan artikel terlebih dahulu!', 'info');
          return;
        }
        if (yoastMetaDesc) {
          yoastMetaDesc.value = desc.slice(0, 150).replace(/\s+/g, ' ').trim() + (desc.length > 150 ? '...' : '');
          updateYoastPreviews();
          triggerAutosave();
          showToast('Deskripsi meta otomatis dihasilkan!', 'success');
        }
      });
    }

    if (btnInsertVarMetaDesc) {
      btnInsertVarMetaDesc.addEventListener('click', () => {
        if (yoastMetaDesc) {
          yoastMetaDesc.value = (yoastMetaDesc.value ? yoastMetaDesc.value + ' ' : '') + '%excerpt%';
          updateYoastPreviews();
          triggerAutosave();
          yoastMetaDesc.focus();
        }
      });
    }

    // Related Keyphrase Generator
    if (btnGetRelatedKeyphrases) {
      btnGetRelatedKeyphrases.addEventListener('click', () => {
        const rawTitle = articleTitle ? articleTitle.value.trim() : '';
        const text = (articleVisualEditor ? articleVisualEditor.innerText : '') || '';
        
        const combined = `${rawTitle} ${text}`.replace(/[^\w\s]/g, ' ');
        const words = combined.split(/\s+/).filter(w => w.length > 3);
        const uniqueWords = [...new Set(words.map(w => w.toLowerCase()))];
        
        const suggestions = [];
        if (rawTitle) suggestions.push(rawTitle.split(' ').slice(0, 3).join(' '));
        if (uniqueWords[0] && uniqueWords[1]) suggestions.push(`${uniqueWords[0]} ${uniqueWords[1]}`);
        if (uniqueWords[2] && uniqueWords[3]) suggestions.push(`${uniqueWords[2]} ${uniqueWords[3]}`);
        suggestions.push('ACF Eduhub 2026');

        if (yoastRelatedChipsList && yoastRelatedChipsWrap) {
          yoastRelatedChipsList.innerHTML = '';
          suggestions.filter(Boolean).forEach(s => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'yoast-suggest-chip';
            btn.textContent = `+ ${s}`;
            btn.addEventListener('click', () => {
              if (yoastFocusKeyphrase) {
                yoastFocusKeyphrase.value = s;
                updateYoastPreviews();
                triggerAutosave();
                showToast(`Frasa kunci "${s}" diterapkan!`, 'success');
              }
            });
            yoastRelatedChipsList.appendChild(btn);
          });
          yoastRelatedChipsWrap.style.display = 'block';
        }
      });
    }

    // Sidebar SEO Tab Click Handler (Scroll to Yoast Accordion)
    if (tabGbSeo) {
      tabGbSeo.addEventListener('click', () => {
        document.querySelectorAll('.wp-gb-side-tab').forEach(t => t.classList.remove('active'));
        tabGbSeo.classList.add('active');
        document.querySelectorAll('.wp-gb-pane').forEach(p => p.classList.remove('active'));
        const paneGbPost = document.getElementById('paneGbPost');
        if (paneGbPost) {
          paneGbPost.classList.add('active');
          if (accYoastSeo) {
            accYoastSeo.open = true;
            accYoastSeo.scrollIntoView({ behavior: 'smooth', block: 'start' });
            accYoastSeo.style.outline = '2px solid #7D2280';
            setTimeout(() => { accYoastSeo.style.outline = ''; }, 1200);
          }
        }
      });
    }

    // Banner Pemulihan Draf
    if (btnDiscardRecoveredDraft) {
      btnDiscardRecoveredDraft.addEventListener('click', () => {
        clearActiveDraftSession();
        if (articleForm) articleForm.reset();
        if (articleVisualEditor) articleVisualEditor.innerHTML = '';
        if (articleContent) articleContent.value = '';
        updateCoverPreview('');
        updateWpStats();
        showToast('Draf dibuang. Anda dapat mulai menulis artikel baru.', 'info');
      });
    }

    if (btnKeepRecoveredDraft) {
      btnKeepRecoveredDraft.addEventListener('click', () => {
        if (wpDraftRecoveryBanner) wpDraftRecoveryBanner.style.display = 'none';
        showToast('Draf aktif dilanjutkan.', 'success');
      });
    }

    // Floating Inline Image Toolbar Listeners
    document.querySelectorAll('.btn-img-tool[data-align]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!activeSelectedFigure) return;
        const align = btn.getAttribute('data-align') || 'center';
        activeSelectedFigure.classList.remove('align-left', 'align-center', 'align-right');
        activeSelectedFigure.classList.add(`align-${align}`);
        selectInlineFigure(activeSelectedFigure);
        triggerAutosave();
      });
    });

    if (btnReplaceSelectedImg && replaceInlineImgFileInput) {
      btnReplaceSelectedImg.addEventListener('click', (e) => {
        e.stopPropagation();
        replaceInlineImgFileInput.click();
      });

      replaceInlineImgFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0] && activeSelectedFigure) {
          const file = e.target.files[0];
          const targetImg = activeSelectedFigure.querySelector('img');
          if (targetImg) {
            // Pratinjau lokal instan
            const reader = new FileReader();
            reader.onload = (revt) => {
              targetImg.src = revt.target.result;
              triggerAutosave();
              selectInlineFigure(activeSelectedFigure);
            };
            reader.readAsDataURL(file);

            showToast('Mengganti foto...', 'info');

            // Upload latar belakang
            if (window.ACF_API && window.ACF_API.articles) {
              window.ACF_API.articles.uploadImage(file).then(res => {
                if (res && res.url && targetImg) {
                  targetImg.src = res.url;
                  triggerAutosave();
                  showToast('Foto baru tersimpan di server!', 'success');
                }
              }).catch(err => {
                console.warn('Ganti foto backend error:', err);
              });
            }
          }
        }
        replaceInlineImgFileInput.value = '';
      });
    }

    if (btnDeleteSelectedImg) {
      btnDeleteSelectedImg.addEventListener('click', (e) => {
        e.stopPropagation();
        if (activeSelectedFigure) {
          activeSelectedFigure.remove();
          deselectInlineFigure();
          updateWpStats();
          triggerAutosave();
          showToast('Foto telah dihapus dari tulisan.', 'info');
        }
      });
    }

    // Canvas click to select inline figures
    if (articleVisualEditor) {
      articleVisualEditor.addEventListener('click', (e) => {
        const fig = e.target.closest('figure.wp-editor-figure');
        if (fig) {
          if (e.target.tagName !== 'FIGCAPTION') {
            e.stopPropagation();
          }
          selectInlineFigure(fig);
        } else {
          deselectInlineFigure();
        }
      });
    }

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.wp-content-canvas-wrap')) {
        deselectInlineFigure();
      }
    });

    // Peringatan sebelum menutup/merefresh jika sedang menulis artikel
    window.addEventListener('beforeunload', (e) => {
      if (articleModal && articleModal.classList.contains('show')) {
        const hasContent = (articleTitle?.value.trim() || '') || (articleVisualEditor?.innerText.trim() || '');
        if (hasContent) {
          saveDraftToStorage();
          e.preventDefault();
          e.returnValue = '';
          return '';
        }
      }
    });

    // Live Cover Image Preview
    if (articleCover) {
      articleCover.addEventListener('input', (e) => {
        updateCoverPreview(e.target.value.trim());
        triggerAutosave();
      });
    }

    // Quick Image Preset Pills
    document.querySelectorAll('.btn-quick-img').forEach(btn => {
      btn.addEventListener('click', () => {
        const imgUrl = btn.getAttribute('data-img');
        if (articleCover) {
          articleCover.value = imgUrl;
          updateCoverPreview(imgUrl);
        }
      });
    });

    // Category Manager Modal Openers & Closers
    if (btnManageCategories) {
      btnManageCategories.addEventListener('click', openCategoryModal);
    }
    if (cardArticleCategories) {
      cardArticleCategories.addEventListener('click', openCategoryModal);
    }
    if (btnToolbarManageCategories) {
      btnToolbarManageCategories.addEventListener('click', openCategoryModal);
    }
    if (btnEditorManageCategories) {
      btnEditorManageCategories.addEventListener('click', openCategoryModal);
    }
    if (btnCategoryModalClose) {
      btnCategoryModalClose.addEventListener('click', closeCategoryModal);
    }
    if (btnCategoryModalCloseFooter) {
      btnCategoryModalCloseFooter.addEventListener('click', closeCategoryModal);
    }
    if (categoryManagerModal) {
      categoryManagerModal.addEventListener('click', (e) => {
        if (e.target === categoryManagerModal) closeCategoryModal();
      });
    }
    if (formAddCategoryModal) {
      formAddCategoryModal.addEventListener('submit', (e) => {
        e.preventDefault();
        addNewCategoryFromModal(inputNewCatLabel?.value || '');
      });
    }

    // Delegated clicks for Edit / Delete Articles, Single WP Import, & View Forms Details
    document.addEventListener('click', (e) => {
      // 0. Delete Category Button
      const btnDelCat = e.target.closest('.btn-delete-cat');
      if (btnDelCat) {
        const slug = btnDelCat.getAttribute('data-slug');
        if (slug) deleteCategory(slug);
        return;
      }

      // 1. Single WP Import Button
      const btnImportSingle = e.target.closest('.btn-import-single-wp');
      if (btnImportSingle) {
        const wpIdx = parseInt(btnImportSingle.getAttribute('data-wp-idx'), 10);
        if (!isNaN(wpIdx) && currentWpFetchedPosts && currentWpFetchedPosts[wpIdx]) {
          const itemWrap = btnImportSingle.closest('.wp-fetch-item');
          const catSelect = itemWrap?.querySelector('.wp-item-cat-select');
          const chosenSlug = catSelect ? catSelect.value : (wpImportCategory?.value || 'artikel');
          const foundCat = dataCategories.find(c => c.slug === chosenSlug);
          const chosenLabel = foundCat ? foundCat.label : 'Artikel Pendidikan';

          importSingleWordPressPost(currentWpFetchedPosts[wpIdx], chosenSlug, chosenLabel);
          btnImportSingle.disabled = true;
          btnImportSingle.innerHTML = `<span>✓ Terimpor</span>`;
          btnImportSingle.style.background = '#10B981';
          if (catSelect) catSelect.disabled = true;
        }
        return;
      }

      // 1.5. Preview Article Button
      const btnPreview = e.target.closest('.btn-preview-article');
      if (btnPreview) {
        const id = btnPreview.getAttribute('data-id');
        if (id) openPreviewArticleModal(id);
        return;
      }

      // 2. Edit Article Button
      const btnEdit = e.target.closest('.btn-edit-article');
      if (btnEdit) {
        const id = btnEdit.getAttribute('data-id');
        if (id) openEditArticleModal(id);
        return;
      }

      // 3. Delete Article Button
      const btnDel = e.target.closest('.btn-delete-article');
      if (btnDel) {
        const id = btnDel.getAttribute('data-id');
        if (id) deleteArticle(id);
        return;
      }

      // 4. View Form Detail Button
      const btnView = e.target.closest('.btn-action-view:not(.btn-edit-article)');
      if (btnView) {
        const type = btnView.getAttribute('data-type');
        const id = btnView.getAttribute('data-id');
        if (type) openDetailModal(type, id);
        return;
      }
    });

    // Close Detail Modal
    if (btnModalClose) btnModalClose.addEventListener('click', closeDetailModal);
    if (btnModalCloseFooter) btnModalCloseFooter.addEventListener('click', closeDetailModal);
    if (detailModal) {
      detailModal.addEventListener('click', (e) => {
        if (e.target === detailModal) closeDetailModal();
      });
    }

    // Close & Actions for Article Preview Modal
    if (btnCloseArticlePreview) btnCloseArticlePreview.addEventListener('click', closePreviewArticleModal);
    if (btnCloseArticlePreviewFooter) btnCloseArticlePreviewFooter.addEventListener('click', closePreviewArticleModal);
    if (btnPreviewEditDirect) btnPreviewEditDirect.addEventListener('click', handlePreviewEditDirect);
    if (btnPreviewEditDirectFooter) btnPreviewEditDirectFooter.addEventListener('click', handlePreviewEditDirect);
    if (articlePreviewModal) {
      articlePreviewModal.addEventListener('click', (e) => {
        if (e.target === articlePreviewModal) closePreviewArticleModal();
      });
    }

    // Keyboard Shortcut (ESC to close preview modal & program modal)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        if (articlePreviewModal && articlePreviewModal.classList.contains('show')) {
          closePreviewArticleModal();
        }
        const pModal = document.getElementById('programModal');
        if (pModal && pModal.classList.contains('show')) {
          closeProgramModal();
        }
        const pPrevModal = document.getElementById('programPreviewModal');
        if (pPrevModal && pPrevModal.classList.contains('show')) {
          closeProgramPreviewModal();
        }
      }
    });

    // Export CSV
    if (btnExportCSV) {
      btnExportCSV.addEventListener('click', exportActiveTabToCSV);
    }

    // Sync Spreadsheet
    if (btnSyncSpreadsheet) {
      btnSyncSpreadsheet.addEventListener('click', syncFromSpreadsheet);
    }



    // Cegah browser berpindah halaman jika user melepaskan (drop) file gambar di luar area upload
    window.addEventListener('dragover', (e) => e.preventDefault());
    window.addEventListener('drop', (e) => e.preventDefault());

    // Jangan refresh data otomatis saat modal editor sedang terbuka agar tulisan admin tidak terganggu
    window.addEventListener('focus', () => {
      if (articleModal && articleModal.classList.contains('show')) {
        return;
      }
      loadAllData();
      renderAll();
    });
  }

})();
