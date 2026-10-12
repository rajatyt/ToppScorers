import mongoose from 'mongoose';
import { ensureAdminAccount } from '../utils/ensureAdmin.js';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    // Ensure default administrator account is guaranteed to exist
    await ensureAdminAccount();
  } catch (error) {
    console.error(`\x1b[33m[MongoDB Warning]\x1b[0m Could not connect to MongoDB at ${process.env.MONGODB_URI}`);
    console.error(`Reason: ${error.message}`);
    console.error(`\x1b[36mTip:\x1b[0m Paste your MongoDB Atlas URI into server/.env (MONGODB_URI=mongodb+srv://...) to enable database features.\n`);
  }
};

export default connectDB;
