import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Compass, ArrowRight, Eye } from 'lucide-react';

const categoryColors = {
  monument: 'bg-amber-100 text-amber-800 border-amber-200',
  temple: 'bg-orange-100 text-orange-800 border-orange-200',
  fort: 'bg-stone-200 text-stone-800 border-stone-300',
  festival: 'bg-rose-100 text-rose-800 border-rose-200',
  natural: 'bg-emerald-100 text-emerald-800 border-emerald-200',
};

export default function CultureCard({ place }) {
  const badgeStyle = categoryColors[place.category] || 'bg-stone-100 text-stone-800 border-stone-200';

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-stone-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col hover:-translate-y-1">
      {/* Image Banner */}
      <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
        <img
          src={place.coverImage}
          alt={place.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Top Badges Row */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10 pointer-events-none">
          <span
            className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border shadow-sm backdrop-blur-md truncate max-w-[50%] ${badgeStyle}`}
          >
            {place.category}
          </span>

          {place.distanceKm !== null && place.distanceKm !== undefined && (
            <div className="bg-black/75 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm border border-white/20 flex-shrink-0">
              <Compass className="w-3.5 h-3.5 text-heritage-400" />
              <span>{place.distanceKm} km away</span>
            </div>
          )}
        </div>

        {/* Location & Title over image bottom */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          {place.state && (
            <div className="flex items-center gap-1 text-xs text-stone-200 font-medium mb-1">
              <MapPin className="w-3.5 h-3.5 text-heritage-400" />
              <span>{place.state}, India</span>
            </div>
          )}
          <h3 className="font-serif text-xl font-bold leading-snug drop-shadow-sm group-hover:text-heritage-300 transition-colors line-clamp-1">
            {place.name}
          </h3>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Rating & Posts Meta */}
          <div className="flex items-center justify-between text-xs text-stone-500 pb-2 border-b border-stone-100">
            <div className="flex items-center gap-1 text-amber-600 font-semibold">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{place.rating || 5.0}</span>
              <span className="text-stone-400 font-normal">({place.postsCount || 0} reviews)</span>
            </div>
            <Link
              to={`/map?lat=${place.latitude}&lng=${place.longitude}`}
              className="text-stone-500 hover:text-heritage-600 flex items-center gap-1 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View on Map</span>
            </Link>
          </div>

          {/* Short description */}
          <p className="text-stone-600 text-sm mt-3 line-clamp-2 leading-relaxed">
            {place.shortDescription}
          </p>
        </div>

        {/* Explore Button */}
        <Link
          to={`/place/${place.slug}`}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-heritage-50 hover:bg-heritage-600 text-heritage-700 hover:text-white font-medium text-sm transition-all duration-200 group-hover:shadow-sm"
        >
          <span>Explore Story & Videos</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
