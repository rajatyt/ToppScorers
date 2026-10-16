import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import TeacherProfile from './models/TeacherProfile.js';
import StudentProfile from './models/StudentProfile.js';
import WidgetConfig from './models/WidgetConfig.js';
import FAQ from './models/FAQ.js';
import ActiveSession from './models/ActiveSession.js';
import ConnectionRequest from './models/ConnectionRequest.js';
import SavedProfile from './models/SavedProfile.js';
import SystemSetting from './models/SystemSetting.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for Seeding');

    // Clear DB and old indexes
    await Promise.all([
      User.deleteMany(),
      TeacherProfile.deleteMany(),
      StudentProfile.deleteMany(),
      WidgetConfig.deleteMany(),
      FAQ.deleteMany(),
      ActiveSession.deleteMany(),
      ConnectionRequest.deleteMany(),
      SavedProfile.deleteMany(),
      SystemSetting.deleteMany()
    ]);
    await TeacherProfile.collection.dropIndexes().catch(() => {});
    await StudentProfile.collection.dropIndexes().catch(() => {});
    console.log('Database and old indexes cleared');

    // System Settings
    await SystemSetting.create({
      key: 'guestDirectoryVisible',
      value: true,
      description: 'Allow guests (non-logged-in users) to view preview directory'
    });

    // Create Admin
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@toppscorers.com',
      phone: '7019074944',
      passwordHash: 'admin123',
      role: 'admin',
      consentGiven: true
    });

    // Create 6 Teachers
    const teachersData = [
      {
        name: 'Ravi Kumar',
        email: 'ravi@example.com',
        phone: '9998887771',
        sub: ['Mathematics', 'Advanced Calculus'],
        exam: ['JEE Main', 'JEE Advanced'],
        qualifications: ['M.Sc Mathematics, IIT Delhi', 'B.Ed'],
        certifications: ['CSIR NET AIR 42', 'CTET Qualified'],
        experience: 8,
        city: 'Kota',
        area: 'Vigyan Nagar',
        fullAddress: 'Plot 42, Sector 3, Vigyan Nagar, Kota, Rajasthan',
        pincode: '324005',
        lat: 25.1388,
        lng: 75.8344,
        feeAmount: 2500,
        feePeriod: 'monthly',
        teachingMode: 'all',
        rating: 4.9,
        bio: 'Ex-Allen senior faculty with 8+ years experience guiding top 100 JEE Advanced rankers. Passionate about concept visualization.'
      },
      {
        name: 'Dr. Priya Singh',
        email: 'priya@example.com',
        phone: '9998887772',
        sub: ['Biology', 'Zoology', 'Botany'],
        exam: ['NEET', 'AIIMS', 'CBSE 12th'],
        qualifications: ['MBBS, Maulana Azad Medical College', 'M.Sc Biology'],
        certifications: ['NEET AIR 215 (2014)', 'CTET Certified'],
        experience: 6,
        city: 'Delhi',
        area: 'South Extension',
        fullAddress: 'C-14, South Extension Part II, New Delhi',
        pincode: '110049',
        lat: 28.5729,
        lng: 77.2228,
        feeAmount: 3000,
        feePeriod: 'monthly',
        teachingMode: 'online',
        rating: 4.8,
        bio: 'Doctor turned educator helping students score 340+ in NEET Biology through high-yield diagrams and NCERT deep dives.'
      },
      {
        name: 'Amit Sharma',
        email: 'amit@example.com',
        phone: '9998887773',
        sub: ['Modern History', 'Indian Polity', 'Geography'],
        exam: ['UPSC Prelims', 'UPSC Mains', 'State PCS'],
        qualifications: ['M.A. Political Science, JNU', 'UGC NET JRF'],
        certifications: ['State PCS Interview Appeared', 'UPSC Mains 3 Times'],
        experience: 10,
        city: 'Pune',
        area: 'FC Road',
        fullAddress: 'Flat 302, Deccan Chambers, FC Road, Pune, Maharashtra',
        pincode: '411004',
        lat: 18.5204,
        lng: 73.8567,
        feeAmount: 2000,
        feePeriod: 'monthly',
        teachingMode: 'home',
        rating: 4.7,
        bio: 'Specialist in UPSC General Studies and answer-writing frameworks. Mentored 40+ officers across Central & State services.'
      },
      {
        name: 'Neha Gupta',
        email: 'neha@example.com',
        phone: '9998887774',
        sub: ['English Literature', 'Grammar', 'Verbal Ability'],
        exam: ['SSC CGL', 'Banking PO', 'Board Exams'],
        qualifications: ['M.A. English, University of Mumbai', 'CELTA Certified'],
        certifications: ['CTET Qualified', 'IELTS 8.5 Band'],
        experience: 5,
        city: 'Mumbai',
        area: 'Andheri West',
        fullAddress: 'A-201, Crystal Plaza, New Link Rd, Andheri West, Mumbai',
        pincode: '400053',
        lat: 19.1363,
        lng: 72.8277,
        feeAmount: 1800,
        feePeriod: 'monthly',
        teachingMode: 'all',
        rating: 4.9,
        bio: 'Interactive communication and grammar specialist. Proven shortcuts for comprehension and vocabulary retention.'
      },
      {
        name: 'Karan Patel',
        email: 'karan@example.com',
        phone: '9998887775',
        sub: ['Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry'],
        exam: ['JEE Main', 'NEET', 'GUJCET'],
        qualifications: ['M.Tech Chemical Engineering, Nirma University'],
        certifications: ['GATE Qualified (99.2 Percentile)'],
        experience: 7,
        city: 'Ahmedabad',
        area: 'Navrangpura',
        fullAddress: 'Shop 12, University Plaza, Navrangpura, Ahmedabad, Gujarat',
        pincode: '380009',
        lat: 23.0365,
        lng: 72.5611,
        feeAmount: 2200,
        feePeriod: 'monthly',
        teachingMode: 'all',
        rating: 4.8,
        bio: 'Demystifying Organic reaction mechanisms with step-by-step logic. Comprehensive test series and doubt clearing sessions.'
      },
      {
        name: 'Anjali Verma',
        email: 'anjali@example.com',
        phone: '9998887776',
        sub: ['Accountancy', 'Financial Management', 'Economics'],
        exam: ['CA Foundation', 'CS Executive', 'CBSE 12th Commerce'],
        qualifications: ['Chartered Accountant (CA)', 'B.Com Hons, SRCC'],
        certifications: ['ICAI Member', 'NSE Certified Market Professional'],
        experience: 9,
        city: 'Bangalore',
        area: 'Koramangala',
        fullAddress: '77, 4th Block, 80 Feet Road, Koramangala, Bangalore, Karnataka',
        pincode: '560034',
        lat: 12.9352,
        lng: 77.6245,
        feeAmount: 3500,
        feePeriod: 'monthly',
        teachingMode: 'online',
        rating: 5.0,
        bio: 'Practicing Chartered Accountant with passion for teaching. Practical corporate balance sheets combined with exam strategies.'
      }
    ];

    for (const t of teachersData) {
      const user = await User.create({
        name: t.name,
        email: t.email,
        phone: t.phone,
        passwordHash: 'password123',
        role: 'teacher',
        consentGiven: true
      });
      await TeacherProfile.create({
        userId: user._id,
        subjects: t.sub,
        exams: t.exam,
        qualifications: t.qualifications,
        certifications: t.certifications,
        experience: t.experience,
        bio: t.bio,
        area: t.area,
        fullAddress: t.fullAddress,
        location: { city: t.city, state: 'India', pincode: t.pincode },
        coordinates: { lat: t.lat, lng: t.lng },
        fee: { amount: t.feeAmount, period: t.feePeriod },
        teachingMode: t.teachingMode,
        rating: t.rating,
        approvalStatus: 'approved',
        isVerified: true,
        isAvailable: true,
        privacy: { showPhone: false, showFullAddress: false, pauseProfile: false }
      });
    }

    // Create 4 Students
    const studentsData = [
      {
        name: 'Rohan Verma',
        email: 'rohan@example.com',
        phone: '8887776661',
        classOrExam: 'JEE Main & Advanced 2027',
        classLevel: 'Class 11',
        subjectsNeeded: ['Mathematics', 'Physics'],
        goals: 'Targeting Top 500 rank in JEE Advanced. Need intensive problem solving and calculus clarity.',
        city: 'Delhi',
        area: 'Rohini Sector 9',
        fullAddress: 'House 142, Pocket 3, Rohini Sector 9, New Delhi',
        pincode: '110085',
        lat: 28.7144,
        lng: 77.1245,
        budgetMax: 5000,
        mode: 'both',
        isMinor: true,
        parentConsent: true
      },
      {
        name: 'Sita Sharma',
        email: 'sita@example.com',
        phone: '8887776662',
        classOrExam: 'NEET 2026',
        classLevel: 'Dropper / Repeat',
        subjectsNeeded: ['Biology', 'Organic Chemistry'],
        goals: 'Scored 580 last year, aiming for 670+ to secure government medical college seat.',
        city: 'Kota',
        area: 'Indraprastha Industrial Area',
        fullAddress: 'Hostel Block B, Road 1, IPIA, Kota, Rajasthan',
        pincode: '324005',
        lat: 25.1400,
        lng: 75.8360,
        budgetMax: 6000,
        mode: 'online',
        isMinor: false,
        parentConsent: false
      },
      {
        name: 'Arjun Das',
        email: 'arjun@example.com',
        phone: '8887776663',
        classOrExam: 'CBSE 12th Board',
        classLevel: 'Class 12',
        subjectsNeeded: ['Accountancy', 'Economics'],
        goals: 'Aiming for 95%+ in commerce board exams to get into SRCC or Hindu College.',
        city: 'Bangalore',
        area: 'Indiranagar',
        fullAddress: '12th Main Road, HAL 2nd Stage, Indiranagar, Bangalore',
        pincode: '560038',
        lat: 12.9716,
        lng: 77.6412,
        budgetMax: 4000,
        mode: 'home',
        isMinor: true,
        parentConsent: true
      },
      {
        name: 'Meera Patel',
        email: 'meera@example.com',
        phone: '8887776664',
        classOrExam: 'UPSC CSE 2027',
        classLevel: 'Graduation Final Year',
        subjectsNeeded: ['Modern History', 'Indian Polity'],
        goals: 'First attempt preparation along with college. Need guidance on GS answer-writing.',
        city: 'Pune',
        area: 'Kothrud',
        fullAddress: 'B-404, Mayur Colony, Kothrud, Pune, Maharashtra',
        pincode: '411038',
        lat: 18.5074,
        lng: 73.8077,
        budgetMax: 3500,
        mode: 'both',
        isMinor: false,
        parentConsent: false
      }
    ];

    for (const s of studentsData) {
      const user = await User.create({
        name: s.name,
        email: s.email,
        phone: s.phone,
        passwordHash: 'password123',
        role: 'student',
        dateOfBirth: s.isMinor ? new Date('2009-05-15') : new Date('2002-08-20'),
        parentGuardianConsent: s.parentConsent,
        consentGiven: true
      });
      await StudentProfile.create({
        userId: user._id,
        classOrExam: s.classOrExam,
        classLevel: s.classLevel,
        subjectsNeeded: s.subjectsNeeded,
        goals: s.goals,
        preferredTiming: 'Evening (5 PM - 8 PM)',
        area: s.area,
        fullAddress: s.fullAddress,
        location: { city: s.city, state: 'India', pincode: s.pincode },
        coordinates: { lat: s.lat, lng: s.lng },
        budget: { min: 1000, max: s.budgetMax, period: 'monthly' },
        preferences: { mode: s.mode, experienceMin: 2 },
        approvalStatus: 'approved',
        privacy: { showPhone: false, showFullAddress: false, pauseProfile: false }
      });
    }

    // Default Widgets
    const sections = ['hero', 'coverage', 'whyTeacherHunt', 'calculator', 'whatsapp', 'faqs'];
    const widgetsToInsert = sections.map((key, i) => ({
      sectionKey: key,
      label: key.charAt(0).toUpperCase() + key.slice(1),
      order: i + 1,
      isVisible: true
    }));
    await WidgetConfig.insertMany(widgetsToInsert);

    // FAQs
    const faqData = [
      { en: 'Is ToppScorers free for teachers?', hi: 'क्या ToppScorers शिक्षकों के लिए मुफ्त है?' },
      { en: 'How are teachers verified?', hi: 'शिक्षकों का सत्यापन कैसे होता है?' },
      { en: 'Can institutes post multiple openings?', hi: 'क्या संस्थान एक से अधिक रिक्तियां पोस्ट कर सकते हैं?' },
      { en: 'How does matching work?', hi: 'मैचिंग कैसे काम करती है?' },
      { en: 'Is my data shared with third parties?', hi: 'क्या मेरा डेटा तीसरे पक्ष के साथ साझा किया जाता है?' },
      { en: 'How do I switch between Hindi and English?', hi: 'मैं हिंदी और अंग्रेजी के बीच कैसे बदलूं?' },
      { en: 'What qualifications do I need to register?', hi: 'पंजीकरण के लिए मुझे किन योग्यताओं की आवश्यकता है?' },
      { en: 'How do I contact a teacher?', hi: 'मैं किसी शिक्षक से कैसे संपर्क करूं?' }
    ];

    const faqAnswers = [
      { en: 'Yes, ToppScorers is completely free for teachers. You can create your profile, upload your credentials, and get discovered by institutes without any charges.', hi: 'हाँ, ToppScorers शिक्षकों के लिए पूरी तरह से मुफ्त है। आप बिना किसी शुल्क के अपनी प्रोफ़ाइल बना सकते हैं, अपने प्रमाणपत्र अपलोड कर सकते हैं, और संस्थानों द्वारा खोजे जा सकते हैं।' },
      { en: 'Teachers are verified through their uploaded credentials, certificates (TET/CTET), educational qualifications, and past results. Our team reviews each submission before marking a profile as verified.', hi: 'शिक्षकों का सत्यापन उनके अपलोड किए गए प्रमाणपत्रों, सर्टिफिकेट (TET/CTET), शैक्षिक योग्यता और पिछले परिणामों के माध्यम से किया जाता है। हमारी टीम प्रोफ़ाइल को सत्यापित के रूप में चिह्नित करने से पहले प्रत्येक प्रस्तुतिकरण की समीक्षा करती है।' },
      { en: 'Yes, institutes can post multiple teaching openings for different subjects, exams, and locations. Each opening will be matched with relevant teacher profiles.', hi: 'हाँ, संस्थान विभिन्न विषयों, परीक्षाओं और स्थानों के लिए कई शिक्षण रिक्तियां पोस्ट कर सकते हैं। प्रत्येक रिक्ति को प्रासंगिक शिक्षक प्रोफ़ाइल के साथ मिलाया जाएगा।' },
      { en: 'Our matching algorithm considers subjects, exams, location, experience level, and verified results to rank teachers by how well they fit your requirements. No keyword spam — only genuine matches.', hi: 'हमारा मैचिंग एल्गोरिदम विषयों, परीक्षाओं, स्थान, अनुभव स्तर और सत्यापित परिणामों को ध्यान में रखता है ताकि शिक्षकों को आपकी आवश्यकताओं के अनुसार रैंक किया जा सके। कोई कीवर्ड स्पैम नहीं — केवल वास्तविक मिलान।' },
      { en: 'No. Your data is never shared with third parties. We only use your information to match you with relevant teaching opportunities or teachers. Read our Privacy Policy for full details.', hi: 'नहीं। आपका डेटा कभी भी तीसरे पक्ष के साथ साझा नहीं किया जाता है। हम केवल आपकी जानकारी का उपयोग प्रासंगिक शिक्षण अवसरों या शिक्षकों से मिलान करने के लिए करते हैं। पूरी जानकारी के लिए हमारी गोपनीयता नीति पढ़ें।' },
      { en: 'Click the EN/HI toggle in the top navigation bar to switch between English and Hindi. Your preference is saved automatically and will persist across sessions.', hi: 'अंग्रेजी और हिंदी के बीच बदलने के लिए शीर्ष नेविगेशन बार में EN/HI टॉगल पर क्लिक करें। आपकी पसंद स्वचालित रूप से सहेजी जाती है और सत्रों में बनी रहेगी।' },
      { en: 'There are no strict qualification requirements to register. However, having relevant teaching certifications (TET, CTET), degrees, and experience will help you get verified and rank higher in matches.', hi: 'पंजीकरण के लिए कोई सख्त योग्यता आवश्यकताएं नहीं हैं। हालांकि, प्रासंगिक शिक्षण प्रमाणपत्र (TET, CTET), डिग्री और अनुभव होने से आपको सत्यापित होने और मिलानों में उच्च रैंक पाने में मदद मिलेगी।' },
      { en: 'Once you find a teacher you like, you can view their full profile, watch their demo lecture, and contact them directly through the platform or via phone call.', hi: 'एक बार जब आपको पसंद का शिक्षक मिल जाए, तो आप उनकी पूरी प्रोफ़ाइल देख सकते हैं, उनका डेमो व्याख्यान देख सकते हैं, और प्लेटफ़ॉर्म के माध्यम से या फोन कॉल के माध्यम से सीधे उनसे संपर्क कर सकते हैं।' }
    ];

    const faqsToInsert = faqData.map((f, i) => ({
      question: { en: f.en, hi: f.hi },
      answer: faqAnswers[i],
      order: i + 1,
      isVisible: true
    }));
    await FAQ.insertMany(faqsToInsert);

    console.log('Seeding Complete! Database is populated with rich ToppScorers data.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedData();
