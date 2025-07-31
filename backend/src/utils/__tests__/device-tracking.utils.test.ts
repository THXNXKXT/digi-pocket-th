import { describe, test, expect } from 'bun:test';
import { DeviceTrackingUtils } from '../device-tracking.utils';

describe('DeviceTrackingUtils', () => {
  
  describe('extractDeviceInfo', () => {
    test('should detect mobile devices', () => {
      const mobileUA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15';
      const deviceInfo = DeviceTrackingUtils.extractDeviceInfo(mobileUA);
      
      expect(deviceInfo.isMobile).toBe(true);
      expect(deviceInfo.isDesktop).toBe(false);
      expect(deviceInfo.device).toBe('iPhone');
      expect(deviceInfo.os).toContain('iOS');
    });
    
    test('should detect desktop devices', () => {
      const desktopUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
      const deviceInfo = DeviceTrackingUtils.extractDeviceInfo(desktopUA);
      
      expect(deviceInfo.isDesktop).toBe(true);
      expect(deviceInfo.isMobile).toBe(false);
      expect(deviceInfo.browser).toBe('Chrome');
      expect(deviceInfo.os).toContain('Windows');
    });
    
    test('should detect tablets', () => {
      const tabletUA = 'Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15';
      const deviceInfo = DeviceTrackingUtils.extractDeviceInfo(tabletUA);
      
      expect(deviceInfo.isTablet).toBe(true);
      expect(deviceInfo.isMobile).toBe(false);
      expect(deviceInfo.device).toBe('iPad');
    });
  });
  
  describe('extractBrowser', () => {
    test('should detect Chrome', () => {
      const chromeUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
      expect(DeviceTrackingUtils.extractBrowser(chromeUA)).toBe('Chrome');
    });
    
    test('should detect Firefox', () => {
      const firefoxUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0';
      expect(DeviceTrackingUtils.extractBrowser(firefoxUA)).toBe('Firefox');
    });
    
    test('should detect Safari', () => {
      const safariUA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15';
      expect(DeviceTrackingUtils.extractBrowser(safariUA)).toBe('Safari');
    });
    
    test('should detect Edge', () => {
      const edgeUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59';
      expect(DeviceTrackingUtils.extractBrowser(edgeUA)).toBe('Edge');
    });
  });
  
  describe('extractOS', () => {
    test('should detect Windows versions', () => {
      expect(DeviceTrackingUtils.extractOS('Mozilla/5.0 (Windows NT 10.0; Win64; x64)')).toBe('Windows 10');
      expect(DeviceTrackingUtils.extractOS('Mozilla/5.0 (Windows NT 6.1; Win64; x64)')).toBe('Windows 7');
    });
    
    test('should detect macOS', () => {
      const macUA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)';
      expect(DeviceTrackingUtils.extractOS(macUA)).toBe('macOS 10.15');
    });
    
    test('should detect iOS', () => {
      const iosUA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)';
      expect(DeviceTrackingUtils.extractOS(iosUA)).toBe('iOS 14.7');
    });

    test('should detect Android', () => {
      const androidUA = 'Mozilla/5.0 (Linux; Android 11; SM-G991B)';
      expect(DeviceTrackingUtils.extractOS(androidUA)).toBe('Android 11');
    });
  });
  
  describe('analyzeIP', () => {
    test('should detect private IPs', () => {
      expect(DeviceTrackingUtils.analyzeIP('192.168.1.1').isPrivate).toBe(true);
      expect(DeviceTrackingUtils.analyzeIP('10.0.0.1').isPrivate).toBe(true);
      expect(DeviceTrackingUtils.analyzeIP('172.16.0.1').isPrivate).toBe(true);
    });
    
    test('should detect public IPs', () => {
      expect(DeviceTrackingUtils.analyzeIP('8.8.8.8').isPrivate).toBe(false);
      expect(DeviceTrackingUtils.analyzeIP('1.1.1.1').isPrivate).toBe(false);
    });
    
    test('should detect localhost', () => {
      expect(DeviceTrackingUtils.analyzeIP('127.0.0.1').isLocalhost).toBe(true);
      expect(DeviceTrackingUtils.analyzeIP('::1').isLocalhost).toBe(true);
    });
    
    test('should detect IPv6', () => {
      expect(DeviceTrackingUtils.analyzeIP('2001:db8::1').isIPv6).toBe(true);
      expect(DeviceTrackingUtils.analyzeIP('192.168.1.1').isIPv6).toBe(false);
    });
    
    test('should generate IP ranges', () => {
      expect(DeviceTrackingUtils.getIPRange('192.168.1.100')).toBe('192.168.x.x');
      expect(DeviceTrackingUtils.getIPRange('8.8.8.8')).toBe('8.8.x.x');
    });
  });
  
  describe('generateDeviceFingerprint', () => {
    test('should generate consistent fingerprints', async () => {
      const headers = {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'accept-language': 'en-US,en;q=0.9',
        'accept-encoding': 'gzip, deflate, br',
        'accept': 'text/html,application/xhtml+xml'
      };
      
      const fingerprint1 = await DeviceTrackingUtils.generateDeviceFingerprint(headers);
      const fingerprint2 = await DeviceTrackingUtils.generateDeviceFingerprint(headers);
      
      expect(fingerprint1).toBe(fingerprint2);
      expect(fingerprint1).toHaveLength(16);
    });
    
    test('should generate different fingerprints for different headers', async () => {
      const headers1 = {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0',
        'accept-language': 'en-US,en;q=0.9'
      };
      
      const headers2 = {
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1',
        'accept-language': 'th-TH,th;q=0.9'
      };
      
      const fingerprint1 = await DeviceTrackingUtils.generateDeviceFingerprint(headers1);
      const fingerprint2 = await DeviceTrackingUtils.generateDeviceFingerprint(headers2);
      
      expect(fingerprint1).not.toBe(fingerprint2);
    });
  });
  
  describe('updateDeviceHistory', () => {
    test('should add new device to empty history', () => {
      const deviceHistory: any[] = [];
      const deviceInfo = {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        browser: 'Chrome',
        browserVersion: '91.0',
        os: 'Windows 10',
        device: 'Windows PC'
      };
      
      const updated = DeviceTrackingUtils.updateDeviceHistory(
        deviceHistory,
        'abc123',
        deviceInfo
      );
      
      expect(updated).toHaveLength(1);
      expect(updated[0].fingerprint).toBe('abc123');
      expect(updated[0].count).toBe(1);
    });
    
    test('should update existing device', () => {
      const deviceHistory = [{
        fingerprint: 'abc123',
        info: { browser: 'Chrome' },
        firstSeen: '2024-01-01T00:00:00.000Z',
        lastSeen: '2024-01-01T00:00:00.000Z',
        count: 1
      }];
      
      const deviceInfo = {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        browser: 'Chrome',
        browserVersion: '92.0',
        os: 'Windows 10',
        device: 'Windows PC'
      };
      
      const updated = DeviceTrackingUtils.updateDeviceHistory(
        deviceHistory,
        'abc123',
        deviceInfo
      );
      
      expect(updated).toHaveLength(1);
      expect(updated[0].count).toBe(2);
      expect(updated[0].info.browserVersion).toBe('92.0');
    });
    
    test('should limit history to 10 devices', () => {
      const deviceHistory = Array.from({ length: 10 }, (_, i) => ({
        fingerprint: `device${i}`,
        info: { browser: 'Chrome' },
        firstSeen: '2024-01-01T00:00:00.000Z',
        lastSeen: '2024-01-01T00:00:00.000Z',
        count: 1
      }));
      
      const deviceInfo = {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        browser: 'Firefox',
        browserVersion: '89.0',
        os: 'Windows 10',
        device: 'Windows PC'
      };
      
      const updated = DeviceTrackingUtils.updateDeviceHistory(
        deviceHistory,
        'newdevice',
        deviceInfo
      );
      
      expect(updated).toHaveLength(10);
      expect(updated[0].fingerprint).toBe('newdevice');
      expect(updated[9].fingerprint).toBe('device8'); // Last device should be device8 (0-8 = 9 devices + new one)
    });
  });
  
  describe('updateIPHistory', () => {
    test('should add new IP to history', () => {
      const ipHistory: any[] = [];
      const ipInfo = {
        isPrivate: false,
        isLocalhost: false,
        isIPv6: false,
        range: '8.8.x.x',
        type: 'public' as const
      };
      
      const updated = DeviceTrackingUtils.updateIPHistory(
        ipHistory,
        '8.8.8.8',
        ipInfo
      );
      
      expect(updated).toHaveLength(1);
      expect(updated[0].ip).toBe('8.8.8.8');
    });
    
    test('should update existing IP position', () => {
      const ipHistory = [
        { ip: '1.1.1.1', info: { type: 'public' }, timestamp: '2024-01-01T00:00:00.000Z' },
        { ip: '8.8.8.8', info: { type: 'public' }, timestamp: '2024-01-01T00:00:00.000Z' }
      ];
      
      const ipInfo = {
        isPrivate: false,
        isLocalhost: false,
        isIPv6: false,
        range: '8.8.x.x',
        type: 'public' as const
      };
      
      const updated = DeviceTrackingUtils.updateIPHistory(
        ipHistory,
        '8.8.8.8',
        ipInfo
      );
      
      expect(updated).toHaveLength(2);
      expect(updated[0].ip).toBe('8.8.8.8'); // Should be moved to front
      expect(updated[1].ip).toBe('1.1.1.1');
    });
    
    test('should limit history to 20 IPs', () => {
      const ipHistory = Array.from({ length: 20 }, (_, i) => ({
        ip: `192.168.1.${i + 1}`,
        info: { type: 'private' },
        timestamp: '2024-01-01T00:00:00.000Z'
      }));
      
      const ipInfo = {
        isPrivate: false,
        isLocalhost: false,
        isIPv6: false,
        range: '8.8.x.x',
        type: 'public' as const
      };
      
      const updated = DeviceTrackingUtils.updateIPHistory(
        ipHistory,
        '8.8.8.8',
        ipInfo
      );
      
      expect(updated).toHaveLength(20);
      expect(updated[0].ip).toBe('8.8.8.8');
      expect(updated[19].ip).toBe('192.168.1.19'); // Last IP should be 192.168.1.19 (1-20 = 20 IPs, last one kept)
    });
  });
  
  describe('utility functions', () => {
    test('should detect new devices', () => {
      const deviceHistory = [
        { fingerprint: 'abc123', info: {}, firstSeen: '', lastSeen: '', count: 1 },
        { fingerprint: 'def456', info: {}, firstSeen: '', lastSeen: '', count: 1 }
      ];
      
      expect(DeviceTrackingUtils.isNewDevice(deviceHistory, 'abc123')).toBe(false);
      expect(DeviceTrackingUtils.isNewDevice(deviceHistory, 'xyz789')).toBe(true);
    });
    
    test('should detect new IP ranges', () => {
      const ipHistory = [
        { ip: '192.168.1.1', info: {}, timestamp: '' },
        { ip: '8.8.8.8', info: {}, timestamp: '' }
      ];
      
      expect(DeviceTrackingUtils.isNewIPRange(ipHistory, '192.168.1.100')).toBe(false);
      expect(DeviceTrackingUtils.isNewIPRange(ipHistory, '1.1.1.1')).toBe(true);
    });
  });
});
