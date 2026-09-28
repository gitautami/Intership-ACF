/**
 * ACF EDUHUB — Kabar (Artikel & Berita) Dynamic Loader & Reader
 * Connects directly with Admin Dashboard (localStorage: acf_articles_data & acf_custom_categories)
 */

document.addEventListener('DOMContentLoaded', () => {
  const articlesGrid = document.querySelector('.kabar-articles-grid');
  const categoriesContainer = document.getElementById('kabarCategoriesContainer');
  const searchInput = document.getElementById('kabarSearchInput');
  const articleModal = document.getElementById('kabarDetailModal');
  const btnCloseModal = document.getElementById('btnKabarModalClose');  const DEFAULT_CATEGORIES = [
    { slug: 'kabar-sekolah-daya-setara', label: 'Kabar Sekolah Daya Setara' },
    { slug: 'kabar-sekolah-juara', label: 'Kabar Sekolah Juara' },
    { slug: 'artikel', label: 'Artikel Pendidikan' },
    { slug: 'liputan', label: 'Liputan Lapangan' },
    { slug: 'vokasi', label: 'Program Vokasi' },
    { slug: 'opini', label: 'Kolaborasi & Opini' }
  ];

  // Default initial articles
  const DEFAULT_ARTICLES = [
    {
      id: 'ART-SDS07',
      title: 'Menyalakan Kembali Api Harapan: Kisah Pejuang PKBM Ceria Taklukkan ANBK 2025',
      category: 'kabar-sekolah-daya-setara',
      categoryLabel: 'Artikel, Sekolah Daya Setara',
      author: 'cerianak',
      date: 'Aug 14, 2025',
      comments: '0 comments',
      cover: 'assets/kabar-sekolahdayasetara/2.png',
      excerpt: 'Bandung – Di sudut keheningan, sering terdengar keraguan yang membisik, “Kesempatanmu sudah lewat.” Sebuah kalimat yang mampu memadamkan semangat dan mengubur mimpi. Namun, di tengah riuhnya kota Bandung...',
      content: `<p><strong>Bandung</strong> – Di sudut keheningan, sering terdengar keraguan yang membisik, <em>“Kesempatanmu sudah lewat.”</em> Sebuah kalimat yang mampu memadamkan semangat dan mengubur mimpi. Namun, di tengah riuhnya kota Bandung, ada sebuah cerita yang membuktikan sebaliknya. Sebuah kisah tentang keberanian untuk mencoba, tentang kepercayaan diri yang kembali menyala.</p>
<p>Pada tanggal 9 dan 10 Agustus 2025 yang bersejarah, udara di PKBM Bina Cipta, Ujungberung, terasa berbeda. Bukan sekadar udara biasa, melainkan udara yang dipenuhi ketegangan, harapan, dan tekad baja. Sebanyak 16 pejuang dari program Paket C PKBM Ceria Ngamprah dan Pusat melangkah masuk, bukan sebagai siswa biasa, tetapi sebagai gladiator di arena pembuktian diri: Asesmen Nasional Berbasis Komputer (ANBK).</p>
<p>Bagi mereka, layar komputer di hadapan bukanlah sekadar menampilkan soal-soal literasi dan numerasi. Layar itu adalah cermin dari perjuangan mereka. Setiap kata yang mereka baca adalah gema dari semangat belajar yang pernah terputus. Setiap angka yang mereka hitung adalah simbol dari langkah-langkah yang kembali mereka ayunkan menuju masa depan. Ini bukanlah sekadar ujian. Ini adalah deklarasi. Deklarasi bahwa belajar tidak mengenal usia, dan semangat tidak memiliki batas waktu.</p>
<p style="text-align: center; margin: 24px 0;"><img src="assets/kabar-sekolahdayasetara/1.png" alt="Peserta ANBK PKBM Ceria 2025" style="max-width: 100%; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);"></p>
<p>Perjalanan ini adalah tentang menantang takdir. Tentang membuktikan kepada diri sendiri dan dunia bahwa menyerah hanyalah sebuah jeda, bukan akhir dari segalanya. Di wajah mereka, tergambar fokus dan kesungguhan—sebuah potret keberanian yang menggetarkan. Mereka membuktikan bahwa esensi pendidikan bukanlah tentang seberapa cepat kita berlari, melainkan tentang keberanian untuk terus melangkah, bahkan setelah terjatuh.</p>
<p>Keikutsertaan 16 warga belajar ini dalam ANBK telah menjadi lebih dari sekadar pemenuhan syarat akademis. Ia telah menjadi api yang menyulut kembali harapan, tidak hanya bagi mereka, tetapi bagi kita semua. Mereka adalah bukti hidup bahwa setiap langkah, sekecil apa pun, adalah bekal berharga untuk masa depan yang lebih cerah.</p>
<p>Kisah mereka adalah jantung dari PKBM Ceria. Sebuah semangat belajar tanpa batas, di mana setiap individu diberi ruang untuk tumbuh, berjuang, dan pada akhirnya, menang. Perjuangan mereka hari ini adalah mercusuar bagi mereka yang mungkin masih ragu di luar sana.</p>
<p style="color: #64748B; font-weight: 700; margin-top: 24px; font-style: italic;">Karena di PKBM Ceria, kami tidak hanya membuka buku, kami membuka kembali kesempatan dan menyalakan kembali mimpi.</p>`,
      status: 'Terbit'
    },
    {
      id: 'ART-SDS06',
      title: 'Sebuah Langkah Kecil Hari Ini, Lompatan Besar di Masa Depan: Selamat kepada Lulusan Sekolah Daya Setara 2025/2026',
      category: 'kabar-sekolah-daya-setara',
      categoryLabel: 'Artikel, Sekolah Daya Setara',
      author: 'cerianak',
      date: 'Aug 7, 2026',
      comments: '0 comments',
      cover: 'assets/kabar-sekolahdayasetara/25.png',
      excerpt: 'Sebuah langkah kecil hari ini akan menjadi lompatan besar di masa depan. Kalimat itu terasa pas untuk menggambarkan momen yang dirayakan Sekolah Daya Setara pada 19 Juli 2026 di PKBM Daya Setara Lembang: pelepasan peserta didik Tahun Ajaran 2025/2026 yang telah berhasil menyelesaikan perjalanan belajarnya melalui jalur pendidikan kesetaraan Paket B dan Paket C...',
      content: `<p>Sebuah langkah kecil hari ini akan menjadi lompatan besar di masa depan. Kalimat itu terasa pas untuk menggambarkan momen yang dirayakan Sekolah Daya Setara pada 19 Juli 2026 di PKBM Daya Setara Lembang: pelepasan peserta didik Tahun Ajaran 2025/2026 yang telah berhasil menyelesaikan perjalanan belajarnya melalui jalur pendidikan kesetaraan Paket B dan Paket C.</p>
<p>Bagi Sekolah Daya Setara, hari kelulusan bukan sekadar seremoni akhir tahun ajaran. Ia adalah penanda bahwa pendidikan yang setara dan terbuka bagi siapa saja, tanpa memandang latar belakang atau titik awal masing-masing, benar-benar bisa membawa seseorang sampai ke garis akhir yang selama ini mungkin terasa jauh.</p>
<p style="text-align: center; margin: 24px 0;"><img src="assets/kabar-sekolahdayasetara/26.png" alt="Pelepasan Lulusan Sekolah Daya Setara" style="max-width: 100%; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);"></p>
<h3 style="font-size: 1.2rem; font-weight: 700; color: #1E293B; margin: 28px 0 12px 0;">Bukan Akhir, Melainkan Awal yang Baru</h3>
<p>Hari kelulusan sering dimaknai sebagai penutup sebuah babak. Namun bagi para lulusan Sekolah Daya Setara, hari ini lebih tepat dilihat sebagai titik awal untuk melangkah lebih jauh — membawa serta ilmu, pengalaman, dan semangat yang telah dibangun selama masa belajar, untuk kemudian memberi manfaat bagi keluarga, masyarakat, dan bangsa.</p>
<p>Perjalanan menuju hari ini tentu tidak selalu mudah. Pendidikan kesetaraan sering ditempuh oleh mereka yang harus membagi waktu antara belajar dan tanggung jawab lain dalam hidupnya. Karena itu, setiap kelulusan di jalur ini adalah bukti nyata bahwa kesempatan untuk meraih masa depan yang lebih baik terbuka bagi siapa saja yang mau terus berjuang dan belajar.</p>
<h3 style="font-size: 1.2rem; font-weight: 700; color: #1E293B; margin: 28px 0 12px 0;">Selamat kepada Para Lulusan</h3>
<p>Sekolah Daya Setara dengan bangga mengucapkan selamat kepada tujuh peserta didik yang telah menyelesaikan pendidikannya pada Tahun Ajaran 2025/2026:</p>
<ul style="line-height: 1.8; margin-bottom: 18px;">
  <li><strong>Nizar Maulana Yusuf</strong> (Paket C)</li>
  <li><strong>Hamdan Hadiatna</strong> (Paket C)</li>
  <li><strong>Fitria Agustina Putri Hermansyah</strong> (Paket B)</li>
  <li><strong>Muhamad Arya Dira Putera Suteja</strong> (Paket C)</li>
  <li><strong>Muhammad Arafah Fadillah</strong> (Paket C)</li>
  <li><strong>April Liani</strong> (Paket C)</li>
  <li><strong>Muhamad Akbar</strong> (Paket C)</li>
</ul>
<p>Kami bangga menjadi bagian dari perjalanan kalian. Semoga ilmu yang telah diperoleh menjadi bekal untuk meraih cita-cita, membuka lebih banyak peluang, serta memberikan manfaat bagi keluarga, masyarakat, dan lingkungan sekitar.</p>
<h3 style="font-size: 1.2rem; font-weight: 700; color: #1E293B; margin: 28px 0 12px 0;">Teruslah Melangkah</h3>
<p>Kelulusan ini menjadi pengingat bahwa masa depan yang cerah selalu dimulai dari keberanian untuk terus belajar, kapan pun dan dari titik mana pun seseorang memulai. Teruslah bermimpi, belajar, dan berkarya — karena setiap pencapaian, sekecil apa pun awalnya, adalah bukti bahwa kesempatan itu nyata bagi siapa saja yang mau berjuang.</p>
<p>Selamat dan sukses untuk seluruh lulusan Sekolah Daya Setara Tahun Ajaran 2025/2026.</p>
<p style="color: #64748B; font-weight: 700; margin-top: 28px; font-style: italic;">Sekolah Daya Setara — Setara dalam Langkah, Berdaya dalam Karya.</p>`,
      status: 'Terbit'
    },
    {
      id: 'ART-SDS05',
      title: 'Tujuh Kisah, Satu Semangat yang Sama: Perjalanan Lulusan Sekolah Daya Setara 2025/2026',
      category: 'kabar-sekolah-daya-setara',
      categoryLabel: 'Artikel, Sekolah Daya Setara',
      author: 'cerianak',
      date: 'Aug 7, 2026',
      comments: '0 comments',
      cover: 'assets/kabar-sekolahdayasetara/27 (2).png',
      excerpt: 'Sebuah langkah kecil hari ini akan menjadi lompatan besar di masa depan. Kalimat itu terasa pas untuk menggambarkan momen yang dirayakan Sekolah Daya Setara pada 19 Juli 2026 di PKBM Daya Setara Lembang: pelepasan peserta didik Tahun Ajaran 2025/2026 yang telah berhasil menyelesaikan perjalanan belajarnya melalui jalur pendidikan kesetaraan Paket B dan Paket C...',
      content: `<p>Sebuah langkah kecil hari ini akan menjadi lompatan besar di masa depan. Kalimat itu terasa pas untuk menggambarkan momen yang dirayakan Sekolah Daya Setara pada 19 Juli 2026 di PKBM Daya Setara Lembang: pelepasan peserta didik Tahun Ajaran 2025/2026 yang telah berhasil menyelesaikan perjalanan belajarnya melalui jalur pendidikan kesetaraan Paket B dan Paket C.</p>
<p>Di balik setiap ijazah yang diraih, ada jalan berliku yang berbeda-beda. Beberapa harus berhenti sekolah karena keadaan ekonomi, beberapa lainnya memilih bekerja lebih dulu sebelum kembali ke bangku belajar, dan tak sedikit yang sempat kehilangan arah sebelum akhirnya menemukan kembali alasan untuk terus belajar. Berikut adalah tujuh kisah dari mereka yang telah membuktikan bahwa pendidikan tetap bisa diraih, kapan pun seseorang siap untuk kembali.</p>
<p><strong>Nizar Maulana Yusuf — Paket C, PKBM Rumah Quran</strong><br>Saat masih duduk di bangku SMA, Nizar harus berhenti sekolah karena kondisi ekonomi keluarganya mengharuskan ia turut mencari penghasilan. Ketika keadaan mulai memungkinkan, ia memutuskan melanjutkan pendidikan lewat Paket C agar memiliki bekal yang lebih kuat untuk meraih peluang kerja maupun studi lanjutan.</p>
<p><strong>Hamdan Hadiatna — Paket C, PKBM Lembang</strong><br>Hamdan sempat menghentikan pendidikannya karena memilih bekerja demi membantu memenuhi kebutuhan keluarga. Kini, sambil bekerja sebagai petugas kebersihan di sebuah sekolah, ia membuktikan bahwa kesibukan bekerja bukan penghalang untuk tetap menyelesaikan pendidikan.</p>
<p><strong>Fitria Agustina Putri Hermansyah — Paket B, PKBM Ngamprah</strong><br>Fitria sempat berhenti sekolah setelah keluarganya berpindah tempat tinggal, yang membuatnya kesulitan melanjutkan pendidikan formal. Melalui PKBM, ia mendapat kembali kesempatan untuk belajar hingga akhirnya menuntaskan Paket B.</p>
<p><strong>Muhamad Arya Dira Putera Suteja — Paket C, PKBM Ngamprah</strong><br>Arya harus menunda pendidikannya karena memilih bekerja sejak usia muda. Sebagai pegawai laundry, ia membagi waktunya antara pekerjaan dan belajar, hingga akhirnya berhasil menyelesaikan Paket C.</p>
<p><strong>Muhammad Arafah Fadillah — Paket C, PKBM Lembang</strong><br>Arafah pernah kehilangan semangat belajar setelah mengalami sejumlah perubahan dalam kondisi keluarganya. Dukungan orang-orang di sekitarnya membantunya bangkit kembali dan melanjutkan pendidikan lewat PKBM.</p>
<p><strong>April Liani — Paket C, PKBM Sukabumi</strong><br>April sempat berhenti sekolah karena harus mendampingi keluarganya dalam situasi yang sulit. Begitu ada kesempatan, ia memilih kembali belajar agar dapat membuka lebih banyak pilihan untuk masa depannya.</p>
<p><strong>Muhamad Akbar — Paket C, PKBM Lembang</strong><br>Akbar pernah menganggap sekolah bukan prioritas karena lebih fokus mencari pengalaman kerja. Seiring waktu, ia menyadari bahwa pendidikan tetap penting sebagai bekal pengembangan diri, sehingga memilih menuntaskan Paket C melalui PKBM.</p>
<h3 style="font-size: 1.2rem; font-weight: 700; color: #1E293B; margin: 28px 0 12px 0;">Satu Titik Awal yang Berbeda, Satu Garis Akhir yang Sama</h3>
<p>Ketujuh kisah ini menunjukkan bahwa jalan menuju pendidikan tidak selalu lurus. Ada yang harus berhenti karena ekonomi, ada yang menunda karena bekerja, dan ada yang sempat kehilangan arah sebelum menemukannya kembali. Namun semuanya bertemu di titik yang sama: keberanian untuk kembali belajar, dari mana pun mereka memulai.</p>
<p>Sekolah Daya Setara bangga menjadi bagian dari perjalanan ini. Semoga ilmu yang telah diperoleh menjadi bekal untuk meraih cita-cita, membuka lebih banyak peluang, serta memberi manfaat bagi keluarga, masyarakat, dan lingkungan sekitar.</p>
<p>Selamat dan sukses untuk seluruh lulusan Sekolah Daya Setara Tahun Ajaran 2025/2026. Teruslah melangkah dengan penuh keyakinan, karena masa depan yang cerah selalu dimulai dari keberanian untuk terus belajar.</p>
<p style="color: #64748B; font-weight: 700; margin-top: 28px; font-style: italic;">Sekolah Daya Setara — Setara dalam Langkah, Berdaya dalam Karya.</p>`,
      status: 'Terbit'
    },
    {
      id: 'ART-SDS04',
      title: 'PKBM Ceria di Lembang Resmi di-Launching',
      category: 'kabar-sekolah-daya-setara',
      categoryLabel: 'Artikel, Sekolah Daya Setara',
      author: 'acforid',
      date: 'Sep 12, 2024',
      comments: '0 comments',
      cover: 'assets/kabar-sekolahdayasetara/Foto-Artikel-September-03.jpg',
      excerpt: 'Bandung Barat, 7 September 2024 – Rumah Zakat dan ACF (Anak Ceria Foundation) berkolaborasi dengan Pemerintah Kabupaten Bandung Barat meresmikan Pusat Kegiatan Belajar Masyarakat (PKBM)...',
      content: `<p><strong>Bandung Barat, 7 September 2024</strong> – <a href="https://www.rumahzakat.org/" target="_blank" rel="noopener noreferrer" style="color: #0284c7; text-decoration: underline;">Rumah Zakat</a> dan <a href="https://acf.or.id/" target="_blank" rel="noopener noreferrer" style="color: #0284c7; text-decoration: underline;">ACF (Anak Ceria Foundation)</a> berkolaborasi dengan Pemerintah Kabupaten Bandung Barat meresmikan Pusat Kegiatan Belajar Masyarakat (PKBM) di Desa Mekarwangi, Lembang. Acara ini dihadiri oleh perwakilan Dinas Pendidikan Kabupaten Bandung Barat, Ibu Neneng Lisnawati, M.Pd.</p>
<p>PKBM ini menyediakan program pendidikan kesetaraan gratis bagi masyarakat kurang mampu, termasuk Paket A, B, dan C, yang ditujukan untuk mereka yang tidak bisa mengakses pendidikan formal, seperti pekerja, ibu rumah tangga, dan anak putus sekolah.</p>
<p style="text-align: center; margin: 24px 0;"><img src="assets/kabar-sekolahdayasetara/Foto-Artikel-September-04.jpg" alt="Peresmian PKBM Ceria di Lembang" style="max-width: 100%; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);"></p>
<p>Dalam sambutannya, Ibu Neneng Lisnawati, M.Pd., Penilik Dinas Pendidikan Kabupaten Bandung Barat, menyampaikan, <em>“Kami sangat mendukung upaya Rumah Zakat dan ACF dalam menyediakan akses pendidikan bagi masyarakat. PKBM ini merupakan wujud nyata bahwa setiap warga memiliki hak yang sama untuk belajar dan meningkatkan kualitas hidupnya.”</em></p>
<p style="text-align: center; margin: 24px 0;"><img src="assets/kabar-sekolahdayasetara/Foto-Artikel-September-06.jpg" alt="Sambutan dan Penyerahan Bingkisan PKBM Ceria Lembang" style="max-width: 100%; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);"></p>
<p>Ibu Murni Alit Baginda, Direktur Program Rumah Zakat, menambahkan, <em>“Kami berharap PKBM ini dapat menjadi jembatan bagi masyarakat yang selama ini sulit mengakses pendidikan formal, sehingga mereka dapat meningkatkan keterampilan dan pengetahuan yang relevan.”</em></p>
<p style="text-align: center; margin: 24px 0;"><img src="assets/kabar-sekolahdayasetara/Foto-Artikel-September-05.jpg" alt="Suasana Kegiatan PKBM Ceria Lembang" style="max-width: 100%; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);"></p>
<p style="margin: 24px 0; font-size: 1.15rem; font-weight: 700; line-height: 1.5;"><span style="color: #64748B;">Baca Juga : </span><a href="javascript:void(0);" onclick="window.openArticleModalById && window.openArticleModalById('ART-SDS01', 'Semangat Belajar di Usia Senja')" style="color: #DC2626; text-decoration: underline; cursor: pointer;">Semangat Belajar di Usia Senja</a></p>
<p>Pendidikan kesetaraan dinilai penting dalam meningkatkan kualitas sumber daya manusia dan mendukung peningkatan Indeks Pembangunan Manusia (IPM). Program ini juga sejalan dengan komitmen Indonesia terhadap SDGs, khususnya dalam menjamin pendidikan inklusif dan merata bagi semua kalangan.</p>
<p style="text-align: center; margin: 24px 0;"><img src="assets/kabar-sekolahdayasetara/Foto-Artikel-September-07.jpg" alt="Antusiasme Warga dan Peserta PKBM Ceria Lembang" style="max-width: 100%; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);"></p>
<p>Acara ini disambut dengan antusias oleh warga setempat, dengan penampilan lagu-lagu dari peserta PKBM. Tokoh masyarakat berharap program ini dapat terus berlanjut dan bermanfaat bagi warga Desa Mekarwangi.</p>`,
      status: 'Terbit'
    },
    {
      id: 'ART-SDS03',
      title: 'Neng Komara, Anak Petani yang Raih Medali Emas di Festival Islami Nasional 2025',
      category: 'kabar-sekolah-daya-setara',
      categoryLabel: 'Kabar Sekolah Daya Setara',
      author: 'cerianak',
      date: 'May 23, 2025',
      comments: '0 comments',
      cover: 'assets/kabar-sekolahdayasetara/1.jpg',
      excerpt: 'Lembang, [14 Maret 2025] – Neng Komara, seorang anak petani kecil dari Desa Mekarwangi, Lembang, telah meraih medali emas di Festival Islami Nasional 2025 kategori bahasa Indonesia...',
      content: `<p><strong>Lembang, [14 Maret 2025]</strong> – Neng Komara, seorang anak petani kecil dari Desa Mekarwangi, Lembang, telah meraih medali emas di Festival Islami Nasional 2025 kategori bahasa Indonesia. Prestasi ini membuktikan bahwa Neng Komara dapat bersaing di tingkat nasional dan menjadi inspirasi bagi banyak orang.</p>
<p>Neng Komara, yang lahir pada tanggal 22 Mei 2004, merupakan anak dari pasangan Aep Acun dan Ai Komala. Meskipun putus sekolah di kelas 10 SMA Mekarwangi, ia tidak menyerah dan melanjutkan pendidikannya di PKBM Ceria melalui program kesetaraan.</p>
<p>Sambil belajar, Neng Komara juga bekerja sebagai packaging arumanis di rumah untuk memenuhi kebutuhan sehari-hari. Semangat dan dedikasi tinggi yang dimilikinya telah membawanya meraih prestasi yang gemilang.</p>
<blockquote>“Kami sangat bangga dengan prestasi Neng Komara. Ia telah membuktikan bahwa dengan kerja keras dan dedikasi, seseorang dapat meraih kesuksesan meskipun berasal dari latar belakang yang sederhana,”<br><span style="font-size: 0.9rem; font-style: normal; font-weight: 600; display: inline-block; margin-top: 6px;">kata Pak Aep Saepudin Kepala PKBM Ceria Lembang</span></blockquote>
<p>Prestasi Neng Komara diharapkan dapat menjadi inspirasi bagi banyak orang, terutama bagi anak-anak muda yang berasal dari latar belakang yang sederhana.</p>`,
      status: 'Terbit'
    },
    {
      id: 'ART-SDS02',
      title: 'PKBM Ceria Jayapura Diresmikan, Hadirkan Akses Pendidikan Non-Formal bagi Warga Papua',
      category: 'kabar-sekolah-daya-setara',
      categoryLabel: 'Kabar Sekolah Daya Setara',
      author: 'cerianak',
      date: 'Jun 17, 2025',
      comments: '0 comments',
      cover: 'assets/kabar-sekolahdayasetara/photo_1_2025-06-17_16-13-06.jpg',
      excerpt: 'Jayapura, 3 Mei 2025 – Upaya memperluas akses pendidikan non-formal di Papua kini mendapat penguatan melalui peresmian PKBM Ceria Jayapura pada Sabtu, 3 Mei 2025...',
      content: `<p><strong>Jayapura, 3 Mei 2025</strong> – Upaya memperluas akses pendidikan non-formal di Papua kini mendapat penguatan melalui peresmian PKBM Ceria Jayapura pada Sabtu, 3 Mei 2025. Acara peresmian ini dilakukan oleh Bapak Ivan Supangat, Direktur ACF EduHub, didampingi oleh Bapak Damino, Kepala Sekolah SD Juara Jayapura.</p>
<p>PKBM Ceria Jayapura merupakan program pendidikan kesetaraan yang diinisiasi sebagai ruang belajar alternatif bagi masyarakat yang belum sempat menyelesaikan pendidikan formal. Kegiatan ini disupport penuh oleh Rumah Zakat, sebagai bagian dari komitmennya dalam mendukung pendidikan yang inklusif dan berkelanjutan di Indonesia, khususnya di wilayah timur.</p>
<p style="text-align: center; margin: 24px 0;"><img src="assets/kabar-sekolahdayasetara/photo_2_2025-06-17_16-13-06-1024x640.jpg" alt="Peresmian PKBM Ceria Jayapura" style="max-width: 100%; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);"></p>
<p>Acara peresmian dihadiri oleh berbagai tokoh dan mitra strategis yang memiliki kepedulian besar terhadap pendidikan di Papua. Hadir dalam kegiatan tersebut Ketua BGP Papua Ibu Fatkhurohmah, Ketua Prodi PGMI IAIN Fattahul Muluk Papua Bapak Didik Efendi, Pengawas Gugus IX Ibu Siti Sunah Zami, serta Branch Manager Rumah Zakat Jayapura, Bapak Yusup Siranda. Berbagai pihak yang turut menghadiri acara ini juga mendukung penuh kegiatan PKBM ini sebagai bagian dari ekosistem pendidikan yang lebih luas, yang mampu merangkul semua kalangan, termasuk anak putus sekolah dan masyarakat dewasa yang ingin melanjutkan pendidikan.</p>
<p style="margin: 24px 0; font-size: 1.15rem; font-weight: 700; line-height: 1.5;"><span style="color: #64748B;">Baca Juga : </span><a href="javascript:void(0);" onclick="window.openArticleModalById && window.openArticleModalById('ART-SDS03', 'Neng Komara')" style="color: #DC2626; text-decoration: underline; cursor: pointer;">Neng Komara, Anak Petani yang Raih Medali Emas di Festival Islami Nasional 2025</a></p>
<p>PKBM Ceria Jayapura akan menyelenggarakan program pendidikan kesetaraan Paket A, B, dan C, serta pelatihan keterampilan berbasis kebutuhan lokal. Kehadirannya diharapkan menjadi solusi konkret dalam membangun masyarakat pembelajar di tanah Papua.</p>`,
      status: 'Terbit'
    },
    {
      id: 'ART-SDS01',
      title: 'Semangat Belajar di Usia Senja',
      category: 'kabar-sekolah-daya-setara',
      categoryLabel: 'Kabar Sekolah Daya Setara',
      author: 'acforid',
      date: 'Aug 26, 2024',
      comments: '0 comments',
      cover: 'assets/kabar-sekolahdayasetara/Foto-Artikel-Agustus-09.jpg',
      excerpt: 'Kisah Pak Uun Sutisna, Buruh Tani yang Tekun Mengikuti Pelatihan Komputer di PKBM Ceria Bandung Barat. Oleh : Arif Rahman S. A. Lembang, 10 Agustus 2024...',
      content: `<h3 style="font-size: 1.25rem; font-weight: 700; color: #1E293B; margin-bottom: 12px; line-height: 1.4;">Kisah Pak Uun Sutisna, Buruh Tani yang Tekun Mengikuti Pelatihan Komputer di PKBM Ceria Bandung Barat</h3>
<p style="font-weight: 600; color: #475569; margin-bottom: 16px;">Oleh : Arif Rahman S. A.</p>
<p><strong>Lembang, 10 Agustus 2024</strong> — Sabtu pagi itu, di tengah hawa sejuk Lembang, ada pemandangan yang menginspirasi di PKBM Ceria Bandung Barat. Bukan hanya tentang pelatihan komputer sebagai bagian dari Mata Pelajaran Prakarya yang diadakan hari itu, tetapi juga tentang seorang siswa yang menunjukkan semangat belajar luar biasa—Pak Uun Sutisna.</p>
<p>Pak Uun, yang sehari-harinya bekerja sebagai buruh tani di salah satu pedesaan sekitar PKBM, telah menjadi inspirasi bagi banyak orang. Meski usianya tidak lagi muda, dan meski pekerjaan sehari-harinya cukup melelahkan, Pak Uun tak pernah absen untuk mengikuti kegiatan belajar-mengajar di PKBM setiap Sabtu dan Ahad.</p>
<p>Dipandu oleh Pak Saepuddin, yang juga menjadi PIC PKBM Ceria Ngamprah, pelatihan komputer ini bertujuan untuk melatih kemampuan siswa di bidang Teknologi Informasi dan Komunikasi (TIK). Bagi Pak Uun, pelatihan ini adalah kesempatan untuk belajar hal baru dan menambah keterampilan yang mungkin tak pernah ia bayangkan bisa dikuasainya di masa lalu.</p>
<p>Ketika tangan-tangan mudanya begitu lincah mempelajari perangkat komputer, Pak Uun dengan penuh kesabaran dan tekad mengikuti setiap langkah yang diajarkan. Tak ada raut lelah di wajahnya, hanya ada semangat yang seolah tak pernah padam. Kehadirannya menjadi bukti bahwa usia dan latar belakang bukanlah penghalang untuk terus menuntut ilmu.</p>
<p>Pelatihan yang diadakan di PKBM Ceria ini bukan sekadar untuk melengkapi kurikulum, tetapi juga menjadi sarana bagi semua siswa, tanpa memandang usia dan profesi, untuk terus berkembang dan beradaptasi dengan kemajuan teknologi. “Semangat Pak Uun adalah teladan bagi kami semua,” ujar Pak Saepuddin. “Beliau menunjukkan bahwa belajar adalah hak dan kesempatan bagi semua orang, dan kita semua harus menghargai setiap momen yang ada untuk terus maju.”</p>
<p>Kisah Pak Uun Sutisna bukan hanya sekadar cerita tentang seorang buruh tani yang belajar komputer, tetapi juga tentang semangat yang tidak pernah padam, tentang keinginan untuk terus berkembang, dan tentang pentingnya pendidikan yang inklusif bagi semua lapisan masyarakat.</p>
<p style="color: #64748B; font-weight: 600; margin-top: 24px;">#AnakCeriaFoundation #PKBMCeria #PKBM #PusatKegiatanBelajarMasyarakat</p>`,
      status: 'Terbit'
    },
    {
      id: 'ART-SJ08',
      title: 'Penyuluhan Pencegahan dan Pemberantasan Penyalahgunaan Narkoba: Membangun Generasi Cerdas, Sehat, dan Berprestasi',
      category: 'kabar-sekolah-juara',
      categoryLabel: 'Artikel, Artikel Pendidikan, Berita SD Juara Tangerang, Berita Sekolah',
      author: 'cerianak',
      date: 'Jul 3, 2026',
      comments: '0 comments',
      cover: 'assets/kabar-sekolahjuara/15.png',
      excerpt: 'Tangerang – SD Juara Al Hakim menyelenggarakan kegiatan Penyuluhan Pencegahan dan Pemberantasan Penyalahgunaan Narkoba (P4GN) yang menghadirkan narasumber dari Satresnarkoba Polres Metro Tangerang Kota...',
      content: `<p><strong>Tangerang</strong> – SD Juara Al Hakim menyelenggarakan kegiatan Penyuluhan Pencegahan dan Pemberantasan Penyalahgunaan Narkoba (P4GN) yang menghadirkan narasumber dari Satresnarkoba Polres Metro Tangerang Kota, AKP Philipus Sudarmanto, S.H., M.H., selaku Kanit 3 Satresnarkoba. (Kamis, 10 Juni 2026).</p>
<p>Kegiatan ini bertujuan memberikan edukasi kepada peserta didik mengenai bahaya penyalahgunaan narkotika, dampaknya terhadap kesehatan, serta pentingnya membangun kesadaran sejak dini untuk menjauhi segala bentuk penyalahgunaan zat adiktif.</p>
<p style="text-align: center; margin: 24px 0;"><img src="assets/kabar-sekolahjuara/16.png" alt="Penyuluhan Bahaya Narkoba oleh AKP Philipus Sudarmanto" style="max-width: 100%; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);"></p>
<p>Dalam pemaparannya, AKP Philipus Sudarmanto menjelaskan berbagai jenis narkoba yang kerap beredar di masyarakat, di antaranya ganja, sabu-sabu, ekstasi, dan heroin. Beliau juga menerangkan karakteristik masing-masing jenis narkoba beserta cara penyalahgunaannya yang dapat menimbulkan kerusakan fisik, mental, hingga mengancam masa depan penggunanya.</p>
<p>Bukan hanya itu, beliau juga menjelaskan gejala ketergantungan narkoba, seperti tubuh yang terasa nyeri, otot menjadi kaku, hingga sakit kepala yang sangat hebat. Kondisi tersebut menunjukkan betapa besar dampak negatif narkoba terhadap kesehatan dan kualitas hidup seseorang.</p>
<p>Lebih dalam dari itu, narasumber menekankan pentingnya menghindari berbagai perilaku yang sering menjadi pintu masuk menuju penyalahgunaan narkoba dan tindakan kriminal, seperti merokok, penggunaan vape, mengonsumsi minuman keras, melakukan bullying, gemar berkelahi yang berpotensi mengarah pada tawuran, serta perilaku pelecehan seksual. Peserta didik juga diingatkan untuk tidak membiasakan begadang karena dapat menurunkan kesehatan fisik maupun konsentrasi belajar.</p>
<p style="text-align: center; margin: 24px 0;"><img src="assets/kabar-sekolahjuara/17.png" alt="Gerakan Cap Tangan Say No to Drugs SD Juara Al Hakim" style="max-width: 100%; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);"></p>
<p>Di akhir penyuluhan, AKP Philipus Sudarmanto berpesan untuk setiap murid menjaga pergaulan, mengisi waktu dengan kegiatan yang positif, serta menjadikan belajar sebagai tugas dan tanggung jawab utama untuk mencapai kesuksesan di masa depan.</p>
<p>Kegiatan diakhiri dengan tanya jawab untuk mengikat pemahaman murid. Sebagai bentuk komitmen bersama dalam mewujudkan lingkungan sekolah yang aman dan bebas dari penyalahgunaan narkoba, seluruh peserta didik mengikuti Gerakan Cap Tangan “Say No to Drugs”. Dipandu oleh MC, setiap peserta didik mencelupkan telapak tangannya ke dalam pewarna yang telah disediakan, kemudian menempelkan cap tangan pada selembar kain putih. Kegiatan ini menjadi simbol tekad dan komitmen seluruh warga sekolah untuk mengatakan “Tidak pada Narkoba” serta mendukung terwujudnya SD Juara Al Hakim sebagai Sekolah Bebas Narkoba.</p>
<p style="color: #64748B; font-weight: 600; margin-top: 24px;">Kontributor: Dian Islamiati Harahap</p>`,
      status: 'Terbit'
    },
    {
      id: 'ART-SJ07',
      title: 'Bukan Sekadar Tulisan: Menggali Kekuatan Buku Esai sebagai Media Refleksi',
      category: 'kabar-sekolah-juara',
      categoryLabel: 'Artikel, Artikel Pendidikan, Berita SD Juara Tangerang, Berita Sekolah',
      author: 'cerianak',
      date: 'Jun 10, 2026',
      comments: '0 comments',
      cover: 'assets/kabar-sekolahjuara/11.png',
      excerpt: 'Oleh: Aditya Jessika Susanti Said, S.Pd., Gr. Tangerang, Jumat 27 Maret 2026 Hari Guru Nasional selalu menjadi momen yang sarat makna bagi dunia pendidikan di Indonesia...',
      content: `<p><strong>Oleh: Aditya Jessika Susanti Said, S.Pd., Gr.</strong></p>
<p><strong>Tangerang, Jumat 27 Maret 2026</strong> — Hari Guru Nasional selalu menjadi momen yang sarat makna bagi dunia pendidikan di Indonesia. Di tengah berbagai perayaan dan ucapan terima kasih yang mengalir, seorang guru bernama Ibu Susan memilih cara yang berbeda untuk merayakannya melalui tulisan. Ia menuangkan pengalaman, kegelisahan, sekaligus harapannya dalam sebuah buku esai yang menggugah.</p>
<p>Buku tersebut lahir dari perjalanan panjangnya sebagai pendidik. Dalam setiap lembarannya, Ibu Susan tidak hanya menuliskan kisah-kisah inspiratif, tetapi juga keluh kesah yang selama ini sering terpendam. Ia bercerita tentang tantangan yang dihadapi guru di era modern, mulai dari tuntutan administratif yang tinggi hingga perubahan karakter peserta didik yang semakin kompleks.</p>
<p>Namun di balik semua itu, Ibu Susan tetap menegaskan satu hal penting: guru adalah pilar utama pendidikan. Tanpa peran guru yang kuat, proses pembentukan generasi masa depan tidak akan berjalan dengan optimal. Melalui esainya, ia ingin mengingatkan bahwa profesi guru bukan sekadar pekerjaan, melainkan panggilan jiwa yang membutuhkan dedikasi, kesabaran, dan ketulusan.</p>
<p style="text-align: center; margin: 24px 0;"><img src="assets/kabar-sekolahjuara/10.png" alt="Buku Esai Refleksi Guru - Mencatat Indonesia" style="max-width: 100%; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);"></p>
<p>Momentum Hari Guru Nasional, menurutnya, seharusnya tidak dimaknai secara dangkal. Ia menyoroti bagaimana peringatan ini sering kali hanya berhenti pada seremoni, seperti upacara dan pemberian ucapan terima kasih di media sosial. Padahal, ada makna yang jauh lebih dalam yang perlu direnungkan bersama.</p>
<p>Dalam salah satu bagian bukunya, Ibu Susan menuliskan kutipan yang menjadi inti dari pesannya:</p>
<blockquote>“Peringatan hari guru seharusnya tidak berhenti pada seremonial dan ucapan terima kasih belaka, melainkan menjadi momentum refleksi.”</blockquote>
<p>Kutipan tersebut menjadi pengingat bahwa Hari Guru adalah waktu yang tepat untuk mengevaluasi kondisi pendidikan secara menyeluruh. Bukan hanya bagi guru, tetapi juga bagi pemerintah, orang tua, dan masyarakat luas. Refleksi ini penting untuk melihat sejauh mana dukungan yang telah diberikan kepada guru, serta apa saja yang masih perlu diperbaiki.</p>
<p>Melalui bukunya, Ibu Susan berharap masyarakat dapat lebih menghargai peran guru, tidak hanya dalam kata-kata, tetapi juga dalam tindakan nyata. Ia juga ingin para guru lain merasa bahwa mereka tidak sendiri dalam menghadapi berbagai tantangan.</p>
<p>Pada akhirnya, karya Ibu Susan bukan sekadar kumpulan esai, melainkan suara hati seorang pendidik yang tulus. Di momen Hari Guru Nasional, tulisannya menjadi pengingat bahwa perubahan besar dalam pendidikan dimulai dari kesadaran kecil untuk peduli dan menghargai guru sebagai pilar bangsa.</p>`,
      status: 'Terbit'
    },
    {
      id: 'ART-SJ06',
      title: 'Haflah Tahfidz Qur’an SD Persa Juara Medan',
      category: 'kabar-sekolah-juara',
      categoryLabel: 'Artikel, Berita SD Juara Medan, Berita Sekolah',
      author: 'cerianak',
      date: 'Jul 3, 2026',
      comments: '0 comments',
      cover: 'assets/kabar-sekolahjuara/18.png',
      excerpt: 'Senin, 15 Juni 2026 sebanyak 61 orang siswa siswi SD Persa Juara Medan diwisuda Quran pada acara Haflah Tahfidz Quran di gedung BGGTK Sumut...',
      content: `<p>Senin, 15 Juni 2026 sebanyak 61 orang siswa siswi SD Persa Juara Medan diwisuda Quran pada acara Haflah Tahfidz Quran di gedung BGGTK Sumut.</p>
<p>Acara ini di buka dengan kata sambutan oleh Ibu Sri Budiarti S.S sebagai kepala sekolah SD Persa Juara Medan memberikan penguatan tentang Al Quran. Selanjutnya penampilan parade juz 30 dan 29 tasmi’ akbar yang di bacakan setiap siswa siswi masing masing satu atau dua ayat.</p>
<p>Satu persatu siswa siswi di panggil untuk maju ke depan diberikan sertifikat tahfidz dan mahkota oleh Ibu Sri Budiarti, sekaligus dibacakan nama kedua orang tua dan jumlah hafalannya. Ada yang hafal 1 juz, 2 juz, 3 juz sampai hafalan terbanyak 6 juz.</p>
<p>Suasana haru pecah saat siswa siswi memberikan mahkota kepada ibu nya masing masing, membayangkan kebahagian yang luar biasa mendapatkan mahkota yang sebenarnya dari Allah.</p>
<p>Barakallah kepada semua siswa siswi yang telah menyelesaikan hafalannya, teruslah bersama Al Qur’an agar menjadi Ahlul Quran dan keluarga Allah di antara manusia.</p>`,
      status: 'Terbit'
    },
    {
      id: 'ART-SJ05',
      title: 'Aksi Solidaritas SDS Persa Setahun Serangan Israel ke Palestina',
      category: 'kabar-sekolah-juara',
      categoryLabel: 'Berita SD Juara Medan, Berita Sekolah',
      author: 'acforid',
      date: 'Oct 10, 2024',
      comments: '0 comments',
      cover: 'assets/kabar-sekolahjuara/Foto-Artikel-Oktober-09.jpg',
      excerpt: 'Setahun sudah serangan Israel ke Palestina terjadi sejak 7 Oktober 2023. Selama 365 hari rakyat Palestina khususnya di Jalur Gaza dan Rafa menghadapi serangan rudal...',
      content: `<p>Setahun sudah serangan Israel ke Palestina terjadi sejak 7 Oktober 2023. Selama 365 hari rakyat Palestina khususnya di Jalur Gaza dan Rafa menghadapi serangan rudal, pemboman dan suara tembakan. Namun jika dilihat dari Sejarah konflik Israel dan Palestina sudah berlangsung selama puluhan bahkan ratusan tahun.</p>
<p>Tidak terhitung lagi berapa orang yang telah gugur sebagai Syuhada. Hidup dalam keadaan terluka bahkan cacat. Berapa juta jiwa yang kehilangan rumah. Hidup kelaparan dan kedinginan. Hidup di tenda pengungsian, tanpa air bersih dan listrik.</p>
<p>Sebagai Bangsa yang menjunjung tinggi kemerdekaan, Indonesia menyokong penuh kemerdekaan Bangsa Palestina. Begitupun SDS Persa “Sekolah Juara Medan” merasa terpanggil untuk memberikan dukungan dan doa sebagai bentuk solidaritas kepada Bangsa Palestina.</p>
<p>Mengambil momentum satu tahun Agresi, hari ini Senin 07 Oktober 2024 SDS Persa “Sekolah Juara Medan” mengadakan kampanye aksi solidaritas Palestina. Bertepatan dengan upacara bendera, aksi solidaritas berlangsung khidmat. Dalam Kata Sambutannya Kepala Sekolah Ibu Sri Budiarti, mengajak warga sekolah terus memberikan dukungan dan mendoakan kemerdekaan bangsa palestina. Seluruh siswa juga diajak menyanyikan lagu Atuna Tufuli sambil mengibarkan bendera Palestina.</p>
<p style="color: #64748B; font-weight: 600; margin-top: 24px;">#AnakCeriaFoundation #Palestina #FreePalestine</p>`,
      status: 'Terbit'
    },
    {
      id: 'ART-SJ04',
      title: 'Upacara Peringatan HUT Ke-79 RI di SD Juara Persa Medan Berlangsung Khidmat',
      category: 'kabar-sekolah-juara',
      categoryLabel: 'Berita SD Juara Medan, Berita Sekolah',
      author: 'acforid',
      date: 'Aug 19, 2024',
      comments: '0 comments',
      cover: 'assets/kabar-sekolahjuara/Foto-Artikel-Agustus-06.jpg',
      excerpt: 'Oleh : Eni Marianti Sabtu (17/8/2024), bertempat di lapangan upacara Komplek SDS Persa “Sekolah Juara Medan” Upacara Peringatan HUT Ke-79 RI berlangsung khidmat...',
      content: `<p><strong>Oleh : Eni Marianti</strong></p>
<p>Sabtu (17/8/2024), bertempat di lapangan upacara Komplek SDS Persa “Sekolah Juara Medan” Upacara Peringatan HUT Ke-79 RI berlangsung khidmat. Tim Paskibras dan Petugas Upacara seluruhnya berasal dari kelas VI. Selama sepekan lebih tim paskibras berlatih tidak peduli oleh teriknya matahari atau rintik hujan, mereka sangat bersemangat untuk menjadi petugas pembawa bendera.</p>
<p style="text-align: center; margin: 24px 0;"><img src="assets/kabar-sekolahjuara/Foto-Artikel-Agustus-07.jpg" alt="Petugas Upacara SD Juara Persa Medan" style="max-width: 100%; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);"></p>
<p>Di bawah komando Ananda Muhammad Yusuf Al Faruq Nasution sebagai pemimpin upacara, tim pengibar bendera sekolah dan petugas upacara sukses mengemban tugasnya melaksanakan pengibaran bendera. Suasana hujan deras sebelum upacara tidak menyurutkan langkah siswa untuk hadir ke sekolah mengikuti upacara bendera. Karena perjuangan kami belum ada apa-apanya dibandingkan dengan pengorbanan para pahlawan yang memperjuangkan kemerdekaan Negara Republik Indonesia.</p>
<p>Ibu Eni Marianti sebagai Pembina Upacara yang mewakili Kepala Sekolah membacakan Kata Sambutan Menteri Pendidikan, Kebudayaan, Riset dan Teknologi. Dalam kata sambutannya Bapak Nadiem Anwar Makarim mengajak kita untuk terus mengisi Kemerdekaan Indonesia dan melanjutkan perjuangan untuk memajukan Pendidikan dan kebudayaan Indonesia.</p>
<p>Semoga Pendidikan Indonesia semakin maju menyongsong Indonesia Emas 2045. Dirgahayu Republik Indonesia ke-79. Merdeka…!</p>
<p style="text-align: center; margin: 24px 0;"><img src="assets/kabar-sekolahjuara/Foto-Artikel-Agustus-08.jpg" alt="Dokumentasi HUT Ke-79 RI SD Juara Medan" style="max-width: 100%; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);"></p>
<p style="color: #64748B; font-weight: 600; margin-top: 24px;">#SekolahJuara #SDJuaraMedan #SDSPersaMedan</p>`,
      status: 'Terbit'
    },
    {
      id: 'ART-SJ03',
      title: 'Tasyakuran Tahsin Metode Tilawati: Apresiasi atas Perjalanan Belajar Al-Qur’an Siswa SD Juara Cilegon',
      category: 'kabar-sekolah-juara',
      categoryLabel: 'Artikel, Berita SD Juara Cilegon, Berita Sekolah',
      author: 'cerianak',
      date: 'Jun 18, 2026',
      comments: '0 comments',
      cover: 'assets/kabar-sekolahjuara/12.png',
      excerpt: 'Cilegon, 18 Juni 2026 SD Juara Cilegon menyelenggarakan kegiatan Tasyakuran Tahsin Metode Tilawati sebagai bentuk rasa syukur dan apresiasi atas pencapaian para siswa yang telah menyelesaikan pembelajaran Tilawati...',
      content: `<p><strong>Cilegon, 18 Juni 2026</strong></p>
<p>SD Juara Cilegon menyelenggarakan kegiatan Tasyakuran Tahsin Metode Tilawati sebagai bentuk rasa syukur dan apresiasi atas pencapaian para siswa yang telah menyelesaikan pembelajaran Tilawati mulai dari jilid 1 hingga jilid 6. Kegiatan ini menjadi momen istimewa untuk memberikan penghargaan atas kesungguhan, kedisiplinan, dan semangat siswa dalam mempelajari serta memperbaiki bacaan Al-Qur’an.</p>
<p>Sebagai bagian dari rangkaian acara, dilaksanakan uji publik untuk mengukur kemampuan bacaan peserta tasyakuran. Uji publik tersebut dilakukan secara langsung oleh Kepala Cabang Tilawati Provinsi Banten sehingga menjadi pengalaman berharga sekaligus bentuk evaluasi dan penguatan kualitas pembelajaran Al-Qur’an yang telah dijalani siswa.</p>
<p style="text-align: center; margin: 24px 0;"><img src="assets/kabar-sekolahjuara/13.png" alt="Uji Publik & Penyerahan Sertifikat Tahsin" style="max-width: 100%; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);"></p>
<p>Sebagai bentuk penghargaan atas pencapaian tersebut, seluruh peserta tasyakuran menerima sertifikat penghargaan yang diserahkan langsung oleh Kepala Sekolah SD Juara Cilegon. Penyerahan sertifikat ini menjadi simbol apresiasi atas proses belajar yang telah dilalui serta motivasi untuk terus melanjutkan interaksi yang baik dengan Al-Qur’an.</p>
<p>Kegiatan ini bertujuan untuk menumbuhkan rasa syukur, meningkatkan semangat belajar Al-Qur’an, serta membangun kepercayaan diri siswa dalam membaca Al-Qur’an dengan baik dan benar sesuai metode Tilawati.</p>
<p>Harapannya, melalui kegiatan ini para siswa semakin mencintai Al-Qur’an, menjaga kualitas bacaan yang telah dipelajari, dan terus melanjutkan pembelajaran menuju tahapan yang lebih baik, serta menjadi generasi yang berakhlak mulia dan dekat dengan nilai-nilai Al-Qur’an.</p>`,
      status: 'Terbit'
    },
    {
      id: 'ART-SJ02',
      title: 'Pembiasaan Pagi di SD Juara Cilegon',
      category: 'kabar-sekolah-juara',
      categoryLabel: 'Artikel, Berita SD Juara Cilegon, Berita Sekolah',
      author: 'cerianak',
      date: 'May 23, 2025',
      comments: '0 comments',
      cover: 'assets/kabar-sekolahjuara/2.jpg',
      excerpt: 'Cilegon, 09 Mei 2025 Membaca dzikir Al matsurat dan shalat Dhuha merupakan kegiatan rutin yang dilaksanakan di SD Juara Cilegon sebelum kegiatan belajar mengajar di mulai...',
      content: `<p><strong>Cilegon, 09 Mei 2025</strong></p>
<p>Membaca dzikir Al matsurat dan shalat Dhuha merupakan kegiatan rutin yang dilaksanakan di SD Juara Cilegon sebelum kegiatan belajar mengajar di mulai. Pembiasaan pagi ini secara rutin dilaksanakan setiap hari yaitu dari hari Senin – hari Jum’at, diawali dengan berwudhu, membaca Al matsurat dilanjutkan dengan sholat dhuha 2 rokaat bagi siswa kelas rendah dan 4 rokaat bagi siswa kelas atas.</p>
<p>Tujuan pembiasaan pagi ini salah satunya adalah untuk membentuk karakter anak menjadi pribadi yang Sholeh dan Sholehah, serta terbiasa melakukan ibadah Sunnah khususnya sholat Dhuha.</p>
<p>Selain itu pembiasaan pagi ini juga bertujuan untuk memberikan penanaman motivasi kepada siswa bahwa belajar itu harus diiringi dengan berdoa terlebih dahulu, memohon pertolongan kepada Allah SWT untuk memberikan kemudahan serta kecerdasan kepada diri kita.</p>
<blockquote>“Alhamdulillah, kegiatan pembiasaan pagi ini berjalan dengan baik setiap hari bahkan disaat siswa liburpun, siswa masih tetap melakukan sholat Dhuha di rumah”<br><span style="font-size: 0.9rem; font-style: normal; font-weight: 600; display: inline-block; margin-top: 6px;">Ungkap Bu Ais selaku salah satu guru SD Juara Cilegon.</span></blockquote>`,
      status: 'Terbit'
    },
    {
      id: 'ART-SJ01',
      title: 'Market Day Siswa-siswi kelas 1 SD Juara Batam',
      category: 'kabar-sekolah-juara',
      categoryLabel: 'Berita SD Juara Batam',
      author: 'acforid',
      date: 'Jul 1, 2024',
      comments: '0 comments',
      cover: 'assets/kabar-sekolahjuara/photo_2024-06-22_07-33-31-1080x675.jpg',
      excerpt: 'Batam, 22 Juni 2024 Oleh : Pandhu Alfajri Hai Sobat Ceria! Salah satu program rutin setiap pekan di...',
      content: `<p><strong>Batam, 22 Juni 2024</strong><br><strong>Oleh : Pandhu Alfajri</strong></p>
<p>Hai Sobat Ceria!<br>Salah satu program rutin setiap pekan di SD Juara Batam adalah progran Market Day. Pada Juma’t kali ini siswa-siswi kelas 1 mendapat kesempatan mengikuti program market day.</p>
<p>Nah, sobat ceria…<br>Market Day adalah salah satu dari program unggulan yang ada di SD Juara Batam. Market Day memberikan pembelajaran langsung kepada setiap individu peserta didik mengenai ilmu enterpreneur.</p>
<p>Siswa-siswi diajarkan cara membuat aneka jajanan pasar bersama orang tuanya seperti kue dan lain-lain, kemudian Bapak dan ibu guru mendampingi mereka untuk menjual kepada teman-teman nya.</p>
<p>Secara langsung siswa-siswi belajar ilmu ekonomi dan matematika praktis. Sehingga program ini juga melatih mental berwirausaha para siswa-siswi sejak usia dini.</p>
<p>Alhamdulillah, kegiatan Market Day berjalan dengan baik. Menambah semangat para wirausahawan cilik kelas 1 SD Juara Batam karena antusiasnya kakak dan abang kelas yang membeli jualan mereka.</p>
<p style="color: #64748B; font-weight: 600; margin-top: 24px;">#SDJuaraBatam<br>#BeritaSDJuaraBatam</p>`,
      status: 'Terbit'
    },
    {
      id: 'ART-3001',
      title: 'Transformasi Kompetensi Guru Era Digital Melalui Guruverse.ID',
      category: 'artikel',
      categoryLabel: 'Artikel Pendidikan',
      author: 'Tim Redaksi ACF',
      date: '23 Sep 2026',
      comments: '0 comments',
      cover: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80',
      excerpt: 'Eksplorasi metode micro-learning praktis yang memudahkan guru daerah 3T mengakses materi kurikulum mutakhir secara mandiri.',
      content: '<h2>Peluang Akselerasi Pendidikan 3T</h2><p>Perkembangan teknologi menuntut akselerasi kompetensi para pendidik di seluruh penjuru Indonesia. Melalui platform <strong>Guruverse.ID</strong>, ACF Eduhub menghadirkan kurikulum micro-learning yang ringkas dan aplikatif bagi guru-guru di daerah terdepan, terluar, dan tertinggal (3T).</p><blockquote>"Pendidikan yang berkualitas dimulai dari guru-guru yang terberdayakan dengan materi yang relevan."</blockquote><p>Program ini membekali ratusan guru dengan keterampilan pedagogi modern serta pemanfaatan media digital praktis yang dapat langsung diterapkan di ruang kelas sehari-hari.</p>',
      status: 'Terbit'
    },
    {
      id: 'ART-3002',
      title: 'Siswa Sekolah Juara Boyong 5 Medali Olimpiade Sains Nasional',
      category: 'liputan',
      categoryLabel: 'Liputan Lapangan',
      author: 'Warta Lapangan',
      date: '21 Sep 2026',
      comments: '0 comments',
      cover: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&q=80',
      excerpt: 'Dedikasi belajar siswa prasejahtera membuktikan bahwa potensi anak bangsa tak terbatas oleh latar belakang ekonomi keluarga.',
      content: '<h2>Prestasi Membanggakan Putra-Putri Bangsa</h2><p>Prestasi membanggakan kembali ditorehkan oleh siswa binaan Sekolah Juara. Lima perwakilan siswa berhasil meraih medali pada ajang Olimpiade Sains Nasional (OSN) tingkat provinsi.</p><p>Keberhasilan ini membuktikan bahwa dengan bimbingan intensif, fasilitas laboratorium yang memadai, dan kesempatan yang setara, anak-anak dari latar belakang prasejahtera mampu bersaing dan mengukir prestasi gemilang di kancah nasional.</p>',
      status: 'Terbit'
    },
    {
      id: 'ART-3003',
      title: 'Sekolah Daya Setara Luncurkan Kelas Keterampilan Kriya Digital',
      category: 'vokasi',
      categoryLabel: 'Program Vokasi',
      author: 'Berita Mitra',
      date: '18 Sep 2026',
      comments: '0 comments',
      cover: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80',
      excerpt: 'Membekali peserta didik paket C dengan keterampilan desain grafis, sablon konveksi, dan e-commerce siap kerja.',
      content: '<h2>Membangun Kemandirian Ekonomi Pemuda</h2><p>Dalam rangka memperluas kesiapan kerja pemuda putus sekolah, Sekolah Daya Setara meresmikan pembukaan workshop vokasi kriya digital.</p><p>Fasilitas ini memadukan pelatihan desain grafis terapan, cetak sablon tekstil, hingga strategi pemasaran di marketplace, mempersiapkan para lulusan paket C untuk mandiri secara ekonomi dan membuka usaha baru di lingkungannya.</p>',
      status: 'Terbit'
    }
  ];

  let currentArticles = [];
  let currentCategories = [];
  let activeCategorySlug = 'all';

  // 1. Load Categories
  function loadCategories() {
    try {
      const savedCats = localStorage.getItem('acf_custom_categories');
      if (savedCats) {
        let parsed = JSON.parse(savedCats);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Migrate old 'sekolah-juara'
          parsed = parsed.map(c => {
            if (c.slug === 'sekolah-juara') {
              c.slug = 'kabar-sekolah-juara';
              c.label = 'Kabar Sekolah Juara';
            }
            return c;
          });
          // Ensure new default categories like 'kabar-sekolah-daya-setara' exist
          DEFAULT_CATEGORIES.forEach(defCat => {
            if (!parsed.some(c => c.slug === defCat.slug)) {
              parsed.push(defCat);
            }
          });
          currentCategories = parsed;
          localStorage.setItem('acf_custom_categories', JSON.stringify(currentCategories));
        } else {
          currentCategories = [...DEFAULT_CATEGORIES];
          localStorage.setItem('acf_custom_categories', JSON.stringify(currentCategories));
        }
      } else {
        currentCategories = [...DEFAULT_CATEGORIES];
        localStorage.setItem('acf_custom_categories', JSON.stringify(currentCategories));
      }
    } catch (e) {
      currentCategories = [...DEFAULT_CATEGORIES];
    }

    renderCategoryChips();
  }

  // 2. Render Category Filter Chips
  function renderCategoryChips() {
    if (!categoriesContainer) return;

    categoriesContainer.innerHTML = '';

    // "Semua Kategori" Pill
    const allBtn = document.createElement('button');
    allBtn.className = `kabar-filter-btn ${activeCategorySlug === 'all' ? 'active' : ''}`;
    allBtn.setAttribute('data-category', 'all');
    allBtn.style.cssText = 'padding: 8px 18px; border-radius: 9999px; border: 1px solid #CBD5E1; background: #FFFFFF; font-weight: 600; cursor: pointer; font-size: 0.88rem;';
    allBtn.textContent = 'Semua Kategori';
    allBtn.addEventListener('click', () => {
      setFilterCategory('all');
    });
    categoriesContainer.appendChild(allBtn);

    // Custom & Dynamic Categories Pills
    currentCategories.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = `kabar-filter-btn ${activeCategorySlug === cat.slug ? 'active' : ''}`;
      btn.setAttribute('data-category', cat.slug);
      btn.style.cssText = 'padding: 8px 18px; border-radius: 9999px; border: 1px solid #CBD5E1; background: #FFFFFF; font-weight: 600; cursor: pointer; font-size: 0.88rem;';
      btn.textContent = cat.label;
      btn.addEventListener('click', () => {
        setFilterCategory(cat.slug);
      });
      categoriesContainer.appendChild(btn);
    });
  }

  function setFilterCategory(slug) {
    activeCategorySlug = slug;
    document.querySelectorAll('.kabar-filter-btn').forEach(btn => {
      if (btn.getAttribute('data-category') === slug) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    applyFilters();
  }

  // 3. Load and Render Articles
  function loadAndRenderArticles() {
    try {
      const saved = localStorage.getItem('acf_articles_data');
      if (saved) {
        let parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Auto-migrate and fix any old incorrect cover paths & categories
          parsed = parsed.map(item => {
            if (item.cover && item.cover.includes('artikel-sekolahjuara')) {
              item.cover = item.cover.replace('artikel-sekolahjuara', 'kabar-sekolahjuara');
            }
            if (item.category === 'sekolah-juara') {
              item.category = 'kabar-sekolah-juara';
            }
            if (item.id === 'ART-SDS01') {
              item.category = 'kabar-sekolah-daya-setara';
              item.categoryLabel = 'Kabar Sekolah Daya Setara';
            }
            if (item.id === 'ART-SJ01') {
              item.cover = 'assets/kabar-sekolahjuara/photo_2024-06-22_07-33-31-1080x675.jpg';
              item.category = 'kabar-sekolah-juara';
            }
            if (item.id === 'ART-SJ04') {
              item.author = 'acforid';
              item.date = 'Aug 19, 2024';
              item.categoryLabel = 'Berita SD Juara Medan, Berita Sekolah';
            }
            return item;
          });

          // Ensure default articles exist
          DEFAULT_ARTICLES.forEach(defArt => {
            const existingIdx = parsed.findIndex(a => a.id === defArt.id);
            if (existingIdx === -1) {
              parsed.unshift(defArt);
            } else if (defArt.id === 'ART-SDS05' || defArt.id === 'ART-SDS06' || defArt.id === 'ART-SDS07') {
              parsed[existingIdx] = { ...parsed[existingIdx], ...defArt };
            }
          });
          currentArticles = parsed;
          localStorage.setItem('acf_articles_data', JSON.stringify(currentArticles));
        } else {
          currentArticles = DEFAULT_ARTICLES;
          localStorage.setItem('acf_articles_data', JSON.stringify(DEFAULT_ARTICLES));
        }
      } else {
        currentArticles = DEFAULT_ARTICLES;
        localStorage.setItem('acf_articles_data', JSON.stringify(DEFAULT_ARTICLES));
      }
    } catch (e) {
      console.warn('Error reading articles storage:', e);
      currentArticles = DEFAULT_ARTICLES;
    }

    loadCategories();
    renderGrid();
  }

  // 4. Render Cards into Grid
  function renderGrid() {
    if (!articlesGrid) return;

    // Filter only published articles (not Drafts)
    const published = currentArticles.filter(art => (art.status || 'Terbit') !== 'Draf');

    articlesGrid.innerHTML = '';

    if (published.length === 0) {
      articlesGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #64748B;">
          <svg viewBox="0 0 24 24" width="48" height="48" stroke="#CBD5E1" fill="none" stroke-width="1.5" style="margin-bottom: 12px;"><path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/></svg>
          <h3 style="font-size: 1.15rem; color: #1E293B; margin-bottom: 6px; font-weight: 700;">Belum Ada Kabar yang Diterbitkan</h3>
          <p style="font-size: 0.9rem;">Artikel dan berita terbaru akan segera hadir di sini.</p>
        </div>
      `;
      return;
    }

    published.forEach((art, idx) => {
      const card = document.createElement('article');
      card.className = 'kabar-card visible';
      card.setAttribute('data-category', art.category || 'artikel');
      card.setAttribute('data-id', art.id || idx);

      const coverSrc = art.cover || 'assets/logo-acf/LOGO_ACF-removebg-preview.png';

      card.innerHTML = `
        <div class="kabar-img-wrapper" style="cursor: pointer;">
          <img src="${escapeHTML(coverSrc)}" alt="${escapeHTML(art.title || 'Kabar ACF')}" onerror="this.src='https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80'">
        </div>
        <div class="kabar-body">
          <div>
            <h3 class="kabar-title" style="cursor: pointer;">${escapeHTML(art.title || '-')}</h3>
            <p class="kabar-excerpt">${escapeHTML(art.excerpt || '-')}</p>
            <a class="kabar-read-more" href="javascript:void(0);">read more</a>
          </div>
        </div>
      `;

      // Click to open reading modal
      card.addEventListener('click', () => {
        openArticleDetail(art);
      });

      articlesGrid.appendChild(card);
    });

    applyFilters();
  }

  // 5. Open Article Detail Modal (Matches Gambar 2 Layout)
  function openArticleDetail(art) {
    if (!articleModal) return;

    const modalCover = document.getElementById('modalArticleCover');
    const modalTitle = document.getElementById('modalArticleTitle');
    const modalMeta = document.getElementById('modalArticleMeta');
    const modalContent = document.getElementById('modalArticleContent');

    if (modalCover) {
      modalCover.src = art.cover || 'assets/kabar-sekolahjuara/photo_2024-06-22_07-33-31-1080x675.jpg';
      modalCover.alt = art.title || 'Foto Artikel';
    }
    if (modalTitle) {
      modalTitle.textContent = art.title || '';
    }
    if (modalMeta) {
      const author = art.author || 'acforid';
      const date = art.date || 'Jul 1, 2024';
      const catLabel = art.categoryLabel || getCatLabel(art.category) || 'Berita SD Juara Batam';
      const comments = art.comments || '0 comments';
      modalMeta.textContent = `by ${author} | ${date} | ${catLabel} | ${comments}`;
    }
    if (modalContent) {
      modalContent.innerHTML = art.content || `<p>${escapeHTML(art.excerpt || '')}</p>`;
    }

    articleModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeArticleDetail() {
    if (articleModal) {
      articleModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (btnCloseModal) {
    btnCloseModal.addEventListener('click', closeArticleDetail);
  }
  if (articleModal) {
    articleModal.addEventListener('click', (e) => {
      if (e.target === articleModal) closeArticleDetail();
    });
  }

  // Helper labels
  function getCatLabel(cat) {
    const found = currentCategories.find(c => c.slug === cat);
    if (found) return found.label;
    switch (cat) {
      case 'kabar-sekolah-juara': return 'Kabar Sekolah Juara';
      case 'liputan': return 'Liputan Lapangan';
      case 'vokasi': return 'Program Vokasi';
      case 'opini': return 'Kolaborasi & Opini';
      default: return 'Artikel Pendidikan';
    }
  }

  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // 6. Filter & Search logic
  function applyFilters() {
    const query = (searchInput?.value || '').toLowerCase().trim();

    const cards = document.querySelectorAll('.kabar-card');
    cards.forEach(card => {
      const cardCat = card.getAttribute('data-category');
      const title = card.querySelector('.kabar-title')?.textContent.toLowerCase() || '';
      const excerpt = card.querySelector('.kabar-excerpt')?.textContent.toLowerCase() || '';
      
      const matchCat = activeCategorySlug === 'all' || cardCat === activeCategorySlug;
      const matchQuery = !query || title.includes(query) || excerpt.includes(query);

      if (matchCat && matchQuery) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  }

  // Search input filter
  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  // Listen to cross-tab storage updates
  window.addEventListener('storage', (e) => {
    if (e.key === 'acf_articles_data' || e.key === 'acf_custom_categories') {
      loadAndRenderArticles();
    }
  });

  // Global helper to open article modal by ID or title search (for "Baca Juga" links)
  window.openArticleModalById = function(id, titleSearch = '') {
    const art = currentArticles.find(a => a.id === id || (titleSearch && (a.title || '').toLowerCase().includes(titleSearch.toLowerCase())));
    if (art) {
      openArticleDetail(art);
    } else {
      alert('Artikel terkait akan segera tersedia!');
    }
  };

  // Initial load
  loadAndRenderArticles();
});
