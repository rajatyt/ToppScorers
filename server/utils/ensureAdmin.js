import User from '../models/User.js';

export const ensureAdminAccount = async () => {
  try {
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@toppscorers.com').toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    let admin = await User.findOne({ email: adminEmail });

    if (!admin) {
      console.log(`[Admin Setup] Initializing default super administrator: ${adminEmail}`);
      admin = new User({
        name: 'System Super Admin',
        email: adminEmail,
        phone: '7019074944',
        passwordHash: adminPassword,
        role: 'admin',
        isActive: true,
        consentGiven: true
      });
      await admin.save();
      console.log(`[Admin Setup] Administrator created successfully.`);
    } else {
      let modified = false;
      if (admin.role !== 'admin') {
        admin.role = 'admin';
        modified = true;
      }
      if (!admin.isActive) {
        admin.isActive = true;
        modified = true;
      }
      const isMatch = await admin.comparePassword(adminPassword);
      if (!isMatch) {
        admin.passwordHash = adminPassword;
        modified = true;
      }
      if (modified) {
        await admin.save();
        console.log(`[Admin Setup] Administrator account updated/verified.`);
      }
    }
    return admin;
  } catch (error) {
    console.error('[Admin Setup Error]:', error.message);
  }
};
