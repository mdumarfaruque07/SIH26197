import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { placeService, productService } from '../services/api';
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
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const PRESET_IMAGE_TEMPLATES = [
  {
    label: 'Makrana Marble Inlay',
    category: 'handicraft',
    placeId: 8,
    url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    odop: 'ODOP: Agra Marble Inlay',
  },
  {
    label: 'Banarasi Handloom Silk',
    category: 'attire',
    placeId: 12,
    url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    odop: 'GI Tagged: Banarasi Silk',
  },
  {
    label: 'Agra Kesar Petha',
    category: 'food',
    placeId: 8,
    url: 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&w=800&q=80',
    odop: 'ODOP: Agra Petha & Food Heritage',
  },
  {
    label: 'Jaipur Blue Pottery',
    category: 'pottery',
    placeId: 13,
    url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
    odop: 'GI Tagged: Jaipur Blue Pottery',
  },
  {
    label: 'Kashi Thandai Masala',
    category: 'food',
    placeId: 12,
    url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    odop: 'ODOP: Varanasi Food Heritage',
  },
  {
    label: 'Odisha Palm Leaf Pattachitra',
    category: 'painting',
    placeId: 10,
    url: 'https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?auto=format&fit=crop&w=800&q=80',
    odop: 'GI Tagged: Odisha Pattachitra',
  },
];

export default function ArtisanPortalPage() {
  const { lang } = useLanguage();
  const navigate = useNavigate();

  const [places, setPlaces] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('add'); // 'add' | 'my-products' | 'guidelines'
  const [submitting, setSubmitting] = useState(false);
  const [successProduct, setSuccessProduct] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    nameHi: '',
    category: 'handicraft',
    placeId: '8', // Taj Mahal by default
    artisanName: '',
    odopTag: 'ODOP: Certified Heritage Craft',
    giRegNumber: '',
    price: '',
    imageUrl: '',
    description: '',
    descriptionHi: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [placesRes, prodsRes] = await Promise.all([
        placeService.getAll().catch(() => ({ success: false })),
        productService.getAll().catch(() => ({ success: false })),
      ]);
      if (placesRes.success) setPlaces(placesRes.places);
      if (prodsRes.success) setProducts(prodsRes.products);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApplyPreset = (preset) => {
    setFormData((prev) => ({
      ...prev,
      category: preset.category,
      placeId: String(preset.placeId),
      imageUrl: preset.url,
      odopTag: preset.odop,
      name: prev.name || preset.label,
    }));
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
    if (!formData.name || !formData.price || !formData.artisanName || !formData.placeId) {
      alert('Please fill all required fields: Name, Price, Artisan/Guild Name, and Monument.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        placeId: parseInt(formData.placeId),
        giRegNumber:
          formData.giRegNumber || `GI-IND-2026-IN-${Math.floor(1000 + Math.random() * 9000)}`,
        imageUrl:
          formData.imageUrl.trim() ||
          'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
      };

      const res = await productService.create(payload);
      if (res.success) {
        setSuccessProduct(res.product || payload);
        loadData();
        // Reset form
        setFormData({
          name: '',
          nameHi: '',
          category: 'handicraft',
          placeId: '8',
          artisanName: '',
          odopTag: 'ODOP: Certified Heritage Craft',
          giRegNumber: '',
          price: '',
          imageUrl: '',
          description: '',
          descriptionHi: '',
        });
      }
    } catch (err) {
      console.error('Failed to add product:', err);
      alert('Error listing product. Please try again.');
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
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold backdrop-blur-md">
            <Store className="w-3.5 h-3.5 text-amber-400" />
            <span>National Artisan & Trader Studio (कारीगर एवं व्यापारी मंच)</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
            Artisan & Trader <span className="text-amber-400">Direct Portal</span>
          </h1>

          <p className="max-w-2xl mx-auto text-stone-300 text-xs sm:text-sm font-light leading-relaxed">
            Directly connect your hereditary craft, handloom, or regional food heritage to tourists exploring India's historic monuments. Zero middlemen, 90% direct bank payout.
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto pt-2">
            <div className="bg-white/10 rounded-2xl p-3 border border-white/10 backdrop-blur-md">
              <span className="text-[10px] text-amber-300 font-bold block uppercase tracking-wider">
                Direct Payout
              </span>
              <span className="text-lg font-serif font-extrabold text-white">90% Net</span>
            </div>
            <div className="bg-white/10 rounded-2xl p-3 border border-white/10 backdrop-blur-md">
              <span className="text-[10px] text-emerald-300 font-bold block uppercase tracking-wider">
                Platform Cut
              </span>
              <span className="text-lg font-serif font-extrabold text-white">10% Fair</span>
            </div>
            <div className="bg-white/10 rounded-2xl p-3 border border-white/10 backdrop-blur-md">
              <span className="text-[10px] text-amber-300 font-bold block uppercase tracking-wider">
                GI Protection
              </span>
              <span className="text-lg font-serif font-extrabold text-white">100% Verified</span>
            </div>
            <div className="bg-white/10 rounded-2xl p-3 border border-white/10 backdrop-blur-md">
              <span className="text-[10px] text-stone-300 font-bold block uppercase tracking-wider">
                Total Products
              </span>
              <span className="text-lg font-serif font-extrabold text-white">{products.length} Items</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20 space-y-6">
        {/* Navigation Tabs */}
        <div className="bg-white p-2 rounded-2xl shadow-lg border border-stone-200 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('add')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'add'
                ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>List New Craft / Food Item</span>
          </button>

          <button
            onClick={() => setActiveTab('my-products')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'my-products'
                ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>My Listed Heritage Items ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('guidelines')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'guidelines'
                ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Fair-Trade Policy & Viability</span>
          </button>
        </div>

        {/* TAB 1: ADD PRODUCT FORM */}
        {activeTab === 'add' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-stone-100 gap-2">
              <div>
                <h2 className="font-serif text-2xl font-bold text-stone-900">
                  Onboard Your Craft or Culinary Heritage
                </h2>
                <p className="text-xs text-stone-500">
                  Fill in the details to publish your product into the national ODOP directory and monument feed
                </p>
              </div>

              <Link
                to="/bazaar"
                className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-1"
              >
                <span>View Live Bazaar</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Quick Template Presets for Instant Demo */}
            <div className="space-y-2 bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
              <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider block">
                ⚡ Quick Fill Presets (Click to autofill sample craft or food):
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {PRESET_IMAGE_TEMPLATES.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-amber-50 border border-stone-200 hover:border-amber-400 text-[11px] font-medium text-stone-700 whitespace-nowrap transition-colors flex items-center gap-1 shadow-2xs"
                  >
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

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

              {/* Category & Associated Monument */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700">
                    Heritage Category <span className="text-red-500">*</span>
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
                    <option value="food">Traditional Foods & Sweets (पारंपरिक व्यंजन एवं मिष्ठान)</option>
                    <option value="souvenir">Miniatures & Heritage Souvenirs</option>
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

              {/* Artisan Guild Name & ODOP Tag */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700">
                    Artisan / Guild / Workshop Name <span className="text-red-500">*</span>
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

              {/* GI Registration Number & Price with Live Split Calculator */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-stone-700">
                      GI Registration Number
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateGiNumber}
                      className="text-[10px] text-emerald-700 font-bold hover:underline"
                    >
                      + Generate GI Tag Code
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. GI-IND-2026-UP-0042"
                    value={formData.giRegNumber}
                    onChange={(e) => setFormData({ ...formData, giRegNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

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
              </div>

              {/* Live Fair-Trade Remittance Box */}
              {priceNum > 0 && (
                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-950">
                    <span className="flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-amber-600" />
                      <span>Live Remittance Calculator (Fair-Trade Split):</span>
                    </span>
                    <span className="text-emerald-700">0% Middlemen Cut</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                    <div className="p-2.5 rounded-xl bg-white border border-amber-200">
                      <span className="text-[10px] text-stone-500 block">
                        Your Direct Remittance (90%):
                      </span>
                      <span className="font-serif text-base font-extrabold text-emerald-700">
                        ₹{artisanShare.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-amber-200">
                      <span className="text-[10px] text-stone-500 block">
                        Platform Verification & Packaging (10%):
                      </span>
                      <span className="font-serif text-base font-bold text-stone-700">
                        ₹{platformFee.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Image URL */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">
                  Product Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">
                  Artisan Story & Handcrafted Technique Description
                </label>
                <textarea
                  rows="3"
                  placeholder="Describe the raw materials, ancestral technique, and historical connection to the heritage monument..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Verified by National Crafts Council & Ministry of Culture Guidelines</span>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-lg shadow-orange-600/30 transition-all active:scale-95 disabled:opacity-50"
                >
                  {submitting ? (
                    <span>Publishing Craft...</span>
                  ) : (
                    <>
                      <span>Publish to ODOP Bazaar</span>
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
                  Active Crafts in Heritage Network ({products.length})
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
                <span>Add Another Item</span>
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
                      <div className="absolute top-2.5 left-2.5 bg-black/75 text-amber-300 border border-amber-400/40 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                        {item.odopTag || 'ODOP Verified'}
                      </div>
                    </div>

                    <div className="p-4 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span className="uppercase text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                          {item.category === 'food' ? 'Food Heritage' : item.category}
                        </span>
                        <span className="text-emerald-700">GI Verified</span>
                      </div>
                      <h4 className="font-serif font-bold text-sm text-stone-900 line-clamp-1">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-stone-500 line-clamp-2">
                        {item.description}
                      </p>
                      <p className="text-[10px] text-stone-400 pt-1">
                        Producer: <strong>{item.artisanName}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="p-4 pt-0 border-t border-stone-100 mt-2 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-stone-400 block">Retail Price:</span>
                      <span className="font-serif font-bold text-stone-900 text-sm">₹{item.price}</span>
                    </div>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg font-bold">
                      ₹{Math.round(item.price * 0.9)} Net Payout
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: GUIDELINES & FAIR-TRADE POLICY */}
        {activeTab === 'guidelines' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
              <Award className="w-6 h-6 text-amber-600" />
              <div>
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  National Fair-Trade Artisan & Trader Guidelines
                </h3>
                <p className="text-xs text-stone-500">
                  Operational & economic standards aligned with Ministry of Textiles & ODOP Directive
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-stone-700">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                <h4 className="font-bold text-amber-950 text-sm flex items-center gap-1.5">
                  <span>🏛️ 1. Direct Artisan Remittance (90%)</span>
                </h4>
                <p className="leading-relaxed">
                  Every transaction through the platform automatically routes 90% of the gross sale price directly to the artisan's verified bank VPA or registered cooperative account, eliminating commission layers.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                <h4 className="font-bold text-emerald-950 text-sm flex items-center gap-1.5">
                  <span>🛡️ 2. Geographical Indication Protection</span>
                </h4>
                <p className="leading-relaxed">
                  Only authentic handcrafted products originating from certified heritage clusters and traditional food makers receive the GI verification shield, preventing counterfeit factory replicas.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                <h4 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                  <span>📦 3. Quality & Packaging Certification (10%)</span>
                </h4>
                <p className="leading-relaxed">
                  The 10% platform share covers heritage packaging, tamper-proof authenticity QR certificates, secure escrow gateway fees, and national logistics coordination.
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
          </div>
        )}
      </div>

      {/* Success Notification Modal */}
      {successProduct && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-stone-200 text-center">
            <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto animate-bounce" />
            <h3 className="font-serif text-xl font-bold text-stone-900">
              Craft Successfully Published!
            </h3>
            <p className="text-xs text-stone-600">
              <strong>{successProduct.name}</strong> is now live on the ODOP Bazaar and connected to the heritage discovery feed.
            </p>

            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-left space-y-1 font-mono">
              <div>GI Tag: <strong className="text-emerald-700">{successProduct.giRegNumber}</strong></div>
              <div>Producer: <strong>{successProduct.artisanName}</strong></div>
              <div>Net Artisan Payout: <strong className="text-emerald-700">₹{Math.round(successProduct.price * 0.9)}</strong></div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSuccessProduct(null)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSuccessProduct(null);
                  navigate('/bazaar');
                }}
                className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-600/30 transition-all"
              >
                View in Bazaar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
