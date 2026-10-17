import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FiTarget, FiAward, FiVideo, FiShield, FiHome, FiPhone } from 'react-icons/fi';
import SectionDivider from '../common/SectionDivider';

const WhyTeacherHunt = () => {
  const { t } = useTranslation();

  const features = [
    { key: 'match', title: t('why.match'), desc: t('why.matchDesc'), icon: <FiTarget className="w-6 h-6" /> },
    { key: 'proof', title: t('why.proof'), desc: t('why.proofDesc'), icon: <FiAward className="w-6 h-6" /> },
    { key: 'demo', title: t('why.demo'), desc: t('why.demoDesc'), icon: <FiVideo className="w-6 h-6" /> },
    { key: 'creds', title: t('why.creds'), desc: t('why.credsDesc'), icon: <FiShield className="w-6 h-6" /> },
    { key: 'institutes', title: t('why.institutes'), desc: t('why.institutesDesc'), icon: <FiHome className="w-6 h-6" /> },
    { key: 'calls', title: t('why.calls'), desc: t('why.callsDesc'), icon: <FiPhone className="w-6 h-6" /> },
  ];

  return (
    <section className="relative pt-24 pb-28 sm:pb-36 bg-[#0a0f1d] text-white overflow-hidden">
      {/* Background Lighting Accents */}
      <div className="absolute top-10 left-1/4 w-[450px] h-[450px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[450px] h-[450px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-15"
        style={{
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 relative z-10">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-black uppercase tracking-wider mb-3 backdrop-blur-md">
            <span>{t('why.eyebrow')}</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black mb-4 tracking-tight leading-tight">
            {t('why.heading')}
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            {t('why.subtext')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.key}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className="bg-white/[0.04] hover:bg-white/[0.07] backdrop-blur-xl border border-white/10 hover:border-amber-400/40 rounded-3xl p-6 sm:p-7 transition-all duration-300 hover:-translate-y-1.5 shadow-glass-dark hover:shadow-glow-sm relative group overflow-hidden"
            >
              {/* Card Index Watermark */}
              <span className="absolute top-5 right-6 text-2xl font-black font-display text-white/[0.06] group-hover:text-amber-400/20 transition-colors select-none">
                0{idx + 1}
              </span>

              {/* Glowing Top Subtle Border Highlight */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-500/0 to-transparent group-hover:via-amber-400/60 transition-all duration-500" />

              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:shadow-glow-sm transition-all duration-300">
                {feature.icon}
              </div>
              <h3 className="font-display text-lg sm:text-xl font-bold mb-2.5 text-white group-hover:text-amber-300 transition-colors">
                {feature.title}
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modern Wave Section Divider Transition */}
      <SectionDivider 
        toColor="text-white" 
        accentColor="rgba(245, 158, 11, 0.2)" 
        className="absolute bottom-0 left-0 right-0 z-10" 
      />
    </section>
  );
};

export default WhyTeacherHunt;
