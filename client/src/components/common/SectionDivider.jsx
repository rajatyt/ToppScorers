import React from 'react';

/**
 * Reusable Section Divider Component
 * Creates an organic, modern dual-layer curved wave transition between sections.
 * 
 * @param {string} toColor - Tailwind color class for the destination section (e.g. 'text-slate-50', 'text-slate-900', 'text-white')
 * @param {string} accentColor - Color/opacity for the ambient accent crest (e.g. 'rgba(245, 158, 11, 0.2)')
 * @param {boolean} flip - Whether to invert the wave direction horizontally
 * @param {string} className - Additional container styling classes
 */
const SectionDivider = ({ 
  toColor = 'text-white', 
  accentColor = 'rgba(245, 158, 11, 0.18)',
  flip = false,
  className = ''
}) => {
  return (
    <div className={`w-full overflow-hidden leading-none pointer-events-none select-none ${className}`}>
      <svg 
        className={`relative block w-full h-10 sm:h-16 lg:h-20 ${flip ? 'transform -scale-x-100' : ''}`}
        viewBox="0 0 1440 96" 
        preserveAspectRatio="none"
      >
        {/* Layer 1: Ambient Glowing Accent Wave Crest */}
        <path 
          d="M0,32 C280,75 620,15 980,58 C1200,82 1350,70 1440,65 L1440,96 L0,96 Z" 
          fill={accentColor}
        />
        {/* Layer 2: Seamless Destination Background Fill */}
        <path 
          d="M0,48 C320,95 680,25 1040,70 C1240,92 1360,82 1440,78 L1440,96 L0,96 Z" 
          className={`${toColor} fill-current`}
        />
      </svg>
    </div>
  );
};

export default SectionDivider;
