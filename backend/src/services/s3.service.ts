import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getS3Client } from '../config/s3.js';
import { config } from '../config/env.js';
import { logger } from '../config/logger.js';

export class S3Service {
  /**
   * Generate temporary presigned PUT URL for direct browser-to-S3 upload
   */
  static async generatePresignedUploadUrl(
    s3Key: string,
    mimeType: string,
    expiresIn = config.aws.presignedUrlExpiresIn
  ): Promise<string> {
    if (!config.aws.isConfigured) {
      logger.info(`[Dev Mode] Generated simulated upload URL for S3 key: ${s3Key}`);
      // In dev mode without AWS credentials, return a local dev upload endpoint
      return `${config.frontendUrl}/api/dev/s3-upload-mock?key=${encodeURIComponent(s3Key)}`;
    }

    const s3Client = getS3Client();
    const command = new PutObjectCommand({
      Bucket: config.aws.bucketName,
      Key: s3Key,
      ContentType: mimeType,
    });

    return getSignedUrl(s3Client, command, { expiresIn });
  }

  /**
   * Generate temporary presigned GET URL for secure time-limited download or preview
   */
  static async generatePresignedDownloadUrl(
    s3Key: string,
    originalName: string,
    expiresIn = 900 // 15 minutes
  ): Promise<string> {
    if (!config.aws.isConfigured) {
      logger.info(`[Dev Mode] Generated simulated download URL for S3 key: ${s3Key}`);
      return `https://dummyimage.com/600x400/0f172a/3b82f6.png&text=${encodeURIComponent(originalName)}`;
    }

    const s3Client = getS3Client();
    const command = new GetObjectCommand({
      Bucket: config.aws.bucketName,
      Key: s3Key,
      ResponseContentDisposition: `inline; filename="${encodeURIComponent(originalName)}"`,
    });

    return getSignedUrl(s3Client, command, { expiresIn });
  }

  /**
   * Delete object from AWS S3
   */
  static async deleteObject(s3Key: string): Promise<boolean> {
    if (!config.aws.isConfigured) {
      logger.info(`[Dev Mode] Simulated S3 object deletion for key: ${s3Key}`);
      return true;
    }

    try {
      const s3Client = getS3Client();
      const command = new DeleteObjectCommand({
        Bucket: config.aws.bucketName,
        Key: s3Key,
      });

      await s3Client.send(command);
      logger.info(`Successfully deleted S3 object: ${s3Key}`);
      return true;
    } catch (err) {
      logger.error(`Failed to delete S3 object ${s3Key}:`, err);
      return false;
    }
  }
}
