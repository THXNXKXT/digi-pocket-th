import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { optionalAuthMiddleware } from '../middleware/optionalAuth';
import {
  listAnnouncements,
  getAnnouncementById,
  getUnreadCount,
} from '../controllers/announcement.controller';

export const announcementRoute = new Hono();

// Authenticated endpoints (must come before /:id to avoid conflicts)
// GET /announcements/unread-count - Get unread count for authenticated user
announcementRoute.get('/unread-count', authMiddleware, getUnreadCount);

// Notification endpoints
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  getUserNotifications,
} from '../controllers/notification.controller';

announcementRoute.get('/notifications/preferences', authMiddleware, getNotificationPreferences);
announcementRoute.put('/notifications/preferences', authMiddleware, updateNotificationPreferences);
announcementRoute.get('/notifications', authMiddleware, getUserNotifications);

// Public endpoints with optional authentication
// GET /announcements - List published announcements (with optional read status if authenticated)
announcementRoute.get('/', optionalAuthMiddleware, listAnnouncements);

// GET /announcements/:id - Get specific announcement (with optional read tracking if authenticated)
announcementRoute.get('/:id', optionalAuthMiddleware, getAnnouncementById);