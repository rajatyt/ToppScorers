import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import {
  FaCheckCircle, FaTimesCircle, FaClock, FaPhoneAlt, FaEnvelope,
  FaFilePdf, FaExternalLinkAlt, FaSearch, FaFilter, FaAward,
  FaGraduationCap, FaIdCard, FaBuilding, FaVideo, FaUserCheck,
  FaTimes, FaSave, FaExclamationTriangle, FaUserFriends, FaWhatsapp
} from 'react-icons/fa';
import { FiChevronRight, FiEye } from 'react-icons/fi';

const VerificationQueue = () => {
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState([]);
  const [counts, setCounts] = useState({ pending: 0, verified: 0, rejected: 0, unverified: 0, total: 0 });
  const [statusFilter, setStatusFilter] = useState('pending');
  const [search, setSearch] = useState('');

  // Modals state
  const [previewDoc, setPreviewDoc] = useState(null); // { url, title, type }
  const [rejectModal, setRejectModal] = useState({ isOpen: false, teacher: null, reason: '' });
  const [actionLoading, setActionLoading] = useState(false);

  // Admin notes local edit state { [teacherId]: notes }
  const [notesState, setNotesState] = useState({});

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/verifications', {
        params: { status: statusFilter, search }
      });
      setTeachers(res.data.teachers || []);
      setCounts(res.data.counts || {});

      // Initialize notes
      const initialNotes = {};
      (res.data.teachers || []).forEach(t => {
        initialNotes[t._id] = t.adminVerificationNotes || '';
      });
      setNotesState(initialNotes);
    } catch (err) {
      toast.error('Failed to load verification queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchQueue();
  };

  const handleApprove = async (teacher) => {
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

  const handleOpenRejectModal = (teacher) => {
    setRejectModal({
      isOpen: true,
      teacher,
      reason: teacher.rejectionReason || 'Document details could not be verified or were unreadable. Please upload clearer copies.'
    });
  };

  const handleConfirmReject = async () => {
    if (!rejectModal.teacher) return;
    setActionLoading(true);
    try {
      const currentNotes = notesState[rejectModal.teacher._id] || '';
      const res = await api.patch(`/admin/verifications/${rejectModal.teacher._id}/reject`, {
        reason: rejectModal.reason,
        notes: currentNotes
      });
      toast.success(res.data.message || 'Teacher verification rejected with reason.');
      setRejectModal({ isOpen: false, teacher: null, reason: '' });
      fetchQueue();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject verification');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveNotes = async (teacherId) => {
    try {
      const notes = notesState[teacherId] || '';
      await api.patch(`/admin/verifications/${teacherId}/notes`, { notes });
      toast.success('Notes saved successfully');
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
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <FaClock className="mr-1 text-amber-600 animate-spin-slow" /> Pending Review
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <FaTimesCircle className="mr-1 text-rose-600" /> Rejected
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
              <FaAward size={20} />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Teacher Verification Queue
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review educator identity documents, qualifications, credentials, call teachers, and approve or reject with reasons.
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2">
          <div className="relative">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search teacher, email, subject..."
              className="pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs w-64 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Filter Tabs & Counts */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setStatusFilter('pending')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
            statusFilter === 'pending'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <span>Pending Review</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
            statusFilter === 'pending' ? 'bg-slate-950/20 text-slate-950' : 'bg-amber-100 text-amber-800'
          }`}>
            {counts.pending}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter('verified')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
            statusFilter === 'verified'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <span>Verified Teachers</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
            statusFilter === 'verified' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
          }`}>
            {counts.verified}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter('rejected')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
            statusFilter === 'rejected'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <span>Rejected</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
            statusFilter === 'rejected' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-800'
          }`}>
            {counts.rejected}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
            statusFilter === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <span>All Profiles</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
            statusFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
          }`}>
            {counts.total}
          </span>
        </button>
      </div>

      {/* Teachers Queue List */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : teachers.length === 0 ? (
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
                          href={`https://wa.me/${cleanPhone}`}
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
                    <button
                      onClick={() => handleApprove(teacher)}
                      disabled={actionLoading}
                      className="inline-flex items-center px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50"
                    >
                      <FaCheckCircle className="mr-1.5 text-xs" />
                      Approve & Grant Badge
                    </button>
                    <button
                      onClick={() => handleOpenRejectModal(teacher)}
                      disabled={actionLoading}
                      className="inline-flex items-center px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                    >
                      <FaTimesCircle className="mr-1.5 text-xs" />
                      Reject
                    </button>
                  </div>
                </div>

                {/* Coordinator Physical Tuition & Contact Bar */}
                <div className="px-5 py-3 bg-amber-50/70 border-b border-amber-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                    <span className="font-bold text-amber-950">
                      Coordinator Mediation Phone:
                    </span>
                    <span className="font-mono font-bold text-amber-900 bg-white/80 px-2 py-0.5 rounded-md border border-amber-200">
                      {phoneToContact || 'Not provided'}
                    </span>
                    {teacher.preferredCallingTime && (
                      <span className="text-[11px] text-amber-800">
                        (Preferred: <strong>{teacher.preferredCallingTime}</strong>)
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-amber-900/80 italic">
                    🔒 Kept 100% private in frontend app — platform coordinates all physical tuitions
                  </span>
                </div>

                {/* Body Details Grid */}
                <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Column 1: Identity & Degree */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center">
                        <FaIdCard className="text-amber-500 mr-1.5" />
                        Govt Identity
                      </h4>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
                        <div>
                          <span className="text-slate-400 font-medium">Type: </span>
                          <span className="font-semibold text-slate-800 uppercase">
                            {teacher.govtId?.idType || 'Not specified'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-medium">ID Number: </span>
                          <span className="font-semibold text-slate-800">
                            {teacher.govtId?.idNumber || 'None / NA'}
                          </span>
                        </div>
                        {teacher.govtId?.documentUrl ? (
                          <button
                            type="button"
                            onClick={() => setPreviewDoc({
                              url: teacher.govtId.documentUrl,
                              title: `${user.name} - Govt ID (${teacher.govtId.idType})`
                            })}
                            className="mt-1 inline-flex items-center text-xs font-bold text-amber-700 hover:text-amber-800 underline"
                          >
                            <FiEye className="mr-1" /> View ID Document
                          </button>
                        ) : (
                          <span className="text-slate-400 italic block text-[11px]">No ID file attached</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center">
                        <FaGraduationCap className="text-blue-500 mr-1.5" />
                        Highest Degree
                      </h4>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
                        <div>
                          <span className="text-slate-400 font-medium">Degree: </span>
                          <span className="font-semibold text-slate-800">
                            {teacher.degreeDetails?.highestDegree || 'Not specified'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-medium">University: </span>
                          <span className="font-semibold text-slate-800">
                            {teacher.degreeDetails?.university || 'Not specified'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-medium">Year: </span>
                          <span className="font-semibold text-slate-800">
                            {teacher.degreeDetails?.yearOfPassing || 'NA'}
                          </span>
                        </div>
                        {teacher.degreeDetails?.degreeDocumentUrl ? (
                          <button
                            type="button"
                            onClick={() => setPreviewDoc({
                              url: teacher.degreeDetails.degreeDocumentUrl,
                              title: `${user.name} - Degree Certificate`
                            })}
                            className="mt-1 inline-flex items-center text-xs font-bold text-blue-700 hover:text-blue-800 underline"
                          >
                            <FiEye className="mr-1" /> View Degree File
                          </button>
                        ) : (
                          <span className="text-slate-400 italic block text-[11px]">No degree file attached</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Certification & Institute */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center">
                        <FaAward className="text-purple-500 mr-1.5" />
                        Teaching Certification
                      </h4>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
                        <div>
                          <span className="text-slate-400 font-medium">Cert: </span>
                          <span className="font-semibold text-slate-800">
                            {teacher.certificationDetails?.certificationName || 'NA'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-medium">Roll / No: </span>
                          <span className="font-semibold text-slate-800">
                            {teacher.certificationDetails?.rollOrCertNumber || 'NA'}
                          </span>
                        </div>
                        {teacher.certificationDetails?.certificateDocumentUrl ? (
                          <button
                            type="button"
                            onClick={() => setPreviewDoc({
                              url: teacher.certificationDetails.certificateDocumentUrl,
                              title: `${user.name} - Teaching Certification`
                            })}
                            className="mt-1 inline-flex items-center text-xs font-bold text-purple-700 hover:text-purple-800 underline"
                          >
                            <FiEye className="mr-1" /> View Certificate File
                          </button>
                        ) : (
                          <span className="text-slate-400 italic block text-[11px]">No cert document</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center">
                        <FaBuilding className="text-emerald-500 mr-1.5" />
                        Institute Association
                      </h4>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
                        <div>
                          <span className="text-slate-400 font-medium">Institute: </span>
                          <span className="font-semibold text-slate-800">
                            {teacher.instituteDetails?.currentOrPastInstitute || 'None specified'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-medium">Designation: </span>
                          <span className="font-semibold text-slate-800">
                            {teacher.instituteDetails?.designation || 'Tutor'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-medium">Experience: </span>
                          <span className="font-semibold text-slate-800">
                            {teacher.experience || 0} Years
                          </span>
                        </div>
                        {teacher.instituteDetails?.instituteDocumentUrl && (
                          <button
                            type="button"
                            onClick={() => setPreviewDoc({
                              url: teacher.instituteDetails.instituteDocumentUrl,
                              title: `${user.name} - Institute ID / Offer Document`
                            })}
                            className="mt-1 inline-flex items-center text-xs font-bold text-emerald-700 hover:text-emerald-800 underline"
                          >
                            <FiEye className="mr-1" /> View Institute ID Doc
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Column 3: Proof, Reference & Admin Notes */}
                  <div className="space-y-4">
                    {/* Demo video & Subjects */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1.5">
                      <div className="font-bold text-slate-800 uppercase text-[11px] mb-1">
                        Teaching Profile Snapshot
                      </div>
                      <div>
                        <span className="text-slate-400">Subjects: </span>
                        <span className="font-semibold text-slate-700">
                          {teacher.subjects?.join(', ') || 'General'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">Exams: </span>
                        <span className="font-semibold text-slate-700">
                          {teacher.exams?.join(', ') || 'Boards'}
                        </span>
                      </div>
                      {teacher.demoVideoUrl && (
                        <div className="pt-1">
                          <a
                            href={teacher.demoVideoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-xs text-rose-600 hover:text-rose-700 font-bold underline"
                          >
                            <FaVideo className="mr-1" /> Watch Demo Lecture Video
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Reference Contact */}
                    {teacher.referenceContact?.name && (
                      <div className="bg-teal-50/70 p-3 rounded-xl border border-teal-200/60 text-xs space-y-1">
                        <div className="font-bold text-teal-950 flex items-center">
                          <FaUserFriends className="mr-1 text-teal-600" />
                          Reference Contact
                        </div>
                        <div>
                          <span className="text-teal-700 font-semibold">{teacher.referenceContact.name}</span>
                          <span className="text-teal-600 text-[11px]"> ({teacher.referenceContact.relation || 'Colleague'})</span>
                        </div>
                        {teacher.referenceContact.phone && (
                          <div>
                            <a
                              href={`tel:${teacher.referenceContact.phone}`}
                              className="text-teal-800 font-bold hover:underline flex items-center"
                            >
                              <FaPhoneAlt className="mr-1 text-[10px]" />
                              {teacher.referenceContact.phone}
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Admin Verification Notes Box */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                          Internal Admin Notes
                        </label>
                        <button
                          type="button"
                          onClick={() => handleSaveNotes(teacher._id)}
                          className="inline-flex items-center text-[10px] font-bold text-amber-700 hover:text-amber-900"
                        >
                          <FaSave className="mr-1" /> Save
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        value={notesState[teacher._id] || ''}
                        onChange={(e) => setNotesState({ ...notesState, [teacher._id]: e.target.value })}
                        placeholder="Log phone call results, reference verification notes, etc..."
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Existing Rejection Reason Alert if rejected */}
                {teacher.verificationStatus === 'rejected' && teacher.rejectionReason && (
                  <div className="mx-6 mb-5 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                    <strong>Current Rejection Reason:</strong> {teacher.rejectionReason}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Inline Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold truncate pr-4">
                {previewDoc.title}
              </h3>
              <div className="flex items-center space-x-2">
                <a
                  href={previewDoc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg transition-colors inline-flex items-center"
                >
                  <FaExternalLinkAlt className="mr-1 text-[10px]" />
                  Open in New Tab
                </a>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg"
                >
                  <FaTimes size={18} />
                </button>
              </div>
            </div>

            <div className="p-4 flex-1 overflow-auto bg-slate-100 flex items-center justify-center min-h-[400px]">
              {previewDoc.url.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={previewDoc.url}
                  title={previewDoc.title}
                  className="w-full h-[650px] border-none rounded-xl bg-white shadow-sm"
                />
              ) : (
                <img
                  src={previewDoc.url}
                  alt={previewDoc.title}
                  className="max-h-[650px] max-w-full object-contain rounded-xl shadow-md"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-slate-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <FaExclamationTriangle size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Reject Teacher Verification
                </h3>
                <p className="text-xs text-slate-500">
                  {rejectModal.teacher?.userId?.name}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Reason for Rejection (Displayed to Teacher)
              </label>
              <textarea
                rows={3}
                value={rejectModal.reason}
                onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
                placeholder="e.g. Uploaded degree copy was blurry, ID name does not match profile name..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                The teacher will see this reason on their dashboard and can update documents to resubmit.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setRejectModal({ isOpen: false, teacher: null, reason: '' })}
                className="flex-1 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={actionLoading}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50"
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
