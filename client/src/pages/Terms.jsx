import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaFileContract, FaArrowLeft, FaBalanceScale, FaShieldAlt, FaUserCheck,
  FaHome, FaExclamationTriangle, FaGavel, FaEnvelope, FaPhoneAlt, FaMapMarkerAlt
} from 'react-icons/fa';

const Terms = () => {
  const sections = [
    { id: 'contract-acceptance', title: '1. Agreement & Electronic Contract' },
    { id: 'intermediary-status', title: '2. Intermediary Status & Platform Scope' },
    { id: 'eligibility-parents', title: '3. Eligibility & Minor Students (DPDP Act)' },
    { id: 'tutor-verification', title: '4. Teacher Credentials & Verification Policy' },
    { id: 'connection-rules', title: '5. Connection Requests & Cancellation Rights' },
    { id: 'tuition-agreements', title: '6. Direct Tuition Contracts & Independent Fees' },
    { id: 'safety-guidelines', title: '7. Safety Protocol for Home & In-Person Tuition' },
    { id: 'prohibited-conduct', title: '8. Prohibited Conduct & Zero Harassment' },
    { id: 'data-obligations', title: '9. Data Principal Obligations (DPDP Act)' },
    { id: 'liability-safeharbor', title: '10. Limitation of Liability & Intermediary Safe Harbor' },
    { id: 'governing-jurisdiction', title: '11. Governing Law & Exclusive Jurisdiction (Prayagraj)' },
    { id: 'grievance-contact', title: '12. Grievance Redressal & Nodal Officer' },
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
          <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
            Terms of Service &amp; User Agreement
          </span>
        </div>

        {/* Hero Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-5">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-700 flex items-center justify-center shrink-0">
              <FaFileContract size={28} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Terms and Conditions of Service
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Governed under the <strong>Indian Contract Act, 1872</strong>, the <strong>Information Technology Act, 2000</strong>, and the <strong>Digital Personal Data Protection Act, 2023</strong>
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-3 text-[11px] text-slate-500 font-medium">
                <span>Effective Date: 1 September 2026</span>
                <span>•</span>
                <span>Version: 2.4</span>
                <span>•</span>
                <span>Governing Jurisdiction: Prayagraj (Allahabad), India</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 bg-slate-50 -mx-6 -mb-6 p-6 sm:-mx-10 sm:-mb-10 rounded-b-3xl text-xs sm:text-sm text-slate-700 flex items-start space-x-3">
            <FaBalanceScale className="text-amber-600 mt-0.5 shrink-0 text-base" />
            <p className="leading-relaxed">
              <strong>Important Notice:</strong> By clicking "I Agree", registering an account, or accessing the ToppScorers platform, you enter into a legally enforceable contract with ToppScorers Technologies. Please read these terms carefully before connecting with teachers or students.
            </p>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center">
            <FaBalanceScale className="mr-2 text-amber-500" />
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

        {/* Main Terms Sections */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-10 text-slate-700 text-sm leading-relaxed">
          
          {/* Section 1 */}
          <section id="contract-acceptance" className="scroll-mt-6">
            <div className="flex items-center space-x-2.5 mb-3">
              <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 text-xs font-black flex items-center justify-center">1</span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Agreement &amp; Electronic Contract Acceptance
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600">
              This document is an electronic record generated in accordance with the Information Technology Act, 2000 and rules thereunder, as amended by various statutes including the Digital Personal Data Protection Act, 2023. This electronic record is generated by a computer system and does not require physical or digital signatures. By accessing, browsing, registering on, or using ToppScorers (the "Platform" or "Service"), you agree to be bound by these Terms of Service.
            </p>
          </section>

          {/* Section 2 */}
          <section id="intermediary-status" className="scroll-mt-6">
            <div className="flex items-center space-x-2.5 mb-3">
              <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 text-xs font-black flex items-center justify-center">2</span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Intermediary Status &amp; Platform Scope
              </h2>
            </div>
            <div className="space-y-3 text-xs sm:text-sm text-slate-600">
              <p>
                ToppScorers operates strictly as an <strong>educational marketplace and electronic intermediary</strong> under Section 2(w) and Section 79 of the Information Technology Act, 2000.
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <strong>No Employment Relationship:</strong> Tutors registered on ToppScorers are independent service providers and not employees, contractors, agents, or partners of ToppScorers.
                </li>
                <li>
                  <strong>Direct Tuition Arrangements:</strong> All discussions, tuition fees, lesson timings, pedagogical approaches, and mode of teaching (online or in-person home tutoring) are agreed directly between the tutor and the student/parent.
                </li>
                <li>
                  <strong>No Guarantee of Academic Outcomes:</strong> While ToppScorers verifies credentials, we do not guarantee exam results, test scores, ranks, or academic outcomes.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section id="eligibility-parents" className="scroll-mt-6">
            <div className="flex items-center space-x-2.5 mb-3">
              <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 text-xs font-black flex items-center justify-center">3</span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                User Eligibility &amp; Minor Students (DPDP Act, 2023)
              </h2>
            </div>
            <div className="space-y-3 text-xs sm:text-sm text-slate-600">
              <p>
                Under the Indian Contract Act, 1872 and Section 9 of the DPDP Act, 2023:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <strong>Adult Requirement:</strong> You must be at least 18 years of age to independently register and enter into a binding contract on the Platform.
                </li>
                <li>
                  <strong>Parental / Guardian Consent for Minors:</strong> If you are under 18 years of age (a "minor"), you may use the Platform only under the supervision and with the verifiable consent of your parent or lawful guardian. The parent or guardian agrees to be bound by these Terms on behalf of the minor.
                </li>
                <li>
                  <strong>Accuracy of Registration:</strong> Users must provide true, complete, and updated information. Impersonation of any person or misrepresentation of identity is strictly unlawful under Section 66D of the IT Act.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 4 */}
          <section id="tutor-verification" className="scroll-mt-6">
            <div className="flex items-center space-x-2.5 mb-3">
              <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 text-xs font-black flex items-center justify-center">4</span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Teacher Credentials, Identity Verification &amp; Representation
              </h2>
            </div>
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs sm:text-sm">
              <div className="flex items-center text-slate-900 font-bold">
                <FaUserCheck className="mr-2 text-amber-600" />
                Compulsory Verification Standards
              </div>
              <ul className="list-disc pl-5 text-slate-600 space-y-1.5">
                <li>
                  <strong>Authentic Documentation:</strong> Educators submitting verification details must provide accurate government ID numbers (Aadhaar, PAN, Voter ID, Driving License) and authentic degree qualifications.
                </li>
                <li>
                  <strong>Zero Tolerance for Forgery:</strong> Any submission of forged marksheets, fake degrees, or false examination ranks (e.g. NEET/JEE/B.Ed/TET) constitutes fraud and will result in immediate permanent profile termination and referral to cybercrime authorities.
                </li>
                <li>
                  <strong>Scope of Verification Badge:</strong> The "Verified Tutor" badge indicates that our compliance team has examined the submitted identity and degree records. It does not replace the standard prudent background inquiry that parents should conduct before admitting an educator into their homes.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 5 */}
          <section id="connection-rules" className="scroll-mt-6">
            <div className="flex items-center space-x-2.5 mb-3">
              <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 text-xs font-black flex items-center justify-center">5</span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Connection Requests, Contact Redaction &amp; Cancellation Rights
              </h2>
            </div>
            <div className="space-y-3 text-xs sm:text-sm text-slate-600">
              <p>
                To preserve personal data confidentiality in compliance with the DPDP Act, 2023:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <strong>Redacted Contact Details:</strong> Mobile phone numbers and full addresses remain hidden across public search listings.
                </li>
                <li>
                  <strong>Mutual Acceptance Required:</strong> Direct contact details are released only after the recipient explicitly accepts a connection request.
                </li>
                <li>
                  <strong>Unilateral Request Cancellation:</strong> The sender of any pending connection request maintains the right to cancel and delete the request at any time prior to acceptance.
                </li>
                <li>
                  <strong>Anti-Spam &amp; Anti-Harvesting:</strong> Using unlocked contact numbers for unsolicited marketing, multi-level marketing, commercial sales, or automated messaging is strictly prohibited.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 6 */}
          <section id="tuition-agreements" className="scroll-mt-6">
            <div className="flex items-center space-x-2.5 mb-3">
              <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 text-xs font-black flex items-center justify-center">6</span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Direct Tuition Contracts &amp; Independent Fees
              </h2>
            </div>
            <div className="space-y-2 text-xs sm:text-sm text-slate-600">
              <p>
                Tuition rates, hourly or monthly fee frequencies, payment mechanisms, demo classes, and lesson schedules displayed on profile cards serve solely as indicators set independently by the tutor.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>ToppScorers does not handle or hold tuition payments between parents and tutors unless an explicit escrow payment feature is enabled by mutual consent.</li>
                <li>ToppScorers is not liable for fee disputes, non-payment, tuition session cancellations, or tutor absences.</li>
                <li>Parents and tutors are encouraged to establish clear, written expectations regarding demo sessions, payment schedules, and cancellation notices.</li>
              </ul>
            </div>
          </section>

          {/* Section 7 */}
          <section id="safety-guidelines" className="scroll-mt-6">
            <div className="flex items-center space-x-2.5 mb-3">
              <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 text-xs font-black flex items-center justify-center">7</span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Safety Protocol for Home &amp; In-Person Tuition (Prayagraj &amp; Regional)
              </h2>
            </div>
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3 text-xs sm:text-sm">
              <div className="flex items-center text-amber-900 font-bold">
                <FaHome className="mr-2 text-amber-600" />
                Home Tuition Safety Measures
              </div>
              <ul className="list-disc pl-5 text-amber-900 space-y-1.5">
                <li>
                  <strong>Presence of Guardian:</strong> For minor students receiving home tuition, a parent, legal guardian, or adult family member must be present in the house during the entire duration of tutoring sessions.
                </li>
                <li>
                  <strong>Physical Identity Check:</strong> Parents are advised to inspect original physical photo identity cards of tutors before allowing entry on the first session.
                </li>
                <li>
                  <strong>Safety for Female Educators:</strong> Educators attending home tuition sessions have the right to request clear street addresses and respectful learning environments. Any harassment or unsafe conduct will result in immediate termination of the offending student/parent account and filing of an FIR under applicable criminal law.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 8 */}
          <section id="prohibited-conduct" className="scroll-mt-6">
            <div className="flex items-center space-x-2.5 mb-3">
              <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 text-xs font-black flex items-center justify-center">8</span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Prohibited Conduct &amp; Zero-Tolerance Harassment Policy
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mb-2">
              Users shall not host, display, upload, modify, publish, transmit, or share any information that:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-slate-600">
              <li>Belongs to another person and to which the user does not have any right.</li>
              <li>Is defamatory, obscene, pornographic, pedophilic, invasive of another's privacy, or hateful.</li>
              <li>Harms minors in any way, strictly violating the Protection of Children from Sexual Offences (POCSO) Act.</li>
              <li>Infringes any patent, trademark, copyright, or other proprietary rights.</li>
              <li>Deceives or misleads the addressee about the origin of messages or communicates any misinformation.</li>
              <li>Contains software viruses or any other computer code designed to interrupt, destroy, or limit the functionality of the Platform.</li>
            </ul>
          </section>

          {/* Section 9 */}
          <section id="data-obligations" className="scroll-mt-6">
            <div className="flex items-center space-x-2.5 mb-3">
              <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 text-xs font-black flex items-center justify-center">9</span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Data Principal Duties under DPDP Act, 2023 (Section 15)
              </h2>
            </div>
            <div className="space-y-2 text-xs sm:text-sm text-slate-600">
              <p>Every user agrees to perform the statutory duties prescribed under Section 15 of the DPDP Act, 2023:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>You shall not impersonate another individual when registering or communicating on the Platform.</li>
                <li>You shall not suppress any material information while furnishing your personal data.</li>
                <li>You shall not register false, vexatious, or frivolous complaints or grievances.</li>
                <li>You shall ensure all uploaded credentials, certificates, and phone numbers are genuine and belong to you.</li>
              </ul>
            </div>
          </section>

          {/* Section 10 */}
          <section id="liability-safeharbor" className="scroll-mt-6">
            <div className="flex items-center space-x-2.5 mb-3">
              <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 text-xs font-black flex items-center justify-center">10</span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Limitation of Liability &amp; Intermediary Safe Harbor
              </h2>
            </div>
            <div className="space-y-2 text-xs sm:text-sm text-slate-600">
              <p>
                To the maximum extent permitted by Indian law, ToppScorers shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits, data, goodwill, or personal disputes arising out of your access to or inability to access the Platform.
              </p>
              <p>
                In accordance with Section 79 of the Information Technology Act, 2000, ToppScorers functions as an intermediary and is protected by safe harbor provisions against liability for third-party information, data, or communication links made available or hosted by users on the Platform.
              </p>
            </div>
          </section>

          {/* Section 11 */}
          <section id="governing-jurisdiction" className="scroll-mt-6">
            <div className="flex items-center space-x-2.5 mb-3">
              <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 text-xs font-black flex items-center justify-center">11</span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Governing Law &amp; Exclusive Jurisdiction (Prayagraj, India)
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              These Terms of Service and any contractual or non-contractual disputes arising out of or in connection with the Platform shall be governed by, construed, and enforced in accordance with the laws of the Republic of India. Subject to arbitration, the courts and tribunals of competent jurisdiction in <strong>Prayagraj (Allahabad), Uttar Pradesh, India</strong> shall have exclusive jurisdiction over all claims, suits, or proceedings.
            </p>
          </section>

          {/* Section 12 */}
          <section id="grievance-contact" className="scroll-mt-6 pt-2">
            <div className="flex items-center space-x-2.5 mb-3">
              <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 text-xs font-black flex items-center justify-center">12</span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Grievance Redressal Mechanism &amp; Nodal Desk
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mb-4">
              In accordance with the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021 and Section 13 of the DPDP Act, 2023, the details of the designated Grievance Officer are set forth below:
            </p>

            <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                  <FaGavel size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base">Grievance &amp; Compliance Officer</h3>
                  <p className="text-xs text-amber-400 font-medium">ToppScorers Technologies Pvt. Ltd.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div className="flex items-center space-x-2 text-slate-300">
                  <FaEnvelope className="text-amber-400 shrink-0" />
                  <span><strong>Email:</strong> legal@toppscorers.com / privacy@toppscorers.com</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-300">
                  <FaPhoneAlt className="text-amber-400 shrink-0" />
                  <span><strong>Helpline:</strong> +91 7019074944</span>
                </div>
                <div className="flex items-start space-x-2 text-slate-300 sm:col-span-2">
                  <FaMapMarkerAlt className="text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Postal Address:</strong> Prayagraj (Allahabad), Uttar Pradesh - 211001, India</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                <strong>Response Commitment:</strong> All complaints or grievances will be acknowledged within 48 hours and disposed of within thirty (30) days from receipt.
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default Terms;