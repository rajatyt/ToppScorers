import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FaCheckCircle, FaStar, FaMapMarkerAlt, FaBookmark, FaRegBookmark,
  FaGraduationCap, FaChalkboardTeacher, FaUserGraduate, FaRupeeSign,
  FaCompass, FaBookOpen
} from 'react-icons/fa';
import { FiArrowRight, FiLock, FiCopy, FiCheck } from 'react-icons/fi';

const ProfileCard = ({
  profile,
  type = 'teacher', // 'teacher' | 'student'
  isSaved = false,
  onToggleSave,
  onConnect,
  isGuest = false
}) => {
  const { t } = useTranslation();
  const isTeacher = type === 'teacher';
  const [copiedJobId, setCopiedJobId] = useState(false);

  const user = profile.userId || {};
  const name = profile.name || user.name || (isTeacher ? 'Verified Teacher' : 'Student');
  const photo = profile.profilePhotoUrl || user.avatar;
  const city = profile.location?.city || 'India';
  const area = profile.area ? `${profile.area}, ` : '';
  const locationString = `${area}${city}`;
  const subjects = isTeacher ? (profile.subjects || []) : (profile.subjectsNeeded || []);
  const exams = profile.exams || (profile.classOrExam ? [profile.classOrExam] : []);
  const feeAmount = profile.fee?.amount;
  const feePeriod = profile.fee?.period === 'hourly' ? '/hr' : '/month';
  const budgetMax = profile.budget?.max;

  // Format experience
  const rawExp = profile.experience || 0;
  const experienceText = rawExp > 0 ? `${rawExp}+ Years Experience` : 'Experienced Educator';

  // Format qualification / degree (e.g. B.Sc in Physics, Mathematics and D.ELED)
  const qualification = profile.degreeDetails?.highestDegree 
    ? `${profile.degreeDetails.highestDegree}${profile.degreeDetails.university ? ` (${profile.degreeDetails.university})` : ''}`
    : (Array.isArray(profile.qualifications) && profile.qualifications.length > 0 
        ? profile.qualifications.join(', ') 
        : (profile.qualification || profile.degree || ''));

  // Format Teaching Mode (e.g. Home & Online)
  const rawMode = profile.teachingMode || profile.preferences?.mode || 'all';
  const modeText = (rawMode === 'all' || rawMode === 'both')
    ? 'Home & Online'
    : (rawMode === 'home' ? 'Home Tuition' : (rawMode === 'online' ? 'Online' : rawMode));

  // Teaches classes string (e.g. Class 7, Class 8, Class 9)
  const teachesText = exams.length > 0 ? exams.join(', ') : '';

  const isConnected = profile.connectionStatus === 'accepted';
  const isPending = profile.connectionStatus === 'pending';

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/90 hover:border-amber-400/80 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden hover:-translate-y-0.5">
      {/* Top Banner accent stripe */}
      <div className={`h-1.5 w-full ${isTeacher ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600' : 'bg-gradient-to-r from-emerald-500 to-teal-400'}`} />

      <div className="p-4 sm:p-5 flex-grow flex flex-col justify-between space-y-3.5">
        <div>
          {/* Header: Photo, Name, Verified Badge, Location & Shortlist */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-start space-x-3.5 min-w-0">
              {/* Profile Image with verification badge overlay */}
              <div className="relative flex-shrink-0">
                {photo ? (
                  <img
                    src={photo}
                    alt={name}
                    className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover border-2 border-slate-100 shadow-md"
                  />
                ) : (
                  <div className={`w-16 h-16 sm:w-18 sm:h-18 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-md ${
                    isTeacher ? 'bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700' : 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                  }`}>
                    {isTeacher ? <FaChalkboardTeacher size={26} /> : <FaUserGraduate size={26} />}
                  </div>
                )}
                {profile.isVerified && (
                  <span className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-md" title="Verified Profile">
                    <FaCheckCircle className="text-emerald-500 text-sm" />
                  </span>
                )}
              </div>

              {/* Name, Verified Status & Location */}
              <div className="min-w-0 flex-1">
                <h3 className="font-extrabold text-slate-900 text-base sm:text-lg leading-snug truncate">
                  {name}
                </h3>

                {/* Badges Row: Verified Status + Job ID */}
                <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                  {isTeacher && (
                    profile.isVerified ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 font-extrabold text-[11px] shadow-2xs">
                        <FaCheckCircle className="text-emerald-500 text-[10px]" />
                        <span>Verified Expert</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 font-semibold text-[10px]">
                        <span>Educator Profile</span>
                      </span>
                    )
                  )}

                  {profile.jobId && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigator.clipboard?.writeText(profile.jobId);
                        setCopiedJobId(true);
                        setTimeout(() => setCopiedJobId(false), 2000);
                      }}
                      className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-slate-100 hover:bg-amber-100/70 text-slate-700 hover:text-amber-900 border border-slate-200 hover:border-amber-300 font-mono text-[10px] font-bold transition-all cursor-pointer shadow-2xs"
                      title="Click to copy Job ID"
                    >
                      <span className="text-slate-400 font-sans text-[9px] font-semibold tracking-wider">JOB ID:</span>
                      <span className="text-slate-900 font-extrabold">{profile.jobId}</span>
                      {copiedJobId ? (
                        <FiCheck className="text-emerald-600 text-[11px] ml-0.5" />
                      ) : (
                        <FiCopy className="text-slate-400 text-[10px] ml-0.5" />
                      )}
                    </button>
                  )}
                </div>

                {/* Location */}
                <div className="flex items-center text-xs text-slate-500 mt-1.5 space-x-1.5 flex-wrap">
                  <span className="flex items-center font-medium text-slate-600">
                    <FaMapMarkerAlt className="text-amber-500 mr-1 flex-shrink-0 text-xs" />
                    {locationString}
                  </span>
                  {profile.approxDistanceKm !== null && profile.approxDistanceKm !== undefined && (
                    <span className="inline-flex items-center text-emerald-700 font-semibold text-[10px] bg-emerald-50 border border-emerald-200/50 px-1.5 py-0.5 rounded">
                      <FaCompass className="mr-0.5 text-[9px]" />
                      ~{profile.approxDistanceKm} km
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Save / Shortlist Button */}
            {!isGuest && onToggleSave && (
              <button
                type="button"
                onClick={() => onToggleSave(profile._id, type, user._id)}
                className="p-2 rounded-xl text-slate-400 hover:text-amber-500 hover:bg-amber-50 transition-colors flex-shrink-0 cursor-pointer"
                title={isSaved ? "Remove from Shortlist" : "Save / Shortlist"}
              >
                {isSaved ? <FaBookmark className="text-amber-500" size={17} /> : <FaRegBookmark size={17} />}
              </button>
            )}
          </div>

          {/* Subjects Pills Row */}
          <div className="mb-2.5">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              {isTeacher ? 'Subjects' : 'Needs Tutoring In'}
            </div>
            <div className="flex flex-wrap gap-1.5 items-center">
              {subjects.length > 0 ? (
                subjects.map((sub, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-0.5 bg-amber-50/90 text-amber-950 font-bold text-xs rounded-lg border border-amber-200/60"
                  >
                    {sub}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">General / All Subjects</span>
              )}
            </div>
          </div>

          {/* Qualification / Degree (e.g. B.Sc in Physics, Mathematics and D.ELED) */}
          {qualification && (
            <div className="flex items-start space-x-2 text-xs text-slate-700 mb-2.5 bg-slate-50/80 px-2.5 py-1.5 rounded-lg border border-slate-200/50">
              <FaGraduationCap className="text-amber-600 mt-0.5 flex-shrink-0 text-xs" />
              <span className="font-semibold leading-tight text-slate-800">{qualification}</span>
            </div>
          )}

          {/* Experience & Mode Meta Row: e.g. "30+ Years Experience · Home & Online" */}
          <div className="flex items-center text-xs text-slate-600 mb-2.5 space-x-2 flex-wrap font-medium">
            <span className="text-slate-900 font-bold">{experienceText}</span>
            <span className="text-slate-300 font-bold">·</span>
            <span className="text-slate-700 font-semibold">{modeText}</span>
            {profile.rating && (
              <>
                <span className="text-slate-300 font-bold">·</span>
                <span className="inline-flex items-center text-amber-700 font-bold text-xs">
                  <FaStar className="text-amber-500 mr-1 text-[10px]" />
                  {profile.rating}
                </span>
              </>
            )}
          </div>

          {/* Teaches: Class 7, Class 8, Class 9 */}
          {isTeacher && teachesText && (
            <div className="text-xs text-slate-700 mb-2.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/60 flex items-center space-x-1.5">
              <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Teaches:</span>
              <span className="font-medium text-slate-800 truncate">{teachesText}</span>
            </div>
          )}

          {/* Student Class / Exam if Student Card */}
          {!isTeacher && (profile.classLevel || profile.classOrExam) && (
            <div className="text-xs text-slate-700 mb-2.5 bg-emerald-50/70 px-2.5 py-1.5 rounded-lg border border-emerald-200/60 flex items-center space-x-1.5">
              <span className="font-bold text-emerald-900 uppercase tracking-wider text-[11px]">Class / Exam:</span>
              <span className="font-semibold text-emerald-800">{profile.classLevel || profile.classOrExam}</span>
            </div>
          )}

          {/* Bio snippet if available */}
          {profile.bio && (
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-1">
              {profile.bio}
            </p>
          )}
        </div>
      </div>

      {/* Symmetrical 2-row Footer: Fee/Budget & Compact Action Buttons */}
      <div className="px-4 py-3 bg-slate-50/70 border-t border-slate-100 flex flex-col gap-2.5">
        {/* Row 1: Pricing info (e.g. ₹6,000/month) */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
            {isTeacher ? t('common.fee', 'Fee') : t('common.budget', 'Budget')}
          </span>
          <span className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center">
            <FaRupeeSign className="text-xs mr-0.5 text-slate-500" />
            {isTeacher
              ? (feeAmount ? `${feeAmount.toLocaleString('en-IN')}${feePeriod}` : t('common.negotiable', 'Negotiable'))
              : (budgetMax ? `${t('common.upTo', 'Up to')} ${budgetMax.toLocaleString('en-IN')}${t('common.monthly', '/mo')}` : t('common.flexible', 'Flexible'))}
          </span>
        </div>

        {/* Row 2: Action Buttons */}
        {isGuest ? (
          <Link
            to="/login"
            className="w-full inline-flex items-center justify-center text-xs font-bold text-amber-900 bg-amber-100/90 hover:bg-amber-200 py-2 px-3 rounded-xl transition-all shadow-2xs"
          >
            <FiLock className="mr-1.5" size={12} />
            {t('common.loginToView', 'Login to View Full Profile')}
          </Link>
        ) : (
          <div className="flex items-center gap-2">
            {onConnect && !isConnected ? (
              <>
                <button
                  type="button"
                  onClick={() => onConnect(profile)}
                  disabled={isPending}
                  className={`flex-1 inline-flex items-center justify-center text-xs font-bold py-2 px-2.5 rounded-xl transition-all cursor-pointer ${
                    isPending
                      ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                      : 'bg-slate-900 hover:bg-slate-800 text-white shadow-2xs hover:shadow-xs'
                  }`}
                >
                  {isPending ? t('common.pending', 'Pending') : t('common.connect', 'Connect')}
                </button>
                <Link
                  to={isTeacher ? `/teachers/${profile._id}` : `/students/${profile._id}`}
                  className="flex-1 inline-flex items-center justify-center text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200/90 py-2 px-2.5 rounded-xl transition-colors shadow-2xs"
                >
                  {t('common.viewProfile', 'View Profile')}
                  <FiArrowRight className="ml-1 text-[11px]" />
                </Link>
              </>
            ) : (
              <Link
                to={isTeacher ? `/teachers/${profile._id}` : `/students/${profile._id}`}
                className="w-full inline-flex items-center justify-center text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200/90 py-2 px-3 rounded-xl transition-colors shadow-2xs"
              >
                {t('common.viewFullProfile', 'View Full Profile')}
                <FiArrowRight className="ml-1 text-[11px]" />
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;
