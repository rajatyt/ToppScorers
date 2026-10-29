import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import ProfileCard from '../components/ProfileCard';
import ConnectModal from '../components/ConnectModal';
import { toast } from 'react-hot-toast';
import { FaBookmark, FaArrowLeft, FaArrowRight, FaSearch, FaUserGraduate, FaChalkboardTeacher } from 'react-icons/fa';

const SavedProfiles = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const [savedProfiles, setSavedProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [connectTarget, setConnectTarget] = useState(null);

  const isTeacher = user?.role === 'teacher';

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchSaved = async () => {
      setLoading(true);
      try {
        const res = await api.get('/saved');
        setSavedProfiles(res.data || []);
      } catch (err) {
        toast.error('Failed to load saved profiles');
      } finally {
        setLoading(false);
      }
    };

    fetchSaved();
  }, [isAuthenticated, navigate]);

  const handleToggleSave = async (profileId, profileType, targetUserId) => {
    try {
      await api.post('/saved/toggle', { profileId, profileType, targetUserId });
      setSavedProfiles(prev => prev.filter(p => p.profile._id !== profileId));
      toast.success('Removed from shortlist');
    } catch (err) {
      toast.error('Failed to update shortlist');
    }
  };

  const filteredProfiles = savedProfiles.filter(item => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const name = (item.profile?.userId?.name || '').toLowerCase();
    const city = (item.profile?.location?.city || item.profile?.city || '').toLowerCase();
    const area = (item.profile?.area || '').toLowerCase();
    const subjects = (item.profile?.subjects || []).join(' ').toLowerCase();
    const exams = (item.profile?.exams || []).join(' ').toLowerCase();
    return name.includes(term) || city.includes(term) || area.includes(term) || subjects.includes(term) || exams.includes(term);
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Back Link & Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-amber-600 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Back to Dashboard
          </Link>
          <span className="text-xs text-slate-400">
            {isTeacher ? 'Tutor Portal' : 'Student Portal'} ➔ Shortlist
          </span>
        </div>

        {/* Page Header Banner */}
        <div className="bg-gradient-to-r from-[#1e3a5f] via-[#244673] to-[#122842] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-semibold border border-white/10">
                <FaBookmark />
                <span>Personal Shortlist & Bookmarks</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {isTeacher 
                  ? `Bookmarked Students (${savedProfiles.length})` 
                  : `Saved Tutors (${savedProfiles.length})`}
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                {isTeacher 
                  ? 'Shortlisted students you have saved from the directory for quick reference and tuition coordination.' 
                  : 'Your saved educators ready for direct tuition requests and physical demo sessions.'}
              </p>
            </div>

            <div className="self-start md:self-center shrink-0">
              <Link
                to={isTeacher ? "/students" : "/teachers"}
                className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02]"
              >
                {isTeacher ? (
                  <>
                    <FaUserGraduate className="mr-2" />
                    <span>Browse More Students</span>
                  </>
                ) : (
                  <>
                    <FaChalkboardTeacher className="mr-2" />
                    <span>Explore More Tutors</span>
                  </>
                )}
                <FaArrowRight className="ml-2 text-[10px]" />
              </Link>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        {savedProfiles.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-md">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={isTeacher ? "Search saved students by name, area, class..." : "Search saved tutors by name, subject, exam..."}
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
              />
            </div>
            <div className="text-xs text-slate-500 font-semibold self-end sm:self-auto">
              Showing {filteredProfiles.length} of {savedProfiles.length}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-medium text-slate-500">Loading your saved shortlist...</p>
          </div>
        ) : filteredProfiles.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl border border-slate-200/80 p-10 text-center shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200 shadow-inner">
              <FaBookmark size={24} />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              {searchTerm ? 'No matching saved profiles found' : (isTeacher ? 'No bookmarked students yet' : 'No saved tutors yet')}
            </h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-6 leading-relaxed">
              {searchTerm 
                ? 'Try clearing your search query to view all shortlisted profiles.' 
                : (isTeacher 
                    ? 'Whenever you find an interesting student tuition requirement in the directory, click the bookmark icon to save them to this page.' 
                    : 'Click the bookmark icon on any verified tutor card in the directory to save them here for easy reference.')}
            </p>
            {searchTerm ? (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
              >
                Clear Search
              </button>
            ) : (
              <Link
                to={isTeacher ? "/students" : "/teachers"}
                className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all hover:scale-[1.02]"
              >
                {isTeacher ? 'Find Students Now' : 'Find Tutors Now'}
                <FaArrowRight className="ml-2 text-[10px]" />
              </Link>
            )}
          </div>
        ) : (
          /* Profiles Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfiles.map((item) => (
              <ProfileCard
                key={item._id}
                profile={item.profile}
                type={item.profileType || (isTeacher ? 'student' : 'teacher')}
                isSaved={true}
                onToggleSave={handleToggleSave}
                onConnect={(prof) => setConnectTarget(prof)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Connect Modal with Informative Verification Popup */}
      <ConnectModal
        isOpen={Boolean(connectTarget)}
        onClose={() => setConnectTarget(null)}
        targetProfile={connectTarget}
        onSuccess={() => {}}
      />
    </div>
  );
};

export default SavedProfiles;
