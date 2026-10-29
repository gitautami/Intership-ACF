/**
 * ACF EDUHUB - General Animations & UI Helper
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. General Scroll Reveal animations
  // We exclude elements inside interactive sections with dedicated repeat lifecycles:
  // - #dampak-kredibilitas (homepage stats)
  // - #unit-pendidikan (homepage units)
  // - #dampak / .compact-stats-section (cerita kami stats)
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .stagger');
  const homeDampakSection = document.getElementById('dampak-kredibilitas');
  const unitSection = document.getElementById('unit-pendidikan');
  const ceritaDampakSection = document.getElementById('dampak') || document.querySelector('.compact-stats-section');

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

    revealElements.forEach(el => {
      if (homeDampakSection && homeDampakSection.contains(el)) return;
      if (unitSection && unitSection.contains(el)) return;
      if (ceritaDampakSection && ceritaDampakSection.contains(el)) return;
      revealObserver.observe(el);
    });
  } else {
    revealElements.forEach(el => el.classList.add('visible'));
  }

  // 2. Reusable Repeatable Counter Animation Controller
  function setupStatsCounter({ section, containerSelector, itemSelector, threshold = 0.2 }) {
    if (!section || !('IntersectionObserver' in window)) return;

    const container = containerSelector ? section.querySelector(containerSelector) : null;
    const items = itemSelector ? section.querySelectorAll(itemSelector) : [];
    const statNumbers = section.querySelectorAll('.stat-number[data-count]');
    const sectionReveals = section.querySelectorAll('.reveal');
    let activeAnimationFrames = [];

    const animateNumber = (el, target, duration = 1250) => {
      const startTime = performance.now();
      const step = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        const currentVal = Math.round(ease * target);

        el.textContent = currentVal.toLocaleString('id-ID');

        if (progress < 1) {
          const rafId = requestAnimationFrame(step);
          activeAnimationFrames.push(rafId);
        } else {
          el.textContent = target.toLocaleString('id-ID');
        }
      };
      const rafId = requestAnimationFrame(step);
      activeAnimationFrames.push(rafId);
    };

    const resetStats = () => {
      activeAnimationFrames.forEach(id => cancelAnimationFrame(id));
      activeAnimationFrames = [];

      statNumbers.forEach(el => {
        el.textContent = '0';
      });

      if (container) container.classList.remove('is-active');
      items.forEach(card => card.classList.remove('pop-in'));
      sectionReveals.forEach(el => el.classList.remove('visible'));
    };

    const triggerStats = () => {
      sectionReveals.forEach(el => el.classList.add('visible'));
      if (container) container.classList.add('is-active');

      items.forEach((card, index) => {
        card.style.transitionDelay = `${index * 60}ms`;
        card.classList.add('pop-in');
      });

      statNumbers.forEach(el => {
        const target = parseInt(el.dataset.count, 10);
        if (!isNaN(target)) {
          animateNumber(el, target, 1250);
        }
      });
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          triggerStats();
        } else {
          resetStats();
        }
      });
    }, {
      threshold,
      rootMargin: '0px 0px -30px 0px'
    });

    observer.observe(section);
  }

  // A. Initialize Homepage Dampak & Kredibilitas Stats
  if (homeDampakSection) {
    setupStatsCounter({
      section: homeDampakSection,
      containerSelector: '.home-stats-grid-6',
      itemSelector: '.home-stat-card',
      threshold: 0.18
    });
  }

  // B. Initialize Cerita Kami (kisah-kami.html) Dampak Nyata Stats
  if (ceritaDampakSection) {
    setupStatsCounter({
      section: ceritaDampakSection,
      containerSelector: '.compact-stats-strip',
      itemSelector: '.compact-stat-item',
      threshold: 0.2
    });
  }

  // C. Fallback for non-IntersectionObserver browsers
  if (!('IntersectionObserver' in window)) {
    const fallbackNumbers = document.querySelectorAll('.stat-number[data-count]');
    fallbackNumbers.forEach(el => {
      const target = parseInt(el.dataset.count, 10);
      if (!isNaN(target)) el.textContent = target.toLocaleString('id-ID');
    });
    document.querySelectorAll('.home-stat-card, .compact-stat-item').forEach(c => c.classList.add('pop-in'));
  }
});
