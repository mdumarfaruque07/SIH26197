import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('sih_heritage_token');
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
      if (localStorage.getItem('sih_heritage_guest') === 'true') {
        setUser({
          id: 0,
          name: 'Guest Tourist',
          email: 'guest@sanskriti.local',
          role: 'guest',
          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        });
      }
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const data = await authService.login({ email, password });
    if (data.success) {
      localStorage.setItem('sih_heritage_token', data.token);
      setUser(data.user);
      return data;
    }
    throw new Error(data.message || 'Login failed');
  };

  const register = async (name, email, password) => {
    const data = await authService.register({ name, email, password });
    if (data.success) {
      localStorage.setItem('sih_heritage_token', data.token);
      setUser(data.user);
      return data;
    }
    throw new Error(data.message || 'Registration failed');
  };

  const [isGuest, setIsGuest] = useState(() => {
    return localStorage.getItem('sih_heritage_guest') === 'true';
  });

  const continueAsGuest = () => {
    setIsGuest(true);
    localStorage.setItem('sih_heritage_guest', 'true');
    setUser({
      id: 0,
      name: 'Guest Tourist',
      email: 'guest@sanskriti.local',
      role: 'guest',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    });
  };

  const logout = () => {
    localStorage.removeItem('sih_heritage_token');
    localStorage.removeItem('sih_heritage_guest');
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
