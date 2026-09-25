import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Navigation, X, Radio, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function HeritageRadar({ nearestPlace, userLocation }) {
  const [minimized, setMinimized] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();
  const { lang, t } = useLanguage();

  if (dismissed || !nearestPlace) return null;

  const handleOpenMap = () => {
    navigate(`/map?lat=${nearestPlace.latitude}&lng=${nearestPlace.longitude}`);
  };

  const displayName = lang === 'hi' && nearestPlace.nameHi ? nearestPlace.nameHi : nearestPlace.name;

  if (minimized) {
    return (
      <button
        onClick={() => setMinimized(false)}
        className="fixed bottom-20 right-4 z-40 bg-stone-900/90 text-white p-3 rounded-full shadow-2xl border border-heritage-500/40 backdrop-blur-md flex items-center justify-center animate-bounce"
        title="Open Heritage Radar"
      >
        <span className="relative flex h-3 w-3 mr-1">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
        </span>
        <Compass className="w-5 h-5 text-heritage-300" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-40 bg-stone-900/95 text-white rounded-2xl p-3.5 shadow-2xl border border-heritage-500/30 backdrop-blur-lg animate-slide-up">
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          {/* Pulsing Radar beacon */}
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-heritage-300 flex items-center gap-1">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span>{lang === 'hi' ? 'धरोहर रडार सक्रिय' : 'Heritage Radar Active'}</span>
          </span>
        </div>

        <div className="flex items-center gap-1 text-stone-400">
          <button
            onClick={() => setMinimized(true)}
            className="text-[10px] hover:text-white px-1.5 py-0.5 rounded bg-white/10"
          >
            {lang === 'hi' ? 'छोटा करें' : 'Dock'}
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 hover:text-white rounded-full"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="pt-2.5 flex items-center gap-3">
        <img
          src={nearestPlace.coverImage}
          alt={displayName}
          className="w-12 h-12 rounded-xl object-cover border border-white/20 flex-shrink-0"
        />

        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold text-white truncate">
            {displayName}
          </div>
          <div className="text-[11px] text-stone-300 flex items-center gap-1 mt-0.5">
            <Navigation className="w-3 h-3 text-heritage-400 flex-shrink-0" />
            <span>
              {nearestPlace.distanceKm !== undefined
                ? `${nearestPlace.distanceKm} km ${lang === 'hi' ? 'दूर' : 'away'}`
                : nearestPlace.distance !== undefined
                ? `${nearestPlace.distance} km ${lang === 'hi' ? 'दूर' : 'away'}`
                : `${nearestPlace.state}, India`}
            </span>
          </div>
        </div>

        <button
          onClick={handleOpenMap}
          className="p-2 rounded-xl bg-heritage-600 hover:bg-heritage-500 text-white flex items-center justify-center transition-all hover:scale-105"
          title="See on Map"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-2 pt-1.5 border-t border-white/10 flex items-center justify-between text-[10px] text-stone-400">
        <span className="flex items-center gap-1">
          <span className="text-emerald-400">🔒</span>
          <span>{lang === 'hi' ? 'ऑन-डिवाइस सुरक्षित जीपीएस' : 'Private On-Device GPS (No Remote Tracking)'}</span>
        </span>
        <span className="text-stone-500 font-medium">Incredible India</span>
      </div>
    </div>
  );
}
