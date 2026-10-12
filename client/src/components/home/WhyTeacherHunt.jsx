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
    <section className="relative pt-20 pb-28 sm:pb-36 bg-slate-900 text-white overflow-hidden">
      <div className="container mx-auto px-6 md:px-12 lg:px-24">
        <div className="text-center mb-16">
          <p className="text-amber-500 font-bold tracking-wider uppercase text-sm mb-2">{t('why.eyebrow')}</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('why.heading')}</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">{t('why.subtext')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/15 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modern Wave Section Divider Transition into ForTeachers */}
      <SectionDivider 
        toColor="text-white" 
        accentColor="rgba(245, 158, 11, 0.2)" 
        className="absolute bottom-0 left-0 right-0 z-10" 
      />
    </section>
  );
};

export default WhyTeacherHunt;
