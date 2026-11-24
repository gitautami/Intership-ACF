/**
 * ACF EDUHUB — IMAGE NORMALIZER ENGINE
 * Standar normalisasi, kompresi, dan penyesuaian dimensi otomatis
 * untuk seluruh fitur upload media (Cover Artikel, Foto Program, Foto Naskah, Logo Mitra).
 * 
 * Fitur:
 * 1. Auto Upscale (jika resolusi terlalu kecil, disempurnakan dengan bicubic smoothing)
 * 2. Auto Downscale & Compress (jika foto raksasa 4K/8MB dikompresi ke WebP/JPEG ringan ~150-250KB)
 * 3. Smart Center-Crop (untuk cover 16:9 / 16:10 tanpa merusak rasio/tanpa gepeng)
 * 4. Padded Contain (khusus Logo: tidak dicrop sama sekali, diletakkan di canvas seragam transparan)
 */

(function (window) {
  'use strict';

  const ACF_ImageNormalizer = {
    // Preset Standar ACF Eduhub
    PRESETS: {
      ARTICLE_COVER: {
        width: 1200,
        height: 675, // Aspek Rasio 16:9 HD
        quality: 0.84,
        format: 'image/webp',
        fallbackFormat: 'image/jpeg',
        mode: 'cover', // smart center-crop
        label: 'Sampul Berita / Kabar (16:9 HD)'
      },
      PROGRAM_COVER: {
        width: 800,
        height: 500, // Aspek Rasio 16:10
        quality: 0.84,
        format: 'image/webp',
        fallbackFormat: 'image/jpeg',
        mode: 'cover',
        label: 'Sampul Program Layanan (16:10)'
      },
      INLINE_IMAGE: {
        maxWidth: 1080,
        maxHeight: 1400,
        quality: 0.82,
        format: 'image/webp',
        fallbackFormat: 'image/jpeg',
        mode: 'contain_proportional',
        label: 'Foto Sisipan Naskah (Maks. 1080px)'
      },
      LOGO: {
        width: 400,
        height: 200, // Box 2:1 seragam untuk grid & slider
        paddingPercent: 0.12, // 12% padding di sekeliling logo
        quality: 0.92,
        format: 'image/png', // Pertahankan transparansi logo
        fallbackFormat: 'image/png',
        mode: 'pad_contain', // Tidak dipotong, di-contain dalam canvas transparan
        label: 'Logo Mitra / Kolaborasi'
      }
    },

    /**
     * Format angka bytes menjadi string yang ramah dibaca (KB / MB)
     */
    formatBytes(bytes) {
      if (!bytes || bytes <= 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    },

    /**
     * Membaca File/Blob/URL menjadi HTMLImageElement
     */
    loadImage(source) {
      return new Promise((resolve, reject) => {
        if (!source) {
          return reject(new Error('Sumber gambar tidak valid.'));
        }

        const img = new Image();
        img.crossOrigin = 'anonymous';

        let objectUrl = null;
        if (source instanceof Blob || source instanceof File) {
          objectUrl = URL.createObjectURL(source);
          img.src = objectUrl;
        } else if (typeof source === 'string') {
          img.src = source;
        } else {
          return reject(new Error('Tipe data sumber gambar tidak dikenali.'));
        }

        img.onload = () => {
          if (objectUrl) URL.revokeObjectURL(objectUrl);
          resolve(img);
        };

        img.onerror = (err) => {
          if (objectUrl) URL.revokeObjectURL(objectUrl);
          reject(new Error('Gagal memuat gambar: ' + (err?.message || 'File rusak atau bukan gambar')));
        };
      });
    },

    /**
     * Normalisasi Foto Sampul Berita (1200 x 675 px - Rasio 16:9)
     */
    async normalizeCover(source, options = {}) {
      const config = Object.assign({}, this.PRESETS.ARTICLE_COVER, options);
      return this._processImage(source, config);
    },

    /**
     * Normalisasi Foto Sampul Program & Layanan (800 x 500 px - Rasio 16:10)
     */
    async normalizeProgram(source, options = {}) {
      const config = Object.assign({}, this.PRESETS.PROGRAM_COVER, options);
      return this._processImage(source, config);
    },

    /**
     * Normalisasi Foto Sisipan Naskah (Lebar Maks. 1080 px, Proporsional)
     */
    async normalizeInline(source, options = {}) {
      const config = Object.assign({}, this.PRESETS.INLINE_IMAGE, options);
      return this._processImage(source, config);
    },

    /**
     * Normalisasi Logo Mitra / Instansi (400 x 200 px Transparan, Contain + Pad, Tanpa Crop)
     */
    async normalizeLogo(source, options = {}) {
      const config = Object.assign({}, this.PRESETS.LOGO, options);
      return this._processImage(source, config);
    },

    /**
     * Core Normalization Engine
     */
    async _processImage(source, config) {
      const img = await this.loadImage(source);
      const originalWidth = img.naturalWidth || img.width;
      const originalHeight = img.naturalHeight || img.height;
      const originalSize = (source instanceof Blob || source instanceof File) ? source.size : 0;
      const originalName = (source instanceof File) ? source.name : 'image.jpg';

      if (!originalWidth || !originalHeight) {
        throw new Error('Dimensi gambar tidak terdeteksi.');
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { alpha: true });

      // Aktifkan smoothing berkualitas tinggi untuk bicubic upscaling/downscaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      let targetWidth = config.width;
      let targetHeight = config.height;

      if (config.mode === 'cover') {
        // Mode 1: Smart Center-Crop (Mengisi penuh targetWidth x targetHeight tanpa distorsi)
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        // Hitung skala pengisian
        const scale = Math.max(targetWidth / originalWidth, targetHeight / originalHeight);
        const renderW = originalWidth * scale;
        const renderH = originalHeight * scale;
        const offsetX = (targetWidth - renderW) / 2;
        const offsetY = (targetHeight - renderH) / 2;

        // Isi latar belakang jika format non-transparan
        if (config.format === 'image/jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, targetWidth, targetHeight);
        }

        ctx.drawImage(img, offsetX, offsetY, renderW, renderH);

      } else if (config.mode === 'pad_contain') {
        // Mode 2: Padded Contain (Khusus Logo: Logo utuh diletakkan di tengah kanvas transparan)
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const padX = targetWidth * (config.paddingPercent || 0.12);
        const padY = targetHeight * (config.paddingPercent || 0.12);
        const availW = targetWidth - (padX * 2);
        const availH = targetHeight - (padY * 2);

        // Skala fit di dalam area aman
        const scale = Math.min(availW / originalWidth, availH / originalHeight);
        const renderW = originalWidth * scale;
        const renderH = originalHeight * scale;
        const offsetX = (targetWidth - renderW) / 2;
        const offsetY = (targetHeight - renderH) / 2;

        ctx.clearRect(0, 0, targetWidth, targetHeight);
        ctx.drawImage(img, offsetX, offsetY, renderW, renderH);

      } else {
        // Mode 3: Contain Proportional (Foto Naskah: pertahankan rasio alami, batasi lebar/tinggi maks)
        let renderW = originalWidth;
        let renderH = originalHeight;

        const maxW = config.maxWidth || 1080;
        const maxH = config.maxHeight || 1400;

        if (renderW > maxW || renderH > maxH) {
          const ratio = Math.min(maxW / renderW, maxH / renderH);
          renderW = Math.round(renderW * ratio);
          renderH = Math.round(renderH * ratio);
        } else if (renderW < 300) {
          // Auto upscale gambar yang kelewat kecil agar naskah tidak buram
          const upRatio = 300 / renderW;
          renderW = 300;
          renderH = Math.round(renderH * upRatio);
        }

        canvas.width = renderW;
        canvas.height = renderH;
        targetWidth = renderW;
        targetHeight = renderH;

        ctx.drawImage(img, 0, 0, renderW, renderH);
      }

      // Export hasil pemrosesan ke DataURL dan File/Blob
      let targetMime = config.format || 'image/webp';
      let dataUrl = '';
      try {
        dataUrl = canvas.toDataURL(targetMime, config.quality || 0.84);
      } catch (e) {
        // Fallback jika format webp tidak didukung
        targetMime = config.fallbackFormat || 'image/jpeg';
        dataUrl = canvas.toDataURL(targetMime, config.quality || 0.84);
      }

      const blob = await new Promise((resolve) => {
        canvas.toBlob((b) => resolve(b), targetMime, config.quality || 0.84);
      });

      // Tentukan nama file baru yang sesuai ekstensi output
      let ext = targetMime === 'image/webp' ? 'webp' : (targetMime === 'image/png' ? 'png' : 'jpg');
      const baseName = originalName.replace(/\.[^/.]+$/, '');
      const newFileName = `${baseName}_normalized.${ext}`;

      // Buat objek File baru yang siap dikirim via FormData ke backend
      const normalizedFile = new File([blob], newFileName, {
        type: targetMime,
        lastModified: Date.now()
      });

      const newSize = blob.size;
      const savingsPercent = originalSize > 0 
        ? Math.round(((originalSize - newSize) / originalSize) * 100) 
        : 0;

      return {
        file: normalizedFile,
        blob: blob,
        dataUrl: dataUrl,
        width: targetWidth,
        height: targetHeight,
        originalWidth: originalWidth,
        originalHeight: originalHeight,
        originalSize: originalSize,
        newSize: newSize,
        savingsPercent: savingsPercent,
        mime: targetMime,
        fileName: newFileName,
        infoText: `${targetWidth}×${targetHeight} px (${this.formatBytes(newSize)})`
      };
    }
  };

  window.ACF_ImageNormalizer = ACF_ImageNormalizer;
})(window);
