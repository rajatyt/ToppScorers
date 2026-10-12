import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiCheckCircle, HiArrowRight } from 'react-icons/hi';
import SectionDivider from '../common/SectionDivider';

const ForTeachers = () => {
  const { t } = useTranslation();

  const bullets = [
    t('forTeachers.bullet1'),
    t('forTeachers.bullet2'),
    t('forTeachers.bullet3'),
    t('forTeachers.bullet4'),
  ];

  return (
    <section className="relative pt-20 pb-28 sm:pb-36 bg-white overflow-hidden">
      <div className="container mx-auto px-6 md:px-12 lg:px-24 flex flex-col md:flex-row items-center gap-12">
        <motion.div 
          className="md:w-1/2"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-amber-600 font-bold tracking-wider uppercase text-sm mb-2">{t('forTeachers.eyebrow')}</p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">{t('forTeachers.heading')}</h2>
          <p className="text-slate-600 text-lg mb-8">{t('forTeachers.subtext')}</p>
          
          <ul className="space-y-4 mb-8">
            {bullets.map((bullet, idx) => (
              <li key={idx} className="flex items-start">
                <HiCheckCircle className="w-6 h-6 text-emerald-500 mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">{bullet}</span>
              </li>
            ))}
          </ul>
          
          <Link 
            to="/signup?role=teacher" 
            className="inline-flex items-center px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold rounded-lg shadow transition-colors"
          >
            {t('forTeachers.cta')}
            <HiArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </motion.div>

        <motion.div 
          className="md:w-1/2 w-full flex justify-center"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* CSS Mockup of Teacher Profile */}
          <div className="w-full max-w-sm bg-slate-50 rounded-2xl shadow-xl border border-slate-100 overflow-hidden relative">
            <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
            <div className="px-6 pb-6 relative">
              <div className="w-20 h-20 bg-white rounded-full p-1 absolute -top-10 left-6 shadow">
                <div className="w-full h-full bg-slate-200 rounded-full flex items-center justify-center text-slate-400 font-bold text-xl">JD</div>
              </div>
              <div className="mt-12">
                <h4 className="text-lg font-bold text-slate-900">John Doe</h4>
                <p className="text-sm text-slate-500 mb-4">Mathematics Expert • 10+ yrs exp</p>
                
                <div className="flex gap-2 mb-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">JEE</span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">Foundation</span>
                </div>
                
                <div className="flex items-center text-amber-500 text-sm">
                  ★ ★ ★ ★ ★ <span className="text-slate-500 ml-2">(48 reviews)</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modern Wave Section Divider Transition into ForStudents */}
      <SectionDivider 
        toColor="text-slate-50" 
        accentColor="rgba(245, 158, 11, 0.15)" 
        flip={true}
        className="absolute bottom-0 left-0 right-0 z-10" 
      />
    </section>
  );
};

export default ForTeachers;
