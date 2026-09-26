import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import FeedPage from './pages/FeedPage';
import MapPage from './pages/MapPage';
import PlaceDetailPage from './pages/PlaceDetailPage';
import BookmarksPage from './pages/BookmarksPage';
import BazaarPage from './pages/BazaarPage';
import ArtisanPortalPage from './pages/ArtisanPortalPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PostModal from './components/PostModal';
import BottomNav from './components/BottomNav';
import MenuDrawer from './components/MenuDrawer';
import SearchModal from './components/SearchModal';
import PermissionModal from './components/PermissionModal';
import { Landmark, Heart } from 'lucide-react';

function AppContent() {
  const location = useLocation();
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [postModalPlaceId, setPostModalPlaceId] = useState(null);
  const [menuDrawerOpen, setMenuDrawerOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  const handleOpenPostModal = (placeId = null) => {
    setPostModalPlaceId(placeId);
    setPostModalOpen(true);
  };

  const isAuthPage =
    location.pathname.startsWith('/login') ||
    location.pathname.startsWith('/register') ||
    location.pathname.includes('/login') ||
    location.pathname.includes('/register');

  return (
    <div className="flex flex-col min-h-screen bg-[#fdfbf7] selection:bg-heritage-500 selection:text-white">
      {/* Permission Onboarding Prompt for GPS & Camera (only in-app, not on auth screens) */}
      {!isAuthPage && <PermissionModal />}

      {/* Top Navbar */}
      <Navbar
        onOpenPostModal={() => handleOpenPostModal()}
        onOpenMenu={() => setMenuDrawerOpen(true)}
      />

      {/* Main App Screens */}
      <main className={`flex-1 ${isAuthPage ? '' : 'pb-16 md:pb-0'}`}>
        <Routes>
          <Route
            path="/"
            element={
              <FeedPage
                onOpenPostModal={handleOpenPostModal}
              />
            }
          />
          <Route path="/map" element={<MapPage />} />
          <Route
            path="/place/:slug"
            element={
              <PlaceDetailPage
                onOpenPostModal={handleOpenPostModal}
              />
            }
          />
          <Route path="/bazaar" element={<BazaarPage />} />
          <Route path="/artisan-portal" element={<ArtisanPortalPage />} />
          <Route path="/bookmarks" element={<BookmarksPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </main>

      {/* Footer with mobile bottom nav spacing - hidden on auth screens */}
      {!isAuthPage && (
        <footer className="bg-stone-900 text-stone-400 py-10 pb-24 md:pb-10 border-t border-stone-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Landmark className="w-5 h-5 text-heritage-500" />
              <span className="font-serif text-lg font-bold text-white">Sanskriti<span className="text-amber-500 font-sans font-extrabold">GO</span></span>
              <span className="text-xs text-stone-400">| National Heritage & Artisan Ecosystem</span>
            </div>
            <p className="text-xs flex items-center gap-1.5 text-stone-400">
              Preserving Indian culture, monuments & traditional crafts with <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" />
            </p>
          </div>
        </footer>
      )}

      {/* Mobile Ergonomic Bottom Navigation Bar - strictly hidden on auth screens */}
      {!isAuthPage && (
        <BottomNav
          onOpenSearch={() => setSearchModalOpen(true)}
        />
      )}

      {/* Mobile Sliding Menu Drawer */}
      <MenuDrawer
        isOpen={menuDrawerOpen}
        onClose={() => setMenuDrawerOpen(false)}
        onOpenPostModal={handleOpenPostModal}
      />

      {/* Quick Search Modal */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />

      {/* Global Post Visit Photo & Rating Modal */}
      <PostModal
        isOpen={postModalOpen}
        onClose={() => setPostModalOpen(false)}
        initialPlaceId={postModalPlaceId}
        onSuccess={() => {
          window.location.reload();
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}
