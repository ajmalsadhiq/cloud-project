import { Router, Request, Response } from 'express';
import { logger } from '../config/logger.js';
import { config } from '../config/env.js';

const router = Router();

/**
 * Local development S3 mock upload receiver
 * Handles direct PUT uploads when live AWS credentials are not present in .env
 */
router.put('/s3-upload-mock', (req: Request, res: Response) => {
  const s3Key = req.query.key as string;
  const contentType = req.headers['content-type'] || 'application/octet-stream';

  logger.info(`=======================================================`);
  logger.info(`[S3 DEV ADAPTER] Direct PUT received for S3 Key: ${s3Key}`);
  logger.info(`[S3 DEV ADAPTER] Content-Type: ${contentType}`);
  logger.info(`[S3 DEV ADAPTER] Notice: Operating in local development simulation.`);
  logger.info(`[S3 DEV ADAPTER] Set AWS_ACCESS_KEY_ID & AWS_SECRET_ACCESS_KEY in .env for genuine S3.`);
  logger.info(`=======================================================`);

  // Stream data or drain request
  req.on('data', () => {});
  req.on('end', () => {
    res.setHeader('ETag', '"simulated-s3-etag-12345"');
    res.setHeader('Access-Control-Allow-Origin', config.frontendUrl);
    res.status(200).send();
  });
});

export default router;
