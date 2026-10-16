import React, { useState, useEffect } from 'react';
import { 
  FiSearch, FiEye, FiTrash2, FiX, FiUser, 
  FiMail, FiPhone, FiCalendar, FiShield, 
  FiSmartphone, FiMonitor, FiActivity, FiGlobe 
} from 'react-icons/fi';
import axios from '../../api/axios';
import toast from 'react-hot-toast';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col my-8 border border-slate-100 overflow-hidden animate-fadeInUp">
        <div className="flex justify-between items-center px-6 py-4.5 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <button 
            onClick={onClose} 
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  
  // Selected user detail for modal
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, sessionsRes] = await Promise.all([
        axios.get('/admin/users'),
        axios.get('/admin/sessions')
      ]);
      setUsers(usersRes.data || []);
      setSessions(sessionsRes.data || []);
    } catch (error) {
      toast.error('Failed to fetch user directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleViewUser = async (user) => {
    try {
      setLoadingDetail(true);
      setSelectedUserDetail({ user });
      const res = await axios.get(`/admin/users/${user._id}`);
      setSelectedUserDetail(res.data);
    } catch (error) {
      toast.error('Could not load user profile details');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this user account, profile, and active sessions?')) {
      try {
        await axios.delete(`/admin/users/${id}`);
        toast.success('User account removed');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  const handlePurgeNonAdmin = async () => {
    if (window.confirm('Are you sure you want to delete all non-admin user accounts, profiles, and sessions? Only admin accounts will be kept.')) {
      try {
        const res = await axios.delete('/admin/users-purge');
        toast.success(res.data.message || 'All non-admin user accounts removed');
        fetchData();
      } catch (error) {
        toast.error('Failed to purge user accounts');
      }
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.patch(`/admin/users/${userId}/role`, { role: newRole });
      toast.success(`Role updated to ${newRole}`);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user role');
    }
  };

  const handleRevokeSession = async (sessionId) => {
    try {
      await axios.delete(`/admin/sessions/${sessionId}`);
      toast.success('Session revoked successfully');
      const sessionsRes = await axios.get('/admin/sessions');
      setSessions(sessionsRes.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to revoke session');
    }
  };

  const handleRevokeAllUserSessions = async (userId) => {
    if (window.confirm('Are you sure you want to revoke all active sessions for this user? They will be logged out immediately across all devices.')) {
      try {
        const res = await axios.delete(`/admin/users/${userId}/sessions`);
        toast.success(res.data?.message || 'All sessions revoked');
        const sessionsRes = await axios.get('/admin/sessions');
        setSessions(sessionsRes.data || []);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to revoke user sessions');
      }
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (user.phone || '').includes(searchTerm);
    const matchesRole = roleFilter ? user.role === roleFilter : true;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role) => {
    switch (role) {
      case 'teacher': 
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">Teacher</span>;
      case 'student': 
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200">Student</span>;
      case 'admin': 
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-rose-50 text-rose-700 border border-rose-200">Admin</span>;
      default: 
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-700">{role}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            User Directory & Access Control
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            View all registered users, verify credentials, and monitor live authenticated session tokens across devices.
          </p>
        </div>

        {/* Counter Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
            Total: {users.length}
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Sessions: {sessions.length}</span>
          </span>
          {users.some(u => u.role !== 'admin') && (
            <button
              type="button"
              onClick={handlePurgeNonAdmin}
              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 flex items-center space-x-1 transition-colors cursor-pointer"
              title="Remove all previous non-admin user accounts"
            >
              <FiTrash2 size={13} />
              <span>Purge Non-Admin Users</span>
            </button>
          )}
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <FiSearch size={16} />
          </div>
          <input
            type="text"
            placeholder="Search users by name, email, or phone number..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="w-full sm:w-48">
          <select
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All Roles ({users.length})</option>
            <option value="teacher">Teachers ({users.filter(u => u.role === 'teacher').length})</option>
            <option value="student">Students ({users.filter(u => u.role === 'student').length})</option>
            <option value="admin">Administrators ({users.filter(u => u.role === 'admin').length})</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
        {loading ? (
          <div className="flex flex-col justify-center items-center py-16 space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-3 border-slate-200 border-t-amber-500"></div>
            <p className="text-xs text-slate-500">Loading user records...</p>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead className="bg-slate-50 text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5 text-left">User Profile</th>
                  <th className="px-6 py-3.5 text-left">Role</th>
                  <th className="px-6 py-3.5 text-left">Status</th>
                  <th className="px-6 py-3.5 text-left">Registered Date</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => {
                  const isOnline = sessions.some(s => s.userId?._id === user._id || s.userId === user._id);
                  return (
                    <tr key={user._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3.5">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-900 to-slate-800 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                            {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{user.name || 'Anonymous User'}</div>
                            <div className="text-xs text-slate-500">{user.email}</div>
                            {user.phone && <div className="text-[11px] text-slate-400">{user.phone}</div>}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user._id, e.target.value)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-lg border focus:outline-none transition-colors ${
                            user.role === 'admin'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : user.role === 'teacher'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          <option value="student">Student</option>
                          <option value="teacher">Teacher</option>
                          <option value="admin">Administrator</option>
                        </select>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {isOnline ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                            Online Token
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">
                            Offline
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right space-x-1.5">
                        {isOnline && (
                          <button 
                            onClick={() => handleRevokeAllUserSessions(user._id)}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors inline-flex items-center"
                            title="Revoke all active device sessions for this user"
                          >
                            <FiActivity size={16} />
                          </button>
                        )}
                        <button 
                          onClick={() => handleViewUser(user)}
                          className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center"
                          title="View Details & Sessions"
                        >
                          <FiEye size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(user._id)}
                          className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-flex items-center"
                          title="Delete User"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-slate-400 text-sm">
            No users found matching your search.
          </div>
        )}
      </div>

      {/* User Details Modal */}
      <Modal 
        isOpen={!!selectedUserDetail} 
        onClose={() => setSelectedUserDetail(null)} 
        title="Comprehensive User Profile & Sessions"
      >
        {selectedUserDetail && (
          <div className="space-y-6">
            {/* User Core Info Card */}
            <div className="flex items-center space-x-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 text-amber-400 font-extrabold text-xl flex items-center justify-center shadow-md">
                {(selectedUserDetail.user?.name || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="space-y-0.5">
                <div className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <span>{selectedUserDetail.user?.name || 'Anonymous User'}</span>
                  {getRoleBadge(selectedUserDetail.user?.role)}
                </div>
                <div className="text-xs text-slate-600 flex items-center space-x-1.5">
                  <FiMail size={13} />
                  <span>{selectedUserDetail.user?.email}</span>
                </div>
                {selectedUserDetail.user?.phone && (
                  <div className="text-xs text-slate-500 flex items-center space-x-1.5">
                    <FiPhone size={13} />
                    <span>{selectedUserDetail.user?.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Linked Profile Info */}
            {selectedUserDetail.profile ? (
              <div className="p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                  {selectedUserDetail.user?.role === 'teacher' ? 'Teaching Credentials' : 'Learning Needs'}
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {selectedUserDetail.profile.subjects && (
                    <div className="sm:col-span-2">
                      <span className="font-semibold text-slate-700">Subjects: </span>
                      <span className="text-slate-600">{selectedUserDetail.profile.subjects.join(', ')}</span>
                    </div>
                  )}
                  {selectedUserDetail.profile.exams && selectedUserDetail.profile.exams.length > 0 && (
                    <div className="sm:col-span-2">
                      <span className="font-semibold text-slate-700">Exams: </span>
                      <span className="text-slate-600">{selectedUserDetail.profile.exams.join(', ')}</span>
                    </div>
                  )}
                  {selectedUserDetail.profile.experience && (
                    <div>
                      <span className="font-semibold text-slate-700">Experience: </span>
                      <span className="text-slate-600">{selectedUserDetail.profile.experience} Years</span>
                    </div>
                  )}
                  {selectedUserDetail.profile.location?.city && (
                    <div>
                      <span className="font-semibold text-slate-700">Location: </span>
                      <span className="text-slate-600">{selectedUserDetail.profile.location.city}, {selectedUserDetail.profile.location.state}</span>
                    </div>
                  )}
                  {selectedUserDetail.profile.bio && (
                    <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                      <div className="font-semibold text-slate-700 mb-1">Biography:</div>
                      <p className="text-slate-600 italic leading-relaxed">{selectedUserDetail.profile.bio}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                No supplementary profile document attached to this account.
              </div>
            )}

            {/* Active Sessions with Revoke Options */}
            {(() => {
              const userSessions = sessions.filter(s => s.userId?._id === selectedUserDetail.user?._id || s.userId === selectedUserDetail.user?._id);
              return (
                <div className="space-y-3 pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                      <FiActivity size={14} className="text-emerald-500" />
                      <span>Active Authenticated Sessions ({userSessions.length})</span>
                    </h4>
                    {userSessions.length > 0 && (
                      <button
                        type="button"
                        onClick={() => handleRevokeAllUserSessions(selectedUserDetail.user?._id)}
                        className="px-2.5 py-1 text-[11px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer flex items-center space-x-1"
                      >
                        <FiTrash2 size={12} />
                        <span>Revoke All Sessions</span>
                      </button>
                    )}
                  </div>

                  {userSessions.length > 0 ? (
                    <div className="space-y-2">
                      {userSessions.map((s) => (
                        <div key={s._id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-slate-800 flex items-center space-x-2">
                              <span className="truncate">{s.device || 'Web Browser'}</span>
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                                <span className="w-1 h-1 rounded-full bg-emerald-500 mr-1 animate-pulse"></span>
                                Active
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                              IP: {s.ip}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              Last active: {new Date(s.lastActive || s.createdAt).toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <button
                              type="button"
                              onClick={() => handleRevokeSession(s._id)}
                              className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-white hover:bg-rose-50 border border-rose-200 hover:border-rose-300 rounded-lg transition-colors shadow-2xs flex items-center space-x-1 cursor-pointer"
                              title="Revoke this device session immediately"
                            >
                              <FiTrash2 size={12} />
                              <span>Revoke</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
                      No active device sessions currently found for this user.
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserManager;
