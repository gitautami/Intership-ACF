/**
 * ACF EDUHUB — Kisah Kami & Visi Misi Interactions
 */
document.addEventListener('DOMContentLoaded', () => {
  // Hash smooth navigation
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
