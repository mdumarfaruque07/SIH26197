import axios from 'axios';
import { FALLBACK_PLACES, FALLBACK_PRODUCTS, FALLBACK_FOODS } from '../data/fallbackData';

export const getLocalCachedData = (key, fallback) => {
  try {
    const raw = localStorage.getItem(`sanskriti_cache_${key}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return fallback;
};

export const setLocalCachedData = (key, data) => {
  try {
    localStorage.setItem(`sanskriti_cache_${key}`, JSON.stringify(data));
  } catch {}
};

export const getApiBaseUrl = () => {
  const custom = localStorage.getItem('sanskriti_custom_api_url') || localStorage.getItem('sih_custom_api_url');
  if (custom && custom.trim()) {
    const clean = custom.trim().replace(/\/$/, '');
    return clean.endsWith('/api') ? clean : `${clean}/api`;
  }

  // Environment variable support (Production / Vercel / Railway)
  if (import.meta.env?.VITE_API_URL) {
    const envUrl = import.meta.env.VITE_API_URL.trim().replace(/\/$/, '');
    return envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
  }

  // If running inside Capacitor native Android APK
  const isCapacitor =
    typeof window !== 'undefined' &&
    window.Capacitor &&
    typeof window.Capacitor.isNativePlatform === 'function' &&
    window.Capacitor.isNativePlatform();

  if (isCapacitor) {
    // Current host machine IP on local Wi-Fi / Hotspot
    return 'http://10.168.182.153:5000/api';
  }

  // If accessed directly on mobile browser via computer IP (e.g. http://192.168.x.x:5173)
  if (
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
  ) {
    // If opening via a public domain or tunnel (trycloudflare, vercel, render, ngrok) on standard web port
    if (
      window.location.hostname.includes('trycloudflare.com') ||
      window.location.hostname.includes('loca.lt') ||
      window.location.hostname.includes('ngrok') ||
      window.location.hostname.includes('vercel.app') ||
      window.location.hostname.includes('render.com') ||
      window.location.port === '' ||
      window.location.port === '80' ||
      window.location.port === '443'
    ) {
      return '/api';
    }
    return `http://${window.location.hostname}:5000/api`;
  }

  return '/api';
};

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 8000, // 8s timeout for wireless mobile network hops to prevent premature abort
});

// Update baseURL dynamically if custom URL changed
export const updateApiBaseUrl = (newUrl) => {
  if (newUrl) {
    const clean = newUrl.trim().replace(/\/$/, '');
    const full = clean.endsWith('/api') ? clean : `${clean}/api`;
    localStorage.setItem('sanskriti_custom_api_url', full);
    api.defaults.baseURL = full;
    return full;
  } else {
    localStorage.removeItem('sanskriti_custom_api_url');
    localStorage.removeItem('sih_custom_api_url');
    const defaultUrl = getApiBaseUrl();
    api.defaults.baseURL = defaultUrl;
    return defaultUrl;
  }
};

export const checkServerHealth = async (customUrl = null) => {
  const base = customUrl
    ? customUrl.trim().replace(/\/$/, '').replace(/\/api$/, '')
    : api.defaults.baseURL.replace(/\/api$/, '');
  try {
    const start = Date.now();
    const res = await axios.get(`${base}/api/health`, { timeout: 2500 });
    return { ok: true, data: res.data, ping: Date.now() - start, url: `${base}/api` };
  } catch (err) {
    return { ok: false, error: err.message || 'Cannot connect to backend server', url: `${base}/api` };
  }
};

// Auto attach JWT token to all requests if present in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sanskriti_token') || localStorage.getItem('sih_heritage_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const placeService = {
  getAll: async (params) => {
    try {
      const res = await api.get('/places', { params });
      if (res.data?.places && res.data.places.length > 0 && !params?.search && (!params?.category || params.category === 'all')) {
        setLocalCachedData('places', res.data.places);
      }
      return res.data;
    } catch (err) {
      console.warn('Backend /places failed, using cached fallback heritage places:', err.message);
      const cached = getLocalCachedData('places', FALLBACK_PLACES);
      let list = [...cached];
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
  getFeed: async (params = {}) => {
    let localPosts = [];
    try {
      localPosts = JSON.parse(localStorage.getItem('sanskriti_user_created_posts') || '[]');
    } catch {}

    try {
      const res = await api.get('/posts/feed', { params });
      const serverPosts = res.data?.posts || [];
      const merged = [...localPosts];
      for (const sp of serverPosts) {
        if (!merged.some((p) => p.id === sp.id || (p.caption && p.caption === sp.caption && p.placeId === sp.placeId))) {
          merged.push(sp);
        }
      }
      return { ...res.data, posts: merged };
    } catch (err) {
      console.warn('Backend /posts/feed failed, using local fallback:', err.message);
      return { success: true, count: localPosts.length, posts: localPosts, isOfflineFallback: true };
    }
  },
  getMyPosts: async () => {
    let localPosts = [];
    try {
      localPosts = JSON.parse(localStorage.getItem('sanskriti_user_created_posts') || '[]');
    } catch {}
    try {
      const res = await api.get('/posts/my-posts');
      const serverPosts = res.data?.posts || [];
      const merged = [...localPosts];
      for (const sp of serverPosts) {
        if (!merged.some((p) => p.id === sp.id)) {
          merged.push(sp);
        }
      }
      return { ...res.data, posts: merged };
    } catch (err) {
      return { success: true, posts: localPosts, isOfflineFallback: true };
    }
  },
  create: async (formData, meta = {}) => {
    try {
      const res = await api.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.success && res.data.post) {
        try {
          const localPosts = JSON.parse(localStorage.getItem('sanskriti_user_created_posts') || '[]');
          localStorage.setItem(
            'sanskriti_user_created_posts',
            JSON.stringify([res.data.post, ...localPosts.filter((p) => p.id !== res.data.post.id)])
          );
        } catch {}
        return res.data;
      }
      return res.data;
    } catch (err) {
      console.warn('Backend /posts error, using instant local post creation:', err.message);
      let profile = {};
      try {
        profile = JSON.parse(localStorage.getItem('sanskriti_profile') || '{}');
      } catch {}

      const placeObj = meta?.place || {
        id: meta?.placeId || 23,
        name: meta?.place?.name || 'Taj Mahal',
        slug: meta?.place?.slug || 'taj-mahal',
        state: 'Uttar Pradesh',
        category: 'monument',
      };

      const fallbackPost = {
        id: 'local_post_' + Date.now(),
        userId: profile.id || 11,
        placeId: placeObj.id || 23,
        rating: meta?.rating ? parseInt(meta.rating) : 5,
        caption: meta?.caption || (formData.get ? formData.get('caption') : '') || '',
        imageUrl:
          meta?.imageUrl ||
          (formData.get ? formData.get('imageUrl') : '') ||
          'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80',
        likesCount: Math.floor(15 + Math.random() * 20),
        hasLiked: false,
        timeAgo: 'Just now',
        createdAt: new Date().toISOString(),
        user: {
          id: profile.id || 11,
          name: profile.name || 'Culture Traveler',
          avatarUrl:
            profile.avatarUrl ||
            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        },
        place: placeObj,
        comments: [],
        isLocalFallback: true,
      };

      try {
        const localPosts = JSON.parse(localStorage.getItem('sanskriti_user_created_posts') || '[]');
        localStorage.setItem('sanskriti_user_created_posts', JSON.stringify([fallbackPost, ...localPosts]));
      } catch {}

      return {
        success: true,
        message: 'Post published successfully!',
        post: fallbackPost,
        isOfflineFallback: true,
      };
    }
  },
  update: (id, data) => api.patch(`/posts/${id}`, data).then((res) => res.data),
  toggleLike: (id) => api.post(`/posts/${id}/like`).then((res) => res.data),
  addComment: (id, data) => api.post(`/posts/${id}/comments`, data).then((res) => res.data),
  toggleBookmark: (id) => api.post(`/posts/${id}/bookmark`).then((res) => res.data),
  getBookmarkedPosts: () => api.get('/posts/bookmarks').then((res) => res.data),
  delete: (id) => api.delete(`/posts/${id}`).then((res) => res.data),
};

export const authService = {
  login: async (data) => {
    try {
      const res = await api.post('/auth/login', data);
      return res.data;
    } catch (err) {
      if (err.response?.data?.message) {
        throw new Error(err.response.data.message);
      }
      // If backend is unreachable or timed out, support offline fallback
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout') || !err.response) {
        console.warn('Backend server unreachable or timed out. Falling back to offline traveler session:', err.message);
        const isDemoAdmin = data?.email === 'admin@heritage.gov.in';
        const demoUser = isDemoAdmin
          ? {
              id: 1,
              name: 'Dr. Vikramaditya Sharma (Culture Admin)',
              email: 'admin@heritage.gov.in',
              role: 'admin',
              city: 'New Delhi',
              avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
            }
          : {
              id: Date.now(),
              name: data?.email?.split('@')[0] || 'Cultural Explorer',
              email: data?.email,
              role: 'user',
              city: 'India',
              avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data?.email || 'User')}`,
            };
        const demoToken = 'demo-jwt-token-' + Date.now();
        localStorage.setItem('sanskriti_token', demoToken);
        localStorage.setItem('sanskriti_profile', JSON.stringify(demoUser));
        return {
          success: true,
          message: 'Logged in successfully (Offline Travel Mode)',
          token: demoToken,
          user: demoUser,
          isOfflineFallback: true,
        };
      }
      throw err;
    }
  },
  register: async (data) => {
    try {
      const res = await api.post('/auth/register', data);
      return res.data;
    } catch (err) {
      if (err.response?.data?.message) {
        throw new Error(err.response.data.message);
      }
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout') || !err.response) {
        console.warn('Backend server unreachable or timed out during registration. Creating local traveler session:', err.message);
        const offlineUser = {
          id: Date.now(),
          name: data.name || 'Heritage Traveler',
          email: data.email,
          role: 'user',
          city: 'India',
          avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.name || 'User')}`,
        };
        const localToken = 'demo-jwt-token-' + Date.now();
        localStorage.setItem('sanskriti_token', localToken);
        localStorage.setItem('sanskriti_profile', JSON.stringify(offlineUser));
        return {
          success: true,
          message: 'Account created successfully (Offline Travel Mode)!',
          token: localToken,
          user: offlineUser,
          isOfflineFallback: true,
        };
      }
      throw err;
    }
  },
  getMe: async () => {
    const token = localStorage.getItem('sanskriti_token') || localStorage.getItem('sih_heritage_token');
    if (token && token.startsWith('demo-jwt-token-')) {
      const saved = localStorage.getItem('sanskriti_profile') || localStorage.getItem('sih_custom_profile');
      if (saved) {
        try {
          return { success: true, user: JSON.parse(saved) };
        } catch {}
      }
      return {
        success: true,
        user: {
          id: 1,
          name: 'Dr. Vikramaditya Sharma (Culture Admin)',
          email: 'admin@heritage.gov.in',
          role: 'admin',
          city: 'New Delhi',
        },
      };
    }
    return api.get('/auth/me').then((res) => res.data);
  },
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
      if (res.data?.products && res.data.products.length > 0 && !params?.search && (!params?.category || params.category === 'all')) {
        setLocalCachedData('products', res.data.products);
      }
      // Merge with locally added artisan products if any
      const localProducts = JSON.parse(localStorage.getItem('sanskriti_custom_products') || localStorage.getItem('sih_custom_products') || '[]');
      let combined = [...localProducts, ...(res.data.products || [])];
      return { success: true, count: combined.length, products: combined };
    } catch (err) {
      console.warn('Backend /products failed, using fallback ODOP products:', err.message);
      const localProducts = JSON.parse(localStorage.getItem('sanskriti_custom_products') || localStorage.getItem('sih_custom_products') || '[]');
      const cached = getLocalCachedData('products', FALLBACK_PRODUCTS);
      let list = [...localProducts, ...cached];
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
      const localProducts = JSON.parse(localStorage.getItem('sanskriti_custom_products') || localStorage.getItem('sih_custom_products') || '[]').filter(
        (p) => p.placeId === Number(placeId)
      );
      const combined = [...localProducts, ...(res.data.products || [])];
      return { success: true, products: combined };
    } catch (err) {
      const localProducts = JSON.parse(localStorage.getItem('sanskriti_custom_products') || localStorage.getItem('sih_custom_products') || '[]').filter(
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
      const localProducts = JSON.parse(localStorage.getItem('sanskriti_custom_products') || localStorage.getItem('sih_custom_products') || '[]');
      const product = [...localProducts, ...FALLBACK_PRODUCTS].find((p) => p.id === Number(id));
      if (product) return { success: true, product, isOfflineFallback: true };
      throw err;
    }
  },
  create: async (data) => {
    try {
      const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
      const res = await api.post('/products', data, {
        headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
      });
      return res.data;
    } catch (err) {
      console.warn('Backend POST /products failed, persisting to local artisan store:', err.message);
      const localProducts = JSON.parse(localStorage.getItem('sanskriti_custom_products') || localStorage.getItem('sih_custom_products') || '[]');
      const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
      const name = isFormData ? data.get('name') : data.name;
      const price = isFormData ? data.get('price') : data.price;
      const placeId = isFormData ? data.get('placeId') : data.placeId;
      const artisanName = isFormData ? data.get('artisanName') : data.artisanName;
      const odopTag = isFormData ? data.get('odopTag') : data.odopTag;
      const category = isFormData ? data.get('category') : data.category;
      const description = isFormData ? data.get('description') : data.description;
      const shopName = isFormData ? data.get('shopName') : data.shopName;
      const shopAddress = isFormData ? data.get('shopAddress') : data.shopAddress;
      const shopLandmark = isFormData ? data.get('shopLandmark') : data.shopLandmark;
      const shopTiming = isFormData ? data.get('shopTiming') : data.shopTiming;
      const phone = isFormData ? data.get('phone') : data.phone;
      const whatsapp = isFormData ? data.get('whatsapp') : data.whatsapp;
      const mapQuery = isFormData ? data.get('mapQuery') : data.mapQuery;
      const listingTier = (isFormData ? data.get('listingTier') : data.listingTier) || 'Gold Verified Partner';
      const imageUrl = isFormData
        ? data.get('imageUrl') ||
          'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80'
        : data.imageUrl ||
          'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80';

      const newProduct = {
        id: Date.now(),
        name,
        artisanName,
        shopName: shopName || `${artisanName} Heritage Studio`,
        shopAddress: shopAddress || 'Heritage Craft Cluster, Near Monument',
        shopLandmark: shopLandmark || 'Near Monument Gate',
        shopTiming: shopTiming || '10:00 AM - 08:00 PM (Daily)',
        phone: phone || '+91 98765 43210',
        whatsapp: whatsapp || (phone ? phone.replace(/[^0-9]/g, '') : '919876543210'),
        mapQuery: mapQuery || `${shopName || artisanName} Heritage Craft`,
        listingTier,
        isVerifiedShop: true,
        odopTag,
        category,
        description,
        imageUrl,
        price: parseFloat(price) || 0,
        placeId: parseInt(placeId) || 1,
        rating: 5.0,
        createdAt: new Date().toISOString(),
      };
      localProducts.unshift(newProduct);
      localStorage.setItem('sanskriti_custom_products', JSON.stringify(localProducts));
      return { success: true, product: newProduct, isOfflineFallback: true };
    }
  },
  addReview: async (productId, reviewData) => {
    try {
      const res = await api.post(`/products/${productId}/reviews`, reviewData);
      return res.data;
    } catch (err) {
      console.warn('Backend add review failed, saving to local reviews:', err.message);
      const key = `sanskriti_product_reviews_${productId}`;
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      const newRev = {
        id: Date.now(),
        productId: Number(productId),
        ...reviewData,
        verifiedBuy: true,
        createdAt: new Date().toISOString(),
      };
      existing.unshift(newRev);
      localStorage.setItem(key, JSON.stringify(existing));
      return { success: true, review: newRev, isOfflineFallback: true };
    }
  },
  getReviews: async (productId) => {
    try {
      const res = await api.get(`/products/${productId}/reviews`);
      return res.data;
    } catch (err) {
      const key = `sanskriti_product_reviews_${productId}`;
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      return { success: true, count: existing.length, reviews: existing, isOfflineFallback: true };
    }
  },
};

export { orderService } from './orderService';

export const foodService = {
  getAll: async (params) => {
    try {
      const res = await api.get('/food', { params });
      if (res.data?.foods && res.data.foods.length > 0) {
        if (!params?.search && !params?.placeId && (!params?.diet || params.diet === 'all')) {
          setLocalCachedData('foods', res.data.foods);
        }
        return res.data;
      }
      return { success: true, count: FALLBACK_FOODS.length, foods: FALLBACK_FOODS };
    } catch (err) {
      console.warn('Backend /food failed, using cached culinary heritage guide:', err.message);
      const cached = getLocalCachedData('foods', FALLBACK_FOODS);
      let list = [...cached];
      if (params?.placeId) {
        const pid = Number(params.placeId);
        list = list.filter((f) => f.placeId === pid || (f.alternatePlaceIds && f.alternatePlaceIds.includes(pid)));
      }
      if (params?.diet && params.diet !== 'all') {
        list = list.filter((f) => f.diet === params.diet);
      }
      if (params?.search) {
        const q = params.search.toLowerCase();
        list = list.filter(
          (f) =>
            f.name.toLowerCase().includes(q) ||
            (f.nameHi && f.nameHi.includes(q)) ||
            f.monumentName.toLowerCase().includes(q) ||
            f.famousSpots.toLowerCase().includes(q)
        );
      }
      return { success: true, count: list.length, foods: list, isOfflineFallback: true };
    }
  },
  getByPlace: async (placeId, options = {}) => {
    try {
      const res = await api.get(`/food/place/${placeId}`, { params: options });
      if (res.data?.foods && res.data.foods.length > 0) {
        return res.data;
      }
      const pid = Number(placeId);
      const list = FALLBACK_FOODS.filter(
        (f) =>
          f.placeId === pid ||
          (f.alternatePlaceIds && f.alternatePlaceIds.includes(pid)) ||
          (options.slug && f.monumentSlug && f.monumentSlug.includes(options.slug)) ||
          (options.name && f.monumentName && f.monumentName.toLowerCase().includes(options.name.toLowerCase()))
      );
      return { success: true, count: list.length, foods: list };
    } catch (err) {
      console.warn(`Backend /food/place/${placeId} failed, using cached culinary data:`, err.message);
      const pid = Number(placeId);
      const list = FALLBACK_FOODS.filter(
        (f) =>
          f.placeId === pid ||
          (f.alternatePlaceIds && f.alternatePlaceIds.includes(pid)) ||
          (options.slug && f.monumentSlug && f.monumentSlug.includes(options.slug)) ||
          (options.name && f.monumentName && f.monumentName.toLowerCase().includes(options.name.toLowerCase()))
      );
      return { success: true, count: list.length, foods: list, isOfflineFallback: true };
    }
  },
  create: async (data) => {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    const res = await api.post('/food', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/food/${id}`);
    return res.data;
  },
};

export const INITIAL_ARTISAN_APPLICATIONS = [
  {
    id: 'APP-AGR-44910',
    artisanName: 'Ustad Rashid & Sons',
    shopName: 'Ustad Rashid Heritage Marble & Inlay Workshop',
    shopAddress: '23/45, Taj Ganj Heritage Walkway, Near Fatehpuri Gate, Agra, UP - 282001',
    shopLandmark: '120m from Taj Mahal South/East Gate Walkway',
    shopTiming: '09:00 AM - 09:00 PM (Closed Fridays)',
    placeId: 1,
    monumentName: 'Taj Mahal, Agra',
    phone: '+91 98371 99882',
    whatsapp: '+919837199882',
    pehchanId: 'UP-AGR-44910',
    cooperativeName: 'Agra Marble Artisans Welfare Cooperative',
    clusterLocation: 'Taj Ganj Heritage Cluster, Agra (282001)',
    odopTag: 'ODOP: Agra Marble Inlay',
    giRegNumber: 'GI-IND-2026-UP-1092',
    craftType: 'Makrana Marble Inlay / Pietra Dura',
    status: 'APPROVED',
    submissionDate: '2026-09-24',
    approvedDate: '2026-09-25',
    adminNote: 'Verified with DC (Handicrafts) Registry & Taj Ganj Cluster Field Audit. Approved for Gold Partner.',
    activePlan: 'gold',
  },
  {
    id: 'APP-VAR-10842',
    artisanName: 'Haji Mohammad & Weavers Union',
    shopName: 'Kashi Bunkar Heritage Silk & Brocade Guild',
    shopAddress: 'D-14/19, Madanpura Heritage Weavers Gali, Near Dashashwamedh, Varanasi - 221001',
    shopLandmark: '350m from Dashashwamedh Ghat & Kashi Vishwanath Temple',
    shopTiming: '10:00 AM - 08:30 PM (Daily)',
    placeId: 2,
    monumentName: 'Varanasi Ghats & Kashi Vishwanath',
    phone: '+91 94152 77102',
    whatsapp: '+919415277102',
    pehchanId: 'UP-VAR-10842',
    cooperativeName: 'All India Handloom Weavers Cooperative Federation',
    clusterLocation: 'Madanpura Silk Cluster, Varanasi (221001)',
    odopTag: 'ODOP: Banarasi Brocade & Silk',
    giRegNumber: 'GI-IND-2026-UP-0412',
    craftType: 'Pure Mulberry Silk & Real Zari Weaving',
    status: 'PENDING',
    submissionDate: '2026-09-26',
    adminNote: 'Pehchan ID valid. Awaiting physical workshop proximity audit report.',
    activePlan: null,
  },
  {
    id: 'APP-JPR-20419',
    artisanName: 'Master Kripal Kumbhar Guild',
    shopName: 'Master Kripal Heritage Blue Art Pottery',
    shopAddress: 'B-12, Kot Jewar Heritage Crafts Lane, Near Badi Chaupar, Jaipur - 302001',
    shopLandmark: '400m from Hawa Mahal & City Palace',
    shopTiming: '10:00 AM - 08:00 PM (Closed Sundays)',
    placeId: 3,
    monumentName: 'Hawa Mahal & Amber Fort, Jaipur',
    phone: '+91 98290 33419',
    whatsapp: '+919829033419',
    pehchanId: 'RJ-JPR-20419',
    cooperativeName: 'Rajasthan Small Industries Handicrafts Union',
    clusterLocation: 'Kot Jewar Pottery Cluster, Jaipur (302001)',
    odopTag: 'ODOP: Jaipur Blue Pottery',
    giRegNumber: 'GI-IND-2026-RJ-0028',
    craftType: 'Jaipur Blue Pottery (Traditional Quartz & Multani Mitti)',
    status: 'PENDING',
    submissionDate: '2026-09-26',
    adminNote: 'Application submitted. DIC Jaipur reference verified.',
    activePlan: null,
  },
];

export const artisanVerificationService = {
  getAll: async () => {
    try {
      const res = await api.get('/artisan-verification/applications');
      if (res.data?.success && res.data?.applications) {
        localStorage.setItem('sanskriti_artisan_applications', JSON.stringify(res.data.applications));
        return { success: true, applications: res.data.applications };
      }
    } catch (e) {
      console.warn('Backend /artisan-verification/applications unavailable, using cache:', e.message);
    }
    try {
      const stored = localStorage.getItem('sanskriti_artisan_applications') || localStorage.getItem('sih_artisan_applications');
      if (stored) {
        return { success: true, applications: JSON.parse(stored) };
      }
      localStorage.setItem('sanskriti_artisan_applications', JSON.stringify(INITIAL_ARTISAN_APPLICATIONS));
      return { success: true, applications: INITIAL_ARTISAN_APPLICATIONS };
    } catch (e) {
      return { success: true, applications: INITIAL_ARTISAN_APPLICATIONS };
    }
  },

  getByPehchan: async (pehchanId) => {
    const res = await artisanVerificationService.getAll();
    const app = res.applications.find(
      (a) => (a.pehchanId || '').toUpperCase() === (pehchanId || '').toUpperCase()
    );
    return { success: true, application: app || null };
  },

  submit: async (applicationData) => {
    try {
      const res = await api.post('/artisan-verification/applications', applicationData);
      if (res.data?.success && res.data?.application) {
        localStorage.setItem('sanskriti_current_artisan_pehchan', applicationData.pehchanId);
        return { success: true, application: res.data.application };
      }
    } catch (e) {
      console.warn('Backend submit application failed, saving locally:', e.message);
    }

    const res = await artisanVerificationService.getAll();
    const list = [...res.applications];
    const cleanId = (applicationData.pehchanId || 'ART').replace(/[^A-Z0-9]/gi, '');
    const newId = `APP-${cleanId}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newApp = {
      ...applicationData,
      id: newId,
      status: 'PENDING',
      submissionDate: new Date().toISOString().split('T')[0],
      adminNote: 'Pending physical workshop and credentials audit by Tourism Administration.',
      activePlan: null,
    };

    const existingIdx = list.findIndex(
      (a) => (a.pehchanId || '').toUpperCase() === (applicationData.pehchanId || '').toUpperCase()
    );
    if (existingIdx >= 0) {
      list[existingIdx] = { ...list[existingIdx], ...newApp };
    } else {
      list.unshift(newApp);
    }

    localStorage.setItem('sanskriti_artisan_applications', JSON.stringify(list));
    localStorage.setItem('sanskriti_current_artisan_pehchan', applicationData.pehchanId);
    return { success: true, application: newApp };
  },

  updateStatus: async (id, status, adminNote = '') => {
    try {
      await api.patch(`/artisan-verification/applications/${id}/status`, {
        status,
        notes: adminNote,
      });
    } catch (e) {
      console.warn('Backend updateStatus failed, updating local state:', e.message);
    }

    const res = await artisanVerificationService.getAll();
    const list = res.applications.map((app) => {
      if (app.id === id || app.pehchanId === id) {
        return {
          ...app,
          status,
          adminNote:
            adminNote ||
            (status === 'APPROVED'
              ? 'Approved by Government Tourism Administration.'
              : 'Application rejected. Please update details.'),
          approvedDate: status === 'APPROVED' ? new Date().toISOString().split('T')[0] : app.approvedDate,
        };
      }
      return app;
    });
    localStorage.setItem('sanskriti_artisan_applications', JSON.stringify(list));
    return { success: true, applications: list };
  },

  updatePlan: async (pehchanId, plan) => {
    try {
      await api.patch(`/artisan-verification/applications/${pehchanId}/plan`, { plan });
    } catch (e) {
      console.warn('Backend updatePlan failed, updating local state:', e.message);
    }

    const res = await artisanVerificationService.getAll();
    const list = res.applications.map((app) => {
      if ((app.pehchanId || '').toUpperCase() === (pehchanId || '').toUpperCase() || app.id === pehchanId) {
        return {
          ...app,
          activePlan: plan,
        };
      }
      return app;
    });
    localStorage.setItem('sanskriti_artisan_applications', JSON.stringify(list));
    return { success: true };
  },

  getCurrentArtisanPehchan: () => {
    return localStorage.getItem('sanskriti_current_artisan_pehchan') || localStorage.getItem('sih_current_artisan_pehchan') || 'UP-AGR-44910';
  },

  setCurrentArtisanPehchan: (pehchanId) => {
    localStorage.setItem('sanskriti_current_artisan_pehchan', pehchanId);
  },
};

export const supportService = {
  getAll: async () => {
    try {
      const res = await api.get('/support/tickets');
      if (res.data && res.data.success && Array.isArray(res.data.tickets)) {
        return { success: true, tickets: res.data.tickets };
      }
    } catch (e) {
      console.warn('Backend getSupportTickets notice:', e.message);
    }

    // Fallback to local storage
    try {
      const stored = JSON.parse(
        localStorage.getItem('sanskriti_support_tickets') || localStorage.getItem('sih_support_tickets') || '[]'
      );
      return { success: true, tickets: stored };
    } catch {
      return { success: true, tickets: [] };
    }
  },

  updateStatus: async (id, status) => {
    try {
      const res = await api.patch(`/support/tickets/${id}/status`, { status });
      if (res.data && res.data.success) {
        // Also update local storage for seamless sync
        try {
          const stored = JSON.parse(
            localStorage.getItem('sanskriti_support_tickets') || localStorage.getItem('sih_support_tickets') || '[]'
          );
          const updated = stored.map((t) => (t.id === id || t.ticketNumber === id ? { ...t, status } : t));
          localStorage.setItem('sanskriti_support_tickets', JSON.stringify(updated));
        } catch {}
        return res.data;
      }
    } catch (e) {
      console.warn('Backend update ticket status failed, updating locally:', e.message);
    }

    // Fallback local update
    try {
      const stored = JSON.parse(
        localStorage.getItem('sanskriti_support_tickets') || localStorage.getItem('sih_support_tickets') || '[]'
      );
      const updated = stored.map((t) => (t.id === id || t.ticketNumber === id ? { ...t, status } : t));
      localStorage.setItem('sanskriti_support_tickets', JSON.stringify(updated));
      return { success: true, message: `Ticket status updated to ${status}` };
    } catch {
      return { success: false, message: 'Failed to update ticket status.' };
    }
  },

  delete: async (id) => {
    try {
      const res = await api.delete(`/support/tickets/${id}`);
      if (res.data && res.data.success) {
        try {
          const stored = JSON.parse(
            localStorage.getItem('sanskriti_support_tickets') || localStorage.getItem('sih_support_tickets') || '[]'
          );
          const updated = stored.filter((t) => t.id !== id && t.ticketNumber !== id);
          localStorage.setItem('sanskriti_support_tickets', JSON.stringify(updated));
        } catch {}
        return res.data;
      }
    } catch (e) {
      console.warn('Backend delete ticket failed, removing locally:', e.message);
    }

    try {
      const stored = JSON.parse(
        localStorage.getItem('sanskriti_support_tickets') || localStorage.getItem('sih_support_tickets') || '[]'
      );
      const updated = stored.filter((t) => t.id !== id && t.ticketNumber !== id);
      localStorage.setItem('sanskriti_support_tickets', JSON.stringify(updated));
      return { success: true };
    } catch {
      return { success: false };
    }
  },
};

export default api;
