import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { createDeposit, getDeposit, depositCallback } from '../controllers/deposit.controller';

export const depositRoute = new Hono();

depositRoute.post('/callback', depositCallback);

depositRoute.use('*', authMiddleware);
depositRoute.post('/', createDeposit);
depositRoute.get('/:id', getDeposit); 