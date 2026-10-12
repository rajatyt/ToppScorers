import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { 
  FaGraduationCap, 
  FaUserGraduate, 
  FaChalkboardTeacher, 
  FaCheckCircle, 
  FaSearch, 
  FaMapMarkerAlt,
  FaBolt,
  FaBookOpen,
  FaAtom
} from 'react-icons/fa';
import { FiArrowRight, FiCheck } from 'react-icons/fi';
import SectionDivider from '../common/SectionDivider';

const HeroSection = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useContext(AuthContext);

  const isUserTeacher = user?.role === 'teacher';
  const isUserStudent = user?.role === 'student';

  // For unauthenticated visitors, provide interactive role toggling
  const [activeRole, setActiveRole] = useState(isUserTeacher ? 'teacher' : 'student');
  const [previewTab, setPreviewTab] = useState(isUserTeacher ? 'students' : 'teachers');

  const handleRoleSwitch = (role) => {
    setActiveRole(role);
    setPreviewTab(role === 'student' ? 'teachers' : 'students');
  };

  return (
    <section className="relative w-full text-white overflow-hidden pt-16 pb-28 sm:pt-20 sm:pb-36 lg:pb-40 bg-slate-950">
      {/* Layer 1: High-res authentic Educator Hub / Modern Learning Academy Atmospheric Backdrop */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none transform scale-105 opacity-25"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop')`,
        }}
      />

      {/* Layer 2: Deep Academy Gradient Overlay for Contrast & Elegance */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-slate-950/90 to-amber-950/85 backdrop-blur-[1px] pointer-events-none"
      />

      {/* Layer 3: Multi-Directional Hub Lighting Gradients */}
      <div 
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-amber-500/15 via-transparent to-blue-950/30 pointer-events-none"
      />


      {/* Layer 5: Stylized Floating Academic Motifs / Watermarks */}
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

        {/* Subtle Constellation Connection Orbs (Educator <-> Student Network) */}
        <div className="absolute top-1/4 left-1/2 w-2 h-2 rounded-full bg-amber-400/30 animate-ping" />
        <div className="absolute top-1/3 right-1/4 w-2 h-2 rounded-full bg-blue-400/30 animate-ping delay-1000" />
      </div>

      {/* Layer 6: Ambient Glowing Spotlights */}
      <div className="absolute -top-32 right-10 w-[550px] h-[550px] bg-amber-500/15 rounded-full filter blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-20 w-[500px] h-[500px] bg-blue-600/15 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-amber-600/10 rounded-full filter blur-[90px] pointer-events-none" />
      
      <div className="container mx-auto px-6 md:px-12 lg:px-24 relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
        {/* Left Column: Heading, Audience Switcher, CTAs */}
        <motion.div 
          className="lg:w-7/12 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          {/* Top Network Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-amber-500/15 text-amber-300 font-bold text-xs uppercase tracking-wider border border-amber-500/30 shadow-lg backdrop-blur-md">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <FaGraduationCap className="text-sm text-amber-400" />
            <span>{t('hero.badge', "India's #1 Platform for Students & Educators")}</span>
          </div>

          {/* Interactive Role Switcher for Guests */}
          {!isAuthenticated && (
            <div className="flex items-center p-1.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 w-full sm:w-auto shadow-inner">
              <button
                type="button"
                onClick={() => handleRoleSwitch('student')}
                className={`flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 flex-1 sm:flex-initial cursor-pointer ${
                  activeRole === 'student'
                    ? 'bg-amber-500 text-slate-950 shadow-md scale-[1.02]'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
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
                    ? 'bg-amber-500 text-slate-950 shadow-md scale-[1.02]'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <FaChalkboardTeacher className="text-sm" />
                <span>{t('hero.teacherTab', "I'm a Teacher / Tutor")}</span>
              </button>
            </div>
          )}

          {/* Main Title */}
          <div className="space-y-2">
            {isUserTeacher ? (
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-white">
                {t('heroTeacher.title')}
              </h1>
            ) : isUserStudent ? (
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-white">
                {t('heroStudent.title')}
              </h1>
            ) : activeRole === 'teacher' ? (
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-white">
                {t('hero.teacherTitle')}
              </h1>
            ) : (
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-white">
                {t('hero.studentTitle')}
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
              t('hero.studentSubtitle', "Find background-verified educators for 1-on-1 home tuitions, online coaching batches, and school board prep across India.")
            )}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto pt-1">
            {isUserTeacher ? (
              <>
                <Link 
                  to="/students"
                  className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all duration-300 text-center text-sm flex items-center justify-center hover:scale-[1.02]"
                >
                  <FaUserGraduate className="mr-2" />
                  {t('heroTeacher.findStudents')}
                </Link>
                <Link 
                  to="/dashboard"
                  className="w-full sm:w-auto px-8 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 text-white font-bold rounded-xl transition-all duration-300 text-center text-sm flex items-center justify-center"
                >
                  {t('heroTeacher.myDashboard')}
                  <FiArrowRight className="ml-2" />
                </Link>
              </>
            ) : isUserStudent ? (
              <>
                <Link 
                  to="/teachers"
                  className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all duration-300 text-center text-sm flex items-center justify-center hover:scale-[1.02]"
                >
                  <FaChalkboardTeacher className="mr-2" />
                  {t('heroStudent.findTeachers')}
                </Link>
                <Link 
                  to="/dashboard"
                  className="w-full sm:w-auto px-8 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 text-white font-bold rounded-xl transition-all duration-300 text-center text-sm flex items-center justify-center"
                >
                  {t('heroStudent.myDashboard')}
                  <FiArrowRight className="ml-2" />
                </Link>
              </>
            ) : activeRole === 'teacher' ? (
              <>
                <Link 
                  to="/students"
                  className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all duration-300 text-center text-sm flex items-center justify-center hover:scale-[1.02]"
                >
                  <FaUserGraduate className="mr-2" />
                  {t('hero.findStudents', "Find Tuition Students")}
                </Link>
                <Link 
                  to="/signup?role=teacher"
                  className="w-full sm:w-auto px-8 py-3.5 bg-white/10 hover:bg-white/20 border border-white/25 hover:border-white/50 text-white font-bold rounded-xl transition-all duration-300 text-center text-sm flex items-center justify-center"
                >
                  <FaChalkboardTeacher className="mr-2" />
                  {t('hero.joinAsTeacher', "Join as Teacher")}
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/teachers"
                  className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all duration-300 text-center text-sm flex items-center justify-center hover:scale-[1.02]"
                >
                  <FaSearch className="mr-2 text-xs" />
                  {t('hero.findTeacher', "Find a Teacher")}
                </Link>
                <Link 
                  to="/signup?role=student"
                  className="w-full sm:w-auto px-8 py-3.5 bg-white/10 hover:bg-white/20 border border-white/25 hover:border-white/50 text-white font-bold rounded-xl transition-all duration-300 text-center text-sm flex items-center justify-center"
                >
                  <FaUserGraduate className="mr-2" />
                  {t('hero.joinAsStudent', "Join as Student")}
                </Link>
              </>
            )}
          </div>

          {/* Trust Highlights */}
          <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-slate-300">
            <span className="flex items-center space-x-1.5 text-amber-300">
              <FaCheckCircle className="text-amber-400 text-xs" />
              <span>{t('hero.trustDirect')}</span>
            </span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="flex items-center space-x-1.5 text-slate-300">
              <FaCheckCircle className="text-emerald-400 text-xs" />
              <span>{t('hero.trustVerified')}</span>
            </span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="flex items-center space-x-1.5 text-slate-300">
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
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-tr from-amber-500/25 via-amber-600/10 to-blue-500/10 rounded-full filter blur-2xl"></div>

          {/* Interactive Card Container */}
          <div className="relative mx-auto w-full max-w-md bg-slate-900/80 backdrop-blur-xl rounded-3xl p-5 sm:p-6 border border-white/15 shadow-2xl space-y-4">
            {/* Header Switcher Tabs inside the Card */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 gap-2">
              <div className="flex items-center space-x-1 bg-white/5 p-1 rounded-xl border border-white/10 w-full">
                <button
                  type="button"
                  onClick={() => setPreviewTab('students')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                    previewTab === 'students'
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FaUserGraduate size={12} />
                  <span>Tuition Inquiries</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab('teachers')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                    previewTab === 'teachers'
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FaChalkboardTeacher size={12} />
                  <span>{t('hero.verifiedMentors')}</span>
                </button>
              </div>
            </div>

            {/* Dynamic Items */}
            <AnimatePresence mode="wait">
              {previewTab === 'students' ? (
                /* Tab 1: Live Student Tuition Inquiries */
                <motion.div
                  key="students-preview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-2.5"
                >
                  <div className="flex items-center justify-between text-[11px] text-amber-400 font-semibold px-1">
                    <span>{t('hero.recentInquiries')}</span>
                    <span className="flex items-center space-x-1 text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>{t('hero.liveFeed')}</span>
                    </span>
                  </div>

                  <div className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white text-xs">{t('hero.class12JEE')}</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {t('hero.activeRequest')}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300">{t('hero.physicsMathsTutor')}</div>
                    <div className="flex items-center space-x-1 text-[10px] text-slate-400 mt-1">
                      <FaMapMarkerAlt size={9} className="text-amber-400" />
                      <span>{t('hero.bangaloreLocation')}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white text-xs">{t('hero.neetDropper')}</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {t('hero.urgentNeed')}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300">{t('hero.biologyMentorship')}</div>
                    <div className="flex items-center space-x-1 text-[10px] text-slate-400 mt-1">
                      <FaMapMarkerAlt size={9} className="text-amber-400" />
                      <span>{t('hero.onlineMode')}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white text-xs">{t('hero.foundationBatches')}</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {t('hero.directCall')}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300">{t('hero.icseCoaching')}</div>
                    <div className="flex items-center space-x-1 text-[10px] text-slate-400 mt-1">
                      <FaMapMarkerAlt size={9} className="text-amber-400" />
                      <span>{t('hero.southDelhi')}</span>
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-between text-[11px] text-slate-300 px-1">
                    <span className="flex items-center space-x-1 text-slate-400">
                      <FaBolt className="text-amber-400" />
                      <span>{t('hero.activeStudentCount')}</span>
                    </span>
                    <Link to="/students" className="font-bold text-amber-400 hover:text-amber-300 underline flex items-center">
                      {t('hero.browseStudents')} <FiArrowRight className="ml-1" />
                    </Link>
                  </div>
                </motion.div>
              ) : (
                /* Tab 2: Top Verified Teachers */
                <motion.div
                  key="teachers-preview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-2.5"
                >
                  <div className="flex items-center justify-between text-[11px] text-amber-400 font-semibold px-1">
                    <span>{t('hero.verifiedMentorship')}</span>
                    <span className="flex items-center space-x-1 text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>{t('hero.verifiedBadgeText')}</span>
                    </span>
                  </div>

                  <div className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white text-xs">{t('hero.physicsAdvancedMaths')}</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {t('hero.verifiedBadgeText')}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300">{t('hero.iitAlum')}</div>
                    <div className="text-[10px] text-amber-400/90 mt-1 font-medium">{t('hero.expYears')}</div>
                  </div>

                  <div className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white text-xs">{t('hero.neetBiologyFaculty')}</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {t('hero.verifiedBadgeText')}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300">{t('hero.aiimsFaculty')}</div>
                    <div className="text-[10px] text-amber-400/90 mt-1 font-medium">{t('hero.expBiology')}</div>
                  </div>

                  <div className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white text-xs">{t('hero.chemistryFoundation')}</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {t('hero.directCall')}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300">{t('hero.bitsPilani')}</div>
                    <div className="text-[10px] text-slate-400 mt-1">{t('hero.expChemistry')}</div>
                  </div>

                  <div className="pt-1 flex items-center justify-between text-[11px] text-slate-300 px-1">
                    <span className="flex items-center space-x-1 text-slate-400">
                      <FaBolt className="text-amber-400" />
                      <span>{t('hero.activeMentorsCount')}</span>
                    </span>
                    <Link to="/teachers" className="font-bold text-amber-400 hover:text-amber-300 underline flex items-center">
                      {t('hero.browseTeachers')} <FiArrowRight className="ml-1" />
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
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
