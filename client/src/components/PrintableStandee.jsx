import React from 'react';
import { createPortal } from 'react-dom';
import { Award, QrCode, CheckCircle2, ShieldCheck, MapPin } from 'lucide-react';

/**
 * Printable Workshop Countertop Standee
 * Designed to fit standard A4 cardstock for physical artisan studio counters.
 */
export function StandeeContent({ artisanData }) {
  const data = artisanData || {};
  const studioName = data.shopName || (data.artisanName ? `${data.artisanName} Studio` : 'Traditional Artisan Studio');
  const artisanName = data.artisanName || 'Master Heritage Artisan';
  const address = data.shopAddress || 'Traditional Craft Cluster';
  const landmark = data.shopLandmark || '';
  const pehchanId = data.pehchanId || 'PEH-IND-2026-9481';
  const giAuth = data.giRegNumber || 'GI-IND-2026-HERITAGE';
  const cooperative = data.cooperativeName || 'Traditional Heritage Crafts Guild';

  return (
    <div className="w-full max-w-[190mm] mx-auto bg-white text-stone-900 border-4 border-stone-900 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl relative font-sans">
      {/* Top Ministry Badge */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-stone-900 text-amber-400 text-xs font-mono font-bold tracking-wider uppercase">
          <Award className="w-4 h-4 text-amber-400" />
          <span>MINISTRY OF TEXTILES • DC (HANDICRAFTS) VERIFIED</span>
        </div>
        <h2 className="font-serif font-black text-3xl sm:text-4xl text-stone-950 tracking-tight">
          {studioName}
        </h2>
        <p className="text-sm font-semibold text-stone-700">
          Master Artisan: <span className="text-orange-950 font-bold">{artisanName}</span>
        </p>
      </div>

      {/* Address & Landmark */}
      <div className="bg-stone-50 py-2.5 px-4 rounded-xl border border-stone-200 text-xs text-stone-600 flex items-center justify-center gap-1.5 max-w-md mx-auto">
        <MapPin className="w-4 h-4 text-orange-600 shrink-0" />
        <span>{address} {landmark ? `• Landmark: ${landmark}` : ''}</span>
      </div>

      {/* Large High-Res QR Code */}
      <div className="w-64 h-64 mx-auto p-4 bg-white rounded-3xl border-4 border-stone-900 shadow-lg flex flex-col items-center justify-center relative">
        <div className="w-full h-full bg-stone-900 rounded-2xl p-3 flex flex-col items-center justify-center text-white relative">
          <QrCode className="w-48 h-48 text-white stroke-[1.5]" />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-12 h-12 rounded-xl bg-orange-600 text-white flex items-center justify-center text-sm font-black shadow-lg border-2 border-white">
              SK
            </div>
          </div>
        </div>
      </div>

      {/* Scan Instructions */}
      <div className="space-y-1">
        <p className="font-serif font-bold text-base text-stone-900">
          Scan with Any Phone Camera or UPI App
        </p>
        <p className="text-xs text-stone-500 max-w-sm mx-auto">
          Explore authentic GI heritage catalog, read artisan lineage, or make 100% direct fair-trade payments.
        </p>
      </div>

      {/* Official Registry Badges */}
      <div className="grid grid-cols-3 gap-2 font-mono text-[11px] text-stone-800 bg-amber-50/70 p-4 rounded-2xl border border-amber-200 text-left">
        <div>
          <span className="text-stone-400 block text-[9px] uppercase tracking-wider">Pehchan ID</span>
          <strong className="text-stone-950">{pehchanId}</strong>
        </div>
        <div>
          <span className="text-stone-400 block text-[9px] uppercase tracking-wider">GI Certification</span>
          <strong className="text-emerald-800">{giAuth}</strong>
        </div>
        <div>
          <span className="text-stone-400 block text-[9px] uppercase tracking-wider">Certified Guild</span>
          <span className="text-stone-900 font-bold truncate block">{cooperative}</span>
        </div>
      </div>

      {/* Bottom Guarantee Seal */}
      <div className="pt-2 border-t-2 border-stone-200 flex items-center justify-between text-xs font-bold text-stone-700">
        <div className="flex items-center gap-1.5 text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>100% Direct Fair-Trade • 0% Middlemen Cut</span>
        </div>
        <div className="text-[10px] font-mono text-stone-400">
          SanskritiKhoj ODOP Network
        </div>
      </div>

      {/* Cut-out guidelines for tabletop acrylic stand */}
      <div className="pt-4 border-t border-dashed border-stone-300 text-[10px] text-stone-400 font-mono">
        ✂ CUT ALONG OUTER BORDER & INSERT INTO A4 ACRYLIC COUNTERTOP DISPLAY STAND
      </div>
    </div>
  );
}

export function PrintableStandeePortal({ artisanData }) {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div id="printable-standee-portal" className="print-only">
      <StandeeContent artisanData={artisanData} />
    </div>,
    document.body
  );
}

export default PrintableStandeePortal;
