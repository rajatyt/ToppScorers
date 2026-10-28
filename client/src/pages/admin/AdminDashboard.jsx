import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiUsers, FiBookOpen, FiActivity, FiGlobe, 
  FiArrowUpRight, FiPlusCircle, FiLayout, FiHelpCircle, 
  FiCheckCircle, FiServer, FiSmartphone, FiMonitor 
} from 'react-icons/fi';
import { FaHandshake } from 'react-icons/fa';
import axios from '../../api/axios';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalUsers: 0, totalTeachers: 0, totalStudents: 0, activeSessions: 0 });
  const [connMetrics, setConnMetrics] = useState({ totalRequests: 0, newLeads: 0, totalCommissionReceived: 0 });
  const [recentUsers, setRecentUsers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [phoneAlerts, setPhoneAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeUserTab, setActiveUserTab] = useState('all');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [usersRes, sessionsRes, connsRes, phoneAlertsRes] = await Promise.all([
          axios.get('/admin/users'),
          axios.get('/admin/sessions'),
          axios.get('/admin/connections').catch(() => ({ data: { metrics: {} } })),
          axios.get('/admin/phone-notifications?status=pending').catch(() => ({ data: [] }))
        ]);
        
        const users = usersRes.data || [];
        const activeSessions = sessionsRes.data || [];
        setPhoneAlerts(phoneAlertsRes.data || []);
        
        const teachers = users.filter(u => u.role === 'teacher').length;
        const students = users.filter(u => u.role === 'student').length;
        
        setStats({
          totalUsers: users.length,
          totalTeachers: teachers,
          totalStudents: students,
          activeSessions: activeSessions.length
        });

        if (connsRes.data?.metrics) {
          setConnMetrics({
            totalRequests: connsRes.data.metrics.totalRequests || 0,
            newLeads: connsRes.data.metrics.newLeads || 0,
            totalCommissionReceived: connsRes.data.metrics.totalCommissionReceived || 0
          });
        }

        const sortedUsers = [...users].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        setRecentUsers(sortedUsers);
        setSessions(activeSessions.slice(0, 6));
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error loading dashboard metrics');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const statCards = [
    { 
      title: 'Total Users', 
      value: stats.totalUsers, 
      subtext: 'Registered accounts', 
      icon: <FiUsers className="text-xl" />, 
      color: 'from-blue-600 to-indigo-600',
      badge: '+100% active',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    { 
      title: 'Verified Teachers', 
      value: stats.totalTeachers, 
      subtext: 'Active educators', 
      icon: <FiBookOpen className="text-xl" />, 
      color: 'from-emerald-500 to-teal-600',
      badge: 'Available to hire',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    { 
      title: 'Students & Institutes', 
      value: stats.totalStudents, 
      subtext: 'Seeking coaching', 
      icon: <FiGlobe className="text-xl" />, 
      color: 'from-amber-500 to-orange-500',
      badge: 'Active searchers',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    { 
      title: 'Active Sessions', 
      value: stats.activeSessions, 
      subtext: 'Real-time online tokens', 
      icon: <FiActivity className="text-xl" />, 
      color: 'from-purple-600 to-pink-600',
      badge: 'Live traffic',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200'
    },
  ];

  const filteredUsers = recentUsers.filter(user => {
    if (activeUserTab === 'all') return true;
    return user.role === activeUserTab;
  }).slice(0, 8);

  const getRoleBadge = (role) => {
    switch (role) {
      case 'teacher': 
        return (
          <span className="px-2.5 py-0.5 inline-flex items-center text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            Teacher
          </span>
        );
      case 'student': 
        return (
          <span className="px-2.5 py-0.5 inline-flex items-center text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            Student
          </span>
        );
      case 'admin': 
        return (
          <span className="px-2.5 py-0.5 inline-flex items-center text-xs font-semibold rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            Admin
          </span>
        );
      default: 
        return (
          <span className="px-2.5 py-0.5 inline-flex items-center text-xs font-semibold rounded-full bg-slate-100 text-slate-700">
            {role}
          </span>
        );
    }
  };

  const handleResolvePhoneAlert = async (id) => {
    try {
      await axios.post(`/admin/phone-notifications/${id}/resolve`);
      toast.success('Phone change acknowledged & marked updated');
      setPhoneAlerts(prev => prev.filter(a => a._id !== id));
    } catch (err) {
      toast.error('Failed to resolve phone alert');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-80 space-y-3">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-amber-500"></div>
        <p className="text-sm font-medium text-slate-500">Loading platform control center...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1e3a5f] via-[#244673] to-[#122842] text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-medium border border-white/10">
              <FiCheckCircle />
              <span>All Systems Operational</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome to ToppScorers Control Center
            </h2>
            <p className="text-slate-300 text-sm max-w-xl">
              Monitor real-time teacher and student applications, manage custom homepage widgets with drag-and-drop, and edit bilingual content across India.
            </p>
          </div>

          {/* Quick Actions Grid */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <button 
              onClick={() => navigate('/admin/connections')}
              className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02]"
            >
              <FaHandshake size={16} />
              <span>Connection Leads</span>
              {connMetrics.newLeads > 0 && (
                <span className="px-1.5 py-0.5 bg-slate-950 text-emerald-300 rounded-full text-[10px] font-black animate-pulse">
                  {connMetrics.newLeads} New
                </span>
              )}
            </button>
            <button 
              onClick={() => navigate('/admin/profiles')}
              className="flex items-center space-x-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02]"
            >
              <FiPlusCircle size={15} />
              <span>Add Profile</span>
            </button>
            <button 
              onClick={() => navigate('/admin/widgets')}
              className="flex items-center space-x-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium text-xs rounded-xl border border-white/20 backdrop-blur-md transition-all"
            >
              <FiLayout size={15} />
              <span>Layout Editor</span>
            </button>
            <button 
              onClick={() => navigate('/admin/faqs')}
              className="flex items-center space-x-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium text-xs rounded-xl border border-white/20 backdrop-blur-md transition-all"
            >
              <FiHelpCircle size={15} />
              <span>FAQ Content</span>
            </button>
          </div>
        </div>
      </div>

      {/* Verified Phone Number Change Alerts */}
      {phoneAlerts.length > 0 && (
        <div className="rounded-2xl border-2 border-amber-400 bg-amber-50/90 p-5 shadow-lg shadow-amber-500/10 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/80 pb-3 mb-4">
            <div className="flex items-center space-x-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md animate-bounce">
                <FiSmartphone size={20} />
              </span>
              <div>
                <h3 className="text-base font-extrabold text-amber-950 flex items-center gap-2">
                  <span>Verified Phone Number Changes</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-black bg-amber-200 text-amber-900 border border-amber-300">
                    {phoneAlerts.length} Action Required
                  </span>
                </h3>
                <p className="text-xs text-amber-800">
                  Verified tutors and students recently changed their contact phone numbers. Review and update official records personally.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/admin/queries')}
              className="text-xs font-bold text-amber-900 hover:text-amber-950 underline self-start sm:self-auto"
            >
              View in Query Log &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {phoneAlerts.map(alert => (
              <div 
                key={alert._id} 
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-3.5 bg-white rounded-xl border border-amber-200 shadow-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{alert.userName}</span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                      alert.role === 'teacher' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {alert.role === 'teacher' ? 'Verified Tutor' : 'Verified Student'}
                    </span>
                    {alert.jobId && (
                      <span className="font-mono text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        {alert.jobId}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                    <span className="line-through text-slate-400 font-mono">{alert.oldPhone || 'N/A'}</span>
                    <span className="font-bold text-emerald-600">➔</span>
                    <span className="font-mono font-bold text-slate-900 bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                      {alert.newPhone}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500">{new Date(alert.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto">
                  <button
                    onClick={() => handleResolvePhoneAlert(alert._id)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <FiCheckCircle size={14} />
                    <span>Updated in Records</span>
                  </button>
                  <button
                    onClick={() => navigate('/admin/profiles')}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, idx) => (
          <div 
            key={idx} 
            className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 relative overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {card.title}
                </span>
                <div className="text-3xl font-extrabold text-slate-900 mt-1.5 tracking-tight">
                  {card.value}
                </div>
                <div className="text-xs text-slate-500 mt-1 flex items-center space-x-1">
                  <span>{card.subtext}</span>
                </div>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${card.color} text-white flex items-center justify-center shadow-md`}>
                {card.icon}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${card.badgeColor}`}>
                {card.badge}
              </span>
              <span className="text-slate-400 text-xs flex items-center">
                Live Data <FiArrowUpRight className="ml-0.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics & Management Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Recent Registrations (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Recent Registrations</h3>
              <p className="text-xs text-slate-500">Newly registered educators, students & institutes</p>
            </div>
            
            {/* Filter Tabs */}
            <div className="flex items-center space-x-1 bg-slate-200/60 p-1 rounded-xl text-xs font-medium text-slate-600">
              <button 
                onClick={() => setActiveUserTab('all')} 
                className={`px-3 py-1 rounded-lg transition-colors ${activeUserTab === 'all' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'hover:text-slate-900'}`}
              >
                All
              </button>
              <button 
                onClick={() => setActiveUserTab('teacher')} 
                className={`px-3 py-1 rounded-lg transition-colors ${activeUserTab === 'teacher' ? 'bg-white text-blue-700 font-semibold shadow-xs' : 'hover:text-slate-900'}`}
              >
                Teachers
              </button>
              <button 
                onClick={() => setActiveUserTab('student')} 
                className={`px-3 py-1 rounded-lg transition-colors ${activeUserTab === 'student' ? 'bg-white text-amber-700 font-semibold shadow-xs' : 'hover:text-slate-900'}`}
              >
                Students
              </button>
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50 text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3 text-left">User</th>
                  <th className="px-5 py-3 text-left">Role</th>
                  <th className="px-5 py-3 text-left">Joined</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                            {(user.name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{user.name || 'Anonymous User'}</div>
                            <div className="text-xs text-slate-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-xs text-slate-500">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Recent'}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-right">
                        <button 
                          onClick={() => navigate('/admin/users')}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-5 py-8 text-center text-slate-400 text-sm">
                      No registrations found in this category.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-xs text-slate-500">
            <span>Showing {filteredUsers.length} of {recentUsers.length} total users</span>
            <button 
              onClick={() => navigate('/admin/users')}
              className="font-semibold text-blue-600 hover:text-blue-800 flex items-center"
            >
              Manage All Users <FiArrowUpRight className="ml-1" />
            </button>
          </div>
        </div>

        {/* Right: Live Sessions & System Health (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Sessions Card */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Active Logged-in Sessions</h3>
                <p className="text-xs text-slate-500">Real-time user tokens & device activity</p>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            </div>

            <div className="p-4 divide-y divide-slate-100 max-h-[380px] overflow-y-auto">
              {sessions.length > 0 ? (
                sessions.map((sess, i) => {
                  const isMobile = (sess.device || '').toLowerCase().includes('mobile') || (sess.device || '').toLowerCase().includes('android');
                  return (
                    <div key={i} className="py-3 first:pt-1 last:pb-1 flex items-start justify-between gap-3">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 rounded-xl bg-slate-100 text-slate-600 mt-0.5">
                          {isMobile ? <FiSmartphone size={16} /> : <FiMonitor size={16} />}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-900">
                            {sess.userId?.name || 'Authorized User'}
                          </div>
                          <div className="text-xs text-slate-500 font-mono">
                            IP: {sess.ip || '127.0.0.1'}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                            {sess.device || 'Web Browser'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active
                        </span>
                        <div className="text-[10px] text-slate-400 mt-1">
                          {sess.lastActive ? new Date(sess.lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-slate-400 text-sm">
                  No active session tokens currently recorded.
                </div>
              )}
            </div>
          </div>

          {/* Quick Platform Status */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl p-5 text-white shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                <FiServer className="text-amber-400" />
                <span>Platform Architecture</span>
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-mono">
                v1.0.0 (Production-Ready)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800">
                <div className="text-slate-400 text-[10px] uppercase font-semibold">Frontend Engine</div>
                <div className="font-semibold text-white mt-1">React 18 + Vite</div>
                <div className="text-[10px] text-slate-400">Tailwind + i18n</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800">
                <div className="text-slate-400 text-[10px] uppercase font-semibold">Backend Runtime</div>
                <div className="font-semibold text-white mt-1">Node.js + Express</div>
                <div className="text-[10px] text-slate-400">JWT + Mongoose</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
