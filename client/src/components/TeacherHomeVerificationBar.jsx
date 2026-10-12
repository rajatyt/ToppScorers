import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import {
  FaShieldAlt, FaCheckCircle, FaClock, FaExclamationTriangle,
  FaArrowRight, FaAward, FaEdit
} from 'react-icons/fa';

const TeacherHomeVerificationBar = () => {
  const { t } = useTranslation();
  const { user, profile, isAuthenticated } = useContext(AuthContext);

  if (!isAuthenticated || user?.role !== 'teacher') {
    return null;
  }

  const isVerified = profile?.isVerified === true || profile?.verificationStatus === 'verified';
  const hasSubmitted = Boolean(profile?.verificationSubmittedAt);
  const isPending = (profile?.verificationStatus === 'pending' || profile?.approvalStatus === 'pending') && hasSubmitted;
  const isRejected = profile?.verificationStatus === 'rejected';
  const isUnverified = !isVerified && !isPending && !isRejected;

  return (
    <div className="w-full transition-all">
      {/* 1. Unverified State (Skipped) */}
      {isUnverified && (
        <div className="bg-gradient-to-r from-amber-500/15 via-amber-50 to-orange-50 border-b border-amber-300/80 px-4 py-3 sm:px-6 shadow-xs">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center flex-shrink-0 shadow-xs font-bold">
                <FaShieldAlt size={18} />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-black text-amber-950 uppercase tracking-wider">
                    {t('homeBar.unverifiedTitle')}
                  </span>
                  <span className="text-[10px] font-bold bg-amber-200/90 text-amber-900 px-2 py-0.5 rounded-full">
                    {t('homeBar.actionNeeded')}
                  </span>
                </div>
                <p className="text-xs text-amber-900 mt-0.5">
                  {t('homeBar.unverifiedDesc')}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 flex-shrink-0">
              <Link
                to="/verification"
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-black shadow-xs transition-all hover:scale-[1.02]"
              >
                <span>{t('homeBar.getVerifiedNow')}</span>
                <FaArrowRight className="ml-1.5" size={11} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 2. Pending Review State */}
      {isPending && (
        <div className="bg-gradient-to-r from-blue-500/15 via-blue-50 to-indigo-50 border-b border-blue-200 px-4 py-3 sm:px-6 shadow-xs">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <FaClock size={18} className="animate-spin-slow" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-black text-blue-950 uppercase tracking-wider">
                    {t('homeBar.pendingTitle')}
                  </span>
                  <span className="text-[10px] font-bold bg-blue-200 text-blue-900 px-2 py-0.5 rounded-full">
                    {t('homeBar.underReviewBadge')}
                  </span>
                </div>
                <p className="text-xs text-blue-900 mt-0.5">
                  {t('homeBar.pendingDesc')}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 flex-shrink-0">
              <Link
                to="/verification"
                className="inline-flex items-center px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                {t('homeBar.checkDetails')}
                <FaArrowRight className="ml-1.5" size={11} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 3. Rejected State */}
      {isRejected && (
        <div className="bg-gradient-to-r from-rose-500/15 via-rose-50 to-pink-50 border-b border-rose-300 px-4 py-3 sm:px-6 shadow-xs">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <FaExclamationTriangle size={18} />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-black text-rose-950 uppercase tracking-wider">
                    {t('homeBar.rejectedTitle')}
                  </span>
                  <span className="text-[10px] font-bold bg-rose-200 text-rose-900 px-2 py-0.5 rounded-full">
                    {t('homeBar.actionNeeded')}
                  </span>
                </div>
                <p className="text-xs text-rose-900 mt-0.5">
                  {profile?.rejectionReason ? `Reason: ${profile.rejectionReason}` : 'Your submitted credentials require updates before approval.'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 flex-shrink-0">
              <Link
                to="/verification"
                className="inline-flex items-center px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                {t('homeBar.updateResubmit')}
                <FaArrowRight className="ml-1.5" size={11} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 4. Verified State (Active Badge Indicator on Home) */}
      {isVerified && (
        <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-50 to-teal-50 border-b border-emerald-300/80 px-4 py-2.5 sm:px-6 shadow-2xs">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <FaCheckCircle size={16} />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-extrabold text-emerald-950">
                    {t('homeBar.verifiedTitle')}
                  </span>
                  <span className="text-[10px] font-extrabold bg-emerald-200 text-emerald-900 px-2.5 py-0.5 rounded-full flex items-center space-x-1 shadow-2xs">
                    <FaAward className="text-emerald-700 text-[10px]" />
                    <span>{t('homeBar.verifiedBadge')}</span>
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800">
                  {t('homeBar.verifiedDesc')}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 flex-shrink-0">
              <Link
                to="/profile"
                className="inline-flex items-center px-3 py-1 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold transition-colors"
              >
                <FaEdit className="mr-1 text-[11px]" />
                {t('homeBar.modifyProfile')}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherHomeVerificationBar;
