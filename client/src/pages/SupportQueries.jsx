import React, { useState, useEffect, useContext, useCallback } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import { toast } from 'react-hot-toast';
import {
  FiHelpCircle, FiSend, FiMessageSquare, FiCheckCircle,
  FiClock, FiAlertCircle, FiPlus, FiChevronRight, FiCopy,
  FiCheck, FiArrowLeft, FiInfo, FiDollarSign
} from 'react-icons/fi';
import { FaGraduationCap, FaWhatsapp, FaRupeeSign } from 'react-icons/fa';

const FAQS_LIST = [
  {
    q: 'How does the 1st Month 50% commission work?',
    a: 'ToppScorers charges a 50% service fee strictly on the 1st month tuition fee for successfully connecting teacher and student. From Month 2 onwards, 100% of the fee belongs completely to the teacher with zero ongoing commission.'
  },
  {
    q: 'How long does Teacher Profile Verification take?',
    a: 'Verification is typically reviewed within 24 hours of document submission. Once verified, your profile displays the prestigious "Verified Expert" badge.'
  },
  {
    q: 'How do teachers and students get connected?',
    a: 'When you send a connection request, our support team actively follows up and contacts both parties via phone/WhatsApp to arrange convenient tuition timings and demo classes.'
  },
  {
    q: 'Can I search a teacher or student using their Job ID?',
    a: 'Yes! Every teacher has an ID like JOB-T1001 and every student has an ID like JOB-S1001. Simply type the Job ID or its number directly in the search bar.'
  }
];

const CATEGORIES = [
  { value: 'commission_payment', label: '💰 1st Month Commission & Fees' },
  { value: 'tuition_issue', label: '📚 Tuition Timing & Coordination' },
  { value: 'profile_verification', label: '🛡️ Profile & Document Verification' },
  { value: 'account_login', label: '🔑 Account & Password Assistance' },
  { value: 'technical', label: '⚙️ Technical / Website Doubts' },
  { value: 'general', label: '❓ General Question' }
];

const SupportQueries = () => {
  const { user, profile } = useContext(AuthContext);
  const { unreadCounts, markSectionViewed } = useContext(NotificationContext);

  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'create'
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('commission_payment');
  const [priority, setPriority] = useState('medium');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Active query modal / conversation drawer
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [copiedJobId, setCopiedJobId] = useState(false);

  const isTeacher = user?.role === 'teacher';
  const myJobId = profile?.jobId || '';

  // Fetch user queries
  const fetchQueries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/queries');
      setQueries(res.data || []);
      // If no queries exist yet, default to create tab
      if (res.data && res.data.length === 0) {
        setActiveTab('create');
      }
    } catch (err) {
      toast.error('Failed to load your queries');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueries();
    // Instantly clear notification badge on opening queries
    markSectionViewed('queries');
  }, [fetchQueries, markSectionViewed]);

  const handleSubmitQuery = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error('Please enter both subject and message');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/queries', {
        subject: subject.trim(),
        category,
        priority,
        message: message.trim()
      });

      toast.success('Your doubt has been submitted! Admin will respond shortly.');
      setSubject('');
      setMessage('');
      setActiveTab('list');
      fetchQueries();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit doubt');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenQuery = async (q) => {
    setSelectedQuery(q);
    setReplyText('');
    try {
      const res = await api.get(`/queries/${q._id}`);
      setSelectedQuery(res.data);
      setQueries(prev => prev.map(item => item._id === q._id ? res.data : item));
    } catch (err) {
      // quiet fail
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) {
      toast.error('Please write a message to reply');
      return;
    }

    setSendingReply(true);
    try {
      const res = await api.post(`/queries/${selectedQuery._id}/reply`, {
        message: replyText.trim()
      });

      toast.success('Reply submitted to admin!');
      setSelectedQuery(res.data.query);
      setReplyText('');
      setQueries(prev => prev.map(q => q._id === selectedQuery._id ? res.data.query : q));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit reply');
    } finally {
      setSendingReply(false);
    }
  };

  const handleMarkResolved = async (queryId) => {
    try {
      const res = await api.post(`/queries/${queryId}/mark-resolved`);
      toast.success('Marked as resolved!');
      setQueries(prev => prev.map(q => q._id === queryId ? res.data.query : q));
      if (selectedQuery && selectedQuery._id === queryId) {
        setSelectedQuery(res.data.query);
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const copyMyJobId = () => {
    if (!myJobId) return;
    navigator.clipboard?.writeText(myJobId);
    setCopiedJobId(true);
    toast.success(`Copied Job ID: ${myJobId}`);
    setTimeout(() => setCopiedJobId(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50/70 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Hero Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs uppercase tracking-wider">
                  Direct Admin Help & Doubts
                </span>
                {myJobId && (
                  <button
                    type="button"
                    onClick={copyMyJobId}
                    className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-amber-200 border border-amber-400/30 font-mono text-xs font-bold transition-all cursor-pointer shadow-2xs backdrop-blur-xs"
                    title="Click to copy your Job ID"
                  >
                    <span className="text-slate-300 font-sans text-[10px] uppercase font-bold tracking-wider">JOB ID:</span>
                    <span className="text-amber-300">{myJobId}</span>
                    {copiedJobId ? <FiCheck className="text-emerald-400 text-xs ml-0.5" /> : <FiCopy className="text-slate-300 text-xs ml-0.5" />}
                  </button>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Ask Questions & Resolve Issues Directly
              </h1>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Have a doubt regarding tuition matching, commission rules, payment, or profile verification? 
                Ask our administration directly below and get verified official answers in this thread.
              </p>
            </div>

            <button
              onClick={() => setActiveTab(activeTab === 'create' ? 'list' : 'create')}
              className="inline-flex items-center px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md transition-all self-start sm:self-auto cursor-pointer"
            >
              {activeTab === 'create' ? (
                <>
                  <FiMessageSquare className="mr-1.5" />
                  View My Queries ({queries.length})
                </>
              ) : (
                <>
                  <FiPlus className="mr-1.5 text-base" />
                  Ask New Doubt
                </>
              )}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-3 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('list')}
            className={`inline-flex items-center space-x-2 pb-2 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'list'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FiMessageSquare size={16} />
            <span>My Queries & Doubts</span>
            {queries.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                {queries.length}
              </span>
            )}
            {unreadCounts?.queries > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-black bg-rose-500 text-white rounded-full animate-pulse">
                {unreadCounts.queries} new
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('create')}
            className={`inline-flex items-center space-x-2 pb-2 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'create'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FiPlus size={16} />
            <span>Ask a Doubt / Raise Issue</span>
          </button>
        </div>

        {/* Tab 1: New Doubt Form */}
        {activeTab === 'create' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
              <h2 className="text-lg font-black text-slate-900 mb-1">Submit Your Issue or Question</h2>
              <p className="text-xs text-slate-500 mb-6">
                Our support admins review all submissions and provide direct resolution and assistance.
              </p>

              <form onSubmit={handleSubmitQuery} className="space-y-4">
                {/* Category Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Category of Doubt <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Urgency Level
                  </label>
                  <div className="flex gap-2">
                    {['low', 'medium', 'high', 'urgent'].map(pr => (
                      <button
                        key={pr}
                        type="button"
                        onClick={() => setPriority(pr)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                          priority === pr
                            ? pr === 'urgent'
                              ? 'bg-rose-500 text-white shadow-xs'
                              : pr === 'high'
                              ? 'bg-amber-500 text-slate-950 shadow-xs'
                              : 'bg-slate-900 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {pr}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subject Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Subject / Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Question regarding Month 1 commission deduction or Student timing..."
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                {/* Detailed Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Detailed Message <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your issue or doubt in detail. Mention any specific tuition, student/teacher name, or dates if relevant..."
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                >
                  <FiSend />
                  <span>{submitting ? 'Submitting...' : 'Submit to Admin Support'}</span>
                </button>
              </form>
            </div>

            {/* Quick FAQs on the side */}
            <div className="space-y-4">
              <div className="bg-amber-50/60 rounded-3xl border border-amber-200/80 p-6 shadow-xs">
                <div className="flex items-center space-x-2 text-amber-900 font-extrabold text-sm mb-3">
                  <FiInfo size={18} />
                  <span>Frequently Asked Doubts</span>
                </div>
                <div className="space-y-3">
                  {FAQS_LIST.map((faq, i) => (
                    <div key={i} className="bg-white/80 p-3.5 rounded-2xl border border-amber-200/50 shadow-2xs">
                      <h4 className="font-bold text-slate-900 text-xs leading-snug mb-1">{faq.q}</h4>
                      <p className="text-[11px] text-slate-600 leading-relaxed">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: User Queries List */}
        {activeTab === 'list' && (
          <div className="space-y-4">
            {loading ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
                <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-slate-400 font-bold">Loading your doubts & queries...</p>
              </div>
            ) : queries.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
                <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <FiHelpCircle size={28} />
                </div>
                <h3 className="text-base font-bold text-slate-800">No Queries Submitted Yet</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-4">
                  Have any questions regarding tuition, commission, or verification? Ask our support admin directly.
                </p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="inline-flex items-center px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-xs"
                >
                  <FiPlus className="mr-1.5" />
                  Ask Your First Doubt
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {queries.map((q) => {
                  const hasResponse = Boolean(q.adminResponse);
                  const isUnread = !q.userViewed && hasResponse;

                  return (
                    <div
                      key={q._id}
                      className={`bg-white rounded-3xl border p-5 sm:p-6 transition-all shadow-xs hover:shadow-md ${
                        isUnread ? 'border-amber-400 ring-2 ring-amber-400/20 bg-amber-50/10' : 'border-slate-200/80'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="space-y-2 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black capitalize ${
                              q.status === 'open'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : q.status === 'in_progress'
                                ? 'bg-sky-100 text-sky-800 border border-sky-300'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            }`}>
                              {q.status === 'open' ? 'Open (Awaiting Reply)' : q.status === 'in_progress' ? 'In Progress' : 'Resolved'}
                            </span>

                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-bold text-[10px] capitalize">
                              {q.category?.replace(/_/g, ' ')}
                            </span>

                            {isUnread && (
                              <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white font-black text-[10px] animate-pulse">
                                NEW ADMIN REPLY
                              </span>
                            )}
                          </div>

                          <h3 className="font-extrabold text-slate-900 text-base">{q.subject}</h3>
                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{q.message}</p>

                          {/* Highlighted Admin Response Box */}
                          {hasResponse ? (
                            <div className="mt-3 bg-sky-50 border border-sky-200 rounded-2xl p-4 space-y-1">
                              <div className="flex items-center justify-between text-xs text-sky-900 font-bold">
                                <span className="inline-flex items-center space-x-1.5">
                                  <FiCheckCircle className="text-sky-600" />
                                  <span>Official Admin Response</span>
                                </span>
                                <span className="text-[10px] text-sky-600 font-semibold">
                                  {q.respondedAt ? new Date(q.respondedAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                                </span>
                              </div>
                              <p className="text-xs text-sky-950 font-medium whitespace-pre-line leading-relaxed">
                                {q.adminResponse}
                              </p>
                            </div>
                          ) : (
                            <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 text-xs text-slate-500 flex items-center space-x-2">
                              <FiClock className="text-amber-500" />
                              <span>Your query is currently queued for administrator review. Responses appear here.</span>
                            </div>
                          )}

                          <div className="text-[11px] text-slate-400 pt-1">
                            Submitted on {new Date(q.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0">
                          <button
                            onClick={() => handleOpenQuery(q)}
                            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center space-x-1"
                          >
                            <FiMessageSquare size={13} />
                            <span>{hasResponse ? 'View Thread & Reply' : 'View Thread'}</span>
                          </button>

                          {q.status !== 'resolved' && hasResponse && (
                            <button
                              onClick={() => handleMarkResolved(q._id)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1"
                            >
                              <FiCheckCircle size={13} />
                              <span>Mark Resolved</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Conversation Thread Modal */}
        {selectedQuery && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
              {/* Header */}
              <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/80">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black capitalize ${
                      selectedQuery.status === 'open'
                        ? 'bg-amber-100 text-amber-800'
                        : selectedQuery.status === 'in_progress'
                        ? 'bg-sky-100 text-sky-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {selectedQuery.status?.replace(/_/g, ' ')}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 text-[10px] font-bold capitalize">
                      {selectedQuery.category?.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <h3 className="font-black text-slate-900 text-base">{selectedQuery.subject}</h3>
                </div>

                <button
                  onClick={() => setSelectedQuery(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Message Thread History */}
              <div className="p-5 overflow-y-auto flex-1 space-y-4 max-h-[420px] bg-slate-50/40">
                {/* Original Message */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                    <span className="font-bold text-slate-700">You (Original Query)</span>
                    <span>{new Date(selectedQuery.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-slate-800 whitespace-pre-line leading-relaxed font-medium">
                    {selectedQuery.message}
                  </p>
                </div>

                {/* Follow-up messages */}
                {selectedQuery.conversation && selectedQuery.conversation.length > 1 && (
                  selectedQuery.conversation.slice(1).map((msg, idx) => {
                    const isAdmin = msg.sender === 'admin';
                    return (
                      <div
                        key={idx}
                        className={`flex ${isAdmin ? 'justify-start' : 'justify-end'}`}
                      >
                        <div className={`p-4 rounded-2xl max-w-[85%] text-xs shadow-2xs ${
                          isAdmin
                            ? 'bg-sky-50 text-sky-950 border border-sky-200 rounded-tl-xs'
                            : 'bg-slate-900 text-white rounded-tr-xs'
                        }`}>
                          <div className={`flex items-center justify-between text-[10px] mb-1 gap-2 ${
                            isAdmin ? 'text-sky-700' : 'text-slate-400'
                          }`}>
                            <span className="font-bold">{isAdmin ? 'ToppScorers Admin Support' : 'You'}</span>
                            <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="whitespace-pre-line leading-relaxed">{msg.message}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Follow-up Reply Input */}
              <div className="p-5 border-t border-slate-100 bg-white space-y-3">
                <textarea
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Have a follow-up question or need more clarification? Type your reply here..."
                  className="w-full text-xs p-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-slate-50 focus:bg-white resize-none"
                />

                <div className="flex items-center justify-between gap-3 flex-wrap">
                  {selectedQuery.status !== 'resolved' ? (
                    <button
                      type="button"
                      onClick={() => handleMarkResolved(selectedQuery._id)}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition-colors cursor-pointer"
                    >
                      <FiCheckCircle size={14} />
                      <span>My doubt is resolved</span>
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-700 font-bold flex items-center">
                      <FiCheckCircle className="mr-1" /> This doubt is marked resolved
                    </span>
                  )}

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setSelectedQuery(null)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      onClick={handleSendReply}
                      disabled={sendingReply}
                      className="inline-flex items-center px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                    >
                      <FiSend className="mr-1.5" />
                      {sendingReply ? 'Sending...' : 'Send Reply'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportQueries;
