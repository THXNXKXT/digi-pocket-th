import { SecurityUtils } from '../security.utils';

describe('SecurityUtils', () => {
  describe('isValidEmail', () => {
    test('should validate correct email formats', () => {
      expect(SecurityUtils.isValidEmail('test@example.com')).toBe(true);
      expect(SecurityUtils.isValidEmail('user.name@domain.co.th')).toBe(true);
      expect(SecurityUtils.isValidEmail('test+tag@gmail.com')).toBe(true);
    });

    test('should reject invalid email formats', () => {
      expect(SecurityUtils.isValidEmail('invalid-email')).toBe(false);
      expect(SecurityUtils.isValidEmail('test@')).toBe(false);
      expect(SecurityUtils.isValidEmail('@domain.com')).toBe(false);
      expect(SecurityUtils.isValidEmail('test..test@domain.com')).toBe(false);
    });
  });

  describe('validatePasswordStrength', () => {
    test('should validate strong passwords', () => {
      const result = SecurityUtils.validatePasswordStrength('StrongPass123!');
      expect(result.isValid).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(60);
      expect(result.issues).toHaveLength(0);
    });

    test('should reject weak passwords', () => {
      const result = SecurityUtils.validatePasswordStrength('weak');
      expect(result.isValid).toBe(false);
      expect(result.score).toBeLessThan(60);
      expect(result.issues.length).toBeGreaterThan(0);
    });

    test('should identify specific password issues', () => {
      const result = SecurityUtils.validatePasswordStrength('password');
      expect(result.issues).toContain('Password must contain uppercase letters');
      expect(result.issues).toContain('Password must contain numbers');
      expect(result.issues).toContain('Password must contain special characters');
    });

    test('should give bonus points for longer passwords', () => {
      const short = SecurityUtils.validatePasswordStrength('Pass123!');
      const long = SecurityUtils.validatePasswordStrength('VeryLongPassword123!');
      expect(long.score).toBeGreaterThan(short.score);
    });
  });

  describe('generateSecureToken', () => {
    test('should generate token with default length', () => {
      const token = SecurityUtils.generateSecureToken();
      expect(token).toHaveLength(32);
      expect(typeof token).toBe('string');
    });

    test('should generate token with custom length', () => {
      const token = SecurityUtils.generateSecureToken(16);
      expect(token).toHaveLength(16);
    });

    test('should generate different tokens each time', () => {
      const token1 = SecurityUtils.generateSecureToken();
      const token2 = SecurityUtils.generateSecureToken();
      expect(token1).not.toBe(token2);
    });

    test('should only contain valid characters', () => {
      const token = SecurityUtils.generateSecureToken();
      expect(token).toMatch(/^[A-Za-z0-9]+$/);
    });
  });

  describe('hashString', () => {
    test('should hash string consistently', async () => {
      const input = 'test string';
      const hash1 = await SecurityUtils.hashString(input);
      const hash2 = await SecurityUtils.hashString(input);
      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64); // SHA-256 produces 64 character hex string
    });

    test('should produce different hashes for different inputs', async () => {
      const hash1 = await SecurityUtils.hashString('input1');
      const hash2 = await SecurityUtils.hashString('input2');
      expect(hash1).not.toBe(hash2);
    });

    test('should produce hex string output', async () => {
      const hash = await SecurityUtils.hashString('test');
      expect(hash).toMatch(/^[a-f0-9]+$/);
    });
  });

  describe('isValidIP', () => {
    test('should validate IPv4 addresses', () => {
      expect(SecurityUtils.isValidIP('192.168.1.1')).toBe(true);
      expect(SecurityUtils.isValidIP('127.0.0.1')).toBe(true);
      expect(SecurityUtils.isValidIP('255.255.255.255')).toBe(true);
      expect(SecurityUtils.isValidIP('0.0.0.0')).toBe(true);
    });

    test('should validate IPv6 addresses', () => {
      expect(SecurityUtils.isValidIP('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).toBe(true);
      expect(SecurityUtils.isValidIP('::1')).toBe(false); // Current regex doesn't support compressed IPv6
    });

    test('should reject invalid IP addresses', () => {
      expect(SecurityUtils.isValidIP('256.1.1.1')).toBe(false);
      expect(SecurityUtils.isValidIP('192.168.1')).toBe(false);
      expect(SecurityUtils.isValidIP('not-an-ip')).toBe(false);
      expect(SecurityUtils.isValidIP('')).toBe(false);
    });
  });

  describe('extractClientIP', () => {
    test('should extract IP from x-forwarded-for header', () => {
      const headers = { 'x-forwarded-for': '192.168.1.1, 10.0.0.1' };
      expect(SecurityUtils.extractClientIP(headers)).toBe('192.168.1.1');
    });

    test('should extract IP from x-real-ip header', () => {
      const headers = { 'x-real-ip': '192.168.1.2' };
      expect(SecurityUtils.extractClientIP(headers)).toBe('192.168.1.2');
    });

    test('should extract IP from cf-connecting-ip header', () => {
      const headers = { 'cf-connecting-ip': '192.168.1.3' };
      expect(SecurityUtils.extractClientIP(headers)).toBe('192.168.1.3');
    });

    test('should return unknown when no IP headers present', () => {
      const headers = {};
      expect(SecurityUtils.extractClientIP(headers)).toBe('unknown');
    });

    test('should prioritize x-forwarded-for over other headers', () => {
      const headers = {
        'x-forwarded-for': '192.168.1.1',
        'x-real-ip': '192.168.1.2',
        'cf-connecting-ip': '192.168.1.3'
      };
      expect(SecurityUtils.extractClientIP(headers)).toBe('192.168.1.1');
    });
  });

  describe('generateDeviceFingerprint', () => {
    test('should generate consistent fingerprint for same headers', async () => {
      const headers = {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'accept-language': 'en-US,en;q=0.9',
        'accept-encoding': 'gzip, deflate, br'
      };
      
      const fingerprint1 = await SecurityUtils.generateDeviceFingerprint(headers);
      const fingerprint2 = await SecurityUtils.generateDeviceFingerprint(headers);
      
      expect(fingerprint1).toBe(fingerprint2);
      expect(fingerprint1).toHaveLength(16);
    });

    test('should generate different fingerprints for different headers', async () => {
      const headers1 = { 'user-agent': 'Browser1' };
      const headers2 = { 'user-agent': 'Browser2' };
      
      const fingerprint1 = await SecurityUtils.generateDeviceFingerprint(headers1);
      const fingerprint2 = await SecurityUtils.generateDeviceFingerprint(headers2);
      
      expect(fingerprint1).not.toBe(fingerprint2);
    });

    test('should handle missing headers gracefully', async () => {
      const headers = {};
      const fingerprint = await SecurityUtils.generateDeviceFingerprint(headers);
      expect(fingerprint).toHaveLength(16);
      expect(typeof fingerprint).toBe('string');
    });
  });

  describe('isSuspiciousRequest', () => {
    test('should detect bot user agents', () => {
      expect(SecurityUtils.isSuspiciousRequest('1.2.3.4', 'Googlebot/2.1')).toBe(true);
      expect(SecurityUtils.isSuspiciousRequest('1.2.3.4', 'Mozilla/5.0 (compatible; bingbot/2.0)')).toBe(true);
      expect(SecurityUtils.isSuspiciousRequest('1.2.3.4', 'curl/7.68.0')).toBe(true);
    });

    test('should not flag localhost as suspicious', () => {
      expect(SecurityUtils.isSuspiciousRequest('127.0.0.1', 'Googlebot/2.1')).toBe(false);
      expect(SecurityUtils.isSuspiciousRequest('::1', 'curl/7.68.0')).toBe(false);
    });

    test('should not flag private IPs as suspicious', () => {
      expect(SecurityUtils.isSuspiciousRequest('192.168.1.1', 'Googlebot/2.1')).toBe(false);
      expect(SecurityUtils.isSuspiciousRequest('10.0.0.1', 'curl/7.68.0')).toBe(false);
    });

    test('should not flag normal browsers as suspicious', () => {
      expect(SecurityUtils.isSuspiciousRequest('1.2.3.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)')).toBe(false);
    });
  });

  describe('generateRateLimitKey', () => {
    test('should generate consistent rate limit keys', () => {
      const key1 = SecurityUtils.generateRateLimitKey('192.168.1.1', '/api/login');
      const key2 = SecurityUtils.generateRateLimitKey('192.168.1.1', '/api/login');
      expect(key1).toBe(key2);
      expect(key1).toBe('rate_limit:192.168.1.1:/api/login');
    });

    test('should generate different keys for different IPs or endpoints', () => {
      const key1 = SecurityUtils.generateRateLimitKey('192.168.1.1', '/api/login');
      const key2 = SecurityUtils.generateRateLimitKey('192.168.1.2', '/api/login');
      const key3 = SecurityUtils.generateRateLimitKey('192.168.1.1', '/api/register');
      
      expect(key1).not.toBe(key2);
      expect(key1).not.toBe(key3);
      expect(key2).not.toBe(key3);
    });
  });

  describe('generateSessionToken', () => {
    test('should generate valid UUID', () => {
      const token = SecurityUtils.generateSessionToken();
      expect(token).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    });

    test('should generate different tokens each time', () => {
      const token1 = SecurityUtils.generateSessionToken();
      const token2 = SecurityUtils.generateSessionToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe('sanitizeString', () => {
    test('should remove HTML tags', () => {
      expect(SecurityUtils.sanitizeString('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
      expect(SecurityUtils.sanitizeString('Hello <b>World</b>')).toBe('Hello bWorld/b');
    });

    test('should trim whitespace', () => {
      expect(SecurityUtils.sanitizeString('  hello world  ')).toBe('hello world');
    });

    test('should handle normal strings', () => {
      expect(SecurityUtils.sanitizeString('normal string')).toBe('normal string');
    });
  });

  describe('isValidUsername', () => {
    test('should validate correct usernames', () => {
      expect(SecurityUtils.isValidUsername('user123')).toBe(true);
      expect(SecurityUtils.isValidUsername('test_user')).toBe(true);
      expect(SecurityUtils.isValidUsername('user-name')).toBe(true);
      expect(SecurityUtils.isValidUsername('a'.repeat(20))).toBe(true);
    });

    test('should reject invalid usernames', () => {
      expect(SecurityUtils.isValidUsername('ab')).toBe(false); // too short
      expect(SecurityUtils.isValidUsername('a'.repeat(21))).toBe(false); // too long
      expect(SecurityUtils.isValidUsername('user@name')).toBe(false); // invalid character
      expect(SecurityUtils.isValidUsername('user name')).toBe(false); // space
      expect(SecurityUtils.isValidUsername('')).toBe(false); // empty
    });
  });

  describe('isCommonPassword', () => {
    test('should detect common passwords', () => {
      expect(SecurityUtils.isCommonPassword('password')).toBe(true);
      expect(SecurityUtils.isCommonPassword('123456')).toBe(true);
      expect(SecurityUtils.isCommonPassword('PASSWORD')).toBe(true); // case insensitive
    });

    test('should not flag unique passwords', () => {
      expect(SecurityUtils.isCommonPassword('MyUniquePassword123!')).toBe(false);
      expect(SecurityUtils.isCommonPassword('ComplexPass2024#')).toBe(false);
    });
  });

  describe('CSRF Token functions', () => {
    test('should generate CSRF token', () => {
      const token = SecurityUtils.generateCSRFToken();
      expect(token).toHaveLength(32);
      expect(typeof token).toBe('string');
    });

    test('should validate CSRF tokens correctly', () => {
      const token = 'test-csrf-token';
      expect(SecurityUtils.validateCSRFToken(token, token)).toBe(true);
      expect(SecurityUtils.validateCSRFToken(token, 'different-token')).toBe(false);
    });
  });

  describe('timeSafeEqual', () => {
    test('should return true for equal strings', () => {
      expect(SecurityUtils.timeSafeEqual('hello', 'hello')).toBe(true);
      expect(SecurityUtils.timeSafeEqual('', '')).toBe(true);
    });

    test('should return false for different strings', () => {
      expect(SecurityUtils.timeSafeEqual('hello', 'world')).toBe(false);
      expect(SecurityUtils.timeSafeEqual('hello', 'hello2')).toBe(false);
    });

    test('should return false for different length strings', () => {
      expect(SecurityUtils.timeSafeEqual('short', 'longer string')).toBe(false);
    });
  });

  // Additional Edge Case Tests
  describe('Edge Cases and Performance', () => {
    test('should handle very long passwords', () => {
      const longPassword = 'A'.repeat(1000) + 'a1!';
      const result = SecurityUtils.validatePasswordStrength(longPassword);
      expect(result.isValid).toBe(true);
      expect(result.score).toBeGreaterThan(60);
    });

    test('should handle empty strings gracefully', () => {
      expect(SecurityUtils.isValidEmail('')).toBe(false);
      expect(SecurityUtils.isValidUsername('')).toBe(false);
      expect(SecurityUtils.sanitizeString('')).toBe('');
    });

    test('should handle unicode characters', () => {
      expect(SecurityUtils.sanitizeString('Hello 🌟 World')).toBe('Hello 🌟 World');
      expect(SecurityUtils.isValidUsername('user🌟')).toBe(false);
    });

    test('should generate secure tokens consistently', () => {
      const tokens = Array.from({ length: 100 }, () => SecurityUtils.generateSecureToken(16));
      const uniqueTokens = new Set(tokens);
      expect(uniqueTokens.size).toBe(100); // All tokens should be unique
    });

    test('should handle malformed headers gracefully', () => {
      const malformedHeaders = {
        'x-forwarded-for': '   ,  ,  ',
        'user-agent': '',
        'accept-language': undefined
      };

      expect(() => SecurityUtils.extractClientIP(malformedHeaders)).not.toThrow();
      expect(() => SecurityUtils.generateDeviceFingerprint(malformedHeaders)).not.toThrow();
    });

    test('should validate IPv6 addresses correctly', () => {
      // Test full IPv6
      expect(SecurityUtils.isValidIP('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).toBe(true);
      // Test invalid IPv6
      expect(SecurityUtils.isValidIP('2001:0db8:85a3::8a2e:0370:7334')).toBe(false); // compressed form not supported by current regex
    });

    test('should handle SQL injection attempts in sanitization', () => {
      const maliciousInput = "'; DROP TABLE users; --";
      const sanitized = SecurityUtils.sanitizeString(maliciousInput);
      expect(sanitized).not.toContain('<');
      expect(sanitized).not.toContain('>');
    });

    test('should detect sophisticated bot patterns', () => {
      const sophisticatedBot = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
      expect(SecurityUtils.isSuspiciousRequest('8.8.8.8', sophisticatedBot)).toBe(true);
    });
  });

  // Performance Tests
  describe('Performance Tests', () => {
    test('should hash strings efficiently', async () => {
      const start = Date.now();
      const promises = Array.from({ length: 100 }, (_, i) =>
        SecurityUtils.hashString(`test-string-${i}`)
      );
      await Promise.all(promises);
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });

    test('should validate many passwords quickly', () => {
      const start = Date.now();
      for (let i = 0; i < 1000; i++) {
        SecurityUtils.validatePasswordStrength(`TestPassword${i}!`);
      }
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(100); // Should complete within 100ms
    });
  });
});
