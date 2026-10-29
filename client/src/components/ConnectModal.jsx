import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { FaUserPlus, FaTimes, FaShieldAlt, FaLock, FaArrowRight, FaClock, FaExclamationTriangle } from 'react-icons/fa';

const ConnectModal = ({ isOpen, onClose, targetProfile, onSuccess }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, profile: currentUserProfile, isAuthenticated } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [verificationNotice, setVerificationNotice] = useState(null);

  if (!isOpen || !targetProfile) return null;

  const targetUser = targetProfile.userId || {};
  const targetName = targetProfile.name || targetUser.name || 'User';

  const isTeacher = user?.role === 'teacher';
  const isStudent = user?.role === 'student';
  const isUserVerified = user?.role === 'admin' || (
    currentUserProfile &&
    currentUserProfile.isVerified === true &&
    currentUserProfile.verificationStatus === 'verified'
  );

  const activeNotice = verificationNotice || (!isUserVerified && isAuthenticated ? {
    role: user?.role || 'teacher',
    status: currentUserProfile?.verificationStatus || 'unverified',
    message: isTeacher
      ? (currentUserProfile?.verificationStatus === 'pending'
          ? 'Your teacher verification is currently under review by our team. You cannot send connection requests until your documents are approved.'
          : currentUserProfile?.verificationStatus === 'rejected'
          ? `Your verification was not approved: "${currentUserProfile?.rejectionReason || 'Please resubmit valid credentials'}". Update your documents to send requests.`
          : 'Verification Required: Only verified educators can initiate connection requests. Please complete your verification to unlock student outreach.')
      : (currentUserProfile?.verificationStatus === 'pending'
          ? 'Your student/parent contact verification is currently under review by our team. You cannot send connection requests until your details are approved.'
          : currentUserProfile?.verificationStatus === 'rejected'
          ? `Your contact verification was not approved: "${currentUserProfile?.rejectionReason || 'Invalid details'}". Update your contact details to continue.`
          : 'Verification Required: Please verify your phone number and email to establish yourself as a genuine student or parent before sending tuition requests.')
  } : null);

  const handleModalClose = () => {
    setVerificationNotice(null);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to send connection requests');
      navigate('/login');
      return;
    }

    if (!isUserVerified) {
      setVerificationNotice(activeNotice);
      return;
    }

    if (!targetUser._id) {
      toast.error('Unable to send request: invalid user ID');
      return;
    }

    setLoading(true);
    setVerificationNotice(null);
    try {
      await api.post('/connections', {
        toUserId: targetUser._id
      });
      toast.success(`Connection request sent to ${targetName}!`);
      if (onSuccess) onSuccess();
      handleModalClose();
    } catch (err) {
      if (err.response?.data?.verificationRequired) {
        setVerificationNotice({
          role: err.response.data.verificationRole || user?.role || 'teacher',
          message: err.response.data.message,
          status: err.response.data.verificationStatus || 'unverified'
        });
      } else {
        toast.error(err.response?.data?.message || 'Failed to send connection request');
      }
    } finally {
      setLoading(false);
    }
  };

  const isStudentNotice = activeNotice?.role === 'student';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto animate-fadeInUp">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-slate-100 relative">
        <button
          onClick={handleModalClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
        >
          <FaTimes size={18} />
        </button>

        {activeNotice ? (
          <div className="text-center py-2 space-y-4">
            <div className={`w-14 h-14 rounded-2xl ${isStudentNotice ? 'bg-emerald-100 text-emerald-700' : 'bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950'} flex items-center justify-center mx-auto shadow-md`}>
              <FaShieldAlt size={26} />
            </div>

            <div>
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider mb-1.5 ${
                isStudentNotice ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {isStudentNotice ? 'Contact Verification Required' : 'Teacher Verification Required'}
              </span>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                {isStudentNotice
                  ? 'Verify Your Contact Details'
                  : 'Complete Profile Verification to Connect'}
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-sm mx-auto">
                {activeNotice.message}
              </p>
            </div>

            {/* Why Verification is Important */}
            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 text-left space-y-2.5 shadow-2xs">
              <div className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center justify-between">
                <span>Why Verification is Important:</span>
                <span className="text-[10px] text-amber-700 font-bold">Prayagraj Standard</span>
              </div>

              {!isStudentNotice ? (
                <div className="space-y-2 text-xs text-slate-700">
                  <div className="flex items-start space-x-2.5">
                    <div className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-black">
                      ✓
                    </div>
                    <div>
                      <strong className="text-slate-900">Direct Student Outreach:</strong> Unlocks sending tuition requests directly to students and parents searching for educators.
                    </div>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <div className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-black">
                      ★
                    </div>
                    <div>
                      <strong className="text-slate-900">Verified Educator Badge:</strong> Gain full parent trust with an official verification badge on directory cards.
                    </div>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <div className="w-5 h-5 rounded-md bg-blue-500/20 text-blue-700 flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-black">
                      🤝
                    </div>
                    <div>
                      <strong className="text-slate-900">Tuition Coordination:</strong> ToppScorers managers coordinate verified demo classes and fee scheduling.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-xs text-slate-700">
                  <div className="flex items-start space-x-2.5">
                    <div className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-black">
                      ✓
                    </div>
                    <div>
                      <strong className="text-slate-900">Direct Teacher Outreach:</strong> Confirms genuine student/parent inquiries to protect educators from spam.
                    </div>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <div className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-black">
                      🛡️
                    </div>
                    <div>
                      <strong className="text-slate-900">Privacy Protection:</strong> Phone numbers are kept strictly private until direct coordination is approved.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons: Skip for Now vs Verify Button */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleModalClose}
                className="w-full sm:w-auto flex-1 py-2.5 px-3 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Skip for Now
              </button>
              <button
                type="button"
                onClick={() => {
                  handleModalClose();
                  if (isStudentNotice) {
                    window.dispatchEvent(new CustomEvent('open-student-verification-modal'));
                  } else {
                    navigate('/verification');
                  }
                }}
                className={`w-full sm:w-auto flex-1 py-2.5 px-4 ${
                  isStudentNotice
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white'
                    : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black'
                } text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer hover:scale-[1.01]`}
              >
                <span>
                  {activeNotice.status === 'pending'
                    ? 'Verification Under Review'
                    : isStudentNotice
                    ? 'Verify Contact Details'
                    : 'Verify My Profile Now'}
                </span>
                <FaArrowRight size={11} />
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <FaUserPlus size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Connect with {targetName}
                </h3>
                <p className="text-xs text-slate-500">
                  Send a request to initiate verified tuition coordination
                </p>
              </div>
            </div>

            <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl mb-4 text-xs text-amber-900 flex items-start space-x-2">
              <FaShieldAlt className="text-amber-600 flex-shrink-0 mt-0.5" size={14} />
              <p>
                <strong>Privacy & Safety Protection:</strong> Phone numbers are kept strictly private. Once connected, our ToppScorers team contacts both parties to physically schedule demo sessions and tuition logistics.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all hover:scale-[1.01]"
                >
                  {loading ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ConnectModal;
