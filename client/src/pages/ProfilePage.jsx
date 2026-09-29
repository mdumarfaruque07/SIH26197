import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import ReportIssueModal from '../components/ReportIssueModal';
import InstagramPostCard from '../components/InstagramPostCard';
import PostModal from '../components/PostModal';
import ServerConfigModal from '../components/ServerConfigModal';
import { postService } from '../services/api';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Languages,
  CheckCircle,
  Save,
  LogOut,
  Sparkles,
  Shield,
  ShoppingBag,
  Bookmark,
  Camera,
  Compass,
  ArrowRight,
  Settings,
  Bell,
  Volume2,
  LifeBuoy,
  HelpCircle,
  AlertCircle,
  AlertTriangle,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  RefreshCw,
  Server,
  Radio,
} from 'lucide-react';

const CULTURAL_AVATARS = [
  {
    id: 'explorer',
    name: 'Heritage Explorer',
    url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=180&q=80',
  },
  {
    id: 'dancer',
    name: 'Classical Artiste',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=180&q=80',
  },
  {
    id: 'scholar',
    name: 'Cultural Scholar',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=180&q=80',
  },
  {
    id: 'artisan',
    name: 'Master Weaver',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=180&q=80',
  },
  {
    id: 'traveler',
    name: 'Pan-India Nomad',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=180&q=80',
  },
  {
    id: 'maharaja',
    name: 'Royal Historian',
    url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=180&q=80',
  },
];

export default function ProfilePage() {
  const { user, updateProfile, logout, isGuest } = useAuth();
  const { lang, setLang, setSpecificLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'preferences') return 'preferences';
    if (tabParam === 'posts' || tabParam === 'my-posts') return 'posts';
    return 'profile';
  });
  const [saveSuccess, setSaveSuccess] = useState(false);

  // User posts state
  const [myPosts, setMyPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [postModalOpen, setPostModalOpen] = useState(false);

  // Support & Grievance states
  const [serverConfigOpen, setServerConfigOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(() => {
    return searchParams.get('report') === 'true';
  });
  const [showMyTickets, setShowMyTickets] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [myTickets, setMyTickets] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('sanskriti_support_tickets') || localStorage.getItem('sih_support_tickets') || '[]');
    } catch {
      return [];
    }
  });

  const handleTicketCreated = (newTicket) => {
    setMyTickets((prev) => [newTicket, ...prev]);
    setShowMyTickets(true);
  };

  const fetchUserPosts = async () => {
    setLoadingPosts(true);
    try {
      const res = await postService.getMyPosts();
      if (res.success && res.posts) {
        setMyPosts(res.posts);
      } else {
        const feedRes = await postService.getFeed();
        const myIds = JSON.parse(localStorage.getItem('sanskriti_my_post_ids') || '[]');
        if (feedRes.success && feedRes.posts) {
          const mine = feedRes.posts.filter(
            (p) =>
              (user && (p.userId === user.id || p.user?.id === user.id || (user.email && p.user?.email === user.email))) ||
              myIds.includes(p.id) ||
              myIds.includes(Number(p.id))
          );
          setMyPosts(mine);
        }
      }
    } catch (err) {
      console.warn('fetchUserPosts notice:', err);
      try {
        const feedRes = await postService.getFeed();
        const myIds = JSON.parse(localStorage.getItem('sanskriti_my_post_ids') || '[]');
        if (feedRes.success && feedRes.posts) {
          const mine = feedRes.posts.filter(
            (p) =>
              (user && (p.userId === user.id || p.user?.id === user.id)) ||
              myIds.includes(p.id) ||
              myIds.includes(Number(p.id))
          );
          setMyPosts(mine);
        }
      } catch {}
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    fetchUserPosts();
    const handlePostsChanged = () => {
      fetchUserPosts();
    };
    window.addEventListener('sanskriti_my_posts_changed', handlePostsChanged);
    window.addEventListener('sanskriti_post_created', handlePostsChanged);
    return () => {
      window.removeEventListener('sanskriti_my_posts_changed', handlePostsChanged);
      window.removeEventListener('sanskriti_post_created', handlePostsChanged);
    };
  }, [user]);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'preferences') {
      setActiveTab('preferences');
    } else if (tabParam === 'profile') {
      setActiveTab('profile');
    } else if (tabParam === 'posts' || tabParam === 'my-posts') {
      setActiveTab('posts');
    }
    if (searchParams.get('report') === 'true') {
      setActiveTab('preferences');
      setReportModalOpen(true);
    }
    if (searchParams.get('section') === 'support') {
      setActiveTab('preferences');
      setTimeout(() => {
        const el = document.getElementById('support-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  }, [searchParams]);

  // Form states
  const [name, setName] = useState(user?.name || 'Guest Tourist');
  const [email, setEmail] = useState(user?.email || 'explorer@sanskritikhoj.in');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [city, setCity] = useState(user?.city || 'Bhopal, Madhya Pradesh');
  const [bio, setBio] = useState(
    user?.bio || 'Enthusiastic explorer of Indian sacred temples, forts, folklore, and local ODOP handicraft guilds.'
  );
  const [selectedAvatar, setSelectedAvatar] = useState(
    user?.avatarUrl || CULTURAL_AVATARS[0].url
  );

  // Preference states
  const [audioGuideSpeed, setAudioGuideSpeed] = useState(() => {
    return localStorage.getItem('sanskriti_audio_speed') || localStorage.getItem('sih_audio_speed') || '1.0';
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    const saved = localStorage.getItem('sanskriti_radar_alerts') || localStorage.getItem('sih_radar_alerts');
    return saved !== null ? saved === 'true' : true;
  });
  const [offlineCacheActive, setOfflineCacheActive] = useState(() => {
    const saved = localStorage.getItem('sanskriti_offline_cache') || localStorage.getItem('sih_offline_cache');
    return saved !== null ? saved === 'true' : true;
  });

  const handleLanguageChange = (newLang) => {
    if (typeof setSpecificLanguage === 'function') {
      setSpecificLanguage(newLang);
    } else if (typeof setLang === 'function') {
      setLang(newLang);
    }
  };

  const handleSpeedChange = (spd) => {
    setAudioGuideSpeed(spd);
    localStorage.setItem('sanskriti_audio_speed', spd);
  };

  const handleToggleCache = () => {
    const nextVal = !offlineCacheActive;
    setOfflineCacheActive(nextVal);
    localStorage.setItem('sanskriti_offline_cache', String(nextVal));
  };

  const handleToggleNotifications = () => {
    const nextVal = !notificationsEnabled;
    setNotificationsEnabled(nextVal);
    localStorage.setItem('sanskriti_radar_alerts', String(nextVal));
  };

  // Activity stats
  const savedBookmarksCount = (() => {
    try {
      return JSON.parse(localStorage.getItem('heritage_bookmarks') || '[]').length;
    } catch {
      return 3;
    }
  })();

  const odopOrdersCount = (() => {
    try {
      return JSON.parse(localStorage.getItem('sanskriti_odop_orders') || localStorage.getItem('sih_odop_orders') || '[]').length;
    } catch {
      return 1;
    }
  })();

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateProfile({
      name,
      email,
      phone,
      city,
      bio,
      avatarUrl: selectedAvatar,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#fcfaf6] pb-24 pt-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Hero Header Card */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-stone-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar & Selector */}
            <div className="relative group">
              <img
                src={selectedAvatar}
                alt={name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-amber-400/60 shadow-lg shadow-black/40"
              />
              <span className="absolute -bottom-2 -right-2 p-1.5 rounded-xl bg-amber-600 text-white shadow-md">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* User Title & Info */}
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-bold uppercase tracking-wider">
                  {user?.role === 'admin' ? '🛡️ Government Admin' : isGuest ? 'Guest Explorer' : 'Verified Tourist'}
                </span>
              </div>

              <p className="text-xs text-stone-300 flex items-center justify-center sm:justify-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>{city}</span>
                <span>•</span>
                <Mail className="w-3.5 h-3.5 text-stone-400" />
                <span>{email}</span>
              </p>

              <p className="text-xs text-stone-400 italic max-w-xl line-clamp-2">
                "{bio}"
              </p>
            </div>

            {/* Logout Quick Button */}
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-red-500/20 hover:text-red-300 text-stone-300 border border-white/10 text-xs font-semibold transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'लॉगआउट' : 'Sign Out'}</span>
            </button>
          </div>

          {/* Real-time Activity Stats Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-white/10 text-center">
            <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10">
              <div className="font-serif text-xl sm:text-2xl font-bold text-amber-400">14</div>
              <div className="text-[10px] text-stone-400 uppercase font-semibold">
                {lang === 'hi' ? 'स्मारक उपलब्ध' : 'Heritage Sites'}
              </div>
            </div>

            <div
              onClick={() => setActiveTab('posts')}
              className={`p-2.5 rounded-2xl bg-white/5 border transition-all cursor-pointer ${
                activeTab === 'posts' ? 'border-amber-400 bg-white/10' : 'border-white/10 hover:border-amber-400/40'
              }`}
            >
              <div className="font-serif text-xl sm:text-2xl font-bold text-amber-400 flex items-center justify-center gap-1">
                <span>{myPosts.length}</span>
                <Camera className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-[10px] text-stone-400 uppercase font-semibold">
                {lang === 'hi' ? 'मेरी पोस्टें' : 'My Posts'}
              </div>
            </div>

            <div
              onClick={() => navigate('/bookmarks')}
              className="p-2.5 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-400/40 cursor-pointer transition-colors"
            >
              <div className="font-serif text-xl sm:text-2xl font-bold text-amber-400 flex items-center justify-center gap-1">
                <span>{savedBookmarksCount}</span>
                <Bookmark className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-[10px] text-stone-400 uppercase font-semibold">
                {lang === 'hi' ? 'सहेजी गई धरोहर' : 'Saved Bucket List'}
              </div>
            </div>

            <div
              onClick={() => navigate('/bazaar')}
              className="p-2.5 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-400/40 cursor-pointer transition-colors"
            >
              <div className="font-serif text-xl sm:text-2xl font-bold text-amber-400 flex items-center justify-center gap-1">
                <span>{odopOrdersCount}</span>
                <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-[10px] text-stone-400 uppercase font-semibold">
                {lang === 'hi' ? 'कारीगर ऑर्डर्स' : 'ODOP Orders'}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation: Edit Profile vs My Posts vs Preferences */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-stone-200/70 max-w-xl mx-auto">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'profile'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <User className="w-4 h-4 text-heritage-600" />
            <span className="hidden sm:inline">{lang === 'hi' ? 'व्यक्तिगत प्रोफ़ाइल' : 'Personal Profile'}</span>
            <span className="sm:hidden">{lang === 'hi' ? 'प्रोफ़ाइल' : 'Profile'}</span>
          </button>

          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'posts'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Camera className="w-4 h-4 text-rose-500" />
            <span>{lang === 'hi' ? 'मेरी पोस्टें' : 'My Posts'}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-700 text-[10px] font-extrabold">
              {myPosts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('preferences')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'preferences'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Settings className="w-4 h-4 text-heritage-600" />
            <span className="hidden sm:inline">{lang === 'hi' ? 'भाषा एवं सेटिंग्स' : 'Language & Settings'}</span>
            <span className="sm:hidden">{lang === 'hi' ? 'सेटिंग्स' : 'Settings'}</span>
          </button>
        </div>

        {/* Toast Alert */}
        {saveSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center justify-center gap-2 animate-fadeIn shadow-sm">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>
              {lang === 'hi'
                ? 'आपकी प्रोफ़ाइल और सेटिंग्स सफलतापूर्वक सहेज ली गई हैं!'
                : 'Profile and preferences successfully saved on-device!'}
            </span>
          </div>
        )}

        {/* TAB 1: EDIT PROFILE */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
            <div>
              <h2 className="font-serif text-xl font-bold text-stone-900">
                {lang === 'hi' ? 'प्रोफ़ाइल विवरण संपादित करें' : 'Edit Explorer Profile'}
              </h2>
              <p className="text-xs text-stone-500">
                {lang === 'hi'
                  ? 'अपनी जानकारी अद्यतन करें, जो यात्रा समीझाओं और स्थानीय बुकिंग में दिखेगी।'
                  : 'Update your personal details shown on community visitor reviews and regional itineraries.'}
              </p>
            </div>

            {/* Avatar Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-700">
                {lang === 'hi' ? 'सांस्कृतिक अवतार चुनें' : 'Choose Cultural Explorer Avatar'}
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {CULTURAL_AVATARS.map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setSelectedAvatar(av.url)}
                    className={`p-1 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 group ${
                      selectedAvatar === av.url
                        ? 'border-amber-600 bg-amber-50/60 scale-105 shadow-sm'
                        : 'border-stone-200 hover:border-stone-300 bg-stone-50'
                    }`}
                  >
                    <img
                      src={av.url}
                      alt={av.name}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                    <span className="text-[10px] font-semibold text-stone-700 truncate w-full text-center">
                      {av.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-stone-400" />
                    <span>{lang === 'hi' ? 'पूरा नाम' : 'Full Name'}</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-stone-400" />
                    <span>{lang === 'hi' ? 'ईमेल पता' : 'Email Address'}</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-stone-400" />
                    <span>{lang === 'hi' ? 'मोबाइल नंबर (वैकल्पिक)' : 'Mobile Phone (for ODOP Updates)'}</span>
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    <span>{lang === 'hi' ? 'गृह नगर / राज्य' : 'Home City & State'}</span>
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Bhopal, Madhya Pradesh"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">
                  {lang === 'hi' ? 'यात्री परिचय / बायो' : 'Traveler Bio & Cultural Interest'}
                </label>
                <textarea
                  rows="3"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share what eras, architectural styles, or handicrafts interest you..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-heritage-600 hover:bg-heritage-700 text-white text-xs font-bold shadow-md shadow-heritage-600/20 transition-all active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>{lang === 'hi' ? 'प्रोफ़ाइल सहेजें' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: PREFERENCES & SETTINGS */}
        {activeTab === 'preferences' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
            <div>
              <h2 className="font-serif text-xl font-bold text-stone-900">
                {lang === 'hi' ? 'ऐप प्राथमिकताएं एवं सेटिंग्स' : 'Language & Experience Preferences'}
              </h2>
              <p className="text-xs text-stone-500">
                {lang === 'hi'
                  ? 'अपनी पसंदीदा भाषा, ऑडियो गाइड की गति, एवं ऑफ़लाइन डेटा सेटिंग्स प्रबंधित करें।'
                  : 'Control your application language, speech narration rate, and offline sync parameters.'}
              </p>
            </div>

            {/* Language Selection Card */}
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-3">
              <div className="flex items-center gap-2">
                <Languages className="w-4 h-4 text-amber-700" />
                <h3 className="font-bold text-xs text-amber-950">
                  {lang === 'hi' ? 'एप्लिकेशन भाषा (App Language)' : 'Preferred Application Language'}
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  id="profile-lang-btn-hi"
                  onClick={() => handleLanguageChange('hi')}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                    lang === 'hi'
                      ? 'border-amber-600 bg-white shadow-sm ring-2 ring-amber-500/20'
                      : 'border-stone-200 bg-white/70 hover:bg-white text-stone-700'
                  }`}
                >
                  <div>
                    <div className="font-bold text-xs text-stone-900">🇮🇳 हिन्दी (Hindi)</div>
                    <div className="text-[10px] text-stone-500">
                      {lang === 'hi' ? 'सक्रिय इंटरफ़ेस' : 'राष्ट्रीय भाषा इंटरफ़ेस'}
                    </div>
                  </div>
                  {lang === 'hi' && <CheckCircle className="w-4 h-4 text-amber-600 shrink-0" />}
                </button>

                <button
                  type="button"
                  id="profile-lang-btn-en"
                  onClick={() => handleLanguageChange('en')}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                    lang === 'en'
                      ? 'border-amber-600 bg-white shadow-sm ring-2 ring-amber-500/20'
                      : 'border-stone-200 bg-white/70 hover:bg-white text-stone-700'
                  }`}
                >
                  <div>
                    <div className="font-bold text-xs text-stone-900">🇬🇧 English</div>
                    <div className="text-[10px] text-stone-500">
                      {lang === 'hi' ? 'वैश्विक पर्यटक भाषा' : 'Global tourist interface'}
                    </div>
                  </div>
                  {lang === 'en' && <CheckCircle className="w-4 h-4 text-amber-600 shrink-0" />}
                </button>
              </div>
            </div>

            {/* Audio Guide Narration Speed */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-heritage-600" />
                  <span className="font-bold text-xs text-stone-900">
                    {lang === 'hi' ? 'ऑडियो गाइड आवाज़ की गति' : 'Audio Guide Narration Speed'}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-heritage-600">{audioGuideSpeed}x</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {['0.8', '1.0', '1.25'].map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => handleSpeedChange(spd)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      audioGuideSpeed === spd
                        ? 'border-heritage-600 bg-heritage-50 text-heritage-800 shadow-sm'
                        : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    {spd === '1.0' ? `${spd}x (Normal)` : `${spd}x`}
                  </button>
                ))}
              </div>
            </div>

            {/* Offline Cache & Notifications */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 border border-stone-200 gap-4">
                <div className="space-y-0.5 min-w-0 pr-2">
                  <div className="font-bold text-xs text-stone-900">
                    {lang === 'hi' ? 'ऑफ़लाइन हेरिटेज डेटा संग्रह' : 'On-Device Offline Cache'}
                  </div>
                  <div className="text-[11px] text-stone-500">
                    {lang === 'hi'
                      ? 'बिना इंटरनेट 14 स्मारकों के ऑडियो गाइड व मानचित्र सहेजें'
                      : 'Pre-cache 14 heritage monument narratives for network-free exploration'}
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  id="toggle-offline-cache"
                  aria-checked={offlineCacheActive}
                  onClick={handleToggleCache}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    offlineCacheActive ? 'bg-emerald-600' : 'bg-stone-300'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      offlineCacheActive ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 border border-stone-200 gap-4">
                <div className="space-y-0.5 min-w-0 pr-2">
                  <div className="font-bold text-xs text-stone-900">
                    {lang === 'hi' ? 'धरोहर रडार सूचनाएं' : 'Nearby Monument Radar Alerts'}
                  </div>
                  <div className="text-[11px] text-stone-500">
                    {lang === 'hi'
                      ? 'जब आप किसी राष्ट्रीय स्मारक के 5 किमी के दायरे में हों तब अलर्ट प्राप्त करें'
                      : 'Notify when entering within 5 km proximity of an ASI recognized heritage site'}
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  id="toggle-radar-alerts"
                  aria-checked={notificationsEnabled}
                  onClick={handleToggleNotifications}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    notificationsEnabled ? 'bg-heritage-600' : 'bg-stone-300'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Live Server & Cloudflare Remote Sync */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/80 via-orange-50/40 to-stone-50 border border-amber-200/90 shadow-2xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-amber-600 text-white shadow-xs shrink-0">
                      <Server className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs text-stone-900">
                          {lang === 'hi' ? 'लाइव सर्वर एवं क्लाउडफ्लेयर सिंक' : 'Live Database & Cloudflare Sync'}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {lang === 'hi' ? 'रिमोट टेस्टिंग' : 'Remote Live Testing'}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        {lang === 'hi'
                          ? 'किसी भी टेस्टर के फोन में लाइव डेटाबेस सिंक करने हेतु Cloudflare Tunnel लिंक या लैपटॉप IP जोड़ें।'
                          : 'Connect live MySQL database across different Wi-Fi networks anywhere via Cloudflare Tunnel URL.'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setServerConfigOpen(true)}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 active:scale-95 text-white text-xs font-bold shadow-xs transition-all shrink-0 cursor-pointer"
                  >
                    <Radio className="w-3.5 h-3.5 text-amber-300" />
                    <span>{lang === 'hi' ? 'सर्वर लिंक बदलें' : 'Configure Server'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Help, Support & Citizen Grievance Portal */}
            <div id="support-section" className="p-5 rounded-3xl bg-gradient-to-br from-amber-50/70 via-stone-50 to-orange-50/40 border border-amber-200/90 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-2xl bg-amber-600 text-white shadow-xs flex-shrink-0">
                    <LifeBuoy className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 bg-amber-200/70 px-2 py-0.5 rounded-md">
                        24x7 Support Desk
                      </span>
                      {myTickets.length > 0 && (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                          {myTickets.length} {lang === 'hi' ? 'दर्ज टिकट' : 'Tickets'}
                        </span>
                      )}
                    </div>
                    <h3 className="font-serif text-sm sm:text-base font-bold text-stone-900 mt-1">
                      {lang === 'hi' ? 'नागरिक सहायता एवं शिकायत निवारण' : 'Help & Citizen Grievance Desk'}
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {lang === 'hi'
                        ? 'ऐप बग, स्मारक की गलत जानकारी, कारीगर ऑर्डर या किसी भी समस्या की तुरंत रिपोर्ट करें।'
                        : 'Report bugs, incorrect monument lore, artisan orders, or reach 24x7 tourist helplines.'}
                    </p>
                  </div>
                </div>

                {/* Primary Action Button */}
                <button
                  type="button"
                  id="open-report-issue-btn"
                  onClick={() => setReportModalOpen(true)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 active:scale-98 text-white text-xs font-bold shadow-md shadow-amber-700/20 transition-all cursor-pointer flex-shrink-0"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>{lang === 'hi' ? 'समस्या या सुझाव दर्ज करें' : 'Report an Issue'}</span>
                </button>
              </div>

              {/* National Helplines Quick Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <a
                  href="tel:1363"
                  className="p-3 rounded-2xl bg-white border border-stone-200/80 hover:border-emerald-300 hover:shadow-xs transition-all flex items-center gap-2.5 group cursor-pointer"
                >
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors flex-shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] text-stone-500 uppercase font-semibold">
                      {lang === 'hi' ? 'पर्यटन हेल्पलाइन' : 'Tourist Helpline'}
                    </div>
                    <div className="text-xs font-bold text-stone-900 group-hover:text-emerald-700 font-mono">
                      1363 <span className="text-[9px] font-sans font-normal text-stone-500">(12 Langs)</span>
                    </div>
                  </div>
                </a>

                <a
                  href="tel:112"
                  className="p-3 rounded-2xl bg-white border border-stone-200/80 hover:border-red-300 hover:shadow-xs transition-all flex items-center gap-2.5 group cursor-pointer"
                >
                  <div className="p-2 rounded-xl bg-red-50 text-red-700 group-hover:bg-red-600 group-hover:text-white transition-colors flex-shrink-0">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] text-stone-500 uppercase font-semibold">
                      {lang === 'hi' ? 'आपातकालीन सेवा' : 'National Emergency'}
                    </div>
                    <div className="text-xs font-bold text-stone-900 group-hover:text-red-700 font-mono">
                      112 <span className="text-[9px] font-sans font-normal text-stone-500">(Police/Medical)</span>
                    </div>
                  </div>
                </a>

                <a
                  href="mailto:support@sanskritikhoj.in"
                  className="p-3 rounded-2xl bg-white border border-stone-200/80 hover:border-blue-300 hover:shadow-xs transition-all flex items-center gap-2.5 group cursor-pointer"
                >
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition-colors flex-shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 truncate">
                    <div className="text-[10px] text-stone-500 uppercase font-semibold">
                      {lang === 'hi' ? 'सहायता ईमेल' : 'Support Email'}
                    </div>
                    <div className="text-xs font-bold text-stone-900 group-hover:text-blue-700 truncate font-mono">
                      support@sanskritikhoj.in
                    </div>
                  </div>
                </a>
              </div>

              {/* My Reported Tickets Section */}
              {myTickets.length > 0 && (
                <div className="pt-2 border-t border-amber-200/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-amber-700" />
                      <span>{lang === 'hi' ? 'मेरी दर्ज की गई शिकायतें (My Tickets)' : 'My Reported Tickets'}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowMyTickets(!showMyTickets)}
                      className="text-[11px] text-amber-800 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>{showMyTickets ? (lang === 'hi' ? 'छिपाएं' : 'Hide') : (lang === 'hi' ? 'देखें' : 'View All')}</span>
                      {showMyTickets ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>

                  {showMyTickets && (
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1 animate-fadeIn">
                      {myTickets.map((tkt, idx) => (
                        <div
                          key={tkt.id || idx}
                          className="p-3 rounded-2xl bg-white border border-stone-200 text-xs space-y-1.5 shadow-2xs"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded-md text-[11px]">
                              {tkt.id}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              {lang === 'hi' ? tkt.statusHi || 'समीक्षाधीन' : tkt.status || 'Under Review'}
                            </span>
                          </div>
                          <div className="font-semibold text-stone-800 truncate">{tkt.subject}</div>
                          <p className="text-[11px] text-stone-500 line-clamp-2">{tkt.description}</p>
                          <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1 border-t border-stone-100">
                            <span>{new Date(tkt.createdAt || Date.now()).toLocaleDateString()}</span>
                            <span>SLA: {tkt.resolutionEstimate || '24-48 Hours'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Quick FAQs Accordion */}
              <div className="pt-2 border-t border-amber-200/60 space-y-2">
                <div className="text-xs font-bold text-stone-800">
                  {lang === 'hi' ? 'सामान्य प्रश्न (Quick FAQs)' : 'Frequently Asked Questions'}
                </div>
                <div className="space-y-1.5">
                  {[
                    {
                      qEn: 'How to report fake handicrafts or delayed deliveries?',
                      qHi: 'नकली हस्तशिल्प या डिलीवरी में देरी की शिकायत कैसे करें?',
                      aEn: 'Click "Report an Issue" above, select "Artisan / ODOP Order Issue", and enter your Order ID. Our artisan grievance cell mediates directly with the guild.',
                      aHi: 'ऊपर "समस्या दर्ज करें" पर क्लिक करें, "कारीगर या ऑर्डर संबंधी" चुनें और अपना ऑर्डर आईडी दर्ज करें।',
                    },
                    {
                      qEn: 'How to listen to audio narration offline?',
                      qHi: 'बिना इंटरनेट के ऑडियो गाइड कैसे सुनें?',
                      aEn: 'Ensure "On-Device Offline Cache" toggle is ON. The app automatically caches audio narrations for 14 major heritage monuments.',
                      aHi: 'ऊपर दिए गए "ऑफ़लाइन हेरिटेज डेटा संग्रह" को चालू रखें। ऐप 14 प्रमुख स्मारकों के ऑडियो गाइड को फोन में स्वतः सहेज लेता है।',
                    },
                    {
                      qEn: 'Can I propose a new cultural site or festival?',
                      qHi: 'क्या मैं किसी नए ऐतिहासिक स्थल या मेले का प्रस्ताव दे सकता हूँ?',
                      aEn: 'Yes! Select "Feedback & Suggestions", provide the monument name, state, and folklore. Our historians review submissions bi-weekly.',
                      aHi: 'हाँ! "सुझाव या नया प्रस्ताव" चुनें और स्मारक का नाम, राज्य व विवरण भेजें।',
                    },
                  ].map((faq, fIdx) => {
                    const isOpen = expandedFaq === fIdx;
                    return (
                      <div
                        key={fIdx}
                        className="rounded-xl border border-stone-200/80 bg-white/80 overflow-hidden text-xs"
                      >
                        <button
                          type="button"
                          onClick={() => setExpandedFaq(isOpen ? null : fIdx)}
                          className="w-full p-2.5 flex items-center justify-between text-left font-semibold text-stone-800 hover:bg-stone-50 cursor-pointer"
                        >
                          <span className="pr-2">{lang === 'hi' ? faq.qHi : faq.qEn}</span>
                          {isOpen ? <ChevronUp className="w-3.5 h-3.5 shrink-0 text-amber-700" /> : <ChevronDown className="w-3.5 h-3.5 shrink-0 text-stone-400" />}
                        </button>
                        {isOpen && (
                          <div className="px-3 pb-2.5 text-[11px] text-stone-600 bg-stone-50/50 border-t border-stone-100">
                            {lang === 'hi' ? faq.aHi : faq.aEn}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MY POSTS (📸 मेरी पोस्टें एवं समीक्षाएं) */}
        {activeTab === 'posts' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-xl font-bold text-stone-900">
                    {lang === 'hi' ? 'मेरी धरोहर पोस्टें एवं समीक्षाएं' : 'My Shared Posts & Reviews'}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                    {myPosts.length} {lang === 'hi' ? 'पोस्ट' : myPosts.length === 1 ? 'Post' : 'Posts'}
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-1">
                  {lang === 'hi'
                    ? 'यहाँ आपकी सभी साझा की गई तस्वीरें व समीक्षाएं हैं। आप 3-डॉट्स (...) मेनू से उन्हें संशोधित या हटा सकते हैं।'
                    : 'Manage your visitor reviews, ratings and travel captures. Click the 3-dots (...) menu on any post to edit caption/rating or delete.'}
                </p>
              </div>

              <button
                onClick={() => setPostModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 hover:opacity-95 text-white text-xs font-bold shadow-md shadow-rose-500/25 transition-all active:scale-95"
              >
                <Camera className="w-4 h-4" />
                <span>{lang === 'hi' ? 'नई पोस्ट साझा करें' : 'Create New Post'}</span>
              </button>
            </div>

            {loadingPosts ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-stone-200">
                <RefreshCw className="w-8 h-8 text-rose-500 animate-spin mx-auto mb-2" />
                <p className="text-xs text-stone-500 font-medium">
                  {lang === 'hi' ? 'आपकी पोस्टें लोड हो रही हैं...' : 'Loading your posts from database...'}
                </p>
              </div>
            ) : myPosts.length === 0 ? (
              <div className="p-12 sm:p-16 text-center bg-white rounded-3xl border border-dashed border-stone-300 space-y-4 shadow-sm">
                <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto border border-rose-200">
                  <Camera className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-lg font-bold text-stone-800">
                    {lang === 'hi' ? 'आपने अभी तक कोई पोस्ट साझा नहीं की है' : 'No Posts Shared Yet'}
                  </h3>
                  <p className="text-xs text-stone-500 max-w-md mx-auto">
                    {lang === 'hi'
                      ? 'ताजमहल, वाराणसी, हम्पी या अन्य किसी भी धरोहर स्थल की अपनी पसंदीदा तस्वीर व अनुभव साझा करें!'
                      : 'Capture and share your memorable visit photos, ratings, and cultural reviews for Taj Mahal, Varanasi, Hampi, and beyond!'}
                  </p>
                </div>
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => setPostModalOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rose-500 to-amber-500 hover:opacity-95 text-white rounded-2xl text-xs font-bold shadow-md shadow-rose-500/25 transition-all"
                  >
                    <Camera className="w-4 h-4" />
                    <span>{lang === 'hi' ? 'पहला अनुभव पोस्ट करें' : 'Post Your First Review'}</span>
                  </button>
                  <button
                    onClick={() => navigate('/feed')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-2xl text-xs font-bold transition-all"
                  >
                    <span>{lang === 'hi' ? 'सामुदायिक फ़ीड देखें' : 'Explore Community Feed'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6 max-w-xl mx-auto">
                {myPosts.map((post) => (
                  <InstagramPostCard
                    key={post.id}
                    post={post}
                    onPostDelete={(deletedId) => {
                      setMyPosts((prev) => prev.filter((p) => p.id !== deletedId));
                    }}
                    onPostUpdate={(updatedPost) => {
                      setMyPosts((prev) =>
                        prev.map((p) => (p.id === updatedPost.id ? { ...p, ...updatedPost } : p))
                      );
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Post Modal for Creating New Post from Profile */}
      <PostModal
        isOpen={postModalOpen}
        onClose={() => setPostModalOpen(false)}
        onPostCreated={() => {
          fetchUserPosts();
        }}
      />

      {/* Report Issue Modal */}
      <ReportIssueModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        onTicketCreated={handleTicketCreated}
      />

      {/* Server & Cloudflare Configuration Modal */}
      <ServerConfigModal
        isOpen={serverConfigOpen}
        onClose={() => setServerConfigOpen(false)}
      />
    </div>
  );
}
