import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  X,
  User,
  LogIn,
  LogOut,
  ShieldCheck,
  Compass,
  ShoppingBag,
  Bookmark,
  Languages,
  Sparkles,
  Camera,
  Heart,
  Server,
  Wifi,
  Check,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getApiBaseUrl, updateApiBaseUrl, checkServerHealth } from '../services/api';

export default function MenuDrawer({ isOpen, onClose, onOpenPostModal }) {
  const { user, logout, isGuest } = useAuth();
  const navigate = useNavigate();

  const [serverUrl, setServerUrl] = useState(
    () => localStorage.getItem('sih_custom_api_url') || getApiBaseUrl()
  );
  const [showServerConfig, setShowServerConfig] = useState(false);
  const [serverStatus, setServerStatus] = useState('checking'); // 'online' | 'offline' | 'checking'
  const [serverMsg, setServerMsg] = useState('');

  const checkConnection = async (urlToCheck = null) => {
    setServerStatus('checking');
    const res = await checkServerHealth(urlToCheck || serverUrl);
    if (res.ok) {
      setServerStatus('online');
      setServerMsg('Cloud server connected (Live Sync)');
    } else {
      setServerStatus('offline');
      setServerMsg(res.error || 'Server unreachable (using offline cache)');
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkConnection();
    }
  }, [isOpen]);

  const handleSaveServer = async () => {
    updateApiBaseUrl(serverUrl);
    await checkConnection(serverUrl);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between p-6 overflow-y-auto animate-slide-left border-l border-stone-200">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-heritage-600 text-white flex items-center justify-center font-serif font-black text-sm">
                सं
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-stone-900 leading-tight">
                  संस्कृति Khoj
                </h3>
                <p className="text-[10px] text-stone-500 uppercase tracking-widest font-semibold">
                  Indian Heritage Portal
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Card */}
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/90 flex items-center gap-3">
            <img
              src={
                user?.avatarUrl ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'Guest')}`
              }
              alt={user?.name || 'Guest'}
              className="w-10 h-10 rounded-full object-cover border border-stone-300"
            />
            <div className="min-w-0 flex-1">
              <div className="font-bold text-xs text-stone-900 truncate">
                {user ? user.name : 'Guest Explorer'}
              </div>
              <div className="text-[10px] text-stone-500 truncate">
                {user?.role === 'admin'
                  ? '🛡️ Government Admin'
                  : isGuest
                  ? 'Tourist (Guest Mode)'
                  : user?.email || 'Logged In'}
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            <Link
              to="/"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-colors"
            >
              <Compass className="w-4 h-4 text-heritage-600" />
              <span>Culture Feed</span>
            </Link>

            <Link
              to="/map"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-colors"
            >
              <Compass className="w-4 h-4 text-orange-600" />
              <span>Interactive Map Radar</span>
            </Link>

            <Link
              to="/bazaar"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-colors"
            >
              <ShoppingBag className="w-4 h-4 text-indigo-600" />
              <span>ODOP Traditional Bazaar</span>
            </Link>

            <Link
              to="/bookmarks"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-colors"
            >
              <Bookmark className="w-4 h-4 text-amber-600" />
              <span>Saved Bucket List</span>
            </Link>

            {user?.role === 'admin' && (
              <Link
                to="/admin"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-heritage-700 bg-heritage-50 border border-heritage-200 transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-heritage-600" />
                <span>Government Admin Panel</span>
              </Link>
            )}
          </div>

          {/* Quick Post Visit Button */}
          <button
            onClick={() => {
              onClose();
              if (onOpenPostModal) onOpenPostModal();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-heritage-600 hover:bg-heritage-700 text-white text-xs font-bold shadow-md shadow-heritage-600/20 transition-all"
          >
            <Camera className="w-4 h-4" />
            <span>Share Heritage Visit Photo</span>
          </button>

          {/* Initiative Badge */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>ODOP & Artisan Heritage</span>
            </div>
            <p className="text-[11px] text-amber-800/90 leading-tight">
              Promoting One District One Product (ODOP) and local artisan empowerment alongside heritage tourism.
            </p>
          </div>

          {/* Backend Connection Manager for Mobile */}
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/90 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="w-3.5 h-3.5 text-stone-600" />
                <span className="text-xs font-bold text-stone-800">Cloud Sync & Server</span>
              </div>
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                  serverStatus === 'online'
                    ? 'bg-emerald-100 text-emerald-800'
                    : serverStatus === 'offline'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-stone-200 text-stone-600'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    serverStatus === 'online'
                      ? 'bg-emerald-500 animate-pulse'
                      : serverStatus === 'offline'
                      ? 'bg-amber-500'
                      : 'bg-stone-400'
                  }`}
                />
                {serverStatus === 'online'
                  ? 'Online'
                  : serverStatus === 'offline'
                  ? 'Offline Fallback'
                  : 'Checking'}
              </span>
            </div>

            <p className="text-[10px] text-stone-500 font-mono truncate">{serverUrl}</p>

            <button
              onClick={() => setShowServerConfig(!showServerConfig)}
              className="text-[11px] text-heritage-600 hover:text-heritage-700 font-semibold"
            >
              {showServerConfig ? 'Close Settings' : 'Configure Server IP'}
            </button>

            {showServerConfig && (
              <div className="pt-2 space-y-2 border-t border-stone-200">
                <input
                  type="text"
                  value={serverUrl}
                  onChange={(e) => setServerUrl(e.target.value)}
                  placeholder="e.g. http://10.168.182.153:5000"
                  className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-mono"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveServer}
                    className="flex-1 py-1.5 bg-heritage-600 text-white rounded-lg text-xs font-bold hover:bg-heritage-700"
                  >
                    Save & Test
                  </button>
                  <button
                    onClick={() => checkConnection()}
                    className="p-1.5 border border-stone-300 rounded-lg text-stone-600 hover:bg-stone-100"
                    title="Refresh Status"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Auth Actions */}
        <div className="pt-4 border-t border-stone-100 space-y-2">
          {user && !isGuest ? (
            <button
              onClick={() => {
                logout();
                onClose();
                navigate('/');
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-stone-200 text-stone-600 hover:text-red-600 hover:border-red-200 text-xs font-semibold transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/login"
                onClick={onClose}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-stone-900 text-white text-xs font-semibold"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Log In</span>
              </Link>
              <Link
                to="/register"
                onClick={onClose}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold"
              >
                <span>Register</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
