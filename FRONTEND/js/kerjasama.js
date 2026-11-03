/**
 * ACF EDUHUB — Kerjasama & Kemitraan Interactions
 */
document.addEventListener('DOMContentLoaded', () => {
  // 1. Interactive Staggered Entrance & Looping Wave Animation (Desktop & Mobile)
  initKerjasamaCardsAnimation();

  // 2. Form Submission Handler
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

