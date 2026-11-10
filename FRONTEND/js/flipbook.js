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
  let isRendering = false;
  let renderedPagesCount = 0;
  let totalDocPages = 0;

  // Initialize when DOM ready
  document.addEventListener('DOMContentLoaded', async () => {
    // 1. Deteksi dan terapkan dokumen flipbook dinamis untuk halaman saat ini
    await initDynamicPageFlipbook();

    // 2. Hubungkan tombol pemicu & hash URL
    initTriggerButtons();
    initUrlHashCheck();

    // If we are on the standalone page (profil-lembaga.html), auto-load
    if (document.body.classList.contains('flipbook-standalone-body')) {
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
   * Mengambil data flipbook aktif untuk halaman ini dari API
   */
  async function fetchActiveFlipbook(pageName) {
    if (window.ACF_API && window.ACF_API.flipbooks && typeof window.ACF_API.flipbooks.getByPage === 'function') {
      try {
        const doc = await window.ACF_API.flipbooks.getByPage(pageName);
        if (doc && doc.id) return doc;
      } catch (e) {
        console.warn('API flipbook getByPage fallback:', e);
      }
    }

    try {
      const res = await fetch(`../BACKEND/api/flipbooks.php?page=${encodeURIComponent(pageName)}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.data) {
          return data.data;
        }
      }
    } catch (e) {}

    // Fallback khusus untuk kisah-kami.html & profil-lembaga.html bila backend offline
    if (pageName === 'kisah-kami.html' || pageName === 'profil-lembaga.html') {
      return {
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
      };
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
        <div class="flipbook-stage" id="flipbookStage">
          <div class="flipbook-loading-screen" id="flipbookLoading">
            <div class="flipbook-spinner"></div>
            <div class="flipbook-loading-title">${escapeHTML(doc.title || 'Membuka Profil Lembaga ACF Eduhub')}</div>
            <div class="flipbook-loading-desc" id="flipbookLoadingDesc">Sedang menyiapkan tampilan lembaran buku...</div>
            <div class="flipbook-progress-bar-bg">
              <div class="flipbook-progress-bar-fill" id="flipbookProgressFill"></div>
            </div>
          </div>
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
      } catch (e) {
        // Selector CSS biasa jika gagal
      }
      if (!targetEl) {
        targetEl = document.getElementById(position);
      }
      if (!targetEl) {
        try {
          targetEl = document.querySelector(`.${position}`);
        } catch (e) {}
      }
      if (!targetEl) {
        try {
          targetEl = document.querySelector(`[id*="${position}"]`) || document.querySelector(`[class*="${position}"]`);
        } catch (e) {}
      }

      if (targetEl && targetEl.parentNode) {
        btnWrap.style.textAlign = 'center';
        btnWrap.style.margin = '28px auto';
        btnWrap.style.display = 'flex';
        btnWrap.style.justifyContent = 'center';
        targetEl.parentNode.insertBefore(btnWrap, targetEl.nextSibling);
      } else {
        // Fallback jika elemen kustom tidak ditemukan: di bawah hero / section pertama
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
      // Jika tidak ada flipbook aktif untuk halaman ini
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
      // Hindari multiple listener
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

    // Tombol close modal
    const closeBtn = document.getElementById('btnFlipbookClose');
    if (closeBtn && !closeBtn.getAttribute('data-flipbook-bound')) {
      closeBtn.setAttribute('data-flipbook-bound', 'true');
      closeBtn.addEventListener('click', closeFlipbookModal);
    }

    // Klik di luar container untuk menutup (backdrop)
    const modal = document.getElementById('flipbookModal');
    if (modal && !modal.getAttribute('data-flipbook-bound')) {
      modal.setAttribute('data-flipbook-bound', 'true');
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeFlipbookModal();
        }
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
    document.body.style.overflow = 'hidden';

    // Update history state
    if (window.history && window.history.replaceState) {
      try {
        const url = new URL(window.location.href);
        url.hash = 'profil-lembaga';
        window.history.replaceState({ modal: 'profil-lembaga' }, '', url.toString());
      } catch (err) {}
    }

    // Hubungkan kontrol tombol jika modal baru saja diinjeksi
    initTriggerButtons();

    // Muat flipbook jika belum ada
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
   * 5. Muat PDF dan Render ke Canvas untuk StPageFlip
   */
  async function loadAndRenderFlipbook() {
    if (isRendering) return;
    isRendering = true;

    await ensureDependenciesLoaded();

    const loadingScreen = document.getElementById('flipbookLoading');
    const loadingDesc = document.getElementById('flipbookLoadingDesc');
    const progressBar = document.getElementById('flipbookProgressFill');
    const bookContainer = document.getElementById('flipbookBook');

    if (loadingScreen) loadingScreen.classList.remove('hidden');

    if (typeof window.pdfjsLib === 'undefined') {
      console.warn('PDF.js belum termuat, mencoba memuat fallback iframe.');
      renderIframeFallback();
      return;
    }

    try {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

      if (loadingDesc) {
        loadingDesc.textContent = `Membuka dokumen ${activeFlipbookDoc?.title || 'Profil Lembaga'}...`;
      }

      // Load PDF Document
      const loadingTask = window.pdfjsLib.getDocument(PDF_FILE_PATH);
      pdfDocInstance = await loadingTask.promise;
      totalDocPages = pdfDocInstance.numPages;

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

        const pageNumBadge = document.createElement('div');
        pageNumBadge.className = `page-sheet-num ${pageNum % 2 === 0 ? 'left' : 'right'}`;
        pageNumBadge.textContent = pageNum;
        sheet.appendChild(pageNumBadge);

        if (bookContainer) bookContainer.appendChild(sheet);
      }

      // Render halaman satu per satu
      renderedPagesCount = 0;
      for (let pageNum = 1; pageNum <= totalDocPages; pageNum++) {
        await renderSinglePdfPage(pageNum, 1.4);
        renderedPagesCount++;

        const percent = Math.round((renderedPagesCount / totalDocPages) * 100);
        if (progressBar) progressBar.style.width = `${percent}%`;
        if (loadingDesc) {
          loadingDesc.textContent = `Menyiapkan lembaran buku: ${renderedPagesCount} dari ${totalDocPages} (${percent}%)`;
        }
      }

      // Inisialisasi StPageFlip setelah semua lembaran siap
      initStPageFlip(bookContainer, baseWidth, baseHeight);

      if (loadingScreen) {
        setTimeout(() => {
          loadingScreen.classList.add('hidden');
        }, 300);
      }
    } catch (err) {
      console.error('Gagal merender Flipbook PDF:', err);
      renderIframeFallback();
    } finally {
      isRendering = false;
    }
  }

  /**
   * 6. Render satu halaman PDF ke canvas
   */
  async function renderSinglePdfPage(pageNum, scale = 1.4) {
    if (!pdfDocInstance) return;
    const page = await pdfDocInstance.getPage(pageNum);
    const viewport = page.getViewport({ scale });
    const canvas = document.getElementById(`flip_canvas_${pageNum}`);
    if (!canvas) return;

    const context = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const renderContext = {
      canvasContext: context,
      viewport: viewport
    };

    await page.render(renderContext).promise;
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
          flipBookInstance.flip(Math.max(0, targetPage - 1));
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
   * 9. Perbarui Teks Indikator Halaman & Kondisi Tombol
   */
  function updateNavButtonsState(currentPageIndex) {
    const pageBadge = document.getElementById('flipbookPageBadge');
    const rangeSlider = document.getElementById('flipbookRange');
    const prevBtn = document.getElementById('btnNavPrev');
    const nextBtn = document.getElementById('btnNavNext');

    const humanPage = currentPageIndex + 1;

    if (pageBadge) {
      pageBadge.textContent = `Halaman ${humanPage} dari ${totalDocPages}`;
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
    const loadingScreen = document.getElementById('flipbookLoading');
    if (loadingScreen) loadingScreen.classList.add('hidden');

    const viewport = document.getElementById('flipbookViewport');
    if (viewport) {
      viewport.innerHTML = `
        <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px;">
          <iframe src="${PDF_FILE_PATH}#toolbar=1&navpanes=0&scrollbar=1" class="flipbook-iframe-fallback" title="${escapeHTML(activeFlipbookDoc?.title || 'Profil Lembaga ACF Eduhub')}"></iframe>
        </div>
      `;
    }
  }

  // Ekspor fungsi ke window agar dapat dipanggil dari luar
  window.openProfilLembagaFlipbook = openFlipbookModal;
  window.closeProfilLembagaFlipbook = closeFlipbookModal;
  window.initACFFlipbook = initDynamicPageFlipbook;
})();
