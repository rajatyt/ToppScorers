import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FiEdit2, FiTrash2, FiPlus, FiX, FiSearch, 
  FiCheckCircle, FiBookOpen, FiMapPin, FiAward, 
  FiCalendar, FiFilter, FiUserCheck, FiUser 
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

const ProfileManager = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('teachers'); // 'teachers' | 'students'
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', 
    subjects: '', exams: '', qualifications: '', 
    experience: '', bio: '', classOrExam: '',
    location: { city: '', state: '', pincode: '' }
  });

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/admin/${activeTab}`);
      setProfiles(res.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to load ${activeTab} profiles`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, [activeTab]);

  const handleOpenModal = (item = null) => {
    setEditingProfile(item);
    if (item) {
      const u = item.userId || {};
      setFormData({
        name: u.name || '',
        email: u.email || '',
        phone: u.phone || '',
        password: '',
        subjects: Array.isArray(item.subjects) ? item.subjects.join(', ') : (item.subjectsNeeded?.join(', ') || ''),
        exams: Array.isArray(item.exams) ? item.exams.join(', ') : '',
        qualifications: Array.isArray(item.qualifications) ? item.qualifications.join(', ') : '',
        experience: item.experience || '',
        bio: item.bio || '',
        classOrExam: item.classOrExam || '',
        location: {
          city: item.location?.city || '',
          state: item.location?.state || '',
          pincode: item.location?.pincode || ''
        }
      });
    } else {
      setFormData({
        name: '', email: '', phone: '', password: '', 
        subjects: '', exams: '', qualifications: '', 
        experience: '', bio: '', classOrExam: '',
        location: { city: '', state: '', pincode: '' }
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const parsedSubjects = formData.subjects.split(',').map(s => s.trim()).filter(Boolean);
      const parsedExams = formData.exams.split(',').map(s => s.trim()).filter(Boolean);
      const parsedQuals = formData.qualifications.split(',').map(s => s.trim()).filter(Boolean);

      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        ...(formData.password && { password: formData.password }),
        location: formData.location,
        ...(activeTab === 'teachers' ? {
          subjects: parsedSubjects,
          exams: parsedExams,
          qualifications: parsedQuals,
          experience: Number(formData.experience) || 0,
          bio: formData.bio,
        } : {
          subjectsNeeded: parsedSubjects,
          classOrExam: formData.classOrExam,
        })
      };

      const endpoint = `/admin/${activeTab}`;
      
      if (editingProfile) {
        await axios.put(`${endpoint}/${editingProfile._id}`, payload);
        toast.success('Profile updated successfully');
      } else {
        await axios.post(endpoint, payload);
        toast.success('Profile created successfully');
      }
      setIsModalOpen(false);
      fetchProfiles();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save profile');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this profile and user account?')) {
      try {
        await axios.delete(`/admin/${activeTab}/${id}`);
        toast.success('Profile deleted successfully');
        fetchProfiles();
      } catch (error) {
        toast.error('Failed to delete profile');
      }
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await axios.patch(`/admin/${activeTab}/${id}/status`, { status });
      toast.success(`Profile status set to ${status}`);
      fetchProfiles();
    } catch (error) {
      toast.error('Failed to update approval status');
    }
  };

  const filteredProfiles = profiles.filter(p => {
    const name = p.userId?.name || '';
    const email = p.userId?.email || '';
    const city = p.location?.city || '';
    const subs = Array.isArray(p.subjects) ? p.subjects.join(' ') : (p.subjectsNeeded?.join(' ') || '');
    const q = searchTerm.toLowerCase();
    return name.toLowerCase().includes(q) || 
           email.toLowerCase().includes(q) || 
           city.toLowerCase().includes(q) ||
           subs.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Profile Management
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage comprehensive educator credentials, demo lectures, student requests, and verified qualifications.
          </p>
        </div>

        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] shrink-0"
        >
          <FiPlus size={16} />
          <span>Add New {activeTab === 'teachers' ? 'Teacher' : 'Student'}</span>
        </button>
      </div>

      {/* Tabs & Search Controls */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Tab Buttons */}
        <div className="flex items-center space-x-2 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTab('teachers')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'teachers'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <FiBookOpen />
            <span>Teachers Directory</span>
            <span className="px-1.5 py-0.2 bg-blue-100 text-blue-700 rounded-full text-[10px]">
              {activeTab === 'teachers' ? profiles.length : '•'}
            </span>
          </button>
          
          <button
            onClick={() => setActiveTab('students')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'students'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <FiUserCheck />
            <span>Students & Institutes</span>
            <span className="px-1.5 py-0.2 bg-amber-100 text-amber-700 rounded-full text-[10px]">
              {activeTab === 'students' ? profiles.length : '•'}
            </span>
          </button>
        </div>

        {/* Live Search Bar */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <FiSearch size={16} />
          </div>
          <input
            type="text"
            placeholder={`Search ${activeTab} by name, subject, or city...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
          />
        </div>
      </div>

      {/* Profiles Data Grid */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
        {loading ? (
          <div className="flex flex-col justify-center items-center py-16 space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-3 border-slate-200 border-t-amber-500"></div>
            <p className="text-xs text-slate-500">Loading {activeTab} profiles...</p>
          </div>
        ) : filteredProfiles.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead className="bg-slate-50 text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5 text-left">Educator / Candidate</th>
                  <th className="px-6 py-3.5 text-left">Specialization / Needs</th>
                  <th className="px-6 py-3.5 text-left">Exams / Target</th>
                  <th className="px-6 py-3.5 text-left">Location</th>
                  <th className="px-6 py-3.5 text-left">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProfiles.map((p) => {
                  const u = p.userId || {};
                  const subjects = p.subjects || p.subjectsNeeded || [];
                  return (
                    <tr key={p._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3.5">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-900 to-slate-800 text-amber-400 font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                            {(u.name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                              <span>{u.name || 'Anonymous User'}</span>
                              {p.isVerified && (
                                <FiCheckCircle className="text-emerald-500" title="Verified Profile" />
                              )}
                            </div>
                            <div className="text-xs text-slate-500">{u.email}</div>
                            {u.phone && <div className="text-[11px] text-slate-400">{u.phone}</div>}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {subjects.length > 0 ? (
                            subjects.map((sub, i) => (
                              <span key={i} className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                {sub}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400">-</span>
                          )}
                          {p.experience ? (
                            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                              {p.experience} yrs exp
                            </span>
                          ) : null}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {p.exams && p.exams.length > 0 ? (
                            p.exams.map((ex, i) => (
                              <span key={i} className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                                {ex}
                              </span>
                            ))
                          ) : p.classOrExam ? (
                            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                              {p.classOrExam}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">All Levels</span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-600">
                        <div className="flex items-center space-x-1">
                          <FiMapPin className="text-slate-400" />
                          <span>{p.location?.city ? `${p.location.city}, ${p.location.state || 'India'}` : 'Location Flexible'}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={p.approvalStatus || 'pending'}
                          onChange={(e) => handleUpdateStatus(p._id, e.target.value)}
                          className={`text-xs font-bold px-2.5 py-1 rounded-lg border focus:outline-none ${
                            p.approvalStatus === 'approved'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : p.approvalStatus === 'suspended'
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="suspended">Suspended</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                        <button 
                          onClick={() => handleOpenModal(p)}
                          className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Profile"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(p._id)}
                          className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Profile"
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
            No {activeTab} profiles found matching your search.
          </div>
        )}
      </div>

      {/* Edit/Add Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingProfile ? `Edit ${activeTab === 'teachers' ? 'Teacher' : 'Student'} Profile` : `Create New ${activeTab === 'teachers' ? 'Teacher' : 'Student'}`}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Full Name</label>
              <input 
                type="text" 
                required 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                placeholder="e.g. Ramesh Chandra"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Email Address</label>
              <input 
                type="email" 
                required 
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                placeholder="teacher@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Phone Number</label>
              <input 
                type="text" 
                value={formData.phone} 
                onChange={e => setFormData({...formData, phone: e.target.value})} 
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                placeholder="9876543210"
              />
            </div>

            {!editingProfile && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Password</label>
                <input 
                  type="password" 
                  required 
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})} 
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  placeholder="••••••••"
                />
              </div>
            )}

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {activeTab === 'teachers' ? 'Subjects Taught (comma separated)' : 'Subjects Needed (comma separated)'}
              </label>
              <input 
                type="text" 
                value={formData.subjects} 
                onChange={e => setFormData({...formData, subjects: e.target.value})} 
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                placeholder="Mathematics, Physics, Chemistry"
              />
            </div>

            {activeTab === 'teachers' ? (
              <>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Exams Prepared (comma separated)</label>
                  <input 
                    type="text" 
                    value={formData.exams} 
                    onChange={e => setFormData({...formData, exams: e.target.value})} 
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    placeholder="JEE Main, NEET, CUET, Foundation"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Experience (Years)</label>
                  <input 
                    type="number" 
                    value={formData.experience} 
                    onChange={e => setFormData({...formData, experience: e.target.value})} 
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    placeholder="5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Qualifications / TET / CTET</label>
                  <input 
                    type="text" 
                    value={formData.qualifications} 
                    onChange={e => setFormData({...formData, qualifications: e.target.value})} 
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    placeholder="M.Sc Physics, CTET Paper 2"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Teacher Biography & Pitch</label>
                  <textarea 
                    rows="3" 
                    value={formData.bio} 
                    onChange={e => setFormData({...formData, bio: e.target.value})} 
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    placeholder="Brief background about results produced, pedagogy, and demo lectures..."
                  />
                </div>
              </>
            ) : (
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Target Class or Exam</label>
                <input 
                  type="text" 
                  value={formData.classOrExam} 
                  onChange={e => setFormData({...formData, classOrExam: e.target.value})} 
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  placeholder="Class 12th CBSE / JEE 2027"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">City</label>
              <input 
                type="text" 
                value={formData.location.city} 
                onChange={e => setFormData({...formData, location: {...formData.location, city: e.target.value}})} 
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                placeholder="Kota / Delhi / Bengaluru"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">State</label>
              <input 
                type="text" 
                value={formData.location.state} 
                onChange={e => setFormData({...formData, location: {...formData.location, state: e.target.value}})} 
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                placeholder="Rajasthan"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)} 
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl shadow-md transition-colors"
            >
              {submitting ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProfileManager;
