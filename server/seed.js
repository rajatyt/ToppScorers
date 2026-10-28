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
import Report from './models/Report.js';
import Block from './models/Block.js';
import ProfileViewLog from './models/ProfileViewLog.js';
import Query from './models/Query.js';

dotenv.config();
dotenv.config({ path: './server/.env' });

const cleanDatabaseAndSeedAdmin = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in server/.env');
    }

    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected successfully.');

    // 1. Wipe all collections completely
    console.log('Clearing all collections...');
    await Promise.all([
      User.deleteMany({}),
      TeacherProfile.deleteMany({}),
      StudentProfile.deleteMany({}),
      WidgetConfig.deleteMany({}),
      FAQ.deleteMany({}),
      ActiveSession.deleteMany({}),
      ConnectionRequest.deleteMany({}),
      SavedProfile.deleteMany({}),
      SystemSetting.deleteMany({}),
      Report.deleteMany({}),
      Block.deleteMany({}),
      ProfileViewLog.deleteMany({}),
      Query.deleteMany({})
    ]);

    // Drop indexes safely
    await TeacherProfile.collection.dropIndexes().catch(() => {});
    await StudentProfile.collection.dropIndexes().catch(() => {});
    await User.collection.dropIndexes().catch(() => {});
    console.log('All collections and legacy indexes cleared.');

    // 2. Default System Settings
    await SystemSetting.create({
      key: 'guestDirectoryVisible',
      value: true,
      description: 'Allow guests (non-logged-in users) to view preview directory'
    });

    // 3. Create Clean Admin User
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@toppscorers.com',
      phone: '7019074944',
      passwordHash: 'admin123',
      role: 'admin',
      consentGiven: true
    });
    console.log(`Admin User created: ${adminUser.email} (Role: ${adminUser.role})`);

    // 4. Default Homepage Widgets
    const sections = ['hero', 'coverage', 'whyTeacherHunt', 'calculator', 'whatsapp', 'faqs'];
    const widgetsToInsert = sections.map((key, i) => ({
      sectionKey: key,
      label: key.charAt(0).toUpperCase() + key.slice(1),
      order: i + 1,
      isVisible: true
    }));
    await WidgetConfig.insertMany(widgetsToInsert);
    console.log('Default widgets configured.');

    // 5. Default FAQs (Bilingual English + Hindi)
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
    console.log('Default FAQs configured.');

    console.log('----------------------------------------------------');
    console.log('DATABASE WIPE & INITIALIZATION COMPLETE:');
    console.log('- All teachers and students removed.');
    console.log('- Only Admin account initialized: admin@toppscorers.com');
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('Database clearing error:', error);
    process.exit(1);
  }
};

cleanDatabaseAndSeedAdmin();
