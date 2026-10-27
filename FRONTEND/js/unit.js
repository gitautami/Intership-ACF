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
  const shareBtn = document.getElementById('sjBrosurShareBtn');
  const sharePopover = document.getElementById('sjBrosurSharePopover');
  const sharePopoverClose = document.getElementById('sjSharePopoverClose');
  const shareUrlInput = document.getElementById('sjShareUrlInput');
  const shareCopyBtn = document.getElementById('sjShareCopyBtn');
  const shareCopyBtnText = document.getElementById('sjShareCopyBtnText');
  const shareWaBtn = document.getElementById('sjShareWaBtn');
  const shareIgBtn = document.getElementById('sjShareIgBtn');
  const shareNativeBtn = document.getElementById('sjShareNativeBtn');
  const shareToast = document.getElementById('sjShareToast');
  const titleEl = document.getElementById('sjBrosurTitle');
  const subtitleEl = document.getElementById('sjBrosurSubtitle');
  const pagesWrap = document.getElementById('sjBrosurPagesWrap');

  let currentBrosurData = null;

  function closeSharePopover() {
    if (sharePopover) {
      sharePopover.classList.remove('active');
      sharePopover.setAttribute('aria-hidden', 'true');
    }
    if (shareBtn) {
      shareBtn.setAttribute('aria-expanded', 'false');
    }
  }

  function copyShareLink() {
    if (!currentBrosurData) return;
    const textToCopy = currentBrosurData.shareUrl;

    const showFeedback = () => {
      if (shareToast) {
        shareToast.classList.add('show');
        setTimeout(() => {
          if (shareToast) shareToast.classList.remove('show');
        }, 2200);
      }
      if (shareCopyBtnText) {
        shareCopyBtnText.textContent = 'Tersalin!';
        setTimeout(() => {
          if (shareCopyBtnText) shareCopyBtnText.textContent = 'Salin';
        }, 2000);
      }
      const shareBtnText = document.getElementById('sjBrosurShareBtnText');
      if (shareBtnText && shareBtn) {
        shareBtn.classList.add('copied');
        shareBtnText.innerHTML = '✓ Disalin!';
        setTimeout(() => {
          if (shareBtn) shareBtn.classList.remove('copied');
          if (shareBtnText) shareBtnText.innerHTML = 'Bagikan<span class="sj-brosur-btn-text-extra"> Link</span>';
        }, 2000);
      }
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy).then(showFeedback).catch(() => {
        fallbackCopy(textToCopy, showFeedback);
      });
    } else {
      fallbackCopy(textToCopy, showFeedback);
    }
  }

  function fallbackCopy(text, callback) {
    if (shareUrlInput) {
      shareUrlInput.select();
      shareUrlInput.setSelectionRange(0, 99999);
      try {
        document.execCommand('copy');
        if (callback) callback();
      } catch (e) {}
    }
  }

  function openBrosur(btn) {
    if (!btn || btn.classList.contains('disabled') || btn.disabled) return;

    const fileUrl = btn.getAttribute('data-brosur-file');
    if (!fileUrl) return;

    const fileName = btn.getAttribute('data-brosur-name') || 'Brosur Sekolah Juara.pdf';
    const schoolName = btn.getAttribute('data-school-name') || 'Sekolah Juara';
    const location = btn.getAttribute('data-school-location') || '';
    const year = btn.getAttribute('data-brosur-year') || '2027/2028';
    const slug = btn.getAttribute('data-brosur-slug') || (btn.id ? btn.id.replace(/^btnBrosur/i, '').toLowerCase() : 'batam');

    if (titleEl) titleEl.textContent = `Brosur PPDB ${schoolName}`;
    if (subtitleEl) subtitleEl.textContent = `${location ? location + ' • ' : ''}Tahun Ajaran ${year} — Unit Pendidikan ACF Eduhub`;

    // Fitur Download berupa Button
    if (downloadBtn && fileUrl) {
      downloadBtn.setAttribute('href', fileUrl);
      downloadBtn.setAttribute('download', fileName);
      downloadBtn.setAttribute('title', `Unduh Dokumen Brosur PDF (${schoolName})`);
    }

    // Bangun URL Share Link yang saat dibuka langsung menampilkan brosur ini
    let finalShareUrl = '';
    let directPdfUrl = '';
    try {
      const shareUrl = new URL(window.location.href);
      shareUrl.searchParams.set('brosur', slug);
      shareUrl.hash = '';
      finalShareUrl = shareUrl.href;
      directPdfUrl = new URL(fileUrl, window.location.href).href;
    } catch (e) {
      finalShareUrl = `${window.location.pathname}?brosur=${encodeURIComponent(slug)}`;
      directPdfUrl = fileUrl;
    }

    currentBrosurData = {
      fileUrl,
      fileName,
      schoolName,
      location,
      year,
      slug,
      shareUrl: finalShareUrl,
      directPdfUrl
    };

    if (shareUrlInput) shareUrlInput.value = finalShareUrl;
    if (shareWaBtn) {
      const waText = encodeURIComponent(`Lihat Brosur PPDB ${schoolName} (${year}) - ACF Eduhub:
${finalShareUrl}`);
      shareWaBtn.setAttribute('href', `https://api.whatsapp.com/send?text=${waText}`);
    }

    // Update history state secara halus tanpa me-reload halaman
    if (window.history && window.history.replaceState) {
      try {
        window.history.replaceState({ brosur: slug }, '', finalShareUrl);
      } catch (e) {}
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

    closeSharePopover();
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeBrosur() {
    closeSharePopover();
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    if (pagesWrap) {
      pagesWrap.innerHTML = '';
    }
    document.body.style.overflow = '';

    // Kembalikan URL bersih jika ditutup
    if (window.history && window.history.replaceState) {
      try {
        const cleanUrl = new URL(window.location.href);
        if (cleanUrl.searchParams.has('brosur')) {
          cleanUrl.searchParams.delete('brosur');
          window.history.replaceState(null, '', cleanUrl.pathname + (cleanUrl.search ? cleanUrl.search : ''));
        }
      } catch (e) {}
    }
  }

  // Handle Share Button & Popover Events (hanya membuka popover, tidak langsung menyalin)
  if (shareBtn) {
    shareBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!sharePopover) return;
      const isClosed = !sharePopover.classList.contains('active');
      if (isClosed) {
        sharePopover.classList.add('active');
        sharePopover.setAttribute('aria-hidden', 'false');
        shareBtn.setAttribute('aria-expanded', 'true');
      } else {
        closeSharePopover();
      }
    });
  }

  if (shareCopyBtn) {
    shareCopyBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      copyShareLink();
    });
  }

  if (sharePopoverClose) {
    sharePopoverClose.addEventListener('click', (e) => {
      e.stopPropagation();
      closeSharePopover();
    });
  }

  if (sharePopover) {
    sharePopover.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  // Handle Instagram share
  if (shareIgBtn) {
    shareIgBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!currentBrosurData) return;
      copyShareLink();
      if (shareToast) {
        shareToast.textContent = '✓ Link disalin! Membuka Instagram...';
        shareToast.classList.add('show');
        setTimeout(() => {
          if (shareToast) {
            shareToast.classList.remove('show');
            shareToast.textContent = '✓ Link brosur berhasil disalin!';
          }
        }, 2500);
      }
      setTimeout(() => {
        window.open('https://www.instagram.com/', '_blank');
      }, 350);
    });
  }

  // Handle Lainnya (Native Web Share / Fallback Copy)
  if (shareNativeBtn) {
    shareNativeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!currentBrosurData) return;
      if (navigator.share) {
        navigator.share({
          title: `Brosur PPDB ${currentBrosurData.schoolName}`,
          text: `Lihat Brosur PPDB ${currentBrosurData.schoolName} (${currentBrosurData.year}) - ACF Eduhub:
${currentBrosurData.shareUrl}`,
          url: currentBrosurData.shareUrl
        }).catch(() => {});
      } else {
        copyShareLink();
      }
    });
  }

  // Close share popover when clicking outside
  document.addEventListener('click', (e) => {
    if (sharePopover && sharePopover.classList.contains('active')) {
      if (!sharePopover.contains(e.target) && e.target !== shareBtn && !shareBtn.contains(e.target)) {
        closeSharePopover();
      }
    }
  });

  // Bind click handlers to all brochure buttons
  const brosurButtons = document.querySelectorAll('.sj-btn-brosur');
  brosurButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const fileUrl = btn.getAttribute('data-brosur-file');
      if (!fileUrl) {
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
    if (e.key === 'Escape') {
      if (sharePopover && sharePopover.classList.contains('active')) {
        closeSharePopover();
      } else if (modal.classList.contains('active')) {
        closeBrosur();
      }
    }
  });

  // Auto-open brochure if URL contains parameter ?brosur=... or hash #brosur-...
  function checkUrlAndOpenBrosur() {
    let param = '';
    try {
      const urlParams = new URLSearchParams(window.location.search);
      param = urlParams.get('brosur') || urlParams.get('brochure');
    } catch (e) {}

    if (!param && window.location.hash) {
      const hash = window.location.hash.replace(/^#/, '');
      if (hash.startsWith('brosur=')) {
        param = hash.replace('brosur=', '');
      } else if (hash.startsWith('brosur-')) {
        param = hash.replace('brosur-', '');
      }
    }

    if (!param) return;
    const cleanParam = decodeURIComponent(param).trim().toLowerCase();

    let matchedBtn = null;
    brosurButtons.forEach(btn => {
      const slug = (btn.getAttribute('data-brosur-slug') || '').toLowerCase();
      const btnId = (btn.id || '').toLowerCase();
      const schoolName = (btn.getAttribute('data-school-name') || '').toLowerCase();

      if (slug && slug === cleanParam) {
        matchedBtn = btn;
      } else if (btnId && (btnId === cleanParam || btnId === `btnbrosur${cleanParam}`)) {
        matchedBtn = btn;
      } else if (schoolName && schoolName.includes(cleanParam)) {
        matchedBtn = btn;
      }
    });

    if (matchedBtn && matchedBtn.getAttribute('data-brosur-file')) {
      setTimeout(() => {
        try {
          matchedBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } catch (e) {}
        openBrosur(matchedBtn);
      }, 350);
    }
  }

  // Expose global methods for inline or direct callers
  window.openSekolahJuaraBrosur = openBrosur;
  window.closeSekolahJuaraBrosur = closeBrosur;

  // Run deep-link check
  checkUrlAndOpenBrosur();
}


