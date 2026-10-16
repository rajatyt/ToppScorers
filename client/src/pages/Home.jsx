import React, { useState, useEffect, useContext } from 'react';
import axios from '../api/axios';
import { AuthContext } from '../context/AuthContext';

import HeroSection from '../components/home/HeroSection';
import CoverageSection from '../components/home/CoverageSection';
import WhyTeacherHunt from '../components/home/WhyTeacherHunt';
import EarningsCalculatorSection from '../components/home/EarningsCalculatorSection';
import WhatsAppSection from '../components/home/WhatsAppSection';
import FAQSection from '../components/home/FAQSection';
import Footer from '../components/home/Footer';
import TeacherHomeVerificationBar from '../components/TeacherHomeVerificationBar';
import StudentHomeVerificationBar from '../components/StudentHomeVerificationBar';

const sectionComponents = {
  hero: HeroSection,
  coverage: CoverageSection,
  whyTeacherHunt: WhyTeacherHunt,
  calculator: EarningsCalculatorSection,
  whatsapp: WhatsAppSection,
  faqs: FAQSection,
};

const defaultSections = [
  { sectionKey: 'hero', order: 0, isVisible: true },
  { sectionKey: 'coverage', order: 1, isVisible: true },
  { sectionKey: 'whyTeacherHunt', order: 2, isVisible: true },
  { sectionKey: 'calculator', order: 3, isVisible: true },
  { sectionKey: 'whatsapp', order: 4, isVisible: true },
  { sectionKey: 'faqs', order: 5, isVisible: true },
];

const Home = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const isTeacher = Boolean(isAuthenticated && user?.role === 'teacher');
  const [sections, setSections] = useState(defaultSections);

  useEffect(() => {
    const fetchWidgets = async () => {
      try {
        const { data } = await axios.get('/widgets');
        if (data && data.length > 0) {
          const cleaned = data.filter(w => w.sectionKey !== 'forTeachers' && w.sectionKey !== 'forStudents');
          const hasCalculator = cleaned.some(w => w.sectionKey === 'calculator');
          const merged = hasCalculator 
            ? cleaned 
            : [...cleaned, { sectionKey: 'calculator', order: 3.5, isVisible: true }];
          setSections(merged.sort((a, b) => a.order - b.order));
        }
      } catch (err) {
        // Use default order if API fails
        console.log('Using default widget order');
      }
    };
    fetchWidgets();
  }, []);

  return (
    <div className="bg-white">
      <TeacherHomeVerificationBar />
      <StudentHomeVerificationBar />
      {sections
        .filter((s) => {
          if (!s.isVisible) return false;
          if (s.sectionKey === 'calculator' && !isTeacher) return false;
          return true;
        })
        .sort((a, b) => a.order - b.order)
        .map((section) => {
          const Component = sectionComponents[section.sectionKey];
          if (!Component) return null;
          return <Component key={section.sectionKey} />;
        })}
      <Footer />
    </div>
  );
};

export default Home;
