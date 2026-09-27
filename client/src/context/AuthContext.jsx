import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('sanskriti_token') || localStorage.getItem('sih_heritage_token');
    if (token) {
      authService
        .getMe()
        .then((res) => {
          if (res.success) {
            setUser(res.user);
          } else {
            logout();
          }
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      if (localStorage.getItem('sanskriti_guest') === 'true' || localStorage.getItem('sih_heritage_guest') === 'true') {
        const defaultGuest = {
          id: 0,
          name: 'Guest Tourist',
          email: 'guest@sanskritikhoj.in',
          role: 'guest',
          bio: 'Exploring incredible heritage sites and traditions across India',
          city: 'New Delhi',
          phone: '',
          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        };
        try {
          const saved = localStorage.getItem('sanskriti_profile') || localStorage.getItem('sih_custom_profile');
          setUser(saved ? { ...defaultGuest, ...JSON.parse(saved) } : defaultGuest);
        } catch {
          setUser(defaultGuest);
        }
      }
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const data = await authService.login({ email, password });
    if (data.success) {
      localStorage.setItem('sanskriti_token', data.token);
      let userData = data.user;
      try {
        const saved = localStorage.getItem('sanskriti_profile');
        if (saved) userData = { ...userData, ...JSON.parse(saved) };
      } catch {}
      setUser(userData);
      return data;
    }
    throw new Error(data.message || 'Login failed');
  };

  const register = async (name, email, password) => {
    const data = await authService.register({ name, email, password });
    if (data.success) {
      localStorage.setItem('sanskriti_token', data.token);
      setUser(data.user);
      return data;
    }
    throw new Error(data.message || 'Registration failed');
  };

  const [isGuest, setIsGuest] = useState(() => {
    return localStorage.getItem('sanskriti_guest') === 'true' || localStorage.getItem('sih_heritage_guest') === 'true';
  });

  const continueAsGuest = () => {
    setIsGuest(true);
    localStorage.setItem('sanskriti_guest', 'true');
    const defaultGuest = {
      id: 0,
      name: 'Guest Tourist',
      email: 'guest@sanskritikhoj.in',
      role: 'guest',
      bio: 'Exploring incredible heritage sites and traditions across India',
      city: 'New Delhi',
      phone: '',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    };
    try {
      const saved = localStorage.getItem('sanskriti_profile') || localStorage.getItem('sih_custom_profile');
      setUser(saved ? { ...defaultGuest, ...JSON.parse(saved) } : defaultGuest);
    } catch {
      setUser(defaultGuest);
    }
  };

  const updateProfile = (updatedData) => {
    setUser((prev) => {
      const next = { ...(prev || {}), ...updatedData };
      try {
        localStorage.setItem('sanskriti_profile', JSON.stringify(next));
      } catch (e) {
        console.warn('Could not save custom profile:', e);
      }
      return next;
    });
  };

  const logout = () => {
    localStorage.removeItem('sanskriti_token');
    localStorage.removeItem('sanskriti_guest');
    localStorage.removeItem('sanskriti_profile');
    localStorage.removeItem('sih_heritage_token');
    localStorage.removeItem('sih_heritage_guest');
    localStorage.removeItem('sih_custom_profile');
    setIsGuest(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        updateProfile,
        logout,
        isGuest,
        continueAsGuest,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
