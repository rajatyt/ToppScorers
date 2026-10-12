import React, { useState, useEffect, useContext, useCallback } from 'react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import {
  FiHelpCircle, FiSearch, FiFilter, FiCheckCircle, FiClock,
  FiAlertCircle, FiMessageSquare, FiSend, FiUser, FiPhone,
  FiMail, FiCopy, FiCheck, FiRefreshCw, FiTrash2, FiExternalLink
} from 'react-icons/fi';
import { FaWhatsapp, FaGraduationCap, FaChalkboardTeacher, FaUserGraduate } from 'react-icons/fa';
import { NotificationContext } from '../../context/NotificationContext';

const QUICK_TEMPLATES = [
  {
    title: '1st Month 50% Commission',
    text: 'Hello! As per ToppScorers policy, the 50% service charge applies only to the 1st month tuition fee. From Month 2 onwards, 100% of the tuition fee is directly yours with ₹0 ongoing commission. Feel free to reply if you need any further breakdown!'
  },
  {
    title: 'Verification Queue Update',
    text: 'Hello! We have reviewed your profile documents and details. Our team is finalizing the verification check and your profile will reflect the Verified Expert badge shortly within 24 hours.'
  },
  {
    title: 'Tuition Coordination Help',
    text: 'Hello! We are actively coordinating between the teacher and student parent for this tuition requirement. We will contact both parties via phone/WhatsApp to finalize convenient timings and tuition mode.'
  },
  {
    title: 'More Details Needed',
    text: 'Hello! To help us resolve your issue promptly, could you please provide a few additional details or share a screenshot? You can reply directly in this thread.'
  }
];

const QueryManager = () => {
  const { markAdminSectionViewed } = useContext(NotificationContext);
  const [queries, setQueries] = useState([]);
  const [stats, setStats] = useState({ total: 0, open: 0, inProgress: 0, resolved: 0, unread: 0 });
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Active Query Modal / Drawer
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyStatus, setReplyStatus] = useState('resolved');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [copiedJobId, setCopiedJobId] = useState('');

  // Fetch queries list
  const fetchQueries = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 15,
        status: statusFilter,
        role: roleFilter,
        category: categoryFilter,
        search
      };
      const [res, statsRes] = await Promise.all([
        api.get('/queries/admin/all', { params }),
        api.get('/queries/admin/stats')
      ]);

      setQueries(res.data.queries || []);
      setTotalPages(res.data.pages || 1);
      setStats(statsRes.data || { total: 0, open: 0, inProgress: 0, resolved: 0, unread: 0 });
    } catch (err) {
      toast.error('Failed to load queries');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, roleFilter, categoryFilter, search]);

  useEffect(() => {
    fetchQueries();
    markAdminSectionViewed('queries');
  }, [fetchQueries, markAdminSectionViewed]);

  const handleOpenQuery = async (query) => {
    setSelectedQuery(query);
    setReplyText('');
    setReplyStatus(query.status === 'resolved' ? 'resolved' : 'resolved');

    // Fetch fresh thread & mark viewed
    try {
      const res = await api.get(`/queries/admin/${query._id}`);
      setSelectedQuery(res.data);
      // update item in list
      setQueries(prev => prev.map(q => q._id === query._id ? res.data : q));
    } catch (err) {
      // quiet fail
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) {
      toast.error('Please enter a response message');
      return;
    }

    setSubmittingReply(true);
    try {
      const res = await api.post(`/queries/admin/${selectedQuery._id}/reply`, {
        message: replyText.trim(),
        status: replyStatus
      });

      toast.success('Response sent to user successfully!');
      setSelectedQuery(res.data.query);
      setReplyText('');
      setQueries(prev => prev.map(q => q._id === selectedQuery._id ? res.data.query : q));
      fetchQueries();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reply');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleUpdateStatus = async (queryId, newStatus) => {
    try {
      const res = await api.patch(`/queries/admin/${queryId}/status`, { status: newStatus });
      toast.success(`Query marked as ${newStatus}`);
      setQueries(prev => prev.map(q => q._id === queryId ? res.data.query : q));
      if (selectedQuery && selectedQuery._id === queryId) {
        setSelectedQuery(res.data.query);
      }
      fetchQueries();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteQuery = async (queryId) => {
    if (!window.confirm('Are you sure you want to delete this query?')) return;
    try {
      await api.delete(`/queries/admin/${queryId}`);
      toast.success('Query deleted');
      setQueries(prev => prev.filter(q => q._id !== queryId));
      if (selectedQuery && selectedQuery._id === queryId) {
        setSelectedQuery(null);
      }
      fetchQueries();
    } catch (err) {
      toast.error('Failed to delete query');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard?.writeText(text);
    setCopiedJobId(text);
    toast.success(`Copied: ${text}`);
    setTimeout(() => setCopiedJobId(''), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-sky-50 text-sky-600">
              <FiHelpCircle size={22} />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">User Queries & Doubts</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Resolve issues, commission questions, and doubts raised by teachers and students in real time.
          </p>
        </div>

        <button
          onClick={fetchQueries}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          <FiRefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Top Stat Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1">
            <span>Total Queries</span>
            <span className="p-1.5 rounded-lg bg-slate-100 text-slate-600"><FiMessageSquare size={14} /></span>
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.total}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">All time submissions</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-xs">
          <div className="flex items-center justify-between text-xs text-amber-800 font-bold mb-1">
            <span>Open (Awaiting Reply)</span>
            <span className="p-1.5 rounded-lg bg-amber-100 text-amber-700"><FiClock size={14} /></span>
          </div>
          <div className="text-2xl font-black text-amber-700">{stats.open}</div>
          <p className="text-[11px] text-amber-600/80 mt-0.5">Requires admin attention</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-sky-200 bg-sky-50/20 shadow-xs">
          <div className="flex items-center justify-between text-xs text-sky-800 font-bold mb-1">
            <span>In Progress</span>
            <span className="p-1.5 rounded-lg bg-sky-100 text-sky-700"><FiAlertCircle size={14} /></span>
          </div>
          <div className="text-2xl font-black text-sky-700">{stats.inProgress}</div>
          <p className="text-[11px] text-sky-600/80 mt-0.5">Under investigation</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <div className="flex items-center justify-between text-xs text-emerald-800 font-bold mb-1">
            <span>Resolved</span>
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700"><FiCheckCircle size={14} /></span>
          </div>
          <div className="text-2xl font-black text-emerald-700">{stats.resolved}</div>
          <p className="text-[11px] text-emerald-600/80 mt-0.5">Successfully answered</p>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Status Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
            {['all', 'open', 'in_progress', 'resolved'].map((st) => (
              <button
                key={st}
                onClick={() => { setStatusFilter(st); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap capitalize transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st === 'all' ? 'All Queries' : st === 'open' ? 'Open Doubts' : st === 'in_progress' ? 'In Progress' : 'Resolved'}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <FiSearch className="absolute left-3 top-2.5 text-slate-400 text-sm" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by Job ID, user, phone, subject..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>
        </div>

        {/* Secondary Filters: Role & Category */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400 font-bold">User Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-bold focus:outline-none"
            >
              <option value="all">All Roles</option>
              <option value="teacher">Teachers</option>
              <option value="student">Students</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-400 font-bold">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-bold focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="commission_payment">Commission & Fee Doubts</option>
              <option value="tuition_issue">Tuition Timing / Coordination</option>
              <option value="profile_verification">Profile & Document Verification</option>
              <option value="account_login">Account & Login</option>
              <option value="technical">Technical / Website Issue</option>
              <option value="general">General Inquiries</option>
            </select>
          </div>
        </div>
      </div>

      {/* Query List */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-400 font-bold">Loading queries...</p>
          </div>
        ) : queries.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <FiHelpCircle size={28} />
            </div>
            <h3 className="text-base font-bold text-slate-800">No Queries Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              There are currently no user issues or doubts matching your selected filters.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {queries.map((q) => {
              const isTeacher = q.role === 'teacher';
              const cleanPhone = q.phone?.replace(/[^0-9]/g, '') || '';
              const hasAdminResponse = Boolean(q.adminResponse);

              return (
                <div
                  key={q._id}
                  className={`p-5 transition-colors hover:bg-slate-50/80 flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                    !q.adminViewed ? 'bg-amber-50/30 border-l-4 border-l-amber-500' : ''
                  }`}
                >
                  {/* Left: User info, Job ID, Subject & Message */}
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Role Pill */}
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                        isTeacher
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      }`}>
                        {isTeacher ? <FaChalkboardTeacher className="text-xs mr-0.5" /> : <FaUserGraduate className="text-xs mr-0.5" />}
                        <span className="capitalize">{q.role}</span>
                      </span>

                      {/* Job ID Pill */}
                      {q.jobId && (
                        <button
                          type="button"
                          onClick={() => copyToClipboard(q.jobId)}
                          className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-mono text-[10px] font-bold cursor-pointer"
                          title="Click to copy Job ID"
                        >
                          <span className="text-slate-400 font-sans text-[9px]">ID:</span>
                          <span>{q.jobId}</span>
                          {copiedJobId === q.jobId ? (
                            <FiCheck className="text-emerald-600 text-xs ml-0.5" />
                          ) : (
                            <FiCopy className="text-slate-400 text-xs ml-0.5" />
                          )}
                        </button>
                      )}

                      {/* User Name */}
                      <span className="font-extrabold text-slate-900 text-sm">{q.name}</span>

                      {/* Category Badge */}
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold capitalize">
                        {q.category?.replace(/_/g, ' ')}
                      </span>

                      {/* Unread Indicator */}
                      {!q.adminViewed && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white font-extrabold text-[10px] animate-pulse">
                          NEW
                        </span>
                      )}
                    </div>

                    {/* Subject & snippet */}
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm leading-snug">{q.subject}</h4>
                      <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">{q.message}</p>
                    </div>

                    {/* Admin Response Snippet if replied */}
                    {hasAdminResponse && (
                      <div className="bg-sky-50 border border-sky-100 rounded-xl p-2.5 text-xs text-sky-950 flex items-start space-x-2">
                        <FiCheckCircle className="text-sky-600 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <span className="font-bold text-sky-900">Admin Response: </span>
                          <span className="text-sky-800 line-clamp-1">{q.adminResponse}</span>
                        </div>
                      </div>
                    )}

                    {/* Contact shortcuts */}
                    <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap pt-1">
                      {q.phone && (
                        <div className="flex items-center space-x-1.5">
                          <a
                            href={`tel:${cleanPhone}`}
                            className="inline-flex items-center space-x-1 text-slate-600 hover:text-slate-900 font-semibold"
                          >
                            <FiPhone className="text-slate-400 text-xs" />
                            <span>{q.phone}</span>
                          </a>
                          <a
                            href={`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(`Hello ${q.name}, regarding your doubt on ToppScorers (${q.subject}):`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                            title="Chat on WhatsApp"
                          >
                            <FaWhatsapp size={13} />
                          </a>
                        </div>
                      )}
                      {q.email && (
                        <a
                          href={`mailto:${q.email}?subject=Regarding your inquiry: ${q.subject}`}
                          className="inline-flex items-center space-x-1 text-slate-600 hover:text-slate-900 font-semibold"
                        >
                          <FiMail className="text-slate-400 text-xs" />
                          <span>{q.email}</span>
                        </a>
                      )}
                      <span className="text-slate-400">
                        {new Date(q.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {/* Right: Status Pill & Actions */}
                  <div className="flex lg:flex-col items-center lg:items-end justify-between gap-3 flex-shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black capitalize ${
                      q.status === 'open'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : q.status === 'in_progress'
                        ? 'bg-sky-100 text-sky-800 border border-sky-300'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}>
                      {q.status === 'open' ? 'Open' : q.status === 'in_progress' ? 'In Progress' : 'Resolved'}
                    </span>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleOpenQuery(q)}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center space-x-1"
                      >
                        <FiMessageSquare size={13} />
                        <span>{hasAdminResponse ? 'View / Follow Up' : 'Reply & Resolve'}</span>
                      </button>

                      {q.status !== 'resolved' && (
                        <button
                          onClick={() => handleUpdateStatus(q._id, 'resolved')}
                          className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors cursor-pointer"
                          title="Mark Resolved"
                        >
                          <FiCheckCircle size={15} />
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteQuery(q._id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Query"
                      >
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-semibold">Page {page} of {totalPages}</span>
            <div className="flex items-center space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40 font-bold hover:bg-slate-50"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40 font-bold hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Reply & Thread Modal */}
      {selectedQuery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/70">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`px-2 py-0.5 rounded-md font-extrabold text-[10px] uppercase ${
                    selectedQuery.role === 'teacher' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                  }`}>
                    {selectedQuery.role}
                  </span>
                  {selectedQuery.jobId && (
                    <span className="font-mono text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {selectedQuery.jobId}
                    </span>
                  )}
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black capitalize ${
                    selectedQuery.status === 'open'
                      ? 'bg-amber-100 text-amber-800'
                      : selectedQuery.status === 'in_progress'
                      ? 'bg-sky-100 text-sky-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {selectedQuery.status?.replace(/_/g, ' ')}
                  </span>
                </div>
                <h3 className="font-black text-slate-900 text-base">{selectedQuery.subject}</h3>
                <p className="text-xs text-slate-500">
                  By {selectedQuery.name} • {selectedQuery.phone || selectedQuery.email}
                </p>
              </div>

              <button
                onClick={() => setSelectedQuery(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Conversation History */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4 max-h-[420px] bg-slate-50/40">
              {/* Original Query Message */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="font-bold text-slate-700">{selectedQuery.name} (User)</span>
                  <span>{new Date(selectedQuery.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-xs text-slate-800 whitespace-pre-line leading-relaxed font-medium">
                  {selectedQuery.message}
                </p>
              </div>

              {/* Thread Messages */}
              {selectedQuery.conversation && selectedQuery.conversation.length > 1 && (
                selectedQuery.conversation.slice(1).map((msg, idx) => {
                  const isAdmin = msg.sender === 'admin';
                  return (
                    <div
                      key={idx}
                      className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`p-4 rounded-2xl max-w-[85%] text-xs shadow-2xs ${
                        isAdmin
                          ? 'bg-sky-600 text-white rounded-tr-xs'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs'
                      }`}>
                        <div className={`flex items-center justify-between text-[10px] mb-1 gap-2 ${
                          isAdmin ? 'text-sky-200' : 'text-slate-400'
                        }`}>
                          <span className="font-bold">{msg.senderName || (isAdmin ? 'Admin Support' : 'User')}</span>
                          <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="whitespace-pre-line leading-relaxed">{msg.message}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Reply Area */}
            <div className="p-5 border-t border-slate-100 bg-white space-y-3">
              {/* Quick Template Selector */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Quick Reply Templates
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_TEMPLATES.map((tmpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setReplyText(tmpl.text)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-700 font-bold text-[11px] border border-slate-200 transition-colors cursor-pointer"
                    >
                      {tmpl.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reply Textarea */}
              <textarea
                rows={3}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your response to the user here..."
                className="w-full text-xs p-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-slate-50 focus:bg-white resize-none"
              />

              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-500 font-bold">Status after reply:</span>
                  <select
                    value={replyStatus}
                    onChange={(e) => setReplyStatus(e.target.value)}
                    className="text-xs font-bold bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 focus:outline-none"
                  >
                    <option value="resolved">Mark as Resolved</option>
                    <option value="in_progress">Keep In Progress</option>
                    <option value="open">Keep Open</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setSelectedQuery(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSendReply}
                    disabled={submittingReply}
                    className="inline-flex items-center px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    <FiSend className="mr-1.5" />
                    {submittingReply ? 'Sending...' : 'Send Response'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QueryManager;
