/// <reference types="bun-types" />
import { describe, it, expect, beforeEach, afterEach, afterAll } from 'bun:test';
import { authService } from '../src/services/auth.service';
import { securityService } from '../src/services/security.service';
import { db } from '../src/db';
import { users, userSessions } from '../src/db/schemas';
import { eq } from 'drizzle-orm';

// Mock context
const createMockContext = () => ({
  req: {
    header: (name: string) => {
      const headers: Record<string, string> = {
        'user-agent': 'Test Browser',
        'x-forwarded-for': '127.0.0.1',
      };
      return headers[name];
    },
    path: '/test',
    method: 'POST',
  },
});

describe('Enhanced Auth System', () => {
  let testUserId: string;
  let testSessionToken: string;

  beforeEach(async () => {
    // Clean up test data
    await db.delete(userSessions);
    await db.delete(users);
  });

  afterEach(async () => {
    // Clean up test data
    await db.delete(userSessions);
    await db.delete(users);
  });

  afterAll(async () => {
    // Close database connection
    await db.$client.end();
  });

  describe('User Registration', () => {
    it('should register a new user successfully', async () => {
      const c = createMockContext();
      
      const result = await authService.register(
        'testuser',
        'test@example.com',
        'TestPassword123!',
        c as any
      );

      expect(typeof result).toBe('string'); // JWT token
      expect(result.length).toBeGreaterThan(0);

      // Verify user was created
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.username, 'testuser'))
        .limit(1);

      expect(user).toBeDefined();
      expect(user.email).toBe('test@example.com');
      expect(user.status).toBe('active');
    });

    it('should reject duplicate username', async () => {
      const c = createMockContext();
      
      // Create first user
      await authService.register('testuser', 'test1@example.com', 'TestPassword123!', c as any);

      // Try to create duplicate
      expect(async () => {
        await authService.register('testuser', 'test2@example.com', 'TestPassword123!', c as any);
      }).toThrow();
    });
  });

  describe('User Login with Sessions', () => {
    beforeEach(async () => {
      const c = createMockContext();
      await authService.register('testuser', 'test@example.com', 'TestPassword123!', c as any);
      
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.username, 'testuser'))
        .limit(1);
      
      testUserId = user.id;
    });

    it('should login successfully and create session', async () => {
      const c = createMockContext();
      
      const result = await authService.login('testuser', 'TestPassword123!', c as any);

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('sessionToken');
      expect(typeof result.token).toBe('string');
      expect(typeof result.sessionToken).toBe('string');

      testSessionToken = result.sessionToken;

      // Verify session was created
      const [session] = await db
        .select()
        .from(userSessions)
        .where(eq(userSessions.sessionToken, result.sessionToken))
        .limit(1);

      expect(session).toBeDefined();
      expect(session.userId).toBe(testUserId);
      expect(session.isActive).toBe(true);
    });

    it('should reject invalid credentials', async () => {
      const c = createMockContext();
      
      expect(async () => {
        await authService.login('testuser', 'wrongpassword', c as any);
      }).toThrow();
    });

    it('should lock account after failed attempts', async () => {
      const c = createMockContext();
      
      // Configure security for testing
      securityService.updateConfig({ maxFailedAttempts: 3 });

      // Make failed attempts
      for (let i = 0; i < 3; i++) {
        try {
          await authService.login('testuser', 'wrongpassword', c as any);
        } catch (error) {
          // Expected to fail
        }
      }

      // Check if account is locked
      const isLocked = await securityService.checkAccountLockout(testUserId);
      expect(isLocked).toBe(true);

      // Should not be able to login even with correct password
      expect(async () => {
        await authService.login('testuser', 'TestPassword123!', c as any);
      }).toThrow();
    });
  });

  describe('Session Management', () => {
    beforeEach(async () => {
      const c = createMockContext();
      await authService.register('testuser', 'test@example.com', 'TestPassword123!', c as any);
      
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.username, 'testuser'))
        .limit(1);
      
      testUserId = user.id;
      testSessionToken = await securityService.createSession(testUserId, c as any);
    });

    it('should validate active session', async () => {
      const isValid = await securityService.validateSession(testSessionToken);
      expect(isValid).toBe(true);
    });

    it('should reject invalid session token', async () => {
      const isValid = await securityService.validateSession('invalid-token');
      expect(isValid).toBe(false);
    });

    it('should terminate session', async () => {
      await securityService.terminateSession(testSessionToken);
      
      const isValid = await securityService.validateSession(testSessionToken);
      expect(isValid).toBe(false);
    });

    it('should terminate all user sessions', async () => {
      const c = createMockContext();
      
      // Create multiple sessions
      const session2 = await securityService.createSession(testUserId, c as any);
      const session3 = await securityService.createSession(testUserId, c as any);

      // Terminate all sessions
      await securityService.terminateAllUserSessions(testUserId);

      // All sessions should be invalid
      expect(await securityService.validateSession(testSessionToken)).toBe(false);
      expect(await securityService.validateSession(session2)).toBe(false);
      expect(await securityService.validateSession(session3)).toBe(false);
    });
  });

  describe('Security Features', () => {
    beforeEach(async () => {
      const c = createMockContext();
      await authService.register('testuser', 'test@example.com', 'TestPassword123!', c as any);
      
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.username, 'testuser'))
        .limit(1);
      
      testUserId = user.id;
    });

    it('should detect suspicious activity', async () => {
      const c = createMockContext();
      
      const isSuspicious = await securityService.detectSuspiciousActivity(testUserId, c as any);
      expect(typeof isSuspicious).toBe('boolean');
    });

    it('should enforce rate limiting', async () => {
      const c = createMockContext();
      
      // Configure strict rate limiting for testing
      securityService.updateConfig({ 
        rateLimitWindow: 1, 
        maxRequestsPerWindow: 2 
      });

      // First request should pass
      const result1 = await securityService.checkAdvancedRateLimit('127.0.0.1', 'test_action');
      expect(result1.allowed).toBe(true);

      // Simulate requests
      await securityService.enforceRateLimit('127.0.0.1', 'test_action', c as any);
      await securityService.enforceRateLimit('127.0.0.1', 'test_action', c as any);

      // Third request should be rate limited
      expect(async () => {
        await securityService.enforceRateLimit('127.0.0.1', 'test_action', c as any);
      }).toThrow();
    });

    it('should clean up expired sessions', async () => {
      const c = createMockContext();
      
      // Create session with past expiry
      const expiredSession = await db.insert(userSessions).values({
        userId: testUserId,
        sessionToken: 'expired-session',
        expiresAt: new Date(Date.now() - 1000), // 1 second ago
        deviceInfo: {},
        ipAddress: '127.0.0.1',
      }).returning();

      const cleanedCount = await securityService.cleanupExpiredSessions();
      expect(cleanedCount).toBeGreaterThan(0);

      // Expired session should be inactive
      const isValid = await securityService.validateSession('expired-session');
      expect(isValid).toBe(false);
    });
  });

  describe('Logout', () => {
    beforeEach(async () => {
      const c = createMockContext();
      const result = await authService.register('testuser', 'test@example.com', 'TestPassword123!', c as any);
      
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.username, 'testuser'))
        .limit(1);
      
      testUserId = user.id;
      
      const loginResult = await authService.login('testuser', 'TestPassword123!', c as any);
      testSessionToken = loginResult.sessionToken;
    });

    it('should logout and terminate session', async () => {
      const c = createMockContext();
      
      const result = await authService.logout(testUserId, c as any, testSessionToken);
      expect(result.success).toBe(true);

      // Session should be terminated
      const isValid = await securityService.validateSession(testSessionToken);
      expect(isValid).toBe(false);
    });
  });
});
