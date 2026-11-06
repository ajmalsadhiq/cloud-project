import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import dashboardRoutes from './dashboard.routes.js';

const apiRouter = Router();

// Mount sub-routes
apiRouter.use('/', healthRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/dashboard', dashboardRoutes);

export default apiRouter;
