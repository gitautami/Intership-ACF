/**
 * ACF EDUHUB — Program Layanan Interactions
 */
document.addEventListener('DOMContentLoaded', () => {
  const sidebarDrawer = document.getElementById('sidebarNavDrawer');
  const sidebarOverlay = document.getElementById('sidebarNavOverlay');

  function getScrollOffset() {
    const mainNav = document.getElementById('mainNavbar');
    const navH = mainNav ? mainNav.offsetHeight : 70;
    return navH + 16;
  }

  function smoothScrollTo(targetEl) {
    if (!targetEl) return;
    const targetPos = targetEl.getBoundingClientRect().top + window.pageYOffset - getScrollOffset();
    window.scrollTo({ top: targetPos, behavior: 'smooth' });
  }

  // Smooth scroll handler for any anchor links on the page
  const inPageLinks = document.querySelectorAll('a[href^="#"]');
  inPageLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId && targetId.length > 1 && targetId.startsWith('#')) {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          
          // Close mobile sidebar drawer if it was opened
          const closeBtn = document.getElementById('sidebarCloseBtn');
          if (sidebarDrawer && sidebarDrawer.classList.contains('active') && closeBtn) {
            closeBtn.click();
          }

          smoothScrollTo(targetEl);
          if (history.pushState) {
            history.pushState(null, null, targetId);
          }
        }
      }
    });
  });

  // Handle deep link hash on page load if valid
  if (window.location.hash && window.location.hash.length > 1) {
    try {
      const target = document.querySelector(window.location.hash);
      if (target) {
        setTimeout(() => {
          smoothScrollTo(target);
        }, 200);
      }
    } catch (err) {
      // Ignore invalid selector
    }
  }
});
