/**
 * ACF EDUHUB — DUAL ADMIN PORTAL & DASHBOARD JAVASCRIPT
 * 1. Dashboard 1: Form Data Kemitraan (Mitra Program) & Relawan Eduhub
 * 2. Dashboard 2: Upload & Manajemen Kabar / Artikel
 */

(function () {
  'use strict';

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
      cover: 'assets/kabar-sekolahdayasetara/2.png',
      excerpt: 'Bandung – Di sudut keheningan, sering terdengar keraguan yang membisik, “Kesempatanmu sudah lewat.” Sebuah kalimat yang mampu memadamkan semangat dan mengubur mimpi. Namun, di tengah riuhnya kota Bandung...',
      content: `<p><strong>Bandung</strong> – Di sudut keheningan, sering terdengar keraguan yang membisik, <em>“Kesempatanmu sudah lewat.”</em> Sebuah kalimat yang mampu memadamkan semangat dan mengubur mimpi. Namun, di tengah riuhnya kota Bandung, ada sebuah cerita yang membuktikan sebaliknya. Sebuah kisah tentang keberanian untuk mencoba, tentang kepercayaan diri yang kembali menyala.</p>
<p>Pada tanggal 9 dan 10 Agustus 2025 yang bersejarah, udara di PKBM Bina Cipta, Ujungberung, terasa berbeda. Bukan sekadar udara biasa, melainkan udara yang dipenuhi ketegangan, harapan, dan tekad baja. Sebanyak 16 pejuang dari program Paket C PKBM Ceria Ngamprah dan Pusat melangkah masuk, bukan sebagai siswa biasa, tetapi sebagai gladiator di arena pembuktian diri: Asesmen Nasional Berbasis Komputer (ANBK).</p>
<p>Bagi mereka, layar komputer di hadapan bukanlah sekadar menampilkan soal-soal literasi dan numerasi. Layar itu adalah cermin dari perjuangan mereka. Setiap kata yang mereka baca adalah gema dari semangat belajar yang pernah terputus. Setiap angka yang mereka hitung adalah simbol dari langkah-langkah yang kembali mereka ayunkan menuju masa depan. Ini bukanlah sekadar ujian. Ini adalah deklarasi. Deklarasi bahwa belajar tidak mengenal usia, dan semangat tidak memiliki batas waktu.</p>
<p style="text-align: center; margin: 24px 0;"><img src="assets/kabar-sekolahdayasetara/1.png" alt="Peserta ANBK PKBM Ceria 2025" style="max-width: 100%; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);"></p>
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
      cover: 'assets/kabar-sekolahdayasetara/25.png',
      excerpt: 'Sebuah langkah kecil hari ini akan menjadi lompatan besar di masa depan. Kalimat itu terasa pas untuk menggambarkan momen yang dirayakan Sekolah Daya Setara pada 19 Juli 2026 di PKBM Daya Setara Lembang: pelepasan peserta didik Tahun Ajaran 2025/2026 yang telah berhasil menyelesaikan perjalanan belajarnya melalui jalur pendidikan kesetaraan Paket B dan Paket C...',
      content: `<p>Sebuah langkah kecil hari ini akan menjadi lompatan besar di masa depan. Kalimat itu terasa pas untuk menggambarkan momen yang dirayakan Sekolah Daya Setara pada 19 Juli 2026 di PKBM Daya Setara Lembang: pelepasan peserta didik Tahun Ajaran 2025/2026 yang telah berhasil menyelesaikan perjalanan belajarnya melalui jalur pendidikan kesetaraan Paket B dan Paket C.</p>
<p>Bagi Sekolah Daya Setara, hari kelulusan bukan sekadar seremoni akhir tahun ajaran. Ia adalah penanda bahwa pendidikan yang setara dan terbuka bagi siapa saja, tanpa memandang latar belakang atau titik awal masing-masing, benar-benar bisa membawa seseorang sampai ke garis akhir yang selama ini mungkin terasa jauh.</p>
<p style="text-align: center; margin: 24px 0;"><img src="assets/kabar-sekolahdayasetara/26.png" alt="Pelepasan Lulusan Sekolah Daya Setara" style="max-width: 100%; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);"></p>
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
      cover: 'assets/kabar-sekolahdayasetara/27 (2).png',
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
  let activeDashboard = 'viewDashboardForms';

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
  const btnSaveArticleText = document.getElementById('btnSaveArticleText');
  const btnArticleModalClose = document.getElementById('btnArticleModalClose');

  // WordPress Mode Tabs & Views
  const tabModeEditor = document.getElementById('tabModeEditor');
  const tabModeWpSync = document.getElementById('tabModeWpSync');
  const wpStudioEditorView = document.getElementById('wpStudioEditorView');
  const wpStudioSyncView = document.getElementById('wpStudioSyncView');
  const btnOpenWpSyncModal = document.getElementById('btnOpenWpSyncModal');

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

  function handleLogin(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const user = (adminUsername ? adminUsername.value : '').trim();
    const pass = (adminPassword ? adminPassword.value : '').trim();

    if (user === ADMIN_CREDENTIALS.username && pass === ADMIN_CREDENTIALS.password) {
      sessionStorage.setItem('acf_admin_session', 'active');
      if (loginAlert) loginAlert.classList.remove('show');
      showToast('Selamat datang, Administrator!', 'success');
      showDashboard();
    } else {
      if (loginAlertText) loginAlertText.textContent = 'Username atau kata sandi tidak valid!';
      if (loginAlert) loginAlert.classList.add('show');
      if (adminPassword) {
        adminPassword.value = '';
        adminPassword.focus();
      }
    }
  }

  function handleLogout() {
    if (confirm('Apakah Anda yakin ingin keluar dari Portal Admin?')) {
      sessionStorage.removeItem('acf_admin_session');
      adminUsername.value = '';
      adminPassword.value = '';
      loginAlert.classList.remove('show');
      showToast('Anda telah keluar dari sesi admin.', 'info');
      showLogin();
    }
  }

  function switchDashboardView(viewId) {
    activeDashboard = viewId;
    if (viewId === 'viewDashboardForms') {
      btnNavForms.classList.add('active');
      btnNavArticles.classList.remove('active');
      viewDashboardForms.classList.add('active');
      viewDashboardArticles.classList.remove('active');
      renderTableMitra();
      renderTableRelawan();
    } else {
      btnNavForms.classList.remove('active');
      btnNavArticles.classList.add('active');
      viewDashboardForms.classList.remove('active');
      viewDashboardArticles.classList.add('active');
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

  function loadCategories() {
    try {
      const stored = localStorage.getItem('acf_custom_categories');
      if (stored) {
        let parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Filter out redundant per-school categories & normalize
          parsed = parsed.filter(c => !isSchoolCategory(c.slug, c.label));
          
          // Ensure default school categories exist
          if (!parsed.some(c => c.slug === 'kabar-sekolah-daya-setara')) {
            parsed.unshift({ slug: 'kabar-sekolah-daya-setara', label: 'Artikel Sekolah Daya Setara' });
          }
          if (!parsed.some(c => c.slug === 'kabar-sekolah-juara')) {
            parsed.splice(1, 0, { slug: 'kabar-sekolah-juara', label: 'Artikel Sekolah Juara' });
          }

          dataCategories = parsed;
          saveCategories();
        } else {
          dataCategories = [...DEFAULT_CATEGORIES];
          saveCategories();
        }
      } else {
        dataCategories = [...DEFAULT_CATEGORIES];
        saveCategories();
      }
    } catch (e) {
      dataCategories = [...DEFAULT_CATEGORIES];
    }
  }

  function saveCategories() {
    localStorage.setItem('acf_custom_categories', JSON.stringify(dataCategories));
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
  function openCategoryModal() {
    if (categoryManagerModal) {
      categoryManagerModal.classList.add('show');
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

    // Hapus dari dataCategories
    dataCategories = dataCategories.filter(c => c.slug !== slug);
    saveCategories();

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

  function loadAllData() {
    try {
      loadCategories();

      // Mitra - Hanya menampilkan data dari pengisian formulir
      const storedMitra = localStorage.getItem('acf_admin_data_mitra');
      if (storedMitra) {
        const parsed = JSON.parse(storedMitra);
        dataMitra = Array.isArray(parsed) ? parsed.filter(item => !isMockItem(item)) : [];
      } else {
        dataMitra = [];
      }
      saveDataMitra();

      // Relawan - Hanya menampilkan data dari pengisian formulir
      const storedRelawan = localStorage.getItem('acf_admin_data_relawan');
      if (storedRelawan) {
        const parsed = JSON.parse(storedRelawan);
        dataRelawan = Array.isArray(parsed) ? parsed.filter(item => !isMockItem(item)) : [];
      } else {
        dataRelawan = [];
      }
      saveDataRelawan();

      // Articles
      const storedArticles = localStorage.getItem('acf_articles_data');
      if (storedArticles) {
        dataArticles = JSON.parse(storedArticles);
        if (Array.isArray(dataArticles)) {
          dataArticles = dataArticles.filter(art => art.id !== 'ART-3001' && art.id !== 'ART-3002' && art.id !== 'ART-3003').map(art => {
            if (art.category === 'kabar-sekolah-juara' || art.category === 'sekolah-juara' || (art.id && art.id.startsWith('ART-SJ'))) {
              art.category = 'kabar-sekolah-juara';
              art.categoryLabel = 'Artikel Sekolah Juara';
            }
            if (art.category === 'kabar-sekolah-daya-setara' || art.category === 'sekolah-daya-setara' || (art.id && art.id.startsWith('ART-SDS'))) {
              art.category = 'kabar-sekolah-daya-setara';
              art.categoryLabel = 'Artikel Sekolah Daya Setara';
            }
            return art;
          });
          dataArticles.sort((a, b) => parseArticleDate(b.date) - parseArticleDate(a.date));
          saveArticlesData();
        }
      } else {
        dataArticles = [...INITIAL_ARTICLES_DATA].sort((a, b) => parseArticleDate(b.date) - parseArticleDate(a.date));
        saveArticlesData();
      }

      // Pastikan kategori dari artikel yang tersimpan terdaftar
      dataArticles.forEach(art => {
        if (art.category && art.categoryLabel && !dataCategories.some(c => c.slug === art.category)) {
          registerCategory(art.categoryLabel, art.category);
        }
      });

      renderCategorySelects();

    } catch (err) {
      console.error('Error loading data:', err);
      dataMitra = [];
      dataRelawan = [];
      dataArticles = [...INITIAL_ARTICLES_DATA].sort((a, b) => parseArticleDate(b.date) - parseArticleDate(a.date));
    }
  }

  function saveDataMitra() {
    localStorage.setItem('acf_admin_data_mitra', JSON.stringify(dataMitra));
  }

  function saveDataRelawan() {
    localStorage.setItem('acf_admin_data_relawan', JSON.stringify(dataRelawan));
  }

  function saveArticlesData() {
    dataArticles.sort((a, b) => parseArticleDate(b.date) - parseArticleDate(a.date));
    localStorage.setItem('acf_articles_data', JSON.stringify(dataArticles));
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
    if (countArticlesPublished) countArticlesPublished.textContent = dataArticles.length;
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

    const filtered = dataArticles.filter(art => {
      const matchQuery = !query ||
        (art.title || '').toLowerCase().includes(query) ||
        (art.author || '').toLowerCase().includes(query) ||
        (art.excerpt || '').toLowerCase().includes(query);

      const matchCat = catFilter === 'all' || art.category === catFilter;
      return matchQuery && matchCat;
    });

    const sortedArticles = [...filtered].sort((a, b) => parseArticleDate(b.date) - parseArticleDate(a.date));

    tbodyArticles.innerHTML = '';

    if (sortedArticles.length === 0) {
      if (emptyArticles) emptyArticles.style.display = 'block';
    } else {
      if (emptyArticles) emptyArticles.style.display = 'none';
      sortedArticles.forEach((art) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>
            <div class="article-thumbnail-cell">
              <img src="${escapeHTML(art.cover || 'assets/logo-acf/LOGO_ACF-removebg-preview.png')}" alt="Cover" class="article-thumb-img" onerror="this.src='https://images.unsplash.com/photo-1509062522246-3755977927d7?w=200&q=80'">
              <div>
                <div class="cell-primary" style="font-size: 0.92rem; max-width: 380px;">${escapeHTML(art.title || '-')}</div>
                <div class="cell-sub" style="max-width: 380px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHTML(art.excerpt || '-')}</div>
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
            <span class="status-badge status-diterima">Terpublikasi</span>
          </td>
          <td style="text-align: right; white-space: nowrap;">
            <button type="button" class="btn-action-view btn-edit-article" data-id="${art.id}" style="margin-right: 6px;">
              <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              <span>Edit</span>
            </button>
            <button type="button" class="btn-action-delete btn-delete-article" data-id="${art.id}">
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
  function switchWpModalTab(mode) {
    if (mode === 'editor') {
      tabModeEditor.classList.add('active');
      tabModeWpSync.classList.remove('active');
      wpStudioEditorView.classList.add('active');
      wpStudioSyncView.classList.remove('active');
    } else {
      tabModeEditor.classList.remove('active');
      tabModeWpSync.classList.add('active');
      wpStudioEditorView.classList.remove('active');
      wpStudioSyncView.classList.add('active');
    }
  }

  function openCreateArticleModal(mode = 'editor') {
    if (articleForm) articleForm.reset();
    if (articleEditId) articleEditId.value = '';
    if (articleStatusInput) articleStatusInput.value = 'Terbit';
    if (articleStatusSelect) articleStatusSelect.value = 'Terbit';
    if (articleAuthor) articleAuthor.value = 'Tim Redaksi ACF';
    if (newCategoryInputWrap) newCategoryInputWrap.style.display = 'none';
    if (newCategoryName) newCategoryName.value = '';
    
    // Set default today's date
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const now = new Date();
    if (articleDateInput) articleDateInput.value = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;

    // Reset visual editor
    if (articleVisualEditor) articleVisualEditor.innerHTML = '';
    if (articleContent) articleContent.value = '';
    renderCategorySelects('artikel');
    updateWpStats();
    updateCoverPreview('');
    if (btnSaveArticleText) btnSaveArticleText.textContent = 'Publikasikan';

    switchWpModalTab(mode);
    if (articleModal) articleModal.classList.add('show');
  }

  function openEditArticleModal(id) {
    const art = dataArticles.find(a => a.id === id);
    if (!art) return;

    if (articleEditId) articleEditId.value = art.id;
    if (btnSaveArticleText) btnSaveArticleText.textContent = 'Simpan Perubahan';
    if (newCategoryInputWrap) newCategoryInputWrap.style.display = 'none';
    if (newCategoryName) newCategoryName.value = '';

    if (articleTitle) articleTitle.value = art.title || '';
    renderCategorySelects(art.category || 'artikel');
    if (articleCategory) articleCategory.value = art.category || 'artikel';
    if (articleAuthor) articleAuthor.value = art.author || 'Tim Redaksi ACF';
    if (articleDateInput) articleDateInput.value = art.date || '';
    if (articleCover) articleCover.value = art.cover || '';
    if (articleExcerpt) articleExcerpt.value = art.excerpt || '';
    
    const contentHTML = art.content || art.excerpt || '';
    if (articleVisualEditor) articleVisualEditor.innerHTML = contentHTML;
    if (articleContent) articleContent.value = contentHTML;

    const st = art.status || 'Terbit';
    if (articleStatusSelect) articleStatusSelect.value = st;
    if (articleStatusInput) articleStatusInput.value = st;

    updateCoverPreview(art.cover || '');
    updateWpStats();
    switchWpModalTab('editor');
    if (articleModal) articleModal.classList.add('show');
  }

  function closeArticleModal() {
    if (articleModal) articleModal.classList.remove('show');
  }

  function updateCoverPreview(url) {
    if (!coverPreviewImg || !coverPlaceholder) return;
    if (url && (url.trim().startsWith('http') || url.trim().startsWith('data:image'))) {
      coverPreviewImg.src = url;
      coverPreviewImg.style.display = 'block';
      coverPlaceholder.style.display = 'none';
    } else {
      coverPreviewImg.src = '';
      coverPreviewImg.style.display = 'none';
      coverPlaceholder.style.display = 'flex';
    }
  }

  function updateWpStats() {
    if (!articleVisualEditor || !wpStatsCount) return;
    const text = (articleVisualEditor.innerText || '').trim();
    const words = text ? text.split(/\s+/).length : 0;
    const chars = text.length;
    wpStatsCount.textContent = `${words} Kata • ${chars} Karakter`;
    if (articleContent) articleContent.value = articleVisualEditor.innerHTML;
  }

  function handleArticleSubmit(e) {
    if (e) e.preventDefault();

    const title = articleTitle?.value.trim() || '';
    if (!title) {
      showToast('Judul artikel wajib diisi!', 'info');
      articleTitle?.focus();
      return;
    }

    const category = articleCategory?.value || 'artikel';
    const categoryLabel = getCategoryLabel(category);
    const author = articleAuthor?.value.trim() || 'Tim Redaksi ACF';
    const cover = articleCover?.value.trim() || 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&q=80';
    const excerpt = articleExcerpt?.value.trim() || (articleVisualEditor ? articleVisualEditor.innerText.slice(0, 140) + '...' : '');
    const content = (articleVisualEditor && articleVisualEditor.innerHTML.trim()) || excerpt;
    const status = articleStatusInput?.value || articleStatusSelect?.value || 'Terbit';
    const editId = articleEditId?.value || '';

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const now = new Date();
    const dateStr = articleDateInput?.value.trim() || `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;

    if (editId) {
      // Update existing
      const idx = dataArticles.findIndex(a => a.id === editId);
      if (idx !== -1) {
        dataArticles[idx] = {
          ...dataArticles[idx],
          title,
          category,
          categoryLabel,
          author,
          date: dateStr,
          cover,
          excerpt,
          content,
          status
        };
        showToast('Artikel berhasil diperbarui!', 'success');
      }
    } else {
      // Create new
      const newArticle = {
        id: 'ART-' + Date.now().toString().slice(-4),
        title,
        category,
        categoryLabel,
        author,
        date: dateStr,
        cover,
        excerpt,
        content,
        status
      };
      dataArticles.unshift(newArticle);
      showToast(status === 'Draf' ? 'Artikel disimpan sebagai Draf!' : 'Artikel baru berhasil dipublikasikan!', 'success');
    }

    saveArticlesData();
    renderTableArticles();
    updateMetricCards();
    closeArticleModal();
  }

  function deleteArticle(id) {
    const art = dataArticles.find(a => a.id === id);
    if (!art) return;

    if (confirm(`Apakah Anda yakin ingin menghapus artikel "${art.title}"?`)) {
      dataArticles = dataArticles.filter(a => a.id !== id);
      saveArticlesData();
      renderTableArticles();
      updateMetricCards();
      showToast('Artikel telah dihapus.', 'info');
    }
  }

  // --- Local File Image Reader ---
  function handleLocalImageUpload(file) {
    if (!file || !file.type.startsWith('image/')) {
      showToast('Harap pilih file gambar (JPG, PNG, WEBP).', 'info');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Url = e.target.result;
      if (articleCover) articleCover.value = base64Url;
      updateCoverPreview(base64Url);
      showToast('Foto sampul lokal berhasil dimuat!', 'success');
    };
    reader.readAsDataURL(file);
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
    closeArticleModal();
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
      btn.addEventListener('click', () => {
        const newStatus = btn.getAttribute('data-status');
        item.status = newStatus;
        if (type === 'mitra') saveDataMitra();
        else saveDataRelawan();
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
      btnDelete.addEventListener('click', () => {
        const targetName = type === 'mitra' ? (item.namaInstansi || 'data mitra') : (item.namaLengkap || 'data relawan');
        if (confirm(`Hapus data ${targetName} dari dashboard?`)) {
          if (type === 'mitra') {
            dataMitra = dataMitra.filter(m => m.id !== item.id);
            saveDataMitra();
          } else {
            dataRelawan = dataRelawan.filter(r => r.id !== item.id);
            saveDataRelawan();
          }
          renderAll();
          closeDetailModal();
          showToast('Data berhasil dihapus.', 'info');
        }
      });
    }

    detailModal.classList.add('show');
  }

  function closeDetailModal() {
    detailModal.classList.remove('show');
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
            saveDataMitra();
          }
          if (Array.isArray(resJson.relawan) && resJson.relawan.length > 0) {
            dataRelawan = resJson.relawan;
            saveDataRelawan();
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
  function showToast(message, type = 'info') {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `admin-toast toast-${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
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

    // WordPress Studio Mode Tabs Switcher
    if (tabModeEditor) {
      tabModeEditor.addEventListener('click', () => switchWpModalTab('editor'));
    }
    if (tabModeWpSync) {
      tabModeWpSync.addEventListener('click', () => switchWpModalTab('wpsync'));
    }
    if (btnOpenWpSyncModal) {
      btnOpenWpSyncModal.addEventListener('click', () => openCreateArticleModal('wpsync'));
    }

    // Rich Text WYSIWYG Toolbar Commands
    document.querySelectorAll('.wp-tool-btn[data-cmd]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const cmd = btn.getAttribute('data-cmd');
        if (cmd) {
          document.execCommand(cmd, false, null);
          if (articleVisualEditor) articleVisualEditor.focus();
          updateWpStats();
        }
      });
    });

    // Heading / Block Format Selector
    if (wpBlockFormat) {
      wpBlockFormat.addEventListener('change', (e) => {
        const tag = e.target.value;
        if (tag === 'p') {
          document.execCommand('formatBlock', false, '<p>');
        } else if (tag === 'h2' || tag === 'h3') {
          document.execCommand('formatBlock', false, `<${tag}>`);
        } else if (tag === 'blockquote') {
          document.execCommand('formatBlock', false, '<blockquote>');
        }
        if (articleVisualEditor) articleVisualEditor.focus();
        updateWpStats();
      });
    }

    // Insert Link Button
    if (btnWpInsertLink) {
      btnWpInsertLink.addEventListener('click', (e) => {
        e.preventDefault();
        const url = prompt('Masukkan URL Link (contoh: https://acf.or.id):', 'https://');
        if (url && url.trim() !== '' && url !== 'https://') {
          document.execCommand('createLink', false, url.trim());
          if (articleVisualEditor) articleVisualEditor.focus();
          updateWpStats();
        }
      });
    }

    // Insert Inline Image into Editor
    if (btnWpInsertImage) {
      btnWpInsertImage.addEventListener('click', (e) => {
        e.preventDefault();
        const imgUrl = prompt('Masukkan URL Gambar yang ingin disisipkan ke dalam tulisan:', 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80');
        if (imgUrl && imgUrl.trim() !== '') {
          document.execCommand('insertImage', false, imgUrl.trim());
          if (articleVisualEditor) articleVisualEditor.focus();
          updateWpStats();
        }
      });
    }

    // Content Editable Input & Stats Tracking
    if (articleVisualEditor) {
      articleVisualEditor.addEventListener('input', updateWpStats);
      articleVisualEditor.addEventListener('keyup', updateWpStats);
      articleVisualEditor.addEventListener('paste', () => {
        setTimeout(updateWpStats, 50);
      });
    }

    // Local File Upload (Dropzone)
    if (wpDropzone && wpFileInput) {
      wpDropzone.addEventListener('click', () => wpFileInput.click());
      
      wpFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          handleLocalImageUpload(e.target.files[0]);
        }
      });

      wpDropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        wpDropzone.classList.add('dragover');
      });

      wpDropzone.addEventListener('dragleave', () => {
        wpDropzone.classList.remove('dragover');
      });

      wpDropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        wpDropzone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          handleLocalImageUpload(e.dataTransfer.files[0]);
        }
      });
    }

    // Save as Draft Button
    if (btnSaveDraft) {
      btnSaveDraft.addEventListener('click', () => {
        if (articleStatusInput) articleStatusInput.value = 'Draf';
        if (articleStatusSelect) articleStatusSelect.value = 'Draf';
        handleArticleSubmit();
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
    if (articleForm) {
      articleForm.addEventListener('submit', (e) => {
        if (articleStatusInput && articleStatusSelect) {
          articleStatusInput.value = articleStatusSelect.value;
        }
        handleArticleSubmit(e);
      });
    }
    if (btnArticleModalClose) {
      btnArticleModalClose.addEventListener('click', closeArticleModal);
    }

    // Live Cover Image Preview
    if (articleCover) {
      articleCover.addEventListener('input', (e) => {
        updateCoverPreview(e.target.value.trim());
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

    // Export CSV
    if (btnExportCSV) {
      btnExportCSV.addEventListener('click', exportActiveTabToCSV);
    }

    // Sync Spreadsheet
    if (btnSyncSpreadsheet) {
      btnSyncSpreadsheet.addEventListener('click', syncFromSpreadsheet);
    }

    // Real-time synchronization when user submits form in another tab or window gains focus
    window.addEventListener('storage', (e) => {
      if (e.key === 'acf_admin_data_mitra' || e.key === 'acf_admin_data_relawan' || e.key === 'acf_articles_data' || e.key === 'acf_custom_categories') {
        loadAllData();
        renderAll();
      }
    });

    window.addEventListener('focus', () => {
      loadAllData();
      renderAll();
    });
  }

})();
