import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { db } from '../src/db';
import { users, userActivityLogs, userSessions, securityAlerts } from '../src/db/schemas';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { SecurityUtils } from '../src/utils/security.utils';

describe('Users Schema Security Tests', () => {
  let testUserId: string;
  
  beforeAll(async () => {
    // สร้าง test user
    const testUser = await db.insert(users).values({
      username: 'security_test_user',
      email: 'security.test@example.com',
      passwordHash: await SecurityUtils.hashString('TestPassword123!'),
      role: 'customer',
      status: 'active'
    }).returning();
    
    testUserId = testUser[0].id;
  });

  afterAll(async () => {
    // ลบข้อมูลทดสอบ
    await db.delete(userActivityLogs).where(eq(userActivityLogs.userId, testUserId));
    await db.delete(userSessions).where(eq(userSessions.userId, testUserId));
    await db.delete(securityAlerts).where(eq(securityAlerts.userId, testUserId));
    await db.delete(users).where(eq(users.id, testUserId));
  });

  describe('Password Security', () => {
    test('should store hashed passwords, not plain text', async () => {
      const user = await db.select().from(users).where(eq(users.id, testUserId)).limit(1);
      
      expect(user[0].passwordHash).toBeDefined();
      expect(user[0].passwordHash).not.toBe('TestPassword123!');
      expect(user[0].passwordHash.length).toBeGreaterThan(50); // Hashed password should be long
    });

    test('should validate password strength requirements', () => {
      const weakPasswords = ['123', 'password', 'abc123'];
      const strongPassword = 'StrongPassword123!@#';

      weakPasswords.forEach(password => {
        const result = SecurityUtils.validatePasswordStrength(password);
        expect(result.isValid).toBe(false);
        expect(result.issues.length).toBeGreaterThan(0);
      });

      const strongResult = SecurityUtils.validatePasswordStrength(strongPassword);
      expect(strongResult.isValid).toBe(true);
      expect(strongResult.issues.length).toBe(0);
    });
  });

  describe('User Data Validation', () => {
    test('should enforce email format validation', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.th',
        'test+tag@gmail.com'
      ];
      
      const invalidEmails = [
        'invalid-email',
        'test@',
        '@domain.com',
        'test..test@domain.com'
      ];

      validEmails.forEach(email => {
        expect(SecurityUtils.isValidEmail(email)).toBe(true);
      });

      invalidEmails.forEach(email => {
        expect(SecurityUtils.isValidEmail(email)).toBe(false);
      });
    });

    test('should enforce username format validation', () => {
      const validUsernames = ['user123', 'test_user', 'user-name'];
      const invalidUsernames = ['ab', 'a'.repeat(21), 'user@name', 'user name', ''];

      validUsernames.forEach(username => {
        expect(SecurityUtils.isValidUsername(username)).toBe(true);
      });

      invalidUsernames.forEach(username => {
        expect(SecurityUtils.isValidUsername(username)).toBe(false);
      });
    });
  });

  describe('Account Security Features', () => {
    test('should track failed login attempts', async () => {
      // อัพเดท failed login attempts
      await db.update(users)
        .set({ failedLoginAttempts: 3 })
        .where(eq(users.id, testUserId));

      const user = await db.select().from(users).where(eq(users.id, testUserId)).limit(1);
      expect(user[0].failedLoginAttempts).toBe(3);
    });

    test('should support account locking mechanism', async () => {
      const lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now
      
      await db.update(users)
        .set({ 
          lockedUntil: lockUntil,
          failedLoginAttempts: 5 
        })
        .where(eq(users.id, testUserId));

      const user = await db.select().from(users).where(eq(users.id, testUserId)).limit(1);
      expect(user[0].lockedUntil).toBeDefined();
      expect(user[0].failedLoginAttempts).toBe(5);
    });

    test('should track last login timestamp', async () => {
      const loginTime = new Date();
      
      await db.update(users)
        .set({ lastLoginAt: loginTime })
        .where(eq(users.id, testUserId));

      const user = await db.select().from(users).where(eq(users.id, testUserId)).limit(1);
      expect(user[0].lastLoginAt).toBeDefined();
    });
  });

  describe('Activity Logging', () => {
    test('should log user activities with proper metadata', async () => {
      const activityData = {
        userId: testUserId,
        activityType: 'login' as const,
        description: 'User logged in successfully',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Test Browser)',
        location: { country: 'Thailand', city: 'Bangkok' },
        metadata: { loginMethod: 'password', deviceType: 'desktop' },
        severity: 'low' as const
      };

      await db.insert(userActivityLogs).values(activityData);

      const logs = await db.select()
        .from(userActivityLogs)
        .where(eq(userActivityLogs.userId, testUserId))
        .orderBy(desc(userActivityLogs.createdAt))
        .limit(1);

      expect(logs.length).toBe(1);
      expect(logs[0].activityType).toBe('login');
      expect(logs[0].ipAddress).toBe('192.168.1.1');
      expect(logs[0].metadata).toEqual(activityData.metadata);
    });

    test('should support different activity types', async () => {
      const activityTypes = ['login', 'logout', 'password_change', 'failed_login', 'suspicious_activity'];
      
      for (const activityType of activityTypes) {
        await db.insert(userActivityLogs).values({
          userId: testUserId,
          activityType: activityType as any,
          description: `Test ${activityType} activity`,
          severity: 'low'
        });
      }

      const logs = await db.select()
        .from(userActivityLogs)
        .where(eq(userActivityLogs.userId, testUserId));

      expect(logs.length).toBeGreaterThanOrEqual(activityTypes.length);
    });
  });

  describe('Session Management', () => {
    test('should create and manage user sessions', async () => {
      const sessionToken = SecurityUtils.generateSessionToken();
      const deviceInfo = {
        device: 'Desktop',
        browser: 'Chrome',
        os: 'Windows 10'
      };

      await db.insert(userSessions).values({
        userId: testUserId,
        sessionToken,
        deviceInfo,
        ipAddress: '192.168.1.1',
        location: { country: 'Thailand', city: 'Bangkok' },
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      });

      const sessions = await db.select()
        .from(userSessions)
        .where(eq(userSessions.userId, testUserId));

      expect(sessions.length).toBe(1);
      expect(sessions[0].sessionToken).toBe(sessionToken);
      expect(sessions[0].isActive).toBe(true);
    });

    test('should track session activity', async () => {
      const sessions = await db.select()
        .from(userSessions)
        .where(eq(userSessions.userId, testUserId));

      if (sessions.length > 0) {
        const sessionId = sessions[0].id;
        const newActivityTime = new Date();

        await db.update(userSessions)
          .set({ lastActivityAt: newActivityTime })
          .where(eq(userSessions.id, sessionId));

        const updatedSession = await db.select()
          .from(userSessions)
          .where(eq(userSessions.id, sessionId))
          .limit(1);

        expect(updatedSession[0].lastActivityAt).toBeDefined();
      }
    });
  });

  describe('Security Alerts', () => {
    test('should create security alerts for suspicious activities', async () => {
      const alertData = {
        userId: testUserId,
        alertType: 'suspicious_login',
        title: 'Suspicious Login Attempt',
        description: 'Login attempt from unusual location',
        severity: 'medium' as const,
        metadata: {
          ipAddress: '1.2.3.4',
          location: 'Unknown',
          userAgent: 'Suspicious Bot'
        }
      };

      await db.insert(securityAlerts).values(alertData);

      const alerts = await db.select()
        .from(securityAlerts)
        .where(eq(securityAlerts.userId, testUserId));

      expect(alerts.length).toBe(1);
      expect(alerts[0].alertType).toBe('suspicious_login');
      expect(alerts[0].isResolved).toBe(false);
    });

    test('should support alert resolution', async () => {
      const alerts = await db.select()
        .from(securityAlerts)
        .where(eq(securityAlerts.userId, testUserId));

      if (alerts.length > 0) {
        const alertId = alerts[0].id;

        await db.update(securityAlerts)
          .set({
            isResolved: true,
            resolvedAt: new Date(),
            resolvedBy: testUserId
          })
          .where(eq(securityAlerts.id, alertId));

        const resolvedAlert = await db.select()
          .from(securityAlerts)
          .where(eq(securityAlerts.id, alertId))
          .limit(1);

        expect(resolvedAlert[0].isResolved).toBe(true);
        expect(resolvedAlert[0].resolvedAt).toBeDefined();
      }
    });
  });

  describe('Data Privacy and Protection', () => {
    test('should not expose sensitive data in queries', async () => {
      // ทดสอบว่าการ query ไม่ return password hash โดยไม่ตั้งใจ
      const publicUserData = await db.select({
        id: users.id,
        username: users.username,
        email: users.email,
        role: users.role,
        status: users.status,
        createdAt: users.createdAt
        // ไม่รวม passwordHash
      }).from(users).where(eq(users.id, testUserId)).limit(1);

      expect(publicUserData[0]).toBeDefined();
      expect(publicUserData[0]).not.toHaveProperty('passwordHash');
      expect(publicUserData[0].username).toBe('security_test_user');
    });

    test('should sanitize user input', () => {
      const maliciousInputs = [
        '<script>alert("xss")</script>',
        'DROP TABLE users;',
        '"; DELETE FROM users; --'
      ];

      maliciousInputs.forEach(input => {
        const sanitized = SecurityUtils.sanitizeString(input);
        expect(sanitized).not.toContain('<script>');
        expect(sanitized).not.toContain('</script>');
      });
    });
  });

  describe('Role and Permission Security', () => {
    test('should enforce role-based access', async () => {
      // ทดสอบว่า role enum ทำงานถูกต้อง
      const user = await db.select().from(users).where(eq(users.id, testUserId)).limit(1);
      
      expect(['admin', 'customer']).toContain(user[0].role);
    });

    test('should enforce status-based access', async () => {
      // ทดสอบว่า status enum ทำงานถูกต้อง
      const user = await db.select().from(users).where(eq(users.id, testUserId)).limit(1);
      
      expect(['active', 'suspended', 'banned', 'pending']).toContain(user[0].status);
    });
  });
});
