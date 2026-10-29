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

    // 2. Open / Close Sidebar Drawer with Bulletproof Scroll Lock
    let savedScrollY = 0;

    function openSidebar() {
        if (sidebarDrawer && sidebarOverlay) {
            savedScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;

            // Lock background body scrolling completely on both mobile and desktop
            document.body.style.position = 'fixed';
            document.body.style.top = `-${savedScrollY}px`;
            document.body.style.left = '0';
            document.body.style.right = '0';
            document.body.style.width = '100%';
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';

            sidebarDrawer.classList.add('active');
            sidebarOverlay.classList.add('active');
            document.body.classList.add('sidebar-open');

            // Ensure drawer menu is scrolled to top on open
            const sbBody = sidebarDrawer.querySelector('.sidebar-body');
            if (sbBody) {
                sbBody.scrollTop = 0;
            }

            if (sidebarSearchInput) {
                setTimeout(() => sidebarSearchInput.focus(), 250);
            }
        }
    }

    function closeSidebar() {
        if (sidebarDrawer && sidebarOverlay) {
            sidebarDrawer.classList.remove('active');
            sidebarOverlay.classList.remove('active');
            document.body.classList.remove('sidebar-open');

            // Restore body positioning and exact scroll position
            document.body.style.removeProperty('position');
            document.body.style.removeProperty('top');
            document.body.style.removeProperty('left');
            document.body.style.removeProperty('right');
            document.body.style.removeProperty('width');
            document.body.style.removeProperty('overflow');
            document.documentElement.style.removeProperty('overflow');

            window.scrollTo(0, savedScrollY);
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
        sidebarOverlay.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });
    }

    if (sidebarDrawer) {
        // Prevent background scrolling when dragging on non-scrollable header/search/footer
        const nonScrollableParts = sidebarDrawer.querySelectorAll('.sidebar-header, .sidebar-lang-row, .sidebar-search-box, .sidebar-footer');
        nonScrollableParts.forEach(el => {
            el.addEventListener('touchmove', (e) => {
                e.preventDefault();
            }, { passive: false });
        });
    }

    // Close on Escape Key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebarDrawer && sidebarDrawer.classList.contains('active')) {
            closeSidebar();
        }
    });

    // 3. Sidebar Accordion Submenus
    navItemsWithSubmenu.forEach(item => {
        const toggleBtn = item.querySelector('.side-submenu-toggle');
        const trigger = item.querySelector('.side-nav-link');

        if (toggleBtn) {
            toggleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const isOpen = item.classList.contains('open');

                navItemsWithSubmenu.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('open');
                    }
                });

                item.classList.toggle('open', !isOpen);
            });
        } else if (trigger && trigger.tagName === 'BUTTON') {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                const isOpen = item.classList.contains('open');

                navItemsWithSubmenu.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('open');
                    }
                });

                item.classList.toggle('open', !isOpen);
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

    // 6b. Auto-load Cherry AI Chatbot (ACF Virtual Assistant)
    if (!document.querySelector('link[href*="chatbot.css"]')) {
        const chatCss = document.createElement('link');
        chatCss.rel = 'stylesheet';
        chatCss.href = '../css/chatbot.css?v=8';
        document.head.appendChild(chatCss);
    }
    if (!window.CherryChatbotInitialized && !document.querySelector('script[src*="chatbot.js"]')) {
        const chatScript = document.createElement('script');
        chatScript.src = '../js/chatbot.js?v=8';
        chatScript.defer = true;
        document.body.appendChild(chatScript);
    }

    // ============================================================
    // 7. BILINGUAL TRANSLATION CONTROLLER (INDONESIAN <-> ENGLISH)
    // ============================================================
    const initBilingualFeature = () => {
        let currentLang = localStorage.getItem('acf_language') || 'id';

        // Helper: Manage Google Translate Cookie
        const setTranslateCookie = (lang) => {
            const domain = window.location.hostname;
            const past = 'Thu, 01 Jan 1970 00:00:00 UTC';
            const pathParts = window.location.pathname.split('/');
            pathParts.pop();
            const dir = pathParts.join('/') || '/';

            if (lang === 'en') {
                document.cookie = 'googtrans=/id/en; path=/;';
                if (dir && dir !== '/') {
                    document.cookie = `googtrans=/id/en; path=${dir};`;
                }
                if (domain && domain !== 'localhost') {
                    document.cookie = `googtrans=/id/en; path=/; domain=${domain};`;
                }
            } else {
                // Clear all instances of googtrans cookie across domains and paths
                const paths = ['/', dir, window.location.pathname];
                const domains = ['', domain, '.' + domain];
                paths.forEach(p => {
                    domains.forEach(d => {
                        const dStr = d ? `; domain=${d}` : '';
                        document.cookie = `googtrans=; expires=${past}; path=${p}${dStr};`;
                        document.cookie = `googtrans=/id/id; path=${p}${dStr};`;
                    });
                });
                document.cookie = `googtrans=; expires=${past}; path=/;`;
                document.cookie = 'googtrans=/id/id; path=/;';
            }
        };

        // Align cookie state immediately on load
        setTranslateCookie(currentLang);

        // Helper: Synchronize active state on all pill buttons
        const syncButtonStates = (lang) => {
            document.querySelectorAll('.lang-pill-btn').forEach(btn => {
                const isMatch = btn.getAttribute('data-lang') === lang;
                btn.classList.toggle('active', isMatch);
                btn.setAttribute('aria-pressed', isMatch ? 'true' : 'false');
            });
        };

        // Helper: Instant UI text switch for critical buttons (0ms delay)
        const applyInstantUITranslation = (lang) => {
            document.querySelectorAll('.btn-donasi span, .btn-sidebar-donasi span').forEach(s => {
                s.textContent = lang === 'en' ? 'Donate Now' : 'Salurkan Donasi';
            });
        };

        // Helper: Ensure Google Translate mount element exists
        if (!document.getElementById('google_translate_element')) {
            const gtDiv = document.createElement('div');
            gtDiv.id = 'google_translate_element';
            gtDiv.style.display = 'none';
            document.body.appendChild(gtDiv);
        }

        // Helper: Register Google Translate script
        if (!window.googleTranslateElementInit) {
            window.googleTranslateElementInit = function () {
                if (window.google && window.google.translate) {
                    new window.google.translate.TranslateElement({
                        pageLanguage: 'id',
                        includedLanguages: 'id,en',
                        autoDisplay: false
                    }, 'google_translate_element');
                }
            };

            const gtScript = document.createElement('script');
            gtScript.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
            gtScript.async = true;
            document.head.appendChild(gtScript);
        }

        // Inject desktop switcher in .nav-actions if not already present
        const navActions = document.querySelector('.nav-actions');
        const btnDonasi = document.querySelector('.btn-donasi');
        if (navActions && !navActions.querySelector('.lang-pill-switch')) {
            const switcher = document.createElement('div');
            switcher.className = 'lang-pill-switch';
            switcher.setAttribute('role', 'group');
            switcher.setAttribute('aria-label', 'Pilihan Bahasa');
            switcher.innerHTML = `
                <button type="button" class="lang-pill-btn ${currentLang === 'id' ? 'active' : ''}" data-lang="id" aria-pressed="${currentLang === 'id'}" title="Bahasa Indonesia">ID</button>
                <button type="button" class="lang-pill-btn ${currentLang === 'en' ? 'active' : ''}" data-lang="en" aria-pressed="${currentLang === 'en'}" title="English">EN</button>
            `;
            if (btnDonasi && btnDonasi.nextSibling) {
                navActions.insertBefore(switcher, btnDonasi.nextSibling);
            } else {
                navActions.appendChild(switcher);
            }
        }

        // Inject mobile drawer switcher in sidebar if not already present
        const sidebarHeader = document.querySelector('.sidebar-header');
        if (sidebarHeader && !document.querySelector('.sidebar-lang-row')) {
            const sbLangRow = document.createElement('div');
            sbLangRow.className = 'sidebar-lang-row';
            sbLangRow.innerHTML = `
                <div class="sidebar-lang-label">
                    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
                    <span>Bahasa / Language</span>
                </div>
                <div class="lang-pill-switch" role="group" aria-label="Pilihan Bahasa Mobile">
                    <button type="button" class="lang-pill-btn ${currentLang === 'id' ? 'active' : ''}" data-lang="id" aria-pressed="${currentLang === 'id'}" title="Bahasa Indonesia">ID</button>
                    <button type="button" class="lang-pill-btn ${currentLang === 'en' ? 'active' : ''}" data-lang="en" aria-pressed="${currentLang === 'en'}" title="English">EN</button>
                </div>
            `;
            const searchBox = document.querySelector('.sidebar-search-box');
            if (searchBox && searchBox.parentNode) {
                searchBox.parentNode.insertBefore(sbLangRow, searchBox);
            } else if (sidebarHeader.nextSibling) {
                sidebarHeader.parentNode.insertBefore(sbLangRow, sidebarHeader.nextSibling);
            }
        }

        // Immediately update visual button state & instant translations
        syncButtonStates(currentLang);
        applyInstantUITranslation(currentLang);

        // Helper: Poll and trigger Google Translate widget combo
        const triggerWidgetTranslation = (lang) => {
            let attempts = 0;
            const poll = setInterval(() => {
                attempts++;
                const combo = document.querySelector('.goog-te-combo');
                const isTranslated = document.documentElement.classList.contains('translated-ltr') ||
                    document.querySelector('.goog-te-banner-frame') !== null;
                if (combo) {
                    if (lang === 'en' && !isTranslated) {
                        combo.value = 'en';
                        combo.dispatchEvent(new Event('change'));
                    } else if (combo.value !== lang) {
                        combo.value = lang;
                        combo.dispatchEvent(new Event('change'));
                    }
                    if (isTranslated || lang === 'id') {
                        clearInterval(poll);
                    }
                }
                if (attempts > 30) clearInterval(poll);
            }, 200);
        };

        // Function: Switch language on click
        function applyLanguage(lang) {
            if (lang === currentLang) return;
            currentLang = lang;
            localStorage.setItem('acf_language', lang);
            setTranslateCookie(lang);
            syncButtonStates(lang);
            applyInstantUITranslation(lang);

            if (lang === 'id') {
                // Bersihkan translasi seketika dan reload ke tampilan asli Bahasa Indonesia
                window.location.reload();
            } else {
                const combo = document.querySelector('.goog-te-combo');
                if (combo) {
                    combo.value = 'en';
                    combo.dispatchEvent(new Event('change'));
                } else {
                    triggerWidgetTranslation('en');
                    // Fallback reload if translation widget is taking longer
                    setTimeout(() => {
                        const comboNow = document.querySelector('.goog-te-combo');
                        if (!comboNow) {
                            window.location.reload();
                        }
                    }, 1500);
                }
            }
        }

        // Click handler for all language pill buttons
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.lang-pill-btn');
            if (btn) {
                e.preventDefault();
                e.stopPropagation();
                const targetLang = btn.getAttribute('data-lang');
                if (targetLang) {
                    applyLanguage(targetLang);
                }
            }
        });

        // Ensure links preserve current language cookie when user clicks any link
        document.addEventListener('click', (e) => {
            const anchor = e.target.closest('a');
            if (anchor && anchor.href && !anchor.href.startsWith('#') && !anchor.href.startsWith('javascript:')) {
                setTranslateCookie(currentLang);
            }
        });

        // If English is the saved preference, ensure translation triggers
        if (currentLang === 'en') {
            triggerWidgetTranslation('en');
        }

        // Keep layout clean from Google Translate top bar artifacts
        const removeGoogleBars = () => {
            if (document.body.style.top && document.body.style.top !== '0px') {
                document.body.style.setProperty('top', '0px', 'important');
            }
            if (document.documentElement.style.top && document.documentElement.style.top !== '0px') {
                document.documentElement.style.setProperty('top', '0px', 'important');
            }
            const banners = document.querySelectorAll('.goog-te-banner-frame, iframe.skiptranslate, .VIpgJd-ZVi9od-ORHb-OEVmcd, .VIpgJd-ZVi9od-l4eHX-hSRGPd');
            banners.forEach(b => {
                b.style.setProperty('display', 'none', 'important');
                b.style.setProperty('visibility', 'hidden', 'important');
                b.style.setProperty('height', '0px', 'important');
                b.style.setProperty('pointer-events', 'none', 'important');
            });
        };
        setInterval(removeGoogleBars, 250);
    };

    initBilingualFeature();

    // Auto-inject Chatbot "Cherry" across all pages
    const injectCherryChatbot = () => {
        if (!document.getElementById('cherryChatbotRoot') && !document.querySelector('script[src*="chatbot.js"]')) {
            const isInsideHtmlDir = window.location.pathname.includes('/html/') || window.location.pathname.endsWith('.html');
            const prefix = isInsideHtmlDir ? '..' : '.';

            // Inject CSS
            if (!document.querySelector('link[href*="chatbot.css"]')) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = prefix + '/css/chatbot.css?v=14';
                document.head.appendChild(link);
            }

            // Inject JS
            const script = document.createElement('script');
            script.src = prefix + '/js/chatbot.js?v=14';
            document.body.appendChild(script);
        }
    };
    injectCherryChatbot();
});

