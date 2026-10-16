/**
 * ACF EDUHUB — Program Layanan Interactions
 */
document.addEventListener('DOMContentLoaded', () => {
  const categoryPills = document.querySelectorAll('.category-nav-pill');
  const sections = document.querySelectorAll('.program-category-section');

  function getScrollOffset() {
    const mainNav = document.getElementById('mainNavbar');
    const catNav = document.querySelector('.program-category-nav');
    const navH = mainNav ? mainNav.offsetHeight : 70;
    const catH = catNav ? catNav.offsetHeight : 50;
    return navH + catH + 12;
  }

  // Smooth scroll handler for quick nav pills
  categoryPills.forEach(pill => {
    pill.addEventListener('click', (e) => {
      const targetId = pill.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          const targetPos = targetEl.getBoundingClientRect().top + window.pageYOffset - getScrollOffset();
          window.scrollTo({ top: targetPos, behavior: 'smooth' });

          categoryPills.forEach(p => p.classList.remove('active'));
          pill.classList.add('active');

          if (history.pushState) {
            history.pushState(null, null, targetId);
          }
        }
      }
    });
  });

  // Scroll spy to highlight active pill as user scrolls
  if ('IntersectionObserver' in window && sections.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          categoryPills.forEach(pill => {
            const isMatch = pill.getAttribute('href') === `#${id}`;
            pill.classList.toggle('active', isMatch);
            if (isMatch) {
              // Ensure active pill is scrolled into view in horizontal container
              pill.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
            }
          });
        }
      });
    }, {
      rootMargin: '-30% 0px -60% 0px',
      threshold: 0
    });

    sections.forEach(sec => observer.observe(sec));
  }

  // Hash on page load
  if (window.location.hash) {
    const target = document.querySelector(window.location.hash);
    if (target) {
      setTimeout(() => {
        const targetPos = target.getBoundingClientRect().top + window.pageYOffset - getScrollOffset();
        window.scrollTo({ top: targetPos, behavior: 'smooth' });
      }, 150);
    }
  }
});

