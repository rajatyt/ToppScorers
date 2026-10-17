/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef4fb',
          100: '#d4e3f5',
          200: '#a9c7eb',
          300: '#7eabe1',
          400: '#4d87d1',
          500: '#2d5a8e',
          600: '#1e3a5f',
          700: '#1a3254',
          800: '#152a48',
          900: '#0f1f35',
          DEFAULT: '#1e3a5f',
          light: '#2d5a8e',
        },
        accent: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          DEFAULT: '#f59e0b',
          dark: '#d97706',
        },
        success: '#059669',
        whatsapp: {
          DEFAULT: '#25D366',
          dark: '#128C7E',
        },
        background: '#f8fafc',
        textDark: '#0f172a',
        textGray: '#64748b',
        border: '#e2e8f0',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Outfit"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow-sm': '0 0 15px -3px rgba(245, 158, 11, 0.3)',
        'glow-md': '0 0 25px -4px rgba(245, 158, 11, 0.35)',
        'glow-emerald': '0 0 25px -4px rgba(16, 185, 129, 0.35)',
        'glow-blue': '0 0 25px -4px rgba(59, 130, 246, 0.35)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.08)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'card-hover': '0 20px 35px -10px rgba(15, 23, 42, 0.12), 0 0 1px 1px rgba(15, 23, 42, 0.05)',
      },
      animation: {
        blob: 'blob 7s infinite',
        'pulse-whatsapp': 'pulse-whatsapp 2s ease-in-out infinite',
        fadeInUp: 'fadeInUp 0.6s ease-out forwards',
        slideIn: 'slideIn 0.3s ease-out forwards',
        'shimmer': 'shimmer 2.5s infinite linear',
        'float-slow': 'floatSlow 4s ease-in-out infinite',
      },
      keyframes: {
        blob: {
          '0%': { borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%' },
          '50%': { borderRadius: '60% 40% 30% 70% / 50% 60% 40% 60%' },
          '100%': { borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%' },
        },
        'pulse-whatsapp': {
          '0%': { boxShadow: '0 0 0 0 rgba(37, 211, 102, 0.5)' },
          '70%': { boxShadow: '0 0 0 15px rgba(37, 211, 102, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(37, 211, 102, 0)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
}
