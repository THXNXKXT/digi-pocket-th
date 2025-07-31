import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { env } from '../config/env';
import { orderService } from '../services/order.service';

const connection = new IORedis(env.redisUrl);

// Scheduler เพื่อจัดการ delayed / retries

export const peamsubWorker = new Worker(
  'peamsub',
  async (job) => {
    const { upstreamId, status } = job.data as { upstreamId: string; status: 'success' | 'failed' };
    await orderService.handleCallback(upstreamId, status);
  },
  { connection },
);

peamsubWorker.on('failed', (job, err) => {
  console.error('Peamsub job failed', (job as any)?.id, err);
}); 