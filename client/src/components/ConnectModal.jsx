import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { FaUserPlus, FaTimes, FaShieldAlt, FaLock, FaArrowRight, FaClock, FaExclamationTriangle } from 'react-icons/fa';

const ConnectModal = ({ isOpen, onClose, targetProfile, onSuccess }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [verificationNotice, setVerificationNotice] = useState(null);

  if (!isOpen || !targetProfile) return null;

  const targetUser = targetProfile.userId || {};
  const targetName = targetProfile.name || targetUser.name || 'User';

  const handleModalClose = () => {
    setVerificationNotice(null);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
          role: err.response.data.verificationRole || 'teacher',
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

  const isStudentNotice = verificationNotice?.role === 'student';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto animate-fadeInUp">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-slate-100 relative">
        <button
          onClick={handleModalClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
        >
          <FaTimes size={18} />
        </button>

        {verificationNotice ? (
          <div className="text-center py-2 space-y-4">
            <div className={`w-14 h-14 rounded-2xl ${isStudentNotice ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-600'} flex items-center justify-center mx-auto shadow-sm`}>
              <FaLock size={24} />
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                {isStudentNotice ? 'Student / Parent Verification Required' : 'Teacher Verification Required'}
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed px-2">
                {verificationNotice.message}
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-600 text-left space-y-1.5">
              <div className="font-bold text-slate-800">
                ToppScorers Safety Policy:
              </div>
              <p className="text-[11px] leading-relaxed">
                {isStudentNotice
                  ? 'To prevent fake inquiries and protect teachers, students and parents must verify their phone & email before sending tuition requests.'
                  : 'To prevent spam and protect students, teachers must verify their credentials before initiating contact.'}
              </p>
              <p className={`text-[11px] ${isStudentNotice ? 'text-emerald-800' : 'text-amber-800'} font-semibold`}>
                {isStudentNotice
                  ? '✓ Verified parents and students receive direct teacher connections.'
                  : '✓ Direct student requests unlock immediately upon admin verification.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleModalClose}
                className="w-full sm:w-auto flex-1 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Close
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
                className={`w-full sm:w-auto flex-1 py-2.5 ${
                  isStudentNotice
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white'
                    : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950'
                } font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center cursor-pointer`}
              >
                {verificationNotice.status === 'pending'
                  ? 'Verification Under Review'
                  : isStudentNotice
                  ? 'Verify Details Now'
                  : 'Get Verified Now'}
                <FaArrowRight className="ml-1.5" />
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
