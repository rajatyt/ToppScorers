import React, { useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa';

const WhatsAppFAB = () => {
  return (
    <a
      href="https://wa.me/917019074944"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 group flex items-center bg-[#25D366] hover:bg-[#1ebd5b] text-white p-3.5 sm:p-4 rounded-full shadow-2xl shadow-emerald-500/30 transition-all duration-300 transform hover:scale-105 active:scale-95 animate-pulse-whatsapp"
      aria-label="Chat on WhatsApp"
    >
      <FaWhatsapp className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out font-black text-xs sm:text-sm pl-0 group-hover:pl-2.5">
        Chat with Support
      </span>
    </a>
  );
};

export default WhatsAppFAB;
