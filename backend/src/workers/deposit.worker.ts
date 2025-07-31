import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { env } from '../config/env';
import { depositService } from '../services/deposit.service';

const connection = new IORedis(env.redisUrl);

export const depositWorker = new Worker(
  'deposit',
  async (job) => {
    const { ref, success } = job.data as { ref: string; success: boolean };
    await depositService.handleCallback(ref, success);
  },
  { connection }
);

depositWorker.on('failed', (job, err) => {
  console.error('Deposit job failed', (job as any)?.id, err);
}); 