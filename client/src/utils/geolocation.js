import { Geolocation } from '@capacitor/geolocation';

/**
 * Multi-tier robust geolocation resolver for mobile & web.
 * Tier 1: Native @capacitor/geolocation with automatic permission request.
 * Tier 2: Standard browser navigator.geolocation.
 * Tier 3: Fast IP-based geolocation fallback (great for indoors / Wi-Fi).
 * Tier 4: Default India Heritage Center coordinate (New Delhi).
 */
export async function getLiveLocation() {
  // 1. Try Native Capacitor Geolocation
  try {
    try {
      const perm = await Geolocation.checkPermissions();
      if (perm.location !== 'granted') {
        await Geolocation.requestPermissions();
      }
    } catch (permErr) {
      console.warn('Capacitor permission request notice:', permErr);
    }

    const pos = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 6000,
      maximumAge: 10000,
    });

    if (pos && pos.coords) {
      return {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        source: 'gps',
        label: `GPS (${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)})`,
      };
    }
  } catch (capErr) {
    console.warn('Capacitor GPS unavailable or timed out, trying fallback:', capErr);
  }

  // 2. Try HTML5 Geolocation
  if (typeof navigator !== 'undefined' && navigator.geolocation) {
    try {
      const htmlPos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 4000,
          maximumAge: 30000,
        });
      });

      if (htmlPos && htmlPos.coords) {
        return {
          lat: htmlPos.coords.latitude,
          lng: htmlPos.coords.longitude,
          source: 'browser',
          label: `Browser (${htmlPos.coords.latitude.toFixed(2)}, ${htmlPos.coords.longitude.toFixed(2)})`,
        };
      }
    } catch (htmlErr) {
      console.warn('HTML5 geolocation error:', htmlErr);
    }
  }

  // 3. Try IP-based location (fast indoors / Wi-Fi fix)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.latitude && data.longitude) {
        return {
          lat: data.latitude,
          lng: data.longitude,
          city: data.city || data.region,
          source: 'ip',
          label: `${data.city || 'Regional'} (Network IP)`,
        };
      }
    }
  } catch (ipErr) {
    console.warn('IP geolocation lookup skipped/failed:', ipErr);
  }

  // 4. Default India Pan-Heritage Reference (New Delhi center)
  return {
    lat: 28.6139,
    lng: 77.209,
    city: 'New Delhi',
    source: 'default',
    label: 'Pan-India Explorer (Default)',
  };
}
