import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

import { DISTRICTS, DISTRICT_AREAS } from '../utils/locationData';

const Signup = () => {
  const { t } = useTranslation();
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    district: '',
    area: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roleParam = params.get('role');
    if (roleParam === 'teacher' || roleParam === 'student') {
      setRole(roleParam);
    }
  }, [location]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (!formData.district) {
      toast.error('Please select your District (Fatehpur)');
      return;
    }
    if (!formData.area) {
      toast.error('Please select your Area / Locality');
      return;
    }
    setLoading(true);
    try {
      await signup({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        city: formData.district,
        area: formData.area,
        password: formData.password,
        role
      });
      toast.success(t('auth.signupSuccess'));
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-border animate-fadeInUp">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-textDark">{t('auth.signup')}</h2>
        </div>
        
        <div className="flex border-b border-border mb-6">
          <button
            className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors ${role === 'student' ? 'border-primary text-primary' : 'border-transparent text-textGray hover:text-textDark'}`}
            onClick={() => setRole('student')}
          >
            {t('auth.registerStudent')}
          </button>
          <button
            className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors ${role === 'teacher' ? 'border-primary text-primary' : 'border-transparent text-textGray hover:text-textDark'}`}
            onClick={() => setRole('teacher')}
          >
            {t('auth.registerTeacher')}
          </button>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-textDark">{t('auth.name')}</label>
            <input name="name" type="text" required className="mt-1 block w-full px-4 py-2 border border-border rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm bg-background text-textDark" value={formData.name} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-textDark">{t('auth.email')}</label>
            <input name="email" type="email" required className="mt-1 block w-full px-4 py-2 border border-border rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm bg-background text-textDark" value={formData.email} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-textDark">{t('auth.phone')}</label>
            <input name="phone" type="text" required className="mt-1 block w-full px-4 py-2 border border-border rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm bg-background text-textDark" value={formData.phone} onChange={handleChange} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-textDark">District *</label>
              <select
                name="district"
                required
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value, area: '' })}
                className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm bg-background text-textDark font-medium"
              >
                <option value="">Select District</option>
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-textDark">Area / Locality *</label>
              <select
                name="area"
                required
                disabled={!formData.district}
                value={formData.area}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm bg-background text-textDark font-medium disabled:opacity-50 disabled:bg-slate-100"
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

          <div>
            <label className="block text-sm font-medium text-textDark">{t('auth.password')}</label>
            <input name="password" type="password" required className="mt-1 block w-full px-4 py-2 border border-border rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm bg-background text-textDark" value={formData.password} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-textDark">{t('auth.confirmPassword')}</label>
            <input name="confirmPassword" type="password" required className="mt-1 block w-full px-4 py-2 border border-border rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm bg-background text-textDark" value={formData.confirmPassword} onChange={handleChange} />
          </div>
          
          <button type="submit" disabled={loading} className="w-full btn-primary py-3 mt-4">
            {loading ? t('common.loading') : t('auth.signup')}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm">
          <span className="text-textGray">{t('auth.hasAccount')}</span>{' '}
          <Link to="/login" className="font-medium text-accent hover:text-accent-dark">
            {t('auth.login')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
