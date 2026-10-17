import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FaWhatsapp } from 'react-icons/fa';
import SectionDivider from '../common/SectionDivider';

const WhatsAppSection = () => {
  const { t } = useTranslation();

  return (
    <section className="relative pt-24 pb-28 sm:pb-36 bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-950 overflow-hidden text-white text-center">
      {/* Top Wave Transition */}
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

      {/* Ambient Lighting Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/15 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10 max-w-4xl">
        <div className="bg-white/[0.06] backdrop-blur-2xl border border-white/15 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          {/* Subtle Top Border Glow */}
          <div className="absolute top-0 left-1/4 right-1/4 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 100 }}
            className="flex justify-center mb-6"
          >
            <div className="relative">
              <span className="absolute -inset-2 rounded-full bg-emerald-400/30 animate-ping opacity-75" />
              <div className="relative w-20 h-20 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-3xl flex items-center justify-center shadow-glow-emerald">
                <FaWhatsapp className="w-11 h-11 text-white" />
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="space-y-3 mb-6"
          >
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-black uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Direct WhatsApp Community</span>
            </div>

            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
              {t('whatsapp.heading')}
            </h2>
          </motion.div>
          
          <motion.p 
            className="text-emerald-100/90 text-sm sm:text-base mb-8 max-w-2xl mx-auto leading-relaxed font-medium"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            {t('whatsapp.subtext')}
          </motion.p>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a 
              href="https://wa.me/917019074944" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2.5 px-8 py-4 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-sm uppercase tracking-wider rounded-2xl shadow-glow-emerald transition-all duration-300 transform hover:-translate-y-1 active:scale-95 cursor-pointer"
            >
              <FaWhatsapp className="w-6 h-6" />
              <span>{t('whatsapp.join')}</span>
            </a>
          </motion.div>

          {/* Micro trust pills */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-emerald-200/80 font-medium">
            <span className="flex items-center space-x-1.5">
              <span>⚡</span>
              <span>Instant Tuition Notifications</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span>🔒</span>
              <span>100% Spam Free</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span>🤝</span>
              <span>Direct Teacher-Student Chat</span>
            </span>
          </div>
        </div>
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
