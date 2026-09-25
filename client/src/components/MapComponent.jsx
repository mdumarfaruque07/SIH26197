import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { Star, ArrowRight, MapPin } from 'lucide-react';

// Create custom category-based SVG markers for Leaflet
function createCustomIcon(category) {
  let bgColor = '#d7641d'; // default heritage orange
  if (category === 'monument') bgColor = '#b44818';
  if (category === 'temple') bgColor = '#ea580c';
  if (category === 'fort') bgColor = '#78350f';
  if (category === 'festival') bgColor = '#e11d48';
  if (category === 'natural') bgColor = '#059669';

  return L.divIcon({
    className: 'custom-heritage-marker',
    html: `
      <div style="
        background: ${bgColor};
        width: 34px;
        height: 34px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid white;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      ">
        <div style="
          transform: rotate(45deg);
          width: 10px;
          height: 10px;
          background: white;
          border-radius: 50%;
        "></div>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -34],
  });
}

// Helper to pan map when coordinates change
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || 6);
    }
  }, [center, zoom, map]);
  return null;
}

export default function MapComponent({ places = [], center = [22.5937, 78.9629], zoom = 5, onSelectPlace }) {
  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden shadow-inner border border-stone-200">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full min-h-0"
      >
        <ChangeView center={center} zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {places.map((place) => (
          <Marker
            key={place.id}
            position={[place.latitude, place.longitude]}
            icon={createCustomIcon(place.category)}
            eventHandlers={{
              click: () => {
                onSelectPlace && onSelectPlace(place);
              },
            }}
          >
            <Popup className="heritage-map-popup">
              <div className="w-64 overflow-hidden rounded-xl bg-white font-sans">
                <div className="relative h-28 w-full">
                  <img
                    src={place.coverImage}
                    alt={place.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                    {place.category}
                  </div>
                </div>

                <div className="p-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-stone-500 font-medium flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-heritage-600" />
                      {place.state || 'India'}
                    </span>
                    <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {place.rating || 5.0}
                    </span>
                  </div>

                  <h4 className="font-serif font-bold text-sm text-stone-900 leading-tight">
                    {place.name}
                  </h4>
                  <p className="text-stone-600 text-xs mt-1 line-clamp-2">
                    {place.shortDescription}
                  </p>

                  <Link
                    to={`/place/${place.slug}`}
                    className="mt-3 w-full py-1.5 px-3 bg-heritage-600 hover:bg-heritage-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Read Full Story</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
