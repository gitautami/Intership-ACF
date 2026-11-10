/**
 * ACF EDUHUB — Interactive PDF Flipbook Engine
 * Mengubah Dokumen PDF (Profil Lembaga ACF Eduhub & Dokumen Lainnya) menjadi Flipbook 3D interaktif.
 * Mendukung penempatan dinamis per halaman dan posisi sesuai pengaturan admin portal.
 */

(function () {
  'use strict';

  let PDF_FILE_PATH = '../assets/tentang/Profil Lembaga - ACF Eduhub.pdf';
  let activeFlipbookDoc = null;
  let flipBookInstance = null;
  let pdfDocInstance = null;
  let currentLoadedPdfPath = null;
  let isRendering = false;
  let totalDocPages = 0;
  const renderedPages = new Set();
  const renderingPromises = new Map();
  let hintTimeout = null;

  // Initialize when DOM ready
  document.addEventListener('DOMContentLoaded', async () => {
    // 1. Deteksi dan terapkan dokumen flipbook dinamis untuk halaman saat ini
    await initDynamicPageFlipbook();

    // 2. Hubungkan tombol pemicu & hash URL
    initTriggerButtons();
    initUrlHashCheck();

    // 3. Preload dokumen PDF di background agar saat dibuka buku langsung instan
    preloadPdfInBackground();

    // If we are on the standalone page (profil-lembaga.html), auto-load
    if (document.body.classList.contains('flipbook-standalone-body')) {
      initNavbarToggle();
      loadAndRenderFlipbook();
    }
  });

  /**
   * Helper: Dapatkan nama file halaman saat ini
   */
  function getCurrentPageName() {
    const path = window.location.pathname;
    let filename = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
    filename = filename.split('?')[0].split('#')[0];
    if (!filename || !filename.includes('.html')) {
      filename = 'index.html';
    }
    return filename.toLowerCase();
  }

  /**
   * Helper: Escape HTML string
   */
  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Helper: Normalisasi data dokumen flipbook agar seragam baik dari database maupun API
   * Mendukung semua dokumen PDF baru yang diupload oleh admin
   */
  function normalizeFlipbookDoc(doc) {
    if (!doc) return null;
    return {
      id: doc.id,
      title: doc.judul || doc.title || 'Dokumen Flipbook — ACF Eduhub',
      description: doc.deskripsi || doc.description || 'Dokumen Resmi Yayasan ACF Eduhub',
      file_url: doc.file_url || doc.fileUrl || PDF_FILE_PATH,
      file_name: doc.file_name || doc.fileName || 'Profil Lembaga - ACF Eduhub.pdf',
      total_pages: parseInt(doc.total_pages || doc.totalPages || 0, 10),
      target_page: (doc.target_halaman || doc.target_page || 'kisah-kami.html').toLowerCase(),
      position: doc.posisi || doc.position || 'bawah_deskripsi_sejarah',
      button_label: doc.button_label || doc.buttonLabel || 'Profil Lembaga ACF Eduhub',
      status: String(doc.status || 'aktif').toLowerCase()
    };
  }

  /**
   * Mengambil data flipbook aktif untuk halaman ini dari API
   */
  async function fetchActiveFlipbook(pageName) {
    if (window.ACF_API && window.ACF_API.flipbooks && typeof window.ACF_API.flipbooks.getByPage === 'function') {
      try {
        const doc = await window.ACF_API.flipbooks.getByPage(pageName);
        if (doc && doc.id) return normalizeFlipbookDoc(doc);
      } catch (e) {
        console.warn('API flipbook getByPage fallback:', e);
      }
    }

    try {
      const res = await fetch(`../BACKEND/api/flipbooks.php?page=${encodeURIComponent(pageName)}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.data) {
          return normalizeFlipbookDoc(data.data);
        }
      }
    } catch (e) {}

    // Fallback khusus untuk kisah-kami.html & profil-lembaga.html bila backend offline
    if (pageName === 'kisah-kami.html' || pageName === 'profil-lembaga.html') {
      return normalizeFlipbookDoc({
        id: 1,
        title: 'Profil Lembaga ACF Eduhub',
        description: 'Dokumen Resmi Profil & Portofolio Dampak Yayasan',
        file_name: 'Profil Lembaga - ACF Eduhub.pdf',
        file_url: '../assets/tentang/Profil Lembaga - ACF Eduhub.pdf',
        total_pages: 31,
        target_page: 'kisah-kami.html',
        position: 'bawah_deskripsi_sejarah',
        button_label: 'Profil Lembaga ACF Eduhub',
        status: 'aktif'
      });
    }

    return null;
  }

  /**
   * Memastikan pustaka eksternal (PDF.js, StPageFlip, flipbook.css) terpasang
   */
  async function ensureDependenciesLoaded() {
    const promises = [];

    // CSS
    if (!document.querySelector('link[href*="flipbook.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '../css/flipbook.css';
      document.head.appendChild(link);
    }

    // PDF.js
    if (typeof window.pdfjsLib === 'undefined') {
      promises.push(new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      }));
    }

    // StPageFlip
    if (typeof window.St === 'undefined' || typeof window.St.PageFlip === 'undefined') {
      promises.push(new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/page-flip/dist/js/page-flip.browser.js';
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      }));
    }

    if (promises.length > 0) {
      try {
        await Promise.all(promises);
      } catch (err) {
        console.warn('Gagal memuat pustaka Flipbook dinamis:', err);
      }
    }
  }

  /**
   * Preload PDF di background segera setelah halaman dimuat
   */
  async function preloadPdfInBackground() {
    try {
      await ensureDependenciesLoaded();
      if (typeof window.pdfjsLib !== 'undefined' && !pdfDocInstance) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        const doc = await window.pdfjsLib.getDocument(PDF_FILE_PATH).promise;
        pdfDocInstance = doc;
        totalDocPages = doc.numPages;
      }
    } catch (e) {
      // Preload background dapat diabaikan bila gagal
    }
  }

  /**
   * Memastikan elemen Modal Flipbook 3D ada di dalam dokumen DOM
   */
  function ensureFlipbookModalExists(doc) {
    let modal = document.getElementById('flipbookModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.className = 'flipbook-modal';
      modal.id = 'flipbookModal';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-labelledby', 'flipbookModalTitle');
      modal.innerHTML = `
        <!-- Floating Minimalist Close Button (Selalu tersedia saat navbar disembunyikan) -->
        <button type="button" class="flipbook-floating-close" id="btnFloatingClose" title="Tutup Flipbook" aria-label="Tutup Flipbook">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <!-- Hint Petunjuk Navigasi Otomatis Hilang -->
        <div class="flipbook-nav-hint" id="flipbookNavHint">Klik latar belakang untuk melihat / menyembunyikan menu</div>

        <!-- Top Header Bar (Floating Glassmorphism Overlay) -->
        <div class="flipbook-header">
          <div class="flipbook-header-left">
            <img src="../assets/logo-acf/logo-acf-white-text.png" alt="ACF Eduhub Logo" class="flipbook-logo-mini" onerror="this.style.display='none'">
            <div class="flipbook-title-group">
              <span class="flipbook-doc-title" id="flipbookModalTitle">${escapeHTML(doc.title || 'Profil Lembaga — ACF Eduhub')}</span>
              <span class="flipbook-doc-subtitle">${escapeHTML(doc.description || 'Dokumen Resmi Profil & Portofolio Dampak Yayasan')}</span>
            </div>
          </div>
          <div class="flipbook-header-right">
            <span class="flipbook-page-badge" id="flipbookPageBadge">Memuat...</span>
            <a href="${doc.file_url || PDF_FILE_PATH}" download="${escapeHTML(doc.file_name || 'Profil Lembaga - ACF Eduhub.pdf')}" class="flipbook-btn-tool btn-download-pdf" title="Unduh Dokumen PDF Resmi">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span>Unduh PDF</span>
            </a>
            <button type="button" class="flipbook-btn-tool" id="btnFlipbookFullscreen" title="Layar Penuh" aria-label="Layar Penuh">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
              </svg>
            </button>
            <button type="button" class="flipbook-btn-close" id="btnFlipbookClose" title="Tutup Flipbook" aria-label="Tutup Flipbook">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <!-- Main Stage Area -->
        <div class="flipbook-stage" id="flipbookStage">
          <!-- Circular Navigation Buttons -->
          <button type="button" class="flipbook-nav-btn nav-prev" id="btnNavPrev" aria-label="Halaman Sebelumnya" title="Halaman Sebelumnya">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <div class="flipbook-viewport" id="flipbookViewport">
            <div class="flipbook-container" id="flipbookBook"></div>
          </div>
          <button type="button" class="flipbook-nav-btn nav-next" id="btnNavNext" aria-label="Halaman Selanjutnya" title="Halaman Selanjutnya">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>

        <!-- Bottom Controls Bar (Floating Glassmorphism Overlay) -->
        <div class="flipbook-bottom-bar">
          <button type="button" class="flipbook-btn-mini" id="btnNavFirst" title="Ke Halaman Pertama" aria-label="Halaman Pertama">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="11 17 6 12 11 7"></polyline>
              <polyline points="18 17 13 12 18 7"></polyline>
            </svg>
          </button>
          <div class="flipbook-range-wrap">
            <input type="range" class="flipbook-range-slider" id="flipbookRange" min="1" max="31" value="1" title="Geser Halaman">
          </div>
          <button type="button" class="flipbook-btn-mini" id="btnNavLast" title="Ke Halaman Terakhir" aria-label="Halaman Terakhir">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="13 17 18 12 13 7"></polyline>
              <polyline points="6 17 11 12 6 7"></polyline>
            </svg>
          </button>
        </div>
      `;
      document.body.appendChild(modal);
    } else {
      // Perbarui judul & unduhan pada modal yang sudah ada
      const titleEl = modal.querySelector('.flipbook-doc-title');
      const subtitleEl = modal.querySelector('.flipbook-doc-subtitle');
      const downloadLink = modal.querySelector('.btn-download-pdf');
      const logoEl = modal.querySelector('.flipbook-logo-mini');
      if (titleEl && doc.title) titleEl.textContent = doc.title;
      if (subtitleEl && doc.description) subtitleEl.textContent = doc.description;
      if (downloadLink && doc.file_url) {
        downloadLink.href = doc.file_url;
        if (doc.file_name) downloadLink.download = doc.file_name;
      }
      if (logoEl) {
        logoEl.src = '../assets/logo-acf/logo-acf-white-text.png';
      }

      // Pastikan floating close & nav hint ada
      if (!modal.querySelector('#btnFloatingClose')) {
        const floatBtn = document.createElement('button');
        floatBtn.type = 'button';
        floatBtn.className = 'flipbook-floating-close';
        floatBtn.id = 'btnFloatingClose';
        floatBtn.title = 'Tutup Flipbook';
        floatBtn.setAttribute('aria-label', 'Tutup Flipbook');
        floatBtn.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        `;
        modal.appendChild(floatBtn);
      }

      if (!modal.querySelector('#flipbookNavHint')) {
        const hintEl = document.createElement('div');
        hintEl.className = 'flipbook-nav-hint';
        hintEl.id = 'flipbookNavHint';
        hintEl.textContent = 'Klik latar belakang untuk melihat / menyembunyikan menu';
        modal.appendChild(hintEl);
      }
    }

    return modal;
  }

  /**
   * Menempatkan tombol trigger flipbook di halaman sesuai opsi penempatan
   */
  function applyFlipbookPlacement(doc) {
    if (!doc || doc.status !== 'aktif') {
      const existingWrap = document.getElementById('wrapProfilLembagaBtn');
      if (existingWrap) existingWrap.style.display = 'none';
      return;
    }

    let btnWrap = document.getElementById('wrapProfilLembagaBtn');
    const currentPage = getCurrentPageName();
    const position = doc.position || 'bawah_deskripsi_sejarah';
    const buttonText = doc.button_label || 'Profil Lembaga ACF Eduhub';

    if (!btnWrap) {
      btnWrap = document.createElement('div');
      btnWrap.id = 'wrapProfilLembagaBtn';
      btnWrap.className = 'profil-lembaga-btn-wrap';
      btnWrap.innerHTML = `
        <a href="#profil-lembaga" class="btn-profil-lembaga" id="btnProfilLembaga" title="Buka Dokumen Flipbook 3D" data-open-flipbook="profil-lembaga">
          <span class="btn-profil-icon-book">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              <line x1="12" y1="6" x2="16" y2="6"></line>
              <line x1="12" y1="10" x2="16" y2="10"></line>
            </svg>
          </span>
          <span class="btn-profil-text">${escapeHTML(buttonText)}</span>
          <span class="btn-profil-icon-arrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </span>
        </a>
      `;
    } else {
      btnWrap.style.display = '';
      const textEl = btnWrap.querySelector('.btn-profil-text');
      if (textEl) textEl.textContent = buttonText;
    }

    // Tentukan penempatan DOM
    if (position === 'bawah_hero') {
      btnWrap.style.textAlign = 'center';
      btnWrap.style.margin = '28px auto';
      btnWrap.style.display = 'flex';
      btnWrap.style.justifyContent = 'center';

      const hero = document.querySelector('.hero, .hero-section, .page-hero, .section-hero, [class*="hero"]');
      if (hero && hero.parentNode) {
        hero.parentNode.insertBefore(btnWrap, hero.nextSibling);
      } else {
        const main = document.querySelector('main') || document.body;
        main.insertBefore(btnWrap, main.firstChild);
      }
    } else if (position === 'tengah_konten') {
      btnWrap.style.textAlign = 'center';
      btnWrap.style.margin = '36px auto';
      btnWrap.style.display = 'flex';
      btnWrap.style.justifyContent = 'center';

      const sections = document.querySelectorAll('main > section, .main-content > section, section');
      if (sections.length >= 2) {
        const midIndex = Math.floor(sections.length / 2);
        sections[midIndex].parentNode.insertBefore(btnWrap, sections[midIndex].nextSibling);
      } else {
        const main = document.querySelector('main') || document.body;
        main.appendChild(btnWrap);
      }
    } else if (position === 'atas_footer') {
      btnWrap.style.textAlign = 'center';
      btnWrap.style.margin = '40px auto 20px auto';
      btnWrap.style.display = 'flex';
      btnWrap.style.justifyContent = 'center';

      const footer = document.querySelector('footer, .site-footer, .main-footer');
      if (footer && footer.parentNode) {
        footer.parentNode.insertBefore(btnWrap, footer);
      } else {
        document.body.appendChild(btnWrap);
      }
    } else if (position === 'bawah_deskripsi_sejarah') {
      if (currentPage === 'kisah-kami.html') {
        const deskripsi = document.querySelector('#sejarahSingkatDeskripsi, .sejarah-text');
        if (deskripsi && deskripsi.parentNode) {
          btnWrap.style.margin = '26px 0 0 0';
          btnWrap.style.display = 'block';
          btnWrap.style.textAlign = 'left';
          deskripsi.parentNode.insertBefore(btnWrap, deskripsi.nextSibling);
          return;
        }
      }
      btnWrap.style.textAlign = 'center';
      btnWrap.style.margin = '28px auto';
      btnWrap.style.display = 'flex';
      btnWrap.style.justifyContent = 'center';
      const firstSection = document.querySelector('main > section, section');
      if (firstSection && firstSection.parentNode) {
        firstSection.parentNode.insertBefore(btnWrap, firstSection.nextSibling);
      }
    } else {
      // Posisi KUSTOM (dari opsi "Lainnya")
      let targetEl = null;
      try {
        targetEl = document.querySelector(position);
      } catch (e) {}
      if (!targetEl) targetEl = document.getElementById(position);
      if (!targetEl) {
        try { targetEl = document.querySelector(`.${position}`); } catch (e) {}
      }
      if (!targetEl) {
        try { targetEl = document.querySelector(`[id*="${position}"]`) || document.querySelector(`[class*="${position}"]`); } catch (e) {}
      }

      if (targetEl && targetEl.parentNode) {
        btnWrap.style.textAlign = 'center';
        btnWrap.style.margin = '28px auto';
        btnWrap.style.display = 'flex';
        btnWrap.style.justifyContent = 'center';
        targetEl.parentNode.insertBefore(btnWrap, targetEl.nextSibling);
      } else {
        btnWrap.style.textAlign = 'center';
        btnWrap.style.margin = '28px auto';
        btnWrap.style.display = 'flex';
        btnWrap.style.justifyContent = 'center';
        const fallbackSection = document.querySelector('.hero, .hero-section, main > section, section');
        if (fallbackSection && fallbackSection.parentNode) {
          fallbackSection.parentNode.insertBefore(btnWrap, fallbackSection.nextSibling);
        } else {
          const main = document.querySelector('main') || document.body;
          main.appendChild(btnWrap);
        }
      }
    }
  }

  /**
   * Inisialisasi flipbook dinamis berdasarkan halaman saat ini
   */
  async function initDynamicPageFlipbook() {
    const pageName = getCurrentPageName();
    const doc = await fetchActiveFlipbook(pageName);

    if (doc && doc.status === 'aktif') {
      activeFlipbookDoc = doc;
      if (doc.file_url) {
        PDF_FILE_PATH = doc.file_url;
      }
      ensureFlipbookModalExists(doc);
      applyFlipbookPlacement(doc);
    } else {
      if (pageName !== 'kisah-kami.html') {
        const existingWrap = document.getElementById('wrapProfilLembagaBtn');
        if (existingWrap) existingWrap.style.display = 'none';
      }
    }
  }

  /**
   * 1. Hubungkan tombol pemicu "Profil Lembaga ACF Eduhub" di halaman publik
   */
  function initTriggerButtons() {
    const triggerBtns = document.querySelectorAll('.btn-profil-lembaga, [data-open-flipbook="profil-lembaga"]');
    triggerBtns.forEach((btn) => {
      if (btn.getAttribute('data-flipbook-bound') === 'true') return;
      btn.setAttribute('data-flipbook-bound', 'true');

      btn.addEventListener('click', (e) => {
        const modal = document.getElementById('flipbookModal');
        if (modal) {
          e.preventDefault();
          openFlipbookModal();
        }
      });
    });

    // Tombol close modal di header
    const closeBtn = document.getElementById('btnFlipbookClose');
    if (closeBtn && !closeBtn.getAttribute('data-flipbook-bound')) {
      closeBtn.setAttribute('data-flipbook-bound', 'true');
      closeBtn.addEventListener('click', closeFlipbookModal);
    }

    // Tombol floating close (minimalist close)
    const floatClose = document.getElementById('btnFloatingClose');
    if (floatClose && !floatClose.getAttribute('data-flipbook-bound')) {
      floatClose.setAttribute('data-flipbook-bound', 'true');
      floatClose.addEventListener('click', (e) => {
        e.stopPropagation();
        closeFlipbookModal();
      });
    }

    // Keyboard shortcut (Escape, ArrowLeft, ArrowRight)
    if (!window.__acfFlipbookKeyboardBound) {
      window.__acfFlipbookKeyboardBound = true;
      document.addEventListener('keydown', (e) => {
        const m = document.getElementById('flipbookModal');
        const isModalActive = m && m.classList.contains('active');
        const isStandalone = document.body.classList.contains('flipbook-standalone-body');

        if (!isModalActive && !isStandalone) return;

        if (e.key === 'Escape' && isModalActive) {
          closeFlipbookModal();
        } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
          flipNext();
        } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
          flipPrev();
        }
      });
    }
  }

  /**
   * Hubungkan toggle klik untuk Navbar atas & bawah (Gambar 2: transparan / bisa dihilangkan saat diklik baru muncul)
   */
  function initNavbarToggle() {
    const stage = document.getElementById('flipbookStage') || document.querySelector('.flipbook-stage');

    if (stage && !stage.getAttribute('data-nav-toggle-bound')) {
      stage.setAttribute('data-nav-toggle-bound', 'true');
      stage.addEventListener('click', (e) => {
        // Abaikan klik pada navbar header, bottom bar, tombol panah bulat, tombol close, dan kontrol
        if (e.target.closest('.flipbook-header, .flipbook-bottom-bar, .flipbook-nav-btn, .flipbook-floating-close, a, button, input')) {
          return;
        }
        // Abaikan klik pada lembaran buku (karena lembaran buku memicu efek balik halaman PageFlip)
        if (e.target.closest('.page-sheet')) {
          return;
        }
        toggleNavbars();
      });
    }

    const floatClose = document.getElementById('btnFloatingClose');
    if (floatClose && !floatClose.getAttribute('data-flipbook-bound')) {
      floatClose.setAttribute('data-flipbook-bound', 'true');
      floatClose.addEventListener('click', (e) => {
        e.stopPropagation();
        closeFlipbookModal();
      });
    }
  }

  function toggleNavbars() {
    const modal = document.getElementById('flipbookModal');
    if (modal) {
      modal.classList.toggle('navbars-visible');
    }
    if (document.body.classList.contains('flipbook-standalone-body')) {
      document.body.classList.toggle('navbars-visible');
    }
    const hint = document.querySelector('.flipbook-nav-hint');
    if (hint) {
      hint.classList.remove('show');
    }
  }

  /**
   * 2. Buka Modal Flipbook
   */
  async function openFlipbookModal() {
    await ensureDependenciesLoaded();

    if (activeFlipbookDoc) {
      ensureFlipbookModalExists(activeFlipbookDoc);
    }

    const modal = document.getElementById('flipbookModal');
    if (!modal) return;

    modal.classList.add('active');
    // Mode transparan/tersembunyi secara default (Gambar 2)
    modal.classList.remove('navbars-visible');
    document.body.style.overflow = 'hidden';

    // Tampilkan hint petunjuk sebentar lalu hilangkan otomatis
    const hint = modal.querySelector('.flipbook-nav-hint');
    if (hint) {
      hint.classList.add('show');
      clearTimeout(hintTimeout);
      hintTimeout = setTimeout(() => {
        hint.classList.remove('show');
      }, 2500);
    }

    // Update history state
    if (window.history && window.history.replaceState) {
      try {
        const url = new URL(window.location.href);
        url.hash = 'profil-lembaga';
        window.history.replaceState({ modal: 'profil-lembaga' }, '', url.toString());
      } catch (err) {}
    }

    // Hubungkan kontrol tombol & toggle navbar
    initTriggerButtons();
    initNavbarToggle();

    // Jika path file PDF berbeda dari yang sedang dimuat (misal admin baru upload PDF baru)
    if (flipBookInstance && currentLoadedPdfPath !== PDF_FILE_PATH) {
      try { flipBookInstance.destroy(); } catch (e) {}
      flipBookInstance = null;
      pdfDocInstance = null;
      renderedPages.clear();
      renderingPromises.clear();
    }

    // Muat flipbook secara instan tanpa loading screen
    if (!flipBookInstance) {
      loadAndRenderFlipbook();
    }
  }

  /**
   * 3. Tutup Modal Flipbook
   */
  function closeFlipbookModal() {
    const modal = document.getElementById('flipbookModal');
    if (!modal) return;

    modal.classList.remove('active');
    modal.classList.remove('navbars-visible');
    document.body.style.overflow = '';

    // Bersihkan hash di URL
    if (window.history && window.history.replaceState) {
      try {
        const url = new URL(window.location.href);
        if (url.hash === '#profil-lembaga') {
          url.hash = '';
          window.history.replaceState(null, '', url.pathname + url.search);
        }
      } catch (err) {}
    }
  }

  /**
   * 4. Cek apakah ada hash #profil-lembaga saat halaman dibuka
   */
  function initUrlHashCheck() {
    if (window.location.hash === '#profil-lembaga') {
      setTimeout(openFlipbookModal, 180);
    }
  }

  /**
   * 5. Muat PDF dan Render secara Progresif Cepat (Instan tanpa Loading Screen)
   */
  async function loadAndRenderFlipbook() {
    if (isRendering) return;
    isRendering = true;

    await ensureDependenciesLoaded();

    const bookContainer = document.getElementById('flipbookBook');

    if (typeof window.pdfjsLib === 'undefined') {
      console.warn('PDF.js belum termuat, mencoba memuat fallback iframe.');
      renderIframeFallback();
      isRendering = false;
      return;
    }

    try {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

      // Load PDF Document jika belum di-preload
      if (!pdfDocInstance) {
        const loadingTask = window.pdfjsLib.getDocument(PDF_FILE_PATH);
        pdfDocInstance = await loadingTask.promise;
      }
      totalDocPages = pdfDocInstance.numPages;
      currentLoadedPdfPath = PDF_FILE_PATH;

      if (bookContainer) bookContainer.innerHTML = '';

      // Tentukan dimensi render halaman berdasarkan lebar viewport
      const isMobile = window.innerWidth <= 768;
      const baseWidth = isMobile ? Math.min(window.innerWidth - 32, 450) : 550;
      const baseHeight = Math.round(baseWidth * 1.414);

      // Buat container lembaran (sheet) untuk setiap halaman
      for (let pageNum = 1; pageNum <= totalDocPages; pageNum++) {
        const sheet = document.createElement('div');
        sheet.className = 'page-sheet';
        if (pageNum === 1 || pageNum === totalDocPages) {
          sheet.setAttribute('data-density', 'hard');
        } else {
          sheet.setAttribute('data-density', 'soft');
        }

        const canvas = document.createElement('canvas');
        canvas.id = `flip_canvas_${pageNum}`;
        sheet.appendChild(canvas);

        if (pageNum !== 1 && pageNum !== totalDocPages) {
          const pageNumBadge = document.createElement('div');
          pageNumBadge.className = `page-sheet-num ${pageNum % 2 === 0 ? 'left' : 'right'}`;
          pageNumBadge.textContent = pageNum;
          sheet.appendChild(pageNumBadge);
        }

        if (bookContainer) bookContainer.appendChild(sheet);
      }

      // Render 3 HALAMAN PERTAMA DULU secara instan (< 150ms)
      const initialPages = Math.min(3, totalDocPages);
      for (let p = 1; p <= initialPages; p++) {
        await renderSinglePdfPage(p, 1.35);
      }

      // LANGSUNG Inisialisasi StPageFlip agar buku segera tampil di hadapan user tanpa menunggu 31 halaman!
      initStPageFlip(bookContainer, baseWidth, baseHeight);

      // Lanjutkan render sisa halaman di background secara asinkron tanpa memblokir
      renderRemainingPagesInBackground();

    } catch (err) {
      console.error('Gagal merender Flipbook PDF:', err);
      renderIframeFallback();
    } finally {
      isRendering = false;
    }
  }

  /**
   * 6. Render satu halaman PDF ke canvas secara cached & aman dari duplikasi
   */
  async function renderSinglePdfPage(pageNum, scale = 1.35) {
    if (!pdfDocInstance) return;
    if (renderedPages.has(pageNum)) return;
    if (renderingPromises.has(pageNum)) {
      return renderingPromises.get(pageNum);
    }

    const promise = (async () => {
      try {
        const page = await pdfDocInstance.getPage(pageNum);
        const viewport = page.getViewport({ scale });
        const canvas = document.getElementById(`flip_canvas_${pageNum}`);
        if (!canvas) return;

        const context = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;

        renderedPages.add(pageNum);
      } catch (err) {
        console.warn(`Gagal render lembar ${pageNum}:`, err);
      } finally {
        renderingPromises.delete(pageNum);
      }
    })();

    renderingPromises.set(pageNum, promise);
    return promise;
  }

  /**
   * Render sisa halaman di background
   */
  async function renderRemainingPagesInBackground() {
    for (let pageNum = 4; pageNum <= totalDocPages; pageNum++) {
      if (!renderedPages.has(pageNum)) {
        await renderSinglePdfPage(pageNum, 1.35);
        await new Promise(r => setTimeout(r, 20)); // Beri ruang bernapas untuk render UI
      }
    }
  }

  /**
   * Pastikan halaman sekitar target sudah ter-render saat user membalik halaman
   */
  async function ensureNearbyPages(pageIndex) {
    const pageNum = pageIndex + 1;
    const targetPages = [
      pageNum,
      pageNum + 1,
      pageNum + 2,
      pageNum + 3,
      pageNum - 1,
      pageNum - 2
    ].filter(p => p >= 1 && p <= totalDocPages && !renderedPages.has(p));

    for (const p of targetPages) {
      await renderSinglePdfPage(p, 1.35);
    }
  }

  /**
   * 7. Inisialisasi Perpustakaan StPageFlip (Efek 3D Lembaran Berputar)
   */
  function initStPageFlip(container, width, height) {
    if (typeof window.St === 'undefined' || typeof window.St.PageFlip === 'undefined') {
      console.warn('St.PageFlip tidak ditemukan, mengaktifkan mode navigasi standar.');
      return;
    }

    const isMobile = window.innerWidth <= 768;

    flipBookInstance = new window.St.PageFlip(container, {
      width: width,
      height: height,
      size: 'stretch',
      minWidth: 280,
      maxWidth: 900,
      minHeight: 400,
      maxHeight: 1200,
      maxShadowOpacity: 0.6,
      showCover: true,
      mobileScrollSupport: false,
      usePortrait: isMobile,
      flippingTime: 700,
      drawShadow: true,
      autoSize: true
    });

    const sheets = container.querySelectorAll('.page-sheet');
    flipBookInstance.loadFromHTML(sheets);

    // Hubungkan kontrol navigasi
    initFlipControls();

    // Event saat halaman berganti
    flipBookInstance.on('flip', (e) => {
      updateNavButtonsState(e.data);
      ensureNearbyPages(e.data);
    });

    flipBookInstance.on('changeState', () => {
      if (flipBookInstance) {
        try {
          const cur = flipBookInstance.getCurrentPageIndex();
          updateCoverCentering(cur);
          ensureNearbyPages(cur);
        } catch (err) {}
      }
    });

    // Update state awal
    updateNavButtonsState(0);
  }

  /**
   * 8. Kontrol Navigasi (Tombol Panah Bulat, Slider, Fullscreen)
   */
  function initFlipControls() {
    const prevBtn = document.getElementById('btnNavPrev');
    const nextBtn = document.getElementById('btnNavNext');
    const firstBtn = document.getElementById('btnNavFirst');
    const lastBtn = document.getElementById('btnNavLast');
    const rangeSlider = document.getElementById('flipbookRange');
    const fullscreenBtn = document.getElementById('btnFlipbookFullscreen');

    if (prevBtn && !prevBtn.getAttribute('data-flipbook-bound')) {
      prevBtn.setAttribute('data-flipbook-bound', 'true');
      prevBtn.addEventListener('click', flipPrev);
    }
    if (nextBtn && !nextBtn.getAttribute('data-flipbook-bound')) {
      nextBtn.setAttribute('data-flipbook-bound', 'true');
      nextBtn.addEventListener('click', flipNext);
    }
    if (firstBtn && !firstBtn.getAttribute('data-flipbook-bound')) {
      firstBtn.setAttribute('data-flipbook-bound', 'true');
      firstBtn.addEventListener('click', () => {
        if (flipBookInstance) flipBookInstance.flip(0);
      });
    }
    if (lastBtn && !lastBtn.getAttribute('data-flipbook-bound')) {
      lastBtn.setAttribute('data-flipbook-bound', 'true');
      lastBtn.addEventListener('click', () => {
        if (flipBookInstance && totalDocPages > 0) {
          ensureNearbyPages(totalDocPages - 1);
          flipBookInstance.flip(totalDocPages - 1);
        }
      });
    }

    if (rangeSlider && !rangeSlider.getAttribute('data-flipbook-bound')) {
      rangeSlider.setAttribute('data-flipbook-bound', 'true');
      rangeSlider.max = totalDocPages;
      rangeSlider.addEventListener('input', (e) => {
        const targetPage = parseInt(e.target.value, 10);
        if (flipBookInstance && !isNaN(targetPage)) {
          const targetIndex = Math.max(0, targetPage - 1);
          ensureNearbyPages(targetIndex);
          flipBookInstance.flip(targetIndex);
        }
      });
    }

    if (fullscreenBtn && !fullscreenBtn.getAttribute('data-flipbook-bound')) {
      fullscreenBtn.setAttribute('data-flipbook-bound', 'true');
      fullscreenBtn.addEventListener('click', toggleFullscreen);
    }
  }

  function flipPrev() {
    if (flipBookInstance) {
      flipBookInstance.flipPrev();
    }
  }

  function flipNext() {
    if (flipBookInstance) {
      flipBookInstance.flipNext();
    }
  }

  /**
   * Menyesuaikan posisi cover (1 halaman tunggal di tengah) vs saat buku dibuka (2 halaman spread)
   */
  function updateCoverCentering(pageIndex) {
    const isMobile = window.innerWidth <= 768;
    const container = document.getElementById('flipbookBook');
    if (!container) return;

    if (isMobile) {
      container.style.transform = 'translateX(0)';
      return;
    }

    const total = totalDocPages || 31;
    if (pageIndex === 0) {
      // 1 halaman cover saja di tengah
      container.style.transform = 'translateX(-25%)';
    } else if (pageIndex >= total - 1) {
      // 1 halaman cover belakang di tengah
      container.style.transform = 'translateX(25%)';
    } else {
      // Ketika cover dibuka, langsung 2 halaman seperti buku terbuka
      container.style.transform = 'translateX(0)';
    }
  }

  /**
   * 9. Perbarui Teks Indikator Halaman & Kondisi Tombol
   */
  function updateNavButtonsState(currentPageIndex) {
    const pageBadge = document.getElementById('flipbookPageBadge');
    const rangeSlider = document.getElementById('flipbookRange');
    const prevBtn = document.getElementById('btnNavPrev');
    const nextBtn = document.getElementById('btnNavNext');
    const total = totalDocPages || 31;
    const isMobile = window.innerWidth <= 768;

    updateCoverCentering(currentPageIndex);

    const humanPage = currentPageIndex + 1;

    if (pageBadge) {
      if (currentPageIndex === 0) {
        pageBadge.textContent = `Cover Depan • Hal 1 dari ${total}`;
      } else if (currentPageIndex >= total - 1) {
        pageBadge.textContent = `Cover Belakang • Hal ${total}`;
      } else if (isMobile) {
        pageBadge.textContent = `Halaman ${humanPage} dari ${total}`;
      } else {
        const leftPage = currentPageIndex % 2 === 1 ? currentPageIndex + 1 : currentPageIndex;
        const rightPage = Math.min(leftPage + 1, total);
        pageBadge.textContent = `Halaman ${leftPage}-${rightPage} dari ${total}`;
      }
    }

    if (rangeSlider) {
      rangeSlider.value = humanPage;
    }

    if (prevBtn) {
      prevBtn.disabled = currentPageIndex <= 0;
    }

    if (nextBtn) {
      nextBtn.disabled = currentPageIndex >= totalDocPages - 1;
    }
  }

  /**
   * 10. Toggle Fullscreen Browser
   */
  function toggleFullscreen() {
    const elem = document.getElementById('flipbookModal') || document.documentElement;
    if (!document.fullscreenElement) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  /**
   * 11. Fallback jika PDF.js / StPageFlip gagal memuat
   */
  function renderIframeFallback() {
    const viewport = document.getElementById('flipbookViewport');
    if (viewport) {
      viewport.innerHTML = `
        <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px;">
          <iframe src="${PDF_FILE_PATH}#toolbar=1&navpanes=0&scrollbar=1" class="flipbook-iframe-fallback" title="${escapeHTML(activeFlipbookDoc?.title || 'Profil Lembaga ACF Eduhub')}"></iframe>
        </div>
      `;
    }
  }

  // Responsif resize untuk perataan posisi cover
  window.addEventListener('resize', () => {
    if (flipBookInstance) {
      try {
        const cur = flipBookInstance.getCurrentPageIndex();
        updateCoverCentering(cur);
      } catch (e) {}
    }
  });

  // Ekspor fungsi ke window agar dapat dipanggil dari luar
  window.openProfilLembagaFlipbook = openFlipbookModal;
  window.closeProfilLembagaFlipbook = closeFlipbookModal;
  window.initACFFlipbook = initDynamicPageFlipbook;
  window.toggleFlipbookNavbars = toggleNavbars;
})();
