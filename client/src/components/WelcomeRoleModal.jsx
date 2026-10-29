import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import { 
  FaTimes, 
  FaGraduationCap, 
  FaChalkboardTeacher, 
  FaCheckCircle, 
  FaArrowRight,
  FaShieldAlt,
  FaBolt
} from 'react-icons/fa';

const WelcomeRoleModal = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Never show for authenticated users
    if (isAuthenticated) {
      setIsOpen(false);
      return;
    }

    // Do not show on auth pages or admin pages
    const isAuthPage = ['/login', '/signup', '/auth'].includes(location.pathname);
    const isAdminPage = location.pathname.startsWith('/admin');
    if (isAuthPage || isAdminPage) {
      setIsOpen(false);
      return;
    }

    // Check if dismissed in this browsing session
    const isDismissed = sessionStorage.getItem('toppscorers_welcome_dismissed');
    if (!isDismissed) {
      // Gentle appearance delay after initial page load
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, location.pathname]);

  if (!isOpen) return null;

  const handleDismiss = () => {
    sessionStorage.setItem('toppscorers_welcome_dismissed', 'true');
    setIsOpen(false);
  };

  const handleSelectRole = (role) => {
    sessionStorage.setItem('toppscorers_welcome_dismissed', 'true');
    setIsOpen(false);
    navigate(`/signup?role=${role}`);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeInUp"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleDismiss();
      }}
    >
      <div className="relative w-full max-w-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white rounded-3xl border border-amber-500/30 shadow-2xl shadow-amber-950/40 p-6 sm:p-8 md:p-10 overflow-hidden my-auto">
        {/* Subtle Ambient Backlight Glows */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-amber-500/15 rounded-full filter blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-blue-600/15 rounded-full filter blur-3xl pointer-events-none" />

        {/* Top Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors z-20 cursor-pointer"
          aria-label="Close welcome prompt"
        >
          <FaTimes size={18} />
        </button>

        {/* Header Section */}
        <div className="text-center relative z-10 mb-8 space-y-2.5">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-amber-500/15 text-amber-300 font-bold text-xs uppercase tracking-wider border border-amber-500/30 shadow-xs">
            <span>✦</span>
            <span>{t('welcomeModal.badge', 'Welcome to ToppScorers')}</span>
            <span>✦</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            {t('welcomeModal.title', "Prayagraj's Premier Educator & Student Network")}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            {t('welcomeModal.subtitle', "Whether you are aiming for academic excellence or ready to inspire learners, select your path below to begin.")}
          </p>
        </div>

        {/* Dual Interactive Path Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10 mb-6">
          {/* Path 1: Student / Parent */}
          <div 
            onClick={() => handleSelectRole('student')}
            className="group relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/50 rounded-2xl p-6 transition-all duration-300 cursor-pointer flex flex-col justify-between shadow-lg hover:shadow-amber-500/10 hover:scale-[1.02]"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-13 h-13 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shadow-inner group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors duration-300">
                  <FaGraduationCap size={26} />
                </div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {t('welcomeModal.forStudentsBadge', 'Students & Parents')}
                </span>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
                  {t('welcomeModal.findTutorTitle', 'Find My Tutor')}
                </h3>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  {t('welcomeModal.findTutorDesc', 'Connect with verified top-tier educators for 1-on-1 home tuitions, online batches, and board or competitive prep.')}
                </p>
              </div>

              {/* Highlights */}
              <ul className="space-y-2 text-xs text-slate-300 pt-1">
                <li className="flex items-center space-x-2">
                  <FaCheckCircle className="text-emerald-400 text-xs flex-shrink-0" />
                  <span>{t('welcomeModal.bulletStudent1', 'Background & document verified teachers')}</span>
                </li>
                <li className="flex items-center space-x-2">
                  <FaCheckCircle className="text-emerald-400 text-xs flex-shrink-0" />
                  <span>{t('welcomeModal.bulletStudent2', 'Zero platform commission & direct coordination')}</span>
                </li>
                <li className="flex items-center space-x-2">
                  <FaCheckCircle className="text-emerald-400 text-xs flex-shrink-0" />
                  <span>{t('welcomeModal.bulletStudent3', 'CBSE, ICSE, State, JEE, NEET & Foundation')}</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              className="mt-6 w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center space-x-2 group-hover:shadow-amber-500/25 cursor-pointer"
            >
              <span>{t('welcomeModal.findTutorBtn', 'Find My Tutor')}</span>
              <FaArrowRight className="text-xs transform group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Path 2: Teacher / Tutor */}
          <div 
            onClick={() => handleSelectRole('teacher')}
            className="group relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/50 rounded-2xl p-6 transition-all duration-300 cursor-pointer flex flex-col justify-between shadow-lg hover:shadow-blue-500/10 hover:scale-[1.02]"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-13 h-13 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shadow-inner group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors duration-300">
                  <FaChalkboardTeacher size={26} />
                </div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {t('welcomeModal.forTeachersBadge', 'Teachers & Mentors')}
                </span>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
                  {t('welcomeModal.startTeachingTitle', 'Start Teaching')}
                </h3>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  {t('welcomeModal.startTeachingDesc', 'Receive direct student tuition inquiries, set your own flexible hours, and grow your career with verified badges.')}
                </p>
              </div>

              {/* Highlights */}
              <ul className="space-y-2 text-xs text-slate-300 pt-1">
                <li className="flex items-center space-x-2">
                  <FaCheckCircle className="text-amber-400 text-xs flex-shrink-0" />
                  <span>{t('welcomeModal.bulletTeacher1', 'Keep 100% of your tuition fees (0% commission)')}</span>
                </li>
                <li className="flex items-center space-x-2">
                  <FaCheckCircle className="text-amber-400 text-xs flex-shrink-0" />
                  <span>{t('welcomeModal.bulletTeacher2', 'Verified Educator badge & trust ranking')}</span>
                </li>
                <li className="flex items-center space-x-2">
                  <FaCheckCircle className="text-amber-400 text-xs flex-shrink-0" />
                  <span>{t('welcomeModal.bulletTeacher3', 'Direct physical scheduling coordination')}</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              className="mt-6 w-full py-3 px-4 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 hover:border-white/40 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center space-x-2 group-hover:bg-amber-500 group-hover:text-slate-950 group-hover:border-amber-500 transition-colors duration-300 cursor-pointer"
            >
              <span>{t('welcomeModal.startTeachingBtn', 'Start Teaching')}</span>
              <FaArrowRight className="text-xs transform group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Footer: Skip for now */}
        <div className="text-center relative z-10 pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={handleDismiss}
            className="text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors inline-flex items-center space-x-1.5 py-1.5 px-3 rounded-lg hover:bg-white/5 cursor-pointer"
          >
            <span>{t('welcomeModal.skipForNow', 'Skip for now and explore as guest')}</span>
            <FaArrowRight size={10} className="mt-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeRoleModal;
