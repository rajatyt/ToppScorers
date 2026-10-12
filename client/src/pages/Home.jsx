import React, { useState, useEffect } from 'react';
import axios from '../api/axios';

import HeroSection from '../components/home/HeroSection';
import CoverageSection from '../components/home/CoverageSection';
import WhyTeacherHunt from '../components/home/WhyTeacherHunt';
import ForTeachers from '../components/home/ForTeachers';
import ForStudents from '../components/home/ForStudents';
import WhatsAppSection from '../components/home/WhatsAppSection';
import FAQSection from '../components/home/FAQSection';
import Footer from '../components/home/Footer';
import TeacherHomeVerificationBar from '../components/TeacherHomeVerificationBar';

const sectionComponents = {
  hero: HeroSection,
  coverage: CoverageSection,
  whyTeacherHunt: WhyTeacherHunt,
  forTeachers: ForTeachers,
  forStudents: ForStudents,
  whatsapp: WhatsAppSection,
  faqs: FAQSection,
};

const defaultSections = [
  { sectionKey: 'hero', order: 0, isVisible: true },
  { sectionKey: 'coverage', order: 1, isVisible: true },
  { sectionKey: 'whyTeacherHunt', order: 2, isVisible: true },
  { sectionKey: 'forTeachers', order: 3, isVisible: true },
  { sectionKey: 'forStudents', order: 4, isVisible: true },
  { sectionKey: 'whatsapp', order: 5, isVisible: true },
  { sectionKey: 'faqs', order: 6, isVisible: true },
];

const Home = () => {
  const [sections, setSections] = useState(defaultSections);

  useEffect(() => {
    const fetchWidgets = async () => {
      try {
        const { data } = await axios.get('/widgets');
        if (data && data.length > 0) {
          setSections(data.sort((a, b) => a.order - b.order));
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
      {sections
        .filter((s) => s.isVisible)
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
