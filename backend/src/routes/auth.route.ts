import { Hono } from 'hono';
import { register, login, logout } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth';

export const authRoute = new Hono();
 
authRoute.post('/register', register);
authRoute.post('/login', login);
authRoute.post('/logout', authMiddleware, logout); 