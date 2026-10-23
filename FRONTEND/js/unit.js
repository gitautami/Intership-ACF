/**
 * ACF EDUHUB — Unit Pendidikan Interactions
 */
function initUnitPage() {
  // Smooth jump to hash if present
  if (window.location.hash) {
    const target = document.querySelector(window.location.hash);
    if (target) {
      setTimeout(() => {
        const navHeight = 80;
        const targetPos = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
        window.scrollTo({ top: targetPos, behavior: 'smooth' });
      }, 100);
    }
  }

  // 1. Initialize Galeri Sekolah Juara Infinite Slider & Lightbox
  initInfiniteGallerySlider({
    wrapId: 'sjGallerySliderWrap',
    trackId: 'sjGalleryTrack',
    prevBtnId: 'sjGalleryPrevBtn',
    nextBtnId: 'sjGalleryNextBtn',
    dotsId: 'sjGalleryDots',
    modalId: 'sjLightboxModal',
    modalBackdropId: 'sjLightboxBackdrop',
    modalCloseId: 'sjLightboxClose',
    modalImgId: 'sjLightboxImg',
    modalCounterId: 'sjLightboxCounter',
    modalPrevId: 'sjLightboxPrev',
    modalNextId: 'sjLightboxNext'
  });

  // 2. Initialize Galeri Sekolah Daya Setara Infinite Slider & Lightbox
  initInfiniteGallerySlider({
    wrapId: 'sdsGallerySliderWrap',
    trackId: 'sdsGalleryTrack',
    prevBtnId: 'sdsGalleryPrevBtn',
    nextBtnId: 'sdsGalleryNextBtn',
    dotsId: 'sdsGalleryDots',
    modalId: 'sdsLightboxModal',
    modalBackdropId: 'sdsLightboxBackdrop',
    modalCloseId: 'sdsLightboxClose',
    modalImgId: 'sdsLightboxImg',
    modalCounterId: 'sdsLightboxCounter',
    modalPrevId: 'sdsLightboxPrev',
    modalNextId: 'sdsLightboxNext'
  });

  // 3. Initialize Galeri / Brosur Sekolah Juara Modal
  initSekolahJuaraBrosurModal();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initUnitPage);
} else {
  initUnitPage();
}

/**
 * Reusable Infinite Loop Carousel & Lightbox for Unit Pendidikan Galleries
 * Seamless forward and backward continuous loop ("nyambung terus tanpa akhir")
 */
function initInfiniteGallerySlider(config) {
  const wrap = document.getElementById(config.wrapId);
  if (!wrap) return;

  const track = document.getElementById(config.trackId);
  if (!track) return;

  const originalCards = Array.from(track.querySelectorAll('.sj-gallery-card'));
  if (originalCards.length === 0) return;

  const prevBtn = document.getElementById(config.prevBtnId);
  const nextBtn = document.getElementById(config.nextBtnId);
  const dotsContainer = document.getElementById(config.dotsId);

  // Modal elements
  const modal = document.getElementById(config.modalId);
  const backdrop = document.getElementById(config.modalBackdropId);
  const closeBtn = document.getElementById(config.modalCloseId);
  const lbImg = document.getElementById(config.modalImgId);
  const lbCounter = document.getElementById(config.modalCounterId);
  const lbPrev = document.getElementById(config.modalPrevId);
  const lbNext = document.getElementById(config.modalNextId);

  const realCount = originalCards.length;
  // Clone 4 items on each end for seamless looping
  const cloneCount = Math.min(realCount, 4);

  // 1. Prepend clones of the last cloneCount cards
  for (let i = realCount - cloneCount; i < realCount; i++) {
    const idx = (i % realCount + realCount) % realCount;
    const clone = originalCards[idx].cloneNode(true);
    clone.classList.add('sj-clone');
    track.insertBefore(clone, track.firstChild);
  }

  // 2. Append clones of the first cloneCount cards
  for (let i = 0; i < cloneCount; i++) {
    const clone = originalCards[i].cloneNode(true);
    clone.classList.add('sj-clone');
    track.appendChild(clone);
  }

  let currentIndex = 0; // 0 corresponds to the first original card
  let isSliding = false;
  let autoplayInterval = null;
  const autoplayDuration = 3800; // 3.8 detik rotasi otomatis terus-menerus

  function getCardWidthAndGap() {
    const firstCard = originalCards[0];
    const cardRect = firstCard.getBoundingClientRect();
    const style = window.getComputedStyle(track);
    const gap = parseFloat(style.gap) || (window.innerWidth <= 991 ? 20 : 24);
    return { width: cardRect.width, gap: gap };
  }

  function setTrackPosition(index, animate = true) {
    const { width, gap } = getCardWidthAndGap();
    const domIndex = index + cloneCount;
    const shiftX = domIndex * (width + gap);

    if (animate) {
      track.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
    } else {
      track.style.transition = 'none';
    }
    track.style.transform = `translateX(-${shiftX}px)`;
  }

  const maxDots = Math.min(realCount, 10);

  function updateDots() {
    if (!dotsContainer) return;
    const dots = dotsContainer.querySelectorAll('.sj-gallery-dot');
    const realIndex = ((currentIndex % realCount) + realCount) % realCount;
    const activeDotIndex = realCount <= 10
      ? realIndex
      : Math.min(maxDots - 1, Math.floor((realIndex / realCount) * maxDots));

    dots.forEach((dot, idx) => {
      const isActive = idx === activeDotIndex;
      dot.classList.toggle('active', isActive);
      dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
  }

  function renderDots() {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    for (let i = 0; i < maxDots; i++) {
      const dot = document.createElement('button');
      dot.className = 'sj-gallery-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('type', 'button');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Foto ${i + 1}`);
      dot.addEventListener('click', () => {
        if (isSliding) return;
        const target = realCount <= 10 ? i : Math.floor((i / maxDots) * realCount);
        goToSlide(target);
        startAutoplay();
      });
      dotsContainer.appendChild(dot);
    }
  }

  function goToSlide(targetIndex) {
    if (isSliding) return;
    isSliding = true;
    currentIndex = targetIndex;
    setTrackPosition(currentIndex, true);
    updateDots();

    // After animation finishes, handle seamless wrap-around if currently at cloned cards
    setTimeout(() => {
      if (currentIndex >= realCount) {
        currentIndex = currentIndex % realCount;
        setTrackPosition(currentIndex, false);
      } else if (currentIndex < 0) {
        currentIndex = ((currentIndex % realCount) + realCount) % realCount;
        setTrackPosition(currentIndex, false);
      }
      isSliding = false;
    }, 510);
  }

  function nextSlide() {
    goToSlide(currentIndex + 1);
  }

  function prevSlide() {
    goToSlide(currentIndex - 1);
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayInterval = setInterval(() => {
      nextSlide();
    }, autoplayDuration);
  }

  function stopAutoplay() {
    if (autoplayInterval) {
      clearInterval(autoplayInterval);
      autoplayInterval = null;
    }
  }

  // Navigation Buttons
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      nextSlide();
      startAutoplay();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prevSlide();
      startAutoplay();
    });
  }

  // Hover Pause
  wrap.addEventListener('mouseenter', stopAutoplay);
  wrap.addEventListener('mouseleave', startAutoplay);

  // Touch Swipe on mobile
  let touchStartX = 0;
  let touchEndX = 0;

  wrap.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    stopAutoplay();
  }, { passive: true });

  wrap.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const threshold = 35;
    if (touchEndX < touchStartX - threshold) {
      nextSlide();
    } else if (touchEndX > touchStartX + threshold) {
      prevSlide();
    }
    startAutoplay();
  }, { passive: true });

  // Window resize debounced
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      setTrackPosition(currentIndex, false);
      updateDots();
    }, 150);
  });

  // Initial render
  setTrackPosition(0, false);
  renderDots();
  startAutoplay();

  // ==========================================
  // LIGHTBOX MODAL (Full Photo Preview & Modal Slider)
  // ==========================================
  if (modal) {
    const galleryItems = originalCards.map((card) => {
      const imgEl = card.querySelector('.sj-gallery-img');
      return {
        src: imgEl ? imgEl.getAttribute('src') : '',
        alt: imgEl ? imgEl.getAttribute('alt') : 'Foto Galeri'
      };
    });

    let activeLbIndex = 0;

    function openLightbox(index) {
      stopAutoplay();
      activeLbIndex = ((index % realCount) + realCount) % realCount;
      updateLightbox(activeLbIndex);
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      startAutoplay();
    }

    function updateLightbox(index) {
      activeLbIndex = ((index % realCount) + realCount) % realCount;
      const item = galleryItems[activeLbIndex];
      if (!item) return;

      if (lbImg) {
        lbImg.style.opacity = '0';
        lbImg.style.transform = 'scale(0.97)';
        setTimeout(() => {
          lbImg.src = item.src;
          lbImg.alt = item.alt;
          lbImg.style.opacity = '1';
          lbImg.style.transform = 'scale(1)';
        }, 120);
      }

      if (lbCounter) {
        lbCounter.textContent = `Foto ${activeLbIndex + 1} / ${realCount}`;
      }
    }

    // Delegated click on all cards (including clones)
    track.addEventListener('click', (e) => {
      const card = e.target.closest('.sj-gallery-card');
      if (!card) return;
      const dataIdx = parseInt(card.getAttribute('data-index'), 10);
      if (!isNaN(dataIdx)) {
        openLightbox(dataIdx);
      }
    });

    if (lbNext) {
      lbNext.addEventListener('click', (e) => {
        e.stopPropagation();
        updateLightbox(activeLbIndex + 1);
      });
    }

    if (lbPrev) {
      lbPrev.addEventListener('click', (e) => {
        e.stopPropagation();
        updateLightbox(activeLbIndex - 1);
      });
    }

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (backdrop) backdrop.addEventListener('click', closeLightbox);

    document.addEventListener('keydown', (e) => {
      if (!modal.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowRight') updateLightbox(activeLbIndex + 1);
      else if (e.key === 'ArrowLeft') updateLightbox(activeLbIndex - 1);
    });

    let lbTouchStartX = 0;
    let lbTouchEndX = 0;
    modal.addEventListener('touchstart', (e) => {
      lbTouchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    modal.addEventListener('touchend', (e) => {
      lbTouchEndX = e.changedTouches[0].screenX;
      const threshold = 35;
      if (lbTouchEndX < lbTouchStartX - threshold) {
        updateLightbox(activeLbIndex + 1);
      } else if (lbTouchEndX > lbTouchStartX + threshold) {
        updateLightbox(activeLbIndex - 1);
      }
    }, { passive: true });
  }
}

/**
 * Interactive Brochure Viewer Modal for Sekolah Juara
 */
function initSekolahJuaraBrosurModal() {
  const modal = document.getElementById('sjBrosurModal');
  if (!modal) return;

  const backdrop = document.getElementById('sjBrosurBackdrop');
  const closeBtn = document.getElementById('sjBrosurCloseBtn');
  const downloadBtn = document.getElementById('sjBrosurDownloadBtn');
  const titleEl = document.getElementById('sjBrosurTitle');
  const subtitleEl = document.getElementById('sjBrosurSubtitle');
  const pagesWrap = document.getElementById('sjBrosurPagesWrap');
  const scrollStage = document.getElementById('sjBrosurScrollStage');

  function openBrosur(btn) {
    if (!btn || btn.classList.contains('disabled') || btn.disabled) return;

    const fileUrl = btn.getAttribute('data-brosur-file');
    if (!fileUrl) return;

    const fileName = btn.getAttribute('data-brosur-name') || 'Brosur Sekolah Juara.pdf';
    const schoolName = btn.getAttribute('data-school-name') || 'Sekolah Juara';
    const location = btn.getAttribute('data-school-location') || '';
    const year = btn.getAttribute('data-brosur-year') || '2027/2028';

    if (titleEl) titleEl.textContent = `Brosur PPDB ${schoolName}`;
    if (subtitleEl) subtitleEl.textContent = `${location ? location + ' • ' : ''}Tahun Ajaran ${year} — Unit Pendidikan ACF Eduhub`;

    // Fitur Download berupa Button
    if (downloadBtn && fileUrl) {
      downloadBtn.setAttribute('href', fileUrl);
      downloadBtn.setAttribute('download', fileName);
      downloadBtn.setAttribute('title', `Unduh Dokumen Brosur PDF (${schoolName})`);
    }

    // Embed Dokumen PDF Asli langsung ke dalam modal
    if (pagesWrap) {
      const safeUrl = encodeURI(fileUrl);
      pagesWrap.innerHTML = `
        <iframe 
          src="${safeUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH" 
          class="sj-brosur-pdf-frame" 
          title="Dokumen PDF Brosur ${schoolName}">
        </iframe>
      `;
    }

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeBrosur() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    if (pagesWrap) {
      pagesWrap.innerHTML = '';
    }
    document.body.style.overflow = '';
  }

  // Bind click handlers to all brochure buttons
  const brosurButtons = document.querySelectorAll('.sj-btn-brosur');
  brosurButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const fileUrl = btn.getAttribute('data-brosur-file');
      if (!fileUrl) {
        // Sekolah yang belum ada brosurnya: jangan isi apa-apa / tidak memicu modal
        return;
      }
      openBrosur(btn);
    });
  });

  // Close triggers
  if (closeBtn) closeBtn.addEventListener('click', closeBrosur);
  if (backdrop) backdrop.addEventListener('click', closeBrosur);

  // Keyboard navigation (Esc to close)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeBrosur();
    }
  });

  // Expose global methods for inline or direct callers
  window.openSekolahJuaraBrosur = openBrosur;
  window.closeSekolahJuaraBrosur = closeBrosur;
}


