/**
 * ACF EDUHUB - Navigation Controller (Navbar & Sidebar Drawer)
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const navbar = document.getElementById('mainNavbar');
  const sidebarDrawer = document.getElementById('sidebarNavDrawer');
  const sidebarOverlay = document.getElementById('sidebarNavOverlay');
  const openSidebarBtns = document.querySelectorAll('.btn-open-sidebar');
  const closeSidebarBtn = document.getElementById('sidebarCloseBtn');
  const sidebarSearchInput = document.getElementById('sidebarSearchInput');
  const navItemsWithSubmenu = document.querySelectorAll('.side-nav-item.has-submenu');

  // 1. Scroll Effect for Top Navbar (Smooth Expand at Top, Compact on Scroll Down)
  if (navbar) {
    let ticking = false;

    const handleScroll = () => {
      if (window.scrollY > 20) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(handleScroll);
        ticking = true;
      }
    }, { passive: true });

    handleScroll();
  }

  // 2. Open / Close Sidebar Drawer
  function openSidebar() {
    if (sidebarDrawer && sidebarOverlay) {
      sidebarDrawer.classList.add('active');
      sidebarOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      if (sidebarSearchInput) {
        setTimeout(() => sidebarSearchInput.focus(), 250);
      }
    }
  }

  function closeSidebar() {
    if (sidebarDrawer && sidebarOverlay) {
      sidebarDrawer.classList.remove('active');
      sidebarOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  openSidebarBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openSidebar();
    });
  });

  if (closeSidebarBtn) {
    closeSidebarBtn.addEventListener('click', closeSidebar);
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', closeSidebar);
  }

  // Close on Escape Key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebarDrawer && sidebarDrawer.classList.contains('active')) {
      closeSidebar();
    }
  });

  // 3. Sidebar Accordion Submenus
  navItemsWithSubmenu.forEach(item => {
    const trigger = item.querySelector('.side-nav-link');
    if (trigger) {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const isOpen = item.classList.contains('open');

        // Close other submenus
        navItemsWithSubmenu.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('open');
          }
        });

        if (isOpen) {
          item.classList.remove('open');
        } else {
          item.classList.add('open');
        }
      });
    }
  });

  // 4. Live Search in Sidebar
  if (sidebarSearchInput) {
    sidebarSearchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      const allNavItems = document.querySelectorAll('.side-nav-item');

      allNavItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        if (query === '' || text.includes(query)) {
          item.style.display = 'flex';
          if (query !== '' && item.classList.contains('has-submenu')) {
            item.classList.add('open');
          }
        } else {
          item.style.display = 'none';
        }
      });
    });
  }

  // 5. Active Link Highlight
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const allLinks = document.querySelectorAll('.nav-link, .dropdown-item-card, .side-nav-link, .side-submenu-link');

  allLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && (href === currentPath || (currentPath === '' && href === 'index.html'))) {
      link.classList.add('active');
      const parentSubmenuItem = link.closest('.side-nav-item.has-submenu');
      if (parentSubmenuItem) {
        parentSubmenuItem.classList.add('open');
      }
    }
  });

  // 6. Floating WhatsApp Button Injection for All Web Pages
  if (!document.querySelector('.floating-whatsapp-btn')) {
    const waAnchor = document.createElement('a');
    waAnchor.href = 'https://wa.me/6285179797661?text=Halo%20ACF%20Eduhub,%20saya%20ingin%20bertanya%20informasi%20terkait%20program%20dan%20kegiatan.';
    waAnchor.target = '_blank';
    waAnchor.rel = 'noopener noreferrer';
    waAnchor.className = 'floating-whatsapp-btn';
    waAnchor.setAttribute('aria-label', 'Chat WhatsApp ACF Eduhub');
    waAnchor.setAttribute('title', 'Hubungi Kami via WhatsApp');
    waAnchor.innerHTML = `
      <svg viewBox="0 0 24 24"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0012.04 2zm.01 1.67c4.54 0 8.24 3.7 8.24 8.24 0 2.2-.86 4.27-2.42 5.83a8.19 8.19 0 01-5.82 2.41c-1.42 0-2.82-.37-4.06-1.07l-.29-.17-3.02.79.81-2.94-.19-.3a8.21 8.21 0 01-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24zm4.5 11.66c-.25-.13-1.47-.73-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.65.81-.8 1-.15.19-.3.21-.55.08-.25-.13-1.05-.39-2-1.23-.74-.66-1.24-1.48-1.39-1.73-.15-.25-.02-.38.11-.51.11-.11.25-.29.37-.44.12-.15.16-.25.25-.42.08-.17.04-.32-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.48-.4-.42-.56-.43h-.48c-.16 0-.42.06-.65.31-.22.25-.86.84-.86 2.05 0 1.21.88 2.38 1 2.55.13.17 1.73 2.64 4.19 3.7 2.46 1.07 2.46.71 2.9.67.44-.04 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.47-.29z"/></svg>
      <span class="floating-whatsapp-tooltip">Chat WhatsApp ACF Eduhub</span>
    `;
    document.body.appendChild(waAnchor);
  }
});

