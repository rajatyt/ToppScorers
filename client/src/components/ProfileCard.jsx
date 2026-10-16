import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FaCheckCircle, FaStar, FaMapMarkerAlt, FaBookmark, FaRegBookmark,
  FaGraduationCap, FaChalkboardTeacher, FaUserGraduate, FaRupeeSign,
  FaCompass, FaBookOpen, FaClock, FaHome, FaLaptop, FaBriefcase, FaBullseye
} from 'react-icons/fa';
import { FiArrowRight, FiLock, FiCopy, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';

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
  const [imgError, setImgError] = useState(false);

  const user = profile.userId || {};
  const name = profile.name || user.name || (isTeacher ? 'Verified Teacher' : 'Student Requirement');
  const photo = profile.profilePhotoUrl || user.avatar;
  const city = profile.location?.city || 'India';
  const area = profile.area ? `${profile.area}, ` : '';
  const locationString = `${area}${city}`;
  const subjects = isTeacher ? (profile.subjects || []) : (profile.subjectsNeeded || []);
  const exams = profile.exams || (profile.classOrExam ? [profile.classOrExam] : []);
  const feeAmount = profile.fee?.amount;
  const feePeriod = profile.fee?.period === 'hourly' ? t('common.hourly', '/hr') : t('common.monthly', '/month');
  const budgetMax = profile.budget?.max;

  // Format initials for avatar fallback
  const initials = (name || (isTeacher ? 'T' : 'S'))
    .trim()
    .split(/\s+/)
    .map(p => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  // Teacher Experience
  const rawExp = profile.experience || 0;
  const experienceText = rawExp > 0 
    ? `${rawExp}+ ${t('common.yearsExp', 'Yrs Exp')}` 
    : t('common.experiencedEducator', 'Experienced Educator');

  // Teacher Qualification / Degree
  const qualification = profile.degreeDetails?.highestDegree 
    ? `${profile.degreeDetails.highestDegree}${profile.degreeDetails.university ? ` (${profile.degreeDetails.university})` : ''}`
    : (Array.isArray(profile.qualifications) && profile.qualifications.length > 0 
        ? profile.qualifications.join(', ') 
        : (profile.qualification || profile.degree || ''));

  // Teaching / Learning Mode
  const rawMode = (isTeacher ? profile.teachingMode : profile.preferences?.mode) || 'both';
  const isOnlineOnly = rawMode === 'online';
  const isHomeOnly = rawMode === 'home' || rawMode === 'offline';
  const modeText = (rawMode === 'all' || rawMode === 'both')
    ? 'Home & Online'
    : (isHomeOnly ? 'Home Tuition' : (isOnlineOnly ? 'Online' : rawMode));

  // Student specific highlights
  const studentClass = profile.classLevel || profile.classOrExam || (exams.length > 0 ? exams[0] : '');
  const studentTiming = profile.preferredTiming || profile.preferredTime || t('common.flexibleTiming', 'Flexible Timing');

  // Teacher classes string (e.g. Class 7, Class 8, Class 9)
  const teachesText = exams.length > 0 ? exams.join(', ') : '';

  const isConnected = profile.connectionStatus === 'accepted';
  const isPending = profile.connectionStatus === 'pending';

  const isTeacherVerified = isTeacher && Boolean(profile.isVerified);
  const isStudentVerified = !isTeacher && profile.isVerified === true && profile.verificationStatus === 'verified';
  const isStudentPending = !isTeacher && (profile.verificationStatus === 'pending' || Boolean(profile.verificationSubmittedAt)) && !isStudentVerified;
  const isVerifiedBadgeShown = isTeacher ? isTeacherVerified : isStudentVerified;

  return (
    <div className={`group relative bg-white rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 ${
      isTeacher
        ? 'border-slate-200/90 hover:border-amber-400'
        : 'border-slate-200/90 hover:border-emerald-400'
    }`}>
      {/* Top Banner accent gradient stripe */}
      <div className={`h-1.5 w-full ${
        isTeacher 
          ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500' 
          : 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500'
      }`} />

      <div className="p-4 sm:p-5 flex-grow flex flex-col justify-between space-y-3.5">
        <div>
          {/* Top Row: Role Badge, Job ID, and Bookmark Button */}
          <div className="flex items-center justify-between gap-2 mb-3.5">
            <div className="flex items-center gap-1.5 flex-wrap min-w-0">
              {/* Role Indicator Badge */}
              {isTeacher ? (
                isTeacherVerified ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300/80 font-extrabold text-[11px] shadow-2xs">
                    <FaCheckCircle className="text-emerald-500 text-[10px]" />
                    <span>{t('common.verifiedTutor', 'Verified Tutor')}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-300/80 font-bold text-[11px] shadow-2xs">
                    <FaChalkboardTeacher className="text-amber-600 text-[11px]" />
                    <span>{t('common.educatorProfile', 'Educator Profile')}</span>
                  </span>
                )
              ) : (
                isStudentVerified ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300/80 font-extrabold text-[11px] shadow-2xs">
                    <FaCheckCircle className="text-emerald-500 text-[10px]" />
                    <span>Verified {profile.studentOrParentRole === 'parent' ? 'Parent' : 'Student'}</span>
                  </span>
                ) : isStudentPending ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 font-extrabold text-[11px] shadow-2xs">
                    <span>⏳ In Review ({profile.studentOrParentRole === 'parent' ? 'Parent' : 'Student'})</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-300/80 font-extrabold text-[11px] shadow-2xs">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span>{t('common.tuitionRequirement', 'Tuition Requirement')}</span>
                  </span>
                )
              )}
            </div>

            {/* Save / Shortlist Bookmark Button */}
            {!isGuest && onToggleSave && (
              <button
                type="button"
                onClick={() => onToggleSave(profile._id, type, user._id)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-amber-500 hover:bg-amber-50 transition-colors flex-shrink-0 cursor-pointer"
                title={isSaved ? "Remove from Shortlist" : "Save / Shortlist"}
              >
                {isSaved ? <FaBookmark className="text-amber-500" size={17} /> : <FaRegBookmark size={17} />}
              </button>
            )}
          </div>

          {/* Profile Identity: Avatar, Name, Location */}
          <div className="flex items-center space-x-3.5 mb-3.5">
            {/* Avatar with verification badge & error handling */}
            <div className="relative flex-shrink-0">
              {photo && !imgError ? (
                <img
                  src={photo}
                  alt=""
                  onError={() => setImgError(true)}
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 shadow-md ${
                    isTeacher ? 'border-amber-200/80' : 'border-emerald-200/80'
                  }`}
                />
              ) : (
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex flex-col items-center justify-center text-white shadow-md font-black ${
                  isTeacher 
                    ? 'bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700' 
                    : 'bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700'
                }`}>
                  <span className="text-lg leading-none">{initials}</span>
                  <span className="text-[10px] opacity-80 mt-0.5">
                    {isTeacher ? <FaChalkboardTeacher size={12} /> : <FaUserGraduate size={12} />}
                  </span>
                </div>
              )}
              {isVerifiedBadgeShown && (
                <span className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-md" title="Verified Profile">
                  <FaCheckCircle className="text-emerald-500 text-sm" />
                </span>
              )}
            </div>

            {/* Name & Location */}
            <div className="min-w-0 flex-1">
              <h3 className={`font-extrabold text-slate-900 text-base sm:text-lg leading-snug truncate transition-colors ${
                isTeacher ? 'group-hover:text-amber-700' : 'group-hover:text-emerald-700'
              }`}>
                {name}
              </h3>

              {/* Location with Pin */}
              <div className="flex items-center text-xs text-slate-500 mt-1 space-x-1.5 flex-wrap">
                <span className="flex items-center font-medium text-slate-600">
                  <FaMapMarkerAlt className={`mr-1 flex-shrink-0 text-xs ${
                    isTeacher ? 'text-amber-500' : 'text-emerald-500'
                  }`} />
                  <span className="truncate">{locationString}</span>
                </span>
                {profile.approxDistanceKm !== null && profile.approxDistanceKm !== undefined && (
                  <span className="inline-flex items-center text-emerald-800 font-bold text-[10px] bg-emerald-50 border border-emerald-200/70 px-1.5 py-0.5 rounded-md">
                    <FaCompass className="mr-0.5 text-[9px]" />
                    ~{profile.approxDistanceKm} km
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Highlights Row - Teacher vs Student Specific */}
          {isTeacher ? (
            /* TEACHER HIGHLIGHTS: Rating, Experience, Teaching Mode */
            <div className="grid grid-cols-3 gap-1.5 py-2 px-2 rounded-xl bg-slate-50 border border-slate-200/70 mb-3">
              <div className="flex flex-col items-center justify-center text-center min-w-0 overflow-hidden px-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate w-full">Rating</span>
                <span className="inline-flex items-center justify-center text-amber-700 font-black text-xs mt-0.5 max-w-full">
                  <FaStar className="text-amber-500 mr-1 text-[11px] flex-shrink-0" />
                  <span className="truncate">{profile.rating || 4.8}</span>
                </span>
              </div>
              <div className="flex flex-col items-center justify-center text-center min-w-0 overflow-hidden border-x border-slate-200/80 px-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate w-full">Experience</span>
                <span className="text-slate-900 font-bold text-xs mt-0.5 flex items-center justify-center gap-1 w-full min-w-0" title={experienceText}>
                  <FaBriefcase className="text-slate-400 text-[10px] flex-shrink-0" />
                  <span className="truncate">{experienceText}</span>
                </span>
              </div>
              <div className="flex flex-col items-center justify-center text-center min-w-0 overflow-hidden px-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate w-full">Mode</span>
                <span className="text-slate-800 font-bold text-xs mt-0.5 flex items-center justify-center gap-1 w-full min-w-0" title={modeText}>
                  {isHomeOnly ? <FaHome className="text-amber-600 text-[10px] flex-shrink-0" /> : <FaLaptop className="text-amber-600 text-[10px] flex-shrink-0" />}
                  <span className="truncate">{modeText}</span>
                </span>
              </div>
            </div>
          ) : (
            /* STUDENT HIGHLIGHTS: Class / Level, Mode, Preferred Timing */
            <div className="grid grid-cols-3 gap-1.5 py-2 px-2 rounded-xl bg-slate-50 border border-slate-200/70 mb-3">
              <div className="flex flex-col items-center justify-center text-center min-w-0 overflow-hidden px-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate w-full">Class / Grade</span>
                <span className="text-emerald-950 font-bold text-xs mt-0.5 flex items-center justify-center gap-1 w-full min-w-0" title={studentClass || 'General'}>
                  <FaGraduationCap className="text-emerald-600 text-[11px] flex-shrink-0" />
                  <span className="truncate">{studentClass || 'General'}</span>
                </span>
              </div>
              <div className="flex flex-col items-center justify-center text-center min-w-0 overflow-hidden border-x border-slate-200/80 px-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate w-full">Mode</span>
                <span className="text-slate-900 font-bold text-xs mt-0.5 flex items-center justify-center gap-1 w-full min-w-0" title={modeText}>
                  {isHomeOnly ? <FaHome className="text-emerald-600 text-[10px] flex-shrink-0" /> : <FaLaptop className="text-emerald-600 text-[10px] flex-shrink-0" />}
                  <span className="truncate">{modeText}</span>
                </span>
              </div>
              <div className="flex flex-col items-center justify-center text-center min-w-0 overflow-hidden px-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate w-full">Timing</span>
                <span className="text-slate-800 font-bold text-xs mt-0.5 flex items-center justify-center gap-1 w-full min-w-0" title={studentTiming}>
                  <FaClock className="text-emerald-600 text-[10px] flex-shrink-0" />
                  <span className="truncate">{studentTiming}</span>
                </span>
              </div>
            </div>
          )}

          {/* Teacher Qualification Pill */}
          {isTeacher && qualification && (
            <div className="flex items-center space-x-2 text-xs text-slate-800 mb-2.5 bg-amber-50/50 px-2.5 py-1.5 rounded-xl border border-amber-200/60">
              <FaGraduationCap className="text-amber-600 flex-shrink-0 text-xs" />
              <span className="font-semibold leading-tight truncate">{qualification}</span>
            </div>
          )}

          {/* Teacher Classes Taught */}
          {isTeacher && teachesText && (
            <div className="text-xs text-slate-700 mb-2.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200/60 flex items-center space-x-1.5">
              <span className="font-extrabold text-slate-900 uppercase tracking-wider text-[10px]">{t('common.classes', 'Classes')}:</span>
              <span className="font-medium text-slate-800 truncate">{teachesText}</span>
            </div>
          )}

          {/* Student Goal / Requirement snippet */}
          {!isTeacher && profile.goals && (
            <div className="flex items-center space-x-2 text-xs text-emerald-950 mb-2.5 bg-emerald-50/70 px-2.5 py-1.5 rounded-xl border border-emerald-200/70">
              <FaBullseye className="text-emerald-600 flex-shrink-0 text-xs" />
              <span className="font-semibold leading-tight truncate">{profile.goals}</span>
            </div>
          )}

          {/* Subjects Pills Section */}
          <div className="mb-2.5">
            <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
              <FaBookOpen className={`text-xs ${isTeacher ? 'text-amber-500' : 'text-emerald-500'}`} />
              <span>
                {isTeacher 
                  ? t('common.subjectExpertise', 'Subject Expertise') 
                  : t('common.needsTutoringIn', 'Needs Tutoring In')}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 items-center">
              {subjects.length > 0 ? (
                <>
                  {subjects.slice(0, 3).map((sub, i) => (
                    <span
                      key={i}
                      className={`px-2.5 py-1 font-bold text-xs rounded-lg border shadow-2xs ${
                        isTeacher
                          ? 'bg-amber-50 text-amber-950 border-amber-200/80'
                          : 'bg-emerald-50 text-emerald-950 border-emerald-200/80'
                      }`}
                    >
                      {sub}
                    </span>
                  ))}
                  {subjects.length > 3 && (
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 font-bold text-[11px] rounded-lg border border-slate-200">
                      +{subjects.length - 3} more
                    </span>
                  )}
                </>
              ) : (
                <span className={`px-2.5 py-1 font-bold text-xs rounded-lg border shadow-2xs ${
                  isTeacher
                    ? 'bg-amber-50/70 text-amber-900 border-amber-200/60'
                    : 'bg-emerald-50/70 text-emerald-900 border-emerald-200/60'
                }`}>
                  {t('common.allCoreSubjects', 'All Core Subjects')}
                </span>
              )}
            </div>
          </div>

          {/* Bio snippet if available */}
          {profile.bio && (
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-1 italic">
              "{profile.bio}"
            </p>
          )}
        </div>
      </div>

      {/* Symmetrical Pricing & Action Buttons Footer */}
      <div className="px-4 py-3.5 bg-slate-50/90 border-t border-slate-100 flex flex-col gap-2.5">
        {/* Pricing Info: Fee / Budget */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">
            {isTeacher 
              ? t('common.tutorFee', 'Tutor Fee') 
              : t('common.studentBudget', 'Student Budget')}
          </span>
          <span className={`text-sm sm:text-base font-black flex items-center ${
            isTeacher ? 'text-amber-950' : 'text-emerald-950'
          }`}>
            <FaRupeeSign className="text-xs mr-0.5 text-slate-500" />
            {isTeacher
              ? (feeAmount ? `${feeAmount.toLocaleString('en-IN')}${feePeriod}` : t('common.negotiable', 'Negotiable'))
              : (budgetMax ? `${t('common.upTo', 'Up to')} ${budgetMax.toLocaleString('en-IN')}${t('common.monthly', '/mo')}` : t('common.flexible', 'Flexible'))}
          </span>
        </div>

        {/* Action Buttons */}
        {isGuest ? (
          <Link
            to="/login"
            className={`w-full inline-flex items-center justify-center text-xs font-black py-2.5 px-3 rounded-xl transition-all shadow-xs ${
              isTeacher
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            <FiLock className="mr-1.5" size={13} />
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
                  className={`flex-1 inline-flex items-center justify-center text-xs font-black py-2.5 px-2.5 rounded-xl transition-all cursor-pointer shadow-xs ${
                    isPending
                      ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                      : isTeacher
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black'
                        : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black'
                  }`}
                >
                  {isPending 
                    ? t('common.pending', 'Pending') 
                    : (isTeacher 
                        ? t('common.connectWithTutor', 'Connect with Tutor') 
                        : t('common.connectWithStudent', 'Connect with Student'))}
                </button>
                <Link
                  to={isTeacher ? `/teachers/${profile._id}` : `/students/${profile._id}`}
                  className="inline-flex items-center justify-center text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200/90 py-2.5 px-3 rounded-xl transition-colors shadow-2xs"
                  title="View Profile Details"
                >
                  {t('common.viewProfile', 'View')}
                  <FiArrowRight className="ml-1 text-[11px]" />
                </Link>
              </>
            ) : (
              <Link
                to={isTeacher ? `/teachers/${profile._id}` : `/students/${profile._id}`}
                className="w-full inline-flex items-center justify-center text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200/90 py-2.5 px-3 rounded-xl transition-colors shadow-2xs"
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
