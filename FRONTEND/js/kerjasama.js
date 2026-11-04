/**
 * ACF EDUHUB — Kerjasama & Kemitraan Interactions
 */
document.addEventListener('DOMContentLoaded', () => {
  // 1. Inisialisasi animasi masuk tulisan hero banner dari bawah (slide-up)
  initKerjasamaHeroBannerAnimation();

  // 2. Interactive Staggered Entrance & Looping Wave Animation (Desktop & Mobile)
  initKerjasamaCardsAnimation();

  // 3. Form Submission Handler
  const form = document.querySelector('.kerjasama-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nama = form.querySelector('[name="nama"]')?.value || 'Mitra';
      alert(`Terima kasih Bapak/Ibu ${nama}. Formulir pengajuan kerjasama telah kami terima. Tim Kemitraan ACF Eduhub akan menghubungi Anda dalam waktu 1x24 jam.`);
      form.reset();
    });
  }
});

/**
 * Kerjasama Hero Banner Entrance Animation (Slide up from bottom)
 * Mengaktifkan efek teks masuk dari bawah dan berulang saat di-scroll kembali ke atas.
 */
function initKerjasamaHeroBannerAnimation() {
  const hero = document.querySelector('.kerjasama-header-banner');
  if (!hero) return;

  const animatedElements = hero.querySelectorAll('.section-label, h1, p, .kerjasama-banner-title, .kerjasama-banner-desc');
  if (animatedElements.length === 0) return;

  function triggerHeroAnimation() {
    animatedElements.forEach(el => {
      el.style.animation = 'none';
      void el.offsetHeight; // force reflow
      el.style.animation = '';
    });
    hero.classList.add('is-animated');
  }

  // Initial trigger
  triggerHeroAnimation();

  if ('IntersectionObserver' in window) {
    let hasLeft = false;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (hasLeft) {
            triggerHeroAnimation();
          }
        } else {
          hasLeft = true;
          hero.classList.remove('is-animated');
        }
      });
    }, { threshold: 0.15 });

    observer.observe(hero);
  }
}

/**
 * Kerjasama Cards Staggered Slide Entrance & Ambient Looping Wave Animation
 * Berfungsi identik pada tampilan desktop maupun mobile
 */
function initKerjasamaCardsAnimation() {
  const grid = document.getElementById('kerjasamaCardsGrid') || document.querySelector('.kerjasama-cards-grid');
  if (!grid) return;

  const cards = grid.querySelectorAll('.kerjasama-card-box');
  if (cards.length === 0) return;

  let timeouts = [];

  function triggerKerjasamaAnimation() {
    resetKerjasamaAnimation();
    grid.classList.add('is-visible');

    cards.forEach((card, index) => {
      const t = setTimeout(() => {
        card.classList.add('animate-in', 'visible');
        // Setelah animasi masuk selesai, aktifkan siklus efek gelombang berulang
        const loopT = setTimeout(() => {
          card.classList.add('is-looping');
        }, 900);
        timeouts.push(loopT);
      }, (index * 220) + 100);
      timeouts.push(t);
    });
  }

  function resetKerjasamaAnimation() {
    timeouts.forEach(t => clearTimeout(t));
    timeouts = [];
    grid.classList.remove('is-visible');
    cards.forEach(card => {
      card.classList.remove('animate-in', 'visible', 'is-looping');
    });
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          triggerKerjasamaAnimation();
        } else {
          // Reset saat scroll menjauh agar animasi masuk satu per satu berulang setiap kali di-scroll
          resetKerjasamaAnimation();
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -20px 0px' });

    observer.observe(grid);
  } else {
    triggerKerjasamaAnimation();
  }
}
