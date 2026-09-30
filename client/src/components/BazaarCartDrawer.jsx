import React, { useState, useEffect } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Truck,
  Building,
  Lock,
  Loader2,
  Navigation,
  CreditCard,
  Printer,
  FileText,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { orderService } from '../services/orderService';
import { useLanguage } from '../context/LanguageContext';
import PaymentGatewayModal from './PaymentGatewayModal';
import { PrintableInvoicePortal, InvoicePreviewModal } from './PrintableInvoice';
import { triggerPrint } from '../utils/printUtils';

export default function BazaarCartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount,
    cartSubtotal,
    buyerFee,
    cartTotal,
    artisanShareTotal,
  } = useCart();
  const { lang } = useLanguage();
  const isHi = lang === 'hi';

  const [checkoutStep, setCheckoutStep] = useState('cart'); // 'cart' | 'checkout' | 'success'
  const [submitting, setSubmitting] = useState(false);
  const [lastPlacedOrder, setLastPlacedOrder] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);

  const [buyerForm, setBuyerForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    artisanNote: '',
  });

  // Lock background scroll on mobile and desktop while drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.classList.add('modal-scroll-locked');
    } else {
      document.body.classList.remove('modal-scroll-locked');
    }
    return () => {
      document.body.classList.remove('modal-scroll-locked');
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const handleProceedToPayment = (e) => {
    e.preventDefault();
    if (!buyerForm.name || !buyerForm.phone || !buyerForm.address) {
      alert(isHi ? 'कृपया नाम, फ़ोन नंबर और पूरा पता दर्ज करें।' : 'Please fill in Name, Phone, and Delivery Address.');
      return;
    }
    setShowPaymentGateway(true);
  };

  const handlePaymentSuccess = async (paymentDetails) => {
    setShowPaymentGateway(false);
    setSubmitting(true);
    try {
      const primaryItem = cart[0].product;
      const combinedTitle = cart.length === 1
        ? primaryItem.name
        : `${primaryItem.name} + ${cart.length - 1} other heritage craft(s)`;

      const orderPayload = {
        productId: primaryItem.id,
        productName: combinedTitle,
        productImage: primaryItem.imageUrl,
        price: cartSubtotal,
        quantity: cartCount,
        buyerFee,
        artisanName: primaryItem.artisanName || 'Heritage Crafts Guild',
        buyerName: buyerForm.name,
        buyerPhone: buyerForm.phone,
        buyerAddress: buyerForm.address,
        buyerCity: buyerForm.city || 'India',
        paymentMethod: paymentDetails.paymentMethod || 'Instant UPI Escrow (NPCI Direct)',
        utr: paymentDetails.utr,
        artisanNote: buyerForm.artisanNote || 'Crafted with traditional GI heritage method',
        items: cart.map((i) => ({
          id: i.product.id,
          name: i.product.name,
          price: i.product.price,
          quantity: i.quantity,
          artisanName: i.product.artisanName,
          odopTag: i.product.odopTag || 'Certified ODOP GI Craft',
        })),
        subtotal: cartSubtotal,
        totalAmount: cartTotal,
        artisanShare: artisanShareTotal,
      };

      const created = await orderService.createOrder(orderPayload);
      setLastPlacedOrder(created);
      clearCart();
      setCheckoutStep('success');
    } catch (err) {
      console.error(err);
      alert('Order could not be submitted. Please check connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex justify-end items-end sm:items-stretch bg-black/70 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full sm:max-w-md bg-[#fdfbf7] h-[92dvh] sm:h-[100dvh] max-h-[100dvh] shadow-2xl flex flex-col justify-between sm:border-l border-stone-200 rounded-t-3xl sm:rounded-t-none sm:rounded-l-3xl animate-slide-up sm:animate-slide-left relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Pull-down handle indicator */}
        <div className="w-12 h-1.5 rounded-full bg-stone-300 mx-auto mt-2.5 -mb-1 sm:hidden shrink-0" />

        {/* Top Header */}
        <div className="p-3.5 sm:p-5 border-b border-stone-200 bg-white/95 backdrop-blur-md flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold shrink-0">
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm sm:text-base text-stone-900 leading-tight">
                {checkoutStep === 'cart'
                  ? (isHi ? 'शिल्प थैला (Bazaar Cart)' : 'Handicraft Cart')
                  : checkoutStep === 'checkout'
                  ? (isHi ? 'सुरक्षित एस्क्रो चेकआउट' : 'Direct Artisan Checkout')
                  : (isHi ? 'आदेश सफल!' : 'Order Confirmed!')}
              </h3>
              <p className="text-[10px] sm:text-[11px] text-stone-500">
                {checkoutStep === 'cart'
                  ? `${cartCount} ${isHi ? 'हस्तशिल्प वस्तुएं' : 'craft item(s)'}`
                  : (isHi ? '100% निष्पक्ष व्यापार व जीआई गारंटी' : 'Fair-Trade Escrow & GI Protection')}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setIsCartOpen(false);
              setCheckoutStep('cart');
            }}
            className="p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-3.5 overscroll-contain">
          {checkoutStep === 'cart' && (
            <>
              {cart.length === 0 ? (
                <div className="py-16 sm:py-20 text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h4 className="font-serif font-bold text-base text-stone-800">
                    {isHi ? 'आपका शिल्प थैला खाली है' : 'Your craft cart is empty'}
                  </h4>
                  <p className="text-xs text-stone-500 max-w-xs mx-auto">
                    {isHi
                      ? 'बाज़ार से पारंपरिक हस्तशिल्प, मृत्तिका शिल्प या हथकरघा वस्त्र चुनें और सीधे कारीगरों का समर्थन करें।'
                      : 'Explore traditional pottery, handlooms, and crafts in the Bazaar to support hereditary masters directly.'}
                  </p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="mt-3 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-600/20 active:scale-95 transition-all cursor-pointer"
                  >
                    {isHi ? 'कारीगर बाज़ार देखें' : 'Explore Artisan Bazaar'}
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5 sm:space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="p-3 rounded-2xl bg-white border border-stone-200 shadow-2xs flex gap-3 items-center group"
                    >
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 min-w-[64px] min-h-[64px] rounded-xl object-cover shrink-0 bg-stone-100 border border-stone-200 shadow-2xs"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80';
                        }}
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-serif font-bold text-xs sm:text-sm text-stone-900 truncate">
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-stone-300 hover:text-rose-500 p-1 shrink-0 transition-colors cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <p className="text-[10px] text-stone-500 truncate">
                          {isHi ? 'कारीगर:' : 'Artisan:'} <strong className="text-stone-700">{item.product.artisanName}</strong>
                        </p>

                        <div className="mt-2 flex items-center justify-between">
                          <span className="font-serif font-extrabold text-sm sm:text-base text-stone-900">
                            ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                          </span>

                          {/* Quantity Controls with Touch Friendly Sizes */}
                          <div className="flex items-center gap-1 bg-stone-100 rounded-xl p-0.5 border border-stone-200">
                            <button
                              onClick={() => updateQuantity(item.product.id, -1)}
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center hover:bg-white text-stone-700 active:scale-90 transition-all cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="font-mono text-xs font-bold px-1.5 text-stone-900 min-w-[20px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.product.id, 1)}
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center hover:bg-white text-stone-700 active:scale-90 transition-all cursor-pointer"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {checkoutStep === 'checkout' && (
            <form onSubmit={handleProceedToPayment} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-orange-50 border border-orange-200 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-xs text-orange-950">
                    {isHi ? 'इंडिया पोस्ट स्पीडपोस्ट (जीआई सुरक्षित)' : 'India Post SpeedPost (GI Secure)'}
                  </h4>
                  <p className="text-[10px] text-orange-800">
                    {isHi ? 'सुरक्षित डाक पार्सल • शून्य कूरियर फ्रॉड गारंटी' : 'Direct Heritage Cluster Dispatch • Free Courier'}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    {isHi ? 'ग्राहक का पूरा नाम (Full Name) *' : 'Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={buyerForm.name}
                    onChange={(e) => setBuyerForm({ ...buyerForm, name: e.target.value })}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm sm:text-xs bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    {isHi ? 'मोबाइल नंबर (WhatsApp / Call) *' : 'Mobile Number (WhatsApp / Call) *'}
                  </label>
                  <input
                    type="tel"
                    required
                    value={buyerForm.phone}
                    onChange={(e) => setBuyerForm({ ...buyerForm, phone: e.target.value })}
                    placeholder="e.g. 9876543210"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm sm:text-xs bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-2xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      {isHi ? 'डिलीवरी का पता (House/Street/Landmark) *' : 'Delivery Address *'}
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={buyerForm.address}
                      onChange={(e) => setBuyerForm({ ...buyerForm, address: e.target.value })}
                      placeholder="e.g. Flat 301, Heritage Apartments, Near Gate 2"
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm sm:text-xs bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none shadow-2xs"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      {isHi ? 'शहर व पिनकोड (City & PIN)' : 'City & Pincode'}
                    </label>
                    <input
                      type="text"
                      value={buyerForm.city}
                      onChange={(e) => setBuyerForm({ ...buyerForm, city: e.target.value })}
                      placeholder="e.g. Jaipur, Rajasthan - 302001"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm sm:text-xs bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-2xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    {isHi ? 'कारीगर के लिए विशेष संदेश (Optional)' : 'Special Note to Artisan'}
                  </label>
                  <input
                    type="text"
                    value={buyerForm.artisanNote}
                    onChange={(e) => setBuyerForm({ ...buyerForm, artisanNote: e.target.value })}
                    placeholder="e.g. Please pack safely with GI certificate"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm sm:text-xs bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-2xs"
                  />
                </div>
              </div>

              {/* Payment Mode Note */}
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                  <Lock className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>{isHi ? '100% सुरक्षित यूपीआई एस्क्रो भुगतान' : 'Secure NPCI UPI Direct Escrow'}</span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-tight">
                  {isHi
                    ? 'भुगतान सुरक्षित एस्क्रो में रहता है। जब आप पार्सल प्राप्त कर लेंगे, तभी कारीगर को 100% राशि सीधे हस्तांतरित होगी।'
                    : 'Funds remain in fair-trade escrow until delivery is verified at your doorstep.'}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCheckoutStep('cart')}
                  className="px-4 py-3 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold transition-colors active:scale-95 shrink-0 cursor-pointer"
                >
                  {isHi ? 'वापस' : 'Back'}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-orange-600/30 transition-all active:scale-95 disabled:opacity-50 cursor-pointer min-w-0"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                      <span>{isHi ? 'प्रसंस्करण जारी...' : 'Securing Escrow...'}</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 shrink-0" />
                      <span className="truncate">{isHi ? `भुगतान करें (₹${cartTotal.toLocaleString('en-IN')})` : `Pay (₹${cartTotal.toLocaleString('en-IN')})`}</span>
                      <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {checkoutStep === 'success' && lastPlacedOrder && (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce-subtle">
                <CheckCircle className="w-9 h-9" />
              </div>

              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {lastPlacedOrder.id}
                </span>
                <h3 className="font-serif font-bold text-lg text-stone-900 mt-2">
                  {isHi ? 'पारंपरिक कारीगर ऑर्डर सुरक्षित!' : 'Fair-Trade Order Confirmed!'}
                </h3>
                <p className="text-xs text-stone-600 mt-1 max-w-xs mx-auto">
                  {isHi
                    ? `धन्यवाद! ₹${(lastPlacedOrder.artisanShare || lastPlacedOrder.price)?.toLocaleString('en-IN')} का 100% सीधा हिस्सा कारीगर "${lastPlacedOrder.artisanName}" के लिए एस्क्रो में सुरक्षित कर दिया गया है (0% मंच शुल्क)।`
                    : `Thank you! 100% direct artisan share (₹${(lastPlacedOrder.artisanShare || lastPlacedOrder.price)?.toLocaleString('en-IN')}) is locked in fair-trade escrow for ${lastPlacedOrder.artisanName} with 0% platform fee.`}
                </p>
              </div>

              {/* Order Tracking Card */}
              <div className="p-4 rounded-2xl bg-white border border-stone-200 text-left space-y-3 shadow-2xs">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-600">{isHi ? 'कूरियर पार्टनर:' : 'Carrier:'}</span>
                  <span className="font-semibold text-stone-900">{lastPlacedOrder.carrier}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-600">{isHi ? 'भुगतान विधि:' : 'Payment:'}</span>
                  <span className="text-emerald-700 font-bold">{lastPlacedOrder.paymentMethod}</span>
                </div>
                {lastPlacedOrder.utr && (
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-stone-100">
                    <span className="font-bold text-stone-600">Bank Ref / UTR:</span>
                    <span className="font-mono text-emerald-800 font-bold">{lastPlacedOrder.utr}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-stone-100">
                  <h5 className="font-serif font-bold text-xs text-stone-800 mb-2">
                    {isHi ? 'डिस्पैच टाइमलाइन (Live Dispatch Timeline)' : 'Dispatch Timeline'}
                  </h5>
                  <div className="space-y-2">
                    {(lastPlacedOrder.timeline || []).map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-[11px]">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
                        <div>
                          <span className="font-bold text-stone-800">{step.step}</span>
                          <span className="text-stone-400 text-[10px] ml-1.5">({step.time})</span>
                          <p className="text-stone-500 text-[10px]">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mobile-Friendly Grid for Receipt Actions */}
              <div className="space-y-2 pt-1">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => triggerPrint('printing-invoice')}
                    className="px-3 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-50 bg-white text-stone-800 text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-stone-600 shrink-0" />
                    <span className="truncate">{isHi ? 'रसीद प्रिंट करें' : 'Print Invoice'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowInvoiceModal(true)}
                    className="px-3 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-50 bg-white text-stone-700 text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-stone-600 shrink-0" />
                    <span className="truncate">{isHi ? 'रसीद देखें' : 'View Bill'}</span>
                  </button>
                </div>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setCheckoutStep('cart');
                  }}
                  className="w-full py-3 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  {isHi ? 'शॉपिंग जारी रखें' : 'Continue Shopping'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Total & Primary Action Bar (Only in cart step with items) */}
        {checkoutStep === 'cart' && cart.length > 0 && (
          <div className="p-3.5 sm:p-5 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-stone-200 bg-white/95 backdrop-blur-md space-y-2.5 sm:space-y-3 shrink-0">
            {/* Transparent Platform Fee Breakdown */}
            <div className="space-y-1 sm:space-y-1.5 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>{isHi ? 'शिल्प सामग्री मूल्य (Subtotal)' : 'Crafts Subtotal'}</span>
                <span className="font-semibold text-stone-900">₹{cartSubtotal.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between text-stone-600">
                <span className="flex items-center gap-1">
                  <span>{isHi ? 'प्लेटफ़ॉर्म कमीशन व सेवा शुल्क' : 'Platform Commission & Service Fee'}</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    {isHi ? '0% निःशुल्क' : '0% FREE'}
                  </span>
                </span>
                <span className="font-semibold text-emerald-700">₹0</span>
              </div>

              <div className="flex justify-between text-stone-600">
                <span>{isHi ? 'जीआई डाक वितरण (India Post)' : 'India Post GI Secure Delivery'}</span>
                <span className="text-emerald-700 font-bold uppercase text-[11px]">{isHi ? 'निःशुल्क (FREE)' : 'FREE'}</span>
              </div>

              <div className="pt-1.5 border-t border-stone-100 flex justify-between items-center text-sm font-bold">
                <span className="text-stone-900">{isHi ? 'कुल देय राशि (Total Amount)' : 'Total Amount'}</span>
                <span className="font-serif font-extrabold text-base sm:text-lg text-stone-900">
                  ₹{cartTotal.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="p-2 rounded-xl bg-emerald-50/70 border border-emerald-200 text-[10px] text-emerald-800 flex items-center justify-between">
                <span>{isHi ? 'कारीगर को सीधा भुगतान (100%):' : 'Direct Artisan Share (100% Direct):'}</span>
                <strong className="text-emerald-700 font-mono text-xs">₹{artisanShareTotal.toLocaleString('en-IN')}</strong>
              </div>
            </div>

            <button
              onClick={() => setCheckoutStep('checkout')}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-orange-600/30 active:scale-95 transition-all cursor-pointer"
            >
              <span>{isHi ? 'सीधे कारीगर चेकआउट पर जाएं' : 'Proceed to Artisan Checkout'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Interactive Indian Payment Gateway Modal */}
      <PaymentGatewayModal
        isOpen={showPaymentGateway}
        onClose={() => setShowPaymentGateway(false)}
        amount={cartTotal}
        purpose={isHi ? 'ओडीओपी पारंपरिक हस्तशिल्प खरीद' : 'ODOP Heritage Craft Order'}
        artisanName={cart[0]?.product?.artisanName || 'Traditional Crafts Guild'}
        breakdown={{
          itemTotal: cartSubtotal,
          buyerFee,
          artisanShare: artisanShareTotal,
        }}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* High-Fidelity Printable Invoice (Mounted to document.body for clean print) */}
      {lastPlacedOrder && (
        <>
          <PrintableInvoicePortal order={lastPlacedOrder} />
          <InvoicePreviewModal
            isOpen={showInvoiceModal}
            onClose={() => setShowInvoiceModal(false)}
            order={lastPlacedOrder}
          />
        </>
      )}
    </div>
  );
}
