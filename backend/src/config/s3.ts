import { S3Client } from '@aws-sdk/client-s3';
import { config } from './env.js';
import { logger } from './logger.js';

let s3ClientInstance: S3Client | null = null;

export const getS3Client = (): S3Client => {
  if (s3ClientInstance) {
    return s3ClientInstance;
  }

  if (config.aws.isConfigured) {
    logger.info(`Initializing AWS S3 Client for region: ${config.aws.region}`);
    s3ClientInstance = new S3Client({
      region: config.aws.region,
      credentials: {
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey,
      },
    });
  } else {
    logger.warn('AWS credentials not fully configured. Using fallback local mode for S3.');
    // Initialize dummy/mock client or local endpoint
    s3ClientInstance = new S3Client({
      region: config.aws.region || 'us-east-1',
      credentials: {
        accessKeyId: 'mock_key',
        secretAccessKey: 'mock_secret',
      },
    });
  }

  return s3ClientInstance;
};
