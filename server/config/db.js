import mongoose from 'mongoose';
import { ensureAdminAccount } from '../utils/ensureAdmin.js';
import { backfillJobIds } from '../utils/jobIdHelper.js';

let activeConnectionPromise = null;

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

  // If already connecting, return the existing in-flight promise so callers wait instead of failing immediately
  if (activeConnectionPromise) {
    return activeConnectionPromise;
  }

  activeConnectionPromise = (async () => {
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 20000,
        connectTimeoutMS: 20000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        minPoolSize: 1,
      });
      console.log(`MongoDB Connected: ${conn.connection.host}`);

      // Run background setup tasks asynchronously without blocking
      ensureAdminAccount().catch(e => console.error('[Admin Setup Error]:', e.message));
      backfillJobIds().catch(e => console.error('[Backfill Error]:', e.message));

      return conn;
    } catch (error) {
      console.error(`\x1b[33m[MongoDB Warning]\x1b[0m Could not connect to MongoDB: ${error.message}`);
      // Auto-retry connection in 5 seconds
      setTimeout(() => {
        if (mongoose.connection.readyState !== 1) {
          console.log('[MongoDB Auto-Retry] Attempting reconnection...');
          connectDB();
        }
      }, 5000);
      return null;
    } finally {
      activeConnectionPromise = null;
    }
  })();

  return activeConnectionPromise;
};

mongoose.connection.on('disconnected', () => {
  activeConnectionPromise = null;
  console.log('[MongoDB Event] Connection disconnected. Triggering auto-reconnect...');
  setTimeout(() => connectDB(), 3000);
});

export default connectDB;
