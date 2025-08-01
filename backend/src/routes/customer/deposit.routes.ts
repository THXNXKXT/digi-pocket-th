import { Hono } from 'hono';
import { authMiddleware } from '../../middleware/auth';
import {
  getAvailableAccounts,
  createDepositRequest,
  uploadSlip,
  checkDepositStatus,
  getPendingRequests,
  resumeDepositRequest,
  cancelDepositRequest
} from '../../controllers/customer/deposit.controller';

const depositRoutes = new Hono();

// Apply authentication to all routes
depositRoutes.use('*', authMiddleware);

// Deposit Flow Routes
depositRoutes.get('/accounts', getAvailableAccounts);
depositRoutes.post('/request', createDepositRequest);
depositRoutes.post('/request/:requestId/slip', uploadSlip);
depositRoutes.get('/request/:requestId/status', checkDepositStatus);

// Recovery Routes
depositRoutes.get('/requests', getPendingRequests);
depositRoutes.get('/request/:requestId', resumeDepositRequest);
depositRoutes.delete('/request/:requestId', cancelDepositRequest);

export { depositRoutes };
