/**
 * ACF EDUHUB — Program Layanan Interactions & Dynamic Renderer
 * Terhubung langsung dengan Portal Admin (localStorage: acf_programs_data)
 */

const DEFAULT_PROGRAMS = [
  {
    id: 'PRG-01',
    categoryId: 'kategori-1',
    categoryNum: 1,
    categoryTitle: 'Keberlanjutan Unit Pendidikan',
    categoryDesc: 'Penguatan kelembagaan dan pendanaan mandiri untuk memastikan sekolah-sekolah di wilayah prasejahtera dapat beroperasi secara berkelanjutan dengan kualitas prima.',
    divisi: 'Sekolah Juara',
    title: 'Program Beasiswa & Keberlanjutan Sekolah Juara',
    cover: '../assets/unit-pendidikan/Sekolah Juara.jpg',
    quote: 'Mendukung operasional dan penyediaan fasilitas belajar Sekolah Juara agar akses pendidikan formal berkualitas tetap 100% bebas biaya (gratis) bagi anak-anak dhuafa dan keluarga prasejahtera berprestasi.',
    buktiKapasitas: 'Mengelola 10 cabang Sekolah Juara di berbagai wilayah Indonesia dengan layanan pendidikan 100% bebas biaya sejak ACF mengelola langsung jaringan ini pada 2023.',
    kebutuhanDukungan: 'Dana operasional, Beasiswa pendidikan, In-kind (sarana belajar)',
    metric: '10 Sekolah Juara di Indonesia',
    actionLink: 'jadi-mitra-program.html',
    actionText: 'Jadi Mitra Program',
    status: 'Terbit',
    createdAt: '2026-01-01'
  },
  {
    id: 'PRG-02',
    categoryId: 'kategori-1',
    categoryNum: 1,
    categoryTitle: 'Keberlanjutan Unit Pendidikan',
    categoryDesc: 'Penguatan kelembagaan dan pendanaan mandiri untuk memastikan sekolah-sekolah di wilayah prasejahtera dapat beroperasi secara berkelanjutan dengan kualitas prima.',
    divisi: 'Sekolah Daya Setara',
    title: 'Kesejahteraan Guru & Operasional Sekolah Daya Setara',
    cover: '../assets/unit-pendidikan/Sekolah Daya Setara (1).JPG',
    quote: 'Mendukung kesejahteraan tutor/guru dan kebutuhan operasional PKBM Sekolah Daya Setara — seluruh 150 warga belajar yang dilayani saat ini adalah penerima beasiswa penuh, menjadikan dukungan mitra krusial bagi keberlangsungan layanan yang ada.',
    buktiKapasitas: 'Melayani 150 warga belajar (100% beasiswa, tanpa siswa reguler berbayar) di beberapa titik PKBM (Lembang, Ngamprah, Pangandaran, Sukabumi, Indramayu, Jayapura).',
    kebutuhanDukungan: 'Dana sebagian, In-kind',
    metric: '150 Warga Belajar (100% Beasiswa)',
    actionLink: 'jadi-mitra-program.html',
    actionText: 'Jadi Mitra Program',
    status: 'Terbit',
    createdAt: '2026-01-02'
  },
  {
    id: 'PRG-03',
    categoryId: 'kategori-2',
    categoryNum: 2,
    categoryTitle: 'Tanggap Bencana & Pemulihan',
    categoryDesc: 'Respons cepat terintegrasi mencakup dukungan psikososial anak, pelatihan psikososial guru terdampak, hingga bantuan dasar pangan, sandang, dan hunian darurat.',
    divisi: 'Guruverse.ID & ACF Educare (lintas-divisi)',
    title: 'Layanan Pascabencana',
    cover: '../assets/layanan-program/IMG_6436.jpg',
    quote: 'Respons pascabencana yang terintegrasi — mencakup dukungan psikososial untuk anak-anak korban, pelatihan psikososial untuk guru di lokasi terdampak, serta penyaluran bantuan dasar berupa pangan, sandang, dan papan/hunian sementara.',
    buktiKapasitas: '100 guru terlatih di Aceh Tamiang; respons darurat dan sekolah darurat sedang berjalan di Flores NTT pascagempa Agustus 2026, berkolaborasi dengan Sharing Happiness.',
    kebutuhanDukungan: 'Dana penuh, In-kind (pangan, sandang, papan)',
    metric: '100 Guru Terlatih & Respons Flores NTT',
    actionLink: 'jadi-mitra-program.html',
    actionText: 'Jadi Mitra Program',
    status: 'Terbit',
    createdAt: '2026-01-03'
  },
  {
    id: 'PRG-04',
    categoryId: 'kategori-3',
    categoryNum: 3,
    categoryTitle: 'Kesejahteraan Ekosistem Sekolah',
    categoryDesc: 'Dukungan terpadu berkelanjutan bagi guru honorer, tenaga penunjang, dan keluarga prasejahtera di sekitar lingkungan sekolah sepanjang tahun.',
    divisi: 'ACF Educare (Donasi Pendidikan)',
    title: 'Kesejahteraan Ekosistem Sekolah',
    cover: '../assets/donasi/Kado Lebaran Penjaga Sekolah.jpg',
    quote: 'Dukungan berkelanjutan bagi tenaga yang menopang ekosistem sekolah — guru honorer, penjaga sekolah, dan keluarga prasejahtera di lingkungan sekolah. Ramadhan menjadi salah satu momentum kampanye, bukan satu-satunya waktu penyaluran.',
    buktiKapasitas: 'Ramadhan 2026 — 345 paket tersalur di 21 wilayah untuk guru honorer, penjaga sekolah, dan keluarga dhuafa.',
    kebutuhanDukungan: 'Dana penuh, In-kind',
    metric: '345 Paket Tersalur (21 Wilayah)',
    actionLink: 'jadi-mitra-program.html',
    actionText: 'Jadi Mitra Program',
    status: 'Terbit',
    createdAt: '2026-01-04'
  },
  {
    id: 'PRG-05',
    categoryId: 'kategori-4',
    categoryNum: 4,
    categoryTitle: 'Kemanusiaan Internasional',
    categoryDesc: 'Penyaluran bantuan kemanusiaan dan kebutuhan dasar bagi anak-anak di wilayah krisis serta konflik global.',
    divisi: 'ACF Educare (Donasi Pendidikan)',
    title: 'Bantuan Kemanusiaan Internasional',
    cover: '../assets/layanan-program/IMG_6442.jpg',
    quote: 'Penyaluran bantuan dasar bagi anak-anak di wilayah konflik, dihimpun dari keluarga besar ACF Eduhub dan donatur publik.',
    buktiKapasitas: 'Tahap 1 (1 September 2026) — makanan hangat untuk 260 anak di 2 shelter pengungsian Gaza, bekerja sama dengan Baitul Mal Muamalat.',
    kebutuhanDukungan: 'Dana penuh',
    metric: 'Makanan Hangat 260 Anak (Gaza)',
    actionLink: 'jadi-mitra-program.html',
    actionText: 'Jadi Mitra Program',
    status: 'Terbit',
    createdAt: '2026-01-05'
  },
  {
    id: 'PRG-06',
    categoryId: 'kategori-5',
    categoryNum: 5,
    categoryTitle: 'Forum & Advokasi Pendidikan',
    categoryDesc: 'Membangun ruang diskursus kebijakan, publikasi riset implementasi di lapangan, dan advokasi arah tren pendidikan nasional.',
    divisi: 'Guruverse.ID',
    title: 'Education Outlook — Forum Tahunan Pendidikan',
    cover: '../assets/layanan-program/Web Banner Education Maret 2026-03.jpg',
    quote: 'Forum hybrid tahunan yang menghadirkan pembuat kebijakan, akademisi, dan praktisi pendidikan untuk membahas arah dan tren pendidikan nasional.',
    buktiKapasitas: 'Edisi 2026 digelar hybrid di Bandung, 6 Desember 2025, dihadiri perwakilan Kemendikdasmen, DPR RI Komisi X, dan UPI, diikuti ratusan pendidik.',
    kebutuhanDukungan: 'Dana sebagian (sponsorship), In-kind (venue, media)',
    metric: 'Edisi 2026 Hybrid Bandung',
    actionLink: 'jadi-mitra-program.html',
    actionText: 'Jadi Mitra Program',
    status: 'Terbit',
    createdAt: '2026-01-06'
  },
  {
    id: 'PRG-07',
    categoryId: 'kategori-6',
    categoryNum: 6,
    categoryTitle: 'Kepemimpinan & Manajemen Sekolah',
    categoryDesc: 'Layanan konsultasi dan pendampingan manajemen sekolah, strategi SPMB/PPDB, serta studi kelayakan pendirian unit pendidikan.',
    divisi: 'Guruverse.ID',
    title: 'Konsultasi & Pendampingan Manajemen Sekolah',
    cover: '../assets/layanan-program/Workshop SPMB.jpg',
    quote: 'Layanan konsultasi fleksibel bagi sekolah atau yayasan lain — mencakup manajemen sekolah, strategi PPDB/SPMB, hingga studi kelayakan (feasibility study) pendirian atau pengembangan sekolah. Tim yang menangani menyesuaikan kebutuhan spesifik klien.',
    buktiKapasitas: 'Pernah dijalankan lewat Ceria Training Center (Bengkel Manajemen Sekolah & SPMB), didukung pengalaman langsung ACF mengelola jaringan 10 Sekolah Juara dan 7 Sekolah Daya Setara.',
    kebutuhanDukungan: 'Jasa konsultasi berbayar (revenue line ACF, di bawah Guruverse.ID)',
    metric: 'Pengalaman 10 Sekolah Juara & 7 Sekolah Daya Setara',
    actionLink: 'jadi-mitra-program.html',
    actionText: 'Jadi Mitra Program',
    status: 'Terbit',
    createdAt: '2026-01-07'
  }
];

document.addEventListener('DOMContentLoaded', () => {
  const sidebarDrawer = document.getElementById('sidebarNavDrawer');
  const sidebarOverlay = document.getElementById('sidebarNavOverlay');
  const programContainer = document.getElementById('programCategoriesContainer');
  const bannerDesc = document.getElementById('programBannerDesc');

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
  function bindAnchorLinks() {
    const inPageLinks = document.querySelectorAll('a[href^="#"]');
    inPageLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        if (targetId && targetId.length > 1 && targetId.startsWith('#')) {
          const targetEl = document.querySelector(targetId);
          if (targetEl) {
            e.preventDefault();
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
  }

  // Render Programs dynamically from localStorage
  function renderDynamicPrograms() {
    if (!programContainer) return;

    let programs = null;
    try {
      const stored = localStorage.getItem('acf_programs_data');
      if (stored) {
        programs = JSON.parse(stored);
      }
    } catch (e) {}

    // Inisialisasi awal ke localStorage jika belum ada data
    if (!programs || !Array.isArray(programs) || programs.length === 0) {
      programs = [...DEFAULT_PROGRAMS];
      try {
        localStorage.setItem('acf_programs_data', JSON.stringify(programs));
      } catch (e) {}
    }

    // Filter hanya program yang berstatus Terbit
    const published = programs.filter(p => p.status === 'Terbit');

    if (published.length === 0) {
      programContainer.innerHTML = `
        <div class="container" style="text-align: center; padding: 80px 20px; color: #64748B;">
          <p style="font-size: 1.15rem; font-weight: 600; margin-bottom: 8px;">Belum ada program layanan yang dipublikasikan saat ini.</p>
          <p style="font-size: 0.9rem;">Admin dapat mempublikasikan program melalui Portal Admin ACF Eduhub.</p>
        </div>
      `;
      return;
    }

    // Kelompokkan berdasarkan Kategori
    const categoryMap = new Map();
    published.forEach(p => {
      const catKey = p.categoryId || 'kategori-1';
      if (!categoryMap.has(catKey)) {
        categoryMap.set(catKey, {
          id: catKey,
          num: p.categoryNum || (categoryMap.size + 1),
          title: (p.categoryTitle || '').replace(/\s*\(\d+\s*Program\)/i, '').trim(),
          desc: p.categoryDesc || '',
          programs: []
        });
      }
      categoryMap.get(catKey).programs.push(p);
    });

    // Urutkan kategori berdasarkan nomor
    const sortedCategories = Array.from(categoryMap.values()).sort((a, b) => a.num - b.num);

    let html = '';
    sortedCategories.forEach(cat => {
      const programCount = cat.programs.length;
      const countSuffix = ` (${programCount} Program)`;
      const fullTitle = `${cat.title}${countSuffix}`;

      html += `
        <!-- Kategori: ${fullTitle} -->
        <section class="program-category-section" id="${cat.id}">
          <div class="container">
            <div class="category-block-header reveal visible">
              <div class="category-block-num">${cat.num}</div>
              <div>
                <h2 class="category-block-title">${fullTitle}</h2>
                <p class="category-block-desc">${cat.desc}</p>
              </div>
            </div>

            <div class="programs-subgrid">
              ${cat.programs.map((prg, idx) => `
                <!-- Program Card: ${prg.title} -->
                <div class="program-detail-card reveal visible" id="program-${prg.id || idx}">
                  <div class="program-card-img-wrap">
                    <img src="${prg.cover || '../assets/unit-pendidikan/Sekolah Juara.jpg'}" alt="${prg.title}" class="program-card-img" loading="lazy" onerror="this.onerror=null; this.src='../assets/logo-acf/LOGO_ACF-removebg-preview.png';">
                  </div>
                  <div class="program-card-content">
                    <div>
                      <div class="program-card-header-meta">
                        <span class="program-divisi-tag">Divisi: ${prg.divisi || 'ACF Eduhub'}</span>
                      </div>
                      <h4>${prg.title}</h4>
                      <div class="program-quote-box">
                        ${prg.quote || ''}
                      </div>
                      <div class="program-meta-list">
                        ${prg.buktiKapasitas ? `<div class="program-meta-row"><strong>Bukti Kapasitas:</strong> ${prg.buktiKapasitas}</div>` : ''}
                        ${prg.kebutuhanDukungan ? `<div class="program-meta-row"><strong>Kebutuhan Dukungan:</strong> ${prg.kebutuhanDukungan}</div>` : ''}
                      </div>
                      <div class="program-card-footer">
                        <div class="program-metric-item">
                          <span class="metric-bullet"></span>
                          <span>${prg.metric || 'Program Aktif ACF'}</span>
                        </div>
                        <a href="${prg.actionLink || 'jadi-mitra-program.html'}" class="btn-jadi-mitra-program">
                          ${prg.actionText || 'Jadi Mitra Program'} <span class="arrow-icon">&rarr;</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </section>
      `;
    });

    programContainer.innerHTML = html;

    // Update banner teks metrik jika ada
    if (bannerDesc) {
      bannerDesc.textContent = `Inisiatif holistik ACF Eduhub yang mencakup ${published.length} program berdampak tinggi, dikelompokkan ke dalam ${sortedCategories.length} kategori induk untuk ekosistem pendidikan yang tangguh dan merata.`;
    }

    // Bind scroll reveal observer jika ada
    const reveals = programContainer.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      }, { threshold: 0.1 });
      reveals.forEach(el => observer.observe(el));
    } else {
      reveals.forEach(el => el.classList.add('visible'));
    }

    // Re-bind in-page links
    bindAnchorLinks();
  }

  // Jalankan render program dinamis
  renderDynamicPrograms();

  // Handle deep link hash on page load if valid
  if (window.location.hash && window.location.hash.length > 1) {
    try {
      const target = document.querySelector(window.location.hash);
      if (target) {
        setTimeout(() => {
          smoothScrollTo(target);
        }, 200);
      }
    } catch (err) {}
  }
});
