import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/axios';
import { 
  FaGraduationCap, 
  FaUserGraduate, 
  FaChalkboardTeacher, 
  FaCheckCircle, 
  FaSearch, 
  FaMapMarkerAlt,
  FaBolt,
  FaBookOpen,
  FaAtom,
  FaShieldAlt,
  FaStar,
  FaArrowRight
} from 'react-icons/fa';
import { FiArrowRight, FiCheck, FiSearch } from 'react-icons/fi';
import SectionDivider from '../common/SectionDivider';

const HeroSection = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const isUserTeacher = user?.role === 'teacher';
  const isUserStudent = user?.role === 'student';

  // For unauthenticated visitors, provide interactive role toggling
  const [activeRole, setActiveRole] = useState(isUserTeacher ? 'teacher' : 'student');
  const [previewTab, setPreviewTab] = useState(isUserTeacher ? 'students' : 'teachers');
  const [searchQuery, setSearchQuery] = useState('');
  const [dashboardMetrics, setDashboardMetrics] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      api.get('/auth/dashboard-metrics')
        .then((res) => setDashboardMetrics(res.data))
        .catch(() => {});
    }
  }, [isAuthenticated]);

  const handleRoleSwitch = (role) => {
    setActiveRole(role);
    setPreviewTab(role === 'student' ? 'teachers' : 'students');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    const target = (isUserTeacher || activeRole === 'teacher') ? '/students' : '/teachers';
    navigate(`${target}?search=${encodeURIComponent(query)}`);
  };

  const handleQuickTagClick = (tag) => {
    const target = (isUserTeacher || activeRole === 'teacher') ? '/students' : '/teachers';
    navigate(`${target}?search=${encodeURIComponent(tag)}`);
  };

  const quickTags = activeRole === 'teacher' 
    ? ['Class 10 CBSE', 'Class 12 Physics', 'NEET Dropper', 'Home Tuition', 'Online 1-on-1']
    : ['CBSE Maths', 'NEET Biology', 'JEE Advanced', 'Class 9 Science', 'Home Tutor'];

  return (
    <section className="relative w-full text-white overflow-hidden pt-12 pb-28 sm:pt-16 sm:pb-36 lg:pb-40 bg-[#070b14]">
      {/* Layer 1: High-res authentic Educator Hub / Modern Learning Academy Atmospheric Backdrop */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none transform scale-105 opacity-20"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop')`,
        }}
      />

      {/* Layer 2: Deep Academy Gradient Overlay for Contrast & Elegance */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-[#070b14]/98 via-[#0b1220]/95 to-[#1a1208]/90 backdrop-blur-[2px] pointer-events-none"
      />

      {/* Layer 3: Tech Grid Dot Matrix Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px)',
          backgroundSize: '28px 28px'
        }}
      />

      {/* Layer 4: Multi-Directional Hub Lighting Gradients */}
      <div 
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-blue-900/25 pointer-events-none"
      />

      {/* Layer 5: Stylized Floating Academic Motifs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        {/* Top-Right: Graduation Cap */}
        <div className="absolute -top-6 right-12 text-amber-400/10 transform rotate-12 filter blur-[0.5px]">
          <FaGraduationCap size={180} />
        </div>

        {/* Top-Left: Open Knowledge Book */}
        <div className="absolute top-24 left-6 text-white/5 transform -rotate-12 filter blur-[0.5px]">
          <FaBookOpen size={120} />
        </div>

        {/* Bottom-Center-Left: Educator Mentorship Icon */}
        <div className="absolute -bottom-10 left-1/4 text-amber-500/10 transform rotate-6 filter blur-[0.5px]">
          <FaChalkboardTeacher size={150} />
        </div>

        {/* Bottom-Right: Science & STEM Discovery Atom */}
        <div className="absolute bottom-8 right-1/4 text-blue-400/10 transform -rotate-6 filter blur-[0.5px]">
          <FaAtom size={130} />
        </div>

        {/* Subtle Constellation Connection Orbs */}
        <div className="absolute top-1/4 left-1/2 w-2 h-2 rounded-full bg-amber-400/30 animate-ping" />
        <div className="absolute top-1/3 right-1/4 w-2 h-2 rounded-full bg-blue-400/30 animate-ping delay-1000" />
      </div>

      {/* Layer 6: Ambient Glowing Spotlights */}
      <div className="absolute -top-32 right-10 w-[550px] h-[550px] bg-amber-500/15 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-20 w-[500px] h-[500px] bg-blue-600/15 rounded-full filter blur-[130px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-amber-600/10 rounded-full filter blur-[100px] pointer-events-none" />
      
      <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-10">
        {/* Left Column: Heading, Role Switcher, Omni Search, CTAs */}
        <motion.div 
          className="lg:w-7/12 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          {/* Top Network Badge */}
          <div className="inline-flex items-center space-x-2.5 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-transparent text-amber-300 font-bold text-xs uppercase tracking-wider border border-amber-500/30 shadow-lg backdrop-blur-md">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <FaGraduationCap className="text-sm text-amber-400" />
            <span>{t('hero.badge', "Prayagraj's #1 Platform for Students & Educators")}</span>
          </div>

          {/* Interactive Role Switcher for Guests */}
          {!isAuthenticated && (
            <div className="flex items-center p-1.5 bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/15 w-full sm:w-auto shadow-2xl">
              <button
                type="button"
                onClick={() => handleRoleSwitch('student')}
                className={`flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 flex-1 sm:flex-initial cursor-pointer ${
                  activeRole === 'student'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-glow-sm scale-[1.02]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <FaUserGraduate className="text-sm" />
                <span>{t('hero.studentTab', "I'm a Student / Parent")}</span>
              </button>
              <button
                type="button"
                onClick={() => handleRoleSwitch('teacher')}
                className={`flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 flex-1 sm:flex-initial cursor-pointer ${
                  activeRole === 'teacher'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-glow-sm scale-[1.02]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <FaChalkboardTeacher className="text-sm" />
                <span>{t('hero.teacherTab', "I'm a Tutor")}</span>
              </button>
            </div>
          )}

          {/* Main Title with Rich Gradient Typography */}
          <div className="space-y-2">
            {isUserTeacher ? (
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-black leading-[1.12] tracking-tight text-white">
                {t('heroTeacher.title')}
              </h1>
            ) : isUserStudent ? (
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-black leading-[1.12] tracking-tight text-white">
                {t('heroStudent.title')}
              </h1>
            ) : activeRole === 'teacher' ? (
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-black leading-[1.12] tracking-tight text-white">
                Get Direct Tuition Students <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200 bg-clip-text text-transparent">With 0% Commission</span>
              </h1>
            ) : (
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-black leading-[1.12] tracking-tight text-white">
                Find Top 1% Verified <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200 bg-clip-text text-transparent">Home Tutors</span>
              </h1>
            )}
          </div>

          {/* Dynamic Subtitle */}
          <p className="text-sm sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
            {isUserTeacher ? (
              t('heroTeacher.subtitle')
            ) : isUserStudent ? (
              t('heroStudent.subtitle')
            ) : activeRole === 'teacher' ? (
              t('hero.teacherSubtitle', "Connect directly with students and coaching institutes seeking verified educators. Zero commissions, direct parent requests, and verified badges.")
            ) : (
              t('hero.studentSubtitle', "Find background-verified educators for 1-on-1 home tuitions, online coaching batches, and school board prep across Prayagraj.")
            )}
          </p>

          {/* UI/UX PRO MAX: Interactive Instant Omni-Search Box */}
          <form 
            onSubmit={handleSearchSubmit}
            className="w-full max-w-2xl p-1.5 bg-slate-900/90 backdrop-blur-2xl rounded-2xl border border-white/20 shadow-2xl flex flex-col sm:flex-row items-center gap-2"
          >
            <div className="relative flex-grow w-full flex items-center pl-3.5 pr-2">
              <FiSearch className="text-amber-400 text-lg flex-shrink-0 mr-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  activeRole === 'teacher'
                    ? "Search students by subject, class, or city (e.g. Class 12, Physics, Delhi)..."
                    : "Search teachers by subject, exam, or city (e.g. CBSE Maths, NEET, Bangalore)..."
                }
                className="w-full bg-transparent text-white placeholder-slate-400 text-xs sm:text-sm font-medium focus:outline-none py-2.5"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded-md"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-glow-sm hover:shadow-glow-md transition-all flex items-center justify-center space-x-2 flex-shrink-0 cursor-pointer active:scale-[0.98]"
            >
              <span>Search</span>
              <FiArrowRight />
            </button>
          </form>

          {/* Quick Filter Tags Under Search */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-0.5">
            <span className="text-xs text-slate-400 font-semibold mr-1">Popular:</span>
            {quickTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleQuickTagClick(tag)}
                className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 hover:border-amber-400/40 text-slate-300 hover:text-amber-300 text-xs font-medium transition-all cursor-pointer backdrop-blur-sm"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto pt-1">
            {isUserTeacher ? (
              <Link 
                to="/students"
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl shadow-glow-sm hover:shadow-glow-md transition-all duration-300 text-center text-sm flex items-center justify-center hover:scale-[1.02]"
              >
                <FaUserGraduate className="mr-2" />
                {t('heroTeacher.findStudents')}
              </Link>
            ) : isUserStudent ? (
              <Link 
                to="/teachers"
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl shadow-glow-sm hover:shadow-glow-md transition-all duration-300 text-center text-sm flex items-center justify-center hover:scale-[1.02]"
              >
                <FaChalkboardTeacher className="mr-2" />
                {t('heroStudent.findTeachers')}
              </Link>
            ) : activeRole === 'teacher' ? (
              <>
                <Link 
                  to="/students"
                  className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl shadow-glow-sm hover:shadow-glow-md transition-all duration-300 text-center text-sm flex items-center justify-center hover:scale-[1.02]"
                >
                  <FaUserGraduate className="mr-2" />
                  {t('hero.findStudents', "Find Tuition Students")}
                </Link>
                <Link 
                  to="/signup?role=teacher"
                  className="w-full sm:w-auto px-8 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-amber-400/50 text-white font-bold rounded-xl backdrop-blur-md transition-all duration-300 text-center text-sm flex items-center justify-center"
                >
                  <FaChalkboardTeacher className="mr-2 text-amber-400" />
                  {t('hero.joinAsTeacher', "Join as Tutor")}
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/teachers"
                  className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl shadow-glow-sm hover:shadow-glow-md transition-all duration-300 text-center text-sm flex items-center justify-center hover:scale-[1.02]"
                >
                  <FaSearch className="mr-2 text-xs" />
                  {t('hero.findTeacher', "Find a Tutor")}
                </Link>
                <Link 
                  to="/signup?role=student"
                  className="w-full sm:w-auto px-8 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-amber-400/50 text-white font-bold rounded-xl backdrop-blur-md transition-all duration-300 text-center text-sm flex items-center justify-center"
                >
                  <FaUserGraduate className="mr-2 text-amber-400" />
                  {t('hero.joinAsStudent', "Join as Student")}
                </Link>
              </>
            )}
          </div>

          {/* Trust Highlights */}
          <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-slate-300">
            <span className="flex items-center space-x-1.5 text-amber-300 bg-white/5 px-3 py-1 rounded-full border border-white/10 backdrop-blur-xs">
              <FaCheckCircle className="text-amber-400 text-xs" />
              <span>{t('hero.trustDirect')}</span>
            </span>
            <span className="flex items-center space-x-1.5 text-slate-300 bg-white/5 px-3 py-1 rounded-full border border-white/10 backdrop-blur-xs">
              <FaCheckCircle className="text-emerald-400 text-xs" />
              <span>{t('hero.trustVerified')}</span>
            </span>
            <span className="flex items-center space-x-1.5 text-slate-300 bg-white/5 px-3 py-1 rounded-full border border-white/10 backdrop-blur-xs">
              <FaCheckCircle className="text-blue-400 text-xs" />
              <span>{t('hero.trustNoCommission')}</span>
            </span>
          </div>
        </motion.div>
        
        {/* Right Column: Live Dual-Perspective Floating Showcase */}
        <motion.div 
          className="lg:w-5/12 w-full mt-4 lg:mt-0 relative"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Subtle Ambient Backlight */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-tr from-amber-500/25 via-amber-600/10 to-blue-500/10 rounded-full filter blur-3xl pointer-events-none"></div>

          {/* Interactive Card Container */}
          <div className="relative mx-auto w-full max-w-md bg-slate-900/90 backdrop-blur-2xl rounded-3xl p-5 sm:p-6 border border-white/15 shadow-2xl space-y-4">
            {/* Header Switcher Tabs inside the Card */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 gap-2">
              <div className="flex items-center space-x-1 bg-white/5 p-1 rounded-2xl border border-white/10 w-full">
                <button
                  type="button"
                  onClick={() => setPreviewTab('students')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                    previewTab === 'students'
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-glow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FaUserGraduate size={12} />
                  <span>Tuition Inquiries</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab('teachers')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                    previewTab === 'teachers'
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-glow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FaChalkboardTeacher size={12} />
                  <span>Verified Tutors</span>
                </button>
              </div>
            </div>

            {/* Dynamic Items */}
            <AnimatePresence mode="wait">
              {previewTab === 'students' ? (
                /* Tab 1: Live Student Tuition Inquiries & Dashboard Summary */
                <motion.div
                  key="students-preview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-2.5"
                >
                  <div className="flex items-center justify-between text-[11px] text-amber-400 font-semibold px-1">
                    <span>{isAuthenticated ? 'My Dashboard Activity' : t('hero.recentInquiries')}</span>
                    <span className="flex items-center space-x-1.5 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>{isAuthenticated ? 'Dashboard Live' : t('hero.liveFeed')}</span>
                    </span>
                  </div>

                  {isAuthenticated ? (
                    <div className="space-y-2 pt-1">
                      <Link 
                        to={isUserTeacher ? "/dashboard#incoming" : "/dashboard#outgoing"}
                        className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 hover:border-amber-400/40 flex items-center justify-between transition-all duration-200 group cursor-pointer block"
                      >
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-xs group-hover:scale-105 transition-transform">
                            ⏳
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors flex items-center">
                              Pending Requests <FiArrowRight className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity" size={10} />
                            </div>
                            <div className="text-[10px] text-slate-400">Awaiting coordination / reply</div>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                          {dashboardMetrics?.incomingCount ?? dashboardMetrics?.sentCount ?? 0}
                        </span>
                      </Link>

                      <Link 
                        to="/dashboard#accepted"
                        className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 hover:border-emerald-400/40 flex items-center justify-between transition-all duration-200 group cursor-pointer block"
                      >
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs group-hover:scale-105 transition-transform">
                            <FaCheckCircle className="text-emerald-400" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors flex items-center">
                              Connected Tuitions <FiArrowRight className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity" size={10} />
                            </div>
                            <div className="text-[10px] text-slate-400">Active tuition connects</div>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                          {dashboardMetrics?.acceptedCount ?? 0}
                        </span>
                      </Link>

                      <Link 
                        to="/profile?tab=general"
                        className="p-2.5 bg-gradient-to-r from-amber-500/10 to-transparent hover:bg-amber-500/20 rounded-xl border border-amber-500/20 flex items-center justify-between text-xs transition-all group cursor-pointer block"
                      >
                        <span className="text-slate-300 font-medium group-hover:text-white transition-colors">Profile Approval</span>
                        <span className="font-bold text-amber-300 capitalize flex items-center">
                          {dashboardMetrics?.approvalStatus || 'Approved'} <FiArrowRight className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity" size={10} />
                        </span>
                      </Link>
                    </div>
                  ) : (
                    <>
                      <div className="p-3.5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 hover:border-amber-400/30 transition-all duration-200">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-white text-xs">{t('hero.class12JEE')}</span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {t('hero.activeRequest')}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-300">{t('hero.physicsMathsTutor')}</div>
                        <div className="flex items-center space-x-1 text-[10px] text-slate-400 mt-1.5">
                          <FaMapMarkerAlt size={9} className="text-amber-400" />
                          <span>{t('hero.bangaloreLocation')}</span>
                        </div>
                      </div>

                      <div className="p-3.5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 hover:border-amber-400/30 transition-all duration-200">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-white text-xs">{t('hero.neetDropper')}</span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {t('hero.urgentNeed')}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-300">{t('hero.biologyMentorship')}</div>
                        <div className="flex items-center space-x-1 text-[10px] text-slate-400 mt-1.5">
                          <FaMapMarkerAlt size={9} className="text-amber-400" />
                          <span>{t('hero.onlineMode')}</span>
                        </div>
                      </div>

                      <div className="p-3.5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 hover:border-blue-400/30 transition-all duration-200">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-white text-xs">{t('hero.foundationBatches')}</span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            {t('hero.directCall')}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-300">{t('hero.icseCoaching')}</div>
                        <div className="flex items-center space-x-1 text-[10px] text-slate-400 mt-1.5">
                          <FaMapMarkerAlt size={9} className="text-amber-400" />
                          <span>{t('hero.southDelhi')}</span>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="pt-2 flex items-center justify-between text-[11px] text-slate-300 px-1 border-t border-white/10">
                    <span className="flex items-center space-x-1 text-slate-400">
                      <FaBolt className="text-amber-400" />
                      <span>{isAuthenticated ? 'Active Dashboard Activity' : t('hero.activeStudentCount')}</span>
                    </span>
                    {isAuthenticated ? (
                      <Link to="/dashboard" className="font-bold text-amber-400 hover:text-amber-300 underline flex items-center">
                        My Dashboard <FiArrowRight className="ml-1" />
                      </Link>
                    ) : isUserStudent ? (
                      <Link to="/teachers" className="font-bold text-amber-400 hover:text-amber-300 underline flex items-center">
                        Find Tutors <FiArrowRight className="ml-1" />
                      </Link>
                    ) : (
                      <Link to="/students" className="font-bold text-amber-400 hover:text-amber-300 underline flex items-center">
                        {t('hero.browseStudents')} <FiArrowRight className="ml-1" />
                      </Link>
                    )}
                  </div>
                </motion.div>
              ) : (
                /* Tab 2: Top Verified Tutors (ASC Order: 4.8 ★ -> 4.9 ★ -> 5.0 ★) */
                <motion.div
                  key="teachers-preview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-2.5"
                >
                  <div className="flex items-center justify-between text-[11px] text-amber-400 font-semibold px-1">
                    <span>Verified Tutors (Ranked by Rating: ASC)</span>
                    <span className="flex items-center space-x-1.5 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>Verified Tutors</span>
                    </span>
                  </div>

                  {/* 1st in ASC Order: 4.8 ★ */}
                  <div className="p-3.5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 hover:border-amber-400/30 transition-all duration-200">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-white text-xs">{t('hero.neetBiologyFaculty')}</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        <FaStar className="text-amber-400 text-[9px]" /> 4.8 ★
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300">{t('hero.aiimsFaculty')}</div>
                    <div className="text-[10px] text-amber-400/90 mt-1.5 font-medium">{t('hero.expBiology')}</div>
                  </div>

                  {/* 2nd in ASC Order: 4.9 ★ */}
                  <div className="p-3.5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 hover:border-amber-400/30 transition-all duration-200">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-white text-xs">{t('hero.physicsAdvancedMaths')}</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <FaStar className="text-emerald-400 text-[9px]" /> 4.9 ★
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300">{t('hero.iitAlum')}</div>
                    <div className="text-[10px] text-amber-400/90 mt-1.5 font-medium">{t('hero.expYears')}</div>
                  </div>

                  {/* 3rd in ASC Order: 5.0 ★ */}
                  <div className="p-3.5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 hover:border-blue-400/30 transition-all duration-200">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-white text-xs">{t('hero.chemistryFoundation')}</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                        <FaStar className="text-blue-400 text-[9px]" /> 5.0 ★
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300">{t('hero.bitsPilani')}</div>
                    <div className="text-[10px] text-slate-400 mt-1.5">{t('hero.expChemistry')}</div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-[11px] text-slate-300 px-1 border-t border-white/10">
                    <span className="flex items-center space-x-1 text-slate-400">
                      <FaBolt className="text-amber-400" />
                      <span>{t('hero.activeMentorsCount')}</span>
                    </span>
                    <Link to="/teachers" className="font-bold text-amber-400 hover:text-amber-300 underline flex items-center">
                      Find Verified Tutors <FiArrowRight className="ml-1" />
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Stitch Obsidian Elite EdTech: Value Proposition / Trust Architecture Grid */}
      <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 relative z-10 mt-14 sm:mt-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Card 1: 0% Commission */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/85 backdrop-blur-xl border border-white/10 hover:border-amber-400/35 transition-all duration-300 shadow-2xl flex items-start space-x-3.5 group">
            <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
              <span className="text-lg font-black font-display tracking-tighter">0%</span>
            </div>
            <div>
              <h3 className="font-display font-bold text-white text-sm sm:text-base">0% Commission</h3>
              <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">Pay educators directly with zero hidden agency cuts.</p>
            </div>
          </div>

          {/* Card 2: 100% Verified Faculty */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/85 backdrop-blur-xl border border-white/10 hover:border-emerald-400/35 transition-all duration-300 shadow-2xl flex items-start space-x-3.5 group">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
              <FaShieldAlt className="text-lg" />
            </div>
            <div>
              <h3 className="font-display font-bold text-white text-sm sm:text-base">100% Verified Faculty</h3>
              <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">Aadhaar identity, university degrees & police audited.</p>
            </div>
          </div>

          {/* Card 3: Free Demo Guarantee */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/85 backdrop-blur-xl border border-white/10 hover:border-sky-400/35 transition-all duration-300 shadow-2xl flex items-start space-x-3.5 group">
            <div className="w-11 h-11 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
              <FaCheckCircle className="text-lg" />
            </div>
            <div>
              <h3 className="font-display font-bold text-white text-sm sm:text-base">Free Demo Guarantee</h3>
              <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">1-on-1 trial session. Switch tutors instantly if needed.</p>
            </div>
          </div>
        </div>
      </div>


      {/* Modern Wave Section Divider Transition into CoverageSection */}
      <SectionDivider 
        toColor="text-slate-50" 
        accentColor="rgba(245, 158, 11, 0.22)" 
        className="absolute bottom-0 left-0 right-0 z-10" 
      />
    </section>
  );
};

export default HeroSection;
