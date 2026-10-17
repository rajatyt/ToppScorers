import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaGraduationCap, 
  FaAtom, 
  FaStethoscope, 
  FaBookReader, 
  FaLandmark, 
  FaCogs, 
  FaUniversity, 
  FaLaptopCode, 
  FaAward, 
  FaUserTie,
  FaArrowRight,
  FaThLarge
} from 'react-icons/fa';
import SectionDivider from '../common/SectionDivider';

const CoverageSection = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('all');

  const categories = [
    { id: 'all', label: t('coverage.tabAll', 'All Streams'), icon: FaThLarge },
    { id: 'school', label: t('coverage.tabSchool', 'School Level (1–12)'), icon: FaBookReader },
    { id: 'entrance', label: t('coverage.tabEntrance', 'Engineering & Medical'), icon: FaAtom },
    { id: 'competitive', label: t('coverage.tabCompetitive', 'Govt & Competitive'), icon: FaLandmark },
    { id: 'skills', label: t('coverage.tabSkills', 'Skills & Tech'), icon: FaLaptopCode },
  ];

  const coverageItems = [
    // 1. School Level
    {
      id: 'school-lower',
      category: 'school',
      icon: <FaBookReader className="w-6 h-6 text-emerald-600" />,
      theme: 'emerald',
      title: t('coverage.schoolLowerTitle', 'Lower & Middle School (Classes 1–10)'),
      badge: t('coverage.schoolLowerBadge', 'Classes 1–10'),
      desc: t('coverage.schoolLowerDesc', 'Build robust conceptual clarity and homework mastery in Maths, Science (Physics, Chemistry, Biology), and Social Science for growing young minds.'),
      subjects: ['Mathematics', 'Science (Physics, Chem, Bio)', 'Social Science', 'English', 'Mental Math'],
      searchQuery: 'Mathematics'
    },
    {
      id: 'school-senior',
      category: 'school',
      icon: <FaGraduationCap className="w-6 h-6 text-emerald-600" />,
      theme: 'emerald',
      title: t('coverage.schoolSeniorTitle', 'Senior Secondary (Classes 11–12)'),
      badge: t('coverage.schoolSeniorBadge', 'Classes 11–12'),
      desc: t('coverage.schoolSeniorDesc', 'Deep-dive subject specialization across Physics, Chemistry, Maths, and Biology (PCMB) with rigorous problem solving.'),
      subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Accountancy', 'Economics'],
      searchQuery: 'Physics'
    },
    {
      id: 'school-board',
      category: 'school',
      icon: <FaAward className="w-6 h-6 text-teal-600" />,
      theme: 'teal',
      title: t('coverage.schoolBoardTitle', 'Board Exam Preparation'),
      badge: t('coverage.schoolBoardBadge', 'Boards 10th & 12th'),
      desc: t('coverage.schoolBoardDesc', 'Tailored scoring strategies, previous years question papers, and answer presentation techniques for CBSE and state boards.'),
      subjects: ['CBSE Board', 'ICSE / ISC', 'State Boards', 'Sample Papers', 'Board PYQs'],
      searchQuery: 'CBSE'
    },
    {
      id: 'school-foundation',
      category: 'school',
      icon: <FaUniversity className="w-6 h-6 text-emerald-700" />,
      theme: 'emerald',
      title: t('coverage.schoolFoundationTitle', 'Foundation Courses (Classes 6–10)'),
      badge: t('coverage.schoolFoundationBadge', 'Early Advantage'),
      desc: t('coverage.schoolFoundationDesc', 'Early conceptual foundation courses bridging school syllabus to JEE, NEET, Olympiads, and NTSE analytical benchmarks.'),
      subjects: ['JEE Foundation', 'NEET Foundation', 'Olympiads (IMO/NSO)', 'NTSE', 'Aptitude & Logic'],
      searchQuery: 'Foundation'
    },

    // 2. Engineering & Medical Entrance
    {
      id: 'entrance-jee',
      category: 'entrance',
      icon: <FaAtom className="w-6 h-6 text-amber-600" />,
      theme: 'amber',
      title: t('coverage.jeeTitle', 'JEE Main & Advanced'),
      badge: t('coverage.jeeBadge', 'Engineering Entrance'),
      desc: t('coverage.jeeDesc', 'Comprehensive coaching in Physics, Chemistry, and Advanced Mathematics for IIT, NIT, and IIIT admissions.'),
      subjects: ['Physics (Mechanics, Electrodynamics)', 'Chemistry (Organic, Inorganic, Physical)', 'Mathematics (Calculus, Algebra, Coordinate)'],
      searchQuery: 'JEE'
    },
    {
      id: 'entrance-neet',
      category: 'entrance',
      icon: <FaStethoscope className="w-6 h-6 text-rose-600" />,
      theme: 'rose',
      title: t('coverage.neetTitle', 'NEET (UG) Medical Entrance'),
      badge: t('coverage.neetBadge', 'Medical Entrance'),
      desc: t('coverage.neetDesc', 'Intensive line-by-line NCERT mastery across Physics, Chemistry, and Biology (Botany and Zoology) for top medical colleges.'),
      subjects: ['Physics', 'Chemistry', 'Biology (Botany)', 'Biology (Zoology)', 'NCERT line-by-line', 'Mock Test Drills'],
      searchQuery: 'NEET'
    },
    {
      id: 'entrance-other',
      category: 'entrance',
      icon: <FaUniversity className="w-6 h-6 text-orange-600" />,
      theme: 'orange',
      title: t('coverage.otherEntranceTitle', 'BITSAT, CUET & State CETs'),
      badge: t('coverage.otherEntranceBadge', 'Top Universities'),
      desc: t('coverage.otherEntranceDesc', 'Specialized training for BITSAT, CUET (Central Universities), and state CETs (MHT-CET, KCET, WBJEE) for premier college admissions.'),
      subjects: ['BITSAT', 'CUET UG', 'State CETs', 'VITEEE', 'General Aptitude', 'Domain Specific'],
      searchQuery: 'CUET'
    },

    // 3. Government & Competitive Exams
    {
      id: 'comp-upsc',
      category: 'competitive',
      icon: <FaLandmark className="w-6 h-6 text-indigo-600" />,
      theme: 'indigo',
      title: t('coverage.upscTitle', 'UPSC Civil Services & State PCS'),
      badge: t('coverage.upscBadge', 'IAS / IPS / PCS'),
      desc: t('coverage.upscDesc', 'Comprehensive GS mentorship covering History, Polity, Geography, Economics, Current Affairs, and CSAT answer writing.'),
      subjects: ['Indian History', 'Polity & Constitution', 'Geography', 'Economics', 'Current Affairs', 'CSAT & Mains Prep'],
      searchQuery: 'UPSC'
    },
    {
      id: 'comp-gate',
      category: 'competitive',
      icon: <FaCogs className="w-6 h-6 text-blue-600" />,
      theme: 'blue',
      title: t('coverage.gateTitle', 'GATE & Engineering Exams'),
      badge: t('coverage.gateBadge', 'PSUs & Masters'),
      desc: t('coverage.gateDesc', 'Advanced engineering coaching for GATE, ESE, and PSU technical tests across Mechanical, Civil, Electrical, and CS streams.'),
      subjects: ['Mechanical', 'Civil', 'Electrical', 'Computer Science & IT', 'Engineering Maths', 'PSU Tests'],
      searchQuery: 'GATE'
    },
    {
      id: 'comp-ssc',
      category: 'competitive',
      icon: <FaUserTie className="w-6 h-6 text-violet-600" />,
      theme: 'violet',
      title: t('coverage.sscBankingTitle', 'SSC, Banking, Railways & Defence'),
      badge: t('coverage.sscBankingBadge', 'Government Careers'),
      desc: t('coverage.sscBankingDesc', 'Speed shortcuts and high-accuracy training in Quantitative Aptitude, Logical Reasoning, English, and General Awareness.'),
      subjects: ['Quantitative Aptitude', 'Logical Reasoning', 'General English', 'General Awareness (GA)', 'SSC CGL/CHSL', 'IBPS/SBI PO & Clerk'],
      searchQuery: 'SSC'
    },
    {
      id: 'comp-teaching',
      category: 'competitive',
      icon: <FaGraduationCap className="w-6 h-6 text-purple-600" />,
      theme: 'purple',
      title: t('coverage.teachingLawTitle', 'Teaching & Professional Entrances'),
      badge: t('coverage.teachingLawBadge', 'CTET & Professional'),
      desc: t('coverage.teachingLawDesc', 'Pedagogy and concepts for CTET, State TETs, plus law entrance (CLAT), commerce, and management preparation.'),
      subjects: ['CTET & State TETs', 'Child Pedagogy', 'CLAT (Law Entrance)', 'CAT / Management', 'CA / CS Foundation'],
      searchQuery: 'Teaching'
    },

    // 4. Skills & Tech
    {
      id: 'skills-tech',
      category: 'skills',
      icon: <FaLaptopCode className="w-6 h-6 text-cyan-600" />,
      theme: 'cyan',
      title: t('coverage.skillsTitle', 'Skill & Upskilling Courses'),
      badge: t('coverage.skillsBadge', 'Future-Ready Skills'),
      desc: t('coverage.skillsDesc', 'Hands-on coding, programming (Python, Java, C++, Web Dev), Data Science, AI basics, and digital upskilling mentorship.'),
      subjects: ['Python & Java', 'C++ & DSA', 'Web Development', 'Data Science & SQL', 'AI & Machine Learning', 'Practical Mentorship'],
      searchQuery: 'Coding'
    }
  ];

  const filteredItems = activeTab === 'all' 
    ? coverageItems 
    : coverageItems.filter(item => item.category === activeTab);

  const getThemeClasses = (theme) => {
    switch (theme) {
      case 'emerald':
        return {
          border: 'border-l-emerald-500 hover:border-emerald-500',
          badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
          iconBg: 'bg-emerald-50',
          chipBg: 'bg-emerald-50/80 text-emerald-950 border-emerald-200/60 hover:bg-emerald-100',
          btnBg: 'hover:text-emerald-700'
        };
      case 'teal':
        return {
          border: 'border-l-teal-500 hover:border-teal-500',
          badgeBg: 'bg-teal-50 text-teal-800 border-teal-200/80',
          iconBg: 'bg-teal-50',
          chipBg: 'bg-teal-50/80 text-teal-950 border-teal-200/60 hover:bg-teal-100',
          btnBg: 'hover:text-teal-700'
        };
      case 'amber':
        return {
          border: 'border-l-amber-500 hover:border-amber-500',
          badgeBg: 'bg-amber-50 text-amber-900 border-amber-200/80',
          iconBg: 'bg-amber-50',
          chipBg: 'bg-amber-50/80 text-amber-950 border-amber-200/60 hover:bg-amber-100',
          btnBg: 'hover:text-amber-700'
        };
      case 'rose':
        return {
          border: 'border-l-rose-500 hover:border-rose-500',
          badgeBg: 'bg-rose-50 text-rose-800 border-rose-200/80',
          iconBg: 'bg-rose-50',
          chipBg: 'bg-rose-50/80 text-rose-950 border-rose-200/60 hover:bg-rose-100',
          btnBg: 'hover:text-rose-700'
        };
      case 'orange':
        return {
          border: 'border-l-orange-500 hover:border-orange-500',
          badgeBg: 'bg-orange-50 text-orange-900 border-orange-200/80',
          iconBg: 'bg-orange-50',
          chipBg: 'bg-orange-50/80 text-orange-950 border-orange-200/60 hover:bg-orange-100',
          btnBg: 'hover:text-orange-700'
        };
      case 'indigo':
        return {
          border: 'border-l-indigo-500 hover:border-indigo-500',
          badgeBg: 'bg-indigo-50 text-indigo-900 border-indigo-200/80',
          iconBg: 'bg-indigo-50',
          chipBg: 'bg-indigo-50/80 text-indigo-950 border-indigo-200/60 hover:bg-indigo-100',
          btnBg: 'hover:text-indigo-700'
        };
      case 'blue':
        return {
          border: 'border-l-blue-500 hover:border-blue-500',
          badgeBg: 'bg-blue-50 text-blue-900 border-blue-200/80',
          iconBg: 'bg-blue-50',
          chipBg: 'bg-blue-50/80 text-blue-950 border-blue-200/60 hover:bg-blue-100',
          btnBg: 'hover:text-blue-700'
        };
      case 'violet':
      case 'purple':
        return {
          border: 'border-l-violet-500 hover:border-violet-500',
          badgeBg: 'bg-violet-50 text-violet-900 border-violet-200/80',
          iconBg: 'bg-violet-50',
          chipBg: 'bg-violet-50/80 text-violet-950 border-violet-200/60 hover:bg-violet-100',
          btnBg: 'hover:text-violet-700'
        };
      case 'cyan':
      default:
        return {
          border: 'border-l-cyan-500 hover:border-cyan-500',
          badgeBg: 'bg-cyan-50 text-cyan-900 border-cyan-200/80',
          iconBg: 'bg-cyan-50',
          chipBg: 'bg-cyan-50/80 text-cyan-950 border-cyan-200/60 hover:bg-cyan-100',
          btnBg: 'hover:text-cyan-700'
        };
    }
  };

  return (
    <section className="relative pt-20 pb-32 sm:pb-36 bg-slate-50 text-slate-900 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 max-w-7xl">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/90 text-amber-900 font-extrabold text-xs uppercase tracking-wider mb-3 shadow-2xs border border-amber-200/60">
            <FaGraduationCap className="text-amber-600 text-sm" />
            {t('coverage.eyebrow', 'Academic & Exam Coverage')}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
            {t('coverage.heading', 'Subjects You Can Teach & Learn on ToppScorers')}
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            {t('coverage.subtext', 'From foundational school classes (1–12) to engineering, medical, government civil services, and tech skills — connect with verified educators across every subject that matters.')}
          </p>

          {/* Interactive Filter Tabs - Non-Breaking Segmented Container */}
          <div className="mt-8 flex items-center justify-center">
            <div className="inline-flex items-center gap-2 p-1.5 bg-slate-200/75 backdrop-blur-md rounded-2xl border border-slate-300/70 shadow-inner max-w-full overflow-x-auto no-scrollbar py-2 px-2">
              {categories.map((cat) => {
                const isActive = activeTab === cat.id;
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveTab(cat.id)}
                    type="button"
                    className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer whitespace-nowrap flex-shrink-0 active:scale-[0.98] ${
                      isActive
                        ? 'bg-slate-900 text-amber-400 shadow-md border border-slate-900 ring-2 ring-amber-400/25'
                        : 'bg-white/90 text-slate-700 hover:text-slate-950 hover:bg-white border border-slate-200/80 shadow-2xs'
                    }`}
                  >
                    {Icon && <Icon className={`text-xs sm:text-sm flex-shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />}
                    <span className="whitespace-nowrap">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Coverage Cards Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {filteredItems.map((item) => {
              const theme = getThemeClasses(item.theme);
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  key={item.id}
                  className={`bg-white rounded-2xl shadow-xs hover:shadow-card-hover border border-slate-200/80 border-t-4 ${theme.border} p-6 transition-all duration-300 flex flex-col justify-between hover:-translate-y-1.5 group relative overflow-hidden`}
                >
                  <div>
                    {/* Top Row: Icon & Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-2xl ${theme.iconBg} shadow-inner group-hover:scale-110 transition-transform duration-300`}>
                        {item.icon}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-black border ${theme.badgeBg}`}>
                        {item.badge}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-display text-lg sm:text-xl font-bold text-slate-900 mb-2 leading-snug group-hover:text-amber-600 transition-colors">
                      {item.title}
                    </h3>

                    {/* Description */}
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4">
                      {item.desc}
                    </p>

                    {/* Subject Pills (Clickable for instant search) */}
                    <div className="space-y-2 mb-4">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                        Tap any subject to search tutors:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {item.subjects.map((sub, i) => (
                          <Link
                            key={i}
                            to={`/teachers?search=${encodeURIComponent(sub)}`}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer shadow-2xs hover:scale-[1.03] active:scale-[0.97] ${theme.chipBg}`}
                            title={`Find ${sub} tutors`}
                          >
                            {sub}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <Link
                      to={`/teachers?search=${encodeURIComponent(item.searchQuery || item.title)}`}
                      className={`text-xs font-extrabold flex items-center gap-1.5 text-slate-700 hover:text-amber-600 transition-colors ${theme.btnBg}`}
                    >
                      <span>Browse {item.badge} Tutors</span>
                      <FaArrowRight size={11} className="transform group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Bottom Banner: Call to Action */}
        <div className="mt-14 bg-gradient-to-r from-[#0a0f1d] via-[#161f36] to-[#0a0f1d] text-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-xl text-center md:text-left">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs uppercase tracking-wider mb-2 border border-amber-500/30">
              Personalized Learning & Teaching
            </span>
            <h3 className="font-display text-xl sm:text-2xl lg:text-3xl font-black mb-2 leading-tight">
              Learn or Teach Any Subject with 1-on-1 Focus
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm">
              Connect directly with verified educators or post your learning requirement with zero ongoing commission.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-3 flex-wrap justify-center">
            <Link
              to="/teachers"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-glow-sm hover:shadow-glow-md transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>{t('coverage.findTutors', 'Find Verified Tutors')}</span>
              <FaArrowRight size={12} />
            </Link>
            <Link
              to="/students"
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs sm:text-sm backdrop-blur-md transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>{t('coverage.findStudents', 'Find Tuition Students')}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Modern Wave Section Divider Transition */}
      <SectionDivider 
        toColor="text-slate-900" 
        accentColor="rgba(245, 158, 11, 0.2)" 
        flip={true}
        className="absolute bottom-0 left-0 right-0 z-10" 
      />
    </section>
  );
};

export default CoverageSection;
