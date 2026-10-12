import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import {
  FaShieldAlt, FaFlag, FaBan, FaEye, FaCheckCircle,
  FaTimesCircle, FaSlidersH, FaUserCheck
} from 'react-icons/fa';

const ModerationManager = () => {
  const [activeTab, setActiveTab] = useState('settings'); // 'settings' | 'reports' | 'logs' | 'blocks'
  const [guestDirectoryVisible, setGuestDirectoryVisible] = useState(true);
  const [reports, setReports] = useState([]);
  const [viewLogs, setViewLogs] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch settings & data
  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'settings') {
        const res = await api.get('/admin/settings');
        setGuestDirectoryVisible(res.data.guestDirectoryVisible ?? true);
      } else if (activeTab === 'reports') {
        const res = await api.get('/admin/reports');
        setReports(res.data || []);
      } else if (activeTab === 'logs') {
        const res = await api.get('/admin/profile-views');
        setViewLogs(res.data || []);
      } else if (activeTab === 'blocks') {
        const res = await api.get('/admin/blocks');
        setBlocks(res.data || []);
      }
    } catch (err) {
      toast.error('Failed to load moderation data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleToggleGuestDirectory = async (value) => {
    setGuestDirectoryVisible(value);
    try {
      await api.put('/admin/settings', { guestDirectoryVisible: value });
      toast.success(`Guest directory preview ${value ? 'enabled' : 'disabled'}`);
    } catch (err) {
      toast.error('Failed to update guest directory setting');
    }
  };

  const handleReportAction = async (reportId, status) => {
    try {
      await api.patch(`/admin/reports/${reportId}`, { status });
      toast.success(`Report marked as ${status}`);
      fetchData();
    } catch (err) {
      toast.error('Failed to update report status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center">
            <FaShieldAlt className="text-amber-500 mr-2" />
            Safety, Moderation & Audit Logs
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit contact disclosures, review user complaints, and configure guest visibility.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex p-1 bg-slate-100 rounded-xl text-xs font-bold text-slate-600">
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'settings' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}`}
          >
            Settings
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'reports' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}`}
          >
            Reports
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'logs' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}`}
          >
            Address Logs
          </button>
          <button
            onClick={() => setActiveTab('blocks')}
            className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'blocks' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}`}
          >
            Blocks
          </button>
        </div>
      </div>

      {/* Content based on tab */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-400">Loading...</div>
      ) : activeTab === 'settings' ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
          <h3 className="font-bold text-slate-900 text-sm">Directory Access Configuration</h3>
          
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <span className="font-bold text-slate-900 text-xs block">
                Allow Guests to View Directory Previews
              </span>
              <span className="text-[11px] text-slate-500 max-w-md block">
                When enabled, non-logged-in visitors can browse teacher/student cards with masked names and cities. When disabled, guests are immediately prompted to log in.
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={guestDirectoryVisible}
                onChange={(e) => handleToggleGuestDirectory(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>
        </div>
      ) : activeTab === 'reports' ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 font-bold text-xs uppercase tracking-wider text-slate-500">
            User Reports ({reports.length})
          </div>
          {reports.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">No reports submitted yet.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {reports.map((r) => (
                <div key={r._id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md uppercase text-[10px]">
                        {r.reason.replace(/_/g, ' ')}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-600">Reported User: <strong>{r.targetId?.name || 'Deleted'}</strong> ({r.targetId?.email})</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-500">By: {r.reporterId?.name || 'User'}</span>
                    </div>
                    {r.description && <p className="text-slate-600 italic">"{r.description}"</p>}
                    <span className="text-[10px] text-slate-400">{new Date(r.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleReportAction(r._id, 'reviewed')}
                      className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold"
                    >
                      Reviewed
                    </button>
                    <button
                      onClick={() => handleReportAction(r._id, 'dismissed')}
                      className="px-3 py-1 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg text-xs font-bold"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === 'logs' ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 font-bold text-xs uppercase tracking-wider text-slate-500">
            Address & Phone View Audit Logs ({viewLogs.length})
          </div>
          {viewLogs.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">No audit logs recorded yet.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {viewLogs.map((l) => (
                <div key={l._id} className="p-3.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{l.viewerId?.name || 'User'}</span> ({l.viewerId?.role}){' '}
                    viewed contact info of <span className="font-bold text-slate-900">{l.targetId?.name || 'Target'}</span> ({l.targetId?.role})
                    <div className="flex items-center space-x-1.5 mt-0.5">
                      {l.viewedFields?.map((f, i) => (
                        <span key={i} className="px-1.5 py-0.5 bg-amber-50 text-amber-900 rounded text-[10px] font-bold">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 whitespace-nowrap">
                    {new Date(l.createdAt).toLocaleTimeString()} • {new Date(l.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 font-bold text-xs uppercase tracking-wider text-slate-500">
            User Blocks ({blocks.length})
          </div>
          {blocks.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">No active user blocks recorded.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {blocks.map((b) => (
                <div key={b._id} className="p-3.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{b.blockerId?.name || 'Blocker'}</span> ({b.blockerId?.email}){' '}
                    blocked <span className="font-bold text-rose-700">{b.blockedId?.name || 'Blocked'}</span> ({b.blockedId?.email})
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {new Date(b.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ModerationManager;
