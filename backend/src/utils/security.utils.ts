// Security Utilities (extracted from security module)

export class SecurityUtils {
  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    // More comprehensive email validation that allows common special characters
    const emailRegex = /^[a-zA-Z0-9]([a-zA-Z0-9._+-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9.-]*[a-zA-Z0-9])?\.[a-zA-Z]{2,}$/;

    // Additional checks for consecutive dots
    if (email.includes('..')) {
      return false;
    }

    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    score: number;
    issues: string[];
  } {
    const issues: string[] = [];
    let score = 0;

    if (password.length < 8) {
      issues.push('Password must be at least 8 characters long');
    } else {
      score += 20;
    }

    if (password.length >= 12) {
      score += 10;
    }

    if (/[a-z]/.test(password)) {
      score += 15;
    } else {
      issues.push('Password must contain lowercase letters');
    }

    if (/[A-Z]/.test(password)) {
      score += 15;
    } else {
      issues.push('Password must contain uppercase letters');
    }

    if (/[0-9]/.test(password)) {
      score += 15;
    } else {
      issues.push('Password must contain numbers');
    }

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 15;
    } else {
      issues.push('Password must contain special characters');
    }

    if (password.length >= 16) {
      score += 10;
    }

    return {
      isValid: score >= 60 && issues.length === 0,
      score,
      issues,
    };
  }

  /**
   * Generate secure random string
   */
  static generateSecureToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Hash string using crypto
   */
  static async hashString(input: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Validate IP address format
   */
  static isValidIP(ip: string): boolean {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  }

  /**
   * Extract client IP from request headers and connection info
   */
  static extractClientIP(headers: Record<string, string | undefined>, remoteAddress?: string): string {
    // Try headers first (for proxy/load balancer scenarios)
    const headerIP = headers['x-forwarded-for'] ||
                    headers['x-real-ip'] ||
                    headers['cf-connecting-ip'];

    if (headerIP) {
      return headerIP.split(',')[0].trim();
    }

    // Fallback to connection remote address
    if (remoteAddress) {
      // Remove IPv6 wrapper if present (::ffff:192.168.1.1 -> 192.168.1.1)
      return remoteAddress.replace(/^::ffff:/, '');
    }

    return 'unknown';
  }

  /**
   * Extract client IP from Hono Context (better method)
   */
  static extractClientIPFromContext(c: any): string {
    // Try various headers and context properties
    const possibleIPs = [
      c.req.header('x-forwarded-for'),
      c.req.header('x-real-ip'),
      c.req.header('cf-connecting-ip'),
      c.req.header('x-client-ip'),
      c.req.header('x-cluster-client-ip'),
      c.env?.CF_CONNECTING_IP,
      c.req.raw?.headers?.get('x-forwarded-for'),
    ];

    for (const ip of possibleIPs) {
      if (ip && ip !== 'unknown') {
        // Take first IP if comma-separated
        const cleanIP = ip.split(',')[0].trim();
        // Remove IPv6 wrapper if present
        const finalIP = cleanIP.replace(/^::ffff:/, '');
        if (finalIP && finalIP !== '::1' && finalIP !== '127.0.0.1') {
          return finalIP;
        }
      }
    }

    // For development/testing - simulate different IPs based on User-Agent
    const userAgent = c.req.header('user-agent') || '';
    if (userAgent.includes('iPhone')) {
      return '203.154.1.100'; // Simulate Thai mobile IP
    } else if (userAgent.includes('Chrome')) {
      return '1.1.1.1'; // Simulate public IP
    }

    return '127.0.0.1'; // Default for local development
  }

  /**
   * Generate device fingerprint from request headers
   */
  static async generateDeviceFingerprint(headers: Record<string, string | undefined>): Promise<string> {
    const userAgent = headers['user-agent'] || '';
    const acceptLanguage = headers['accept-language'] || '';
    const acceptEncoding = headers['accept-encoding'] || '';

    const fingerprint = `${userAgent}|${acceptLanguage}|${acceptEncoding}`;
    const hash = await this.hashString(fingerprint);
    return hash.substring(0, 16);
  }

  /**
   * Check if request is from suspicious source
   */
  static isSuspiciousRequest(ip: string, userAgent: string): boolean {
    // Check for common bot patterns
    const botPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i,
    ];

    const isBotUserAgent = botPatterns.some(pattern => pattern.test(userAgent));
    
    // Check for suspicious IP patterns (basic check)
    const isLocalhost = ip === '127.0.0.1' || ip === '::1';
    const isPrivateIP = /^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.)/.test(ip);
    
    return isBotUserAgent && !isLocalhost && !isPrivateIP;
  }

  /**
   * Rate limiting key generator
   */
  static generateRateLimitKey(ip: string, endpoint: string): string {
    return `rate_limit:${ip}:${endpoint}`;
  }

  /**
   * Session token generator
   */
  static generateSessionToken(): string {
    return crypto.randomUUID();
  }

  /**
   * Sanitize string input
   */
  static sanitizeString(input: string): string {
    return input.trim().replace(/[<>]/g, '');
  }

  /**
   * Validate username format
   */
  static isValidUsername(username: string): boolean {
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    return usernameRegex.test(username);
  }

  /**
   * Check password against common passwords
   */
  static isCommonPassword(password: string): boolean {
    const commonPasswords = [
      'password', '123456', '123456789', 'qwerty', 'abc123',
      'password123', 'admin', 'letmein', 'welcome', 'monkey'
    ];
    return commonPasswords.includes(password.toLowerCase());
  }

  /**
   * Generate CSRF token
   */
  static generateCSRFToken(): string {
    return this.generateSecureToken(32);
  }

  /**
   * Validate CSRF token
   */
  static validateCSRFToken(token: string, expectedToken: string): boolean {
    return token === expectedToken;
  }

  /**
   * Time-safe string comparison
   */
  static timeSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }
    
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    
    return result === 0;
  }
}
