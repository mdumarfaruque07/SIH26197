import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { placeService, productService } from '../services/api';
import { Search, X, MapPin, ShoppingBag, ArrowRight } from 'lucide-react';

export default function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [places, setPlaces] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setPlaces([]);
      setProducts([]);
      return;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setPlaces([]);
      setProducts([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [plRes, prRes] = await Promise.all([
          placeService.getAll({ search: query }),
          productService.getAll({ search: query }),
        ]);
        if (plRes.success) setPlaces(plRes.places.slice(0, 5));
        if (prRes.success) setProducts(prRes.products.slice(0, 4));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center p-4 pt-12 sm:pt-20 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 space-y-4 shadow-2xl border border-stone-200 overflow-hidden">
        {/* Search Input Bar */}
        <div className="relative flex items-center border-b border-stone-100 pb-3">
          <Search className="w-5 h-5 text-heritage-600 mr-2.5 flex-shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search monuments, folk tales, states, or handicrafts..."
            className="w-full text-sm font-medium text-stone-900 placeholder-stone-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 rounded-full ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-[65vh] overflow-y-auto space-y-4 pr-1">
          {loading && (
            <p className="text-xs text-stone-400 text-center py-4">Searching heritage & crafts...</p>
          )}

          {!loading && query.length >= 2 && places.length === 0 && products.length === 0 && (
            <div className="text-center py-8 text-stone-400 text-xs">
              No matching heritage places or traditional products found.
            </div>
          )}

          {/* Places Results */}
          {places.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 px-1">
                Heritage Sites & Monuments ({places.length})
              </span>
              <div className="space-y-1.5">
                {places.map((place) => (
                  <div
                    key={place.id}
                    onClick={() => {
                      onClose();
                      navigate(`/place/${place.slug}`);
                    }}
                    className="p-2.5 rounded-xl hover:bg-stone-50 border border-stone-100 cursor-pointer flex items-center gap-3 transition-colors"
                  >
                    <img
                      src={place.coverImage}
                      alt={place.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-stone-900 truncate">
                        {place.name}
                      </h4>
                      <p className="text-[10px] text-stone-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-stone-400" />
                        <span>{place.state || 'India'} • {place.category}</span>
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-stone-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Traditional Crafts Results */}
          {products.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 px-1 flex items-center gap-1">
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>ODOP & Traditional Crafts ({products.length})</span>
              </span>
              <div className="space-y-1.5">
                {products.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      onClose();
                      navigate(`/bazaar`);
                    }}
                    className="p-2.5 rounded-xl hover:bg-orange-50/50 border border-stone-100 cursor-pointer flex items-center gap-3 transition-colors"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-stone-900 truncate">
                        {item.name}
                      </h4>
                      <p className="text-[10px] text-orange-700 font-semibold">
                        ₹{item.price} • {item.odopTag || item.category}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-stone-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {query.length < 2 && (
            <div className="py-4 text-center text-xs text-stone-400">
              Type at least 2 characters to search across India’s temples, forts, movies, and ODOP handicrafts.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
