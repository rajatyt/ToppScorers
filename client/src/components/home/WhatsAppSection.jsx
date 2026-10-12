import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FaWhatsapp } from 'react-icons/fa';

const WhatsAppSection = () => {
  const { t } = useTranslation();

  return (
    <section className="relative py-24 bg-gradient-to-r from-emerald-500 to-teal-600 overflow-hidden text-white text-center">
      {/* Subtle wave SVG top */}
      <svg className="absolute top-0 w-full h-16 text-slate-50 drop-shadow-sm" preserveAspectRatio="none" viewBox="0 0 1440 54" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M0,0 C240,50 480,50 720,25 C960,0 1200,0 1440,25 L1440,0 L0,0 Z"></path>
      </svg>
      
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
    </section>
  );
};

export default WhatsAppSection;
