import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import {
  FaUserEdit, FaGraduationCap, FaAward, FaCheckCircle,
  FaShieldAlt, FaSave, FaArrowLeft, FaClock, FaExclamationTriangle,
  FaBook, FaBuilding, FaVideo, FaUserFriends, FaMapMarkerAlt,
  FaBookOpen, FaRupeeSign, FaCamera
} from 'react-icons/fa';
import { DISTRICTS, DISTRICT_AREAS } from '../utils/locationData';

const TeacherProfileEdit = () => {
  const { t } = useTranslation();
  const { user, profile, refreshUser, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const searchTab = new URLSearchParams(location.search).get('tab');
  const [activeTab, setActiveTab] = useState(
    searchTab === 'qualifications' ? 'qualifications' : 'general'
  );

  useEffect(() => {
    const tabParam = new URLSearchParams(location.search).get('tab');
    if (tabParam === 'qualifications' || tabParam === 'general') {
      setActiveTab(tabParam);
    }
  }, [location.search]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState('');
  const fileInputRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    bio: '',
    subjects: '',
    exams: '',
    teachingMode: 'home',
    feeAmount: 3000,
    feePeriod: 'monthly',
    availability: 'Flexible (Morning / Evening)',
    area: '',
    city: DISTRICTS[0] || 'Prayagraj',
    state: 'Uttar Pradesh',
    pincode: '',

    // Requirement Details
    board: 'ICSE',
    preferredTime: 'After 4',
    daysPerWeek: '6 days a week',
    tutorGender: 'Any',
    studentGender: 'Female',

    // Qualifications & Credentials
    highestDegree: '',
    university: '',
    yearOfPassing: '',
    certificationName: 'NA',
    rollOrCertNumber: '',
    experience: 0,
    currentOrPastInstitute: '',
    designation: '',
    demoVideoUrl: '',
    teachingPhilosophy: '',
    referenceName: '',
    referenceRelation: '',
    referencePhone: '',
    referenceEmail: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user?.role !== 'teacher') {
      navigate('/dashboard');
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        const res = await api.get('/auth/me');
        const u = res.data.user || {};
        const p = res.data.profile || {};

        const rawCity = p.location?.city || '';
        const activeCity = DISTRICTS.includes(rawCity) ? rawCity : (DISTRICTS[0] || 'Prayagraj');
        const activeArea = (DISTRICT_AREAS[activeCity] || []).includes(p.area) ? p.area : '';

        setCurrentPhoto(p.profilePhotoUrl || u.avatar || '');
        setFormData({
          name: u.name || '',
          phone: u.phone || '',
          bio: p.bio || '',
          subjects: Array.isArray(p.subjects) ? p.subjects.join(', ') : '',
          exams: Array.isArray(p.exams) ? p.exams.join(', ') : '',
          teachingMode: p.teachingMode || 'home',
          feeAmount: p.fee?.amount || 3000,
          feePeriod: p.fee?.period || 'monthly',
          availability: p.availability || 'Flexible (Morning / Evening)',
          area: activeArea,
          city: activeCity,
          state: p.location?.state || 'Uttar Pradesh',
          pincode: p.location?.pincode || '',

          // Requirement Details
          board: p.board || 'ICSE',
          preferredTime: p.preferredTime || p.preferredTiming || 'After 4',
          daysPerWeek: p.daysPerWeek || '6 days a week',
          tutorGender: p.tutorGender || 'Any',
          studentGender: p.studentGender || 'Female',

          // Qualifications
          highestDegree: p.degreeDetails?.highestDegree || '',
          university: p.degreeDetails?.university || '',
          yearOfPassing: p.degreeDetails?.yearOfPassing || '',
          certificationName: p.certificationDetails?.certificationName || 'NA',
          rollOrCertNumber: p.certificationDetails?.rollOrCertNumber || '',
          experience: p.experience || 0,
          currentOrPastInstitute: p.instituteDetails?.currentOrPastInstitute || '',
          designation: p.instituteDetails?.designation || '',
          demoVideoUrl: p.demoVideoUrl || '',
          teachingPhilosophy: p.teachingPhilosophy || '',
          referenceName: p.referenceContact?.name || '',
          referenceRelation: p.referenceContact?.relation || '',
          referencePhone: p.referenceContact?.phone || '',
          referenceEmail: p.referenceContact?.email || ''
        });
      } catch (err) {
        toast.error('Failed to load profile details');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated, user?.role, navigate]);

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
      const res = await api.post('/teachers/profile/photo', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const newUrl = res.data.profilePhotoUrl;
      setCurrentPhoto(newUrl);
      if (refreshUser) await refreshUser();
      toast.success(res.data.message || 'Profile photo updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        bio: formData.bio,
        subjects: formData.subjects.split(',').map(s => s.trim()).filter(Boolean),
        exams: formData.exams.split(',').map(e => e.trim()).filter(Boolean),
        teachingMode: formData.teachingMode,
        fee: {
          amount: Number(formData.feeAmount) || 3000,
          period: formData.feePeriod
        },
        availability: formData.availability,
        board: formData.board,
        preferredTime: formData.preferredTime,
        daysPerWeek: formData.daysPerWeek,
        tutorGender: formData.tutorGender,
        studentGender: formData.studentGender,
        area: formData.area,
        location: {
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode
        },
        experience: Number(formData.experience) || 0,
        demoVideoUrl: formData.demoVideoUrl,
        teachingPhilosophy: formData.teachingPhilosophy,
        degreeDetails: {
          highestDegree: formData.highestDegree,
          university: formData.university,
          yearOfPassing: formData.yearOfPassing
        },
        certificationDetails: {
          certificationName: formData.certificationName,
          rollOrCertNumber: formData.rollOrCertNumber
        },
        instituteDetails: {
          currentOrPastInstitute: formData.currentOrPastInstitute,
          designation: formData.designation
        },
        referenceContact: {
          name: formData.referenceName,
          relation: formData.referenceRelation,
          phone: formData.referencePhone,
          email: formData.referenceEmail
        }
      };

      await api.put('/teachers/profile', payload);
      await refreshUser();
      toast.success('Profile and qualifications saved successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isVerified = profile?.isVerified === true || profile?.verificationStatus === 'verified';
  const isPending = profile?.verificationStatus === 'pending';
  const isRejected = profile?.verificationStatus === 'rejected';

  return (
    <div className="min-h-screen bg-slate-50/70 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <FaArrowLeft className="mr-1.5" />
            {t('common.back')} {t('nav.dashboard')}
          </Link>

          <Link
            to="/verification"
            className="inline-flex items-center text-xs font-bold text-amber-700 hover:text-amber-800 bg-amber-50 border border-amber-200/80 px-3 py-1.5 rounded-xl transition-colors"
          >
            <FaShieldAlt className="mr-1.5" />
            {t('nav.verification')}
          </Link>
        </div>

        {/* Profile Card Header with Verified Badge & Photo Upload */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoChange}
              accept="image/*"
              className="hidden"
            />
            <div className="relative group flex-shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 text-white font-black text-2xl sm:text-3xl flex items-center justify-center shadow-md overflow-hidden border-2 border-slate-200">
                {currentPhoto ? (
                  <img
                    src={currentPhoto}
                    alt={formData.name || 'Profile'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{formData.name?.charAt(0) || user?.name?.charAt(0) || 'T'}</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                title="Upload / Change profile photo"
                className="absolute -bottom-1 -right-1 w-7 h-7 sm:w-8 sm:h-8 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-full flex items-center justify-center shadow-md border-2 border-white transition-all transform hover:scale-110 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {uploadingPhoto ? (
                  <div className="w-3.5 h-3.5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FaCamera className="text-xs" />
                )}
              </button>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {formData.name || user?.name || t('profileEdit.pageTitle')}
                </h1>

                {/* Verified Tag / Badge */}
                {isVerified ? (
                  <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs">
                    <FaCheckCircle className="text-emerald-600" />
                    <span>{t('homeBar.verifiedBadge')}</span>
                  </span>
                ) : isPending ? (
                  <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    <FaClock className="text-amber-600 animate-spin-slow" />
                    <span>{t('homeBar.pendingTitle')}</span>
                  </span>
                ) : isRejected ? (
                  <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-900 border border-rose-300">
                    <FaExclamationTriangle className="text-rose-600" />
                    <span>{t('homeBar.rejectedTitle')}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    <span>{t('nav.unverified')}</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {user?.email} • {formData.phone || 'Phone not set'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!isVerified && (
              <Link
                to="/verification"
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-all hover:scale-[1.02]"
              >
                {t('homeBar.getVerifiedNow')} →
              </Link>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 mb-6 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`px-5 py-3 rounded-t-2xl font-extrabold text-xs sm:text-sm transition-all flex items-center space-x-2 border-b-2 cursor-pointer ${
              activeTab === 'general'
                ? 'border-amber-500 text-amber-900 bg-white shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-900 bg-slate-50/60'
            }`}
          >
            <FaUserEdit size={16} className={activeTab === 'general' ? 'text-amber-600' : 'text-slate-400'} />
            <span>1. {t('profileEdit.tabGeneral')}</span>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 hidden sm:inline-block">
              Bio & Rates
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('qualifications')}
            className={`px-5 py-3 rounded-t-2xl font-extrabold text-xs sm:text-sm transition-all flex items-center space-x-2 border-b-2 cursor-pointer ${
              activeTab === 'qualifications'
                ? 'border-amber-500 text-amber-900 bg-white shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-900 bg-slate-50/60'
            }`}
          >
            <FaGraduationCap size={16} className={activeTab === 'qualifications' ? 'text-amber-600' : 'text-slate-400'} />
            <span>2. {t('profileEdit.tabQualifications')}</span>
          </button>
        </div>

        {/* Profile Modification Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* TAB 1: Qualifications & Academic Credentials */}
          {activeTab === 'qualifications' && (
            <div className="space-y-6">
              {/* Highest Degree */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
                <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                    <FaGraduationCap size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {t('profileEdit.secDegrees')}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Your formal academic degrees (M.Sc, B.Tech, M.A, B.Sc, Ph.D, or NA)
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {t('profileEdit.highestDegree')}
                    </label>
                    <input
                      type="text"
                      name="highestDegree"
                      value={formData.highestDegree}
                      onChange={handleChange}
                      placeholder="e.g. M.Sc Mathematics, B.Tech"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {t('profileEdit.university')}
                    </label>
                    <input
                      type="text"
                      name="university"
                      value={formData.university}
                      onChange={handleChange}
                      placeholder="e.g. Delhi University / IIT"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {t('profileEdit.yearOfPassing')}
                    </label>
                    <input
                      type="text"
                      name="yearOfPassing"
                      value={formData.yearOfPassing}
                      onChange={handleChange}
                      placeholder="e.g. 2019"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Teaching Certifications */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
                <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                    <FaAward size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {t('profileEdit.secCertifications')}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      B.Ed, CTET, TET, NET, SET, or select NA if not applicable
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {t('profileEdit.certificationName')}
                    </label>
                    <select
                      name="certificationName"
                      value={formData.certificationName}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                    >
                      <option value="NA">NA (None)</option>
                      <option value="B.Ed">B.Ed</option>
                      <option value="CTET">CTET (Central Teacher Eligibility)</option>
                      <option value="TET">State TET</option>
                      <option value="NET">UGC NET / CSIR NET</option>
                      <option value="SET">SET / SLET</option>
                      <option value="Other">Other Certification</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {t('profileEdit.rollOrCertNumber')}
                    </label>
                    <input
                      type="text"
                      name="rollOrCertNumber"
                      value={formData.rollOrCertNumber}
                      onChange={handleChange}
                      placeholder="Certificate Roll or Registration Number"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Experience & Institute */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
                <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <FaBuilding size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {t('profileEdit.secExperience')}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Current or past coaching institutes, schools, or home tuition experience
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {t('profileEdit.experienceYears')}
                    </label>
                    <input
                      type="number"
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      min="0"
                      max="50"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {t('profileEdit.instituteName')}
                    </label>
                    <input
                      type="text"
                      name="currentOrPastInstitute"
                      value={formData.currentOrPastInstitute}
                      onChange={handleChange}
                      placeholder="e.g. Allen, FIITJEE, DPS, Freelance"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {t('profileEdit.designation')}
                    </label>
                    <input
                      type="text"
                      name="designation"
                      value={formData.designation}
                      onChange={handleChange}
                      placeholder="e.g. Senior Faculty / Home Tutor"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Demo Lecture Video & Philosophy (Optional) */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
                <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
                    <FaVideo size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {t('profileEdit.secProof')}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Both fields are optional — share if you have lecture samples or specific pedagogy
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {t('profileEdit.demoVideoUrl')}
                    </label>
                    <input
                      type="url"
                      name="demoVideoUrl"
                      value={formData.demoVideoUrl}
                      onChange={handleChange}
                      placeholder="Optional: https://www.youtube.com/watch?v=..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {t('profileEdit.teachingPhilosophy')}
                    </label>
                    <textarea
                      rows={3}
                      name="teachingPhilosophy"
                      value={formData.teachingPhilosophy}
                      onChange={handleChange}
                      placeholder="Optional: Describe your concept-clarity method, problem-solving approach, student mentorship style..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Reference Contact */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
                <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                    <FaUserFriends size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {t('profileEdit.secReferences')}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      A senior teacher, principal, or colleague who can vouch for your teaching
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {t('profileEdit.refName')}
                    </label>
                    <input
                      type="text"
                      name="referenceName"
                      value={formData.referenceName}
                      onChange={handleChange}
                      placeholder="e.g. Dr. Ramesh Sharma"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {t('profileEdit.refRelation')}
                    </label>
                    <input
                      type="text"
                      name="referenceRelation"
                      value={formData.referenceRelation}
                      onChange={handleChange}
                      placeholder="e.g. HOD Mathematics / Principal"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {t('profileEdit.refPhone')}
                    </label>
                    <input
                      type="tel"
                      name="referencePhone"
                      value={formData.referencePhone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {t('profileEdit.refEmail')}
                    </label>
                    <input
                      type="email"
                      name="referenceEmail"
                      value={formData.referenceEmail}
                      onChange={handleChange}
                      placeholder="reference@example.com"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Basic Info, Subjects & Tuition Fees */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* Basic Details */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">
                  {t('profileEdit.tabGeneral')}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {t('profileEdit.fullName')}
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {t('profileEdit.phone')}
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {t('profileEdit.bio')}
                    </label>
                    <textarea
                      rows={3}
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      placeholder="Introduce yourself to prospective students and institutes..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Tutoring Specialization & Preferences */}
              <div className="bg-white rounded-2xl border-2 border-amber-400/40 p-5 sm:p-6 shadow-xs relative overflow-hidden">
                <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-amber-100">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-700 flex items-center justify-center font-bold">
                    <FaBookOpen size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Tutoring Specialization & Preferences
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Specify your subjects, boards, target entrance exams, fees, and schedule
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Subjects */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {t('profileEdit.subjectsTaught', 'Subjects Taught')}
                    </label>
                    <input
                      type="text"
                      name="subjects"
                      value={formData.subjects}
                      onChange={handleChange}
                      placeholder="e.g. Mathematics, Physics, Chemistry"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Comma-separated (e.g. Physics, Chemistry, Mathematics)</p>
                  </div>

                  {/* Target Exams */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {t('profileEdit.targetExams', 'Target Exams Specialized')}
                    </label>
                    <input
                      type="text"
                      name="exams"
                      value={formData.exams}
                      onChange={handleChange}
                      placeholder="e.g. JEE Main, NEET, CBSE Class 12, Foundation"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Comma-separated target entrance/board exams</p>
                  </div>

                  {/* Board */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Board
                    </label>
                    <select
                      name="board"
                      value={formData.board}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 font-bold"
                    >
                      <option value="ICSE">ICSE</option>
                      <option value="CBSE">CBSE</option>
                      <option value="UP Board">UP Board</option>
                      <option value="State Board">State Board</option>
                      <option value="All Boards">All Boards</option>
                    </select>
                  </div>

                  {/* Tuition Mode */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Tuition Mode
                    </label>
                    <select
                      name="teachingMode"
                      value={formData.teachingMode}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 font-bold uppercase"
                    >
                      <option value="HOME">HOME</option>
                      <option value="ONLINE">ONLINE</option>
                      <option value="BOTH">BOTH (HOME & ONLINE)</option>
                      <option value="INSTITUTE">INSTITUTE</option>
                    </select>
                  </div>

                  {/* Budget / Rate */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center">
                      <FaRupeeSign className="text-amber-500 mr-0.5" />
                      Budget / Rate
                    </label>
                    <input
                      type="number"
                      name="feeAmount"
                      value={formData.feeAmount}
                      onChange={handleChange}
                      placeholder="e.g. 3000"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                    />
                  </div>

                  {/* Rate Period */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Fee Frequency
                    </label>
                    <select
                      name="feePeriod"
                      value={formData.feePeriod}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                    >
                      <option value="monthly">Per Month</option>
                      <option value="hourly">Per Hour</option>
                      <option value="per_session">Per Session</option>
                    </select>
                  </div>

                  {/* Preferred Time */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Preferred Time
                    </label>
                    <input
                      type="text"
                      name="preferredTime"
                      value={formData.preferredTime}
                      onChange={handleChange}
                      placeholder="e.g. After 4, Evening"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                    />
                  </div>

                  {/* Days per Week */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Days per Week
                    </label>
                    <select
                      name="daysPerWeek"
                      value={formData.daysPerWeek}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                    >
                      <option value="6 days a week">6 days a week</option>
                      <option value="5 days a week">5 days a week</option>
                      <option value="4 days a week">4 days a week</option>
                      <option value="3 days a week">3 days a week</option>
                      <option value="Weekend only">Weekend only</option>
                      <option value="Flexible">Flexible</option>
                    </select>
                  </div>

                  {/* Tutor Gender */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Tutor Gender
                    </label>
                    <select
                      name="tutorGender"
                      value={formData.tutorGender}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                    >
                      <option value="Any">Any</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>

                  {/* Student Gender */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Student Gender
                    </label>
                    <select
                      name="studentGender"
                      value={formData.studentGender}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Any">Any</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Location & Coverage */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100 flex items-center">
                  <FaMapMarkerAlt className="text-amber-500 mr-2" />
                  Location & Coverage (Prayagraj)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center">
                      <FaMapMarkerAlt className="text-amber-500 mr-1" />
                      District
                    </label>
                    <select
                      name="city"
                      value={formData.city || DISTRICTS[0] || 'Prayagraj'}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          city: e.target.value,
                          area: '' // reset area when district changes
                        });
                      }}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 font-semibold"
                    >
                      {DISTRICTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center">
                      <FaMapMarkerAlt className="text-amber-500 mr-1" />
                      {t('profileEdit.locality')}
                    </label>
                    <select
                      name="area"
                      value={formData.area}
                      onChange={handleChange}
                      disabled={!formData.city}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 disabled:opacity-50 disabled:bg-slate-100 disabled:cursor-not-allowed font-medium"
                    >
                      <option value="">
                        {formData.city ? `Select Area in ${formData.city}` : 'Select District first'}
                      </option>
                      {formData.city && DISTRICT_AREAS[formData.city]?.map((a) => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {t('profileEdit.pincode')}
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      placeholder="e.g. 211001"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save Action Bar */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-slate-900">
                {t('profileEdit.saveChanges')}
              </p>
              <p className="text-[11px] text-slate-500">
                Updated qualifications and details will be immediately visible on your public card.
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-7 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all hover:scale-[1.01] flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <FaSave size={14} />
              <span>{saving ? t('profileEdit.saving') : t('profileEdit.saveChanges')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherProfileEdit;
