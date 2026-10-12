import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FiPlus, FiEdit2, FiTrash2, FiChevronDown, FiChevronUp, 
  FiHelpCircle, FiEye, FiEyeOff, FiCheck, FiX, FiGlobe 
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

const FAQEditor = () => {
  const { t } = useTranslation();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    question_en: '',
    question_hi: '',
    answer_en: '',
    answer_hi: '',
    order: 1,
    isVisible: true
  });

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/faqs/all');
      setFaqs((res.data || []).sort((a, b) => a.order - b.order));
    } catch (error) {
      toast.error('Failed to load FAQ list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleOpenModal = (faq = null) => {
    setEditingFaq(faq);
    if (faq) {
      setFormData({
        question_en: faq.question?.en || '',
        question_hi: faq.question?.hi || '',
        answer_en: faq.answer?.en || '',
        answer_hi: faq.answer?.hi || '',
        order: faq.order || 1,
        isVisible: faq.isVisible !== false
      });
    } else {
      setFormData({
        question_en: '', 
        question_hi: '', 
        answer_en: '', 
        answer_hi: '',
        order: faqs.length + 1, 
        isVisible: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        question: { en: formData.question_en, hi: formData.question_hi },
        answer: { en: formData.answer_en, hi: formData.answer_hi },
        order: parseInt(formData.order) || 1,
        isVisible: formData.isVisible
      };

      if (editingFaq) {
        await axios.put(`/faqs/${editingFaq._id}`, payload);
        toast.success('FAQ entry updated');
      } else {
        await axios.post('/faqs', payload);
        toast.success('New FAQ entry published');
      }
      setIsModalOpen(false);
      fetchFaqs();
    } catch (error) {
      toast.error('Failed to save FAQ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this question permanently?')) {
      try {
        await axios.delete(`/faqs/${id}`);
        toast.success('FAQ deleted');
        fetchFaqs();
      } catch (error) {
        toast.error('Failed to remove FAQ');
      }
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Bilingual FAQ Content Manager
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
              EN + HI
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            Control the interactive accordion questions displayed on the homepage. Edit both English and Hindi translations with instant preview.
          </p>
        </div>

        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] shrink-0"
        >
          <FiPlus size={16} />
          <span>Add New FAQ</span>
        </button>
      </div>

      {/* FAQs List Container */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden divide-y divide-slate-100">
        {loading ? (
          <div className="flex flex-col justify-center items-center py-16 space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-3 border-slate-200 border-t-amber-500"></div>
            <p className="text-xs text-slate-500">Loading FAQ entries...</p>
          </div>
        ) : faqs.length > 0 ? (
          faqs.map((faq) => {
            const isExpanded = expandedFaq === faq._id;
            return (
              <div key={faq._id} className="p-4 sm:p-5 hover:bg-slate-50/60 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div 
                    className="flex-1 flex items-start space-x-3 cursor-pointer select-none"
                    onClick={() => setExpandedFaq(isExpanded ? null : faq._id)}
                  >
                    <span className="w-7 h-7 rounded-lg bg-slate-900 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      #{faq.order}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                          {faq.question?.en}
                        </h4>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          faq.isVisible !== false 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {faq.isVisible !== false ? 'Live' : 'Hidden'}
                        </span>
                      </div>
                      
                      {faq.question?.hi && (
                        <p className="text-xs text-slate-500 mt-1 font-hindi">
                          🇮🇳 {faq.question?.hi}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button 
                      onClick={() => handleOpenModal(faq)} 
                      className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit FAQ"
                    >
                      <FiEdit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(faq._id)} 
                      className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete FAQ"
                    >
                      <FiTrash2 size={16} />
                    </button>
                    <button 
                      onClick={() => setExpandedFaq(isExpanded ? null : faq._id)}
                      className="p-2 text-slate-400 hover:text-slate-800 rounded-lg transition-colors"
                    >
                      {isExpanded ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Answer Content */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-100 pl-10 space-y-3 bg-slate-50/50 p-4 rounded-xl">
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
                        <span>🇬🇧 English Answer</span>
                      </div>
                      <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                        {faq.answer?.en}
                      </p>
                    </div>

                    {faq.answer?.hi && (
                      <div className="pt-2 border-t border-slate-200/60">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
                          <span>🇮🇳 Hindi Answer</span>
                        </div>
                        <p className="text-xs text-slate-700 mt-1 leading-relaxed font-hindi">
                          {faq.answer?.hi}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="py-16 text-center text-slate-400 text-sm">
            No FAQs found. Click "Add New FAQ" to create your first bilingual entry.
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingFaq ? 'Edit FAQ Content' : 'Create New Bilingual FAQ'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                🇬🇧 Question (English)
              </label>
              <input 
                type="text" 
                required 
                value={formData.question_en} 
                onChange={e => setFormData({...formData, question_en: e.target.value})} 
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                placeholder="e.g. Is ToppScorers free for teachers?"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                🇮🇳 Question (Hindi)
              </label>
              <input 
                type="text" 
                value={formData.question_hi} 
                onChange={e => setFormData({...formData, question_hi: e.target.value})} 
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                placeholder="उदा. क्या ToppScorers शिक्षकों के लिए मुफ्त है?"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                🇬🇧 Answer (English)
              </label>
              <textarea 
                required 
                rows="3" 
                value={formData.answer_en} 
                onChange={e => setFormData({...formData, answer_en: e.target.value})} 
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                placeholder="Detailed answer explanation in English..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                🇮🇳 Answer (Hindi)
              </label>
              <textarea 
                rows="3" 
                value={formData.answer_hi} 
                onChange={e => setFormData({...formData, answer_hi: e.target.value})} 
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                placeholder="विस्तृत उत्तर हिंदी में..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4 items-center pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Display Order
                </label>
                <input 
                  type="number" 
                  required 
                  value={formData.order} 
                  onChange={e => setFormData({...formData, order: e.target.value})} 
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div className="flex items-center pt-5">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={formData.isVisible} 
                    onChange={e => setFormData({...formData, isVisible: e.target.checked})} 
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  <span className="ml-3 text-xs font-bold text-slate-700">Display on Homepage</span>
                </label>
              </div>
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
              {submitting ? 'Saving...' : 'Publish FAQ'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FAQEditor;
