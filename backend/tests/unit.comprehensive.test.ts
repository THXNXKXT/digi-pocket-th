import { describe, it, expect } from 'bun:test';
import { SecurityUtils } from '../src/utils/security.utils';
import { DeviceTrackingUtils } from '../src/utils/device-tracking.utils';

describe('🧪 Unit Tests - Comprehensive', () => {
  describe('🔐 SecurityUtils', () => {
    describe('Password Validation', () => {
      it('should validate strong passwords', () => {
        const strongPasswords = [
          'MyStrongPassword123!',
          'AnotherGood1@',
          'Complex#Pass9',
          'Secure$123Password',
        ];

        strongPasswords.forEach(password => {
          const result = SecurityUtils.validatePasswordStrength(password);
          expect(result.isValid).toBe(true);
          expect(result.issues).toHaveLength(0);
        });
      });

      it('should reject weak passwords', () => {
        const weakPasswords = [
          '123456',
          'password',
          'abc123',
          'Password',
          'password123',
          'PASSWORD123',
          'Pass123',
          'short',
        ];

        weakPasswords.forEach(password => {
          const result = SecurityUtils.validatePasswordStrength(password);
          expect(result.isValid).toBe(false);
          expect(result.issues.length).toBeGreaterThan(0);
        });
      });

      it('should provide specific error messages', () => {
        const result = SecurityUtils.validatePasswordStrength('weak');
        expect(result.issues).toContain('Password must be at least 8 characters long');
        expect(result.issues).toContain('Password must contain uppercase letters');
        expect(result.issues).toContain('Password must contain numbers');
        expect(result.issues).toContain('Password must contain special characters');
      });
    });

    describe('Email Validation', () => {
      it('should validate correct email formats', () => {
        const validEmails = [
          'user@example.com',
          'test.email@domain.co.th',
          'user+tag@example.org',
          'firstname.lastname@company.com',
          'user123@test-domain.com',
        ];

        validEmails.forEach(email => {
          expect(SecurityUtils.isValidEmail(email)).toBe(true);
        });
      });

      it('should reject invalid email formats', () => {
        const invalidEmails = [
          'invalid-email',
          '@domain.com',
          'user@',
          'user..name@domain.com',
          'user@domain',
          'user@.domain.com',
          'user name@domain.com',
          'user@domain..com',
        ];

        invalidEmails.forEach(email => {
          expect(SecurityUtils.isValidEmail(email)).toBe(false);
        });
      });
    });

    describe('Username Validation', () => {
      it('should validate correct usernames', () => {
        const validUsernames = [
          'user123',
          'test_user',
          'username',
          'user-name',
          'TestUser',
          'user_123',
        ];

        validUsernames.forEach(username => {
          expect(SecurityUtils.isValidUsername(username)).toBe(true);
        });
      });

      it('should reject invalid usernames', () => {
        const invalidUsernames = [
          'ab',           // Too short
          'a'.repeat(21), // Too long
          'user name',    // Contains space
          'user@name',    // Contains @
          'user#name',    // Contains #
          'user.name',    // Contains dot
          '',             // Empty string
        ];

        invalidUsernames.forEach(username => {
          expect(SecurityUtils.isValidUsername(username)).toBe(false);
        });
      });
    });

    describe('IP Address Validation', () => {
      it('should validate correct IP addresses', () => {
        const validIPs = [
          '127.0.0.1',
          '192.168.1.1',
          '10.0.0.1',
          '172.16.0.1',
          '8.8.8.8',
          '1.1.1.1',
          '203.154.1.100',
        ];

        validIPs.forEach(ip => {
          expect(SecurityUtils.isValidIP(ip)).toBe(true);
        });
      });

      it('should reject invalid IP addresses', () => {
        const invalidIPs = [
          '256.256.256.256',
          '192.168.1',
          'not-an-ip',
          '192.168.1.1.1',
          '',
        ];

        invalidIPs.forEach(ip => {
          expect(SecurityUtils.isValidIP(ip)).toBe(false);
        });
      });
    });

    describe('Token Generation', () => {
      it('should generate secure tokens', () => {
        const token1 = SecurityUtils.generateSecureToken(32);
        const token2 = SecurityUtils.generateSecureToken(32);

        expect(token1).toHaveLength(32);
        expect(token2).toHaveLength(32);
        expect(token1).not.toBe(token2);
        expect(/^[a-zA-Z0-9]+$/.test(token1)).toBe(true);
      });

      it('should generate tokens of different lengths', () => {
        const lengths = [16, 32, 64];

        lengths.forEach(length => {
          const token = SecurityUtils.generateSecureToken(length);
          expect(token).toHaveLength(length);
          expect(/^[a-zA-Z0-9]+$/.test(token)).toBe(true);
        });
      });

      it('should generate session tokens', () => {
        const sessionToken1 = SecurityUtils.generateSessionToken();
        const sessionToken2 = SecurityUtils.generateSessionToken();

        expect(sessionToken1).toBeDefined();
        expect(sessionToken2).toBeDefined();
        expect(sessionToken1).not.toBe(sessionToken2);
        expect(typeof sessionToken1).toBe('string');
      });
    });
  });

  describe('📱 DeviceTrackingUtils', () => {
    describe('Device Fingerprinting', () => {
      it('should generate consistent fingerprints for same headers', async () => {
        const headers = {
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'accept-language': 'en-US,en;q=0.9',
          'accept-encoding': 'gzip, deflate, br',
        };

        const fingerprint1 = await DeviceTrackingUtils.generateDeviceFingerprint(headers);
        const fingerprint2 = await DeviceTrackingUtils.generateDeviceFingerprint(headers);

        expect(fingerprint1).toBe(fingerprint2);
        expect(fingerprint1).toHaveLength(16); // MD5 hash length
      });

      it('should generate different fingerprints for different headers', async () => {
        const headers1 = {
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'accept-language': 'en-US,en;q=0.9',
        };

        const headers2 = {
          'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)',
          'accept-language': 'th-TH,th;q=0.9',
        };

        const fingerprint1 = await DeviceTrackingUtils.generateDeviceFingerprint(headers1);
        const fingerprint2 = await DeviceTrackingUtils.generateDeviceFingerprint(headers2);

        expect(fingerprint1).not.toBe(fingerprint2);
      });
    });

    describe('Browser Detection', () => {
      it('should detect browsers correctly', () => {
        const testCases = [
          {
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            expected: 'Chrome'
          },
          {
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
            expected: 'Firefox'
          },
          {
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
            expected: 'Safari'
          },
          {
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59',
            expected: 'Edge'
          },
        ];

        testCases.forEach(({ userAgent, expected }) => {
          const browser = DeviceTrackingUtils.extractBrowser(userAgent);
          expect(browser).toBe(expected);
        });
      });

      it('should return Unknown for unrecognized user agents', () => {
        const unknownUserAgents = [
          'CustomBrowser/1.0',
          'curl/7.68.0',
          '',
          'SomeWeirdBrowser',
        ];

        unknownUserAgents.forEach(userAgent => {
          const browser = DeviceTrackingUtils.extractBrowser(userAgent);
          expect(['Unknown', 'API Client']).toContain(browser);
        });
      });
    });

    describe('Operating System Detection', () => {
      it('should detect operating systems correctly', () => {
        const testCases = [
          {
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            expected: 'Windows 10'
          },
          {
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15',
            expected: 'macOS 10.15'
          },
          {
            userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
            expected: 'Linux'
          },
          {
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)',
            expected: 'iOS 14.7'
          },
          {
            userAgent: 'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36',
            expected: 'Android 11'
          },
        ];

        testCases.forEach(({ userAgent, expected }) => {
          const deviceInfo = DeviceTrackingUtils.extractDeviceInfo(userAgent);
          expect(deviceInfo.os).toBe(expected);
        });
      });
    });

    describe('Device Type Detection', () => {
      it('should detect device types correctly', () => {
        const testCases = [
          {
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)',
            expectedDevice: 'iPhone',
            expectedMobile: true,
            expectedTablet: false,
            expectedDesktop: false
          },
          {
            userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X)',
            expectedDevice: 'iPad',
            expectedMobile: false,
            expectedTablet: true,
            expectedDesktop: false
          },
          {
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            expectedDevice: 'Windows PC',
            expectedMobile: false,
            expectedTablet: false,
            expectedDesktop: true
          },
        ];

        testCases.forEach(({ userAgent, expectedDevice, expectedMobile, expectedTablet, expectedDesktop }) => {
          const deviceInfo = DeviceTrackingUtils.extractDeviceInfo(userAgent);
          expect(deviceInfo.device).toBe(expectedDevice);
          expect(deviceInfo.isMobile).toBe(expectedMobile);
          expect(deviceInfo.isTablet).toBe(expectedTablet);
          expect(deviceInfo.isDesktop).toBe(expectedDesktop);
        });
      });
    });
  });

  describe('🔧 Utility Functions', () => {
    describe('Data Sanitization', () => {
      it('should sanitize input strings', () => {
        const testCases = [
          { input: '<script>alert("xss")</script>' },
          { input: 'SELECT * FROM users; DROP TABLE users;' },
          { input: 'Normal text' },
          { input: 'Text with "quotes" and \'apostrophes\'' },
        ];

        testCases.forEach(({ input }) => {
          const sanitized = SecurityUtils.sanitizeString(input);
          expect(sanitized).not.toContain('<script>');
          expect(sanitized).not.toContain('</script>');
          expect(typeof sanitized).toBe('string');
        });
      });
    });

    describe('Rate Limiting Helpers', () => {
      it('should generate rate limit keys correctly', () => {
        const ip = '192.168.1.1';
        const endpoint = 'login';

        const key = SecurityUtils.generateRateLimitKey(ip, endpoint);
        expect(key).toBe('rate_limit:192.168.1.1:login');
        expect(typeof key).toBe('string');
        expect(key).toContain(ip);
        expect(key).toContain(endpoint);
      });
    });

    describe('Crypto Utilities', () => {
      it('should generate secure random tokens', () => {
        const token1 = SecurityUtils.generateSecureToken(32);
        const token2 = SecurityUtils.generateSecureToken(32);

        expect(token1).toHaveLength(32);
        expect(token2).toHaveLength(32);
        expect(token1).not.toBe(token2);
        expect(/^[a-zA-Z0-9]+$/.test(token1)).toBe(true);
      });

      it('should generate tokens of different lengths', () => {
        const lengths = [16, 32, 64];

        lengths.forEach(length => {
          const token = SecurityUtils.generateSecureToken(length);
          expect(token).toHaveLength(length);
          expect(/^[a-zA-Z0-9]+$/.test(token)).toBe(true);
        });
      });
    });
  });
});
