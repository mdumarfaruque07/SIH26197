import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { placeService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import InstagramPostCard, { getSavedPostsList } from '../components/InstagramPostCard';
import {
  Bookmark,
  CheckCircle2,
  Circle,
  MapPin,
  Star,
  Compass,
  ArrowRight,
  Trash2,
  Calendar,
  AlertCircle,
  LogIn,
  Camera,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function BookmarksPage() {
  const { user } = useAuth();
  const { lang } = useLanguage();

  const [activeTab, setActiveTab] = useState('posts'); // 'posts' (Saved Instagram Posts) | 'places' (Monuments)
  const [savedPosts, setSavedPosts] = useState(() => getSavedPostsList());
  const [bookmarks, setBookmarks] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' | 'visited' | 'want_to_visit'
  const [loading, setLoading] = useState(false);

  // Sync saved posts in real-time
  useEffect(() => {
    const handleSavedChanged = () => {
      setSavedPosts(getSavedPostsList());
    };
    window.addEventListener('sanskriti_saved_posts_changed', handleSavedChanged);
    return () => {
      window.removeEventListener('sanskriti_saved_posts_changed', handleSavedChanged);
    };
  }, []);

  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      const res = await placeService.getBookmarks();
      if (res.success) {
        setBookmarks(res.bookmarks);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBookmarks();
    }
  }, [user]);

  const handleToggleVisited = async (placeId) => {
    try {
      const res = await placeService.toggleVisited(placeId);
      if (res.success) {
        setBookmarks((prev) =>
          prev.map((b) => (b.place.id === placeId ? { ...b, visited: res.visited } : b))
        );
      }
    } catch (e) {
      alert('Failed to update visited status');
    }
  };

  const handleRemoveBookmark = async (placeId) => {
    try {
      const res = await placeService.toggleBookmark(placeId);
      if (res.success) {
        setBookmarks((prev) => prev.filter((b) => b.place.id !== placeId));
      }
    } catch (e) {
      alert('Failed to remove bookmark');
    }
  };

  const filteredPlaces = bookmarks.filter((b) => {
    if (filter === 'visited') return b.visited;
    if (filter === 'want_to_visit') return !b.visited;
    return true;
  });

  const visitedCount = bookmarks.filter((b) => b.visited).length;
  const wantToVisitCount = bookmarks.length - visitedCount;

  return (
    <div className="min-h-screen bg-[#fdfbf7] p-4 sm:p-8 pb-24">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-stone-900 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <Bookmark className="w-5 h-5 fill-amber-500" />
              </div>
              <span>{lang === 'hi' ? 'मेरी सहेजी गई धरोहर व पोस्ट' : 'My Saved Collection & Bucket List'}</span>
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              {lang === 'hi'
                ? 'फ़ीड से सहेजी गई तस्वीरें, समीक्षाएं और अपनी पसंद के पसंदीदा स्थल'
                : 'Saved community review posts, visitor stories and monumental travel bucket list'}
            </p>
          </div>

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold self-start sm:self-auto transition-colors"
          >
            <Compass className="w-4 h-4 text-heritage-600" />
            <span>{lang === 'hi' ? 'फ़ीड देखें' : 'Explore Community Feed'}</span>
          </Link>
        </div>

        {/* Top Tab Switcher: [ 📸 Saved Posts ] vs [ 🏛️ Saved Places ] */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-stone-200/70 max-w-md">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'posts'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-rose-500" />
            <span>{lang === 'hi' ? 'सहेजी गई पोस्ट' : 'Saved Posts'}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
              {savedPosts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('places')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'places'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-heritage-600" />
            <span>{lang === 'hi' ? 'सहेजे गए स्मारक' : 'Saved Places'}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-stone-200 text-stone-700 text-[10px] font-bold">
              {bookmarks.length}
            </span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: SAVED INSTAGRAM COMMUNITY POSTS                                    */}
        {/* ========================================================================= */}
        {activeTab === 'posts' && (
          <div className="space-y-6">
            {savedPosts.length === 0 ? (
              <div className="p-16 text-center bg-white rounded-3xl border border-dashed border-stone-300 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto border border-amber-200">
                  <Bookmark className="w-7 h-7" />
                </div>
                <h3 className="font-serif text-lg font-bold text-stone-800">
                  {lang === 'hi' ? 'कोई सहेजी गई पोस्ट नहीं है' : 'No Saved Posts Yet'}
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  {lang === 'hi'
                    ? 'फ़ीड में किसी भी फ़ोटो या समीक्षा पर बुकमार्क आइकन दबाएं, वह यहां सहेज ली जाएगी!'
                    : 'Click the bookmark icon on any photo or visitor review in the feed to save your favorite memories here!'}
                </p>
                <Link
                  to="/"
                  className="inline-block px-5 py-2.5 bg-heritage-600 hover:bg-heritage-700 text-white rounded-xl text-xs font-semibold transition-all mt-2"
                >
                  {lang === 'hi' ? 'सामुदायिक फ़ीड देखें →' : 'Explore Community Feed →'}
                </Link>
              </div>
            ) : (
              <div className="max-w-xl mx-auto space-y-6 sm:space-y-8">
                <div className="flex items-center justify-between text-xs text-stone-500 px-1">
                  <span>
                    {lang === 'hi'
                      ? `आपकी ${savedPosts.length} सहेजी गई पोस्ट`
                      : `Your ${savedPosts.length} saved community moments`}
                  </span>
                  <span className="text-[11px] text-stone-400">
                    {lang === 'hi' ? 'ऑफ़लाइन भी उपलब्ध' : 'Available offline on this device'}
                  </span>
                </div>

                {savedPosts.map((post) => (
                  <InstagramPostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: SAVED HERITAGE MONUMENTS / PLACES                                   */}
        {/* ========================================================================= */}
        {activeTab === 'places' && (
          <div className="space-y-6">
            {!user ? (
              <div className="max-w-md mx-auto bg-white rounded-3xl p-8 border border-stone-200 shadow-lg text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-heritage-100 text-heritage-600 flex items-center justify-center mx-auto">
                  <Layers className="w-7 h-7" />
                </div>
                <h2 className="font-serif text-2xl font-bold text-stone-900">
                  {lang === 'hi' ? 'स्मारक बकेट लिस्ट सिंक करें' : 'Sync Monument Bucket List'}
                </h2>
                <p className="text-xs text-stone-500 leading-relaxed">
                  {lang === 'hi'
                    ? 'अपने खाते में ऐतिहासिक स्मारकों और मंदिरों की बकेट लिस्ट को सहेजने के लिए लॉगिन करें।'
                    : 'Sign in to sync your monument visits, personal itinerary notes, and travel wishlists across all devices.'}
                </p>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-heritage-600 hover:bg-heritage-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{lang === 'hi' ? 'लॉगिन करें' : 'Sign In to View Bookmarks'}</span>
                </Link>
              </div>
            ) : (
              <>
                {/* Filter Pills */}
                <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                      filter === 'all'
                        ? 'bg-heritage-600 text-white shadow-sm'
                        : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                    }`}
                  >
                    All Saved ({bookmarks.length})
                  </button>
                  <button
                    onClick={() => setFilter('want_to_visit')}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                      filter === 'want_to_visit'
                        ? 'bg-heritage-600 text-white shadow-sm'
                        : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                    }`}
                  >
                    Want to Visit ({wantToVisitCount})
                  </button>
                  <button
                    onClick={() => setFilter('visited')}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                      filter === 'visited'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                    }`}
                  >
                    Visited ({visitedCount})
                  </button>
                </div>

                {/* Content */}
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-72 bg-stone-200/70 rounded-3xl animate-pulse" />
                    ))}
                  </div>
                ) : filteredPlaces.length === 0 ? (
                  <div className="p-16 text-center bg-white rounded-3xl border border-dashed border-stone-300 space-y-3">
                    <Bookmark className="w-12 h-12 text-stone-300 mx-auto" />
                    <h3 className="font-serif text-lg font-bold text-stone-800">
                      {filter === 'visited'
                        ? 'No visited places yet'
                        : filter === 'want_to_visit'
                        ? 'No pending bucket list sites'
                        : 'Your saved list is empty'}
                    </h3>
                    <p className="text-xs text-stone-500 max-w-sm mx-auto">
                      Browse the Culture Feed and click the Bookmark button on any heritage site to save it here!
                    </p>
                    <Link
                      to="/"
                      className="inline-block px-5 py-2.5 bg-heritage-600 hover:bg-heritage-700 text-white rounded-xl text-xs font-semibold transition-all mt-2"
                    >
                      Explore Culture Feed
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPlaces.map((item) => {
                      const place = item.place;
                      return (
                        <div
                          key={item.bookmarkId}
                          className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                        >
                          {/* Image & Status Badge */}
                          <div className="relative aspect-[16/10] bg-stone-100">
                            <img
                              src={place.coverImage}
                              alt={place.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src =
                                  'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80';
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                            <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-md truncate">
                                  {place.category}
                                </span>
                                {item.visited && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-xs flex-shrink-0">
                                    Visited ✓
                                  </span>
                                )}
                              </div>

                              <button
                                onClick={() => handleRemoveBookmark(place.id)}
                                title="Remove Bookmark"
                                className="p-1.5 rounded-full bg-black/60 hover:bg-red-600 text-white transition-colors flex-shrink-0"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="absolute bottom-3 left-3 right-3 text-white">
                              <div className="flex items-center gap-1 text-[11px] text-stone-300">
                                <MapPin className="w-3 h-3 text-heritage-400" />
                                <span>{place.state || 'India'}</span>
                              </div>
                              <h3 className="font-serif text-lg font-bold leading-tight line-clamp-1">
                                {place.name}
                              </h3>
                            </div>
                          </div>

                          {/* Body & Actions */}
                          <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between text-xs text-stone-500 pb-2 border-b border-stone-100">
                                <span className="flex items-center gap-1 text-amber-600 font-bold">
                                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                  {place.rating || 5.0}
                                </span>
                                <span className="text-[11px] text-stone-400">
                                  Saved on {new Date(item.savedAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-xs text-stone-600 mt-2 line-clamp-2 leading-relaxed">
                                {place.shortDescription}
                              </p>
                            </div>

                            <div className="pt-2 space-y-2">
                              {/* Visited Toggle */}
                              <button
                                onClick={() => handleToggleVisited(place.id)}
                                className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all border ${
                                  item.visited
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                    : 'bg-stone-50 text-stone-600 hover:bg-stone-100 border-stone-200'
                                }`}
                              >
                                {item.visited ? (
                                  <>
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    <span>Visited! (Tap to unmark)</span>
                                  </>
                                ) : (
                                  <>
                                    <Circle className="w-4 h-4 text-stone-400" />
                                    <span>Mark as Visited</span>
                                  </>
                                )}
                              </button>

                              {/* Explore Button */}
                              <Link
                                to={`/place/${place.slug}`}
                                className="w-full flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl bg-heritage-600 hover:bg-heritage-700 text-white text-xs font-semibold shadow-xs transition-colors"
                              >
                                <span>Explore Story & Videos</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
