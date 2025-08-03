import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { getBalance, listTransactions, deposit, withdraw } from '../controllers/wallet.controller';
import { depositRoutes } from './deposit.routes';

export const walletRoute = new Hono().use('*', authMiddleware);

walletRoute.get('/balance', getBalance);
walletRoute.get('/transactions', listTransactions);
walletRoute.post('/deposit', deposit);
walletRoute.post('/withdraw', withdraw);

// Slip deposit routes
walletRoute.route('/deposit', depositRoutes);