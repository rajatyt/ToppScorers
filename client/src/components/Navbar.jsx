import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import {
  FaGraduationCap, FaBars, FaTimes, FaChalkboardTeacher,
  FaUserGraduate, FaUserFriends, FaCog, FaSignOutAlt
} from 'react-icons/fa';
import { FiUser, FiSliders } from 'react-icons/fi';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { user, profile, isAuthenticated, logout } = useContext(AuthContext);
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

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 bg-white/95 backdrop-blur-md ${scrolled ? 'shadow-md border-b-0' : 'border-b border-slate-200/80'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2.5">
              <img
                src="/logo.png"
                alt="ToppScorers"
                className="w-12 h-12 sm:w-14 sm:h-14 object-contain drop-shadow-sm hover:scale-105 transition-transform"
              />
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 leading-none">ToppScorers</span>
                <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Teacher & Tuition Hunt</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            <Link
              to="/"
              className={`text-[15px] font-bold transition-colors ${location.pathname === '/' ? 'text-amber-600 font-extrabold' : 'text-slate-700 hover:text-amber-600'}`}
            >
              {t('nav.home')}
            </Link>

            {/* Role-Aware Directory Link */}
            {(!isAuthenticated || isStudent || isAdmin) && (
              <Link
                to="/teachers"
                className={`text-[15px] font-bold transition-colors ${location.pathname.startsWith('/teachers') ? 'text-amber-600 font-extrabold' : 'text-slate-700 hover:text-amber-600'}`}
              >
                {t('nav.findTeachers')}
              </Link>
            )}

            {(!isAuthenticated || isTeacher || isAdmin) && (
              <Link
                to="/students"
                className={`text-[15px] font-bold transition-colors ${location.pathname.startsWith('/students') ? 'text-emerald-600 font-extrabold' : 'text-slate-700 hover:text-emerald-600'}`}
              >
                {t('nav.findStudents')}
              </Link>
            )}

            {/* Authenticated Links: Dashboard, Connections */}
            {isAuthenticated && (
              <>
                <Link
                  to="/dashboard"
                  className={`text-[15px] font-bold transition-colors ${location.pathname === '/dashboard' ? 'text-amber-600 font-extrabold' : 'text-slate-700 hover:text-amber-600'}`}
                >
                  {t('nav.dashboard')}
                </Link>

                <Link
                  to="/connections"
                  className={`text-[15px] font-bold transition-colors ${location.pathname === '/connections' ? 'text-amber-600 font-extrabold' : 'text-slate-700 hover:text-amber-600'}`}
                >
                  {t('nav.connections')}
                </Link>
              </>
            )}

            <div className="border-l border-slate-200 h-6 mx-1"></div>

            {/* Language Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 shadow-xs">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  currentLang === 'en'
                    ? 'bg-white text-amber-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 font-semibold'
                }`}
                title="Switch to English"
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  currentLang === 'hi'
                    ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                    : 'text-slate-500 hover:text-slate-900 font-semibold'
                }`}
                title="हिंदी में बदलें"
              >
                HI
              </button>
            </div>

            {/* User Account / Auth Dropdown */}
            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center space-x-2.5 text-slate-800 hover:text-amber-600 font-bold text-sm py-1.5 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 focus:outline-none transition-colors border border-slate-200/60 shadow-xs">
                  <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <span className="max-w-[150px] sm:max-w-[180px] truncate text-slate-900 font-bold">{user.name || 'Account'}</span>
                  {isVerifiedTeacher && (
                    <span className="inline-flex items-center text-emerald-600 font-black text-sm" title="Verified Teacher">
                      ✅
                    </span>
                  )}
                </button>

                <div className="absolute right-0 w-56 mt-1 py-2 bg-white rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-slate-100">
                  <div className="px-4 py-2 border-b border-slate-100 text-xs text-slate-500">
                    <div>{t('nav.signedInAs')}</div>
                    <div className="font-bold text-slate-900 capitalize flex items-center justify-between">
                      <span>{user.role}</span>
                      {isVerifiedTeacher && (
                        <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          {t('nav.verifiedTeacher')}
                        </span>
                      )}
                    </div>
                  </div>

                  <Link to="/dashboard" className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 font-semibold">
                    {t('nav.dashboard')}
                  </Link>

                  {isTeacher && (
                    <>
                      <Link to="/profile" className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 font-semibold flex items-center justify-between">
                        <span>{t('nav.profile')}</span>
                        {isVerifiedTeacher ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {t('nav.verifiedTeacher')}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            {t('nav.unverified')}
                          </span>
                        )}
                      </Link>
                      <Link to="/verification" className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 font-semibold">
                        {t('nav.verification')}
                      </Link>
                    </>
                  )}

                  <Link to="/connections" className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 font-semibold">
                    {t('nav.connections')}
                  </Link>

                  <Link to="/settings" className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 font-semibold">
                    {t('nav.settings')}
                  </Link>

                  {isAdmin && (
                    <Link to="/admin" className="block px-4 py-2.5 text-sm text-amber-700 hover:bg-amber-50 font-bold border-t border-slate-100">
                      {t('nav.admin')}
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 font-bold border-t border-slate-100"
                  >
                    {t('nav.logout')}
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-xs transition-colors"
              >
                <FiUser size={15} />
                <span>{t('nav.signInJoin')}</span>
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
                <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block px-3 py-2.5 rounded-lg text-slate-800 hover:bg-slate-50">{t('nav.dashboard')}</Link>
                {isTeacher && (
                  <>
                    <Link to="/profile" onClick={() => setIsOpen(false)} className="block px-3 py-2.5 rounded-lg text-slate-800 hover:bg-slate-50 flex items-center justify-between">
                      <span>{t('nav.profile')}</span>
                      {isVerifiedTeacher && <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">{t('nav.verifiedTeacher')}</span>}
                    </Link>
                    <Link to="/verification" onClick={() => setIsOpen(false)} className="block px-3 py-2.5 rounded-lg text-slate-800 hover:bg-slate-50">{t('nav.verification')}</Link>
                  </>
                )}
                <Link to="/connections" onClick={() => setIsOpen(false)} className="block px-3 py-2.5 rounded-lg text-slate-800 hover:bg-slate-50">{t('nav.connections')}</Link>
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
