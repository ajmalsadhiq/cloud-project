import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export class DashboardController {
  static async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await DashboardService.getStats(req.user!.userId);
      sendSuccess(res, stats, 'Dashboard metrics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}
