import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  HiOutlineAcademicCap, 
  HiOutlineBeaker, 
  HiOutlineBookOpen, 
  HiOutlineLibrary, 
  HiOutlineOfficeBuilding, 
  HiOutlineBriefcase, 
  HiOutlineCalculator, 
  HiOutlineBadgeCheck 
} from 'react-icons/hi';
import SectionDivider from '../common/SectionDivider';

const CoverageSection = () => {
  const { t } = useTranslation();

  const cards = [
    { key: 'jee', title: t('coverage.jee'), desc: t('coverage.jeeDesc'), icon: <HiOutlineLibrary className="w-8 h-8" /> },
    { key: 'neet', title: t('coverage.neet'), desc: t('coverage.neetDesc'), icon: <HiOutlineBeaker className="w-8 h-8" /> },
    { key: 'foundation', title: t('coverage.foundation'), desc: t('coverage.foundationDesc'), icon: <HiOutlineBookOpen className="w-8 h-8" /> },
    { key: 'board', title: t('coverage.board'), desc: t('coverage.boardDesc'), icon: <HiOutlineOfficeBuilding className="w-8 h-8" /> },
    { key: 'cuet', title: t('coverage.cuet'), desc: t('coverage.cuetDesc'), icon: <HiOutlineAcademicCap className="w-8 h-8" /> },
    { key: 'upsc', title: t('coverage.upsc'), desc: t('coverage.upscDesc'), icon: <HiOutlineBriefcase className="w-8 h-8" /> },
    { key: 'ca', title: t('coverage.ca'), desc: t('coverage.caDesc'), icon: <HiOutlineCalculator className="w-8 h-8" /> },
    { key: 'cat', title: t('coverage.cat'), desc: t('coverage.catDesc'), icon: <HiOutlineBadgeCheck className="w-8 h-8" /> },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <section className="relative pt-16 pb-28 sm:pb-36 bg-slate-50 text-slate-900 overflow-hidden">
      <div className="container mx-auto px-6 md:px-12 lg:px-24">
        <div className="text-center mb-16">
          <p className="text-amber-600 font-bold tracking-wider uppercase text-sm mb-2">{t('coverage.eyebrow')}</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('coverage.heading')}</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">{t('coverage.subtext')}</p>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {cards.map((card) => (
            <motion.div 
              key={card.key} 
              variants={itemVariants}
              className="bg-white rounded-xl shadow border-l-4 border-amber-500 p-6 hover:shadow-lg transition-shadow duration-300 flex flex-col h-full"
            >
              <div className="text-amber-500 mb-4 p-3 bg-amber-50 rounded-full w-fit">
                {card.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{card.title}</h3>
              <p className="text-slate-500 text-sm flex-grow">{card.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Modern Wave Section Divider Transition into WhyTeacherHunt */}
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
