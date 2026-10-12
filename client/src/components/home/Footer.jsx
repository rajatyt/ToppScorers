import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { FaLinkedin, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-slate-900 text-slate-300 py-12">
      <div className="container mx-auto px-6 md:px-12 lg:px-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Column 1 */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 mb-4">
              <img src="/logo.png" alt="ToppScorers" className="w-14 h-14 object-contain drop-shadow" />
              <h3 className="text-2xl font-bold text-white tracking-tight">ToppScorers</h3>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              {t('footer.description')}
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" aria-label="LinkedIn" className="text-slate-400 hover:text-white transition-colors">
                <FaLinkedin className="w-5 h-5" />
              </a>
              <a href="#" aria-label="Twitter" className="text-slate-400 hover:text-white transition-colors">
                <FaTwitter className="w-5 h-5" />
              </a>
              <a href="#" aria-label="Instagram" className="text-slate-400 hover:text-white transition-colors">
                <FaInstagram className="w-5 h-5" />
              </a>
              <a href="#" aria-label="YouTube" className="text-slate-400 hover:text-white transition-colors">
                <FaYoutube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Column 2 */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-amber-400 transition-colors">Home</Link></li>
              <li><Link to="/teachers" className="hover:text-amber-400 transition-colors">Find Teachers</Link></li>
              <li><Link to="/tuitions" className="hover:text-amber-400 transition-colors">Find Tuitions</Link></li>
              <li><Link to="/about" className="hover:text-amber-400 transition-colors">About Us</Link></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">{t('footer.forTeachers')}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/signup?role=teacher" className="hover:text-amber-400 transition-colors">Create Profile</Link></li>
              <li><Link to="/jobs" className="hover:text-amber-400 transition-colors">Browse Jobs</Link></li>
              <li><Link to="/how-it-works" className="hover:text-amber-400 transition-colors">How It Works</Link></li>
            </ul>
          </div>

          {/* Column 4 */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">{t('footer.support')}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/faq" className="hover:text-amber-400 transition-colors">FAQs</Link></li>
              <li><Link to="/privacy" className="hover:text-amber-400 transition-colors">{t('footer.privacy')}</Link></li>
              <li><Link to="/terms" className="hover:text-amber-400 transition-colors">{t('footer.terms')}</Link></li>
              <li><Link to="/contact" className="hover:text-amber-400 transition-colors">{t('footer.contact')}</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p>&copy; {new Date().getFullYear()} ToppScorers. All rights reserved.</p>
          <a href="https://wa.me/917019074944" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors">
            Join WhatsApp Community
          </a>
          <p>{t('footer.madeWith')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
