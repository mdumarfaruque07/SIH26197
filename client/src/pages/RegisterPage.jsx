import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Landmark, AlertCircle, Loader2, Compass, Settings, Server } from 'lucide-react';
import ServerConfigModal from '../components/ServerConfigModal';
import { getApiBaseUrl } from '../services/api';

export default function RegisterPage() {
  const { register, continueAsGuest } = useAuth();
  const navigate = useNavigate();
  const [serverConfigOpen, setServerConfigOpen] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-stone-200 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-heritage-600 text-white flex items-center justify-center mx-auto shadow-md shadow-heritage-600/30">
            <Landmark className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-stone-900">Create an Account</h2>
          <p className="text-xs text-stone-500">Join the Sanskriti community to preserve and celebrate our heritage</p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 text-red-700 text-xs rounded-2xl border border-red-200 space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="font-semibold">{error}</span>
            </div>
            {(error.includes('timeout') || error.includes('Network') || error.includes('failed') || error.includes('exceeded')) && (
              <div className="pt-2 border-t border-red-100 flex items-center justify-between gap-2">
                <span className="text-[11px] text-stone-600 truncate">IP: {getApiBaseUrl().replace('/api', '')}</span>
                <button
                  type="button"
                  onClick={() => setServerConfigOpen(true)}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[10px] flex items-center gap-1 shadow-xs"
                >
                  <Settings className="w-3 h-3" />
                  <span>Configure IP</span>
                </button>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ananya Sen"
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-heritage-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ananya@example.com"
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-heritage-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-heritage-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-heritage-600 hover:bg-heritage-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            <span>Sign Up</span>
          </button>
        </form>

        {/* Guest Mode Option */}
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-stone-200"></div>
          <span className="flex-shrink mx-3 text-stone-400 text-[11px] uppercase font-bold tracking-wider">
            or continue as guest
          </span>
          <div className="flex-grow border-t border-stone-200"></div>
        </div>

        <button
          type="button"
          onClick={() => {
            continueAsGuest();
            navigate('/');
          }}
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-heritage-500/10 hover:from-amber-500/20 hover:to-heritage-500/20 border-2 border-dashed border-amber-500/40 hover:border-amber-600 text-stone-800 text-sm font-bold transition-all flex items-center justify-between gap-3 group shadow-xs active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/30 group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-stone-900 text-sm">Guest Login / गेस्ट लॉगिन</span>
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  Direct
                </span>
              </div>
              <span className="block text-[11px] text-stone-500 font-normal">
                Explore Culture Feed & ODOP Bazaar without sign-in
              </span>
            </div>
          </div>
          <span className="text-amber-700 text-sm font-extrabold group-hover:translate-x-1 transition-transform">
            →
          </span>
        </button>

        <p className="text-center text-xs text-stone-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-heritage-600 hover:underline">
            Sign In here
          </Link>
        </p>

        {/* Server IP quick config trigger */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-center">
          <button
            type="button"
            onClick={() => setServerConfigOpen(true)}
            className="text-[11px] text-stone-400 hover:text-amber-700 flex items-center gap-1 transition-colors"
          >
            <Server className="w-3 h-3 text-amber-500" />
            <span>Server: {getApiBaseUrl().replace('/api', '')}</span>
          </button>
        </div>
      </div>

      <ServerConfigModal
        isOpen={serverConfigOpen}
        onClose={() => setServerConfigOpen(false)}
      />
    </div>
  );
}
