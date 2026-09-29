/**
 * ACF EDUHUB - General Animations & UI Helper
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Scroll Reveal animations
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .stagger');
  if (revealElements.length > 0 && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -30px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('visible'));
  }

  // 2. Counter animation for stats
  const statNumbers = document.querySelectorAll('.stat-number[data-count]');
  if (statNumbers.length > 0 && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.count, 10);
          if (isNaN(target)) return;
          
          let current = 0;
          const increment = Math.max(1, Math.ceil(target / 40));
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              el.textContent = target.toLocaleString('id-ID');
              clearInterval(timer);
            } else {
              el.textContent = Math.ceil(current).toLocaleString('id-ID');
            }
          }, 35);
          counterObserver.unobserve(el);
        }
      });
    }, { threshold: 0.3 });

    statNumbers.forEach(el => counterObserver.observe(el));
  }
});
