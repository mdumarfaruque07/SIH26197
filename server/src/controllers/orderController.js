import prisma from '../prisma.js';

export const getAllOrders = async (req, res) => {
  try {
    const { artisanName, status, buyerPhone } = req.query;
    const where = {};

    if (artisanName) {
      where.artisanName = { contains: artisanName };
    }
    if (status) {
      where.status = status;
    }
    if (buyerPhone) {
      where.buyerPhone = buyerPhone;
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const formatted = orders.map((o) => ({
      ...o,
      timeline: o.timelineJson ? JSON.parse(o.timelineJson) : [
        {
          step: 'Order Placed & Escrow Secured',
          time: new Date(o.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          desc: 'Payment authorized with 95% direct artisan payout locked in fair-trade escrow',
        },
      ],
    }));

    return res.json({ success: true, count: formatted.length, orders: formatted });
  } catch (error) {
    console.error('getAllOrders error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch orders.' });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const formatted = {
      ...order,
      timeline: order.timelineJson ? JSON.parse(order.timelineJson) : [],
    };

    return res.json({ success: true, order: formatted });
  } catch (error) {
    console.error('getOrderById error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch order.' });
  }
};

export const createOrder = async (req, res) => {
  try {
    const {
      productId,
      productName,
      productImage,
      price,
      quantity = 1,
      artisanName,
      buyerName,
      buyerPhone,
      buyerAddress,
      buyerCity,
      paymentMethod = 'UPI Escrow Direct',
      utr,
      artisanNote,
    } = req.body;

    if (!productName || !price || !artisanName || !buyerName || !buyerPhone || !buyerAddress) {
      return res.status(400).json({
        success: false,
        message: 'Product, price, artisan name, and buyer contact details are required.',
      });
    }

    const numPrice = parseFloat(price);
    const numQty = parseInt(quantity) || 1;
    const itemTotal = numPrice * numQty;
    const buyerFee = 0.0; // 0% Commission Promo
    const artisanShare = itemTotal; // 100% direct to artisan
    const platformFee = 0.0; // 0% platform fee

    const orderId = `ODOP-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const randomUtr = utr || `UTR${Date.now().toString().slice(-8)}${Math.floor(1000 + Math.random() * 9000)}`;

    const initialTimeline = [
      {
        step: 'Order Placed (0% Commission Promo)',
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        desc: '100% Direct artisan payout secured with 0% platform fee',
      },
    ];

    let validProductId = null;
    if (productId) {
      const parsed = parseInt(productId, 10);
      if (!isNaN(parsed) && parsed > 0 && parsed <= 2147483647) {
        validProductId = parsed;
      }
    }

    const order = await prisma.order.create({
      data: {
        id: orderId,
        productId: validProductId,
        productName,
        productImage: productImage || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
        price: itemTotal,
        quantity: numQty,
        buyerFee,
        artisanShare,
        platformFee,
        artisanName,
        buyerName,
        buyerPhone,
        buyerAddress,
        buyerCity: buyerCity || 'India',
        paymentMethod,
        utr: randomUtr,
        status: 'order_placed',
        carrier: 'India Post SpeedPost (GI Secure)',
        trackingAwb: null,
        artisanNote: artisanNote || null,
        timelineJson: JSON.stringify(initialTimeline),
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Fair-Trade Artisan Order successfully placed!',
      order: {
        ...order,
        timeline: initialTimeline,
      },
    });
  } catch (error) {
    console.error('createOrder error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, trackingAwb } = req.body;

    const validStatuses = ['order_placed', 'crafting', 'dispatched', 'delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid order status.' });
    }

    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const currentTimeline = existing.timelineJson ? JSON.parse(existing.timelineJson) : [];
    const nowTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    let eventStep = 'Order Update';
    let eventDesc = '';

    if (status === 'crafting') {
      eventStep = 'Handcrafting & Quality Tagging';
      eventDesc = 'Master artisan started handcrafting & preparing GI anti-counterfeit hologram packaging';
    } else if (status === 'dispatched') {
      eventStep = 'Dispatched via India Post GI Courier';
      eventDesc = `Handed over to ${existing.carrier || 'India Post SpeedPost'} (AWB: ${trackingAwb || existing.trackingAwb || 'IN-POST-SPEED-' + Math.floor(100000 + Math.random() * 900000)})`;
    } else if (status === 'delivered') {
      eventStep = 'Delivered & 95% Artisan Payout Settled';
      eventDesc = 'Physical package delivery verified & 95% direct artisan payout released to guild bank account';
    }

    const updatedTimeline = [
      ...currentTimeline,
      {
        step: eventStep,
        time: nowTime,
        desc: eventDesc,
      },
    ];

    const finalAwb = trackingAwb || existing.trackingAwb || (status === 'dispatched' ? `IN-POST-${Math.floor(100000 + Math.random() * 900000)}` : null);

    const updated = await prisma.order.update({
      where: { id },
      data: {
        status,
        trackingAwb: finalAwb,
        timelineJson: JSON.stringify(updatedTimeline),
      },
    });

    return res.json({
      success: true,
      message: `Order ${id} status updated to ${status}.`,
      order: {
        ...updated,
        timeline: updatedTimeline,
      },
    });
  } catch (error) {
    console.error('updateOrderStatus error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
