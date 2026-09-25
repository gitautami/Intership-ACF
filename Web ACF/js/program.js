/**
 * ACF EDUHUB — Program Layanan Interactions
 */
document.addEventListener('DOMContentLoaded', () => {
  // Smooth scroll to category anchors
  if (window.location.hash) {
    const target = document.querySelector(window.location.hash);
    if (target) {
      setTimeout(() => {
        const navHeight = 85;
        const targetPos = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
        window.scrollTo({ top: targetPos, behavior: 'smooth' });
      }, 100);
    }
  }
});
