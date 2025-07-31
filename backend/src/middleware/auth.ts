import { verify } from 'jsonwebtoken';
import { env } from '../config/env';
import type { Context, Next } from 'hono';
import { AuthenticationError, InvalidTokenError, TokenExpiredError, RateLimitExceededError } from '../utils/errors';
import { activityService } from '../services/activity.service';
import { securityService } from '../services/security.service';
import { SecurityUtils } from '../utils/security.utils';
import { DeviceTrackingUtils } from '../utils/device-tracking.utils';
import { db } from '../db';
import { users } from '../db/schemas/base';
import { eq } from 'drizzle-orm';

export async function authMiddleware(c: Context, next: Next) {
  try {
    // Extract client information
    const clientIP = SecurityUtils.extractClientIPFromContext(c);
    const userAgent = c.req.header('user-agent') || '';

    // Extract device and network information
    const headers = {
      'user-agent': userAgent,
      'accept-language': c.req.header('accept-language') || '',
      'accept-encoding': c.req.header('accept-encoding') || '',
      'accept': c.req.header('accept') || '',
      'referer': c.req.header('referer') || '',
      'origin': c.req.header('origin') || ''
    };

    const deviceFingerprint = await DeviceTrackingUtils.generateDeviceFingerprint(headers);
    const deviceInfo = DeviceTrackingUtils.extractDeviceInfo(userAgent);
    const ipInfo = DeviceTrackingUtils.analyzeIP(clientIP);

    // Check for suspicious requests
    if (await securityService.checkSuspiciousIP(clientIP, userAgent)) {
      await activityService.logActivity({
        activityType: 'suspicious_activity',
        description: 'Suspicious request detected',
        ipAddress: clientIP,
        userAgent,
        severity: 'medium',
        metadata: { reason: 'suspicious_ip_or_user_agent' },
      });
    }

    // Rate limiting check
    const rateLimitResult = await securityService.checkAdvancedRateLimit(
      clientIP,
      'api_access',
      { window: 1, max: 60 } // 60 requests per minute
    );

    if (!rateLimitResult.allowed) {
      await activityService.logActivity({
        activityType: 'api_access',
        description: 'Rate limit exceeded',
        ipAddress: clientIP,
        severity: 'medium',
        metadata: { rateLimited: true, retryAfter: rateLimitResult.retryAfter },
      });

      const error = new RateLimitExceededError('Rate limit exceeded');
      (error as any).retryAfter = rateLimitResult.retryAfter;
      throw error;
    }

    // Extract and validate token
    const bearer = c.req.header('authorization') || '';
    const token = bearer.replace(/Bearer\s+/i, '');

    if (!token) {
      throw new AuthenticationError('Authorization token is required');
    }

    // Verify JWT token
    const payload = verify(token, env.jwtSecret) as any;

    // Check if account is locked
    const isLocked = await securityService.checkAccountLockout(payload.sub);
    if (isLocked) {
      throw new AuthenticationError('Account is locked');
    }

    // Validate session if present
    if (payload.sessionToken) {
      const isValidSession = await securityService.validateSession(payload.sessionToken);
      if (!isValidSession) {
        throw new AuthenticationError('Invalid session');
      }
    }

    // Set user in context
    c.set('user', payload);

    // Track login information
    await trackLoginInfo(payload.sub, {
      ip: clientIP,
      ipInfo,
      deviceFingerprint,
      deviceInfo,
      headers,
      timestamp: new Date()
    });

    // Log successful API access with enhanced metadata
    await activityService.logActivity({
      userId: payload.sub,
      activityType: 'api_access',
      description: `API access: ${c.req.method} ${c.req.path}`,
      ...activityService.extractRequestInfo(c),
      severity: 'low',
      metadata: {
        method: c.req.method,
        path: c.req.path,
        userAgent,
        authenticated: true,
        deviceFingerprint,
        deviceInfo,
        ipInfo,
        headers: {
          acceptLanguage: headers['accept-language'],
          acceptEncoding: headers['accept-encoding'],
          referer: headers['referer'],
          origin: headers['origin']
        },
        timestamp: new Date().toISOString()
      },
    });

    await next();
  } catch (error: any) {
    // Handle specific JWT errors
    if (error.name === 'TokenExpiredError') {
      throw new TokenExpiredError('Token has expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new InvalidTokenError('Invalid token format');
    }

    // Re-throw known errors
    if (error instanceof AuthenticationError ||
        error instanceof RateLimitExceededError) {
      throw error;
    }

    // Log unexpected errors
    await activityService.logActivity({
      activityType: 'api_access',
      description: `Authentication error: ${error.message}`,
      ...activityService.extractRequestInfo(c),
      severity: 'high',
      metadata: { error: error.message, stack: error.stack },
    });

    throw new AuthenticationError('Token validation failed');
  }
}

// Optional authentication middleware (doesn't fail if no token)
export async function optionalAuthMiddleware(c: Context, next: Next) {
  try {
    const bearer = c.req.header('authorization') || '';
    const token = bearer.replace(/Bearer\s+/i, '');

    if (token) {
      try {
        const payload = verify(token, env.jwtSecret) as any;

        // Check if account is locked
        const isLocked = await securityService.checkAccountLockout(payload.sub);
        if (!isLocked) {
          c.set('user', payload);
        }
      } catch (error) {
        // Ignore token errors in optional auth
        console.warn('Optional auth token validation failed:', error);
      }
    }

    await next();
  } catch (error) {
    // Continue even if optional auth fails
    await next();
  }
}

// Role-based authorization middleware
export function requireRole(roles: string | string[]) {
  return async (c: Context, next: Next) => {
    const user = c.get('user');

    if (!user) {
      throw new AuthenticationError('Authentication required');
    }

    const userRole = user.role;
    const requiredRoles = Array.isArray(roles) ? roles : [roles];

    if (!requiredRoles.includes(userRole)) {
      await activityService.logActivity({
        userId: user.sub,
        activityType: 'api_access',
        description: `Unauthorized access attempt to ${c.req.path}`,
        ...activityService.extractRequestInfo(c),
        severity: 'medium',
        metadata: {
          userRole,
          requiredRoles,
          path: c.req.path,
        },
      });

      throw new AuthenticationError('Insufficient permissions');
    }

    await next();
  };
}

// Admin-only middleware
export const requireAdmin = requireRole('admin');

// Helper function to track login information
async function trackLoginInfo(userId: string, loginData: {
  ip: string;
  ipInfo: any;
  deviceFingerprint: string;
  deviceInfo: any;
  headers: Record<string, string>;
  timestamp: Date;
}) {
  try {
    // Check if user exists
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (user.length === 0) return;

    // Update basic login info
    await db.update(users).set({
      lastLoginAt: loginData.timestamp,
      lastLoginIp: loginData.ip,
      lastDeviceFingerprint: loginData.deviceFingerprint
    }).where(eq(users.id, userId));

    // Device info is already stored in userSessions table
    // No need to duplicate in users table

  } catch (error) {
    console.error('Error tracking login info:', error);
    // Don't throw error to avoid breaking authentication flow
  }
}