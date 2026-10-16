import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import {
  FaShieldAlt, FaCheckCircle, FaTimes, FaArrowRight,
  FaPhoneAlt, FaEnvelope, FaUser, FaUserGraduate, FaExclamationTriangle
} from 'react-icons/fa';

const StudentVerificationPromptModal = () => {
  const { t } = useTranslation();
  const { user, profile, isAuthenticated, refreshUser } = useContext(AuthContext);
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [skipping, setSkipping] = useState(false);

  // Form states
  const [role, setRole] = useState('parent'); // 'parent' or 'student'
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Only applies to authenticated students
    if (!isAuthenticated || user?.role !== 'student') {
      setIsOpen(false);
      return;
    }

    const dismissed = sessionStorage.getItem('student_verification_prompt_dismissed');
    const isVerified = profile?.isVerified === true && profile?.verificationStatus === 'verified';
    const hasSubmitted = Boolean(profile?.verificationSubmittedAt) || profile?.verificationStatus === 'pending';

    // Show popup as soon as student logs in if not verified and not submitted yet and not dismissed in this session
    if (!isVerified && !hasSubmitted && !dismissed) {
      setName(user?.name || '');
      setPhone(user?.phone || profile?.verificationPhone || '');
      setEmail(user?.email || profile?.verificationEmail || '');
      setRole(profile?.studentOrParentRole || 'parent');
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setIsOpen(false);
    }
  }, [isAuthenticated, user?._id, user?.role, profile?.isVerified, profile?.verificationStatus, profile?.verificationSubmittedAt]);

  useEffect(() => {
    const handleOpen = () => {
      setName(user?.name || '');
      setPhone(user?.phone || profile?.verificationPhone || '');
      setEmail(user?.email || profile?.verificationEmail || '');
      setRole(profile?.studentOrParentRole || 'parent');
      setIsOpen(true);
    };
    window.addEventListener('open-student-verification-modal', handleOpen);
    return () => window.removeEventListener('open-student-verification-modal', handleOpen);
  }, [user, profile]);

  if (!isOpen) return null;

  const handleSkip = async () => {
    setSkipping(true);
    try {
      await api.post('/students/verification/skip');
    } catch (e) {
      // Ignore network error on skip
    } finally {
      sessionStorage.setItem('student_verification_prompt_dismissed', 'true');
      setIsOpen(false);
      setSkipping(false);
      toast('Verification skipped for this session', { icon: 'ℹ️' });
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');

    const cleanDigits = phone.replace(/\D/g, '');
    if (!cleanDigits || cleanDigits.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/students/verification/verify-contact', {
        name: name.trim(),
        email: email.trim(),
        phone: cleanDigits.slice(-10),
        studentOrParentRole: role
      });

      sessionStorage.setItem('student_verification_prompt_dismissed', 'true');
      setIsOpen(false);
      if (refreshUser) await refreshUser();

      toast.success(res.data?.message || 'Details submitted! Your account is now under review and will be verified by our team.');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to verify contact details. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const isVerifiedModal = profile?.isVerified === true && profile?.verificationStatus === 'verified';
  const isPendingModal = (profile?.verificationStatus === 'pending' || Boolean(profile?.verificationSubmittedAt)) && !isVerifiedModal;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4 overflow-y-auto animate-fadeInUp">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 sm:p-8 border border-slate-100 relative overflow-hidden">
        {/* Top Decorative accent banner */}
        <div className={`h-2 w-full absolute top-0 left-0 ${
          isVerifiedModal
            ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600'
            : isPendingModal
            ? 'bg-gradient-to-r from-blue-500 via-indigo-400 to-blue-600'
            : 'bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500'
        }`} />

        {/* Close / Skip Button */}
        <button
          onClick={handleSkip}
          disabled={skipping || submitting}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          title="Skip for now"
          type="button"
        >
          <FaTimes size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3.5 mb-4 pt-1">
          <div className={`w-13 h-13 rounded-2xl text-white flex items-center justify-center shadow-lg flex-shrink-0 ${
            isVerifiedModal
              ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-emerald-500/20'
              : isPendingModal
              ? 'bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-blue-500/20'
              : 'bg-gradient-to-tr from-amber-500 to-orange-500 shadow-amber-500/20'
          }`}>
            <FaShieldAlt size={24} />
          </div>
          <div>
            <span className={`text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
              isVerifiedModal
                ? 'text-emerald-800 bg-emerald-100'
                : isPendingModal
                ? 'text-blue-800 bg-blue-100'
                : 'text-amber-800 bg-amber-100'
            }`}>
              {isVerifiedModal ? 'Verified Account ✅' : isPendingModal ? 'Status: Under Admin Review ⏳' : 'Contact Verification Required'}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              {isVerifiedModal ? 'Verified Contact Details' : isPendingModal ? 'Contact Details In Review' : 'Confirm Student / Parent Details'}
            </h2>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 leading-relaxed mb-4">
          {isVerifiedModal
            ? 'Your account is verified! You can update your contact phone number and email anytime below.'
            : isPendingModal
            ? 'Your details have been submitted to the admin queue. Our team is verifying your contact information. Direct teacher outreach unlocks as soon as approved.'
            : 'To ensure real and safe tuition connections across Prayagraj, confirm your contact details. After admin verification, direct teacher outreach will be unlocked.'}
        </p>

        {/* Form */}
        <form onSubmit={handleVerify} className="space-y-3.5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
              <FaExclamationTriangle className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Role selector: Parent vs Student */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Who is verifying this account?
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('parent')}
                className={`py-2 px-3 rounded-xl border text-xs font-extrabold flex items-center justify-center space-x-2 transition-all ${
                  role === 'parent'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <FaUser size={12} className={role === 'parent' ? 'text-emerald-600' : 'text-slate-400'} />
                <span>Parent / Guardian</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`py-2 px-3 rounded-xl border text-xs font-extrabold flex items-center justify-center space-x-2 transition-all ${
                  role === 'student'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <FaUserGraduate size={12} className={role === 'student' ? 'text-emerald-600' : 'text-slate-400'} />
                <span>Student</span>
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <FaUser size={13} />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Verma"
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                required
              />
            </div>
          </div>

          {/* Contact Phone */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Primary Mobile Number (WhatsApp / Call)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 font-bold text-xs">
                +91
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={10}
                placeholder="9876543210"
                className="w-full pl-12 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all tracking-wider"
                required
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Used strictly for genuine tuition coordination between verified teachers and parents.
            </p>
          </div>

          {/* Contact Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email ID
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <FaEnvelope size={13} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="parent@example.com"
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                required
              />
            </div>
          </div>

          {/* Trust Highlights */}
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl space-y-1.5 text-[11px] text-slate-600">
            <div className="flex items-center space-x-2 text-emerald-700 font-bold">
              <FaCheckCircle size={12} />
              <span>Genuine Learner / Parent Verification badge on your profile</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              <span>Your phone number is protected and only shared with verified tutors upon mutual confirmation.</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleSkip}
              disabled={skipping || submitting}
              className="w-full sm:w-auto flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all disabled:opacity-50 text-center cursor-pointer"
            >
              {skipping ? 'Skipping...' : 'Skip for Now'}
            </button>

            <button
              type="submit"
              disabled={submitting || skipping}
              className="w-full sm:w-auto flex-1 py-2.5 px-5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-600/25 transition-all hover:scale-[1.02] flex items-center justify-center space-x-1.5 disabled:opacity-60 cursor-pointer"
            >
              <span>
                {submitting
                  ? 'Submitting...'
                  : isVerifiedModal
                  ? 'Save Updated Details'
                  : isPendingModal
                  ? 'Update Submitted Details'
                  : 'Submit for Admin Review'}
              </span>
              <FaArrowRight size={11} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentVerificationPromptModal;
