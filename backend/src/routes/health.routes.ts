import { Router, Request, Response } from 'express';
import { sendSuccess } from '../utils/apiResponse.js';
import mongoose from 'mongoose';
import { config } from '../config/env.js';

const router = Router();

router.get('/health', (_req: Request, res: Response) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  sendSuccess(res, {
    status: 'ok',
    service: 'CloudVault API',
    version: '1.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: dbStatus,
    s3Configured: config.aws.isConfigured,
  }, 'CloudVault API service is operational');
});

export default router;
