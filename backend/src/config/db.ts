import mongoose from 'mongoose';
import { config } from './env.js';
import { logger } from './logger.js';

let isConnected = false;

export const connectDatabase = async (): Promise<typeof mongoose | null> => {
  if (isConnected) {
    logger.info('Using existing database connection');
    return mongoose;
  }

  try {
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = conn.connection.readyState === 1;
    logger.info(`MongoDB Connected successfully to: ${conn.connection.host}`);
    return conn;
  } catch (err: unknown) {
    const error = err as Error;
    logger.warn(`MongoDB initial connection notice: ${error.message}`);
    logger.warn('Running without active MongoDB connection (check MONGODB_URI in .env)');
    return null;
  }
};

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  logger.warn('MongoDB connection lost');
});

mongoose.connection.on('error', (err) => {
  logger.error('MongoDB connection error:', err);
});
