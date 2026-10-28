/**
 * ACF EDUHUB - General Animations & UI Helper
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. General Scroll Reveal animations
  // We exclude elements inside #dampak-kredibilitas from the one-time general observer
  // so that #dampak-kredibilitas has its own fully repeatable scroll lifecycle.
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .stagger');
  const dampakSection = document.getElementById('dampak-kredibilitas');

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
      if (dampakSection && dampakSection.contains(el)) return;
      revealObserver.observe(el);
    });
  } else {
    revealElements.forEach(el => el.classList.add('visible'));
  }

  // 2. Dampak & Kredibilitas Repeatable Scroll Animation & Counter
  if (dampakSection && 'IntersectionObserver' in window) {
    const statsGrid = dampakSection.querySelector('.home-stats-grid-6');
    const statCards = dampakSection.querySelectorAll('.home-stat-card');
    const statNumbers = dampakSection.querySelectorAll('.stat-number[data-count]');
    const sectionReveals = dampakSection.querySelectorAll('.reveal');
    let activeAnimationFrames = [];

    const animateNumber = (el, target, duration = 1250) => {
      const startTime = performance.now();
      const step = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // easeOutCubic curve
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

    const resetDampak = () => {
      // Cancel active animation frames
      activeAnimationFrames.forEach(id => cancelAnimationFrame(id));
      activeAnimationFrames = [];

      // Reset numbers to 0
      statNumbers.forEach(el => {
        el.textContent = '0';
      });

      // Remove active states
      if (statsGrid) statsGrid.classList.remove('is-active');
      statCards.forEach(card => card.classList.remove('pop-in'));
      sectionReveals.forEach(el => el.classList.remove('visible'));
    };

    const triggerDampak = () => {
      // 1. Reveal section elements
      sectionReveals.forEach(el => el.classList.add('visible'));

      // 2. Activate stats grid
      if (statsGrid) statsGrid.classList.add('is-active');

      // 3. Stagger stat card pop-in
      statCards.forEach((card, index) => {
        card.style.transitionDelay = `${index * 60}ms`;
        card.classList.add('pop-in');
      });

      // 4. Start counting up smoothly
      statNumbers.forEach(el => {
        const target = parseInt(el.dataset.count, 10);
        if (!isNaN(target)) {
          animateNumber(el, target, 1300);
        }
      });
    };

    const dampakObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          triggerDampak();
        } else {
          resetDampak();
        }
      });
    }, {
      threshold: 0.18,
      rootMargin: '0px 0px -30px 0px'
    });

    dampakObserver.observe(dampakSection);
  } else {
    // Fallback if not on index or IntersectionObserver unavailable
    const fallbackNumbers = document.querySelectorAll('.stat-number[data-count]');
    fallbackNumbers.forEach(el => {
      const target = parseInt(el.dataset.count, 10);
      if (!isNaN(target)) el.textContent = target.toLocaleString('id-ID');
    });
    document.querySelectorAll('.home-stat-card').forEach(c => c.classList.add('pop-in'));
  }
});
