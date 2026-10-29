import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { FaLinkedin, FaTwitter, FaInstagram, FaYoutube, FaWhatsapp } from 'react-icons/fa';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-[#070b14] text-slate-400 pt-16 pb-12 border-t border-white/10 relative overflow-hidden">
      {/* Subtle Ambient Backlight */}
      <div className="absolute bottom-0 left-1/3 w-96 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Column 1: Brand & Social */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-3 group">
              <img src="/logo.png" alt="ToppScorers" className="w-12 h-12 object-contain drop-shadow group-hover:scale-105 transition-transform" />
              <div className="flex flex-col">
                <span className="font-display font-black text-2xl text-white tracking-tight">
                  Topp<span className="text-amber-500">Scorers</span>
                </span>
                <span className="text-[10px] text-amber-500/90 font-bold uppercase tracking-widest">
                  Verified Educators Hub
                </span>
              </div>
            </Link>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {t('footer.description', 'Connecting Prayagraj’s most dedicated tutors, coaching faculties, and home tuition specialists directly with motivated students and parents.')}
            </p>
            <div className="flex gap-2.5 pt-2">
              <a 
                href="#" 
                aria-label="LinkedIn" 
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 hover:border-amber-400/40 text-slate-400 hover:text-amber-400 flex items-center justify-center transition-all hover:scale-110"
              >
                <FaLinkedin className="w-4 h-4" />
              </a>
              <a 
                href="#" 
                aria-label="Twitter" 
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 hover:border-amber-400/40 text-slate-400 hover:text-amber-400 flex items-center justify-center transition-all hover:scale-110"
              >
                <FaTwitter className="w-4 h-4" />
              </a>
              <a 
                href="#" 
                aria-label="Instagram" 
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 hover:border-amber-400/40 text-slate-400 hover:text-amber-400 flex items-center justify-center transition-all hover:scale-110"
              >
                <FaInstagram className="w-4 h-4" />
              </a>
              <a 
                href="#" 
                aria-label="YouTube" 
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 hover:border-amber-400/40 text-slate-400 hover:text-amber-400 flex items-center justify-center transition-all hover:scale-110"
              >
                <FaYoutube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-display text-sm font-bold text-white uppercase tracking-wider mb-4">
              {t('footer.quickLinks', 'Quick Links')}
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-medium">
              <li>
                <Link to="/" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <span className="text-amber-500/60 text-xs">›</span> Home
                </Link>
              </li>
              <li>
                <Link to="/teachers" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <span className="text-amber-500/60 text-xs">›</span> Find Tutors
                </Link>
              </li>
              <li>
                <Link to="/students" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <span className="text-amber-500/60 text-xs">›</span> Tuition Student Requests
                </Link>
              </li>
              <li>
                <Link to="/auth" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <span className="text-amber-500/60 text-xs">›</span> Sign In / Join Free
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: For Tutors */}
          <div>
            <h4 className="font-display text-sm font-bold text-white uppercase tracking-wider mb-4">
              {t('footer.forTeachers', 'For Tutors')}
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-medium">
              <li>
                <Link to="/signup?role=teacher" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <span className="text-amber-500/60 text-xs">›</span> Create Tutor Profile
                </Link>
              </li>
              <li>
                <Link to="/students" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <span className="text-amber-500/60 text-xs">›</span> Browse Student Requests
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <span className="text-amber-500/60 text-xs">›</span> Tutor Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Trust & Support */}
          <div>
            <h4 className="font-display text-sm font-bold text-white uppercase tracking-wider mb-4">
              {t('footer.support', 'Trust & Support')}
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-medium">
              <li>
                <Link to="/privacy-policy" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <span className="text-amber-500/60 text-xs">›</span> {t('footer.privacy', 'Privacy Policy')}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <span className="text-amber-500/60 text-xs">›</span> {t('footer.terms', 'Terms & Conditions')}
                </Link>
              </li>
              <li>
                <a 
                  href="https://wa.me/917019074944" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <FaWhatsapp className="text-emerald-400 text-xs" /> WhatsApp Help Desk
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p>&copy; {new Date().getFullYear()} ToppScorers. All rights reserved.</p>
          <a 
            href="https://wa.me/917019074944" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
          >
            <FaWhatsapp size={13} />
            <span>Official Community Support</span>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
