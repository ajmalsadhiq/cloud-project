import { Router } from 'express';
import healthRoutes from './health.routes.js';

const apiRouter = Router();

// Mount sub-routes
apiRouter.use('/', healthRoutes);

// Auth, files, folders, and dashboard routes will be mounted here in subsequent phases

export default apiRouter;
