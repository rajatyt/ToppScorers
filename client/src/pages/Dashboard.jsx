import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import ProfileCard from '../components/ProfileCard';
import { toast } from 'react-hot-toast';
import {
  FaUserGraduate, FaChalkboardTeacher, FaInbox, FaPaperPlane,
  FaCheckCircle, FaEye, FaBookmark, FaCog, FaShieldAlt, FaArrowRight,
  FaClock, FaExclamationTriangle, FaAward
} from 'react-icons/fa';
import { FiSliders, FiUser, FiLock } from 'react-icons/fi';

const Dashboard = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState(null);
  const [savedProfiles, setSavedProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

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
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl mb-8 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs uppercase tracking-wider mb-2">
                {isTeacher ? 'Teacher Control Center' : 'Student Control Center'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-xs text-slate-300 mt-1">
                {isTeacher
                  ? 'Manage incoming tuition requests, profile visibility, and track educator analytics.'
                  : 'Manage saved teachers, active tuition requests, and learning goals.'}
              </p>
            </div>

            <Link
              to="/settings"
              className="inline-flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors"
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

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {isTeacher ? (
            <>
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
                  <FaInbox size={18} />
                </div>
                <div className="text-2xl font-extrabold text-slate-900">{metrics?.incomingCount || 0}</div>
                <div className="text-xs text-slate-500 font-medium">Incoming Requests</div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
                  <FaPaperPlane size={16} />
                </div>
                <div className="text-2xl font-extrabold text-slate-900">{metrics?.sentCount || 0}</div>
                <div className="text-xs text-slate-500 font-medium">Sent Requests</div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                  <FaCheckCircle size={18} />
                </div>
                <div className="text-2xl font-extrabold text-slate-900">{metrics?.acceptedCount || 0}</div>
                <div className="text-xs text-slate-500 font-medium">Connected</div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3">
                  <FaEye size={18} />
                </div>
                <div className="text-2xl font-extrabold text-slate-900">{metrics?.profileViewsCount || 0}</div>
                <div className="text-xs text-slate-500 font-medium">Profile Views</div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
                  <FaBookmark size={18} />
                </div>
                <div className="text-2xl font-extrabold text-slate-900">{metrics?.savedCount || 0}</div>
                <div className="text-xs text-slate-500 font-medium">Saved Teachers</div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
                  <FaPaperPlane size={16} />
                </div>
                <div className="text-2xl font-extrabold text-slate-900">{metrics?.sentCount || 0}</div>
                <div className="text-xs text-slate-500 font-medium">Sent Requests</div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3">
                  <FaInbox size={18} />
                </div>
                <div className="text-2xl font-extrabold text-slate-900">{metrics?.incomingCount || 0}</div>
                <div className="text-xs text-slate-500 font-medium">Incoming Requests</div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                  <FaCheckCircle size={18} />
                </div>
                <div className="text-2xl font-extrabold text-slate-900">{metrics?.acceptedCount || 0}</div>
                <div className="text-xs text-slate-500 font-medium">Connected</div>
              </div>
            </>
          )}
        </div>

        {/* Quick Shortcuts */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs mb-8">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to={isTeacher ? '/students' : '/teachers'}
              className="p-4 rounded-2xl border border-slate-200/80 hover:border-amber-400 hover:bg-amber-50/40 flex items-center justify-between group transition-all"
            >
              <div>
                <div className="font-bold text-slate-900 text-sm">
                  {isTeacher ? 'Browse Students' : 'Find Teachers'}
                </div>
                <div className="text-xs text-slate-500">
                  {isTeacher ? 'View tuition openings' : 'Search verified tutors'}
                </div>
              </div>
              <FaArrowRight className="text-slate-400 group-hover:text-amber-600 transition-colors" />
            </Link>

            <Link
              to="/connections"
              className="p-4 rounded-2xl border border-slate-200/80 hover:border-emerald-400 hover:bg-emerald-50/40 flex items-center justify-between group transition-all"
            >
              <div>
                <div className="font-bold text-slate-900 text-sm">Connections & Requests</div>
                <div className="text-xs text-slate-500">Respond to tuition requests</div>
              </div>
              <FaArrowRight className="text-slate-400 group-hover:text-emerald-600 transition-colors" />
            </Link>

            <Link
              to="/settings"
              className="p-4 rounded-2xl border border-slate-200/80 hover:border-blue-400 hover:bg-blue-50/40 flex items-center justify-between group transition-all"
            >
              <div>
                <div className="font-bold text-slate-900 text-sm">Privacy & Profile</div>
                <div className="text-xs text-slate-500">Address & phone settings</div>
              </div>
              <FaArrowRight className="text-slate-400 group-hover:text-blue-600 transition-colors" />
            </Link>
          </div>
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
