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
    <section className="relative pt-20 pb-28 sm:pb-36 bg-white overflow-hidden">
      <div className="container mx-auto px-6 md:px-12 lg:px-24 max-w-4xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-12">
          {t('faq.heading')}
        </h2>
        
        <div className="divide-y divide-slate-200 border-y border-slate-200">
          {faqs.map((faq, idx) => (
            <div key={faq._id || idx} className="py-4">
              <button
                className="w-full flex justify-between items-center text-left focus:outline-none"
                onClick={() => toggleFaq(idx)}
                aria-expanded={openIndex === idx}
              >
                <span className="text-lg font-medium text-slate-900">
                  {getLocalizedText(faq, 'question')}
                </span>
                <span className="text-slate-400 ml-4 flex-shrink-0 text-2xl font-light">
                  {openIndex === idx ? '−' : '+'}
                </span>
              </button>
              
              <AnimatePresence>
                {openIndex === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 pb-2 text-slate-600 leading-relaxed">
                      {getLocalizedText(faq, 'answer')}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
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
