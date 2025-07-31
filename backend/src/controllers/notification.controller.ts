import { Context } from 'hono';
import { z } from 'zod';
import { notificationService } from '../services/notification.service';
import { ok, fail } from '../utils/response';
import { notificationPreferencesSchema } from '../types';

const getUserNotificationsQuerySchema = z.object({
  limit: z.string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0 && val <= 100, 'Limit must be between 1 and 100')
    .default('50'),
});

export async function getNotificationPreferences(c: Context) {
  try {
    const user = c.get('user');
    if (!user?.sub) {
      const resp = fail('Unauthorized', 401);
      return c.json(resp.body, resp.status as any);
    }

    const preferences = await notificationService.getNotificationPreferences(user.sub);
    
    const resp = ok('Success', preferences);
    return c.json(resp.body, resp.status as any);
  } catch (error) {
    const resp = fail('Failed to get notification preferences', 500);
    return c.json(resp.body, resp.status as any);
  }
}

export async function updateNotificationPreferences(c: Context) {
  try {
    const user = c.get('user');
    if (!user?.sub) {
      const resp = fail('Unauthorized', 401);
      return c.json(resp.body, resp.status as any);
    }

    const body = await c.req.json();
    const parsed = notificationPreferencesSchema.safeParse(body);
    
    if (!parsed.success) {
      const resp = fail('Invalid input', 400, parsed.error);
      return c.json(resp.body, resp.status as any);
    }

    const preferences = await notificationService.updateNotificationPreferences(
      user.sub,
      parsed.data
    );
    
    const resp = ok('Notification preferences updated successfully', preferences);
    return c.json(resp.body, resp.status as any);
  } catch (error) {
    const resp = fail('Failed to update notification preferences', 500);
    return c.json(resp.body, resp.status as any);
  }
}

export async function getUserNotifications(c: Context) {
  try {
    const user = c.get('user');
    if (!user?.sub) {
      const resp = fail('Unauthorized', 401);
      return c.json(resp.body, resp.status as any);
    }

    const queryParams = c.req.query();
    const parsed = getUserNotificationsQuerySchema.safeParse(queryParams);
    
    if (!parsed.success) {
      const resp = fail('Invalid query parameters', 400, parsed.error);
      return c.json(resp.body, resp.status as any);
    }

    const notifications = await notificationService.getUserNotifications(
      user.sub,
      parsed.data.limit
    );
    
    const resp = ok('Success', notifications);
    return c.json(resp.body, resp.status as any);
  } catch (error) {
    const resp = fail('Failed to get user notifications', 500);
    return c.json(resp.body, resp.status as any);
  }
}