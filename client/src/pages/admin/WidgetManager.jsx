import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  DndContext, closestCenter, KeyboardSensor, PointerSensor, 
  useSensor, useSensors 
} from '@dnd-kit/core';
import { 
  SortableContext, verticalListSortingStrategy, useSortable, 
  sortableKeyboardCoordinates, arrayMove 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  FiMenu, FiEye, FiEyeOff, FiCheck, FiRefreshCw, 
  FiExternalLink, FiTv, FiGrid, FiAward, FiUserCheck, 
  FiBookOpen, FiHelpCircle, FiMessageCircle 
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import axios from '../../api/axios';
import toast from 'react-hot-toast';

const sectionMeta = {
  hero: { 
    title: 'Hero Banner Section', 
    desc: 'Main visual header, primary headline, search buttons & language toggle', 
    icon: <FiTv className="text-blue-500" />,
    badge: 'Header & Intro'
  },
  coverage: { 
    title: 'Exam Coverage Section', 
    desc: 'Grid cards for JEE, NEET, Foundation, Board, CUET, UPSC, CA, CAT', 
    icon: <FiGrid className="text-emerald-500" />,
    badge: 'Exam Badges'
  },
  whyTeacherHunt: { 
    title: 'Why ToppScorers Section', 
    desc: '6 feature cards: Real matching, Demo lectures, Credentials, Direct calls', 
    icon: <FiAward className="text-amber-500" />,
    badge: 'Value Proposition'
  },
  forTeachers: { 
    title: 'For Teachers Section', 
    desc: 'Teacher value points, verified credentials CTA, profile registration link', 
    icon: <FiBookOpen className="text-indigo-500" />,
    badge: 'Teacher Onboarding'
  },
  forStudents: { 
    title: 'For Students & Institutes Section', 
    desc: 'Search verified teachers, demo lecture comparisons, contact tutors directly', 
    icon: <FiUserCheck className="text-rose-500" />,
    badge: 'Student Onboarding'
  },
  whatsapp: { 
    title: 'WhatsApp Community Section', 
    desc: 'Green callout banner inviting educators to join regional WhatsApp updates', 
    icon: <FaWhatsapp className="text-emerald-500" />,
    badge: 'Social Community'
  },
  faqs: { 
    title: 'Frequently Asked Questions (FAQs)', 
    desc: 'Interactive accordion for common tuition and registration questions', 
    icon: <FiHelpCircle className="text-purple-500" />,
    badge: 'FAQ Accordion'
  },
};

const SortableItem = ({ id, item, onChangeVisibility }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const meta = sectionMeta[item.sectionKey] || {
    title: item.sectionKey.replace(/_/g, ' '),
    desc: 'Configurable homepage section block',
    icon: <FiGrid className="text-slate-500" />,
    badge: 'Section'
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`group flex items-center justify-between p-4 sm:p-5 mb-3 bg-white rounded-2xl border transition-all duration-200 ${
        isDragging 
          ? 'shadow-2xl border-amber-400 bg-amber-50/20 scale-[1.02]' 
          : 'shadow-xs border-slate-200/80 hover:shadow-md hover:border-slate-300'
      }`}
    >
      <div className="flex items-center space-x-4 min-w-0">
        {/* Drag Handle */}
        <div 
          {...attributes} 
          {...listeners} 
          className="p-2.5 rounded-xl bg-slate-100 hover:bg-amber-100 hover:text-amber-800 text-slate-400 cursor-grab active:cursor-grabbing transition-colors"
          title="Drag up or down to reorder"
        >
          <FiMenu size={18} />
        </div>

        {/* Section Order Pill */}
        <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
          #{item.order}
        </div>

        {/* Section Details */}
        <div className="min-w-0">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{meta.icon}</span>
            <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-snug truncate">
              {meta.title}
            </h4>
            <span className="hidden sm:inline-block text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
              {meta.badge}
            </span>
          </div>
          <p className="text-xs text-slate-500 truncate max-w-md mt-0.5">
            {meta.desc}
          </p>
        </div>
      </div>

      {/* Visibility Toggle & Status */}
      <div className="flex items-center space-x-3 shrink-0 ml-4">
        <span className={`hidden sm:inline-flex items-center space-x-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
          item.isVisible 
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
            : 'bg-slate-100 text-slate-500 border border-slate-200'
        }`}>
          {item.isVisible ? <FiEye size={12} /> : <FiEyeOff size={12} />}
          <span>{item.isVisible ? 'Visible' : 'Hidden'}</span>
        </span>

        {/* Custom Toggle Switch */}
        <button
          type="button"
          onClick={() => onChangeVisibility(id)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            item.isVisible ? 'bg-amber-500' : 'bg-slate-300'
          }`}
          role="switch"
          aria-checked={item.isVisible}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
              item.isVisible ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </div>
  );
};

const WidgetManager = () => {
  const { t } = useTranslation();
  const [widgets, setWidgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchWidgets = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/widgets');
      if (response.data && response.data.length > 0) {
        const sorted = [...response.data].sort((a, b) => a.order - b.order);
        setWidgets(sorted);
      }
    } catch (error) {
      toast.error('Failed to load widget configurations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWidgets();
  }, []);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setWidgets((items) => {
        const oldIndex = items.findIndex((i) => i.sectionKey === active.id);
        const newIndex = items.findIndex((i) => i.sectionKey === over.id);
        const newArray = arrayMove(items, oldIndex, newIndex);
        return newArray.map((item, index) => ({ ...item, order: index + 1 }));
      });
    }
  };

  const toggleVisibility = (id) => {
    setWidgets(widgets.map(w => w.sectionKey === id ? { ...w, isVisible: !w.isVisible } : w));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await axios.put('/widgets', widgets);
      toast.success('Homepage widget layout saved successfully!');
    } catch (error) {
      toast.error('Failed to update widgets layout');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-80 space-y-3">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-amber-500"></div>
        <p className="text-sm font-medium text-slate-500">Loading homepage layout components...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Homepage Widget Manager
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
              Drag & Drop
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            Grab any section handle to reorder the homepage visual structure in real time, or toggle visibility to instantly show/hide blocks for visitors.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <a 
            href="/" 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center space-x-1.5 px-3.5 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <span>Preview Site</span>
            <FiExternalLink size={13} />
          </a>
          <button
            onClick={fetchWidgets}
            className="p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            title="Reset layout from server"
          >
            <FiRefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* DnD Sortable Container */}
      <div className="space-y-1">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={widgets.map(w => w.sectionKey)} strategy={verticalListSortingStrategy}>
            {widgets.map((widget) => (
              <SortableItem 
                key={widget.sectionKey} 
                id={widget.sectionKey} 
                item={widget} 
                onChangeVisibility={toggleVisibility} 
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      {/* Floating Save Toolbar */}
      <div className="sticky bottom-6 z-20 flex items-center justify-between bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-800 backdrop-blur-md">
        <div className="flex items-center space-x-3 text-xs text-slate-300">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          <span>{widgets.filter(w => w.isVisible).length} of {widgets.length} sections visible on landing page</span>
        </div>

        <div className="flex items-center space-x-3">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] disabled:opacity-50"
          >
            <FiCheck size={16} />
            <span>{saving ? 'Publishing Changes...' : 'Save & Publish Layout'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WidgetManager;
