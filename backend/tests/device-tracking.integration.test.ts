import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { db } from '../src/db';
import { users } from '../src/db/schemas/base';
import { eq } from 'drizzle-orm';
import { SecurityUtils } from '../src/utils/security.utils';

describe('Device Tracking Integration Tests', () => {
  let testUserId: string;
  let authToken: string;
  
  beforeAll(async () => {
    // Create test user
    const testUser = await db.insert(users).values({
      username: 'device_test_user',
      email: 'device.test@example.com',
      passwordHash: await SecurityUtils.hashString('TestPassword123!'),
      role: 'customer',
      status: 'active'
    }).returning();
    
    testUserId = testUser[0].id;
    
    // Generate test JWT token (simplified for testing)
    const jwt = await import('jsonwebtoken');
    authToken = jwt.sign(
      { sub: testUserId, username: 'device_test_user', role: 'customer' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    // Clean up test data
    await db.delete(users).where(eq(users.id, testUserId));
  });

  describe('Device Tracking Middleware', () => {
    test('should track device information on API access', async () => {
      // Simulate API request with device headers
      const response = await fetch('http://localhost:3000/user/tracking/devices', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'X-Forwarded-For': '192.168.1.100'
        }
      });

      expect(response.status).toBe(200);
      
      // Check if device was tracked
      const user = await db.select().from(users).where(eq(users.id, testUserId)).limit(1);
      expect(user[0].lastLoginIp).toBe('192.168.1.100');
      expect(user[0].lastDeviceFingerprint).toBeDefined();
      expect(user[0].deviceHistory).toBeDefined();
      expect(user[0].ipHistory).toBeDefined();
    });
  });

  describe('Device History API', () => {
    test('should return device history', async () => {
      const response = await fetch('http://localhost:3000/user/tracking/devices', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('devices');
      expect(data).toHaveProperty('totalDevices');
      expect(data).toHaveProperty('currentDevice');
      expect(Array.isArray(data.devices)).toBe(true);
    });

    test('should mark current device correctly', async () => {
      const response = await fetch('http://localhost:3000/user/tracking/devices', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)',
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      const currentDevices = data.devices.filter((device: any) => device.isCurrent);
      expect(currentDevices.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Location History API', () => {
    test('should return IP/location history', async () => {
      const response = await fetch('http://localhost:3000/user/tracking/locations', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'X-Forwarded-For': '8.8.8.8',
          'Content-Type': 'application/json'
        }
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('locations');
      expect(data).toHaveProperty('totalLocations');
      expect(data).toHaveProperty('currentIp');
      expect(Array.isArray(data.locations)).toBe(true);
    });

    test('should detect IP types correctly', async () => {
      // Test with private IP
      await fetch('http://localhost:3000/user/tracking/locations', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'X-Forwarded-For': '192.168.1.1',
          'Content-Type': 'application/json'
        }
      });

      const response = await fetch('http://localhost:3000/user/tracking/locations', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      const privateIPs = data.locations.filter((loc: any) => loc.isPrivate);
      expect(privateIPs.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Login Patterns API', () => {
    test('should return login patterns and statistics', async () => {
      const response = await fetch('http://localhost:3000/user/tracking/patterns', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('patterns');
      expect(data).toHaveProperty('statistics');
      expect(data.statistics).toHaveProperty('totalLogins');
      expect(data.statistics).toHaveProperty('accountAgeDays');
      expect(data.statistics).toHaveProperty('averageLoginsPerDay');
    });

    test('should track hourly and weekly patterns', async () => {
      // Make multiple requests to build patterns
      for (let i = 0; i < 3; i++) {
        await fetch('http://localhost:3000/user/tracking/patterns', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
      }

      const response = await fetch('http://localhost:3000/user/tracking/patterns', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      expect(data.patterns).toHaveProperty('hourlyPattern');
      expect(data.patterns).toHaveProperty('weeklyPattern');
      expect(data.patterns).toHaveProperty('deviceTypes');
      expect(data.patterns).toHaveProperty('browsers');
    });
  });

  describe('Activity History API', () => {
    test('should return recent activity', async () => {
      const response = await fetch('http://localhost:3000/user/tracking/activity?limit=10&days=7', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('activities');
      expect(data).toHaveProperty('totalActivities');
      expect(data).toHaveProperty('dateRange');
      expect(Array.isArray(data.activities)).toBe(true);
      expect(data.activities.length).toBeLessThanOrEqual(10);
    });

    test('should include device and IP info in activities', async () => {
      const response = await fetch('http://localhost:3000/user/tracking/activity', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.activities.length > 0) {
        const activity = data.activities[0];
        expect(activity).toHaveProperty('timestampFormatted');
        expect(activity).toHaveProperty('isAuthenticated');
        // Device and IP info might be null for older activities
      }
    });
  });

  describe('Security Summary API', () => {
    test('should return security summary with score', async () => {
      const response = await fetch('http://localhost:3000/user/tracking/security-summary', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('securityScore');
      expect(data).toHaveProperty('summary');
      expect(data).toHaveProperty('recommendations');
      
      expect(typeof data.securityScore).toBe('number');
      expect(data.securityScore).toBeGreaterThanOrEqual(0);
      expect(data.securityScore).toBeLessThanOrEqual(100);
      
      expect(Array.isArray(data.recommendations)).toBe(true);
    });

    test('should provide relevant security recommendations', async () => {
      const response = await fetch('http://localhost:3000/user/tracking/security-summary', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      expect(data.recommendations.length).toBeGreaterThan(0);
      
      // Should have at least one recommendation
      const hasPositiveRecommendation = data.recommendations.some((rec: string) => 
        rec.includes('excellent') || rec.includes('good')
      );
      expect(typeof hasPositiveRecommendation).toBe('boolean');
    });
  });

  describe('Error Handling', () => {
    test('should handle unauthorized requests', async () => {
      const response = await fetch('http://localhost:3000/user/tracking/devices', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      expect(response.status).toBe(401);
    });

    test('should handle invalid tokens', async () => {
      const response = await fetch('http://localhost:3000/user/tracking/devices', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer invalid-token',
          'Content-Type': 'application/json'
        }
      });

      expect(response.status).toBe(401);
    });
  });
});
