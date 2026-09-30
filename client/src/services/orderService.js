// Order & Delivery Fulfillment Workflow Service
// Synchronizes customer orders between Bazaar Online Checkout & Artisan Studio Dispatch
import { api } from './api';

const STORAGE_KEY = 'sanskriti_orders_db';

const INITIAL_SAMPLE_ORDERS = [
  {
    id: 'ODOP-2026-784192',
    utr: 'UTR894102948192',
    date: '26 Sep 2026, 03:15 PM',
    createdAt: new Date().toISOString(),
    productId: 1,
    productName: 'Makrana Marble Coaster Set (मकराना संगमरमर)',
    productImage: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    price: 1299,
    artisanName: 'Ustad Rashid & Sons',
    artisanShare: 1299, // 100% Direct Remittance
    platformFee: 0, // 0% Commission Promo
    buyerFee: 0,
    paymentMethod: 'Instant UPI (NPCI Direct Remittance)',
    buyerName: 'Aarav Sharma',
    buyerPhone: '9876543210',
    buyerAddress: 'Flat 402, Lotus Heritage Tower, C-Scheme',
    buyerCity: 'Jaipur',
    artisanNote: 'Please engrave traditional floral Pietra Dura inlay if possible!',
    status: 'dispatched', // 'order_placed' | 'crafting' | 'dispatched' | 'delivered'
    carrier: 'India Post SpeedPost (GI Secure)',
    trackingAwb: 'EM948201948IN',
    timeline: [
      { step: 'Order Placed & Escrow Secured', time: '26 Sep, 03:15 PM', desc: '100% Fair-Trade Escrow Secured & Artisan Notified' },
      { step: 'Handcrafting & Packaging', time: '26 Sep, 04:00 PM', desc: 'Master artisan crafted & attached GI Hologram Tag' },
      { step: 'Dispatched via Courier', time: '26 Sep, 04:45 PM', desc: 'Handed over to India Post SpeedPost (AWB: EM948201948IN)' },
    ],
  },
  {
    id: 'ODOP-2026-619284',
    utr: 'UTR381928491820',
    date: '26 Sep 2026, 02:40 PM',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    productId: 2,
    productName: 'Puri Heritage Palm Leaf Pattachitra',
    productImage: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=800&q=80',
    price: 2500,
    artisanName: 'Raghurajpur Heritage Chitrakar Guild',
    artisanShare: 2500, // 100% Direct Remittance
    platformFee: 0, // 0% Commission Promo
    buyerFee: 0,
    paymentMethod: 'Instant UPI (NPCI Direct Remittance)',
    buyerName: 'Priya Iyer',
    buyerPhone: '9811223344',
    buyerAddress: 'B-12, Temple View Enclave, BTM 2nd Stage',
    buyerCity: 'Bengaluru',
    artisanNote: 'Thank you for preserving this living heritage!',
    status: 'crafting',
    carrier: 'India Post SpeedPost (GI Secure)',
    trackingAwb: null,
    timeline: [
      { step: 'Order Placed & Escrow Secured', time: '26 Sep, 02:40 PM', desc: 'Payment verified with 100% direct artisan share secured (0% fee)' },
      { step: 'Guild Crafting In Progress', time: '26 Sep, 03:20 PM', desc: 'Chitrakar guild applying natural vegetable dyes on seasoned palm leaf' },
    ],
  },
];

export const orderService = {
  getLocalOrders: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_ORDERS));
        return INITIAL_SAMPLE_ORDERS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_SAMPLE_ORDERS;
    }
  },

  getAll: async (params = {}) => {
    try {
      const res = await api.get('/orders', { params });
      if (res.data?.success && res.data?.orders?.length > 0) {
        // Merge with local orders to guarantee offline resilience
        const locals = orderService.getLocalOrders();
        const serverIds = new Set(res.data.orders.map((o) => o.id));
        const combined = [...res.data.orders, ...locals.filter((o) => !serverIds.has(o.id))];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(combined));
        return combined;
      }
    } catch (e) {
      console.warn('Backend /orders failed, using local orders cache:', e.message);
    }
    return orderService.getLocalOrders();
  },

  getArtisanOrders: async (artisanName) => {
    const orders = await orderService.getAll();
    if (!artisanName) return orders;
    const cleanQuery = artisanName.toLowerCase().trim();
    return orders.filter(
      (o) =>
        !o.artisanName ||
        o.artisanName.toLowerCase().includes(cleanQuery) ||
        cleanQuery.includes(o.artisanName.toLowerCase())
    );
  },

  createOrder: async (orderData) => {
    const numPrice = parseFloat(orderData.price || 0);
    const numQty = parseInt(orderData.quantity || 1);
    const itemTotal = numPrice * numQty;
    const buyerFee = 0.0;
    const artisanShare = itemTotal;
    const platformFee = 0.0;

    const payload = {
      ...orderData,
      price: itemTotal,
      quantity: numQty,
      buyerFee,
      artisanShare,
      platformFee,
    };

    try {
      const res = await api.post('/orders', payload);
      if (res.data?.success && res.data?.order) {
        const locals = orderService.getLocalOrders();
        const updated = [res.data.order, ...locals.filter((o) => o.id !== res.data.order.id)];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return res.data.order;
      }
    } catch (e) {
      console.warn('Backend POST /orders failed, saving locally:', e.message);
    }

    // Local fallback creation
    const newOrder = {
      ...payload,
      id: orderData.id || `ODOP-2026-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: new Date().toISOString(),
      status: 'order_placed',
      carrier: 'India Post SpeedPost (GI Secure)',
      trackingAwb: null,
      timeline: [
        {
          step: 'Order Placed (0% Commission Promo)',
          time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          desc: '100% Direct artisan payout secured with 0% platform deductions',
        },
      ],
    };
    const locals = orderService.getLocalOrders();
    const updated = [newOrder, ...locals];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newOrder;
  },

  updateStatus: async (orderId, newStatus, trackingAwb = null) => {
    try {
      const res = await api.patch(`/orders/${orderId}/status`, {
        status: newStatus,
        trackingAwb,
      });
      if (res.data?.success && res.data?.order) {
        const locals = orderService.getLocalOrders();
        const updated = locals.map((o) => (o.id === orderId ? res.data.order : o));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return res.data.order;
      }
    } catch (e) {
      console.warn('Backend patch order status failed, updating locally:', e.message);
    }

    const locals = orderService.getLocalOrders();
    const updated = locals.map((order) => {
      if (order.id !== orderId) return order;

      const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      let eventDesc = '';
      if (newStatus === 'crafting') {
        eventDesc = 'Master artisan started handcrafting & preparing GI anti-counterfeit packaging';
      } else if (newStatus === 'dispatched') {
        eventDesc = `Dispatched with ${order.carrier || 'India Post SpeedPost'} (AWB: ${trackingAwb || order.trackingAwb || 'IN-POST-SPEED-88412'})`;
      } else if (newStatus === 'delivered') {
        eventDesc = 'Doorstep physical inspection cleared & 100% direct payout released to artisan account';
      }

      const newTimeline = [
        ...(order.timeline || []),
        {
          step:
            newStatus === 'crafting'
              ? 'Handcrafting & Quality Tagging'
              : newStatus === 'dispatched'
              ? 'Dispatched & In Transit'
              : 'Delivered & Payout Settled',
          time: now,
          desc: eventDesc,
        },
      ];

      return {
        ...order,
        status: newStatus,
        trackingAwb: trackingAwb || order.trackingAwb || (newStatus === 'dispatched' ? `IN-POST-${Math.floor(100000 + Math.random() * 900000)}` : null),
        timeline: newTimeline,
      };
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated.find((o) => o.id === orderId);
  },
};
