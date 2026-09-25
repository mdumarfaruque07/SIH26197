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
} from 'lucide-react';
import { Link } from 'react-router-dom';

const CATEGORIES = [
  { id: 'all', label: 'All Crafts' },
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
  const [orderSuccess, setOrderSuccess] = useState(false);

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

  const handleSimulateOrder = (product) => {
    setOrderModalProduct(product);
    setOrderSuccess(false);
  };

  const handleConfirmOrder = () => {
    setOrderSuccess(true);
    setTimeout(() => {
      setOrderModalProduct(null);
      setOrderSuccess(false);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] pb-24">
      {/* Hero Header */}
      <section className="bg-stone-900 text-white pt-8 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-5xl mx-auto space-y-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            <span>One District One Product (ODOP) & GI Crafts Initiative</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
            Traditional Artisan <span className="text-orange-400">Bazaar</span>
          </h1>

          <p className="max-w-2xl mx-auto text-stone-300 text-xs sm:text-sm font-light leading-relaxed">
            Support hereditary craftspeople directly. Every piece is authentic, GI-certified or ODOP tagged, directly linked to India’s historic sites.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="max-w-md mx-auto pt-2 relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Banarasi silk, blue pottery, marble inlay..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/20 text-white placeholder-stone-400 text-xs focus:outline-none focus:ring-2 focus:ring-orange-400 backdrop-blur-md transition-all"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          </form>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20 space-y-6">
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
            <h3 className="font-bold text-stone-700">No traditional crafts found</h3>
            <p className="text-xs text-stone-400 mt-1">Try resetting the category or search filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((item) => (
              <div
                key={item.id}
                className="group bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                    {item.odopTag && (
                      <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-md text-amber-300 border border-amber-400/40 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {item.odopTag}
                      </div>
                    )}

                    <div className="absolute bottom-2.5 left-3 text-white text-xs font-semibold flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-orange-400" />
                      <span>{item.place?.name}</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 sm:p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                        {item.category}
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

                    <div className="pt-2 text-[11px] text-stone-500 flex items-center gap-1.5 border-t border-stone-100">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span className="truncate">Artisan: <strong>{item.artisanName}</strong></span>
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
                    onClick={() => handleSimulateOrder(item)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-600/20 active:scale-95 transition-all"
                  >
                    <span>Support Artisan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Simulated Checkout / Artisan Connect Modal */}
      {orderModalProduct && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-stone-200">
            {orderSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto animate-bounce" />
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  Direct Artisan Order Placed!
                </h3>
                <p className="text-xs text-stone-500">
                  100% of proceeds go directly to <strong>{orderModalProduct.artisanName}</strong>. Thank you for supporting India's living cultural crafts!
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <h3 className="font-serif text-lg font-bold text-stone-900">
                    Direct Artisan Checkout
                  </h3>
                  <button
                    onClick={() => setOrderModalProduct(null)}
                    className="text-stone-400 hover:text-stone-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex gap-3 items-center p-3 rounded-2xl bg-stone-50 border border-stone-200">
                  <img
                    src={orderModalProduct.imageUrl}
                    alt={orderModalProduct.name}
                    className="w-14 h-14 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-xs text-stone-900 truncate">
                      {orderModalProduct.name}
                    </h4>
                    <p className="text-[11px] text-orange-600 font-semibold">
                      ₹{orderModalProduct.price}
                    </p>
                    <p className="text-[10px] text-stone-500">
                      Craftsperson: {orderModalProduct.artisanName}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-stone-600 bg-amber-50/70 p-3 rounded-xl border border-amber-200">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Fair Trade & GI Authenticity Guarantee</span>
                  </div>
                  <p className="text-[11px] text-amber-800">
                    Certified authentic handcrafted product shipped directly from local heritage clusters with artisan certificate.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setOrderModalProduct(null)}
                    className="px-4 py-2 text-xs font-semibold text-stone-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmOrder}
                    className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-600/30 transition-all"
                  >
                    Confirm & Support Artisan (₹{orderModalProduct.price})
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
