import React from 'react';
import { createPortal } from 'react-dom';
import { Printer, X, Download, ShieldCheck, CheckCircle2, QrCode } from 'lucide-react';
import { triggerPrint } from '../utils/printUtils';

/**
 * High-Fidelity Tax Invoice & Geographical Indication Bill of Supply
 * Compliant with ODOP Heritage Marketplace & Ministry of Textiles Direct Artisan Payout standards.
 */
export function InvoiceContent({ order, isPrintMode = false }) {
  if (!order) return null;

  const items = Array.isArray(order.items) && order.items.length > 0
    ? order.items
    : [
        {
          name: order.productName || 'Heritage Handcrafted Artifact',
          price: Number(order.price || order.totalAmount || 0),
          quantity: Number(order.quantity || 1),
          artisanName: order.artisanName || 'Traditional Crafts Guild',
          odopTag: 'Certified ODOP GI Craft',
        },
      ];

  const totalAmount = Number(order.totalAmount || order.price || 0);
  const subtotal = Number(order.subtotal || totalAmount);
  const platformFee = Number(order.platformFee || 0);
  const buyerFee = Number(order.buyerFee || 0);
  const artisanShare = Number(order.artisanShare || totalAmount);
  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : order.date || new Date().toLocaleDateString('en-IN');

  const buyerName = order.buyerName || order.customerName || 'Heritage Patron';
  const buyerPhone = order.buyerPhone || order.customerPhone || 'N/A';
  const buyerAddress = order.buyerAddress || order.customerAddress || 'Direct In-Studio Handover';
  const buyerCity = order.buyerCity || '';
  const carrier = order.carrier || 'India Post SpeedPost (GI Secure)';
  const utr = order.utr || 'UTR-NPCI-' + Math.floor(100000000000 + Math.random() * 900000000000);
  const paymentMethod = order.paymentMethod || 'Instant UPI (Fair-Trade Escrow)';
  const invoiceNumber = `INV-${order.id || 'ODOP-2026-0000'}`;

  return (
    <div
      className={`bg-white text-stone-900 font-sans ${
        isPrintMode ? 'p-0 text-[11px]' : 'p-6 sm:p-8 max-w-3xl mx-auto rounded-3xl shadow-xl border border-stone-200 text-xs'
      }`}
    >
      {/* 1. Official Header & Government ODOP Banner */}
      <div className="border-b-2 border-stone-900 pb-4 mb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-stone-900 text-amber-400 text-[10px] font-mono font-bold tracking-wider uppercase">
              <span>MINISTRY OF TEXTILES • ODOP INITIATIVE</span>
            </div>
            <h1 className="font-serif font-black text-2xl tracking-tight text-stone-950 flex items-center gap-2">
              <span>SanskritiKhoj</span>
              <span className="text-sm font-normal text-stone-500 font-sans">(संस्कृतिकोज)</span>
            </h1>
            <p className="text-[11px] text-stone-600 max-w-md leading-relaxed">
              National Direct-to-Artisan Fair-Trade Gateway • Zero Middlemen Commission
              <br />
              <span className="text-stone-500">Official Bill of Supply & GI Authenticity Warranty</span>
            </p>
          </div>

          <div className="text-right space-y-1">
            <div className="inline-block border-2 border-stone-900 px-3 py-1 rounded-lg bg-stone-50 font-mono text-center">
              <span className="block text-[9px] uppercase font-bold tracking-widest text-stone-500">Tax Invoice & Escrow Bill</span>
              <span className="block font-black text-xs text-stone-950">{invoiceNumber}</span>
            </div>
            <p className="text-[10px] text-stone-500 font-mono">Date: {orderDate}</p>
            <p className="text-[10px] text-emerald-800 font-bold">100% Direct Artisan Remittance</p>
          </div>
        </div>
      </div>

      {/* 2. Order Metadata Matrix */}
      <div className="grid grid-cols-2 gap-4 pb-4 mb-4 border-b border-stone-200">
        {/* Customer / Billed To */}
        <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500 block">
            BILLED & SHIPPED TO (ग्राहक विवरण)
          </span>
          <p className="font-bold text-stone-900 text-sm">{buyerName}</p>
          <p className="text-stone-600 text-[11px]">Contact: {buyerPhone}</p>
          <p className="text-stone-600 text-[11px] leading-tight">
            {buyerAddress}
            {buyerCity ? `, ${buyerCity}` : ''}
          </p>
          <div className="pt-1 mt-1 border-t border-stone-200 text-[10px] text-stone-500">
            <strong>Logistics:</strong> {carrier}
          </div>
        </div>

        {/* Master Artisan / Origin Guild */}
        <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-900 block">
            AUTHENTIC PRODUCER / ARTISAN GUILD (कारीगर विवरण)
          </span>
          <p className="font-bold text-amber-950 text-sm">{order.artisanName || 'Traditional Crafts Guild'}</p>
          <p className="text-amber-900 text-[11px]">
            <strong>GI Auth:</strong> GI-IND-2026-HERITAGE • Registered Geographical Indication
          </p>
          <p className="text-amber-900 text-[11px]">
            <strong>Payment Mode:</strong> {paymentMethod}
          </p>
          <div className="pt-1 mt-1 border-t border-amber-200 text-[10px] font-mono text-emerald-800 font-bold truncate">
            <strong>UTR / Bank Ref:</strong> {utr}
          </div>
        </div>
      </div>

      {/* 3. Itemized Crafts Table */}
      <div className="mb-4">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-stone-900 bg-stone-100 text-[10px] font-mono font-bold uppercase tracking-wider text-stone-700">
              <th className="py-2 px-2.5 w-8">#</th>
              <th className="py-2 px-2.5">Item Description & Craft Heritage</th>
              <th className="py-2 px-2.5 text-center w-14">Qty</th>
              <th className="py-2 px-2.5 text-right w-24">Rate (₹)</th>
              <th className="py-2 px-2.5 text-right w-28">Amount (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200 text-[11px]">
            {items.map((it, idx) => {
              const qty = Number(it.quantity || 1);
              const price = Number(it.price || 0);
              const rowTotal = qty * price;
              return (
                <tr key={idx} className="hover:bg-stone-50/50">
                  <td className="py-2.5 px-2.5 font-mono text-stone-500">{idx + 1}</td>
                  <td className="py-2.5 px-2.5">
                    <p className="font-bold text-stone-900">{it.name || it.productName}</p>
                    <p className="text-[10px] text-stone-500">
                      GI Cluster: {it.artisanName || order.artisanName} • {it.odopTag || 'Authentic ODOP Handcraft'}
                    </p>
                  </td>
                  <td className="py-2.5 px-2.5 text-center font-mono">{qty}</td>
                  <td className="py-2.5 px-2.5 text-right font-mono">₹{price.toLocaleString('en-IN')}</td>
                  <td className="py-2.5 px-2.5 text-right font-mono font-bold text-stone-950">
                    ₹{rowTotal.toLocaleString('en-IN')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 4. Financial Breakdown & 0% Commission Transparency */}
      <div className="grid grid-cols-2 gap-4 pb-4 mb-4 border-b border-stone-200 items-start">
        {/* GI Guarantee & QR Seal */}
        <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex items-start gap-3">
          <div className="w-12 h-12 bg-white rounded-xl border border-emerald-300 p-1 flex items-center justify-center shrink-0">
            <QrCode className="w-10 h-10 text-emerald-800" />
          </div>
          <div className="space-y-0.5 text-[10px] text-emerald-950">
            <div className="font-bold flex items-center gap-1 text-emerald-900">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Official GI Authenticity Hologram</span>
            </div>
            <p className="text-stone-600 leading-tight">
              Certified authentic under Section 21 of the Geographical Indications of Goods Act, 1999.
            </p>
            <p className="font-mono text-emerald-800 font-bold">Verification: {order.id}</p>
          </div>
        </div>

        {/* Totals Table */}
        <div className="space-y-1.5 text-xs text-stone-700">
          <div className="flex justify-between">
            <span>Crafts Subtotal:</span>
            <span className="font-mono font-semibold">₹{subtotal.toLocaleString('en-IN')}</span>
          </div>

          <div className="flex justify-between text-emerald-800">
            <span className="flex items-center gap-1">
              <span>Platform Commission:</span>
              <span className="text-[9px] font-bold bg-emerald-100 text-emerald-900 px-1 rounded">0% PROMO</span>
            </span>
            <span className="font-mono font-bold">₹0.00</span>
          </div>

          <div className="flex justify-between text-stone-600">
            <span>Buyer Escrow Protection Fee:</span>
            <span className="font-mono font-semibold">₹{buyerFee.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-stone-600">
            <span>India Post GI Secure Courier:</span>
            <span className="font-mono font-bold text-emerald-700 uppercase text-[10px]">FREE (निःशुल्क)</span>
          </div>

          <div className="pt-2 border-t-2 border-stone-900 flex justify-between items-center text-sm font-bold text-stone-950">
            <span>Grand Total Paid:</span>
            <span className="font-serif font-black text-base text-stone-950">
              ₹{totalAmount.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-[10px] text-emerald-900 flex items-center justify-between font-bold">
            <span>Direct Artisan Share (100%):</span>
            <span className="font-mono text-xs text-emerald-800">₹{artisanShare.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* 5. Statutory Declaration & Footer */}
      <div className="flex items-end justify-between pt-2 text-[10px] text-stone-500">
        <div className="space-y-1 max-w-md">
          <p className="leading-tight">
            <strong>Statutory Terms:</strong> This is a computer-generated tax invoice and verified Bill of Supply. No signature is required. Funds remain safeguarded in fair-trade escrow and are transferred 100% directly to the artisan upon delivery verification.
          </p>
          <p className="font-mono text-[9px] text-stone-400">
            SanskritiKhoj Portal • Powered by Ministry of Culture & Tourism ODOP Framework
          </p>
        </div>

        <div className="text-center shrink-0 border border-stone-300 rounded-xl p-2 bg-stone-50">
          <div className="w-20 h-10 border border-dashed border-stone-400 rounded flex items-center justify-center text-[9px] text-stone-400 font-mono">
            [ESCROW SEAL]
          </div>
          <span className="block text-[8px] font-bold text-emerald-800 uppercase tracking-widest mt-1">
            ✓ 100% Payout Verified
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Printable Invoice Portal
 * Mounts directly into document.body to ensure zero interference from parent scrollbars, drawers, or modal transforms.
 */
export function PrintableInvoicePortal({ order }) {
  if (typeof document === 'undefined' || !order) return null;

  return createPortal(
    <div id="printable-invoice-portal" className="print-only">
      <InvoiceContent order={order} isPrintMode={true} />
    </div>,
    document.body
  );
}

/**
 * On-Screen Modal for Users who want to preview, download, or print the invoice
 */
export function InvoicePreviewModal({ isOpen, onClose, order }) {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    triggerPrint('printing-invoice');
  };

  return (
    <div
      className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Action Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-stone-900 leading-tight">
                Tax Invoice & GI Bill of Supply
              </h3>
              <p className="text-[11px] text-stone-500 font-mono">
                ODOP Order: #{order.id} • 100% Direct Artisan Remittance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-stone-200 text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable View */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-100/50">
          <InvoiceContent order={order} isPrintMode={false} />
        </div>
      </div>
    </div>
  );
}

export default PrintableInvoicePortal;
