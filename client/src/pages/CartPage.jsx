import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  ArrowLeft,
  ArrowRight,
  Trash2,
  Plus,
  Minus,
  Truck,
  ShieldCheck,
  Lock,
  CreditCard,
  Loader2,
  CheckCircle,
  Printer,
  FileText,
  Clock,
  Sparkles,
  MapPin,
  Phone,
  User,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { orderService } from '../services/orderService';
import PaymentGatewayModal from '../components/PaymentGatewayModal';
import { PrintableInvoicePortal, InvoicePreviewModal } from '../components/PrintableInvoice';
import { triggerPrint } from '../utils/printUtils';

export default function CartPage() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const isHi = lang === 'hi';

  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount,
    cartSubtotal,
    buyerFee,
    cartTotal,
    artisanShareTotal,
  } = useCart();

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
      const primaryItem = cart[0]?.product || {};
      const combinedTitle = cart.length === 1
        ? primaryItem.name
        : `${primaryItem.name} + ${cart.length - 1} other craft(s)`;

      const orderPayload = {
        productId: primaryItem.id,
        productName: combinedTitle,
        productImage: primaryItem.imageUrl,
        price: cartSubtotal,
        quantity: cartCount,
        buyerFee,
        artisanName: primaryItem.artisanName || 'Traditional Crafts Guild',
        buyerName: buyerForm.name,
        buyerPhone: buyerForm.phone,
        buyerAddress: buyerForm.address,
        buyerCity: buyerForm.city || 'India',
        paymentMethod: paymentDetails.paymentMethod || 'Instant UPI Escrow (NPCI Direct)',
        utr: paymentDetails.utr,
        artisanNote: buyerForm.artisanNote || 'Handcrafted with traditional GI heritage method',
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
    <div className="min-h-screen bg-[#fdfbf7] pb-28 md:pb-16 text-stone-900">
      {/* Mobile-Ergonomic Sticky Top Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-2xs">
        <div className="max-w-4xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (checkoutStep === 'checkout') {
                  setCheckoutStep('cart');
                } else {
                  navigate(-1);
                }
              }}
              className="p-2 -ml-1 rounded-full hover:bg-stone-100 text-stone-600 active:scale-95 transition-all cursor-pointer"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-serif font-black text-base sm:text-xl text-stone-900 leading-tight">
                {checkoutStep === 'cart'
                  ? (isHi ? 'शिल्प थैला' : 'Craft Cart')
                  : checkoutStep === 'checkout'
                  ? (isHi ? 'डिलीवरी विवरण' : 'Delivery Details')
                  : (isHi ? 'ऑर्डर पुष्टिकरण' : 'Order Confirmed')}
              </h1>
              <p className="text-[11px] text-stone-500 font-medium">
                {checkoutStep === 'cart'
                  ? `${cartCount} ${isHi ? 'हस्तशिल्प वस्तुएं' : 'craft items'}`
                  : (isHi ? '100% निष्पक्ष व्यापार एस्क्रो' : 'Fair-Trade Direct Artisan Payout')}
              </p>
            </div>
          </div>

          <Link
            to="/bazaar"
            className="text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>{isHi ? 'बाज़ार' : 'Bazaar'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Step Progress Pills */}
        <div className="max-w-4xl mx-auto px-4 pb-2.5 flex items-center gap-1.5 sm:gap-3 text-[11px] font-bold">
          <div
            className={`flex-1 py-1 rounded-full text-center transition-all ${
              checkoutStep === 'cart'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            1. {isHi ? 'शिल्प थैला' : 'Craft Cart'}
          </div>
          <div
            className={`flex-1 py-1 rounded-full text-center transition-all ${
              checkoutStep === 'checkout'
                ? 'bg-orange-600 text-white shadow-xs'
                : checkoutStep === 'success'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-stone-100 text-stone-400'
            }`}
          >
            2. {isHi ? 'डिलीवरी' : 'Address'}
          </div>
          <div
            className={`flex-1 py-1 rounded-full text-center transition-all ${
              checkoutStep === 'success'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-stone-100 text-stone-400'
            }`}
          >
            3. {isHi ? 'पुष्टि' : 'Confirmed'}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-3.5 sm:px-6 pt-4 sm:pt-6">
        {checkoutStep === 'cart' && (
          <>
            {cart.length === 0 ? (
              <div className="py-20 sm:py-24 text-center max-w-md mx-auto space-y-4 bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-sm">
                <div className="w-20 h-20 rounded-3xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-inner">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <div className="space-y-1">
                  <h2 className="font-serif font-bold text-xl text-stone-900">
                    {isHi ? 'आपका शिल्प थैला खाली है' : 'Your Craft Cart is Empty'}
                  </h2>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    {isHi
                      ? 'भारत के प्रमाणित पारंपरिक कारीगरों द्वारा बनाए गए प्रामाणिक जीआई हस्तशिल्प और कलाकृतियों का अन्वेषण करें।'
                      : 'Discover certified GI crafts made by hereditary Indian artisans and support them with 100% direct fair-trade remittance.'}
                  </p>
                </div>
                <Link
                  to="/bazaar"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-orange-600/30 active:scale-95 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isHi ? 'ओडीओपी बाज़ार देखें' : 'Explore ODOP Heritage Bazaar'}</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* Items List (Left/Main) */}
                <div className="lg:col-span-7 space-y-3">
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                      {isHi ? 'चयनित हस्तशिल्प' : 'Selected Handcrafted Items'} ({cart.length})
                    </span>
                    <button
                      onClick={clearCart}
                      className="text-xs text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      {isHi ? 'सब हटाएं' : 'Clear All'}
                    </button>
                  </div>

                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="p-3.5 sm:p-4 rounded-2xl bg-white border border-stone-200/90 shadow-2xs flex gap-3 sm:gap-4 items-center group transition-all hover:border-amber-300"
                    >
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-18 h-18 sm:w-22 sm:h-22 min-w-[72px] min-h-[72px] rounded-2xl object-cover shrink-0 bg-stone-100 border border-stone-200 shadow-2xs"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80';
                        }}
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <h3 className="font-serif font-bold text-xs sm:text-sm text-stone-900 truncate">
                            {item.product.name}
                          </h3>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-stone-300 hover:text-rose-500 p-1 shrink-0 transition-colors cursor-pointer"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <p className="text-[11px] text-stone-500 truncate mt-0.5">
                          {isHi ? 'कारीगर:' : 'Artisan:'} <strong className="text-stone-700">{item.product.artisanName}</strong>
                        </p>

                        <div className="mt-2.5 flex items-center justify-between">
                          <div className="flex items-baseline gap-1">
                            <span className="font-serif font-extrabold text-sm sm:text-base text-stone-950">
                              ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                            </span>
                            {item.quantity > 1 && (
                              <span className="text-[10px] text-stone-400">
                                (₹{item.product.price} each)
                              </span>
                            )}
                          </div>

                          {/* Touch-Friendly Quantity Pill */}
                          <div className="flex items-center gap-1 bg-stone-100 rounded-xl p-1 border border-stone-200">
                            <button
                              onClick={() => updateQuantity(item.product.id, -1)}
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center bg-white shadow-2xs hover:bg-stone-50 text-stone-700 active:scale-90 transition-all cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="font-mono text-xs font-bold px-2 text-stone-900 min-w-[22px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.product.id, 1)}
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center bg-white shadow-2xs hover:bg-stone-50 text-stone-700 active:scale-90 transition-all cursor-pointer"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* India Post SpeedPost Free Courier Banner */}
                  <div className="p-3.5 rounded-2xl bg-orange-50/80 border border-orange-200/80 flex items-center gap-3 text-orange-950 text-xs">
                    <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold flex items-center gap-1.5">
                        <span>India Post SpeedPost (GI Insured Courier)</span>
                        <span className="text-[9px] font-bold bg-emerald-600 text-white px-1.5 py-0.2 rounded-full">FREE</span>
                      </div>
                      <p className="text-[10px] text-orange-800 leading-tight">
                        Dispatched directly from authentic artisan clusters. 0% shipping surcharge.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Price Breakdown & Checkout Action (Right/Sticky) */}
                <div className="lg:col-span-5 bg-white rounded-3xl p-4 sm:p-6 border border-stone-200/90 shadow-sm space-y-4">
                  <h3 className="font-serif font-bold text-sm sm:text-base text-stone-900 pb-2 border-b border-stone-100">
                    {isHi ? 'भुगतान सारांश' : 'Price Summary'}
                  </h3>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-stone-600">
                      <span>{isHi ? 'शिल्प सामग्री मूल्य (Subtotal)' : 'Crafts Subtotal'}</span>
                      <span className="font-semibold text-stone-900">₹{cartSubtotal.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex justify-between text-stone-600">
                      <span className="flex items-center gap-1">
                        <span>{isHi ? 'प्लेटफ़ॉर्म कमीशन व सेवा शुल्क' : 'Platform Fee & Surcharge'}</span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                          0% FREE
                        </span>
                      </span>
                      <span className="font-semibold text-emerald-700">₹0.00</span>
                    </div>

                    <div className="flex justify-between text-stone-600">
                      <span>{isHi ? 'जीआई डाक वितरण (India Post)' : 'India Post GI Secure Delivery'}</span>
                      <span className="text-emerald-700 font-bold uppercase text-[11px]">{isHi ? 'निःशुल्क (FREE)' : 'FREE'}</span>
                    </div>

                    <div className="pt-2 border-t border-stone-100 flex justify-between items-center text-sm font-bold">
                      <span className="text-stone-900">{isHi ? 'कुल देय राशि' : 'Total Amount Payable'}</span>
                      <span className="font-serif font-black text-lg text-stone-950">
                        ₹{cartTotal.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-[11px] text-emerald-900 flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>{isHi ? 'कारीगर को 100% सीधा भुगतान:' : '100% Direct to Artisan:'}</span>
                      </span>
                      <span className="text-emerald-800 font-mono text-xs">₹{artisanShareTotal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setCheckoutStep('checkout')}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-orange-600/30 active:scale-95 transition-all cursor-pointer"
                  >
                    <span>{isHi ? 'डिलीवरी विवरण दर्ज करें' : 'Proceed to Delivery Address'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* STEP 2: DELIVERY FORM */}
        {checkoutStep === 'checkout' && (
          <div className="max-w-xl mx-auto bg-white rounded-3xl p-5 sm:p-7 border border-stone-200 shadow-sm space-y-5">
            <div>
              <h2 className="font-serif font-bold text-lg sm:text-xl text-stone-900">
                {isHi ? 'डिलीवरी पता एवं संपर्क' : 'Delivery Address & Contact'}
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                {isHi ? 'आपका पार्सल पंजीकृत जीआई डाक से सीधे आपके पते पर भेजा जाएगा।' : 'Your handcrafted parcel will be dispatched directly from the heritage cluster.'}
              </p>
            </div>

            <form onSubmit={handleProceedToPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {isHi ? 'ग्राहक का पूरा नाम *' : 'Full Name *'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={buyerForm.name}
                    onChange={(e) => setBuyerForm({ ...buyerForm, name: e.target.value })}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-200 text-sm sm:text-xs bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {isHi ? 'मोबाइल नंबर (WhatsApp / Call) *' : 'Mobile Number (WhatsApp / Call) *'}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    required
                    value={buyerForm.phone}
                    onChange={(e) => setBuyerForm({ ...buyerForm, phone: e.target.value })}
                    placeholder="e.g. 9876543210"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-200 text-sm sm:text-xs bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {isHi ? 'डिलीवरी का पता (House/Street/Area) *' : 'Delivery Address *'}
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <textarea
                    required
                    rows={2}
                    value={buyerForm.address}
                    onChange={(e) => setBuyerForm({ ...buyerForm, address: e.target.value })}
                    placeholder="e.g. Flat 301, Heritage Apartments, Near Gate 2"
                    className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-stone-200 text-sm sm:text-xs bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
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

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {isHi ? 'कारीगर के लिए विशेष संदेश (वैकल्पिक)' : 'Special Customization Note (Optional)'}
                </label>
                <input
                  type="text"
                  value={buyerForm.artisanNote}
                  onChange={(e) => setBuyerForm({ ...buyerForm, artisanNote: e.target.value })}
                  placeholder="e.g. Please pack safely with GI hologram seal"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm sm:text-xs bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-2xs"
                />
              </div>

              {/* Escrow Guarantee Pill */}
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
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-orange-600/30 transition-all active:scale-95 disabled:opacity-50 cursor-pointer min-w-0"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                      <span>{isHi ? 'प्रसंस्करण जारी...' : 'Securing Escrow...'}</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 shrink-0" />
                      <span className="truncate">{isHi ? `भुगतान गेटवे खोलें (₹${cartTotal.toLocaleString('en-IN')})` : `Proceed to Pay (₹${cartTotal.toLocaleString('en-IN')})`}</span>
                      <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: ORDER CONFIRMED */}
        {checkoutStep === 'success' && lastPlacedOrder && (
          <div className="max-w-lg mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle className="w-9 h-9" />
            </div>

            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {lastPlacedOrder.id}
              </span>
              <h2 className="font-serif font-bold text-xl text-stone-900 mt-2">
                {isHi ? 'पारंपरिक कारीगर ऑर्डर सुरक्षित!' : 'Fair-Trade Order Confirmed!'}
              </h2>
              <p className="text-xs text-stone-600 mt-1 max-w-sm mx-auto leading-relaxed">
                {isHi
                  ? `धन्यवाद! ₹${(lastPlacedOrder.artisanShare || lastPlacedOrder.price)?.toLocaleString('en-IN')} का 100% सीधा हिस्सा कारीगर "${lastPlacedOrder.artisanName}" के लिए एस्क्रो में सुरक्षित कर दिया गया है (0% मंच शुल्क)।`
                  : `Thank you! 100% direct artisan share (₹${(lastPlacedOrder.artisanShare || lastPlacedOrder.price)?.toLocaleString('en-IN')}) is locked in fair-trade escrow for ${lastPlacedOrder.artisanName} with 0% platform fee.`}
              </p>
            </div>

            {/* Tracking Card */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-left space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-500">{isHi ? 'कूरियर पार्टनर:' : 'Carrier:'}</span>
                <span className="font-bold text-stone-900">{lastPlacedOrder.carrier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">{isHi ? 'भुगतान विधि:' : 'Payment:'}</span>
                <span className="font-bold text-emerald-700">{lastPlacedOrder.paymentMethod}</span>
              </div>
              {lastPlacedOrder.utr && (
                <div className="flex justify-between pt-1 border-t border-stone-200/60 font-mono text-[11px]">
                  <span className="text-stone-500">Bank Ref / UTR:</span>
                  <span className="font-bold text-emerald-800">{lastPlacedOrder.utr}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
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

              <Link
                to="/bazaar"
                className="w-full inline-flex items-center justify-center py-3 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
              >
                {isHi ? 'शॉपिंग जारी रखें' : 'Continue Shopping'}
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Payment Gateway Modal */}
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

      {/* Printable Invoice Portals */}
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
