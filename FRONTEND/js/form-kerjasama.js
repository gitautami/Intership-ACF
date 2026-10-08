/**
 * ACF EDUHUB — Form Kerjasama & Relawan Handler Script
 * Terintegrasi Otomatis ke Google Spreadsheet & WhatsApp
 */

// ==============================================================================
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyBPKjNYHI1M3NifBOQJnH2Rjt_HUzxyZroYxLb2iPt7XMp72leWUjVtDACrqlxfadT/exec';

document.addEventListener('DOMContentLoaded', () => {

  // Helper untuk mengirim data ke Google Sheets
  async function kirimKeGoogleSheets(formDataObj) {
    if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes('CONTOH_GANTI') || GOOGLE_SCRIPT_URL.trim() === '') {
      console.warn('URL Google Apps Script belum dikonfigurasi.');
      return;
    }

    try {
      const urlParams = new URLSearchParams();
      const formData = new FormData();
      for (const key in formDataObj) {
        urlParams.append(key, formDataObj[key]);
        formData.append(key, formDataObj[key]);
      }

      // Kirim via POST & URL query param agar data pasti terbaca oleh Apps Script
      const targetUrl = GOOGLE_SCRIPT_URL + '?' + urlParams.toString();
      await fetch(targetUrl, {
        method: 'POST',
        body: formData,
        mode: 'no-cors'
      });
      console.log('Data berhasil dikirim ke Google Spreadsheet!');
    } catch (err) {
      console.error('Gagal mengirim ke Google Spreadsheet:', err);
    }
  }

  // ----------------------------------------------------------------------------
  // ----------------------------------------------------------------------------
  // 1. Dynamic Toggle untuk Opsi "Lainnya"
  // ----------------------------------------------------------------------------
  const jenisInstansiSelect = document.getElementById('jenisInstansi');
  const jenisInstansiLainnyaWrapper = document.getElementById('jenisInstansiLainnyaWrapper');
  const jenisInstansiLainnyaInput = document.getElementById('jenisInstansiLainnya');

  if (jenisInstansiSelect && jenisInstansiLainnyaWrapper) {
    jenisInstansiSelect.addEventListener('change', () => {
      const val = jenisInstansiSelect.value;
      if (val === 'Komunitas / Lainnya' || val.toLowerCase().includes('lainnya')) {
        jenisInstansiLainnyaWrapper.style.display = 'block';
        if (jenisInstansiLainnyaInput) {
          jenisInstansiLainnyaInput.required = true;
          jenisInstansiLainnyaInput.focus();
        }
      } else {
        jenisInstansiLainnyaWrapper.style.display = 'none';
        if (jenisInstansiLainnyaInput) {
          jenisInstansiLainnyaInput.required = false;
          jenisInstansiLainnyaInput.value = '';
        }
      }
    });
  }

  const profesiSelect = document.getElementById('profesiRelawan');
  const profesiLainnyaWrapper = document.getElementById('profesiRelawanLainnyaWrapper');
  const profesiLainnyaInput = document.getElementById('profesiRelawanLainnya');

  if (profesiSelect && profesiLainnyaWrapper) {
    profesiSelect.addEventListener('change', () => {
      const val = profesiSelect.value;
      if (val === 'Lainnya' || val.toLowerCase().includes('lainnya')) {
        profesiLainnyaWrapper.style.display = 'block';
        if (profesiLainnyaInput) {
          profesiLainnyaInput.required = true;
          profesiLainnyaInput.focus();
        }
      } else {
        profesiLainnyaWrapper.style.display = 'none';
        if (profesiLainnyaInput) {
          profesiLainnyaInput.required = false;
          profesiLainnyaInput.value = '';
        }
      }
    });
  }

  // ----------------------------------------------------------------------------
  // 2. Handle Form Mitra Program
  // ----------------------------------------------------------------------------
  const formMitra = document.getElementById('formMitraProgram');
  const modalMitra = document.getElementById('modalSuksesMitra');

  if (formMitra) {
    formMitra.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = formMitra.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>Menyimpan data...</span>`;
      }

      // Collect data
      const namaInstansi = document.getElementById('namaInstansi')?.value.trim() || '';
      let jenisInstansi = document.getElementById('jenisInstansi')?.value || '';
      const jenisInstansiLainnya = document.getElementById('jenisInstansiLainnya')?.value.trim() || '';
      if ((jenisInstansi === 'Komunitas / Lainnya' || jenisInstansi.toLowerCase().includes('lainnya')) && jenisInstansiLainnya) {
        jenisInstansi = `Lainnya (${jenisInstansiLainnya})`;
      }

      const kotaInstansi = document.getElementById('kotaInstansi')?.value.trim() || '';
      const namaPIC = document.getElementById('namaPIC')?.value.trim() || '';
      const jabatanPIC = document.getElementById('jabatanPIC')?.value.trim() || '';
      const emailPIC = document.getElementById('emailPIC')?.value.trim() || '';
      const noWA = document.getElementById('noWA')?.value.trim() || '';
      const jenisKemitraan = document.getElementById('jenisKemitraan')?.value || '';
      const estimasiWaktu = document.getElementById('estimasiWaktu')?.value || '';
      const pesan = document.getElementById('pesanKemitraan')?.value.trim() || '';

      // Selected programs
      const selectedPrograms = [];
      document.querySelectorAll('input[name="fokusProgram"]:checked').forEach(cb => {
        selectedPrograms.push(cb.value);
      });

      // Data payload untuk Spreadsheet
      const payloadMitra = {
        formType: 'Mitra Program',
        namaInstansi,
        jenisInstansi,
        kotaInstansi,
        namaPIC,
        jabatanPIC,
        emailPIC,
        noWA,
        fokusProgram: selectedPrograms.join(', ') || '-',
        jenisKemitraan,
        estimasiWaktu,
        pesan: pesan || '-'
      };

      // Simpan ke database MySQL Backend
      try {
        if (window.ACF_API && window.ACF_API.mitra) {
          await window.ACF_API.mitra.create({
            namaInstansi,
            jenisInstansi,
            kotaInstansi,
            namaPIC,
            jabatanPIC,
            email: emailPIC,
            noWA,
            fokusProgram: selectedPrograms.join(', ') || '-',
            jenisKemitraan: jenisKemitraan || '-',
            estimasiWaktu: estimasiWaktu || '-',
            pesan: pesan || '-'
          });
        }
      } catch (e) {
        console.warn('Gagal menyimpan ke admin database:', e);
      }

      // Kirim ke Google Sheets
      await kirimKeGoogleSheets(payloadMitra);

      // Tanggal Submit Real-time
      const tanggalSubmit = new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date()).replace(/\./g, ':') + ' WIB';

      // Construct WhatsApp message URL
      const waBtn = document.getElementById('modalWaBtnMitra');
      if (waBtn) {
        const programMitraText = selectedPrograms.length > 0 ? selectedPrograms.join(', ') : (jenisKemitraan || 'Mitra Program');
        const text = encodeURIComponent(
          `Halo Tim Kemitraan ACF Eduhub,\n\n` +
          `Saya telah mengirimkan formulir kemitraan di website:\n` +
          `• *Tanggal Submit*: ${tanggalSubmit}\n` +
          `• *Atas Nama*: ${namaPIC} (${namaInstansi})\n` +
          `• *Sebagai Mitra Program*: ${programMitraText}\n\n` +
          `Mohon konfirmasi dan informasi langkah selanjutnya. Terima kasih!`
        );
        waBtn.href = `https://wa.me/6285179797661?text=${text}`;
      }

      // Reset button & Show Modal
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }

      if (modalMitra) {
        modalMitra.classList.add('active');
      }

      formMitra.reset();
      if (jenisInstansiLainnyaWrapper) {
        jenisInstansiLainnyaWrapper.style.display = 'none';
      }
    });
  }

  // ----------------------------------------------------------------------------
  // 3. Handle Form Relawan (Sahabat Eduhub)
  // ----------------------------------------------------------------------------
  const formRelawan = document.getElementById('formRelawanEduhub');
  const modalRelawan = document.getElementById('modalSuksesRelawan');

  if (formRelawan) {
    formRelawan.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = formRelawan.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>Menyimpan pendaftaran...</span>`;
      }

      // Collect data
      const namaLengkap = document.getElementById('namaRelawan')?.value.trim() || '';
      const email = document.getElementById('emailRelawan')?.value.trim() || '';
      const noWA = document.getElementById('noWARelawan')?.value.trim() || '';
      const domisili = document.getElementById('domisiliRelawan')?.value.trim() || '';
      let profesi = document.getElementById('profesiRelawan')?.value || '';
      const profesiLainnya = document.getElementById('profesiRelawanLainnya')?.value.trim() || '';
      if ((profesi === 'Lainnya' || profesi.toLowerCase().includes('lainnya')) && profesiLainnya) {
        profesi = `Lainnya (${profesiLainnya})`;
      }

      const komitmenWaktu = document.getElementById('komitmenWaktu')?.value || '';
      const keahlianUtama = document.getElementById('keahlianUtama')?.value.trim() || '';
      const motivasi = document.getElementById('motivasiRelawan')?.value.trim() || '';

      // Selected roles
      const selectedRoles = [];
      document.querySelectorAll('input[name="peranRelawan"]:checked').forEach(cb => {
        selectedRoles.push(cb.value);
      });

      // Data payload untuk Spreadsheet
      const payloadRelawan = {
        formType: 'Relawan',
        namaRelawan: namaLengkap,
        namaLengkap,
        email,
        emailRelawan: email,
        noWA,
        noWARelawan: noWA,
        domisili,
        domisiliRelawan: domisili,
        profesi,
        profesiRelawan: profesi,
        peranRelawan: selectedRoles.join(', ') || '-',
        komitmenWaktu,
        keahlianUtama: keahlianUtama || '-',
        motivasi: motivasi || '-'
      };

      // Simpan ke database MySQL Backend
      try {
        if (window.ACF_API && window.ACF_API.relawan) {
          await window.ACF_API.relawan.create({
            namaLengkap,
            domisili,
            profesi,
            email,
            noWA,
            peranRelawan: selectedRoles.join(', ') || '-',
            komitmenWaktu,
            keahlianUtama: keahlianUtama || '-',
            motivasi: motivasi || '-'
          });
        }
      } catch (e) {
        console.warn('Gagal menyimpan ke admin database:', e);
      }

      // Kirim ke Google Sheets
      await kirimKeGoogleSheets(payloadRelawan);

      // Tanggal Submit Real-time
      const tanggalSubmit = new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date()).replace(/\./g, ':') + ' WIB';

      // Construct WhatsApp message URL
      const waBtn = document.getElementById('modalWaBtnRelawan');
      if (waBtn) {
        const peranRelawanText = selectedRoles.length > 0 ? selectedRoles.join(', ') : 'Sahabat Eduhub';
        const text = encodeURIComponent(
          `Halo Tim Sahabat Eduhub (ACF Eduhub),\n\n` +
          `Saya telah mengirimkan formulir pendaftaran relawan di website:\n` +
          `• *Tanggal Submit*: ${tanggalSubmit}\n` +
          `• *Atas Nama*: ${namaLengkap}\n` +
          `• *Sebagai Relawan*: ${peranRelawanText}\n\n` +
          `Mohon konfirmasi dan informasi langkah selanjutnya. Terima kasih!`
        );
        waBtn.href = `https://wa.me/6285179797661?text=${text}`;
      }

      // Reset button & Show Modal
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }

      if (modalRelawan) {
        modalRelawan.classList.add('active');
      }

      formRelawan.reset();
      if (profesiLainnyaWrapper) {
        profesiLainnyaWrapper.style.display = 'none';
      }
    });
  }

  // ----------------------------------------------------------------------------
  // 4. Modal Close Helper
  // ----------------------------------------------------------------------------
  window.closeModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
    }
  };

  // Close modal when clicking outside
  document.querySelectorAll('.success-modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
      }
    });
  });
});

