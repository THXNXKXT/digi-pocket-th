import { Hono } from 'hono';
import { authMiddleware, requireRole } from '../../middleware/auth';
import {
  listStoreAccounts,
  getStoreAccount,
  createStoreAccount,
  updateStoreAccount,
  toggleStoreAccountStatus,
  deleteStoreAccount
} from '../../controllers/admin/store-accounts.controller';
import {
  listDepositRequests,
  getDepositRequest,
  approveDepositRequest,
  rejectDepositRequest,
  getDepositStatistics
} from '../../controllers/admin/deposit-management.controller';

const depositRoutes = new Hono();

// Apply authentication and admin role requirement to all routes
depositRoutes.use('*', authMiddleware);
depositRoutes.use('*', requireRole(['admin', 'super_admin']));

// Store Bank Account Management Routes
depositRoutes.get('/store-accounts', listStoreAccounts);
depositRoutes.get('/store-accounts/:id', getStoreAccount);
depositRoutes.post('/store-accounts', createStoreAccount);
depositRoutes.put('/store-accounts/:id', updateStoreAccount);
depositRoutes.patch('/store-accounts/:id/toggle-status', toggleStoreAccountStatus);
depositRoutes.delete('/store-accounts/:id', deleteStoreAccount);

// Deposit Request Management Routes
depositRoutes.get('/requests', listDepositRequests);
depositRoutes.get('/requests/:id', getDepositRequest);
depositRoutes.post('/requests/:id/approve', approveDepositRequest);
depositRoutes.post('/requests/:id/reject', rejectDepositRequest);

// Statistics Routes
depositRoutes.get('/statistics', getDepositStatistics);

export { depositRoutes };
