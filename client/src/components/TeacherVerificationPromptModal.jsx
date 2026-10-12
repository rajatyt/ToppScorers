import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import {
  FaShieldAlt, FaCheckCircle, FaTimes, FaArrowRight,
  FaAward, FaPaperPlane, FaUserGraduate, FaExclamationTriangle
} from 'react-icons/fa';

const TeacherVerificationPromptModal = () => {
  const { t } = useTranslation();
  const { user, profile, isAuthenticated, refreshUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [skipping, setSkipping] = useState(false);

  useEffect(() => {
    // Only applies to authenticated teachers
    if (!isAuthenticated || user?.role !== 'teacher') {
      setIsOpen(false);
      return;
    }

    // Do not show modal if already on the verification form page
    if (location.pathname === '/verification') {
      setIsOpen(false);
      return;
    }

    const dismissed = sessionStorage.getItem('verification_prompt_dismissed');
    const isVerified = profile?.isVerified === true || profile?.verificationStatus === 'verified';

    // Show popup as soon as user logs in if not verified and not dismissed in this login session
    if (!isVerified && !dismissed) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 400);
      return () => clearTimeout(timer);
    } else {
      setIsOpen(false);
    }
  }, [isAuthenticated, user?._id, user?.role, profile?.isVerified, profile?.verificationStatus, location.pathname]);

  if (!isOpen) return null;

  const handleVerifyNow = () => {
    sessionStorage.setItem('verification_prompt_dismissed', 'true');
    setIsOpen(false);
    navigate('/verification');
  };

  const handleSkip = async () => {
    setSkipping(true);
    try {
      await api.post('/teachers/verification/skip');
      sessionStorage.setItem('verification_prompt_dismissed', 'true');
      setIsOpen(false);
      if (refreshUser) refreshUser();

      // Show the meaningful snackbar / toast alert requested by the user
      toast.custom(
        (toastObj) => (
          <div
            className={`${
              toastObj.visible ? 'animate-enter' : 'animate-leave'
            } max-w-lg w-full bg-slate-950 text-white shadow-2xl rounded-2xl p-4 border border-amber-500/40 flex items-start space-x-3 pointer-events-auto`}
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <FaExclamationTriangle size={18} />
            </div>
            <div className="flex-1">
              <div className="text-xs font-black text-amber-400 uppercase tracking-wider mb-0.5">
                {t('promptModal.snackbarTitle', 'Verification Skipped — Limited Outreach')}
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {t(
                  'promptModal.snackbarDesc',
                  'As an unverified teacher, you can still be found and contacted by students. However, you cannot initiate or send tuition requests to students until verified.'
                )}
              </p>
              <div className="mt-2.5 flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    toast.dismiss(toastObj.id);
                    navigate('/verification');
                  }}
                  className="inline-flex items-center text-xs font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer"
                >
                  {t('promptModal.snackbarAction', 'Verify Anytime from Home Banner →')}
                </button>
                <button
                  type="button"
                  onClick={() => toast.dismiss(toastObj.id)}
                  className="text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  {t('promptModal.dismiss', 'Dismiss')}
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={() => toast.dismiss(toastObj.id)}
              className="text-slate-500 hover:text-slate-300 p-1 cursor-pointer"
            >
              <FaTimes size={14} />
            </button>
          </div>
        ),
        { duration: 8000, position: 'bottom-center' }
      );
    } catch (err) {
      sessionStorage.setItem('verification_prompt_dismissed', 'true');
      setIsOpen(false);
      toast('Verification skipped for this session');
    } finally {
      setSkipping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4 overflow-y-auto animate-fadeInUp">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 sm:p-8 border border-slate-100 relative overflow-hidden">
        {/* Top Decorative accent banner */}
        <div className="h-2 w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 absolute top-0 left-0" />

        {/* Close Button */}
        <button
          onClick={handleSkip}
          disabled={skipping}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          title={t('promptModal.skipForNow')}
        >
          <FaTimes size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3.5 mb-5 pt-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/20 flex-shrink-0">
            <FaShieldAlt size={26} />
          </div>
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
              {t('promptModal.whyVerify', 'Why Verify on ToppScorers?')}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              {t('promptModal.title')}
            </h2>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
          {t('promptModal.subtitle')}
        </p>

        {/* Benefit Cards */}
        <div className="space-y-2.5 mb-6 text-xs">
          <div className="p-3 bg-emerald-50/70 border border-emerald-200/60 rounded-2xl flex items-start space-x-3">
            <div className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">
              <FaAward size={12} />
            </div>
            <div>
              <span className="text-emerald-900 text-xs font-semibold">{t('promptModal.perk2')}</span>
            </div>
          </div>

          <div className="p-3 bg-blue-50/70 border border-blue-200/60 rounded-2xl flex items-start space-x-3">
            <div className="w-6 h-6 rounded-lg bg-blue-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">
              <FaPaperPlane size={11} />
            </div>
            <div>
              <span className="text-blue-900 text-xs font-semibold">{t('promptModal.perk1')}</span>
            </div>
          </div>

          <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-2xl flex items-start space-x-3">
            <div className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">
              ✓
            </div>
            <div>
              <span className="text-amber-900 text-xs font-semibold">{t('promptModal.perk3')}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={handleSkip}
            disabled={skipping}
            className="w-full sm:w-auto flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all disabled:opacity-50 text-center"
          >
            {skipping ? '...' : t('promptModal.skipForNow')}
          </button>

          <button
            type="button"
            onClick={handleVerifyNow}
            className="w-full sm:w-auto flex-1 py-3 px-5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.02] flex items-center justify-center space-x-1.5"
          >
            <span>{t('promptModal.verifyNow')}</span>
            <FaArrowRight size={12} />
          </button>
        </div>

        <p className="text-[11px] text-slate-400 text-center mt-3">
          {t('promptModal.optionalHelp')}
        </p>
      </div>
    </div>
  );
};

export default TeacherVerificationPromptModal;
