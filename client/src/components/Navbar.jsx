import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MapPin, Compass, Camera, ShieldCheck, LogIn, LogOut, User, Menu, X, Landmark, Bookmark, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onOpenPostModal, onOpenMenu }) {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-stone-200/80 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-heritage-600 to-heritage-400 flex items-center justify-center text-white shadow-md shadow-heritage-500/20 group-hover:scale-105 transition-transform">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <div className="font-serif text-2xl font-bold tracking-tight text-stone-900 group-hover:text-heritage-600 transition-colors">
                संस्कृति <span className="text-heritage-600 font-sans text-lg font-semibold">Khoj</span>
              </div>
              <p className="text-[10px] text-stone-600 font-medium tracking-wider uppercase -mt-1">
                India Heritage & Culture Portal
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              to="/"
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isActive('/')
                  ? 'bg-heritage-50 text-heritage-700 shadow-sm border border-heritage-200'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Compass className="w-4 h-4 text-heritage-500" />
              <span>Culture Feed</span>
            </Link>

            <Link
              to="/map"
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isActive('/map')
                  ? 'bg-heritage-50 text-heritage-700 shadow-sm border border-heritage-200'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <MapPin className="w-4 h-4 text-heritage-500" />
              <span>Heritage Map</span>
            </Link>

            <Link
              to="/bazaar"
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isActive('/bazaar')
                  ? 'bg-orange-50 text-orange-700 shadow-sm border border-orange-200'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-orange-500" />
              <span>ODOP Bazaar</span>
            </Link>

            {user && (
              <Link
                to="/bookmarks"
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  isActive('/bookmarks')
                    ? 'bg-heritage-50 text-heritage-700 shadow-sm border border-heritage-200'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <Bookmark className="w-4 h-4 text-heritage-500" />
                <span>Saved Bucket List</span>
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  isActive('/admin')
                    ? 'bg-amber-50 text-amber-800 shadow-sm border border-amber-200'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>Admin Panel</span>
              </Link>
            )}
          </nav>

          {/* Action Buttons (Right) */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={onOpenPostModal}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-stone-900 hover:bg-heritage-600 text-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <Camera className="w-4 h-4" />
              <span>Post Visit</span>
            </button>

            {user ? (
              <div className="flex items-center gap-3 pl-2 border-l border-stone-200">
                <div className="flex items-center gap-2">
                  <img
                    src={user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                    alt={user.name}
                    className="w-8 h-8 rounded-full border border-heritage-300 object-cover"
                  />
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-semibold text-stone-900 leading-none">{user.name}</p>
                    <span className="text-[10px] text-stone-600 uppercase font-medium">{user.role}</span>
                  </div>
                </div>
                <button
                  onClick={logout}
                  title="Logout"
                  className="p-2 text-stone-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-stone-700 hover:text-heritage-600 hover:bg-stone-100 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-full text-sm font-medium bg-heritage-500 hover:bg-heritage-600 text-white transition-colors"
                >
                  Join
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onOpenPostModal}
              className="p-2 rounded-full bg-heritage-500 text-white shadow-sm"
              title="Post Visit"
            >
              <Camera className="w-4 h-4" />
            </button>
            <button
              onClick={() => (onOpenMenu ? onOpenMenu() : setMobileMenuOpen(!mobileMenuOpen))}
              className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-stone-700 hover:bg-stone-50 font-medium"
          >
            <Compass className="w-5 h-5 text-heritage-500" />
            Culture Feed
          </Link>
          <Link
            to="/map"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-stone-700 hover:bg-stone-50 font-medium"
          >
            <MapPin className="w-5 h-5 text-heritage-500" />
            Heritage Map
          </Link>
          <Link
            to="/bazaar"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-stone-700 hover:bg-stone-50 font-medium"
          >
            <ShoppingBag className="w-5 h-5 text-orange-500" />
            ODOP Bazaar
          </Link>
          {user && (
            <Link
              to="/bookmarks"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-stone-700 hover:bg-stone-50 font-medium"
            >
              <Bookmark className="w-5 h-5 text-heritage-500" />
              Saved Bucket List
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-stone-700 hover:bg-stone-50 font-medium"
            >
              <ShieldCheck className="w-5 h-5 text-amber-600" />
              Admin Panel
            </Link>
          )}

          <div className="pt-3 border-t border-stone-100">
            {user ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-8 h-8 rounded-full border border-heritage-300"
                  />
                  <div>
                    <p className="text-sm font-semibold text-stone-900">{user.name}</p>
                    <p className="text-xs text-stone-600">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs font-semibold text-red-600 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center text-sm font-medium border border-stone-300 rounded-lg text-stone-700"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center text-sm font-medium bg-heritage-500 text-white rounded-lg"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
