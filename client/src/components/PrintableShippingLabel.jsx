import React from 'react';
import { createPortal } from 'react-dom';
import { Truck, ShieldCheck, Package } from 'lucide-react';

export function ShippingLabelContent({ order, artisanInfo }) {
  if (!order) return null;

  const awb = order.trackingNumber || order.trackingAwb || `EM${Math.floor(100000000 + Math.random() * 900000000)}IN`;
  const items = Array.isArray(order.items) && order.items.length > 0
    ? order.items
    : [{ name: order.productName || 'Heritage Craft Item', quantity: order.quantity || 1, price: order.price || order.totalAmount }];

  const buyerName = order.customerName || order.buyerName || 'Valued Heritage Patron';
  const buyerPhone = order.customerPhone || order.buyerPhone || 'N/A';
  const buyerAddress = order.customerAddress || order.buyerAddress || 'Address on file';
  const buyerCity = order.customerCity || order.buyerCity || '';
  const artisanName = order.artisanName || artisanInfo?.artisanName || 'Master Heritage Craftsman';
  const artisanShop = artisanInfo?.shopName || `${artisanName} Studio`;
  const artisanAddress = artisanInfo?.shopAddress || 'GI Heritage Cluster';

  return (
    <div className="w-full max-w-[190mm] mx-auto bg-white text-stone-900 border-2 border-stone-900 rounded-2xl p-6 space-y-4 font-sans text-xs">
      {/* Postal Header */}
      <div className="border-b-2 border-stone-900 pb-3 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-black text-lg text-stone-950 uppercase">
              India Post SpeedPost (GI Secure Courier)
            </h3>
            <p className="text-[10px] text-stone-600 font-mono">
              ODOP Direct-from-Cluster Dispatch • Insured Fair-Trade Consignment
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="inline-block border border-stone-900 bg-stone-50 px-3 py-1 rounded font-mono font-bold text-xs">
            AWB: {awb}
          </div>
          <p className="text-[9px] text-stone-500 font-mono mt-0.5">Order #{order.id}</p>
        </div>
      </div>

      {/* Barcode Simulation */}
      <div className="p-3 bg-stone-50 border border-stone-300 rounded-xl text-center space-y-1">
        <div className="font-mono text-2xl tracking-[0.25em] font-black text-stone-900 select-all">
          ||| | |||| | ||||| || ||| |||| || |
        </div>
        <div className="font-mono text-xs font-bold text-stone-700">
          *{awb}*
        </div>
      </div>

      {/* Origin & Destination Addresses */}
      <div className="grid grid-cols-2 gap-4 border-b border-stone-300 pb-4">
        {/* FROM */}
        <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500 block">
            SENDER / RETURN TO (प्रेषक)
          </span>
          <p className="font-bold text-stone-900">{artisanShop}</p>
          <p className="text-stone-700">{artisanName}</p>
          <p className="text-stone-600 leading-tight">{artisanAddress}</p>
          <p className="text-[10px] text-stone-500 font-mono pt-1">
            GI Auth: Registered Cluster
          </p>
        </div>

        {/* TO */}
        <div className="p-3 rounded-xl bg-orange-50/60 border border-orange-200 space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-orange-900 block">
            DELIVER TO (प्राप्तकर्ता)
          </span>
          <p className="font-bold text-stone-950 text-sm">{buyerName}</p>
          <p className="text-stone-800 leading-tight font-medium">
            {buyerAddress}
            {buyerCity ? `, ${buyerCity}` : ''}
          </p>
          <p className="text-stone-700 font-mono text-[11px] pt-1">
            Phone / WhatsApp: <strong>{buyerPhone}</strong>
          </p>
        </div>
      </div>

      {/* Package Contents Breakdown */}
      <div>
        <h4 className="font-mono font-bold text-[10px] uppercase tracking-wider text-stone-500 mb-2">
          PACKAGE CONTENTS & PACKING SLIP
        </h4>
        <table className="w-full text-left border-collapse text-[11px]">
          <thead>
            <tr className="border-b border-stone-300 bg-stone-100 font-mono font-bold text-[10px] text-stone-700">
              <th className="py-1.5 px-2">Item Description</th>
              <th className="py-1.5 px-2 text-center w-16">Qty</th>
              <th className="py-1.5 px-2 text-right w-24">Declared Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {items.map((it, idx) => (
              <tr key={idx}>
                <td className="py-2 px-2 font-medium text-stone-900">{it.name || it.productName}</td>
                <td className="py-2 px-2 text-center font-mono">{it.quantity || 1}</td>
                <td className="py-2 px-2 text-right font-mono font-bold">
                  ₹{(Number(it.price || 0) * Number(it.quantity || 1)).toLocaleString('en-IN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Handling Instructions & Security */}
      <div className="pt-2 border-t border-stone-300 flex items-center justify-between text-[10px]">
        <div className="flex items-center gap-1.5 font-bold text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg">
          <Package className="w-3.5 h-3.5" />
          <span>FRAGILE: HANDMADE HERITAGE ARTIFACT - HANDLE WITH CARE</span>
        </div>
        <div className="flex items-center gap-1 font-bold text-emerald-800">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>OFFICIAL GI TAMPER-EVIDENT SEAL AFFIXED</span>
        </div>
      </div>
    </div>
  );
}

export function PrintableShippingSlipPortal({ order, artisanInfo }) {
  if (typeof document === 'undefined' || !order) return null;

  return createPortal(
    <div id="printable-shipping-portal" className="print-only">
      <ShippingLabelContent order={order} artisanInfo={artisanInfo} />
    </div>,
    document.body
  );
}

export default PrintableShippingSlipPortal;
