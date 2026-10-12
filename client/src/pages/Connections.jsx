import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import { toast } from 'react-hot-toast';
import {
  FaUserFriends, FaInbox, FaPaperPlane, FaCheckCircle,
  FaTimesCircle, FaMapMarkerAlt, FaEnvelope, FaShieldAlt
} from 'react-icons/fa';
import { FiClock, FiCheck, FiX, FiArrowRight } from 'react-icons/fi';

const Connections = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useContext(AuthContext);
  const { unreadCounts, markSectionViewed } = useContext(NotificationContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('incoming'); // 'incoming' | 'outgoing' | 'accepted'
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/connections', { params: { type: activeTab } });
      setRequests(res.data || []);
    } catch (err) {
      toast.error('Failed to load connection requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchRequests();
      // WhatsApp / Instagram style: viewing the section instantly clears its notification count!
      markSectionViewed(activeTab);
    }
  }, [activeTab, isAuthenticated]);

  const handleAction = async (requestId, action) => {
    setActionLoading(requestId);
    try {
      const res = await api.patch(`/connections/${requestId}`, { action });
      toast.success(res.data.message);
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${action} request`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-xs uppercase tracking-wider mb-2">
              <FaUserFriends className="mr-1.5" />
              Network & Requests
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900">
              Connection Requests
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Review incoming tuition inquiries and manage accepted educator-student connections.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-white border border-slate-200/80 rounded-2xl mb-6 shadow-xs max-w-md">
          <button
            onClick={() => {
              setActiveTab('incoming');
              markSectionViewed('incoming');
            }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-all relative ${
              activeTab === 'incoming'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FaInbox size={13} />
            <span>Incoming</span>
            {unreadCounts?.incoming > 0 && (
              <span className="ml-1 px-1.5 py-0.2 text-[10px] font-black bg-rose-500 text-white rounded-full animate-pulse shadow-xs">
                {unreadCounts.incoming}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab('outgoing');
              markSectionViewed('outgoing');
            }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-all relative ${
              activeTab === 'outgoing'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FaPaperPlane size={12} />
            <span>Sent</span>
            {unreadCounts?.sent > 0 && (
              <span className="ml-1 px-1.5 py-0.2 text-[10px] font-black bg-rose-500 text-white rounded-full animate-pulse shadow-xs">
                {unreadCounts.sent}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab('accepted');
              markSectionViewed('accepted');
            }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-all relative ${
              activeTab === 'accepted'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FaCheckCircle size={13} />
            <span>Connected</span>
            {unreadCounts?.accepted > 0 && (
              <span className="ml-1 px-1.5 py-0.2 text-[10px] font-black bg-emerald-500 text-white rounded-full animate-pulse shadow-xs">
                {unreadCounts.accepted}
              </span>
            )}
          </button>
        </div>

        {/* List of Requests */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs animate-pulse flex items-center space-x-4">
                <div className="w-12 h-12 bg-slate-200 rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded-md w-1/3" />
                  <div className="h-3 bg-slate-100 rounded-md w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-xs">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
              <FaInbox size={26} />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              No {activeTab} connection requests
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              {activeTab === 'incoming'
                ? 'You do not have any pending requests from other users.'
                : activeTab === 'outgoing'
                ? 'You have not sent any connection requests yet.'
                : 'You have not formed any accepted connections yet.'}
            </p>
            <Link
              to={user?.role === 'teacher' ? '/students' : '/teachers'}
              className="inline-flex items-center px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
            >
              Browse Directory
              <FiArrowRight className="ml-1.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((item) => {
              const otherUser = item.otherUser || {};
              const otherProfile = item.otherProfile || {};
              const isIncoming = item.isIncoming;
              const isAccepted = item.status === 'accepted';
              const isDeclined = item.status === 'declined';

              return (
                <div
                  key={item._id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start space-x-4 min-w-0 flex-1">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-lg flex-shrink-0">
                      {otherUser.avatar ? (
                        <img src={otherUser.avatar} alt={otherUser.name} className="w-full h-full rounded-2xl object-cover" />
                      ) : (
                        otherUser.name?.charAt(0) || 'U'
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2 flex-wrap mb-0.5">
                        <span className="font-bold text-slate-900 text-sm">
                          {otherUser.name}
                        </span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 capitalize">
                          {otherUser.role}
                        </span>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                          isAccepted
                            ? 'bg-emerald-50 text-emerald-700'
                            : isDeclined
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}>
                          {item.status.toUpperCase()}
                        </span>
                      </div>

                      {/* Location and subjects */}
                      <p className="text-xs text-slate-500 mb-2">
                        {otherProfile.location?.city ? `${otherProfile.location.city} • ` : ''}
                        {otherProfile.subjects?.join(', ') || otherProfile.subjectsNeeded?.join(', ') || ''}
                      </p>

                      {/* Message sent with request */}
                      {item.message && (
                        <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-700 italic">
                          "{item.message}"
                        </div>
                      )}

                      {/* Platform Mediation & Coordination Card when accepted */}
                      {isAccepted && (
                        <div className="mt-3 p-3 bg-emerald-50/90 border border-emerald-200/90 rounded-xl text-xs text-emerald-950">
                          <div className="flex items-center space-x-1.5 font-bold text-emerald-900 mb-1">
                            <FaShieldAlt className="text-emerald-600 flex-shrink-0" size={13} />
                            <span>ToppScorers Tuition Coordination Active</span>
                          </div>
                          <p className="text-[11px] text-emerald-800 leading-relaxed">
                            For security and privacy, phone numbers remain protected. Our verified ToppScorers coordinator will contact both you and <strong>{otherUser.name || 'this member'}</strong> to finalize class timings, arrange demo classes, and oversee physical tuitions.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 w-full sm:w-auto justify-end pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    {isIncoming && item.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleAction(item._id, 'decline')}
                          disabled={actionLoading === item._id}
                          className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                          <FiX className="inline mr-1" />
                          Decline
                        </button>
                        <button
                          onClick={() => handleAction(item._id, 'accept')}
                          disabled={actionLoading === item._id}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
                        >
                          <FiCheck className="inline mr-1" />
                          Accept & Share
                        </button>
                      </>
                    )}

                    {otherProfile._id && (
                      <Link
                        to={otherUser.role === 'teacher' ? `/teachers/${otherProfile._id}` : `/students/${otherProfile._id}`}
                        className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 transition-colors"
                      >
                        Profile
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Connections;
