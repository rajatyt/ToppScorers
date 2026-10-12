import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { FaGraduationCap } from 'react-icons/fa';

const Login = () => {
  const { t } = useTranslation();
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.identifier || !formData.password) {
      toast.error('Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      const data = await login(formData.identifier, formData.password);
      toast.success(t('auth.loginSuccess'));
      if (data.user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-border animate-fadeInUp">
        <div className="text-center mb-8">
          <img
            src="/logo.png"
            alt="ToppScorers"
            className="mx-auto h-20 w-20 sm:h-24 sm:w-24 object-contain drop-shadow-md mb-2 hover:scale-105 transition-transform"
          />
          <h2 className="mt-4 text-3xl font-extrabold text-textDark">{t('auth.login')}</h2>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-textDark">{t('auth.email')} / {t('auth.phone')}</label>
            <input
              name="identifier"
              type="text"
              required
              className="mt-1 block w-full px-4 py-3 border border-border rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm bg-background text-textDark"
              value={formData.identifier}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-textDark">{t('auth.password')}</label>
            <input
              name="password"
              type="password"
              required
              className="mt-1 block w-full px-4 py-3 border border-border rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm bg-background text-textDark"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          <div className="flex items-center justify-end">
            <a href="#" className="text-sm font-medium text-primary hover:text-primary-light">
              {t('auth.forgotPassword')}
            </a>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary flex justify-center items-center py-3"
          >
            {loading ? t('common.loading') : t('auth.login')}
          </button>
        </form>
        <div className="mt-6 text-center text-sm">
          <span className="text-textGray">{t('auth.noAccount')}</span>{' '}
          <Link to="/signup" className="font-medium text-accent hover:text-accent-dark">
            {t('auth.signup')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
