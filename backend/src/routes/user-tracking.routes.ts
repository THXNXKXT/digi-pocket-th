import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { db } from '../db';
import { users, userActivityLogs, userSessions } from '../db/schemas/base';
import { eq, and, desc, gte, count } from 'drizzle-orm';

const app = new Hono();

// Get user's device history
app.get('/devices', authMiddleware, async (c) => {
  try {
    const user = c.get('user' as any) as any;
    console.log('Fetching device history for user:', user.sub);

    // Get current user info
    const userData = await db.select({
      lastDeviceFingerprint: users.lastDeviceFingerprint
    }).from(users).where(eq(users.id, user.sub)).limit(1);

    if (userData.length === 0) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Get device history from sessions
    const sessions = await db.select({
      deviceInfo: userSessions.deviceInfo,
      createdAt: userSessions.createdAt,
      lastActivityAt: userSessions.lastActivityAt,
      isActive: userSessions.isActive
    }).from(userSessions)
      .where(eq(userSessions.userId, user.sub))
      .orderBy(desc(userSessions.lastActivityAt));

    // Group by device fingerprint and aggregate
    const deviceMap = new Map();
    sessions.forEach(session => {
      const deviceInfo = session.deviceInfo as any;
      if (!deviceInfo) return;

      const fingerprint = deviceInfo.fingerprint || 'unknown';
      if (!deviceMap.has(fingerprint)) {
        deviceMap.set(fingerprint, {
          fingerprint,
          info: {
            os: deviceInfo.os || 'Unknown',
            device: deviceInfo.device || 'Unknown Device',
            browser: deviceInfo.browser || 'Unknown',
            isMobile: deviceInfo.isMobile || false,
            isTablet: deviceInfo.isTablet || false,
            isDesktop: deviceInfo.isDesktop || true,
            browserVersion: deviceInfo.browserVersion || 'Unknown'
          },
          firstSeen: session.createdAt,
          lastSeen: session.lastActivityAt,
          count: 0
        });
      }

      const device = deviceMap.get(fingerprint);
      device.count += 1;
      if (session.lastActivityAt && session.lastActivityAt > device.lastSeen) {
        device.lastSeen = session.lastActivityAt;
      }
      if (session.createdAt && session.createdAt < device.firstSeen) {
        device.firstSeen = session.createdAt;
      }
    });

    const currentFingerprint = userData[0].lastDeviceFingerprint;
    const devices = Array.from(deviceMap.values()).map(device => ({
      ...device,
      isCurrent: device.fingerprint === currentFingerprint,
      lastSeenFormatted: new Date(device.lastSeen).toLocaleString(),
      firstSeenFormatted: new Date(device.firstSeen).toLocaleString()
    }));

    return c.json({
      devices,
      totalDevices: devices.length,
      currentDevice: currentFingerprint
    });
  } catch (error: any) {
    console.error('Error fetching device history:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

// Get user's IP/location history
app.get('/locations', authMiddleware, async (c) => {
  try {
    const user = c.get('user' as any) as any;

    // Get current user info
    const userData = await db.select({
      lastLoginIp: users.lastLoginIp
    }).from(users).where(eq(users.id, user.sub)).limit(1);

    if (userData.length === 0) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Get IP history from sessions
    const sessions = await db.select({
      ipAddress: userSessions.ipAddress,
      location: userSessions.location,
      createdAt: userSessions.createdAt,
      isActive: userSessions.isActive
    }).from(userSessions)
      .where(eq(userSessions.userId, user.sub))
      .orderBy(desc(userSessions.createdAt));

    const currentIp = userData[0].lastLoginIp;

    // Group by IP and get latest info
    const ipMap = new Map();
    sessions.forEach(session => {
      const ip = session.ipAddress || 'unknown';
      if (!ipMap.has(ip)) {
        ipMap.set(ip, {
          ip,
          info: {
            type: ip === '127.0.0.1' ? 'localhost' : (ip.startsWith('192.168.') || ip.startsWith('10.') ? 'private' : 'public'),
            range: ip === '127.0.0.1' ? '127.0.x.x' : 'unknown',
            isIPv6: ip.includes(':'),
            isPrivate: ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.'),
            isLocalhost: ip === '127.0.0.1'
          },
          timestamp: session.createdAt,
          isCurrent: ip === currentIp
        });
      }
    });

    const locations = Array.from(ipMap.values()).map(record => ({
      ...record,
      timestampFormatted: new Date(record.timestamp).toLocaleString(),
      ipType: record.info?.type || 'unknown',
      isPrivate: record.info?.isPrivate || false,
      range: record.info?.range || 'unknown'
    }));

    return c.json({
      locations,
      totalLocations: locations.length,
      currentIp: currentIp
    });
  } catch (error: any) {
    console.error('Error fetching location history:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get user's login patterns and statistics
app.get('/patterns', authMiddleware, async (c) => {
  try {
    const user = c.get('user' as any) as any;
    
    const userData = await db.select({
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt
    }).from(users).where(eq(users.id, user.sub)).limit(1);
    
    if (userData.length === 0) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    // Get login activity from activity logs
    const loginLogs = await db.select()
      .from(userActivityLogs)
      .where(
        and(
          eq(userActivityLogs.userId, user.sub),
          eq(userActivityLogs.activityType, 'login')
        )
      )
      .orderBy(desc(userActivityLogs.createdAt));

    // Get device info from sessions
    const sessions = await db.select({
      deviceInfo: userSessions.deviceInfo,
      createdAt: userSessions.createdAt
    }).from(userSessions)
      .where(eq(userSessions.userId, user.sub));

    // Calculate patterns
    const deviceTypes: Record<string, number> = {};
    const browsers: Record<string, number> = {};

    sessions.forEach(session => {
      const deviceInfo = session.deviceInfo as any;
      if (deviceInfo) {
        const device = deviceInfo.device || 'Unknown Device';
        const browser = deviceInfo.browser || 'Unknown';
        deviceTypes[device] = (deviceTypes[device] || 0) + 1;
        browsers[browser] = (browsers[browser] || 0) + 1;
      }
    });

    const lastLogin = userData[0].lastLoginAt;
    const accountAge = userData[0].createdAt;
    const daysSinceCreated = accountAge ? Math.floor((Date.now() - accountAge.getTime()) / (1000 * 60 * 60 * 24)) : 0;

    return c.json({
      totalLogins: loginLogs.length,
      accountAge: daysSinceCreated,
      browserUsage: browsers,
      deviceTypes: deviceTypes,
      lastLogin: lastLogin ? lastLogin.toISOString() : null,
      accountCreated: accountAge ? accountAge.toISOString() : null
    });
  } catch (error: any) {
    console.error('Error fetching login patterns:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get recent login activity (from activity logs)
app.get('/activity', authMiddleware, async (c) => {
  try {
    const user = c.get('user' as any) as any;
    const limit = parseInt(c.req.query('limit') || '20');
    const days = parseInt(c.req.query('days') || '30');
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const activities = await db.select({
      id: userActivityLogs.id,
      activityType: userActivityLogs.activityType,
      description: userActivityLogs.description,
      ipAddress: userActivityLogs.ipAddress,
      userAgent: userActivityLogs.userAgent,
      location: userActivityLogs.location,
      metadata: userActivityLogs.metadata,
      severity: userActivityLogs.severity,
      createdAt: userActivityLogs.createdAt
    })
    .from(userActivityLogs)
    .where(
      and(
        eq(userActivityLogs.userId, user.sub),
        gte(userActivityLogs.createdAt, startDate)
      )
    )
    .orderBy(desc(userActivityLogs.createdAt))
    .limit(limit);
    
    // Format activities with additional info
    const formattedActivities = activities.map(activity => ({
      ...activity,
      timestampFormatted: activity.createdAt ? new Date(activity.createdAt).toLocaleString() : null,
      deviceInfo: (activity.metadata as any)?.deviceInfo || null,
      ipInfo: (activity.metadata as any)?.ipInfo || null,
      isAuthenticated: (activity.metadata as any)?.authenticated || false
    }));
    
    return c.json({
      activities: formattedActivities,
      totalActivities: formattedActivities.length,
      dateRange: {
        from: startDate.toISOString(),
        to: new Date().toISOString(),
        days: days
      }
    });
  } catch (error: any) {
    console.error('Error fetching activity history:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get security summary
app.get('/security-summary', authMiddleware, async (c) => {
  try {
    const user = c.get('user' as any) as any;

    const userData = await db.select().from(users).where(eq(users.id, user.sub)).limit(1);

    if (userData.length === 0) {
      return c.json({ error: 'User not found' }, 404);
    }

    const userRecord = userData[0];

    // Get device count from sessions
    const [deviceCount] = await db.select({
      count: count()
    }).from(userSessions)
      .where(eq(userSessions.userId, user.sub));

    // Get unique IP count from sessions
    const uniqueIPs = await db.selectDistinct({
      ipAddress: userSessions.ipAddress
    }).from(userSessions)
      .where(eq(userSessions.userId, user.sub));

    // Get login count from activity logs
    const [loginCount] = await db.select({
      count: count()
    }).from(userActivityLogs)
      .where(
        and(
          eq(userActivityLogs.userId, user.sub),
          eq(userActivityLogs.activityType, 'login')
        )
      );

    // Calculate security metrics
    const totalDevices = deviceCount.count;
    const totalIPs = uniqueIPs.length;
    const totalLogins = loginCount.count;

    // Check for recent suspicious activity
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const recentSuspiciousActivity = await db.select()
      .from(userActivityLogs)
      .where(
        and(
          eq(userActivityLogs.userId, user.sub),
          eq(userActivityLogs.severity, 'high'),
          gte(userActivityLogs.createdAt, oneDayAgo)
        )
      );

    // Security score calculation (0-100)
    let securityScore = 100;

    if (totalDevices > 5) securityScore -= 10; // Many devices
    if (totalIPs > 10) securityScore -= 10; // Many IPs
    if (recentSuspiciousActivity.length > 0) securityScore -= 20; // Recent suspicious activity
    if (userRecord.failedLoginAttempts && userRecord.failedLoginAttempts > 0) securityScore -= 15; // Failed attempts
    if (!userRecord.lastLoginAt) securityScore -= 5; // Never logged in

    securityScore = Math.max(0, securityScore);

    return c.json({
      securityScore,
      summary: {
        totalDevices,
        totalIPs,
        totalLogins,
        failedLoginAttempts: userRecord.failedLoginAttempts || 0,
        isAccountLocked: userRecord.lockedUntil ? new Date(userRecord.lockedUntil) > new Date() : false,
        lastLogin: userRecord.lastLoginAt ? userRecord.lastLoginAt.toISOString() : null,
        recentSuspiciousActivities: recentSuspiciousActivity.length
      },
      recommendations: getSecurityRecommendations(securityScore, {
        totalDevices,
        totalIPs,
        failedAttempts: userRecord.failedLoginAttempts || 0,
        hasRecentSuspiciousActivity: recentSuspiciousActivity.length > 0
      })
    });
  } catch (error: any) {
    console.error('Error fetching security summary:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Helper function for security recommendations
function getSecurityRecommendations(score: number, metrics: any): string[] {
  const recommendations = [];
  
  if (score < 70) {
    recommendations.push('Your account security needs attention');
  }
  
  if (metrics.totalDevices > 5) {
    recommendations.push('Consider removing unused devices from your account');
  }
  
  if (metrics.totalIPs > 10) {
    recommendations.push('Monitor your login locations for unusual activity');
  }
  
  if (metrics.failedAttempts > 0) {
    recommendations.push('Recent failed login attempts detected - ensure your password is secure');
  }
  
  if (metrics.hasRecentSuspiciousActivity) {
    recommendations.push('Suspicious activity detected - review your recent logins');
  }
  
  if (score >= 90) {
    recommendations.push('Your account security is excellent!');
  } else if (score >= 80) {
    recommendations.push('Your account security is good');
  }
  
  return recommendations;
}

export default app;
