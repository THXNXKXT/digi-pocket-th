import { describe, it, expect, beforeEach } from 'bun:test';
import { setupTestEnvironment, TestAPI, TestAssertions, TEST_USERS, TEST_HEADERS } from './setup';

setupTestEnvironment();

describe('📱 Device Tracking System - Comprehensive Tests', () => {
  let userToken: string;

  beforeEach(async () => {
    await TestAPI.register(TEST_USERS.customer);
    const loginResponse = await TestAPI.login({
      username: TEST_USERS.customer.username,
      password: TEST_USERS.customer.password,
    });
    userToken = loginResponse.data.data.token;
  });

  describe('Device Fingerprinting', () => {
    it('should generate unique device fingerprints for different devices', async () => {
      // Login from desktop
      const desktopLogin = await TestAPI.login({
        username: TEST_USERS.customer.username,
        password: TEST_USERS.customer.password,
      }, TEST_HEADERS.desktop);

      // Login from mobile
      const mobileLogin = await TestAPI.login({
        username: TEST_USERS.customer.username,
        password: TEST_USERS.customer.password,
      }, TEST_HEADERS.mobile);

      expect(desktopLogin.status).toBe(200);
      expect(mobileLogin.status).toBe(200);

      // Check device history
      const deviceResponse = await TestAPI.authenticatedRequest(
        'GET',
        '/user/tracking/devices',
        userToken
      );

      expect(deviceResponse.status).toBe(200);
      expect(deviceResponse.data.devices.length).toBeGreaterThanOrEqual(2);

      // Verify different fingerprints
      const fingerprints = deviceResponse.data.devices.map((d: any) => d.fingerprint);
      const uniqueFingerprints = new Set(fingerprints);
      expect(uniqueFingerprints.size).toBe(fingerprints.length);
    });

    it('should detect device information correctly', async () => {
      const response = await TestAPI.authenticatedRequest(
        'GET',
        '/user/tracking/devices',
        userToken
      );

      expect(response.status).toBe(200);
      const device = response.data.devices[0];

      TestAssertions.expectValidDeviceInfo(device);
      expect(device.info.browser).toBeDefined();
      expect(device.info.os).toBeDefined();
      expect(device.info.device).toBeDefined();
      expect(typeof device.info.isMobile).toBe('boolean');
      expect(typeof device.info.isTablet).toBe('boolean');
      expect(typeof device.info.isDesktop).toBe('boolean');
    });

    it('should track device usage count', async () => {
      // Login multiple times from same device
      for (let i = 0; i < 3; i++) {
        await TestAPI.login({
          username: TEST_USERS.customer.username,
          password: TEST_USERS.customer.password,
        }, TEST_HEADERS.desktop);
      }

      const response = await TestAPI.authenticatedRequest(
        'GET',
        '/user/tracking/devices',
        userToken
      );

      expect(response.status).toBe(200);
      const device = response.data.devices.find((d: any) => 
        d.info.browser === 'Chrome'
      );
      
      expect(device).toBeDefined();
      expect(device.count).toBeGreaterThanOrEqual(3);
    });

    it('should mark current device correctly', async () => {
      const response = await TestAPI.authenticatedRequest(
        'GET',
        '/user/tracking/devices',
        userToken
      );

      expect(response.status).toBe(200);
      expect(response.data.currentDevice).toBeDefined();
      
      const currentDevice = response.data.devices.find((d: any) => d.isCurrent);
      expect(currentDevice).toBeDefined();
    });
  });

  describe('IP Address Tracking', () => {
    it('should track IP addresses from different locations', async () => {
      // Login from different IPs
      await TestAPI.login({
        username: TEST_USERS.customer.username,
        password: TEST_USERS.customer.password,
      }, { ...TEST_HEADERS.desktop, 'X-Forwarded-For': '203.154.1.100' });

      await TestAPI.login({
        username: TEST_USERS.customer.username,
        password: TEST_USERS.customer.password,
      }, { ...TEST_HEADERS.mobile, 'X-Forwarded-For': '1.1.1.1' });

      const response = await TestAPI.authenticatedRequest(
        'GET',
        '/user/tracking/locations',
        userToken
      );

      expect(response.status).toBe(200);
      expect(response.data.locations.length).toBeGreaterThanOrEqual(2);

      const ips = response.data.locations.map((l: any) => l.ip);
      const uniqueIPs = new Set(ips);
      expect(uniqueIPs.size).toBe(ips.length);
    });

    it('should classify IP address types correctly', async () => {
      const response = await TestAPI.authenticatedRequest(
        'GET',
        '/user/tracking/locations',
        userToken
      );

      expect(response.status).toBe(200);
      const location = response.data.locations[0];

      expect(location.info).toBeDefined();
      expect(location.info.type).toBeDefined();
      expect(['public', 'private', 'localhost']).toContain(location.info.type);
      expect(typeof location.info.isPrivate).toBe('boolean');
    });

    it('should mark current IP correctly', async () => {
      const response = await TestAPI.authenticatedRequest(
        'GET',
        '/user/tracking/locations',
        userToken
      );

      expect(response.status).toBe(200);
      expect(response.data.currentIp).toBeDefined();
      
      const currentLocation = response.data.locations.find((l: any) => l.isCurrent);
      expect(currentLocation).toBeDefined();
    });
  });

  describe('Login Patterns Analysis', () => {
    it('should track login patterns correctly', async () => {
      // Generate some login activity
      for (let i = 0; i < 5; i++) {
        await TestAPI.login({
          username: TEST_USERS.customer.username,
          password: TEST_USERS.customer.password,
        });
      }

      const response = await TestAPI.authenticatedRequest(
        'GET',
        '/user/tracking/patterns',
        userToken
      );

      expect(response.status).toBe(200);
      expect(response.data.totalLogins).toBeGreaterThanOrEqual(5);
      expect(response.data.accountAge).toBeGreaterThanOrEqual(0);
      expect(response.data.browserUsage).toBeDefined();
      expect(response.data.deviceTypes).toBeDefined();
    });

    it('should track browser usage statistics', async () => {
      // Login from different browsers
      await TestAPI.login({
        username: TEST_USERS.customer.username,
        password: TEST_USERS.customer.password,
      }, TEST_HEADERS.desktop); // Chrome

      await TestAPI.login({
        username: TEST_USERS.customer.username,
        password: TEST_USERS.customer.password,
      }, TEST_HEADERS.mobile); // Safari

      const response = await TestAPI.authenticatedRequest(
        'GET',
        '/user/tracking/patterns',
        userToken
      );

      expect(response.status).toBe(200);
      expect(Object.keys(response.data.browserUsage).length).toBeGreaterThanOrEqual(1);
      expect(Object.keys(response.data.deviceTypes).length).toBeGreaterThanOrEqual(1);
    });

    it('should calculate account age correctly', async () => {
      const response = await TestAPI.authenticatedRequest(
        'GET',
        '/user/tracking/patterns',
        userToken
      );

      expect(response.status).toBe(200);
      expect(response.data.accountAge).toBe(0); // Just created
      expect(response.data.accountCreated).toBeDefined();
      expect(response.data.lastLogin).toBeDefined();
    });
  });

  describe('Activity Logging', () => {
    it('should log login activities', async () => {
      // Generate some activity
      await TestAPI.login({
        username: TEST_USERS.customer.username,
        password: TEST_USERS.customer.password,
      });

      const response = await TestAPI.authenticatedRequest(
        'GET',
        '/user/tracking/activity',
        userToken
      );

      expect(response.status).toBe(200);
      expect(response.data.activities).toBeDefined();
      expect(Array.isArray(response.data.activities)).toBe(true);
      expect(response.data.activities.length).toBeGreaterThan(0);

      const loginActivity = response.data.activities.find((a: any) => 
        a.activityType === 'login'
      );
      expect(loginActivity).toBeDefined();
      expect(loginActivity.ipAddress).toBeDefined();
      expect(loginActivity.userAgent).toBeDefined();
    });

    it('should include activity metadata', async () => {
      const response = await TestAPI.authenticatedRequest(
        'GET',
        '/user/tracking/activity',
        userToken
      );

      expect(response.status).toBe(200);
      const activity = response.data.activities[0];

      expect(activity.id).toBeDefined();
      expect(activity.activityType).toBeDefined();
      expect(activity.description).toBeDefined();
      expect(activity.createdAt).toBeDefined();
      expect(activity.severity).toBeDefined();
    });

    it('should filter activities by type', async () => {
      const response = await TestAPI.authenticatedRequest(
        'GET',
        '/user/tracking/activity?type=login',
        userToken
      );

      expect(response.status).toBe(200);
      response.data.activities.forEach((activity: any) => {
        expect(activity.activityType).toBe('login');
      });
    });
  });

  describe('Security Summary', () => {
    it('should generate security summary', async () => {
      const response = await TestAPI.authenticatedRequest(
        'GET',
        '/user/tracking/security-summary',
        userToken
      );

      expect(response.status).toBe(200);
      expect(response.data.securityScore).toBeDefined();
      TestAssertions.expectValidSecurityScore(response.data.securityScore);
      
      expect(response.data.metrics).toBeDefined();
      expect(response.data.metrics.totalDevices).toBeGreaterThanOrEqual(0);
      expect(response.data.metrics.totalIPs).toBeGreaterThanOrEqual(0);
      expect(response.data.metrics.totalLogins).toBeGreaterThanOrEqual(0);
    });

    it('should include security recommendations', async () => {
      const response = await TestAPI.authenticatedRequest(
        'GET',
        '/user/tracking/security-summary',
        userToken
      );

      expect(response.status).toBe(200);
      expect(response.data.recommendations).toBeDefined();
      expect(Array.isArray(response.data.recommendations)).toBe(true);
    });

    it('should calculate risk factors', async () => {
      const response = await TestAPI.authenticatedRequest(
        'GET',
        '/user/tracking/security-summary',
        userToken
      );

      expect(response.status).toBe(200);
      expect(response.data.riskFactors).toBeDefined();
      expect(response.data.riskFactors.accountLocked).toBeDefined();
      expect(response.data.riskFactors.recentFailedLogins).toBeDefined();
      expect(response.data.riskFactors.suspiciousActivity).toBeDefined();
    });
  });

  describe('Cross-Device Tracking', () => {
    it('should track sessions across multiple devices', async () => {
      // Login from desktop
      const desktopLogin = await TestAPI.login({
        username: TEST_USERS.customer.username,
        password: TEST_USERS.customer.password,
      }, TEST_HEADERS.desktop);

      // Login from mobile
      const mobileLogin = await TestAPI.login({
        username: TEST_USERS.customer.username,
        password: TEST_USERS.customer.password,
      }, TEST_HEADERS.mobile);

      const desktopToken = desktopLogin.data.data.token;
      const mobileToken = mobileLogin.data.data.token;

      // Both tokens should work
      const desktopProfile = await TestAPI.authenticatedRequest(
        'GET',
        '/users/profile',
        desktopToken
      );
      const mobileProfile = await TestAPI.authenticatedRequest(
        'GET',
        '/users/profile',
        mobileToken
      );

      expect(desktopProfile.status).toBe(200);
      expect(mobileProfile.status).toBe(200);

      // Check device tracking shows both devices
      const deviceResponse = await TestAPI.authenticatedRequest(
        'GET',
        '/user/tracking/devices',
        desktopToken
      );

      expect(deviceResponse.status).toBe(200);
      expect(deviceResponse.data.devices.length).toBeGreaterThanOrEqual(2);
    });

    it('should maintain separate session tokens for different devices', async () => {
      const login1 = await TestAPI.login({
        username: TEST_USERS.customer.username,
        password: TEST_USERS.customer.password,
      }, TEST_HEADERS.desktop);

      const login2 = await TestAPI.login({
        username: TEST_USERS.customer.username,
        password: TEST_USERS.customer.password,
      }, TEST_HEADERS.mobile);

      expect(login1.data.data.sessionToken).not.toBe(login2.data.data.sessionToken);
    });
  });
});
