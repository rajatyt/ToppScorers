import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import {
  FaShieldAlt, FaMapMarkerAlt, FaUserEdit, FaTrashAlt,
  FaCheck, FaExclamationTriangle, FaLock, FaPhoneAlt, FaEyeSlash,
  FaCamera
} from 'react-icons/fa';
import { DISTRICTS, DISTRICT_AREAS } from '../utils/locationData';

const Settings = () => {
  const { t } = useTranslation();
  const { user, refreshUser, logout, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('privacy'); // 'privacy' | 'profile' | 'security'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');
  const fileInputRef = useRef(null);

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

        const rawCity = p.location?.city || '';
        const activeCity = DISTRICTS.includes(rawCity) ? rawCity : (DISTRICTS[0] || 'Prayagraj');
        const activeArea = (DISTRICT_AREAS[activeCity] || []).includes(p.area) ? p.area : '';

        setPhotoUrl(p.profilePhotoUrl || u.avatar || '');
        setProfileData({
          name: u.name || '',
          phone: u.phone || '',
          fullAddress: p.fullAddress || '',
          area: activeArea,
          city: activeCity,
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

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, JPEG, WEBP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit');
      return;
    }
    const uploadData = new FormData();
    uploadData.append('photo', file);
    setUploadingPhoto(true);
    try {
      const endpoint = isTeacher ? '/teachers/profile/photo' : '/students/profile/photo';
      const res = await api.post(endpoint, uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const newUrl = res.data.profilePhotoUrl;
      setPhotoUrl(newUrl);
      if (refreshUser) await refreshUser();
      toast.success(res.data.message || 'Profile photo updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

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
      'Are you sure you want to permanently delete your account and all associated data? This action cannot be undone. Type "DELETE" to confirm:'
    );
    if (confirmed !== 'DELETE') return;

    try {
      await api.delete('/auth/account');
      toast.success('Your account and all associated data have been permanently deleted');
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

          {isTeacher ? (
            <Link
              to="/profile?tab=general"
              className="flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-all text-amber-700 hover:text-amber-900 hover:bg-amber-50"
            >
              <FaUserEdit size={13} />
              <span>Personal & Tutoring Info ↗</span>
            </Link>
          ) : (
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
          )}

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
          isTeacher ? (
            <div className="bg-white rounded-3xl border-2 border-amber-400/40 p-8 sm:p-10 shadow-xs text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-xs">
                <FaUserEdit size={28} />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">
                Educator Personal & Tutoring Info
              </h2>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                All teacher profile details (Name, Profile Photo, Bio, Subjects Taught, Board, Tuition Modes, Rates & Availability) are managed on your dedicated Educator Profile page.
              </p>
              <div className="pt-2">
                <Link
                  to="/profile?tab=general"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all hover:scale-105"
                >
                  <FaUserEdit className="mr-2" />
                  Open Personal & Tutoring Info Editor
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleProfileSave} className="space-y-6">
            {/* Profile Photo Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoChange}
                accept="image/*"
                className="hidden"
              />
              <div className="flex flex-col sm:flex-row items-center gap-5">
                <div className="relative group flex-shrink-0">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 text-white font-black text-2xl sm:text-3xl flex items-center justify-center shadow-md overflow-hidden border-2 border-slate-200">
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt={profileData.name || 'Profile'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{profileData.name?.charAt(0) || user?.name?.charAt(0) || 'U'}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPhoto}
                    title="Upload / Change profile photo"
                    className="absolute -bottom-1 -right-1 w-8 h-8 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-full flex items-center justify-center shadow-md border-2 border-white transition-all transform hover:scale-110 active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {uploadingPhoto ? (
                      <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FaCamera className="text-xs" />
                    )}
                  </button>
                </div>
                <div className="text-center sm:text-left flex-1">
                  <h3 className="text-base font-extrabold text-slate-900 mb-1">
                    Profile Photo
                  </h3>
                  <p className="text-xs text-slate-500 mb-3 max-w-md">
                    Upload a clear profile picture (JPG, PNG, or WEBP up to 5MB). Having a real picture increases engagement and credibility on your profile.
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPhoto}
                    className="inline-flex items-center px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <FaCamera className="mr-2 text-amber-500 text-xs" />
                    {uploadingPhoto ? 'Uploading...' : photoUrl ? 'Change Photo' : 'Upload Photo'}
                  </button>
                </div>
              </div>
            </div>

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
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center">
                    <FaMapMarkerAlt className="text-amber-500 mr-1" />
                    District
                  </label>
                  <select
                    value={profileData.city || DISTRICTS[0] || 'Prayagraj'}
                    onChange={(e) => setProfileData({ ...profileData, city: e.target.value, area: '' })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 font-medium"
                  >
                    {DISTRICTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center">
                    <FaMapMarkerAlt className="text-amber-500 mr-1" />
                    Area / Locality
                  </label>
                  <select
                    value={profileData.area}
                    onChange={(e) => setProfileData({ ...profileData, area: e.target.value })}
                    disabled={!profileData.city}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 font-medium disabled:opacity-50 disabled:bg-slate-100 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {profileData.city ? `Select Area in ${profileData.city}` : 'Select District first'}
                    </option>
                    {profileData.city && DISTRICT_AREAS[profileData.city]?.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
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
        )
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
                    Permanently delete your account, remove your public profile, clear active sessions, and erase all your data from the platform.
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
