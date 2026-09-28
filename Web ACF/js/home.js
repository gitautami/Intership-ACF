/**
 * ACF EDUHUB — Beranda (Homepage) Interactive JS
 * Hero Slider / Carousel Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  initHeroSlider();
  initMitraSlider();
  initHomeKabar();
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

/**
 * Dynamically loads and updates latest 3 published articles on the homepage.
 * Keeps homepage in sync with acf_articles_data in localStorage.
 */
function initHomeKabar() {
  const container = document.querySelector('.home-kabar-grid');
  if (!container) return;

  const DEFAULT_ARTICLES = [
    {
      id: 'ART-SDS07',
      title: 'Menyalakan Kembali Api Harapan: Kisah Pejuang PKBM Ceria Taklukkan ANBK 2025',
      category: 'kabar-sekolah-daya-setara',
      categoryLabel: 'Artikel Sekolah Daya Setara',
      author: 'cerianak',
      date: 'Aug 14, 2025',
      cover: 'assets/kabar-sekolahdayasetara/2.png',
      excerpt: 'Bandung – Di sudut keheningan, sering terdengar keraguan yang membisik, “Kesempatanmu sudah lewat.” Sebuah kalimat yang mampu memadamkan semangat dan mengubur mimpi. Namun, di tengah riuhnya kota Bandung...',
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
      status: 'Terbit'
    },
    {
      id: 'ART-SDS04',
      title: 'PKBM Ceria di Lembang Resmi di-Launching',
      category: 'kabar-sekolah-daya-setara',
      categoryLabel: 'Artikel Sekolah Daya Setara',
      author: 'acforid',
      date: 'Sep 12, 2024',
      cover: 'assets/kabar-sekolahdayasetara/Foto-Artikel-September-03.jpg',
      excerpt: 'Bandung Barat, 7 September 2024 – Rumah Zakat dan ACF (Anak Ceria Foundation) berkolaborasi dengan Pemerintah Kabupaten Bandung Barat meresmikan Pusat Kegiatan Belajar Masyarakat (PKBM)...',
      status: 'Terbit'
    }
  ];

  function getCategoryLabel(art) {
    if (art.categoryLabel) return art.categoryLabel;
    switch (art.category) {
      case 'kabar-sekolah-daya-setara':
      case 'sekolah-daya-setara':
        return 'Artikel Sekolah Daya Setara';
      case 'kabar-sekolah-juara':
      case 'sekolah-juara':
        return 'Artikel Sekolah Juara';
      case 'liputan':
        return 'Liputan Lapangan';
      case 'vokasi':
        return 'Program Vokasi';
      case 'opini':
        return 'Kolaborasi & Opini';
      default:
        return 'Artikel Pendidikan';
    }
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

  function renderHomeKabar() {
    let articles = [];
    try {
      const saved = localStorage.getItem('acf_articles_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          articles = parsed;
        } else {
          articles = DEFAULT_ARTICLES;
        }
      } else {
        articles = DEFAULT_ARTICLES;
      }
    } catch (e) {
      articles = DEFAULT_ARTICLES;
    }

    // Filter only published articles
    const published = articles.filter(a => (a.status || 'Terbit') !== 'Draf');
    const latestArticles = published.slice(0, 3);

    if (latestArticles.length === 0) return;

    container.innerHTML = '';

    latestArticles.forEach(art => {
      const articleEl = document.createElement('article');
      articleEl.className = 'home-kabar-card reveal visible';

      const coverSrc = art.cover || 'assets/logo-acf/LOGO_ACF-removebg-preview.png';
      const catClass = (art.category || 'artikel').toLowerCase().replace(/\s+/g, '-');
      const catLabel = getCategoryLabel(art);
      const articleUrl = `kabar.html?id=${encodeURIComponent(art.id || '')}`;

      articleEl.innerHTML = `
        <a href="${articleUrl}" class="home-kabar-img-link" aria-label="Baca ${escapeHTML(art.title || '')}">
          <div class="home-kabar-img-wrap">
            <img src="${escapeHTML(coverSrc)}" alt="${escapeHTML(art.title || 'Kabar ACF')}" class="home-kabar-img" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&q=80'">
            <span class="home-kabar-tag ${escapeHTML(catClass)}">${escapeHTML(catLabel)}</span>
          </div>
        </a>
        <div class="home-kabar-body">
          <h3 class="home-kabar-title">
            <a href="${articleUrl}">${escapeHTML(art.title || '')}</a>
          </h3>
          <p class="home-kabar-excerpt">
            ${escapeHTML(art.excerpt || '')}
          </p>
          <div class="home-kabar-footer">
            <a href="${articleUrl}" class="home-kabar-readmore">
              <span>Baca Selengkapnya</span>
              <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
          </div>
        </div>
      `;

      container.appendChild(articleEl);
    });
  }

  // Initial render
  renderHomeKabar();

  // Listen to cross-tab storage changes from Admin or Kabar page
  window.addEventListener('storage', (e) => {
    if (e.key === 'acf_articles_data') {
      renderHomeKabar();
    }
  });
}


