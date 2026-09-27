import prisma from '../prisma.js';

export const INITIAL_APPLICATIONS = [
  {
    id: 'APP-AGR-44910',
    artisanName: 'Ustad Rashid & Sons',
    shopName: 'Rashid Makrana Marble & Pietra Dura Workshop',
    shopAddress: 'Shop 14, Near Taj West Gate, Tajganj, Agra, UP - 282001',
    shopLandmark: 'Opposite Royal Gate Heritage Entry (350m from Taj Mahal)',
    shopTiming: '09:00 AM - 08:30 PM (Daily)',
    placeId: 1,
    monumentName: 'Taj Mahal (Agra)',
    monumentDistance: '350m',
    phone: '+91 98370 12345',
    whatsapp: '919837012345',
    pehchanId: 'UP-AGR-44910',
    cooperativeName: 'Agra Marble Artisans Guild',
    clusterLocation: 'Tajganj Heritage Cluster, Agra',
    craftType: 'Makrana Marble Inlay / Pietra Dura (पच्चीकारी)',
    status: 'APPROVED',
    activePlan: 'gold',
    submittedAt: new Date('2026-01-10T10:30:00.000Z'),
    approvedAt: new Date('2026-01-11T14:15:00.000Z'),
    verifiedBy: 'ASI Heritage Directorate (Dr. V. Sharma)',
    adminNotes: 'Physical workshop verified by Regional Tourism Officer. 100% authentic Makrana marble with semi-precious stone inlay.',
  },
  {
    id: 'APP-VAR-10842',
    artisanName: 'Kashi Bunkar Weavers Society',
    shopName: 'Kashi Silk Weavers Heritage Emporium',
    shopAddress: 'K-22/41, Madanpura Silk Lane, Near Godowlia Chowk, Varanasi, UP - 221001',
    shopLandmark: 'Adjacent to Silk Heritage Walk (850m from Dashashwamedh Ghat)',
    shopTiming: '10:00 AM - 09:00 PM',
    placeId: 5,
    monumentName: 'Kashi Vishwanath & Ganga Ghats',
    monumentDistance: '850m',
    phone: '+91 94152 67890',
    whatsapp: '919415267890',
    pehchanId: 'UP-VAR-10842',
    cooperativeName: 'Varanasi Handloom Silk Weavers Samiti',
    clusterLocation: 'Madanpura & Lohta Weaving Cluster, Varanasi',
    craftType: 'Handloom Pure Silk Banarasi Saree & Brocades (बनारसी ज़री)',
    status: 'PENDING',
    activePlan: null,
    submittedAt: new Date('2026-02-01T11:00:00.000Z'),
    approvedAt: null,
    verifiedBy: 'Pending District Handicrafts Review',
    adminNotes: 'Awaiting physically signed verification deed from Varanasi District Industries Centre (DIC).',
  },
  {
    id: 'APP-JPR-20419',
    artisanName: 'Master Kripal Blue Art Studio',
    shopName: 'Master Kripal Blue Pottery Art Emporium',
    shopAddress: 'B-18, Shiv Marg, Near Amer Road Heritage Walk, Jaipur, Rajasthan - 302002',
    shopLandmark: 'On Amer-Jaipur Heritage Boulevard, near Jal Mahal view point',
    shopTiming: '10:00 AM - 08:00 PM (Daily)',
    placeId: 4,
    monumentName: 'Amer Fort & Jaipur Heritage',
    monumentDistance: '1.2km',
    phone: '+91 98290 54321',
    whatsapp: '919829054321',
    pehchanId: 'RJ-JPR-20419',
    cooperativeName: 'Jaipur Blue Pottery Heritage Trust',
    clusterLocation: 'Kot Jewar & Amer Craft Hub, Jaipur',
    craftType: 'Traditional Jaipur Blue Pottery (क्वार्ट्ज़ व मुल्तानी मिट्टी हस्तकला)',
    status: 'PENDING',
    activePlan: null,
    submittedAt: new Date('2026-02-05T14:00:00.000Z'),
    approvedAt: null,
    verifiedBy: 'Pending District Handicrafts Review',
    adminNotes: 'Workshop photos uploaded. Pending field inspection by Rajasthan Handicrafts Development Officer.',
  },
];

export const getAllApplications = async (req, res) => {
  try {
    const apps = await prisma.artisanApplication.findMany({
      orderBy: { submittedAt: 'desc' },
      include: {
        place: {
          select: { id: true, name: true, slug: true, state: true },
        },
      },
    });

    return res.json({ success: true, applications: apps });
  } catch (err) {
    console.error('getAllApplications error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch applications.' });
  }
};

export const submitApplication = async (req, res) => {
  try {
    const {
      artisanName,
      shopName,
      shopAddress,
      shopLandmark,
      shopTiming,
      placeId,
      monumentName,
      phone,
      whatsapp,
      pehchanId,
      cooperativeName,
      clusterLocation,
      craftType,
    } = req.body;

    if (!shopName || !pehchanId || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Shop Name, Pehchan ID, and Phone Number are required.',
      });
    }

    const cityCode = pehchanId.slice(3, 6).toUpperCase() || 'HER';
    const randomId = Math.floor(10000 + Math.random() * 90000);
    const newId = `APP-${cityCode}-${randomId}`;

    const newApp = await prisma.artisanApplication.create({
      data: {
        id: newId,
        artisanName: artisanName || `${shopName} Master Artisan`,
        shopName,
        shopAddress: shopAddress || 'Physical Workshop near Monument',
        shopLandmark: shopLandmark || 'Near Monument Heritage Gate',
        shopTiming: shopTiming || '10:00 AM - 08:00 PM',
        placeId: placeId ? parseInt(placeId) : null,
        monumentName: monumentName || 'Associated Heritage Monument',
        monumentDistance: 'Within 1km of Site',
        phone,
        whatsapp: whatsapp || phone,
        pehchanId: pehchanId.toUpperCase(),
        cooperativeName: cooperativeName || 'National Handicrafts Development Society',
        clusterLocation: clusterLocation || 'Registered Crafts Cluster',
        craftType: craftType || 'Regional ODOP Craft & Traditional Art',
        status: 'PENDING',
        activePlan: null,
        verifiedBy: 'Pending District Handicrafts Review',
        adminNotes: 'New shop application submitted via Artisan Portal. Under physical address verification review.',
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Shop application submitted for Admin Physical Review.',
      application: newApp,
    });
  } catch (err) {
    console.error('submitApplication error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!['APPROVED', 'PENDING', 'REJECTED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const updateData = {
      status,
    };
    if (notes) updateData.adminNotes = notes;
    if (status === 'APPROVED') {
      updateData.approvedAt = new Date();
      updateData.verifiedBy = 'Government Tourism Admin (Verified)';
    }

    const updated = await prisma.artisanApplication.update({
      where: { id },
      data: updateData,
    });

    return res.json({
      success: true,
      message: `Application ${id} status updated to ${status}.`,
      application: updated,
    });
  } catch (err) {
    console.error('updateApplicationStatus error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateApplicationPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { plan } = req.body;

    const updated = await prisma.artisanApplication.update({
      where: { id },
      data: { activePlan: plan },
    });

    return res.json({
      success: true,
      message: `Application ${id} subscription plan set to ${plan}.`,
      application: updated,
    });
  } catch (err) {
    console.error('updateApplicationPlan error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
