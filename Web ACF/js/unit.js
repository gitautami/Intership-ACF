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
});
