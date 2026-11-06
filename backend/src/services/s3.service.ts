import {
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getS3Client, verifyS3BucketAccess } from '../config/s3.js';
import { config } from '../config/env.js';
import { logger } from '../config/logger.js';

export class S3Service {
  /**
   * Generate temporary presigned PUT URL for direct browser-to-S3 upload
   * Files stream directly into private S3 without passing bytes through Express
   */
  static async generatePresignedUploadUrl(
    s3Key: string,
    mimeType: string,
    expiresIn = config.aws.presignedUrlExpiresIn
  ): Promise<string> {
    if (!config.aws.isConfigured) {
      logger.info(`[Dev Simulation] Using local upload endpoint for S3 key: ${s3Key}`);
      return `http://localhost:${config.port}/api/dev/s3-upload-mock?key=${encodeURIComponent(s3Key)}`;
    }

    const s3Client = getS3Client();
    const command = new PutObjectCommand({
      Bucket: config.aws.bucketName,
      Key: s3Key,
      ContentType: mimeType,
      Metadata: {
        'managed-by': 'cloudvault-platform',
        'uploaded-at': new Date().toISOString(),
      },
    });

    return getSignedUrl(s3Client, command, { expiresIn });
  }

  /**
   * Generate temporary presigned GET URL for secure time-limited download or preview
   */
  static async generatePresignedDownloadUrl(
    s3Key: string,
    originalName: string,
    disposition: 'inline' | 'attachment' = 'inline',
    expiresIn = 900 // 15 minutes
  ): Promise<string> {
    if (!config.aws.isConfigured) {
      logger.info(`[Dev Simulation] Generated simulated preview URL for: ${s3Key}`);
      return `https://dummyimage.com/800x600/0f172a/3b82f6.png&text=${encodeURIComponent(originalName)}`;
    }

    const s3Client = getS3Client();
    const command = new GetObjectCommand({
      Bucket: config.aws.bucketName,
      Key: s3Key,
      ResponseContentDisposition: `${disposition}; filename="${encodeURIComponent(originalName)}"`,
    });

    return getSignedUrl(s3Client, command, { expiresIn });
  }

  /**
   * Query metadata of an S3 object to verify existence and size
   */
  static async headObject(s3Key: string): Promise<{ size: number; eTag?: string } | null> {
    if (!config.aws.isConfigured) {
      return { size: 1024, eTag: '"dev-simulated-etag"' };
    }

    try {
      const s3Client = getS3Client();
      const command = new HeadObjectCommand({
        Bucket: config.aws.bucketName,
        Key: s3Key,
      });

      const response = await s3Client.send(command);
      return {
        size: response.ContentLength || 0,
        eTag: response.ETag,
      };
    } catch (err: unknown) {
      logger.warn(`S3 HeadObject failed for ${s3Key}:`, err);
      return null;
    }
  }

  /**
   * Delete single object from AWS S3
   */
  static async deleteObject(s3Key: string): Promise<boolean> {
    if (!config.aws.isConfigured) {
      logger.info(`[Dev Simulation] S3 object deleted: ${s3Key}`);
      return true;
    }

    try {
      const s3Client = getS3Client();
      const command = new DeleteObjectCommand({
        Bucket: config.aws.bucketName,
        Key: s3Key,
      });

      await s3Client.send(command);
      logger.info(`[AWS S3] Successfully deleted object: ${s3Key}`);
      return true;
    } catch (err) {
      logger.error(`[AWS S3] Failed to delete object ${s3Key}:`, err);
      return false;
    }
  }

  /**
   * Bulk delete multiple objects from AWS S3 (used for recursive folder deletions)
   */
  static async deleteObjects(s3Keys: string[]): Promise<boolean> {
    if (s3Keys.length === 0) return true;

    if (!config.aws.isConfigured) {
      logger.info(`[Dev Simulation] Bulk deleted ${s3Keys.length} S3 objects`);
      return true;
    }

    try {
      const s3Client = getS3Client();
      const command = new DeleteObjectsCommand({
        Bucket: config.aws.bucketName,
        Delete: {
          Objects: s3Keys.map((Key) => ({ Key })),
          Quiet: true,
        },
      });

      await s3Client.send(command);
      logger.info(`[AWS S3] Successfully bulk deleted ${s3Keys.length} objects`);
      return true;
    } catch (err) {
      logger.error(`[AWS S3] Failed to bulk delete objects:`, err);
      return false;
    }
  }

  /**
   * Check live bucket connectivity
   */
  static async checkConnectivity() {
    return verifyS3BucketAccess();
  }
}
