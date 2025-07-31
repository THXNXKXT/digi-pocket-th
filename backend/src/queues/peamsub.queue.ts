import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { env } from '../config/env';

const connection = new IORedis(env.redisUrl);
 
export const peamsubQueue = new Queue('peamsub', {
  connection,
}); 