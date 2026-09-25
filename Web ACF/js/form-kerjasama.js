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
      const jenisInstansi = document.getElementById('jenisInstansi')?.value || '';
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

      // Simpan ke database lokal Admin Dashboard
      try {
        const now = new Date();
        const timestampStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        const localList = JSON.parse(localStorage.getItem('acf_admin_data_mitra') || '[]');
        localList.unshift({
          id: 'MITRA-' + Date.now().toString().slice(-4),
          timestamp: timestampStr,
          namaInstansi,
          jenisInstansi,
          kotaInstansi,
          namaPIC,
          jabatanPIC,
          email: emailPIC,
          noWA,
          fokusProgram: selectedPrograms.join(', ') || '-',
          fokusKemitraan: selectedPrograms.join(', ') || '-',
          jenisKemitraan: jenisKemitraan || '-',
          estimasiWaktu: estimasiWaktu || '-',
          pesan: pesan || '-',
          status: 'Menunggu'
        });
        localStorage.setItem('acf_admin_data_mitra', JSON.stringify(localList));
      } catch (e) {
        console.warn('Gagal menyimpan ke admin local storage:', e);
      }

      // Kirim ke Google Sheets
      await kirimKeGoogleSheets(payloadMitra);

      // Construct WhatsApp message URL
      const waBtn = document.getElementById('modalWaBtnMitra');
      if (waBtn) {
        const text = encodeURIComponent(
          `Halo Tim Kemitraan ACF Eduhub,\n\n` +
          `Saya telah mengirimkan formulir kemitraan melalui website:\n` +
          `• *Instansi/Perusahaan*: ${namaInstansi}\n` +
          `• *Bentuk Lembaga*: ${jenisInstansi}\n` +
          `• *Kota*: ${kotaInstansi}\n` +
          `• *Nama PIC*: ${namaPIC} (${jabatanPIC})\n` +
          `• *No. WA*: ${noWA}\n` +
          `• *Email*: ${emailPIC}\n` +
          `• *Bentuk Dukungan*: ${jenisKemitraan}\n` +
          `• *Fokus Program*: ${selectedPrograms.join(', ') || '-'}\n` +
          `• *Estimasi Waktu*: ${estimasiWaktu}\n` +
          `• *Catatan*: ${pesan || '-'}\n\n` +
          `Mohon informasi lebih lanjut terkait tindak lanjut proposal kolaborasi ini. Terima kasih!`
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
      const profesi = document.getElementById('profesiRelawan')?.value || '';
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

      // Simpan ke database lokal Admin Dashboard
      try {
        const now = new Date();
        const timestampStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        const localList = JSON.parse(localStorage.getItem('acf_admin_data_relawan') || '[]');
        localList.unshift({
          id: 'REL-' + Date.now().toString().slice(-4),
          timestamp: timestampStr,
          namaLengkap,
          domisili,
          profesi,
          email,
          noWA,
          peranRelawan: selectedRoles.join(', ') || '-',
          komitmenWaktu,
          keahlianUtama: keahlianUtama || '-',
          motivasi: motivasi || '-',
          status: 'Menunggu'
        });
        localStorage.setItem('acf_admin_data_relawan', JSON.stringify(localList));
      } catch (e) {
        console.warn('Gagal menyimpan ke admin local storage:', e);
      }

      // Kirim ke Google Sheets
      await kirimKeGoogleSheets(payloadRelawan);

      // Construct WhatsApp message URL
      const waBtn = document.getElementById('modalWaBtnRelawan');
      if (waBtn) {
        const text = encodeURIComponent(
          `Halo Tim Sahabat Eduhub (ACF Eduhub),\n\n` +
          `Saya telah mendaftar sebagai relawan melalui website:\n` +
          `• *Nama*: ${namaLengkap}\n` +
          `• *Email*: ${email}\n` +
          `• *No. WA*: ${noWA}\n` +
          `• *Domisili*: ${domisili}\n` +
          `• *Profesi*: ${profesi}\n` +
          `• *Pilihan Peran*: ${selectedRoles.join(', ') || '-'}\n` +
          `• *Ketersediaan*: ${komitmenWaktu}\n` +
          `• *Keahlian*: ${keahlianUtama || '-'}\n` +
          `• *Motivasi Singkat*: ${motivasi || '-'}\n\n` +
          `Saya siap berkontribusi untuk kemajuan pendidikan anak Indonesia. Terima kasih!`
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

