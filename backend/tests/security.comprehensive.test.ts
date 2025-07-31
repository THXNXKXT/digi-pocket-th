import { describe, it, expect, beforeEach } from 'bun:test';
import { setupTestEnvironment, TestAPI, TestDatabase, TEST_USERS, TEST_HEADERS } from './setup';

setupTestEnvironment();

describe('🛡️ Security System - Comprehensive Tests', () => {
  let adminToken: string;
  let customerToken: string;

  beforeEach(async () => {
    // Create admin user
    await TestAPI.register(TEST_USERS.admin);
    const adminLogin = await TestAPI.login({
      username: TEST_USERS.admin.username,
      password: TEST_USERS.admin.password,
    });
    adminToken = adminLogin.data.data.token;

    // Create customer user
    await TestAPI.register(TEST_USERS.customer);
    const customerLogin = await TestAPI.login({
      username: TEST_USERS.customer.username,
      password: TEST_USERS.customer.password,
    });
    customerToken = customerLogin.data.data.token;
  });

  describe('Input Validation & Sanitization', () => {
    it('should reject SQL injection attempts in login', async () => {
      const sqlInjectionAttempts = [
        "admin'; DROP TABLE users; --",
        "admin' OR '1'='1",
        "admin' UNION SELECT * FROM users --",
        "'; DELETE FROM users WHERE '1'='1",
      ];

      for (const maliciousInput of sqlInjectionAttempts) {
        const response = await TestAPI.login({
          username: maliciousInput,
          password: 'password',
        });

        expect(response.status).toBe(401);
        expect(response.data.success).toBe(false);
      }
    });

    it('should reject XSS attempts in registration', async () => {
      const xssAttempts = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        '<img src="x" onerror="alert(1)">',
        '"><script>alert("xss")</script>',
      ];

      for (const maliciousInput of xssAttempts) {
        const response = await TestAPI.register({
          username: maliciousInput,
          email: 'test@example.com',
          password: 'ValidPassword123!',
          role: 'customer',
        });

        expect(response.status).toBe(400);
        expect(response.data.success).toBe(false);
      }
    });

    it('should validate email format strictly', async () => {
      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'user@',
        'user..name@domain.com',
        'user@domain',
        'user@.domain.com',
      ];

      for (const invalidEmail of invalidEmails) {
        const response = await TestAPI.register({
          username: 'testuser',
          email: invalidEmail,
          password: 'ValidPassword123!',
          role: 'customer',
        });

        expect(response.status).toBe(400);
        expect(response.data.success).toBe(false);
      }
    });

    it('should enforce strong password requirements', async () => {
      const weakPasswords = [
        '123456',
        'password',
        'abc123',
        'Password',
        'password123',
        'PASSWORD123',
        'Pass123',
      ];

      for (const weakPassword of weakPasswords) {
        const response = await TestAPI.register({
          username: 'testuser',
          email: 'test@example.com',
          password: weakPassword,
          role: 'customer',
        });

        expect(response.status).toBe(400);
        expect(response.data.success).toBe(false);
      }
    });
  });

  describe('Rate Limiting', () => {
    it('should rate limit login attempts', async () => {
      const credentials = {
        username: 'nonexistent',
        password: 'password',
      };

      // Make many rapid requests
      const promises = Array(50).fill(null).map(() => 
        TestAPI.login(credentials)
      );

      const responses = await Promise.all(promises);
      
      // Some requests should be rate limited
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });

    it('should rate limit registration attempts', async () => {
      const promises = Array(30).fill(null).map((_, i) => 
        TestAPI.register({
          username: `user${i}`,
          email: `user${i}@example.com`,
          password: 'ValidPassword123!',
          role: 'customer',
        })
      );

      const responses = await Promise.all(promises);
      
      // Some requests should be rate limited
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });

    it('should rate limit API requests per user', async () => {
      const promises = Array(50).fill(null).map(() => 
        TestAPI.authenticatedRequest('GET', '/users/profile', customerToken)
      );

      const responses = await Promise.all(promises);
      
      // Some requests should be rate limited
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('Account Security', () => {
    it('should lock account after failed login attempts', async () => {
      const credentials = {
        username: TEST_USERS.customer.username,
        password: 'wrong_password',
      };

      // Make multiple failed attempts
      for (let i = 0; i < 10; i++) {
        await TestAPI.login(credentials);
      }

      // Account should be locked
      const response = await TestAPI.login({
        username: TEST_USERS.customer.username,
        password: TEST_USERS.customer.password, // Correct password
      });

      expect(response.status).toBe(423);
      expect(response.data.message).toContain('locked');
    });

    it('should allow admin to unlock accounts', async () => {
      // Lock the customer account
      for (let i = 0; i < 10; i++) {
        await TestAPI.login({
          username: TEST_USERS.customer.username,
          password: 'wrong_password',
        });
      }

      // Admin unlocks the account
      const unlockResponse = await TestAPI.authenticatedRequest(
        'POST',
        '/admin/security/unlock-account',
        adminToken,
        {
          body: { username: TEST_USERS.customer.username },
        }
      );

      expect(unlockResponse.status).toBe(200);

      // Customer should be able to login now
      const loginResponse = await TestAPI.login({
        username: TEST_USERS.customer.username,
        password: TEST_USERS.customer.password,
      });

      expect(loginResponse.status).toBe(200);
    });

    it('should track failed login attempts', async () => {
      // Make some failed attempts
      for (let i = 0; i < 3; i++) {
        await TestAPI.login({
          username: TEST_USERS.customer.username,
          password: 'wrong_password',
        });
      }

      // Check security summary
      const securityResponse = await TestAPI.authenticatedRequest(
        'GET',
        '/user/tracking/security-summary',
        customerToken
      );

      expect(securityResponse.status).toBe(200);
      expect(securityResponse.data.riskFactors.recentFailedLogins).toBeGreaterThan(0);
    });
  });

  describe('Session Security', () => {
    it('should invalidate sessions on logout', async () => {
      // Logout
      const logoutResponse = await TestAPI.authenticatedRequest(
        'POST',
        '/auth/logout',
        customerToken
      );

      expect(logoutResponse.status).toBe(200);

      // Token should be invalid
      const profileResponse = await TestAPI.authenticatedRequest(
        'GET',
        '/users/profile',
        customerToken
      );

      expect(profileResponse.status).toBe(401);
    });

    it('should detect suspicious login patterns', async () => {
      // Login from suspicious source
      const suspiciousLogin = await TestAPI.login({
        username: TEST_USERS.customer.username,
        password: TEST_USERS.customer.password,
      }, TEST_HEADERS.suspicious);

      expect(suspiciousLogin.status).toBe(200);

      // Check for security alerts
      const securityResponse = await TestAPI.authenticatedRequest(
        'GET',
        '/user/tracking/security-summary',
        customerToken
      );

      expect(securityResponse.status).toBe(200);
      // Should have some security recommendations
      expect(securityResponse.data.recommendations.length).toBeGreaterThan(0);
    });

    it('should track concurrent sessions', async () => {
      // Login from multiple devices
      const desktopLogin = await TestAPI.login({
        username: TEST_USERS.customer.username,
        password: TEST_USERS.customer.password,
      }, TEST_HEADERS.desktop);

      const mobileLogin = await TestAPI.login({
        username: TEST_USERS.customer.username,
        password: TEST_USERS.customer.password,
      }, TEST_HEADERS.mobile);

      expect(desktopLogin.status).toBe(200);
      expect(mobileLogin.status).toBe(200);

      // Check device tracking
      const deviceResponse = await TestAPI.authenticatedRequest(
        'GET',
        '/user/tracking/devices',
        customerToken
      );

      expect(deviceResponse.status).toBe(200);
      expect(deviceResponse.data.devices.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Admin Security Features', () => {
    it('should allow admin to view security configuration', async () => {
      const response = await TestAPI.authenticatedRequest(
        'GET',
        '/admin/security/config',
        adminToken
      );

      expect(response.status).toBe(200);
      expect(response.data.config).toBeDefined();
      expect(response.data.config.maxFailedAttempts).toBeDefined();
      expect(response.data.config.lockoutDuration).toBeDefined();
    });

    it('should allow admin to update security configuration', async () => {
      const newConfig = {
        maxFailedAttempts: 3,
        lockoutDuration: 5,
      };

      const response = await TestAPI.authenticatedRequest(
        'PUT',
        '/admin/security/config',
        adminToken,
        { body: newConfig }
      );

      expect(response.status).toBe(200);
      expect(response.data.maxFailedAttempts).toBe(3);
      expect(response.data.lockoutDuration).toBe(5);
    });

    it('should deny customer access to admin security endpoints', async () => {
      const configResponse = await TestAPI.authenticatedRequest(
        'GET',
        '/admin/security/config',
        customerToken
      );

      const updateResponse = await TestAPI.authenticatedRequest(
        'PUT',
        '/admin/security/config',
        customerToken,
        { body: { maxFailedAttempts: 1 } }
      );

      expect(configResponse.status).toBe(403);
      expect(updateResponse.status).toBe(403);
    });

    it('should allow admin to lock user accounts', async () => {
      const lockResponse = await TestAPI.authenticatedRequest(
        'POST',
        '/admin/security/lock-account',
        adminToken,
        {
          body: { 
            username: TEST_USERS.customer.username,
            reason: 'Security test'
          },
        }
      );

      expect(lockResponse.status).toBe(200);

      // Customer should not be able to login
      const loginResponse = await TestAPI.login({
        username: TEST_USERS.customer.username,
        password: TEST_USERS.customer.password,
      });

      expect(loginResponse.status).toBe(423);
    });
  });

  describe('Data Protection', () => {
    it('should not expose sensitive data in API responses', async () => {
      const profileResponse = await TestAPI.authenticatedRequest(
        'GET',
        '/users/profile',
        customerToken
      );

      expect(profileResponse.status).toBe(200);
      expect(profileResponse.data.data.passwordHash).toBeUndefined();
      expect(profileResponse.data.data.password).toBeUndefined();
    });

    it('should hash passwords securely', async () => {
      // This is tested indirectly by ensuring we can login with the correct password
      // but the password hash is never exposed
      const loginResponse = await TestAPI.login({
        username: TEST_USERS.customer.username,
        password: TEST_USERS.customer.password,
      });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.data.data.password).toBeUndefined();
      expect(loginResponse.data.data.passwordHash).toBeUndefined();
    });

    it('should validate authorization for user-specific data', async () => {
      // Create second customer
      await TestAPI.register(TEST_USERS.customer2);
      const customer2Login = await TestAPI.login({
        username: TEST_USERS.customer2.username,
        password: TEST_USERS.customer2.password,
      });
      const customer2Token = customer2Login.data.data.token;

      // Customer 1 should not access Customer 2's data
      const deviceResponse = await TestAPI.authenticatedRequest(
        'GET',
        '/user/tracking/devices',
        customer2Token
      );

      expect(deviceResponse.status).toBe(200);
      // Should only see their own devices
      expect(deviceResponse.data.devices.length).toBeLessThanOrEqual(1);
    });
  });
});
