import React, { useState, useContext, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { GoogleLogin } from '@react-oauth/google';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import {
  FaGraduationCap, FaChalkboardTeacher, FaUserGraduate, FaBook,
  FaPencilAlt, FaFlask, FaAtom, FaCalculator, FaGlobe, FaLaptop,
  FaLightbulb, FaMicroscope, FaMapMarkerAlt,
} from 'react-icons/fa';
import {
  FiLogIn, FiUserCheck, FiBookOpen, FiArrowRight, FiArrowLeft,
  FiMail, FiLock, FiUser, FiPhone, FiCheckCircle,
} from 'react-icons/fi';
import { DISTRICTS, DISTRICT_AREAS } from '../utils/locationData';

/* ────────────────────────────  floating icons  ──────────────────────────── */
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
  { Icon: FaGraduationCap, size: 34, color: 'text-amber-300/40' },
  { Icon: FaChalkboardTeacher, size: 28, color: 'text-blue-300/40' },
  { Icon: FaBook, size: 30, color: 'text-violet-400/40' },
  { Icon: FaPencilAlt, size: 18, color: 'text-rose-300/45' },
];

const FloatingBackground = () => {
  const items = useMemo(() => {
    return FLOATING_ICONS.map((item, i) => {
      const left = `${5 + (i * 37) % 90}%`;
      const top = `${3 + (i * 53) % 85}%`;
      const duration = 14 + (i % 5) * 4;
      const delay = -(i * 1.7);
      const driftX = 30 + (i % 4) * 15;
      const driftY = 25 + (i % 3) * 20;
      const rotation = 30 + (i % 6) * 25;
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

const Input = ({ icon: Ic, label, ...props }) => (
  <div>
    <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">{label}</label>
    <div className="relative">
      <Ic className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
      <input
        {...props}
        className="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 focus:bg-white border border-slate-200/90 rounded-xl text-sm text-slate-900 font-medium
                   placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/15 focus:border-amber-500
                   transition-all duration-200 shadow-2xs"
      />
    </div>
  </div>
);

/* ──────────────────────────────  main Auth  ──────────────────────────────── */
const Auth = () => {
  const { t } = useTranslation();
  const { login, signup, googleAuth, user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // 'cards' | 'login' | 'student' | 'teacher'
  const [view, setView] = useState('cards');
  const [loading, setLoading] = useState(false);

  // Google role & location selection modal
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [googleUser, setGoogleUser] = useState(null);
  const [googleSelectedRole, setGoogleSelectedRole] = useState('student');
  const [googleDistrict, setGoogleDistrict] = useState('');
  const [googleArea, setGoogleArea] = useState('');

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
    district: '', area: '',
    dateOfBirth: '', parentGuardianConsent: false, consentGiven: false
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roleParam = params.get('role');
    const tabParam = params.get('tab');

    if (roleParam === 'teacher') {
      setView('teacher');
    } else if (roleParam === 'student') {
      setView('student');
    } else if (tabParam === 'login' || tabParam === 'signin') {
      setView('login');
    } else {
      // Default first screen is always 'cards' ("Welcome to ToppScorers" 3-card chooser)
      setView('cards');
    }
  }, [location]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) { toast.error(t('auth.enterEmailPassword')); return; }
    setLoading(true);
    try {
      const data = await login(formData.email, formData.password);
      toast.success(t('auth.loginSuccess'));
      navigate(data.user?.role === 'admin' ? '/admin' : '/');
    } catch (err) { toast.error(err.response?.data?.message || t('auth.loginFailed')); } finally { setLoading(false); }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) { toast.error(t('auth.passwordsMismatch')); return; }
    if (!formData.district) {
      toast.error('Please select your District (Prayagraj).');
      return;
    }
    if (!formData.area) {
      toast.error('Please select your Area / Locality.');
      return;
    }
    if (!formData.consentGiven) {
      toast.error('You must consent to data processing under DPDP Act 2023 to register.');
      return;
    }
    setLoading(true);
    try {
      await signup({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: view,
        city: formData.district,
        area: formData.area,
        dateOfBirth: formData.dateOfBirth || undefined,
        parentGuardianConsent: formData.parentGuardianConsent,
        consentGiven: true
      });
      toast.success(t('auth.signupSuccess'));
      navigate('/');
    } catch (err) { toast.error(err.response?.data?.message || t('auth.registrationFailed')); } finally { setLoading(false); }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) { toast.error(t('auth.googleAuthFailed')); return; }
    try {
      setLoading(true);
      const targetRole = view === 'login' || view === 'cards' ? undefined : view;
      const res = await googleAuth({ credential: credentialResponse.credential, role: targetRole });
      
      // If user is new OR needs district & area setup, trigger the location popup modal
      if (res?.isNewUser || res?.needsLocation) {
        setGoogleUser({
          credential: credentialResponse.credential,
          name: res.name,
          email: res.email,
          picture: res.picture,
          isNewUser: res.isNewUser
        });
        setGoogleSelectedRole(res.role || (view === 'teacher' ? 'teacher' : 'student'));
        setGoogleDistrict('');
        setGoogleArea('');
        setShowRoleModal(true);
        return;
      }

      toast.success(t('auth.googleSignInSuccess'));
      navigate(res.user?.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      toast.error(err.response?.data?.message || t('auth.googleSignInError'));
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmGoogleProfile = async (e) => {
    e?.preventDefault();
    if (!googleSelectedRole) {
      toast.error('Please choose whether you are a Student or Teacher.');
      return;
    }
    if (!googleDistrict) {
      toast.error('Please select your District (Prayagraj).');
      return;
    }
    if (!googleArea) {
      toast.error('Please select your Area / Locality.');
      return;
    }

    try {
      setLoading(true);
      const res = await googleAuth({
        credential: googleUser.credential,
        role: googleSelectedRole,
        city: googleDistrict,
        area: googleArea
      });

      setShowRoleModal(false);
      toast.success(`Welcome to ToppScorers, ${googleUser.name || 'User'}!`);
      navigate(res.user?.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      toast.error(err.response?.data?.message || t('auth.failedRegistration'));
    } finally {
      setLoading(false);
    }
  };

  /* ───────── Card-chooser view (initial landing) ───────── */
  const renderCardChooser = () => (
    <div className="w-full max-w-3xl mx-auto animate-fadeInUp">
      {/* Title */}
      <div className="text-center mb-10">
        <img
          src="/logo.png"
          alt="ToppScorers"
          className="w-24 h-24 sm:w-28 sm:h-28 mx-auto object-contain drop-shadow-xl mb-4 hover:scale-105 transition-transform"
        />
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {t('auth.welcomeTo')} <span className="bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">ToppScorers</span>
        </h1>
        <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">
          {t('auth.platformSubtitle')}
        </p>
      </div>

      {/* Three Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
        {/* Sign In Card */}
        <button
          onClick={() => setView('login')}
          className="group relative bg-white/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-slate-200/80
                     hover:border-amber-400 hover:shadow-card-hover hover:shadow-amber-500/10 transition-all duration-300
                     hover:-translate-y-1.5 text-left cursor-pointer"
        >
          <div className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 group-hover:bg-amber-100 flex items-center justify-center transition-colors">
            <FiArrowRight className="text-slate-400 group-hover:text-amber-600 transition-colors" size={14} />
          </div>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-amber-400
                          flex items-center justify-center shadow-lg mb-5 group-hover:scale-105 transition-transform">
            <FiLogIn size={24} />
          </div>
          <h3 className="font-display text-lg sm:text-xl font-bold text-slate-900 mb-1.5">{t('auth.signIn')}</h3>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            {t('auth.signInDesc')}
          </p>
          <div className="mt-4 flex items-center text-xs font-black text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity">
            {t('auth.continue')} <FiArrowRight className="ml-1" size={12} />
          </div>
        </button>

        {/* Student Card */}
        <button
          onClick={() => setView('student')}
          className="group relative bg-white/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-slate-200/80
                     hover:border-emerald-400 hover:shadow-card-hover hover:shadow-emerald-500/10 transition-all duration-300
                     hover:-translate-y-1.5 text-left cursor-pointer"
        >
          <div className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 group-hover:bg-emerald-100 flex items-center justify-center transition-colors">
            <FiArrowRight className="text-slate-400 group-hover:text-emerald-600 transition-colors" size={14} />
          </div>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white
                          flex items-center justify-center shadow-lg mb-5 group-hover:scale-105 transition-transform shadow-emerald-500/20">
            <FaUserGraduate size={24} />
          </div>
          <h3 className="font-display text-lg sm:text-xl font-bold text-slate-900 mb-1.5">{t('auth.imStudent')}</h3>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            {t('auth.studentDesc')}
          </p>
          <div className="mt-4 flex items-center text-xs font-black text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">
            {t('auth.createAccount')} <FiArrowRight className="ml-1" size={12} />
          </div>
        </button>

        {/* Teacher Card */}
        <button
          onClick={() => setView('teacher')}
          className="group relative bg-white/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-slate-200/80
                     hover:border-amber-400 hover:shadow-card-hover hover:shadow-amber-500/10 transition-all duration-300
                     hover:-translate-y-1.5 text-left cursor-pointer"
        >
          <div className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 group-hover:bg-amber-100 flex items-center justify-center transition-colors">
            <FiArrowRight className="text-slate-400 group-hover:text-amber-600 transition-colors" size={14} />
          </div>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950
                          flex items-center justify-center shadow-lg mb-5 group-hover:scale-105 transition-transform shadow-amber-500/20">
            <FaChalkboardTeacher size={24} />
          </div>
          <h3 className="font-display text-lg sm:text-xl font-bold text-slate-900 mb-1.5">{t('auth.imTeacher')}</h3>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            {t('auth.teacherDesc')}
          </p>
          <div className="mt-4 flex items-center text-xs font-black text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity">
            {t('auth.createAccount')} <FiArrowRight className="ml-1" size={12} />
          </div>
        </button>
      </div>

      {/* Google Quick Sign-In below cards */}
      <div className="mt-8 text-center">
        <div className="relative mb-5">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200/60"></div></div>
          <div className="relative flex justify-center text-[11px]">
            <span className="bg-slate-50 px-4 text-slate-400 font-medium">{t('auth.orContinueWith')}</span>
          </div>
        </div>
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => toast.error(t('auth.googleSignInFailed'))}
            useOneTap
            shape="pill"
            text="continue_with"
            theme="outline"
            size="large"
          />
        </div>
      </div>
    </div>
  );

  /* ───────── Form view (Sign In / Student Signup / Teacher Signup) ───────── */
  const renderForm = () => {
    const isLogin = view === 'login';
    const accentMap = {
      login:   { gradient: 'from-slate-800 to-slate-900', border: 'border-amber-400', ring: 'ring-amber-400/20', btn: 'from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500', icon: <FiLogIn size={22} />, title: t('auth.welcomeBack'), sub: t('auth.signInToAccount') },
      student: { gradient: 'from-emerald-500 to-emerald-600', border: 'border-emerald-400', ring: 'ring-emerald-400/20', btn: 'from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500', icon: <FaUserGraduate size={22} />, title: t('auth.studentRegistration'), sub: t('auth.studentRegSub') },
      teacher: { gradient: 'from-blue-500 to-blue-600', border: 'border-blue-400', ring: 'ring-blue-400/20', btn: 'from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500', icon: <FaChalkboardTeacher size={22} />, title: t('auth.teacherRegistration'), sub: t('auth.teacherRegSub') },
    };
    const accent = accentMap[view];

    return (
      <div className="w-full max-w-md mx-auto animate-fadeInUp">
        <div className={`bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border-2 ${accent.border}/40 p-7 sm:p-8`}>
          {/* Back button */}
          <button
            type="button"
            onClick={() => setView('cards')}
            className="flex items-center text-xs text-slate-400 hover:text-slate-700 font-medium mb-5 transition-colors group"
          >
            <FiArrowLeft className="mr-1.5 group-hover:-translate-x-0.5 transition-transform" size={14} />
            {t('auth.backToOptions')}
          </button>

          {/* Header */}
          <div className="flex items-center space-x-4 mb-6">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${accent.gradient} text-white flex items-center justify-center shadow-lg flex-shrink-0`}>
              {accent.icon}
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{accent.title}</h2>
              <p className="text-[11px] text-slate-500">{accent.sub}</p>
            </div>
          </div>

          {/* Google */}
          <div className="flex justify-center mb-5">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error(t('auth.googleSignInFailed'))}
              shape="pill"
              text="continue_with"
              theme="outline"
              size="large"
            />
          </div>

          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
            <div className="relative flex justify-center text-[11px]">
              <span className="bg-white/80 px-3 text-slate-400 font-medium">{t('auth.orUseEmail')}</span>
            </div>
          </div>

          {/* Form */}
          {isLogin ? (
            <form className="space-y-4" onSubmit={handleLogin}>
              <Input icon={FiMail} label={t('auth.email')} name="email" type="email" required placeholder={t('auth.emailPlaceholder')} value={formData.email} onChange={handleChange} />
              <Input icon={FiLock} label={t('auth.password')} name="password" type="password" required placeholder={t('auth.passwordPlaceholder')} value={formData.password} onChange={handleChange} />
              <button type="submit" disabled={loading}
                className={`w-full py-3 bg-gradient-to-r ${accent.btn} text-white font-bold text-sm rounded-xl shadow-lg transition-all hover:scale-[1.01] mt-1`}
              >
                {loading ? t('auth.signingIn') : t('auth.signIn')}
              </button>
            </form>
          ) : (
            <form className="space-y-3.5" onSubmit={handleSignup}>
              <Input icon={FiUser} label={t('auth.name')} name="name" type="text" required placeholder={t('auth.namePlaceholder')} value={formData.name} onChange={handleChange} />
              <Input icon={FiMail} label={t('auth.email')} name="email" type="email" required placeholder={t('auth.emailPlaceholder')} value={formData.email} onChange={handleChange} />
              <Input icon={FiPhone} label={t('auth.phone')} name="phone" type="tel" required placeholder={t('auth.phonePlaceholder')} value={formData.phone} onChange={handleChange} />
              
              {/* Location: District and Cascading Area */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-amber-50/60 rounded-xl border border-amber-200/70">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center">
                    <FaMapMarkerAlt className="text-amber-500 mr-1" size={12} />
                    District *
                  </label>
                  <select
                    name="district"
                    value={formData.district}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        district: e.target.value,
                        area: ''
                      });
                    }}
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-medium"
                  >
                    <option value="">Select District</option>
                    {DISTRICTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center">
                    <FaMapMarkerAlt className="text-amber-500 mr-1" size={12} />
                    Area / Locality *
                  </label>
                  <select
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    disabled={!formData.district}
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-medium disabled:opacity-50 disabled:bg-slate-100 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {formData.district ? `Select Area in ${formData.district}` : 'Select District first'}
                    </option>
                    {formData.district && DISTRICT_AREAS[formData.district]?.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
              </div>

              <Input icon={FiLock} label={t('auth.password')} name="password" type="password" required placeholder={t('auth.passwordPlaceholder')} value={formData.password} onChange={handleChange} />
              <Input icon={FiLock} label={t('auth.confirmPassword')} name="confirmPassword" type="password" required placeholder={t('auth.passwordPlaceholder')} value={formData.confirmPassword} onChange={handleChange} />
              
              {/* Optional Date of Birth */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Date of Birth (Optional)
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 bg-white/70 backdrop-blur-xs border border-slate-200/80 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>

              {/* Student Under 18 Parent Consent */}
              {view === 'student' && (
                <div className="flex items-start space-x-2 pt-1 text-[11px] text-slate-600">
                  <input
                    type="checkbox"
                    id="parentGuardianConsent"
                    name="parentGuardianConsent"
                    checked={formData.parentGuardianConsent}
                    onChange={handleChange}
                    className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <label htmlFor="parentGuardianConsent">
                    If student is under 18, parent or guardian consent is provided for tuition connections.
                  </label>
                </div>
              )}

              {/* DPDP Act 2023 Consent Checkbox */}
              <div className="flex items-start space-x-2 pt-1 text-[11px] text-slate-600">
                <input
                  type="checkbox"
                  id="consentGiven"
                  name="consentGiven"
                  required
                  checked={formData.consentGiven}
                  onChange={handleChange}
                  className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="consentGiven">
                  I consent to the collection and processing of my profile details under India's{' '}
                  <strong>DPDP Act, 2023</strong> and agree to the{' '}
                  <Link to="/privacy-policy" target="_blank" className="text-amber-600 underline">
                    Privacy Policy
                  </Link>{' '}
                  and{' '}
                  <Link to="/terms" target="_blank" className="text-amber-600 underline">
                    Terms
                  </Link>.
                </label>
              </div>

              <button type="submit" disabled={loading}
                className={`w-full py-3 bg-gradient-to-r ${accent.btn} text-white font-bold text-sm rounded-xl shadow-lg transition-all hover:scale-[1.01] mt-2`}
              >
                {loading ? t('auth.creatingAccount') : (view === 'teacher' ? t('auth.registerTeacher') : t('auth.registerStudent'))}
              </button>
            </form>
          )}

          {/* Toggle hint */}
          <p className="mt-5 text-center text-xs text-slate-400">
            {isLogin ? (
              <>{t('auth.noAccount')}{' '}
                <button type="button" onClick={() => setView('cards')} className="text-amber-600 font-semibold hover:underline">{t('auth.joinNow')}</button>
              </>
            ) : (
              <>{t('auth.alreadyRegistered')}{' '}
                <button type="button" onClick={() => setView('login')} className="text-amber-600 font-semibold hover:underline">{t('auth.signIn')}</button>
              </>
            )}
          </p>
        </div>
      </div>
    );
  };

  /* ────────────────────────────  RENDER  ──────────────────────────── */
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-amber-50/30 px-4 sm:px-6 lg:px-8 py-10 overflow-hidden">
      {/* Animated background */}
      <FloatingBackground />

      {/* Soft gradient blobs */}
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-amber-200/20 blur-3xl animate-blob pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-blue-200/20 blur-3xl animate-blob pointer-events-none" style={{ animationDelay: '3s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-emerald-100/10 blur-3xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 w-full">
        {view === 'cards' ? renderCardChooser() : renderForm()}
      </div>

      {/* ─── Google Role & Location Popup Modal ─── */}
      {showRoleModal && googleUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 sm:p-8 border border-slate-100 animate-fadeInUp my-6">
            <div className="text-center mb-6">
              {googleUser.picture ? (
                <img
                  src={googleUser.picture}
                  alt={googleUser.name}
                  className="w-16 h-16 rounded-full mx-auto mb-3 border-2 border-amber-400 shadow-md object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-slate-900 text-white text-xl font-bold flex items-center justify-center mx-auto mb-3 shadow-md">
                  {googleUser.name?.charAt(0) || 'G'}
                </div>
              )}
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Welcome, {googleUser.name}!
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Please select your role and location in <strong>Prayagraj</strong> to complete your account setup.
              </p>
            </div>

            <form onSubmit={handleConfirmGoogleProfile} className="space-y-4">
              {/* Role Selection */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Select Your Role *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setGoogleSelectedRole('student')}
                    className={`p-3 rounded-2xl border-2 text-left transition-all flex items-center space-x-3 cursor-pointer ${
                      googleSelectedRole === 'student'
                        ? 'border-emerald-500 bg-emerald-50/70 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className={`p-2 rounded-xl flex-shrink-0 ${
                      googleSelectedRole === 'student' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <FaUserGraduate size={16} />
                    </div>
                    <div>
                      <div className="font-extrabold text-slate-900 text-xs">Student / Parent</div>
                      <div className="text-[10px] text-slate-500">Find Tutors</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGoogleSelectedRole('teacher')}
                    className={`p-3 rounded-2xl border-2 text-left transition-all flex items-center space-x-3 cursor-pointer ${
                      googleSelectedRole === 'teacher'
                        ? 'border-amber-500 bg-amber-50/70 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className={`p-2 rounded-xl flex-shrink-0 ${
                      googleSelectedRole === 'teacher' ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <FaChalkboardTeacher size={16} />
                    </div>
                    <div>
                      <div className="font-extrabold text-slate-900 text-xs">Teacher / Tutor</div>
                      <div className="text-[10px] text-slate-500">Teach Students</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Location: District & Area */}
              <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80 space-y-3">
                <div className="flex items-center space-x-2 pb-2 border-b border-amber-200/60">
                  <FaMapMarkerAlt className="text-amber-600 text-xs" />
                  <span className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                    Location Setup (Prayagraj)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center">
                      <FaMapMarkerAlt className="text-amber-500 mr-1 text-[10px]" />
                      District *
                    </label>
                    <select
                      value={googleDistrict}
                      onChange={(e) => {
                        setGoogleDistrict(e.target.value);
                        setGoogleArea('');
                      }}
                      required
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-medium"
                    >
                      <option value="">Select District</option>
                      {DISTRICTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center">
                      <FaMapMarkerAlt className="text-amber-500 mr-1 text-[10px]" />
                      Area / Locality *
                    </label>
                    <select
                      value={googleArea}
                      onChange={(e) => setGoogleArea(e.target.value)}
                      disabled={!googleDistrict}
                      required
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-medium disabled:opacity-50 disabled:bg-slate-100 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {googleDistrict ? `Select Area in ${googleDistrict}` : 'Select District first'}
                      </option>
                      {googleDistrict && DISTRICT_AREAS[googleDistrict]?.map((a) => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm rounded-xl shadow-md transition-all hover:scale-[1.01] flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer pt-3"
              >
                <span>{loading ? 'Finalizing Setup...' : 'Confirm & Complete Registration'}</span>
                <FiArrowRight />
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setShowRoleModal(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 font-medium cursor-pointer"
                >
                  {t('auth.cancel', 'Cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Auth;
