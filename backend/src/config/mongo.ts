import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from './logger.js';

export async function connectMongo(): Promise<void> {
  if (!env.MONGODB_URI) {
    logger.warn('MONGODB_URI not set; skipping MongoDB connection');
    return;
  }
  try {
    await mongoose.connect(env.MONGODB_URI);
    logger.info('MongoDB connected');
  } catch (err) {
    logger.error({ err }, 'MongoDB connection failed');
    throw err;
  }
}

export async function disconnectMongo(): Promise<void> {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected');
}
