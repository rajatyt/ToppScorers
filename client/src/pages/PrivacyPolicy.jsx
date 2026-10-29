import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaShieldAlt, FaArrowLeft, FaCheckCircle, FaLock, FaUserGraduate,
  FaChild, FaUserShield, FaExclamationTriangle, FaEnvelope, FaPhoneAlt,
  FaMapMarkerAlt, FaFileAlt, FaBalanceScale, FaHistory, FaDownload
} from 'react-icons/fa';

const PrivacyPolicy = () => {
  const [activeSection, setActiveSection] = useState('all');

  const sections = [
    { id: 'dpdp-framework', title: '1. Statutory Framework & Data Fiduciary' },
    { id: 'data-collected', title: '2. Notice & Categories of Personal Data' },
    { id: 'lawful-basis', title: '3. Lawful Basis & Consent Mechanism' },
    { id: 'privacy-architecture', title: '4. Contact & Address Privacy Architecture' },
    { id: 'children-data', title: '5. Protection of Children’s Personal Data' },
    { id: 'principal-rights', title: '6. Rights of the Data Principal' },
    { id: 'principal-duties', title: '7. Statutory Duties of the Data Principal' },
    { id: 'security-breach', title: '8. Technical Safeguards & Breach Protocol' },
    { id: 'retention-erasure', title: '9. Data Retention & Erasure' },
    { id: 'grievance-dpo', title: '10. Grievance Redressal & DPO Contact' },
  ];

  return (
    <div className="min-h-screen bg-slate-50/80 py-10 sm:py-14 px-4 sm:px-6 lg:px-8 font-sans text-slate-800">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center text-xs sm:text-sm font-bold text-slate-600 hover:text-amber-600 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Back to Home
          </Link>
          <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
            DPDP Act, 2023 Compliant
          </span>
        </div>

        {/* Hero Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-5">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-700 flex items-center justify-center shrink-0">
              <FaShieldAlt size={28} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Privacy Policy & Data Protection Notice
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Formulated under Section 5 &amp; Section 6 of the <strong>Digital Personal Data Protection Act, 2023 (Act No. 22 of 2023, Republic of India)</strong>
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-3 text-[11px] text-slate-500 font-medium">
                <span>Effective Date: 1 September 2026</span>
                <span>•</span>
                <span>Last Updated: October 2026</span>
                <span>•</span>
                <span>Jurisdiction: Republic of India</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 bg-amber-50/60 -mx-6 -mb-6 p-6 sm:-mx-10 sm:-mb-10 rounded-b-3xl text-xs sm:text-sm text-amber-950 flex items-start space-x-3">
            <FaBalanceScale className="text-amber-600 mt-0.5 shrink-0 text-base" />
            <p className="leading-relaxed">
              <strong>Statutory Summary:</strong> ToppScorers acts as a <strong>Data Fiduciary</strong> in respect of your digital personal data. We process your data exclusively on lawful grounds, with your explicit and informed consent, adhering strictly to purpose limitation, storage minimization, technical security safeguards, and the full spectrum of Data Principal rights guaranteed under Indian law.
            </p>
          </div>
        </div>

        {/* Quick Jump Index */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center">
            <FaFileAlt className="mr-2 text-amber-500" />
            Table of Contents
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {sections.map((sec) => (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                className="text-slate-600 hover:text-amber-600 hover:bg-amber-50/50 p-2 rounded-lg transition-colors flex items-center"
              >
                <span className="text-amber-500 font-bold mr-2">›</span>
                {sec.title}
              </a>
            ))}
          </div>
        </div>

        {/* Content Sections */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-10 text-slate-700 text-sm leading-relaxed">
          
          {/* Section 1 */}
          <section id="dpdp-framework" className="scroll-mt-6">
            <div className="flex items-center space-x-2.5 mb-3">
              <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 text-xs font-black flex items-center justify-center">1</span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Statutory Framework &amp; Data Fiduciary Identity
              </h2>
            </div>
            <div className="space-y-3 text-xs sm:text-sm text-slate-600">
              <p>
                This Policy is published pursuant to and in full compliance with the <strong>Digital Personal Data Protection Act, 2023 ("DPDP Act, 2023")</strong>, the <strong>Information Technology Act, 2000 ("IT Act")</strong>, and the <strong>Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011</strong>.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Data Fiduciary</span>
                  <strong className="text-slate-900 block">ToppScorers Technologies</strong>
                  <span className="text-xs text-slate-500">Prayagraj, Uttar Pradesh - 211001, India</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Data Principals</span>
                  <strong className="text-slate-900 block">Tutors, Students &amp; Parents/Guardians</strong>
                  <span className="text-xs text-slate-500">Individuals to whom personal data relates</span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section id="data-collected" className="scroll-mt-6">
            <div className="flex items-center space-x-2.5 mb-3">
              <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 text-xs font-black flex items-center justify-center">2</span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Itemized Notice &amp; Categories of Personal Data Collected
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mb-4">
              In accordance with Section 5(1) of the DPDP Act, 2023, the following itemized list identifies each category of personal data collected, its operational purpose, and processing context:
            </p>
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm">
                <div className="flex items-center justify-between mb-1.5 font-bold text-slate-900">
                  <span>A. Identity &amp; Contact Credentials</span>
                  <span className="text-[10px] uppercase tracking-wider bg-slate-200 text-slate-700 px-2 py-0.5 rounded">Compulsory</span>
                </div>
                <p className="text-slate-600 mb-2">
                  Full name, mobile telephone number, email address, hashed passwords, and OAuth profile tokens (when logging in with Google).
                </p>
                <div className="text-[11px] text-slate-500">
                  <strong>Purpose:</strong> User authentication, secure OTP verification, connection routing, and fraud deterrence.
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm">
                <div className="flex items-center justify-between mb-1.5 font-bold text-slate-900">
                  <span>B. Educator Credentials &amp; Verification Data</span>
                  <span className="text-[10px] uppercase tracking-wider bg-amber-100 text-amber-900 px-2 py-0.5 rounded">Tutors Only</span>
                </div>
                <p className="text-slate-600 mb-2">
                  Highest academic degree, university/college name, passing year, specialized subjects, target exams (NEET, JEE, CBSE, ICSE, UP Board), tuition mode (Home, Online, Both), budget/rates, preferred time slots, government ID numbers (Aadhaar, PAN, Voter ID, Driving License), and optional certificates/marksheets.
                </p>
                <div className="text-[11px] text-slate-500">
                  <strong>Purpose:</strong> Validating teacher competence, preventing academic impersonation, securing student safety, and displaying accurate tutor profiles.
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm">
                <div className="flex items-center justify-between mb-1.5 font-bold text-slate-900">
                  <span>C. Student Academic &amp; Requirement Data</span>
                  <span className="text-[10px] uppercase tracking-wider bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded">Students / Parents</span>
                </div>
                <p className="text-slate-600 mb-2">
                  Grade/class level, curriculum board, required subjects, target competitive exams, budget frequency, and preferred class timings.
                </p>
                <div className="text-[11px] text-slate-500">
                  <strong>Purpose:</strong> Matching learners with qualified and nearby home/online educators based on learning goals.
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm">
                <div className="flex items-center justify-between mb-1.5 font-bold text-slate-900">
                  <span>D. Geographic &amp; Coverage Data (Prayagraj / UP)</span>
                  <span className="text-[10px] uppercase tracking-wider bg-slate-200 text-slate-700 px-2 py-0.5 rounded">Locality Level</span>
                </div>
                <p className="text-slate-600 mb-2">
                  District (Prayagraj), Locality / Area (e.g., Daraganj, Civil Lines, Katra), and 6-digit Pincode.
                </p>
                <div className="text-[11px] text-slate-500">
                  <strong>Purpose:</strong> Neighborhood-level proximity matching without publicly disclosing house numbers or exact street addresses.
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm">
                <div className="flex items-center justify-between mb-1.5 font-bold text-slate-900">
                  <span>E. Connection, Audit &amp; Technical Logs</span>
                  <span className="text-[10px] uppercase tracking-wider bg-slate-200 text-slate-700 px-2 py-0.5 rounded">System Generated</span>
                </div>
                <p className="text-slate-600 mb-2">
                  IP addresses, browser client headers, device type, connection request timestamps, acceptance/rejection/cancellation records, and secure session cookies.
                </p>
                <div className="text-[11px] text-slate-500">
                  <strong>Purpose:</strong> Cybersecurity auditing, rate limiting, preventing brute force attacks, and complying with statutory log retention obligations under Indian law.
                </div>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section id="lawful-basis" className="scroll-mt-6">
            <div className="flex items-center space-x-2.5 mb-3">
              <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 text-xs font-black flex items-center justify-center">3</span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Lawful Basis &amp; Consent Mechanism (Section 6)
              </h2>
            </div>
            <div className="space-y-3 text-xs sm:text-sm text-slate-600">
              <p>
                Under Section 6 of the DPDP Act, 2023, personal data is processed solely on the following grounds:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <strong>Free, Specific, Informed, Unconditional, and Unambiguous Consent:</strong> You provide explicit affirmative consent by checking the consent acknowledgment during registration, profile creation, and verification submission.
                </li>
                <li>
                  <strong>Right to Withdraw Consent at Any Time (Section 6(4)):</strong> You may withdraw your consent at any time as easily as you gave it. Withdrawal can be executed via your Profile Settings or by emailing our Grievance Officer. Withdrawal does not affect the legality of processing conducted prior to withdrawal.
                </li>
                <li>
                  <strong>Legitimate Uses (Section 7):</strong> Limited processing necessary for fulfilling verified connection requests initiated by you, complying with any judicial orders, or preventing cyber-fraud.
                </li>
                <li>
                  <strong>Multilingual Notice Availability (Section 5(3)):</strong> You may access this notice in English and any of the 22 languages specified in the Eighth Schedule to the Constitution of India (including Hindi) by contacting our Grievance Desk.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 4 */}
          <section id="privacy-architecture" className="scroll-mt-6">
            <div className="flex items-center space-x-2.5 mb-3">
              <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 text-xs font-black flex items-center justify-center">4</span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Contact &amp; Address Privacy Architecture
              </h2>
            </div>
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
              <div className="flex items-center text-amber-900 font-bold text-xs sm:text-sm">
                <FaLock className="mr-2 text-amber-600" />
                Default Zero-Exposure Privacy Standards
              </div>
              <p className="text-xs text-amber-950 leading-relaxed">
                To prevent unsolicited commercial calls, stalking, and identity theft, ToppScorers enforces an architectural privacy gate:
              </p>
              <ul className="list-disc pl-5 text-xs text-amber-900 space-y-1.5">
                <li>
                  <strong>Redacted Public Directory:</strong> Public tutor and student cards display only the broad area (e.g. Daraganj, Prayagraj) and subject specializations. Exact phone numbers, email addresses, and residential addresses are <em>strictly redacted</em>.
                </li>
                <li>
                  <strong>Mutual Connection Gate:</strong> Direct phone numbers and coordination contacts are unlocked <em>only after a mutual connection request is explicitly accepted</em> by both parties.
                </li>
                <li>
                  <strong>Unilateral Request Cancellation:</strong> If a teacher or student does not accept or respond to a connection request, the sender can cancel and remove the request at any time, immediately clearing the coordination trail.
                </li>
                <li>
                  <strong>Document Non-Disclosure:</strong> Uploaded government identification proofs and educational marksheets are used exclusively by authorized verification administrators and are <em>never</em> published to any public profile or search engine.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 5 */}
          <section id="children-data" className="scroll-mt-6">
            <div className="flex items-center space-x-2.5 mb-3">
              <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 text-xs font-black flex items-center justify-center">5</span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Protection of Children’s Personal Data (Section 9)
              </h2>
            </div>
            <div className="space-y-3 text-xs sm:text-sm text-slate-600">
              <p>
                In strict compliance with Section 9 of the DPDP Act, 2023 regarding minors (individuals under 18 years of age):
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center mb-2 font-bold">
                    <FaChild />
                  </div>
                  <strong className="block text-slate-900 text-xs mb-1">Verifiable Parental Consent</strong>
                  <span className="text-[11px] text-slate-500">
                    Accounts for school students under 18 must be registered, monitored, or explicitly authorized by parents or legal guardians.
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center mb-2 font-bold">
                    <FaShieldAlt />
                  </div>
                  <strong className="block text-slate-900 text-xs mb-1">No Behavioral Tracking</strong>
                  <span className="text-[11px] text-slate-500">
                    We do not track, profile, or conduct behavioral monitoring of minor students across our web platform.
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center mb-2 font-bold">
                    <FaExclamationTriangle />
                  </div>
                  <strong className="block text-slate-900 text-xs mb-1">Zero Targeted Ads</strong>
                  <span className="text-[11px] text-slate-500">
                    Targeted advertising directed at children, and any processing causing detrimental effects to children, is strictly prohibited.
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section id="principal-rights" className="scroll-mt-6">
            <div className="flex items-center space-x-2.5 mb-3">
              <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 text-xs font-black flex items-center justify-center">6</span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Statutory Rights of the Data Principal (Sections 11–14)
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mb-3">
              As a Data Principal under Indian law, you are endowed with the following enforceable statutory rights:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <strong className="text-slate-900 block mb-1">Right to Access (Section 11)</strong>
                <p className="text-slate-600 text-xs">
                  Right to receive a summary of your personal data being processed, processing activities, and identities of all entities with whom data is shared.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <strong className="text-slate-900 block mb-1">Right to Correction &amp; Updating (Section 12(1))</strong>
                <p className="text-slate-600 text-xs">
                  Right to correct inaccurate or misleading personal data, complete incomplete information, and update your records via the profile dashboard.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <strong className="text-slate-900 block mb-1">Right to Erasure (Section 12(2))</strong>
                <p className="text-slate-600 text-xs">
                  Right to request permanent deletion of your profile and data when the educational purpose is fulfilled or upon consent withdrawal.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <strong className="text-slate-900 block mb-1">Right of Grievance Redressal (Section 13)</strong>
                <p className="text-slate-600 text-xs">
                  Right to lodge grievances with our Data Protection Officer and receive acknowledgment within 48 hours and resolution within statutory limits.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 sm:col-span-2">
                <strong className="text-slate-900 block mb-1">Right to Nominate (Section 14)</strong>
                <p className="text-slate-600 text-xs">
                  Right to nominate another individual who, in the event of your death or incapacity, shall be authorized to exercise data rights on your behalf.
                </p>
              </div>
            </div>
          </section>

          {/* Section 7 */}
          <section id="principal-duties" className="scroll-mt-6">
            <div className="flex items-center space-x-2.5 mb-3">
              <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 text-xs font-black flex items-center justify-center">7</span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Statutory Duties of the Data Principal (Section 15)
              </h2>
            </div>
            <div className="space-y-2 text-xs sm:text-sm text-slate-600">
              <p>Under Section 15 of the DPDP Act, 2023, every user accessing ToppScorers must comply with these legal obligations:</p>
              <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
                <li>You shall not impersonate another person while providing your personal data.</li>
                <li>You shall not suppress any material information while furnishing your personal details.</li>
                <li>You shall not register false, malicious, or frivolous grievances with the Data Fiduciary or the Data Protection Board of India.</li>
                <li>You shall furnish only verifiably authentic information when submitting credentials, teaching records, and government identity documents.</li>
              </ul>
            </div>
          </section>

          {/* Section 8 */}
          <section id="security-breach" className="scroll-mt-6">
            <div className="flex items-center space-x-2.5 mb-3">
              <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 text-xs font-black flex items-center justify-center">8</span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Technical Security Safeguards &amp; Breach Protocol (Section 8)
              </h2>
            </div>
            <div className="space-y-3 text-xs sm:text-sm text-slate-600">
              <p>
                In compliance with Section 8(5) of the DPDP Act, 2023, we deploy reasonable and modern technical and organizational measures:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
                <li><strong>Transport Layer Security:</strong> All data in transit is encrypted using modern TLS 1.3 / HTTPS protocols.</li>
                <li><strong>Credential Hashing:</strong> Passwords are cryptographically salted and hashed using industry-standard bcrypt algorithms.</li>
                <li><strong>Role-Based Access Control (RBAC):</strong> Verification documents are accessible solely to authorized compliance officers on a strict need-to-know basis.</li>
                <li><strong>Statutory Breach Notification (Section 8(6)):</strong> In the event of any personal data breach, ToppScorers shall notify the <strong>Data Protection Board of India (DPBI)</strong> and all affected Data Principals in the prescribed form and manner without undue delay.</li>
              </ul>
            </div>
          </section>

          {/* Section 9 */}
          <section id="retention-erasure" className="scroll-mt-6">
            <div className="flex items-center space-x-2.5 mb-3">
              <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 text-xs font-black flex items-center justify-center">9</span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Data Retention &amp; Erasure Policy (Section 8(7))
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              We retain personal data only for as long as your account remains active or as necessary to fulfill the educational matchmaking purposes for which it was collected. When you delete your account or withdraw consent, we erase or irrevocably anonymize your personal records within 30 days, unless retention is mandated under the Information Technology Act, taxation laws, or an explicit judicial order by an Indian court of law.
            </p>
          </section>

          {/* Section 10 */}
          <section id="grievance-dpo" className="scroll-mt-6 pt-2">
            <div className="flex items-center space-x-2.5 mb-3">
              <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 text-xs font-black flex items-center justify-center">10</span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Grievance Redressal &amp; Data Protection Officer Contact
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mb-4">
              Pursuant to Section 8(9) and Section 13 of the DPDP Act, 2023, you may contact our designated Grievance Redressal Officer for any privacy concerns, data subject requests, or statutory grievances:
            </p>

            <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                  <FaUserShield size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base">Grievance Redressal Officer &amp; DPO</h3>
                  <p className="text-xs text-amber-400 font-medium">ToppScorers Technologies Pvt. Ltd.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div className="flex items-center space-x-2 text-slate-300">
                  <FaEnvelope className="text-amber-400 shrink-0" />
                  <span><strong>Email:</strong> privacy@toppscorers.com</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-300">
                  <FaPhoneAlt className="text-amber-400 shrink-0" />
                  <span><strong>WhatsApp / Helpline:</strong> +91 7019074944</span>
                </div>
                <div className="flex items-start space-x-2 text-slate-300 sm:col-span-2">
                  <FaMapMarkerAlt className="text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Official Address:</strong> Prayagraj (Allahabad), Uttar Pradesh - 211001, India</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                <strong>Resolution Timeline:</strong> Grievance requests are acknowledged within 48 hours and resolved within thirty (30) days. If your grievance is not redressed satisfactorily, you maintain the statutory right to escalate your complaint to the <strong>Data Protection Board of India (DPBI)</strong>.
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;