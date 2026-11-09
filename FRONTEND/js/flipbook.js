/**
 * ACF EDUHUB — Interactive PDF Flipbook Engine
 * Mengubah Dokumen PDF (Profil Lembaga ACF Eduhub) menjadi Flipbook 3D interaktif
 * Sesuai contoh video referensi (efek buka lembaran buku 3D & tombol panah navigasi bulat).
 */

(function () {
  'use strict';

  const PDF_FILE_PATH = '../assets/tentang/Profil Lembaga - ACF Eduhub.pdf';
  let flipBookInstance = null;
  let pdfDocInstance = null;
  let isRendering = false;
  let renderedPagesCount = 0;
  let totalDocPages = 0;

  // Initialize when DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    initTriggerButtons();
    initUrlHashCheck();

    // If we are on the standalone page (profil-lembaga.html), auto-load
    if (document.body.classList.contains('flipbook-standalone-body')) {
      loadAndRenderFlipbook();
    }
  });

  /**
   * 1. Hubungkan tombol pemicu "Profil Lembaga ACF Eduhub" di halaman Cerita Kami
   */
  function initTriggerButtons() {
    const triggerBtns = document.querySelectorAll('.btn-profil-lembaga, [data-open-flipbook="profil-lembaga"]');
    triggerBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        // Jika ada modal di halaman ini, buka modal
        const modal = document.getElementById('flipbookModal');
        if (modal) {
          e.preventDefault();
          openFlipbookModal();
        }
        // Jika tidak ada modal, tautan <a href="profil-lembaga.html"> akan otomatis jalan
      });
    });

    // Tombol close modal
    const closeBtn = document.getElementById('btnFlipbookClose');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeFlipbookModal);
    }

    // Klik di luar container untuk menutup (backdrop)
    const modal = document.getElementById('flipbookModal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeFlipbookModal();
        }
      });
    }

    // Keyboard shortcut (Escape, ArrowLeft, ArrowRight)
    document.addEventListener('keydown', (e) => {
      const isModalActive = modal && modal.classList.contains('active');
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

  /**
   * 2. Buka Modal Flipbook
   */
  function openFlipbookModal() {
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
      const modal = document.getElementById('flipbookModal');
      if (modal) {
        setTimeout(openFlipbookModal, 150);
      }
    }
  }

  /**
   * 5. Muat PDF dan Render ke Canvas untuk StPageFlip
   */
  async function loadAndRenderFlipbook() {
    if (isRendering) return;
    isRendering = true;

    const loadingScreen = document.getElementById('flipbookLoading');
    const loadingDesc = document.getElementById('flipbookLoadingDesc');
    const progressBar = document.getElementById('flipbookProgressFill');
    const bookContainer = document.getElementById('flipbookBook');

    if (loadingScreen) loadingScreen.classList.remove('hidden');

    // Pastikan perpustakaan pdfjsLib tersedia
    if (typeof window.pdfjsLib === 'undefined') {
      console.warn('PDF.js belum termuat, mencoba memuat fallback iframe.');
      renderIframeFallback();
      return;
    }

    try {
      // Set worker
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

      if (loadingDesc) loadingDesc.textContent = 'Membuka dokumen PDF Profil Lembaga...';

      // Load PDF Document
      const loadingTask = window.pdfjsLib.getDocument(PDF_FILE_PATH);
      pdfDocInstance = await loadingTask.promise;
      totalDocPages = pdfDocInstance.numPages;

      if (bookContainer) bookContainer.innerHTML = '';

      // Tentukan dimensi render halaman berdasarkan lebar viewport
      const isMobile = window.innerWidth <= 768;
      const baseWidth = isMobile ? Math.min(window.innerWidth - 32, 450) : 550;
      const baseHeight = Math.round(baseWidth * 1.414); // Aspek rasio A4 standar (1:1.414)

      // Buat container lembaran (sheet) untuk setiap halaman
      const pageElements = [];

      for (let pageNum = 1; pageNum <= totalDocPages; pageNum++) {
        const sheet = document.createElement('div');
        sheet.className = 'page-sheet';
        // Density cover depan dan belakang dibuat hard
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
        pageElements.push(sheet);
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
      console.warn('St.PageFlip tidak ditemukan, mengaktifkan mode navigasi sederhana.');
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

    if (prevBtn) {
      prevBtn.addEventListener('click', flipPrev);
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', flipNext);
    }
    if (firstBtn) {
      firstBtn.addEventListener('click', () => {
        if (flipBookInstance) flipBookInstance.flip(0);
      });
    }
    if (lastBtn) {
      lastBtn.addEventListener('click', () => {
        if (flipBookInstance && totalDocPages > 0) {
          flipBookInstance.flip(totalDocPages - 1);
        }
      });
    }

    // Slider
    if (rangeSlider) {
      rangeSlider.max = totalDocPages;
      rangeSlider.addEventListener('input', (e) => {
        const targetPage = parseInt(e.target.value, 10);
        if (flipBookInstance && !isNaN(targetPage)) {
          flipBookInstance.flip(Math.max(0, targetPage - 1));
        }
      });
    }

    // Fullscreen Toggle
    if (fullscreenBtn) {
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
          <iframe src="${PDF_FILE_PATH}#toolbar=1&navpanes=0&scrollbar=1" class="flipbook-iframe-fallback" title="Profil Lembaga ACF Eduhub"></iframe>
        </div>
      `;
    }
  }

  // Ekspor fungsi ke window agar dapat dipanggil dari luar jika diperlukan
  window.openProfilLembagaFlipbook = openFlipbookModal;
  window.closeProfilLembagaFlipbook = closeFlipbookModal;
})();

