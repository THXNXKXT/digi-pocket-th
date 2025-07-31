import { beforeAll, afterAll, beforeEach, afterEach, expect } from 'bun:test';
import { db } from '../src/db';
import { users, userSessions, userActivityLogs, products, orders } from '../src/db/schemas/base';
import { eq } from 'drizzle-orm';

// Test database configuration
export const TEST_CONFIG = {
  database: {
    url: process.env.TEST_DATABASE_URL || 'postgres://digiuser:qniCrDWiPa@localhost:5435/digipocket_test',
  },
  redis: {
    url: process.env.TEST_REDIS_URL || 'redis://localhost:6380',
  },
  jwt: {
    secret: 'test-jwt-secret-key-for-testing-only',
    expiresIn: '1h',
  },
  api: {
    baseUrl: process.env.TEST_API_URL || 'http://localhost:3031',
  },
};

// Test user data
export const TEST_USERS = {
  admin: {
    username: 'test_admin',
    email: 'admin@test.com',
    password: 'TestPassword123!',
    role: 'admin' as const,
  },
  customer: {
    username: 'test_customer',
    email: 'customer@test.com',
    password: 'TestPassword123!',
    role: 'customer' as const,
  },
  customer2: {
    username: 'test_customer2',
    email: 'customer2@test.com',
    password: 'TestPassword123!',
    role: 'customer' as const,
  },
};

// Test product data
export const TEST_PRODUCTS = {
  product1: {
    name: 'Test Product 1',
    description: 'Test product description 1',
    price: '99.99',
    stock: 100,
    isActive: true,
  },
  product2: {
    name: 'Test Product 2',
    description: 'Test product description 2',
    price: '149.99',
    stock: 50,
    isActive: true,
  },
};

// Test headers for different devices
export const TEST_HEADERS = {
  desktop: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'X-Forwarded-For': '203.154.1.100',
    'X-Real-IP': '203.154.1.100',
  },
  mobile: {
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Mobile/15E148 Safari/604.1',
    'Accept-Language': 'th-TH,th;q=0.9,en;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'X-Forwarded-For': '1.1.1.1',
    'X-Real-IP': '1.1.1.1',
  },
  suspicious: {
    'User-Agent': 'curl/7.68.0',
    'X-Forwarded-For': '192.168.1.1',
    'X-Real-IP': '192.168.1.1',
  },
};

// Database cleanup utilities
export class TestDatabase {
  static async cleanup() {
    try {
      // Clean up in reverse dependency order
      await db.delete(userActivityLogs);
      await db.delete(userSessions);
      await db.delete(orders);
      await db.delete(products);
      await db.delete(users);
    } catch (error) {
      console.warn('Database cleanup warning:', error);
    }
  }

  static async createTestUser(userData: typeof TEST_USERS.customer) {
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const [user] = await db.insert(users).values({
      username: userData.username,
      email: userData.email,
      passwordHash: hashedPassword,
      role: userData.role,
      status: 'active',
    }).returning();
    
    return user;
  }

  static async createTestProduct(productData: typeof TEST_PRODUCTS.product1) {
    const [product] = await db.insert(products).values(productData).returning();
    return product;
  }
}

// API testing utilities
export class TestAPI {
  static async request(method: string, path: string, options: any = {}) {
    const url = `${TEST_CONFIG.api.baseUrl}${path}`;
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    return {
      status: response.status,
      ok: response.ok,
      data,
      headers: response.headers,
    };
  }

  static async login(credentials: { username: string; password: string }, headers = {}) {
    return this.request('POST', '/auth/login', {
      body: credentials,
      headers: { ...TEST_HEADERS.desktop, ...headers },
    });
  }

  static async register(userData: any, headers = {}) {
    return this.request('POST', '/auth/register', {
      body: userData,
      headers: { ...TEST_HEADERS.desktop, ...headers },
    });
  }

  static async authenticatedRequest(method: string, path: string, token: string, options: any = {}) {
    return this.request(method, path, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });
  }
}

// Test setup and teardown
export function setupTestEnvironment() {
  beforeAll(async () => {
    console.log('🧪 Setting up test environment...');
    await TestDatabase.cleanup();
  });

  afterAll(async () => {
    console.log('🧹 Cleaning up test environment...');
    await TestDatabase.cleanup();
  });

  beforeEach(async () => {
    // Clean up before each test to ensure isolation
    await TestDatabase.cleanup();
  });
}

// Assertion helpers
export class TestAssertions {
  static expectValidJWT(token: string) {
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);
  }

  static expectValidUser(user: any) {
    expect(user).toBeDefined();
    expect(user.id).toBeDefined();
    expect(user.username).toBeDefined();
    expect(user.email).toBeDefined();
    expect(user.role).toBeDefined();
    expect(user.passwordHash).toBeUndefined(); // Should not expose password hash
  }

  static expectValidSecurityScore(score: number) {
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
    expect(Number.isInteger(score)).toBe(true);
  }

  static expectValidDeviceInfo(deviceInfo: any) {
    expect(deviceInfo).toBeDefined();
    expect(deviceInfo.fingerprint).toBeDefined();
    expect(deviceInfo.browser).toBeDefined();
    expect(deviceInfo.os).toBeDefined();
    expect(deviceInfo.device).toBeDefined();
  }
}

// Performance testing utilities
export class PerformanceTest {
  static async measureResponseTime(fn: () => Promise<any>): Promise<{ result: any; duration: number }> {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    return { result, duration: end - start };
  }

  static async loadTest(fn: () => Promise<any>, concurrency: number, iterations: number) {
    const results: Array<{ duration: number; success: boolean }> = [];

    for (let i = 0; i < iterations; i++) {
      const promises = Array(concurrency).fill(null).map(async () => {
        try {
          const { duration } = await this.measureResponseTime(fn);
          return { duration, success: true };
        } catch (error) {
          return { duration: 0, success: false };
        }
      });

      const batchResults = await Promise.all(promises);
      results.push(...batchResults);
    }

    const successfulResults = results.filter(r => r.success);
    const avgDuration = successfulResults.reduce((sum, r) => sum + r.duration, 0) / successfulResults.length;
    const successRate = successfulResults.length / results.length;

    return {
      totalRequests: results.length,
      successfulRequests: successfulResults.length,
      failedRequests: results.length - successfulResults.length,
      successRate,
      averageResponseTime: avgDuration,
      minResponseTime: Math.min(...successfulResults.map(r => r.duration)),
      maxResponseTime: Math.max(...successfulResults.map(r => r.duration)),
    };
  }

  static async stressTest(fn: () => Promise<any>, maxConcurrency: number, duration: number) {
    const startTime = Date.now();
    const results: Array<{ duration: number; success: boolean; timestamp: number }> = [];
    let currentConcurrency = 1;

    while (Date.now() - startTime < duration) {
      const promises = Array(currentConcurrency).fill(null).map(async () => {
        const timestamp = Date.now();
        try {
          const { duration } = await this.measureResponseTime(fn);
          return { duration, success: true, timestamp };
        } catch (error) {
          return { duration: 0, success: false, timestamp };
        }
      });

      const batchResults = await Promise.all(promises);
      results.push(...batchResults);

      // Gradually increase concurrency
      if (currentConcurrency < maxConcurrency) {
        currentConcurrency = Math.min(currentConcurrency + 1, maxConcurrency);
      }
    }

    const successfulResults = results.filter(r => r.success);
    const failureRate = (results.length - successfulResults.length) / results.length;

    return {
      totalRequests: results.length,
      successfulRequests: successfulResults.length,
      failedRequests: results.length - successfulResults.length,
      successRate: successfulResults.length / results.length,
      failureRate,
      averageResponseTime: successfulResults.reduce((sum, r) => sum + r.duration, 0) / successfulResults.length,
      maxConcurrency: currentConcurrency,
      duration: Date.now() - startTime,
    };
  }
}
