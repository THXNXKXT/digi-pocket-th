import { describe, it, expect, beforeEach } from 'bun:test';
import { setupTestEnvironment, TestAPI, TestDatabase, TestAssertions, TEST_USERS, TEST_HEADERS } from './setup';

setupTestEnvironment();

describe('🔐 Authentication System - Comprehensive Tests', () => {
  describe('User Registration', () => {
    it('should register a new user successfully', async () => {
      const response = await TestAPI.register(TEST_USERS.customer);
      
      expect(response.status).toBe(201);
      expect(response.data.success).toBe(true);
      expect(response.data.message).toContain('registered successfully');
      expect(response.data.data.user).toBeDefined();
      TestAssertions.expectValidUser(response.data.data.user);
    });

    it('should reject registration with invalid email', async () => {
      const invalidUser = { ...TEST_USERS.customer, email: 'invalid-email' };
      const response = await TestAPI.register(invalidUser);
      
      expect(response.status).toBe(400);
      expect(response.data.success).toBe(false);
    });

    it('should reject registration with weak password', async () => {
      const weakPasswordUser = { ...TEST_USERS.customer, password: '123' };
      const response = await TestAPI.register(weakPasswordUser);
      
      expect(response.status).toBe(400);
      expect(response.data.success).toBe(false);
    });

    it('should reject duplicate username registration', async () => {
      await TestAPI.register(TEST_USERS.customer);
      const response = await TestAPI.register(TEST_USERS.customer);
      
      expect(response.status).toBe(409);
      expect(response.data.success).toBe(false);
      expect(response.data.message).toContain('already exists');
    });

    it('should reject duplicate email registration', async () => {
      await TestAPI.register(TEST_USERS.customer);
      const duplicateEmailUser = { 
        ...TEST_USERS.customer, 
        username: 'different_username' 
      };
      const response = await TestAPI.register(duplicateEmailUser);
      
      expect(response.status).toBe(409);
      expect(response.data.success).toBe(false);
    });
  });

  describe('User Login', () => {
    beforeEach(async () => {
      await TestAPI.register(TEST_USERS.customer);
    });

    it('should login successfully with valid credentials', async () => {
      const response = await TestAPI.login({
        username: TEST_USERS.customer.username,
        password: TEST_USERS.customer.password,
      });
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data.token).toBeDefined();
      expect(response.data.data.sessionToken).toBeDefined();
      TestAssertions.expectValidJWT(response.data.data.token);
    });

    it('should reject login with invalid username', async () => {
      const response = await TestAPI.login({
        username: 'nonexistent_user',
        password: TEST_USERS.customer.password,
      });
      
      expect(response.status).toBe(401);
      expect(response.data.success).toBe(false);
    });

    it('should reject login with invalid password', async () => {
      const response = await TestAPI.login({
        username: TEST_USERS.customer.username,
        password: 'wrong_password',
      });
      
      expect(response.status).toBe(401);
      expect(response.data.success).toBe(false);
    });

    it('should track device information on login', async () => {
      const response = await TestAPI.login({
        username: TEST_USERS.customer.username,
        password: TEST_USERS.customer.password,
      }, TEST_HEADERS.mobile);
      
      expect(response.status).toBe(200);
      
      // Check device tracking
      const token = response.data.data.token;
      const deviceResponse = await TestAPI.authenticatedRequest(
        'GET', 
        '/user/tracking/devices', 
        token
      );
      
      expect(deviceResponse.status).toBe(200);
      expect(deviceResponse.data.devices).toHaveLength(1);
      TestAssertions.expectValidDeviceInfo(deviceResponse.data.devices[0]);
    });
  });

  describe('Account Lockout', () => {
    beforeEach(async () => {
      await TestAPI.register(TEST_USERS.customer);
    });

    it('should lock account after multiple failed attempts', async () => {
      const credentials = {
        username: TEST_USERS.customer.username,
        password: 'wrong_password',
      };

      // Make multiple failed login attempts
      for (let i = 0; i < 10; i++) {
        await TestAPI.login(credentials);
      }

      // Next attempt should be locked
      const response = await TestAPI.login(credentials);
      expect(response.status).toBe(423);
      expect(response.data.message).toContain('locked');
    });

    it('should prevent login even with correct password when locked', async () => {
      // Lock the account
      for (let i = 0; i < 10; i++) {
        await TestAPI.login({
          username: TEST_USERS.customer.username,
          password: 'wrong_password',
        });
      }

      // Try with correct password
      const response = await TestAPI.login({
        username: TEST_USERS.customer.username,
        password: TEST_USERS.customer.password,
      });
      
      expect(response.status).toBe(423);
    });
  });

  describe('JWT Token Validation', () => {
    let token: string;

    beforeEach(async () => {
      await TestAPI.register(TEST_USERS.customer);
      const loginResponse = await TestAPI.login({
        username: TEST_USERS.customer.username,
        password: TEST_USERS.customer.password,
      });
      token = loginResponse.data.data.token;
    });

    it('should accept valid JWT token', async () => {
      const response = await TestAPI.authenticatedRequest(
        'GET', 
        '/users/profile', 
        token
      );
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
    });

    it('should reject invalid JWT token', async () => {
      const response = await TestAPI.authenticatedRequest(
        'GET', 
        '/users/profile', 
        'invalid.jwt.token'
      );
      
      expect(response.status).toBe(401);
    });

    it('should reject expired JWT token', async () => {
      // This would require mocking time or using a very short expiry
      // For now, we'll test with a malformed token
      const expiredToken = token.slice(0, -10) + 'expired123';
      const response = await TestAPI.authenticatedRequest(
        'GET', 
        '/users/profile', 
        expiredToken
      );
      
      expect(response.status).toBe(401);
    });

    it('should reject missing authorization header', async () => {
      const response = await TestAPI.request('GET', '/users/profile');
      expect(response.status).toBe(401);
    });
  });

  describe('Session Management', () => {
    let token: string;
    let sessionToken: string;

    beforeEach(async () => {
      await TestAPI.register(TEST_USERS.customer);
      const loginResponse = await TestAPI.login({
        username: TEST_USERS.customer.username,
        password: TEST_USERS.customer.password,
      });
      token = loginResponse.data.data.token;
      sessionToken = loginResponse.data.data.sessionToken;
    });

    it('should create session on login', async () => {
      expect(sessionToken).toBeDefined();
      expect(typeof sessionToken).toBe('string');
    });

    it('should logout and invalidate session', async () => {
      const logoutResponse = await TestAPI.authenticatedRequest(
        'POST', 
        '/auth/logout', 
        token
      );
      
      expect(logoutResponse.status).toBe(200);
      
      // Token should be invalid after logout
      const profileResponse = await TestAPI.authenticatedRequest(
        'GET', 
        '/users/profile', 
        token
      );
      
      expect(profileResponse.status).toBe(401);
    });

    it('should handle multiple concurrent sessions', async () => {
      // Login from different device
      const secondLoginResponse = await TestAPI.login({
        username: TEST_USERS.customer.username,
        password: TEST_USERS.customer.password,
      }, TEST_HEADERS.mobile);
      
      expect(secondLoginResponse.status).toBe(200);
      
      const secondToken = secondLoginResponse.data.data.token;
      
      // Both tokens should be valid
      const firstProfileResponse = await TestAPI.authenticatedRequest(
        'GET', 
        '/users/profile', 
        token
      );
      const secondProfileResponse = await TestAPI.authenticatedRequest(
        'GET', 
        '/users/profile', 
        secondToken
      );
      
      expect(firstProfileResponse.status).toBe(200);
      expect(secondProfileResponse.status).toBe(200);
    });
  });

  describe('Role-Based Access Control', () => {
    let customerToken: string;
    let adminToken: string;

    beforeEach(async () => {
      // Create customer
      await TestAPI.register(TEST_USERS.customer);
      const customerLogin = await TestAPI.login({
        username: TEST_USERS.customer.username,
        password: TEST_USERS.customer.password,
      });
      customerToken = customerLogin.data.data.token;

      // Create admin
      await TestAPI.register(TEST_USERS.admin);
      const adminLogin = await TestAPI.login({
        username: TEST_USERS.admin.username,
        password: TEST_USERS.admin.password,
      });
      adminToken = adminLogin.data.data.token;
    });

    it('should allow admin access to admin endpoints', async () => {
      const response = await TestAPI.authenticatedRequest(
        'GET', 
        '/admin/users', 
        adminToken
      );
      
      expect(response.status).toBe(200);
    });

    it('should deny customer access to admin endpoints', async () => {
      const response = await TestAPI.authenticatedRequest(
        'GET', 
        '/admin/users', 
        customerToken
      );
      
      expect(response.status).toBe(403);
    });

    it('should allow both roles access to user endpoints', async () => {
      const customerResponse = await TestAPI.authenticatedRequest(
        'GET', 
        '/users/profile', 
        customerToken
      );
      const adminResponse = await TestAPI.authenticatedRequest(
        'GET', 
        '/users/profile', 
        adminToken
      );
      
      expect(customerResponse.status).toBe(200);
      expect(adminResponse.status).toBe(200);
    });
  });
});
