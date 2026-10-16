import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiArrowRight } from 'react-icons/hi';
import { FaCalculator, FaShieldAlt } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import EarningsCalculator from '../teacher/EarningsCalculator';
import SectionDivider from '../common/SectionDivider';

const EarningsCalculatorSection = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const { t, i18n } = useTranslation();
  const isHi = i18n.language?.startsWith('hi');

  // Only visible to logged-in teachers
  if (!isAuthenticated || user?.role !== 'teacher') {
    return null;
  }

  return (
    <section className="relative pt-20 pb-28 sm:pb-36 bg-slate-50 overflow-hidden">
      {/* Top Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50 to-slate-100 pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-5xl">
        {/* Section Header */}
        <motion.div
          className="text-center space-y-3 mb-10 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 text-amber-900 border border-amber-500/30 text-xs font-black uppercase tracking-wider">
            <FaCalculator className="text-amber-600 text-sm" />
            <span>{isHi ? 'पारदर्शी शिक्षक आय' : 'Transparent Educator Income'}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            {isHi ? 'अपनी मासिक और वार्षिक ट्यूशन कमाई का अनुमान लगाएं' : 'Estimate Your Potential Tuition Earnings'}
          </h2>

          <p className="text-sm sm:text-base text-slate-600 font-medium">
            {isHi 
              ? 'ToppScorers केवल पहले महीने पर 50% सेवा शुल्क लेता है — दूसरे महीने से 100% ट्यूशन फीस पूरी तरह आपकी होती है।'
              : 'ToppScorers charges a 50% service charge strictly on Month 1. From Month 2 onwards, 100% of your tuition fee is completely yours with zero ongoing commission.'}
          </p>
        </motion.div>

        {/* Embedded Calculator Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <EarningsCalculator />
        </motion.div>

        {/* Bottom CTA for educators */}
        <motion.div
          className="mt-10 text-center flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Link
            to="/students"
            className="inline-flex items-center space-x-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-slate-900/20 hover:scale-[1.02] transition-all"
          >
            <span>{isHi ? 'छात्रों के ट्यूशन अनुरोध देखें' : 'Browse Student Tuition Requests'}</span>
            <HiArrowRight className="text-amber-400 text-lg" />
          </Link>
          <Link
            to="/profile?tab=general"
            className="inline-flex items-center space-x-2 px-6 py-3.5 bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm rounded-xl border border-slate-200 shadow-xs transition-colors"
          >
            <span>{isHi ? 'अपनी दरें और प्रोफ़ाइल देखें' : 'Update Hourly Rates'}</span>
          </Link>
        </motion.div>
      </div>

      <SectionDivider toColor="white" />
    </section>
  );
};

export default EarningsCalculatorSection;
