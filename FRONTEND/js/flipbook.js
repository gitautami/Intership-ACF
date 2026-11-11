/**
 * ACF EDUHUB — Interactive PDF Flipbook Engine
 * Mengubah Dokumen PDF (Profil Lembaga ACF Eduhub & Dokumen Lainnya) menjadi Flipbook 3D interaktif.
 * Mendukung penempatan dinamis per halaman, responsif mobile, serta Fitur Mode Landscape untuk HP.
 */

(function () {
  'use strict';

  let PDF_FILE_PATH = '';
  let activeFlipbookDoc = null;
  let flipBookInstance = null;
  let pdfDocInstance = null;
  let currentLoadedPdfPath = null;
  let isRendering = false;
  let totalDocPages = 0;
  let activePdfPageWidth = 595;
  let activePdfPageHeight = 842;
  let currentBaseWidth = 0;
  let currentBaseHeight = 0;
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

    // 5. Fallback khusus untuk profil-lembaga.html HANYA jika tidak ada dokumen custom lain
    if (cleanPage === 'profil-lembaga.html') {
      return normalizeFlipbookDoc({
        id: 1,
        title: 'Profil Lembaga ACF Eduhub',
        description: 'Dokumen Resmi Profil & Portofolio Dampak Yayasan',
        file_name: 'Profil Lembaga - ACF Eduhub.pdf',
        file_url: '../assets/tentang/Profil Lembaga - ACF Eduhub.pdf',
        total_pages: 31,
        target_page: 'profil-lembaga.html',
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
      link.href = '../css/flipbook.css?v=20261111_landscape_v2';
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

    const hasTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    const isMobile = screenW <= 768 || (screenH <= 550 && screenW <= 1024) || (hasTouch && screenW <= 1024);
    const isLandscape = screenW > screenH;

    // Hitung aspect ratio dokumen asli (Tinggi / Lebar per lembar)
    const validW = Math.max(100, Number(pdfPageW) || 595);
    const validH = Math.max(100, Number(pdfPageH) || 842);
    const pageRatio = validH / validW;

    let availW, availH;

    if (isMobile) {
      if (isLandscape) {
        // Mode Landscape HP: Navigasi minimalis, maksimalkan tinggi dan lebar
        // Safe margin: Top/Bottom header & mini controls bar = ~46px, Left/Right = ~36px
        availH = Math.max(180, screenH - 46);
        availW = Math.max(260, screenW - 36);
      } else {
        // Mode Portrait HP: Dua halaman berdampingan harus muat dalam layar sempit
        // Safe margin: Header modal + Bottom controls = ~100px, Side margin = ~20px
        availH = Math.max(240, screenH - 100);
        availW = Math.max(240, screenW - 20);
      }
    } else {
      // Desktop / Laptop:
      // Safe margin: Header modal (~64px) + Bottom bar (~54px) + padding = ~134px
      // Side buttons (Prev/Next floating buttons ~50px each side + padding) = ~140px
      availH = Math.max(300, screenH - 134);
      availW = Math.max(300, screenW - 140);
    }

    // Buku terdiri dari 2 lembar berdampingan (Total Lebar = 2 * baseWidth)
    // Syarat presisi anti-terpotong:
    // 1) 2 * baseWidth <= availW  ==> baseWidth <= availW / 2
    // 2) baseHeight <= availH     ==> baseWidth * pageRatio <= availH ==> baseWidth <= availH / pageRatio
    let maxWByHeight = Math.floor(availH / pageRatio);
    let maxWByWidth = Math.floor(availW / 2);
    let baseWidth = Math.min(maxWByWidth, maxWByHeight);

    // Batasan minimum yang aman
    const minW = isMobile ? (isLandscape ? 120 : 85) : 180;
    const maxW = isMobile ? 800 : 750;

    baseWidth = Math.max(minW, Math.min(maxW, baseWidth));

    // KUNCI UTAMA ANTI-TERPOTONG: Jika minW membuat baseHeight > availH, sesuaikan agar tetap muat 100%
    if (baseWidth * pageRatio > availH) {
      baseWidth = Math.floor(availH / pageRatio);
    }
    const baseHeight = Math.round(baseWidth * pageRatio);

    return {
      baseWidth,
      baseHeight,
      pageRatio,
      isMobile,
      isLandscape,
      isForcedLandscape
    };
  }

  /**
   * Helper: Dapatkan skala render optimal beresolusi tinggi (High-DPI / Retina) agar teks tajam & jelas dibaca
   */
  function getOptimalRenderScale(baseWidth = null, pdfUnscaledW = null) {
    const w = baseWidth || currentBaseWidth || (window.innerWidth <= 768 ? 260 : 500);
    const naturalW = Math.max(100, Number(pdfUnscaledW || activePdfPageWidth) || 595);
    const dpr = Math.max(window.devicePixelRatio || 1, 1.5);
    const targetPixelWidth = Math.max(w * dpr, 1200);
    const computedScale = targetPixelWidth / naturalW;
    return Math.max(2.0, Math.min(3.2, computedScale));
  }

  /**
   * Helper: Siapkan semua lembaran (sheet) & canvas langsung dari dokumen PDF asli
   */
  function createSheetElements(bookContainer) {
    if (!bookContainer || bookContainer.querySelector('.page-sheet') || totalDocPages <= 0) return;
    bookContainer.innerHTML = '';

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

          const bookContainer = document.getElementById('flipbookBook');
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
            <button type="button" class="flipbook-btn-tool" id="btnFlipbookFullscreen" title="Layar Penuh" aria-label="Layar Penuh">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
              </svg>
            </button>
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
      const existingWrap = document.getElementById('wrapProfilLembagaBtn');
      if (existingWrap) existingWrap.style.display = 'none';
      const existingPlacementWrap = document.getElementById('flipbookPlacementWrapper');
      if (existingPlacementWrap) existingPlacementWrap.style.display = 'none';
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
          }
        });
        observer.observe(artModal, { attributes: true, attributeFilter: ['class', 'style'] });
      }
    }

    function injectModalArticleFlipbook(activeDoc) {
      if (!activeDoc) return;
      const modalShare = document.querySelector('.kabar-detail-content-wrap .kabar-share-section, .kabar-share-section');
      const modalContent = document.getElementById('modalArticleContent');
      if (!modalShare && !modalContent) return;

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
            <span class="btn-profil-text">${escapeHTML(buttonText)}</span>
            <span class="btn-profil-icon-arrow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </span>
          </a>
        `;
        modalBtnWrap.querySelector('a').addEventListener('click', (e) => {
          e.preventDefault();
          openFlipbookModal(activeDoc);
        });
      }

      applyBtnAlignment(modalBtnWrap);
      modalBtnWrap.style.margin = '20px 0 16px 0';

      if (modalShare && modalShare.parentNode) {
        modalShare.parentNode.insertBefore(modalBtnWrap, modalShare);
      } else if (modalContent && modalContent.parentNode) {
        modalContent.parentNode.insertBefore(modalBtnWrap, modalContent.nextSibling);
      }
    }

    // 1. SOSIAL MEDIA / BAGIKAN / SHARE (contoh: "kiri atas sosial media", "atas sosmed", dsb)
    if (lower.includes('sosial') || lower.includes('social') || lower.includes('sosmed') || lower.includes('share') || lower.includes('bagikan') || lower.includes('wa') || lower.includes('instagram')) {
      const socialEl = document.querySelector('.kabar-share-section, .kabar-share-compact, .sidebar-social-row, .footer-social-boxes, [class*="share"], [class*="social"]');
      if (socialEl && socialEl.parentNode) {
        applyBtnAlignment(btnWrap);
        if (isAbove || isLeft || !isBelow) {
          socialEl.parentNode.insertBefore(btnWrap, socialEl);
        } else {
          socialEl.parentNode.insertBefore(btnWrap, socialEl.nextSibling);
        }
        btnWrap.setAttribute('data-flipbook-placed', position);
        initTriggerButtons();
        return;
      }
    }

    // 2. ARTIKEL / KONTEN / BERITA (contoh: "bawah artikel", "isi berita", "dalam artikel")
    if (lower.includes('artikel') || lower.includes('berita') || lower.includes('isi') || lower.includes('paragraf') || lower.includes('konten') || lower.includes('baca')) {
      const artEl = document.querySelector('#modalArticleContent, .kabar-detail-prose, .kabar-articles-grid, article, .content-container, main .container');
      if (artEl && artEl.parentNode) {
        applyBtnAlignment(btnWrap);
        if (isAbove) {
          artEl.parentNode.insertBefore(btnWrap, artEl);
        } else {
          artEl.parentNode.insertBefore(btnWrap, artEl.nextSibling);
        }
        btnWrap.setAttribute('data-flipbook-placed', position);
        initTriggerButtons();
        return;
      }
    }

    // 3. DESKRIPSI SEJARAH SINGKAT / CERITA KAMI
    if (lower.includes('deskripsi') || lower.includes('sejarah') || lower.includes('cerita') || lower.includes('kisah') || position === 'bawah_deskripsi_sejarah') {
      const deskripsi = document.getElementById('sejarahSingkatDeskripsi') ||
                        document.querySelector('.sejarah-grid .reveal p:last-of-type') ||
                        document.querySelector('#ringkasan-tentang .ringkasan-tentang-body') ||
                        document.querySelector('.sejarah-grid .reveal') ||
                        document.querySelector('.sejarah-grid') ||
                        document.querySelector('.reveal p');
      if (deskripsi && deskripsi.parentNode) {
        applyBtnAlignment(btnWrap);
        deskripsi.parentNode.insertBefore(btnWrap, deskripsi.nextSibling);
        btnWrap.setAttribute('data-flipbook-placed', position);
        initTriggerButtons();
        return;
      }
    }

    // 4. BANNER HERO UTAMA / HEADER ATAS
    if (lower.includes('hero') || lower.includes('banner') || lower.includes('slider') || position === 'bawah_hero' || (lower.includes('atas') && lower.includes('halaman'))) {
      const hero = document.querySelector('.page-hero, #heroSlider, #kabarHeroBanner, .home-hero-slider-section, .hero-section, main > section:first-of-type');
      if (hero && hero.parentNode) {
        const wrapper = getOrCreateSectionWrapper('24px 20px');
        applyBtnAlignment(btnWrap);
        hero.parentNode.insertBefore(wrapper, hero.nextSibling);
        btnWrap.setAttribute('data-flipbook-placed', position);
        initTriggerButtons();
        return;
      }
    }

    // 5. FOOTER / BAGIAN BAWAH HALAMAN
    if (lower.includes('footer') || lower.includes('penutup') || position === 'atas_footer' || (lower.includes('bawah') && lower.includes('halaman'))) {
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

    // 6. TENGAH KONTEN / HALAMAN
    if (lower.includes('tengah') || position === 'tengah_konten') {
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
        btnWrap.setAttribute('data-flipbook-placed', position);
        initTriggerButtons();
        return;
      }
    }

    // 10. Fallback jika tidak ada yang cocok: Tempatkan di bawah seksi pertama halaman
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
            if (flipBookInstance) {
              try { flipBookInstance.destroy(); } catch (e) {}
              flipBookInstance = null;
            }
            pdfDocInstance = null;
            currentLoadedPdfPath = null;
            renderedPages.clear();
            renderingPromises.clear();
            const bookContainer = document.getElementById('flipbookBook');
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
      const existingWrap = document.getElementById('wrapProfilLembagaBtn');
      if (existingWrap) existingWrap.style.display = 'none';
      const existingPlacementWrap = document.getElementById('flipbookPlacementWrapper');
      if (existingPlacementWrap) existingPlacementWrap.style.display = 'none';
      const existingModalWrap = document.getElementById('wrapProfilLembagaBtnModal');
      if (existingModalWrap) existingModalWrap.style.display = 'none';
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
    if (customDoc && typeof customDoc === 'object') {
      activeFlipbookDoc = normalizeFlipbookDoc(customDoc);
      const targetUrl = activeFlipbookDoc.file_url || activeFlipbookDoc.fileUrl;
      if (targetUrl && targetUrl !== PDF_FILE_PATH) {
        PDF_FILE_PATH = targetUrl;
        if (flipBookInstance) {
          try { flipBookInstance.destroy(); } catch (e) {}
          flipBookInstance = null;
        }
        pdfDocInstance = null;
        currentLoadedPdfPath = null;
        renderedPages.clear();
        renderingPromises.clear();
        const bookContainer = document.getElementById('flipbookBook');
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
      if (flipBookInstance) {
        try { flipBookInstance.destroy(); } catch (e) {}
        flipBookInstance = null;
      }
      pdfDocInstance = null;
      currentLoadedPdfPath = null;
      renderedPages.clear();
      renderingPromises.clear();
      const bookContainer = document.getElementById('flipbookBook');
      if (bookContainer) bookContainer.innerHTML = '';
    }

    if (!flipBookInstance) {
      await loadAndRenderFlipbook();
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

    const bookContainer = document.getElementById('flipbookBook');
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
        if (flipBookInstance) {
          try { flipBookInstance.destroy(); } catch (e) {}
          flipBookInstance = null;
        }
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

      // Render 3 Halaman Pertama secara Paralel Instan (< 150ms)
      const initialPages = [1, 2, 3].filter(p => p <= totalDocPages && !renderedPages.has(p));
      if (initialPages.length > 0) {
        await Promise.all(initialPages.map(p => renderSinglePdfPage(p, scale)));
      }

      // LANGSUNG Inisialisasi StPageFlip agar buku segera tampil di hadapan user
      initStPageFlip(bookContainer, baseWidth, baseHeight);

      // Siapkan halaman 4 dan 5 di background secara paralel
      if (totalDocPages >= 5) {
        Promise.all([
          renderSinglePdfPage(4, scale),
          renderSinglePdfPage(5, scale)
        ]).then(() => {
          renderRemainingPagesInBackground();
        }).catch(() => {});
      } else {
        renderRemainingPagesInBackground();
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
  async function renderSinglePdfPage(pageNum, scale = null) {
    if (!pdfDocInstance) return;
    if (renderedPages.has(pageNum)) return;
    if (renderingPromises.has(pageNum)) {
      return renderingPromises.get(pageNum);
    }

    const actualScale = scale || getOptimalRenderScale();

    const promise = (async () => {
      try {
        const page = await pdfDocInstance.getPage(pageNum);
        const viewport = page.getViewport({ scale: actualScale });
        const canvas = document.getElementById(`flip_canvas_${pageNum}`);
        if (!canvas) return;

        const context = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';

        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;

        renderedPages.add(pageNum);
        const sheet = canvas.closest('.page-sheet');
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
  async function renderRemainingPagesInBackground() {
    const scale = getOptimalRenderScale();
    for (let pageNum = 1; pageNum <= totalDocPages; pageNum++) {
      if (!renderedPages.has(pageNum)) {
        await renderSinglePdfPage(pageNum, scale);
        await new Promise(r => setTimeout(r, 35));
      }
    }
  }

  /**
   * Pastikan halaman yang sedang dibuka user langsung dirender PARALEL dengan prioritas tertinggi
   */
  async function ensureNearbyPages(pageIndex) {
    const scale = getOptimalRenderScale();
    let leftPage, rightPage;
    if (pageIndex === 0) {
      leftPage = 1;
      rightPage = 1;
    } else {
      leftPage = pageIndex % 2 === 1 ? pageIndex + 1 : pageIndex;
      rightPage = Math.min(leftPage + 1, totalDocPages);
    }

    // 1. PRIORITAS UTAMA: Render 2 halaman yang sedang dilihat user SECARA PARALEL!
    const currentSpread = [leftPage, rightPage].filter(p => p >= 1 && p <= totalDocPages && !renderedPages.has(p));
    if (currentSpread.length > 0) {
      await Promise.all(currentSpread.map(p => renderSinglePdfPage(p, scale)));
    }

    // 2. PRIORITAS KEDUA: Prefetch lembaran berikutnya dan sebelumnya secara paralel tanpa menunggu
    const nearby = [
      leftPage - 2, leftPage - 1,
      rightPage + 1, rightPage + 2, rightPage + 3, rightPage + 4
    ].filter(p => p >= 1 && p <= totalDocPages && !renderedPages.has(p));

    if (nearby.length > 0) {
      Promise.all(nearby.map(p => renderSinglePdfPage(p, scale))).catch(() => {});
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

    const dims = calculateOptimalBookDimensions(activePdfPageWidth, activePdfPageHeight);
    const bookW = width || dims.baseWidth;
    const bookH = height || dims.baseHeight;
    currentBaseWidth = bookW;
    currentBaseHeight = bookH;

    // KUNCI PRESISI UKURAN: Kunci dimensi fisik container agar buku pas presisi dan tidak pernah overflow viewport
    container.style.width = (bookW * 2) + 'px';
    container.style.height = bookH + 'px';
    container.style.maxWidth = (bookW * 2) + 'px';
    container.style.maxHeight = bookH + 'px';

    flipBookInstance = new window.St.PageFlip(container, {
      width: bookW,
      height: bookH,
      size: 'fixed',
      minWidth: bookW,
      maxWidth: bookW,
      minHeight: bookH,
      maxHeight: bookH,
      maxShadowOpacity: 0.6,
      showCover: true,
      mobileScrollSupport: false,
      usePortrait: false,
      flippingTime: 650,
      drawShadow: true,
      autoSize: false
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
   * 8. Kontrol Navigasi (Tombol Panah Bulat, Slider, Fullscreen, Landscape)
   */
  function initFlipControls() {
    const prevBtn = document.getElementById('btnNavPrev');
    const nextBtn = document.getElementById('btnNavNext');
    const firstBtn = document.getElementById('btnNavFirst');
    const lastBtn = document.getElementById('btnNavLast');
    const rangeSlider = document.getElementById('flipbookRange');
    const fullscreenBtn = document.getElementById('btnFlipbookFullscreen');
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

    if (fullscreenBtn && !fullscreenBtn.getAttribute('data-flipbook-bound')) {
      fullscreenBtn.setAttribute('data-flipbook-bound', 'true');
      fullscreenBtn.addEventListener('click', toggleFullscreen);
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
        pageBadge.textContent = isMobile ? `Cover • 1 / ${total}` : `Cover Depan • Hal 1 dari ${total}`;
      } else if (currentPageIndex >= total - 1) {
        pageBadge.textContent = isMobile ? `Belakang • ${total}` : `Cover Belakang • Hal ${total}`;
      } else {
        const leftPage = currentPageIndex % 2 === 1 ? currentPageIndex + 1 : currentPageIndex;
        const rightPage = Math.min(leftPage + 1, total);
        pageBadge.textContent = isMobile ? `Hal ${leftPage}-${rightPage} / ${total}` : `Halaman ${leftPage}-${rightPage} dari ${total}`;
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

  // Responsif resize dan rotasi layar perangkat dengan Auto-Refit Otomatis
  function handleFlipbookResize() {
    clearTimeout(resizeDebounceTimer);
    resizeDebounceTimer = setTimeout(() => {
      const modal = document.getElementById('flipbookModal');
      if (!modal || !modal.classList.contains('active')) return;
      if (!flipBookInstance || !pdfDocInstance) return;

      const curPage = flipBookInstance.getCurrentPageIndex();
      const newDims = calculateOptimalBookDimensions(activePdfPageWidth, activePdfPageHeight);

      // Jika ukuran layar berubah signifikan (> 10px), sesuaikan ulang flipbook agar tidak terpotong
      if (Math.abs(newDims.baseWidth - currentBaseWidth) > 10 || Math.abs(newDims.baseHeight - currentBaseHeight) > 10) {
        reFitFlipbook(curPage);
      } else {
        updateCoverCentering(curPage);
      }
    }, 180);
  }

  /**
   * Menyesuaikan ulang ukuran Flipbook saat orientasi HP berubah atau jendela browser di-resize
   */
  function reFitFlipbook(targetPageIndex = 0) {
    if (!flipBookInstance || !pdfDocInstance) return;
    const bookContainer = document.getElementById('flipbookBook');
    if (!bookContainer) return;

    const dims = calculateOptimalBookDimensions(activePdfPageWidth, activePdfPageHeight);
    currentBaseWidth = dims.baseWidth;
    currentBaseHeight = dims.baseHeight;

    try {
      flipBookInstance.destroy();
    } catch (e) {}
    flipBookInstance = null;

    bookContainer.style.width = (dims.baseWidth * 2) + 'px';
    bookContainer.style.height = dims.baseHeight + 'px';
    bookContainer.style.maxWidth = (dims.baseWidth * 2) + 'px';
    bookContainer.style.maxHeight = dims.baseHeight + 'px';

    initStPageFlip(bookContainer, dims.baseWidth, dims.baseHeight);
    if (flipBookInstance) {
      try {
        flipBookInstance.turnToPage(targetPageIndex);
        updateCoverCentering(targetPageIndex);
        updateNavButtonsState(targetPageIndex);
      } catch (err) {}
    }
  }

  window.addEventListener('resize', handleFlipbookResize);
  window.addEventListener('orientationchange', handleFlipbookResize);

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