/**
 * ACF EDUHUB — Kisah Kami & Visi Misi Interactions
 */
document.addEventListener('DOMContentLoaded', () => {
  // 1. Inisialisasi animasi masuk tulisan hero banner dari bawah (slide-up)
  initPageHeroBannerAnimation();

  // 2. Hash smooth navigation
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
});

/**
 * Page Hero Content Entrance Animation (Slide up from bottom)
 * Mengaktifkan efek teks masuk dari bawah dan dapat berulang saat di-scroll kembali ke atas.
 */
function initPageHeroBannerAnimation() {
  const hero = document.querySelector('.page-hero');
  if (!hero) return;

  const animatedElements = hero.querySelectorAll('.section-label, .page-hero-breadcrumb, .page-hero-title, .page-hero-subtitle');
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
