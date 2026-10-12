import React, { useState, useContext, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AdminAuthContext } from '../../context/AdminAuthContext';
import { 
  FiHome, FiLayout, FiUsers, FiUserCheck, FiHelpCircle, 
  FiMenu, FiX, FiLogOut, FiExternalLink, FiClock, FiShield, FiAward
} from 'react-icons/fi';
import { FaGraduationCap } from 'react-icons/fa';

const AdminLayout = ({ children }) => {
  const { t, i18n } = useTranslation();
  const { adminUser, adminLogout } = useContext(AdminAuthContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateClock();
    const interval = setInterval(updateClock, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'hi' : 'en');
  };

  const handleLogout = async () => {
    await adminLogout();
    navigate('/admin/login');
  };

  const navLinks = [
    { to: '/admin', icon: <FiHome className="text-lg" />, label: 'Dashboard', desc: 'Overview & metrics' },
    { to: '/admin/verifications', icon: <FiAward className="text-lg" />, label: 'Verification Queue', desc: 'Teacher review & badge' },
    { to: '/admin/widgets', icon: <FiLayout className="text-lg" />, label: 'Widget Manager', desc: 'Homepage sections' },
    { to: '/admin/profiles', icon: <FiUsers className="text-lg" />, label: 'Profile Manager', desc: 'Teachers & students' },
    { to: '/admin/users', icon: <FiUserCheck className="text-lg" />, label: 'User Manager', desc: 'Accounts & sessions' },
    { to: '/admin/moderation', icon: <FiShield className="text-lg" />, label: 'Moderation & Logs', desc: 'Safety, audit, reports' },
    { to: '/admin/faqs', icon: <FiHelpCircle className="text-lg" />, label: 'FAQ Editor', desc: 'Bilingual content' },
  ];

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/verifications')) return 'Teacher Verification Queue';
    if (path.includes('/widgets')) return 'Widget & Layout Manager';
    if (path.includes('/profiles')) return 'Profile Management';
    if (path.includes('/users')) return 'User & Session Management';
    if (path.includes('/moderation')) return 'Safety, Moderation & Audit Logs';
    if (path.includes('/faqs')) return 'FAQ Content Editor';
    return 'Admin Control Center';
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-800 font-sans overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 md:hidden transition-opacity" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Modern High-End Sidebar */}
      <aside 
        className={`fixed md:static inset-y-0 left-0 w-72 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white flex flex-col z-50 transition-all duration-300 shadow-2xl md:shadow-none border-r border-slate-800/80 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800/90 flex justify-between items-center bg-slate-950/40">
          <div className="flex items-center space-x-3">
            <img
              src="/logo.png"
              alt="ToppScorers Admin"
              className="w-12 h-12 object-contain drop-shadow-md"
            />
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                ToppScorers
              </span>
              <div className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">Admin Portal</span>
              </div>
            </div>
          </div>
          <button 
            className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            onClick={() => setIsSidebarOpen(false)}
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Navigation Section */}
        <div className="px-4 py-3">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Navigation Menu
          </p>
        </div>
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {navLinks.map((link) => {
            const isActive = link.to === '/admin' 
              ? location.pathname === '/admin' 
              : location.pathname.startsWith(link.to);

            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setIsSidebarOpen(false)}
                className={`group flex items-center space-x-3.5 px-3.5 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-semibold shadow-lg shadow-amber-500/25 scale-[1.02]' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className={`p-2 rounded-lg transition-colors ${
                  isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800/50 text-slate-400 group-hover:text-amber-400'
                }`}>
                  {link.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium leading-tight truncate">{link.label}</div>
                  <div className={`text-[11px] leading-tight truncate ${isActive ? 'text-slate-900/80' : 'text-slate-500'}`}>
                    {link.desc}
                  </div>
                </div>
                {isActive && (
                  <span className="w-1.5 h-6 rounded-full bg-slate-950/40"></span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Card & Quick Actions */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/50 space-y-3">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-slate-800">
            <div className="flex items-center space-x-3 truncate">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-sm shadow">
                {adminUser?.name ? adminUser.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-white truncate">{adminUser?.name || 'Administrator'}</div>
                <div className="text-[10px] text-emerald-400 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Super Admin</span>
                </div>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              title="Logout"
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <FiLogOut size={16} />
            </button>
          </div>

          <button 
            onClick={() => navigate('/')}
            className="flex items-center justify-center space-x-2 w-full px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-lg border border-slate-700/60 transition-colors"
          >
            <span>Live Website</span>
            <FiExternalLink size={12} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50">
        {/* Top Navbar */}
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between px-6 py-3.5">
            <div className="flex items-center space-x-4">
              <button 
                className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                onClick={() => setIsSidebarOpen(true)}
              >
                <FiMenu size={22} />
              </button>
              <div>
                <h1 className="text-xl font-bold text-slate-900 leading-tight">
                  {getPageTitle()}
                </h1>
                <p className="text-xs text-slate-500 hidden sm:block">
                  ToppScorers Operations & System Controls
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Clock badge */}
              <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-medium text-slate-600 border border-slate-200">
                <FiClock className="text-slate-400" />
                <span>{currentTime}</span>
              </div>

              {/* Language Switcher */}
              <button 
                onClick={toggleLanguage}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs transition-all"
                title="Switch Language"
              >
                <span className={i18n.language === 'en' ? 'text-blue-700 font-bold' : 'text-slate-400'}>EN</span>
                <span className="text-slate-300">/</span>
                <span className={i18n.language === 'hi' ? 'text-amber-600 font-bold' : 'text-slate-400'}>HI</span>
              </button>

              {/* Security Status Badge */}
              <div className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium border border-emerald-200/60">
                <FiShield className="text-emerald-500" />
                <span className="hidden sm:inline">Protected</span>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable View Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
