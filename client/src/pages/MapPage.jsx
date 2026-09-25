import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { placeService } from '../services/api';
import MapComponent from '../components/MapComponent';
import {
  MapPin,
  Navigation,
  Layers,
  Compass,
  Star,
  ChevronRight,
  List,
  Map as MapIcon,
  X,
  ArrowRight,
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All Markers' },
  { id: 'monument', label: 'Monuments' },
  { id: 'temple', label: 'Temples' },
  { id: 'fort', label: 'Forts' },
  { id: 'culture', label: 'Culture & Ghats' },
  { id: 'natural', label: 'Natural' },
];

export default function MapPage() {
  const [searchParams] = useSearchParams();
  const [places, setPlaces] = useState([]);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [category, setCategory] = useState('all');
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [mapCenter, setMapCenter] = useState([22.5937, 78.9629]);
  const [mapZoom, setMapZoom] = useState(5);
  const [mobileView, setMobileView] = useState('map'); // 'map' | 'list'

  useEffect(() => {
    placeService.getAll().then((res) => {
      if (res.success && res.places) {
        setPlaces(res.places);
        setFilteredPlaces(res.places);

        // Check if query params provided
        const qLat = parseFloat(searchParams.get('lat'));
        const qLng = parseFloat(searchParams.get('lng'));
        if (!isNaN(qLat) && !isNaN(qLng)) {
          setMapCenter([qLat, qLng]);
          setMapZoom(13);
          const found = res.places.find((p) => Math.abs(p.latitude - qLat) < 0.01);
          if (found) setSelectedPlace(found);
        }
      }
    });
  }, [searchParams]);

  useEffect(() => {
    if (category === 'all') {
      setFilteredPlaces(places);
    } else {
      setFilteredPlaces(places.filter((p) => p.category === category));
    }
  }, [category, places]);

  const handlePlaceClick = (place) => {
    setSelectedPlace(place);
    setMapCenter([place.latitude, place.longitude]);
    setMapZoom(14);
    setMobileView('map');
  };

  return (
    <div className="h-[calc(100dvh-4rem-3.75rem)] md:h-[calc(100vh-5rem)] flex flex-col md:flex-row overflow-hidden bg-stone-100">
      {/* Mobile Top Control Bar */}
      <div className="md:hidden bg-white border-b border-stone-200 px-3 py-2 space-y-2 flex-shrink-0 z-20 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-heritage-600" />
            <span className="font-serif font-bold text-xs text-stone-900">
              Heritage Radar Map
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-heritage-100 text-heritage-800">
              {filteredPlaces.length}
            </span>
          </div>

          {/* Map vs List Toggle */}
          <div className="inline-flex rounded-lg bg-stone-100 p-0.5 border border-stone-200">
            <button
              onClick={() => setMobileView('map')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                mobileView === 'map'
                  ? 'bg-heritage-600 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <MapIcon className="w-3 h-3" />
              <span>Map</span>
            </button>
            <button
              onClick={() => setMobileView('list')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                mobileView === 'list'
                  ? 'bg-heritage-600 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <List className="w-3 h-3" />
              <span>List ({filteredPlaces.length})</span>
            </button>
          </div>
        </div>

        {/* Filter Pills on Mobile */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors ${
                category === cat.id
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Sidebar List / Mobile List View */}
      <div
        className={`w-full md:w-96 bg-white border-r border-stone-200 flex flex-col z-10 shadow-md ${
          mobileView === 'list'
            ? 'flex-1 overflow-y-auto'
            : 'hidden md:flex md:h-full'
        }`}
      >
        {/* Desktop Header */}
        <div className="hidden md:block p-4 border-b border-stone-100 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
              <Compass className="w-5 h-5 text-heritage-600" />
              <span>Heritage Map Explorer</span>
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
              {filteredPlaces.length} Sites
            </span>
          </div>

          {/* Filter Pills */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  category === cat.id
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Places List */}
        <div className="flex-1 overflow-y-auto divide-y divide-stone-100 p-2 space-y-1">
          {filteredPlaces.map((place) => (
            <div
              key={place.id}
              onClick={() => handlePlaceClick(place)}
              className={`p-3 rounded-xl cursor-pointer transition-all flex gap-3 items-center ${
                selectedPlace?.id === place.id
                  ? 'bg-heritage-50 border border-heritage-300'
                  : 'hover:bg-stone-50'
              }`}
            >
              <img
                src={place.coverImage}
                alt={place.name}
                className="w-14 h-14 rounded-lg object-cover flex-shrink-0 border border-stone-200"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=400&q=80';
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-heritage-600 tracking-wider">
                    {place.category}
                  </span>
                  <div className="flex items-center gap-0.5 text-xs font-bold text-amber-500">
                    <Star className="w-3 h-3 fill-current" />
                    <span>{place.rating || 5.0}</span>
                  </div>
                </div>
                <h4 className="font-serif font-bold text-xs text-stone-900 truncate">
                  {place.name}
                </h4>
                <p className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5 truncate">
                  <MapPin className="w-3 h-3 text-stone-400 flex-shrink-0" />
                  <span>{place.state || 'India'}</span>
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400 flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Map (Right/Center) */}
      <div
        className={`flex-1 relative h-full min-h-0 ${
          mobileView === 'list' ? 'hidden md:block' : 'block'
        }`}
      >
        <MapComponent
          places={filteredPlaces}
          center={mapCenter}
          zoom={mapZoom}
          onSelectPlace={setSelectedPlace}
        />

        {/* Floating Quick Action: Reset Center to India */}
        <button
          onClick={() => {
            setMapCenter([22.5937, 78.9629]);
            setMapZoom(5);
            setSelectedPlace(null);
          }}
          className="absolute top-3 right-3 z-[400] bg-white/95 backdrop-blur-sm hover:bg-stone-50 text-stone-800 px-3 py-1.5 rounded-xl shadow-md border border-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
        >
          <Navigation className="w-3.5 h-3.5 text-heritage-600" />
          <span>Reset India View</span>
        </button>

        {/* Selected Place Floating Card (Mobile & Desktop) */}
        {selectedPlace && (
          <div className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-3 sm:max-w-xs z-[400] bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-xl border border-stone-200 animate-slide-up">
            <div className="flex items-start gap-2.5">
              <img
                src={selectedPlace.coverImage}
                alt={selectedPlace.name}
                className="w-14 h-14 rounded-xl object-cover border border-stone-200 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase font-bold text-heritage-600 tracking-wider">
                    {selectedPlace.category}
                  </span>
                  <button
                    onClick={() => setSelectedPlace(null)}
                    className="p-0.5 text-stone-400 hover:text-stone-700"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h4 className="font-serif font-bold text-xs text-stone-900 truncate">
                  {selectedPlace.name}
                </h4>
                <p className="text-[10px] text-stone-500 truncate mt-0.5">
                  {selectedPlace.state}, India
                </p>
                <Link
                  to={`/place/${selectedPlace.slug}`}
                  className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-heritage-600 hover:text-heritage-700 hover:underline"
                >
                  <span>Explore Heritage</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
