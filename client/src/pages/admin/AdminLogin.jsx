import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AdminAuthContext } from '../../context/AdminAuthContext';
import { toast } from 'react-hot-toast';
import { FaGraduationCap, FaShieldAlt, FaExclamationCircle } from 'react-icons/fa';
import { FiMail, FiLock, FiArrowRight, FiArrowLeft } from 'react-icons/fi';

const AdminLogin = () => {
  const { adminLogin, isAdminAuthenticated } = useContext(AdminAuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');

  useEffect(() => {
    if (isAdminAuthenticated) {
      navigate('/admin', { replace: true });
    }
  }, [isAdminAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (generalError) setGeneralError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!formData.email || !formData.email.trim()) {
      errors.email = 'Please enter your administrator email address.';
    }
    if (!formData.password) {
      errors.password = 'Please enter your administrator password.';
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error('Please enter both admin email and password');
      return;
    }

    setLoading(true);
    setFieldErrors({});
    setGeneralError('');
    try {
      const data = await adminLogin(formData.email.trim(), formData.password);
      if (data.user?.role !== 'admin') {
        const msg = 'Access Denied: This account does not have administrator privileges.';
        setGeneralError(msg);
        toast.error(msg);
        return;
      }
      toast.success('Admin authentication successful');
      navigate('/admin', { replace: true });
    } catch (err) {
      const backendMsg = err.response?.data?.message || 'Invalid administrator credentials';
      const backendErrors = err.response?.data?.errors;
      if (backendErrors && typeof backendErrors === 'object') {
        setFieldErrors(backendErrors);
      } else {
        const lower = backendMsg.toLowerCase();
        if (lower.includes('password') || lower.includes('attempt')) {
          setFieldErrors({ password: backendMsg });
        } else if (lower.includes('locked') || lower.includes('lockout')) {
          setFieldErrors({ email: backendMsg, password: backendMsg });
        } else {
          setFieldErrors({ email: backendMsg });
        }
      }
      setGeneralError(backendMsg);
      toast.error(backendMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col justify-center items-center p-4 sm:p-6">
      {/* Background Accent glow */}
      <div className="absolute top-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2"></div>

      <div className="w-full max-w-md relative z-10 animate-fadeInUp">
        <div className="text-center mb-8">
          <img
            src="/logo.png"
            alt="ToppScorers"
            className="w-24 h-24 sm:w-28 sm:h-28 mx-auto object-contain drop-shadow-xl mb-3 hover:scale-105 transition-transform"
          />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
            <span>ToppScorers</span>
            <span className="text-xs uppercase px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold">
              Admin
            </span>
          </h1>
          <p className="text-slate-400 text-xs mt-1.5 flex items-center justify-center gap-1.5">
            <FaShieldAlt className="text-emerald-400" />
            <span>Secure System Control Portal</span>
          </p>
        </div>

        {/* Card Box */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-7 sm:p-9 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white">Administrator Sign In</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Enter your authorized admin credentials to access moderation, user records, and platform settings.
            </p>
          </div>

          {generalError && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-start gap-2.5 animate-fadeIn">
              <FaExclamationCircle className="text-rose-400 shrink-0 mt-0.5" size={15} />
              <span className="flex-1 leading-relaxed">{generalError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <FiMail className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${fieldErrors.email ? 'text-rose-400' : 'text-slate-500'}`} size={15} />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="admin@toppscorers.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all focus:outline-none ${
                    fieldErrors.email
                      ? 'bg-rose-950/30 border-2 border-rose-500 text-rose-100 placeholder:text-rose-400 focus:ring-4 focus:ring-rose-500/20'
                      : 'bg-slate-950/60 border border-slate-700/80 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400'
                  }`}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-xs text-rose-400 font-semibold mt-1.5 flex items-center gap-1.5 animate-fadeIn">
                  <FaExclamationCircle className="shrink-0 text-rose-400" size={12} />
                  <span>{fieldErrors.email}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <FiLock className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${fieldErrors.password ? 'text-rose-400' : 'text-slate-500'}`} size={15} />
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all focus:outline-none ${
                    fieldErrors.password
                      ? 'bg-rose-950/30 border-2 border-rose-500 text-rose-100 placeholder:text-rose-400 focus:ring-4 focus:ring-rose-500/20'
                      : 'bg-slate-950/60 border border-slate-700/80 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400'
                  }`}
                />
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-rose-400 font-semibold mt-1.5 flex items-center gap-1.5 animate-fadeIn">
                  <FaExclamationCircle className="shrink-0 text-rose-400" size={12} />
                  <span>{fieldErrors.password}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Admin Portal'}</span>
              {!loading && <FiArrowRight size={15} />}
            </button>
          </form>
        </div>

        {/* Back to Live Website */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="inline-flex items-center text-xs text-slate-400 hover:text-white transition-colors"
          >
            <FiArrowLeft className="mr-1.5" size={13} />
            <span>Return to Live Website</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
