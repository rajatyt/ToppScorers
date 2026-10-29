import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import ProfileCard from '../components/ProfileCard';
import { toast } from 'react-hot-toast';
import {
  FaUserGraduate, FaChalkboardTeacher, FaInbox, FaPaperPlane,
  FaCheckCircle, FaEye, FaBookmark, FaCog, FaShieldAlt, FaArrowRight,
  FaClock, FaExclamationTriangle, FaAward, FaUserFriends, FaMapMarkerAlt,
  FaQuoteLeft, FaUserEdit, FaQuestionCircle
} from 'react-icons/fa';
import { FiSliders, FiUser, FiLock, FiRefreshCw } from 'react-icons/fi';
import { NotificationContext } from '../context/NotificationContext';

const Dashboard = () => {
  const { t } = useTranslation();
  const { user, profile, isAuthenticated } = useContext(AuthContext);
  const { unreadCounts, fetchUnreadCounts, markSectionViewed } = useContext(NotificationContext);
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState(null);
  const [savedProfiles, setSavedProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Connection management state
  const [activeTab, setActiveTab] = useState('incoming'); // 'incoming' | 'outgoing' | 'accepted'
  const [requests, setRequests] = useState([]);
  const [connectionsLoading, setConnectionsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        const [metricsRes, savedRes] = await Promise.all([
          api.get('/auth/dashboard-metrics'),
          user?.role === 'student' ? api.get('/saved') : Promise.resolve({ data: [] })
        ]);
        setMetrics(metricsRes.data);
        setSavedProfiles(savedRes.data || []);
      } catch (err) {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated, user?.role, navigate]);

  const fetchConnections = async (tab = activeTab) => {
    setConnectionsLoading(true);
    try {
      const res = await api.get('/connections', { params: { type: tab } });
      setRequests(res.data || []);
    } catch (err) {
      // Quiet fail if initial network glitch
    } finally {
      setConnectionsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchConnections(activeTab);
      if (markSectionViewed) {
        markSectionViewed(activeTab);
      }
    }
  }, [activeTab, isAuthenticated]);

  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');
    const hash = (location.hash || window.location.hash || '').replace('#', '');
    const target = tabParam || hash;

    if (target) {
      if (['incoming', 'outgoing', 'accepted'].includes(target)) {
        setActiveTab(target);
      } else if (target === 'requests' || target === 'pending') {
        setActiveTab(user?.role === 'teacher' ? 'incoming' : 'outgoing');
      } else if (target === 'connected' || target === 'connections') {
        setActiveTab('accepted');
      }
      setTimeout(() => {
        document.getElementById('connections-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    }
  }, [location.hash, location.search, user?.role]);

  const handleConnectionAction = async (requestId, action) => {
    setActionLoading(requestId);
    try {
      const res = await api.patch(`/connections/${requestId}`, { action });
      toast.success(res.data.message || `Request ${action}ed`);
      await fetchConnections(activeTab);
      const metricsRes = await api.get('/auth/dashboard-metrics');
      setMetrics(metricsRes.data);
      if (fetchUnreadCounts) fetchUnreadCounts();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${action} request`);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isTeacher = user?.role === 'teacher';
  const completeness = metrics?.completeness || 40;

  return (
    <div className="min-h-screen bg-slate-50/70 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-[#070b14] via-[#0d1c2d] to-[#1a1208] border border-amber-500/30 text-white rounded-3xl p-6 sm:p-8 shadow-2xl mb-8 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs uppercase tracking-wider border border-amber-500/30 shadow-sm">
                  {isTeacher ? 'Teacher Control Center' : 'Student Control Center'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                {isTeacher
                  ? 'Manage incoming tuition requests, profile visibility, and track educator analytics.'
                  : 'Manage saved teachers, active tuition requests, and learning goals.'}
              </p>
            </div>

            <Link
              to="/settings"
              className="inline-flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/15 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <FaCog className="mr-1.5" />
              Settings & Privacy
            </Link>
          </div>

          {/* Profile Completeness Bar */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex items-center justify-between text-xs font-bold mb-2">
              <span className="text-slate-300">Profile Completeness</span>
              <span className="text-amber-400">{completeness}%</span>
            </div>
            <div className="w-full bg-slate-700/60 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-amber-400 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${completeness}%` }}
              />
            </div>
            {completeness < 100 && (
              <p className="text-[11px] text-slate-400 mt-2">
                Tip: Complete your subjects, exam targets, and address details to receive more tuition matches.
              </p>
            )}
          </div>
        </div>

        {/* Student Verification Status Banner */}
        {!isTeacher && (
          <div className="mb-8">
            {profile?.isVerified || profile?.verificationStatus === 'verified' ? (
              <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-500/10 via-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs font-bold">
                    <FaCheckCircle size={20} />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-black text-emerald-950 uppercase tracking-wider">
                        Genuine {profile?.studentOrParentRole === 'parent' ? 'Parent' : 'Student'} Account Verified ✅
                      </span>
                      <span className="text-[10px] font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">
                        Full Access
                      </span>
                    </div>
                    <p className="text-xs text-emerald-900/90 mt-0.5">
                      Your phone ({profile?.verificationPhone || user?.phone}) and email are verified. You can freely send direct tuition requests to verified teachers.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('open-student-verification-modal'))}
                  className="px-3.5 py-1.5 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Update Contact
                </button>
              </div>
            ) : profile?.verificationStatus === 'pending' ? (
              <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-500/10 via-blue-50 to-indigo-50 border border-blue-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs font-bold">
                    <FaClock size={20} />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-black text-blue-950 uppercase tracking-wider">
                        Contact Verification Under Admin Review
                      </span>
                      <span className="text-[10px] font-bold bg-blue-200 text-blue-900 px-2 py-0.5 rounded-full">
                        Pending
                      </span>
                    </div>
                    <p className="text-xs text-blue-900/90 mt-0.5">
                      Our team will contact you shortly via call/WhatsApp ({profile?.verificationPhone || user?.phone}) to verify your requirement. Direct teacher outreach unlocks as soon as approved.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('open-student-verification-modal'))}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  Edit Contact Info
                </button>
              </div>
            ) : profile?.verificationStatus === 'rejected' ? (
              <div className="p-4 sm:p-5 bg-gradient-to-r from-rose-500/10 via-rose-50 to-pink-50 border border-rose-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs font-bold">
                    <FaExclamationTriangle size={20} />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-black text-rose-950 uppercase tracking-wider">
                        Verification Needs Attention
                      </span>
                      <span className="text-[10px] font-bold bg-rose-200 text-rose-900 px-2 py-0.5 rounded-full">
                        Action Needed
                      </span>
                    </div>
                    <p className="text-xs text-rose-900/90 mt-0.5">
                      {profile?.rejectionReason || 'Contact details could not be verified.'} Update your phone/email to request admin verification.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('open-student-verification-modal'))}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  Resubmit Details
                </button>
              </div>
            ) : (
              <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-500/10 via-amber-50 to-orange-50 border border-amber-300 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center flex-shrink-0 shadow-xs font-bold">
                    <FaShieldAlt size={20} />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-black text-amber-950 uppercase tracking-wider">
                        Account Unverified — Teacher Outreach Locked
                      </span>
                      <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                        Action Required
                      </span>
                    </div>
                    <p className="text-xs text-amber-900/90 mt-0.5">
                      Confirm your contact phone & email so teachers know you are a genuine parent or student. Sending requests to teachers will unlock upon verification.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('open-student-verification-modal'))}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-black shadow-xs transition-all hover:scale-[1.02] cursor-pointer"
                >
                  Verify Contact Now
                </button>
              </div>
            )}
          </div>
        )}

        {/* Quick Actions Launchpad */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>⚡ Quick Actions</span>
            </h2>
            <span className="text-[11px] text-slate-400 font-medium">Fast navigation shortcuts</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {isTeacher ? (
              <>
                <Link
                  to="/students"
                  className="group bg-white hover:bg-emerald-50/50 p-4 rounded-2xl border border-slate-200/80 hover:border-emerald-400 transition-all shadow-xs hover:shadow-md flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <FaUserGraduate size={18} />
                    </div>
                    <FaArrowRight className="text-slate-300 group-hover:text-emerald-600 transition-colors text-xs" />
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-900 text-sm group-hover:text-emerald-950">
                      Browse Students
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Explore tuition openings
                    </div>
                  </div>
                </Link>

                <Link
                  to="/profile?tab=general"
                  className="group bg-white hover:bg-amber-50/50 p-4 rounded-2xl border border-slate-200/80 hover:border-amber-400 transition-all shadow-xs hover:shadow-md flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <FaUserEdit size={18} />
                    </div>
                    <FaArrowRight className="text-slate-300 group-hover:text-amber-600 transition-colors text-xs" />
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-900 text-sm group-hover:text-amber-950">
                      Personal & Tutoring Info
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Name, subjects, fees & bio
                    </div>
                  </div>
                </Link>

                <Link
                  to="/verification"
                  className="group bg-white hover:bg-indigo-50/50 p-4 rounded-2xl border border-slate-200/80 hover:border-indigo-400 transition-all shadow-xs hover:shadow-md flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <FaAward size={18} />
                    </div>
                    <FaArrowRight className="text-slate-300 group-hover:text-indigo-600 transition-colors text-xs" />
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-900 text-sm group-hover:text-indigo-950">
                      Verification
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Badges & credentials
                    </div>
                  </div>
                </Link>

                <Link
                  to="/queries"
                  className="group bg-white hover:bg-sky-50/50 p-4 rounded-2xl border border-slate-200/80 hover:border-sky-400 transition-all shadow-xs hover:shadow-md flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <FaQuestionCircle size={18} />
                    </div>
                    {unreadCounts?.queries > 0 ? (
                      <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black animate-pulse">
                        {unreadCounts.queries}
                      </span>
                    ) : (
                      <FaArrowRight className="text-slate-300 group-hover:text-sky-600 transition-colors text-xs" />
                    )}
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-900 text-sm group-hover:text-sky-950 flex items-center gap-1.5">
                      <span>Help & Doubts</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Admin tuition support
                    </div>
                  </div>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/teachers"
                  className="group bg-white hover:bg-amber-50/50 p-4 rounded-2xl border border-slate-200/80 hover:border-amber-400 transition-all shadow-xs hover:shadow-md flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <FaChalkboardTeacher size={18} />
                    </div>
                    <FaArrowRight className="text-slate-300 group-hover:text-amber-600 transition-colors text-xs" />
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-900 text-sm group-hover:text-amber-950">
                      Find Tutors
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Search verified tutors
                    </div>
                  </div>
                </Link>

                <Link
                  to="/settings"
                  className="group bg-white hover:bg-emerald-50/50 p-4 rounded-2xl border border-slate-200/80 hover:border-emerald-400 transition-all shadow-xs hover:shadow-md flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <FaUserEdit size={18} />
                    </div>
                    <FaArrowRight className="text-slate-300 group-hover:text-emerald-600 transition-colors text-xs" />
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-900 text-sm group-hover:text-emerald-950">
                      Edit Profile
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Class & target subjects
                    </div>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('open-student-verification-modal'))}
                  className="group text-left bg-white hover:bg-emerald-50/50 p-4 rounded-2xl border border-slate-200/80 hover:border-emerald-400 transition-all shadow-xs hover:shadow-md flex flex-col justify-between cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <FaShieldAlt size={18} />
                    </div>
                    {(profile?.isVerified || profile?.contactVerified) ? (
                      <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Verified ✅
                      </span>
                    ) : (
                      <span className="text-[10px] font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                        Verify Now
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-900 text-sm group-hover:text-emerald-950">
                      Contact Verification
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {(profile?.isVerified || profile?.contactVerified) ? 'Genuine family verified' : 'Confirm phone & email'}
                    </div>
                  </div>
                </button>

                <Link
                  to="/queries"
                  className="group bg-white hover:bg-sky-50/50 p-4 rounded-2xl border border-slate-200/80 hover:border-sky-400 transition-all shadow-xs hover:shadow-md flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <FaQuestionCircle size={18} />
                    </div>
                    {unreadCounts?.queries > 0 ? (
                      <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black animate-pulse">
                        {unreadCounts.queries}
                      </span>
                    ) : (
                      <FaArrowRight className="text-slate-300 group-hover:text-sky-600 transition-colors text-xs" />
                    )}
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-900 text-sm group-hover:text-sky-950 flex items-center gap-1.5">
                      <span>Help & Doubts</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Admin tuition support
                    </div>
                  </div>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Teacher Verification Status Card */}
        {isTeacher && (
          <div className="mb-8">
            {metrics?.verificationStatus === 'verified' && (
              <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-50 to-teal-50 border-2 border-emerald-500/30 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                <div className="flex items-start sm:items-center space-x-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                    <FaCheckCircle size={24} />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-base font-extrabold text-emerald-950">
                        Verified Educator Status
                      </h3>
                      <span className="bg-emerald-200 text-emerald-900 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full">
                        Active ✅
                      </span>
                    </div>
                    <p className="text-xs text-emerald-800 mt-1 max-w-xl">
                      Your identity and teaching credentials have been verified by the ToppScorers team.
                      Your Verified Badge is active, and you have full access to initiate tuition requests to students.
                    </p>
                  </div>
                </div>

                <Link
                  to="/verification"
                  className="inline-flex items-center justify-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex-shrink-0"
                >
                  <FaAward className="mr-1.5" />
                  View Credentials
                </Link>
              </div>
            )}

            {metrics?.verificationStatus === 'pending' && (
              <div className="bg-gradient-to-r from-amber-500/15 via-amber-50 to-orange-50 border-2 border-amber-400 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                <div className="flex items-start sm:items-center space-x-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                    <FaClock size={24} className="animate-spin-slow" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-base font-extrabold text-amber-950">
                        Verification Under Admin Review
                      </h3>
                      <span className="bg-amber-200 text-amber-900 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full">
                        In Progress ⏳
                      </span>
                    </div>
                    <p className="text-xs text-amber-800 mt-1 max-w-xl">
                      Your documents are being checked in our admin queue (takes 24–48h).
                      Students can contact you right now. Direct student connection requests will unlock upon approval!
                    </p>
                  </div>
                </div>

                <Link
                  to="/verification"
                  className="inline-flex items-center justify-center px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-xs flex-shrink-0"
                >
                  Check Verification Status
                  <FaArrowRight className="ml-1.5" />
                </Link>
              </div>
            )}

            {metrics?.verificationStatus === 'rejected' && (
              <div className="bg-gradient-to-r from-rose-500/15 via-rose-50 to-pink-50 border-2 border-rose-400 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                <div className="flex items-start sm:items-center space-x-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                    <FaExclamationTriangle size={22} />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-base font-extrabold text-rose-950">
                        Verification Needs Attention
                      </h3>
                      <span className="bg-rose-200 text-rose-900 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full">
                        Action Required ⚠️
                      </span>
                    </div>
                    <p className="text-xs text-rose-800 mt-1 max-w-xl font-medium">
                      Reason: <span className="font-semibold">{metrics.rejectionReason || 'Please review your document credentials.'}</span>
                    </p>
                  </div>
                </div>

                <Link
                  to="/verification"
                  className="inline-flex items-center justify-center px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex-shrink-0"
                >
                  Update & Resubmit
                  <FaArrowRight className="ml-1.5" />
                </Link>
              </div>
            )}

            {(!metrics?.verificationStatus || metrics?.verificationStatus === 'unverified') && (
              <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-amber-950 text-white rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
                <div className="flex items-start sm:items-center space-x-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <FaShieldAlt size={22} />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-base font-extrabold text-white">
                        Get Verified to Send Requests to Students
                      </h3>
                      <span className="bg-amber-400/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Recommended
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 max-w-xl">
                      Currently you can receive student inquiries, but you cannot reach out to students directly.
                      Verify your degree & identity (or mark NA if not applicable) to earn your Verified Educator Badge!
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  <Link
                    to="/verification"
                    className="inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md hover:scale-[1.02]"
                  >
                    Complete Verification
                    <FaArrowRight className="ml-1.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stats Grid - Clickable to toggle and focus connection tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {isTeacher ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('incoming');
                  markSectionViewed?.('incoming');
                  document.getElementById('connections-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`text-left p-5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
                  activeTab === 'incoming'
                    ? 'bg-amber-50/90 border-amber-400 ring-2 ring-amber-400/40 shadow-sm'
                    : 'bg-white border-slate-200/80 hover:border-amber-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                    <FaInbox size={18} />
                  </div>
                  {unreadCounts?.incoming > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
                      NEW
                    </span>
                  )}
                </div>
                <div className="text-2xl sm:text-3xl font-display tabular-nums font-black text-slate-900">{metrics?.incomingCount || 0}</div>
                <div className="text-xs text-slate-500 font-medium">Incoming Requests</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('outgoing');
                  markSectionViewed?.('outgoing');
                  document.getElementById('connections-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`text-left p-5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
                  activeTab === 'outgoing'
                    ? 'bg-blue-50/90 border-blue-400 ring-2 ring-blue-400/40 shadow-sm'
                    : 'bg-white border-slate-200/80 hover:border-blue-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
                  <FaPaperPlane size={16} />
                </div>
                <div className="text-2xl sm:text-3xl font-display tabular-nums font-black text-slate-900">{metrics?.sentCount || 0}</div>
                <div className="text-xs text-slate-500 font-medium">Sent Requests</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('accepted');
                  markSectionViewed?.('accepted');
                  document.getElementById('connections-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`text-left p-5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
                  activeTab === 'accepted'
                    ? 'bg-emerald-50/90 border-emerald-400 ring-2 ring-emerald-400/40 shadow-sm'
                    : 'bg-white border-slate-200/80 hover:border-emerald-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                  <FaCheckCircle size={18} />
                </div>
                <div className="text-2xl sm:text-3xl font-display tabular-nums font-black text-slate-900">{metrics?.acceptedCount || 0}</div>
                <div className="text-xs text-slate-500 font-medium">Connected</div>
              </button>

              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3">
                  <FaEye size={18} />
                </div>
                <div className="text-2xl sm:text-3xl font-display tabular-nums font-black text-slate-900">{metrics?.profileViewsCount || 0}</div>
                <div className="text-xs text-slate-500 font-medium">Profile Views</div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
                  <FaBookmark size={18} />
                </div>
                <div className="text-2xl sm:text-3xl font-display tabular-nums font-black text-slate-900">{metrics?.savedCount || 0}</div>
                <div className="text-xs text-slate-500 font-medium">Saved Teachers</div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('outgoing');
                  markSectionViewed?.('outgoing');
                  document.getElementById('connections-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`text-left p-5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
                  activeTab === 'outgoing'
                    ? 'bg-blue-50/90 border-blue-400 ring-2 ring-blue-400/40 shadow-sm'
                    : 'bg-white border-slate-200/80 hover:border-blue-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
                  <FaPaperPlane size={16} />
                </div>
                <div className="text-2xl sm:text-3xl font-display tabular-nums font-black text-slate-900">{metrics?.sentCount || 0}</div>
                <div className="text-xs text-slate-500 font-medium">Sent Requests</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('incoming');
                  markSectionViewed?.('incoming');
                  document.getElementById('connections-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`text-left p-5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
                  activeTab === 'incoming'
                    ? 'bg-purple-50/90 border-purple-400 ring-2 ring-purple-400/40 shadow-sm'
                    : 'bg-white border-slate-200/80 hover:border-purple-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                    <FaInbox size={18} />
                  </div>
                  {unreadCounts?.incoming > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
                      NEW
                    </span>
                  )}
                </div>
                <div className="text-2xl sm:text-3xl font-display tabular-nums font-black text-slate-900">{metrics?.incomingCount || 0}</div>
                <div className="text-xs text-slate-500 font-medium">Incoming Requests</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('accepted');
                  markSectionViewed?.('accepted');
                  document.getElementById('connections-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`text-left p-5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
                  activeTab === 'accepted'
                    ? 'bg-emerald-50/90 border-emerald-400 ring-2 ring-emerald-400/40 shadow-sm'
                    : 'bg-white border-slate-200/80 hover:border-emerald-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                  <FaCheckCircle size={18} />
                </div>
                <div className="text-2xl sm:text-3xl font-display tabular-nums font-black text-slate-900">{metrics?.acceptedCount || 0}</div>
                <div className="text-xs text-slate-500 font-medium">Connected</div>
              </button>
            </>
          )}
        </div>

        {/* Embedded Complete Connection Section */}
        <div id="connections-section" className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs mb-8 scroll-mt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[11px] uppercase tracking-wider">
                  <FaUserFriends className="mr-1 text-amber-600" />
                  Tuition Network & Direct Inquiries
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Connections & Tuition Inquiries
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isTeacher
                  ? 'Manage direct tuition inquiries sent by students, review your applications, and track active tuitions.'
                  : 'Manage outreach to verified educators, review incoming tutor proposals, and track active classes.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => fetchConnections(activeTab)}
              disabled={connectionsLoading}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-xs font-bold text-slate-700 transition-all cursor-pointer shadow-2xs self-start sm:self-center disabled:opacity-50"
              title="Refresh requests"
            >
              <FiRefreshCw className={`text-xs ${connectionsLoading ? 'animate-spin text-amber-600' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Segmented Tab Navigation */}
          <div className="flex p-1.5 bg-slate-100/80 border border-slate-200/80 rounded-2xl my-6 shadow-2xs max-w-md">
            <button
              type="button"
              onClick={() => {
                setActiveTab('incoming');
                markSectionViewed?.('incoming');
              }}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer relative ${
                activeTab === 'incoming'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <FaInbox size={13} className={activeTab === 'incoming' ? 'text-amber-400' : 'text-slate-400'} />
              <span>Incoming</span>
              {(unreadCounts?.incoming > 0 || (metrics?.incomingCount > 0 && activeTab !== 'incoming')) && (
                <span className={`ml-1 px-1.5 py-0.2 text-[10px] font-black rounded-full shadow-xs ${
                  unreadCounts?.incoming > 0
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-slate-200 text-slate-700'
                }`}>
                  {unreadCounts?.incoming || metrics?.incomingCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('outgoing');
                markSectionViewed?.('outgoing');
              }}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer relative ${
                activeTab === 'outgoing'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <FaPaperPlane size={12} className={activeTab === 'outgoing' ? 'text-blue-400' : 'text-slate-400'} />
              <span>Sent</span>
              {metrics?.sentCount > 0 && (
                <span className={`ml-1 px-1.5 py-0.2 text-[10px] font-black rounded-full shadow-xs ${
                  activeTab === 'outgoing' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {metrics?.sentCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('accepted');
                markSectionViewed?.('accepted');
              }}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer relative ${
                activeTab === 'accepted'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <FaCheckCircle size={13} className={activeTab === 'accepted' ? 'text-emerald-400' : 'text-slate-400'} />
              <span>Connected</span>
              {metrics?.acceptedCount > 0 && (
                <span className={`ml-1 px-1.5 py-0.2 text-[10px] font-black rounded-full shadow-xs ${
                  activeTab === 'accepted' ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {metrics?.acceptedCount}
                </span>
              )}
            </button>
          </div>

          {/* Request List or Skeletons or Empty States */}
          {connectionsLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 animate-pulse flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-200 flex-shrink-0" />
                  <div className="flex-1 space-y-2.5">
                    <div className="h-4 bg-slate-200 rounded-md w-1/4" />
                    <div className="h-3 bg-slate-200 rounded-md w-1/2" />
                    <div className="h-10 bg-slate-100 rounded-xl w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : requests.length === 0 ? (
            <div className="p-8 sm:p-12 text-center rounded-2xl bg-slate-50/70 border border-dashed border-slate-300">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 shadow-2xs">
                {activeTab === 'incoming' ? (
                  <FaInbox size={22} />
                ) : activeTab === 'outgoing' ? (
                  <FaPaperPlane size={20} />
                ) : (
                  <FaCheckCircle size={22} />
                )}
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-1">
                {activeTab === 'incoming'
                  ? 'No incoming tuition requests right now'
                  : activeTab === 'outgoing'
                  ? 'No sent inquiries currently pending'
                  : 'No active tuition connections yet'}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mb-5 leading-relaxed">
                {activeTab === 'incoming'
                  ? isTeacher
                    ? 'When students or parents look for tuition in your subjects, their inquiries will appear right here with their learning goals and requirements.'
                    : 'Educators who reach out regarding your learning requirements will be listed here for your approval.'
                  : activeTab === 'outgoing'
                  ? isTeacher
                    ? 'You haven’t initiated connection requests to students yet. Check student tuition requirements in your area and reach out directly!'
                    : 'You haven’t sent tuition requests to tutors yet. Find top-rated teachers near you and connect directly!'
                  : 'Once a tuition request is accepted by both parties, ToppScorers physical tuition coordination activates and appears here.'}
              </p>
              <Link
                to={isTeacher ? '/students' : '/teachers'}
                className="inline-flex items-center px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                <span>{isTeacher ? 'Browse Tuition Requirements' : 'Explore Verified Teachers'}</span>
                <FaArrowRight className="ml-1.5 text-[10px]" />
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
                const isPending = item.status === 'pending';
                const isOtherTeacher = otherUser.role === 'teacher';
                const profileId = otherProfile._id;
                const profileUrl = isOtherTeacher ? `/teachers/${profileId}` : `/students/${profileId}`;
                const subjectsList = isOtherTeacher ? otherProfile.subjects : otherProfile.subjectsNeeded;
                const locationCity = otherProfile.location?.city || '';
                const locationArea = otherProfile.area || '';
                const fullLoc = [locationArea, locationCity].filter(Boolean).join(', ');

                return (
                  <div
                    key={item._id}
                    className="p-5 sm:p-6 rounded-2xl border border-slate-200/90 hover:border-slate-300 bg-white transition-all shadow-2xs space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      {/* Left: Avatar + Identity */}
                      <div className="flex items-start space-x-3.5 min-w-0 flex-1">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 text-white font-black text-lg flex items-center justify-center flex-shrink-0 shadow-xs overflow-hidden border border-slate-200">
                          {otherUser.avatar ? (
                            <img
                              src={otherUser.avatar}
                              alt={otherUser.name || 'Member'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>{otherUser.name?.charAt(0) || 'U'}</span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2 flex-wrap gap-y-1 mb-1">
                            <span className="font-extrabold text-slate-900 text-sm sm:text-base">
                              {otherUser.name || 'Platform Member'}
                            </span>

                            {/* Role Badge */}
                            {isOtherTeacher ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                                <FaChalkboardTeacher className="text-amber-600 text-[10px]" />
                                Educator
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-900 border border-emerald-200">
                                <FaUserGraduate className="text-emerald-600 text-[10px]" />
                                Student / Parent
                              </span>
                            )}

                            {/* Status Badge */}
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                                isAccepted
                                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                  : isDeclined
                                  ? 'bg-rose-100 text-rose-900 border border-rose-200'
                                  : 'bg-amber-100 text-amber-900 border border-amber-200'
                              }`}
                            >
                              {isAccepted ? 'Connected ✅' : isDeclined ? 'Declined' : 'Pending In Review'}
                            </span>
                          </div>

                          {/* Location & Subjects */}
                          <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                            {fullLoc && (
                              <span className="inline-flex items-center text-slate-600 font-medium">
                                <FaMapMarkerAlt className="text-amber-500 mr-1 text-[11px]" />
                                {fullLoc}
                              </span>
                            )}
                            {item.createdAt && (
                              <span className="text-[11px] text-slate-400">
                                {new Date(item.createdAt).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center space-x-2 w-full sm:w-auto justify-end pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        {isIncoming && isPending && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleConnectionAction(item._id, 'decline')}
                              disabled={actionLoading === item._id}
                              className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer disabled:opacity-50"
                            >
                              Decline
                            </button>
                            <button
                              type="button"
                              onClick={() => handleConnectionAction(item._id, 'accept')}
                              disabled={actionLoading === item._id}
                              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                              <FaCheckCircle className="text-xs" />
                              <span>Accept & Connect</span>
                            </button>
                          </>
                        )}

                        {profileId && (
                          <Link
                            to={profileUrl}
                            className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 transition-colors shadow-2xs"
                          >
                            <span>Profile</span>
                            <FaArrowRight className="text-[9px]" />
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* Subjects pills if available */}
                    {Array.isArray(subjectsList) && subjectsList.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 mr-1">
                          {isOtherTeacher ? 'Teaches:' : 'Subjects Needed:'}
                        </span>
                        {subjectsList.slice(0, 5).map((sub, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-bold text-[11px] border border-slate-200/60"
                          >
                            {sub}
                          </span>
                        ))}
                        {subjectsList.length > 5 && (
                          <span className="text-[10px] text-slate-400 font-semibold">
                            +{subjectsList.length - 5} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Message from sender */}
                    {item.message && (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs text-slate-700 leading-relaxed flex items-start gap-2 shadow-2xs">
                        <FaQuoteLeft className="text-amber-400 text-xs mt-0.5 flex-shrink-0" />
                        <span className="italic">{item.message}</span>
                      </div>
                    )}

                    {/* Active Tuition Coordination Banner for Accepted Connections */}
                    {isAccepted && (
                      <div className="p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-300/80 rounded-2xl text-xs text-emerald-950 shadow-2xs">
                        <div className="flex items-center space-x-1.5 font-extrabold text-emerald-950 mb-1">
                          <FaShieldAlt className="text-emerald-600 flex-shrink-0" size={14} />
                          <span>ToppScorers Tuition Coordination Active</span>
                        </div>
                        <p className="text-[11px] text-emerald-800 leading-relaxed">
                          For security and privacy, phone numbers remain protected. Our verified ToppScorers coordinator will contact both you and <strong>{otherUser.name || 'this member'}</strong> to finalize class timings, arrange demo classes, and oversee physical tuitions.
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Saved Teachers section for students */}
        {!isTeacher && savedProfiles.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">
                Your Saved Teachers ({savedProfiles.length})
              </h2>
              <Link to="/teachers" className="text-xs text-amber-600 font-bold hover:underline">
                Explore More
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {savedProfiles.slice(0, 3).map((item) => (
                <ProfileCard
                  key={item._id}
                  profile={item.profile}
                  type="teacher"
                  isSaved={true}
                  onToggleSave={async (pId, pType, tId) => {
                    await api.post('/saved/toggle', { profileId: pId, profileType: pType, targetUserId: tId });
                    setSavedProfiles(prev => prev.filter(p => p.profile._id !== pId));
                    toast.success('Removed from shortlist');
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
