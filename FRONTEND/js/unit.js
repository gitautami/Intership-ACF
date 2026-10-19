/**
 * ACF EDUHUB — Unit Pendidikan Interactions
 */
document.addEventListener('DOMContentLoaded', () => {
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

  // Initialize Galeri Sekolah Juara Slider & Lightbox (if on page)
  initSjGallerySlider();
});

/**
 * Galeri Sekolah Juara — Interactive Responsive Slider & Lightbox Modal
 */
function initSjGallerySlider() {
  const wrap = document.getElementById('sjGallerySliderWrap');
  if (!wrap) return;

  const track = document.getElementById('sjGalleryTrack');
  const cards = track ? track.querySelectorAll('.sj-gallery-card') : [];
  const prevBtn = document.getElementById('sjGalleryPrevBtn');
  const nextBtn = document.getElementById('sjGalleryNextBtn');
  const dotsContainer = document.getElementById('sjGalleryDots');

  // Lightbox Elements
  const modal = document.getElementById('sjLightboxModal');
  const backdrop = document.getElementById('sjLightboxBackdrop');
  const closeBtn = document.getElementById('sjLightboxClose');
  const lbImg = document.getElementById('sjLightboxImg');
  const lbTitle = document.getElementById('sjLightboxTitle');
  const lbDesc = document.getElementById('sjLightboxDesc');
  const lbCounter = document.getElementById('sjLightboxCounter');
  const lbPrev = document.getElementById('sjLightboxPrev');
  const lbNext = document.getElementById('sjLightboxNext');

  if (!track || cards.length === 0) return;

  const totalCards = cards.length;
  let currentSlide = 0;
  let autoplayInterval = null;
  const autoplayDuration = 4500; // 4.5 detik rotasi halus

  // Helper to determine items per view
  function getItemsPerView() {
    const width = window.innerWidth;
    if (width <= 640) return 1;
    if (width <= 991) return 2;
    return 3;
  }

  function getMaxSlide() {
    const itemsPerView = getItemsPerView();
    return Math.max(0, totalCards - itemsPerView);
  }

  // Render pagination dots
  function renderDots() {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    const maxSlide = getMaxSlide();
    const dotsCount = maxSlide + 1;

    for (let i = 0; i < dotsCount; i++) {
      const dot = document.createElement('button');
      dot.className = 'sj-gallery-dot' + (i === currentSlide ? ' active' : '');
      dot.setAttribute('type', 'button');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Halaman Galeri ${i + 1}`);
      dot.setAttribute('aria-selected', i === currentSlide ? 'true' : 'false');
      dot.addEventListener('click', () => {
        goToSlide(i);
        startAutoplay();
      });
      dotsContainer.appendChild(dot);
    }
  }

  // Update slider position
  function goToSlide(index) {
    const maxSlide = getMaxSlide();
    if (index > maxSlide) {
      currentSlide = 0;
    } else if (index < 0) {
      currentSlide = maxSlide;
    } else {
      currentSlide = index;
    }

    if (cards.length > 0) {
      const cardRect = cards[0].getBoundingClientRect();
      const style = window.getComputedStyle(track);
      const gap = parseFloat(style.gap) || (window.innerWidth <= 991 ? 20 : 24);
      const shiftX = currentSlide * (cardRect.width + gap);
      track.style.transform = `translateX(-${shiftX}px)`;
    }

    // Update Dots
    if (dotsContainer) {
      const dots = dotsContainer.querySelectorAll('.sj-gallery-dot');
      dots.forEach((dot, idx) => {
        if (idx === currentSlide) {
          dot.classList.add('active');
          dot.setAttribute('aria-selected', 'true');
        } else {
          dot.classList.remove('active');
          dot.setAttribute('aria-selected', 'false');
        }
      });
    }

    // Update Nav Button States
    if (prevBtn) {
      prevBtn.disabled = false;
    }
    if (nextBtn) {
      nextBtn.disabled = false;
    }
  }

  function nextSlide() {
    const maxSlide = getMaxSlide();
    if (currentSlide >= maxSlide) {
      goToSlide(0);
    } else {
      goToSlide(currentSlide + 1);
    }
  }

  function prevSlide() {
    const maxSlide = getMaxSlide();
    if (currentSlide <= 0) {
      goToSlide(maxSlide);
    } else {
      goToSlide(currentSlide - 1);
    }
  }

  // Autoplay Management
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

  // Event Listeners for Slider Controls
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

  // Pause on hover
  wrap.addEventListener('mouseenter', stopAutoplay);
  wrap.addEventListener('mouseleave', startAutoplay);

  // Touch Swipe for In-Page Slider (Mobile)
  let touchStartX = 0;
  let touchEndX = 0;

  wrap.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    stopAutoplay();
  }, { passive: true });

  wrap.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSliderSwipe();
    startAutoplay();
  }, { passive: true });

  function handleSliderSwipe() {
    const threshold = 40;
    if (touchEndX < touchStartX - threshold) {
      nextSlide();
    } else if (touchEndX > touchStartX + threshold) {
      prevSlide();
    }
  }

  // Resize handler
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      renderDots();
      goToSlide(currentSlide);
    }, 150);
  });

  // Initial Slider Render
  renderDots();
  goToSlide(0);
  startAutoplay();

  // ==========================================
  // LIGHTBOX MODAL WITH FULL SLIDER CAPABILITY
  // ==========================================
  let activeLbIndex = 0;

  // Extract gallery data directly from DOM cards
  const galleryItems = Array.from(cards).map((card) => {
    const imgEl = card.querySelector('.sj-gallery-img');
    const title = card.getAttribute('data-title') || (card.querySelector('.sj-gallery-card-title') ? card.querySelector('.sj-gallery-card-title').textContent.trim() : 'Galeri Sekolah Juara');
    const loc = card.getAttribute('data-location') || (card.querySelector('.sj-gallery-location-tag') ? card.querySelector('.sj-gallery-location-tag').textContent.trim() : 'Sekolah Juara');
    const desc = card.getAttribute('data-desc') || (card.querySelector('.sj-gallery-card-desc') ? card.querySelector('.sj-gallery-card-desc').textContent.trim() : '');

    return {
      src: imgEl ? imgEl.getAttribute('src') : '',
      alt: imgEl ? imgEl.getAttribute('alt') : 'Foto Galeri',
      title: title,
      location: loc,
      desc: desc
    };
  });

  function openLightbox(index) {
    if (!modal) return;
    stopAutoplay(); // pause slider while modal is viewed
    activeLbIndex = index;
    updateLightboxContent(index);
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    startAutoplay();
  }

  function updateLightboxContent(index) {
    if (index >= galleryItems.length) {
      activeLbIndex = 0;
    } else if (index < 0) {
      activeLbIndex = galleryItems.length - 1;
    } else {
      activeLbIndex = index;
    }

    const item = galleryItems[activeLbIndex];
    if (!item) return;

    if (lbImg) {
      // Smooth fade transition
      lbImg.style.opacity = '0';
      lbImg.style.transform = 'scale(0.97)';

      setTimeout(() => {
        lbImg.src = item.src;
        lbImg.alt = item.alt;
        lbImg.style.opacity = '1';
        lbImg.style.transform = 'scale(1)';
      }, 120);
    }

    if (lbTitle) {
      lbTitle.textContent = `${item.title} — ${item.location}`;
    }

    if (lbDesc) {
      lbDesc.textContent = item.desc;
    }

    if (lbCounter) {
      lbCounter.textContent = `Foto ${activeLbIndex + 1} / ${galleryItems.length}`;
    }
  }

  function nextLightbox() {
    updateLightboxContent(activeLbIndex + 1);
  }

  function prevLightbox() {
    updateLightboxContent(activeLbIndex - 1);
  }

  // Click on cards to open Lightbox
  cards.forEach((card, idx) => {
    card.addEventListener('click', () => {
      openLightbox(idx);
    });
  });

  // Lightbox Controls
  if (lbNext) {
    lbNext.addEventListener('click', (e) => {
      e.stopPropagation();
      nextLightbox();
    });
  }

  if (lbPrev) {
    lbPrev.addEventListener('click', (e) => {
      e.stopPropagation();
      prevLightbox();
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeLightbox);
  }

  if (backdrop) {
    backdrop.addEventListener('click', closeLightbox);
  }

  // Keyboard navigation inside lightbox
  document.addEventListener('keydown', (e) => {
    if (!modal || !modal.classList.contains('active')) return;

    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowRight') {
      nextLightbox();
    } else if (e.key === 'ArrowLeft') {
      prevLightbox();
    }
  });

  // Touch Swipe inside Lightbox (Mobile)
  let lbTouchStartX = 0;
  let lbTouchEndX = 0;

  if (modal) {
    modal.addEventListener('touchstart', (e) => {
      lbTouchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    modal.addEventListener('touchend', (e) => {
      lbTouchEndX = e.changedTouches[0].screenX;
      const threshold = 40;
      if (lbTouchEndX < lbTouchStartX - threshold) {
        nextLightbox();
      } else if (lbTouchEndX > lbTouchStartX + threshold) {
        prevLightbox();
      }
    }, { passive: true });
  }
}

