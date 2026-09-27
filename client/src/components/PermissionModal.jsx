import React, { useState, useEffect } from 'react';
import { MapPin, Camera, Sparkles, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { Geolocation } from '@capacitor/geolocation';
import { Camera as CameraPlugin } from '@capacitor/camera';
import { useAuth } from '../context/AuthContext';

export default function PermissionModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const { user, continueAsGuest } = useAuth();

  useEffect(() => {
    const hasSeen = localStorage.getItem('sanskriti_permission_seen') || localStorage.getItem('sih_heritage_permission_seen');
    if (!hasSeen) {
      setIsOpen(true);
    }
  }, []);

  const handleGrant = async () => {
    setRequesting(true);
    localStorage.setItem('sanskriti_permission_seen', 'true');

    // 1. Request Native & Browser Geolocation Permission
    try {
      if (typeof Geolocation !== 'undefined' && Geolocation.requestPermissions) {
        await Geolocation.requestPermissions();
      }
    } catch (geoErr) {
      console.warn('Capacitor Geolocation permission notice:', geoErr);
    }
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => console.log('HTML5 Geolocation granted'),
        () => console.log('HTML5 Geolocation denied'),
        { timeout: 3000 }
      );
    }

    // 2. Request Native Camera & Storage/Photos Permissions
    try {
      if (typeof CameraPlugin !== 'undefined' && CameraPlugin.requestPermissions) {
        await CameraPlugin.requestPermissions({ permissions: ['camera', 'photos'] });
      }
    } catch (camErr) {
      console.warn('Capacitor Camera permission notice:', camErr);
      if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          stream.getTracks().forEach((track) => track.stop());
        } catch (mediaErr) {
          console.warn('Browser webcam prompt denied/unavailable:', mediaErr);
        }
      }
    }

    if (!user) {
      continueAsGuest();
    }
    setRequesting(false);
    setIsOpen(false);
  };

  const handleSkip = () => {
    localStorage.setItem('sanskriti_permission_seen', 'true');
    if (!user) {
      continueAsGuest();
    }
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-6 text-center shadow-2xl border border-stone-200">
        {/* Header Icon */}
        <div className="w-16 h-16 rounded-2xl bg-heritage-50 border border-heritage-200 text-heritage-600 flex items-center justify-center mx-auto shadow-inner">
          <Sparkles className="w-8 h-8 text-heritage-600 animate-pulse" />
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-heritage-600 bg-heritage-100/70 px-2.5 py-1 rounded-full">
            National Cultural Heritage Portal
          </span>
          <h2 className="font-serif text-2xl font-bold text-stone-900 mt-2">
            Welcome to <span className="text-heritage-600">Sanskriti</span>Khoj
          </h2>
          <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
            Discover living monuments, listen to folk chronicles, and support traditional artisans nearest to you.
          </p>
        </div>

        {/* Permissions list */}
        <div className="space-y-3 text-left">
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-stone-50 border border-stone-200/80">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center flex-shrink-0 mt-0.5">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-stone-800">Precise Geolocation</h4>
              <p className="text-[11px] text-stone-500 leading-tight mt-0.5">
                Detects nearby monuments, alerts your map radar, and sorts culture feed by walking distance.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-stone-50 border border-stone-200/80">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-stone-800">Camera & Photo Storage</h4>
              <p className="text-[11px] text-stone-500 leading-tight mt-0.5">
                Take live camera snaps of heritage monuments and pick authentic review photos from phone storage.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <button
            onClick={handleGrant}
            disabled={requesting}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-heritage-600 hover:bg-heritage-700 active:scale-95 text-white text-sm font-bold shadow-lg shadow-heritage-600/30 transition-all disabled:opacity-75"
          >
            {requesting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Requesting Device Permissions...</span>
              </>
            ) : (
              <>
                <span>Allow GPS, Camera & Enter</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <button
            onClick={handleSkip}
            disabled={requesting}
            className="w-full py-2.5 text-xs text-stone-500 hover:text-stone-800 font-semibold transition-colors"
          >
            Continue as Guest without Device Access
          </button>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[10px] text-stone-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Your privacy is protected. No personal data shared.</span>
        </div>
      </div>
    </div>
  );
}
