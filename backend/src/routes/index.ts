import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import folderRoutes from './folder.routes.js';
import fileRoutes from './file.routes.js';
import devRoutes from './dev.routes.js';

const apiRouter = Router();

// Mount sub-routes
apiRouter.use('/', healthRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/dashboard', dashboardRoutes);
apiRouter.use('/folders', folderRoutes);
apiRouter.use('/files', fileRoutes);
apiRouter.use('/dev', devRoutes);

export default apiRouter;
