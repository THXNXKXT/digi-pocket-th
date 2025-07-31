import Redis from 'ioredis';
import { env } from '../config/env';
import { CACHE_KEYS, ANNOUNCEMENT_CONSTANTS } from '../types';

export class CacheService {
    private redis: Redis;

    constructor() {
        this.redis = new Redis(env.redisUrl, {
            maxRetriesPerRequest: 3,
            lazyConnect: true,
        });

        this.redis.on('error', (error) => {
            console.error('Redis connection error:', error);
        });

        this.redis.on('connect', () => {
            console.log('Redis connected successfully');
        });
    }

    async get<T>(key: string): Promise<T | null> {
        try {
            const value = await this.redis.get(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    }

    async set(key: string, value: any, ttlSeconds?: number): Promise<boolean> {
        try {
            const serialized = JSON.stringify(value);
            if (ttlSeconds) {
                await this.redis.setex(key, ttlSeconds, serialized);
            } else {
                await this.redis.set(key, serialized);
            }
            return true;
        } catch (error) {
            console.error('Cache set error:', error);
            return false;
        }
    }

    async del(key: string): Promise<boolean> {
        try {
            await this.redis.del(key);
            return true;
        } catch (error) {
            console.error('Cache delete error:', error);
            return false;
        }
    }

    async delPattern(pattern: string): Promise<boolean> {
        try {
            const keys = await this.redis.keys(pattern);
            if (keys.length > 0) {
                await this.redis.del(...keys);
            }
            return true;
        } catch (error) {
            console.error('Cache delete pattern error:', error);
            return false;
        }
    }

    async exists(key: string): Promise<boolean> {
        try {
            const result = await this.redis.exists(key);
            return result === 1;
        } catch (error) {
            console.error('Cache exists error:', error);
            return false;
        }
    }

    async increment(key: string, ttlSeconds?: number): Promise<number> {
        try {
            const result = await this.redis.incr(key);
            if (ttlSeconds && result === 1) {
                // Set TTL only on first increment
                await this.redis.expire(key, ttlSeconds);
            }
            return result;
        } catch (error) {
            console.error('Cache increment error:', error);
            return 0;
        }
    }

    async setHash(key: string, field: string, value: any, ttlSeconds?: number): Promise<boolean> {
        try {
            const serialized = JSON.stringify(value);
            await this.redis.hset(key, field, serialized);
            if (ttlSeconds) {
                await this.redis.expire(key, ttlSeconds);
            }
            return true;
        } catch (error) {
            console.error('Cache set hash error:', error);
            return false;
        }
    }

    async getHash<T>(key: string, field: string): Promise<T | null> {
        try {
            const value = await this.redis.hget(key, field);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error('Cache get hash error:', error);
            return null;
        }
    }

    async getAllHash<T>(key: string): Promise<Record<string, T> | null> {
        try {
            const hash = await this.redis.hgetall(key);
            if (!hash || Object.keys(hash).length === 0) {
                return null;
            }

            const result: Record<string, T> = {};
            for (const [field, value] of Object.entries(hash)) {
                result[field] = JSON.parse(value);
            }
            return result;
        } catch (error) {
            console.error('Cache get all hash error:', error);
            return null;
        }
    }

    // Announcement-specific cache methods
    async cachePublishedAnnouncements(filters: string, data: any): Promise<boolean> {
        const key = CACHE_KEYS.PUBLISHED_ANNOUNCEMENTS(filters);
        return this.set(key, data, ANNOUNCEMENT_CONSTANTS.CACHE_TTL.PUBLISHED_ANNOUNCEMENTS);
    }

    async getCachedPublishedAnnouncements<T>(filters: string): Promise<T | null> {
        const key = CACHE_KEYS.PUBLISHED_ANNOUNCEMENTS(filters);
        return this.get<T>(key);
    }

    async cacheUnreadCount(userId: string, count: number): Promise<boolean> {
        const key = CACHE_KEYS.UNREAD_COUNT(userId);
        return this.set(key, count, ANNOUNCEMENT_CONSTANTS.CACHE_TTL.UNREAD_COUNT);
    }

    async getCachedUnreadCount(userId: string): Promise<number | null> {
        const key = CACHE_KEYS.UNREAD_COUNT(userId);
        return this.get<number>(key);
    }

    async cacheAnnouncementDetail(id: string, data: any): Promise<boolean> {
        const key = CACHE_KEYS.ANNOUNCEMENT_DETAIL(id);
        return this.set(key, data, ANNOUNCEMENT_CONSTANTS.CACHE_TTL.PUBLISHED_ANNOUNCEMENTS);
    }

    async getCachedAnnouncementDetail<T>(id: string): Promise<T | null> {
        const key = CACHE_KEYS.ANNOUNCEMENT_DETAIL(id);
        return this.get<T>(key);
    }

    async cacheAnalytics(id: string, data: any): Promise<boolean> {
        const key = CACHE_KEYS.ANALYTICS(id);
        return this.set(key, data, ANNOUNCEMENT_CONSTANTS.CACHE_TTL.ANALYTICS);
    }

    async getCachedAnalytics<T>(id: string): Promise<T | null> {
        const key = CACHE_KEYS.ANALYTICS(id);
        return this.get<T>(key);
    }

    // Cache invalidation methods
    async invalidateAnnouncementCaches(announcementId?: string): Promise<boolean> {
        try {
            // Invalidate published announcements cache (all filter combinations)
            await this.delPattern('announcements:published:*');

            // Invalidate all unread counts
            await this.delPattern('announcements:unread:*');

            if (announcementId) {
                // Invalidate specific announcement detail cache
                await this.del(CACHE_KEYS.ANNOUNCEMENT_DETAIL(announcementId));

                // Invalidate specific announcement analytics cache
                await this.del(CACHE_KEYS.ANALYTICS(announcementId));
            }

            return true;
        } catch (error) {
            console.error('Cache invalidation error:', error);
            return false;
        }
    }

    async invalidateUserCache(userId: string): Promise<boolean> {
        try {
            // Invalidate user's unread count
            await this.del(CACHE_KEYS.UNREAD_COUNT(userId));
            return true;
        } catch (error) {
            console.error('User cache invalidation error:', error);
            return false;
        }
    }

    // Cache warming methods
    async warmCache(key: string, dataFetcher: () => Promise<any>, ttlSeconds: number): Promise<any> {
        try {
            // Check if data exists in cache
            const cached = await this.get(key);
            if (cached) {
                return cached;
            }

            // Fetch fresh data
            const freshData = await dataFetcher();

            // Cache the fresh data
            await this.set(key, freshData, ttlSeconds);

            return freshData;
        } catch (error) {
            console.error('Cache warming error:', error);
            // Return fresh data even if caching fails
            return dataFetcher();
        }
    }

    // Health check
    async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; latency?: number }> {
        try {
            const start = Date.now();
            await this.redis.ping();
            const latency = Date.now() - start;

            return {
                status: 'healthy',
                latency,
            };
        } catch (error) {
            return {
                status: 'unhealthy',
            };
        }
    }

    // Cleanup method
    async disconnect(): Promise<void> {
        try {
            await this.redis.disconnect();
        } catch (error) {
            console.error('Redis disconnect error:', error);
        }
    }
}

export const cacheService = new CacheService();