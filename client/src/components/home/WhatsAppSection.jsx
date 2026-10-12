import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FaWhatsapp } from 'react-icons/fa';
import SectionDivider from '../common/SectionDivider';

const WhatsAppSection = () => {
  const { t } = useTranslation();

  return (
    <section className="relative pt-24 pb-28 sm:pb-36 bg-gradient-to-r from-emerald-500 to-teal-600 overflow-hidden text-white text-center">
      {/* Top Wave Transition from ForStudents */}
      <div className="absolute top-0 left-0 right-0 w-full overflow-hidden leading-none pointer-events-none select-none z-10 transform rotate-180">
        <svg 
          className="relative block w-full h-10 sm:h-16 lg:h-20"
          viewBox="0 0 1440 96" 
          preserveAspectRatio="none"
        >
          <path 
            d="M0,32 C280,75 620,15 980,58 C1200,82 1350,70 1440,65 L1440,96 L0,96 Z" 
            fill="rgba(255, 255, 255, 0.2)"
          />
          <path 
            d="M0,48 C320,95 680,25 1040,70 C1240,92 1360,82 1440,78 L1440,96 L0,96 Z" 
            className="text-slate-50 fill-current"
          />
        </svg>
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 100 }}
          className="flex justify-center mb-6"
        >
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
            <FaWhatsapp className="w-12 h-12 text-white" />
          </div>
        </motion.div>
        
        <motion.h2 
          className="text-3xl md:text-4xl font-bold mb-4"
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          {t('whatsapp.heading')}
        </motion.h2>
        
        <motion.p 
          className="text-emerald-50 text-lg mb-8 max-w-xl mx-auto opacity-90"
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          {t('whatsapp.subtext')}
        </motion.p>
        
        <motion.a 
          href="https://wa.me/917019074944" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center px-8 py-4 bg-white text-emerald-600 hover:bg-emerald-50 font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <FaWhatsapp className="w-6 h-6 mr-2" />
          {t('whatsapp.join')}
        </motion.a>
      </div>

      {/* Modern Wave Section Divider Transition into FAQSection */}
      <SectionDivider 
        toColor="text-white" 
        accentColor="rgba(255, 255, 255, 0.25)" 
        className="absolute bottom-0 left-0 right-0 z-10" 
      />
    </section>
  );
};

export default WhatsAppSection;
