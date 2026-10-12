import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import {
  FaCheckCircle, FaClock, FaExclamationTriangle, FaShieldAlt,
  FaIdCard, FaGraduationCap, FaCertificate, FaBuilding, FaVideo,
  FaUserFriends, FaArrowLeft, FaUpload, FaFilePdf, FaExternalLinkAlt,
  FaCheck, FaPhoneAlt, FaLock
} from 'react-icons/fa';
import { FiChevronRight, FiAlertCircle } from 'react-icons/fi';

const TeacherVerification = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [skipping, setSkipping] = useState(false);

  // Status & existing state
  const [status, setStatus] = useState('unverified'); // 'unverified' | 'pending' | 'verified' | 'rejected'
  const [rejectionReason, setRejectionReason] = useState('');
  const [submittedAt, setSubmittedAt] = useState(null);
  const [verifiedAt, setVerifiedAt] = useState(null);

  // Form Fields
  const [formData, setFormData] = useState({
    verificationPhone: '',
    preferredCallingTime: 'Anytime',
    idType: 'aadhaar',
    idNumber: '',
    highestDegree: '',
    university: '',
    yearOfPassing: '',
    certificationName: 'NA',
    rollOrCertNumber: '',
    currentOrPastInstitute: '',
    designation: '',
    experience: 0,
    demoVideoUrl: '',
    bio: '',
    teachingPhilosophy: '',
    referenceName: '',
    referenceRelation: '',
    referencePhone: '',
    referenceEmail: ''
  });

  // Existing document URLs from server
  const [existingDocs, setExistingDocs] = useState({
    govtIdDocUrl: '',
    degreeDocUrl: '',
    certificationDocUrl: '',
    instituteDocUrl: ''
  });

  // Selected files
  const [files, setFiles] = useState({
    govtIdDoc: null,
    degreeDoc: null,
    certificationDoc: null,
    instituteDoc: null
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

    const fetchVerification = async () => {
      setLoading(true);
      try {
        const res = await api.get('/teachers/verification');
        const data = res.data;
        setStatus(data.verificationStatus || 'unverified');
        setRejectionReason(data.rejectionReason || '');
        setSubmittedAt(data.verificationSubmittedAt);
        setVerifiedAt(data.verifiedAt);

        setFormData({
          verificationPhone: data.verificationPhone || user?.phone || '',
          preferredCallingTime: data.preferredCallingTime || 'Anytime',
          idType: data.govtId?.idType || 'aadhaar',
          idNumber: data.govtId?.idNumber || '',
          highestDegree: data.degreeDetails?.highestDegree || '',
          university: data.degreeDetails?.university || '',
          yearOfPassing: data.degreeDetails?.yearOfPassing || '',
          certificationName: data.certificationDetails?.certificationName || 'NA',
          rollOrCertNumber: data.certificationDetails?.rollOrCertNumber || '',
          currentOrPastInstitute: data.instituteDetails?.currentOrPastInstitute || '',
          designation: data.instituteDetails?.designation || '',
          experience: data.experience || 0,
          demoVideoUrl: data.demoVideoUrl || '',
          bio: data.bio || '',
          teachingPhilosophy: data.teachingPhilosophy || '',
          referenceName: data.referenceContact?.name || '',
          referenceRelation: data.referenceContact?.relation || '',
          referencePhone: data.referenceContact?.phone || '',
          referenceEmail: data.referenceContact?.email || ''
        });

        setExistingDocs({
          govtIdDocUrl: data.govtId?.documentUrl || '',
          degreeDocUrl: data.degreeDetails?.degreeDocumentUrl || '',
          certificationDocUrl: data.certificationDetails?.certificateDocumentUrl || '',
          instituteDocUrl: data.instituteDetails?.instituteDocumentUrl || ''
        });
      } catch (err) {
        toast.error(t('verification.loadError'));
      } finally {
        setLoading(false);
      }
    };

    fetchVerification();
  }, [isAuthenticated, user?.role, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, fileKey) => {
    if (e.target.files && e.target.files[0]) {
      setFiles(prev => ({ ...prev, [fileKey]: e.target.files[0] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        data.append(key, val);
      });

      if (files.govtIdDoc) data.append('govtIdDoc', files.govtIdDoc);
      if (files.degreeDoc) data.append('degreeDoc', files.degreeDoc);
      if (files.certificationDoc) data.append('certificationDoc', files.certificationDoc);
      if (files.instituteDoc) data.append('instituteDoc', files.instituteDoc);

      const res = await api.post('/teachers/verification', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success(res.data.message || t('verification.submittedToast'));
      setStatus('pending');
      setRejectionReason('');
      setSubmittedAt(new Date());

      // Update existing doc preview URLs if uploaded
      if (res.data.profile) {
        const p = res.data.profile;
        setExistingDocs({
          govtIdDocUrl: p.govtId?.documentUrl || existingDocs.govtIdDocUrl,
          degreeDocUrl: p.degreeDetails?.degreeDocumentUrl || existingDocs.degreeDocUrl,
          certificationDocUrl: p.certificationDetails?.certificateDocumentUrl || existingDocs.certificationDocUrl,
          instituteDocUrl: p.instituteDetails?.instituteDocumentUrl || existingDocs.instituteDocUrl
        });
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit verification details');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = async () => {
    setSkipping(true);
    try {
      const res = await api.post('/teachers/verification/skip');
      toast.success(res.data.message || 'Verification skipped for now.');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Failed to skip verification');
    } finally {
      setSkipping(false);
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
        {/* Back Link */}
        <Link
          to="/dashboard"
          className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-slate-900 mb-6 transition-colors"
        >
          <FaArrowLeft className="mr-1.5" />
          {t('common.back')} {t('nav.dashboard')}
        </Link>

        {/* Header Hero */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl mb-8 relative overflow-hidden">
          <div className="relative z-10">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs uppercase tracking-wider mb-2">
              <FaShieldAlt className="mr-1.5" />
              ToppScorers Educator Network
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {t('verification.title')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              {t('verification.subtitle')}
            </p>
          </div>
        </div>

        {/* Dynamic Status Banner */}
        {status === 'verified' && (
          <div className="bg-emerald-50 border-2 border-emerald-500/80 rounded-2xl p-6 mb-8 shadow-sm flex items-start space-x-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-md">
              <FaCheckCircle size={24} />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-bold text-emerald-950">
                  {t('homeBar.verifiedTitle')}
                </h3>
                <span className="bg-emerald-200 text-emerald-900 text-xs px-2.5 py-0.5 rounded-full font-bold">
                  {t('verification.verifiedBadge')}
                </span>
              </div>
              <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                {t('homeBar.verifiedDesc')}
              </p>
              {verifiedAt && (
                <p className="text-[11px] text-emerald-600 font-semibold mt-2">
                  {t('verification.verifiedAt')}: {new Date(verifiedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        )}

        {status === 'pending' && (
          <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-6 mb-8 shadow-sm flex items-start space-x-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-md">
              <FaClock size={24} className="animate-spin-slow" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-bold text-amber-950">
                  {t('verification.pendingBadge')}
                </h3>
                <span className="bg-amber-200 text-amber-900 text-xs px-2.5 py-0.5 rounded-full font-bold">
                  {t('homeBar.underReviewBadge')}
                </span>
              </div>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                {t('homeBar.pendingDesc')}
              </p>
              {submittedAt && (
                <p className="text-[11px] text-amber-700 font-medium mt-2">
                  {t('verification.submittedAt')}: {new Date(submittedAt).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        )}

        {status === 'rejected' && (
          <div className="bg-rose-50 border-2 border-rose-400 rounded-2xl p-6 mb-8 shadow-sm flex items-start space-x-4">
            <div className="w-12 h-12 rounded-xl bg-rose-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
              <FaExclamationTriangle size={22} />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-bold text-rose-950">
                  {t('homeBar.rejectedTitle')}
                </h3>
                <span className="bg-rose-200 text-rose-900 text-xs px-2.5 py-0.5 rounded-full font-bold">
                  {t('homeBar.actionNeeded')}
                </span>
              </div>
              <p className="text-xs text-rose-800 mt-1 font-semibold">
                {t('verification.rejectionReason')}: <span className="underline">{rejectionReason || 'Please verify that document details match your submitted profile.'}</span>
              </p>
              <p className="text-xs text-rose-700 mt-1">
                Please update the required information or re-upload clear document copies below, then click "Submit for Verification" again.
              </p>
            </div>
          </div>
        )}

        {status === 'unverified' && (
          <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-6 mb-8 shadow-xs">
            <h3 className="text-sm font-bold text-blue-950 mb-2 flex items-center">
              <FaShieldAlt className="text-blue-600 mr-2" />
              {t('promptModal.whyVerify')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-blue-900">
              <div className="bg-white/80 p-3 rounded-xl border border-blue-100 flex items-start space-x-2">
                <FaCheck className="text-emerald-500 mt-0.5 flex-shrink-0" />
                <span><strong>Verified Badge:</strong> {t('promptModal.perk2')}</span>
              </div>
              <div className="bg-white/80 p-3 rounded-xl border border-blue-100 flex items-start space-x-2">
                <FaCheck className="text-emerald-500 mt-0.5 flex-shrink-0" />
                <span><strong>Direct Outreach:</strong> {t('promptModal.perk1')}</span>
              </div>
              <div className="bg-white/80 p-3 rounded-xl border border-blue-100 flex items-start space-x-2">
                <FaCheck className="text-emerald-500 mt-0.5 flex-shrink-0" />
                <span><strong>High Visibility:</strong> {t('promptModal.perk3')}</span>
              </div>
            </div>
          </div>
        )}

        {/* Verification Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section: Direct Phone for Verification & Physical Coordination */}
          <div className="bg-white rounded-2xl border-2 border-amber-400/80 p-5 sm:p-6 shadow-sm">
            <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-xs">
                <FaPhoneAlt size={18} />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">
                    {t('verification.stepContact')}
                  </h2>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                    Confidential & Private
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {t('verification.stepContactDesc')}
                </p>
              </div>
            </div>

            {/* Privacy Guarantee Card */}
            <div className="mb-4 p-3.5 bg-gradient-to-r from-emerald-50/90 to-teal-50/90 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-start space-x-3">
              <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                <FaLock size={11} />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-emerald-950">
                  {t('verification.phonePrivacyBadge')}
                </p>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  To ensure quality and child safety, <strong>phone numbers are never shown on the website or mobile app</strong>.
                  The ToppScorers platform acts as a personal coordinator between you and students/parents to physically arrange demo sessions and confirm tuition logistics.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t('verification.directPhone')} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <FaPhoneAlt size={12} />
                  </div>
                  <input
                    type="tel"
                    name="verificationPhone"
                    required
                    value={formData.verificationPhone}
                    onChange={handleChange}
                    placeholder="e.g. +91 9876543210"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Our coordinator calls this number for credential verification and tuition matching.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t('verification.callingTime')}
                </label>
                <select
                  name="preferredCallingTime"
                  value={formData.preferredCallingTime}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                >
                  <option value="Anytime">{t('verification.callingTimeAnytime')}</option>
                  <option value="Morning">{t('verification.callingTimeMorning')}</option>
                  <option value="Afternoon">{t('verification.callingTimeAfternoon')}</option>
                  <option value="Evening">{t('verification.callingTimeEvening')}</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1">Convenient hours for our verification coordinator to call.</p>
              </div>
            </div>
          </div>

          {/* 1. Identity Verification */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <FaIdCard size={18} />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  {t('verification.stepIdentity')}
                </h2>
                <p className="text-[11px] text-slate-500">
                  {t('verification.stepIdentityDesc')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t('verification.idType')}
                </label>
                <select
                  name="idType"
                  value={formData.idType}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                >
                  <option value="aadhaar">Aadhaar Card</option>
                  <option value="pan">PAN Card</option>
                  <option value="voter_id">Voter ID</option>
                  <option value="driving_license">Driving License</option>
                  <option value="na">NA (Skip Identity Doc)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t('verification.idNumber')}
                </label>
                <input
                  type="text"
                  name="idNumber"
                  value={formData.idNumber}
                  onChange={handleChange}
                  placeholder={formData.idType === 'aadhaar' ? '12-digit Aadhaar Number or NA' : 'ID Number or NA'}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t('verification.uploadIdDoc')}
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors">
                    <FaUpload className="mr-2 text-slate-500" />
                    {files.govtIdDoc ? files.govtIdDoc.name : 'Choose File (JPG, PNG, PDF)'}
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange(e, 'govtIdDoc')}
                      className="hidden"
                    />
                  </label>
                  {existingDocs.govtIdDocUrl && (
                    <a
                      href={existingDocs.govtIdDocUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs text-amber-700 hover:text-amber-800 font-bold underline"
                    >
                      <FaExternalLinkAlt className="mr-1 text-[10px]" />
                      View Uploaded ID
                    </a>
                  )}
                  <span className="text-[11px] text-slate-400">Max size 10MB</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Highest Qualification & Degree */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                <FaGraduationCap size={18} />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  {t('verification.stepQualifications')}
                </h2>
                <p className="text-[11px] text-slate-500">
                  {t('verification.stepQualificationsDesc')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t('verification.highestDegree')}
                </label>
                <input
                  type="text"
                  name="highestDegree"
                  value={formData.highestDegree}
                  onChange={handleChange}
                  placeholder="e.g. M.Sc Mathematics, B.Tech, M.A."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t('verification.university')}
                </label>
                <input
                  type="text"
                  name="university"
                  value={formData.university}
                  onChange={handleChange}
                  placeholder="e.g. Delhi University / IIT Bombay"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t('verification.yearOfPassing')}
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

              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t('verification.uploadDegreeDoc')}
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors">
                    <FaUpload className="mr-2 text-slate-500" />
                    {files.degreeDoc ? files.degreeDoc.name : 'Choose Degree File (JPG, PNG, PDF)'}
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange(e, 'degreeDoc')}
                      className="hidden"
                    />
                  </label>
                  {existingDocs.degreeDocUrl && (
                    <a
                      href={existingDocs.degreeDocUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs text-amber-700 hover:text-amber-800 font-bold underline"
                    >
                      <FaExternalLinkAlt className="mr-1 text-[10px]" />
                      View Uploaded Degree
                    </a>
                  )}
                  <span className="text-[11px] text-slate-400">PDF, JPG, PNG up to 10MB</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Teaching Certifications (Optional) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                <FaCertificate size={18} />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  {t('verification.stepCertifications')}
                </h2>
                <p className="text-[11px] text-slate-500">
                  {t('verification.stepCertificationsDesc')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t('verification.certName')}
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
                  {t('verification.certNumber')}
                </label>
                <input
                  type="text"
                  name="rollOrCertNumber"
                  value={formData.rollOrCertNumber}
                  onChange={handleChange}
                  placeholder="e.g. Roll No or Certificate Number"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t('verification.uploadCertDoc')}
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors">
                    <FaUpload className="mr-2 text-slate-500" />
                    {files.certificationDoc ? files.certificationDoc.name : 'Choose Certificate File (JPG, PNG, PDF)'}
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange(e, 'certificationDoc')}
                      className="hidden"
                    />
                  </label>
                  {existingDocs.certificationDocUrl && (
                    <a
                      href={existingDocs.certificationDocUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs text-amber-700 hover:text-amber-800 font-bold underline"
                    >
                      <FaExternalLinkAlt className="mr-1 text-[10px]" />
                      View Uploaded Certificate
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 4. Experience & Institute Details */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <FaBuilding size={18} />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  {t('verification.stepExperience')}
                </h2>
                <p className="text-[11px] text-slate-500">
                  {t('verification.stepExperienceDesc')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t('verification.experienceYears')}
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
                  {t('verification.instituteName')}
                </label>
                <input
                  type="text"
                  name="currentOrPastInstitute"
                  value={formData.currentOrPastInstitute}
                  onChange={handleChange}
                  placeholder="e.g. Allen, FIITJEE, DPS, or Freelance"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t('verification.designation')}
                </label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  placeholder="e.g. Senior Faculty, PGT, Home Tutor"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t('verification.uploadInstituteDoc')}
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors">
                    <FaUpload className="mr-2 text-slate-500" />
                    {files.instituteDoc ? files.instituteDoc.name : 'Choose File (Optional)'}
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange(e, 'instituteDoc')}
                      className="hidden"
                    />
                  </label>
                  {existingDocs.instituteDocUrl && (
                    <a
                      href={existingDocs.instituteDocUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs text-amber-700 hover:text-amber-800 font-bold underline"
                    >
                      <FaExternalLinkAlt className="mr-1 text-[10px]" />
                      View Uploaded Institute Document
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 5. Proof of Teaching & Specialization (Optional) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
                <FaVideo size={18} />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  {t('verification.stepProof')}
                </h2>
                <p className="text-[11px] text-slate-500">
                  {t('verification.stepProofDesc')}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t('verification.demoVideo')}
                </label>
                <input
                  type="url"
                  name="demoVideoUrl"
                  value={formData.demoVideoUrl}
                  onChange={handleChange}
                  placeholder="Optional: https://www.youtube.com/watch?v=... or leave blank"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t('verification.teachingPhilosophy')}
                </label>
                <textarea
                  rows={3}
                  name="teachingPhilosophy"
                  value={formData.teachingPhilosophy}
                  onChange={handleChange}
                  placeholder="Optional: Describe your concept-building approach, problem-solving style, or leave blank..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* 6. Reference Contact (Optional) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                <FaUserFriends size={18} />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  {t('verification.stepReferences')}
                </h2>
                <p className="text-[11px] text-slate-500">
                  {t('verification.stepReferencesDesc')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t('verification.refName')}
                </label>
                <input
                  type="text"
                  name="referenceName"
                  value={formData.referenceName}
                  onChange={handleChange}
                  placeholder="e.g. Dr. Rajesh Sharma"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t('verification.refRelation')}
                </label>
                <input
                  type="text"
                  name="referenceRelation"
                  value={formData.referenceRelation}
                  onChange={handleChange}
                  placeholder="e.g. HOD Physics / Principal / Senior Colleague"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t('verification.refPhone')}
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
                  {t('verification.refEmail')}
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

          {/* Submission and Skip Actions */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-slate-900">
                {t('verification.submitBtn')}
              </p>
              <p className="text-[11px] text-slate-500">
                {t('verification.skipNotice')}
              </p>
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleSkip}
                disabled={skipping || submitting}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
              >
                {skipping ? '...' : t('verification.skipBtn')}
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="flex-1 sm:flex-none px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all hover:scale-[1.01] disabled:opacity-50"
              >
                {submitting ? t('verification.submittingBtn') : t('verification.submitBtn')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherVerification;
