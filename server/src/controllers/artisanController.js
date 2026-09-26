import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const storageFilePath = path.join(__dirname, '../../uploads/artisan_applications.json');

const INITIAL_APPLICATIONS = [
  {
    id: 'APP-AGR-44910',
    artisanName: 'Ustad Rashid & Sons',
    shopName: 'Rashid Makrana Marble & Pietra Dura Workshop',
    shopAddress: 'Shop 14, Near Taj West Gate, Tajganj, Agra, UP - 282001',
    shopLandmark: 'Opposite Royal Gate Heritage Entry (350m from Taj Mahal)',
    shopTiming: '09:00 AM - 08:30 PM (Daily)',
    placeId: '1',
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
    submittedAt: '2026-01-10T10:30:00.000Z',
    approvedAt: '2026-01-11T14:15:00.000Z',
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
    placeId: '5',
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
    submittedAt: '2026-02-01T11:00:00.000Z',
    verifiedBy: 'Pending District Handicrafts Review',
    adminNotes: 'Awaiting physically signed verification deed from Varanasi District Industries Centre (DIC).',
  },
  {
    id: 'APP-JPR-20419',
    artisanName: 'Master Kripal Blue Art Studio',
    shopName: 'Master Kripal Blue Pottery Art Emporium',
    shopAddress: 'B-18, Shiv Marg, Near Amer Road Heritage Walk, Jaipur, Rajasthan - 302002',
    shopLandmark: 'On Amer-Jaipur Heritage Boulevard, near Jal Mahal view point',
    shopTiming: '09:30 AM - 08:30 PM (Daily)',
    placeId: '6',
    monumentName: 'Amer Fort (Jaipur)',
    monumentDistance: '1.2km',
    phone: '+91 94140 77890',
    whatsapp: '919414077890',
    pehchanId: 'RJ-JPR-20419',
    cooperativeName: 'Rajasthan Small Industries Handicrafts Union',
    clusterLocation: 'Kot Jewar Pottery Cluster, Jaipur (302001)',
    craftType: 'Jaipur Blue Pottery (पारंपरिक नीली मिट्टी के बर्तन)',
    status: 'APPROVED',
    activePlan: 'platinum',
    submittedAt: '2026-01-05T09:00:00.000Z',
    approvedAt: '2026-01-06T12:00:00.000Z',
    verifiedBy: 'Rajasthan Tourism & Crafts Board',
    adminNotes: 'Certified authentic dough-less pottery with cobalt oxide glaze. Verified 40-year generational workshop.',
  },
];

const ensureStorage = () => {
  const uploadsDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  if (!fs.existsSync(storageFilePath)) {
    fs.writeFileSync(storageFilePath, JSON.stringify(INITIAL_APPLICATIONS, null, 2));
  }
};

const readApplications = () => {
  try {
    ensureStorage();
    const data = fs.readFileSync(storageFilePath, 'utf-8');
    const parsed = JSON.parse(data || '[]');
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_APPLICATIONS;
  } catch (err) {
    console.error('Error reading artisan applications:', err);
    return INITIAL_APPLICATIONS;
  }
};

const writeApplications = (apps) => {
  try {
    ensureStorage();
    fs.writeFileSync(storageFilePath, JSON.stringify(apps, null, 2));
  } catch (err) {
    console.error('Error writing artisan applications:', err);
  }
};

export const getAllApplications = (req, res) => {
  try {
    const apps = readApplications();
    return res.json({ success: true, applications: apps });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const submitApplication = (req, res) => {
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

    const apps = readApplications();
    const cityCode = pehchanId.slice(3, 6).toUpperCase() || 'HER';
    const randomId = Math.floor(10000 + Math.random() * 90000);
    const newId = `APP-${cityCode}-${randomId}`;

    const newApp = {
      id: newId,
      artisanName: artisanName || `${shopName} Master Artisan`,
      shopName,
      shopAddress: shopAddress || 'Physical Workshop near Monument',
      shopLandmark: shopLandmark || 'Near Monument Heritage Gate',
      shopTiming: shopTiming || '10:00 AM - 08:00 PM',
      placeId: placeId || '1',
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
      submittedAt: new Date().toISOString(),
      verifiedBy: 'Pending District Handicrafts Review',
      adminNotes: 'New shop application submitted via Artisan Portal. Under physical address verification review.',
    };

    apps.unshift(newApp);
    writeApplications(apps);

    return res.status(201).json({
      success: true,
      message: 'Shop application submitted for Admin Physical Review.',
      application: newApp,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateApplicationStatus = (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!['APPROVED', 'PENDING', 'REJECTED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const apps = readApplications();
    const idx = apps.findIndex((a) => a.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    apps[idx].status = status;
    if (notes) apps[idx].adminNotes = notes;
    if (status === 'APPROVED') {
      apps[idx].approvedAt = new Date().toISOString();
      apps[idx].verifiedBy = 'Government Tourism Admin (Verified)';
    }

    writeApplications(apps);

    return res.json({
      success: true,
      message: `Application ${id} status updated to ${status}.`,
      application: apps[idx],
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateApplicationPlan = (req, res) => {
  try {
    const { id } = req.params;
    const { plan } = req.body;

    const apps = readApplications();
    const idx = apps.findIndex((a) => a.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    apps[idx].activePlan = plan;
    writeApplications(apps);

    return res.json({
      success: true,
      message: `Application ${id} subscription plan set to ${plan}.`,
      application: apps[idx],
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
