/**
 * ACF EDUHUB — Interactive PDF Flipbook Engine
 * Mengubah Dokumen PDF (Profil Lembaga ACF Eduhub & Dokumen Lainnya) menjadi Flipbook 3D interaktif.
 * Mendukung penempatan dinamis per halaman, responsif mobile, serta Fitur Mode Landscape untuk HP.
 */

(function () {
  'use strict';

  let PDF_FILE_PATH = '../assets/tentang/Profil Lembaga - ACF Eduhub.pdf';
  let activeFlipbookDoc = null;
  let flipBookInstance = null;
  let pdfDocInstance = null;
  let currentLoadedPdfPath = null;
  let isRendering = false;
  let isModalOpening = false;
  let totalDocPages = 0;
  let activePdfPageWidth = 595;
  let activePdfPageHeight = 842;
  let currentBaseWidth = 0;
  let currentBaseHeight = 0;
  let currentIsSinglePage = false;
  let currentRenderSession = 0;
  const renderedPages = new Set();
  const renderingPromises = new Map();
  let hintTimeout = null;
  let resizeDebounceTimer = null;

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
   * Helper: Tampilkan Toast Notifikasi Cepat di Layar Flipbook
   */
  function showFlipbookToast(message) {
    let toast = document.getElementById('flipbookQuickToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'flipbookQuickToast';
      toast.className = 'flipbook-quick-toast';
      const target = document.getElementById('flipbookModal') || document.body;
      target.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  /**
   * Helper: Hancurkan instance StPageFlip secara aman tanpa menghapus elemen DOM container (#flipbookBook)
   * StPageFlip default memanggil this.block.remove() yang mencabut container dari DOM.
   */
  function safelyDestroyFlipBook() {
    if (!flipBookInstance) return;
    try {
      if (flipBookInstance.block) {
        flipBookInstance.block = { remove: () => {} };
      }
      flipBookInstance.destroy();
    } catch (e) {
      console.warn('Flipbook safe destroy warning:', e);
    }
    flipBookInstance = null;
  }

  /**
   * Helper: Dapatkan elemen container #flipbookBook yang valid dan terpasang di dalam #flipbookViewport
   */
  function getBookContainer() {
    const viewport = document.getElementById('flipbookViewport');
    let container = document.getElementById('flipbookBook');
    if (!viewport) return container;
    if (!container || !viewport.contains(container)) {
      if (container) {
        try { container.remove(); } catch (_) {}
      }
      container = document.createElement('div');
      container.id = 'flipbookBook';
      container.className = 'flipbook-container';
      viewport.appendChild(container);
    }
    return container;
  }

  /**
   * Helper: Patch prototype StPageFlip HTMLPage agar ketika lembaran di-clone untuk animasi soft flip,
   * pixel buffer dari canvas asli disalin ke canvas clone sehingga lembaran tidak pernah kosong/putih.
   */
  function installStPageFlipClonePatch(instance) {
    if (!instance) return;
    try {
      const pageCol = instance.getPageCollection && instance.getPageCollection();
      const pages = pageCol && pageCol.getPages && pageCol.getPages();
      if (pages && pages[0]) {
        const proto = Object.getPrototypeOf(pages[0]);
        if (proto && !proto.__acfClonePatched) {
          proto.__acfClonePatched = true;
          const origNewTemp = proto.newTemporaryCopy;
          proto.newTemporaryCopy = function() {
            const res = origNewTemp.call(this);
            try {
              if (this.copiedElement && this.element) {
                const origC = this.element.querySelector('canvas');
                const cloneC = this.copiedElement.querySelector('canvas');
                if (origC && cloneC && origC.width > 0 && origC.height > 0) {
                  cloneC.width = origC.width;
                  cloneC.height = origC.height;
                  const ctx = cloneC.getContext('2d');
                  if (ctx) {
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    ctx.drawImage(origC, 0, 0);
                  }
                }
              }
            } catch (_) {}
            return res;
          };
        }
      }
    } catch (_) {}
  }

  /**
   * Helper: Normalisasi data dokumen flipbook agar seragam baik dari database maupun API
   */
  function normalizeFlipbookDoc(doc) {
    if (!doc) return null;
    const rawStatus = String(doc.status || 'aktif').trim().toLowerCase();
    let resolvedUrl = doc.file_url || doc.fileUrl || '';

    // Resolusi file_url dari localStorage jika hilang atau terpotong
    if (!resolvedUrl && doc.file_name) {
      try {
        const latest = JSON.parse(localStorage.getItem('acf_latest_uploaded_flipbook') || 'null');
        if (latest && (latest.file_url || latest.fileUrl)) {
          if (latest.file_name === doc.file_name || !doc.file_name.toLowerCase().includes('profil lembaga')) {
            resolvedUrl = latest.file_url || latest.fileUrl;
          }
        }
      } catch (e) {}

      if (!resolvedUrl) {
        try {
          const allCached = JSON.parse(localStorage.getItem('acf_flipbooks_data') || '[]');
          const found = allCached.find(f => (f.id && String(f.id) === String(doc.id)) || (f.file_name && f.file_name === doc.file_name));
          if (found && (found.file_url || found.fileUrl)) {
            resolvedUrl = found.file_url || found.fileUrl;
          }
        } catch (e) {}
      }

      if (!resolvedUrl && doc.file_name) {
        if (doc.file_name.toLowerCase().includes('profil lembaga')) {
          resolvedUrl = '../assets/tentang/Profil Lembaga - ACF Eduhub.pdf';
        } else {
          resolvedUrl = `../assets/uploads/flipbook/${doc.file_name}`;
        }
      }
    }

    // Koreksi path jika belum ada prefix relative '../'
    if (resolvedUrl && !resolvedUrl.startsWith('http') && !resolvedUrl.startsWith('/') && !resolvedUrl.startsWith('.')) {
      resolvedUrl = '../' + resolvedUrl;
    }

    const defaultTitle = 'Dokumen Flipbook — ACF Eduhub';
    const cleanFileName = doc.file_name || doc.fileName || (resolvedUrl ? resolvedUrl.substring(resolvedUrl.lastIndexOf('/') + 1) : '');

    return {
      id: doc.id,
      title: doc.judul || doc.title || defaultTitle,
      description: doc.deskripsi || doc.description || 'Dokumen Resmi Yayasan ACF Eduhub',
      file_url: resolvedUrl || (doc.file_name ? `../assets/uploads/flipbook/${doc.file_name}` : ''),
      file_name: cleanFileName,
      total_pages: parseInt(doc.total_pages || doc.totalPages || 0, 10),
      target_page: (doc.target_halaman || doc.target_page || 'kisah-kami.html').toLowerCase(),
      position: (doc.posisi || doc.position || 'bawah_deskripsi_sejarah').trim(),
      button_label: doc.button_label || doc.label_tombol || 'Baca Dokumen',
      status: rawStatus === 'nonaktif' ? 'nonaktif' : 'aktif'
    };
  }

  /**
   * Mengambil data flipbook aktif untuk halaman ini dari API / LocalStorage
   */
  async function fetchActiveFlipbook(pageName) {
    const cleanPage = (pageName || 'kisah-kami.html').toLowerCase();

    // Helper pencocokan target halaman secara cerdas & fleksibel
    function isTargetPageMatch(targetVal, page) {
      if (!targetVal) return false;
      const t = String(targetVal).toLowerCase().trim();
      const p = String(page).toLowerCase().trim();
      const base = p.replace('.html', '').replace('.php', '');
      if (t === p || t === base) return true;
      if (t.includes(base) || base.includes(t)) return true;
      if (p.includes('kabar') && (t.includes('kabar') || t.includes('berita') || t.includes('artikel') || t.includes('literasi') || t.includes('analisis'))) return true;
      if (p.includes('donasi') && (t.includes('donasi') || t.includes('infaq') || t.includes('sedekah'))) return true;
      if (p.includes('kisah') && (t.includes('kisah') || t.includes('cerita') || t.includes('sejarah') || t.includes('tentang'))) return true;
      if (p.includes('relawan') && (t.includes('relawan') || t.includes('sahabat'))) return true;
      if (p.includes('mitra') && (t.includes('mitra') || t.includes('kerjasama'))) return true;
      if (p.includes('index') && (t.includes('beranda') || t.includes('home') || t.includes('utama'))) return true;
      return false;
    }

    // 1. Cek unggahan terbaru admin di localStorage (Prioritas Tertinggi untuk Instant Preview)
    try {
      const latestRaw = localStorage.getItem('acf_latest_uploaded_flipbook');
      if (latestRaw) {
        const latest = JSON.parse(latestRaw);
        if (latest && String(latest.status || 'aktif').toLowerCase() === 'aktif') {
          if (isTargetPageMatch(latest.target_page || latest.target_halaman, cleanPage)) {
            return normalizeFlipbookDoc(latest);
          }
        }
      }
    } catch (e) {}

    // 2. Cek cache halaman aktif di localStorage
    try {
      const activeKey = `acf_active_flipbook_${cleanPage}`;
      const cachedActive = localStorage.getItem(activeKey);
      if (cachedActive) {
        const parsed = JSON.parse(cachedActive);
        if (parsed && (String(parsed.status || 'aktif').toLowerCase() === 'aktif')) {
          return normalizeFlipbookDoc(parsed);
        }
      }

      const allCached = localStorage.getItem('acf_flipbooks_data');
      if (allCached) {
        const list = JSON.parse(allCached);
        if (Array.isArray(list)) {
          const match = list.find(item => 
            isTargetPageMatch(item.target_halaman || item.target_page || '', cleanPage) &&
            (String(item.status || 'aktif').toLowerCase() === 'aktif')
          );
          if (match) return normalizeFlipbookDoc(match);
        }
      }
    } catch (e) {}

    // 3. Coba dari window.ACF_API jika tersedia
    if (window.ACF_API && window.ACF_API.flipbooks && typeof window.ACF_API.flipbooks.getByPage === 'function') {
      try {
        const doc = await window.ACF_API.flipbooks.getByPage(cleanPage);
        if (doc && doc.id) return normalizeFlipbookDoc(doc);
      } catch (e) {
        console.warn('API flipbook getByPage fallback:', e);
      }
    }

    // 4. Coba direct fetch ke endpoint flipbooks.php
    try {
      const res = await fetch(`../BACKEND/api/flipbooks.php?page=${encodeURIComponent(cleanPage)}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.data) {
          return normalizeFlipbookDoc(data.data);
        }
      }
    } catch (e) {}

    // 5. Fallback resmi default untuk kisah-kami.html, profil-lembaga.html, atau jika elemen tombol sudah ada di halaman
    if (cleanPage === 'kisah-kami.html' || cleanPage === 'profil-lembaga.html' || isTargetPageMatch('kisah-kami.html', cleanPage) || document.getElementById('wrapProfilLembagaBtn')) {
      return normalizeFlipbookDoc({
        id: 1,
        title: 'Profil Lembaga ACF Eduhub',
        description: 'Dokumen Resmi Profil & Portofolio Dampak Yayasan',
        file_name: 'Profil Lembaga - ACF Eduhub.pdf',
        file_url: '../assets/tentang/Profil Lembaga - ACF Eduhub.pdf',
        total_pages: 31,
        target_page: cleanPage,
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
      link.href = '../css/flipbook.css?v=20261117_mobile_single_v17';
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
   * Hitung dimensi optimal Flipbook secara dinamis berdasarkan aspect ratio asli dokumen PDF
   * Menjamin 100% halaman tidak terpotong (tidak terpotong atas/bawah/samping) dan selalu muat di layar
   * - Mobile: 1 halaman tunggal (single-page mode) baik cover maupun halaman berikutnya
   * - Desktop/Web: 2 halaman berdampingan (two-page spread) seperti semula
   */
  function calculateOptimalBookDimensions(pdfPageW = 595, pdfPageH = 842) {
    const modal = document.getElementById('flipbookModal');
    const isForcedLandscape = modal && modal.classList.contains('is-forced-landscape');

    let screenW = window.innerWidth;
    let screenH = window.innerHeight;

    // Jika user mengaktifkan rotasi virtual landscape di HP
    if (isForcedLandscape && screenW < screenH) {
      const temp = screenW;
      screenW = screenH;
      screenH = temp;
    }

    const isLandscape = screenW > screenH;
    // Tampilan Mobile: Layar ponsel / smartphone (lebar layar <= 768px)
    const isMobile = screenW <= 768;

    // Hitung aspect ratio dokumen asli (Tinggi / Lebar per lembar)
    const validW = Math.max(100, Number(pdfPageW) || 595);
    const validH = Math.max(100, Number(pdfPageH) || 842);
    const pageRatio = validH / validW;

    let availW, availH;

    if (isMobile) {
      // MODE MOBILE: 1 Halaman Tunggal (Single Page View) baik cover maupun seluruh halaman berikutnya
      if (isLandscape) {
        availH = Math.max(180, screenH - 46);
        availW = Math.max(220, screenW - 36);
      } else {
        availH = Math.max(240, screenH - 96);
        availW = Math.max(220, screenW - 20);
      }

      // Pada mobile, 1 halaman menggunakan seluruh lebar yang tersedia (TIDAK DIBAGI 2)
      let maxWByHeight = Math.floor(availH / pageRatio);
      let maxWByWidth = Math.floor(availW); // 1 lembar tunggal
      let baseWidth = Math.min(maxWByWidth, maxWByHeight);

      const minW = isLandscape ? 140 : 160;
      const maxW = 600;
      baseWidth = Math.max(minW, Math.min(maxW, baseWidth));

      if (baseWidth * pageRatio > availH) {
        baseWidth = Math.floor(availH / pageRatio);
      }
      const baseHeight = Math.round(baseWidth * pageRatio);

      return {
        baseWidth,
        baseHeight,
        pageRatio,
        isMobile: true,
        isSinglePage: true,
        isLandscape,
        isForcedLandscape
      };
    } else {
      // MODE DESKTOP/WEB: 2 Halaman Berdampingan (Two-Page Spread seperti semula)
      availH = Math.max(300, screenH - 134);
      availW = Math.max(300, screenW - 140);

      // Buku terdiri dari 2 lembar berdampingan (Total Lebar = 2 * baseWidth)
      let maxWByHeight = Math.floor(availH / pageRatio);
      let maxWByWidth = Math.floor(availW / 2); // 2 lembar berdampingan
      let baseWidth = Math.min(maxWByWidth, maxWByHeight);

      const minW = 180;
      const maxW = 750;
      baseWidth = Math.max(minW, Math.min(maxW, baseWidth));

      if (baseWidth * pageRatio > availH) {
        baseWidth = Math.floor(availH / pageRatio);
      }
      const baseHeight = Math.round(baseWidth * pageRatio);

      return {
        baseWidth,
        baseHeight,
        pageRatio,
        isMobile: false,
        isSinglePage: false,
        isLandscape,
        isForcedLandscape
      };
    }
  }

  /**
   * Helper: Dapatkan skala render optimal beresolusi tinggi (High-DPI / Retina) agar teks tajam & jelas dibaca
   */
  function getOptimalRenderScale(baseWidth = null, pdfUnscaledW = null) {
    const w = baseWidth || currentBaseWidth || (window.innerWidth <= 768 ? 360 : 500);
    const naturalW = Math.max(100, Number(pdfUnscaledW || activePdfPageWidth) || 595);
    const dpr = Math.max(window.devicePixelRatio || 1, 1.5);
    const targetPixelWidth = Math.max(w * dpr, 1200);
    const computedScale = targetPixelWidth / naturalW;
    return Math.max(2.0, Math.min(3.2, computedScale));
  }

  /**
   * Helper: Siapkan semua lembaran (sheet) & canvas langsung dari dokumen PDF asli
   */
  function createSheetElements(bookContainer, force = false) {
    bookContainer = bookContainer || getBookContainer();
    if (!bookContainer || totalDocPages <= 0) return;
    if (!force && bookContainer.querySelector('.page-sheet')) return;
    bookContainer.innerHTML = '';
    renderedPages.clear();
    renderingPromises.clear();

    for (let pageNum = 1; pageNum <= totalDocPages; pageNum++) {
      const sheet = document.createElement('div');
      sheet.className = 'page-sheet';
      sheet.style.position = 'absolute';
      sheet.style.top = '0';
      sheet.style.boxSizing = 'border-box';
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

      bookContainer.appendChild(sheet);
    }
  }

  /**
   * Perbarui teks, judul, link unduh, dan metadata modal flipbook sesuai dokumen aktif
   */
  function updateModalInfo(doc) {
    const modal = document.getElementById('flipbookModal');
    if (!modal || !doc) return;

    const titleEl = modal.querySelector('#flipbookModalTitle');
    if (titleEl && doc.title) {
      titleEl.textContent = doc.title;
    }
    const subtitleEl = modal.querySelector('.flipbook-doc-subtitle');
    if (subtitleEl) {
      subtitleEl.textContent = doc.description || 'Dokumen Resmi Yayasan ACF Eduhub';
    }
    const downloadBtn = modal.querySelector('.btn-download-pdf');
    if (downloadBtn) {
      const href = doc.file_url || PDF_FILE_PATH;
      if (href) downloadBtn.setAttribute('href', href);
      const downloadName = doc.file_name || (href ? href.substring(href.lastIndexOf('/') + 1) : 'Dokumen-ACF.pdf');
      if (downloadName) downloadBtn.setAttribute('download', downloadName);
    }
    const pageBadge = modal.querySelector('#flipbookPageBadge');
    if (pageBadge && totalDocPages > 0) {
      pageBadge.textContent = `1 dari ${totalDocPages} Halaman`;
    }
  }

  /**
   * Preload PDF asli di background segera setelah dokumen aktif dipastikan
   */
  async function preloadPdfInBackground() {
    if (!PDF_FILE_PATH || typeof PDF_FILE_PATH !== 'string' || !PDF_FILE_PATH.trim()) {
      return; // Jangan pernah preload jika belum ada dokumen valid untuk halaman ini!
    }

    try {
      await ensureDependenciesLoaded();
      if (typeof window.pdfjsLib !== 'undefined') {
        if (!pdfDocInstance || currentLoadedPdfPath !== PDF_FILE_PATH) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          const doc = await window.pdfjsLib.getDocument(PDF_FILE_PATH).promise;
          pdfDocInstance = doc;
          currentLoadedPdfPath = PDF_FILE_PATH;
          totalDocPages = doc.numPages;

          // Deteksi rasio halaman asli dari page 1
          try {
            const page1 = await doc.getPage(1);
            const vp1 = page1.getViewport({ scale: 1.0 });
            activePdfPageWidth = vp1.width || 595;
            activePdfPageHeight = vp1.height || 842;
          } catch (eDim) {}

          const bookContainer = getBookContainer();
          if (bookContainer) {
            createSheetElements(bookContainer);
            const dims = calculateOptimalBookDimensions(activePdfPageWidth, activePdfPageHeight);
            currentBaseWidth = dims.baseWidth;
            currentBaseHeight = dims.baseHeight;
            const scale = getOptimalRenderScale(dims.baseWidth, activePdfPageWidth);
            // Pra-render 3 halaman pertama di background sebelum user mengklik tombol
            const initialPages = [1, 2, 3].filter(p => p <= totalDocPages);
            await Promise.all(initialPages.map(p => renderSinglePdfPage(p, scale)));
            // Lanjutkan pra-render halaman 4 dan 5
            if (totalDocPages >= 5) {
              Promise.all([
                renderSinglePdfPage(4, scale),
                renderSinglePdfPage(5, scale)
              ]).then(() => {
                renderRemainingPagesInBackground();
              }).catch(() => {});
            }
          }
        }
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
        <!-- Floating Minimalist Close Button -->
        <button type="button" class="flipbook-floating-close" id="btnFloatingClose" title="Tutup Flipbook" aria-label="Tutup Flipbook">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <!-- Hint Petunjuk Navigasi Otomatis Hilang -->
        <div class="flipbook-nav-hint" id="flipbookNavHint">Klik latar belakang untuk melihat / menyembunyikan menu</div>

        <!-- Top Header Bar -->
        <div class="flipbook-header">
          <div class="flipbook-header-left">
            <img src="../assets/logo-acf/logo-acf-white-text.png" alt="ACF Eduhub Logo" class="flipbook-logo-mini" onerror="this.style.display='none'">
            <div class="flipbook-title-group">
              <span class="flipbook-doc-title" id="flipbookModalTitle">${escapeHTML(doc ? doc.title : 'Dokumen Flipbook — ACF Eduhub')}</span>
              <span class="flipbook-doc-subtitle">${escapeHTML(doc ? doc.description : 'Dokumen Resmi Yayasan ACF Eduhub')}</span>
            </div>
          </div>
          <div class="flipbook-header-right">
            <span class="flipbook-page-badge" id="flipbookPageBadge">Memuat...</span>
            <a href="${(doc && doc.file_url) || PDF_FILE_PATH}" download="${escapeHTML((doc && doc.file_name) || 'Dokumen.pdf')}" class="flipbook-btn-tool btn-download-pdf" title="Unduh Dokumen PDF Resmi">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span>Unduh PDF</span>
            </a>
            <button type="button" class="flipbook-btn-tool btn-tool-landscape" id="btnFlipbookLandscape" title="Mode Landscape / Putar Layar (Tampilan Lebih Jelas)" aria-label="Mode Landscape">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="18" height="12" x="3" y="6" rx="2.5"></rect>
                <path d="m13 2 3 2-3 2"></path>
                <path d="M7 4h9"></path>
                <path d="m11 22-3-2 3-2"></path>
                <path d="M17 20H8"></path>
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

        <!-- Bottom Controls Bar -->
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
      // Hapus tombol fullscreen jika ada
      const existingFsBtn = modal.querySelector('#btnFlipbookFullscreen');
      if (existingFsBtn) existingFsBtn.remove();

      // Perbarui judul & unduhan pada modal yang sudah ada
      if (doc) {
        updateModalInfo(doc);
      }

      // Pastikan tombol landscape ada
      if (!modal.querySelector('#btnFlipbookLandscape')) {
        const headerRight = modal.querySelector('.flipbook-header-right');
        const closeBtn = modal.querySelector('#btnFlipbookClose');
        if (headerRight) {
          const lBtn = document.createElement('button');
          lBtn.type = 'button';
          lBtn.className = 'flipbook-btn-tool btn-tool-landscape';
          lBtn.id = 'btnFlipbookLandscape';
          lBtn.title = 'Mode Landscape / Putar Layar (Tampilan Lebih Jelas)';
          lBtn.setAttribute('aria-label', 'Mode Landscape');
          lBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect width="18" height="12" x="3" y="6" rx="2.5"></rect>
              <path d="m13 2 3 2-3 2"></path>
              <path d="M7 4h9"></path>
              <path d="m11 22-3-2 3-2"></path>
              <path d="M17 20H8"></path>
            </svg>
          `;
          if (closeBtn) {
            headerRight.insertBefore(lBtn, closeBtn);
          } else {
            headerRight.appendChild(lBtn);
          }
        }
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
    const isActive = doc && String(doc.status || 'aktif').trim().toLowerCase() === 'aktif';
    if (!doc || !isActive) {
      if (doc && String(doc.status || '').trim().toLowerCase() === 'nonaktif') {
        const existingWrap = document.getElementById('wrapProfilLembagaBtn');
        if (existingWrap) existingWrap.style.display = 'none';
        const existingPlacementWrap = document.getElementById('flipbookPlacementWrapper');
        if (existingPlacementWrap) existingPlacementWrap.style.display = 'none';
      }
      return;
    }

    let btnWrap = document.getElementById('wrapProfilLembagaBtn');
    const currentPage = getCurrentPageName();
    const position = (doc.position || doc.posisi || 'bawah_deskripsi_sejarah').trim();
    const buttonText = doc.button_label || doc.label_tombol || 'Profil Lembaga ACF Eduhub';

    // Buat elemen tombol jika belum ada di DOM
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
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </span>
        </a>
      `;
    } else {
      btnWrap.style.display = '';
      const textEl = btnWrap.querySelector('.btn-profil-text');
      if (textEl) textEl.textContent = buttonText;
    }

    // Helper: Buat wrapper container terpusat untuk penempatan antar-seksi
    function getOrCreateSectionWrapper(padding = '28px 20px') {
      let wrapper = document.getElementById('flipbookPlacementWrapper');
      if (!wrapper) {
        wrapper = document.createElement('div');
        wrapper.id = 'flipbookPlacementWrapper';
        wrapper.className = 'flipbook-placement-wrapper';
      }
      wrapper.style.display = 'block';
      wrapper.innerHTML = `<div class="container" style="display: flex; justify-content: center; align-items: center; padding: ${padding};"></div>`;
      const container = wrapper.querySelector('.container');
      btnWrap.style.margin = '0 auto';
      btnWrap.style.display = 'inline-flex';
      btnWrap.style.justifyContent = 'center';
      btnWrap.style.textAlign = 'center';
      container.appendChild(btnWrap);
      return wrapper;
    }

    const cleanPos = (position || '').trim();
    const lower = cleanPos.toLowerCase();

    // Deteksi arah penjajaran (Alignment) dan orientasi (Atas / Bawah / Kiri / Kanan / Tengah)
    const isLeft = lower.includes('kiri');
    const isRight = lower.includes('kanan');
    const isAbove = lower.includes('atas') || lower.includes('sebelum') || lower.includes('muka') || lower.includes('depan') || lower.includes('awal');
    const isBelow = lower.includes('bawah') || lower.includes('setelah') || lower.includes('sesudah') || lower.includes('akhir');

    function applyBtnAlignment(wrap) {
      if (isLeft) {
        wrap.style.margin = '18px 0 14px 0';
        wrap.style.display = 'flex';
        wrap.style.justifyContent = 'flex-start';
        wrap.style.textAlign = 'left';
      } else if (isRight) {
        wrap.style.margin = '18px 0 14px auto';
        wrap.style.display = 'flex';
        wrap.style.justifyContent = 'flex-end';
        wrap.style.textAlign = 'right';
      } else {
        wrap.style.margin = '20px auto';
        wrap.style.display = 'flex';
        wrap.style.justifyContent = 'center';
        wrap.style.textAlign = 'center';
      }
    }

    // Modal Article Watcher (Khusus halaman kabar.html saat membaca detail artikel)
    if (currentPage === 'kabar.html') {
      const artModal = document.getElementById('kabarDetailModal');
      if (artModal && !artModal.getAttribute('data-flipbook-observed')) {
        artModal.setAttribute('data-flipbook-observed', 'true');
        const observer = new MutationObserver(() => {
          if (artModal.classList.contains('active')) {
            injectModalArticleFlipbook(doc);
          } else {
            const modalBtnWrap = document.getElementById('wrapProfilLembagaBtnModal');
            if (modalBtnWrap) {
              modalBtnWrap.style.display = 'none';
              modalBtnWrap.remove();
            }
          }
        });
        observer.observe(artModal, { attributes: true, attributeFilter: ['class', 'style'] });

        // Observe juga jika judul artikel modal diperbarui
        const titleEl = document.getElementById('modalArticleTitle');
        if (titleEl) {
          const titleObs = new MutationObserver(() => {
            if (artModal.classList.contains('active')) {
              injectModalArticleFlipbook(doc);
            }
          });
          titleObs.observe(titleEl, { childList: true, characterData: true, subtree: true });
        }
      }
    }

    /**
     * Helper untuk mengecek apakah artikel yang sedang dibuka di modal kabar.html
     * adalah artikel khusus "Analisis Literasi dan Numerasi dalam Asesmen Kompetensi Minimum (AKM): Studi SD Juara Seluruh Indonesia"
     */
    function isTargetArticleForFlipbook() {
      const artModal = document.getElementById('kabarDetailModal');
      if (!artModal || !artModal.classList.contains('active')) return false;

      const titleEl = document.getElementById('modalArticleTitle');
      const title = (titleEl ? titleEl.textContent : '').trim().toLowerCase();

      const activeArt = window.currentActiveArticle || null;
      const activeTitle = (activeArt && activeArt.title ? activeArt.title : '').trim().toLowerCase();
      const activeId = activeArt && activeArt.id ? String(activeArt.id).trim().toUpperCase() : '';

      // ID artikel spesifik di database
      if (activeId === 'ART-3512') return true;

      // Pencocokan judul artikel secara spesifik
      const matchesTarget = (t) => {
        if (!t) return false;
        const hasLiterasi = t.includes('literasi');
        const hasNumerasi = t.includes('numerasi');
        const hasAkm = t.includes('asesmen kompetensi minimum') || t.includes('akm');
        const hasSdJuara = t.includes('sd juara') || t.includes('studi');
        if (hasLiterasi && hasNumerasi && (hasAkm || hasSdJuara)) return true;
        if (t.includes('analisis literasi dan numerasi')) return true;
        if (t.includes('analisis kemampuan literasi')) return true;
        return false;
      };

      if (matchesTarget(title) || matchesTarget(activeTitle)) return true;

      // Cek isi konten artikel jika mengandung link atau teks riset AKM terkait
      const contentEl = document.getElementById('modalArticleContent');
      if (contentEl) {
        const html = contentEl.innerHTML.toLowerCase();
        if (html.includes('analisis_kemampuan_literasi') || 
           (html.includes('asesmen kompetensi minimum') && html.includes('sd juara se-indonesia'))) {
          return true;
        }
      }

      return false;
    }

    function injectModalArticleFlipbook(activeDoc) {
      const artModal = document.getElementById('kabarDetailModal');
      const existingModalBtn = document.getElementById('wrapProfilLembagaBtnModal');
      const insideBtnWrap = document.querySelector('#kabarDetailModal #wrapProfilLembagaBtn');

      // Validasi ketat: HANYA tampilkan pada artikel "Analisis Literasi dan Numerasi dalam Asesmen Kompetensi Minimum (AKM): Studi SD Juara Seluruh Indonesia"
      // Pada SEMUA artikel lain di kabar.html, tombol "Baca di Sini" WAJIB dihapus/disembunyikan
      if (!artModal || !artModal.classList.contains('active') || !isTargetArticleForFlipbook()) {
        if (existingModalBtn) {
          existingModalBtn.style.display = 'none';
          existingModalBtn.remove();
        }
        if (insideBtnWrap) {
          insideBtnWrap.style.display = 'none';
        }
        return;
      }

      // Pastikan tombol non-modal jika ada di dalam modal disembunyikan agar tidak dobel
      if (insideBtnWrap) {
        insideBtnWrap.style.display = 'none';
      }

      const modalShare = document.querySelector('.kabar-detail-content-wrap .kabar-share-section, .kabar-share-section');
      const modalContent = document.getElementById('modalArticleContent');
      if (!modalShare && !modalContent) return;

      // Sembunyikan heading/link teks mentah bawaan artikel jika bertuliskan "Baca di Sini"
      if (modalContent) {
        modalContent.querySelectorAll('h2, a').forEach(el => {
          const txt = (el.textContent || '').trim().toLowerCase();
          if (txt === 'baca di sini' || txt.includes('baca di sini')) {
            if (el.tagName === 'H2') el.style.display = 'none';
            else if (el.tagName === 'A') {
              const p = el.closest('h2') || el.parentElement;
              if (p && p !== modalContent) p.style.display = 'none';
              else el.style.display = 'none';
            }
          }
        });
      }

      // Tentukan data dokumen PDF khusus untuk studi AKM ini
      let targetDoc = activeDoc;
      if (!targetDoc || !targetDoc.file_url || !targetDoc.file_url.includes('Analisis')) {
        targetDoc = {
          id: (activeDoc && activeDoc.id) || 'akm-literasi',
          title: (activeDoc && activeDoc.title && activeDoc.title.includes('Literasi')) ? activeDoc.title : 'Analisis Literasi dan Numerasi dalam Asesmen Kompetensi Minimum (AKM)',
          description: 'Studi SD Juara Seluruh Indonesia — Dokumen Resmi Yayasan ACF Eduhub',
          file_name: 'Analisis_Kemampuan_Literasi_dan_Numerasi.pdf',
          file_url: '../assets/uploads/flipbook/flip_20261111_143004_Analisis_Kemampuan_Literasi_da.pdf',
          total_pages: 24,
          button_label: 'Baca di Sini'
        };
      }

      const targetBtnLabel = (targetDoc && (targetDoc.button_label || targetDoc.label_tombol)) || 'Baca di Sini';

      let modalBtnWrap = document.getElementById('wrapProfilLembagaBtnModal');
      if (!modalBtnWrap) {
        modalBtnWrap = document.createElement('div');
        modalBtnWrap.id = 'wrapProfilLembagaBtnModal';
        modalBtnWrap.className = 'profil-lembaga-btn-wrap';
        modalBtnWrap.innerHTML = `
          <a href="#profil-lembaga" class="btn-profil-lembaga" title="Buka Dokumen Flipbook 3D" data-open-flipbook="profil-lembaga" style="margin: 0;">
            <span class="btn-profil-icon-book">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                <line x1="12" y1="6" x2="16" y2="6"></line>
                <line x1="12" y1="10" x2="16" y2="10"></line>
              </svg>
            </span>
            <span class="btn-profil-text">${escapeHTML(targetBtnLabel)}</span>
            <span class="btn-profil-icon-arrow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </span>
          </a>
        `;
        modalBtnWrap.querySelector('a').addEventListener('click', (e) => {
          e.preventDefault();
          openFlipbookModal(targetDoc);
        });
      } else {
        const textEl = modalBtnWrap.querySelector('.btn-profil-text');
        if (textEl) textEl.textContent = targetBtnLabel;
      }

      modalBtnWrap.style.display = 'flex';
      applyBtnAlignment(modalBtnWrap);
      modalBtnWrap.style.margin = '20px 0 16px 0';

      if (modalShare && modalShare.parentNode) {
        if (modalShare.previousElementSibling !== modalBtnWrap) {
          modalShare.parentNode.insertBefore(modalBtnWrap, modalShare);
        }
      } else if (modalContent && modalContent.parentNode) {
        if (modalContent.nextElementSibling !== modalBtnWrap) {
          modalContent.parentNode.insertBefore(modalBtnWrap, modalContent.nextSibling);
        }
      }
    }

    // Expose fungsi ke window agar dapat dipanggil instan oleh kabar.js
    window.checkAndInjectModalFlipbook = function() {
      injectModalArticleFlipbook(activeFlipbookDoc || doc);
    };

    // Helper untuk menyembunyikan wrapper placement jika tombol ditempatkan langsung di dalam elemen halaman
    function hideUnusedPlacementWrapper() {
      const existingWrapper = document.getElementById('flipbookPlacementWrapper');
      if (existingWrapper && (!btnWrap.parentNode || !existingWrapper.contains(btnWrap))) {
        existingWrapper.style.display = 'none';
      }
    }

    // 1. DESKRIPSI SEJARAH SINGKAT / CERITA KAMI
    const isSejarahPos = position === 'bawah_deskripsi_sejarah' || 
                         lower.includes('sejarah') || 
                         lower.includes('deskripsi') || 
                         (currentPage === 'kisah-kami.html' && (!position || position === 'bawah_deskripsi_sejarah'));

    if (isSejarahPos) {
      const deskripsi = document.getElementById('sejarahSingkatDeskripsi') ||
                        document.querySelector('.sejarah-grid .reveal p:last-of-type') ||
                        document.querySelector('#ringkasan-tentang .ringkasan-tentang-body') ||
                        document.querySelector('.sejarah-grid .reveal') ||
                        document.querySelector('.sejarah-grid') ||
                        document.querySelector('.reveal p');
      if (deskripsi && deskripsi.parentNode) {
        btnWrap.style.margin = '26px 0 0 0';
        btnWrap.style.display = 'block';
        btnWrap.style.textAlign = 'left';
        btnWrap.style.visibility = 'visible';
        btnWrap.style.opacity = '1';
        if (deskripsi.nextElementSibling !== btnWrap) {
          deskripsi.parentNode.insertBefore(btnWrap, deskripsi.nextSibling);
        }
        hideUnusedPlacementWrapper();
        btnWrap.setAttribute('data-flipbook-placed', 'bawah_deskripsi_sejarah');
        initTriggerButtons();
        return;
      }
    }

    // 2. BANNER HERO UTAMA / HEADER ATAS (Semua halaman termasuk kisah-kami.html)
    if (position === 'bawah_hero' || lower.includes('hero') || lower.includes('banner') || lower.includes('slider') || (lower.includes('atas') && lower.includes('halaman'))) {
      const hero = document.querySelector('.page-hero, #heroSlider, #kabarHeroBanner, .home-hero-slider-section, .hero-section, main > section:first-of-type, section:first-of-type');
      if (hero && hero.parentNode) {
        const wrapper = getOrCreateSectionWrapper('24px 20px');
        applyBtnAlignment(btnWrap);
        hero.parentNode.insertBefore(wrapper, hero.nextSibling);
        btnWrap.setAttribute('data-flipbook-placed', position);
        initTriggerButtons();
        return;
      }
    }

    // 3. TENGAH KONTEN / HALAMAN
    if (position === 'tengah_konten' || lower.includes('tengah') || lower.includes('mid')) {
      const sections = document.querySelectorAll('main > section, .main-content > section, main > div.section, section');
      if (sections.length >= 2) {
        const midIndex = Math.floor(sections.length / 2);
        const wrapper = getOrCreateSectionWrapper('28px 20px');
        applyBtnAlignment(btnWrap);
        sections[midIndex].parentNode.insertBefore(wrapper, sections[midIndex].nextSibling);
        btnWrap.setAttribute('data-flipbook-placed', position);
        initTriggerButtons();
        return;
      }
    }

    // 4. FOOTER / BAGIAN BAWAH HALAMAN
    if (position === 'atas_footer' || lower.includes('footer') || lower.includes('penutup') || (lower.includes('bawah') && lower.includes('halaman'))) {
      const footer = document.querySelector('footer, .site-footer, .main-footer');
      if (footer && footer.parentNode) {
        const wrapper = getOrCreateSectionWrapper('32px 20px 20px');
        applyBtnAlignment(btnWrap);
        footer.parentNode.insertBefore(wrapper, footer);
        btnWrap.setAttribute('data-flipbook-placed', position);
        initTriggerButtons();
        return;
      }
    }

    // 5. SOSIAL MEDIA / BAGIKAN / SHARE (Khusus artikel & berita kabar.html)
    if (lower.includes('sosial') || lower.includes('social') || lower.includes('sosmed') || lower.includes('share') || lower.includes('bagikan') || lower.includes('wa') || lower.includes('instagram')) {
      const socialEl = document.querySelector('.kabar-share-section, .kabar-share-compact, .sidebar-social-row, [class*="share"]');
      if (socialEl && socialEl.parentNode) {
        applyBtnAlignment(btnWrap);
        if (isAbove || isLeft || !isBelow) {
          socialEl.parentNode.insertBefore(btnWrap, socialEl);
        } else {
          socialEl.parentNode.insertBefore(btnWrap, socialEl.nextSibling);
        }
        hideUnusedPlacementWrapper();
        btnWrap.setAttribute('data-flipbook-placed', position);
        initTriggerButtons();
        return;
      }
    }

    // 6. ARTIKEL / KONTEN / BERITA (contoh: "bawah artikel", "isi berita", "dalam artikel")
    if (lower.includes('artikel') || lower.includes('berita') || lower.includes('isi') || lower.includes('paragraf') || lower.includes('konten') || lower.includes('baca')) {
      if (currentPage === 'kabar.html') {
        // Pada kabar.html, tombol di dalam modal artikel dikelola secara dinamis dan eksklusif
        // oleh injectModalArticleFlipbook (hanya muncul khusus pada artikel Analisis Literasi dan Numerasi).
        btnWrap.style.display = 'none';
        hideUnusedPlacementWrapper();
        return;
      }
      const artEl = document.querySelector('#modalArticleContent, .kabar-detail-prose, .kabar-articles-grid, article, .content-container');
      if (artEl && artEl.parentNode) {
        applyBtnAlignment(btnWrap);
        if (isAbove) {
          artEl.parentNode.insertBefore(btnWrap, artEl);
        } else {
          artEl.parentNode.insertBefore(btnWrap, artEl.nextSibling);
        }
        hideUnusedPlacementWrapper();
        btnWrap.setAttribute('data-flipbook-placed', position);
        initTriggerButtons();
        return;
      }
    }

    // 7. SEKSI LAINNYA BERDASARKAN KATA KUNCI (Donasi, Mitra, Relawan, Program, Unit, Tim, Visi)
    let targetSection = null;
    if (lower.includes('donasi') || lower.includes('rekening') || lower.includes('infaq')) {
      targetSection = document.querySelector('#donasi, .home-donasi-section, [id*="donasi"]');
    } else if (lower.includes('mitra') || lower.includes('kerjasama') || lower.includes('partner')) {
      targetSection = document.querySelector('#mitra-section, .home-mitra-section, [id*="mitra"]');
    } else if (lower.includes('relawan') || lower.includes('volunteer')) {
      targetSection = document.querySelector('[id*="relawan"], [class*="relawan"]');
    } else if (lower.includes('program') || lower.includes('layanan')) {
      targetSection = document.querySelector('#program-layanan-preview, [id*="program"]');
    } else if (lower.includes('unit') || lower.includes('sekolah') || lower.includes('juara') || lower.includes('setara')) {
      targetSection = document.querySelector('#unit-pendidikan, [id*="unit"], [id*="sekolah"]');
    } else if (lower.includes('milestone') || lower.includes('timeline')) {
      targetSection = document.querySelector('#milestone, .milestone-section-wrap');
    } else if (lower.includes('tim') || lower.includes('struktur') || lower.includes('pembina')) {
      targetSection = document.querySelector('.struktur-organisasi-section, #struktur, #tim');
    } else if (lower.includes('visi') || lower.includes('misi')) {
      targetSection = document.querySelector('#visi-misi, .visi-misi-section');
    }

    if (targetSection && targetSection.parentNode) {
      applyBtnAlignment(btnWrap);
      if (isAbove) {
        targetSection.parentNode.insertBefore(btnWrap, targetSection);
      } else {
        targetSection.parentNode.insertBefore(btnWrap, targetSection.nextSibling);
      }
      hideUnusedPlacementWrapper();
      btnWrap.setAttribute('data-flipbook-placed', position);
      initTriggerButtons();
      return;
    }

    // 8. SELECTOR CSS EKSPLISIT ATAU ID / CLASS LANGSUNG (jika ada admin teknis yang mengetik selector)
    let explicitEl = null;
    if (cleanPos.startsWith('#') || cleanPos.startsWith('.')) {
      try { explicitEl = document.querySelector(cleanPos); } catch (e) {}
    }
    if (!explicitEl) {
      explicitEl = document.getElementById(cleanPos.replace(/^#/, ''));
    }
    if (!explicitEl) {
      try { explicitEl = document.querySelector(`.${cleanPos.replace(/^\./, '')}`); } catch (e) {}
    }
    if (explicitEl && explicitEl.parentNode) {
      applyBtnAlignment(btnWrap);
      if (isAbove) {
        explicitEl.parentNode.insertBefore(btnWrap, explicitEl);
      } else {
        explicitEl.parentNode.insertBefore(btnWrap, explicitEl.nextSibling);
      }
      hideUnusedPlacementWrapper();
      btnWrap.setAttribute('data-flipbook-placed', position);
      initTriggerButtons();
      return;
    }

    // 9. PENCARIAN TEKS ALAMI PADA KONTEN HALAMAN (Fuzzy DOM text search)
    const stopWords = ['di', 'ke', 'dari', 'pada', 'yang', 'dan', 'atau', 'ini', 'itu', 'atas', 'bawah', 'kiri', 'kanan', 'posisi', 'halaman'];
    const words = lower.split(/[^a-z0-9_-]+/).filter(w => w.length >= 3 && !stopWords.includes(w));
    if (words.length > 0) {
      const candidates = document.querySelectorAll('main section, main h2, main h3, main h4, .container > div');
      let bestEl = null;
      let maxHits = 0;
      candidates.forEach(cand => {
        const text = cand.textContent.toLowerCase();
        let hits = 0;
        words.forEach(w => { if (text.includes(w)) hits++; });
        if (hits > maxHits) {
          maxHits = hits;
          bestEl = cand;
        }
      });
      if (bestEl && bestEl.parentNode) {
        applyBtnAlignment(btnWrap);
        if (isAbove) {
          bestEl.parentNode.insertBefore(btnWrap, bestEl);
        } else {
          bestEl.parentNode.insertBefore(btnWrap, bestEl.nextSibling);
        }
        hideUnusedPlacementWrapper();
        btnWrap.setAttribute('data-flipbook-placed', position);
        initTriggerButtons();
        return;
      }
    }

    // 10. Fallback jika tidak ada yang cocok:
    if (currentPage === 'kisah-kami.html') {
      const deskripsi = document.getElementById('sejarahSingkatDeskripsi') ||
                        document.querySelector('.sejarah-grid .reveal p:last-of-type') ||
                        document.querySelector('.sejarah-grid');
      if (deskripsi && deskripsi.parentNode) {
        btnWrap.style.margin = '26px 0 0 0';
        btnWrap.style.display = 'block';
        btnWrap.style.textAlign = 'left';
        btnWrap.style.visibility = 'visible';
        btnWrap.style.opacity = '1';
        if (deskripsi.nextElementSibling !== btnWrap) {
          deskripsi.parentNode.insertBefore(btnWrap, deskripsi.nextSibling);
        }
        hideUnusedPlacementWrapper();
        btnWrap.setAttribute('data-flipbook-placed', 'bawah_deskripsi_sejarah');
        initTriggerButtons();
        return;
      }
    }

    const fallbackSection = document.querySelector('.page-hero, #heroSlider, #kabarHeroBanner, main > section, section');
    if (fallbackSection && fallbackSection.parentNode) {
      const wrapper = getOrCreateSectionWrapper('24px 20px');
      applyBtnAlignment(btnWrap);
      fallbackSection.parentNode.insertBefore(wrapper, fallbackSection.nextSibling);
    } else {
      const main = document.querySelector('main') || document.body;
      applyBtnAlignment(btnWrap);
      main.appendChild(btnWrap);
    }
    btnWrap.setAttribute('data-flipbook-placed', position);
    initTriggerButtons();
  }

  /**
   * Inisialisasi flipbook dinamis berdasarkan halaman saat ini
   */
  async function initDynamicPageFlipbook() {
    const pageName = getCurrentPageName();
    const doc = await fetchActiveFlipbook(pageName);

    const isActive = doc && String(doc.status || 'aktif').trim().toLowerCase() === 'aktif';
    if (isActive) {
      activeFlipbookDoc = doc;
      const targetUrl = doc.file_url || doc.fileUrl;
      if (targetUrl) {
        if (PDF_FILE_PATH !== targetUrl) {
          PDF_FILE_PATH = targetUrl;
          if (currentLoadedPdfPath !== PDF_FILE_PATH) {
            safelyDestroyFlipBook();
            pdfDocInstance = null;
            currentLoadedPdfPath = null;
            renderedPages.clear();
            renderingPromises.clear();
            const bookContainer = getBookContainer();
            if (bookContainer) bookContainer.innerHTML = '';
          }
        }
      }
      ensureFlipbookModalExists(doc);
      updateModalInfo(doc);
      applyFlipbookPlacement(doc);

      // Preload PDF dokumen yang benar di background
      preloadPdfInBackground();
    } else {
      // HANYA sembunyikan jika secara eksplisit status dokumennya nonaktif
      if (doc && String(doc.status || '').toLowerCase() === 'nonaktif') {
        const existingWrap = document.getElementById('wrapProfilLembagaBtn');
        if (existingWrap) existingWrap.style.display = 'none';
        const existingPlacementWrap = document.getElementById('flipbookPlacementWrapper');
        if (existingPlacementWrap) existingPlacementWrap.style.display = 'none';
        const existingModalWrap = document.getElementById('wrapProfilLembagaBtnModal');
        if (existingModalWrap) existingModalWrap.style.display = 'none';
      }
    }
  }

  /**
   * 1. Hubungkan tombol pemicu "Profil Lembaga ACF Eduhub" di halaman publik
   */
  function initTriggerButtons() {
    const triggerBtns = document.querySelectorAll('.btn-profil-lembaga, [data-open-flipbook="profil-lembaga"], #btnProfilLembaga');
    triggerBtns.forEach((btn) => {
      if (btn.getAttribute('data-flipbook-bound') === 'true') return;
      btn.setAttribute('data-flipbook-bound', 'true');

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openFlipbookModal(activeFlipbookDoc);
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
        const modal = document.getElementById('flipbookModal');
        const isActive = modal && modal.classList.contains('active');
        const isStandalone = document.body && document.body.classList.contains('flipbook-standalone-body');

        if (!isActive && !isStandalone) return;

        if (e.key === 'Escape') {
          closeFlipbookModal();
        } else if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
          flipNext();
        } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
          flipPrev();
        }
      });
    }
  }

  /**
   * Delegasi klik global pada dokumen — menjamin tombol SELALU bisa diklik kapan pun!
   */
  function initGlobalDelegation() {
    if (window.__acfFlipbookGlobalClickBound) return;
    window.__acfFlipbookGlobalClickBound = true;

    document.addEventListener('click', (e) => {
      const trigger = e.target.closest(
        '.btn-profil-lembaga, [data-open-flipbook="profil-lembaga"], a[href="#profil-lembaga"], #btnProfilLembaga'
      );
      if (trigger) {
        e.preventDefault();
        openFlipbookModal(activeFlipbookDoc);
        return;
      }

      const landscapeTrigger = e.target.closest('#btnFlipbookLandscape, .btn-tool-landscape');
      if (landscapeTrigger) {
        e.preventDefault();
        e.stopPropagation();
        toggleLandscapeMode();
        return;
      }
    });
  }

  /**
   * Hubungkan toggle klik untuk Navbar atas & bawah (transparan / bisa dihilangkan saat diklik baru muncul)
   */
  function initNavbarToggle() {
    const stage = document.getElementById('flipbookStage') || document.querySelector('.flipbook-stage');

    if (stage && !stage.getAttribute('data-nav-toggle-bound')) {
      stage.setAttribute('data-nav-toggle-bound', 'true');
      stage.addEventListener('click', (e) => {
        if (e.target.closest('.flipbook-header, .flipbook-bottom-bar, .flipbook-nav-btn, .flipbook-floating-close, a, button, input')) {
          return;
        }
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
   * FITUR MODE LANDSCAPE:
   * Mengubah orientasi dan memaksimalkan tampilan buku di HP/Mobile
   */
  async function toggleLandscapeMode() {
    const modal = document.getElementById('flipbookModal');
    if (!modal) return;

    const btn = document.getElementById('btnFlipbookLandscape');
    const isLandscape = window.innerWidth > window.innerHeight;

    // 1. Coba Screen Orientation API (Android Chrome & browser modern)
    if (screen.orientation && screen.orientation.lock) {
      try {
        if (!isLandscape) {
          if (!document.fullscreenElement) {
            const req = (modal && (modal.requestFullscreen || modal.webkitRequestFullscreen)) || document.documentElement.requestFullscreen;
            if (req) await req.call(modal || document.documentElement);
          }
          await screen.orientation.lock('landscape');
          if (btn) btn.classList.add('active');
          showFlipbookToast('Layar diputar ke Mode Landscape');
          return;
        } else {
          if (screen.orientation.unlock) {
            screen.orientation.unlock();
          }
          if (document.fullscreenElement && document.exitFullscreen) {
            await document.exitFullscreen().catch(() => {});
          }
          if (btn) btn.classList.remove('active');
          showFlipbookToast('Kembali ke Mode Portrait');
          return;
        }
      } catch (err) {
        console.log('Screen orientation lock fallback:', err);
      }
    }

    // 2. Fallback untuk browser yang tidak mendukung lock orientasi (misal iOS Safari):
    if (!document.fullscreenElement) {
      const req = (modal && (modal.requestFullscreen || modal.webkitRequestFullscreen)) || document.documentElement.requestFullscreen;
      if (req) {
        try {
          await req.call(modal || document.documentElement);
        } catch (e) {}
      }
    }
    showFlipbookToast('Silakan putar HP Anda ke samping (Landscape)');
  }

  /**
   * 2. Buka Modal Flipbook — Langsung tampil instan tanpa lag
   */
  async function openFlipbookModal(customDoc = null) {
    if (isModalOpening) return;
    isModalOpening = true;
    try {
      if (customDoc && typeof customDoc === 'object') {
        activeFlipbookDoc = normalizeFlipbookDoc(customDoc);
        const targetUrl = activeFlipbookDoc.file_url || activeFlipbookDoc.fileUrl;
        if (targetUrl && targetUrl !== PDF_FILE_PATH) {
          PDF_FILE_PATH = targetUrl;
          safelyDestroyFlipBook();
          pdfDocInstance = null;
          currentLoadedPdfPath = null;
          renderedPages.clear();
          renderingPromises.clear();
          const bookContainer = getBookContainer();
          if (bookContainer) bookContainer.innerHTML = '';
        }
      }

      let modal = document.getElementById('flipbookModal');
      if (!modal) {
        modal = ensureFlipbookModalExists(activeFlipbookDoc || {
          id: 1,
          title: 'Profil Lembaga ACF Eduhub',
          description: 'Dokumen Resmi Profil & Portofolio Dampak Yayasan',
          file_name: 'Profil Lembaga - ACF Eduhub.pdf',
          file_url: PDF_FILE_PATH,
          total_pages: 31,
          target_page: 'kisah-kami.html',
          position: 'bawah_deskripsi_sejarah',
          button_label: 'Profil Lembaga ACF Eduhub',
          status: 'aktif'
        });
      }

      if (!modal) return;

      if (activeFlipbookDoc) {
        updateModalInfo(activeFlipbookDoc);
      }

      // Tampilkan modal secara langsung
      modal.classList.add('active');
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

      // Tampilkan tip landscape khusus untuk pengguna HP portrait
      if (window.innerWidth <= 768 && window.innerHeight > window.innerWidth) {
        setTimeout(() => {
          showFlipbookToast('💡 Tip: Gunakan tombol Landscape untuk tampilan lebih jelas');
        }, 1200);
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
      initNavbarToggle();
      initTriggerButtons();

      // Muat dependencies dan buku
      await ensureDependenciesLoaded();

      if (currentLoadedPdfPath !== PDF_FILE_PATH) {
        safelyDestroyFlipBook();
        pdfDocInstance = null;
        currentLoadedPdfPath = null;
        renderedPages.clear();
        renderingPromises.clear();
        const bookContainer = getBookContainer();
        if (bookContainer) bookContainer.innerHTML = '';
      }

      if (!flipBookInstance) {
        await loadAndRenderFlipbook();
      } else {
        handleFlipbookResize();
      }
    } finally {
      isModalOpening = false;
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
    const btn = document.getElementById('btnFlipbookLandscape');
    if (btn) btn.classList.remove('active');
    document.body.style.overflow = '';

    const fullElem = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
    if (fullElem) {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }

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
   * 5. Muat PDF dan Render secara Progresif Cepat langsung dari dokumen PDF asli
   */
  async function loadAndRenderFlipbook() {
    if (isRendering) return;
    isRendering = true;

    await ensureDependenciesLoaded();

    const bookContainer = getBookContainer();
    if (!bookContainer) {
      isRendering = false;
      return;
    }

    if (typeof window.pdfjsLib === 'undefined') {
      console.warn('PDF.js belum termuat, mencoba memuat fallback iframe.');
      renderIframeFallback();
      isRendering = false;
      return;
    }

    try {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

      if (!pdfDocInstance || currentLoadedPdfPath !== PDF_FILE_PATH) {
        safelyDestroyFlipBook();
        renderedPages.clear();
        renderingPromises.clear();
        bookContainer.innerHTML = '';

        const loadingTask = window.pdfjsLib.getDocument(PDF_FILE_PATH);
        pdfDocInstance = await loadingTask.promise;
        currentLoadedPdfPath = PDF_FILE_PATH;
      }
      totalDocPages = pdfDocInstance.numPages;

      if (activeFlipbookDoc) {
        updateModalInfo(activeFlipbookDoc);
      }
      const pageBadge = document.getElementById('flipbookPageBadge');
      if (pageBadge) {
        pageBadge.textContent = `1 dari ${totalDocPages} Halaman`;
      }
      const pageRange = document.getElementById('flipbookRange') || document.getElementById('flipbookPageRange');
      if (pageRange) {
        pageRange.max = totalDocPages;
        pageRange.value = 1;
      }

      // 1. Deteksi aspect ratio asli dari PDF Page 1
      try {
        const page1 = await pdfDocInstance.getPage(1);
        const vp1 = page1.getViewport({ scale: 1.0 });
        activePdfPageWidth = vp1.width || 595;
        activePdfPageHeight = vp1.height || 842;
      } catch (eDim) {
        activePdfPageWidth = 595;
        activePdfPageHeight = 842;
      }

      // 2. Hitung dimensi optimal otomatis agar tidak terpotong sama sekali
      const dims = calculateOptimalBookDimensions(activePdfPageWidth, activePdfPageHeight);
      const baseWidth = dims.baseWidth;
      const baseHeight = dims.baseHeight;
      currentBaseWidth = baseWidth;
      currentBaseHeight = baseHeight;

      // 3. Pastikan elemen sheet & canvas terbuat
      createSheetElements(bookContainer);

      // 4. Skala render tajam beresolusi tinggi (Retina)
      const scale = getOptimalRenderScale(baseWidth, activePdfPageWidth);
      const session = ++currentRenderSession;

      // Render 3 Halaman Pertama secara Paralel Instan (< 150ms)
      const initialPages = [1, 2, 3].filter(p => p <= totalDocPages && !renderedPages.has(p));
      if (initialPages.length > 0) {
        await Promise.all(initialPages.map(p => renderSinglePdfPage(p, scale, session)));
      }

      // Pastikan sesi render ini masih aktif & belum ada instance aktif
      if (session !== currentRenderSession) return;
      if (!flipBookInstance) {
        // LANGSUNG Inisialisasi StPageFlip agar buku segera tampil di hadapan user
        initStPageFlip(bookContainer, baseWidth, baseHeight, 0);
      }

      // Siapkan halaman 4 dan 5 di background secara paralel
      if (totalDocPages >= 5) {
        Promise.all([
          renderSinglePdfPage(4, scale, session),
          renderSinglePdfPage(5, scale, session)
        ]).then(() => {
          renderRemainingPagesInBackground(session);
        }).catch(() => {});
      } else {
        renderRemainingPagesInBackground(session);
      }

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
  async function renderSinglePdfPage(pageNum, scale = null, sessionId = null) {
    if (!pdfDocInstance) return;
    const session = sessionId !== null ? sessionId : currentRenderSession;
    if (session !== currentRenderSession) return;

    // Pastikan setidaknya satu canvas dengan ID ini ada di DOM
    const canvas = document.getElementById(`flip_canvas_${pageNum}`);
    if (!canvas) return;

    // Jika sudah dirender dan ukuran canvas di DOM memang valid (> 0 piksel), hindari re-render berlebih
    if (renderedPages.has(pageNum) && canvas.width > 0 && canvas.height > 0) return;

    if (renderingPromises.has(pageNum)) {
      return renderingPromises.get(pageNum);
    }

    const actualScale = scale || getOptimalRenderScale();

    const promise = (async () => {
      try {
        const page = await pdfDocInstance.getPage(pageNum);
        if (session !== currentRenderSession) return;
        const viewport = page.getViewport({ scale: actualScale });

        const canvases = document.querySelectorAll(`canvas[id="flip_canvas_${pageNum}"]`);
        if (canvases.length === 0) return;

        const primaryCanvas = canvases[0];
        const context = primaryCanvas.getContext('2d');
        primaryCanvas.width = viewport.width;
        primaryCanvas.height = viewport.height;
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';

        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;

        if (session !== currentRenderSession) return;
        renderedPages.add(pageNum);

        // Salin pixel buffer ke canvas duplikat / clone lainnya jika ada (misal temporary animation copy)
        for (let i = 1; i < canvases.length; i++) {
          const c = canvases[i];
          c.width = viewport.width;
          c.height = viewport.height;
          const ctx = c.getContext('2d');
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(primaryCanvas, 0, 0);
          }
        }

        const sheet = primaryCanvas.closest('.page-sheet');
        if (sheet) sheet.classList.add('rendered');
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
   * Render sisa halaman di background secara idle tanpa membebani browser
   */
  async function renderRemainingPagesInBackground(sessionId = null) {
    const session = sessionId !== null ? sessionId : currentRenderSession;
    const scale = getOptimalRenderScale();
    for (let pageNum = 1; pageNum <= totalDocPages; pageNum++) {
      if (session !== currentRenderSession) return;
      if (!renderedPages.has(pageNum)) {
        await renderSinglePdfPage(pageNum, scale, session);
        if (session !== currentRenderSession) return;
        await new Promise(r => setTimeout(r, 35));
      }
    }
  }

  /**
   * Pastikan halaman yang sedang dibuka user langsung dirender PARALEL dengan prioritas tertinggi
   */
  async function ensureNearbyPages(pageIndex, forceRerender = false) {
    if (!pdfDocInstance) return;

    const scale = getOptimalRenderScale();
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      // Pada mobile: 1 halaman tunggal yang sedang aktif
      const activePage = Math.max(1, Math.min(totalDocPages, pageIndex + 1));

      if (forceRerender) {
        renderedPages.delete(activePage);
      }

      // 1. PRIORITAS UTAMA: Render 1 halaman aktif mobile
      if (!renderedPages.has(activePage)) {
        await renderSinglePdfPage(activePage, scale, currentRenderSession);
      }

      // 2. PRIORITAS KEDUA: Siapkan 1 halaman sebelum & 2 halaman sesudahnya di background
      const nearby = [
        activePage - 1,
        activePage + 1,
        activePage + 2
      ].filter(p => p >= 1 && p <= totalDocPages && !renderedPages.has(p));

      if (nearby.length > 0) {
        Promise.all(nearby.map(p => renderSinglePdfPage(p, scale, currentRenderSession))).catch(() => {});
      }
    } else {
      // Pada desktop: 2 halaman berdampingan (spread)
      let leftPage, rightPage;
      if (pageIndex === 0) {
        leftPage = 1;
        rightPage = 1;
      } else {
        leftPage = pageIndex % 2 === 1 ? pageIndex + 1 : pageIndex;
        rightPage = Math.min(leftPage + 1, totalDocPages);
      }

      if (forceRerender) {
        if (leftPage) renderedPages.delete(leftPage);
        if (rightPage) renderedPages.delete(rightPage);
      }

      // 1. PRIORITAS UTAMA: Render 2 halaman yang sedang dilihat user SECARA PARALEL!
      const currentSpread = [leftPage, rightPage].filter(p => p >= 1 && p <= totalDocPages && !renderedPages.has(p));
      if (currentSpread.length > 0) {
        await Promise.all(currentSpread.map(p => renderSinglePdfPage(p, scale, currentRenderSession)));
      }

      // 2. PRIORITAS KEDUA: Prefetch lembaran berikutnya dan sebelumnya secara paralel tanpa menunggu
      const nearby = [
        leftPage - 2, leftPage - 1,
        rightPage + 1, rightPage + 2, rightPage + 3, rightPage + 4
      ].filter(p => p >= 1 && p <= totalDocPages && !renderedPages.has(p));

      if (nearby.length > 0) {
        Promise.all(nearby.map(p => renderSinglePdfPage(p, scale, currentRenderSession))).catch(() => {});
      }
    }
  }

  /**
   * 7. Inisialisasi Perpustakaan StPageFlip (Efek 3D Lembaran Berputar)
   * KUNCI ANTI-DUPLIKAT (STRICT SINGLETON):
   * Memastikan tidak pernah ada 2 instance atau wrapper .stf__* yang menumpuk.
   */
  function initStPageFlip(container, width, height, startPage = 0) {
    container = container || getBookContainer();
    if (!container) return;
    if (typeof window.St === 'undefined' || typeof window.St.PageFlip === 'undefined') {
      console.warn('St.PageFlip tidak ditemukan, mengaktifkan mode navigasi standar.');
      return;
    }

    // 1. Singleton Guard: Hancurkan instance StPageFlip lama secara aman tanpa menghapus container dari DOM
    safelyDestroyFlipBook();

    // 2. SELALU BERSIHKAN jika container sudah pernah di-wrap oleh StPageFlip (.stf__block / .stf__wrapper)
    const hasOldWrappers = container.querySelector('.stf__wrapper, .stf__block, .stf__parent');
    const existingSheetCount = container.querySelectorAll('.page-sheet').length;

    if (hasOldWrappers || existingSheetCount !== totalDocPages || totalDocPages <= 0) {
      container.innerHTML = '';
      createSheetElements(container, true);
    }

    const dims = calculateOptimalBookDimensions(activePdfPageWidth, activePdfPageHeight);
    const bookW = width || dims.baseWidth;
    const bookH = height || dims.baseHeight;
    const isSinglePage = dims.isSinglePage;
    currentBaseWidth = bookW;
    currentBaseHeight = bookH;
    currentIsSinglePage = isSinglePage;

    const safeStartPage = Math.max(0, Math.min(startPage || 0, (totalDocPages || 1) - 1));
    window.__acfLastKnownPageIndex = safeStartPage;

    // KUNCI PRESISI UKURAN:
    // Pada mobile: 1 halaman tunggal (lebar = bookW)
    // Pada desktop/web: 2 halaman berdampingan (lebar = bookW * 2)
    const targetW = isSinglePage ? bookW : (bookW * 2);
    container.style.width = targetW + 'px';
    container.style.height = bookH + 'px';
    container.style.maxWidth = targetW + 'px';
    container.style.maxHeight = bookH + 'px';
    container.style.position = 'relative';

    flipBookInstance = new window.St.PageFlip(container, {
      startPage: safeStartPage,
      width: bookW,
      height: bookH,
      size: 'fixed',
      minWidth: bookW,
      maxWidth: targetW,
      minHeight: bookH,
      maxHeight: bookH,
      maxShadowOpacity: 0.6,
      showCover: !isSinglePage,
      mobileScrollSupport: false,
      usePortrait: isSinglePage,
      flippingTime: isSinglePage ? 450 : 650,
      drawShadow: true,
      autoSize: false
    });

    const sheets = container.querySelectorAll('.page-sheet');
    flipBookInstance.loadFromHTML(sheets);

    // Pasang patch canvas cloning agar animasi pembalikan halaman tidak kosong/putih
    installStPageFlipClonePatch(flipBookInstance);

    // Hubungkan kontrol navigasi
    initFlipControls();

    let initialPageApplied = (safeStartPage === 0);

    function enforceTargetPage() {
      if (initialPageApplied || safeStartPage === 0 || !flipBookInstance) return;
      try {
        const cur = flipBookInstance.getCurrentPageIndex();
        if (cur !== safeStartPage) {
          if (typeof flipBookInstance.turnToPage === 'function') {
            flipBookInstance.turnToPage(safeStartPage);
            initialPageApplied = true;
          } else if (typeof flipBookInstance.flip === 'function') {
            flipBookInstance.flip(safeStartPage);
            initialPageApplied = true;
          }
        } else {
          initialPageApplied = true;
        }
      } catch (_) {}
      updateCoverCentering(safeStartPage);
      updateNavButtonsState(safeStartPage);
    }

    // Event saat buku selesai dimuat / diinisialisasi
    flipBookInstance.on('init', () => {
      enforceTargetPage();
    });

    // Event saat halaman berganti
    flipBookInstance.on('flip', (e) => {
      window.__acfLastKnownPageIndex = e.data;
      updateNavButtonsState(e.data);
      ensureNearbyPages(e.data);
    });

    flipBookInstance.on('changeState', (e) => {
      if (flipBookInstance) {
        try {
          if (!initialPageApplied && e && e.data === 'read') {
            enforceTargetPage();
          }
          const cur = flipBookInstance.getCurrentPageIndex();
          window.__acfLastKnownPageIndex = cur;
          updateCoverCentering(cur);
          ensureNearbyPages(cur);
        } catch (err) {}
      }
    });

    // Update state awal secara langsung
    updateCoverCentering(safeStartPage);
    updateNavButtonsState(safeStartPage);

    // Backup checks memastikan halaman target selalu tercapai
    if (safeStartPage > 0) {
      requestAnimationFrame(enforceTargetPage);
      setTimeout(enforceTargetPage, 60);
      setTimeout(enforceTargetPage, 180);
      setTimeout(enforceTargetPage, 400);
    }
  }

  /**
   * 8. Kontrol Navigasi (Tombol Panah Bulat, Slider, Fullscreen, Landscape)
   */
  function initFlipControls() {
    const prevBtn = document.getElementById('btnNavPrev');
    const nextBtn = document.getElementById('btnNavNext');
    const firstBtn = document.getElementById('btnNavFirst');
    const lastBtn = document.getElementById('btnNavLast');
    const rangeSlider = document.getElementById('flipbookRange');
    const landscapeBtn = document.getElementById('btnFlipbookLandscape');

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

    if (landscapeBtn && !landscapeBtn.getAttribute('data-flipbook-bound')) {
      landscapeBtn.setAttribute('data-flipbook-bound', 'true');
      landscapeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleLandscapeMode();
      });
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
    const container = document.getElementById('flipbookBook');
    if (!container) return;

    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      // Pada tampilan mobile (1 halaman tunggal), posisi buku selalu tepat di tengah tanpa offset
      container.style.transform = 'none';
      return;
    }

    const total = totalDocPages || 31;
    if (pageIndex === 0) {
      // 1 halaman cover depan saja di tengah
      container.style.transform = 'translateX(-25%)';
    } else if (pageIndex >= total - 1 && total > 1) {
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
      if (isMobile) {
        // TAMPILAN MOBILE: 1 Halaman Tunggal
        if (currentPageIndex === 0) {
          pageBadge.textContent = `Cover • Hal 1 / ${total}`;
        } else if (currentPageIndex >= total - 1 && total > 1) {
          pageBadge.textContent = `Belakang • Hal ${total}`;
        } else {
          pageBadge.textContent = `Hal ${humanPage} / ${total}`;
        }
      } else {
        // TAMPILAN DESKTOP/WEB: 2 Halaman Berdampingan
        if (currentPageIndex === 0) {
          pageBadge.textContent = `Cover Depan • Hal 1 dari ${total}`;
        } else if (currentPageIndex >= total - 1 && total > 1) {
          pageBadge.textContent = `Cover Belakang • Hal ${total}`;
        } else {
          const leftPage = currentPageIndex % 2 === 1 ? currentPageIndex + 1 : currentPageIndex;
          const rightPage = Math.min(leftPage + 1, total);
          pageBadge.textContent = `Halaman ${leftPage}-${rightPage} dari ${total}`;
        }
      }
    }

    if (rangeSlider) {
      rangeSlider.max = total;
      rangeSlider.value = Math.max(1, Math.min(total, humanPage));
    }

    if (prevBtn) {
      prevBtn.disabled = currentPageIndex <= 0;
    }

    if (nextBtn) {
      nextBtn.disabled = currentPageIndex >= total - 1;
    }
  }

  /**
   * Helper: Perbarui icon dan status tombol Layar Penuh (Expand / Compress)
   */
  function updateFullscreenButtonState() {
    const btn = document.getElementById('btnFlipbookFullscreen');
    if (!btn) return;
    const isFull = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
    if (isFull) {
      btn.classList.add('active');
      btn.title = 'Keluar Layar Penuh';
      btn.setAttribute('aria-label', 'Keluar Layar Penuh');
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
        </svg>
      `;
    } else {
      btn.classList.remove('active');
      btn.title = 'Layar Penuh';
      btn.setAttribute('aria-label', 'Layar Penuh');
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
        </svg>
      `;
    }
  }

  /**
   * 10. Toggle Fullscreen Browser dengan Dukungan Penuh
   */
  async function toggleFullscreen() {
    const modal = document.getElementById('flipbookModal');
    const elem = modal || document.documentElement;
    try {
      const isFull = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
      if (!isFull) {
        const req = elem.requestFullscreen || elem.webkitRequestFullscreen || elem.mozRequestFullScreen || elem.msRequestFullscreen;
        if (req) {
          await req.call(elem);
        }
      } else {
        const exit = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
        if (exit) {
          await exit.call(document);
        }
      }
    } catch (err) {
      console.warn('Fullscreen toggle error:', err);
    }
    updateFullscreenButtonState();
    handleFlipbookResize();
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

  // Responsif resize dan rotasi layar perangkat dengan Auto-Refit Otomatis
  function handleFlipbookResize() {
    clearTimeout(resizeDebounceTimer);
    resizeDebounceTimer = setTimeout(() => {
      const modal = document.getElementById('flipbookModal');
      if (!modal || !modal.classList.contains('active')) return;
      if (!pdfDocInstance) return;
      if (isRendering) {
        // Tunda refit jika render awal sedang berlangsung
        return;
      }

      let curPage = 0;
      if (flipBookInstance && typeof flipBookInstance.getCurrentPageIndex === 'function') {
        try {
          curPage = flipBookInstance.getCurrentPageIndex();
        } catch (_) {}
      } else if (typeof window.__acfLastKnownPageIndex === 'number') {
        curPage = window.__acfLastKnownPageIndex;
      }

      const newDims = calculateOptimalBookDimensions(activePdfPageWidth, activePdfPageHeight);

      // Jika ukuran layar berubah signifikan (> 8px) atau berpindah mode single-page (mobile vs desktop)
      if (!flipBookInstance || newDims.isSinglePage !== currentIsSinglePage || Math.abs(newDims.baseWidth - currentBaseWidth) > 8 || Math.abs(newDims.baseHeight - currentBaseHeight) > 8) {
        reFitFlipbook(curPage);
      } else {
        updateCoverCentering(curPage);
      }
    }, 200);
  }

  /**
   * Menyesuaikan ulang ukuran Flipbook saat orientasi HP berubah, jendela browser di-resize, atau mode layar penuh
   * KUNCI: Menjaga seluruh elemen lembaran & canvas agar BUKU TIDAK HILANG saat resize/fullscreen!
   */
  function reFitFlipbook(targetPageIndex = 0) {
    if (!pdfDocInstance || isRendering) return;
    const bookContainer = getBookContainer();
    if (!bookContainer) return;

    const dims = calculateOptimalBookDimensions(activePdfPageWidth, activePdfPageHeight);
    currentBaseWidth = dims.baseWidth;
    currentBaseHeight = dims.baseHeight;
    currentIsSinglePage = dims.isSinglePage;

    const safeTarget = Math.max(0, Math.min(targetPageIndex, (totalDocPages || 1) - 1));
    window.__acfLastKnownPageIndex = safeTarget;

    // Bersihkan instance lama dengan aman tanpa menghapus kontainer dari DOM
    safelyDestroyFlipBook();
    bookContainer.innerHTML = '';
    createSheetElements(bookContainer, true);

    // Inisialisasi ulang StPageFlip dengan ukuran dan target halaman baru
    initStPageFlip(bookContainer, dims.baseWidth, dims.baseHeight, safeTarget);

    // Mulai sesi render baru untuk resolusi ukuran layar saat ini
    const session = ++currentRenderSession;
    renderedPages.clear();
    renderingPromises.clear();

    // Render halaman yang sedang dilihat dan sekitarnya
    ensureNearbyPages(safeTarget);
    renderRemainingPagesInBackground(session);
  }

  window.addEventListener('resize', handleFlipbookResize);
  window.addEventListener('orientationchange', handleFlipbookResize);
  document.addEventListener('fullscreenchange', () => {
    updateFullscreenButtonState();
    handleFlipbookResize();
  });
  document.addEventListener('webkitfullscreenchange', () => {
    updateFullscreenButtonState();
    handleFlipbookResize();
  });
  document.addEventListener('mozfullscreenchange', () => {
    updateFullscreenButtonState();
    handleFlipbookResize();
  });
  document.addEventListener('MSFullscreenChange', () => {
    updateFullscreenButtonState();
    handleFlipbookResize();
  });

  // Real-time synchronization via BroadcastChannel across browser tabs
  try {
    const channel = new BroadcastChannel('acf_flipbook_channel');
    channel.onmessage = (event) => {
      if (event && event.data && event.data.type === 'flipbook_updated') {
        initDynamicPageFlipbook();
      }
    };
  } catch (_) {}

  // Auto-sinkronisasi bila admin baru saja mengunggah/mengedit flipbook di portal admin
  window.addEventListener('storage', (e) => {
    if (e.key === 'acf_flipbooks_data' || (e.key && e.key.startsWith('acf_active_flipbook_')) || e.key === 'acf_latest_uploaded_flipbook') {
      initDynamicPageFlipbook();
    }
  });
  window.addEventListener('acf_flipbook_updated', () => {
    initDynamicPageFlipbook();
  });

  // Ekspor fungsi ke window agar dapat dipanggil dari luar
  window.openProfilLembagaFlipbook = openFlipbookModal;
  window.openFlipbookModal = openFlipbookModal;
  window.closeProfilLembagaFlipbook = closeFlipbookModal;
  window.closeFlipbookModal = closeFlipbookModal;
  window.initACFFlipbook = initDynamicPageFlipbook;
  window.toggleFlipbookNavbars = toggleNavbars;
  window.toggleFlipbookLandscape = toggleLandscapeMode;
  window.reFitACFFlipbook = reFitFlipbook;

  // Inisialisasi awal saat script dimuat
  async function bootFlipbook() {
    initTriggerButtons();
    initGlobalDelegation();
    await initDynamicPageFlipbook();
    initUrlHashCheck();

    // Pastikan tombol flipbook selalu tampil terlihat jelas dan tidak tersembunyi
    const placedBtn = document.getElementById('wrapProfilLembagaBtn');
    if (placedBtn) {
      if (!placedBtn.style.display || placedBtn.style.display === 'none') {
        placedBtn.style.display = placedBtn.closest('#flipbookPlacementWrapper') ? 'inline-flex' : 'block';
      }
      placedBtn.style.visibility = 'visible';
      placedBtn.style.opacity = '1';
    }

    if (document.body && document.body.classList.contains('flipbook-standalone-body')) {
      initNavbarToggle();
      loadAndRenderFlipbook();
    }
  }

  initGlobalDelegation();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootFlipbook);
  } else {
    bootFlipbook();
  }
})();