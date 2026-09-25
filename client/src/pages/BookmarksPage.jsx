import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { placeService } from '../services/api';
import { useAuth } from '../context/AuthContext';
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
} from 'lucide-react';

export default function BookmarksPage() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' | 'visited' | 'want_to_visit'
  const [loading, setLoading] = useState(true);

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
    } else {
      setLoading(false);
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

  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-stone-200 shadow-xl text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-heritage-100 text-heritage-600 flex items-center justify-center mx-auto">
            <Bookmark className="w-7 h-7" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-stone-900">Your Saved Heritage Sites</h2>
          <p className="text-xs text-stone-500 leading-relaxed">
            Log in to view and organize your saved heritage monuments, temples, and travel bucket list.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-heritage-600 hover:bg-heritage-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In to View Bookmarks</span>
          </Link>
        </div>
      </div>
    );
  }

  const filtered = bookmarks.filter((b) => {
    if (filter === 'visited') return b.visited;
    if (filter === 'want_to_visit') return !b.visited;
    return true;
  });

  const visitedCount = bookmarks.filter((b) => b.visited).length;
  const wantToVisitCount = bookmarks.length - visitedCount;

  return (
    <div className="min-h-screen bg-[#fdfbf7] p-4 sm:p-8 pb-24">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-extrabold text-stone-900 flex items-center gap-3">
              <Bookmark className="w-8 h-8 text-heritage-600 fill-heritage-600" />
              <span>My Saved Heritage Bucket List</span>
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              Track places you've visited and plan future journeys across India's sacred landmarks
            </p>
          </div>

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold self-start sm:self-auto transition-colors"
          >
            <Compass className="w-4 h-4 text-heritage-600" />
            <span>Discover More Sites</span>
          </Link>
        </div>

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
        ) : filtered.length === 0 ? (
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
            {filtered.map((item) => {
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
                        e.target.src = 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80';
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
      </div>
    </div>
  );
}
