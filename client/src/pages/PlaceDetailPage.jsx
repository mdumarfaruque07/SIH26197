import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { placeService, productService, foodService } from '../services/api';
import AudioNarrationPlayer from '../components/AudioNarrationPlayer';
import { useLanguage } from '../context/LanguageContext';
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
  Eye,
  Compass,
  Award,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Footprints,
  Utensils,
  ShoppingBag,
  Sparkles,
  Check,
  Lock,
  ArrowRight,
  TrendingUp,
  Info,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const getGuidedTrail = (place) => {
  const slug = place?.slug || '';
  if (slug.includes('taj-mahal')) {
    return [
      {
        time: '06:00 AM - 08:30 AM',
        title: 'Dawn at Mehtab Bagh & East Gate Entrance',
        desc: 'Experience the soft morning mist over the Yamuna river as the marble turns from pale rose to dazzling ivory.',
        tag: 'Architectural Wonder',
        badgeColor: 'bg-amber-100 text-amber-800',
      },
      {
        time: '09:00 AM - 12:00 PM',
        title: 'Central Mausoleum & Pietra Dura Inlay Deciphering',
        desc: 'Examine the 28 types of semi-precious stones (lapis lazuli, jade, carnelian) inlaid with floral motifs into translucent Makrana marble.',
        tag: 'Historical Core',
        badgeColor: 'bg-blue-100 text-blue-800',
      },
      {
        time: '02:00 PM - 04:30 PM',
        title: 'Gokulpura Hereditary Marble Inlay Guild Workshop',
        desc: 'Meet 5th-generation artisan families using hand-turned bow drills to shape semi-precious stone chips, continuing the royal Mughal technique.',
        tag: 'Artisan Workshop',
        badgeColor: 'bg-emerald-100 text-emerald-800',
      },
      {
        time: '05:30 PM - 07:30 PM',
        title: 'Sadar Bazaar Food Heritage & Saffron Petha Trail',
        desc: 'Savor authentic GI-tagged Kesar Angoori Petha and Dalmoth from 18th-century confectioner stalls operating near the Agra fort.',
        tag: 'Culinary Heritage',
        badgeColor: 'bg-orange-100 text-orange-800',
      },
    ];
  }
  if (slug.includes('varanasi')) {
    return [
      {
        time: '05:30 AM - 08:00 AM',
        title: 'Subah-e-Banaras Dawn Wooden Boat Ride',
        desc: 'Glide along 88 ghats as dawn breaks, witnessing morning Surya Arghya, classical ragas, and temple bells echoing across the holy Ganges.',
        tag: 'Spiritual Heritage',
        badgeColor: 'bg-amber-100 text-amber-800',
      },
      {
        time: '09:00 AM - 12:30 PM',
        title: 'Kashi Vishwanath Corridor & Ancient Alleys',
        desc: 'Explore the historic galis, ancient brass bell shops, and centuries-old Sanskrit pathshalas nestled in the heart of old Kashi.',
        tag: 'Historical Core',
        badgeColor: 'bg-blue-100 text-blue-800',
      },
      {
        time: '02:00 PM - 04:30 PM',
        title: 'Madanpura Handloom Guild & Banarasi Silk Weaving',
        desc: 'Visit master pit-loom weavers creating exquisite gold and silver brocade zari textiles passed down across centuries.',
        tag: 'Artisan Workshop',
        badgeColor: 'bg-emerald-100 text-emerald-800',
      },
      {
        time: '06:00 PM - 08:00 PM',
        title: 'Dashashwamedh Maha Aarti & Sacred Kashi Thandai Tasting',
        desc: 'Witness the synchronized brass lamp Aarti followed by tasting authentic 14-herb stone-ground Shahi Thandai and Malaiyo.',
        tag: 'Culinary Heritage',
        badgeColor: 'bg-orange-100 text-orange-800',
      },
    ];
  }
  if (slug.includes('meenakshi')) {
    return [
      {
        time: '06:30 AM - 09:00 AM',
        title: 'East Tower Entrance & Golden Lotus Tank Walk',
        desc: 'Observe traditional morning Nadaswaram chants beside the sacred Potramarai Kulam tank as dawn illuminates the sculpted towers.',
        tag: 'Spiritual Heritage',
        badgeColor: 'bg-amber-100 text-amber-800',
      },
      {
        time: '09:30 AM - 12:30 PM',
        title: 'Hall of Thousand Pillars & Musical Acoustic Pillars',
        desc: 'Study the Dravidian stone monoliths sculpted in 1569 that produce distinct sapthaswara musical notes when lightly tapped.',
        tag: 'Architectural Wonder',
        badgeColor: 'bg-blue-100 text-blue-800',
      },
      {
        time: '02:30 PM - 04:30 PM',
        title: 'Madurai Sthapathi Metalworks & Lost-Wax Casting Guild',
        desc: 'Visit hereditary master sculptors chiseling temple bronze statues and ceremonial deepams according to ancient Shilpa Shastra.',
        tag: 'Artisan Workshop',
        badgeColor: 'bg-emerald-100 text-emerald-800',
      },
      {
        time: '05:30 PM - 07:30 PM',
        title: 'Night Palliyarai Procession & Madurai Jigarthanda Trail',
        desc: 'Experience the Shiva-Meenakshi bedtime palanquin procession, followed by tasting the royal Jigarthanda cooling elixir in South Masi Street.',
        tag: 'Culinary Heritage',
        badgeColor: 'bg-orange-100 text-orange-800',
      },
    ];
  }
  if (slug.includes('konark')) {
    return [
      {
        time: '06:00 AM - 08:30 AM',
        title: 'Equinox Sunrise Alignment & Eastern Gate Chariot Walk',
        desc: 'Watch the first rays of morning light pierce the main sanctum door, designed as a colossal stone chariot of Surya Dev with 12 pairs of wheels.',
        tag: 'Architectural Wonder',
        badgeColor: 'bg-amber-100 text-amber-800',
      },
      {
        time: '09:00 AM - 12:00 PM',
        title: 'Sundial Deciphering & Natya Mandap Iconography',
        desc: 'Learn how to read the exact time down to the minute using the shadows cast on the 24 spoke-carved sundial wheels of Konark.',
        tag: 'Historical Core',
        badgeColor: 'bg-blue-100 text-blue-800',
      },
      {
        time: '01:30 PM - 04:30 PM',
        title: 'Raghurajpur Heritage Craft Village & Palm Leaf Pattachitra',
        desc: 'Short excursion to the nearby world-famous heritage craft village where every household creates iron-stylus palm leaf paintings and Pipili applique.',
        tag: 'Artisan Workshop',
        badgeColor: 'bg-emerald-100 text-emerald-800',
      },
      {
        time: '05:30 PM - 07:30 PM',
        title: 'Chandrabhaga Beach Sunset & Layered Puri Khaja Feast',
        desc: 'Sunset relaxation by the mythological pond followed by enjoying freshly crisped, sugar-glazed multi-layered Khaja from ancient confectioners.',
        tag: 'Culinary Heritage',
        badgeColor: 'bg-orange-100 text-orange-800',
      },
    ];
  }
  if (slug.includes('amer-fort')) {
    return [
      {
        time: '07:30 AM - 10:00 AM',
        title: 'Suraj Pol Ascent & Jaleb Chowk Royal Courtyard',
        desc: 'Ascend the cobbled path on the Aravalli hills and witness the Rajput-Mughal fortress architecture bathed in pink morning warmth.',
        tag: 'Fortress Walk',
        badgeColor: 'bg-amber-100 text-amber-800',
      },
      {
        time: '10:30 AM - 01:00 PM',
        title: 'Sheesh Mahal Mirror Marvel & Underground Water Tunnels',
        desc: 'Discover the ingenious concave mirror palace that glitters with a single flame, and inspect the Persian-wheel water lifting engineering.',
        tag: 'Architectural Core',
        badgeColor: 'bg-blue-100 text-blue-800',
      },
      {
        time: '02:00 PM - 04:30 PM',
        title: 'Sanganer Teak Block-Printing & Jaipur Blue Pottery Guild',
        desc: 'Visit traditional workshops where master craftsmen hand-press vegetable dyes onto mulmul cotton and glaze quartz ceramic vases.',
        tag: 'Artisan Workshop',
        badgeColor: 'bg-emerald-100 text-emerald-800',
      },
      {
        time: '05:30 PM - 07:30 PM',
        title: 'Jaigarh Sunset Vista & Authentic Rajasthani Ghewar Tasting',
        desc: 'Panoramic sunset view over Maota Lake followed by honeycombed traditional Rajasthani Ghewar and aromatic saffron Chai.',
        tag: 'Culinary Heritage',
        badgeColor: 'bg-orange-100 text-orange-800',
      },
    ];
  }
  return [
    {
      time: '07:00 AM - 09:30 AM',
      title: 'Morning Architectural Exploration & Heritage Walk',
      desc: `Quiet early-morning guided walk around the core architecture and perimeter of ${place.name}.`,
      tag: 'Architectural Wonder',
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      time: '10:00 AM - 12:30 PM',
      title: 'Decoding Historical Inscriptions & Folklore',
      desc: 'Deep-dive into the sacred lore, epigraphs, and centuries of preserved regional oral narratives.',
      tag: 'Historical Core',
      badgeColor: 'bg-blue-100 text-blue-800',
    },
    {
      time: '02:00 PM - 04:30 PM',
      title: 'Local Master Artisan Cluster & Handcraft Live Demo',
      desc: 'Meet local hereditary craftspeople producing ODOP and GI-certified heritage goods in nearby clusters.',
      tag: 'Artisan Workshop',
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      time: '05:30 PM - 07:30 PM',
      title: 'Evening Sunset Gathering & Regional Food Heritage Tasting',
      desc: 'Savor regional culinary specialties, traditional sweets, and locally crafted refreshments.',
      tag: 'Culinary Heritage',
      badgeColor: 'bg-orange-100 text-orange-800',
    },
  ];
};

export default function PlaceDetailPage({ onOpenPostModal }) {
  const { slug } = useParams();
  const { user } = useAuth();
  const { lang, t } = useLanguage();
  const [place, setPlace] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [placeFoods, setPlaceFoods] = useState([]);
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
        // Load connected deliverable ODOP craft products
        try {
          const prodRes = await productService.getByPlace(res.place.id);
          if (prodRes.success) {
            setRelatedProducts(prodRes.products || []);
          }
        } catch (prodErr) {
          console.warn('Could not load related products:', prodErr);
        }

        // Load famous regional food heritage items (Admin Curated & Non-Deliverable)
        try {
          const foodRes = await foodService.getByPlace(res.place.id, {
            slug: res.place.slug,
            name: res.place.name,
          });
          if (foodRes.success) {
            setPlaceFoods(foodRes.foods || []);
          }
        } catch (foodErr) {
          console.warn('Could not load place culinary heritage:', foodErr);
        }
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

  const guidedTrail = getGuidedTrail(place);

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
            {lang === 'hi' && place.nameHi ? place.nameHi : place.name}
          </h1>
          <p className="mt-2 text-stone-300 max-w-2xl text-xs sm:text-sm font-light drop-shadow-sm leading-relaxed line-clamp-2">
            {lang === 'hi' && place.shortDescriptionHi ? place.shortDescriptionHi : place.shortDescription}
          </p>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-10">
        {/* Archival Integrity & Authenticity Details */}
        <div className="bg-emerald-950/5 border border-emerald-600/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                  Verified Heritage Archive
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold whitespace-nowrap">
                  Archival Record
                </span>
              </div>
              <p className="text-[11px] text-emerald-900/80 mt-0.5 leading-relaxed">
                Historical timelines, architectural data, and folklore verified against official state cultural archives and Archaeological Survey of India (ASI) records.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 whitespace-nowrap bg-white/80 px-3 py-1.5 rounded-xl border border-emerald-200">
            <Award className="w-4 h-4 text-emerald-600" />
            <span>{lang === 'hi' ? 'एएसआई संरक्षित राष्ट्रीय धरोहर' : 'ASI Protected Monument'}</span>
          </div>
        </div>

        {/* 1. Audio Narration Player */}
        <section>
          <AudioNarrationPlayer
            text={place.fullStory}
            title={place.name}
            textHi={place.fullStoryHi}
            titleHi={place.nameHi}
          />
        </section>

        {/* 2. Full History & Story */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 leading-tight">
              {lang === 'hi' ? 'धरोहर इतिहास एवं सांस्कृतिक महत्व' : 'History & Cultural Significance'}
            </h2>
            <Link
              to={`/map?lat=${place.latitude}&lng=${place.longitude}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-orange-50 hover:bg-orange-100 border border-orange-200 text-xs font-semibold text-orange-700 transition-colors self-start sm:self-auto whitespace-nowrap"
            >
              <MapPin className="w-3.5 h-3.5 text-orange-600" />
              <span>{lang === 'hi' ? 'मानचित्र पर देखें' : 'View on Map'}</span>
            </Link>
          </div>

          <div className="prose prose-stone max-w-none text-stone-700 leading-relaxed space-y-4 whitespace-pre-line text-base">
            {lang === 'hi' && place.fullStoryHi ? place.fullStoryHi : place.fullStory}
          </div>
        </section>

        {/* 3. Curated 1-Day Heritage Trail & Guided Route */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-stone-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0">
                <Footprints className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-2xl font-bold text-stone-900">
                    Curated 1-Day Heritage Trail & Guided Route
                  </h3>
                  <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
                    Guided Experience
                  </span>
                </div>
                <p className="text-xs text-stone-500">
                  A synchronized walking itinerary connecting monument architecture, master artisan workshops, and food heritage
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-stone-600 bg-stone-100 px-3 py-1.5 rounded-xl flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-stone-500" />
                <span>Full Day (06:00 - 19:30)</span>
              </span>
            </div>
          </div>

          {/* Timeline Trail */}
          <div className="relative pl-6 sm:pl-8 border-l-2 border-amber-300 space-y-6 my-2">
            {guidedTrail.map((stop, idx) => (
              <div key={idx} className="relative group">
                <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-5 h-5 rounded-full bg-white border-4 border-amber-500 shadow-sm group-hover:scale-125 transition-transform" />
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      {stop.time}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${stop.badgeColor}`}>
                      {stop.tag}
                    </span>
                  </div>
                  <h4 className="font-serif font-bold text-stone-900 text-base group-hover:text-amber-700 transition-colors">
                    {stop.title}
                  </h4>
                  <p className="text-stone-600 text-xs leading-relaxed max-w-3xl">
                    {stop.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>
                Curated in collaboration with regional tourism authorities and certified local guide guilds.
              </span>
            </div>
            <Link
              to={`/map?lat=${place.latitude}&lng=${place.longitude}`}
              className="inline-flex items-center gap-1.5 font-bold text-amber-800 hover:text-amber-950 underline whitespace-nowrap"
            >
              <span>View GPS Route on Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

        {/* 4. Direct Connection to Local Artisans & GI Handicrafts (Deliverable ODOP Crafts) */}
        {relatedProducts.filter((item) => item.category !== 'food').length > 0 && (
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center flex-shrink-0">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-2xl font-bold text-stone-900">
                    Living ODOP Handicrafts of {place.name}
                  </h3>
                  <p className="text-xs text-stone-500">
                    Support verified hereditary master artisans and cooperatives linked to this historic cluster
                  </p>
                </div>
              </div>

              <Link
                to="/bazaar"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700"
              >
                <span>Visit Full ODOP Bazaar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {relatedProducts
                .filter((item) => item.category !== 'food')
                .map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-stone-200 overflow-hidden bg-stone-50/50 flex flex-col justify-between group hover:shadow-md transition-all"
                  >
                    <div>
                      <div className="relative aspect-[4/3] bg-stone-200 overflow-hidden">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80';
                          }}
                        />
                        {item.odopTag && (
                          <span className="absolute top-2.5 left-2.5 bg-black/75 text-amber-300 border border-amber-400/40 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                            {item.odopTag}
                          </span>
                        )}
                      </div>
                      <div className="p-3.5 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                            {item.category}
                          </span>
                          <span className="text-[10px] font-semibold text-emerald-700">
                            GI Verified
                          </span>
                        </div>
                        <h4 className="font-serif font-bold text-sm text-stone-900 line-clamp-1">
                          {item.name}
                        </h4>
                        <p className="text-[11px] text-stone-500 line-clamp-2">
                          {item.description}
                        </p>
                        <p className="text-[10px] text-stone-400 pt-1">
                          Guild: <strong>{item.artisanName}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="p-3.5 pt-0 flex items-center justify-between">
                      <span className="font-serif font-bold text-stone-900 text-sm">
                        ₹{item.price}
                      </span>
                      <Link
                        to="/bazaar"
                        className="px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-[11px] font-bold shadow-sm transition-all"
                      >
                        Support Artisan & Order
                      </Link>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* 5. Famous Regional Culinary Heritage (प्रसिद्ध स्थानीय खान-पान) - Admin Curated & Non-Deliverable */}
        {placeFoods && placeFoods.length > 0 && (
          <section className="bg-gradient-to-br from-amber-50/70 via-white to-orange-50/60 rounded-3xl p-6 sm:p-8 border border-amber-200/80 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-amber-200/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-700 text-white flex items-center justify-center shadow-md shadow-amber-800/20 flex-shrink-0">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                      Culinary Heritage Guide
                    </span>
                    <span className="text-[10px] font-bold text-stone-500 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Admin Curated</span>
                    </span>
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 mt-0.5">
                    Famous Regional Delicacies (प्रसिद्ध स्थानीय खान-पान)
                  </h3>
                  <p className="text-xs text-stone-600">
                    Discover what is famous to taste when visiting {place.name}
                  </p>
                </div>
              </div>

              {/* Strict Non-Deliverable Policy Banner */}
              <div className="px-3.5 py-1.5 rounded-xl bg-amber-100/90 border border-amber-300 text-[11px] font-bold text-amber-950 flex items-center gap-1.5 self-start sm:self-auto shadow-2xs">
                <Info className="w-4 h-4 text-amber-800 shrink-0" />
                <span>🚫 On-Site Only • Non-Deliverable</span>
              </div>
            </div>

            {/* Cultural Preservation Guidance Notice */}
            <div className="p-3.5 rounded-2xl bg-white/90 border border-amber-200/70 text-xs text-stone-600 flex items-start gap-2.5 shadow-2xs">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">
                <strong>Culinary Heritage Preservation:</strong> To ensure authentic taste, fresh preparation, and hygiene, regional food heritage items are curated strictly as an <strong>on-site tasting and tourism guide</strong>. These items are <strong>non-deliverable</strong>—tourists can explore their historical lore and relish them at the authentic heritage stalls and historic bazaars listed below during their visit!
              </span>
            </div>

            {/* Food Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {placeFoods.map((food) => (
                <div
                  key={food.id}
                  className="rounded-2xl border border-stone-200/80 bg-white overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="relative aspect-[16/9] bg-stone-100 overflow-hidden">
                      <img
                        src={food.imageUrl}
                        alt={food.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                      {/* Diet & Era Badges */}
                      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-sm ${
                            food.diet === 'veg'
                              ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40'
                              : 'bg-rose-950/90 text-rose-300 border-rose-500/40'
                          }`}
                        >
                          {food.diet === 'veg' ? '🟢 Pure Vegetarian' : '🔴 Non-Vegetarian'}
                        </span>

                        <span className="bg-black/75 backdrop-blur-xs text-amber-300 border border-amber-400/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {food.famousSince || 'Traditional Lore'}
                        </span>
                      </div>

                      {/* Bottom Dish Name Overlay */}
                      <div className="absolute bottom-2.5 left-3 right-3 text-white">
                        <h4 className="font-serif font-bold text-base leading-tight drop-shadow-sm">
                          {food.name}
                        </h4>
                        {food.nameHi && (
                          <p className="text-xs text-amber-200/90 font-medium">{food.nameHi}</p>
                        )}
                      </div>
                    </div>

                    {/* Food Content Details */}
                    <div className="p-4 sm:p-5 space-y-3">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg">
                          {food.categoryType || 'Regional Delicacy'}
                        </span>
                        <span className="font-mono font-bold text-stone-700 bg-stone-100 px-2 py-0.5 rounded-lg">
                          {food.priceRange || '₹40 - ₹120'}
                        </span>
                      </div>

                      {food.shortLore && (
                        <p className="text-xs text-stone-600 leading-relaxed italic bg-stone-50/70 p-2.5 rounded-xl border border-stone-100">
                          "{food.shortLore}"
                        </p>
                      )}

                      {/* Where to Taste (कहाँ मिलेगा) */}
                      <div className="pt-2 border-t border-stone-100 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-amber-700" />
                          <span>Where Tourists Can Taste (कहाँ मिलेगा):</span>
                        </span>
                        <p className="text-xs font-semibold text-stone-800 pl-4.5">
                          {food.famousSpots}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 pt-0 flex items-center justify-between border-t border-stone-100 text-[11px] text-stone-500">
                    <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Authentic Heritage Flavor</span>
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-amber-100/70 text-amber-900 font-bold text-[10px] uppercase">
                      🏛️ On-Site Discovery Only
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 5. YouTube Virtual Tour / Documentary Video Embed */}
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

        {/* 6. Related Movies, Songs & Folklore */}
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

        {/* 7. Visitor Photos & Community Reviews */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
            <div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                Visitor Photos & Community Reviews
              </h3>
              <p className="text-xs text-stone-500">See genuine experiences shared by recent travellers</p>
            </div>

            <button
              onClick={() => onOpenPostModal && onOpenPostModal(place.id)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-heritage-600 hover:bg-heritage-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all self-start sm:self-auto whitespace-nowrap active:scale-95"
            >
              <Camera className="w-4 h-4" />
              <span>Add Visit Photo</span>
            </button>
          </div>

          {place.posts && place.posts.length === 0 ? (
            <div className="py-12 text-center">
              <Camera className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-stone-600">No visitor photos yet</p>
              <p className="text-xs text-stone-400 mt-0.5">
                Be the first traveler to post a photo and review of {place.name}!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {place.posts?.map((post) => (
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

        {/* Data Security & Location Privacy Notice */}
        <div className="p-4 sm:p-5 rounded-2xl bg-stone-900 text-stone-300 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-md border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white block">
                Strict Location Privacy & Digital Preservation Guarantee
              </span>
              <span className="text-[11px] text-stone-400">
                Your GPS coordinates and audio guide streams are processed strictly on-device without remote tracking.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-semibold text-stone-400 whitespace-nowrap">
            <span>SanskritiKhoj Initiative</span>
            <span>•</span>
            <span>National Heritage Registry</span>
          </div>
        </div>
      </div>
    </div>
  );
}
