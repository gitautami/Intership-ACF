/**
 * ACF EDUHUB — DONATION CHANNELS INTERACTION SCRIPT
 * Connected to MySQL Backend (donations_prayers) via ACF_API
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const toastMsg = document.getElementById('toastMsg');
  const anonCheckbox = document.getElementById('anonCheckbox');
  const donatorNameInput = document.getElementById('donatorName');
  const doaForm = document.getElementById('doaForm');
  const donatorPrayerInput = document.getElementById('donatorPrayer');
  const prayersList = document.getElementById('prayersList');

  // 1. Toast Notification Helper
  const showToast = (message) => {
    if (!toastMsg) return;
    toastMsg.textContent = message;
    toastMsg.classList.add('show');
    setTimeout(() => {
      toastMsg.classList.remove('show');
    }, 3000);
  };

  // 2. Global Copy to Clipboard Function
  window.copyText = (text, typeLabel) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(`✓ ${typeLabel} berhasil disalin!`);
      }).catch(() => {
        fallbackCopy(text, typeLabel);
      });
    } else {
      fallbackCopy(text, typeLabel);
    }
  };

  const fallbackCopy = (text, typeLabel) => {
    const tempInput = document.createElement('input');
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    try {
      document.execCommand('copy');
      showToast(`✓ ${typeLabel} berhasil disalin!`);
    } catch (err) {
      showToast(`Gagal menyalin ${typeLabel}`);
    }
    document.body.removeChild(tempInput);
  };

  // 3. Anonymous Checkbox Toggle
  if (anonCheckbox && donatorNameInput) {
    anonCheckbox.addEventListener('change', (e) => {
      if (e.target.checked) {
        donatorNameInput.value = 'Hamba Allah';
        donatorNameInput.disabled = true;
      } else {
        donatorNameInput.value = '';
        donatorNameInput.disabled = false;
        donatorNameInput.focus();
      }
    });
  }

  // 4. Load Live Prayers from Backend API
  async function loadPrayers() {
    if (!prayersList) return;
    try {
      if (window.ACF_API && window.ACF_API.prayers) {
        const prayers = await window.ACF_API.prayers.getAll(15);
        if (Array.isArray(prayers) && prayers.length > 0) {
          prayersList.innerHTML = '';
          prayers.forEach(p => {
            const card = document.createElement('div');
            card.className = 'prayer-card';
            card.innerHTML = `
              <div class="prayer-header">
                <span class="prayer-name">${escapeHTML(p.name || 'Hamba Allah')}</span>
                <span class="prayer-time">${escapeHTML(p.timeDisplay || 'Baru saja')}</span>
              </div>
              <p class="prayer-text">"${escapeHTML(p.prayerText || '')}"</p>
            `;
            prayersList.appendChild(card);
          });
        }
      }
    } catch (err) {
      console.warn('Gagal memuat doa donatur dari API:', err);
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

  loadPrayers();

  // 5. Doa Form Submission
  if (doaForm && prayersList) {
    doaForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const prayerText = donatorPrayerInput ? donatorPrayerInput.value.trim() : '';
      if (!prayerText) {
        showToast('Mohon tuliskan doa atau harapan Anda.');
        if (donatorPrayerInput) donatorPrayerInput.focus();
        return;
      }

      let isAnon = anonCheckbox && anonCheckbox.checked;
      let name = donatorNameInput ? donatorNameInput.value.trim() : '';
      if (isAnon) {
        name = 'Hamba Allah';
      } else if (!name) {
        name = 'Orang Baik';
      }

      // Prepend prayer card to live stream
      const newPrayerCard = document.createElement('div');
      newPrayerCard.className = 'prayer-card';
      newPrayerCard.style.animation = 'fadeInUp 0.4s ease forwards';
      newPrayerCard.innerHTML = `
        <div class="prayer-header">
          <span class="prayer-name">${escapeHTML(name)}</span>
          <span class="prayer-time">Baru saja</span>
        </div>
        <p class="prayer-text">"${escapeHTML(prayerText)}"</p>
      `;

      prayersList.insertBefore(newPrayerCard, prayersList.firstChild);

      // Submit to MySQL API Backend
      try {
        if (window.ACF_API && window.ACF_API.prayers) {
          await window.ACF_API.prayers.create({
            name,
            isAnonymous: isAnon,
            prayerText
          });
        }
      } catch (err) {
        console.warn('Gagal menyimpan doa ke backend:', err);
      }

      // Reset form
      doaForm.reset();
      if (donatorNameInput) donatorNameInput.disabled = false;

      showToast('✓ Doa kebaikan Anda telah terkirim. Terima kasih!');
    });
  }
});
