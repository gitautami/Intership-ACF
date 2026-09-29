/**
 * ACF EDUHUB — Kerjasama & Kemitraan Interactions
 */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.kerjasama-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nama = form.querySelector('[name="nama"]')?.value || 'Mitra';
      alert(`Terima kasih Bapak/Ibu ${nama}. Formulir pengajuan kerjasama telah kami terima. Tim Kemitraan ACF Eduhub akan menghubungi Anda dalam waktu 1x24 jam.`);
      form.reset();
    });
  }
});
