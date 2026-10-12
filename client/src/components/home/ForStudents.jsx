import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiCheckCircle, HiArrowRight } from 'react-icons/hi';

const ForStudents = () => {
  const { t } = useTranslation();

  const bullets = [
    t('forStudents.bullet1'),
    t('forStudents.bullet2'),
    t('forStudents.bullet3'),
    t('forStudents.bullet4'),
  ];

  return (
    <section className="py-20 bg-slate-50">
      <div className="container mx-auto px-6 md:px-12 lg:px-24 flex flex-col-reverse md:flex-row items-center gap-12">
        <motion.div 
          className="md:w-1/2 w-full flex justify-center"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* CSS Mockup of Search Interface */}
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-100 p-6">
            <div className="w-full h-10 bg-slate-100 rounded-lg flex items-center px-4 mb-4 border border-slate-200">
              <span className="text-slate-400 mr-2 text-sm">🔍</span>
              <span className="text-slate-400 text-sm">Search physics teachers for NEET...</span>
            </div>
            <div className="flex gap-2 mb-6 overflow-x-hidden">
              <div className="w-20 h-6 bg-blue-100 rounded-full"></div>
              <div className="w-16 h-6 bg-slate-100 rounded-full"></div>
              <div className="w-24 h-6 bg-slate-100 rounded-full"></div>
            </div>
            
            <div className="space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="w-full p-4 border border-slate-100 rounded-xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-200 flex-shrink-0"></div>
                  <div className="flex-grow space-y-2">
                    <div className="w-1/2 h-3 bg-slate-300 rounded"></div>
                    <div className="w-3/4 h-2 bg-slate-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="md:w-1/2"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-blue-600 font-bold tracking-wider uppercase text-sm mb-2">{t('forStudents.eyebrow')}</p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">{t('forStudents.heading')}</h2>
          <p className="text-slate-600 text-lg mb-8">{t('forStudents.subtext')}</p>
          
          <ul className="space-y-4 mb-8">
            {bullets.map((bullet, idx) => (
              <li key={idx} className="flex items-start">
                <HiCheckCircle className="w-6 h-6 text-emerald-500 mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">{bullet}</span>
              </li>
            ))}
          </ul>
          
          <Link 
            to="/signup?role=student" 
            className="inline-flex items-center px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg shadow transition-colors"
          >
            {t('forStudents.cta')}
            <HiArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default ForStudents;
