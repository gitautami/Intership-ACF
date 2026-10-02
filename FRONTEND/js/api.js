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
    const timeoutId = setTimeout(() => controller.abort(), 1800);

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
            localStorage.setItem('acf_custom_categories', JSON.stringify(res.data));
            return res.data;
          }
          return [];
        } catch (err) {
          // Fallback to local storage
          const stored = localStorage.getItem('acf_custom_categories');
          return stored ? JSON.parse(stored) : [];
        }
      },

      async create(label, slug) {
        try {
          const res = await apiFetch('categories.php', {
            method: 'POST',
            body: JSON.stringify({ label, slug })
          });
          return res.data;
        } catch (err) {
          // Fallback
          const stored = JSON.parse(localStorage.getItem('acf_custom_categories') || '[]');
          const item = { label, slug: slug || label.toLowerCase().replace(/\s+/g, '-') };
          stored.push(item);
          localStorage.setItem('acf_custom_categories', JSON.stringify(stored));
          return item;
        }
      },

      async delete(slug) {
        try {
          await apiFetch(`categories.php?slug=${encodeURIComponent(slug)}`, {
            method: 'DELETE'
          });
        } catch (err) {
          const stored = JSON.parse(localStorage.getItem('acf_custom_categories') || '[]');
          const filtered = stored.filter(c => c.slug !== slug);
          localStorage.setItem('acf_custom_categories', JSON.stringify(filtered));
        }
        return { success: true };
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
            // Update local storage cache
            if (!params.search && !params.category && (!params.status || params.status === 'all')) {
              localStorage.setItem('acf_articles_data', JSON.stringify(res.data));
            }
            return res.data;
          }
          return [];
        } catch (err) {
          // Fallback to local storage
          const stored = localStorage.getItem('acf_articles_data');
          let list = stored ? JSON.parse(stored) : [];
          if (params.status && params.status !== 'all') {
            list = list.filter(a => (a.status || 'Terbit') === params.status);
          }
          if (params.category && params.category !== 'all') {
            list = list.filter(a => a.category === params.category);
          }
          if (params.search) {
            const kw = params.search.toLowerCase();
            list = list.filter(a => (a.title && a.title.toLowerCase().includes(kw)) || (a.excerpt && a.excerpt.toLowerCase().includes(kw)));
          }
          if (params.limit) {
            list = list.slice(params.offset || 0, (params.offset || 0) + params.limit);
          }
          return list;
        }
      },

      async getById(id) {
        try {
          const res = await apiFetch(`articles.php?id=${encodeURIComponent(id)}`, { method: 'GET' });
          return res.data;
        } catch (err) {
          const stored = JSON.parse(localStorage.getItem('acf_articles_data') || '[]');
          return stored.find(a => a.id === id) || null;
        }
      },

      async create(articleData) {
        try {
          const res = await apiFetch('articles.php', {
            method: 'POST',
            body: JSON.stringify(articleData)
          });
          // Sync local storage
          const stored = JSON.parse(localStorage.getItem('acf_articles_data') || '[]');
          stored.unshift(res.data);
          localStorage.setItem('acf_articles_data', JSON.stringify(stored));
          return res.data;
        } catch (err) {
          const stored = JSON.parse(localStorage.getItem('acf_articles_data') || '[]');
          const item = {
            id: articleData.id || 'ART-' + Date.now(),
            ...articleData
          };
          stored.unshift(item);
          localStorage.setItem('acf_articles_data', JSON.stringify(stored));
          return item;
        }
      },

      async update(id, articleData) {
        try {
          const res = await apiFetch(`articles.php?id=${encodeURIComponent(id)}`, {
            method: 'PUT',
            body: JSON.stringify({ id, ...articleData })
          });
          // Sync local storage
          const stored = JSON.parse(localStorage.getItem('acf_articles_data') || '[]');
          const idx = stored.findIndex(a => a.id === id);
          if (idx !== -1) {
            stored[idx] = { ...stored[idx], ...res.data };
            localStorage.setItem('acf_articles_data', JSON.stringify(stored));
          }
          return res.data;
        } catch (err) {
          const stored = JSON.parse(localStorage.getItem('acf_articles_data') || '[]');
          const idx = stored.findIndex(a => a.id === id);
          if (idx !== -1) {
            stored[idx] = { ...stored[idx], ...articleData };
            localStorage.setItem('acf_articles_data', JSON.stringify(stored));
          }
          return { id, ...articleData };
        }
      },

      async delete(id) {
        try {
          await apiFetch(`articles.php?id=${encodeURIComponent(id)}`, {
            method: 'DELETE'
          });
        } catch (err) {
          console.log('Fallback delete article');
        } finally {
          const stored = JSON.parse(localStorage.getItem('acf_articles_data') || '[]');
          const filtered = stored.filter(a => a.id !== id);
          localStorage.setItem('acf_articles_data', JSON.stringify(filtered));
        }
        return { success: true };
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
          const articles = JSON.parse(localStorage.getItem('acf_articles_data') || '[]');
          return {
            mitra: { total: 0, pending: 0 },
            relawan: { total: 0, pending: 0 },
            forms: { total: 0, pending: 0 },
            articles: { total: articles.length, published: articles.filter(a => (a.status || 'Terbit') === 'Terbit').length }
          };
        }
      }
    }
  };

  // Attach to global window object
  window.ACF_API = ACF_API;

})(typeof window !== 'undefined' ? window : this);
