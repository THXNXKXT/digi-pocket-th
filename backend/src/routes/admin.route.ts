import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';
import { listUsers, createUser, getUser, updateUser, updateUserStatus, deleteUser } from '../controllers/admin/users.controller';
import { updateProduct, deleteProduct, listAllProducts } from '../controllers/admin/products.controller';
import {
  listAdminAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  publishAnnouncement,
  archiveAnnouncement,
  getAnnouncementAnalytics,
} from '../controllers/admin/announcements.controller';
import {
  getUserActivityLogs,
  getAllActivityLogs,
  getSecurityStats,
  getSecurityEvents,
  getSecurityAlerts,
  resolveSecurityAlert,
  unlockUserAccount,
  updateSecurityConfig,
  getSecurityConfig,
} from '../controllers/admin/security.controller';
import {
  getAllOrders,
  getOrderDetails,
  updateOrderStatus,
  getOrderStatistics,
  triggerOrderCallback,
} from '../controllers/admin/orders.controller';
import {
  listStoreAccounts,
  getStoreAccount,
  createStoreAccount,
  updateStoreAccount,
  toggleStoreAccountStatus,
  deleteStoreAccount
} from '../controllers/admin/store-accounts.controller';
import {
  listDepositRequests,
  getDepositRequest,
  approveDepositRequest,
  rejectDepositRequest,
  getDepositStatistics
} from '../controllers/admin/deposit-management.controller';
import { getAnnouncementById } from '../controllers/announcement.controller';

export const adminRoute = new Hono();

adminRoute.use('*', authMiddleware, adminMiddleware);

// user management
adminRoute.get('/users', listUsers);
adminRoute.post('/users', createUser);
adminRoute.get('/users/:id', getUser);
adminRoute.patch('/users/:id', updateUser);
adminRoute.patch('/users/:id/status', updateUserStatus); // legacy route
adminRoute.delete('/users/:id', deleteUser);

// user security management
adminRoute.get('/users/:userId/activity', getUserActivityLogs);
adminRoute.post('/users/:userId/unlock', unlockUserAccount);

// product management
adminRoute.get('/products/:type/all', listAllProducts); // ดูสินค้าทั้งหมด รวมที่ไม่มีราคา
adminRoute.patch('/products/:id', updateProduct);
adminRoute.delete('/products/:id', deleteProduct);

// order management
adminRoute.get('/orders', getAllOrders);
adminRoute.get('/orders/statistics', getOrderStatistics);
adminRoute.get('/orders/:id', getOrderDetails);
adminRoute.patch('/orders/:id/status', updateOrderStatus);
adminRoute.post('/orders/:id/callback', triggerOrderCallback);

// announcement management
adminRoute.get('/announcements', listAdminAnnouncements);
adminRoute.get('/announcements/:id', getAnnouncementById);
adminRoute.post('/announcements', createAnnouncement);
adminRoute.put('/announcements/:id', updateAnnouncement);
adminRoute.delete('/announcements/:id', deleteAnnouncement);
adminRoute.post('/announcements/:id/publish', publishAnnouncement);
adminRoute.post('/announcements/:id/archive', archiveAnnouncement);
adminRoute.get('/announcements/:id/analytics', getAnnouncementAnalytics);

// security monitoring
adminRoute.get('/security/stats', getSecurityStats);
adminRoute.get('/security/events', getSecurityEvents);
adminRoute.get('/security/alerts', getSecurityAlerts);
adminRoute.post('/security/alerts/:alertId/resolve', resolveSecurityAlert);
adminRoute.get('/security/activity', getAllActivityLogs);
adminRoute.get('/security/config', getSecurityConfig);
// adminRoute.put('/security/config', updateSecurityConfig);

// Store Bank Account Management Routes
adminRoute.get('/store-accounts', listStoreAccounts);
adminRoute.get('/store-accounts/:id', getStoreAccount);
adminRoute.post('/store-accounts', createStoreAccount);
adminRoute.put('/store-accounts/:id', updateStoreAccount);
adminRoute.patch('/store-accounts/:id/toggle-status', toggleStoreAccountStatus);
adminRoute.delete('/store-accounts/:id', deleteStoreAccount);

// Deposit Request Management Routes
adminRoute.get('/deposits/requests', listDepositRequests);
adminRoute.get('/deposits/requests/:id', getDepositRequest);
adminRoute.post('/deposits/requests/:id/approve', approveDepositRequest);
adminRoute.post('/deposits/requests/:id/reject', rejectDepositRequest);

// Statistics Routes
adminRoute.get('/deposits/statistics', getDepositStatistics);