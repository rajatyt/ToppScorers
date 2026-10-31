import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FiLink, FiPhone, FiMail, FiMessageSquare, FiCopy, FiCheckCircle, 
  FiClock, FiDollarSign, FiSearch, FiFilter, FiTrash2, FiSave, 
  FiRefreshCw, FiAlertCircle, FiUser, FiMapPin, FiExternalLink,
  FiChevronRight, FiCheck, FiX, FiCheckSquare, FiZap
} from 'react-icons/fi';
import { FaWhatsapp, FaHandshake, FaUserGraduate, FaChalkboardTeacher, FaTelegramPlane } from 'react-icons/fa';
import axios from '../../api/axios';
import toast from 'react-hot-toast';
import { DISTRICTS } from '../../utils/locationData';
import { NotificationContext } from '../../context/NotificationContext';

const LEAD_STATUS_OPTIONS = [
  { value: 'new', label: '🆕 New Lead (Uncontacted)', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'contacted_sender', label: '📞 Contacted Initiator', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { value: 'contacted_target', label: '📞 Contacted Recipient', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  { value: 'both_contacted', label: '🗣️ Both Parties Contacted', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { value: 'deal_finalized', label: '🤝 Deal Agreed / Connected', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { value: 'commission_received', label: '💰 Commission Received', color: 'bg-green-100 text-green-800 border-green-200' },
  { value: 'closed_declined', label: '❌ Closed / Not Interested', color: 'bg-rose-100 text-rose-800 border-rose-200' }
];

const COMMISSION_STATUS_OPTIONS = [
  { value: 'pending', label: '⏳ Pending Payment', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'partially_paid', label: '🟡 Partially Paid', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'paid_in_full', label: '✅ Paid in Full', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'waived', label: '⚪ Waived', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  { value: 'lost', label: '❌ Lost / Cancelled', color: 'bg-rose-50 text-rose-700 border-rose-200' }
];

const ConnectionManager = ({ defaultSection = 'all' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState(defaultSection);
  const [connections, setConnections] = useState([]);
  const [metrics, setMetrics] = useState({
    totalRequests: 0,
    studentToTeacherAccepted: 0,
    teacherToStudentAccepted: 0,
    totalAccepted: 0,
    newLeads: 0,
    inProgress: 0,
    dealsFinalized: 0,
    totalCommissionExpected: 0,
    totalCommissionReceived: 0
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterLeadStatus, setFilterLeadStatus] = useState('all');
  const [filterCommissionStatus, setFilterCommissionStatus] = useState('all');
  const [filterDistrict, setFilterDistrict] = useState('all');
  const [savingId, setSavingId] = useState(null);
  
  // Local edit states mapped by connection id
  const [editForms, setEditForms] = useState({});
  const [testingTelegram, setTestingTelegram] = useState(false);
  const { markAdminSectionViewed } = useContext(NotificationContext);

  const handleSendTelegramTest = async () => {
    try {
      setTestingTelegram(true);
      const res = await axios.post('/admin/telegram/test', { message: 'you first notifi' });
      toast.success(res.data?.message || 'Telegram test notification delivered!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send Telegram alert');
    } finally {
      setTestingTelegram(false);
    }
  };

  useEffect(() => {
    setActiveSection(defaultSection);
  }, [defaultSection]);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      // Mark viewed so WhatsApp/Instagram badge clears instantly
      markAdminSectionViewed('connections');
      const params = {};
      if (activeSection !== 'all') params.direction = activeSection;
      if (filterLeadStatus !== 'all') params.leadStatus = filterLeadStatus;
      if (filterCommissionStatus !== 'all') params.commissionStatus = filterCommissionStatus;
      if (filterDistrict !== 'all') params.district = filterDistrict;
      if (search.trim()) params.search = search.trim();

      const res = await axios.get('/admin/connections', { params });
      const items = res.data?.connections || [];
      setConnections(items);
      setMetrics(res.data?.metrics || {
        totalRequests: 0,
        studentToTeacherAccepted: 0,
        teacherToStudentAccepted: 0,
        totalAccepted: 0,
        newLeads: 0,
        inProgress: 0,
        dealsFinalized: 0,
        totalCommissionExpected: 0,
        totalCommissionReceived: 0
      });

      // Initialize form edits
      const initialEdits = {};
      items.forEach(c => {
        initialEdits[c._id] = {
          adminLeadStatus: c.adminLeadStatus || 'new',
          tuitionFee: c.tuitionFee || (c.fromProfile?.fee?.amount || c.toProfile?.fee?.amount || 0),
          commissionExpected: c.commissionExpected || 0,
          commissionReceived: c.commissionReceived || 0,
          commissionStatus: c.commissionStatus || 'pending',
          adminNotes: c.adminNotes || ''
        };
      });
      setEditForms(initialEdits);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch connection leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, [filterLeadStatus, filterCommissionStatus, filterDistrict, activeSection]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchConnections();
  };

  const handleEditChange = (id, field, value) => {
    setEditForms(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  const handleSaveLead = async (id) => {
    const data = editForms[id];
    if (!data) return;

    try {
      setSavingId(id);
      const res = await axios.patch(`/admin/connections/${id}`, data);
      toast.success('Connection lead & commission details updated!');
      // Update local item
      setConnections(prev => prev.map(item => item._id === id ? res.data.connection : item));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update lead');
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteConnection = async (id) => {
    if (!window.confirm('Are you sure you want to delete this connection record? This cannot be undone.')) {
      return;
    }
    try {
      await axios.delete(`/admin/connections/${id}`);
      toast.success('Connection record removed');
      setConnections(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete record');
    }
  };

  const copyToClipboard = (text, label) => {
    if (!text) {
      toast.error(`No ${label} available to copy`);
      return;
    }
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied: ${text}`);
  };

  const getCleanPhone = (phone) => {
    if (!phone) return '';
    return phone.replace(/[^0-9]/g, '');
  };

  const openWhatsApp = (phone, name, otherName, role) => {
    const clean = getCleanPhone(phone);
    if (!clean) {
      toast.error(`No valid phone number for ${name}`);
      return;
    }
    const standardNumber = clean.length === 10 ? `91${clean}` : clean;
    const msg = encodeURIComponent(
      `Hello ${name}, greetings from ToppScorers Administration! 👋\n` +
      `We noticed your connection inquiry with ${otherName || 'our verified educator'}.\n` +
      `We are following up personally to help coordinate your tuition classes and schedule. When is a convenient time to speak?`
    );
    window.open(`https://wa.me/${standardNumber}?text=${msg}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Heading */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 rounded-2xl text-white shadow-xl border border-slate-700/80">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider mb-2">
            <FaHandshake className="text-sm" />
            <span>Direct Matchmaking & Revenue Hub</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <span>Connection Leads & Commission Center</span>
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            When students or teachers send connection requests, view their complete contact details here. 
            Call them directly via phone or WhatsApp, negotiate terms, coordinate tuition, and collect your platform commission.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={fetchConnections}
            className="flex items-center space-x-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-600 transition-colors shadow-sm cursor-pointer"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
            <span>Refresh Leads</span>
          </button>
          <button
            onClick={handleSendTelegramTest}
            disabled={testingTelegram}
            className="flex items-center space-x-2 px-3.5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-xl text-xs font-black shadow-sm transition-all hover:scale-[1.02] cursor-pointer"
            title="Send test Telegram alert: you first notifi"
          >
            <FaTelegramPlane size={14} className={testingTelegram ? 'animate-bounce' : ''} />
            <span>{testingTelegram ? 'Sending...' : 'Test Telegram Alert'}</span>
          </button>
        </div>
      </div>

      {/* 2 Dedicated Accepted Sections Switcher Tabs + Pipeline Tab */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {/* Section 1: Student -> Teacher Accepted */}
          <button
            onClick={() => {
              setActiveSection('student_to_teacher_accepted');
              navigate('/admin/connections/student-to-teacher');
            }}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeSection === 'student_to_teacher_accepted'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 ring-2 ring-emerald-500/30'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
            }`}
          >
            <FaUserGraduate className={activeSection === 'student_to_teacher_accepted' ? 'text-white' : 'text-emerald-600'} />
            <span>Student ➔ Teacher Accepted</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
              activeSection === 'student_to_teacher_accepted'
                ? 'bg-white/25 text-white'
                : 'bg-emerald-100 text-emerald-800'
            }`}>
              {metrics.studentToTeacherAccepted || 0}
            </span>
          </button>

          {/* Section 2: Teacher -> Student Approved */}
          <button
            onClick={() => {
              setActiveSection('teacher_to_student_accepted');
              navigate('/admin/connections/teacher-to-student');
            }}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeSection === 'teacher_to_student_accepted'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 ring-2 ring-blue-500/30'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
            }`}
          >
            <FaChalkboardTeacher className={activeSection === 'teacher_to_student_accepted' ? 'text-white' : 'text-blue-600'} />
            <span>Teacher ➔ Student Approved</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
              activeSection === 'teacher_to_student_accepted'
                ? 'bg-white/25 text-white'
                : 'bg-blue-100 text-blue-800'
            }`}>
              {metrics.teacherToStudentAccepted || 0}
            </span>
          </button>

          {/* All Pipeline Leads */}
          <button
            onClick={() => {
              setActiveSection('all');
              navigate('/admin/connections');
            }}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeSection === 'all'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
            }`}
          >
            <FiLink className={activeSection === 'all' ? 'text-white' : 'text-slate-500'} />
            <span>All Pipeline Leads</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
              activeSection === 'all'
                ? 'bg-white/25 text-white'
                : 'bg-slate-100 text-slate-800'
            }`}>
              {metrics.totalRequests || 0}
            </span>
          </button>
        </div>

        <div className="hidden lg:flex items-center space-x-2 px-3 py-1 bg-amber-50 rounded-xl border border-amber-200/80 text-amber-800 text-[11px] font-semibold">
          <FaHandshake className="text-amber-600" />
          <span>Confirmed Matches: {metrics.totalAccepted || 0}</span>
        </div>
      </div>

      {/* Contextual Section Explanation Banner */}
      {activeSection === 'student_to_teacher_accepted' && (
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/60 p-4 rounded-2xl border border-emerald-200 text-emerald-950 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-sm">
              <FaUserGraduate />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-200/60 px-2 py-0.5 rounded">
                  Confirmed Section 1
                </span>
                <h3 className="font-extrabold text-base text-emerald-900">
                  Student Approached ➔ Teacher Accepted
                </h3>
              </div>
              <p className="text-xs text-emerald-800 mt-1 max-w-3xl leading-relaxed">
                The student took the initiative to connect with the teacher, and the teacher accepted the request. 
                Both parties have agreed to connect! Call them now to confirm tuition timings, finalize class terms, and collect your <strong>50% 1st-month platform commission</strong>.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3 shrink-0">
            <div className="bg-white/80 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-emerald-200/80 text-center">
              <div className="text-xl font-black text-emerald-700">{metrics.studentToTeacherAccepted || 0}</div>
              <div className="text-[10px] font-bold text-emerald-600 uppercase">Confirmed Matches</div>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'teacher_to_student_accepted' && (
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-100/60 p-4 rounded-2xl border border-blue-200 text-blue-950 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-sm">
              <FaChalkboardTeacher />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black uppercase tracking-wider text-blue-700 bg-blue-200/60 px-2 py-0.5 rounded">
                  Confirmed Section 2
                </span>
                <h3 className="font-extrabold text-base text-blue-900">
                  Teacher Approached ➔ Student Approved
                </h3>
              </div>
              <p className="text-xs text-blue-800 mt-1 max-w-3xl leading-relaxed">
                The teacher proactively reached out to the student for tuition, and the student approved the request. 
                The student is waiting for class commencement! Call both parties, schedule the first trial class, and settle the <strong>50% platform commission</strong>.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3 shrink-0">
            <div className="bg-white/80 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-blue-200/80 text-center">
              <div className="text-xl font-black text-blue-700">{metrics.teacherToStudentAccepted || 0}</div>
              <div className="text-[10px] font-bold text-blue-600 uppercase">Approved Matches</div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
            <span>Student ➔ Teacher</span>
            <FaUserGraduate className="text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{metrics.studentToTeacherAccepted}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">Accepted matches</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
            <span>Teacher ➔ Student</span>
            <FaChalkboardTeacher className="text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-600">{metrics.teacherToStudentAccepted}</div>
          <div className="text-[11px] text-blue-500 font-semibold mt-0.5">Approved matches</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
            <span>In Negotiation</span>
            <FiPhone className="text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">{metrics.inProgress}</div>
          <div className="text-[11px] text-amber-600 font-semibold mt-0.5">Calls in progress</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
            <span>Commission Paid</span>
            <FiDollarSign className="text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600">₹{metrics.totalCommissionReceived.toLocaleString()}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">Earned platform profit</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
            <span>Expected Revenue</span>
            <FaHandshake className="text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-indigo-600">₹{metrics.totalCommissionExpected.toLocaleString()}</div>
          <div className="text-[11px] text-indigo-500 font-semibold mt-0.5">From finalized deals</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student/teacher name, phone number, email, area, or notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-lg transition-colors shrink-0 shadow-xs"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs">
          <div className="flex items-center space-x-1.5 text-slate-500 font-semibold">
            <FiFilter />
            <span>Filters:</span>
          </div>

          {/* Lead Status Filter */}
          <select
            value={filterLeadStatus}
            onChange={(e) => setFilterLeadStatus(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200/80 rounded-lg font-medium text-slate-700 border border-slate-200 focus:outline-none"
          >
            <option value="all">All Lead Stages</option>
            {LEAD_STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          {/* Commission Status Filter */}
          <select
            value={filterCommissionStatus}
            onChange={(e) => setFilterCommissionStatus(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200/80 rounded-lg font-medium text-slate-700 border border-slate-200 focus:outline-none"
          >
            <option value="all">All Commission Statuses</option>
            {COMMISSION_STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          {/* District Filter */}
          <select
            value={filterDistrict}
            onChange={(e) => setFilterDistrict(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200/80 rounded-lg font-medium text-slate-700 border border-slate-200 focus:outline-none"
          >
            <option value="all">All Districts</option>
            {DISTRICTS.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {(filterLeadStatus !== 'all' || filterCommissionStatus !== 'all' || filterDistrict !== 'all' || search) && (
            <button
              onClick={() => {
                setFilterLeadStatus('all');
                setFilterCommissionStatus('all');
                setFilterDistrict('all');
                setSearch('');
              }}
              className="text-xs text-rose-600 hover:text-rose-800 font-bold ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Connection List */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          <FiRefreshCw className="animate-spin text-3xl mx-auto text-blue-600 mb-3" />
          <p className="font-semibold text-sm">Loading connection leads...</p>
        </div>
      ) : connections.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          <FaHandshake className="text-4xl mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Connection Leads Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            No connection requests matched your current search or filter criteria. As soon as a student or teacher clicks 'Connect', their full contact details will populate here for manual coordination.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {connections.map((item) => {
            const sender = item.fromUserId || {};
            const recipient = item.toUserId || {};
            const senderProfile = item.fromProfile || {};
            const recipientProfile = item.toProfile || {};

            const senderPhone = sender.phone || senderProfile.verificationPhone || '';
            const recipientPhone = recipient.phone || recipientProfile.verificationPhone || '';

            const editForm = editForms[item._id] || {
              adminLeadStatus: item.adminLeadStatus || 'new',
              tuitionFee: item.tuitionFee || 0,
              commissionExpected: item.commissionExpected || 0,
              commissionReceived: item.commissionReceived || 0,
              commissionStatus: item.commissionStatus || 'pending',
              adminNotes: item.adminNotes || ''
            };

            const isSenderStudent = sender.role === 'student';
            const leadStatusMeta = LEAD_STATUS_OPTIONS.find(o => o.value === (editForm.adminLeadStatus || 'new')) || LEAD_STATUS_OPTIONS[0];

            return (
              <div 
                key={item._id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Header bar of the Lead Card */}
                <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Direction & Acceptance Indicator */}
                    {isSenderStudent && item.status === 'accepted' ? (
                      <span className="text-xs font-bold px-3 py-1 rounded-lg bg-emerald-700 text-white flex items-center space-x-1.5 shadow-xs">
                        <FaUserGraduate className="text-xs" />
                        <span>Student Initiated</span>
                        <span>➔</span>
                        <FaChalkboardTeacher className="text-xs" />
                        <span>Teacher Accepted ✅</span>
                      </span>
                    ) : !isSenderStudent && item.status === 'accepted' ? (
                      <span className="text-xs font-bold px-3 py-1 rounded-lg bg-blue-700 text-white flex items-center space-x-1.5 shadow-xs">
                        <FaChalkboardTeacher className="text-xs" />
                        <span>Teacher Initiated</span>
                        <span>➔</span>
                        <FaUserGraduate className="text-xs" />
                        <span>Student Approved ✅</span>
                      </span>
                    ) : (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-slate-900 text-white">
                        {isSenderStudent ? 'Student ➔ Teacher Inquiry' : 'Teacher ➔ Student Inquiry'}
                      </span>
                    )}

                    <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${leadStatusMeta.color}`}>
                      {leadStatusMeta.label}
                    </span>
                    <span className="text-[11px] text-slate-500 flex items-center space-x-1">
                      <FiClock size={12} />
                      <span>{new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDeleteConnection(item._id)}
                      title="Delete this record"
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    >
                      <FiTrash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Two Parties Details: Side-by-Side Comparison */}
                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                  {/* Party 1: Initiator (Sender) */}
                  <div className="space-y-3 pb-3 md:pb-0 md:pr-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-lg text-white shadow ${
                          sender.role === 'teacher' ? 'bg-gradient-to-tr from-emerald-600 to-teal-500' : 'bg-gradient-to-tr from-blue-600 to-indigo-500'
                        }`}>
                          {sender.name ? sender.name.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div>
                          <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                            <span className="text-base font-extrabold text-slate-900">{sender.name || 'Anonymous User'}</span>
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              sender.role === 'teacher' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {sender.role || 'Sender'}
                            </span>
                            {senderProfile.jobId && (
                              <button
                                type="button"
                                onClick={() => copyToClipboard(senderProfile.jobId, 'Job ID')}
                                className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-mono font-bold border border-slate-300 transition-colors"
                                title="Click to copy Job ID"
                              >
                                <span>ID: {senderProfile.jobId}</span>
                                <FiCopy size={10} />
                              </button>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center space-x-1 mt-0.5">
                            <FiMapPin size={12} className="text-slate-400" />
                            <span>{senderProfile.location?.city || 'Prayagraj'} {senderProfile.area ? `· ${senderProfile.area}` : ''}</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        INITIATOR
                      </span>
                    </div>

                    {/* Contact details for Sender */}
                    <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/60 space-y-2 text-xs">
                      {/* Phone Number */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-slate-800">
                          <FiPhone className="text-emerald-600" />
                          <span className="font-bold text-sm tracking-wide">
                            {senderPhone || <span className="text-slate-400 font-normal italic">No phone provided</span>}
                          </span>
                        </div>
                        {senderPhone && (
                          <div className="flex items-center space-x-1.5">
                            <a
                              href={`tel:${senderPhone}`}
                              className="px-2 py-1 bg-white hover:bg-slate-100 text-emerald-700 font-semibold rounded border border-slate-200 text-[11px] shadow-2xs"
                              title="Direct Phone Call"
                            >
                              Call
                            </a>
                            <button
                              onClick={() => openWhatsApp(senderPhone, sender.name, recipient.name, sender.role)}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded text-[11px] flex items-center space-x-1 shadow-2xs"
                              title="Chat on WhatsApp"
                            >
                              <FaWhatsapp size={12} />
                              <span>WhatsApp</span>
                            </button>
                            <button
                              onClick={() => copyToClipboard(senderPhone, 'Phone number')}
                              className="p-1 text-slate-400 hover:text-slate-700"
                              title="Copy Phone"
                            >
                              <FiCopy size={13} />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Email */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/50">
                        <div className="flex items-center space-x-2 text-slate-700 truncate max-w-[200px]">
                          <FiMail className="text-blue-600 shrink-0" />
                          <span className="truncate">{sender.email || 'No email'}</span>
                        </div>
                        {sender.email && (
                          <div className="flex items-center space-x-1">
                            <a
                              href={`mailto:${sender.email}`}
                              className="px-2 py-0.5 bg-white hover:bg-slate-100 text-blue-700 font-medium rounded border border-slate-200 text-[10px]"
                            >
                              Email
                            </a>
                            <button
                              onClick={() => copyToClipboard(sender.email, 'Email')}
                              className="p-0.5 text-slate-400 hover:text-slate-700"
                              title="Copy Email"
                            >
                              <FiCopy size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Profile Requirements / Credentials */}
                    <div className="text-xs space-y-1 bg-white p-2.5 rounded-lg border border-slate-100">
                      {isSenderStudent ? (
                        <>
                          <div className="text-slate-700">
                            <span className="font-semibold text-slate-900">Class / Exam:</span> {senderProfile.classOrExam || 'General Tuition'}
                          </div>
                          <div className="text-slate-700">
                            <span className="font-semibold text-slate-900">Subjects Needed:</span> {senderProfile.subjectsNeeded?.length ? senderProfile.subjectsNeeded.join(', ') : 'All Subjects'}
                          </div>
                          <div className="text-slate-700">
                            <span className="font-semibold text-slate-900">Student Budget:</span> ₹{senderProfile.budget?.max || senderProfile.budget?.min || 3000}/month
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-slate-700">
                            <span className="font-semibold text-slate-900">Subjects Taught:</span> {senderProfile.subjects?.length ? senderProfile.subjects.join(', ') : 'All Subjects'}
                          </div>
                          <div className="text-slate-700">
                            <span className="font-semibold text-slate-900">Teacher Fee:</span> ₹{senderProfile.fee?.amount || 3000}/month
                          </div>
                          <div className="text-slate-700">
                            <span className="font-semibold text-slate-900">Experience:</span> {senderProfile.experience || 1} Years
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Party 2: Target (Recipient) */}
                  <div className="space-y-3 pt-3 md:pt-0 md:pl-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-lg text-white shadow ${
                          recipient.role === 'teacher' ? 'bg-gradient-to-tr from-emerald-600 to-teal-500' : 'bg-gradient-to-tr from-blue-600 to-indigo-500'
                        }`}>
                          {recipient.name ? recipient.name.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div>
                          <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                            <span className="text-base font-extrabold text-slate-900">{recipient.name || 'Anonymous User'}</span>
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              recipient.role === 'teacher' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {recipient.role || 'Recipient'}
                            </span>
                            {recipientProfile.jobId && (
                              <button
                                type="button"
                                onClick={() => copyToClipboard(recipientProfile.jobId, 'Job ID')}
                                className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-mono font-bold border border-slate-300 transition-colors"
                                title="Click to copy Job ID"
                              >
                                <span>ID: {recipientProfile.jobId}</span>
                                <FiCopy size={10} />
                              </button>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center space-x-1 mt-0.5">
                            <FiMapPin size={12} className="text-slate-400" />
                            <span>{recipientProfile.location?.city || 'Prayagraj'} {recipientProfile.area ? `· ${recipientProfile.area}` : ''}</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        TARGET
                      </span>
                    </div>

                    {/* Contact details for Recipient */}
                    <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/60 space-y-2 text-xs">
                      {/* Phone Number */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-slate-800">
                          <FiPhone className="text-emerald-600" />
                          <span className="font-bold text-sm tracking-wide">
                            {recipientPhone || <span className="text-slate-400 font-normal italic">No phone provided</span>}
                          </span>
                        </div>
                        {recipientPhone && (
                          <div className="flex items-center space-x-1.5">
                            <a
                              href={`tel:${recipientPhone}`}
                              className="px-2 py-1 bg-white hover:bg-slate-100 text-emerald-700 font-semibold rounded border border-slate-200 text-[11px] shadow-2xs"
                              title="Direct Phone Call"
                            >
                              Call
                            </a>
                            <button
                              onClick={() => openWhatsApp(recipientPhone, recipient.name, sender.name, recipient.role)}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded text-[11px] flex items-center space-x-1 shadow-2xs"
                              title="Chat on WhatsApp"
                            >
                              <FaWhatsapp size={12} />
                              <span>WhatsApp</span>
                            </button>
                            <button
                              onClick={() => copyToClipboard(recipientPhone, 'Phone number')}
                              className="p-1 text-slate-400 hover:text-slate-700"
                              title="Copy Phone"
                            >
                              <FiCopy size={13} />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Email */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/50">
                        <div className="flex items-center space-x-2 text-slate-700 truncate max-w-[200px]">
                          <FiMail className="text-blue-600 shrink-0" />
                          <span className="truncate">{recipient.email || 'No email'}</span>
                        </div>
                        {recipient.email && (
                          <div className="flex items-center space-x-1">
                            <a
                              href={`mailto:${recipient.email}`}
                              className="px-2 py-0.5 bg-white hover:bg-slate-100 text-blue-700 font-medium rounded border border-slate-200 text-[10px]"
                            >
                              Email
                            </a>
                            <button
                              onClick={() => copyToClipboard(recipient.email, 'Email')}
                              className="p-0.5 text-slate-400 hover:text-slate-700"
                              title="Copy Email"
                            >
                              <FiCopy size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Profile Requirements / Credentials */}
                    <div className="text-xs space-y-1 bg-white p-2.5 rounded-lg border border-slate-100">
                      {recipient.role === 'teacher' ? (
                        <>
                          <div className="text-slate-700">
                            <span className="font-semibold text-slate-900">Subjects Taught:</span> {recipientProfile.subjects?.length ? recipientProfile.subjects.join(', ') : 'All Subjects'}
                          </div>
                          <div className="text-slate-700">
                            <span className="font-semibold text-slate-900">Teacher Fee:</span> ₹{recipientProfile.fee?.amount || 3000}/month
                          </div>
                          <div className="text-slate-700">
                            <span className="font-semibold text-slate-900">Experience:</span> {recipientProfile.experience || 1} Years
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-slate-700">
                            <span className="font-semibold text-slate-900">Class / Exam:</span> {recipientProfile.classOrExam || 'General Tuition'}
                          </div>
                          <div className="text-slate-700">
                            <span className="font-semibold text-slate-900">Subjects Needed:</span> {recipientProfile.subjectsNeeded?.length ? recipientProfile.subjectsNeeded.join(', ') : 'All Subjects'}
                          </div>
                          <div className="text-slate-700">
                            <span className="font-semibold text-slate-900">Student Budget:</span> ₹{recipientProfile.budget?.max || recipientProfile.budget?.min || 3000}/month
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Admin Management Section: Deal Status, Tuition Fee, Commission & Call Notes */}
                <div className="bg-slate-50/90 border-t border-slate-200 p-5 space-y-4">
                  <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                    <FiDollarSign className="text-emerald-600" />
                    <span>Admin Matchmaking, Commission & Deal Coordination</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Lead Stage Selector */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Deal / Lead Stage
                      </label>
                      <select
                        value={editForm.adminLeadStatus}
                        onChange={(e) => handleEditChange(item._id, 'adminLeadStatus', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
                      >
                        {LEAD_STATUS_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Agreed Monthly Tuition Fee */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Agreed Tuition Fee (₹/mo)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                        <input
                          type="number"
                          value={editForm.tuitionFee}
                          onChange={(e) => handleEditChange(item._id, 'tuitionFee', e.target.value)}
                          placeholder="e.g. 4000"
                          className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Commission Expected with 1-click 50% Auto Calculator */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-bold text-slate-700">
                          Our Commission (₹)
                        </label>
                        {Number(editForm.tuitionFee) > 0 && (
                          <button
                            type="button"
                            onClick={() => handleEditChange(item._id, 'commissionExpected', Math.round(Number(editForm.tuitionFee) * 0.5))}
                            className="text-[10px] font-extrabold text-amber-800 hover:text-amber-950 bg-amber-100 hover:bg-amber-200 px-1.5 py-0.5 rounded transition-colors flex items-center space-x-0.5 shadow-2xs"
                            title="Set to 50% first-month platform commission"
                          >
                            <FiZap size={10} />
                            <span>50% (₹{Math.round(Number(editForm.tuitionFee) * 0.5)})</span>
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                        <input
                          type="number"
                          value={editForm.commissionExpected}
                          onChange={(e) => handleEditChange(item._id, 'commissionExpected', e.target.value)}
                          placeholder="e.g. 2000"
                          className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-indigo-700 focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    {/* Commission Received & Status */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Commission Received (₹)
                      </label>
                      <div className="flex space-x-1.5">
                        <div className="relative flex-1">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                          <input
                            type="number"
                            value={editForm.commissionReceived}
                            onChange={(e) => handleEditChange(item._id, 'commissionReceived', e.target.value)}
                            placeholder="0"
                            className="w-full pl-6 pr-2 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-emerald-700 focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                        <select
                          value={editForm.commissionStatus}
                          onChange={(e) => handleEditChange(item._id, 'commissionStatus', e.target.value)}
                          className="w-32 px-2 py-2 bg-white border border-slate-300 rounded-lg text-[11px] font-semibold text-slate-700"
                        >
                          {COMMISSION_STATUS_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Call Notes & Log */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Admin Call Notes & Settlement Terms
                    </label>
                    <textarea
                      rows={2}
                      value={editForm.adminNotes}
                      onChange={(e) => handleEditChange(item._id, 'adminNotes', e.target.value)}
                      placeholder="e.g. Spoke with student's parent: prefers evening 5 PM classes. Teacher confirmed availability. Commission ₹800 to be paid after trial class..."
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 resize-y"
                    />
                  </div>

                  {/* Action & Save Footer */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                      {item.lastContactedAt && (
                        <span>Last Contacted: {new Date(item.lastContactedAt).toLocaleDateString()}</span>
                      )}
                      {item.dealFinalizedAt && (
                        <span className="text-emerald-700 font-semibold">· Deal Finalized: {new Date(item.dealFinalizedAt).toLocaleDateString()}</span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleSaveLead(item._id)}
                        disabled={savingId === item._id}
                        className="flex items-center space-x-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-sm"
                      >
                        <FiSave size={14} className={savingId === item._id ? 'animate-spin' : ''} />
                        <span>{savingId === item._id ? 'Saving Changes...' : 'Save Lead & Commission'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ConnectionManager;
