import React from 'react';
import { Link } from 'react-router-dom';
import { FaShieldAlt, FaArrowLeft, FaCheckCircle, FaLock } from 'react-icons/fa';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-slate-50/70 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-xs">
        <Link to="/" className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-slate-900 mb-6">
          <FaArrowLeft className="mr-1.5" />
          Back to Home
        </Link>

        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <FaShieldAlt size={22} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Privacy Policy
            </h1>
            <p className="text-xs text-slate-500">
              Last updated: September 2026 • Compliant with India's Digital Personal Data Protection (DPDP) Act, 2023
            </p>
          </div>
        </div>

        <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">1. Overview & Commitment</h2>
            <p>
              ToppScorers ("we", "our", or "the Platform") is committed to protecting your personal data and ensuring transparent, lawful, and secure processing. This Privacy Policy outlines what information we collect, how it is used, and how you maintain full control over your privacy while discovering teachers and students across India.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">2. What We Collect</h2>
            <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
              <li><strong>Account Credentials:</strong> Full name, email address, phone number, encrypted password, or Google OAuth identity token.</li>
              <li><strong>Educator Credentials:</strong> Degrees, teaching certifications (TET/CTET), exam ranks, demo video links, and subjects taught.</li>
              <li><strong>Student & Tuition Info:</strong> Class level, target exams (JEE/NEET/Boards/UPSC), subjects required, budget ranges, and tuition goals.</li>
              <li><strong>Location Data:</strong> State, city, locality/area, pincode, and optional geographic coordinates for distance estimation.</li>
            </ul>
          </section>

          <section className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
            <h2 className="text-sm font-bold text-amber-900 mb-1 flex items-center">
              <FaLock className="mr-2 text-amber-700" />
              3. Address & Contact Privacy Architecture
            </h2>
            <p className="text-xs text-amber-950 mb-2">
              We enforce strict default privacy controls on all user profiles:
            </p>
            <ul className="list-disc pl-5 text-xs text-amber-900 space-y-1">
              <li><strong>General Directory Visibility:</strong> Only your broad area and city are shown to users. Exact street addresses, house numbers, and phone numbers are hidden by default.</li>
              <li><strong>Connection Gate:</strong> Full phone numbers and exact street addresses are unlocked <em>only</em> after a mutual connection request has been sent and accepted by both parties.</li>
              <li><strong>Public Opt-In:</strong> You may selectively choose to make your phone or address publicly visible in your Account Settings.</li>
              <li><strong>Audit Logging:</strong> We record timestamps and viewer identifiers whenever full contact information is accessed to track and deter misuse.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">4. Protection of Children’s Data (DPDP Act, 2023)</h2>
            <p className="text-xs sm:text-sm mb-2">
              In strict compliance with the provisions regarding minors under Section 9 of the Digital Personal Data Protection Act, 2023:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
              <li>Students under 18 years of age require verifiable parental/guardian consent before phone numbers or home addresses are shared with educators.</li>
              <li>We do not track, profile, or serve behavioral advertising targeted at minor users.</li>
              <li>Parents or guardians can review, update, or revoke access to their ward's data at any time.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">5. Your Data Rights</h2>
            <p className="mb-2">You possess comprehensive statutory rights over your personal information:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <strong>Right to Access:</strong> View all information stored about you in your dashboard and profile.
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <strong>Right to Correction:</strong> Edit and rectify inaccurate or outdated information in your settings.
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <strong>Right to Erasure:</strong> Permanently delete your account and personal records at any time.
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <strong>Right to Grievance Redressal:</strong> Contact our Data Protection Officer for any privacy concerns.
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">6. Contact & Grievance Officer</h2>
            <p className="text-xs sm:text-sm">
              For any questions, data subject requests, or privacy complaints under DPDP Act 2023, please reach our Grievance Officer at <strong>privacy@toppscorers.com</strong> or via WhatsApp at <strong>+91 7019074944</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
