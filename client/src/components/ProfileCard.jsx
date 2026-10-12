import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FaCheckCircle, FaStar, FaMapMarkerAlt, FaBookmark, FaRegBookmark,
  FaGraduationCap, FaChalkboardTeacher, FaUserGraduate, FaRupeeSign,
  FaCompass
} from 'react-icons/fa';
import { FiArrowRight, FiLock } from 'react-icons/fi';

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

  const user = profile.userId || {};
  const name = profile.name || user.name || (isTeacher ? 'Verified Teacher' : 'Student');
  const photo = profile.profilePhotoUrl || user.avatar;
  const city = profile.location?.city || 'India';
  const area = profile.area ? `${profile.area}, ` : '';
  const subjects = isTeacher ? (profile.subjects || []) : (profile.subjectsNeeded || []);
  const exams = profile.exams || (profile.classOrExam ? [profile.classOrExam] : []);
  const feeAmount = profile.fee?.amount;
  const budgetMax = profile.budget?.max;
  const mode = profile.teachingMode || profile.preferences?.mode || 'online';
  const isConnected = profile.connectionStatus === 'accepted';
  const isPending = profile.connectionStatus === 'pending';

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/90 hover:border-amber-400/80 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden hover:-translate-y-0.5">
      {/* Top Banner accent stripe */}
      <div className={`h-1.5 w-full ${isTeacher ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 'bg-gradient-to-r from-emerald-500 to-teal-400'}`} />

      <div className="p-4 sm:p-5 flex-grow flex flex-col justify-between">
        <div>
          {/* Header: Photo, Name, Location, Save button */}
          <div className="flex items-start justify-between gap-2.5 mb-3">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="relative flex-shrink-0">
                {photo ? (
                  <img
                    src={photo}
                    alt={name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-100 shadow-2xs"
                  />
                ) : (
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-2xs ${
                    isTeacher ? 'bg-gradient-to-br from-amber-500 to-amber-600' : 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                  }`}>
                    {isTeacher ? <FaChalkboardTeacher size={20} /> : <FaUserGraduate size={20} />}
                  </div>
                )}
                {profile.isVerified && (
                  <span className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-2xs" title="Verified Profile">
                    <FaCheckCircle className="text-emerald-500 text-xs" />
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight truncate">
                  {name}
                </h3>
                
                <div className="flex items-center text-xs text-slate-500 mt-1 space-x-1.5 flex-wrap">
                  <span className="flex items-center truncate">
                    <FaMapMarkerAlt className="text-amber-500 mr-1 flex-shrink-0 text-[10px]" />
                    {area}{city}
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
                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-50 transition-colors flex-shrink-0"
                title={isSaved ? "Remove from Shortlist" : "Save / Shortlist"}
              >
                {isSaved ? <FaBookmark className="text-amber-500" size={15} /> : <FaRegBookmark size={15} />}
              </button>
            )}
          </div>

          {/* Rating / Experience or Class level + Teaching mode */}
          <div className="flex flex-wrap items-center gap-1.5 mb-3 text-xs">
            {isTeacher ? (
              <>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 font-bold border border-amber-200/60 text-[11px]">
                  <FaStar className="text-amber-500 mr-1 text-[10px]" />
                  {profile.rating || 4.8}
                </span>
                <span className="text-slate-500 text-xs font-medium">
                  {profile.experience || 0} yrs exp
                </span>
              </>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-900 font-bold border border-emerald-200/60 text-[11px]">
                <FaGraduationCap className="mr-1 text-[11px]" />
                {profile.classLevel || profile.classOrExam || 'Student'}
              </span>
            )}

            <span className="text-slate-300">•</span>
            <span className="capitalize text-slate-500 text-xs font-medium">
              {mode === 'all' || mode === 'both' ? 'Online & Offline' : mode}
            </span>
          </div>

          {/* Subjects tags */}
          <div className="mb-3">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              {isTeacher ? 'Subjects' : 'Needs Tutoring In'}
            </div>
            <div className="flex flex-wrap gap-1.5 items-center">
              {subjects.length > 0 ? (
                <>
                  {subjects.slice(0, 3).map((sub, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-md font-medium transition-colors"
                    >
                      {sub}
                    </span>
                  ))}
                  {subjects.length > 3 && (
                    <span className="px-1.5 py-0.5 bg-slate-50 text-slate-500 text-[11px] rounded-md font-medium border border-slate-200/60">
                      +{subjects.length - 3}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-xs text-slate-400 italic">General / All Subjects</span>
              )}
            </div>
          </div>

          {/* Exams badges */}
          {exams.length > 0 && (
            <div className="mb-3">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Target Exams
              </div>
              <div className="flex flex-wrap gap-1">
                {exams.slice(0, 3).map((ex, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-200/50 text-[10px] rounded-md font-semibold"
                  >
                    {ex}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Bio / Goal snippet */}
          {(profile.bio || profile.goals) && (
            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
              {profile.bio || profile.goals}
            </p>
          )}
        </div>
      </div>

      {/* Symmetrical 2-row Footer: Fee/Budget & Compact Action Buttons */}
      <div className="px-4 py-3 bg-slate-50/70 border-t border-slate-100 flex flex-col gap-2.5">
        {/* Row 1: Pricing info */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
            {isTeacher ? t('common.fee', 'Fee') : t('common.budget', 'Budget')}
          </span>
          <span className="text-sm font-extrabold text-slate-900 flex items-center">
            <FaRupeeSign className="text-xs mr-0.5 text-slate-400" />
            {isTeacher
              ? (feeAmount ? `${feeAmount.toLocaleString('en-IN')}${profile.fee?.period === 'hourly' ? t('common.hourly', '/hr') : t('common.monthly', '/mo')}` : t('common.negotiable', 'Negotiable'))
              : (budgetMax ? `${t('common.upTo', 'Up to')} ${budgetMax.toLocaleString('en-IN')}${t('common.monthly', '/mo')}` : t('common.flexible', 'Flexible'))}
          </span>
        </div>

        {/* Row 2: Action Buttons */}
        {isGuest ? (
          <Link
            to="/login"
            className="w-full inline-flex items-center justify-center text-xs font-bold text-amber-900 bg-amber-100/90 hover:bg-amber-200 py-1.5 px-3 rounded-lg transition-all"
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
                  className={`flex-1 inline-flex items-center justify-center text-xs font-semibold py-1.5 px-2.5 rounded-lg transition-all ${
                    isPending
                      ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                      : 'bg-slate-900 hover:bg-slate-800 text-white shadow-2xs hover:shadow-xs'
                  }`}
                >
                  {isPending ? t('common.pending', 'Pending') : t('common.connect', 'Connect')}
                </button>
                <Link
                  to={isTeacher ? `/teachers/${profile._id}` : `/students/${profile._id}`}
                  className="flex-1 inline-flex items-center justify-center text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200/90 py-1.5 px-2.5 rounded-lg transition-colors shadow-2xs"
                >
                  {t('common.viewProfile', 'View Profile')}
                  <FiArrowRight className="ml-1 text-[11px]" />
                </Link>
              </>
            ) : (
              <Link
                to={isTeacher ? `/teachers/${profile._id}` : `/students/${profile._id}`}
                className="w-full inline-flex items-center justify-center text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200/90 py-1.5 px-3 rounded-lg transition-colors shadow-2xs"
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
