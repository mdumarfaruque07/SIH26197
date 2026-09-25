import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { placeService } from '../services/api';
import AudioNarrationPlayer from '../components/AudioNarrationPlayer';
import {
  MapPin,
  Star,
  Bookmark,
  Share2,
  ArrowLeft,
  Youtube,
  Film,
  Music,
  ExternalLink,
  Camera,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function PlaceDetailPage({ onOpenPostModal }) {
  const { slug } = useParams();
  const { user } = useAuth();
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchPlace = async () => {
    setLoading(true);
    try {
      const res = await placeService.getBySlug(slug);
      if (res.success) {
        setPlace(res.place);
        setBookmarked(res.place.isBookmarked);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlace();
  }, [slug]);

  const handleBookmarkToggle = async () => {
    if (!user) {
      alert('Please login to bookmark this place.');
      return;
    }
    try {
      const res = await placeService.toggleBookmark(place.id);
      if (res.success) {
        setBookmarked(res.bookmarked);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: place?.name,
        text: `Check out ${place?.name} on Sanskriti Khoj!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-heritage-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="min-h-screen p-12 text-center">
        <h2 className="text-xl font-bold text-stone-800">Heritage Place Not Found</h2>
        <Link to="/" className="text-heritage-600 mt-4 inline-block font-semibold">
          Return to Culture Feed
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfbf7] pb-24">
      {/* Hero Header */}
      <div className="relative min-h-[440px] sm:h-[500px] w-full bg-stone-900 flex flex-col justify-between">
        <img
          src={place.coverImage}
          alt={place.name}
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/50 to-black/40" />

        {/* Top Floating Bar */}
        <div className="relative pt-6 px-4 sm:px-8 max-w-7xl w-full mx-auto flex items-center justify-between z-10">
          <Link
            to="/"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-md text-xs font-semibold border border-white/20 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Feed</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBookmarkToggle}
              className={`p-2.5 rounded-full backdrop-blur-md border transition-all ${
                bookmarked
                  ? 'bg-heritage-500 border-heritage-400 text-white shadow-md'
                  : 'bg-black/50 hover:bg-black/70 border-white/20 text-white'
              }`}
              title={bookmarked ? 'Saved to Bookmarks' : 'Bookmark this place'}
            >
              <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleShare}
              className="p-2.5 rounded-full bg-black/50 hover:bg-black/70 border border-white/20 text-white backdrop-blur-md transition-colors relative"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
              {copied && (
                <span className="absolute -bottom-8 right-0 bg-stone-900 text-white text-[10px] px-2 py-0.5 rounded shadow whitespace-nowrap">
                  Link copied!
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Hero Title & Meta */}
        <div className="relative pb-8 pt-12 px-4 sm:px-8 max-w-5xl mx-auto w-full text-white z-10">
          <div className="flex flex-wrap items-center gap-2 mb-2.5">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-heritage-600/90 backdrop-blur-md shadow-xs">
              {place.category}
            </span>
            {place.state && (
              <span className="flex items-center gap-1 text-xs text-stone-200 bg-black/50 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                <MapPin className="w-3.5 h-3.5 text-heritage-400" />
                {place.state}, India
              </span>
            )}
            <div className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-black/50 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{place.rating || 5.0}</span>
            </div>
          </div>

          <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow-md leading-tight">
            {place.name}
          </h1>
          <p className="mt-2 text-stone-300 max-w-2xl text-xs sm:text-sm font-light drop-shadow-sm leading-relaxed line-clamp-2">
            {place.shortDescription}
          </p>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-10">
        {/* 1. Audio Narration Player */}
        <section>
          <AudioNarrationPlayer text={place.fullStory} title={place.name} />
        </section>

        {/* 2. Full History & Story */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h2 className="font-serif text-2xl font-bold text-stone-900">
              The History & Cultural Significance
            </h2>
            <Link
              to={`/map?lat=${place.latitude}&lng=${place.longitude}`}
              className="text-xs font-semibold text-heritage-600 hover:underline flex items-center gap-1"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>View On Interactive Map</span>
            </Link>
          </div>

          <div className="prose prose-stone max-w-none text-stone-700 leading-relaxed space-y-4 whitespace-pre-line text-base">
            {place.fullStory}
          </div>
        </section>

        {/* 3. YouTube Virtual Tour / Documentary Video Embed */}
        {place.youtubeVideoId && (
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                <Youtube className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  Virtual Tour & Documentary
                </h3>
                <p className="text-xs text-stone-500">Immersive video walkthrough of {place.name}</p>
              </div>
            </div>

            <div className="aspect-video rounded-2xl overflow-hidden shadow-lg border border-stone-200 bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${place.youtubeVideoId}`}
                title={place.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>
          </section>
        )}

        {/* 4. Related Movies, Songs & Folklore */}
        {place.mediaLinks && place.mediaLinks.length > 0 && (
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <Film className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  Folklore, Cinema & Melodies
                </h3>
                <p className="text-xs text-stone-500">Popular songs, movies, and stories shot here</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {place.mediaLinks.map((media) => (
                <a
                  key={media.id}
                  href={media.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex gap-3 p-3 rounded-2xl border border-stone-200 hover:border-heritage-400 bg-stone-50 hover:bg-heritage-50/40 transition-all"
                >
                  <div className="relative w-28 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-stone-200">
                    <img
                      src={media.thumbnailUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80'}
                      alt={media.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="w-7 h-7 rounded-full bg-white/90 text-red-600 flex items-center justify-center shadow-md">
                        {media.type === 'song' ? <Music className="w-3.5 h-3.5" /> : <Film className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-heritage-600 tracking-wider">
                        {media.type}
                      </span>
                      <h4 className="font-semibold text-xs text-stone-900 group-hover:text-heritage-600 transition-colors line-clamp-2">
                        {media.title}
                      </h4>
                    </div>
                    <span className="text-[11px] text-stone-400 flex items-center gap-1">
                      <span>Watch on YouTube</span>
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* 5. Visitor Photos & Reviews */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div>
              <h3 className="font-serif text-2xl font-bold text-stone-900">
                Visitor Photos & Community Reviews
              </h3>
              <p className="text-xs text-stone-500">See genuine experiences shared by recent travellers</p>
            </div>

            <button
              onClick={() => onOpenPostModal && onOpenPostModal(place.id)}
              className="flex items-center gap-2 px-4 py-2 bg-heritage-600 hover:bg-heritage-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              <Camera className="w-4 h-4" />
              <span>Add Your Visit Photo</span>
            </button>
          </div>

          {place.posts.length === 0 ? (
            <div className="py-12 text-center">
              <Camera className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-stone-600">No visitor photos yet</p>
              <p className="text-xs text-stone-400 mt-0.5">
                Be the first traveler to post a photo and review of {place.name}!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {place.posts.map((post) => (
                <div
                  key={post.id}
                  className="rounded-2xl border border-stone-200 overflow-hidden bg-stone-50/50 flex flex-col justify-between"
                >
                  <div>
                    <div className="aspect-[4/3] bg-stone-200 overflow-hidden">
                      <img
                        src={post.imageUrl}
                        alt="User Visit"
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={post.user?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${post.user?.name}`}
                            alt={post.user?.name}
                            className="w-6 h-6 rounded-full border border-stone-200"
                          />
                          <span className="text-xs font-bold text-stone-900">{post.user?.name}</span>
                        </div>
                        <div className="flex items-center text-amber-500 text-xs font-bold">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{post.rating}</span>
                        </div>
                      </div>
                      {post.caption && (
                        <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed italic">
                          "{post.caption}"
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
