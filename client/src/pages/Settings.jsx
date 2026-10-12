import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import {
  FaShieldAlt, FaMapMarkerAlt, FaUserEdit, FaTrashAlt,
  FaCheck, FaExclamationTriangle, FaLock, FaPhoneAlt, FaEyeSlash
} from 'react-icons/fa';

const Settings = () => {
  const { t } = useTranslation();
  const { user, logout, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('privacy'); // 'privacy' | 'profile' | 'security'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Privacy toggles
  const [privacy, setPrivacy] = useState({
    showPhone: false,
    showFullAddress: false,
    pauseProfile: false
  });

  // Profile data
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    fullAddress: '',
    area: '',
    city: '',
    pincode: '',
    feeAmount: 2000,
    budgetMax: 5000,
    teachingMode: 'all',
    preferredTiming: '',
    bioOrGoals: '',
    parentGuardianConsent: false
  });

  const isTeacher = user?.role === 'teacher';

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const loadProfile = async () => {
      setLoading(true);
      try {
        const res = await api.get('/auth/me');
        const p = res.data.profile || {};
        const u = res.data.user || {};

        if (p.privacy) {
          setPrivacy({
            showPhone: Boolean(p.privacy.showPhone),
            showFullAddress: Boolean(p.privacy.showFullAddress),
            pauseProfile: Boolean(p.privacy.pauseProfile)
          });
        }

        setProfileData({
          name: u.name || '',
          phone: u.phone || '',
          fullAddress: p.fullAddress || '',
          area: p.area || '',
          city: p.location?.city || '',
          pincode: p.location?.pincode || '',
          feeAmount: p.fee?.amount || 2000,
          budgetMax: p.budget?.max || 5000,
          teachingMode: p.teachingMode || p.preferences?.mode || 'all',
          preferredTiming: p.preferredTiming || p.availability || '',
          bioOrGoals: p.bio || p.goals || '',
          parentGuardianConsent: Boolean(u.parentGuardianConsent)
        });
      } catch (err) {
        toast.error('Failed to load profile settings');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [isAuthenticated, navigate]);

  const handlePrivacyToggle = async (key, val) => {
    const updated = { ...privacy, [key]: val };
    setPrivacy(updated);

    try {
      const endpoint = isTeacher ? '/teachers/privacy' : '/students/privacy';
      await api.patch(endpoint, updated);
      toast.success('Privacy settings updated');
    } catch (err) {
      toast.error('Failed to save privacy setting');
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // 1. Update personal info
      await api.put('/auth/profile', {
        name: profileData.name,
        phone: profileData.phone,
        parentGuardianConsent: profileData.parentGuardianConsent
      });

      // 2. Update role profile
      const endpoint = isTeacher ? '/teachers/profile' : '/students/profile';
      const payload = isTeacher ? {
        fullAddress: profileData.fullAddress,
        area: profileData.area,
        location: { city: profileData.city, pincode: profileData.pincode },
        fee: { amount: Number(profileData.feeAmount), period: 'monthly' },
        teachingMode: profileData.teachingMode,
        availability: profileData.preferredTiming,
        bio: profileData.bioOrGoals
      } : {
        fullAddress: profileData.fullAddress,
        area: profileData.area,
        location: { city: profileData.city, pincode: profileData.pincode },
        budget: { min: 1000, max: Number(profileData.budgetMax), period: 'monthly' },
        preferences: { mode: profileData.teachingMode },
        preferredTiming: profileData.preferredTiming,
        goals: profileData.bioOrGoals
      };

      await api.put(endpoint, payload);
      toast.success('Profile details saved successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.prompt(
      'Are you sure you want to deactivate and schedule your account for deletion under India DPDP Act 2023? Type "DELETE" to confirm:'
    );
    if (confirmed !== 'DELETE') return;

    try {
      await api.delete('/auth/account');
      toast.success('Account deactivated and scheduled for deletion');
      await logout();
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete account');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-xs uppercase tracking-wider mb-2">
            <FaShieldAlt className="mr-1.5" />
            Security & Profile Settings
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Account Settings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your personal data visibility, address privacy, and DPDP compliance rights.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-white border border-slate-200/80 rounded-2xl mb-6 shadow-xs max-w-md">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-all ${
              activeTab === 'privacy'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FaShieldAlt size={13} />
            <span>Privacy & Address</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-all ${
              activeTab === 'profile'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FaUserEdit size={13} />
            <span>Edit Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-all ${
              activeTab === 'security'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FaLock size={13} />
            <span>DPDP & Deletion</span>
          </button>
        </div>

        {/* TAB 1: Privacy Controls */}
        {activeTab === 'privacy' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
              <h2 className="text-base font-extrabold text-slate-900 mb-2">
                Address & Contact Disclosure Rules
              </h2>
              <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                By default on ToppScorers, only your area and city are shown. Phone numbers are strictly protected and never displayed in the frontend app. ToppScorers acts as a coordinator between students and teachers to physically arrange tuitions.
              </p>

              <div className="space-y-4">
                {/* Phone Protection Policy */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
                  <div className="max-w-md">
                    <span className="font-bold text-emerald-950 text-xs block flex items-center">
                      <FaShieldAlt className="mr-1.5 text-emerald-600" />
                      Phone Number Privacy (Always Active)
                    </span>
                    <span className="text-[11px] text-emerald-800">
                      Phone numbers are strictly hidden from students and other platform users. ToppScorers coordinators contact both parties directly for verification and physical tuition scheduling.
                    </span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-200 text-emerald-900 px-2.5 py-1 rounded-full">
                    Protected
                  </span>
                </div>

                {/* Toggle 2: Show Full Address Publicly */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="max-w-md">
                    <span className="font-bold text-slate-900 text-xs block">
                      Show Full Street Address Publicly
                    </span>
                    <span className="text-[11px] text-slate-500">
                      If enabled, your house/plot address and pincode are visible on your public card.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacy.showFullAddress}
                      onChange={(e) => handlePrivacyToggle('showFullAddress', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>

                {/* Toggle 3: Pause Profile */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="max-w-md">
                    <span className="font-bold text-slate-900 text-xs block flex items-center">
                      <FaEyeSlash className="mr-1.5 text-slate-400" />
                      Pause Profile Visibility
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Temporarily hide your profile from public directories and search results (useful when busy or on vacation).
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacy.pauseProfile}
                      onChange={(e) => handlePrivacyToggle('pauseProfile', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Edit Profile */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSave} className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
              <h2 className="text-base font-extrabold text-slate-900 mb-2">
                Personal & Contact Info
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Phone Number (Private)
                  </label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Stored in backend only. Used exclusively by ToppScorers for verification and physical tuition mediation.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Street Address (Protected by default)
                </label>
                <input
                  type="text"
                  value={profileData.fullAddress}
                  onChange={(e) => setProfileData({ ...profileData, fullAddress: e.target.value })}
                  placeholder="e.g. Flat 302, Green Park Apartments, Sector 12"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Area / Locality
                  </label>
                  <input
                    type="text"
                    value={profileData.area}
                    onChange={(e) => setProfileData({ ...profileData, area: e.target.value })}
                    placeholder="e.g. Rohini Sector 9"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={profileData.city}
                    onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                    placeholder="e.g. Delhi"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={profileData.pincode}
                    onChange={(e) => setProfileData({ ...profileData, pincode: e.target.value })}
                    placeholder="e.g. 110085"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {isTeacher ? 'Bio / Teaching Philosophy' : 'Goals & Requirements'}
                </label>
                <textarea
                  rows={3}
                  value={profileData.bioOrGoals}
                  onChange={(e) => setProfileData({ ...profileData, bioOrGoals: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800"
                />
              </div>

              {/* Student under 18 guardian consent checkbox */}
              {!isTeacher && (
                <div className="pt-2 flex items-start space-x-3 p-3 bg-blue-50/70 border border-blue-200/60 rounded-xl text-xs text-blue-900">
                  <input
                    type="checkbox"
                    id="parentConsent"
                    checked={profileData.parentGuardianConsent}
                    onChange={(e) => setProfileData({ ...profileData, parentGuardianConsent: e.target.checked })}
                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="parentConsent">
                    <strong>Parent / Guardian Consent:</strong> I confirm that parent/guardian consent has been obtained to connect with verified tutors and share contact info upon mutual acceptance.
                  </label>
                </div>
              )}

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all hover:scale-[1.01]"
                >
                  {saving ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* TAB 3: DPDP Compliance & Account Deletion */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
              <h2 className="text-base font-extrabold text-slate-900 mb-2">
                India DPDP Act, 2023 Compliance & Privacy Rights
              </h2>
              <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                Under the Digital Personal Data Protection Act 2023, you hold full autonomy over your data on ToppScorers. We only process personal details for educational matching, credential verification, and verified communication.
              </p>

              <div className="space-y-3 text-xs text-slate-700 mb-8">
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center space-x-2.5">
                  <FaCheck className="text-emerald-500 flex-shrink-0" />
                  <span>Right to access and review your collected information anytime.</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center space-x-2.5">
                  <FaCheck className="text-emerald-500 flex-shrink-0" />
                  <span>Right to correction and updating of inaccurate profile details.</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center space-x-2.5">
                  <FaCheck className="text-emerald-500 flex-shrink-0" />
                  <span>Right to erasure and deletion of your profile and data upon request.</span>
                </div>
              </div>

              {/* Account Deletion */}
              <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xs font-bold text-rose-900 uppercase tracking-wider mb-1 flex items-center">
                    <FaExclamationTriangle className="mr-1.5" />
                    Danger Zone: Delete Account
                  </h3>
                  <p className="text-[11px] text-rose-700 max-w-md">
                    Permanently deactivate your account, delete your public profile, clear active sessions, and schedule data erasure.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors whitespace-nowrap"
                >
                  <FaTrashAlt className="inline mr-1.5" />
                  Delete My Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
