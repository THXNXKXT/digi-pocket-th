import { describe, it, expect, beforeEach } from 'bun:test';
import { setupTestEnvironment, TestAPI, TestDatabase, PerformanceTest, TEST_USERS, TEST_PRODUCTS } from './setup';

setupTestEnvironment();

describe('⚡ Performance Tests - Comprehensive', () => {
  let customerToken: string;
  let adminToken: string;
  let productId: string;

  beforeEach(async () => {
    // Create test users
    await TestAPI.register(TEST_USERS.admin);
    const adminLogin = await TestAPI.login({
      username: TEST_USERS.admin.username,
      password: TEST_USERS.admin.password,
    });
    adminToken = adminLogin.data.data.token;

    await TestAPI.register(TEST_USERS.customer);
    const customerLogin = await TestAPI.login({
      username: TEST_USERS.customer.username,
      password: TEST_USERS.customer.password,
    });
    customerToken = customerLogin.data.data.token;

    // Create test product
    const product = await TestDatabase.createTestProduct(TEST_PRODUCTS.product1);
    productId = product.id;
  });

  describe('API Response Time Tests', () => {
    it('should respond to health check within 100ms', async () => {
      const { duration } = await PerformanceTest.measureResponseTime(async () => {
        return await TestAPI.request('GET', '/health');
      });

      expect(duration).toBeLessThan(100);
    });

    it('should respond to authentication within 500ms', async () => {
      const { duration } = await PerformanceTest.measureResponseTime(async () => {
        return await TestAPI.login({
          username: TEST_USERS.customer.username,
          password: TEST_USERS.customer.password,
        });
      });

      expect(duration).toBeLessThan(500);
    });

    it('should respond to product listing within 200ms', async () => {
      const { duration } = await PerformanceTest.measureResponseTime(async () => {
        return await TestAPI.authenticatedRequest('GET', '/products', customerToken);
      });

      expect(duration).toBeLessThan(200);
    });

    it('should respond to user profile within 150ms', async () => {
      const { duration } = await PerformanceTest.measureResponseTime(async () => {
        return await TestAPI.authenticatedRequest('GET', '/users/profile', customerToken);
      });

      expect(duration).toBeLessThan(150);
    });

    it('should respond to device tracking within 300ms', async () => {
      const { duration } = await PerformanceTest.measureResponseTime(async () => {
        return await TestAPI.authenticatedRequest('GET', '/user/tracking/devices', customerToken);
      });

      expect(duration).toBeLessThan(300);
    });
  });

  describe('Load Testing', () => {
    it('should handle concurrent health checks', async () => {
      const results = await PerformanceTest.loadTest(
        async () => await TestAPI.request('GET', '/health'),
        10, // 10 concurrent requests
        5   // 5 iterations
      );

      expect(results.successRate).toBeGreaterThan(0.95); // 95% success rate
      expect(results.averageResponseTime).toBeLessThan(200);
      expect(results.totalRequests).toBe(50);
    });

    it('should handle concurrent authentication requests', async () => {
      const results = await PerformanceTest.loadTest(
        async () => await TestAPI.login({
          username: TEST_USERS.customer.username,
          password: TEST_USERS.customer.password,
        }),
        5, // 5 concurrent requests
        3  // 3 iterations
      );

      expect(results.successRate).toBeGreaterThan(0.8); // 80% success rate (some may be rate limited)
      expect(results.averageResponseTime).toBeLessThan(1000);
    });

    it('should handle concurrent product requests', async () => {
      const results = await PerformanceTest.loadTest(
        async () => await TestAPI.authenticatedRequest('GET', '/products', customerToken),
        15, // 15 concurrent requests
        3   // 3 iterations
      );

      expect(results.successRate).toBeGreaterThan(0.9); // 90% success rate
      expect(results.averageResponseTime).toBeLessThan(300);
    });

    it('should handle concurrent order creation', async () => {
      const orderData = {
        items: [
          {
            productId: productId,
            quantity: 1,
            price: TEST_PRODUCTS.product1.price,
          },
        ],
        shippingInfo: {
          address: '123 Test Street',
          city: 'Test City',
          postalCode: '12345',
          country: 'Thailand',
        },
      };

      const results = await PerformanceTest.loadTest(
        async () => await TestAPI.authenticatedRequest('POST', '/orders', customerToken, { body: orderData }),
        3, // 3 concurrent requests
        2  // 2 iterations
      );

      // Some orders may fail due to stock limitations, which is expected
      expect(results.successRate).toBeGreaterThan(0.3); // At least 30% should succeed
      expect(results.averageResponseTime).toBeLessThan(1000);
    });
  });

  describe('Stress Testing', () => {
    it('should handle increasing load on health endpoint', async () => {
      const results = await PerformanceTest.stressTest(
        async () => await TestAPI.request('GET', '/health'),
        20,   // Max 20 concurrent requests
        5000  // 5 seconds duration
      );

      expect(results.successRate).toBeGreaterThan(0.9); // 90% success rate
      expect(results.failureRate).toBeLessThan(0.1);    // Less than 10% failure rate
      expect(results.averageResponseTime).toBeLessThan(500);
    });

    it('should handle stress on authentication system', async () => {
      const results = await PerformanceTest.stressTest(
        async () => await TestAPI.login({
          username: TEST_USERS.customer.username,
          password: TEST_USERS.customer.password,
        }),
        10,   // Max 10 concurrent requests
        3000  // 3 seconds duration
      );

      // Authentication may have rate limiting, so lower success rate is acceptable
      expect(results.successRate).toBeGreaterThan(0.5); // 50% success rate
      expect(results.averageResponseTime).toBeLessThan(2000);
    });

    it('should maintain performance under database load', async () => {
      const results = await PerformanceTest.stressTest(
        async () => await TestAPI.authenticatedRequest('GET', '/user/tracking/devices', customerToken),
        8,    // Max 8 concurrent requests
        4000  // 4 seconds duration
      );

      expect(results.successRate).toBeGreaterThan(0.8); // 80% success rate
      expect(results.averageResponseTime).toBeLessThan(800);
    });
  });

  describe('Database Performance', () => {
    it('should handle multiple user registrations efficiently', async () => {
      const results = await PerformanceTest.loadTest(
        async () => {
          const randomId = Math.random().toString(36).substring(7);
          return await TestAPI.register({
            username: `user_${randomId}`,
            email: `user_${randomId}@test.com`,
            password: 'TestPassword123!',
            role: 'customer',
          });
        },
        5, // 5 concurrent registrations
        2  // 2 iterations
      );

      expect(results.successRate).toBeGreaterThan(0.7); // 70% success rate (some may be rate limited)
      expect(results.averageResponseTime).toBeLessThan(1500);
    });

    it('should handle concurrent device tracking queries', async () => {
      // Generate some device tracking data first
      for (let i = 0; i < 3; i++) {
        await TestAPI.login({
          username: TEST_USERS.customer.username,
          password: TEST_USERS.customer.password,
        });
      }

      const results = await PerformanceTest.loadTest(
        async () => await TestAPI.authenticatedRequest('GET', '/user/tracking/security-summary', customerToken),
        8, // 8 concurrent requests
        3  // 3 iterations
      );

      expect(results.successRate).toBeGreaterThan(0.8); // 80% success rate
      expect(results.averageResponseTime).toBeLessThan(600);
    });

    it('should handle complex queries efficiently', async () => {
      const results = await PerformanceTest.loadTest(
        async () => await TestAPI.authenticatedRequest('GET', '/user/tracking/patterns', customerToken),
        6, // 6 concurrent requests
        3  // 3 iterations
      );

      expect(results.successRate).toBeGreaterThan(0.8); // 80% success rate
      expect(results.averageResponseTime).toBeLessThan(500);
    });
  });

  describe('Memory and Resource Usage', () => {
    it('should not leak memory during repeated operations', async () => {
      const initialMemory = process.memoryUsage();

      // Perform many operations
      for (let i = 0; i < 100; i++) {
        await TestAPI.authenticatedRequest('GET', '/users/profile', customerToken);
      }

      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;

      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });

    it('should handle large response payloads efficiently', async () => {
      // Create multiple products to increase response size
      for (let i = 0; i < 20; i++) {
        await TestDatabase.createTestProduct({
          ...TEST_PRODUCTS.product1,
          name: `Product ${i}`,
        });
      }

      const { duration } = await PerformanceTest.measureResponseTime(async () => {
        return await TestAPI.authenticatedRequest('GET', '/products', customerToken);
      });

      expect(duration).toBeLessThan(400); // Should still be fast with more data
    });
  });

  describe('Scalability Tests', () => {
    it('should maintain performance with multiple concurrent users', async () => {
      // Create multiple users
      const users: string[] = [];
      for (let i = 0; i < 5; i++) {
        const userData = {
          username: `user_${i}_${Date.now()}`,
          email: `user_${i}_${Date.now()}@test.com`,
          password: 'TestPassword123!',
          role: 'customer' as const,
        };
        await TestAPI.register(userData);
        const login = await TestAPI.login({
          username: userData.username,
          password: userData.password,
        });
        users.push(login.data.data.token);
      }

      // Test concurrent operations with different users
      const results = await PerformanceTest.loadTest(
        async () => {
          const randomUser = users[Math.floor(Math.random() * users.length)];
          return await TestAPI.authenticatedRequest('GET', '/users/profile', randomUser);
        },
        10, // 10 concurrent requests
        3   // 3 iterations
      );

      expect(results.successRate).toBeGreaterThan(0.9); // 90% success rate
      expect(results.averageResponseTime).toBeLessThan(300);
    });

    it('should handle mixed workload efficiently', async () => {
      const operations = [
        () => TestAPI.request('GET', '/health'),
        () => TestAPI.authenticatedRequest('GET', '/products', customerToken),
        () => TestAPI.authenticatedRequest('GET', '/users/profile', customerToken),
        () => TestAPI.authenticatedRequest('GET', '/user/tracking/devices', customerToken),
      ];

      const results = await PerformanceTest.loadTest(
        async () => {
          const randomOperation = operations[Math.floor(Math.random() * operations.length)];
          return await randomOperation();
        },
        12, // 12 concurrent requests
        4   // 4 iterations
      );

      expect(results.successRate).toBeGreaterThan(0.85); // 85% success rate
      expect(results.averageResponseTime).toBeLessThan(400);
    });
  });
});
