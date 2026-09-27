import axios from 'axios';
import { FALLBACK_PLACES, FALLBACK_PRODUCTS, FALLBACK_FOODS } from '../data/fallbackData';

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
    return 'http://10.0.2.2:5000/api';
  }

  // If accessed directly on mobile browser via computer IP (e.g. http://192.168.x.x:5173)
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
  timeout: 25000,
});

// Update baseURL dynamically if custom URL changed
export const updateApiBaseUrl = (newUrl) => {
  if (newUrl) {
    const clean = newUrl.trim().replace(/\/$/, '');
    const full = clean.endsWith('/api') ? clean : `${clean}/api`;
    localStorage.setItem('sanskriti_custom_api_url', clean);
    api.defaults.baseURL = full;
  } else {
    localStorage.removeItem('sanskriti_custom_api_url');
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
  login: async (data) => {
    try {
      const res = await api.post('/auth/login', data);
      return res.data;
    } catch (err) {
      // Check if it's the known demo admin or user credentials and backend is unreachable / timed out
      const isDemoAdmin = data?.email === 'admin@heritage.gov.in' && data?.password === 'password123';
      const isDemoUser = (data?.email === 'rahul@example.com' || data?.email === 'priya@example.com') && data?.password === 'password123';

      if ((err.code === 'ECONNABORTED' || err.message?.includes('timeout') || !err.response) && (isDemoAdmin || isDemoUser)) {
        console.warn('Backend server unreachable or timed out. Falling back to verified demo session:', err.message);
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
              id: 2,
              name: data.email === 'rahul@example.com' ? 'Rahul Sharma' : 'Priya Patel',
              email: data.email,
              role: 'user',
              city: data.email === 'rahul@example.com' ? 'Jaipur' : 'Varanasi',
              avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
            };
        const demoToken = 'demo-jwt-token-' + Date.now();
        localStorage.setItem('sanskriti_token', demoToken);
        return {
          success: true,
          message: 'Logged in successfully (Offline Fallback Mode)',
          token: demoToken,
          user: demoUser,
          isOfflineFallback: true,
        };
      }
      throw err;
    }
  },
  register: (data) => api.post('/auth/register', data).then((res) => res.data),
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
      // Merge with locally added artisan products if any
      const localProducts = JSON.parse(localStorage.getItem('sanskriti_custom_products') || localStorage.getItem('sih_custom_products') || '[]');
      let combined = [...localProducts, ...(res.data.products || [])];
      return { success: true, count: combined.length, products: combined };
    } catch (err) {
      console.warn('Backend /products failed, using fallback ODOP products:', err.message);
      const localProducts = JSON.parse(localStorage.getItem('sanskriti_custom_products') || localStorage.getItem('sih_custom_products') || '[]');
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
};

export const foodService = {
  getAll: async (params) => {
    try {
      const res = await api.get('/food', { params });
      if (res.data?.foods && res.data.foods.length > 0) {
        return res.data;
      }
      return { success: true, count: FALLBACK_FOODS.length, foods: FALLBACK_FOODS };
    } catch (err) {
      console.warn('Backend /food failed, using cached culinary heritage guide:', err.message);
      let list = [...FALLBACK_FOODS];
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

export default api;
