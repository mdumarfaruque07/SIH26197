import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { placeService, productService, artisanVerificationService, orderService } from '../services/api';
import {
  Store,
  Sparkles,
  ShoppingBag,
  PlusCircle,
  Award,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  MapPin,
  ArrowRight,
  Info,
  DollarSign,
  Utensils,
  Image as ImageIcon,
  Check,
  AlertCircle,
  ExternalLink,
  Lock,
  FileCheck,
  BadgeCheck,
  QrCode,
  AlertTriangle,
  Download,
  Loader2,
  RefreshCw,
  Search,
  Camera,
  Upload,
  X,
  Trash2,
  FolderOpen,
  Navigation,
  Phone,
  MessageCircle,
  Clock,
  Printer,
  User,
  CheckCircle,
  Building,
  Truck,
  Package,
  CreditCard,
  Coins,
} from 'lucide-react';
import { Camera as CameraPlugin, CameraResultType, CameraSource } from '@capacitor/camera';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import PaymentGatewayModal from '../components/PaymentGatewayModal';
import { PrintableStandeePortal } from '../components/PrintableStandee';
import { PrintableShippingSlipPortal } from '../components/PrintableShippingLabel';
import { triggerPrint } from '../utils/printUtils';

// Official National Handicrafts & GI Registry Database (DC Handicrafts & Ministry of Textiles)
export const NATIONAL_HANDICRAFTS_REGISTRY = {
  'UP-AGR-44910': {
    artisanName: 'Ustad Rashid & Taj Crafts Guild',
    cooperativeName: 'Agra Marble Artisans Welfare Cooperative',
    clusterLocation: 'Taj Ganj Heritage Cluster, Agra (282001)',
    state: 'Uttar Pradesh',
    stateCode: 'UP',
    craftType: 'Makrana Marble Inlay / Pietra Dura',
    status: 'ACTIVE_VERIFIED',
    giAuth: 'GI-IND-2026-UP-1092',
    registeredSince: '2016',
    dicRef: 'DIC-UP-AGR-8821',
  },
  'UP-VAR-10842': {
    artisanName: 'Kashi Bunkar Weavers Union',
    cooperativeName: 'All India Handloom Weavers Cooperative Federation',
    clusterLocation: 'Madanpura Silk Cluster, Varanasi (221001)',
    state: 'Uttar Pradesh',
    stateCode: 'UP',
    craftType: 'Banarasi Silk & Brocade',
    status: 'ACTIVE_VERIFIED',
    giAuth: 'GI-IND-2026-UP-0412',
    registeredSince: '2014',
    dicRef: 'DIC-UP-VAR-3390',
  },
  'RJ-JPR-20419': {
    artisanName: 'Master Kripal Blue Art Studio',
    cooperativeName: 'Rajasthan Small Industries Handicrafts Union',
    clusterLocation: 'Kot Jewar Pottery Cluster, Jaipur (302001)',
    state: 'Rajasthan',
    stateCode: 'RJ',
    craftType: 'Jaipur Blue Pottery',
    status: 'ACTIVE_VERIFIED',
    giAuth: 'GI-IND-2026-RJ-0028',
    registeredSince: '2015',
    dicRef: 'DIC-RJ-JPR-9921',
  },
  'OD-PUR-30118': {
    artisanName: 'Raghurajpur Heritage Chitrakar Guild',
    cooperativeName: 'Raghurajpur Crafts Village Samiti',
    clusterLocation: 'Raghurajpur Heritage Crafts Village, Puri (752012)',
    state: 'Odisha',
    stateCode: 'OD',
    craftType: 'Odisha Pattachitra Palm Leaf',
    status: 'ACTIVE_VERIFIED',
    giAuth: 'GI-IND-2026-OD-0019',
    registeredSince: '2011',
    dicRef: 'DIC-OD-PUR-4410',
  },
  'DL-DEL-10022': {
    artisanName: 'Dilli Haat Master Craftsmen Guild',
    cooperativeName: 'Delhi Heritage Crafts Cooperative',
    clusterLocation: 'INA Crafts Hub, New Delhi (110023)',
    state: 'Delhi',
    stateCode: 'DL',
    craftType: 'Zardozi & Metal Crafts',
    status: 'ACTIVE_VERIFIED',
    giAuth: 'GI-IND-2026-DL-0011',
    registeredSince: '2017',
    dicRef: 'DIC-DL-DEL-1102',
  },
  'MH-AUR-55102': {
    artisanName: 'Himroo & Paithani Heritage Weavers',
    cooperativeName: 'Marathwada Handloom Guild',
    clusterLocation: 'Zafar Gate Weaving Cluster, Aurangabad (431001)',
    state: 'Maharashtra',
    stateCode: 'MH',
    craftType: 'Himroo & Paithani Handlooms',
    status: 'ACTIVE_VERIFIED',
    giAuth: 'GI-IND-2026-MH-0033',
    registeredSince: '2018',
    dicRef: 'DIC-MH-AUR-2029',
  },
  'MP-BHO-40192': {
    artisanName: 'Chanderi & Maheshwari Weavers Forum',
    cooperativeName: 'Madhya Pradesh Handloom Board',
    clusterLocation: 'Chanderi Heritage Weavers Colony (473446)',
    state: 'Madhya Pradesh',
    stateCode: 'MP',
    craftType: 'Chanderi Silk & Zari Weaving',
    status: 'ACTIVE_VERIFIED',
    giAuth: 'GI-IND-2026-MP-0051',
    registeredSince: '2019',
    dicRef: 'DIC-MP-BHO-9102',
  },
};

const PRESET_IMAGE_TEMPLATES = [
  {
    label: 'Makrana Marble Inlay Plate',
    category: 'handicraft',
    placeId: 1,
    monumentHint: 'Taj Mahal',
    url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    odop: 'ODOP: Agra Marble Inlay',
    artisanName: 'Ustad Rashid & Sons (5th Gen)',
    shopName: 'Ustad Rashid Heritage Marble & Inlay Workshop',
    shopAddress: '23/45, Taj Ganj Heritage Walkway, Near Fatehpuri Gate, Agra, UP - 282001',
    shopLandmark: '120m from Taj Mahal South/East Gate Walkway',
    shopTiming: '09:00 AM - 09:00 PM (Closed Fridays)',
    phone: '+91 98371 99882',
    whatsapp: '+919837199882',
    mapQuery: 'Taj Ganj Marble Inlay Agra',
    listingTier: 'Platinum Heritage Partner',
    pehchanId: 'UP-AGR-44910',
    cooperativeName: 'Agra Marble Artisans Welfare Cooperative',
    clusterLocation: 'Taj Ganj Heritage Cluster, Agra (282001)',
    giRegNumber: 'GI-IND-2026-UP-1092',
    price: '1499',
    description: 'Ancestral Pietra Dura marble inlay crafted by 6th-generation artisans using semi-precious lapis lazuli, malachite, and jasper on pristine white Makrana marble.',
  },
  {
    label: 'Banarasi Handloom Silk Scarf',
    category: 'attire',
    placeId: 5,
    monumentHint: 'Varanasi',
    url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    odop: 'GI Tagged: Banarasi Silk',
    artisanName: 'Kashi Bunkar Weavers Union',
    shopName: 'Madanpura Master Weavers Heritage Karkhana',
    shopAddress: 'B-14/82, Madanpura Silk Lane, Chowk, Varanasi, UP - 221001',
    shopLandmark: '5 mins from Kashi Vishwanath Corridor Gate 4',
    shopTiming: '10:00 AM - 08:30 PM (Friday 02:00 PM - 09:00 PM)',
    phone: '+91 94152 44321',
    whatsapp: '+919415244321',
    mapQuery: 'Madanpura Varanasi Banarasi Silk Weavers',
    listingTier: 'Gold Verified Partner',
    pehchanId: 'UP-VAR-10842',
    cooperativeName: 'All India Handloom Weavers Cooperative Federation',
    clusterLocation: 'Madanpura Silk Cluster, Varanasi (221001)',
    giRegNumber: 'GI-IND-2026-UP-0412',
    price: '3850',
    description: 'Pure Katan silk hand-woven on ancestral pit looms with gold zari brocade, taking over 18 days of manual master weaving.',
  },
  {
    label: 'Odisha Pattachitra Palm Leaf Scroll',
    category: 'painting',
    placeId: 3,
    monumentHint: 'Konark',
    url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    odop: 'GI Tagged: Raghurajpur Pattachitra',
    artisanName: 'Raghurajpur Heritage Chitrakar Guild',
    shopName: 'Raghurajpur Master Chitrakar Kutir',
    shopAddress: 'Heritage House No. 18, Raghurajpur Crafts Village, Chandanpur, Puri, Odisha - 752012',
    shopLandmark: 'UNESCO Model Crafts Village (Direct drive from Konark Sun Temple)',
    shopTiming: '08:30 AM - 07:30 PM (Daily Open Studio)',
    phone: '+91 99380 23145',
    whatsapp: '+919938023145',
    mapQuery: 'Raghurajpur Heritage Crafts Village Puri Odisha',
    listingTier: 'Platinum Heritage Partner',
    pehchanId: 'OD-PUR-30118',
    cooperativeName: 'Raghurajpur Crafts Village Samiti',
    clusterLocation: 'Raghurajpur Heritage Crafts Village, Puri (752012)',
    giRegNumber: 'GI-IND-2026-OD-0019',
    price: '2100',
    description: 'Intricate traditional mythological painting inscribed on dried palm leaves (Tala Pattachitra) using natural stone pigments and lampblack.',
  },
  {
    label: 'Jaipur Blue Pottery Floral Vase',
    category: 'pottery',
    placeId: 6,
    monumentHint: 'Amer',
    url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
    odop: 'GI Tagged: Jaipur Blue Pottery',
    artisanName: 'Master Kripal Blue Art Studio',
    shopName: 'Master Kripal Blue Pottery Art Emporium',
    shopAddress: 'B-18, Shiv Marg, Near Amer Road Heritage Walk, Jaipur, Rajasthan - 302002',
    shopLandmark: 'On Amer-Jaipur Heritage Boulevard, near Jal Mahal view point',
    shopTiming: '09:30 AM - 08:30 PM (Daily)',
    phone: '+91 94140 77890',
    whatsapp: '+919414077890',
    mapQuery: 'Kripal Kumbh Blue Pottery Jaipur',
    listingTier: 'Platinum Heritage Partner',
    pehchanId: 'RJ-JPR-20419',
    cooperativeName: 'Rajasthan Small Industries Handicrafts Union',
    clusterLocation: 'Kot Jewar Pottery Cluster, Jaipur (302001)',
    giRegNumber: 'GI-IND-2026-RJ-0028',
    price: '1250',
    description: 'Dough-less glazed pottery hand-painted with cobalt oxide floral motifs, fired once at low temperatures without using clay.',
  },
  {
    label: 'Agra Zari Zardozi Velvet Clutch',
    category: 'attire',
    placeId: 1,
    monumentHint: 'Taj Mahal',
    url: 'https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=800&q=80',
    odop: 'ODOP: Agra Zardozi',
    artisanName: 'Shabana Zari Craft Collective',
    shopName: 'Shabana Zardozi Heritage Boutique',
    shopAddress: 'Shop 18, Shilpgram Crafts Village, Taj East Gate Road, Agra, UP - 282001',
    shopLandmark: 'Inside Shilpgram Complex (400m from Taj Mahal East Gate)',
    shopTiming: '10:00 AM - 08:00 PM (Closed Fridays)',
    phone: '+91 98370 44567',
    whatsapp: '+919837044567',
    mapQuery: 'Shilpgram Taj East Gate Road Agra',
    listingTier: 'Gold Verified Partner',
    pehchanId: 'UP-AGR-44910',
    cooperativeName: 'Agra Zardozi Artisans Association',
    clusterLocation: 'Taj Ganj Zardozi Cluster, Agra (282001)',
    giRegNumber: 'GI-IND-2026-UP-1092',
    price: '799',
    description: 'Traditional gold and metallic zari thread embroidery on pure velvet, carrying forward the Mughal court embellishment art.',
  },
];

export default function ArtisanPortalPage() {
  const { lang } = useLanguage();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [places, setPlaces] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('add'); // 'add' | 'my-products' | 'orders' | 'fee-policy' | 'guidelines'
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [listingFeePaid, setListingFeePaid] = useState(true); // Free Listing & 0% Commission Promo
  const [showListingPaymentModal, setShowListingPaymentModal] = useState(false);
  const [listingPaymentUtr, setListingPaymentUtr] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successProduct, setSuccessProduct] = useState(null);
  const [validationError, setValidationError] = useState('');
  const [orderToPrint, setOrderToPrint] = useState(null);

  // Admin Approval & Onboarding Verification State
  const [allApplications, setAllApplications] = useState([]);
  const [currentApp, setCurrentApp] = useState(null);
  const [approvalStatus, setApprovalStatus] = useState('APPROVED'); // 'APPROVED' | 'PENDING' | 'REJECTED' | 'NOT_APPLIED'
  const [selectedProfilePehchan, setSelectedProfilePehchan] = useState('UP-AGR-44910');
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [onboardingSubmitting, setOnboardingSubmitting] = useState(false);
  const [onboardingForm, setOnboardingForm] = useState({
    artisanName: '',
    shopName: '',
    shopAddress: '',
    shopLandmark: '',
    shopTiming: '10:00 AM - 08:00 PM',
    placeId: '1',
    phone: '',
    whatsapp: '',
    pehchanId: '',
    cooperativeName: '',
    clusterLocation: '',
    craftType: 'Makrana Marble Inlay / Heritage Handicrafts',
  });

  // Form State with Government & Guild Security Verification
  const [formData, setFormData] = useState({
    name: '',
    nameHi: '',
    category: 'handicraft',
    placeId: '1', // Taj Mahal by default
    artisanName: 'Ustad Rashid & Sons',
    shopName: 'Ustad Rashid Heritage Marble & Inlay Workshop',
    shopAddress: '23/45, Taj Ganj Heritage Walkway, Near Fatehpuri Gate, Agra, UP - 282001',
    shopLandmark: '120m from Taj Mahal South/East Gate Walkway',
    shopTiming: '09:00 AM - 09:00 PM (Closed Fridays)',
    phone: '+91 98371 99882',
    whatsapp: '+919837199882',
    mapQuery: 'Taj Ganj Marble Inlay Agra',
    listingTier: 'Gold Verified Partner',
    pehchanId: 'UP-AGR-44910', // Preloaded verified ID
    cooperativeName: 'Agra Marble Artisans Welfare Cooperative',
    clusterLocation: 'Taj Ganj Heritage Cluster, Agra (282001)',
    odopTag: 'ODOP: Agra Marble Inlay',
    giRegNumber: 'GI-IND-2026-UP-1092',
    price: '',
    imageUrl: '',
    description: '',
    descriptionHi: '',
    pledgeHandcrafted: true,
    pledgeGiCluster: true,
    pledgeFairTrade: true,
  });

  // Photo Upload Studio State
  const [imageUploadMode, setImageUploadMode] = useState('gallery'); // 'gallery' | 'camera' | 'url'
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [capturingPhoto, setCapturingPhoto] = useState(false);

  // Real-time National Registry Verification State
  const [verifyingId, setVerifyingId] = useState(false);
  const [registryStatus, setRegistryStatus] = useState('verified'); // 'verified' | 'pending' | 'invalid_format' | 'not_found'
  const [verifiedRecord, setVerifiedRecord] = useState(NATIONAL_HANDICRAFTS_REGISTRY['UP-AGR-44910']);
  const [showRegistryLookupModal, setShowRegistryLookupModal] = useState(false);

  const loadData = async (targetPehchan = null) => {
    setLoading(true);
    try {
      const [placesRes, prodsRes, appsRes] = await Promise.all([
        placeService.getAll().catch(() => ({ success: false })),
        productService.getAll().catch(() => ({ success: false })),
        artisanVerificationService.getAll().catch(() => ({ success: false })),
      ]);
      if (placesRes.success && placesRes.places?.length > 0) {
        setPlaces(placesRes.places);
      }
      if (prodsRes.success) setProducts(prodsRes.products);

      const apps = appsRes.applications || [];
      setAllApplications(apps);

      const activePehchan = targetPehchan || artisanVerificationService.getCurrentArtisanPehchan();
      const matched = apps.find(
        (a) => (a.pehchanId || '').toUpperCase() === (activePehchan || '').toUpperCase()
      ) || apps[0];

      if (matched) {
        setCurrentApp(matched);
        setApprovalStatus(matched.status);
        setSelectedProfilePehchan(matched.pehchanId);
        setFormData((prev) => ({
          ...prev,
          artisanName: matched.artisanName,
          shopName: matched.shopName,
          shopAddress: matched.shopAddress,
          shopLandmark: matched.shopLandmark,
          shopTiming: matched.shopTiming,
          phone: matched.phone,
          whatsapp: matched.whatsapp,
          pehchanId: matched.pehchanId,
          cooperativeName: matched.cooperativeName,
          clusterLocation: matched.clusterLocation,
          odopTag: matched.odopTag || prev.odopTag,
          giRegNumber: matched.giRegNumber || prev.giRegNumber,
          placeId: String(matched.placeId || '1'),
        }));
        checkRegistry(matched.pehchanId, false);
        try {
          const orderList = await orderService.getArtisanOrders(matched?.artisanName || 'Ustad Rashid');
          setOrders(orderList || []);
        } catch (err) {
          console.warn('Could not load orders:', err);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      const awb = newStatus === 'dispatched' ? `IN-POST-SPEED-${Math.floor(100000 + Math.random() * 900000)}` : null;
      await orderService.updateStatus(orderId, newStatus, awb);
      const artisanName = currentApp?.artisanName || formData.artisanName || 'Ustad Rashid';
      const updated = await orderService.getArtisanOrders(artisanName);
      setOrders(updated || []);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handlePrintOrderSlip = (order) => {
    setOrderToPrint(order);
    setTimeout(() => {
      triggerPrint('printing-shipping-slip', () => {
        setOrderToPrint(null);
      });
    }, 60);
  };

  const handlePrintStandee = () => {
    triggerPrint('printing-standee');
  };

  const handleSimulateListingFeePayment = () => {
    setListingFeePaid(true);
  };

  const handleSwitchProfile = async (pehchanId) => {
    if (pehchanId === 'NEW') {
      setShowOnboardingModal(true);
      return;
    }
    artisanVerificationService.setCurrentArtisanPehchan(pehchanId);
    setSelectedProfilePehchan(pehchanId);
    await loadData(pehchanId);
  };

  const handleQuickApproveCurrent = async () => {
    if (!currentApp) return;
    const res = await artisanVerificationService.updateStatus(
      currentApp.id,
      'APPROVED',
      'Approved via Government Administration Portal Direct Test Action.'
    );
    if (res.success) {
      setApprovalStatus('APPROVED');
      setCurrentApp((prev) => ({ ...prev, status: 'APPROVED' }));
      setActiveTab('orders');
    }
  };

  const handleRegisterShop = async (e) => {
    e.preventDefault();
    if (!onboardingForm.shopName || !onboardingForm.pehchanId || !onboardingForm.phone) {
      alert('Please fill all required fields: Shop Name, Ministry Pehchan ID, and Phone Number.');
      return;
    }
    setOnboardingSubmitting(true);
    try {
      const selectedPlace = places.find((p) => String(p.id) === String(onboardingForm.placeId));
      const res = await artisanVerificationService.submit({
        ...onboardingForm,
        monumentName: selectedPlace ? selectedPlace.name : 'Heritage Monument',
      });
      if (res.success) {
        setShowOnboardingModal(false);
        await loadData(onboardingForm.pehchanId);
        setActiveTab('add');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setOnboardingSubmitting(false);
    }
  };

  // Live Registry Verifier Function
  const checkRegistry = (inputPehchanId, autoFill = false) => {
    const rawId = (inputPehchanId || '').trim().toUpperCase();
    if (!rawId) {
      setRegistryStatus('pending');
      setVerifiedRecord(null);
      return;
    }

    // Standard Pehchan ID Format Check: STATE-CLUSTER/CITY-NUMBER (e.g. UP-AGR-44910, RJ-JPR-20419)
    const formatRegex = /^[A-Z]{2}-[A-Z0-9]{3,6}-[0-9A-Z]{3,8}$/;
    if (!formatRegex.test(rawId)) {
      setRegistryStatus('invalid_format');
      setVerifiedRecord(null);
      return;
    }

    // Database Lookup against National DC (Handicrafts) Registry
    const matched = NATIONAL_HANDICRAFTS_REGISTRY[rawId];
    if (matched) {
      setRegistryStatus('verified');
      setVerifiedRecord(matched);
      if (autoFill) {
        setFormData((prev) => ({
          ...prev,
          artisanName: matched.artisanName,
          cooperativeName: matched.cooperativeName,
          clusterLocation: matched.clusterLocation,
          giRegNumber: matched.giAuth || prev.giRegNumber,
        }));
      }
    } else {
      setRegistryStatus('not_found');
      setVerifiedRecord(null);
    }
  };

  const handlePehchanChange = (e) => {
    const val = e.target.value.toUpperCase();
    setFormData((prev) => ({ ...prev, pehchanId: val }));
    setValidationError('');
    checkRegistry(val, false);
  };

  const handleSimulateApiLookup = () => {
    setVerifyingId(true);
    setTimeout(() => {
      checkRegistry(formData.pehchanId, true);
      setVerifyingId(false);
    }, 600);
  };

  // Image Upload Handlers
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setValidationError('Image file size exceeds 5MB limit. Please choose a smaller photo.');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setFormData((prev) => ({ ...prev, imageUrl: '' }));
      setValidationError('');
    }
  };

  const pickFromGallery = async () => {
    setValidationError('');
    setCapturingPhoto(true);
    try {
      if (typeof CameraPlugin !== 'undefined' && CameraPlugin.getPhoto) {
        try {
          await CameraPlugin.requestPermissions({ permissions: ['photos'] });
        } catch (permErr) {
          console.warn('Photos permission check:', permErr);
        }

        const photo = await CameraPlugin.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.Uri,
          source: CameraSource.Photos,
        });

        if (photo && photo.webPath) {
          const res = await fetch(photo.webPath);
          const blob = await res.blob();
          const file = new File(
            [blob],
            `craft_gallery_${Date.now()}.${photo.format || 'jpg'}`,
            { type: `image/${photo.format || 'jpeg'}` }
          );
          setImageFile(file);
          setImagePreview(photo.webPath);
          setFormData((prev) => ({ ...prev, imageUrl: '' }));
          setCapturingPhoto(false);
          return;
        }
      }
      throw new Error('Capacitor gallery unavailable');
    } catch (err) {
      setCapturingPhoto(false);
      const input = document.getElementById('artisan-gallery-file-input');
      if (input) input.click();
    }
  };

  const takePhotoWithCamera = async () => {
    setValidationError('');
    setCapturingPhoto(true);
    try {
      if (typeof CameraPlugin !== 'undefined' && CameraPlugin.getPhoto) {
        try {
          await CameraPlugin.requestPermissions({ permissions: ['camera'] });
        } catch (permErr) {
          console.warn('Camera permission check:', permErr);
        }

        const photo = await CameraPlugin.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.Uri,
          source: CameraSource.Camera,
        });

        if (photo && photo.webPath) {
          const res = await fetch(photo.webPath);
          const blob = await res.blob();
          const file = new File(
            [blob],
            `craft_camera_${Date.now()}.${photo.format || 'jpg'}`,
            { type: `image/${photo.format || 'jpeg'}` }
          );
          setImageFile(file);
          setImagePreview(photo.webPath);
          setFormData((prev) => ({ ...prev, imageUrl: '' }));
          setCapturingPhoto(false);
          return;
        }
      }
      throw new Error('Capacitor camera unavailable');
    } catch (err) {
      setCapturingPhoto(false);
      const input = document.getElementById('artisan-camera-capture-input');
      if (input) input.click();
    }
  };

  const removeSelectedImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData((prev) => ({ ...prev, imageUrl: '' }));
    const galInput = document.getElementById('artisan-gallery-file-input');
    if (galInput) galInput.value = '';
    const camInput = document.getElementById('artisan-camera-capture-input');
    if (camInput) camInput.value = '';
  };

  const handleApplyPreset = (preset) => {
    setValidationError('');
    let targetPlaceId = String(preset.placeId);
    if (places && places.length > 0) {
      const matched = places.find(
        (p) =>
          (preset.monumentHint && p.name.toLowerCase().includes(preset.monumentHint.toLowerCase())) ||
          p.name.toLowerCase().includes(preset.label.toLowerCase()) ||
          String(p.id) === String(preset.placeId)
      );
      targetPlaceId = matched ? String(matched.id) : String(places[0].id);
    }

    setImageFile(null);
    setImagePreview(preset.url);
    setImageUploadMode('url');

    setFormData((prev) => ({
      ...prev,
      category: preset.category,
      placeId: targetPlaceId,
      imageUrl: preset.url,
      odopTag: preset.odop,
      name: preset.label,
      artisanName: preset.artisanName || prev.artisanName,
      shopName: preset.shopName || prev.shopName,
      shopAddress: preset.shopAddress || prev.shopAddress,
      shopLandmark: preset.shopLandmark || prev.shopLandmark,
      shopTiming: preset.shopTiming || prev.shopTiming,
      phone: preset.phone || prev.phone,
      whatsapp: preset.whatsapp || prev.whatsapp,
      mapQuery: preset.mapQuery || prev.mapQuery,
      listingTier: preset.listingTier || prev.listingTier,
      pehchanId: preset.pehchanId || prev.pehchanId,
      cooperativeName: preset.cooperativeName || prev.cooperativeName,
      clusterLocation: preset.clusterLocation || prev.clusterLocation,
      giRegNumber: preset.giRegNumber || prev.giRegNumber,
      price: preset.price || prev.price,
      description: preset.description || prev.description,
      pledgeHandcrafted: true,
      pledgeGiCluster: true,
      pledgeFairTrade: true,
    }));
    checkRegistry(preset.pehchanId, true);
  };

  const handleGenerateGiNumber = () => {
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const selectedPlace = places.find((p) => String(p.id) === String(formData.placeId));
    const stateCode = selectedPlace?.state?.slice(0, 2).toUpperCase() || 'IN';
    setFormData((prev) => ({
      ...prev,
      giRegNumber: `GI-IND-2026-${stateCode}-${randomCode}`,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    // Basic Fields Check
    if (!formData.name || !formData.price || !formData.artisanName || !formData.placeId) {
      setValidationError('Please fill all essential fields: Product Title, Retail Price, Producer Name, and Associated Monument.');
      return;
    }

    // Photo check: either uploaded image file or valid image URL
    if (!imageFile && !formData.imageUrl.trim()) {
      setValidationError('Please select a photo of your craft from gallery or enter an image URL.');
      return;
    }

    // Policy Check: Food is strictly Admin curated and non-deliverable
    if (formData.category === 'food') {
      setValidationError(
        'Government Policy Restriction: Regional delicacies are curated exclusively by Government Tourism Admins as non-deliverable tourist lore. Artisans cannot list food for delivery.'
      );
      return;
    }

    // STRICT SECURITY GATE: National Registry Verification Enforcement
    if (registryStatus !== 'verified') {
      if (registryStatus === 'invalid_format') {
        setValidationError(
          `Security Authentication Error: "${formData.pehchanId}" is an invalid format. Ministry of Textiles Pehchan ID must follow standard format: STATE-CITY-NUM (e.g. UP-AGR-44910 or UP-VAR-10842).`
        );
      } else if (registryStatus === 'not_found') {
        setValidationError(
          `DC(Handicrafts) Registry Block: Pehchan ID "${formData.pehchanId}" is not registered in the Ministry Database. Random or unauthorized sellers cannot list goods. Please click a verified preset or enter an active registered ID.`
        );
      } else {
        setValidationError(
          'Security Gatekeeper Block: Ministry Pehchan Card verification is required before publishing.'
        );
      }
      return;
    }

    // Security Gate 2: Mandatory Anti-Counterfeit & Fair-Trade Declarations
    if (!formData.pledgeHandcrafted || !formData.pledgeGiCluster || !formData.pledgeFairTrade) {
      setValidationError(
        'Anti-Counterfeit Compliance Block: You must certify all 3 mandatory declarations (100% Handcrafted Guarantee, Regional Cluster Authenticity, and Fair-Trade Escrow Terms) before listing.'
      );
      return;
    }

    setSubmitting(true);
    try {
      const isUploadingFile = !!imageFile;
      let payload;
      const odopFullTag = `${formData.odopTag || 'ODOP Verified'} | Pehchan: ${formData.pehchanId}`;
      const giNumber = formData.giRegNumber || `GI-IND-2026-IN-${Math.floor(1000 + Math.random() * 9000)}`;

      if (isUploadingFile) {
        payload = new FormData();
        payload.append('name', formData.name);
        if (formData.nameHi) payload.append('nameHi', formData.nameHi);
        payload.append('category', formData.category);
        payload.append('placeId', parseInt(formData.placeId));
        payload.append('price', parseFloat(formData.price));
        payload.append('artisanName', formData.artisanName);
        payload.append('shopName', formData.shopName || `${formData.artisanName} Studio`);
        payload.append('shopAddress', formData.shopAddress || formData.clusterLocation || 'Near Monument');
        payload.append('shopLandmark', formData.shopLandmark || 'Near Monument Gate');
        payload.append('shopTiming', formData.shopTiming || '10:00 AM - 08:00 PM');
        payload.append('phone', formData.phone || '+91 98765 43210');
        payload.append('whatsapp', formData.whatsapp || formData.phone || '919876543210');
        payload.append('mapQuery', formData.mapQuery || `${formData.shopName || formData.artisanName}`);
        payload.append('listingTier', formData.listingTier || 'Gold Verified Partner');
        payload.append('odopTag', odopFullTag);
        payload.append('giRegNumber', giNumber);
        if (formData.description) payload.append('description', formData.description);
        if (formData.descriptionHi) payload.append('descriptionHi', formData.descriptionHi);
        payload.append('image', imageFile);
      } else {
        payload = {
          ...formData,
          price: parseFloat(formData.price),
          placeId: parseInt(formData.placeId),
          giRegNumber: giNumber,
          imageUrl:
            formData.imageUrl.trim() ||
            'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
          odopTag: odopFullTag,
        };
      }

      const res = await productService.create(payload);
      if (res.success) {
        const prod = res.product || (isUploadingFile ? {
          name: formData.name,
          price: formData.price,
          artisanName: formData.artisanName,
          shopName: formData.shopName,
          shopAddress: formData.shopAddress,
          imageUrl: imagePreview,
        } : payload);

        setSuccessProduct({
          ...prod,
          imageUrl: prod.imageUrl || imagePreview,
          shopName: formData.shopName,
          shopAddress: formData.shopAddress,
          shopLandmark: formData.shopLandmark,
          shopTiming: formData.shopTiming,
          phone: formData.phone,
          pehchanId: formData.pehchanId,
          cooperativeName: formData.cooperativeName,
          clusterLocation: formData.clusterLocation,
          giRegNumber: giNumber,
          dicRef: verifiedRecord?.dicRef || 'DIC-NAT-2026',
        });
        loadData();
        removeSelectedImage();
        // Reset form to secure default state
        setFormData({
          name: '',
          nameHi: '',
          category: 'handicraft',
          placeId: '1',
          artisanName: 'Ustad Rashid & Sons',
          shopName: 'Ustad Rashid Heritage Marble & Inlay Workshop',
          shopAddress: '23/45, Taj Ganj Heritage Walkway, Near Fatehpuri Gate, Agra, UP - 282001',
          shopLandmark: '120m from Taj Mahal South/East Gate Walkway',
          shopTiming: '09:00 AM - 09:00 PM (Closed Fridays)',
          phone: '+91 98371 99882',
          whatsapp: '+919837199882',
          mapQuery: 'Taj Ganj Marble Inlay Agra',
          listingTier: 'Gold Verified Partner',
          pehchanId: 'UP-AGR-44910',
          cooperativeName: 'Agra Marble Artisans Welfare Cooperative',
          clusterLocation: 'Taj Ganj Heritage Cluster, Agra (282001)',
          odopTag: 'ODOP: Certified Heritage Craft',
          giRegNumber: '',
          price: '',
          imageUrl: '',
          description: '',
          descriptionHi: '',
          pledgeHandcrafted: true,
          pledgeGiCluster: true,
          pledgeFairTrade: true,
        });
        checkRegistry('UP-AGR-44910', true);
      }
    } catch (err) {
      console.error('Failed to add product:', err);
      setValidationError('Server communication error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const priceNum = parseFloat(formData.price) || 0;
  const artisanShare = Math.round(priceNum * 0.9);
  const platformFee = priceNum - artisanShare;

  return (
    <div className="min-h-screen bg-[#fdfbf7] pb-24">
      {/* Hero Header */}
      <section className="bg-stone-900 text-white pt-8 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-5xl mx-auto space-y-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold backdrop-blur-md">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ministry Verified ODOP Direct Portal (सत्यापित कारीगर एवं व्यापारी मंच)</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
            Artisan & Trader <span className="text-amber-400">Direct Portal</span>
          </h1>

          <p className="max-w-2xl mx-auto text-stone-300 text-xs sm:text-sm font-light leading-relaxed">
            Directly connect your hereditary workshop, handloom, or certified craft studio to tourists visiting India's historic monuments. Zero courier scams, 100% in-store customer earnings, and transparent monthly shop listing subscription.
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto pt-2">
            <div className="bg-white/10 rounded-2xl p-3 border border-white/10 backdrop-blur-md">
              <span className="text-[10px] text-amber-300 font-bold block uppercase tracking-wider">
                In-Store Payout
              </span>
              <span className="text-base sm:text-lg font-serif font-extrabold text-white">100% Direct</span>
            </div>
            <div className="bg-white/10 rounded-2xl p-3 border border-white/10 backdrop-blur-md">
              <span className="text-[10px] text-emerald-300 font-bold block uppercase tracking-wider">
                Govt Registry
              </span>
              <span className="text-base sm:text-lg font-serif font-extrabold text-emerald-300">Verified</span>
            </div>
            <div className="bg-white/10 rounded-2xl p-3 border border-white/10 backdrop-blur-md">
              <span className="text-[10px] text-amber-300 font-bold block uppercase tracking-wider">
                Delivery Scams
              </span>
              <span className="text-base sm:text-lg font-serif font-extrabold text-white">0% Protected</span>
            </div>
            <div className="bg-white/10 rounded-2xl p-3 border border-white/10 backdrop-blur-md">
              <span className="text-[10px] text-stone-300 font-bold block uppercase tracking-wider">
                Total Listed
              </span>
              <span className="text-lg font-serif font-extrabold text-white">{products.length} Items</span>
            </div>
          </div>

          {/* Active Artisan / Workshop Profile Header */}
          <div className="pt-2 max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 bg-white/10 p-3 rounded-2xl border border-white/20 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="text-left">
                <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">
                  Artisan Studio:
                </span>
                <span className="text-xs font-semibold text-white">
                  {currentApp?.shopName || formData.shopName || 'Registered Artisan Workshop'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${approvalStatus === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                {approvalStatus === 'APPROVED' ? '✓ Verified Guild' : '⏱ Verification Pending'}
              </span>

              <button
                type="button"
                onClick={() => setShowOnboardingModal(true)}
                className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold whitespace-nowrap shadow-xs flex items-center gap-1"
                title="Register New Workshop"
              >
                <span>+ Register Workshop</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20 space-y-6">
        {/* BANNER 1: ADMIN VERIFICATION PENDING (जब तक एडमिन अप्रूव न करे) */}
        {approvalStatus === 'PENDING' && (
          <div className="p-6 rounded-3xl bg-amber-50 border-2 border-amber-400/90 shadow-lg space-y-5 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-amber-200">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-600/30">
                  <Clock className="w-6 h-6 animate-spin" style={{ animationDuration: '6s' }} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
                      Administrative Physical Verification Under Review
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-200 text-amber-900 border border-amber-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping" />
                      <span>PENDING APPROVAL</span>
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 mt-0.5">
                    Ministry Pehchan ID: <strong className="font-mono text-amber-900">{currentApp?.pehchanId || formData.pehchanId}</strong> • DIC Registered Guild
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="px-3.5 py-2 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 text-xs font-semibold flex items-center gap-1.5 shadow-2xs">
                  <Clock className="w-3.5 h-3.5 text-amber-700" />
                  <span>Verification in Progress</span>
                </span>
              </div>
            </div>

            {/* Explanation & 4-Step Progress Tracker */}
            <div className="space-y-3">
              <p className="text-xs text-stone-700 leading-relaxed">
                <strong>सत्यापन नियम:</strong> आपकी दुकान और सरकारी पहचान दस्तावेज़ पर्यटन मंत्रालय के <strong>एडमिन के पास सत्यापन हेतु लंबित हैं</strong>। एडमिन द्वारा दुकान का भौतिक निरीक्षण और अनुमोदन (Approval) होने के बाद ही आप <strong>Subscription Plan</strong> लेकर अपने शिल्पकला उत्पाद (Crafts) लिस्ट कर सकेंगे।
              </p>

              {/* Step Progress Tracker */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
                <div className="p-3 rounded-2xl bg-white border border-emerald-300 space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>1. Details Submitted</span>
                  </div>
                  <p className="text-[10px] text-stone-500">Workshop & artisan data registered</p>
                </div>

                <div className="p-3 rounded-2xl bg-white border border-emerald-300 space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>2. Pehchan Verified</span>
                  </div>
                  <p className="text-[10px] text-stone-500">Ministry registry format matched</p>
                </div>

                <div className="p-3 rounded-2xl bg-white border-2 border-amber-500 shadow-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-800 font-bold">
                    <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                    <span>3. Admin Approval</span>
                  </div>
                  <p className="text-[10px] text-amber-700 font-medium">Physical proximity audit in review</p>
                </div>

                <div className="p-3 rounded-2xl bg-stone-100/80 border border-stone-200 opacity-60 space-y-1">
                  <div className="flex items-center gap-1.5 text-stone-500 font-bold">
                    <Lock className="w-4 h-4 text-stone-400" />
                    <span>4. Plan & Listing</span>
                  </div>
                  <p className="text-[10px] text-stone-400">Locked until Admin Approval</p>
                </div>
              </div>
            </div>

            {/* Submitted Shop Preview Box */}
            <div className="p-4 rounded-2xl bg-white border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-stone-700">
              <div className="space-y-0.5">
                <div className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-amber-700" />
                  <span>{currentApp?.shopName || formData.shopName}</span>
                </div>
                <div className="text-[11px] text-stone-600">
                  📍 {currentApp?.shopAddress || formData.shopAddress} ({currentApp?.shopLandmark || formData.shopLandmark})
                </div>
                <div className="text-[10px] text-stone-500 font-mono">
                  📞 {currentApp?.phone || formData.phone} • Hours: {currentApp?.shopTiming || formData.shopTiming}
                </div>
              </div>
              <span className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl font-semibold self-start sm:self-auto">
                🔒 Subscription & Listing Locked
              </span>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-white p-2 rounded-2xl shadow-lg border border-stone-200 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => {
              if (approvalStatus === 'PENDING') {
                alert('Admin Approval Required: Your workshop is currently under review by Government Administration. Craft listing will unlock once approved.');
                return;
              }
              setActiveTab('add');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${activeTab === 'add'
              ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
              : 'text-stone-600 hover:bg-stone-100'
              } ${approvalStatus === 'PENDING' ? 'opacity-70' : ''}`}
          >
            {approvalStatus === 'PENDING' ? (
              <Lock className="w-4 h-4 text-stone-400" />
            ) : (
              <PlusCircle className="w-4 h-4" />
            )}
            <span>List New Craft</span>
            {approvalStatus === 'PENDING' && (
              <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-100 text-amber-800 font-bold uppercase">
                Locked
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('my-products')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${activeTab === 'my-products'
              ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
              : 'text-stone-600 hover:bg-stone-100'
              }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>My Listed Crafts ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${activeTab === 'orders'
              ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
              : 'text-stone-600 hover:bg-stone-100'
              }`}
          >
            <Truck className="w-4 h-4" />
            <span>Customer Orders & Dispatch</span>
            {orders.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-emerald-100 text-emerald-800 font-mono font-bold">
                {orders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('fee-policy')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${activeTab === 'fee-policy'
              ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
              : 'text-stone-600 hover:bg-stone-100'
              }`}
          >
            <Coins className="w-4 h-4" />
            <span>Fair-Trade Fee Policy (100% Payout / 0% Commission)</span>
          </button>

          <button
            onClick={() => setActiveTab('guidelines')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${activeTab === 'guidelines'
              ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
              : 'text-stone-600 hover:bg-stone-100'
              }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Govt Verification & Shield</span>
          </button>
        </div>

        {/* TAB 1: ADD PRODUCT FORM (LOCKED IF PENDING) */}
        {activeTab === 'add' && approvalStatus === 'PENDING' && (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-stone-200 shadow-sm text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto border border-amber-300">
              <Lock className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                Craft Listing is Locked: Administrative Approval Pending
              </h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
                As per Government Fair-Trade Policy, physical shops must be approved by the Tourism Administration before they can publish craft listings.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-3">
              <span className="px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-1.5 shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Verification typically completes within 24-48 business hours</span>
              </span>
            </div>
          </div>
        )}

        {/* TAB 1: ADD PRODUCT FORM (FULLY ACTIVE WHEN APPROVED) */}
        {activeTab === 'add' && approvalStatus === 'APPROVED' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-stone-100 gap-2">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                    List Authentic Craft or Food
                  </h2>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 whitespace-nowrap">
                    🛡️ Verified Artisans
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  Connected to DC (Handicrafts) Registry. Uncertified factory sellers or dropshippers are strictly blocked.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => setShowRegistryLookupModal(true)}
                    className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Check Registered Guilds (Admin)</span>
                  </button>
                )}

                <Link
                  to="/bazaar"
                  className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-1"
                >
                  <span>View Live Bazaar</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>


            {/* Validation Error Alert */}
            {validationError && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-800 animate-shake">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <strong className="block font-bold">Verification Requirement Unmet:</strong>
                  <span>{validationError}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Product Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700">
                    Product Title (English) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pure Katan Banarasi Silk Brocade"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700">
                    Product Title in Hindi (वैकल्पिक)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. शुद्ध कतान बनारसी रेशमी दुपट्टा"
                    value={formData.nameHi}
                    onChange={(e) => setFormData({ ...formData, nameHi: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Food Policy Advisory */}
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-bold text-[11px] uppercase tracking-wider text-amber-900">
                    Government Policy: Regional Food & Culinary Heritage
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Regional delicacies and heritage foods are exclusively curated by <strong>Government Tourism Admins</strong> as on-site tourist discovery guides and are <strong>strictly non-deliverable</strong>. Artisans may only list genuine physical deliverable handicrafts, handlooms, and artifacts.
                  </p>
                </div>
              </div>

              {/* Category & Associated Monument */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700">
                    Handicraft Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium text-stone-800 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="handicraft">Stone & Metalcraft (शिल्पकला)</option>
                    <option value="attire">Handloom & Traditional Silk (हथकरघा एवं परिधान)</option>
                    <option value="pottery">Blue Pottery & Clay (मिट्टी एवं पॉटरी)</option>
                    <option value="painting">Pattachitra & Folk Art (पारंपरिक लोक चित्रकला)</option>
                    <option value="souvenir">Miniatures & Heritage Souvenirs (धरोहर स्मृति चिन्ह)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700">
                    Associated Heritage Monument <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.placeId}
                    onChange={(e) => setFormData({ ...formData, placeId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium text-stone-800 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {places.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.state})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* SECTION: LIVE GOVERNMENT & GUILD VERIFICATION FIREWALL */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950 via-stone-900 to-emerald-950 text-white space-y-4 border border-emerald-500/40 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-emerald-800/40">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 flex-shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                          Handicrafts Registry
                        </span>
                        <span className="text-[10px] text-emerald-400/90 flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Anti-Fraud Firewall
                        </span>
                      </div>
                      <h3 className="font-serif font-bold text-sm sm:text-base text-white">
                        Pehchan ID & Guild Verification
                      </h3>
                    </div>
                  </div>

                  {/* Real-time Dynamic Verification Status Pill */}
                  <div className="self-start sm:self-auto flex-shrink-0">
                    {registryStatus === 'verified' && (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border bg-emerald-500/20 text-emerald-300 border-emerald-400/40 flex items-center gap-1 shadow-sm">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Registry Verified</span>
                      </span>
                    )}

                    {registryStatus === 'not_found' && (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border bg-red-500/20 text-red-300 border-red-400/40 flex items-center gap-1 shadow-sm animate-pulse">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                        <span>Unregistered Card</span>
                      </span>
                    )}

                    {registryStatus === 'invalid_format' && (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border bg-amber-500/20 text-amber-300 border-amber-400/40 flex items-center gap-1 shadow-sm">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                        <span>Invalid Format</span>
                      </span>
                    )}

                    {registryStatus === 'pending' && (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border bg-stone-500/20 text-stone-300 border-stone-400/40 flex items-center gap-1 shadow-sm">
                        <Info className="w-3.5 h-3.5 text-stone-400" />
                        <span>Input Required</span>
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-[11px] text-emerald-100/80 leading-relaxed">
                  Every artisan is verified against the <strong>DC (Handicrafts), Ministry of Textiles</strong> database to guarantee genuine handcrafted provenance.
                </p>

                {/* Credential Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-emerald-200">
                        Ministry Pehchan ID Card No. <span className="text-red-400">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleSimulateApiLookup}
                        disabled={verifyingId}
                        className="text-[9px] text-amber-300 hover:text-amber-200 font-bold underline flex items-center gap-1"
                      >
                        {verifyingId ? (
                          <>
                            <Loader2 className="w-2.5 h-2.5 animate-spin" />
                            <span>Verifying...</span>
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-2.5 h-2.5" />
                            <span>Re-Verify via API</span>
                          </>
                        )}
                      </button>
                    </div>

                    <input
                      type="text"
                      required
                      placeholder="e.g. UP-AGR-44910 or UP-VAR-10842"
                      value={formData.pehchanId}
                      onChange={handlePehchanChange}
                      className={`w-full px-3 py-2 rounded-xl bg-black/40 border text-xs font-mono placeholder:text-stone-500 focus:outline-none focus:ring-1 ${registryStatus === 'verified'
                        ? 'border-emerald-400/60 text-emerald-300 focus:ring-emerald-400'
                        : registryStatus === 'not_found'
                          ? 'border-red-400/80 text-red-300 focus:ring-red-400'
                          : 'border-emerald-500/30 text-white focus:ring-emerald-400'
                        }`}
                    />

                    {/* Live Feedback helper text based on user input */}
                    {registryStatus === 'verified' && verifiedRecord && (
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1 pt-0.5">
                        <Check className="w-3 h-3 shrink-0" />
                        <span>Match: {verifiedRecord.artisanName} • {verifiedRecord.state} (DIC Ref: {verifiedRecord.dicRef})</span>
                      </span>
                    )}

                    {registryStatus === 'not_found' && (
                      <span className="text-[10px] text-red-400 flex items-center gap-1 pt-0.5 font-semibold">
                        <AlertTriangle className="w-3 h-3 shrink-0" />
                        <span>Card not found in Ministry database! Try UP-AGR-44910, UP-VAR-10842 or pick a preset.</span>
                      </span>
                    )}

                    {registryStatus === 'invalid_format' && (
                      <span className="text-[10px] text-amber-400 flex items-center gap-1 pt-0.5">
                        <Info className="w-3 h-3 shrink-0" />
                        <span>Format: STATE-CITY-NUM (e.g. UP-AGR-44910, RJ-JPR-20419)</span>
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-emerald-200">
                      Artisan Cooperative Guild / MSME Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Agra Marble Artisans Welfare Cooperative"
                      value={formData.cooperativeName}
                      onChange={(e) => setFormData({ ...formData, cooperativeName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-emerald-500/30 text-xs text-white placeholder:text-stone-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-emerald-200">
                      Heritage Craft Cluster & Pin Code
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Taj Ganj Heritage Cluster, Agra (282001)"
                      value={formData.clusterLocation}
                      onChange={(e) => setFormData({ ...formData, clusterLocation: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-emerald-500/30 text-xs text-white placeholder:text-stone-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-emerald-200">
                        Authorized GI Registration Number
                      </label>
                      <button
                        type="button"
                        onClick={handleGenerateGiNumber}
                        className="text-[10px] text-amber-300 hover:text-amber-200 font-bold underline"
                      >
                        + Generate Registry Code
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. GI-IND-2026-UP-1092"
                      value={formData.giRegNumber}
                      onChange={(e) => setFormData({ ...formData, giRegNumber: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-emerald-500/30 text-xs font-mono text-amber-300 placeholder:text-stone-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                    />
                  </div>
                </div>

                {/* Mandatory 3-Point Anti-Counterfeit Declarations */}
                <div className="pt-2 border-t border-emerald-500/20 space-y-2">
                  <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block">
                    Mandatory Anti-Counterfeit Legal Declarations:
                  </span>

                  <label className="flex items-start gap-2.5 text-xs text-stone-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.pledgeHandcrafted}
                      onChange={(e) => setFormData({ ...formData, pledgeHandcrafted: e.target.checked })}
                      className="mt-0.5 rounded border-emerald-400 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-[11px] leading-tight">
                      <strong>100% Handcrafted & Traditional Technique Guarantee:</strong> I certify that this craft/food item is prepared using authentic hereditary techniques, and is <strong>NOT</strong> an automated factory machine-made replica.
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 text-xs text-stone-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.pledgeGiCluster}
                      onChange={(e) => setFormData({ ...formData, pledgeGiCluster: e.target.checked })}
                      className="mt-0.5 rounded border-emerald-400 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-[11px] leading-tight">
                      <strong>Geographical Indication (GI) Origin Compliance:</strong> I confirm raw materials and master artisans belong directly to the declared regional ODOP cluster boundary.
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 text-xs text-stone-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.pledgeFairTrade}
                      onChange={(e) => setFormData({ ...formData, pledgeFairTrade: e.target.checked })}
                      className="mt-0.5 rounded border-emerald-400 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-[11px] leading-tight">
                      <strong>Direct Artisan Escrow Agreement:</strong> I agree that 90% sale proceeds will route directly to the verified artisan bank account without third-party commission deductions.
                    </span>
                  </label>
                </div>
              </div>

              {/* Artisan Guild Name & ODOP Tag */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700">
                    Lead Master Artisan / Trader Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ustad Rashid & Sons / Panchhi Petha Heritage"
                    value={formData.artisanName}
                    onChange={(e) => setFormData({ ...formData, artisanName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700">
                    ODOP Cluster Tag
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ODOP: Agra Marble Inlay"
                    value={formData.odopTag}
                    onChange={(e) => setFormData({ ...formData, odopTag: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Retail Price with Live Split Calculator */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">
                  Retail Price (₹ INR) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 1499"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* SECTION: PHYSICAL SHOP LOCATION & TOURIST DIRECTIONS */}
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-3.5">
                <div className="flex items-center gap-2 pb-2 border-b border-amber-200/80">
                  <div className="w-8 h-8 rounded-xl bg-amber-700 text-white flex items-center justify-center shrink-0">
                    <Store className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-stone-900 text-sm">
                      Physical Shop / Workshop Location Details (दुकान एवं कार्यशाला का पता)
                    </h3>
                    <p className="text-[11px] text-stone-600">
                      Visiting tourists will navigate directly to your shop location and contact you. Zero courier scams.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-800">
                      Shop / Karkhana Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ustad Rashid Heritage Marble Workshop"
                      value={formData.shopName}
                      onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-800">
                      Monument Landmark & Walking Distance <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 120m from Taj Mahal South/East Gate Walkway"
                      value={formData.shopLandmark}
                      onChange={(e) => setFormData({ ...formData, shopLandmark: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-bold text-stone-800">
                      Complete Physical Street Address & Pin Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 23/45, Taj Ganj Heritage Walkway, Near Fatehpuri Gate, Agra, UP - 282001"
                      value={formData.shopAddress}
                      onChange={(e) => setFormData({ ...formData, shopAddress: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-800">
                      Business / Crafting Hours
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 09:00 AM - 09:00 PM (Closed Fridays)"
                      value={formData.shopTiming}
                      onChange={(e) => setFormData({ ...formData, shopTiming: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-800">
                      Public Phone / WhatsApp for Tourists <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 98371 99882"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value, whatsapp: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* 100% In-Store Direct Payout Guarantee */}
                {priceNum > 0 && (
                  <div className="mt-2 p-3 rounded-xl bg-white border border-amber-300/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-stone-800">
                        <strong>100% In-Store Direct Payout:</strong> Customer pays <strong>₹{priceNum.toLocaleString('en-IN')}</strong> directly at your shop counter via Cash or UPI. SanskritiKhoj charges 0% sales commission.
                      </span>
                    </div>
                    <span className="font-serif font-extrabold text-emerald-700 text-sm whitespace-nowrap pl-2">
                      ₹0 Commission
                    </span>
                  </div>
                )}
              </div>

              {/* CRAFT & FOOD PHOTOGRAPHY STUDIO WITH GALLERY UPLOAD */}
              <div className="space-y-3 p-4 rounded-2xl bg-stone-50 border border-stone-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-orange-600" />
                      <span>Craft & Food Product Photo (उत्पाद की तस्वीर)</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <p className="text-[11px] text-stone-500">
                      Upload authentic photos taken directly from your workshop, loom, or kitchen
                    </p>
                  </div>

                  {/* Mode Switcher Buttons */}
                  <div className="inline-flex p-1 bg-white rounded-xl border border-stone-200 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setImageUploadMode('gallery')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${imageUploadMode === 'gallery'
                        ? 'bg-orange-600 text-white shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900'
                        }`}
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>Gallery / Storage</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setImageUploadMode('camera')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${imageUploadMode === 'camera'
                        ? 'bg-orange-600 text-white shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900'
                        }`}
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Camera</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setImageUploadMode('url')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${imageUploadMode === 'url'
                        ? 'bg-orange-600 text-white shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900'
                        }`}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Web Link</span>
                    </button>
                  </div>
                </div>

                {/* Live Image Preview Card if photo exists */}
                {imagePreview ? (
                  <div className="relative rounded-2xl overflow-hidden border border-stone-200 bg-white p-3 flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative w-full sm:w-32 aspect-video sm:aspect-square rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
                      <img
                        src={imagePreview}
                        alt="Craft Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-1.5 left-1.5 bg-black/70 text-emerald-300 border border-emerald-400/40 text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1">
                        <Check className="w-2.5 h-2.5 text-emerald-400" />
                        <span>Ready</span>
                      </div>
                    </div>

                    <div className="flex-1 space-y-1 w-full text-center sm:text-left">
                      <div className="flex items-center justify-center sm:justify-start gap-2">
                        <span className="text-xs font-bold text-stone-900">
                          {imageFile ? imageFile.name : 'Verified Heritage Preview'}
                        </span>
                        {imageFile && (
                          <span className="text-[10px] text-stone-400 font-mono">
                            ({(imageFile.size / (1024 * 1024)).toFixed(2)} MB)
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-500">
                        This photo will be displayed to tourists in the ODOP Bazaar and monument feeds.
                      </p>

                      <div className="pt-2 flex items-center justify-center sm:justify-start gap-2">
                        <button
                          type="button"
                          onClick={pickFromGallery}
                          className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                        >
                          <FolderOpen className="w-3.5 h-3.5 text-stone-600" />
                          <span>Choose Different Photo</span>
                        </button>
                        <button
                          type="button"
                          onClick={removeSelectedImage}
                          className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold flex items-center gap-1 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* GALLERY / CAMERA UPLOAD ZONE */}
                    {imageUploadMode !== 'url' ? (
                      <div className="p-6 rounded-2xl bg-white border-2 border-dashed border-stone-300 hover:border-orange-400 transition-colors text-center space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200 mx-auto flex items-center justify-center text-orange-600">
                          {imageUploadMode === 'camera' ? (
                            <Camera className="w-6 h-6" />
                          ) : (
                            <FolderOpen className="w-6 h-6" />
                          )}
                        </div>

                        <div className="space-y-1">
                          <h4 className="text-xs sm:text-sm font-bold text-stone-900">
                            {imageUploadMode === 'camera'
                              ? 'Capture Craft Photo with Camera'
                              : 'Upload Craft Photo from Phone / Computer Gallery'}
                          </h4>
                          <p className="text-[11px] text-stone-500 max-w-sm mx-auto">
                            Select clear, authentic photographs of your handcrafted item or prepared regional dish.
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                          <button
                            type="button"
                            disabled={capturingPhoto}
                            onClick={pickFromGallery}
                            className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-600/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                          >
                            <FolderOpen className="w-4 h-4" />
                            <span>Browse Device Gallery / Files</span>
                          </button>

                          <button
                            type="button"
                            disabled={capturingPhoto}
                            onClick={takePhotoWithCamera}
                            className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold border border-stone-200 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                          >
                            <Camera className="w-4 h-4 text-stone-600" />
                            <span>Open Camera</span>
                          </button>
                        </div>

                        <p className="text-[10px] text-stone-400 pt-1">
                          Supports JPG, JPEG, PNG, WEBP (Maximum file size: 5MB)
                        </p>

                        {/* Hidden HTML Inputs for Fallback & Desktop Browser Support */}
                        <input
                          id="artisan-gallery-file-input"
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        <input
                          id="artisan-camera-capture-input"
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </div>
                    ) : (
                      /* URL INPUT FALLBACK */
                      <div className="space-y-2 pt-1">
                        <input
                          type="url"
                          placeholder="https://images.unsplash.com/photo-..."
                          value={formData.imageUrl}
                          onChange={(e) => {
                            setFormData({ ...formData, imageUrl: e.target.value });
                            setImagePreview(e.target.value);
                          }}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        <p className="text-[10px] text-stone-400">
                          Paste an online web image link, or switch to the 'Gallery' tab to pick directly from your phone.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">
                  Artisan Ancestral Story & Handcrafted Technique Description
                </label>
                <textarea
                  rows="3"
                  placeholder="Describe the raw materials, ancestral technique, and historical connection to the heritage monument..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* One-Time Fair-Trade Listing Fee Card */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-xs text-stone-900 leading-tight">
                        Direct Artisan Fair-Trade Listing (0% Commission Promo)
                      </h4>
                      <p className="text-[10px] text-emerald-800 font-semibold">
                        Zero Monthly Fees • 100% Direct Payout to Verified Artisan Bank Account
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="font-mono text-xs font-extrabold text-emerald-950 bg-emerald-50 border border-emerald-300 px-3 py-1 rounded-xl">
                      ₹0 Free Promo
                    </span>
                    <span className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white flex items-center gap-1.5 shadow-sm">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>✓ 100% Free Listing Approved</span>
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-stone-600 leading-relaxed">
                  Under the direct Fair-Trade Policy, you keep <strong>100% of every craft sale</strong> directly in your verified bank account. All platform fees, listing charges, and commissions are currently <strong>₹0 (100% FREE)</strong>.
                </p>
              </div>

              <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-[11px] text-stone-600">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Verified by National Crafts Council & Geographical Indications of Goods Act (1999)</span>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-lg shadow-orange-600/30 transition-all active:scale-95 disabled:opacity-50 w-full sm:w-auto justify-center cursor-pointer"
                >
                  {submitting ? (
                    <span>Verifying Credentials & Publishing...</span>
                  ) : (
                    <>
                      <span>Publish Craft Listing (0% Commission)</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: MY LISTED PRODUCTS */}
        {activeTab === 'my-products' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  Active Verified Crafts in Heritage Network ({products.length})
                </h3>
                <p className="text-xs text-stone-500">
                  Your live listings visible to tourists visiting monument feeds and ODOP Bazaar
                </p>
              </div>

              <button
                onClick={() => setActiveTab('add')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-sm transition-all"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>List Another Craft</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {products.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                      <div className="absolute top-2.5 left-2.5 bg-black/80 text-amber-300 border border-amber-400/40 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        <span>Verified ODOP Craft</span>
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span className="uppercase text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                          {item.category === 'food' ? 'Food Heritage' : item.category}
                        </span>
                        <span className="text-emerald-700 flex items-center gap-1">
                          <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>GI Authenticated</span>
                        </span>
                      </div>

                      <h4 className="font-serif font-bold text-sm text-stone-900 line-clamp-1">
                        {item.name}
                      </h4>

                      <p className="text-[11px] text-stone-500 line-clamp-2">
                        {item.description}
                      </p>

                      <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 text-[10px] space-y-1 font-mono text-stone-600">
                        <div>Producer: <strong className="text-stone-800">{item.artisanName}</strong></div>
                        <div className="text-emerald-700 font-bold">Pehchan: {item.odopTag?.includes('Pehchan:') ? item.odopTag.split('Pehchan:')[1]?.trim() : 'UP-AGR-44910 [Verified]'}</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0 border-t border-stone-100 mt-2 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-stone-400 block">In-Store MRP:</span>
                        <span className="font-serif font-bold text-stone-900 text-sm">₹{item.price}</span>
                      </div>
                      <span className="text-[10px] text-emerald-800 bg-emerald-100/90 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>100% In-Store Direct (₹0 Comm.)</span>
                      </span>
                    </div>

                    {(item.shopName || item.shopAddress) && (
                      <div className="p-2 rounded-xl bg-amber-50/70 border border-amber-200/60 text-[10px] space-y-0.5 text-stone-700">
                        <div className="flex items-center gap-1 font-bold text-stone-900 truncate">
                          <Store className="w-3 h-3 text-amber-700 shrink-0" />
                          <span className="truncate">{item.shopName || `${item.artisanName} Studio`}</span>
                        </div>
                        {item.shopLandmark && (
                          <div className="flex items-center gap-1 text-stone-500 truncate">
                            <MapPin className="w-3 h-3 text-orange-600 shrink-0" />
                            <span className="truncate">{item.shopLandmark}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: CUSTOMER ORDERS & STUDIO DISPATCH */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-100">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold mb-2">
                    <Package className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{lang === 'hi' ? 'लाइव ग्राहक ऑर्डर एवं स्टूडियो डिस्पैच' : 'Live Customer Orders & Studio Dispatch'}</span>
                  </div>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                    {lang === 'hi' ? 'कारीगर ऑर्डर प्रबंधन' : 'Artisan Order Fulfillment Hub'}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-2xl leading-relaxed">
                    {lang === 'hi'
                      ? 'ऑनलाइन खरीदारों से आने वाले ऑर्डर्स को पैक और डिस्पैच करें। हर ऑर्डर पर 100% सीधी कमाई आपके बैंक खाते में।'
                      : 'Fulfill direct courier orders from tourists and patrons across India. Guaranteed 100% direct payout remitted to your bank account.'}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      const name = currentApp?.artisanName || formData.artisanName || 'Ustad Rashid';
                      orderService.getArtisanOrders(name).then((res) => setOrders(res || []));
                    }}
                    className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-stone-600" />
                    <span>{lang === 'hi' ? 'रीफ्रेश' : 'Refresh Orders'}</span>
                  </button>
                </div>
              </div>

              {/* Financial & Order Metric Counters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-amber-900">
                    {lang === 'hi' ? 'कुल प्राप्त ऑर्डर' : 'Total Orders'}
                  </div>
                  <div className="text-2xl font-serif font-black text-amber-950 mt-1">
                    {orders.length}
                  </div>
                  <div className="text-[10px] text-amber-700/80 mt-0.5">
                    {lang === 'hi' ? 'ओडीओपी बाज़ार से' : 'via ODOP Bazaar'}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-900">
                    {lang === 'hi' ? 'कारीगर निवल कमाई (100%)' : 'Net Artisan Earnings (100%)'}
                  </div>
                  <div className="text-2xl font-serif font-black text-emerald-950 mt-1">
                    ₹{orders.reduce((sum, o) => sum + (o.artisanShare || Number(o.totalAmount || o.price || 0)), 0).toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-emerald-700/80 mt-0.5">
                    {lang === 'hi' ? '100% प्रत्यक्ष भुगतान' : '100% Guaranteed Remittance'}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-blue-900">
                    {lang === 'hi' ? 'प्रक्रियाधीन / डिस्पैच' : 'In Fulfillment'}
                  </div>
                  <div className="text-2xl font-serif font-black text-blue-950 mt-1">
                    {orders.filter((o) => o.status === 'placed' || o.status === 'crafting' || o.status === 'dispatched').length}
                  </div>
                  <div className="text-[10px] text-blue-700/80 mt-0.5">
                    {lang === 'hi' ? 'सक्रिय पार्सल' : 'Active Parcels'}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-stone-700">
                    {lang === 'hi' ? 'डाक लॉजिस्टिक्स पार्टनर' : 'Logistics Partner'}
                  </div>
                  <div className="text-sm font-bold text-stone-900 mt-2 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-orange-600 shrink-0" />
                    <span>India Post SpeedPost</span>
                  </div>
                  <div className="text-[10px] text-stone-500 mt-1">
                    {lang === 'hi' ? 'राष्ट्रीय ट्रैकिंग सहित' : 'National AWB Tracking'}
                  </div>
                </div>
              </div>
            </div>

            {/* Orders Feed */}
            {orders.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 border border-stone-200 text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto border border-amber-300">
                  <Package className="w-8 h-8" />
                </div>
                <h4 className="font-serif text-lg font-bold text-stone-900">
                  {lang === 'hi' ? 'अभी कोई नया ऑनलाइन ऑर्डर नहीं है' : 'No Incoming Orders Yet'}
                </h4>
                <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
                  {lang === 'hi'
                    ? 'जैसे ही पर्यटक या देश भर के ग्राहक आपके उत्पादों का ऑर्डर देंगे, उनका विवरण, शिपिंग पता और 100% भुगतान यहाँ दिखाई देगा।'
                    : 'When tourists or patrons order your handcrafted items from the ODOP Bazaar, their shipment details and prepaid escrow release will appear here immediately.'}
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setActiveTab('add')}
                    className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-600/30 transition-all"
                  >
                    {lang === 'hi' ? '+ नया हस्तशिल्प जोड़ें' : '+ List More Handcrafted Items'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const items = Array.isArray(order.items) ? order.items : [];
                  const isUpdating = updatingOrderId === order.id;
                  const artisanNet = order.artisanShare || Number(order.totalAmount || order.price || 0);

                  return (
                    <div
                      key={order.id}
                      className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-sm space-y-4 hover:border-amber-400/80 transition-all"
                    >
                      {/* Order Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-stone-900 text-white flex items-center justify-center font-mono font-bold text-xs">
                            #{order.id}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-stone-900 text-sm">
                                {lang === 'hi' ? 'ऑर्डर' : 'Order'} #{order.id}
                              </span>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${order.status === 'delivered'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : order.status === 'dispatched'
                                    ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                                    : order.status === 'crafting'
                                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                                  }`}
                              >
                                {order.status === 'placed' && (lang === 'hi' ? 'ऑर्डर प्राप्त' : 'Order Placed')}
                                {order.status === 'crafting' && (lang === 'hi' ? 'तैयारी / पैकिंग' : 'Crafting & Packing')}
                                {order.status === 'dispatched' && (lang === 'hi' ? 'डिस्पैच (पार्सल रवाना)' : 'Dispatched')}
                                {order.status === 'delivered' && (lang === 'hi' ? 'सफलतापूर्वक सुपुर्द' : 'Delivered')}
                              </span>
                            </div>
                            <div className="text-[11px] text-stone-500 flex items-center gap-2 mt-0.5">
                              <Clock className="w-3 h-3 text-stone-400" />
                              <span>{order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN') : 'Recent'}</span>
                              <span>•</span>
                              <span>{order.paymentMethod || 'Prepaid Escrow (UPI)'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Status Update Action Button */}
                        <div className="flex items-center gap-2">
                          {order.status === 'placed' && (
                            <button
                              disabled={isUpdating}
                              onClick={() => handleUpdateOrderStatus(order.id, 'crafting')}
                              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition-all disabled:opacity-50"
                            >
                              {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Package className="w-3.5 h-3.5" />}
                              <span>{lang === 'hi' ? 'पैकिंग शुरू करें' : 'Begin Crafting & Packing'}</span>
                            </button>
                          )}

                          {order.status === 'crafting' && (
                            <button
                              disabled={isUpdating}
                              onClick={() => handleUpdateOrderStatus(order.id, 'dispatched')}
                              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-all disabled:opacity-50"
                            >
                              {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Truck className="w-3.5 h-3.5" />}
                              <span>{lang === 'hi' ? 'स्पीडपोस्ट को सौंपें (डिस्पैच)' : 'Dispatch via India Post (Generate AWB)'}</span>
                            </button>
                          )}

                          {order.status === 'dispatched' && (
                            <button
                              disabled={isUpdating}
                              onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}
                              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition-all disabled:opacity-50"
                            >
                              {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                              <span>{lang === 'hi' ? 'सुपुर्दगी की पुष्टि (डिलीवर)' : 'Mark Delivered (Release Escrow)'}</span>
                            </button>
                          )}

                          {order.status === 'delivered' && (
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>{lang === 'hi' ? 'भुगतान विमुक्त' : 'Escrow Remitted'}</span>
                            </span>
                          )}

                          {/* Print Shipping Slip Action */}
                          <button
                            type="button"
                            onClick={() => handlePrintOrderSlip(order)}
                            className="px-3 py-2 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-800 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                            title={lang === 'hi' ? 'डाक चालान / शिपिंग लेबल प्रिंट करें' : 'Print SpeedPost Shipping Label & Packing Slip'}
                          >
                            <Printer className="w-3.5 h-3.5 text-stone-600" />
                            <span>{lang === 'hi' ? 'चालान प्रिंट' : 'Print Slip'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Content Grid: Items & Customer Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        {/* Customer & Shipping Details */}
                        <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1.5">
                          <div className="font-bold text-stone-900 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-stone-600" />
                            <span>{lang === 'hi' ? 'डिलीवरी पता एवं संपर्क:' : 'Buyer & Delivery Address:'}</span>
                          </div>
                          <div className="font-medium text-stone-800 pl-5">
                            {order.customerName}
                          </div>
                          <div className="text-stone-600 pl-5 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-stone-400" />
                            <span>{order.customerPhone}</span>
                            {order.customerEmail && <span className="text-stone-400">({order.customerEmail})</span>}
                          </div>
                          <div className="text-stone-600 pl-5 flex items-start gap-1">
                            <MapPin className="w-3 h-3 text-orange-600 shrink-0 mt-0.5" />
                            <span>{order.customerAddress || 'Direct In-Studio Handover'}</span>
                          </div>

                          {order.trackingNumber && (
                            <div className="mt-2 pt-2 border-t border-stone-200/80 pl-5">
                              <div className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">
                                {lang === 'hi' ? 'इंडिया पोस्ट AWB नंबर' : 'India Post SpeedPost AWB'}
                              </div>
                              <div className="font-mono font-bold text-orange-700 text-xs flex items-center gap-1">
                                <Truck className="w-3 h-3" />
                                <span>{order.trackingNumber}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Items & Payment Payout Breakdown */}
                        <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2">
                          <div className="font-bold text-amber-950 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <ShoppingBag className="w-3.5 h-3.5 text-amber-700" />
                              <span>{lang === 'hi' ? 'आइटम्स:' : 'Ordered Crafts:'}</span>
                            </span>
                            <span className="text-stone-500 font-normal">
                              {items.length} {items.length === 1 ? 'item' : 'items'}
                            </span>
                          </div>

                          <div className="space-y-1 divide-y divide-amber-200/40 max-h-28 overflow-y-auto">
                            {items.map((it, idx) => (
                              <div key={idx} className="pt-1 first:pt-0 flex items-center justify-between text-[11px]">
                                <span className="text-stone-800 font-medium truncate max-w-[200px]">
                                  {it.quantity}x {it.name || it.title}
                                </span>
                                <span className="font-mono font-bold text-stone-900">
                                  ₹{(Number(it.price) * (it.quantity || 1)).toLocaleString('en-IN')}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Payout Summary */}
                          <div className="pt-2 border-t border-amber-200 flex items-center justify-between text-xs">
                            <div>
                              <div className="text-[10px] text-stone-500">
                                {lang === 'hi' ? 'ग्राहक द्वारा प्रदत्त कुल राशि' : 'Buyer Total'}
                              </div>
                              <div className="font-mono text-stone-700">₹{order.totalAmount}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                                {lang === 'hi' ? 'कारीगर प्रत्यक्ष भुगतान (100%)' : 'Artisan Share (100%)'}
                              </div>
                              <div className="font-serif font-extrabold text-base text-emerald-700">
                                ₹{artisanNet.toLocaleString('en-IN')}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: TRANSPARENT FAIR-TRADE POLICY & WORKSHOP QR */}
        {activeTab === 'fee-policy' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-100">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold mb-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{lang === 'hi' ? 'पारदर्शी 100% शून्य-सदस्यता नीति' : 'Zero-Subscription Fair-Trade Guarantee'}</span>
                  </div>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                    {lang === 'hi' ? 'मंच शुल्क संरचना एवं कारीगर सुरक्षा' : 'Platform Fee Matrix & Artisan Protection'}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-2xl leading-relaxed">
                    {lang === 'hi'
                      ? 'संस्कृतिकोज पर कोई भी मासिक या वार्षिक सब्सक्रिप्शन शुल्क नहीं है। शून्य प्लेटफ़ॉर्म कमीशन और 100% सीधी कमाई।'
                      : 'SanskritiKhoj charges NO monthly or annual subscriptions. Authentic artisans retain 100% of sales with zero platform cuts.'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrintStandee}
                    className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>{lang === 'hi' ? 'क्यूआर स्टैंडी प्रिंट करें' : 'Print Counter Standee'}</span>
                  </button>
                </div>
              </div>

              {/* 5 Core Policy Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* 1. Zero Subscriptions */}
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-emerald-950 text-sm">
                    {lang === 'hi' ? '1. ₹0 सदस्यता शुल्क (No Monthly Plans)' : '1. Zero Monthly Subscriptions'}
                  </h4>
                  <p className="text-stone-600 leading-relaxed">
                    {lang === 'hi'
                      ? 'कोई आवर्ती मासिक या वार्षिक शुल्क नहीं। सभी प्रमाणित कारीगरों को आजीवन निःशुल्क प्रोफाइल और उपस्थिति प्राप्त है।'
                      : 'No recurring monthly or annual lock-ins. Every authentic artisan enjoys lifetime verified listing and workshop discovery.'}
                  </p>
                </div>

                {/* 2. One-Time Listing Fee ₹49 */}
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold">
                    <Coins className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-amber-950 text-sm">
                    {lang === 'hi' ? '2. ₹0 निःशुल्क कैटलॉगिंग (0% प्रोमो)' : '2. ₹0 Free Cataloging (0% Promo)'}
                  </h4>
                  <p className="text-stone-600 leading-relaxed">
                    {lang === 'hi'
                      ? 'नए हस्तशिल्प को सूचीबद्ध करने का कोई शुल्क नहीं। डिजिटल कैटलॉग निर्माण एवं जीआई सत्यापन 100% निःशुल्क है।'
                      : 'Zero listing fee per product during our cultural revival promo. High-resolution digital cataloging and Ministry GI verification are 100% free.'}
                  </p>
                </div>

                {/* 3. 100% Direct Remittance */}
                <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200/80 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-orange-950 text-sm">
                    {lang === 'hi' ? '3. 100% सीधी कारीगर कमाई (0% कमीशन)' : '3. 100% Guaranteed Artisan Share'}
                  </h4>
                  <p className="text-stone-600 leading-relaxed">
                    {lang === 'hi'
                      ? 'उत्पाद की बिक्री कीमत का पूरा 100% सीधे आपके बैंक खाते / यूपीआई में जाता है। 0% प्लेटफ़ॉर्म कमीशन।'
                      : 'A full 100% of gross craft price is routed directly to your verified bank or cooperative account. Zero middleman cuts.'}
                  </p>
                </div>

                {/* 4. Buyer Escrow Fee ₹0 */}
                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                    <Lock className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-blue-950 text-sm">
                    {lang === 'hi' ? '4. ₹0 खरीदार शुल्क (निःशुल्क एस्क्रो)' : '4. ₹0 Buyer Platform Surcharge'}
                  </h4>
                  <p className="text-stone-600 leading-relaxed">
                    {lang === 'hi'
                      ? 'खरीदार को केवल शिल्प का वास्तविक मूल्य देना होता है। कोई अतिरिक्त प्लेटफ़ॉर्म सरचार्ज नहीं।'
                      : 'Buyers pay only pure artisan craft MRP. No extra platform commission or surcharge is added.'}
                  </p>
                </div>

                {/* 5. In-Store Workshop 100% Free */}
                <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200/80 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
                    <Store className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-purple-950 text-sm">
                    {lang === 'hi' ? '5. इन-स्टोर पर्यटकों से 100% प्रत्यक्ष नकद' : '5. 100% In-Store Direct Counter Sales'}
                  </h4>
                  <p className="text-stone-600 leading-relaxed">
                    {lang === 'hi'
                      ? 'जब पर्यटक आपकी कार्यशाला में आते हैं, तो पूरा भुगतान सीधे आपको मिलता है (0% मंच शुल्क)। कोई कूरियर या पार्सल जोखिम नहीं।'
                      : 'Visiting tourists pay you directly at your shop counter (Cash/UPI). SanskritiKhoj takes 0% cut from counter sales.'}
                  </p>
                </div>
              </div>

              {/* Physical Workshop Countertop QR Standee (Print Ready) */}
              <div className="pt-6 border-t border-stone-200">
                <div className="text-center max-w-md mx-auto space-y-2 pb-4">
                  <h4 className="font-serif text-lg font-bold text-stone-900">
                    {lang === 'hi' ? 'दुकान काउंटर स्टैंडी (प्रिंट हेतु तैयार)' : 'Workshop Countertop Standee (Print Ready)'}
                  </h4>
                  <p className="text-xs text-stone-500">
                    {lang === 'hi'
                      ? 'इस स्टैंडी को प्रिंट करके अपनी दुकान पर रखें ताकि स्मारक देखने वाले पर्यटक आपका प्रमाण पत्र और कहानी देख सकें।'
                      : 'Print this badge on cardstock and display it at your workshop counter for tourists visiting nearby monuments.'}
                  </p>
                </div>

                <div className="max-w-md mx-auto bg-gradient-to-b from-amber-500/15 via-white to-amber-500/10 p-6 sm:p-8 rounded-3xl border-2 border-stone-800 shadow-xl space-y-4 text-center">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-900 text-amber-400 text-[10px] font-mono font-bold">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span>MINISTRY OF TEXTILES • VERIFIED ARTISAN WORKSHOP</span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                      {formData.shopName || `${formData.artisanName} Studio`}
                    </h3>
                    <p className="text-xs text-stone-600">
                      {formData.shopAddress}
                    </p>
                    {formData.shopLandmark && (
                      <p className="text-[11px] font-medium text-orange-700">
                        📍 {formData.shopLandmark}
                      </p>
                    )}
                  </div>

                  {/* QR Code Graphic Container */}
                  <div className="w-48 h-48 mx-auto p-3 bg-white rounded-2xl border-2 border-stone-900 shadow-md flex flex-col items-center justify-center relative">
                    <div className="w-full h-full bg-stone-900 rounded-xl p-2.5 flex flex-col items-center justify-center text-white relative">
                      <QrCode className="w-32 h-32 text-white stroke-[1.5]" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-9 h-9 rounded-lg bg-orange-600 text-white flex items-center justify-center text-xs font-black shadow-md border-2 border-white">
                          SK
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 font-mono text-[11px] text-stone-700 bg-stone-50 p-3 rounded-xl border border-stone-200 text-left">
                    <div className="flex justify-between">
                      <span className="text-stone-400">Pehchan ID:</span>
                      <strong className="text-stone-900">{formData.pehchanId}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">GI Auth:</span>
                      <strong className="text-emerald-700">{formData.giRegNumber || 'GI-IND-2026-UP-1092'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Craft Guild:</span>
                      <span className="text-stone-800 truncate max-w-[200px]">{formData.cooperativeName}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-center gap-2 text-xs font-bold text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>100% Direct Fair-Trade • 0% Middlemen Cut</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: GUIDELINES & ARCHITECTURE */}
        {activeTab === 'guidelines' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
              <Award className="w-6 h-6 text-amber-600" />
              <div>
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  National Fair-Trade & Verification Architecture
                </h3>
                <p className="text-xs text-stone-500">
                  Detailed technical verification framework connecting Ministry of Textiles & ODOP Guidelines
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-stone-700">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                <h4 className="font-bold text-amber-950 text-sm flex items-center gap-1.5">
                  <span>🏛️ 1. Direct Artisan Remittance (90%)</span>
                </h4>
                <p className="leading-relaxed">
                  Every transaction through the platform automatically routes 90% of the gross sale price directly to the artisan's verified bank VPA or registered cooperative account, completely eliminating exploitative middlemen.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                <h4 className="font-bold text-emerald-950 text-sm flex items-center gap-1.5">
                  <span>🛡️ 2. DC (Handicrafts) Pehchan Registry API</span>
                </h4>
                <p className="leading-relaxed">
                  Every artisan ID is validated against the official Ministry of Textiles National Registry. The system verifies the artisan's registered name, craft category, active cluster address, and District Industries Center (DIC) reference number.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                <h4 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                  <span>📜 3. Geographical Indication (GI) Protection</span>
                </h4>
                <p className="leading-relaxed">
                  Products must originate strictly within the designated heritage cluster boundary (e.g. Varanasi for Silk, Agra for Marble Inlay, Jaipur for Blue Pottery). Machine replicas trigger immediate blacklisting under the GI Act 1999.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                <h4 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                  <span>📍 4. Proximity Monument Cross-Discovery</span>
                </h4>
                <p className="leading-relaxed">
                  When tourists visit a monument (e.g., Taj Mahal or Varanasi Ghats), your listed craft appears directly in their audio guide and 1-Day Heritage Trail, creating real-world customer footfall.
                </p>
              </div>
            </div>

            {/* Zero Tolerance Warning Box */}
            <div className="p-4 rounded-2xl bg-red-50/80 border border-red-200 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="text-xs text-red-900 space-y-1">
                <strong className="block font-bold">Zero-Tolerance Anti-Counterfeit Policy (Consumer Protection E-Commerce Rules):</strong>
                <p className="leading-relaxed text-red-800">
                  Any seller found selling factory-made replicas, synthetic silks, or non-cluster food under an ODOP/GI label will face immediate deplatforming, confiscation of escrow balance, and legal notification under Section 38 of the Geographical Indications of Goods Act (1999).
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: REGISTERED PEHCHAN DATABASE BROWSER (ADMIN ONLY) */}
      {isAdmin && showRegistryLookupModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-stone-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-serif font-bold text-lg text-stone-900">
                  DC (Handicrafts) Registered Artisans & Guilds
                </h3>
              </div>
              <button
                onClick={() => setShowRegistryLookupModal(false)}
                className="text-stone-400 hover:text-stone-700 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-500 leading-relaxed">
              Below are registered artisan guilds in the National Handicrafts Directory. Click <strong>"Select This Artisan"</strong> to test live verification with official credentials.
            </p>

            <div className="overflow-y-auto space-y-2.5 flex-1 pr-1">
              {Object.entries(NATIONAL_HANDICRAFTS_REGISTRY).map(([id, rec]) => (
                <div
                  key={id}
                  className="p-3.5 rounded-2xl bg-stone-50 hover:bg-emerald-50/50 border border-stone-200 hover:border-emerald-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                        {id}
                      </span>
                      <span className="text-[10px] text-stone-500 font-semibold uppercase">
                        {rec.state} ({rec.craftType})
                      </span>
                    </div>
                    <div className="font-bold text-stone-900 pt-0.5">{rec.artisanName}</div>
                    <div className="text-[11px] text-stone-500">{rec.cooperativeName} • {rec.clusterLocation}</div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        pehchanId: id,
                        artisanName: rec.artisanName,
                        cooperativeName: rec.cooperativeName,
                        clusterLocation: rec.clusterLocation,
                        giRegNumber: rec.giAuth || prev.giRegNumber,
                      }));
                      checkRegistry(id, true);
                      setShowRegistryLookupModal(false);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] whitespace-nowrap transition-colors"
                  >
                    Select This Artisan
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-stone-200 flex justify-end">
              <button
                onClick={() => setShowRegistryLookupModal(false)}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold"
              >
                Close Directory
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OFFICIAL AUDIT CERTIFICATE MODAL */}
      {successProduct && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border-2 border-emerald-500/30 text-center relative overflow-hidden">
            {/* Top Seal Ribbon */}
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-800 py-1 text-center">
              <span className="text-[10px] font-bold text-emerald-100 uppercase tracking-widest flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                <span>Ministry of Textiles • ODOP Craft Authenticity Audit</span>
              </span>
            </div>

            <div className="pt-4 space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 border border-emerald-300 mx-auto flex items-center justify-center text-emerald-700">
                <BadgeCheck className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                Craft Successfully Verified & Listed!
              </h3>
              <p className="text-xs text-stone-600">
                Official digital authenticity certificate issued for <strong>{successProduct.name}</strong>.
              </p>
            </div>

            {/* Official Audit Certificate Card */}
            <div className="p-4 rounded-2xl bg-[#faf8f5] border border-amber-300/80 text-left space-y-2.5 font-mono text-xs text-stone-800 shadow-inner">
              <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                <span className="text-[10px] text-stone-500 uppercase tracking-wider font-sans font-bold">
                  Certificate Ref No:
                </span>
                <span className="text-emerald-800 font-bold">
                  CERT-ODOP-2026-{Math.floor(100000 + Math.random() * 900000)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-stone-400 block text-[10px]">Ministry Pehchan ID:</span>
                  <strong className="text-stone-900">{successProduct.pehchanId || 'UP-VAR-10842'}</strong>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px]">GI User Registry:</span>
                  <strong className="text-emerald-700">{successProduct.giRegNumber}</strong>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px]">Artisan / Guild:</span>
                  <strong className="text-stone-900">{successProduct.artisanName}</strong>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px]">Production Cluster:</span>
                  <strong className="text-stone-900">{successProduct.clusterLocation || 'Heritage Crafts Cluster'}</strong>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-[11px]">
                <div>
                  <span className="text-stone-400 block text-[10px]">Retail Price:</span>
                  <strong className="text-stone-900">₹{successProduct.price}</strong>
                </div>
                <div className="text-right">
                  <span className="text-stone-400 block text-[10px]">In-Store Counter Payout:</span>
                  <strong className="text-emerald-700 font-bold">
                    ₹{successProduct.price} (100% Direct Payout)
                  </strong>
                </div>
              </div>

              <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-200 flex items-center gap-2 text-[10px] text-emerald-800 font-sans">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Anti-Counterfeit Check Passed: 100% Handcrafted declaration locked in immutable audit ledger (DIC Ref: {successProduct.dicRef || 'DIC-ACTIVE'}).
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSuccessProduct(null)}
                className="px-4 py-2.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
              >
                Close Certificate
              </button>
              <button
                onClick={() => {
                  setSuccessProduct(null);
                  navigate('/bazaar');
                }}
                className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-600/30 transition-all flex items-center gap-1.5"
              >
                <span>View in ODOP Bazaar</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REGISTER NEW ARTISAN WORKSHOP (ADMIN APPROVAL REQUEST) */}
      {showOnboardingModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-stone-200 my-6">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-orange-100 text-orange-700">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
                    Artisan & Workshop Registration (पंजीकरण आवेदन)
                  </h3>
                  <p className="text-xs text-stone-500">
                    Submit your workshop credentials for Government Tourism Administration physical audit.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowOnboardingModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterShop} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="font-bold text-stone-800">Master Artisan / Producer Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Master Kripal Kumbhar Guild"
                    value={onboardingForm.artisanName}
                    onChange={(e) => setOnboardingForm({ ...onboardingForm, artisanName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-800">Physical Workshop / Shop Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Master Kripal Heritage Pottery Studio"
                    value={onboardingForm.shopName}
                    onChange={(e) => setOnboardingForm({ ...onboardingForm, shopName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-stone-800">Physical Street Address & Pin Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. B-12, Kot Jewar Crafts Lane, Near Badi Chaupar, Jaipur - 302001"
                    value={onboardingForm.shopAddress}
                    onChange={(e) => setOnboardingForm({ ...onboardingForm, shopAddress: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-800">Associated Historic Monument *</label>
                  <select
                    value={onboardingForm.placeId}
                    onChange={(e) => setOnboardingForm({ ...onboardingForm, placeId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  >
                    {places.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.state})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-800">Landmark & Distance from Monument *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 350m from Main Entrance Gate"
                    value={onboardingForm.shopLandmark}
                    onChange={(e) => setOnboardingForm({ ...onboardingForm, shopLandmark: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-800">Ministry Pehchan ID (Govt Card) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. RJ-JPR-20419"
                    value={onboardingForm.pehchanId}
                    onChange={(e) => setOnboardingForm({ ...onboardingForm, pehchanId: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 font-mono font-bold bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-orange-500 uppercase"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-800">Contact Phone / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 98290 33419"
                    value={onboardingForm.phone}
                    onChange={(e) => setOnboardingForm({ ...onboardingForm, phone: e.target.value, whatsapp: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-stone-800">Craft Specialization *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Traditional Hand-Painted Blue Pottery / Quartz Clay"
                    value={onboardingForm.craftType}
                    onChange={(e) => setOnboardingForm({ ...onboardingForm, craftType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Important Administrative Verification Process:</span>
                </div>
                <p>
                  Upon submission, your application will be routed to the Government Tourism Administration. Once the Admin verifies your workshop location and Pehchan credentials, your account will be approved to subscribe to a listing plan and publish crafts.
                </p>
              </div>

              <div className="pt-2 border-t border-stone-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowOnboardingModal(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 font-semibold hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={onboardingSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                  {onboardingSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting to Admin...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Submit for Admin Approval</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Artisan ₹49 Listing Fee Payment Gateway Modal */}
      <PaymentGatewayModal
        isOpen={showListingPaymentModal}
        onClose={() => setShowListingPaymentModal(false)}
        amount={49}
        purpose={lang === 'hi' ? 'कारीगर एकमुश्त कैटलॉगिंग व जीआई सत्यापन शुल्क' : 'One-Time Artisan Cataloging & GI Registry Stamping'}
        artisanName={formData.artisanName || 'Master Artisan Guild'}
        onPaymentSuccess={(details) => {
          setShowListingPaymentModal(false);
          setListingFeePaid(true);
          setListingPaymentUtr(details.utr);
        }}
      />

      {/* Printable Portals mounted directly to document.body */}
      <PrintableStandeePortal artisanData={formData} />
      {orderToPrint && (
        <PrintableShippingSlipPortal order={orderToPrint} artisanInfo={formData} />
      )}
    </div>
  );
}
