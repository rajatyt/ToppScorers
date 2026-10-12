import React, { createContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';

export const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null);
  const [adminLoading, setAdminLoading] = useState(true);

  const refreshAdminUser = async () => {
    const token = localStorage.getItem('toppscorers_admin_token');
    if (!token) {
      setAdminUser(null);
      return null;
    }

    try {
      const res = await api.get('/auth/admin/me');
      setAdminUser(res.data.user || null);
      return res.data.user;
    } catch (err) {
      setAdminUser(null);
      localStorage.removeItem('toppscorers_admin_token');
      return null;
    }
  };

  useEffect(() => {
    const initAdmin = async () => {
      try {
        await refreshAdminUser();
      } finally {
        setAdminLoading(false);
      }
    };
    initAdmin();
  }, []);

  const adminLogin = async (email, password) => {
    try {
      const res = await api.post('/auth/admin/login', { email, password });
      if (res.data.token) {
        localStorage.setItem('toppscorers_admin_token', res.data.token);
      }
      setAdminUser(res.data.user);
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  const adminLogout = async () => {
    try {
      await api.post('/auth/admin/logout');
    } catch (err) {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('toppscorers_admin_token');
      setAdminUser(null);
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        adminLoading,
        isAdminAuthenticated: Boolean(adminUser && adminUser.role === 'admin'),
        adminLogin,
        adminLogout,
        refreshAdminUser
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};
