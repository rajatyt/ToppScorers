import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import ConnectModal from '../components/ConnectModal';
import ReportModal from '../components/ReportModal';
import { toast } from 'react-hot-toast';
import {
  FaCheckCircle, FaStar, FaMapMarkerAlt, FaBookmark, FaRegBookmark,
  FaChalkboardTeacher, FaUserGraduate, FaRupeeSign, FaShieldAlt,
  FaPhoneAlt, FaEnvelope, FaVideo, FaAward, FaCalendarAlt,
  FaClock, FaCompass, FaFlag, FaBan, FaArrowLeft
} from 'react-icons/fa';
import { FiLock, FiCheck, FiArrowRight } from 'react-icons/fi';

const ProfileDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, isAuthenticated } = useContext(AuthContext);

  const isTeacherRoute = location.pathname.startsWith('/teachers');
  const profileType = isTeacherRoute ? 'teacher' : 'student';

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [blocking, setBlocking] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const endpoint = isTeacherRoute ? `/teachers/${id}` : `/students/${id}`;
      const res = await api.get(endpoint);
      setProfile(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Profile not found or unavailable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [id, location.pathname]);

  // Check saved state
  useEffect(() => {
    if (isAuthenticated && profile?._id) {
      api.get('/saved/ids')
        .then(res => {
          const ids = new Set((res.data || []).map(s => s.profileId));
          setIsSaved(ids.has(profile._id));
        })
        .catch(() => {});
    }
  }, [isAuthenticated, profile?._id]);

  const handleToggleSave = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      const res = await api.post('/saved/toggle', {
        profileId: profile._id,
        profileType,
        targetUserId: profile.userId?._id
      });
      setIsSaved(res.data.isSaved);
      toast.success(res.data.message);
    } catch (err) {
      toast.error('Failed to update shortlist');
    }
  };

  const handleBlockUser = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const targetUserId = profile.userId?._id;
    if (!targetUserId) return;

    if (!window.confirm(`Are you sure you want to block ${profile.name || 'this user'}? You will no longer see each other's profiles.`)) {
      return;
    }

    setBlocking(true);
    try {
      await api.post('/blocks', { targetUserId });
      toast.success('User blocked');
      navigate(isTeacherRoute ? '/teachers' : '/students');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to block user');
    } finally {
      setBlocking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Loading Profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center max-w-md w-full shadow-xs">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FaBan size={28} />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-1">Profile Unavailable</h2>
          <p className="text-xs text-slate-500 mb-5">{error || 'This profile is paused, suspended, or blocked.'}</p>
          <Link
            to={isTeacherRoute ? '/teachers' : '/students'}
            className="inline-flex items-center px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold"
          >
            <FaArrowLeft className="mr-2" />
            Back to Directory
          </Link>
        </div>
      </div>
    );
  }

  const targetUser = profile.userId || {};
  const name = profile.name || targetUser.name || 'Verified Educator';
  const photo = profile.profilePhotoUrl || targetUser.avatar;
  const isOwner = user && targetUser._id && (user._id === targetUser._id || user.id === targetUser._id);
  const isConnected = profile.connectionStatus === 'accepted';
  const isPending = profile.connectionStatus === 'pending';
  const isGuest = profile.isGuestPreview || !isAuthenticated;

  const subjects = profile.subjects || profile.subjectsNeeded || [];
  const exams = profile.exams || (profile.classOrExam ? [profile.classOrExam] : []);
  const qualifications = profile.qualifications || [];
  const certifications = profile.certifications || [];

  return (
    <div className="min-h-screen bg-slate-50/70 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Guest Lock Banner */}
        {isGuest && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center space-x-3 text-amber-900 text-xs sm:text-sm">
              <div className="p-2 rounded-xl bg-amber-200 text-amber-900 flex-shrink-0">
                <FiLock size={18} />
              </div>
              <div>
                <span className="font-bold">Guest Preview Mode:</span> Direct connection and physical tuition coordination are arranged once you sign in and connect.
              </div>
            </div>
            <Link
              to="/login"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold whitespace-nowrap shadow-xs transition-colors flex items-center"
            >
              Sign In to Connect
              <FiArrowRight className="ml-1.5" />
            </Link>
          </div>
        )}

        {/* Back Link & Card Actions */}
        <div className="mb-5 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <FaArrowLeft className="mr-1.5" />
            Back
          </button>

          <div className="flex items-center space-x-2">
            {!isOwner && !isGuest && (
              <>
                <button
                  onClick={handleToggleSave}
                  className="inline-flex items-center text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs"
                >
                  {isSaved ? <FaBookmark className="text-amber-500 mr-1.5" /> : <FaRegBookmark className="mr-1.5" />}
                  {isSaved ? 'Saved' : 'Save'}
                </button>

                <button
                  onClick={() => setShowReportModal(true)}
                  className="p-2 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Report Profile"
                >
                  <FaFlag size={13} />
                </button>

                <button
                  onClick={handleBlockUser}
                  disabled={blocking}
                  className="p-2 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Block User"
                >
                  <FaBan size={13} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Profile Card Header */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs mb-6 relative overflow-hidden">
          <div className={`h-2.5 w-full absolute top-0 left-0 ${
            isTeacherRoute ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 'bg-gradient-to-r from-emerald-500 to-teal-400'
          }`} />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pt-2">
            <div className="flex items-start sm:items-center space-x-4 sm:space-x-5">
              <div className="relative flex-shrink-0">
                {photo ? (
                  <img
                    src={photo}
                    alt={name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-2 border-slate-100 shadow-md"
                  />
                ) : (
                  <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center text-white text-3xl font-bold shadow-md ${
                    isTeacherRoute ? 'bg-gradient-to-br from-amber-500 to-amber-600' : 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                  }`}>
                    {isTeacherRoute ? <FaChalkboardTeacher /> : <FaUserGraduate />}
                  </div>
                )}
                {profile.isVerified && (
                  <span className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm">
                    <FaCheckCircle className="text-emerald-500 text-base" />
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center space-x-2 flex-wrap mb-1">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                    {name}
                  </h1>
                  {profile.isVerified && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                      Verified
                    </span>
                  )}
                  {targetUser.isMinor && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                      Under 18 • Protected
                    </span>
                  )}
                </div>

                <div className="flex items-center text-xs text-slate-500 space-x-3 flex-wrap">
                  <span className="flex items-center">
                    <FaMapMarkerAlt className="text-amber-500 mr-1" />
                    {profile.area ? `${profile.area}, ` : ''}{profile.location?.city || 'India'}
                  </span>
                  {profile.approxDistanceKm !== null && profile.approxDistanceKm !== undefined && (
                    <span className="inline-flex items-center text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                      <FaCompass className="mr-1" />
                      ~{profile.approxDistanceKm} km away
                    </span>
                  )}
                  {isTeacherRoute && (
                    <span className="inline-flex items-center font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                      <FaStar className="text-amber-500 mr-1" />
                      {profile.rating || 4.8} ({profile.experience || 0} yrs exp)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Top Action Button */}
            {!isOwner && (
              <div className="w-full sm:w-auto">
                {isGuest ? (
                  <Link
                    to="/login"
                    className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm rounded-xl shadow-md transition-all hover:scale-[1.01]"
                  >
                    <FiLock className="mr-2" />
                    Sign In to Connect
                  </Link>
                ) : isConnected ? (
                  <div className="inline-flex items-center px-5 py-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs">
                    <FiCheck className="mr-1.5 text-emerald-600 text-base" />
                    Connected • Contact Details Unlocked
                  </div>
                ) : isPending ? (
                  <div className="inline-flex items-center px-5 py-2.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 font-bold text-xs">
                    <FaClock className="mr-1.5 text-amber-600" />
                    Connection Request Pending
                  </div>
                ) : (
                  <button
                    onClick={() => setShowConnectModal(true)}
                    className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl shadow-md transition-all hover:scale-[1.01]"
                  >
                    Connect / Request Details
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Two Column Layout: Main Details + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio or Goals */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-3">
                {isTeacherRoute ? 'About the Teacher' : 'Tuition Goals & Needs'}
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {profile.bio || profile.goals || 'Dedicated educator on ToppScorers committed to high concept clarity and student success.'}
              </p>
            </div>

            {/* Subjects & Exams */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-3">
                {isTeacherRoute ? 'Subjects & Exam Coaching' : 'Subjects Needed'}
              </h2>
              
              <div className="mb-4">
                <span className="text-xs font-bold text-slate-400 block mb-2">SUBJECTS</span>
                <div className="flex flex-wrap gap-2">
                  {subjects.length > 0 ? (
                    subjects.map((sub, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-slate-100 text-slate-800 text-xs font-bold rounded-xl"
                      >
                        {sub}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">All General Subjects</span>
                  )}
                </div>
              </div>

              {exams.length > 0 && (
                <div>
                  <span className="text-xs font-bold text-slate-400 block mb-2">TARGET EXAMS</span>
                  <div className="flex flex-wrap gap-2">
                    {exams.map((exam, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200/80 text-xs font-bold rounded-xl"
                      >
                        {exam}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Qualifications & Credentials */}
            {isTeacherRoute && (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
                <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-3">
                  Qualifications & Credentials
                </h2>
                {qualifications.length > 0 || certifications.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {qualifications.map((q, i) => (
                      <div key={i} className="flex items-center space-x-2 text-xs text-slate-700 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <FaGraduationCap className="text-amber-500 flex-shrink-0" />
                        <span className="font-semibold">{q}</span>
                      </div>
                    ))}
                    {certifications.map((c, i) => (
                      <div key={i} className="flex items-center space-x-2 text-xs text-slate-700 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                        <FaAward className="text-emerald-600 flex-shrink-0" />
                        <span className="font-semibold">{c}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-500">
                    Verified Educator on ToppScorers.
                  </div>
                )}
              </div>
            )}

            {/* Demo Lecture Video */}
            {Boolean(profile.demoVideoUrl) && (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
                <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-3 flex items-center">
                  <FaVideo className="text-amber-500 mr-2" />
                  Demo Lecture
                </h2>
                <div className="aspect-video bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center text-white">
                  <iframe
                    src={profile.demoVideoUrl}
                    title="Demo Lecture"
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Info (1 col) */}
          <div className="space-y-6">
            {/* Fee / Budget & Preference Box */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-4">
                Details & Schedule
              </h2>

              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-slate-400 font-bold uppercase block mb-1">
                    {isTeacherRoute ? 'Fee Structure' : 'Budget Range'}
                  </span>
                  <div className="text-base font-extrabold text-slate-900 flex items-center">
                    <FaRupeeSign className="text-xs mr-0.5 text-slate-500" />
                    {isTeacherRoute
                      ? (profile.fee?.amount ? `${profile.fee.amount.toLocaleString('en-IN')}/${profile.fee.period || 'mo'}` : 'Negotiable')
                      : (profile.budget?.max ? `₹${profile.budget.min || 1000} - ₹${profile.budget.max.toLocaleString('en-IN')}/mo` : 'Flexible')}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 font-bold uppercase block mb-1">Teaching Mode</span>
                  <span className="font-semibold text-slate-800 capitalize bg-slate-100 px-2.5 py-1 rounded-lg inline-block">
                    {profile.teachingMode || profile.preferences?.mode || 'Online & Offline'}
                  </span>
                </div>

                {isTeacherRoute ? (
                  <div>
                    <span className="text-slate-400 font-bold uppercase block mb-1">Availability</span>
                    <span className="font-semibold text-slate-800 flex items-center">
                      <FaCalendarAlt className="mr-1.5 text-slate-400" />
                      {profile.availability || 'Flexible'}
                    </span>
                  </div>
                ) : (
                  <div>
                    <span className="text-slate-400 font-bold uppercase block mb-1">Preferred Timing</span>
                    <span className="font-semibold text-slate-800 flex items-center">
                      <FaClock className="mr-1.5 text-slate-400" />
                      {profile.preferredTiming || 'Evening batches'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Address & Contact Privacy Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
              <div className="flex items-center space-x-2 text-slate-900 font-extrabold text-sm uppercase tracking-wider mb-4">
                <FaShieldAlt className="text-amber-500" />
                <span>Contact & Privacy</span>
              </div>

              {/* Address info */}
              <div className="mb-4 text-xs">
                <span className="text-slate-400 font-bold uppercase block mb-1">Location</span>
                <p className="font-semibold text-slate-800">
                  {profile.area ? `${profile.area}, ` : ''}{profile.location?.city || 'India'}
                </p>

                {profile.fullAddress ? (
                  <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 font-medium">
                    <span className="text-[10px] font-bold uppercase text-emerald-700 block mb-0.5">
                      Full Address (Unlocked)
                    </span>
                    {profile.fullAddress}
                    {profile.location?.pincode && ` - ${profile.location.pincode}`}
                  </div>
                ) : (
                  <div className="mt-2 p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-500 text-[11px] flex items-center">
                    <FiLock className="mr-2 text-slate-400 flex-shrink-0" />
                    Exact street address is shared once connection is accepted.
                  </div>
                )}
              </div>

              {/* Tuition Coordination & Privacy */}
              <div className="text-xs">
                <span className="text-slate-400 font-bold uppercase block mb-1">Tuition Coordination & Privacy</span>
                {isOwner && profile.userId?.phone ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-950 text-xs">
                    <span className="font-bold block text-slate-900">Your Registered Phone: {profile.userId.phone}</span>
                    <span className="text-[11px] text-amber-800">Kept strictly confidential. Only visible to you and ToppScorers coordinators.</span>
                  </div>
                ) : profile.connectionStatus === 'accepted' ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 text-[11px] space-y-1">
                    <div className="font-bold flex items-center text-emerald-900">
                      <FaShieldAlt className="mr-1.5 text-emerald-600" />
                      Connected • Tuition Coordination Active
                    </div>
                    <p className="text-emerald-800 leading-relaxed">
                      Our ToppScorers coordinator will contact both parties to schedule your demo class and finalize tuition arrangements. Direct phone numbers remain private.
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-600 text-[11px] space-y-1">
                    <div className="flex items-center font-bold text-slate-700">
                      <FiLock className="mr-1.5 text-slate-400 flex-shrink-0" />
                      Protected Mediation Model
                    </div>
                    <p className="text-slate-500 leading-relaxed">
                      Direct phone numbers are never shared publicly. To ensure safety and teaching quality, ToppScorers coordinates directly between students and teachers to arrange physical tuitions.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Connect Modal */}
      <ConnectModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        targetProfile={profile}
        onSuccess={fetchProfile}
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetUserId={targetUser._id}
        targetName={name}
      />
    </div>
  );
};

export default ProfileDetail;
