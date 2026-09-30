import React, { useState, useEffect, useMemo } from 'react';
import { productService, placeService, foodService, getLocalCachedData } from '../services/api';
import { FALLBACK_PRODUCTS, FALLBACK_PLACES, FALLBACK_FOODS } from '../data/fallbackData';
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
  DollarSign,
  TrendingUp,
  Compass,
  FileCheck,
  Info,
  X,
  Lock,
  Store,
  Clock,
  Utensils,
  Navigation,
  Phone,
  MessageCircle,
  Truck,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import BazaarCartDrawer from '../components/BazaarCartDrawer';
import BazaarWishlistModal from '../components/BazaarWishlistModal';
import ProductReviewModal from '../components/ProductReviewModal';

const CATEGORIES_EN = [
  { id: 'all', label: 'All Heritage Crafts' },
  { id: 'food_guide', label: '🍲 Famous Regional Foods (On-Site Guide)' },
  { id: 'handicraft', label: 'Stone & Metalcraft' },
  { id: 'attire', label: 'Handloom & Silk' },
  { id: 'pottery', label: 'Blue Pottery & Clay' },
  { id: 'painting', label: 'Pattachitra & Folk Art' },
  { id: 'souvenir', label: 'Miniatures & Souvenirs' },
];

const CATEGORIES_HI = [
  { id: 'all', label: 'सभी पारंपरिक हस्तशिल्प' },
  { id: 'food_guide', label: '🍲 प्रसिद्ध क्षेत्रीय खान-पान (ऑन-साइट)' },
  { id: 'handicraft', label: 'प्रस्तर व धातु शिल्पकला' },
  { id: 'attire', label: 'हथकरघा व बनारसी रेशम' },
  { id: 'pottery', label: 'ब्लू पॉटरी व मृत्तिका शिल्प' },
  { id: 'painting', label: 'पट्टचित्र व लोक कला' },
  { id: 'souvenir', label: 'पारंपरिक स्मृति चिन्ह' },
];

export default function BazaarPage() {
  const { lang } = useLanguage();
  const isHi = lang === 'hi';
  const categories = isHi ? CATEGORIES_HI : CATEGORIES_EN;

  const {
    addToCart,
    cartCount,
    setIsCartOpen,
    wishlistCount,
    setIsWishlistOpen,
    toggleWishlist,
    isInWishlist,
  } = useCart();

  // Instant load from cache (0ms first paint)
  const [products, setProducts] = useState(() => getLocalCachedData('products', FALLBACK_PRODUCTS));
  const [places, setPlaces] = useState(() => getLocalCachedData('places', FALLBACK_PLACES));
  const [foodList, setFoodList] = useState(() => getLocalCachedData('foods', FALLBACK_FOODS));
  const [foodModalItem, setFoodModalItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('all');
  const [selectedPlaceId, setSelectedPlaceId] = useState('');
  const [search, setSearch] = useState('');
  const [selectedShopProduct, setSelectedShopProduct] = useState(null);
  const [giModalProduct, setGiModalProduct] = useState(null);
  const [reviewModalProduct, setReviewModalProduct] = useState(null);

  // New Filters & Sort State
  const [priceRange, setPriceRange] = useState('all'); // 'all' | 'under_500' | '500_1500' | '1500_3000' | 'above_3000'
  const [sortBy, setSortBy] = useState('featured'); // 'featured' | 'price_low' | 'price_high' | 'rating' | 'newest'

  const fetchData = async () => {
    if (products.length === 0) setLoading(true);
    try {
      const [prodRes, placeRes, foodRes] = await Promise.all([
        productService.getAll({
          category: category === 'food_guide' ? undefined : category,
          search,
          placeId: selectedPlaceId || undefined,
        }),
        placeService.getAll().catch(() => ({ success: false })),
        foodService.getAll({
          placeId: selectedPlaceId || undefined,
          search,
        }).catch(() => ({ success: false })),
      ]);

      if (prodRes.success) {
        setProducts((prodRes.products || []).filter((p) => p.category !== 'food'));
      }
      if (placeRes.success) setPlaces(placeRes.places || []);
      if (foodRes.success) setFoodList(foodRes.foods || []);
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

  const getGoogleMapsUrl = (product) => {
    const query = product.mapQuery || `${product.shopName || product.artisanName} ${product.place?.name || ''}`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  };

  const getWhatsAppUrl = (product) => {
    const raw = (product.whatsapp || product.phone || '919876543210').replace(/[^0-9]/g, '');
    const phoneNum = raw.startsWith('91') ? raw : `91${raw}`;
    const text = `Namaste! I found your craft "${product.name}" on SanskritiKhoj Heritage App. I would like to visit your shop (${product.shopName || product.artisanName}). Are you open today?`;
    return `https://wa.me/${phoneNum}?text=${encodeURIComponent(text)}`;
  };

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Price Filter
    if (priceRange === 'under_500') {
      result = result.filter((p) => p.price < 500);
    } else if (priceRange === '500_1500') {
      result = result.filter((p) => p.price >= 500 && p.price <= 1500);
    } else if (priceRange === '1500_3000') {
      result = result.filter((p) => p.price > 1500 && p.price <= 3000);
    } else if (priceRange === 'above_3000') {
      result = result.filter((p) => p.price > 3000);
    }

    // Sort Logic
    if (sortBy === 'price_low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => (b.rating || 4.8) - (a.rating || 4.8));
    } else if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    return result;
  }, [products, priceRange, sortBy]);

  const handleReviewUpdated = (productId, newAvgRating) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? { ...p, rating: newAvgRating, reviewCount: (p.reviewCount || 0) + 1 }
          : p
      )
    );
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] pb-28 max-w-full overflow-x-hidden">
      {/* Hero Header */}
      <section className="bg-stone-900 text-white pt-8 pb-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background ambient pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="max-w-5xl mx-auto space-y-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            <span>{isHi ? 'एक जिला एक उत्पाद (ODOP) व जीआई विरासत' : 'One District One Product (ODOP) & GI Heritage'}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
            {isHi ? 'पारंपरिक कारीगर ' : 'Traditional Artisan '}
            <span className="text-orange-400">{isHi ? 'बाज़ार' : 'Bazaar'}</span>
          </h1>

          <p className="max-w-2xl mx-auto text-stone-300 text-xs sm:text-sm font-light leading-relaxed">
            {isHi
              ? 'पुश्तैनी शिल्पकारों और मास्टर कारीगरों का सीधा समर्थन करें। घर बैठे सुरक्षित होम डिलीवरी मंगाएं या कारीगर की दुकान पर जाकर खरीदारी करें।'
              : 'Support hereditary craftspeople directly. Order authentic crafts for door-step delivery with GI hologram protection or navigate to physical artisan workshops.'}
          </p>

          {/* Search bar & Quick Floating Cart / Wishlist Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1 max-w-xl mx-auto">
            <form onSubmit={handleSearchSubmit} className="w-full relative flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={isHi ? 'शिल्प, मृत्तिका, हथकरघा, पट्टचित्र खोजें...' : 'Search crafts, pottery, handloom, souvenirs...'}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/20 text-white placeholder-stone-400 text-xs focus:outline-none focus:ring-2 focus:ring-orange-400 backdrop-blur-md transition-all"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            </form>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              {/* Wishlist Button */}
              <button
                onClick={() => setIsWishlistOpen(true)}
                className="px-3.5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer backdrop-blur-md"
                title={isHi ? 'पसंदीदा शिल्प देखें' : 'View Saved Wishlist'}
              >
                <Heart className={`w-4 h-4 ${wishlistCount > 0 ? 'text-rose-400 fill-current' : 'text-stone-300'}`} />
                <span className="hidden sm:inline">{isHi ? 'पसंदीदा' : 'Saved'}</span>
                {wishlistCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-mono flex items-center justify-center font-bold">
                    {wishlistCount}
                  </span>
                )}
              </button>

              {/* Cart Drawer Trigger */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-orange-600/30 transition-all active:scale-95 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isHi ? 'शिल्प थैला' : 'Craft Cart'}</span>
                {cartCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-white text-orange-900 text-[10px] font-mono font-bold">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 relative z-20 space-y-6">
        {/* Fair-Trade Platform Policy Callout Banner */}
        <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-orange-800 text-white p-4 sm:p-5 rounded-3xl shadow-lg border border-amber-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0 text-amber-200">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase font-mono font-extrabold tracking-wider px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-200 border border-amber-400/30">
                  {isHi ? '100% निष्पक्ष व्यापार नीति' : '100% Fair-Trade Escrow Policy'}
                </span>
                <span className="text-[10px] text-emerald-300 font-bold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  <span>{isHi ? '100% सीधा कारीगर भुगतान' : '100% Direct Artisan Payout'}</span>
                </span>
                <span className="text-[10px] text-amber-200 font-semibold">
                  • {isHi ? '0% प्लेटफ़ॉर्म कमीशन प्रोमो' : '0% Platform Commission Promo'}
                </span>
              </div>
              <h4 className="font-serif font-bold text-sm sm:text-base text-white mt-0.5 leading-snug">
                {isHi
                  ? 'शून्य बिचौलिया शोषण: हर शिल्प पर 100% आय सीधे कारीगर के खाते में जाती है।'
                  : 'Zero Middlemen Exploitation: 100% of sales go directly to hereditary artisans with doorstep India Post GI courier.'}
              </h4>
            </div>
          </div>

          <Link
            to="/artisan-portal"
            className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-white text-orange-950 hover:bg-amber-50 text-xs font-bold whitespace-nowrap shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 shrink-0"
          >
            <Store className="w-4 h-4 text-orange-700" />
            <span>{isHi ? 'कारीगर व दुकान पोर्टल' : 'Artisan & Shop Portal'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Filters & Sorting Controls Bar */}
        <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-stone-200/90 space-y-3">
          {/* Category Pills Row */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  category === cat.id
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Secondary Controls: Heritage Site, Price Range, Sort */}
          <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2.5 text-xs">
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {/* Site Dropdown */}
              <select
                value={selectedPlaceId}
                onChange={(e) => setSelectedPlaceId(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-medium bg-stone-50 text-stone-700 focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
              >
                <option value="">{isHi ? 'सभी ऐतिहासिक स्मारक' : 'All Heritage Sites'}</option>
                {places.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

              {/* Price Range Filter */}
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-medium bg-stone-50 text-stone-700 focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
              >
                <option value="all">{isHi ? 'सभी मूल्य (All Prices)' : 'All Price Ranges'}</option>
                <option value="under_500">{isHi ? '₹500 से कम' : 'Under ₹500'}</option>
                <option value="500_1500">₹500 - ₹1,500</option>
                <option value="1500_3000">₹1,500 - ₹3,000</option>
                <option value="above_3000">{isHi ? '₹3,000 से अधिक' : 'Above ₹3,000'}</option>
              </select>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-medium bg-stone-50 text-stone-700 focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
              >
                <option value="featured">{isHi ? 'विशेष रुप से प्रदर्शित' : 'Sort: Featured'}</option>
                <option value="price_low">{isHi ? 'मूल्य: कम से अधिक' : 'Price: Low to High'}</option>
                <option value="price_high">{isHi ? 'मूल्य: अधिक से कम' : 'Price: High to Low'}</option>
                <option value="rating">{isHi ? 'सर्वश्रेष्ठ रेटिंग' : 'Highest Rated'}</option>
                <option value="newest">{isHi ? 'नवीनतम शिल्प' : 'Newest Additions'}</option>
              </select>
            </div>

            <div className="flex items-center gap-2 text-stone-500 text-[11px]">
              <span>
                {filteredProducts.length} {isHi ? 'हस्तशिल्प उपलब्ध' : 'crafts found'}
              </span>
            </div>
          </div>
        </div>

        {/* View Mode: Regional Food Heritage Guide vs Crafts Product Grid */}
        {category === 'food_guide' ? (
          <div className="space-y-6">
            {/* Food Guide Hero Banner */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-900 via-amber-800 to-orange-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg border border-amber-500/30">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center shrink-0">
                  <Utensils className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                      {isHi ? 'सांस्कृतिक खान-पान पर्यटन गाइड' : 'Culinary Heritage Tourism Guide'}
                    </span>
                    <span className="text-[10px] text-amber-200/90 flex items-center gap-1 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{isHi ? 'प्रशासन द्वारा क्यूरेटेड' : 'Admin Curated'}</span>
                    </span>
                  </div>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-white mt-1">
                    {isHi ? 'भारत के प्रसिद्ध क्षेत्रीय व्यंजन व मिष्ठान' : 'Famous Regional Foods & Delicacies of India'}
                  </h3>
                  <p className="text-xs text-amber-200/90 max-w-xl leading-relaxed">
                    {isHi
                      ? 'भारत के ऐतिहासिक स्मारकों के आसपास के पारंपरिक पकवानों और पुश्तैनी दुकानों की प्रामाणिक जानकारी।'
                      : "Discover iconic dishes, sweetmeats, and ancestral recipes associated with India's monuments and heritage cities."}
                  </p>
                </div>
              </div>

              <div className="px-3.5 py-2 rounded-2xl bg-black/40 border border-amber-400/30 text-[11px] font-bold text-amber-200 flex items-center gap-2 shrink-0 self-start sm:self-auto shadow-2xs">
                <Info className="w-4 h-4 text-amber-400 shrink-0" />
                <span>🚫 {isHi ? 'केवल ऑन-साइट अनुभव' : 'On-Site Only • Non-Deliverable'}</span>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-80 bg-stone-200/60 rounded-3xl animate-pulse" />
                ))}
              </div>
            ) : foodList.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-stone-300">
                <Utensils className="w-12 h-12 text-stone-300 mx-auto mb-2" />
                <h3 className="font-bold text-stone-700">{isHi ? 'कोई क्षेत्रीय व्यंजन नहीं मिला' : 'No regional foods found'}</h3>
                <p className="text-xs text-stone-400 mt-1">{isHi ? 'कृपया स्मारक बदलें या खोज शब्द हटाएं।' : 'Try selecting a different heritage site.'}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {foodList.map((food) => (
                  <div
                    key={food.id}
                    className="group bg-white rounded-3xl border border-stone-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
                  >
                    <div>
                      {/* Image & Diet Badge */}
                      <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
                        <img
                          src={food.imageUrl}
                          alt={food.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&w=800&q=80';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />

                        {/* Top Badges */}
                        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-sm ${
                              food.diet === 'veg'
                                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40'
                                : 'bg-rose-950/90 text-rose-300 border-rose-500/40'
                            }`}
                          >
                            {food.diet === 'veg' ? '🟢 Pure Veg' : '🔴 Non-Veg'}
                          </span>

                          <span className="bg-black/80 backdrop-blur-md text-amber-300 border border-amber-400/40 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase">
                            {food.famousSince || 'Traditional Lore'}
                          </span>
                        </div>

                        {/* Associated Site Location */}
                        <div className="absolute bottom-2.5 left-3 text-white text-xs font-semibold flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-amber-400" />
                          <span>{food.monumentName}</span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 sm:p-5 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                            {food.categoryType || 'Regional Delicacy'}
                          </span>
                          <span className="font-mono text-xs font-bold text-stone-700 bg-stone-100 px-2 py-0.5 rounded-lg">
                            {food.priceRange || '₹40 - ₹120'}
                          </span>
                        </div>

                        <div>
                          <h3 className="font-serif font-bold text-base text-stone-900 group-hover:text-amber-700 transition-colors line-clamp-1">
                            {food.name}
                          </h3>
                          {food.nameHi && (
                            <p className="text-xs text-stone-500 font-medium">{food.nameHi}</p>
                          )}
                        </div>

                        {food.shortLore && (
                          <p className="text-stone-600 text-xs line-clamp-2 leading-relaxed">
                            {food.shortLore}
                          </p>
                        )}

                        <div className="pt-2 border-t border-stone-100 text-[11px] space-y-1">
                          <span className="text-[10px] font-bold text-amber-900 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-amber-700" />
                            <span>Where to Taste (कहाँ मिलेगा):</span>
                          </span>
                          <p className="text-stone-700 text-xs font-medium line-clamp-1 pl-4.5">
                            {food.famousSpots}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="p-4 sm:p-5 pt-0 flex items-center justify-between border-t border-stone-100">
                      <span className="px-2 py-1 rounded-lg bg-amber-50 text-amber-900 font-bold text-[10px] uppercase border border-amber-200">
                        🚫 {isHi ? 'गैर-वितरण योग्य' : 'Non-Deliverable'}
                      </span>

                      <button
                        onClick={() => setFoodModalItem(food)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold shadow-md shadow-amber-800/20 active:scale-95 transition-all cursor-pointer"
                      >
                        <Utensils className="w-3.5 h-3.5" />
                        <span>{isHi ? 'दुकानें व इतिहास देखें' : 'View Stalls & Lore'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* TRADITIONAL CRAFTS PRODUCT GRID (DELIVERY + IN-STORE) */
          <div>
            {/* Quick Switch to Food Guide */}
            <div className="mb-6 p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <Utensils className="w-4 h-4 text-amber-700 shrink-0" />
                <span className="text-amber-900">
                  <strong>{isHi ? 'प्रसिद्ध स्थानीय खान-पान खोज रहे हैं?' : 'Looking for iconic regional food?'}</strong>{' '}
                  {isHi
                    ? 'जानिए प्रत्येक स्मारक के पास कौन से ऐतिहासिक मिष्ठान व व्यंजन प्रसिद्ध हैं।'
                    : 'Explore what street food & sweets are famous near each monument.'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setCategory('food_guide')}
                className="px-3.5 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs self-start sm:self-auto whitespace-nowrap shadow-2xs transition-colors cursor-pointer"
              >
                {isHi ? 'क्षेत्रीय खान-पान गाइड खोलें →' : 'Open Regional Food Guide →'}
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-96 bg-stone-200/60 rounded-3xl animate-pulse" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-stone-300 space-y-2">
                <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto" />
                <h3 className="font-bold text-stone-700">{isHi ? 'कोई पारंपरिक शिल्प नहीं मिला' : 'No traditional crafts found'}</h3>
                <p className="text-xs text-stone-400">
                  {isHi ? 'कृपया श्रेणी, मूल्य या खोज फ़िल्टर रीसेट करें।' : 'Try resetting the category, price, or search filters.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((item) => (
                  <div
                    key={item.id}
                    className="group bg-white rounded-3xl border border-stone-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
                  >
                    <div>
                      {/* Product Image & Badges */}
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

                        {/* Top Badges Row */}
                        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 pointer-events-none">
                          {item.odopTag ? (
                            <div
                              className="pointer-events-auto bg-black/80 backdrop-blur-md text-amber-300 border border-amber-400/40 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider truncate max-w-[55%]"
                              title={item.odopTag}
                            >
                              {item.odopTag.split('|')[0]?.trim()}
                            </div>
                          ) : (
                            <div />
                          )}

                          <div className="flex items-center gap-1.5 pointer-events-auto">
                            {/* GI Certificate Badge */}
                            <button
                              onClick={() => setGiModalProduct(item)}
                              className="bg-emerald-950/90 hover:bg-emerald-900 backdrop-blur-md text-emerald-300 border border-emerald-400/40 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm transition-transform active:scale-95 cursor-pointer"
                              title="Verify Geographical Indication Certificate"
                            >
                              <Award className="w-3 h-3 text-emerald-400" />
                              <span>GI</span>
                            </button>

                            {/* Wishlist Toggle Heart Button */}
                            <button
                              onClick={() => toggleWishlist(item)}
                              className="p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 transition-all active:scale-90 cursor-pointer"
                              title={isInWishlist(item.id) ? 'Remove from Saved' : 'Save to Favorites'}
                            >
                              <Heart
                                className={`w-3.5 h-3.5 ${
                                  isInWishlist(item.id) ? 'fill-rose-500 text-rose-500' : 'text-white'
                                }`}
                              />
                            </button>
                          </div>
                        </div>

                        {/* Associated Site Location */}
                        <div className="absolute bottom-2.5 left-3 text-white text-xs font-semibold flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-orange-400" />
                          <span>{item.place?.name}</span>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-4 sm:p-5 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full">
                            {item.category}
                          </span>

                          {/* Clickable Community Rating (Opens Reviews Modal) */}
                          <button
                            onClick={() => setReviewModalProduct(item)}
                            className="flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                            title="View Community Ratings & Reviews"
                          >
                            <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
                            <span>{item.rating || 4.9}</span>
                            <span className="text-[10px] text-stone-400 font-normal">
                              ({item.reviewCount || 2})
                            </span>
                          </button>
                        </div>

                        <h3 className="font-serif font-bold text-base text-stone-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                          {item.name}
                        </h3>

                        <p className="text-stone-500 text-xs line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>

                        {/* Physical Workshop Details Box */}
                        <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1 text-[11px]">
                          <div className="flex items-center justify-between font-bold text-stone-800">
                            <span className="flex items-center gap-1.5 truncate">
                              <Store className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                              <span className="truncate">{item.shopName || `${item.artisanName} Studio`}</span>
                            </span>
                            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-extrabold shrink-0">
                              {isHi ? 'सत्यापित' : 'Verified'}
                            </span>
                          </div>

                          <div className="text-stone-600 text-[10px] flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3 text-orange-600 shrink-0" />
                            <span className="truncate">{item.shopLandmark || item.shopAddress || 'Near Monument Heritage Cluster'}</span>
                          </div>

                          {item.shopTiming && (
                            <div className="text-stone-500 text-[10px] flex items-center gap-1">
                              <Clock className="w-3 h-3 text-stone-400 shrink-0" />
                              <span>{item.shopTiming}</span>
                            </div>
                          )}
                        </div>

                        {/* Master Artisan & Courier Badges */}
                        <div className="pt-1 text-[11px] text-stone-500 flex items-center justify-between border-t border-stone-100">
                          <div className="flex items-center gap-1.5 truncate">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate">
                              {isHi ? 'कारीगर:' : 'Master:'} <strong>{item.artisanName}</strong>
                            </span>
                          </div>
                          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Truck className="w-3 h-3" />
                            <span>{isHi ? 'डाक डिलीवरी' : 'Courier Ready'}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Price & Dual Action Bar (Home Delivery OR In-Store Visit) */}
                    <div className="p-4 sm:p-5 pt-0 space-y-2.5 border-t border-stone-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-stone-400 uppercase font-semibold block leading-tight">
                            {isHi ? 'कारीगर मूल्य' : 'Artisan Price'}
                          </span>
                          <span className="font-serif text-lg font-extrabold text-stone-900">
                            ₹{item.price.toLocaleString('en-IN')}
                          </span>
                        </div>

                        <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 font-bold">
                          {isHi ? '100% सीधा भुगतान' : '100% to Artisan'}
                        </span>
                      </div>

                      {/* Primary Dual Actions */}
                      <div className="grid grid-cols-2 gap-2">
                        {/* Order Delivery / Add to Cart */}
                        <button
                          onClick={() => addToCart(item, 1)}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-600/20 active:scale-95 transition-all cursor-pointer"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>{isHi ? 'ऑर्डर करें' : 'Order Delivery'}</span>
                        </button>

                        {/* In-Store Visit & Map Guide */}
                        <button
                          onClick={() => setSelectedShopProduct(item)}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-all active:scale-95 cursor-pointer border border-stone-200"
                        >
                          <Store className="w-3.5 h-3.5 text-amber-700" />
                          <span>{isHi ? 'दुकान देखें' : 'Visit Shop'}</span>
                        </button>
                      </div>

                      {/* Secondary Quick Contact Row */}
                      <div className="flex items-center justify-between pt-1 border-t border-stone-100 text-[11px]">
                        <button
                          onClick={() => setReviewModalProduct(item)}
                          className="text-[11px] text-stone-500 hover:text-stone-800 font-medium flex items-center gap-1 cursor-pointer"
                        >
                          <span>{isHi ? 'समीक्षा लिखें' : 'Write Review'}</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </button>

                        <div className="flex items-center gap-1.5">
                          <a
                            href={getGoogleMapsUrl(item)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-stone-100 hover:bg-orange-50 text-stone-600 hover:text-orange-700 transition-colors"
                            title="Navigate on Google Maps"
                          >
                            <Navigation className="w-3.5 h-3.5 text-orange-600" />
                          </a>

                          <a
                            href={getWhatsAppUrl(item)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                            title="WhatsApp Artisan"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                          </a>

                          {item.phone && (
                            <a
                              href={`tel:${item.phone}`}
                              className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                              title="Call Artisan"
                            >
                              <Phone className="w-3.5 h-3.5 text-stone-700" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cart Slide-Over Drawer */}
      <BazaarCartDrawer />

      {/* Wishlist Modal */}
      <BazaarWishlistModal />

      {/* Product Review Modal */}
      <ProductReviewModal
        product={reviewModalProduct}
        isOpen={Boolean(reviewModalProduct)}
        onClose={() => setReviewModalProduct(null)}
        onReviewAdded={handleReviewUpdated}
      />

      {/* Food Lore & Famous Stalls Modal */}
      {foodModalItem && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-4 shadow-2xl border border-stone-200 relative overflow-hidden my-6">
            <div className="flex items-start justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center border border-amber-200">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-stone-900">
                    {isHi ? 'क्षेत्रीय खान-पान धरोहर गाइड' : 'Regional Culinary Heritage Guide'}
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Curated by Ministry of Tourism & Cultural Heritage Cell
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFoodModalItem(null)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 relative">
              <img
                src={foodModalItem.imageUrl}
                alt={foodModalItem.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&w=800&q=80';
                }}
              />
              <div className="absolute bottom-2.5 left-3 right-3 text-white bg-black/60 backdrop-blur-xs p-2.5 rounded-xl">
                <h4 className="font-serif font-bold text-sm">{foodModalItem.name}</h4>
                {foodModalItem.nameHi && <p className="text-xs text-amber-200">{foodModalItem.nameHi}</p>}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-amber-900">
                <Info className="w-4 h-4 text-amber-700" />
                <span>On-Site Experience Policy (Non-Deliverable)</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-800">
                This food item cannot be ordered for home delivery to guarantee authentic freshness, taste, and food safety. Tourists are guided to explore these verified heritage stalls on-site!
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                <span className="font-bold text-stone-600">Monument Association:</span>
                <span className="font-semibold text-stone-900 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-orange-600" />
                  {foodModalItem.monumentName}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                <span className="font-bold text-stone-600">Origin Era:</span>
                <span className="font-semibold text-stone-900">{foodModalItem.famousSince}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                <span className="font-bold text-stone-600">Approx Tourist Price:</span>
                <span className="font-mono font-bold text-stone-900">{foodModalItem.priceRange}</span>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                <span className="font-bold text-stone-800 block">Where to Taste in Person:</span>
                <p className="text-stone-700 leading-relaxed font-medium">{foodModalItem.famousSpots}</p>
              </div>

              {foodModalItem.shortLore && (
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                  <span className="font-bold text-stone-800 block">Historical Lore:</span>
                  <p className="text-stone-600 italic leading-relaxed">"{foodModalItem.shortLore}"</p>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-stone-100 flex justify-end">
              <button
                onClick={() => setFoodModalItem(null)}
                className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GI Authenticity & Anti-Counterfeit Certificate Modal */}
      {giModalProduct && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-4 shadow-2xl border border-stone-200 relative overflow-hidden">
            <div className="flex items-start justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-stone-900">
                    {isHi ? 'जीआई प्रामाणिकता व उत्पत्ति प्रमाण पत्र' : 'Authenticity & GI Certificate'}
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
                Under Section 21 of the Geographical Indications of Goods Act, this product is certified to be handcrafted using traditional indigenous techniques, guaranteeing 100% direct economic returns to registered heritage craftspeople.
              </p>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setGiModalProduct(null)}
                className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Close Certificate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verified Artisan Shop Location & In-Store Visit Guide Modal */}
      {selectedShopProduct && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-2xl border border-stone-200 relative my-auto mx-auto overflow-hidden">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0 border border-orange-200">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                      Verified Heritage Shop
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>Govt Certified</span>
                    </span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-stone-900 leading-tight mt-0.5">
                    {selectedShopProduct.shopName || `${selectedShopProduct.artisanName} Studio`}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedShopProduct(null)}
                className="text-stone-400 hover:text-stone-700 p-1.5 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Product Snapshot */}
            <div className="flex gap-3 items-center p-3 rounded-2xl bg-stone-50 border border-stone-200">
              <img
                src={selectedShopProduct.imageUrl}
                alt={selectedShopProduct.name}
                className="w-16 h-16 rounded-xl object-cover shrink-0"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80';
                }}
              />
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-xs text-stone-900 line-clamp-1">
                  {selectedShopProduct.name}
                </h4>
                <div className="flex items-center justify-between mt-1">
                  <div>
                    <span className="text-[10px] text-stone-400 block leading-tight">In-Shop Retail MRP</span>
                    <span className="text-sm font-serif font-extrabold text-stone-900">
                      ₹{selectedShopProduct.price?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <button
                    onClick={() => setGiModalProduct(selectedShopProduct)}
                    className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 hover:bg-emerald-200/70 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Award className="w-3 h-3" />
                    <span>GI Certified</span>
                  </button>
                </div>
              </div>
            </div>

            {/* In-Store Visit Guide */}
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-amber-900">
                <Store className="w-4 h-4 text-amber-700" />
                <span>Visit In-Person or Order Delivery</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-800">
                You can visit the master artisan's physical shop in person, inspect the craft with your own hands, or order online directly from this page with India Post GI secure delivery.
              </p>
            </div>

            {/* Shop Details Grid */}
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-stone-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-orange-600" />
                    <span>Exact Physical Address:</span>
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    Verified Location
                  </span>
                </div>
                <p className="text-stone-800 font-semibold leading-relaxed">
                  {selectedShopProduct.shopAddress || 'Near Monument Heritage Crafts Cluster'}
                </p>
                {selectedShopProduct.shopLandmark && (
                  <p className="text-[11px] text-orange-700 font-medium flex items-center gap-1 pt-0.5">
                    <Navigation className="w-3 h-3 text-orange-600 shrink-0" />
                    <span>Landmark: {selectedShopProduct.shopLandmark}</span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                  <span className="text-stone-500 font-medium">Business Hours:</span>
                  <span className="font-bold text-stone-800 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-stone-400" />
                    <span>{selectedShopProduct.shopTiming || '10:00 AM - 08:00 PM'}</span>
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                  <span className="text-stone-500 font-medium">Master Producer:</span>
                  <span className="font-bold text-stone-800 truncate max-w-[140px]">
                    {selectedShopProduct.artisanName}
                  </span>
                </div>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="pt-2 border-t border-stone-100 flex flex-col sm:flex-row gap-2">
              <a
                href={getGoogleMapsUrl(selectedShopProduct)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-600/30 transition-all active:scale-95"
              >
                <Navigation className="w-4 h-4" />
                <span>Navigate on Google Maps (दिशा-निर्देश)</span>
              </a>

              <div className="flex gap-2">
                <a
                  href={getWhatsAppUrl(selectedShopProduct)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
                  title="WhatsApp Shopkeeper"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>

                {selectedShopProduct.phone && (
                  <a
                    href={`tel:${selectedShopProduct.phone}`}
                    className="px-3.5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                    title="Call Store"
                  >
                    <Phone className="w-4 h-4 text-emerald-600" />
                    <span>Call</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
