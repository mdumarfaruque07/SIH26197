import React from 'react';
import { X, Heart, ShoppingBag, Trash2, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

export default function BazaarWishlistModal() {
  const { wishlist, toggleWishlist, addToCart, isWishlistOpen, setIsWishlistOpen } = useCart();
  const { lang } = useLanguage();
  const isHi = lang === 'hi';

  if (!isWishlistOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#fdfbf7] rounded-3xl max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-2xl border border-stone-200 relative max-h-[85vh] flex flex-col justify-between overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-stone-900 leading-tight">
                {isHi ? 'पसंदीदा हस्तशिल्प (Saved Crafts)' : 'Saved Heritage Crafts'}
              </h3>
              <p className="text-[11px] text-stone-500">
                {wishlist.length} {isHi ? 'कलाकृतियां सुरक्षित' : 'items saved for later'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsWishlistOpen(false)}
            className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {wishlist.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Heart className="w-12 h-12 text-stone-300 mx-auto" />
              <h4 className="font-serif font-bold text-sm text-stone-700">
                {isHi ? 'कोई पसंदीदा शिल्प सुरक्षित नहीं है' : 'No crafts saved in wishlist'}
              </h4>
              <p className="text-xs text-stone-400 max-w-xs mx-auto">
                {isHi
                  ? 'बाज़ार में किसी भी शिल्प पर दिल (❤️) आइकन दबाकर उसे यहाँ सहेजें।'
                  : 'Tap the heart icon on any authentic craft in the Bazaar to save it here.'}
              </p>
            </div>
          ) : (
            wishlist.map((product) => (
              <div
                key={product.id}
                className="p-3 rounded-2xl bg-white border border-stone-200 shadow-2xs flex gap-3 items-center justify-between"
              >
                <div className="flex gap-3 items-center min-w-0">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-14 h-14 rounded-xl object-cover shrink-0 bg-stone-100 border border-stone-200"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <div className="min-w-0">
                    <h4 className="font-serif font-bold text-xs text-stone-900 truncate">
                      {product.name}
                    </h4>
                    <p className="text-[10px] text-stone-500 truncate">
                      {product.artisanName}
                    </p>
                    <span className="font-serif font-extrabold text-sm text-stone-900 block mt-0.5">
                      ₹{product.price?.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => {
                      addToCart(product, 1);
                      toggleWishlist(product);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-[11px] font-bold shadow-2xs flex items-center gap-1 transition-all"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>{isHi ? 'थैले में डालें' : 'Add to Cart'}</span>
                  </button>
                  <button
                    onClick={() => toggleWishlist(product)}
                    className="p-2 text-stone-300 hover:text-rose-500 transition-colors"
                    title="Remove from favorites"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-stone-100 flex justify-end">
          <button
            onClick={() => setIsWishlistOpen(false)}
            className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold transition-all"
          >
            {isHi ? 'बंद करें' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
