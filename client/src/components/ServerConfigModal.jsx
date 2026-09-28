import React, { useState, useEffect } from 'react';
import {
  Server,
  Wifi,
  WifiOff,
  CheckCircle2,
  XCircle,
  RefreshCw,
  X,
  ExternalLink,
  Laptop,
  Check,
} from 'lucide-react';
import { checkServerHealth, updateApiBaseUrl, getApiBaseUrl } from '../services/api';

export default function ServerConfigModal({ isOpen, onClose }) {
  const [currentUrl, setCurrentUrl] = useState('');
  const [inputIp, setInputIp] = useState('');
  const [status, setStatus] = useState({ checking: false, ok: null, ping: null, message: '' });
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const active = getApiBaseUrl();
      setCurrentUrl(active);
      // Extract IP/host if possible
      try {
        const match = active.match(/http:\/\/([^:/]+)/);
        if (match && match[1] && match[1] !== 'localhost' && match[1] !== '127.0.0.1') {
          setInputIp(match[1]);
        } else {
          setInputIp('10.162.157.65');
        }
      } catch {
        setInputIp('10.162.157.65');
      }
      testActiveConnection();
    }
  }, [isOpen]);

  const testActiveConnection = async (overrideUrl = null) => {
    setStatus({ checking: true, ok: null, ping: null, message: 'Checking backend heartbeat...' });
    const target = overrideUrl || getApiBaseUrl();
    const res = await checkServerHealth(target);
    if (res.ok) {
      setStatus({
        checking: false,
        ok: true,
        ping: res.ping,
        message: `Connected to MySQL Backend successfully (${res.ping}ms)`,
      });
    } else {
      setStatus({
        checking: false,
        ok: false,
        ping: null,
        message: 'Could not reach server. Verify your phone and laptop are on the same Wi-Fi.',
      });
    }
  };

  const handleApplyIp = (ipToApply) => {
    const cleanIp = ipToApply.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    const newBaseUrl = `http://${cleanIp}:5000/api`;
    updateApiBaseUrl(newBaseUrl);
    setCurrentUrl(newBaseUrl);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
    testActiveConnection(newBaseUrl);
  };

  const handleResetDefault = () => {
    updateApiBaseUrl(null);
    const def = getApiBaseUrl();
    setCurrentUrl(def);
    setInputIp('10.162.157.65');
    testActiveConnection(def);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl border border-stone-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-stone-900 leading-tight">
                Server Connection
              </h3>
              <p className="text-[11px] text-stone-500 font-medium">
                Live MySQL Backend & Mobile Sync
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Status Card */}
        <div
          className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-colors ${
            status.checking
              ? 'bg-amber-50/70 border-amber-200 text-amber-800'
              : status.ok
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {status.checking ? (
            <RefreshCw className="w-5 h-5 text-amber-600 animate-spin flex-shrink-0" />
          ) : status.ok ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <WifiOff className="w-5 h-5 text-rose-600 flex-shrink-0" />
          )}

          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold flex items-center gap-1.5">
              <span>{status.checking ? 'Connecting...' : status.ok ? 'Backend Live & Synchronized' : 'Offline / Unreachable'}</span>
              {status.ping !== null && (
                <span className="text-[10px] font-mono bg-emerald-200/80 px-1.5 py-0.2 rounded-md">
                  {status.ping}ms
                </span>
              )}
            </div>
            <p className="text-[11px] opacity-90 truncate mt-0.5">{status.message}</p>
          </div>

          <button
            type="button"
            onClick={() => testActiveConnection()}
            disabled={status.checking}
            className="p-2 rounded-xl bg-white/80 hover:bg-white text-stone-700 shadow-xs text-xs font-semibold flex-shrink-0"
            title="Retest Connection"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${status.checking ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Current Config */}
        <div className="space-y-1 bg-stone-50 p-3 rounded-2xl border border-stone-200/80">
          <div className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">
            Active Endpoint URL
          </div>
          <div className="font-mono text-xs text-stone-800 break-all select-all font-semibold">
            {currentUrl}
          </div>
        </div>

        {/* Change IP Form */}
        <div className="space-y-2 pt-1">
          <label className="block text-xs font-bold text-stone-800">
            Laptop / Computer IP Address
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputIp}
              onChange={(e) => setInputIp(e.target.value)}
              placeholder="e.g. 10.162.157.65"
              className="flex-1 px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-mono text-stone-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => handleApplyIp(inputIp)}
              className="px-4 py-2 bg-heritage-600 hover:bg-heritage-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95 flex items-center gap-1.5"
            >
              {savedSuccess ? <Check className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
              <span>{savedSuccess ? 'Saved!' : 'Connect'}</span>
            </button>
          </div>
          <p className="text-[10px] text-stone-500">
            If your laptop connects to mobile hotspot or another Wi-Fi, type its new IPv4 address here.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => {
              setInputIp('10.162.157.65');
              handleApplyIp('10.162.157.65');
            }}
            className="flex-1 py-1.5 px-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-[11px] font-semibold transition-colors truncate"
          >
            💻 Laptop (10.162.157.65)
          </button>
          <button
            type="button"
            onClick={handleResetDefault}
            className="py-1.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl text-[11px] font-medium transition-colors"
          >
            Reset
          </button>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
          <span className="text-[10px] text-stone-400">
            Offline cache ready with instant 0ms fallback
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
