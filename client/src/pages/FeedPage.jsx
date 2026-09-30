import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { placeService, postService, getLocalCachedData, setLocalCachedData } from '../services/api';
import { FALLBACK_PLACES, FALLBACK_POSTS } from '../data/fallbackData';
import { getLiveLocation } from '../utils/geolocation';
import CultureCard from '../components/CultureCard';
import HeritageRadar from '../components/HeritageRadar';
import InstagramStoryBar from '../components/InstagramStoryBar';
import InstagramPostCard from '../components/InstagramPostCard';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
  Compass,
  MapPin,
  Search,
  Sparkles,
  RefreshCw,
  Star,
  Users,
  Camera,
  Calendar,
  Layers,
  Map as MapIcon,
  Flame,
  CheckCircle2,
  Filter,
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

const MONUMENT_FILTER_CHIPS = [
  { id: 'all', label: 'All Reviews', labelHi: 'सभी समीक्षाएं' },
  { id: 'my-posts', label: '👤 My Posts', labelHi: '👤 मेरी पोस्ट' },
  { id: 'taj-mahal', label: 'Taj Mahal', labelHi: 'ताज महल' },
  { id: 'varanasi-ghats', label: 'Varanasi', labelHi: 'वाराणसी घाट' },
  { id: 'amer-fort', label: 'Amer Fort', labelHi: 'आमेर किला' },
  { id: 'konark-sun-temple', label: 'Konark Temple', labelHi: 'कोणार्क मंदिर' },
  { id: 'group-of-monuments-at-hampi', label: 'Hampi Ruins', labelHi: 'हम्पी अवशेष' },
  { id: 'meenakshi-amman-temple', label: 'Meenakshi', labelHi: 'मीनाक्षी मंदिर' },
  { id: 'qutub-minar', label: 'Qutub Minar', labelHi: 'कुतुब मीनार' },
];

export default function FeedPage({ onOpenPostModal }) {
  const { lang, t } = useLanguage();
  const { user } = useAuth();

  // Instant load from cache (0ms first paint)
  const [places, setPlaces] = useState(() => getLocalCachedData('places', FALLBACK_PLACES));
  const [feedPosts, setFeedPosts] = useState(() => getLocalCachedData('feedPosts', FALLBACK_POSTS));
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' (Instagram Social Feed) | 'directory' (Monuments Directory)
  const [selectedMonument, setSelectedMonument] = useState('all');
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
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
    if (places.length === 0) setLoading(true);
    try {
      if (lat && lng) {
        const res = await placeService.getNearby(lat, lng, 2000);
        if (res.success) {
          let list = res.places;
          if (category !== 'all') {
            list = list.filter((p) => p.category === category);
          }
          setPlaces(list);
          setLocalCachedData('places', list);
        }
      } else {
        const res = await placeService.getAll({ category, search });
        if (res.success && res.places?.length > 0) {
          setPlaces(res.places);
          setLocalCachedData('places', res.places);
        }
      }
    } catch (e) {
      console.error('fetchPlaces error:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCommunityPosts = async (coords = null) => {
    try {
      const activeCoords = coords || userLocation;
      const params = {};
      if (activeCoords?.lat && activeCoords?.lng) {
        params.lat = activeCoords.lat;
        params.lng = activeCoords.lng;
      }
      if (activeCoords?.city) {
        params.city = activeCoords.city;
      }
      const res = await postService.getFeed(params);
      if (res.success && res.posts?.length > 0) {
        setFeedPosts(res.posts);
        setLocalCachedData('feedPosts', res.posts);
      }
    } catch (e) {
      console.error('fetchCommunityPosts error:', e);
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
    requestGeolocation();

    const handleFeedRefresh = () => {
      fetchCommunityPosts();
    };
    window.addEventListener('sanskriti_my_posts_changed', handleFeedRefresh);
    window.addEventListener('sanskriti_post_created', handleFeedRefresh);
    return () => {
      window.removeEventListener('sanskriti_my_posts_changed', handleFeedRefresh);
      window.removeEventListener('sanskriti_post_created', handleFeedRefresh);
    };
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (activeTab === 'directory') {
      fetchPlaces();
    }
  };

  const requestGeolocation = async () => {
    setLocating(true);
    setLocationStatus(lang === 'hi' ? 'निकटतम धरोहर स्थल खोजे जा रहे हैं...' : 'Finding nearest heritage sites...');

    try {
      const loc = await getLiveLocation();
      const coords = { lat: loc.lat, lng: loc.lng, city: loc.city || '' };
      setUserLocation(coords);
      if (loc.city) {
        setLocationStatus(lang === 'hi' ? `${loc.city} के निकट धरोहर स्थल` : `Heritage sites near ${loc.city}`);
      } else {
        setLocationStatus(lang === 'hi' ? 'आपकी लोकेशन के अनुसार धरोहर स्थल' : 'Heritage sites sorted by proximity');
      }
      fetchPlaces(coords.lat, coords.lng);
      fetchCommunityPosts(coords);
    } catch (err) {
      console.warn('Geolocation resolver notice:', err);
      setLocationStatus('');
    } finally {
      setLocating(false);
    }
  };

  // Filter community posts by monument chip and search query
  const filteredPosts = feedPosts.filter((post) => {
    let matchesMonument = true;
    if (selectedMonument === 'my-posts') {
      const myCreatedIds = (() => {
        try {
          return JSON.parse(localStorage.getItem('sanskriti_my_post_ids') || '[]');
        } catch {
          return [];
        }
      })();
      const isMine =
        (user && (post.userId === user.id || post.user?.id === user.id || (user.email && post.user?.email === user.email))) ||
        myCreatedIds.includes(post.id) ||
        myCreatedIds.includes(Number(post.id));
      matchesMonument = Boolean(isMine);
    } else if (selectedMonument !== 'all') {
      const postSlug = post.place?.slug || '';
      const postPlaceName = post.place?.name || '';
      matchesMonument =
        postSlug === selectedMonument ||
        postSlug.includes(selectedMonument) ||
        postPlaceName.toLowerCase().includes(selectedMonument.replace(/-/g, ' ').toLowerCase());
    }

    const matchesSearch =
      !search.trim() ||
      post.caption?.toLowerCase().includes(search.toLowerCase()) ||
      post.place?.name?.toLowerCase().includes(search.toLowerCase()) ||
      post.user?.name?.toLowerCase().includes(search.toLowerCase());

    return matchesMonument && matchesSearch;
  });

  return (
    <div className="min-h-screen pb-16">
      {/* Main Container with Instagram Stories & View Switcher */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-2 sm:pt-4 space-y-4 sm:space-y-6">
        {/* Instagram Heritage Story Reels (Horizontal Avatar Rings) */}
        <InstagramStoryBar onOpenPostModal={() => onOpenPostModal && onOpenPostModal()} />

        {/* View Mode Toggle: [ 📸 Instagram Social Feed ] vs [ 🏛️ Monuments Directory ] */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/95 backdrop-blur-md p-2 rounded-2xl shadow-md border border-stone-200">
          <div className="inline-flex p-1 rounded-xl bg-stone-100/90 gap-1 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('feed')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'feed'
                ? 'bg-gradient-to-r from-rose-600 via-amber-600 to-rose-600 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
                }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? '📸 सामुदायिक यात्रा फ़ीड (Instagram)' : '📸 Community Social Feed'}</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
                {feedPosts.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('directory')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'directory'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
                }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? '🏛️ स्मारक संदर्शिका' : '🏛️ Monuments Directory'}</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-stone-200 text-stone-700 text-[10px]">
                {places.length}
              </span>
            </button>
          </div>

          {/* Quick Map Link reminder */}
          <Link
            to="/map"
            className="flex items-center justify-center sm:justify-start gap-1.5 px-3 py-1.5 rounded-xl bg-heritage-50 hover:bg-heritage-100 text-heritage-800 text-xs font-semibold border border-heritage-200 transition-colors"
          >
            <MapIcon className="w-3.5 h-3.5 text-heritage-600" />
            <span>{lang === 'hi' ? 'सभी स्थल 2D मानचित्र पर देखें →' : 'View All Places on 2D Map →'}</span>
          </Link>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: INSTAGRAM-STYLE SOCIAL COMMUNITY FEED                               */}
        {/* ========================================================================= */}
        {activeTab === 'feed' && (
          <div className="space-y-6">
            {/* Monument Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1 pl-1 flex-shrink-0">
                <Filter className="w-3 h-3 text-stone-400" />
                <span>Filter:</span>
              </span>
              {MONUMENT_FILTER_CHIPS.map((chip) => (
                <button
                  key={chip.id}
                  onClick={() => setSelectedMonument(chip.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${selectedMonument === chip.id
                    ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-sm shadow-rose-500/20'
                    : 'bg-white text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-stone-200'
                    }`}
                >
                  {lang === 'hi' ? chip.labelHi : chip.label}
                </button>
              ))}
            </div>

            {/* Layout: Main Instagram Feed (Centered 2-cols or max-w-xl) + Right Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

              {/* Instagram Feed Column */}
              <div className="lg:col-span-2 space-y-6 max-w-xl mx-auto w-full">
                {/* "Share Your Visit Memory" Quick Creator Bar */}
                <div className="bg-white rounded-3xl border border-stone-200 p-3 sm:p-4 shadow-sm flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex-shrink-0">
                    <div className="w-full h-full rounded-full bg-white p-[1px] overflow-hidden">
                      <img
                        src={
                          user?.avatarUrl ||
                          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'Explorer')}`
                        }
                        alt="Your avatar"
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenPostModal && onOpenPostModal()}
                    className="flex-1 text-left px-4 py-2.5 rounded-full bg-stone-100 hover:bg-stone-200/70 text-stone-500 text-xs sm:text-sm font-medium transition-colors"
                  >
                    {lang === 'hi'
                      ? 'धरोहर यात्रा का अनुभव या फोटो साझा करें...'
                      : 'Share your visit moment, photo or review...'}
                  </button>

                  <button
                    onClick={() => onOpenPostModal && onOpenPostModal()}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 hover:opacity-95 text-white text-xs font-bold shadow-md shadow-rose-500/25 transition-all active:scale-95"
                  >
                    <Camera className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      {lang === 'hi' ? 'पोस्ट करें' : 'Post Review'}
                    </span>
                  </button>
                </div>

                {/* Posts Feed Stream */}
                {filteredPosts.length === 0 ? (
                  <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-stone-300 space-y-3">
                    <Camera className="w-12 h-12 text-stone-300 mx-auto" />
                    <h3 className="font-bold text-stone-700">No posts for this filter</h3>
                    <p className="text-xs text-stone-400 max-w-sm mx-auto">
                      Be the first heritage traveler to share a photo and review for this destination!
                    </p>
                    <button
                      onClick={() => onOpenPostModal && onOpenPostModal()}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-heritage-600 hover:bg-heritage-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Post Now</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6 sm:space-y-8">
                    {filteredPosts.map((post) => (
                      <InstagramPostCard
                        key={post.id}
                        post={post}
                        onPostDelete={(deletedId) => {
                          setFeedPosts((prev) => prev.filter((p) => p.id !== deletedId));
                        }}
                        onPostUpdate={(updatedPost) => {
                          setFeedPosts((prev) =>
                            prev.map((p) => (p.id === updatedPost.id ? { ...p, ...updatedPost } : p))
                          );
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* You're All Caught Up Banner */}
                {filteredPosts.length > 0 && (
                  <div className="py-8 text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-sm text-stone-800">
                      {lang === 'hi' ? 'आप सभी समीक्षाएं देख चुके हैं' : "You're All Caught Up"}
                    </h4>
                    <p className="text-xs text-stone-500">
                      {lang === 'hi'
                        ? 'अपनी अगली यात्रा की तस्वीरें व अनुभव जोड़ें!'
                        : 'Share your next journey moment or explore monuments on the 2D Map!'}
                    </p>
                  </div>
                )}
              </div>

              {/* Right Sidebar: Map Highlight & Festivals */}
              <div className="hidden lg:block space-y-6">
                {/* 2D Map Feature Card */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-900 to-stone-950 text-white p-5 border border-stone-800 shadow-lg">
                  <div className="relative z-10 space-y-3">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-heritage-500/20 border border-heritage-500/40 text-[10px] font-semibold text-heritage-300">
                      <MapPin className="w-3 h-3 text-rose-400" />
                      <span>Interactive 2D Geospatial Map</span>
                    </div>

                    <h3 className="font-serif text-lg font-bold">
                      Explore All Places on Live Map
                    </h3>

                    <p className="text-xs text-stone-300 leading-relaxed">
                      All 7+ iconic monuments, audio guides, radar navigation, and regional ODOP crafts are actively pinned on our 2D Map view.
                    </p>

                    <Link
                      to="/map"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-heritage-600 hover:bg-heritage-500 text-white text-xs font-semibold shadow-md shadow-heritage-600/30 transition-all hover:translate-x-1"
                    >
                      <MapIcon className="w-4 h-4" />
                      <span>Open Interactive 2D Map</span>
                    </Link>
                  </div>

                  <div className="absolute -bottom-6 -right-6 w-28 h-28 rounded-full bg-heritage-600/20 blur-2xl pointer-events-none" />
                </div>

                {/* Cultural Festivals & Events */}
                <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-3.5">
                  <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
                    <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-serif text-sm font-bold text-stone-900">
                        {lang === 'hi' ? 'आगामी सांस्कृतिक उत्सव' : 'Cultural Festivals & Events'}
                      </h3>
                      <p className="text-[10px] text-stone-500">
                        {lang === 'hi' ? 'जीवंत मेले, आरती व नृत्य उत्सव' : 'Living fairs, Aarti & dance utsavs'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {CULTURAL_FESTIVALS.map((fest) => (
                      <Link
                        key={fest.id}
                        to={`/place/${fest.slug}`}
                        className="group block p-2 rounded-2xl bg-stone-50/80 hover:bg-rose-50/50 border border-stone-200/70 hover:border-rose-300 transition-all"
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={fest.image}
                            alt={fest.name}
                            className="w-11 h-11 rounded-xl object-cover border border-stone-200 group-hover:scale-105 transition-transform"
                            loading="lazy"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-[9px] font-bold text-rose-700 uppercase tracking-wider bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200/60">
                              {lang === 'hi' ? fest.dateHi : fest.date}
                            </span>
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

                {/* Top Heritage Explorers */}
                <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                    <Flame className="w-4 h-4 text-amber-500" />
                    <h3 className="font-serif text-xs font-bold text-stone-900 uppercase tracking-wider">
                      Cultural Storytellers
                    </h3>
                  </div>

                  <div className="space-y-2.5">
                    {[
                      { name: 'Ananya Sharma', badge: 'Taj Heritage Chronicler', posts: '14 stories' },
                      { name: 'Rohan Mehra', badge: 'Varanasi Ghats Explorer', posts: '9 stories' },
                      { name: 'Karthik Rao', badge: 'Hampi Archaeology Guide', posts: '12 stories' },
                    ].map((exp, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <img
                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(exp.name)}`}
                            alt={exp.name}
                            className="w-7 h-7 rounded-full border border-stone-200"
                          />
                          <div>
                            <p className="font-bold text-stone-900">{exp.name}</p>
                            <p className="text-[10px] text-stone-500">{exp.badge}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold text-heritage-600 bg-heritage-50 px-2 py-0.5 rounded-full">
                          {exp.posts}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: MONUMENTS DIRECTORY GRID                                            */}
        {/* ========================================================================= */}
        {activeTab === 'directory' && (
          <div className="space-y-6">
            {/* Category Pills Bar */}
            <div className="bg-white/95 backdrop-blur-md p-2.5 rounded-2xl shadow-sm border border-stone-200 flex items-center gap-2 overflow-x-auto no-scrollbar">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${category === cat.id
                    ? 'bg-heritage-600 text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                    }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Places Grid Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl font-bold text-stone-900">
                  {userLocation
                    ? (lang === 'hi' ? 'निकटतम सांस्कृतिक धरोहर स्थल' : 'Closest Heritage Sites')
                    : (lang === 'hi' ? 'प्रमुख सांस्कृतिक धरोहर फ़ीड' : 'Featured Monuments')}
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  {lang === 'hi'
                    ? `पूरे भारत के ${places.length} प्रमुख सांस्कृतिक स्थल (मानचित्र पर भी उपलब्ध)`
                    : `Showing ${places.length} curated cultural heritage destinations across India (also live on Map)`}
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

            {/* Places Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {places.map((place) => (
                  <CultureCard key={place.id} place={place} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Heritage Radar Widget */}
      {places.length > 0 && (
        <HeritageRadar nearestPlace={places[0]} userLocation={userLocation} />
      )}
    </div>
  );
}
