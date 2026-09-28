import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  X,
  User,
  LogIn,
  LogOut,
  ShieldCheck,
  Compass,
  ShoppingBag,
  Bookmark,
  Languages,
  Sparkles,
  Camera,
  MapPin,
  Store,
  LifeBuoy,
  Server,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function MenuDrawer({ isOpen, onClose, onOpenPostModal, onOpenServerConfig }) {
  const { user, logout, isGuest } = useAuth();
  const { lang, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-[85vw] max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between p-4 sm:p-5 overflow-y-auto animate-slide-left border-l border-stone-200">
        <div className="space-y-4 sm:space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-heritage-600 text-white flex items-center justify-center font-serif font-black text-sm flex-shrink-0 shadow-xs">
                सं
              </div>
              <div className="min-w-0">
                <h3 className="font-serif font-bold text-base text-stone-900 leading-tight whitespace-nowrap">
                  {lang === 'hi' ? 'संस्कृति खोज' : 'SanskritiKhoj'}
                </h3>
                <p className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold whitespace-nowrap">
                  Indian Heritage Portal
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Card (Clickable to /profile) */}
          <Link
            to="/profile"
            onClick={onClose}
            className="p-3 rounded-2xl bg-stone-50 hover:bg-amber-50/70 border border-stone-200/90 hover:border-amber-300 flex items-center gap-3 transition-all group"
            title="Manage Profile & Settings"
          >
            <img
              src={
                user?.avatarUrl ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'Guest')}`
              }
              alt={user?.name || 'Guest'}
              className="w-10 h-10 rounded-full object-cover border border-stone-300 group-hover:scale-105 transition-transform flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="font-bold text-xs text-stone-900 group-hover:text-amber-800 flex items-center justify-between gap-1">
                <span className="truncate">{user ? user.name : 'Guest Explorer'}</span>
                <span className="text-[10px] text-amber-700 bg-amber-100 font-semibold px-2 py-0.5 rounded-full flex-shrink-0">
                  Edit
                </span>
              </div>
              <div className="text-[10px] text-stone-500 truncate mt-0.5">
                {user?.role === 'admin'
                  ? '🛡️ Government Admin'
                  : isGuest
                  ? 'Tourist (Guest Mode)'
                  : user?.email || 'Logged In'}
              </div>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="space-y-1">
            {/* Language Switcher Bar */}
            <button
              onClick={toggleLanguage}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold bg-stone-100 text-stone-800 hover:bg-stone-200 transition-colors mb-2"
            >
              <div className="flex items-center gap-2">
                <Languages className="w-4 h-4 text-heritage-600 flex-shrink-0" />
                <span className="truncate">{lang === 'hi' ? 'भाषा: हिंदी' : 'Language: English'}</span>
              </div>
              <span className="text-[10px] font-bold text-heritage-700 uppercase bg-white px-2 py-0.5 rounded-full border border-stone-200 flex-shrink-0 shadow-2xs">
                {lang === 'hi' ? 'English' : 'हिंदी'}
              </span>
            </button>

            {/* Profile & Settings Navigation Link */}
            <Link
              to="/profile"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-colors"
            >
              <User className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>{lang === 'hi' ? 'मेरी प्रोफ़ाइल एवं सेटिंग्स' : 'My Profile & Settings'}</span>
            </Link>

            <Link
              to="/"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-colors"
            >
              <Compass className="w-4 h-4 text-heritage-600 flex-shrink-0" />
              <span>{t('cultureFeed')}</span>
            </Link>

            <Link
              to="/map"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-colors"
            >
              <MapPin className="w-4 h-4 text-orange-600 flex-shrink-0" />
              <span>{t('heritageMap')}</span>
            </Link>

            <Link
              to="/bazaar"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-colors"
            >
              <ShoppingBag className="w-4 h-4 text-indigo-600 flex-shrink-0" />
              <span>{t('odopBazaar')}</span>
            </Link>

            <Link
              to="/artisan-portal"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-colors"
            >
              <Store className="w-4 h-4 text-orange-600 flex-shrink-0" />
              <span>{lang === 'hi' ? 'कारीगर एवं विक्रेता केंद्र' : 'Artisan & Trader Studio'}</span>
            </Link>

            <Link
              to="/bookmarks"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-colors"
            >
              <Bookmark className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>{t('savedBucketList')}</span>
            </Link>

            <Link
              to="/profile?tab=preferences&section=support"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-colors"
            >
              <LifeBuoy className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{lang === 'hi' ? 'सहायता एवं समस्या रिपोर्ट' : 'Help & Report Issue'}</span>
            </Link>

            <button
              onClick={() => {
                onClose();
                if (onOpenServerConfig) onOpenServerConfig();
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-emerald-800 bg-emerald-50/80 hover:bg-emerald-100/80 border border-emerald-200/80 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Server className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{lang === 'hi' ? 'सर्वर कनेक्शन व IP' : 'Server Connection & IP'}</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </button>

            {user?.role === 'admin' && (
              <Link
                to="/admin"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-heritage-700 bg-heritage-50 border border-heritage-200 transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-heritage-600 flex-shrink-0" />
                <span>Government Admin Panel</span>
              </Link>
            )}
          </div>

          {/* Quick Post Visit Button */}
          <button
            onClick={() => {
              onClose();
              if (onOpenPostModal) onOpenPostModal();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-heritage-600 hover:bg-heritage-700 text-white text-xs font-bold shadow-md shadow-heritage-600/20 transition-all active:scale-98"
          >
            <Camera className="w-4 h-4" />
            <span>Share Heritage Visit Photo</span>
          </button>
        </div>

        {/* Footer Auth Actions */}
        <div className="pt-3 border-t border-stone-100 space-y-2 mt-4">
          {user && !isGuest ? (
            <button
              onClick={() => {
                logout();
                onClose();
                navigate('/');
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-stone-200 text-stone-600 hover:text-red-600 hover:border-red-200 text-xs font-semibold transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/login"
                onClick={onClose}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-stone-900 text-white text-xs font-semibold"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Log In</span>
              </Link>
              <Link
                to="/register"
                onClick={onClose}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold"
              >
                <span>Register</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
