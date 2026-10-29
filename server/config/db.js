import mongoose from 'mongoose';
import { ensureAdminAccount } from '../utils/ensureAdmin.js';
import { backfillJobIds } from '../utils/jobIdHelper.js';

let isConnecting = false;

export const getMongoUri = () => {
  const raw = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DATABASE_URL || '';
  return raw.trim().replace(/^["']|["']$/g, '');
};

const connectDB = async () => {
  const uri = getMongoUri();
  if (!uri) {
    console.error('\x1b[31m[MongoDB Error]\x1b[0m No MongoDB URI found in environment variables (checked MONGODB_URI, MONGO_URI, DATABASE_URL).');
    return null;
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (isConnecting) {
    return null;
  }

  isConnecting = true;
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    isConnecting = false;

    // Run background setup tasks asynchronously without blocking
    ensureAdminAccount().catch(e => console.error('[Admin Setup Error]:', e.message));
    backfillJobIds().catch(e => console.error('[Backfill Error]:', e.message));

    return conn;
  } catch (error) {
    isConnecting = false;
    console.error(`\x1b[33m[MongoDB Warning]\x1b[0m Could not connect to MongoDB: ${error.message}`);
    // Auto-retry connection in 5 seconds
    setTimeout(() => {
      if (mongoose.connection.readyState !== 1) {
        console.log('[MongoDB Auto-Retry] Attempting reconnection...');
        connectDB();
      }
    }, 5000);
    return null;
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('[MongoDB Event] Connection disconnected. Triggering auto-reconnect...');
  setTimeout(() => connectDB(), 3000);
});

export default connectDB;
