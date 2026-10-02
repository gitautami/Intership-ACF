/**
 * ACF EDUHUB — CENTRALIZED REST API CLIENT
 * Connects Frontend directly to MySQL Backend API with offline fallback
 */

(function (window) {
  'use strict';

  // Base API URL Resolver
  function resolveApiBaseUrl() {
    // 1. Check if user or environment defined custom API URL
    if (window.ACF_CUSTOM_API_URL) {
      return window.ACF_CUSTOM_API_URL;
    }

    const loc = window.location;

    // Jika dibuka lewat Live Server (port 5500, 5501, 3000, 5173, dsb) atau file://
    if ((loc.port && loc.port !== '80' && loc.port !== '443') || loc.protocol === 'file:') {
      return 'http://localhost/Intership-ACF/BACKEND/api';
    }

    // Jika berjalan di Laragon virtual host (*.test atau *.local)
    if (loc.hostname.endsWith('.test') || loc.hostname.endsWith('.local')) {
      return `${loc.origin}/BACKEND/api`;
    }

    // Jika berjalan di localhost port 80 / standard (XAMPP / Laragon)
    if (loc.hostname === 'localhost' || loc.hostname === '127.0.0.1') {
      const pathname = loc.pathname;
      const match = pathname.match(/^(.*?\/(?:Intership-ACF|intership-acf|acf))\//i);
      if (match) {
        return `${loc.origin}${match[1]}/BACKEND/api`;
      }
      if (pathname.includes('/FRONTEND/')) {
        return `${loc.origin}${pathname.split('/FRONTEND/')[0]}/BACKEND/api`;
      }
      return `${loc.origin}/Intership-ACF/BACKEND/api`;
    }

    // Default fallback relative path
    return '../../BACKEND/api';
  }

  const BASE_URL = resolveApiBaseUrl();

  /**
   * Generic Fetch Wrapper with JSON handling
   */
  async function apiFetch(endpoint, options = {}) {
    const url = `${BASE_URL}/${endpoint}`;
    const defaultHeaders = {
      'Accept': 'application/json'
    };

    if (!(options.body instanceof FormData)) {
      defaultHeaders['Content-Type'] = 'application/json';
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const config = {
      signal: options.signal || controller.signal,
      ...options,
      headers: {
        ...defaultHeaders,
        ...(options.headers || {})
      }
    };

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `HTTP Error ${response.status}`);
      }
      return data;
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn(`[ACF API Warning] Endpoint '${endpoint}' error:`, err.message);
      throw err;
    }
  }

  // ACF API Client Object
  const ACF_API = {
    BASE_URL,

    // ==========================================
    // 1. AUTHENTICATION
    // ==========================================
    auth: {
      async login(username, password) {
        try {
          const res = await apiFetch('auth.php?action=login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
          });
          if (res.success && res.data) {
            localStorage.setItem('acf_admin_auth', JSON.stringify(res.data));
          }
          return res;
        } catch (err) {
          // Local fallback check
          if (username === 'admin' && password === 'adminacf2026') {
            const fallbackUser = {
              authenticated: true,
              user: { username: 'admin', full_name: 'Administrator ACF (Offline Mode)', role: 'superadmin' }
            };
            localStorage.setItem('acf_admin_auth', JSON.stringify(fallbackUser));
            return { success: true, message: 'Login berhasil (Offline Mode)', data: fallbackUser };
          }
          throw err;
        }
      },

      async check() {
        try {
          return await apiFetch('auth.php?action=check', { method: 'GET' });
        } catch (err) {
          const cached = localStorage.getItem('acf_admin_auth');
          return {
            success: true,
            data: cached ? JSON.parse(cached) : { authenticated: false }
          };
        }
      },

      async logout() {
        try {
          await apiFetch('auth.php?action=logout', { method: 'POST' });
        } catch (err) {
          console.log('Logout API offline fallback');
        } finally {
          localStorage.removeItem('acf_admin_auth');
        }
        return { success: true, message: 'Logout berhasil' };
      }
    },

    // ==========================================
    // 2. CATEGORIES
    // ==========================================
    categories: {
      async getAll() {
        try {
          const res = await apiFetch('categories.php', { method: 'GET' });
          if (res.success && Array.isArray(res.data)) {
            return res.data;
          }
          return [];
        } catch (err) {
          console.error('Gagal mengambil kategori:', err);
          return [];
        }
      },

      async create(label, slug) {
        const res = await apiFetch('categories.php', {
          method: 'POST',
          body: JSON.stringify({ label, slug })
        });
        return res.data;
      },

      async delete(slug) {
        const res = await apiFetch(`categories.php?slug=${encodeURIComponent(slug)}`, {
          method: 'DELETE'
        });
        return res;
      }
    },

    // ==========================================
    // 3. ARTICLES (KABAR)
    // ==========================================
    articles: {
      async getAll(params = {}) {
        const q = new URLSearchParams();
        if (params.status) q.append('status', params.status);
        if (params.category) q.append('category', params.category);
        if (params.search) q.append('search', params.search);
        if (params.limit) q.append('limit', params.limit);
        if (params.offset) q.append('offset', params.offset);

        const qs = q.toString() ? `?${q.toString()}` : '';
        try {
          const res = await apiFetch(`articles.php${qs}`, { method: 'GET' });
          if (res.success && Array.isArray(res.data)) {
            return res.data;
          }
          return [];
        } catch (err) {
          console.error('Gagal mengambil artikel dari server:', err);
          return [];
        }
      },

      async getById(id) {
        const res = await apiFetch(`articles.php?id=${encodeURIComponent(id)}`, { method: 'GET' });
        return res.data;
      },

      async create(articleData) {
        const res = await apiFetch('articles.php', {
          method: 'POST',
          body: JSON.stringify(articleData)
        });
        return res.data;
      },

      async update(id, articleData) {
        const res = await apiFetch(`articles.php?id=${encodeURIComponent(id)}`, {
          method: 'PUT',
          body: JSON.stringify({ id, ...articleData })
        });
        return res.data;
      },

      async delete(id) {
        const res = await apiFetch(`articles.php?id=${encodeURIComponent(id)}`, {
          method: 'DELETE'
        });
        return res;
      },

      async uploadImage(file) {
        const formData = new FormData();
        formData.append('image', file);
        const res = await apiFetch('upload.php', {
          method: 'POST',
          body: formData
        });
        return res.data;
      }
    },

    // ==========================================
    // 4. MITRA (PARTNERSHIPS)
    // ==========================================
    mitra: {
      async getAll(params = {}) {
        const q = new URLSearchParams();
        if (params.status) q.append('status', params.status);
        if (params.search) q.append('search', params.search);

        const qs = q.toString() ? `?${q.toString()}` : '';
        try {
          const res = await apiFetch(`mitra.php${qs}`, { method: 'GET' });
          if (res.success && Array.isArray(res.data)) {
            return res.data;
          }
          return [];
        } catch (err) {
          console.error('Gagal mengambil data kemitraan dari server:', err);
          return [];
        }
      },

      async create(mitraData) {
        const res = await apiFetch('mitra.php', {
          method: 'POST',
          body: JSON.stringify(mitraData)
        });
        return res.data;
      },

      async updateStatus(id, status, catatanAdmin = '') {
        const res = await apiFetch(`mitra.php?id=${encodeURIComponent(id)}`, {
          method: 'PATCH',
          body: JSON.stringify({ id, status, catatanAdmin })
        });
        return res;
      },

      async delete(id) {
        const res = await apiFetch(`mitra.php?id=${encodeURIComponent(id)}`, {
          method: 'DELETE',
          body: JSON.stringify({ id })
        });
        return res;
      }
    },

    // ==========================================
    // 5. RELAWAN (SAHABAT EDUHUB)
    // ==========================================
    relawan: {
      async getAll(params = {}) {
        const q = new URLSearchParams();
        if (params.status) q.append('status', params.status);
        if (params.search) q.append('search', params.search);

        const qs = q.toString() ? `?${q.toString()}` : '';
        try {
          const res = await apiFetch(`relawan.php${qs}`, { method: 'GET' });
          if (res.success && Array.isArray(res.data)) {
            return res.data;
          }
          return [];
        } catch (err) {
          console.error('Gagal mengambil data relawan dari server:', err);
          return [];
        }
      },

      async create(relawanData) {
        const res = await apiFetch('relawan.php', {
          method: 'POST',
          body: JSON.stringify(relawanData)
        });
        return res.data;
      },

      async updateStatus(id, status, catatanAdmin = '') {
        const res = await apiFetch(`relawan.php?id=${encodeURIComponent(id)}`, {
          method: 'PATCH',
          body: JSON.stringify({ id, status, catatanAdmin })
        });
        return res;
      },

      async delete(id) {
        const res = await apiFetch(`relawan.php?id=${encodeURIComponent(id)}`, {
          method: 'DELETE',
          body: JSON.stringify({ id })
        });
        return res;
      }
    },

    // ==========================================
    // 6. DONATION PRAYERS
    // ==========================================
    prayers: {
      async getAll(limit = 20) {
        try {
          const res = await apiFetch(`prayers.php?limit=${limit}`, { method: 'GET' });
          return res.success ? res.data : [];
        } catch (err) {
          return [];
        }
      },

      async create(prayerData) {
        try {
          const res = await apiFetch('prayers.php', {
            method: 'POST',
            body: JSON.stringify(prayerData)
          });
          return res.data;
        } catch (err) {
          return {
            id: Date.now(),
            name: prayerData.isAnonymous ? 'Hamba Allah' : (prayerData.name || 'Hamba Allah'),
            prayerText: prayerData.prayerText,
            timeDisplay: 'Baru saja'
          };
        }
      }
    },

    // ==========================================
    // 7. STATS & METRICS
    // ==========================================
    stats: {
      async get() {
        try {
          const res = await apiFetch('stats.php', { method: 'GET' });
          return res.data;
        } catch (err) {
          return {
            mitra: { total: 0, pending: 0 },
            relawan: { total: 0, pending: 0 },
            forms: { total: 0, pending: 0 },
            articles: { total: 0, published: 0 }
          };
        }
      }
    }
  };

  // Attach to global window object
  window.ACF_API = ACF_API;

})(typeof window !== 'undefined' ? window : this);
