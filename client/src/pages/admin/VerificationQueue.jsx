import React, { useState, useEffect, useContext } from 'react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import {
  FaCheckCircle, FaTimesCircle, FaClock, FaPhoneAlt, FaEnvelope,
  FaFilePdf, FaExternalLinkAlt, FaSearch, FaFilter, FaAward,
  FaGraduationCap, FaIdCard, FaBuilding, FaVideo, FaUserCheck,
  FaTimes, FaSave, FaExclamationTriangle, FaUserFriends, FaWhatsapp,
  FaChalkboardTeacher, FaUserGraduate, FaCopy, FaCheck, FaMapMarkerAlt,
  FaBookOpen, FaRupeeSign
} from 'react-icons/fa';
import { FiChevronRight, FiEye } from 'react-icons/fi';
import { NotificationContext } from '../../context/NotificationContext';

const VerificationQueue = () => {
  const { markAdminSectionViewed } = useContext(NotificationContext);
  const [activeRole, setActiveRole] = useState('teacher'); // 'teacher' | 'student'
  const [loading, setLoading] = useState(true);

  // Teachers State
  const [teachers, setTeachers] = useState([]);
  const [teacherCounts, setTeacherCounts] = useState({ pending: 0, verified: 0, rejected: 0, unverified: 0, total: 0 });

  // Students State
  const [students, setStudents] = useState([]);
  const [studentCounts, setStudentCounts] = useState({ pending: 0, verified: 0, rejected: 0, total: 0 });

  const [statusFilter, setStatusFilter] = useState('pending');
  const [search, setSearch] = useState('');

  // Modals state
  const [previewDoc, setPreviewDoc] = useState(null); // { url, title, type }
  const [rejectModal, setRejectModal] = useState({ isOpen: false, target: null, role: 'teacher', reason: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

  // Admin notes local edit state { [id]: notes }
  const [notesState, setNotesState] = useState({});

  const copyToClipboard = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(`Copied: ${text}`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const fetchQueue = async () => {
    setLoading(true);
    markAdminSectionViewed('verifications');
    try {
      if (activeRole === 'teacher') {
        const res = await api.get('/admin/verifications', {
          params: { status: statusFilter, search }
        });
        setTeachers(res.data.teachers || []);
        setTeacherCounts(res.data.counts || {});

        const initialNotes = {};
        (res.data.teachers || []).forEach(t => {
          initialNotes[t._id] = t.adminVerificationNotes || '';
        });
        setNotesState(initialNotes);
      } else {
        const res = await api.get('/admin/student-verifications', {
          params: { status: statusFilter, search }
        });
        setStudents(res.data.students || []);
        setStudentCounts(res.data.counts || {});

        const initialNotes = {};
        (res.data.students || []).forEach(s => {
          initialNotes[s._id] = s.adminVerificationNotes || '';
        });
        setNotesState(initialNotes);
      }
    } catch (err) {
      toast.error('Failed to load verification queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [activeRole, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchQueue();
  };

  // TEACHER ACTIONS
  const handleApproveTeacher = async (teacher) => {
    if (!window.confirm(`Approve verification and grant Verified Badge to ${teacher.userId?.name}?`)) {
      return;
    }
    setActionLoading(true);
    try {
      const currentNotes = notesState[teacher._id] || '';
      const res = await api.patch(`/admin/verifications/${teacher._id}/approve`, { notes: currentNotes });
      toast.success(res.data.message || 'Teacher approved successfully!');
      fetchQueue();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve teacher');
    } finally {
      setActionLoading(false);
    }
  };

  // STUDENT ACTIONS
  const handleApproveStudent = async (student) => {
    if (!window.confirm(`Approve contact verification for ${student.userId?.name}? This will unlock direct teacher requests.`)) {
      return;
    }
    setActionLoading(true);
    try {
      const currentNotes = notesState[student._id] || '';
      const res = await api.patch(`/admin/student-verifications/${student._id}/approve`, { notes: currentNotes });
      toast.success(res.data.message || 'Student / Parent verified successfully!');
      fetchQueue();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve student');
    } finally {
      setActionLoading(false);
    }
  };

  // REJECT MODAL
  const handleOpenRejectModal = (item, role) => {
    setRejectModal({
      isOpen: true,
      target: item,
      role,
      reason: role === 'teacher'
        ? (item.rejectionReason || 'Document details could not be verified or were unreadable. Please upload clearer copies.')
        : (item.rejectionReason || 'Could not reach or verify student/parent details over phone or email. Please provide active contact numbers.')
    });
  };

  const handleConfirmReject = async () => {
    if (!rejectModal.target) return;
    setActionLoading(true);
    try {
      const currentNotes = notesState[rejectModal.target._id] || '';
      if (rejectModal.role === 'teacher') {
        const res = await api.patch(`/admin/verifications/${rejectModal.target._id}/reject`, {
          reason: rejectModal.reason,
          notes: currentNotes
        });
        toast.success(res.data.message || 'Teacher verification rejected.');
      } else {
        const res = await api.patch(`/admin/student-verifications/${rejectModal.target._id}/reject`, {
          reason: rejectModal.reason,
          notes: currentNotes
        });
        toast.success(res.data.message || 'Student verification rejected.');
      }
      setRejectModal({ isOpen: false, target: null, role: 'teacher', reason: '' });
      fetchQueue();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject verification');
    } finally {
      setActionLoading(false);
    }
  };

  // SAVE NOTES
  const handleSaveNotes = async (id, role) => {
    try {
      const notes = notesState[id] || '';
      if (role === 'teacher') {
        await api.patch(`/admin/verifications/${id}/notes`, { notes });
      } else {
        await api.patch(`/admin/student-verifications/${id}/notes`, { notes });
      }
      toast.success('Admin notes saved successfully');
    } catch (err) {
      toast.error('Failed to save notes');
    }
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'verified':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <FaCheckCircle className="mr-1 text-emerald-600" /> Verified
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <FaTimesCircle className="mr-1 text-rose-600" /> Rejected
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <FaClock className="mr-1 text-amber-600" /> Pending Review
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            Unverified
          </span>
        );
    }
  };

  const currentCounts = activeRole === 'teacher' ? teacherCounts : studentCounts;

  return (
    <div className="space-y-6">
      {/* Top Role Selector */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-2xl">
          <button
            type="button"
            onClick={() => { setActiveRole('teacher'); setStatusFilter('pending'); }}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center space-x-2 transition-all cursor-pointer ${
              activeRole === 'teacher'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FaChalkboardTeacher size={14} className={activeRole === 'teacher' ? 'text-amber-600' : 'text-slate-400'} />
            <span>Teachers Queue</span>
            {teacherCounts.pending > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950">
                {teacherCounts.pending}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => { setActiveRole('student'); setStatusFilter('pending'); }}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center space-x-2 transition-all cursor-pointer ${
              activeRole === 'student'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FaUserGraduate size={14} className={activeRole === 'student' ? 'text-emerald-600' : 'text-slate-400'} />
            <span>Students & Parents Queue</span>
            {studentCounts.pending > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-white">
                {studentCounts.pending}
              </span>
            )}
          </button>
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={activeRole === 'teacher' ? "Search teacher, email, subject..." : "Search student, phone, class..."}
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Search
          </button>
        </form>
      </div>

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <span className={`p-2 rounded-xl ${activeRole === 'teacher' ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
              <FaAward size={20} />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {activeRole === 'teacher' ? 'Teacher Verification Queue' : 'Student & Parent Verification Queue'}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {activeRole === 'teacher'
              ? 'Review educator identity documents, qualifications, credentials, call teachers, and approve or reject with reasons.'
              : 'Contact registered students or parents via phone / WhatsApp / email to confirm their tuition requirements and unlock teacher outreach.'}
          </p>
        </div>
      </div>

      {/* Filter Tabs & Counts */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setStatusFilter('pending')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
            statusFilter === 'pending'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <span>Pending Review</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
            statusFilter === 'pending' ? 'bg-slate-950/20 text-slate-950' : 'bg-amber-100 text-amber-800'
          }`}>
            {currentCounts.pending || 0}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter('verified')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
            statusFilter === 'verified'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <span>Verified Profiles</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
            statusFilter === 'verified' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
          }`}>
            {currentCounts.verified || 0}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter('rejected')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
            statusFilter === 'rejected'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <span>Rejected</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
            statusFilter === 'rejected' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-800'
          }`}>
            {currentCounts.rejected || 0}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <span>All Profiles</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
            statusFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
          }`}>
            {currentCounts.total || 0}
          </span>
        </button>
      </div>

      {/* Main List */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : activeRole === 'student' ? (
        // STUDENT QUEUE LIST
        students.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <FaCheckCircle className="mx-auto text-emerald-400 text-4xl mb-3" />
            <h3 className="text-base font-bold text-slate-800">
              No students found in {statusFilter} queue
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {statusFilter === 'pending'
                ? 'All pending student and parent verifications have been completed.'
                : 'Try choosing another tab or clearing search filters.'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {students.map((student) => {
              const user = student.userId || {};
              const isVerified = student.isVerified || student.verificationStatus === 'verified';
              const isPending = student.verificationStatus === 'pending' || (!isVerified && student.contactVerified);
              const phoneToContact = student.verificationPhone || user.phone || '';
              const cleanPhone = phoneToContact.replace(/[^0-9]/g, '');
              const emailToContact = student.verificationEmail || user.email || '';

              return (
                <div
                  key={student._id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-emerald-400/80 transition-all overflow-hidden"
                >
                  {/* Top Bar */}
                  <div className="p-5 sm:p-6 bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-3.5">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black flex items-center justify-center text-lg shadow-sm flex-shrink-0">
                        {user.name?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h2 className="text-base font-bold text-slate-900">
                            {user.name || 'Unnamed Learner'}
                          </h2>
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900">
                            {student.studentOrParentRole === 'parent' ? 'Parent / Guardian' : 'Student'}
                          </span>
                          {student.jobId && (
                            <span className="text-[10px] font-mono bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md">
                              {student.jobId}
                            </span>
                          )}
                          {getStatusBadge(student.verificationStatus)}
                        </div>

                        <div className="flex items-center space-x-3 text-xs text-slate-500 mt-1 flex-wrap">
                          <span>City: <strong className="text-slate-700">{student.location?.city || 'Prayagraj'}</strong></span>
                          {student.area && <span>Area: <strong className="text-slate-700">{student.area}</strong></span>}
                          {student.verificationSubmittedAt && (
                            <span className="text-slate-400">
                              Submitted: {new Date(student.verificationSubmittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          )}
                          {student.verifiedAt && (
                            <span className="text-emerald-700 font-semibold">
                              Verified: {new Date(student.verifiedAt).toLocaleDateString('en-IN')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Direct Contact Buttons */}
                    <div className="flex items-center space-x-2 flex-wrap">
                      {phoneToContact && (
                        <>
                          <a
                            href={`tel:${phoneToContact}`}
                            className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-bold transition-colors"
                            title="Call Phone"
                          >
                            <FaPhoneAlt className="mr-1.5 text-[11px]" />
                            Call
                          </a>
                          <a
                            href={`https://wa.me/91${cleanPhone.slice(-10)}?text=${encodeURIComponent(`Hello ${user.name || ''}, this is the ToppScorers verification team regarding your tuition requirement.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-bold transition-colors"
                            title="WhatsApp"
                          >
                            <FaWhatsapp className="mr-1.5 text-xs text-emerald-600" />
                            WhatsApp
                          </a>
                        </>
                      )}

                      {emailToContact && (
                        <a
                          href={`mailto:${emailToContact}?subject=${encodeURIComponent('ToppScorers Account Verification')}`}
                          className="inline-flex items-center px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-bold transition-colors"
                          title="Send Email"
                        >
                          <FaEnvelope className="mr-1.5 text-[11px]" />
                          Email
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Col 1: Contact & Address Verification */}
                    <div className="space-y-3.5">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                        1. Contact Information
                      </h4>

                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Phone:</span>
                          <div className="flex items-center space-x-1.5 font-bold text-slate-900">
                            <span>{phoneToContact || 'None provided'}</span>
                            {phoneToContact && (
                              <button
                                type="button"
                                onClick={() => copyToClipboard(phoneToContact, `p-${student._id}`)}
                                className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                                title="Copy Phone"
                              >
                                {copiedKey === `p-${student._id}` ? <FaCheck className="text-emerald-500" size={11} /> : <FaCopy size={11} />}
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Email:</span>
                          <div className="flex items-center space-x-1.5 font-bold text-slate-900">
                            <span className="truncate max-w-[150px]">{emailToContact || 'None provided'}</span>
                            {emailToContact && (
                              <button
                                type="button"
                                onClick={() => copyToClipboard(emailToContact, `e-${student._id}`)}
                                className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                                title="Copy Email"
                              >
                                {copiedKey === `e-${student._id}` ? <FaCheck className="text-emerald-500" size={11} /> : <FaCopy size={11} />}
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                          <span className="text-slate-500">Full Address:</span>
                          <span className="font-semibold text-slate-800 text-right truncate max-w-[180px]">
                            {student.fullAddress || student.area || student.location?.city || 'Not specified'}
                          </span>
                        </div>
                      </div>

                      {student.rejectionReason && (
                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                          <strong className="block mb-0.5 font-bold">Previous Rejection Reason:</strong>
                          <span>{student.rejectionReason}</span>
                        </div>
                      )}
                    </div>

                    {/* Col 2: Academic & Tuition Needs */}
                    <div className="space-y-3.5">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                        2. Tuition Requirement
                      </h4>

                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Class / Exam:</span>
                          <span className="font-extrabold text-slate-900 bg-amber-50 text-amber-900 px-2 py-0.5 rounded-md border border-amber-200">
                            {student.classOrExam || 'Not specified'}
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-500 block mb-1">Subjects Needed:</span>
                          <div className="flex flex-wrap gap-1">
                            {student.subjectsNeeded?.length > 0 ? (
                              student.subjectsNeeded.map((subj, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-white border border-slate-200 rounded-md text-[11px] font-bold text-slate-800">
                                  {subj}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-400 text-[11px]">None specified</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                          <span className="text-slate-500">Timing & Mode:</span>
                          <span className="font-semibold text-slate-800">
                            {student.preferredTiming || 'Evening'} ({student.preferences?.mode || 'Offline / Home'})
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Budget:</span>
                          <span className="font-black text-emerald-700">
                            ₹{student.budget?.min || 1000} – ₹{student.budget?.max || 5000} / {student.budget?.period || 'month'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Col 3: Admin Call Notes & Actions */}
                    <div className="space-y-3.5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                            3. Admin Call Notes
                          </h4>
                          <button
                            type="button"
                            onClick={() => handleSaveNotes(student._id, 'student')}
                            className="inline-flex items-center text-[11px] font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                          >
                            <FaSave className="mr-1 text-slate-400" /> Save
                          </button>
                        </div>
                        <textarea
                          rows={3}
                          value={notesState[student._id] || ''}
                          onChange={(e) => setNotesState({ ...notesState, [student._id]: e.target.value })}
                          placeholder="e.g. Called parent on 15 Oct. Confirmed requirement for Class 10 ICSE Physics in Civil Lines..."
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-amber-400 focus:outline-none"
                        />
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => handleOpenRejectModal(student, 'student')}
                          disabled={actionLoading}
                          className="flex-1 py-2 px-3 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApproveStudent(student)}
                          disabled={actionLoading}
                          className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center justify-center space-x-1"
                        >
                          <FaCheckCircle className="mr-1" />
                          <span>Approve & Verify</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        // TEACHERS QUEUE LIST
        teachers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <FaCheckCircle className="mx-auto text-emerald-400 text-4xl mb-3" />
            <h3 className="text-base font-bold text-slate-800">
              No teachers found in {statusFilter} queue
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {statusFilter === 'pending'
                ? 'All pending verification submissions have been reviewed! Excellent work.'
                : 'Try choosing another tab or clearing search filters.'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {teachers.map((teacher) => {
              const user = teacher.userId || {};
              const isVerified = teacher.verificationStatus === 'verified';
              const isPending = teacher.verificationStatus === 'pending';
              const phoneToContact = teacher.verificationPhone || user.phone || '';
              const cleanPhone = phoneToContact.replace(/[^0-9]/g, '');

              return (
                <div
                  key={teacher._id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-amber-400/80 transition-all overflow-hidden"
                >
                  {/* Header Row */}
                  <div className="p-5 sm:p-6 bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-3.5">
                      {user.avatar || teacher.profilePhotoUrl ? (
                        <img
                          src={user.avatar || teacher.profilePhotoUrl}
                          alt={user.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-lg">
                          {user.name?.charAt(0) || 'T'}
                        </div>
                      )}

                      <div>
                        <div className="flex items-center space-x-2">
                          <h2 className="text-base font-bold text-slate-900">
                            {user.name || 'Unnamed Teacher'}
                          </h2>
                          {getStatusBadge(teacher.verificationStatus)}
                        </div>
                        <div className="flex items-center space-x-3 text-xs text-slate-500 mt-1 flex-wrap">
                          <span className="flex items-center">
                            <FaEnvelope className="mr-1 text-slate-400 text-[10px]" />
                            {user.email || 'No email'}
                          </span>
                          {phoneToContact && (
                            <a
                              href={`tel:${phoneToContact}`}
                              className="flex items-center text-amber-700 hover:text-amber-800 font-bold"
                            >
                              <FaPhoneAlt className="mr-1 text-[10px]" />
                              {phoneToContact}
                            </a>
                          )}
                          <span>
                            City: {teacher.location?.city || 'India'}
                          </span>
                          {teacher.verificationSubmittedAt && (
                            <span className="text-slate-400">
                              Submitted: {new Date(teacher.verificationSubmittedAt).toLocaleDateString('en-IN')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Top Action Buttons */}
                    <div className="flex items-center space-x-2 flex-wrap">
                      {phoneToContact && (
                        <>
                          <a
                            href={`tel:${phoneToContact}`}
                            className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-bold transition-colors"
                            title="Call Teacher"
                          >
                            <FaPhoneAlt className="mr-1.5 text-[11px]" />
                            Call
                          </a>
                          <a
                            href={`https://wa.me/91${cleanPhone.slice(-10)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-bold transition-colors"
                            title="WhatsApp Teacher"
                          >
                            <FaWhatsapp className="mr-1.5 text-xs text-emerald-600" />
                            WhatsApp
                          </a>
                        </>
                      )}

                      {!isVerified && (
                        <button
                          type="button"
                          onClick={() => handleApproveTeacher(teacher)}
                          disabled={actionLoading}
                          className="inline-flex items-center px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          <FaCheckCircle className="mr-1 text-xs" />
                          Approve & Verify
                        </button>
                      )}

                      {teacher.verificationStatus !== 'rejected' && (
                        <button
                          type="button"
                          onClick={() => handleOpenRejectModal(teacher, 'teacher')}
                          disabled={actionLoading}
                          className="inline-flex items-center px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          <FaTimesCircle className="mr-1 text-xs" />
                          Reject
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Teacher Details Grid */}
                  <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Column 1: Qualifications & Degree */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                        1. Academic Credentials
                      </h4>
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Degree:</span>
                          <span className="font-bold text-slate-800">
                            {teacher.degreeDetails?.highestDegree || 'Not provided'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">University:</span>
                          <span className="font-semibold text-slate-700">
                            {teacher.degreeDetails?.university || 'Not provided'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Passing Year:</span>
                          <span className="font-semibold text-slate-700">
                            {teacher.degreeDetails?.yearOfPassing || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Column 2: Subjects & Experience */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                        2. Teaching Details
                      </h4>
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Experience:</span>
                          <span className="font-bold text-slate-800">
                            {teacher.experience ? `${teacher.experience} Years` : 'Fresher'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block mb-1">Subjects:</span>
                          <div className="flex flex-wrap gap-1">
                            {teacher.subjects?.map((sub, idx) => (
                              <span key={idx} className="px-2 py-0.5 bg-white border border-slate-200 rounded-md text-[11px] font-bold text-slate-800">
                                {sub}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                          <span className="text-slate-500">Rate:</span>
                          <span className="font-bold text-emerald-700">
                            ₹{teacher.fee?.amount || 0} / {teacher.fee?.period || 'hour'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Column 3: Admin Notes */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                          3. Admin Notes
                        </h4>
                        <button
                          type="button"
                          onClick={() => handleSaveNotes(teacher._id, 'teacher')}
                          className="inline-flex items-center text-[11px] font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                        >
                          <FaSave className="mr-1 text-slate-400" /> Save
                        </button>
                      </div>
                      <textarea
                        rows={4}
                        value={notesState[teacher._id] || ''}
                        onChange={(e) => setNotesState({ ...notesState, [teacher._id]: e.target.value })}
                        placeholder="e.g. Called teacher on 12 Oct. Background confirmed, verified B.Sc degree."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Reject Reason Modal */}
      {rejectModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-fadeInUp">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-slate-100 relative">
            <button
              onClick={() => setRejectModal({ isOpen: false, target: null, role: 'teacher', reason: '' })}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
            >
              <FaTimes size={18} />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
                <FaExclamationTriangle size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Reject {rejectModal.role === 'teacher' ? 'Teacher' : 'Student'} Verification
                </h3>
                <p className="text-xs text-slate-500">
                  {rejectModal.target?.userId?.name}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Reason for Rejection (Displayed on their Dashboard)
              </label>
              <textarea
                rows={3}
                value={rejectModal.reason}
                onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
                placeholder="e.g. Phone number was not reachable, invalid email address..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                The user will see this reason on their dashboard and can update their details to resubmit.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setRejectModal({ isOpen: false, target: null, role: 'teacher', reason: '' })}
                className="flex-1 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={actionLoading}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer"
              >
                {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationQueue;
