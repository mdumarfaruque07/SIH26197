import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Compass, Map, Search, ShoppingBag, Bookmark } from 'lucide-react';
import { useKeyboardVisible } from '../hooks/useKeyboardVisible';
import { useLanguage } from '../context/LanguageContext';

export default function BottomNav({ onOpenSearch }) {
  const location = useLocation();
  const isKeyboardVisible = useKeyboardVisible();
  const { lang, t } = useLanguage();

  // Hide bottom navigation bar on authentication screens or when mobile virtual keyboard is active
  const isAuthRoute =
    location.pathname.startsWith('/login') ||
    location.pathname.startsWith('/register') ||
    location.pathname.includes('/login') ||
    location.pathname.includes('/register');

  if (isAuthRoute || isKeyboardVisible) {
    return null;
  }

  const navItems = [
    {
      to: '/',
      label: t('navFeed'),
      icon: Compass,
      exact: true,
    },
    {
      to: '/map',
      label: t('navMap'),
      icon: Map,
    },
    {
      action: onOpenSearch,
      label: t('navSearch'),
      icon: Search,
      isButton: true,
    },
    {
      to: '/bazaar',
      label: t('navBazaar'),
      icon: ShoppingBag,
      badge: 'ODOP',
    },
    {
      to: '/bookmarks',
      label: lang === 'hi' ? 'सहेजे' : 'Saved',
      icon: Bookmark,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[9990] bg-white/95 backdrop-blur-lg border-t border-stone-200/90 shadow-2xl py-1.5 px-3">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item, idx) => {
          const Icon = item.icon;

          if (item.isButton) {
            return (
              <button
                key={idx}
                onClick={item.action}
                className="flex flex-col items-center justify-center py-1 px-3 text-stone-500 hover:text-heritage-600 transition-colors"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-stone-600 hover:bg-stone-100 transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-semibold tracking-tight text-stone-600">
                  {item.label}
                </span>
              </button>
            );
          }

          const isActive = item.exact
            ? location.pathname === item.to
            : location.pathname.startsWith(item.to);

          return (
            <NavLink
              key={idx}
              to={item.to}
              className={`relative flex flex-col items-center justify-center py-1 px-3 transition-all ${
                isActive ? 'text-heritage-600 scale-105' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'stroke-[2.5px] text-heritage-600' : ''
                  }`}
                />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-3.5 bg-orange-600 text-white text-[8px] font-extrabold px-1 py-0.2 rounded-full uppercase tracking-tighter">
                    {item.badge}
                  </span>
                )}
              </div>

              <span
                className={`text-[10px] tracking-tight mt-0.5 ${
                  isActive ? 'font-bold text-heritage-600' : 'font-medium text-stone-500'
                }`}
              >
                {item.label}
              </span>

              {isActive && (
                <span className="absolute bottom-0 w-1.5 h-1.5 bg-heritage-600 rounded-full" />
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
