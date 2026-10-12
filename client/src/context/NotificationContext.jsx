import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import api from '../api/axios';
import { AuthContext } from './AuthContext';
import { AdminAuthContext } from './AdminAuthContext';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const { adminUser } = useContext(AdminAuthContext);

  const [unreadCounts, setUnreadCounts] = useState({
    incoming: 0,
    sent: 0,
    accepted: 0,
    queries: 0,
    total: 0
  });

  const [adminUnread, setAdminUnread] = useState({
    connections: 0,
    verifications: 0,
    reports: 0,
    queries: 0,
    total: 0
  });

  // Fetch client user connection & query unread counts
  const fetchUnreadCounts = useCallback(async () => {
    if (!isAuthenticated) {
      setUnreadCounts({ incoming: 0, sent: 0, accepted: 0, queries: 0, total: 0 });
      return;
    }
    try {
      const [connRes, queryRes] = await Promise.all([
        api.get('/connections/unread-counts').catch(() => ({ data: {} })),
        api.get('/queries/unread-count').catch(() => ({ data: { unread: 0 } }))
      ]);

      const incoming = connRes.data?.incoming || 0;
      const sent = connRes.data?.sent || 0;
      const accepted = connRes.data?.accepted || 0;
      const queries = queryRes.data?.unread || 0;

      setUnreadCounts({
        incoming,
        sent,
        accepted,
        queries,
        total: incoming + sent + accepted + queries
      });
    } catch (err) {
      // Quiet fail if network/unauth
    }
  }, [isAuthenticated]);

  // Fetch admin unread counts
  const fetchAdminUnreadCounts = useCallback(async () => {
    if (!adminUser) {
      setAdminUnread({ connections: 0, verifications: 0, reports: 0, queries: 0, total: 0 });
      return;
    }
    try {
      const res = await api.get('/admin/unread-counts');
      if (res.data) {
        setAdminUnread({
          connections: res.data.connections || 0,
          verifications: res.data.verifications || 0,
          reports: res.data.reports || 0,
          queries: res.data.queries || 0,
          total: res.data.total || 0
        });
      }
    } catch (err) {
      // Quiet fail
    }
  }, [adminUser]);

  // Instantly mark a user section as viewed (WhatsApp/Instagram style instant clearance)
  const markSectionViewed = useCallback(async (type) => {
    if (!isAuthenticated) return;

    // Immediate optimistic update so badge vanishes with zero delay
    setUnreadCounts(prev => {
      let incoming = prev.incoming;
      let sent = prev.sent;
      let accepted = prev.accepted;
      let queries = prev.queries;

      if (type === 'incoming') incoming = 0;
      else if (type === 'outgoing' || type === 'sent') sent = 0;
      else if (type === 'accepted' || type === 'connected') accepted = 0;
      else if (type === 'queries') queries = 0;
      else if (type === 'all') {
        incoming = 0;
        sent = 0;
        accepted = 0;
        queries = 0;
      }

      return {
        incoming,
        sent,
        accepted,
        queries,
        total: incoming + sent + accepted + queries
      };
    });

    try {
      if (type === 'queries') {
        await api.post('/queries/mark-viewed');
      } else {
        await api.post('/connections/mark-viewed', { type });
      }
    } catch (err) {
      console.error('Failed to mark section viewed:', err);
    }
  }, [isAuthenticated]);

  // Instantly mark an admin section as viewed
  const markAdminSectionViewed = useCallback(async (section) => {
    if (!adminUser) return;

    // Immediate optimistic update
    setAdminUnread(prev => {
      let connections = prev.connections;
      let verifications = prev.verifications;
      let reports = prev.reports;
      let queries = prev.queries;

      if (section === 'connections') connections = 0;
      else if (section === 'verifications') verifications = 0;
      else if (section === 'reports') reports = 0;
      else if (section === 'queries') queries = 0;
      else if (section === 'all') {
        connections = 0;
        verifications = 0;
        reports = 0;
        queries = 0;
      }

      return {
        connections,
        verifications,
        reports,
        queries,
        total: connections + verifications + reports + queries
      };
    });

    try {
      await api.post('/admin/mark-viewed', { section });
    } catch (err) {
      console.error('Failed to mark admin section viewed:', err);
    }
  }, [adminUser]);

  // Periodic live sync (every 15 seconds) & on window focus
  useEffect(() => {
    fetchUnreadCounts();
    fetchAdminUnreadCounts();

    const interval = setInterval(() => {
      fetchUnreadCounts();
      fetchAdminUnreadCounts();
    }, 15000);

    const handleFocus = () => {
      fetchUnreadCounts();
      fetchAdminUnreadCounts();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchUnreadCounts, fetchAdminUnreadCounts]);

  return (
    <NotificationContext.Provider
      value={{
        unreadCounts,
        adminUnread,
        fetchUnreadCounts,
        fetchAdminUnreadCounts,
        markSectionViewed,
        markAdminSectionViewed
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
