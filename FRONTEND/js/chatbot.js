/**
 * ACF EDUHUB — CHATBOT "CHERRY"
 * AI Assistant powered by Google Gemini API & ACF Core Knowledge Base
 */

(function () {
  'use strict';

  // Prevent multiple initializations
  if (window.CherryChatbotInitialized) return;
  window.CherryChatbotInitialized = true;

  // Configuration & State
  const STORAGE_SIZE_KEY = 'cherry_chat_size';
  const STORAGE_KEY_API = 'cherry_gemini_api_key';
  let chatHistory = [];
  let isAwaitingResponse = false;

  // Resolve API Base URL for backend chat endpoint
  function getChatApiUrl() {
    if (window.ACF_CUSTOM_API_URL) {
      return `${window.ACF_CUSTOM_API_URL}/chat.php`;
    }

    const loc = window.location;

    // Live Server or file:// protocol
    if ((loc.port && loc.port !== '80' && loc.port !== '443') || loc.protocol === 'file:') {
      return 'http://localhost/Intership-ACF/BACKEND/api/chat.php';
    }

    // Laragon virtual hosts (*.test / *.local)
    if (loc.hostname.endsWith('.test') || loc.hostname.endsWith('.local')) {
      return `${loc.origin}/BACKEND/api/chat.php`;
    }

    // Localhost standard
    if (loc.hostname === 'localhost' || loc.hostname === '127.0.0.1') {
      const pathname = loc.pathname;
      const match = pathname.match(/^(.*?\/(?:Intership-ACF|intership-acf|acf))\//i);
      if (match) {
        return `${loc.origin}${match[1]}/BACKEND/api/chat.php`;
      }
      if (pathname.includes('/FRONTEND/')) {
        return `${loc.origin}${pathname.split('/FRONTEND/')[0]}/BACKEND/api/chat.php`;
      }
      return `${loc.origin}/Intership-ACF/BACKEND/api/chat.php`;
    }

    // Default relative fallback
    return '../../BACKEND/api/chat.php';
  }

  // ACF Knowledge Base for instant client-side responses (if server/network offline)
  function getLocalKnowledgeReply(query) {
    const q = query.toLowerCase();

    if (q.includes('siapa') || q.includes('nama') || q.includes('bot') || q.includes('cherry')) {
      return "Halo! 😊 Saya **Cherry**, asisten virtual AI resmi dari **ACF Eduhub**! Saya siap menemani dan menjawab segala pertanyaan Anda mengenai program pendidikan, unit sekolah, donasi, hingga kemitraan.";
    }

    if (q.includes('sekolah') || q.includes('unit') || q.includes('juara') || q.includes('daya setara') || q.includes('guruverse')) {
      return "🏫 **Unit Pendidikan ACF Eduhub**:\n\n" +
             "1. **Sekolah Juara (10 Unit)**: Sekolah formal gratis (SD/SMP/SMA) berakreditasi baik bagi 1.662+ anak yatim & dhuafa prasejahtera.\n" +
             "2. **PKBM Sekolah Daya Setara (7 Unit)**: Pendidikan non-formal kesetaraan (Paket A, B, C) serta vokasi kecakapan kerja mandiri.\n" +
             "3. **Guruverse.ID**: Ekosistem pemberdayaan dan sertifikasi lebih dari 2.000+ guru di berbagai daerah Indonesia.\n\n" +
             "Ada yang ingin Anda tanyakan lebih lanjut tentang pendaftaran atau lokasi?";
    }

    if (q.includes('program') || q.includes('layanan') || q.includes('kemanusiaan') || q.includes('beasiswa')) {
      return "📚 **4 Pilar Program Layanan ACF Eduhub**:\n\n" +
             "1. **Keberlanjutan Unit Pendidikan**: Dukungan kuota beasiswa & operasional Sekolah Juara.\n" +
             "2. **Pemberdayaan Berbasis Sekolah**: Program kantin sehat, green school, dan literasi digital anak.\n" +
             "3. **Kemanusiaan Internasional**: Penyaluran bantuan bagi anak-anak di daerah bencana & krisis kemanusiaan.\n" +
             "4. **Bantuan Langsung Berkelanjutan**: Distribusi paket nutrisi gizi, seragam, dan buku paket belajar.\n\n" +
             "Semua program ini dapat Anda eksplorasi di menu **Program Layanan**!";
    }

    if (q.includes('mitra') || q.includes('kerjasama') || q.includes('csr') || q.includes('sponsor') || q.includes('kolaborasi')) {
      return "🤝 **Kerjasama Kemitraan CSR & Program**:\n\n" +
             "ACF Eduhub membuka kolaborasi dengan korporasi, institusi, dan yayasan untuk mewujudkan program CSR berdampak jangka panjang, beasiswa binaan, maupun sarana belajar.\n\n" +
             "Pengajuan kemitraan dapat langsung dilakukan melalui formulir di halaman **Jadi Mitra Program** (`form-mitra.html`). Tim kami akan segera menghubungi Anda!";
    }

    if (q.includes('relawan') || q.includes('volunteer') || q.includes('sahabat')) {
      return "🙋‍♀️ **Gabung Sahabat Eduhub (Relawan)**:\n\n" +
             "Kami menyambut hangat para relawan yang ingin berbagi ilmu, menjadi mentor, fasilitator kelas, maupun dokumentator kegiatan. Pendaftaran relawan dibuka di halaman **Jadi Relawan** (`form-relawan.html`).";
    }

    if (q.includes('donasi') || q.includes('donatur') || q.includes('infaq') || q.includes('sedekah') || q.includes('rekening') || q.includes('transfer')) {
      return "💖 **Donasi Pendidikan ACF Eduhub**:\n\n" +
             "Donasi Anda disalurkan secara aman dan transparan untuk subsidi SPP, seragam, sepatu, dan gizi sarapan siswa prasejahtera. Laporan keuangan kami diaudit dengan opini **WTP (Wajar Tanpa Pengecualian)** sejak 2024.\n\n" +
             "Anda bisa menyalurkan donasi langsung melalui halaman **Donasi** (`donasi.html`).";
    }

    if (q.includes('alamat') || q.includes('lokasi') || q.includes('kontak') || q.includes('telepon') || q.includes('wa') || q.includes('whatsapp') || q.includes('email')) {
      return "📍 **Kontak & Lokasi Kantor ACF Eduhub**:\n\n" +
             "🏢 **Alamat**: Jl. Jati Mulya No.9, Gumuruh, Kec. Batununggal, Kota Bandung, Jawa Barat 40275\n" +
             "📞 **WhatsApp / Telepon**: +62 851-7979-7661\n" +
             "✉️ **Email**: welcome@acf.or.id\n" +
             "📸 **Instagram**: @acf.eduhub | **YouTube**: JUARA TV";
    }

    if (q.includes('dampak') || q.includes('statistik') || q.includes('capaian') || q.includes('wtp')) {
      return "📊 **Capaian Dampak Nyata ACF Eduhub** (10 Tahun Berjalan):\n\n" +
             "• **17 Unit Pendidikan** (10 Sekolah Juara + 7 PKBM Daya Setara)\n" +
             "• **12 Kota/Kabupaten** wilayah jangkauan\n" +
             "• **1.812+ Siswa Terdampak** langsung\n" +
             "• **2.000+ Guru Terlatih** lewat Guruverse.ID\n" +
             "• **Opini WTP** Akuntabilitas Audit sejak 2024";
    }

    return "Terima kasih atas pertanyaannya! 😊\n\n" +
           "Saya **Cherry** dari ACF Eduhub. Anda dapat menanyakan tentang:\n" +
           "• 🏫 **Unit Pendidikan**: Sekolah Juara & Daya Setara\n" +
           "• 📚 **Program Layanan**: 4 pilar program pendidikan\n" +
           "• 🤝 **Cara Jadi Mitra / CSR**: Kolaborasi kebaikan\n" +
           "• 💖 **Donasi**: Penyaluran bantuan dhuafa\n" +
           "• 📍 **Kontak & Alamat**: Info kantor dan narahubung\n\n" +
           "Silakan pilih topik di atas atau ketik langsung pertanyaan Anda!";
  }

  // Escape HTML helper
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Simple Markdown parser for bolding, lists, and line breaks
  function formatMarkdown(text) {
    let raw = escapeHtml(text);

    // Bold **text**
    raw = raw.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Bullet points (* or •)
    raw = raw.replace(/(?:^|\n)[•*]\s*(.*?)(?=(?:\n[•*]|\n\n|$))/g, function (match, p1) {
      return '<div style="display:flex; gap:6px; margin:3px 0;"><span>•</span><span>' + p1 + '</span></div>';
    });

    // Numbered lists
    raw = raw.replace(/(?:^|\n)(\d+)\.\s*(.*?)(?=(?:\n\d+\.|\n\n|$))/g, function (match, num, p1) {
      return '<div style="display:flex; gap:6px; margin:3px 0;"><span style="font-weight:600; color:#7D2280;">' + num + '.</span><span>' + p1 + '</span></div>';
    });

    // Convert newlines to <br>
    raw = raw.replace(/\n/g, '<br>');

    return raw;
  }

  // Create & Inject Chatbot HTML
  function initChatbotUI() {
    // 1. Floating Round Trigger Button
    const triggerBtn = document.createElement('button');
    triggerBtn.id = 'cherry-chat-trigger';
    triggerBtn.className = 'cherry-trigger-btn';
    triggerBtn.setAttribute('aria-label', 'Buka Chat AI Cherry');
    triggerBtn.setAttribute('title', 'Tanya Cherry AI • ACF Eduhub');
    triggerBtn.innerHTML = `
      <!-- Chat Icon SVG (Solid, crisp, identical optical balance with WhatsApp) -->
      <svg class="cherry-icon-chat" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.03 2 11c0 2.87 1.5 5.43 3.86 7.04-.15.93-.65 2.5-1.74 3.65 0 0 2.65.15 5.3-1.63.83.21 1.7.32 2.58.32 5.52 0 10-4.03 10-9S17.52 2 12 2zm-5 10c-.83 0-1.5-.67-1.5-1.5S6.17 9 7 9s1.5.67 1.5 1.5S7.83 12 7 12zm5 0c-.83 0-1.5-.67-1.5-1.5S11.17 9 12 9s1.5.67 1.5 1.5S12.83 12 12 12zm5 0c-.83 0-1.5-.67-1.5-1.5S16.17 9 17 9s1.5.67 1.5 1.5S17.83 12 17 12z"/>
      </svg>
      <!-- Close 'X' Icon SVG -->
      <svg class="cherry-icon-close" viewBox="0 0 24 24">
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
      </svg>
      <span class="cherry-trigger-tooltip">Chat Tanya Cherry AI</span>
    `;

    // 2. Chat Modal Window
    const savedSize = localStorage.getItem(STORAGE_SIZE_KEY) || 'size-m';

    const chatWindow = document.createElement('div');
    chatWindow.id = 'cherry-chat-window';
    chatWindow.className = `cherry-chat-window ${savedSize}`;
    chatWindow.innerHTML = `
      <!-- Header -->
      <div class="cherry-chat-header">
        <div class="cherry-header-info">
          <div class="cherry-header-avatar">
            <!-- Cute Cherry Bot Icon SVG -->
            <svg class="cherry-avatar-svg" viewBox="0 0 36 36">
              <!-- Cherries SVG with Purple/Gold theme -->
              <path fill="#7D2280" d="M12.5 32c-4.1 0-7.5-3.4-7.5-7.5s3.4-7.5 7.5-7.5c2.3 0 4.3 1 5.6 2.6.4.5.2 1.2-.3 1.6-.5.4-1.2.2-1.6-.3-1-1.2-2.3-1.9-3.7-1.9-3 0-5.5 2.5-5.5 5.5s2.5 5.5 5.5 5.5c2.8 0 5.1-2.1 5.4-4.8.1-.6.6-1.1 1.2-1 .6.1 1.1.6 1 1.2-.4 3.7-3.6 6.7-7.6 6.7z"/>
              <path fill="#9B2C9F" d="M23.5 32c-4.1 0-7.5-3.4-7.5-7.5 0-3.3 2.2-6.2 5.3-7.1.6-.2 1.2.2 1.4.8.2.6-.2 1.2-.8 1.4-2.3.7-3.9 2.8-3.9 5 0 3 2.5 5.5 5.5 5.5s5.5-2.5 5.5-5.5-2.5-5.5-5.5-5.5c-.6 0-1.2-.1-1.8-.3-.6-.2-.9-.8-.7-1.4.2-.6.8-.9 1.4-.7.7.2 1.4.3 2.1.3 4.1 0 7.5 3.4 7.5 7.5s-3.4 7.4-7.5 7.4z"/>
              <circle cx="12.5" cy="24.5" r="5.5" fill="#7D2280"/>
              <circle cx="23.5" cy="24.5" r="5.5" fill="#58105B"/>
              <circle cx="10.5" cy="22.5" r="1.5" fill="#FFFFFF" opacity="0.8"/>
              <circle cx="21.5" cy="22.5" r="1.5" fill="#FFFFFF" opacity="0.8"/>
              <!-- Stems & Leaf in Gold -->
              <path fill="#F5A623" d="M12.5 19c-.3 0-.5-.1-.7-.3-.5-.4-.5-1.2-.1-1.7 2.2-2.8 5.4-5.6 9.3-8 3.8-2.3 7.8-3.3 8.3-3.4.6-.2 1.3.2 1.4.8.2.6-.2 1.3-.8 1.4-.3.1-4 1-7.6 3.2-3.6 2.2-6.5 4.8-8.5 7.3-.3.5-.7.7-1.3.7z"/>
              <path fill="#F5A623" d="M23.5 19c-.5 0-.9-.3-1-7.9-.1-.6.3-1.2.9-1.3 4.8-.8 8.8-3.4 9.1-3.6.5-.4 1.3-.2 1.6.3.4.5.2 1.3-.3 1.6-.6.4-4.8 3.2-9.9 4-.1 0-.2.1-.4.1z"/>
            </svg>
            
          </div>
          <div class="cherry-header-meta">
            <div class="cherry-header-title">
              Cherry <span class="cherry-badge-acf">ACF AI</span>
            </div>
            <div class="cherry-header-sub">
              AI Assistant
            </div>
          </div>
        </div>

        <!-- Controls: S | M | L and Close -->
        <div class="cherry-header-controls">
          <div class="cherry-size-switcher" role="group" aria-label="Ukuran Chat">
            <button type="button" class="cherry-size-btn ${savedSize === 'size-s' ? 'active' : ''}" data-size="size-s" title="Ukuran Kecil (S)">S</button>
            <button type="button" class="cherry-size-btn ${savedSize === 'size-m' ? 'active' : ''}" data-size="size-m" title="Ukuran Standar (M)">M</button>
            <button type="button" class="cherry-size-btn ${savedSize === 'size-l' ? 'active' : ''}" data-size="size-l" title="Ukuran Besar (L)">L</button>
          </div>
          <button type="button" class="cherry-minimize-btn" id="cherry-btn-minimize" title="Tutup Chat">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Messages Body -->
      <div class="cherry-chat-body" id="cherry-chat-body">
        <!-- Initial Welcome Message from Cherry -->
        <div class="cherry-msg-row bot">
          <div class="cherry-msg-avatar">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="#7D2280">
              <circle cx="8" cy="15" r="4"/>
              <circle cx="16" cy="15" r="4"/>
              <path d="M8 11c1-4 4-7 8-9" stroke="#F5A623" stroke-width="2" fill="none"/>
            </svg>
          </div>
          <div class="cherry-bubble">
            <p>Halo! 👋 Saya <strong>Cherry</strong>, asisten AI resmi ACF Eduhub.</p>
            <p>Saya siap membantu Anda mengenai:</p>
            <ul class="cherry-welcome-list">
              <li class="cherry-welcome-item">🏫 <span><strong>Unit Pendidikan</strong> (Sekolah Juara & Daya Setara)</span></li>
              <li class="cherry-welcome-item">📚 <span><strong>Program Layanan</strong> & Beasiswa Edukasi</span></li>
              <li class="cherry-welcome-item">🤝 <span><strong>Cara Menjadi Mitra</strong> & Relawan</span></li>
              <li class="cherry-welcome-item">💖 <span><strong>Panduan Donasi</strong> & Transparansi</span></li>
              <li class="cherry-welcome-item">📍 <span><strong>Alamat & Kontak</strong> ACF Eduhub</span></li>
            </ul>
            <span class="cherry-msg-time">Sekarang</span>
          </div>
        </div>
      </div>

      <!-- Quick Action Chips -->
      <div class="cherry-quick-chips-wrapper">
        <div class="cherry-quick-chips" id="cherry-quick-chips">
          <button type="button" class="cherry-chip" data-query="Jelaskan tentang Unit Pendidikan ACF Eduhub">
            🏫 Unit Pendidikan
          </button>
          <button type="button" class="cherry-chip" data-query="Apa saja 4 Program Layanan di ACF Eduhub?">
            📚 Program Layanan
          </button>
          <button type="button" class="cherry-chip" data-query="Bagaimana cara menjadi mitra CSR atau kerjasama dengan ACF?">
            🤝 Jadi Mitra
          </button>
          <button type="button" class="cherry-chip" data-query="Bagaimana cara menyalurkan donasi di ACF Eduhub?">
            💖 Salurkan Donasi
          </button>
          <button type="button" class="cherry-chip" data-query="Di mana alamat kantor dan kontak WhatsApp ACF Eduhub?">
            📍 Alamat & Kontak
          </button>
        </div>
      </div>

      <!-- Input Footer -->
      <form class="cherry-chat-footer" id="cherry-chat-form">
        <div class="cherry-input-box">
          <input type="text" id="cherry-chat-input" class="cherry-input" placeholder="Ketik pesan untuk Cherry..." autocomplete="off" />
        </div>
        <button type="submit" class="cherry-send-btn" id="cherry-send-btn" aria-label="Kirim Pesan">
          <svg viewBox="0 0 24 24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </form>
    `;

    document.body.appendChild(triggerBtn);
    document.body.appendChild(chatWindow);

    bindEvents(triggerBtn, chatWindow);
  }

  // Bind DOM Events
  function bindEvents(triggerBtn, chatWindow) {
    const chatBody = document.getElementById('cherry-chat-body');
    const chatForm = document.getElementById('cherry-chat-form');
    const chatInput = document.getElementById('cherry-chat-input');
    const minimizeBtn = document.getElementById('cherry-btn-minimize');
    const sizeButtons = chatWindow.querySelectorAll('.cherry-size-btn');
    const quickChips = document.getElementById('cherry-quick-chips');

    // Toggle Chat Window
    function toggleChat(forceOpen) {
      const willOpen = typeof forceOpen === 'boolean' ? forceOpen : !chatWindow.classList.contains('active');
      if (willOpen) {
        chatWindow.classList.add('active');
        triggerBtn.classList.add('active');
        chatInput.focus();
        scrollToBottom();
      } else {
        chatWindow.classList.remove('active');
        triggerBtn.classList.remove('active');
      }
    }

    triggerBtn.addEventListener('click', () => toggleChat());
    minimizeBtn.addEventListener('click', () => toggleChat(false));

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && chatWindow.classList.contains('active')) {
        toggleChat(false);
      }
    });

    // Handle Size Switching (S / M / L)
    sizeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetSize = btn.dataset.size;
        chatWindow.classList.remove('size-s', 'size-m', 'size-l');
        chatWindow.classList.add(targetSize);

        sizeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        localStorage.setItem(STORAGE_SIZE_KEY, targetSize);
        scrollToBottom();
      });
    });

    // Handle Quick Action Chips
    if (quickChips) {
      quickChips.addEventListener('click', (e) => {
        const chip = e.target.closest('.cherry-chip');
        if (!chip) return;
        const query = chip.dataset.query;
        if (query) {
          sendUserMessage(query);
        }
      });
    }

    // Handle Form Submit
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const message = chatInput.value.trim();
      if (!message || isAwaitingResponse) return;
      chatInput.value = '';
      sendUserMessage(message);
    });

    // Auto-scroll to bottom
    function scrollToBottom() {
      setTimeout(() => {
        chatBody.scrollTop = chatBody.scrollHeight;
      }, 50);
    }

    // Append Message to UI
    function appendMessage(sender, text, isMarkdown = true) {
      const row = document.createElement('div');
      row.className = `cherry-msg-row ${sender}`;

      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      if (sender === 'bot') {
        row.innerHTML = `
          <div class="cherry-msg-avatar">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="#7D2280">
              <circle cx="8" cy="15" r="4"/>
              <circle cx="16" cy="15" r="4"/>
              <path d="M8 11c1-4 4-7 8-9" stroke="#F5A623" stroke-width="2" fill="none"/>
            </svg>
          </div>
          <div class="cherry-bubble">
            ${isMarkdown ? formatMarkdown(text) : escapeHtml(text)}
            <span class="cherry-msg-time">${timeStr}</span>
          </div>
        `;
      } else {
        row.innerHTML = `
          <div class="cherry-bubble">
            <p>${escapeHtml(text)}</p>
            <span class="cherry-msg-time">${timeStr}</span>
          </div>
        `;
      }

      chatBody.appendChild(row);
      scrollToBottom();
    }

    // Show / Hide Typing Indicator
    let typingRow = null;
    function showTypingIndicator() {
      if (typingRow) return;
      typingRow = document.createElement('div');
      typingRow.className = 'cherry-msg-row bot cherry-typing-row';
      typingRow.innerHTML = `
        <div class="cherry-msg-avatar">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="#7D2280">
            <circle cx="8" cy="15" r="4"/>
            <circle cx="16" cy="15" r="4"/>
            <path d="M8 11c1-4 4-7 8-9" stroke="#F5A623" stroke-width="2" fill="none"/>
          </svg>
        </div>
        <div class="cherry-typing-bubble">
          <span class="cherry-dot"></span>
          <span class="cherry-dot"></span>
          <span class="cherry-dot"></span>
        </div>
      `;
      chatBody.appendChild(typingRow);
      scrollToBottom();
    }

    function hideTypingIndicator() {
      if (typingRow) {
        typingRow.remove();
        typingRow = null;
      }
    }

    // Send Message Handler
    async function sendUserMessage(userText) {
      appendMessage('user', userText);
      chatHistory.push({ role: 'user', text: userText });

      isAwaitingResponse = true;
      showTypingIndicator();

      const apiUrl = getChatApiUrl();
      const clientApiKey = localStorage.getItem(STORAGE_KEY_API) || '';

      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            message: userText,
            history: chatHistory.slice(-8), // Send recent context
            clientApiKey: clientApiKey
          })
        });

        if (response.ok) {
          const data = await response.json();
          hideTypingIndicator();
          if (data && data.reply) {
            appendMessage('bot', data.reply);
            chatHistory.push({ role: 'model', text: data.reply });
          } else {
            const fallback = getLocalKnowledgeReply(userText);
            appendMessage('bot', fallback);
            chatHistory.push({ role: 'model', text: fallback });
          }
        } else {
          throw new Error(`HTTP Error: ${response.status}`);
        }
      } catch (err) {
        // If server or network is not available (e.g. running on static server), use client-side knowledge base
        console.warn('Cherry: Backend chat endpoint unavailable or offline, using smart knowledge base.', err);
        hideTypingIndicator();
        const fallback = getLocalKnowledgeReply(userText);
        appendMessage('bot', fallback);
        chatHistory.push({ role: 'model', text: fallback });
      } finally {
        isAwaitingResponse = false;
      }
    }
  }

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatbotUI);
  } else {
    initChatbotUI();
  }
})();

