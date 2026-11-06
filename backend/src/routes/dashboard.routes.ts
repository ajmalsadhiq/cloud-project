import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller.js';
import { authenticateJwt } from '../middleware/auth.middleware.js';

const router = Router();

// All dashboard endpoints require valid JWT authentication
router.use(authenticateJwt);

router.get('/stats', DashboardController.getStats);

export default router;
