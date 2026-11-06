import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticateJwt } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { registerSchema, loginSchema } from '../validators/auth.validator.js';

const router = Router();

// Public routes with rate limiting & schema validation
router.post('/register', authLimiter, validateBody(registerSchema), AuthController.register);
router.post('/login', authLimiter, validateBody(loginSchema), AuthController.login);

// Protected routes
router.get('/me', authenticateJwt, AuthController.getMe);
router.post('/logout', authenticateJwt, AuthController.logout);

export default router;
