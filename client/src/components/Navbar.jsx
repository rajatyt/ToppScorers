import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import {
  FaGraduationCap, FaBars, FaTimes, FaChalkboardTeacher,
  FaUserGraduate, FaUserFriends, FaCog, FaSignOutAlt,
  FaUserEdit, FaAward, FaQuestionCircle, FaThLarge, FaShieldAlt, FaBookmark
} from 'react-icons/fa';
import { FiUser, FiSliders } from 'react-icons/fi';
import { NotificationContext } from '../context/NotificationContext';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { user, profile, isAuthenticated, logout } = useContext(AuthContext);
  const { unreadCounts } = useContext(NotificationContext);
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const currentLang = i18n.language?.startsWith('hi') ? 'hi' : 'en';

  const setLanguage = (lang) => {
    i18n.changeLanguage(lang);
    try {
      localStorage.setItem('i18nextLng', lang);
    } catch (e) {}
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isTeacher = user?.role === 'teacher';
  const isStudent = user?.role === 'student';
  const isAdmin = user?.role === 'admin';
  const isVerifiedTeacher = isTeacher && (profile?.isVerified === true || profile?.verificationStatus === 'verified');
  const isVerifiedStudent = isStudent && (profile?.isVerified === true && profile?.verificationStatus === 'verified');
  const isPendingStudent = isStudent && !isVerifiedStudent && (profile?.verificationStatus === 'pending' || Boolean(profile?.verificationSubmittedAt));
  const isVerifiedAccount = isVerifiedTeacher || isVerifiedStudent;

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-xl shadow-glass border-b border-slate-200/70' : 'bg-white/80 backdrop-blur-lg border-b border-slate-200/50'}`}>
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="flex justify-between items-center h-16 sm:h-18">
          {/* Brand Logo - anchored to the left */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 blur-xs opacity-0 group-hover:opacity-100 transition-opacity" />
                <img
                  src="/logo.png"
                  alt="ToppScorers"
                  className="relative w-10 h-10 sm:w-11 sm:h-11 object-contain drop-shadow-sm group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-black text-lg sm:text-xl tracking-tight text-slate-900 leading-none group-hover:text-amber-600 transition-colors">
                  Topp<span className="text-amber-500">Scorers</span>
                </span>
                <span className="text-[9px] sm:text-[10px] text-amber-600/90 font-bold uppercase tracking-widest mt-0.5">
                  Verified Educators Hub
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex md:items-center md:space-x-1.5 lg:space-x-2 xl:space-x-3">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-xl text-xs xl:text-sm font-bold transition-all whitespace-nowrap flex-shrink-0 ${
                location.pathname === '/'
                  ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              {t('nav.home')}
            </Link>

            {/* Role-Aware Directory Link */}
            {(!isAuthenticated || isStudent || isAdmin) && (
              <Link
                to="/teachers"
                className={`px-3 py-1.5 rounded-xl text-xs xl:text-sm font-bold transition-all whitespace-nowrap flex-shrink-0 ${
                  location.pathname.startsWith('/teachers')
                    ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20 shadow-xs'
                    : 'text-slate-600 hover:text-amber-600 hover:bg-amber-50/50'
                }`}
              >
                {t('nav.findTeachers')}
              </Link>
            )}

            {(!isAuthenticated || isTeacher || isAdmin) && (
              <Link
                to="/students"
                className={`px-3 py-1.5 rounded-xl text-xs xl:text-sm font-bold transition-all whitespace-nowrap flex-shrink-0 ${
                  location.pathname.startsWith('/students')
                    ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-xs'
                    : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50/50'
                }`}
              >
                {t('nav.findStudents')}
              </Link>
            )}

            {/* Authenticated Links: Dashboard, Personal & Tutoring Info, Help */}
            {isAuthenticated && (
              <>
                <Link
                  to="/dashboard"
                  className={`px-3.5 py-1.5 rounded-xl text-xs xl:text-sm font-bold transition-all inline-flex items-center space-x-1.5 ${
                    location.pathname === '/dashboard'
                      ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <span>{t('nav.dashboard')}</span>
                  {unreadCounts?.total > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-black bg-rose-500 text-white rounded-full animate-pulse shadow-xs">
                      {unreadCounts.total}
                    </span>
                  )}
                </Link>

                {/* Dedicated visible Personal & Tutoring Info header link for teachers */}
                {isTeacher && (
                  <Link
                    to="/profile?tab=general"
                    className={`px-3 py-1.5 rounded-xl text-xs xl:text-sm font-bold transition-all inline-flex items-center space-x-1.5 ${
                      location.pathname === '/profile' && (!location.search || location.search.includes('tab=general'))
                        ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20 shadow-xs'
                        : 'text-slate-600 hover:text-amber-600 hover:bg-amber-50/50'
                    }`}
                  >
                    <FaUserEdit className="text-amber-500 text-xs" />
                    <span className="hidden xl:inline">{t('profileEdit.tabGeneral', 'Personal & Tutoring Info')}</span>
                    <span className="xl:hidden">Tutoring Info</span>
                  </Link>
                )}

                <Link
                  to="/queries"
                  className={`px-3.5 py-1.5 rounded-xl text-xs xl:text-sm font-bold transition-all inline-flex items-center space-x-1.5 ${
                    location.pathname === '/queries' || location.pathname === '/support'
                      ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <span>Help & Doubts</span>
                  {unreadCounts?.queries > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-black bg-rose-500 text-white rounded-full animate-pulse shadow-xs">
                      {unreadCounts.queries}
                    </span>
                  )}
                </Link>
              </>
            )}

            <div className="border-l border-slate-200/80 h-5 mx-1"></div>

            {/* Language Switcher */}
            <div className="flex items-center bg-slate-100/90 p-0.5 rounded-full border border-slate-200/80 shadow-inner">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-black transition-all cursor-pointer ${
                  currentLang === 'en'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Switch to English"
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-black transition-all cursor-pointer ${
                  currentLang === 'hi'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="हिंदी में बदलें"
              >
                HI
              </button>
            </div>

            {/* User Account / Auth Dropdown */}
            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 py-1.5 px-3 rounded-full bg-slate-100/80 hover:bg-slate-200/80 border border-slate-200/80 shadow-xs transition-all focus:outline-none cursor-pointer">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-slate-900 to-slate-700 text-white flex items-center justify-center text-[11px] font-bold shadow-xs">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <span className="max-w-[130px] sm:max-w-[160px] truncate text-slate-900 font-bold text-xs">{user.name || 'Account'}</span>
                  {isVerifiedAccount && (
                    <span className="inline-flex items-center text-emerald-600 font-black text-xs" title={isVerifiedTeacher ? "Verified Tutor" : "Verified Student/Parent"}>
                      ✅
                    </span>
                  )}
                </button>

                <div className="absolute right-0 w-72 mt-2 py-2 px-1.5 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-slate-200/80 z-50">
                  {/* Account Identity Header */}
                  <div className="px-3 py-2.5 mb-1.5 bg-slate-50/90 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-extrabold text-xs text-slate-900 truncate">
                        {user.name || 'Account'}
                      </span>
                      {isVerifiedTeacher ? (
                        <span className="text-[10px] font-black text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full flex-shrink-0">
                          Tutor Verified ✅
                        </span>
                      ) : isVerifiedStudent ? (
                        <span className="text-[10px] font-black text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full flex-shrink-0">
                          Verified {profile?.studentOrParentRole === 'parent' ? 'Parent' : 'Student'} ✅
                        </span>
                      ) : isPendingStudent ? (
                        <span className="text-[10px] font-black text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full flex-shrink-0">
                          In Review ⏳
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-600 capitalize bg-slate-200/70 px-2 py-0.5 rounded-full flex-shrink-0">
                          {user.role}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5 font-medium">
                      {user.email}
                    </div>
                  </div>

                  {/* Linear Menu Items */}
                  <div className="space-y-0.5">
                    <Link
                      to="/dashboard"
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 transition-colors"
                    >
                      <span className="flex items-center space-x-2.5">
                        <FaThLarge className="text-slate-400 flex-shrink-0" size={13} />
                        <span>{t('nav.dashboard')}</span>
                      </span>
                      {unreadCounts?.total > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
                          {unreadCounts.total}
                        </span>
                      )}
                    </Link>

                    <Link
                      to="/saved"
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 transition-colors"
                    >
                      <span className="flex items-center space-x-2.5">
                        <FaBookmark className="text-amber-500 flex-shrink-0" size={13} />
                        <span>{isTeacher ? 'Bookmarked Students' : 'Saved Tutors'}</span>
                      </span>
                    </Link>

                    {isTeacher && (
                      <>
                        <Link
                          to="/profile?tab=general"
                          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-amber-950 hover:bg-amber-50/70 transition-colors"
                        >
                          <span className="flex items-center space-x-2.5">
                            <FaUserEdit className="text-amber-500 flex-shrink-0" size={13} />
                            <span>Personal & Tutoring Info</span>
                          </span>
                        </Link>

                        <Link
                          to="/profile?tab=qualifications"
                          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 transition-colors"
                        >
                          <span className="flex items-center space-x-2.5">
                            <FaGraduationCap className="text-slate-400 flex-shrink-0" size={13} />
                            <span>Qualifications & Degrees</span>
                          </span>
                        </Link>

                        <Link
                          to="/verification"
                          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 transition-colors"
                        >
                          <span className="flex items-center space-x-2.5">
                            <FaAward className="text-slate-400 flex-shrink-0" size={13} />
                            <span>Verification Status</span>
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isVerifiedTeacher ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {isVerifiedTeacher ? 'Verified' : 'Unverified'}
                          </span>
                        </Link>
                      </>
                    )}

                    <div className="my-1 border-t border-slate-100" />

                    <Link
                      to="/queries"
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 transition-colors"
                    >
                      <span className="flex items-center space-x-2.5">
                        <FaQuestionCircle className="text-sky-500 flex-shrink-0" size={13} />
                        <span>Help & Doubts</span>
                      </span>
                      {unreadCounts?.queries > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
                          {unreadCounts.queries}
                        </span>
                      )}
                    </Link>

                    <Link
                      to="/settings"
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 transition-colors"
                    >
                      <span className="flex items-center space-x-2.5">
                        <FaCog className="text-slate-400 flex-shrink-0" size={13} />
                        <span>Privacy & Settings</span>
                      </span>
                    </Link>

                    {isStudent && (
                      <button
                        type="button"
                        onClick={() => window.dispatchEvent(new CustomEvent('open-student-verification-modal'))}
                        className="w-full text-left flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-emerald-950 hover:bg-emerald-50/70 transition-colors cursor-pointer"
                      >
                        <span className="flex items-center space-x-2.5">
                          <FaShieldAlt className={isVerifiedStudent ? "text-emerald-600 flex-shrink-0" : "text-amber-500 flex-shrink-0"} size={13} />
                          <span>Contact Verification</span>
                        </span>
                        {isVerifiedStudent ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                            Verified ✅
                          </span>
                        ) : isPendingStudent ? (
                          <span className="text-[10px] font-bold text-blue-800 bg-blue-100 px-1.5 py-0.5 rounded-full">
                            In Review ⏳
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded-full">
                            Action Needed
                          </span>
                        )}
                      </button>
                    )}

                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-amber-700 hover:bg-amber-50 transition-colors"
                      >
                        <span className="flex items-center space-x-2.5">
                          <FiSliders className="text-amber-600 flex-shrink-0" size={13} />
                          <span>Admin Portal</span>
                        </span>
                      </Link>
                    )}

                    <div className="my-1 border-t border-slate-100" />

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <span className="flex items-center space-x-2.5">
                        <FaSignOutAlt className="flex-shrink-0" size={13} />
                        <span>Sign Out</span>
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-glow-sm hover:shadow-glow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap flex-shrink-0"
              >
                <FiUser size={14} className="stroke-[2.5] flex-shrink-0" />
                <span className="whitespace-nowrap font-black">{t('nav.signInJoin')}</span>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden space-x-2">
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 rounded-md text-xs font-black transition-all cursor-pointer ${
                  currentLang === 'en'
                    ? 'bg-white text-amber-600 shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                className={`px-2 py-0.5 rounded-md text-xs font-black transition-all cursor-pointer ${
                  currentLang === 'hi'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                HI
              </button>
            </div>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-700 hover:text-amber-600 focus:outline-none p-1"
            >
              {isOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 animate-slideIn">
          <div className="px-4 pt-3 pb-5 space-y-1.5 text-sm font-bold">
            <Link to="/" onClick={() => setIsOpen(false)} className="block px-3 py-2.5 rounded-lg text-slate-800 hover:bg-slate-50">{t('nav.home')}</Link>
            
            {(!isAuthenticated || isStudent || isAdmin) && (
              <Link to="/teachers" onClick={() => setIsOpen(false)} className="block px-3 py-2.5 rounded-lg text-slate-800 hover:bg-slate-50">{t('nav.findTeachers')}</Link>
            )}

            {(!isAuthenticated || isTeacher || isAdmin) && (
              <Link to="/students" onClick={() => setIsOpen(false)} className="block px-3 py-2.5 rounded-lg text-emerald-700 hover:bg-emerald-50">{t('nav.findStudents')}</Link>
            )}

            {isAuthenticated ? (
              <>
                <Link to="/dashboard" onClick={() => setIsOpen(false)} className="px-3 py-2.5 rounded-lg text-slate-800 hover:bg-slate-50 flex items-center justify-between">
                  <span>{t('nav.dashboard')}</span>
                  {unreadCounts?.total > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-black bg-rose-500 text-white rounded-full animate-pulse shadow-xs">
                      {unreadCounts.total}
                    </span>
                  )}
                </Link>
                <Link to="/saved" onClick={() => setIsOpen(false)} className="px-3 py-2.5 rounded-lg text-slate-800 hover:bg-slate-50 flex items-center space-x-2">
                  <FaBookmark className="text-amber-500" size={13} />
                  <span>{isTeacher ? 'Bookmarked Students' : 'Saved Tutors'}</span>
                </Link>
                {isTeacher && (
                  <div className="py-1 my-1 border-y border-slate-100 space-y-1">
                    <div className="px-3 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      Tutor Profile
                    </div>
                    <Link
                      to="/profile?tab=general"
                      onClick={() => setIsOpen(false)}
                      className="px-3 py-2.5 rounded-xl bg-amber-50 text-amber-950 font-extrabold flex items-center justify-between"
                    >
                      <span className="flex items-center space-x-2">
                        <FaUserEdit className="text-amber-600" />
                        <span>{t('profileEdit.tabGeneral', 'Personal & Tutoring Info')}</span>
                      </span>
                      <span className="text-[10px] font-extrabold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-full">
                        Bio & Rates
                      </span>
                    </Link>
                    <Link
                      to="/profile?tab=qualifications"
                      onClick={() => setIsOpen(false)}
                      className="px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center space-x-2 text-xs font-semibold"
                    >
                      <FaGraduationCap className="text-slate-400" />
                      <span>{t('profileEdit.tabQualifications', 'Qualifications & Degrees')}</span>
                    </Link>
                    <Link
                      to="/verification"
                      onClick={() => setIsOpen(false)}
                      className="px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center justify-between text-xs font-semibold"
                    >
                      <span className="flex items-center space-x-2">
                        <FaAward className="text-slate-400" />
                        <span>{t('nav.verification', 'Verification Status')}</span>
                      </span>
                      {isVerifiedTeacher && <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">Verified ✅</span>}
                    </Link>
                  </div>
                )}

                <Link to="/queries" onClick={() => setIsOpen(false)} className="px-3 py-2.5 rounded-lg text-slate-800 hover:bg-slate-50 flex items-center justify-between">
                  <span>{t('nav.helpAndDoubts', 'Help & Doubts')}</span>
                  {unreadCounts?.queries > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-black bg-rose-500 text-white rounded-full animate-pulse shadow-xs">
                      {unreadCounts.queries}
                    </span>
                  )}
                </Link>

                <Link to="/settings" onClick={() => setIsOpen(false)} className="block px-3 py-2.5 rounded-lg text-slate-800 hover:bg-slate-50">{t('nav.settings')}</Link>
                {isAdmin && (
                  <Link to="/admin" onClick={() => setIsOpen(false)} className="block px-3 py-2.5 rounded-lg text-amber-700 hover:bg-amber-50">{t('nav.admin')}</Link>
                )}
                <div className="pt-2 border-t border-slate-100">
                  <button onClick={() => { handleLogout(); setIsOpen(false); }} className="block w-full text-left px-3 py-2.5 rounded-lg text-rose-600 hover:bg-rose-50">
                    {t('nav.logout')}
                  </button>
                </div>
              </>
            ) : (
              <div className="pt-2">
                <Link to="/login" onClick={() => setIsOpen(false)} className="block w-full text-center py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs">
                  {t('nav.signInJoin')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
