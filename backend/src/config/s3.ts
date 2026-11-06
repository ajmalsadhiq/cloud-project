import { S3Client, HeadBucketCommand } from '@aws-sdk/client-s3';
import { config } from './env.js';
import { logger } from './logger.js';

let s3ClientInstance: S3Client | null = null;

export const getS3Client = (): S3Client => {
  if (s3ClientInstance) {
    return s3ClientInstance;
  }

  if (config.aws.isConfigured) {
    logger.info(`[AWS S3] Initializing genuine AWS S3 Client for bucket "${config.aws.bucketName}" in region "${config.aws.region}"`);
    s3ClientInstance = new S3Client({
      region: config.aws.region,
      credentials: {
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey,
      },
    });
  } else {
    logger.warn('[AWS S3] Live AWS credentials not detected. Operating in local simulated S3 mode.');
    // Fallback client for local dev
    s3ClientInstance = new S3Client({
      region: config.aws.region || 'us-east-1',
      credentials: {
        accessKeyId: 'DEV_SIMULATED_KEY',
        secretAccessKey: 'DEV_SIMULATED_SECRET',
      },
    });
  }

  return s3ClientInstance;
};

/**
 * Verify S3 bucket access and credentials validity
 */
export const verifyS3BucketAccess = async (): Promise<{
  connected: boolean;
  bucket: string;
  region: string;
  error?: string;
}> => {
  if (!config.aws.isConfigured) {
    return {
      connected: false,
      bucket: config.aws.bucketName,
      region: config.aws.region,
      error: 'AWS credentials not configured in .env file (AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY)',
    };
  }

  try {
    const client = getS3Client();
    const command = new HeadBucketCommand({ Bucket: config.aws.bucketName });
    await client.send(command);
    return {
      connected: true,
      bucket: config.aws.bucketName,
      region: config.aws.region,
    };
  } catch (err: unknown) {
    const error = err as Error;
    return {
      connected: false,
      bucket: config.aws.bucketName,
      region: config.aws.region,
      error: error.message || 'Failed to connect to AWS S3 bucket',
    };
  }
};
