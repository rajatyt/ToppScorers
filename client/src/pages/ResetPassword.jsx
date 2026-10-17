import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import {
  FaGraduationCap, FaChalkboardTeacher, FaUserGraduate, FaBook,
  FaPencilAlt, FaFlask, FaAtom, FaCalculator, FaGlobe, FaLaptop,
  FaLightbulb, FaMicroscope
} from 'react-icons/fa';
import {
  FiLock, FiEye, FiEyeOff, FiCheckCircle, FiAlertTriangle,
  FiArrowLeft, FiShield, FiCheck, FiX
} from 'react-icons/fi';

/* ────────────────────────────  Floating Background Icons  ──────────────────────────── */
const FLOATING_ICONS = [
  { Icon: FaGraduationCap, size: 28, color: 'text-amber-400/50' },
  { Icon: FaChalkboardTeacher, size: 32, color: 'text-blue-400/45' },
  { Icon: FaUserGraduate, size: 26, color: 'text-emerald-400/50' },
  { Icon: FaBook, size: 24, color: 'text-purple-400/45' },
  { Icon: FaPencilAlt, size: 20, color: 'text-rose-400/50' },
  { Icon: FaFlask, size: 24, color: 'text-cyan-400/45' },
  { Icon: FaAtom, size: 30, color: 'text-indigo-400/50' },
  { Icon: FaCalculator, size: 22, color: 'text-orange-400/50' },
  { Icon: FaGlobe, size: 28, color: 'text-teal-400/45' },
  { Icon: FaLaptop, size: 26, color: 'text-pink-400/50' },
  { Icon: FaLightbulb, size: 22, color: 'text-yellow-400/50' },
  { Icon: FaMicroscope, size: 26, color: 'text-sky-400/50' },
];

const FloatingBackground = () => {
  const items = useMemo(() => {
    return FLOATING_ICONS.map((item, i) => {
      const left = `${6 + (i * 35) % 88}%`;
      const top = `${4 + (i * 51) % 84}%`;
      const duration = 14 + (i % 4) * 4;
      const delay = -(i * 1.5);
      const driftX = 25 + (i % 4) * 15;
      const driftY = 20 + (i % 3) * 18;
      const rotation = 25 + (i % 5) * 20;
      return { ...item, left, top, duration, delay, driftX, driftY, rotation, id: i };
    });
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {items.map((item) => (
        <span
          key={item.id}
          className={`absolute ${item.color}`}
          style={{
            left: item.left,
            top: item.top,
            animation: `floatDrift ${item.duration}s ease-in-out ${item.delay}s infinite`,
            ['--drift-x']: `${item.driftX}px`,
            ['--drift-y']: `${item.driftY}px`,
            ['--rotation']: `${item.rotation}deg`,
          }}
        >
          <item.Icon size={item.size} />
        </span>
      ))}
    </div>
  );
};

export default function ResetPassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { token: pathToken } = useParams();

  const [token, setToken] = useState('');
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenParam = pathToken || params.get('token');

    if (!tokenParam) {
      setVerifying(false);
      setTokenValid(false);
      setTokenError('No password reset token was provided in the link.');
      return;
    }

    setToken(tokenParam);

    // Verify token validity with backend
    api.post('/auth/verify-reset-token', { token: tokenParam })
      .then((res) => {
        if (res.data?.valid) {
          setTokenValid(true);
          setMaskedEmail(res.data.maskedEmail || '');
        } else {
          setTokenValid(false);
          setTokenError(res.data?.message || t('auth.invalidOrExpiredTokenDesc'));
        }
      })
      .catch((err) => {
        setTokenValid(false);
        setTokenError(err.response?.data?.message || t('auth.invalidOrExpiredTokenDesc'));
      })
      .finally(() => {
        setVerifying(false);
      });
  }, [location, t]);

  // Password strength evaluation
  const passwordCriteria = useMemo(() => {
    return {
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      numberOrSpecial: /[0-9!@#$%^&*(),.?":{}|<>]/.test(password),
    };
  }, [password]);

  const strengthScore = useMemo(() => {
    let score = 0;
    if (passwordCriteria.length) score++;
    if (passwordCriteria.upper && passwordCriteria.lower) score++;
    if (passwordCriteria.numberOrSpecial) score++;
    if (password.length >= 12) score++;
    return score; // 0 to 4
  }, [passwordCriteria, password]);

  const strengthLabel = useMemo(() => {
    if (!password) return '';
    if (strengthScore <= 1) return { text: 'Weak', color: 'text-rose-500', bar: 'bg-rose-500 w-1/4' };
    if (strengthScore === 2) return { text: 'Fair', color: 'text-amber-500', bar: 'bg-amber-500 w-2/4' };
    if (strengthScore === 3) return { text: 'Strong', color: 'text-blue-500', bar: 'bg-blue-500 w-3/4' };
    return { text: 'Excellent', color: 'text-emerald-500', bar: 'bg-emerald-500 w-full' };
  }, [strengthScore, password]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || password.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error(t('auth.passwordsMismatch') || 'Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/auth/reset-password', {
        token,
        newPassword: password,
      });

      setResetSuccess(true);
      toast.success(res.data?.message || t('auth.passwordResetSuccess'));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-900 overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 opacity-95" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Floating icons backdrop */}
      <FloatingBackground />

      <div className="relative z-10 w-full max-w-md mx-auto animate-fadeInUp">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-block hover:scale-105 transition-transform">
            <img
              src="/logo.png"
              alt="ToppScorers"
              className="w-20 h-20 sm:w-24 sm:h-24 mx-auto object-contain drop-shadow-xl mb-3"
            />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Topp<span className="bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent">Scorers</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Secure Account Recovery & Credential Management
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/80 p-7 sm:p-8">
          {verifying ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-12 h-12 border-3 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-700">Verifying secure reset token...</p>
              <p className="text-xs text-slate-400">Ensuring the request is authenticated and active.</p>
            </div>
          ) : !tokenValid ? (
            /* Invalid or Expired Token Card */
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4 border border-rose-200 shadow-sm">
                <FiAlertTriangle size={32} />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 mb-2">
                {t('auth.invalidOrExpiredToken')}
              </h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6 leading-relaxed">
                {tokenError || t('auth.invalidOrExpiredTokenDesc')}
              </p>
              <Link
                to="/login?tab=forgot"
                className="inline-flex items-center justify-center w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all hover:scale-[1.01]"
              >
                {t('auth.requestNewLink')}
              </Link>
              <div className="mt-4">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors inline-flex items-center"
                >
                  <FiArrowLeft className="mr-1.5" size={13} />
                  {t('auth.backToSignIn')}
                </Link>
              </div>
            </div>
          ) : resetSuccess ? (
            /* Reset Success Card */
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-200 shadow-sm animate-bounce">
                <FiCheckCircle size={34} />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 mb-2">
                {t('auth.passwordResetSuccess')}
              </h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6 leading-relaxed">
                {t('auth.passwordResetSuccessDesc')}
              </p>
              <Link
                to="/login"
                className="inline-flex items-center justify-center w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all hover:scale-[1.01]"
              >
                {t('auth.signIn')}
              </Link>
            </div>
          ) : (
            /* Password Reset Form */
            <div>
              {/* Header */}
              <div className="flex items-center space-x-3.5 mb-6 pb-4 border-b border-slate-100">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center shadow-md flex-shrink-0">
                  <FiShield size={24} />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                    {t('auth.resetPassword')}
                  </h2>
                  {maskedEmail ? (
                    <p className="text-xs text-slate-500">
                      Resetting for <span className="font-semibold text-slate-700">{maskedEmail}</span>
                    </p>
                  ) : (
                    <p className="text-xs text-slate-500">
                      Choose a strong, secure new password
                    </p>
                  )}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* New Password */}
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">
                    {t('auth.newPassword')} *
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t('auth.newPasswordPlaceholder')}
                      required
                      minLength={8}
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50/70 focus:bg-white border border-slate-200/90 rounded-xl text-sm text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/15 focus:border-amber-500 transition-all shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>

                  {/* Password Strength Meter */}
                  {password && (
                    <div className="mt-2 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-medium">{t('auth.passwordStrength')}:</span>
                        <span className={`font-bold ${strengthLabel?.color}`}>{strengthLabel?.text}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-300 ${strengthLabel?.bar}`} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">
                    {t('auth.confirmNewPassword')} *
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={t('auth.confirmNewPasswordPlaceholder')}
                      required
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50/70 focus:bg-white border border-slate-200/90 rounded-xl text-sm text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/15 focus:border-amber-500 transition-all shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                      aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    >
                      {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-[11px] text-rose-500 font-semibold mt-1">
                      {t('auth.passwordsMismatch')}
                    </p>
                  )}
                  {confirmPassword && password === confirmPassword && (
                    <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center">
                      <FiCheck className="mr-1" size={12} /> Passwords match
                    </p>
                  )}
                </div>

                {/* Requirements Checklist */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-[11px] text-slate-600 space-y-1">
                  <div className={`flex items-center ${passwordCriteria.length ? 'text-emerald-600 font-semibold' : 'text-slate-500'}`}>
                    {passwordCriteria.length ? <FiCheck className="mr-1.5" size={12} /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-2 ml-0.5" />}
                    {t('auth.passwordRequirement1')}
                  </div>
                  <div className={`flex items-center ${passwordCriteria.upper ? 'text-emerald-600 font-semibold' : 'text-slate-500'}`}>
                    {passwordCriteria.upper ? <FiCheck className="mr-1.5" size={12} /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-2 ml-0.5" />}
                    {t('auth.passwordRequirement2')}
                  </div>
                  <div className={`flex items-center ${passwordCriteria.numberOrSpecial ? 'text-emerald-600 font-semibold' : 'text-slate-500'}`}>
                    {passwordCriteria.numberOrSpecial ? <FiCheck className="mr-1.5" size={12} /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-2 ml-0.5" />}
                    {t('auth.passwordRequirement3')}
                  </div>
                </div>

                {/* Submit CTA */}
                <button
                  type="submit"
                  disabled={submitting || !passwordCriteria.length || password !== confirmPassword}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all hover:scale-[1.01] mt-2 cursor-pointer flex items-center justify-center space-x-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin mr-2" />
                      <span>{t('auth.resettingPassword')}</span>
                    </>
                  ) : (
                    <span>{t('auth.resetPassword')}</span>
                  )}
                </button>

                <div className="text-center pt-2">
                  <Link
                    to="/login"
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors inline-flex items-center"
                  >
                    <FiArrowLeft className="mr-1.5" size={13} />
                    {t('auth.backToSignIn')}
                  </Link>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
