import { Context } from 'hono';
import { announcementService } from '../services/announcement.service';
import { ok, fail } from '../utils/response';
import {
  announcementFiltersSchema,
  uuidParamSchema,
  ANNOUNCEMENT_ERROR_CODES,
} from '../types';

export async function listAnnouncements(c: Context) {
  try {
    // Parse query parameters
    const queryParams = c.req.query();
    const parsed = announcementFiltersSchema.safeParse(queryParams);
    
    if (!parsed.success) {
      const resp = fail('Invalid query parameters', 400, parsed.error);
      return c.json(resp.body, resp.status as any);
    }

    // Get user ID if authenticated (optional)
    const user = c.get('user');
    const userId = user?.sub;

    const result = await announcementService.getPublishedAnnouncements(parsed.data, userId);
    
    const resp = ok('Success', result);
    return c.json(resp.body, resp.status as any);
  } catch (error) {
    const resp = fail('Failed to fetch announcements', 500);
    return c.json(resp.body, resp.status as any);
  }
}

export async function getAnnouncementById(c: Context) {
  try {
    // Parse and validate ID parameter
    const params = { id: c.req.param('id') };
    const parsed = uuidParamSchema.safeParse(params);
    
    if (!parsed.success) {
      const resp = fail('Invalid announcement ID', 400, parsed.error);
      return c.json(resp.body, resp.status as any);
    }

    // Get user ID if authenticated (optional)
    const user = c.get('user');
    const userId = user?.sub;

    const announcement = await announcementService.getAnnouncementById(parsed.data.id, userId);
    
    // Mark as read if user is authenticated
    if (userId) {
      await announcementService.markAsRead(parsed.data.id, userId);
    }

    const resp = ok('Success', announcement);
    return c.json(resp.body, resp.status as any);
  } catch (error) {
    const errorMessage = (error as Error).message;
    
    if (errorMessage === ANNOUNCEMENT_ERROR_CODES.ANNOUNCEMENT_NOT_FOUND) {
      const resp = fail('Announcement not found', 404);
      return c.json(resp.body, resp.status as any);
    }
    
    if (errorMessage === ANNOUNCEMENT_ERROR_CODES.ANNOUNCEMENT_EXPIRED) {
      const resp = fail('Announcement not available', 404);
      return c.json(resp.body, resp.status as any);
    }

    const resp = fail('Failed to fetch announcement', 500);
    return c.json(resp.body, resp.status as any);
  }
}

export async function getUnreadCount(c: Context) {
  try {
    // This endpoint requires authentication
    const user = c.get('user');
    if (!user?.sub) {
      const resp = fail('Unauthorized', 401);
      return c.json(resp.body, resp.status as any);
    }

    const count = await announcementService.getUnreadCount(user.sub);
    
    const resp = ok('Success', { unreadCount: count });
    return c.json(resp.body, resp.status as any);
  } catch (error) {
    const resp = fail('Failed to get unread count', 500);
    return c.json(resp.body, resp.status as any);
  }
}