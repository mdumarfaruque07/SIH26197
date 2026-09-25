import React from 'react';
import { X, Award, Shield, CheckCircle, Camera, ShoppingBag, MapPin, Sparkles, Star } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export default function PassportModal({ isOpen, onClose }) {
  const { lang } = useLanguage();
  const { user } = useAuth();

  if (!isOpen) return null;

  const BADGES = [
    {
      id: 'pioneer',
      title: 'Heritage Explorer Pioneer',
      titleHi: 'धरोहर अन्वेषक - प्रथम चरण',
      desc: 'Launched Sanskriti Khoj and completed GPS heritage radar scanning.',
      descHi: 'संस्कृति खोज शुरू कर जीपीएस रडार से निकटतम स्थल का पता लगाया।',
      icon: '🧭',
      unlocked: true,
      color: 'from-amber-500 to-yellow-600',
    },
    {
      id: 'camera',
      title: 'Verified Heritage Chronicler',
      titleHi: 'सत्यापित धरोहर फोटोग्राफर',
      desc: 'Snaped an authentic on-site monument photo using native device camera.',
      descHi: 'डिवाइस कैमरा से धरोहर स्थल की प्रामाणिक लाइव फोटो अपलोड की।',
      icon: '📸',
      unlocked: true,
      color: 'from-orange-500 to-red-600',
    },
    {
      id: 'odop',
      title: 'ODOP Artisan Patron',
      titleHi: 'ओडीओपी हस्तशिल्प संरक्षक',
      desc: 'Explored regional GI-tagged craft guilds from local artisan clusters.',
      descHi: 'स्थानीय कारीगरों के प्रमाणित जीआई-टैग पारंपरिक शिल्प का अवलोकन किया।',
      icon: '🏺',
      unlocked: true,
      color: 'from-emerald-500 to-teal-700',
    },
    {
      id: 'temple',
      title: 'Dravidian Temple Connoisseur',
      titleHi: 'द्रविड़ मंदिर वास्तु विशेषज्ञ',
      desc: 'Visited Meenakshi Amman Temple and Konark Sun Chariot sanctums.',
      descHi: 'मीनाक्षी अम्मन और कोणार्क सूर्य मंदिर के स्थापत्य का अध्ययन किया।',
      icon: '🛕',
      unlocked: true,
      color: 'from-purple-500 to-indigo-700',
    },
    {
      id: 'mughal',
      title: 'Mughal Architecture Explorer',
      titleHi: 'मुगल स्थापत्य अन्वेषक',
      desc: 'Explored the Makrana marble quadrangle of Taj Mahal and Qutub Minar.',
      descHi: 'ताजमहल और कुतुब मीनार के स्थापत्य इतिहास का ऑडियो अध्ययन किया।',
      icon: '🕌',
      unlocked: false,
      color: 'from-stone-400 to-stone-600',
    },
  ];

  return (
    <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#fcfaf5] rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-amber-200 flex flex-col max-h-[90vh]">
        {/* Passport Header (Embossed Gold/Burgundy look) */}
        <div className="bg-gradient-to-r from-[#1c1917] via-[#292524] to-[#1c1917] p-6 text-white border-b-2 border-amber-500/40 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400 shadow-inner">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[10px] font-bold tracking-[0.25em] text-amber-400 uppercase">
                  Republic of India • National Heritage
                </div>
                <h3 className="font-serif text-xl font-bold text-white tracking-wide">
                  {lang === 'hi' ? 'संस्कृति धरोहर पासपोर्ट' : 'Sanskriti Heritage Passport'}
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* User Traveler Identity Badge */}
          <div className="mt-4 pt-4 border-t border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img
                src={user?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'Explorer'}`}
                alt="Traveler"
                className="w-9 h-9 rounded-full border border-amber-400/60 object-cover"
              />
              <div>
                <div className="text-xs font-semibold text-stone-100">{user?.name || 'Guest Explorer'}</div>
                <div className="text-[10px] text-amber-400/80 font-mono">PASSPORT NO: IND-2026-SK</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-amber-400">Level 2 Tourist</div>
              <div className="text-[10px] text-stone-400">4 Badges Unlocked</div>
            </div>
          </div>
        </div>

        {/* Passport Stats Bar */}
        <div className="grid grid-cols-3 gap-2 p-4 bg-amber-50/80 border-b border-amber-200/60 text-center">
          <div className="p-2 bg-white rounded-xl border border-amber-100 shadow-xs">
            <div className="text-base font-bold text-amber-900 font-serif">7 / 7</div>
            <div className="text-[10px] text-stone-500 font-medium">{lang === 'hi' ? 'धरोहर स्थल' : 'Heritage Sites'}</div>
          </div>
          <div className="p-2 bg-white rounded-xl border border-amber-100 shadow-xs">
            <div className="text-base font-bold text-emerald-800 font-serif">11</div>
            <div className="text-[10px] text-stone-500 font-medium">{lang === 'hi' ? 'ओडीओपी शिल्प' : 'ODOP Crafts'}</div>
          </div>
          <div className="p-2 bg-white rounded-xl border border-amber-100 shadow-xs">
            <div className="text-base font-bold text-rose-800 font-serif">100%</div>
            <div className="text-[10px] text-stone-500 font-medium">{lang === 'hi' ? 'सत्यापित' : 'GPS Verified'}</div>
          </div>
        </div>

        {/* Badges & Stamps List */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            {lang === 'hi' ? 'सांस्कृतिक अन्वेषण पदक एवं मोहरें' : 'Cultural Exploration Badges & Stamps'}
          </h4>

          <div className="space-y-3">
            {BADGES.map((badge) => (
              <div
                key={badge.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3.5 ${
                  badge.unlocked
                    ? 'bg-white border-amber-200/90 shadow-sm'
                    : 'bg-stone-100/70 border-stone-200 opacity-60'
                }`}
              >
                {/* Stamp Icon */}
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${badge.color} text-white flex items-center justify-center text-xl shadow-md flex-shrink-0 relative`}
                >
                  <span>{badge.icon}</span>
                  {badge.unlocked && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-stone-900 truncate">
                      {lang === 'hi' ? badge.titleHi : badge.title}
                    </h5>
                    <span
                      className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        badge.unlocked
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-stone-200 text-stone-600'
                      }`}
                    >
                      {badge.unlocked ? (lang === 'hi' ? 'प्राप्त' : 'Unlocked') : (lang === 'hi' ? 'लॉक्ड' : 'Locked')}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 mt-0.5 leading-snug">
                    {lang === 'hi' ? badge.descHi : badge.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 bg-stone-100 border-t border-stone-200 text-center">
          <p className="text-[11px] text-stone-500 font-medium">
            {lang === 'hi'
              ? '🇮🇳 राष्ट्रीय सांस्कृतिक धरोहर मिशन के अंतर्गत जारी'
              : '🇮🇳 Certified by National Cultural Heritage & Artisan Guild Initiative'}
          </p>
        </div>
      </div>
    </div>
  );
}
