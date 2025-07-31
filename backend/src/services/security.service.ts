import { db } from '../db';
import { users, userActivityLogs, userSessions } from '../db/schemas';
import { eq, and, gte, count, desc, lt, inArray, sql } from 'drizzle-orm';
import { activityService } from './activity.service';
import { SecurityUtils } from '../utils/security.utils';
import {
  AccountLockedError,
  SuspiciousActivityError,
  RateLimitExceededError
} from '../utils/errors';
import type { Context } from 'hono';

export interface SecurityConfig {
  maxFailedAttempts: number;
  lockoutDuration: number; // minutes
  suspiciousActivityThreshold: number;
  rateLimitWindow: number; // minutes
  maxRequestsPerWindow: number;
}

const defaultConfig: SecurityConfig = {
  maxFailedAttempts: parseInt(process.env.MAX_FAILED_ATTEMPTS || '10'),
  lockoutDuration: parseInt(process.env.LOCKOUT_DURATION_MINUTES || '10'), // นาที
  suspiciousActivityThreshold: parseInt(process.env.SUSPICIOUS_ACTIVITY_THRESHOLD || '10'),
  rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES || '15'),
  maxRequestsPerWindow: parseInt(process.env.MAX_REQUESTS_PER_WINDOW || '100'),
};

export const securityService = {
  config: defaultConfig,

  // Update security configuration
  updateConfig(newConfig: Partial<SecurityConfig>) {
    this.config = { ...this.config, ...newConfig };
  },

  // Check if account should be locked due to failed attempts
  async checkAccountLockout(userId: string): Promise<boolean> {
    const user = await db
      .select({ 
        failedLoginAttempts: users.failedLoginAttempts,
        lockedUntil: users.lockedUntil 
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user.length) return false;

    const userData = user[0];
    
    // Check if account is currently locked
    if (userData.lockedUntil && userData.lockedUntil > new Date()) {
      return true;
    }

    // Check if failed attempts exceed threshold
    return (userData.failedLoginAttempts || 0) >= this.config.maxFailedAttempts;
  },

  // Lock user account
  async lockAccount(userId: string, reason: string, c: Context) {
    const lockUntil = new Date(Date.now() + this.config.lockoutDuration * 60 * 1000);
    
    await db
      .update(users)
      .set({ 
        lockedUntil: lockUntil,
        failedLoginAttempts: 0 // Reset counter after lock
      })
      .where(eq(users.id, userId));

    // Log the account lock
    await activityService.logActivity({
      userId,
      activityType: 'account_locked',
      description: `Account locked due to: ${reason}`,
      ...activityService.extractRequestInfo(c),
      severity: 'high',
      metadata: { reason, lockUntil },
    });

    // Create security alert
    await activityService.createSecurityAlert({
      userId,
      alertType: 'account_locked',
      title: 'Account Locked',
      description: `User account locked due to: ${reason}`,
      severity: 'high',
      metadata: { reason, lockUntil },
    });
  },

  // Unlock user account
  async unlockAccount(userId: string, unlockedBy: string, c: Context) {
    await db
      .update(users)
      .set({ 
        lockedUntil: null,
        failedLoginAttempts: 0 
      })
      .where(eq(users.id, userId));

    // Log the unlock
    await activityService.logActivity({
      userId,
      activityType: 'account_unlocked',
      description: `Account unlocked by admin: ${unlockedBy}`,
      ...activityService.extractRequestInfo(c),
      severity: 'medium',
      metadata: { unlockedBy },
    });
  },

  // Increment failed login attempts
  async incrementFailedAttempts(userId: string, c: Context) {
    // Get current failed attempts
    const [user] = await db
      .select({ failedLoginAttempts: users.failedLoginAttempts })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) return;

    const newAttempts = (user.failedLoginAttempts || 0) + 1;
    
    await db
      .update(users)
      .set({ failedLoginAttempts: newAttempts })
      .where(eq(users.id, userId));

    // Log failed attempt
    await activityService.logLogin(userId, c, false);

    // Check if account should be locked
    if (newAttempts >= this.config.maxFailedAttempts) {
      await this.lockAccount(userId, 'Too many failed login attempts', c);
      throw new AccountLockedError('Account has been locked due to too many failed login attempts');
    }
  },

  // Reset failed login attempts on successful login
  async resetFailedAttempts(userId: string) {
    await db
      .update(users)
      .set({ failedLoginAttempts: 0 })
      .where(eq(users.id, userId));
  },

  // Check for suspicious activity patterns
  async detectSuspiciousActivity(userId: string, c: Context): Promise<boolean> {
    const timeWindow = 60; // 1 hour
    const since = new Date(Date.now() - timeWindow * 60 * 1000);

    // Check for multiple failed logins
    const failedLogins = await activityService.checkFailedLoginAttempts(
      activityService.extractRequestInfo(c).ipAddress, 
      timeWindow
    );

    if (failedLogins >= 5) {
      await this.createSuspiciousActivityAlert(
        userId, 
        'Multiple failed login attempts from same IP', 
        c
      );
      return true;
    }

    // Check for logins from multiple locations
    const multipleLocations = await activityService.checkMultipleLocationLogins(userId, timeWindow);
    if (multipleLocations) {
      await this.createSuspiciousActivityAlert(
        userId, 
        'Login attempts from multiple locations', 
        c
      );
      return true;
    }

    // Check for high activity volume
    const [activityCount] = await db
      .select({ count: count() })
      .from(userActivityLogs)
      .where(
        and(
          eq(userActivityLogs.userId, userId),
          gte(userActivityLogs.createdAt, since)
        )
      );

    if (activityCount.count > this.config.suspiciousActivityThreshold) {
      await this.createSuspiciousActivityAlert(
        userId, 
        'Unusually high activity volume', 
        c
      );
      return true;
    }

    return false;
  },

  // Create suspicious activity alert
  async createSuspiciousActivityAlert(userId: string, reason: string, c: Context) {
    await activityService.logSuspiciousActivity(userId, reason, c);
    
    await activityService.createSecurityAlert({
      userId,
      alertType: 'suspicious_activity',
      title: 'Suspicious Activity Detected',
      description: reason,
      severity: 'high',
      metadata: { 
        reason,
        ...activityService.extractRequestInfo(c)
      },
    });
  },

  // Rate limiting check
  async checkRateLimit(identifier: string, action: string): Promise<boolean> {
    const timeWindow = this.config.rateLimitWindow;
    const since = new Date(Date.now() - timeWindow * 60 * 1000);

    // Count recent activities for this identifier and action
    const [activityCount] = await db
      .select({ count: count() })
      .from(userActivityLogs)
      .where(
        and(
          eq(userActivityLogs.ipAddress, identifier),
          eq(userActivityLogs.activityType, action as any),
          gte(userActivityLogs.createdAt, since)
        )
      );

    return activityCount.count >= this.config.maxRequestsPerWindow;
  },

  // Enforce rate limiting
  async enforceRateLimit(identifier: string, action: string, c: Context) {
    const isLimited = await this.checkRateLimit(identifier, action);
    
    if (isLimited) {
      await activityService.logActivity({
        activityType: 'api_access',
        description: `Rate limit exceeded for ${action}`,
        ipAddress: identifier,
        severity: 'medium',
        metadata: { action, rateLimited: true },
      });

      throw new RateLimitExceededError(`Rate limit exceeded for ${action}`);
    }
  },

  // Get security statistics
  async getSecurityStats(days: number = 7) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Failed login attempts
    const [failedLogins] = await db
      .select({ count: count() })
      .from(userActivityLogs)
      .where(
        and(
          eq(userActivityLogs.activityType, 'failed_login'),
          gte(userActivityLogs.createdAt, since)
        )
      );

    // Suspicious activities
    const [suspiciousActivities] = await db
      .select({ count: count() })
      .from(userActivityLogs)
      .where(
        and(
          eq(userActivityLogs.activityType, 'suspicious_activity'),
          gte(userActivityLogs.createdAt, since)
        )
      );

    // Account locks
    const [accountLocks] = await db
      .select({ count: count() })
      .from(userActivityLogs)
      .where(
        and(
          eq(userActivityLogs.activityType, 'account_locked'),
          gte(userActivityLogs.createdAt, since)
        )
      );

    // Currently locked accounts
    const [lockedAccounts] = await db
      .select({ count: count() })
      .from(users)
      .where(
        and(
          gte(users.lockedUntil, new Date())
        )
      );

    return {
      period: `${days} days`,
      failedLogins: failedLogins.count,
      suspiciousActivities: suspiciousActivities.count,
      accountLocks: accountLocks.count,
      currentlyLocked: lockedAccounts.count,
    };
  },

  // Get recent security events
  async getRecentSecurityEvents(limit: number = 50) {
    const securityActivityTypes = [
      'failed_login',
      'suspicious_activity',
      'account_locked',
      'account_unlocked'
    ];

    const events = await db
      .select()
      .from(userActivityLogs)
      .where(
        inArray(userActivityLogs.activityType, securityActivityTypes as any)
      )
      .orderBy(desc(userActivityLogs.createdAt))
      .limit(limit);

    return events;
  },

  // Session Management
  async createSession(userId: string, c: Context): Promise<string> {
    const sessionToken = SecurityUtils.generateSessionToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const deviceInfo = {
      userAgent: c.req.header('user-agent') || '',
      ip: SecurityUtils.extractClientIP({
        'x-forwarded-for': c.req.header('x-forwarded-for'),
        'x-real-ip': c.req.header('x-real-ip'),
      }),
    };

    await db.insert(userSessions).values({
      userId,
      sessionToken,
      deviceInfo,
      ipAddress: deviceInfo.ip,
      expiresAt,
    });

    return sessionToken;
  },

  async validateSession(sessionToken: string): Promise<boolean> {
    const [session] = await db
      .select()
      .from(userSessions)
      .where(
        and(
          eq(userSessions.sessionToken, sessionToken),
          eq(userSessions.isActive, true),
          gte(userSessions.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!session) return false;

    // Update last activity
    await db
      .update(userSessions)
      .set({ lastActivityAt: new Date() })
      .where(eq(userSessions.sessionToken, sessionToken));

    return true;
  },

  async terminateSession(sessionToken: string): Promise<void> {
    await db
      .update(userSessions)
      .set({ isActive: false })
      .where(eq(userSessions.sessionToken, sessionToken));
  },

  async terminateAllUserSessions(userId: string): Promise<void> {
    await db
      .update(userSessions)
      .set({ isActive: false })
      .where(eq(userSessions.userId, userId));
  },

  async cleanupExpiredSessions(): Promise<number> {
    const result = await db
      .update(userSessions)
      .set({ isActive: false })
      .where(lt(userSessions.expiresAt, new Date()));

    return result.rowCount || 0;
  },

  // Enhanced Security Checks
  async checkDeviceFingerprint(userId: string, c: Context): Promise<boolean> {
    const currentFingerprint = await SecurityUtils.generateDeviceFingerprint({
      'user-agent': c.req.header('user-agent'),
      'accept-language': c.req.header('accept-language'),
      'accept-encoding': c.req.header('accept-encoding'),
    });

    // Get recent sessions for this user
    const recentSessions = await db
      .select()
      .from(userSessions)
      .where(
        and(
          eq(userSessions.userId, userId),
          eq(userSessions.isActive, true),
          gte(userSessions.lastActivityAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
        )
      )
      .limit(5);

    // Check if current device fingerprint matches any recent session
    for (const session of recentSessions) {
      const sessionFingerprint = session.deviceInfo as any;
      if (sessionFingerprint?.fingerprint === currentFingerprint) {
        return true;
      }
    }

    return false;
  },

  async checkSuspiciousIP(ip: string, userAgent: string): Promise<boolean> {
    return SecurityUtils.isSuspiciousRequest(ip, userAgent);
  },

  // Password Security
  async validatePasswordStrength(password: string): Promise<{
    isValid: boolean;
    score: number;
    issues: string[];
  }> {
    const result = SecurityUtils.validatePasswordStrength(password);

    // Check against common passwords
    if (SecurityUtils.isCommonPassword(password)) {
      result.issues.push('Password is too common');
      result.isValid = false;
      result.score = Math.max(0, result.score - 30);
    }

    return result;
  },

  // CSRF Protection
  async generateCSRFToken(sessionToken: string): Promise<string> {
    const csrfToken = SecurityUtils.generateCSRFToken();

    // Store CSRF token in session metadata
    await db
      .update(userSessions)
      .set({
        deviceInfo: sql`jsonb_set(device_info, '{csrfToken}', '"${csrfToken}"')`
      })
      .where(eq(userSessions.sessionToken, sessionToken));

    return csrfToken;
  },

  async validateCSRFToken(sessionToken: string, providedToken: string): Promise<boolean> {
    const [session] = await db
      .select()
      .from(userSessions)
      .where(eq(userSessions.sessionToken, sessionToken))
      .limit(1);

    if (!session) return false;

    const deviceInfo = session.deviceInfo as any;
    const storedToken = deviceInfo?.csrfToken;

    return storedToken && SecurityUtils.validateCSRFToken(providedToken, storedToken);
  },

  // Advanced Rate Limiting
  async checkAdvancedRateLimit(
    identifier: string,
    action: string,
    customLimits?: { window: number; max: number }
  ): Promise<{ allowed: boolean; retryAfter?: number }> {
    const limits = customLimits || {
      window: this.config.rateLimitWindow,
      max: this.config.maxRequestsPerWindow
    };

    const since = new Date(Date.now() - limits.window * 60 * 1000);

    const [activityCount] = await db
      .select({ count: count() })
      .from(userActivityLogs)
      .where(
        and(
          eq(userActivityLogs.ipAddress, identifier),
          eq(userActivityLogs.activityType, action as any),
          gte(userActivityLogs.createdAt, since)
        )
      );

    if (activityCount.count >= limits.max) {
      const retryAfter = Math.ceil(limits.window * 60 - (Date.now() - since.getTime()) / 1000);
      return { allowed: false, retryAfter };
    }

    return { allowed: true };
  },
};