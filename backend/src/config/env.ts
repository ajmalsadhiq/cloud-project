import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  // Database
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/cloudvault',

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'dev_secret_key_cloudvault_super_secure_2025',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  // AWS S3
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    bucketName: process.env.AWS_S3_BUCKET_NAME || 'cloudvault-storage',
    presignedUrlExpiresIn: parseInt(process.env.AWS_S3_PRESIGNED_URL_EXPIRES_IN || '900', 10), // 15 mins
    isConfigured: Boolean(
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      process.env.AWS_S3_BUCKET_NAME &&
      !process.env.AWS_ACCESS_KEY_ID.includes('placeholder')
    ),
  },

  // Default quota: 1 GB in bytes
  defaultStorageQuota: parseInt(process.env.DEFAULT_STORAGE_QUOTA_BYTES || '1073741824', 10),
};
