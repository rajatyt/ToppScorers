import React, { createContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.user || null);
      setProfile(res.data.profile || null);
      return res.data;
    } catch (err) {
      setUser(null);
      setProfile(null);
      return null;
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        await refreshUser();
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = async (identifier, password) => {
    try {
      sessionStorage.removeItem('verification_prompt_dismissed');
      const res = await api.post('/auth/login', { email: identifier, password });
      setUser(res.data.user);
      setProfile(res.data.profile || null);
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  const signup = async (data) => {
    try {
      sessionStorage.removeItem('verification_prompt_dismissed');
      const res = await api.post('/auth/signup', data);
      setUser(res.data.user);
      setProfile(res.data.profile || null);
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  const googleAuth = async ({ credential, role, city, area }) => {
    try {
      sessionStorage.removeItem('verification_prompt_dismissed');
      const res = await api.post('/auth/google', { credential, role, city, area });
      if (!res.data.isNewUser && !res.data.needsLocation && res.data.user) {
        setUser(res.data.user);
        setProfile(res.data.profile || null);
      }
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  const logout = async () => {
    try {
      sessionStorage.removeItem('verification_prompt_dismissed');
      await api.post('/auth/logout');
      setUser(null);
      setProfile(null);
    } catch (err) {
      sessionStorage.removeItem('verification_prompt_dismissed');
      setUser(null);
      setProfile(null);
      toast.error('Failed to logout');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAuthenticated: !!user,
        login,
        signup,
        googleAuth,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
