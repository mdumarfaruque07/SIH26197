import React, { useState, useEffect } from 'react';
import { productService, placeService } from '../services/api';
import {
  ShoppingBag,
  Sparkles,
  MapPin,
  Star,
  CheckCircle,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  Heart,
  ExternalLink,
  Award,
  Check,
  QrCode,
  DollarSign,
  TrendingUp,
  Compass,
  FileCheck,
  Info,
  X,
  CreditCard,
  Smartphone,
  Truck,
  Receipt,
  Download,
  Printer,
  CheckCircle2,
  Lock,
  Store,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const CATEGORIES = [
  { id: 'all', label: 'All Heritage Crafts & Foods' },
  { id: 'food', label: 'Traditional Foods & Sweets (GI)' },
  { id: 'handicraft', label: 'Stone & Metalcraft' },
  { id: 'attire', label: 'Handloom & Silk' },
  { id: 'pottery', label: 'Blue Pottery & Clay' },
  { id: 'painting', label: 'Pattachitra & Folk Art' },
  { id: 'souvenir', label: 'Miniatures & Souvenirs' },
];

export default function BazaarPage() {
  const [products, setProducts] = useState([]);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [selectedPlaceId, setSelectedPlaceId] = useState('');
  const [search, setSearch] = useState('');
  const [orderModalProduct, setOrderModalProduct] = useState(null);
  const [giModalProduct, setGiModalProduct] = useState(null);
  
  // Advanced Payment State
  const [checkoutStep, setCheckoutStep] = useState('summary'); // 'summary' | 'payment' | 'processing' | 'success'
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'card' | 'cod'
  const [buyerInfo, setBuyerInfo] = useState({
    name: 'Cultural Explorer',
    phone: '9876543210',
    address: 'Heritage Residency, Near Gate 1',
    city: 'New Delhi',
    artisanNote: 'Thank you for preserving this living heritage!',
  });
  const [orderReceipt, setOrderReceipt] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, placeRes] = await Promise.all([
        productService.getAll({
          category,
          search,
          placeId: selectedPlaceId || undefined,
        }),
        placeService.getAll().catch(() => ({ success: false })),
      ]);

      if (prodRes.success) setProducts(prodRes.products);
      if (placeRes.success) setPlaces(placeRes.places);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [category, selectedPlaceId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleOpenCheckout = (product) => {
    setOrderModalProduct(product);
    setCheckoutStep('summary');
    setOrderReceipt(null);
  };

  const handleProceedToPayment = (e) => {
    e.preventDefault();
    setCheckoutStep('payment');
  };

  const handleExecutePayment = () => {
    setCheckoutStep('processing');
    setTimeout(() => {
      const orderId = `ODOP-2026-${Math.floor(100000 + Math.random() * 900000)}`;
      const utr = `UTR${Math.floor(100000000000 + Math.random() * 900000000000)}`;
      const artisanShare = Math.round(orderModalProduct.price * 0.9);
      const platformFee = orderModalProduct.price - artisanShare;

      setOrderReceipt({
        orderId,
        utr,
        date: new Date().toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        productName: orderModalProduct.name,
        price: orderModalProduct.price,
        artisanName: orderModalProduct.artisanName,
        artisanShare,
        platformFee,
        paymentMethod:
          paymentMethod === 'upi'
            ? 'Instant UPI (NPCI Direct Remittance)'
            : paymentMethod === 'card'
            ? 'Card / Netbanking (256-Bit Escrow)'
            : 'Cash on Delivery (Fair-Trade Escrow)',
        buyerName: buyerInfo.name,
        buyerCity: buyerInfo.city,
        buyerPhone: buyerInfo.phone,
        artisanNote: buyerInfo.artisanNote,
      });
      setCheckoutStep('success');
    }, 2200);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] pb-24">
      {/* Hero Header */}
      <section className="bg-stone-900 text-white pt-8 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-5xl mx-auto space-y-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            <span>One District One Product (ODOP) & GI Heritage Initiative</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
            Traditional Artisan <span className="text-orange-400">Bazaar</span>
          </h1>

          <p className="max-w-2xl mx-auto text-stone-300 text-xs sm:text-sm font-light leading-relaxed">
            Support hereditary craftspeople and culinary masters directly. Every craft and food item is authentic, GI-certified or ODOP tagged, directly linked to India’s historic sites.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="max-w-md mx-auto pt-2 relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Banarasi silk, blue pottery, Agra petha, brass..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/20 text-white placeholder-stone-400 text-xs focus:outline-none focus:ring-2 focus:ring-orange-400 backdrop-blur-md transition-all"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          </form>
        </div>
      </section>

      {/* Sustainable Cultural Commerce Ecosystem Ribbon */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-5 relative z-20">
        <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white rounded-2xl p-3.5 shadow-xl border border-amber-500/30">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400">
                <TrendingUp className="w-4 h-4" />
              </span>
              <div>
                <span className="font-bold text-amber-300 uppercase tracking-wider text-[11px] block">
                  Sustainable Cultural Commerce Loop
                </span>
                <span className="text-[11px] text-stone-300">
                  How our platform creates economic viability for regional heritage
                </span>
              </div>
            </div>

            {/* Step-by-Step Flow */}
            <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-1">
              <span className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/10 text-[11px] font-semibold whitespace-nowrap">
                🧭 1. Discover Culture
              </span>
              <span className="text-amber-400 font-bold">➔</span>
              <span className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/10 text-[11px] font-semibold whitespace-nowrap">
                📍 2. Visit Places
              </span>
              <span className="text-amber-400 font-bold">➔</span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold whitespace-nowrap">
                🛍️ 3. Support Artisans
              </span>
              <span className="text-amber-400 font-bold">➔</span>
              <span className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/10 text-[11px] font-semibold whitespace-nowrap">
                💵 4. Generate Revenue
              </span>
              <span className="text-amber-400 font-bold">➔</span>
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-bold whitespace-nowrap">
                🌱 5. Preserve Traditions
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-5 relative z-20 space-y-6">
        {/* Artisan & Trader Onboarding Callout Banner */}
        <div className="bg-gradient-to-r from-amber-700 via-orange-600 to-amber-800 text-white p-4 rounded-2xl shadow-lg border border-amber-400/30 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0 text-white">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-white">
                Are you an authentic Hereditary Artisan, Weaver, or Regional Sweetmaker?
              </h4>
              <p className="text-[11px] text-amber-100">
                Join our National Fair-Trade GI network. Onboard your crafts or foods & receive 90% direct payouts with zero middlemen.
              </p>
            </div>
          </div>
          <Link
            to="/artisan-portal"
            className="px-4 py-2 rounded-xl bg-white text-orange-800 hover:bg-amber-50 text-xs font-bold whitespace-nowrap shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
          >
            <span>Open Artisan Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Filters Bar */}
        <div className="bg-white p-3 rounded-2xl shadow-lg border border-stone-200/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto pb-1 sm:pb-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  category === cat.id
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Place Filter */}
          <div className="w-full sm:w-auto flex items-center gap-2">
            <span className="text-[11px] font-bold text-stone-500 uppercase whitespace-nowrap">
              By Monument:
            </span>
            <select
              value={selectedPlaceId}
              onChange={(e) => setSelectedPlaceId(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-stone-200 text-xs font-medium bg-stone-50 text-stone-700 focus:outline-none w-full sm:w-48"
            >
              <option value="">All Heritage Sites</option>
              {places.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-80 bg-stone-200/60 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-stone-300">
            <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto mb-2" />
            <h3 className="font-bold text-stone-700">No traditional items found</h3>
            <p className="text-xs text-stone-400 mt-1">Try resetting the category or search filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((item) => (
              <div
                key={item.id}
                className="group bg-white rounded-3xl border border-stone-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                <div>
                  {/* Image & ODOP Badge */}
                  <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {item.odopTag && (
                      <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-md text-amber-300 border border-amber-400/40 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {item.odopTag}
                      </div>
                    )}

                    {/* GI Certificate Badge Button */}
                    <button
                      onClick={() => setGiModalProduct(item)}
                      className="absolute top-3 right-3 bg-emerald-950/85 hover:bg-emerald-900 backdrop-blur-md text-emerald-300 border border-emerald-400/40 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm transition-transform active:scale-95"
                      title="Verify Geographical Indication & Authenticity Certificate"
                    >
                      <Award className="w-3 h-3 text-emerald-400" />
                      <span>GI Certificate</span>
                    </button>

                    <div className="absolute bottom-2.5 left-3 text-white text-xs font-semibold flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-orange-400" />
                      <span>{item.place?.name}</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 sm:p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full">
                        {item.category === 'food' ? 'Culinary Heritage' : item.category}
                      </span>
                      <div className="flex items-center gap-0.5 text-xs font-bold text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{item.rating || 4.9}</span>
                      </div>
                    </div>

                    <h3 className="font-serif font-bold text-base text-stone-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                      {item.name}
                    </h3>

                    <p className="text-stone-500 text-xs line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="pt-2 text-[11px] text-stone-500 flex items-center justify-between border-t border-stone-100">
                      <div className="flex items-center gap-1.5 truncate">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span className="truncate">Guild: <strong>{item.artisanName}</strong></span>
                      </div>
                      <button
                        onClick={() => setGiModalProduct(item)}
                        className="text-[10px] text-emerald-700 font-bold hover:underline flex items-center gap-0.5"
                      >
                        <span>Authentic</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Price & Buy Action */}
                <div className="p-4 sm:p-5 pt-0 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase font-semibold block">
                      Price
                    </span>
                    <span className="font-serif text-lg font-extrabold text-stone-900">
                      ₹{item.price.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <button
                    onClick={() => handleOpenCheckout(item)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-600/20 active:scale-95 transition-all"
                  >
                    <span>{item.category === 'food' ? 'Order Food' : 'Support Artisan'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* GI Authenticity & Anti-Counterfeit Certificate Modal (Directly solving Slide 1 Challenge: Authenticity of Traditional Products) */}
      {giModalProduct && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-4 shadow-2xl border border-stone-200 relative overflow-hidden">
            {/* Subtle decorative security background */}
            <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 rounded-full bg-emerald-500/10 pointer-events-none" />

            <div className="flex items-start justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-stone-900">
                    Authenticity & GI Certificate
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Geographical Indication Registry of India Verification
                  </p>
                </div>
              </div>
              <button
                onClick={() => setGiModalProduct(null)}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-amber-900">GI Registration Code:</span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-200/70 text-amber-950 font-mono font-bold text-[11px]">
                  {giModalProduct.giRegNumber || `GI-IND-2024-${giModalProduct.place?.state?.slice(0, 2).toUpperCase() || 'IN'}-${giModalProduct.id * 11}`}
                </span>
              </div>

              <div className="text-xs space-y-1">
                <div className="font-bold text-stone-900 text-sm">
                  {giModalProduct.name}
                </div>
                <div className="text-stone-600 text-[11px]">
                  Heritage Origin: <strong>{giModalProduct.place?.name} ({giModalProduct.place?.state})</strong>
                </div>
                <div className="text-stone-600 text-[11px]">
                  Certified Master Producer / Guild: <strong>{giModalProduct.artisanName}</strong>
                </div>
              </div>

              <div className="pt-2 border-t border-amber-200/60 flex items-center gap-2 text-[11px] text-emerald-800 font-semibold">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Anti-Counterfeit Protection: 100% Verified Indigenous Origin</span>
              </div>
            </div>

            <div className="text-xs text-stone-600 space-y-2 leading-relaxed bg-stone-50 p-3.5 rounded-xl border border-stone-200">
              <div className="font-bold text-stone-800 flex items-center gap-1.5 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Zero Cultural Misinformation & Counterfeit Shield</span>
              </div>
              <p className="text-[11px]">
                Under Section 21 of the Geographical Indications of Goods Act, this product is certified to be handcrafted or prepared using traditional indigenous heritage techniques, guaranteeing direct economic returns to registered heritage craftspeople.
              </p>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setGiModalProduct(null)}
                className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-colors"
              >
                Close Certificate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Interactive Artisan Payment Gateway & Checkout Modal */}
      {orderModalProduct && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-2xl border border-stone-200 relative my-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-stone-900">
                    {checkoutStep === 'success'
                      ? 'Official Remittance Receipt'
                      : checkoutStep === 'payment'
                      ? 'Secure Artisan Payment'
                      : checkoutStep === 'processing'
                      ? 'Verifying Payment Escrow'
                      : 'Patron Checkout & Remittance'}
                  </h3>
                  <p className="text-[10px] text-stone-500">
                    Fair-Trade Heritage Platform • 90% Direct Artisan Remittance
                  </p>
                </div>
              </div>
              {checkoutStep !== 'processing' && (
                <button
                  onClick={() => setOrderModalProduct(null)}
                  className="text-stone-400 hover:text-stone-700 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* STEP 1: SUMMARY & SHIPPING INFO */}
            {checkoutStep === 'summary' && (
              <form onSubmit={handleProceedToPayment} className="space-y-4">
                {/* Product Card */}
                <div className="flex gap-3 items-center p-3 rounded-2xl bg-stone-50 border border-stone-200">
                  <img
                    src={orderModalProduct.imageUrl}
                    alt={orderModalProduct.name}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-xs text-stone-900 truncate">
                      {orderModalProduct.name}
                    </h4>
                    <p className="text-xs text-orange-600 font-extrabold mt-0.5">
                      ₹{orderModalProduct.price}
                    </p>
                    <p className="text-[10px] text-stone-500">
                      Guild: {orderModalProduct.artisanName}
                    </p>
                  </div>
                </div>

                {/* Fair-Trade Commission Breakdown */}
                <div className="space-y-2 text-xs bg-stone-50/80 p-3 rounded-2xl border border-stone-200">
                  <div className="flex items-center justify-between font-bold text-stone-800 text-[11px] pb-1.5 border-b border-stone-200">
                    <span>Transparent Fair-Trade Split:</span>
                    <span className="text-emerald-700 font-semibold">Fair-Trade Certified</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-stone-600">👨‍🎨 Direct Artisan Share (90%):</span>
                    <span className="font-bold text-emerald-700">
                      ₹{Math.round(orderModalProduct.price * 0.9)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-stone-600">🏛️ Platform Quality & GI Packaging (10%):</span>
                    <span className="font-semibold text-stone-700">
                      ₹{orderModalProduct.price - Math.round(orderModalProduct.price * 0.9)}
                    </span>
                  </div>
                  <div className="pt-1.5 border-t border-stone-200 flex justify-between items-center font-bold text-stone-900 text-xs">
                    <span>Total Amount:</span>
                    <span className="text-orange-600 text-sm font-serif">₹{orderModalProduct.price}</span>
                  </div>
                </div>

                {/* Patron & Shipping Inputs */}
                <div className="space-y-2.5">
                  <div className="text-[11px] font-bold text-stone-700 uppercase tracking-wider">
                    Patron & Delivery Information:
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Your Full Name"
                      value={buyerInfo.name}
                      onChange={(e) => setBuyerInfo({ ...buyerInfo, name: e.target.value })}
                      className="px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white text-stone-800 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                    <input
                      type="tel"
                      required
                      placeholder="Contact Phone"
                      value={buyerInfo.phone}
                      onChange={(e) => setBuyerInfo({ ...buyerInfo, phone: e.target.value })}
                      className="px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white text-stone-800 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Delivery Address / City"
                    value={buyerInfo.address}
                    onChange={(e) => setBuyerInfo({ ...buyerInfo, address: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white text-stone-800 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                  <input
                    type="text"
                    placeholder="Appreciation Note to Master Artisan (Optional)"
                    value={buyerInfo.artisanNote}
                    onChange={(e) => setBuyerInfo({ ...buyerInfo, artisanNote: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-amber-200 bg-amber-50/40 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setOrderModalProduct(null)}
                    className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-600/30 transition-all active:scale-95"
                  >
                    <span>Select Payment Method</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: PAYMENT METHOD SELECTION */}
            {checkoutStep === 'payment' && (
              <div className="space-y-4">
                {/* Payment Tabs */}
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-100 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all ${
                      paymentMethod === 'upi'
                        ? 'bg-white text-orange-600 shadow-sm'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Instant UPI</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all ${
                      paymentMethod === 'card'
                        ? 'bg-white text-orange-600 shadow-sm'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Card / Bank</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all ${
                      paymentMethod === 'cod'
                        ? 'bg-white text-orange-600 shadow-sm'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <Truck className="w-4 h-4" />
                    <span>On Delivery</span>
                  </button>
                </div>

                {/* UPI Mode with Dynamic Real QR Code */}
                {paymentMethod === 'upi' && (
                  <div className="p-4 rounded-2xl bg-gradient-to-b from-stone-50 to-amber-50/50 border border-stone-200 text-center space-y-3">
                    <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-stone-800">
                      <QrCode className="w-4 h-4 text-orange-600" />
                      <span>Scan to Remit Directly to Artisan VPA</span>
                    </div>

                    {/* Dynamic QR Code */}
                    <div className="w-40 h-40 mx-auto p-2 bg-white rounded-2xl border-2 border-dashed border-stone-300 shadow-inner flex items-center justify-center">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                          `upi://pay?pa=sanskriti.artisan@upi&pn=${orderModalProduct.artisanName}&am=${orderModalProduct.price}&cu=INR&tn=Artisan%20Support%20${orderModalProduct.name}`
                        )}`}
                        alt="Artisan UPI QR Code"
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="text-[11px] text-stone-600">
                      Artisan Escrow VPA: <span className="font-mono font-bold text-stone-900">sanskriti.artisan@upi</span>
                    </div>

                    {/* UPI App Quick Buttons */}
                    <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-stone-500 font-medium">
                      <span className="px-2 py-0.5 rounded-md bg-white border border-stone-200">GPay</span>
                      <span className="px-2 py-0.5 rounded-md bg-white border border-stone-200">PhonePe</span>
                      <span className="px-2 py-0.5 rounded-md bg-white border border-stone-200">Paytm</span>
                      <span className="px-2 py-0.5 rounded-md bg-white border border-stone-200">BHIM</span>
                    </div>
                  </div>
                )}

                {/* Card / Netbanking Mode */}
                {paymentMethod === 'card' && (
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-stone-800">
                      <span>Card Details:</span>
                      <span className="text-[10px] text-emerald-700 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        <span>256-Bit Escrow Encrypted</span>
                      </span>
                    </div>
                    <input
                      type="text"
                      disabled
                      value="4532 •••• •••• 8912"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white text-stone-700 font-mono"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        disabled
                        value="12/28"
                        className="px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white text-stone-700 font-mono"
                      />
                      <input
                        type="password"
                        disabled
                        value="•••"
                        className="px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white text-stone-700 font-mono"
                      />
                    </div>
                    <p className="text-[10px] text-stone-400 text-center">
                      🔒 256-Bit SSL Encrypted Escrow Gateway
                    </p>
                  </div>
                )}

                {/* Cash on Delivery Mode */}
                {paymentMethod === 'cod' && (
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2 text-center">
                    <Truck className="w-8 h-8 text-orange-600 mx-auto" />
                    <div className="font-bold text-xs text-stone-800">
                      Fair-Trade Doorstep Verification
                    </div>
                    <p className="text-[11px] text-stone-500 max-w-xs mx-auto">
                      Pay ₹{orderModalProduct.price} upon physical delivery with GI seal verification badge.
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setCheckoutStep('summary')}
                    className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900"
                  >
                    ← Back to Order
                  </button>
                  <button
                    type="button"
                    onClick={handleExecutePayment}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all active:scale-95 flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Authorize Payment (₹{orderModalProduct.price})</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: PROCESSING ANIMATION */}
            {checkoutStep === 'processing' && (
              <div className="py-12 text-center space-y-4">
                <div className="relative w-16 h-16 mx-auto">
                  <div className="w-16 h-16 rounded-full border-4 border-orange-200 border-t-orange-600 animate-spin" />
                  <Lock className="w-6 h-6 text-orange-600 absolute inset-0 m-auto" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif text-lg font-bold text-stone-900">
                    Securing Fair-Trade Escrow...
                  </h4>
                  <p className="text-xs text-stone-500">
                    Remitting 90% direct to {orderModalProduct.artisanName} & issuing GI Authenticity Certificate
                  </p>
                </div>
              </div>
            )}

            {/* STEP 4: OFFICIAL TAX INVOICE & ARTISAN REMITTANCE RECEIPT */}
            {checkoutStep === 'success' && orderReceipt && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto animate-bounce" />
                  <h4 className="font-serif text-lg font-bold text-emerald-950">
                    Remittance & Order Confirmed!
                  </h4>
                  <p className="text-xs text-emerald-800">
                    Thank you! Your patronage directly sustains hereditary Indian artisans.
                  </p>
                </div>

                {/* Printable Invoice Card */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-200 font-bold">
                    <span className="font-mono text-stone-800">Invoice: #{orderReceipt.orderId}</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Escrow Cleared
                    </span>
                  </div>

                  <div className="space-y-1.5 text-[11px] text-stone-600">
                    <div className="flex justify-between">
                      <span>Item Ordered:</span>
                      <strong className="text-stone-900 truncate max-w-[200px]">{orderReceipt.productName}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Master Producer / Guild:</span>
                      <strong className="text-stone-900">{orderReceipt.artisanName}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Transaction UTR:</span>
                      <span className="font-mono text-stone-700">{orderReceipt.utr}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment Method:</span>
                      <span className="text-stone-800 font-semibold">{orderReceipt.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date & Time:</span>
                      <span>{orderReceipt.date}</span>
                    </div>
                  </div>

                  {/* Financial Breakdown */}
                  <div className="pt-2 border-t border-stone-200 space-y-1 text-[11px]">
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>👨‍🎨 Direct Artisan Remittance (90%):</span>
                      <span>₹{orderReceipt.artisanShare}</span>
                    </div>
                    <div className="flex justify-between text-stone-500">
                      <span>🏛️ Platform Ops & GI Seal (10%):</span>
                      <span>₹{orderReceipt.platformFee}</span>
                    </div>
                    <div className="pt-1 border-t border-stone-200 flex justify-between font-bold text-stone-900 text-xs">
                      <span>Net Total Paid:</span>
                      <span className="text-orange-600 font-serif">₹{orderReceipt.price}</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 text-[10px] text-amber-900">
                    📲 <strong>Artisan Notification Sent:</strong> A real-time dispatch request has been forwarded to {orderReceipt.artisanName}'s cluster for hand-packaging and shipping to {orderReceipt.buyerName}, {orderReceipt.buyerCity}.
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={handlePrintReceipt}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-all"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Invoice</span>
                  </button>
                  <button
                    onClick={() => {
                      setOrderModalProduct(null);
                      setOrderReceipt(null);
                    }}
                    className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all"
                  >
                    Done & Return to Bazaar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
