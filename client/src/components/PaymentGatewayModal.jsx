import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Lock,
  CreditCard,
  QrCode,
  Building,
  CheckCircle2,
  Loader2,
  Smartphone,
  Check,
  AlertCircle,
  HelpCircle,
  Coins,
  ArrowRight,
  RefreshCw,
  Wallet,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function PaymentGatewayModal({
  isOpen,
  onClose,
  amount = 0,
  purpose = 'ODOP Heritage Craft Order',
  artisanName = 'Heritage Crafts Guild',
  breakdown = null, // { itemTotal, buyerFee, artisanShare }
  onPaymentSuccess,
}) {
  const { lang } = useLanguage();
  const isHi = lang === 'hi';

  const [activeMethod, setActiveMethod] = useState('upi'); // 'upi' | 'qr' | 'card' | 'netbanking' | 'cod'
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay'); // 'gpay' | 'phonepe' | 'paytm' | 'cred' | 'bhim'
  const [upiId, setUpiId] = useState('');
  const [upiVerified, setUpiVerified] = useState(false);

  // Card details
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
  });

  // Net banking
  const [selectedBank, setSelectedBank] = useState('sbi');

  // Simulation processing state
  const [processingState, setProcessingState] = useState('idle'); // 'idle' | 'authorizing' | 'otp' | 'verifying_otp' | 'success'
  const [otpValue, setOtpValue] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(300); // 5-minute QR expiry
  const [generatedUtr, setGeneratedUtr] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setProcessingState('idle');
      setOtpValue('');
      setUpiVerified(false);
      setTimerSeconds(300);
      return;
    }

    // Auto countdown for QR code
    const timer = setInterval(() => {
      setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleCardNumberChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 16);
    val = val.replace(/(\d{4})/g, '$1 ').trim();
    setCardData({ ...cardData, number: val });
  };

  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 3) {
      val = `${val.slice(0, 2)}/${val.slice(2)}`;
    }
    setCardData({ ...cardData, expiry: val });
  };

  const executeSuccessfulPayment = (methodName, customUtr = null) => {
    setProcessingState('authorizing');
    const finalUtr = customUtr || `UTR${Date.now().toString().slice(-8)}${Math.floor(1000 + Math.random() * 9000)}`;
    const finalTxnId = `TXN-ODOP-${Math.floor(100000 + Math.random() * 900000)}`;
    setGeneratedUtr(finalUtr);

    setTimeout(() => {
      setProcessingState('success');
      setTimeout(() => {
        if (onPaymentSuccess) {
          onPaymentSuccess({
            paymentMethod: methodName,
            utr: finalUtr,
            transactionId: finalTxnId,
            amount,
            timestamp: new Date().toISOString(),
          });
        }
      }, 1200);
    }, 1500);
  };

  const handlePayViaUpiApp = (appId) => {
    const names = {
      gpay: 'Google Pay UPI',
      phonepe: 'PhonePe UPI',
      paytm: 'Paytm UPI',
      cred: 'CRED UPI',
      bhim: 'BHIM UPI',
    };
    executeSuccessfulPayment(names[appId] || 'UPI Direct');
  };

  const handleVerifyAndPayUpiId = (e) => {
    e.preventDefault();
    if (!upiId || !upiId.includes('@')) {
      alert(isHi ? 'कृपया मान्य UPI ID दर्ज करें (उदा. username@upi)' : 'Please enter a valid UPI ID (e.g. name@okhdfcbank)');
      return;
    }
    setUpiVerified(true);
    executeSuccessfulPayment(`UPI ID (${upiId})`);
  };

  const handlePayViaCard = (e) => {
    e.preventDefault();
    if (cardData.number.replace(/\s/g, '').length < 16 || !cardData.expiry || cardData.cvv.length < 3) {
      alert(isHi ? 'कृपया कार्ड की सभी जानकारी सही दर्ज करें।' : 'Please enter complete and valid card credentials.');
      return;
    }
    // Launch 3D Secure OTP Step
    setProcessingState('otp');
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setProcessingState('verifying_otp');
    setTimeout(() => {
      executeSuccessfulPayment(`RuPay / Card (Ending in ${cardData.number.slice(-4)})`);
    }, 1200);
  };

  const handlePayViaNetBanking = () => {
    const bankNames = {
      sbi: 'State Bank of India',
      hdfc: 'HDFC Bank',
      icici: 'ICICI Bank',
      axis: 'Axis Bank',
      pnb: 'Punjab National Bank',
      bob: 'Bank of Baroda',
    };
    executeSuccessfulPayment(`Net Banking (${bankNames[selectedBank] || 'Nationalized Bank'})`);
  };

  const handlePayViaCod = () => {
    executeSuccessfulPayment('Cash on Delivery (Escrow Pledge)', 'COD-VERIFIED-ESCROW');
  };

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-600 text-white flex items-center justify-center font-bold shadow-md shadow-orange-600/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-base sm:text-lg leading-tight">
                  Sanskriti<span className="text-amber-400">Khoj</span> Fair-Trade Pay
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-mono font-bold flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" />
                  <span>256-BIT ENCRYPTED</span>
                </span>
              </div>
              <p className="text-[11px] text-stone-300">
                {purpose} • {artisanName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-stone-400 block uppercase tracking-wider font-semibold">Total Payable</span>
              <span className="font-serif text-xl sm:text-2xl font-extrabold text-amber-400">
                ₹{amount.toLocaleString('en-IN')}
              </span>
            </div>
            <button
              onClick={onClose}
              disabled={processingState === 'authorizing' || processingState === 'verifying_otp'}
              className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors disabled:opacity-30"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Breakdown Banner */}
        {breakdown && (
          <div className="bg-emerald-50/80 px-4 py-2 border-b border-emerald-200/60 text-stone-700 text-xs flex flex-wrap items-center justify-between gap-2 font-mono">
            <div className="flex items-center gap-2">
              <span className="text-stone-900 font-bold">MRP: ₹{breakdown.itemTotal}</span>
              <span>•</span>
              <span className="text-emerald-700 font-bold bg-emerald-100/80 px-2 py-0.5 rounded text-[11px]">
                Commission: ₹0 (0% Free Promo)
              </span>
            </div>
            <div className="text-emerald-800 font-bold flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% Payout directly to Artisan: ₹{breakdown.artisanShare || breakdown.itemTotal}</span>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto">
          {processingState === 'authorizing' && (
            <div className="p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto animate-pulse">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
              <div className="space-y-1">
                <h4 className="font-serif font-bold text-lg text-stone-900">
                  {isHi ? 'भुगतान प्राधिकरण प्रक्रिया जारी...' : 'Authorizing Payment with NPCI Switch...'}
                </h4>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  {isHi
                    ? 'कृपया विंडो को बंद या रीफ्रेश न करें। आपके बैंक व एस्क्रो से सुरक्षित संचार स्थापित किया जा रहा है।'
                    : 'Connecting securely to banking network. Locking 100% direct payout in fair-trade escrow.'}
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-600 text-xs font-mono">
                <Lock className="w-3 h-3 text-emerald-600" />
                <span>Encrypted 256-bit Token Exchange</span>
              </div>
            </div>
          )}

          {processingState === 'otp' && (
            <div className="p-6 sm:p-8 max-w-md mx-auto space-y-5 animate-fade-in">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h4 className="font-serif font-bold text-lg text-stone-900">
                  Bank 3D-Secure 2.0 Verification
                </h4>
                <p className="text-xs text-stone-500">
                  An OTP has been sent to your mobile linked to card ending in <strong>{cardData.number.slice(-4)}</strong>.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-center justify-between">
                <span>Test Demo OTP: <strong>123456</strong></span>
                <button
                  type="button"
                  onClick={() => setOtpValue('123456')}
                  className="font-bold text-orange-700 underline"
                >
                  Auto Fill
                </button>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5 text-center">
                    Enter 6-Digit OTP:
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpValue}
                    onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••••"
                    className="w-full text-center tracking-[0.5em] font-mono font-bold text-xl py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setProcessingState('idle')}
                    className="w-1/3 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-600/30"
                  >
                    Verify & Confirm ₹{amount.toLocaleString('en-IN')}
                  </button>
                </div>
              </form>
            </div>
          )}

          {processingState === 'verifying_otp' && (
            <div className="p-12 text-center space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-orange-600 mx-auto" />
              <div className="space-y-1">
                <h4 className="font-serif font-bold text-lg text-stone-900">
                  Verifying OTP & Authorizing Escrow...
                </h4>
                <p className="text-xs text-stone-500">Communicating with issuing bank...</p>
              </div>
            </div>
          )}

          {processingState === 'success' && (
            <div className="p-8 text-center space-y-4 animate-scale-up">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto border-2 border-emerald-400">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h4 className="font-serif font-bold text-xl text-stone-900">
                  {isHi ? 'भुगतान सफल!' : 'Payment Authorized Successfully!'}
                </h4>
                <p className="text-xs text-emerald-800 font-semibold">
                  {isHi ? 'एस्क्रो सुरक्षित • 100% कारीगर अंश आरक्षित (0% कमीशन)' : '100% Fair-Trade Escrow Secured • 100% Artisan Direct Remittance'}
                </p>
              </div>

              <div className="max-w-xs mx-auto p-3.5 rounded-2xl bg-stone-50 border border-stone-200 font-mono text-[11px] text-stone-700 text-left space-y-1">
                <div className="flex justify-between">
                  <span className="text-stone-400">Amount Paid:</span>
                  <strong className="text-stone-900">₹{amount.toLocaleString('en-IN')}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">UTR / Ref:</span>
                  <span className="text-emerald-700 font-bold">{generatedUtr}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Status:</span>
                  <span className="text-emerald-600 font-bold">PAID (ESCROW)</span>
                </div>
              </div>
            </div>
          )}

          {processingState === 'idle' && (
            <div className="flex flex-col md:grid md:grid-cols-12 min-h-[340px] max-h-[75vh] md:max-h-none overflow-y-auto md:overflow-visible">
              {/* Left/Top Tabs (Methods) */}
              <div className="md:col-span-4 bg-stone-50/90 p-2.5 sm:p-4 border-b md:border-b-0 md:border-r border-stone-200 flex md:flex-col gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 px-1 md:px-2 pb-1 hidden md:block">
                  Payment Modes
                </div>

                <button
                  type="button"
                  onClick={() => setActiveMethod('upi')}
                  className={`shrink-0 md:w-full px-3 py-2 sm:p-2.5 rounded-xl text-left text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    activeMethod === 'upi'
                      ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                      : 'text-stone-700 bg-white md:bg-transparent border md:border-0 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <Smartphone className="w-4 h-4 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="whitespace-nowrap">UPI Apps</div>
                    <div className={`text-[10px] font-normal hidden md:block ${activeMethod === 'upi' ? 'text-orange-100' : 'text-stone-400'}`}>
                      GPay, PhonePe, Paytm
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveMethod('qr')}
                  className={`shrink-0 md:w-full px-3 py-2 sm:p-2.5 rounded-xl text-left text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    activeMethod === 'qr'
                      ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                      : 'text-stone-700 bg-white md:bg-transparent border md:border-0 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <QrCode className="w-4 h-4 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="whitespace-nowrap">Scan QR</div>
                    <div className={`text-[10px] font-normal hidden md:block ${activeMethod === 'qr' ? 'text-orange-100' : 'text-stone-400'}`}>
                      Any UPI Scanner
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveMethod('card')}
                  className={`shrink-0 md:w-full px-3 py-2 sm:p-2.5 rounded-xl text-left text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    activeMethod === 'card'
                      ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                      : 'text-stone-700 bg-white md:bg-transparent border md:border-0 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <CreditCard className="w-4 h-4 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="whitespace-nowrap">Cards</div>
                    <div className={`text-[10px] font-normal hidden md:block ${activeMethod === 'card' ? 'text-orange-100' : 'text-stone-400'}`}>
                      RuPay, Visa, Master
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveMethod('netbanking')}
                  className={`shrink-0 md:w-full px-3 py-2 sm:p-2.5 rounded-xl text-left text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    activeMethod === 'netbanking'
                      ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                      : 'text-stone-700 bg-white md:bg-transparent border md:border-0 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <Building className="w-4 h-4 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="whitespace-nowrap">NetBanking</div>
                    <div className={`text-[10px] font-normal hidden md:block ${activeMethod === 'netbanking' ? 'text-orange-100' : 'text-stone-400'}`}>
                      SBI, HDFC, ICICI
                    </div>
                  </div>
                </button>

                {purpose.includes('Order') && (
                  <button
                    type="button"
                    onClick={() => setActiveMethod('cod')}
                    className={`shrink-0 md:w-full px-3 py-2 sm:p-2.5 rounded-xl text-left text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      activeMethod === 'cod'
                        ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                        : 'text-stone-700 bg-white md:bg-transparent border md:border-0 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <Truck className="w-4 h-4 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="whitespace-nowrap">Cash On Delivery</div>
                      <div className={`text-[10px] font-normal hidden md:block ${activeMethod === 'cod' ? 'text-orange-100' : 'text-stone-400'}`}>
                        Doorstep Handover
                      </div>
                    </div>
                  </button>
                )}

                <div className="pt-3 border-t border-stone-200 text-[10px] text-stone-500 space-y-1">
                  <div className="flex items-center gap-1 font-semibold text-stone-700">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>RBI & NPCI Compliant</span>
                  </div>
                  <p className="leading-tight">
                    Payments are handled through verified payment gateway rails.
                  </p>
                </div>
              </div>

              {/* Right Panel (Active Method View) */}
              <div className="md:col-span-8 p-5 sm:p-6 space-y-5">
                {/* 1. UPI APPS */}
                {activeMethod === 'upi' && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h4 className="font-bold text-stone-900 text-sm">
                        {isHi ? 'UPI ऐप द्वारा तुरंत भुगतान करें' : 'Pay Directly via Installed UPI App'}
                      </h4>
                      <p className="text-xs text-stone-500">
                        Select your preferred UPI app on your phone or computer.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {[
                        { id: 'gpay', label: 'Google Pay', color: 'hover:border-blue-500', badge: 'Fastest' },
                        { id: 'phonepe', label: 'PhonePe', color: 'hover:border-purple-500', badge: 'Popular' },
                        { id: 'paytm', label: 'Paytm UPI', color: 'hover:border-cyan-500', badge: 'Instant' },
                        { id: 'cred', label: 'CRED Pay', color: 'hover:border-stone-800', badge: 'Rewards' },
                        { id: 'bhim', label: 'BHIM UPI', color: 'hover:border-orange-500', badge: 'Govt NPCI' },
                      ].map((app) => (
                        <button
                          key={app.id}
                          type="button"
                          onClick={() => handlePayViaUpiApp(app.id)}
                          className={`p-3 rounded-2xl border text-center transition-all group bg-white shadow-2xs ${
                            selectedUpiApp === app.id
                              ? 'border-orange-500 ring-2 ring-orange-500/20'
                              : 'border-stone-200'
                          } ${app.color}`}
                        >
                          <div className="font-bold text-xs text-stone-900 group-hover:text-orange-600">
                            {app.label}
                          </div>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-stone-100 text-stone-600 mt-1 inline-block">
                            {app.badge}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Or Enter UPI VPA ID */}
                    <div className="pt-2 border-t border-stone-100 space-y-2">
                      <label className="block text-xs font-bold text-stone-700">
                        {isHi ? 'या अपनी UPI ID (VPA) दर्ज करें:' : 'Or Enter UPI ID / VPA:'}
                      </label>
                      <form onSubmit={handleVerifyAndPayUpiId} className="flex gap-2">
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="e.g. yourname@okhdfcbank"
                          className="flex-1 px-3.5 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold shadow-sm transition-all"
                        >
                          Verify & Pay
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {/* 2. QR CODE SCAN & PAY */}
                {activeMethod === 'qr' && (
                  <div className="text-center space-y-3">
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-stone-900 text-sm">
                        {isHi ? 'किसी भी UPI ऐप से क्यूआर कोड स्कैन करें' : 'Scan & Pay with Any UPI App'}
                      </h4>
                      <p className="text-xs text-stone-500">
                        GPay, PhonePe, Paytm, BHIM, Amazon Pay or any banking app
                      </p>
                    </div>

                    {/* Dynamic QR Graphic */}
                    <div className="w-48 h-48 mx-auto p-3 bg-white rounded-2xl border-2 border-stone-800 shadow-md flex flex-col items-center justify-center relative">
                      <div className="w-full h-full bg-stone-900 rounded-xl p-2.5 flex flex-col items-center justify-center text-white relative">
                        <QrCode className="w-32 h-32 text-white stroke-[1.5]" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center text-[10px] font-black shadow-md border-2 border-white">
                            UPI
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-xs font-mono text-stone-600">
                      <span>QR Expiry:</span>
                      <strong className="text-orange-600 font-bold">{formatTimer(timerSeconds)}</strong>
                      <span>•</span>
                      <span>Amount: <strong>₹{amount}</strong></span>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => executeSuccessfulPayment('UPI QR Scan & Pay')}
                        className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-600/30 transition-all flex items-center gap-2 mx-auto active:scale-95"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Simulate QR Scan Completed (I have Paid)</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. CREDIT / DEBIT CARDS */}
                {activeMethod === 'card' && (
                  <form onSubmit={handlePayViaCard} className="space-y-3.5">
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-stone-900 text-sm">
                        Debit / Credit / RuPay Cards
                      </h4>
                      <p className="text-xs text-stone-500">
                        Supports RuPay (0% MDR for artisans), Visa, Mastercard, Maestro.
                      </p>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        Card Number
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={cardData.number}
                          onChange={handleCardNumberChange}
                          placeholder="4532 •••• •••• 8910"
                          className="w-full px-3.5 py-2.5 pl-10 rounded-xl border border-stone-200 text-xs font-mono bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        <CreditCard className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">
                          Expiry Date (MM/YY)
                        </label>
                        <input
                          type="text"
                          required
                          value={cardData.expiry}
                          onChange={handleExpiryChange}
                          placeholder="12/28"
                          className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs font-mono bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">
                          CVV / Security Code
                        </label>
                        <input
                          type="password"
                          required
                          maxLength={4}
                          value={cardData.cvv}
                          onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, '') })}
                          placeholder="•••"
                          className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs font-mono bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        required
                        value={cardData.name}
                        onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                        placeholder="e.g. Ramesh Kumar"
                        className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-600/30 transition-all flex items-center justify-center gap-1.5 active:scale-95"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Pay Securely ₹{amount.toLocaleString('en-IN')}</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* 4. NET BANKING */}
                {activeMethod === 'netbanking' && (
                  <div className="space-y-4">
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-stone-900 text-sm">
                        Direct Internet Banking
                      </h4>
                      <p className="text-xs text-stone-500">
                        Transfer directly through all major nationalized and scheduled commercial banks.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {[
                        { id: 'sbi', name: 'State Bank of India' },
                        { id: 'hdfc', name: 'HDFC Bank' },
                        { id: 'icici', name: 'ICICI Bank' },
                        { id: 'axis', name: 'Axis Bank' },
                        { id: 'pnb', name: 'Punjab National Bank' },
                        { id: 'bob', name: 'Bank of Baroda' },
                      ].map((bank) => (
                        <button
                          key={bank.id}
                          type="button"
                          onClick={() => setSelectedBank(bank.id)}
                          className={`p-3 rounded-2xl border text-center transition-all text-xs font-bold ${
                            selectedBank === bank.id
                              ? 'border-orange-500 bg-orange-50/50 text-orange-950 ring-2 ring-orange-500/20'
                              : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                          }`}
                        >
                          {bank.name}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={handlePayViaNetBanking}
                      className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-600/30 transition-all active:scale-95"
                    >
                      Pay via Selected Bank (₹{amount.toLocaleString('en-IN')})
                    </button>
                  </div>
                )}

                {/* 5. CASH ON DELIVERY */}
                {activeMethod === 'cod' && (
                  <div className="space-y-4">
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-stone-900 text-sm">
                        Cash / Pay on Delivery (Doorstep Escrow)
                      </h4>
                      <p className="text-xs text-stone-500">
                        Pay cash or scan the delivery executive's UPI QR when the craft parcel arrives at your address.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-xs text-stone-700 space-y-2">
                      <div className="font-bold text-amber-950 flex items-center gap-1.5">
                        <Coins className="w-4 h-4 text-amber-700" />
                        <span>Genuine Fair-Trade Artisan Guarantee</span>
                      </div>
                      <p className="leading-relaxed">
                        To protect traditional artisans from bogus orders and transit damages, India Post SpeedPost executives collect cash upon physical handover and remit the 100% share directly to the registered cooperative bank account.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handlePayViaCod}
                      className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold shadow-md transition-all active:scale-95"
                    >
                      Confirm Order with Pay on Delivery (₹{amount.toLocaleString('en-IN')})
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Guarantee */}
        <div className="bg-stone-50 px-5 py-3 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-stone-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-700">Protected by SanskritiKhoj Anti-Fraud Escrow:</span>
            <span>Zero counterfeit tolerance • Full refund on transit damage</span>
          </div>
          <div className="font-mono text-[9px] text-stone-400">
            Powered by UPI / RuPay / National Payments Gateway
          </div>
        </div>
      </div>
    </div>
  );
}
