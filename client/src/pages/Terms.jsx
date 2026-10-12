import React from 'react';
import { Link } from 'react-router-dom';
import { FaFileContract, FaArrowLeft } from 'react-icons/fa';

const Terms = () => {
  return (
    <div className="min-h-screen bg-slate-50/70 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-xs">
        <Link to="/" className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-slate-900 mb-6">
          <FaArrowLeft className="mr-1.5" />
          Back to Home
        </Link>

        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <FaFileContract size={22} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Terms of Service
            </h1>
            <p className="text-xs text-slate-500">
              Last updated: September 2026 • Platform Usage and Code of Conduct
            </p>
          </div>
        </div>

        <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">1. Agreement to Terms</h2>
            <p>
              By accessing or using the ToppScorers platform, you agree to comply with and be bound by these Terms of Service. If you do not agree, please do not use or access our services.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">2. Eligibility & User Accounts</h2>
            <p className="text-xs sm:text-sm">
              Users must provide accurate, current, and complete information during registration. If you are registering on behalf of a minor student, you affirm that you are the parent or authorized legal guardian.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">3. Teacher & Student Conduct</h2>
            <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
              <li><strong>Educator Authenticity:</strong> Teachers must only list authentic qualifications, degrees, and verified exam rankings. Submission of forged certificates (TET/CTET) results in permanent suspension.</li>
              <li><strong>Direct Professional Communication:</strong> Contact details shared via connection requests must be used strictly for bona fide tuition and coaching discussions.</li>
              <li><strong>Zero Tolerance for Harassment:</strong> Any abusive language, spam, commercial solicitation, or inappropriate conduct will lead to immediate account termination and legal reporting.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">4. Disclaimers & Tuition Contracts</h2>
            <p className="text-xs sm:text-sm">
              ToppScorers facilitates discovery and mutual introduction between verified educators and students. We do not set tuition fees or act as an employer of independent tutors. Any payment terms, schedules, or tuition contracts are mutually agreed between the teacher and the student/parent.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">5. Termination & Profile Suspension</h2>
            <p className="text-xs sm:text-sm">
              We reserve the right to suspend or remove any profile that violates our community standards, receives verified abuse reports, or infringes Indian laws.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">6. Governing Law</h2>
            <p className="text-xs sm:text-sm">
              These Terms are governed by and construed in accordance with the laws of India. Any disputes arising out of the platform shall be subject to the exclusive jurisdiction of the courts in India.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;
