import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { profileController } from '../controllers/profile.controller';

export const profileRoutes = new Hono().use('*', authMiddleware);

// Profile routes
profileRoutes.get('/', profileController.getProfile);
profileRoutes.put('/', profileController.updateProfile);
profileRoutes.get('/stats', profileController.getStats);
