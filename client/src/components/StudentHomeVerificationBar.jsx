import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FaShieldAlt, FaCheckCircle, FaArrowRight, FaClock, FaExclamationTriangle } from 'react-icons/fa';

const StudentHomeVerificationBar = () => {
  const { user, profile, isAuthenticated } = useContext(AuthContext);

  if (!isAuthenticated || user?.role !== 'student') {
    return null;
  }

  const isVerified = profile?.isVerified === true && profile?.verificationStatus === 'verified';
  const hasSubmitted = Boolean(profile?.verificationSubmittedAt);
  const isPending = (profile?.verificationStatus === 'pending' || hasSubmitted) && !isVerified && profile?.verificationStatus !== 'rejected';
  const isRejected = profile?.verificationStatus === 'rejected';
  const isUnverified = !isVerified && !isPending && !isRejected;

  const handleOpenModal = () => {
    window.dispatchEvent(new CustomEvent('open-student-verification-modal'));
  };

  return (
    <div className="w-full transition-all">
      {/* 1. Unverified State */}
      {isUnverified && (
        <div className="bg-gradient-to-r from-amber-500/15 via-amber-50 to-orange-50 border-b border-amber-300/80 px-4 py-2.5 sm:px-6 shadow-xs">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center flex-shrink-0 shadow-xs font-bold">
                <FaShieldAlt size={16} />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-black text-amber-950 uppercase tracking-wider">
                    Confirm Genuine Student / Parent Contact
                  </span>
                  <span className="text-[10px] font-bold bg-amber-200/90 text-amber-900 px-2 py-0.5 rounded-full">
                    Action Needed
                  </span>
                </div>
                <p className="text-xs text-amber-900 mt-0.5">
                  Confirm your email & contact phone number to establish genuine intent. Outreach to teachers unlocks after admin verification.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 flex-shrink-0">
              <button
                type="button"
                onClick={handleOpenModal}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-black shadow-xs transition-all hover:scale-[1.02] cursor-pointer"
              >
                <span>Verify Contact Now</span>
                <FaArrowRight className="ml-1.5" size={11} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Pending Review State */}
      {isPending && (
        <div className="bg-gradient-to-r from-blue-500/15 via-blue-50 to-indigo-50 border-b border-blue-200 px-4 py-2.5 sm:px-6 shadow-xs">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <FaClock size={16} className="animate-spin-slow" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-black text-blue-950 uppercase tracking-wider">
                    Contact Verification Under Review
                  </span>
                  <span className="text-[10px] font-bold bg-blue-200 text-blue-900 px-2 py-0.5 rounded-full">
                    Under Review ⏳
                  </span>
                </div>
                <p className="text-xs text-blue-900 mt-0.5">
                  Your contact details ({profile?.verificationPhone || user?.phone}) are submitted. Our team will verify your account shortly to unlock teacher requests.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 flex-shrink-0">
              <button
                type="button"
                onClick={handleOpenModal}
                className="inline-flex items-center px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <span>Review Details</span>
                <FaArrowRight className="ml-1.5" size={11} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Rejected State */}
      {isRejected && (
        <div className="bg-gradient-to-r from-rose-500/15 via-rose-50 to-pink-50 border-b border-rose-300 px-4 py-2.5 sm:px-6 shadow-xs">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs font-bold">
                <FaExclamationTriangle size={16} />
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
                <p className="text-xs text-rose-900 mt-0.5">
                  {profile?.rejectionReason || 'Contact details could not be verified.'} Update your phone or email to request verification.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 flex-shrink-0">
              <button
                type="button"
                onClick={handleOpenModal}
                className="inline-flex items-center px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <span>Update & Resubmit</span>
                <FaArrowRight className="ml-1.5" size={11} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Verified State */}
      {isVerified && (
        <div className="bg-emerald-50/70 border-b border-emerald-200/60 px-4 py-1.5 sm:px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2 text-[11px] text-emerald-800 font-bold">
              <FaCheckCircle className="text-emerald-600" size={13} />
              <span>
                Genuine {profile?.studentOrParentRole === 'parent' ? 'Parent' : 'Student'} Account Verified ✅
              </span>
              <span className="text-slate-400 font-normal hidden sm:inline">—</span>
              <span className="text-emerald-700/80 font-normal text-[11px] hidden sm:inline">
                Verified Contact: {profile?.verificationPhone || user?.phone} ({profile?.verificationEmail || user?.email})
              </span>
            </div>
            <button
              type="button"
              onClick={handleOpenModal}
              className="text-[10px] font-extrabold text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
            >
              Update Contact
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentHomeVerificationBar;
