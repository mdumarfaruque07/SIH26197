import axios from 'axios';
import { FALLBACK_PLACES, FALLBACK_PRODUCTS } from '../data/fallbackData';

export const getApiBaseUrl = () => {
  const custom = localStorage.getItem('sih_custom_api_url');
  if (custom && custom.trim()) {
    const clean = custom.trim().replace(/\/$/, '');
    return clean.endsWith('/api') ? clean : `${clean}/api`;
  }

  // If running inside Capacitor native Android APK
  const isCapacitor =
    typeof window !== 'undefined' &&
    window.Capacitor &&
    typeof window.Capacitor.isNativePlatform === 'function' &&
    window.Capacitor.isNativePlatform();

  if (isCapacitor) {
    return 'http://10.168.182.153:5000/api';
  }

  // If accessed directly on mobile browser via computer IP (e.g. http://10.168.182.153:5173)
  if (
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
  ) {
    return `http://${window.location.hostname}:5000/api`;
  }

  return '/api';
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 8000,
});

// Update baseURL dynamically if custom URL changed
export const updateApiBaseUrl = (newUrl) => {
  if (newUrl) {
    const clean = newUrl.trim().replace(/\/$/, '');
    const full = clean.endsWith('/api') ? clean : `${clean}/api`;
    localStorage.setItem('sih_custom_api_url', clean);
    api.defaults.baseURL = full;
  } else {
    localStorage.removeItem('sih_custom_api_url');
    api.defaults.baseURL = getApiBaseUrl();
  }
};

export const checkServerHealth = async (customUrl = null) => {
  const base = customUrl
    ? customUrl.trim().replace(/\/$/, '').replace(/\/api$/, '')
    : api.defaults.baseURL.replace(/\/api$/, '');
  try {
    const res = await axios.get(`${base}/api/health`, { timeout: 4000 });
    return { ok: true, data: res.data };
  } catch (err) {
    return { ok: false, error: err.message || 'Cannot connect to backend server' };
  }
};

// Auto attach JWT token to all requests if present in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sih_heritage_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const placeService = {
  getAll: async (params) => {
    try {
      const res = await api.get('/places', { params });
      return res.data;
    } catch (err) {
      console.warn('Backend /places failed, using cached fallback heritage places:', err.message);
      let list = [...FALLBACK_PLACES];
      if (params?.category && params.category !== 'all') {
        list = list.filter((p) => p.category === params.category);
      }
      if (params?.search) {
        const q = params.search.toLowerCase();
        list = list.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.state.toLowerCase().includes(q) ||
            p.shortDescription.toLowerCase().includes(q)
        );
      }
      return { success: true, count: list.length, places: list, isOfflineFallback: true };
    }
  },
  getNearby: async (lat, lng, radius) => {
    try {
      const res = await api.get('/places/nearby', { params: { lat, lng, radius } });
      return res.data;
    } catch (err) {
      console.warn('Backend /places/nearby failed, calculating client-side distances:', err.message);
      // Calculate haversine distance client-side
      const toRad = (v) => (v * Math.PI) / 180;
      const sorted = [...FALLBACK_PLACES]
        .map((p) => {
          const R = 6371; // km
          const dLat = toRad(p.latitude - lat);
          const dLon = toRad(p.longitude - lng);
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat)) * Math.cos(toRad(p.latitude)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const distance = Math.round(R * c);
          return { ...p, distance };
        })
        .sort((a, b) => a.distance - b.distance);

      return { success: true, count: sorted.length, places: sorted, isOfflineFallback: true };
    }
  },
  getBySlug: async (slug) => {
    try {
      const res = await api.get(`/places/${slug}`);
      return res.data;
    } catch (err) {
      console.warn(`Backend /places/${slug} failed, checking fallback data:`, err.message);
      const place = FALLBACK_PLACES.find((p) => p.slug === slug);
      if (place) {
        return { success: true, place, isOfflineFallback: true };
      }
      throw err;
    }
  },
  toggleBookmark: (placeId) => api.post('/places/bookmark', { placeId }).then((res) => res.data),
  getBookmarks: () => api.get('/places/user/bookmarks').then((res) => res.data),
  toggleVisited: (placeId) =>
    api.patch(`/places/user/bookmarks/${placeId}/toggle-visited`).then((res) => res.data),
};

export const postService = {
  getFeed: async () => {
    try {
      const res = await api.get('/posts/feed');
      return res.data;
    } catch (err) {
      console.warn('Backend /posts/feed failed:', err.message);
      return { success: true, count: 0, posts: [], isOfflineFallback: true };
    }
  },
  create: (formData) =>
    api
      .post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data),
  delete: (id) => api.delete(`/posts/${id}`).then((res) => res.data),
};

export const authService = {
  login: (data) => api.post('/auth/login', data).then((res) => res.data),
  register: (data) => api.post('/auth/register', data).then((res) => res.data),
  getMe: () => api.get('/auth/me').then((res) => res.data),
};

export const adminService = {
  getStats: () => api.get('/admin/stats').then((res) => res.data),
  createPlace: (formData) =>
    api
      .post('/admin/places', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data),
  updatePlace: (id, formData) =>
    api
      .put(`/admin/places/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data),
  deletePlace: (id) => api.delete(`/admin/places/${id}`).then((res) => res.data),
  aiDiscover: (data) => api.post('/admin/ai-discover', data).then((res) => res.data),
};

export const productService = {
  getAll: async (params) => {
    try {
      const res = await api.get('/products', { params });
      // Merge with locally added artisan products if any
      const localProducts = JSON.parse(localStorage.getItem('sih_custom_products') || '[]');
      let combined = [...localProducts, ...(res.data.products || [])];
      return { success: true, count: combined.length, products: combined };
    } catch (err) {
      console.warn('Backend /products failed, using fallback ODOP products:', err.message);
      const localProducts = JSON.parse(localStorage.getItem('sih_custom_products') || '[]');
      let list = [...localProducts, ...FALLBACK_PRODUCTS];
      if (params?.category && params.category !== 'all') {
        list = list.filter((p) => p.category === params.category);
      }
      if (params?.search) {
        const q = params.search.toLowerCase();
        list = list.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.odopTag?.toLowerCase().includes(q) ||
            p.artisanName?.toLowerCase().includes(q)
        );
      }
      return { success: true, count: list.length, products: list, isOfflineFallback: true };
    }
  },
  getByPlace: async (placeId) => {
    try {
      const res = await api.get(`/products/place/${placeId}`);
      const localProducts = JSON.parse(localStorage.getItem('sih_custom_products') || '[]').filter(
        (p) => p.placeId === Number(placeId)
      );
      const combined = [...localProducts, ...(res.data.products || [])];
      return { success: true, products: combined };
    } catch (err) {
      const localProducts = JSON.parse(localStorage.getItem('sih_custom_products') || '[]').filter(
        (p) => p.placeId === Number(placeId)
      );
      const list = [...localProducts, ...FALLBACK_PRODUCTS.filter((p) => p.placeId === Number(placeId))];
      return { success: true, count: list.length, products: list, isOfflineFallback: true };
    }
  },
  getById: async (id) => {
    try {
      const res = await api.get(`/products/${id}`);
      return res.data;
    } catch (err) {
      const localProducts = JSON.parse(localStorage.getItem('sih_custom_products') || '[]');
      const product = [...localProducts, ...FALLBACK_PRODUCTS].find((p) => p.id === Number(id));
      if (product) return { success: true, product, isOfflineFallback: true };
      throw err;
    }
  },
  create: async (data) => {
    try {
      const res = await api.post('/products', data);
      return res.data;
    } catch (err) {
      console.warn('Backend POST /products failed, persisting to local artisan store:', err.message);
      const localProducts = JSON.parse(localStorage.getItem('sih_custom_products') || '[]');
      const newProduct = {
        id: Date.now(),
        ...data,
        price: parseFloat(data.price),
        placeId: parseInt(data.placeId),
        rating: 5.0,
        createdAt: new Date().toISOString(),
      };
      localProducts.unshift(newProduct);
      localStorage.setItem('sih_custom_products', JSON.stringify(localProducts));
      return { success: true, product: newProduct, isOfflineFallback: true };
    }
  },
};

export default api;
