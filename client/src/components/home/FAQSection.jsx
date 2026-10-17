import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import SectionDivider from '../common/SectionDivider';

const FAQSection = () => {
  const { t, i18n } = useTranslation();
  const [faqs, setFaqs] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    fetch('/api/faqs')
      .then(res => {
        if (!res.ok) throw new Error('API Error');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) setFaqs(data);
      })
      .catch(err => {
        console.error("Failed to load FAQs", err);
      });
  }, []);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const getLocalizedText = (item, field) => {
    const lang = i18n.language === 'hi' ? 'hi' : 'en';
    if (item[field] && item[field][lang]) {
      return item[field][lang];
    }
    // Fallback if not structured object
    return item[field] || '';
  };

  if (!faqs || faqs.length === 0) return null;

  return (
    <section className="relative pt-24 pb-28 sm:pb-36 bg-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 max-w-4xl">
        <div className="text-center mb-14">
          <span className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 text-amber-900 border border-amber-500/30 text-xs font-black uppercase tracking-wider mb-3">
            <span>Frequently Asked Questions</span>
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            {t('faq.heading')}
          </h2>
          <p className="text-slate-500 text-sm sm:text-base mt-2">
            Everything you need to know about connecting, verification, and tutoring with zero commissions.
          </p>
        </div>
        
        <div className="space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div 
                key={faq._id || idx} 
                className={`rounded-2xl transition-all duration-300 border ${
                  isOpen 
                    ? 'bg-amber-50/40 border-amber-400/60 shadow-md' 
                    : 'bg-slate-50/80 hover:bg-slate-100/80 border-slate-200/80'
                }`}
              >
                <button
                  className="w-full p-5 sm:p-6 flex justify-between items-center text-left focus:outline-none cursor-pointer"
                  onClick={() => toggleFaq(idx)}
                  aria-expanded={isOpen}
                >
                  <span className={`font-display text-base sm:text-lg font-bold pr-4 transition-colors ${
                    isOpen ? 'text-amber-950 font-extrabold' : 'text-slate-900'
                  }`}>
                    {getLocalizedText(faq, 'question')}
                  </span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-300 ${
                    isOpen ? 'bg-amber-500 text-slate-950 rotate-180 shadow-xs' : 'bg-slate-200 text-slate-600'
                  }`}>
                    <span className="text-sm font-black">{isOpen ? '−' : '+'}</span>
                  </div>
                </button>
                
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-slate-700 text-xs sm:text-sm leading-relaxed border-t border-amber-200/40 pt-3">
                        {getLocalizedText(faq, 'answer')}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modern Wave Section Divider Transition into Footer */}
      <SectionDivider 
        toColor="text-slate-900" 
        accentColor="rgba(245, 158, 11, 0.2)" 
        flip={true}
        className="absolute bottom-0 left-0 right-0 z-10" 
      />
    </section>
  );
};

export default FAQSection;
