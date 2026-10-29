import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import {
  FaCheckCircle, FaClock, FaExclamationTriangle, FaShieldAlt,
  FaIdCard, FaGraduationCap, FaArrowLeft, FaUpload, FaFilePdf, FaExternalLinkAlt,
  FaCheck, FaPhoneAlt, FaLock, FaBookOpen, FaRupeeSign, FaMapMarkerAlt
} from 'react-icons/fa';
import { FiChevronRight, FiAlertCircle, FiInfo } from 'react-icons/fi';
import { DISTRICTS, DISTRICT_AREAS } from '../utils/locationData';

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

  // Form Fields - Compulsory Tutoring Specialization, Location, Identity, and Degree
  const [formData, setFormData] = useState({
    verificationPhone: '',
    preferredCallingTime: 'Anytime',

    // Tutoring Specialization & Preferences (Compulsory)
    subjects: 'Math',
    exams: 'NEET',
    board: 'ICSE',
    teachingMode: 'HOME',
    feeAmount: 3000,
    feePeriod: 'monthly',
    preferredTime: 'After 4',
    daysPerWeek: '6 days a week',
    tutorGender: 'Any',
    studentGender: 'Female',

    // Location & Coverage (Prayagraj) (Compulsory)
    city: DISTRICTS[0] || 'Prayagraj',
    area: 'Daraganj',
    pincode: '211001',

    // Identity Verification (Compulsory)
    idType: 'aadhaar',
    idNumber: '',

    // Highest Qualification & Degree (Compulsory)
    highestDegree: '',
    university: '',
    yearOfPassing: ''
  });

  // Existing document URLs from server
  const [existingDocs, setExistingDocs] = useState({
    govtIdDocUrl: '',
    degreeDocUrl: ''
  });

  // Selected files
  const [files, setFiles] = useState({
    govtIdDoc: null,
    degreeDoc: null
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

          // Tutoring Specialization & Preferences
          subjects: Array.isArray(data.subjects) && data.subjects.length > 0 
            ? data.subjects.join(', ') 
            : (typeof data.subjects === 'string' && data.subjects ? data.subjects : 'Math'),
          exams: Array.isArray(data.exams) && data.exams.length > 0 
            ? data.exams.join(', ') 
            : (typeof data.exams === 'string' && data.exams ? data.exams : 'NEET'),
          board: data.board || 'ICSE',
          teachingMode: (data.teachingMode || 'HOME').toUpperCase(),
          feeAmount: data.feeAmount ?? 3000,
          feePeriod: data.feePeriod || 'monthly',
          preferredTime: data.preferredTime || 'After 4',
          daysPerWeek: data.daysPerWeek || '6 days a week',
          tutorGender: data.tutorGender || 'Any',
          studentGender: data.studentGender || 'Female',

          // Location & Coverage
          city: data.city || DISTRICTS[0] || 'Prayagraj',
          area: data.area || 'Daraganj',
          pincode: data.pincode || '211001',

          // Identity
          idType: data.govtId?.idType || 'aadhaar',
          idNumber: data.govtId?.idNumber || '',

          // Qualifications
          highestDegree: data.degreeDetails?.highestDegree || '',
          university: data.degreeDetails?.university || '',
          yearOfPassing: data.degreeDetails?.yearOfPassing || ''
        });

        setExistingDocs({
          govtIdDocUrl: data.govtId?.documentUrl || '',
          degreeDocUrl: data.degreeDetails?.degreeDocumentUrl || ''
        });
      } catch (err) {
        toast.error(t('verification.loadError', 'Error loading verification profile'));
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

    // Compulsory field validations
    if (!formData.verificationPhone?.trim()) {
      toast.error('Verification mobile phone number is required');
      return;
    }
    if (!formData.subjects?.trim()) {
      toast.error('Subjects Taught is required');
      return;
    }
    if (!formData.exams?.trim()) {
      toast.error('Target Exams Specialized is required');
      return;
    }
    if (!formData.area) {
      toast.error('Please select your Area / Locality in Prayagraj');
      return;
    }
    if (!formData.pincode?.trim()) {
      toast.error('Pincode is required');
      return;
    }
    if (!formData.idNumber?.trim()) {
      toast.error('Government ID Number is required');
      return;
    }
    if (!existingDocs.govtIdDocUrl && !files.govtIdDoc) {
      toast.error('Please upload your Government ID document (Aadhaar/PAN/Voter ID)');
      return;
    }
    if (!formData.highestDegree?.trim()) {
      toast.error('Highest Degree qualification is required');
      return;
    }
    if (!existingDocs.degreeDocUrl && !files.degreeDoc) {
      toast.error('Please upload your Degree / Certificate document');
      return;
    }

    setSubmitting(true);

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        data.append(key, val);
      });

      if (files.govtIdDoc) data.append('govtIdDoc', files.govtIdDoc);
      if (files.degreeDoc) data.append('degreeDoc', files.degreeDoc);

      const res = await api.post('/teachers/verification', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success(res.data.message || t('verification.submittedToast', 'Verification details submitted successfully'));
      setStatus('pending');
      setRejectionReason('');
      setSubmittedAt(new Date());

      if (res.data.profile) {
        const p = res.data.profile;
        setExistingDocs({
          govtIdDocUrl: p.govtId?.documentUrl || existingDocs.govtIdDocUrl,
          degreeDocUrl: p.degreeDetails?.degreeDocumentUrl || existingDocs.degreeDocUrl
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

  const selectedDistrict = formData.city || DISTRICTS[0] || 'Prayagraj';
  const availableAreas = DISTRICT_AREAS[selectedDistrict] || [];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-amber-600 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            {t('verification.backDashboard', 'Back to Dashboard')}
          </Link>
          <span className="text-xs text-slate-400">Step: Profile Verification</span>
        </div>

        {/* Header Hero Banner */}
        <div className="bg-gradient-to-r from-[#1e3a5f] via-[#244673] to-[#122842] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-semibold border border-white/10">
                <FaShieldAlt />
                <span>Educator Trust & Credential Verification</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Get Verified with "Verified Expert" Badge
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Provide your compulsory tutoring specialization, location coverage, identity ID, and academic degree. Verified educators receive 3x more direct student inquiries.
              </p>
            </div>

            {/* Status Pill */}
            <div className="self-start md:self-center shrink-0">
              {status === 'verified' && (
                <div className="flex items-center space-x-2 px-4 py-2 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-xs">
                  <FaCheckCircle className="text-sm" />
                  <span>Verified Tutor ✅</span>
                </div>
              )}
              {status === 'pending' && (
                <div className="flex items-center space-x-2 px-4 py-2 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-xs animate-pulse">
                  <FaClock className="text-sm" />
                  <span>Verification Under Review</span>
                </div>
              )}
              {status === 'rejected' && (
                <div className="flex items-center space-x-2 px-4 py-2 rounded-2xl bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold text-xs">
                  <FaExclamationTriangle className="text-sm" />
                  <span>Changes Requested</span>
                </div>
              )}
              {status === 'unverified' && (
                <div className="flex items-center space-x-2 px-4 py-2 rounded-2xl bg-slate-700/50 text-slate-300 border border-slate-600 font-bold text-xs">
                  <FaShieldAlt className="text-sm text-amber-400" />
                  <span>Unverified Profile</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status Callout Banner */}
        {status === 'pending' && (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start space-x-3.5 shadow-xs">
            <FaClock className="text-amber-600 text-lg mt-0.5 shrink-0" />
            <div className="space-y-1 text-xs">
              <p className="font-bold">
                Your verification documents are currently under administrative review.
              </p>
              <p className="text-amber-800">
                Submitted on {submittedAt ? new Date(submittedAt).toLocaleDateString() : 'recently'}. Our verification team will review your credentials within 24 to 48 hours. You may update your submitted details below anytime.
              </p>
            </div>
          </div>
        )}

        {status === 'rejected' && (
          <div className="p-4 sm:p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start space-x-3.5 shadow-xs">
            <FaExclamationTriangle className="text-rose-600 text-lg mt-0.5 shrink-0" />
            <div className="space-y-1 text-xs">
              <p className="font-bold">Revision Requested by Administrator</p>
              <p className="text-rose-800">
                Reason: {rejectionReason || 'Please re-verify your uploaded identification and degree documents.'}
              </p>
            </div>
          </div>
        )}

        {/* Verification Form */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Section 1: Verification & Coordination Phone */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <FaPhoneAlt size={16} />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">
                    Tuition Coordination & Verification Contact
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Used strictly by administrators for verification and personal student matchmaking
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-200">
                Compulsory *
              </span>
            </div>

            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl mb-4 flex items-start space-x-2.5">
              <FaLock className="text-emerald-600 text-sm mt-0.5 shrink-0" />
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                To guarantee safety and privacy, <strong>your phone number is never displayed publicly</strong>. Our team calls you for credential audit and tuition coordination.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Mobile Phone Number <span className="text-rose-500">*</span>
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
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Preferred Calling Time <span className="text-rose-500">*</span>
                </label>
                <select
                  name="preferredCallingTime"
                  value={formData.preferredCallingTime}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                >
                  <option value="Anytime">Anytime</option>
                  <option value="Morning">Morning (9 AM - 12 PM)</option>
                  <option value="Afternoon">Afternoon (12 PM - 4 PM)</option>
                  <option value="Evening">Evening (4 PM - 8 PM)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Tutoring Specialization & Preferences (COMPULSORY) */}
          <div className="bg-white rounded-2xl border-2 border-amber-400/50 p-5 sm:p-6 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-amber-100">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center font-bold">
                  <FaBookOpen size={17} />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">
                    Tutoring Specialization & Preferences
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Specify your subjects, boards, target entrance exams, fees, and schedule
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                Compulsory *
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Subjects */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Subjects Taught (comma separated) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="subjects"
                  required
                  value={formData.subjects}
                  onChange={handleChange}
                  placeholder="Comma-separated (e.g. Physics, Chemistry, Mathematics)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                />
                <p className="text-[10px] text-slate-400 mt-1">Comma-separated (e.g. Physics, Chemistry, Mathematics)</p>
              </div>

              {/* Target Exams */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Exams Specialized (comma separated) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="exams"
                  required
                  value={formData.exams}
                  onChange={handleChange}
                  placeholder="Comma-separated target entrance/board exams"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                />
                <p className="text-[10px] text-slate-400 mt-1">Comma-separated target entrance/board exams</p>
              </div>

              {/* Board */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Board <span className="text-rose-500">*</span>
                </label>
                <select
                  name="board"
                  required
                  value={formData.board}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
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
                  Tuition Mode <span className="text-rose-500">*</span>
                </label>
                <select
                  name="teachingMode"
                  required
                  value={formData.teachingMode}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 uppercase"
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
                  Budget / Rate <span className="text-rose-500 ml-0.5">*</span>
                </label>
                <input
                  type="number"
                  name="feeAmount"
                  required
                  value={formData.feeAmount}
                  onChange={handleChange}
                  placeholder="3000"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                />
              </div>

              {/* Fee Frequency */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Fee Frequency <span className="text-rose-500">*</span>
                </label>
                <select
                  name="feePeriod"
                  required
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
                  Preferred Time <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="preferredTime"
                  required
                  value={formData.preferredTime}
                  onChange={handleChange}
                  placeholder="After 4"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                />
              </div>

              {/* Days per Week */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Days per Week <span className="text-rose-500">*</span>
                </label>
                <select
                  name="daysPerWeek"
                  required
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
                  Tutor Gender <span className="text-rose-500">*</span>
                </label>
                <select
                  name="tutorGender"
                  required
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
                  Student Gender <span className="text-rose-500">*</span>
                </label>
                <select
                  name="studentGender"
                  required
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

          {/* Section 3: Location & Coverage (Prayagraj) (COMPULSORY) */}
          <div className="bg-white rounded-2xl border-2 border-emerald-400/50 p-5 sm:p-6 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-emerald-100">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-800 flex items-center justify-center font-bold">
                  <FaMapMarkerAlt size={17} />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">
                    Location & Coverage (Prayagraj)
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Your teaching district, locality, and area pin code in Prayagraj
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
                Compulsory *
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* District */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center">
                  <FaMapMarkerAlt className="text-amber-500 mr-1" />
                  District <span className="text-rose-500 ml-0.5">*</span>
                </label>
                <select
                  name="city"
                  required
                  value={formData.city}
                  onChange={(e) => {
                    const newCity = e.target.value;
                    const defaultArea = (DISTRICT_AREAS[newCity] && DISTRICT_AREAS[newCity][0]) || '';
                    setFormData(prev => ({
                      ...prev,
                      city: newCity,
                      area: defaultArea
                    }));
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                >
                  {DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Area / Locality */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center">
                  <FaMapMarkerAlt className="text-amber-500 mr-1" />
                  Area / Locality <span className="text-rose-500 ml-0.5">*</span>
                </label>
                <select
                  name="area"
                  required
                  value={formData.area}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                >
                  <option value="">Select Locality...</option>
                  {availableAreas.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              {/* Pincode */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Pincode <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="pincode"
                  required
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="e.g. 211001"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Identity Verification (COMPULSORY) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <FaIdCard size={18} />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">
                    {t('verification.stepIdentity', 'Identity Verification')}
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Government identity document (Aadhaar, PAN, Voter ID)
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-200">
                Compulsory *
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t('verification.idType', 'Government ID Type')} <span className="text-rose-500">*</span>
                </label>
                <select
                  name="idType"
                  required
                  value={formData.idType}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                >
                  <option value="aadhaar">Aadhaar Card</option>
                  <option value="pan">PAN Card</option>
                  <option value="voter_id">Voter ID</option>
                  <option value="driving_license">Driving License</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t('verification.idNumber', 'ID Number')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="idNumber"
                  required
                  value={formData.idNumber}
                  onChange={handleChange}
                  placeholder={formData.idType === 'aadhaar' ? '12-digit Aadhaar Number' : 'ID Number'}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t('verification.uploadIdDoc', 'Upload ID Document')} <span className="text-rose-500">*</span>
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

          {/* Section 5: Highest Qualification & Degree (COMPULSORY) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                  <FaGraduationCap size={18} />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">
                    Highest Qualification & Academic Degree
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    College degree or graduation certificate proving subject expertise
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-200">
                Compulsory *
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Highest Degree <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="highestDegree"
                  required
                  value={formData.highestDegree}
                  onChange={handleChange}
                  placeholder="e.g. M.Sc Mathematics, B.Tech, M.A."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  University / College <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="university"
                  required
                  value={formData.university}
                  onChange={handleChange}
                  placeholder="e.g. Allahabad University / IIT / BHU"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Year of Passing <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="yearOfPassing"
                  required
                  value={formData.yearOfPassing}
                  onChange={handleChange}
                  placeholder="e.g. 2020"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Upload Degree Certificate / Marksheet <span className="text-rose-500">*</span>
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

          {/* Helpful Callout for Optional Settings moved to Profile Section */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-100/80 border border-slate-200 flex items-start space-x-3.5 text-xs text-slate-600">
            <FiInfo className="text-amber-600 text-lg mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-slate-800">
                Looking to add extra certifications, demo video lectures, or reference contacts?
              </p>
              <p className="mt-0.5 text-slate-500">
                Optional items (CTET/B.Ed certificates, coaching institute history, demo video lecture links, and reference contacts) are conveniently managed in your{' '}
                <Link to="/profile" className="text-amber-600 font-bold hover:underline">
                  Educator Profile
                </Link>{' '}
                section without blocking your verification badge.
              </p>
            </div>
          </div>

          {/* Submission and Skip Actions */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-slate-900">
                Submit Credential Verification
              </p>
              <p className="text-[11px] text-slate-500">
                You can save and continue, or skip this step to verify later.
              </p>
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleSkip}
                disabled={skipping || submitting}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
              >
                {skipping ? '...' : t('verification.skipBtn', 'Skip for Now')}
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="flex-1 sm:flex-none px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all hover:scale-[1.01] disabled:opacity-50 cursor-pointer"
              >
                {submitting ? 'Submitting Verification...' : 'Submit Verification Details'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherVerification;
