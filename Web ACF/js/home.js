/**
 * ACF EDUHUB — Beranda (Homepage) Interactive JS
 * Hero Slider / Carousel Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  initHeroSlider();
  initMitraSlider();
});

function initHeroSlider() {
  const slider = document.getElementById('heroSlider');
  if (!slider) return;

  const slides = slider.querySelectorAll('.hero-slide');
  const dots = slider.querySelectorAll('.slider-dot');
  const prevBtn = document.getElementById('sliderPrevBtn');
  const nextBtn = document.getElementById('sliderNextBtn');
  const progressFill = document.getElementById('sliderProgressFill');

  if (slides.length === 0) return;

  let currentSlide = 0;
  const totalSlides = slides.length;
  const slideDuration = 5000; // 5 seconds per slide with smooth auto transition
  let slideInterval = null;
  let progressAnimation = null;
  let startTime = null;

  function goToSlide(index) {
    // Wrap around
    if (index >= totalSlides) {
      currentSlide = 0;
    } else if (index < 0) {
      currentSlide = totalSlides - 1;
    } else {
      currentSlide = index;
    }

    // Update slides
    slides.forEach((slide, i) => {
      if (i === currentSlide) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });

    // Update dots
    dots.forEach((dot, i) => {
      if (i === currentSlide) {
        dot.classList.add('active');
        dot.setAttribute('aria-selected', 'true');
      } else {
        dot.classList.remove('active');
        dot.setAttribute('aria-selected', 'false');
      }
    });

    // Restart progress bar
    resetProgress();
  }

  function nextSlide() {
    goToSlide(currentSlide + 1);
  }

  function prevSlide() {
    goToSlide(currentSlide - 1);
  }

  function resetProgress() {
    if (progressFill) {
      progressFill.style.transition = 'none';
      progressFill.style.width = '0%';
      setTimeout(() => {
        progressFill.style.transition = `width ${slideDuration}ms linear`;
        progressFill.style.width = '100%';
      }, 50);
    }
  }

  function startAutoplay() {
    stopAutoplay();
    resetProgress();
    slideInterval = setInterval(() => {
      nextSlide();
    }, slideDuration);
  }

  function stopAutoplay() {
    if (slideInterval) {
      clearInterval(slideInterval);
      slideInterval = null;
    }
    if (progressFill) {
      progressFill.style.transition = 'none';
      progressFill.style.width = '0%';
    }
  }

  // Event Listeners
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

  dots.forEach((dot) => {
    dot.addEventListener('click', (e) => {
      const slideIndex = parseInt(e.currentTarget.dataset.slide, 10);
      if (!isNaN(slideIndex)) {
        goToSlide(slideIndex);
        startAutoplay();
      }
    });
  });

  // Pause autoplay on mouse enter, resume on mouse leave
  slider.addEventListener('mouseenter', () => {
    stopAutoplay();
  });

  slider.addEventListener('mouseleave', () => {
    startAutoplay();
  });

  // Touch Swipe Support for Mobile
  let touchStartX = 0;
  let touchEndX = 0;

  slider.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  slider.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const swipeThreshold = 50;
    if (touchEndX < touchStartX - swipeThreshold) {
      // Swiped Left -> Next
      nextSlide();
      startAutoplay();
    }
    if (touchEndX > touchStartX + swipeThreshold) {
      // Swiped Right -> Prev
      prevSlide();
      startAutoplay();
    }
  }

  // Initialize Hero Slider
  goToSlide(0);
  startAutoplay();
}

function initMitraSlider() {
  const container = document.getElementById('mitraSliderContainer');
  if (!container) return;

  const track = document.getElementById('mitraSliderTrack');
  const viewport = document.getElementById('mitraSliderViewport');
  const prevBtn = document.getElementById('mitraPrevBtn');
  const nextBtn = document.getElementById('mitraNextBtn');
  const dotsContainer = document.getElementById('mitraDots');
  const items = track.querySelectorAll('.mitra-logo-item');

  if (!track || items.length === 0) return;

  let currentPage = 0;
  let itemsPerView = getItemsPerView();
  let totalPages = Math.ceil(items.length / itemsPerView);
  let autoplayTimer = null;
  const autoplayDelay = 3500; // 3.5s

  function getItemsPerView() {
    const width = window.innerWidth;
    if (width <= 800) return 2;
    if (width <= 1200) return 3;
    return 4;
  }

  function renderDots() {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    totalPages = Math.ceil(items.length / itemsPerView);

    for (let i = 0; i < totalPages; i++) {
      const dot = document.createElement('button');
      dot.className = `mitra-dot ${i === currentPage ? 'active' : ''}`;
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Halaman Mitra ${i + 1}`);
      dot.setAttribute('data-page', i);
      dot.addEventListener('click', () => {
        goToPage(i);
        startAutoplay();
      });
      dotsContainer.appendChild(dot);
    }
  }

  function updateDots() {
    if (!dotsContainer) return;
    const dots = dotsContainer.querySelectorAll('.mitra-dot');
    dots.forEach((dot, idx) => {
      if (idx === currentPage) {
        dot.classList.add('active');
        dot.setAttribute('aria-selected', 'true');
      } else {
        dot.classList.remove('active');
        dot.setAttribute('aria-selected', 'false');
      }
    });
  }

  function goToPage(pageIdx) {
    totalPages = Math.ceil(items.length / itemsPerView);
    if (pageIdx >= totalPages) {
      currentPage = 0;
    } else if (pageIdx < 0) {
      currentPage = totalPages - 1;
    } else {
      currentPage = pageIdx;
    }

    const firstItemIndex = Math.min(currentPage * itemsPerView, items.length - itemsPerView);
    const targetItem = items[Math.max(0, firstItemIndex)];
    
    if (targetItem) {
      const offset = targetItem.offsetLeft;
      track.style.transform = `translateX(-${offset}px)`;
    }

    updateDots();
  }

  function nextPage() {
    goToPage(currentPage + 1);
  }

  function prevPage() {
    goToPage(currentPage - 1);
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(() => {
      nextPage();
    }, autoplayDelay);
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  // Event Listeners
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      nextPage();
      startAutoplay();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prevPage();
      startAutoplay();
    });
  }

  // Pause on hover
  container.addEventListener('mouseenter', stopAutoplay);
  container.addEventListener('mouseleave', startAutoplay);

  // Touch Swipe Support
  let touchStartX = 0;
  let touchEndX = 0;

  viewport.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  viewport.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const threshold = 40;
    if (touchEndX < touchStartX - threshold) {
      nextPage();
      startAutoplay();
    } else if (touchEndX > touchStartX + threshold) {
      prevPage();
      startAutoplay();
    }
  }, { passive: true });

  // Resize Handler with Debounce
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const newItemsPerView = getItemsPerView();
      if (newItemsPerView !== itemsPerView) {
        itemsPerView = newItemsPerView;
        renderDots();
        goToPage(0);
      } else {
        goToPage(currentPage);
      }
    }, 150);
  });

  // Initial setup
  renderDots();
  goToPage(0);
  startAutoplay();
}

