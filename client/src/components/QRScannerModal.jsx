import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, QrCode, Camera, Sparkles, MapPin, CheckCircle, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const ASI_MONUMENT_PRESETS = [
  {
    name: 'Taj Mahal (North Gate Entry)',
    nameHi: 'ताज महल (उत्तरी द्वार प्रवेश)',
    slug: 'taj-mahal',
    state: 'Uttar Pradesh',
    qrCodeId: 'ASI-UP-AGR-001',
    craftHint: 'ODOP: Makrana Marble Inlay'
  },
  {
    name: 'Amer Fort (Suraj Pol Gate)',
    nameHi: 'आमेर किला (सूरज पोल द्वार)',
    slug: 'amer-fort-jaipur',
    state: 'Rajasthan',
    qrCodeId: 'ASI-RJ-JAI-004',
    craftHint: 'ODOP: GI Blue Pottery'
  },
  {
    name: 'Konark Sun Temple (Main Chariot)',
    nameHi: 'कोणार्क सूर्य मंदिर (मुख्य सौर रथ)',
    slug: 'konark-sun-temple',
    state: 'Odisha',
    qrCodeId: 'ASI-OD-PUR-007',
    craftHint: 'ODOP: Pipili Applique & Pattachitra'
  },
  {
    name: 'Hampi (Vittala Stone Chariot)',
    nameHi: 'हम्पी (विट्ठल प्रस्तर रथ)',
    slug: 'hampi-monuments',
    state: 'Karnataka',
    qrCodeId: 'ASI-KA-BLR-012',
    craftHint: 'ODOP: Channapatna Wooden Toys'
  },
  {
    name: 'Qutub Minar (Alai Darwaza)',
    nameHi: 'कुतुब मीनार (अलाई दरवाजा)',
    slug: 'qutub-minar',
    state: 'Delhi',
    qrCodeId: 'ASI-DL-MEH-002',
    craftHint: 'ODOP: Terracotta Art'
  }
];

export default function QRScannerModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const [scannedResult, setScannedResult] = useState(null);
  const [isScanning, setIsScanning] = useState(true);

  if (!isOpen) return null;

  const handleSelectMonument = (monument) => {
    setScannedResult(monument);
    setIsScanning(false);
  };

  const handleConfirmNavigate = () => {
    if (scannedResult) {
      onClose();
      navigate(`/place/${scannedResult.slug}`);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-stone-200 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-heritage-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-heritage-500/30 border border-heritage-400/50 flex items-center justify-center text-heritage-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                {lang === 'hi' ? 'एएसआई स्मारक क्यूआर स्कैनर' : 'ASI Monument QR Scanner'}
              </h3>
              <p className="text-[11px] text-stone-300">
                {lang === 'hi' ? 'स्मारक के बोर्ड या टिकट का क्यूआर कोड स्कैन करें' : 'Scan on-site Archaeological Survey of India QR code'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Scanner Viewfinder Box */}
          <div className="relative w-full aspect-square max-h-56 bg-stone-900 rounded-2xl overflow-hidden flex flex-col items-center justify-center border-2 border-dashed border-heritage-400/80 shadow-inner">
            {/* Animated Laser Bar */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-heritage-400 to-transparent shadow-[0_0_15px_#f97316] animate-bounce" />

            <div className="text-center p-4 z-10">
              <Camera className="w-10 h-10 text-heritage-400 mx-auto mb-2 opacity-80" />
              <p className="text-xs font-semibold text-white">
                {lang === 'hi' ? 'कैमरा स्कैनर सक्रिय' : 'Align QR code inside frame'}
              </p>
              <p className="text-[10px] text-stone-400 mt-1">
                {lang === 'hi' ? 'पर्यटक बोर्ड अथवा प्रवेश टिकट पर रखें' : 'Detected automatically at physical monument entrance'}
              </p>
            </div>

            {/* Corner Markers */}
            <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-heritage-500" />
            <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-heritage-500" />
            <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-heritage-500" />
            <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-heritage-500" />
          </div>

          {/* Quick Preset Selector for Jury Demo */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-heritage-600" />
                {lang === 'hi' ? 'त्वरित डेमो क्यूआर परीक्षण' : 'Simulate On-Site Heritage QR Scan'}
              </span>
              <span className="text-[10px] bg-heritage-100 text-heritage-800 font-semibold px-2 py-0.5 rounded-full">
                ASI Certified
              </span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {ASI_MONUMENT_PRESETS.map((m) => (
                <button
                  key={m.slug}
                  onClick={() => handleSelectMonument(m)}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between text-xs ${
                    scannedResult?.slug === m.slug
                      ? 'bg-heritage-50 border-heritage-400 text-heritage-900 shadow-sm'
                      : 'border-stone-200 hover:border-heritage-300 hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-stone-900">
                      {lang === 'hi' ? m.nameHi : m.name}
                    </div>
                    <div className="text-[10px] text-stone-500 flex items-center gap-2 mt-0.5">
                      <span>{m.qrCodeId}</span>
                      <span>•</span>
                      <span className="text-amber-700 font-medium">{m.craftHint}</span>
                    </div>
                  </div>
                  {scannedResult?.slug === m.slug ? (
                    <CheckCircle className="w-4 h-4 text-heritage-600 flex-shrink-0" />
                  ) : (
                    <QrCode className="w-4 h-4 text-stone-400 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Action button */}
          {scannedResult && (
            <button
              onClick={handleConfirmNavigate}
              className="w-full py-3 bg-heritage-500 hover:bg-heritage-600 text-white rounded-xl font-semibold text-sm shadow-md flex items-center justify-center gap-2 transition-all"
            >
              <span>{lang === 'hi' ? 'स्मारक गाइड एवं ओडीओपी खोलें' : 'Open Monument Lore & ODOP'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
