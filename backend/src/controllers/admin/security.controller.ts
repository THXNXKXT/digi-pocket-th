import { Context } from 'hono';
import { activityService } from '../../services/activity.service';
import { securityService } from '../../services/security.service';
import { ok } from '../../utils/response';
import {
  validateInput,
  paginationSchema,
  activityLogFilterSchema,
  securityAlertFilterSchema
} from '../../utils/validation';
import { asyncHandler } from '../../middleware/errorHandler';

// Get user activity logs
export const getUserActivityLogs = asyncHandler(async (c: Context) => {
  const userId = c.req.param('userId');
  const query = c.req.query();

  const { page, limit } = validateInput(paginationSchema, query);

  const result = await activityService.getUserActivityLogs(userId, page, limit);

  const { body, status } = ok('Activity logs retrieved', result);
  return c.json(body, status as any);
});

// Get all activity logs (admin only)
export const getAllActivityLogs = asyncHandler(async (c: Context) => {
  const query = c.req.query();

  const filters = validateInput(activityLogFilterSchema, query);

  const logs = await activityService.getRecentActivity(filters.page, filters.limit);

  const { body, status } = ok('Activity logs retrieved', { logs });
  return c.json(body, status as any);
});

// Get security statistics
export const getSecurityStats = asyncHandler(async (c: Context) => {
  const days = parseInt(c.req.query('days') || '7');

  const stats = await securityService.getSecurityStats(days);

  const { body, status } = ok('Security statistics retrieved', stats);
  return c.json(body, status as any);
});

// Get recent security events
export const getSecurityEvents = asyncHandler(async (c: Context) => {
  const limit = parseInt(c.req.query('limit') || '50');

  const events = await securityService.getRecentSecurityEvents(limit);

  const { body, status } = ok('Security events retrieved', { events });
  return c.json(body, status as any);
});

// Get security alerts
export const getSecurityAlerts = asyncHandler(async (c: Context) => {
  const query = c.req.query();

  const filters = validateInput(securityAlertFilterSchema, query);

  const alerts = await activityService.getSecurityAlerts(
    filters.page,
    filters.limit,
    filters.resolved
  );

  const { body, status } = ok('Security alerts retrieved', { alerts });
  return c.json(body, status as any);
});

// Resolve security alert
export const resolveSecurityAlert = asyncHandler(async (c: Context) => {
  const alertId = c.req.param('alertId');
  const user = c.get('user');

  const alert = await activityService.resolveSecurityAlert(alertId, user.sub);

  const { body, status } = ok('Security alert resolved', { alert });
  return c.json(body, status as any);
});

// Unlock user account
export const unlockUserAccount = asyncHandler(async (c: Context) => {
  const userId = c.req.param('userId');
  const admin = c.get('user');

  await securityService.unlockAccount(userId, admin.sub, c);

  // Log admin action
  await activityService.logAdminAction(
    admin.sub,
    userId,
    'unlock_account',
    c
  );

  const { body, status } = ok('User account unlocked successfully', { success: true });
  return c.json(body, status as any);
});

// Get current security configuration
export const getSecurityConfig = asyncHandler(async (c: Context) => {
  const { body, status } = ok('Security configuration retrieved', {
    config: securityService.config
  });
  return c.json(body, status as any);
});

// Update security configuration
export const updateSecurityConfig = asyncHandler(async (c: Context) => {
  const body = await c.req.json();
  const admin = c.get('user');

  // Validate security config (you might want to create a specific schema)
  const validConfig = {
    maxFailedAttempts: body.maxFailedAttempts || securityService.config.maxFailedAttempts,
    lockoutDuration: body.lockoutDuration || securityService.config.lockoutDuration,
    suspiciousActivityThreshold: body.suspiciousActivityThreshold || securityService.config.suspiciousActivityThreshold,
    rateLimitWindow: body.rateLimitWindow || securityService.config.rateLimitWindow,
    maxRequestsPerWindow: body.maxRequestsPerWindow || securityService.config.maxRequestsPerWindow,
  };

  securityService.updateConfig(validConfig);

  // Log admin action
  await activityService.logAdminAction(
    admin.sub,
    'system',
    'update_security_config',
    c
  );

  const { body: responseBody, status } = ok('Security configuration updated', validConfig);
  return c.json(responseBody, status as any);
});