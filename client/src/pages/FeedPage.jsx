import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { placeService, postService } from '../services/api';
import { getLiveLocation } from '../utils/geolocation';
import CultureCard from '../components/CultureCard';
import HeritageRadar from '../components/HeritageRadar';
import { useLanguage } from '../context/LanguageContext';
import {
  Compass,
  MapPin,
  Search,
  Sparkles,
  RefreshCw,
  Star,
  Users,
  AlertCircle,
  Camera,
  Calendar,
} from 'lucide-react';

const CULTURAL_FESTIVALS = [
  {
    id: 1,
    name: 'Dev Deepawali & Maha Ganga Aarti',
    nameHi: 'देव दीपावली एवं महा गंगा आरती',
    location: 'Varanasi Ghats, Uttar Pradesh',
    locationHi: 'वाराणसी घाट, उत्तर प्रदेश',
    date: 'Kartik Purnima',
    dateHi: 'कार्तिक पूर्णिमा',
    badge: 'Sacred River Festival',
    badgeHi: 'पवित्र जल महोत्सव',
    image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=600&q=80',
    slug: 'varanasi-ghats',
  },
  {
    id: 2,
    name: 'Konark Dance & Music Festival',
    nameHi: 'कोणार्क शास्त्रीय नृत्य महोत्सव',
    location: 'Sun Temple, Odisha',
    locationHi: 'सूर्य मंदिर, ओडिशा',
    date: '1st - 5th December',
    dateHi: '1 - 5 दिसम्बर',
    badge: 'Classical Natya Utsav',
    badgeHi: 'शास्त्रीय नृत्य उत्सव',
    image: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=600&q=80',
    slug: 'konark-sun-temple',
  },
  {
    id: 3,
    name: 'Taj Mahotsav Artisan Carnival',
    nameHi: 'ताज महोत्सव एवं शिल्प मेला',
    location: 'Shilpgram, Agra, UP',
    locationHi: 'शिल्पग्राम, आगरा, उत्तर प्रदेश',
    date: '18th - 27th February',
    dateHi: '18 - 27 फ़रवरी',
    badge: 'Craft & Cultural Fair',
    badgeHi: 'शिल्प व सांस्कृतिक मेला',
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80',
    slug: 'taj-mahal',
  },
  {
    id: 4,
    name: 'Chithirai Thiruvizha Chariot Utsav',
    nameHi: 'चित्तिरै ब्रह्मोत्सव',
    location: 'Meenakshi Temple, Madurai',
    locationHi: 'मीनाक्षी मंदिर, मदुरै',
    date: 'April - May',
    dateHi: 'अप्रैल - मई',
    badge: 'Temple Chariot Festival',
    badgeHi: 'भव्य रथ यात्रा',
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80',
    slug: 'meenakshi-amman-temple',
  },
];

export default function FeedPage({ onOpenPostModal }) {
  const { lang, t } = useLanguage();
  const [places, setPlaces] = useState([]);
  const [feedPosts, setFeedPosts] = useState([]);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');

  const CATEGORIES = [
    { id: 'all', label: lang === 'hi' ? 'सभी धरोहर' : 'All Heritage' },
    { id: 'monument', label: lang === 'hi' ? 'ऐतिहासिक स्मारक' : 'Monuments' },
    { id: 'temple', label: lang === 'hi' ? 'प्राचीन मंदिर' : 'Ancient Temples' },
    { id: 'fort', label: lang === 'hi' ? 'शाही किले' : 'Royal Forts' },
    { id: 'festival', label: lang === 'hi' ? 'संस्कृति एवं घाट' : 'Living Culture & Ghats' },
  ];

  const fetchPlaces = async (lat = null, lng = null) => {
    setLoading(true);
    try {
      if (lat && lng) {
        const res = await placeService.getNearby(lat, lng, 2000);
        if (res.success) {
          let list = res.places;
          if (category !== 'all') {
            list = list.filter((p) => p.category === category);
          }
          setPlaces(list);
        }
      } else {
        const res = await placeService.getAll({ category, search });
        if (res.success) setPlaces(res.places);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCommunityPosts = async () => {
    try {
      const res = await postService.getFeed();
      if (res.success) setFeedPosts(res.posts);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (userLocation) {
      fetchPlaces(userLocation.lat, userLocation.lng);
    } else {
      fetchPlaces();
    }
  }, [category]);

  useEffect(() => {
    fetchCommunityPosts();
    // Prompt/resolve location gently on startup
    requestGeolocation();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPlaces();
  };

  const requestGeolocation = async () => {
    setLocating(true);
    setLocationStatus(lang === 'hi' ? 'निकटतम धरोहर स्थल खोजे जा रहे हैं...' : 'Finding nearest heritage sites...');

    try {
      const loc = await getLiveLocation();
      const coords = { lat: loc.lat, lng: loc.lng };
      setUserLocation(coords);
      if (loc.city) {
        setLocationStatus(lang === 'hi' ? `${loc.city} के निकट धरोहर स्थल` : `Heritage sites near ${loc.city}`);
      } else {
        setLocationStatus(lang === 'hi' ? 'आपकी लोकेशन के अनुसार धरोहर स्थल' : 'Heritage sites sorted by proximity');
      }
      fetchPlaces(coords.lat, coords.lng);
    } catch (err) {
      console.warn('Geolocation resolver notice:', err);
      setLocationStatus('');
    } finally {
      setLocating(false);
    }
  };

  return (
    <div className="min-h-screen pb-16">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-stone-900 text-white pt-10 pb-12 sm:pb-14 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-25">
          <img
            src="https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1800&q=80"
            alt="Indian Heritage"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/80 to-transparent" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-heritage-500/20 border border-heritage-500/30 text-heritage-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-heritage-400" />
            <span>National Heritage & Culture Portal</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
            Discover India’s Living <span className="text-heritage-400 underline decoration-heritage-500/50">Heritage</span>
          </h1>

          <p className="max-w-2xl mx-auto text-stone-300 text-sm sm:text-base font-light leading-relaxed">
            Explore sacred temples, majestic forts, folklore narratives, and authentic visitor stories powered by real-time geolocation.
          </p>

          {/* Action Row: Locate Me & Search */}
          <div className="max-w-2xl mx-auto pt-1 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={requestGeolocation}
              disabled={locating}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-heritage-600 hover:bg-heritage-500 text-white text-sm font-semibold shadow-lg shadow-heritage-600/30 transition-all hover:scale-105 active:scale-95"
            >
              {locating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Compass className="w-4 h-4 text-heritage-200" />
              )}
              <span>{userLocation ? 'Update Near Me Feed' : 'Find Heritage Near Me'}</span>
            </button>

            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="w-full flex-1 relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search monuments, temples, states..."
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/20 text-white placeholder-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-heritage-400 backdrop-blur-md transition-all"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            </form>
          </div>

          {locationStatus && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-heritage-200 font-medium">
              <MapPin className="w-3.5 h-3.5 text-heritage-400" />
              <span>{locationStatus}</span>
            </div>
          )}
        </div>
      </section>

      {/* Main Content Area - elevated above hero */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        {/* Category Pills Bar */}
        <div className="bg-white/95 backdrop-blur-md p-2.5 rounded-2xl shadow-xl shadow-stone-900/10 border border-stone-200 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                category === cat.id
                  ? 'bg-heritage-600 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>


        {/* Content Layout: Feed Grid (Left) + Community Stream (Right) */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Heritage Places Feed (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl font-bold text-stone-900">
                  {userLocation
                    ? (lang === 'hi' ? 'निकटतम सांस्कृतिक धरोहर स्थल' : 'Closest Heritage Sites')
                    : (lang === 'hi' ? 'प्रमुख सांस्कृतिक धरोहर फ़ीड' : 'Featured Culture Feed')}
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  {lang === 'hi'
                    ? `पूरे भारत के ${places.length} प्रमुख सांस्कृतिक स्थल`
                    : `Showing ${places.length} curated cultural heritage destinations across India`}
                </p>
              </div>

              {userLocation && (
                <button
                  onClick={() => {
                    setUserLocation(null);
                    setLocationStatus('');
                    fetchPlaces();
                  }}
                  className="text-xs font-semibold text-heritage-600 hover:underline"
                >
                  {lang === 'hi' ? 'रीसेट करें' : 'Reset Location'}
                </button>
              )}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-80 bg-stone-200/70 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : places.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-stone-300">
                <Compass className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <h3 className="font-semibold text-stone-700">No places found</h3>
                <p className="text-xs text-stone-400 mt-1">
                  Try changing category filter or searching a different term.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {places.map((place) => (
                  <CultureCard
                    key={place.id}
                    place={place}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Sidebar: Upcoming Festivals & Visitor Feed */}
          <div className="space-y-6">
            {/* Festivals & Cultural Events Card */}
            <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-3.5">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-bold text-stone-900">
                      {lang === 'hi' ? 'आगामी सांस्कृतिक उत्सव' : 'Cultural Festivals & Events'}
                    </h3>
                    <p className="text-[11px] text-stone-500">
                      {lang === 'hi' ? 'जीवंत मेले, आरती व नृत्य उत्सव' : 'Upcoming living fairs, Aarti & dance utsavs'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                {CULTURAL_FESTIVALS.map((fest) => (
                  <Link
                    key={fest.id}
                    to={`/place/${fest.slug}`}
                    className="group block p-2.5 rounded-2xl bg-stone-50/80 hover:bg-rose-50/50 border border-stone-200/70 hover:border-rose-300 transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={fest.image}
                        alt={fest.name}
                        className="w-12 h-12 rounded-xl object-cover border border-stone-200 group-hover:scale-105 transition-transform"
                        loading="lazy"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[9px] font-bold text-rose-700 uppercase tracking-wider bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200/60">
                            {lang === 'hi' ? fest.dateHi : fest.date}
                          </span>
                          <span className="text-[10px] font-medium text-stone-600 truncate">
                            {lang === 'hi' ? fest.badgeHi : fest.badge}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs text-stone-900 group-hover:text-rose-800 transition-colors mt-0.5 truncate">
                          {lang === 'hi' ? fest.nameHi : fest.name}
                        </h4>
                        <p className="text-[10px] text-stone-500 truncate">
                          📍 {lang === 'hi' ? fest.locationHi : fest.location}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-bold text-stone-900">
                      Visitor Feed
                    </h3>
                    <p className="text-[11px] text-stone-500">Live traveller photos & ratings</p>
                  </div>
                </div>

                <button
                  onClick={onOpenPostModal}
                  className="text-xs font-semibold text-heritage-600 hover:text-heritage-700 flex items-center gap-1"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Post</span>
                </button>
              </div>

              {/* Feed posts list */}
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                {feedPosts.length === 0 ? (
                  <p className="text-xs text-stone-400 text-center py-6">
                    No community posts yet. Be the first to share your visit photo!
                  </p>
                ) : (
                  feedPosts.map((post) => (
                    <div
                      key={post.id}
                      className="p-3.5 rounded-2xl bg-stone-50/80 border border-stone-100 space-y-2.5 transition-all hover:bg-stone-50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={post.user?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(post.user?.name || 'User')}`}
                            alt={post.user?.name}
                            className="w-7 h-7 rounded-full border border-stone-200 object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(post.user?.name || 'User')}`;
                            }}
                          />
                          <div>
                            <p className="text-xs font-bold text-stone-900 leading-tight">
                              {post.user?.name}
                            </p>
                            <p className="text-[10px] text-heritage-600 font-medium">
                              visited {post.place?.name}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-0.5 text-amber-500 text-xs font-bold">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{post.rating}</span>
                        </div>
                      </div>

                      {post.imageUrl && (
                        <div className="aspect-video rounded-xl overflow-hidden bg-stone-200">
                          <img
                            src={post.imageUrl}
                            alt={post.place?.name || "Visit moment"}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80';
                            }}
                          />
                        </div>
                      )}

                      {post.caption && (
                        <p className="text-xs text-stone-700 leading-relaxed italic">
                          "{post.caption}"
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Heritage Radar Widget */}
      {places.length > 0 && (
        <HeritageRadar
          nearestPlace={places[0]}
          userLocation={userLocation}
        />
      )}
    </div>
  );
}
