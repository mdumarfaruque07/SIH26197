import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Landmark, AlertCircle, Loader2, Sparkles, Compass } from 'lucide-react';

export default function LoginPage() {
  const { login, continueAsGuest } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-stone-200 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-heritage-600 text-white flex items-center justify-center mx-auto shadow-md shadow-heritage-600/30">
            <Landmark className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-stone-900">Welcome Back</h2>
          <p className="text-xs text-stone-500">Sign in to share heritage moments, rate sites, and save bookmarks</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rahul@example.com"
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
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
            <span>Sign In</span>
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

        {/* Quick Demo Autofill Bar */}
        <div className="pt-2 border-t border-stone-100">
          <p className="text-[11px] text-stone-400 font-medium mb-2 text-center">
            Quick Demo Accounts (1-Click Fill):
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillCredentials('admin@heritage.gov.in', 'password123')}
              className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-[11px] font-semibold transition-colors"
            >
              👑 Demo Admin
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('rahul@example.com', 'password123')}
              className="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-700 text-[11px] font-semibold transition-colors"
            >
              👤 Demo Visitor
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-stone-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-heritage-600 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
