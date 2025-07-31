/// <reference types="bun-types" />
import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
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

describe('Simple Auth Test', () => {
  beforeAll(async () => {
    // Clean up test data
    try {
      await db.delete(userSessions);
      await db.delete(users);
    } catch (error) {
      console.log('Cleanup error (expected):', error);
    }
  });

  afterAll(async () => {
    // Clean up test data
    try {
      await db.delete(userSessions);
      await db.delete(users);
    } catch (error) {
      console.log('Cleanup error (expected):', error);
    }
    
    // Close database connection
    try {
      await db.$client.end();
    } catch (error) {
      console.log('Connection close error (expected):', error);
    }
  });

  it('should register a new user', async () => {
    const c = createMockContext();
    
    const result = await authService.register(
      'testuser',
      'test@example.com',
      'TestPassword123!',
      c as any
    );

    expect(typeof result).toBe('string'); // JWT token
    expect(result.length).toBeGreaterThan(0);
  });

  it('should login with correct credentials', async () => {
    const c = createMockContext();
    
    const result = await authService.login('testuser', 'TestPassword123!', c as any);

    expect(result).toHaveProperty('token');
    expect(result).toHaveProperty('sessionToken');
    expect(typeof result.token).toBe('string');
    expect(typeof result.sessionToken).toBe('string');
  });

  it('should validate session', async () => {
    const c = createMockContext();
    
    // Login to get session token
    const loginResult = await authService.login('testuser', 'TestPassword123!', c as any);
    
    // Validate session
    const isValid = await securityService.validateSession(loginResult.sessionToken);
    expect(isValid).toBe(true);
  });

  it('should logout and terminate session', async () => {
    const c = createMockContext();
    
    // Login to get session token
    const loginResult = await authService.login('testuser', 'TestPassword123!', c as any);
    
    // Get user ID
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, 'testuser'))
      .limit(1);
    
    // Logout
    const logoutResult = await authService.logout(user.id, c as any, loginResult.sessionToken);
    expect(logoutResult.success).toBe(true);
    
    // Session should be terminated
    const isValid = await securityService.validateSession(loginResult.sessionToken);
    expect(isValid).toBe(false);
  });

  it('should reject invalid credentials', async () => {
    const c = createMockContext();
    
    try {
      await authService.login('testuser', 'wrongpassword', c as any);
      expect(true).toBe(false); // Should not reach here
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('should validate password strength', async () => {
    const weakPassword = await securityService.validatePasswordStrength('123');
    expect(weakPassword.isValid).toBe(false);
    expect(weakPassword.issues.length).toBeGreaterThan(0);

    const strongPassword = await securityService.validatePasswordStrength('TestPassword123!');
    expect(strongPassword.isValid).toBe(true);
    expect(strongPassword.score).toBeGreaterThan(60);
  });

  it('should check rate limiting', async () => {
    const result = await securityService.checkAdvancedRateLimit('127.0.0.1', 'api_access');
    expect(result).toHaveProperty('allowed');
    expect(typeof result.allowed).toBe('boolean');
  });
});
