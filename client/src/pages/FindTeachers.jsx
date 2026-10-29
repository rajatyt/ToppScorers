import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import ProfileCard from '../components/ProfileCard';
import ProfileCardSkeleton from '../components/ProfileCardSkeleton';
import ConnectModal from '../components/ConnectModal';
import { toast } from 'react-hot-toast';
import {
  FaSearch, FaFilter, FaChalkboardTeacher, FaGraduationCap,
  FaMapMarkerAlt, FaTimes, FaRupeeSign, FaShieldAlt
} from 'react-icons/fa';
import { FiLock, FiArrowRight, FiSliders } from 'react-icons/fi';
import { DISTRICTS, DISTRICT_AREAS } from '../utils/locationData';

const fetchTeachers = async (params) => {
  const { data } = await api.get('/teachers', { params });
  return data;
};

const FindTeachers = () => {
  const { t } = useTranslation();
  const { user, profile: userProfile, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // If logged-in as teacher, redirect to /students
  useEffect(() => {
    if (user && user.role === 'teacher') {
      toast('Tutors browse the Find Students directory', { icon: 'ℹ️' });
      navigate('/students', { replace: true });
    }
  }, [user, navigate]);

  // Filters state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [subject, setSubject] = useState(searchParams.get('subject') || '');
  const [exam, setExam] = useState(searchParams.get('exam') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [area, setArea] = useState(searchParams.get('area') || '');
  const [teachingMode, setTeachingMode] = useState(searchParams.get('mode') || 'all');
  const [experienceMin, setExperienceMin] = useState(searchParams.get('exp') || '');
  const [feeMax, setFeeMax] = useState(searchParams.get('feeMax') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Connect modal
  const [connectTarget, setConnectTarget] = useState(null);
  const [savedIds, setSavedIds] = useState(new Set());

  // Fetch saved IDs
  useEffect(() => {
    if (isAuthenticated) {
      api.get('/saved/ids')
        .then(res => {
          const ids = new Set((res.data || []).map(s => s.profileId));
          setSavedIds(ids);
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  // Query teachers
  const queryParams = {
    search: search.trim() || undefined,
    subject: subject || undefined,
    exam: exam || undefined,
    city: city || undefined,
    area: area || undefined,
    teachingMode: teachingMode !== 'all' ? teachingMode : undefined,
    experienceMin: experienceMin || undefined,
    feeMax: feeMax || undefined,
    sort,
    page,
    limit: 9
  };

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['teachers', queryParams],
    queryFn: () => fetchTeachers(queryParams),
    enabled: !user || user.role !== 'teacher',
    keepPreviousData: true
  });

  const handleToggleSave = async (profileId, profileType, targetUserId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      const res = await api.post('/saved/toggle', { profileId, profileType, targetUserId });
      setSavedIds(prev => {
        const next = new Set(prev);
        if (res.data.isSaved) next.add(profileId);
        else next.delete(profileId);
        return next;
      });
      toast.success(res.data.message);
    } catch (err) {
      toast.error('Failed to update saved list');
    }
  };

  const handleConnectClick = (profile) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setConnectTarget(profile);
  };

  const clearAllFilters = () => {
    setSearch('');
    setSubject('');
    setExam('');
    setCity('');
    setArea('');
    setTeachingMode('all');
    setExperienceMin('');
    setFeeMax('');
    setSort('newest');
    setPage(1);
  };

  const teachersList = data?.data || [];
  const totalCount = data?.total || 0;
  const totalPages = data?.pages || 1;
  const isGuest = data?.isGuest || !isAuthenticated;

  return (
    <div className="min-h-screen bg-slate-50/60 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Banner Header */}
        <div className="bg-gradient-to-br from-[#070b14] via-[#1a1208] to-[#070b14] text-white rounded-3xl p-6 sm:p-10 shadow-2xl mb-8 relative overflow-hidden border border-amber-500/20">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-2xl relative z-10">
            <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs uppercase tracking-wider mb-3 border border-amber-500/30 backdrop-blur-md">
              <FaChalkboardTeacher className="mr-1.5" />
              {t('directory.findTeachers')}
            </span>
            <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-black tracking-tight mb-2 leading-tight">
              {t('directory.findTeachers')}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6 font-medium">
              {t('directory.teacherSub')}
            </p>

            {/* Quick Search Input */}
            <div className="flex bg-slate-900/90 backdrop-blur-xl rounded-2xl p-1.5 shadow-2xl border border-white/20 text-white">
              <div className="flex-1 flex items-center pl-3">
                <FaSearch className="text-amber-400 mr-2.5 flex-shrink-0" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder={t('common.searchTeachersPlaceholder', 'Search by subject, tutor name, or area...')}
                  className="w-full text-xs sm:text-sm bg-transparent focus:outline-none placeholder:text-slate-400 text-white font-medium"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => { setSearch(''); setPage(1); }}
                    className="text-slate-400 hover:text-white text-xs px-2 py-1"
                  >
                    ✕
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => refetch()}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs sm:text-sm uppercase tracking-wider transition-all shadow-glow-sm hover:shadow-glow-md cursor-pointer active:scale-95"
              >
                {t('common.search', 'Search')}
              </button>
            </div>
          </div>
        </div>

        {/* Guest Preview Notice Banner */}
        {isGuest && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center space-x-3 text-amber-900 text-xs sm:text-sm">
              <div className="p-2 rounded-xl bg-amber-200/80 text-amber-900 flex-shrink-0">
                <FiLock size={18} />
              </div>
              <div>
                <span className="font-bold">{t('common.guestPreviewTitle', 'Viewing Guest Preview')}:</span> {t('directory.guestPreviewNotice')}
              </div>
            </div>
            <Link
              to="/login"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold whitespace-nowrap shadow-xs transition-colors flex items-center"
            >
              {t('directory.signInToView')}
              <FiArrowRight className="ml-1.5" />
            </Link>
          </div>
        )}

        {/* Layout: Sidebar Filter + Card Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs sticky top-24">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <span className="font-extrabold text-slate-900 text-sm flex items-center">
                  <FaFilter className="text-amber-500 mr-2 text-xs" />
                  {t('directory.filters')}
                </span>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-xs text-slate-400 hover:text-amber-600 font-semibold cursor-pointer"
                >
                  {t('directory.resetAll')}
                </button>
              </div>

              <div className="space-y-4 text-xs">
                {/* Subject Filter */}
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    {t('directory.subject')}
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => { setSubject(e.target.value); setPage(1); }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-800"
                  >
                    <option value="">All Subjects</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology (Botany & Zoology)</option>
                    <option value="Science">General Science (Classes 1–10)</option>
                    <option value="Social Science">Social Science (History, Civics, Geo)</option>
                    <option value="English">English</option>
                    <option value="Commerce">Commerce & Accountancy</option>
                    <option value="Economics">Economics</option>
                    <option value="Aptitude">Quantitative Aptitude & Reasoning</option>
                    <option value="Coding">Coding & Data Science</option>
                  </select>
                </div>

                {/* Exam Filter */}
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Target Exam
                  </label>
                  <select
                    value={exam}
                    onChange={(e) => { setExam(e.target.value); setPage(1); }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-800"
                  >
                    <option value="">All Exams</option>
                    <option value="JEE">JEE Main & Advanced</option>
                    <option value="NEET">NEET Medical</option>
                    <option value="Foundation">Foundation (Classes 6–10 / Olympiads)</option>
                    <option value="CBSE">CBSE Board (10th & 12th)</option>
                    <option value="ICSE">ICSE / ISC Board</option>
                    <option value="State Board">State Boards</option>
                    <option value="CUET">CUET (Central Universities)</option>
                    <option value="BITSAT">BITSAT & State CETs</option>
                    <option value="UPSC">UPSC Civil Services & PCS</option>
                    <option value="GATE">GATE & Engineering Exams</option>
                    <option value="SSC">SSC, Banking & Railways</option>
                    <option value="Defence">Defence (NDA / CDS)</option>
                    <option value="CTET">CTET & Teaching Exams</option>
                    <option value="CLAT">CLAT, CAT & Law/Mgmt</option>
                  </select>
                </div>

                {/* District Filter (Prayagraj) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-slate-700 uppercase tracking-wider flex items-center">
                      <FaMapMarkerAlt className="text-amber-500 mr-1.5 text-xs" />
                      District
                    </label>
                    {city && (
                      <button
                        type="button"
                        onClick={() => { setCity(''); setArea(''); setPage(1); }}
                        className="text-[10px] text-amber-600 hover:underline font-semibold"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <select
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      setArea(''); // reset area on district change
                      setPage(1);
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-800 font-medium"
                  >
                    <option value="">All Districts (Prayagraj)</option>
                    {DISTRICTS.map((dist) => (
                      <option key={dist} value={dist}>{dist}</option>
                    ))}
                  </select>
                </div>

                {/* Cascading Area Filter */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-slate-700 uppercase tracking-wider flex items-center">
                      <FaMapMarkerAlt className="text-amber-500 mr-1.5 text-xs" />
                      Area / Locality
                    </label>
                    {area && (
                      <button
                        type="button"
                        onClick={() => { setArea(''); setPage(1); }}
                        className="text-[10px] text-amber-600 hover:underline font-semibold"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <select
                    value={area}
                    onChange={(e) => { setArea(e.target.value); setPage(1); }}
                    disabled={!city}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-800 font-medium disabled:opacity-50 disabled:bg-slate-100 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {city ? `All Areas in ${city}` : 'Select District first'}
                    </option>
                    {city && DISTRICT_AREAS[city]?.map((areaName) => (
                      <option key={areaName} value={areaName}>{areaName}</option>
                    ))}
                  </select>
                </div>

                {/* Teaching Mode */}
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Teaching Mode
                  </label>
                  <select
                    value={teachingMode}
                    onChange={(e) => { setTeachingMode(e.target.value); setPage(1); }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-800"
                  >
                    <option value="all">Any Mode (Online or In-Person)</option>
                    <option value="online">Online Only</option>
                    <option value="home">Home Tuition</option>
                    <option value="institute">At Institute / Coaching</option>
                  </select>
                </div>

                {/* Max Monthly Fee */}
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Max Fee (₹/month)
                  </label>
                  <input
                    type="number"
                    value={feeMax}
                    onChange={(e) => { setFeeMax(e.target.value); setPage(1); }}
                    placeholder="e.g. 3000"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-800"
                  />
                </div>

                {/* Min Experience */}
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Min Experience (Years)
                  </label>
                  <input
                    type="number"
                    value={experienceMin}
                    onChange={(e) => { setExperienceMin(e.target.value); setPage(1); }}
                    placeholder="e.g. 3"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-800"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Directory Listings */}
          <div className="lg:col-span-3">
            {/* Top Bar: Count & Sort */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 mb-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="text-slate-600 font-medium">
                Showing <strong className="text-slate-900">{teachersList.length}</strong> of{' '}
                <strong className="text-slate-900">{totalCount}</strong> verified educators
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                  Sort By:
                </span>
                <select
                  value={sort}
                  onChange={(e) => { setSort(e.target.value); setPage(1); }}
                  className="p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-800 font-medium"
                >
                  <option value="newest">Newest First</option>
                  <option value="most_experienced">Most Experienced</option>
                  <option value="highest_rated">Highest Rated</option>
                  <option value="fee_low">Fee: Low to High</option>
                  <option value="fee_high">Fee: High to Low</option>
                </select>
              </div>
            </div>

            {/* Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => (
                  <ProfileCardSkeleton key={i} />
                ))}
              </div>
            ) : isError ? (
              <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center text-slate-700">
                <p className="font-bold text-rose-600 mb-1">Failed to load directory</p>
                <p className="text-xs text-slate-500 mb-4">{error?.message || 'Server error'}</p>
                <button
                  onClick={() => refetch()}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
                >
                  Try Again
                </button>
              </div>
            ) : teachersList.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                  <FaChalkboardTeacher size={28} />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">No tutors match your search</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                  Try broadening your subject, exam, or city filters to view more tutors.
                </p>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {teachersList.map((teacher) => (
                  <ProfileCard
                    key={teacher._id}
                    profile={teacher}
                    type="teacher"
                    isSaved={savedIds.has(teacher._id)}
                    onToggleSave={handleToggleSave}
                    onConnect={handleConnectClick}
                    isGuest={isGuest}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center space-x-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  Previous
                </button>
                <span className="text-xs font-bold text-slate-600 px-3">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Connect Request Modal */}
      <ConnectModal
        isOpen={Boolean(connectTarget)}
        onClose={() => setConnectTarget(null)}
        targetProfile={connectTarget}
        onSuccess={() => refetch()}
      />
    </div>
  );
};

export default FindTeachers;
