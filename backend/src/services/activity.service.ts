import { db } from '../db';
import { userActivityLogs, securityAlerts, activityTypeEnum, severityEnum } from '../db/schemas';
import { eq, desc, and, gte, lte, count, sql } from 'drizzle-orm';
import type { Context } from 'hono';

export interface ActivityLogData {
  userId?: string;
  activityType: typeof activityTypeEnum.enumValues[number];
  description: string;
  ipAddress?: string;
  userAgent?: string;
  location?: {
    country?: string;
    city?: string;
    region?: string;
  };
  metadata?: Record<string, any>;
  severity?: typeof severityEnum.enumValues[number];
}

export interface SecurityAlertData {
  userId?: string;
  alertType: string;
  title: string;
  description: string;
  severity: typeof severityEnum.enumValues[number];
  metadata?: Record<string, any>;
}

export const activityService = {
  // Log user activity
  async logActivity(data: ActivityLogData) {
    try {
      const [log] = await db.insert(userActivityLogs).values({
        userId: data.userId || null,
        activityType: data.activityType,
        description: data.description,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        location: data.location,
        metadata: data.metadata,
        severity: data.severity || 'low',
      }).returning();

      return log;
    } catch (error) {
      console.error('Failed to log activity:', error);
      // Don't throw error to avoid breaking main functionality
      return null;
    }
  },

  // Helper to extract request info from Hono context
  extractRequestInfo(c: Context) {
    const ipAddress = c.req.header('x-forwarded-for') || 
                     c.req.header('x-real-ip') || 
                     c.env?.ip || 
                     'unknown';
    
    const userAgent = c.req.header('user-agent') || 'unknown';
    
    return { ipAddress, userAgent };
  },

  // Log authentication events
  async logLogin(userId: string, c: Context, success: boolean = true) {
    const { ipAddress, userAgent } = this.extractRequestInfo(c);
    
    return this.logActivity({
      userId,
      activityType: success ? 'login' : 'failed_login',
      description: success ? 'User logged in successfully' : 'Failed login attempt',
      ipAddress,
      userAgent,
      severity: success ? 'low' : 'medium',
    });
  },

  async logLogout(userId: string, c: Context) {
    const { ipAddress, userAgent } = this.extractRequestInfo(c);
    
    return this.logActivity({
      userId,
      activityType: 'logout',
      description: 'User logged out',
      ipAddress,
      userAgent,
      severity: 'low',
    });
  },

  async logRegistration(userId: string, c: Context) {
    const { ipAddress, userAgent } = this.extractRequestInfo(c);
    
    return this.logActivity({
      userId,
      activityType: 'register',
      description: 'New user registered',
      ipAddress,
      userAgent,
      severity: 'low',
    });
  },

  async logPasswordChange(userId: string, c: Context) {
    const { ipAddress, userAgent } = this.extractRequestInfo(c);
    
    return this.logActivity({
      userId,
      activityType: 'password_change',
      description: 'User changed password',
      ipAddress,
      userAgent,
      severity: 'medium',
    });
  },

  async logProfileUpdate(userId: string, c: Context, changes: string[]) {
    const { ipAddress, userAgent } = this.extractRequestInfo(c);
    
    return this.logActivity({
      userId,
      activityType: 'profile_update',
      description: `User updated profile: ${changes.join(', ')}`,
      ipAddress,
      userAgent,
      metadata: { changes },
      severity: 'low',
    });
  },

  async logAdminAction(adminId: string, targetUserId: string, action: string, c: Context) {
    const { ipAddress, userAgent } = this.extractRequestInfo(c);
    
    return this.logActivity({
      userId: adminId,
      activityType: 'admin_action',
      description: `Admin performed action: ${action} on user ${targetUserId}`,
      ipAddress,
      userAgent,
      metadata: { targetUserId, action },
      severity: 'high',
    });
  },

  async logSuspiciousActivity(userId: string | undefined, reason: string, c: Context) {
    const { ipAddress, userAgent } = this.extractRequestInfo(c);
    
    return this.logActivity({
      userId,
      activityType: 'suspicious_activity',
      description: `Suspicious activity detected: ${reason}`,
      ipAddress,
      userAgent,
      severity: 'high',
    });
  },

  // Get user activity logs with pagination
  async getUserActivityLogs(userId: string, page: number = 1, limit: number = 50) {
    const offset = (page - 1) * limit;
    
    const logs = await db
      .select()
      .from(userActivityLogs)
      .where(eq(userActivityLogs.userId, userId))
      .orderBy(desc(userActivityLogs.createdAt))
      .limit(limit)
      .offset(offset);

    const [totalCount] = await db
      .select({ count: count() })
      .from(userActivityLogs)
      .where(eq(userActivityLogs.userId, userId));

    return {
      logs,
      pagination: {
        page,
        limit,
        total: totalCount.count,
        totalPages: Math.ceil(totalCount.count / limit),
      },
    };
  },

  // Get recent activity across all users (admin only)
  async getRecentActivity(page: number = 1, limit: number = 100) {
    const offset = (page - 1) * limit;
    
    const logs = await db
      .select({
        id: userActivityLogs.id,
        userId: userActivityLogs.userId,
        activityType: userActivityLogs.activityType,
        description: userActivityLogs.description,
        ipAddress: userActivityLogs.ipAddress,
        severity: userActivityLogs.severity,
        createdAt: userActivityLogs.createdAt,
      })
      .from(userActivityLogs)
      .orderBy(desc(userActivityLogs.createdAt))
      .limit(limit)
      .offset(offset);

    return logs;
  },

  // Security monitoring functions
  async createSecurityAlert(data: SecurityAlertData) {
    try {
      const [alert] = await db.insert(securityAlerts).values({
        userId: data.userId || null,
        alertType: data.alertType,
        title: data.title,
        description: data.description,
        severity: data.severity,
        metadata: data.metadata,
      }).returning();

      return alert;
    } catch (error) {
      console.error('Failed to create security alert:', error);
      return null;
    }
  },

  // Check for suspicious patterns
  async checkFailedLoginAttempts(ipAddress: string, timeWindow: number = 15) {
    const since = new Date(Date.now() - timeWindow * 60 * 1000);
    
    const [result] = await db
      .select({ count: count() })
      .from(userActivityLogs)
      .where(
        and(
          eq(userActivityLogs.activityType, 'failed_login'),
          eq(userActivityLogs.ipAddress, ipAddress),
          gte(userActivityLogs.createdAt, since)
        )
      );

    return result.count;
  },

  async checkMultipleLocationLogins(userId: string, timeWindow: number = 60) {
    const since = new Date(Date.now() - timeWindow * 60 * 1000);
    
    const locations = await db
      .select({ 
        location: userActivityLogs.location,
        ipAddress: userActivityLogs.ipAddress 
      })
      .from(userActivityLogs)
      .where(
        and(
          eq(userActivityLogs.userId, userId),
          eq(userActivityLogs.activityType, 'login'),
          gte(userActivityLogs.createdAt, since)
        )
      );

    // Check for different IP addresses or locations
    const uniqueIPs = new Set(locations.map(l => l.ipAddress));
    return uniqueIPs.size > 1;
  },

  // Get security alerts
  async getSecurityAlerts(page: number = 1, limit: number = 50, resolved?: boolean) {
    const offset = (page - 1) * limit;
    
    let whereCondition = undefined;
    if (resolved !== undefined) {
      whereCondition = eq(securityAlerts.isResolved, resolved);
    }
    
    const alerts = await db
      .select()
      .from(securityAlerts)
      .where(whereCondition)
      .orderBy(desc(securityAlerts.createdAt))
      .limit(limit)
      .offset(offset);

    return alerts;
  },

  // Resolve security alert
  async resolveSecurityAlert(alertId: string, resolvedBy: string) {
    const [alert] = await db
      .update(securityAlerts)
      .set({
        isResolved: true,
        resolvedBy,
        resolvedAt: new Date(),
      })
      .where(eq(securityAlerts.id, alertId))
      .returning();

    return alert;
  },
};