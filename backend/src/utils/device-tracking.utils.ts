import { SecurityUtils } from './security.utils';

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  browser: string;
  browserVersion: string;
  os: string;
  device: string;
}

export interface IPInfo {
  isPrivate: boolean;
  isLocalhost: boolean;
  isIPv6: boolean;
  range: string;
  type: 'private' | 'public' | 'localhost';
}

export interface DeviceRecord {
  fingerprint: string;
  info: DeviceInfo;
  firstSeen: string;
  lastSeen: string;
  count: number;
}

export interface IPRecord {
  ip: string;
  info: IPInfo;
  timestamp: string;
}

export class DeviceTrackingUtils {
  
  /**
   * Extract device information from User-Agent string
   */
  static extractDeviceInfo(userAgent: string): DeviceInfo {
    const ua = userAgent || '';
    
    // Mobile detection
    const isMobile = /Mobile|Android|iPhone|iPod/.test(ua);
    const isTablet = /iPad|Android(?!.*Mobile)|Tablet/.test(ua);
    const isDesktop = !isMobile && !isTablet;
    
    return {
      isMobile,
      isTablet,
      isDesktop,
      browser: this.extractBrowser(ua),
      browserVersion: this.extractBrowserVersion(ua),
      os: this.extractOS(ua),
      device: this.extractDevice(ua)
    };
  }
  
  /**
   * Extract browser name from User-Agent
   */
  static extractBrowser(userAgent: string): string {
    const ua = userAgent || '';

    if (/Edg\//.test(ua)) return 'Edge';
    if (/Chrome\//.test(ua) && !/Edg\//.test(ua)) return 'Chrome';
    if (/Firefox\//.test(ua)) return 'Firefox';
    if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) return 'Safari';
    if (/Opera|OPR\//.test(ua)) return 'Opera';

    // Additional detection for testing tools
    if (/node-fetch|fetch|curl|postman/i.test(ua)) return 'API Client';
    if (ua.includes('Mozilla/5.0') && !ua.includes('Chrome') && !ua.includes('Safari')) return 'Generic Browser';

    return 'Unknown';
  }
  
  /**
   * Extract browser version from User-Agent
   */
  static extractBrowserVersion(userAgent: string): string {
    const ua = userAgent || '';
    
    const patterns = [
      /Chrome\/(\d+\.\d+)/,
      /Firefox\/(\d+\.\d+)/,
      /Safari\/(\d+\.\d+)/,
      /Edg\/(\d+\.\d+)/,
      /Opera\/(\d+\.\d+)/,
      /OPR\/(\d+\.\d+)/
    ];
    
    for (const pattern of patterns) {
      const match = ua.match(pattern);
      if (match) return match[1];
    }
    
    return 'Unknown';
  }
  
  /**
   * Extract operating system from User-Agent
   */
  static extractOS(userAgent: string): string {
    const ua = userAgent || '';

    // Check iOS first (before Mac OS X check)
    if (/iPhone OS (\d+_\d+)/.test(ua)) {
      const match = ua.match(/iPhone OS (\d+_\d+)/);
      const version = match?.[1]?.replace('_', '.') || 'Unknown';
      return `iOS ${version}`;
    }
    if (/iPad.*OS (\d+_\d+)/.test(ua)) {
      const match = ua.match(/iPad.*OS (\d+_\d+)/);
      const version = match?.[1]?.replace('_', '.') || 'Unknown';
      return `iPadOS ${version}`;
    }
    if (/iPhone|iPad/.test(ua) && /like Mac OS X/.test(ua)) return 'iOS';

    // Android detection
    if (/Android (\d+)/.test(ua)) {
      const match = ua.match(/Android (\d+)/);
      return `Android ${match?.[1] || 'Unknown'}`;
    }
    if (/Android/.test(ua)) return 'Android';

    // Windows detection
    if (/Windows NT 10/.test(ua)) return 'Windows 10';
    if (/Windows NT 6\.3/.test(ua)) return 'Windows 8.1';
    if (/Windows NT 6\.2/.test(ua)) return 'Windows 8';
    if (/Windows NT 6\.1/.test(ua)) return 'Windows 7';
    if (/Windows/.test(ua)) return 'Windows';

    // macOS detection (after iOS check)
    if (/Mac OS X 10[._](\d+)/.test(ua)) {
      const match = ua.match(/Mac OS X 10[._](\d+)/);
      return `macOS 10.${match?.[1] || 'x'}`;
    }
    if (/Mac OS X/.test(ua)) return 'macOS';

    // Linux detection
    if (/Ubuntu/.test(ua)) return 'Ubuntu';
    if (/Linux/.test(ua)) return 'Linux';

    return 'Unknown';
  }
  
  /**
   * Extract device type from User-Agent
   */
  static extractDevice(userAgent: string): string {
    const ua = userAgent || '';
    
    if (/iPhone/.test(ua)) return 'iPhone';
    if (/iPad/.test(ua)) return 'iPad';
    if (/Android.*Mobile/.test(ua)) return 'Android Phone';
    if (/Android/.test(ua)) return 'Android Tablet';
    if (/Windows Phone/.test(ua)) return 'Windows Phone';
    
    // Desktop detection
    if (/Windows/.test(ua)) return 'Windows PC';
    if (/Mac OS X/.test(ua)) return 'Mac';
    if (/Linux/.test(ua)) return 'Linux PC';
    
    return 'Unknown Device';
  }
  
  /**
   * Generate device fingerprint from headers
   */
  static async generateDeviceFingerprint(headers: Record<string, string>): Promise<string> {
    const components = [
      headers['user-agent'] || '',
      headers['accept-language'] || '',
      headers['accept-encoding'] || '',
      headers['accept'] || ''
    ];
    
    const combined = components.join('|');
    const hash = await SecurityUtils.hashString(combined);
    return hash.substring(0, 16);
  }
  
  /**
   * Analyze IP address information
   */
  static analyzeIP(ip: string): IPInfo {
    const isPrivate = /^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.)/.test(ip);
    const isLocalhost = ip === '127.0.0.1' || ip === '::1' || ip === 'localhost';
    const isIPv6 = ip.includes(':');
    
    let type: 'private' | 'public' | 'localhost';
    if (isLocalhost) type = 'localhost';
    else if (isPrivate) type = 'private';
    else type = 'public';
    
    return {
      isPrivate,
      isLocalhost,
      isIPv6,
      range: this.getIPRange(ip),
      type
    };
  }
  
  /**
   * Get IP range (first two octets for IPv4)
   */
  static getIPRange(ip: string): string {
    if (ip.includes(':')) {
      // IPv6 - return first 4 groups
      const groups = ip.split(':');
      return `${groups[0]}:${groups[1]}:${groups[2]}:${groups[3]}::`;
    }
    
    // IPv4 - return first two octets
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.x.x`;
    }
    
    return 'unknown';
  }
  
  /**
   * Check if device fingerprint is new for user
   */
  static isNewDevice(deviceHistory: DeviceRecord[], fingerprint: string): boolean {
    return !deviceHistory.some(device => device.fingerprint === fingerprint);
  }
  
  /**
   * Check if IP range is new for user
   */
  static isNewIPRange(ipHistory: IPRecord[], currentIP: string): boolean {
    const currentRange = this.getIPRange(currentIP);
    return !ipHistory.some(record => this.getIPRange(record.ip) === currentRange);
  }
  
  /**
   * Update device history with new login
   */
  static updateDeviceHistory(
    deviceHistory: DeviceRecord[], 
    fingerprint: string, 
    deviceInfo: DeviceInfo,
    timestamp: Date = new Date()
  ): DeviceRecord[] {
    const timestampStr = timestamp.toISOString();
    
    // Find existing device
    const existingIndex = deviceHistory.findIndex(d => d.fingerprint === fingerprint);
    
    if (existingIndex >= 0) {
      // Update existing device
      deviceHistory[existingIndex].lastSeen = timestampStr;
      deviceHistory[existingIndex].count += 1;
      deviceHistory[existingIndex].info = deviceInfo; // Update info in case of changes
    } else {
      // Add new device
      const newDevice: DeviceRecord = {
        fingerprint,
        info: deviceInfo,
        firstSeen: timestampStr,
        lastSeen: timestampStr,
        count: 1
      };
      deviceHistory.unshift(newDevice);
    }
    
    // Keep only last 10 devices
    return deviceHistory.slice(0, 10);
  }
  
  /**
   * Update IP history with new login
   */
  static updateIPHistory(
    ipHistory: IPRecord[], 
    ip: string, 
    ipInfo: IPInfo,
    timestamp: Date = new Date()
  ): IPRecord[] {
    const timestampStr = timestamp.toISOString();
    
    const newRecord: IPRecord = {
      ip,
      info: ipInfo,
      timestamp: timestampStr
    };
    
    // Remove existing record for same IP and add new one at the beginning
    const filteredHistory = ipHistory.filter(record => record.ip !== ip);
    const updatedHistory = [newRecord, ...filteredHistory];
    
    // Keep only last 20 IP records
    return updatedHistory.slice(0, 20);
  }
}
