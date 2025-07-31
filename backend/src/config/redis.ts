import IORedis from 'ioredis';
import { env } from './env';

export const redis = new IORedis(env.redisUrl);

// ป้องกันเหตุการณ์ error ที่ไม่ได้จับ ทำให้แอปไม่ crash
redis.on('error', (err) => {
  console.error('Redis connection error:', err?.message || err);
}); 