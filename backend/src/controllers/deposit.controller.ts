import { Context } from 'hono';
import { z } from 'zod';
import { depositService } from '../services/deposit.service';
import { depositQueue } from '../queues/deposit.queue';
import { ok, fail } from '../utils/response';

const createSchema = z.object({ amount: z.number().positive(), gateway: z.string() });

export async function createDeposit(c: Context) {
  const user = c.get('user');
  const body = await c.req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    const respFail = fail('Invalid input', 400, parsed.error);
    return c.json(respFail.body, respFail.status as any);
  }
  try {
    const dep = await depositService.create(user.sub, parsed.data.amount, parsed.data.gateway);
    const resp = ok('Deposit created', dep);
    return c.json(resp.body, resp.status as any);
  } catch (err) {
    const respFail2 = fail((err as Error).message, 400);
    return c.json(respFail2.body, respFail2.status as any);
  }
}

export async function getDeposit(c: Context) {
  const user = c.get('user');
  const id = c.req.param('id');
  try {
    const dep = await depositService.get(user.sub, id);
    const resp = ok('Success', dep);
    return c.json(resp.body, resp.status as any);
  } catch (err) {
    const respFail = fail((err as Error).message, 404);
    return c.json(respFail.body, respFail.status as any);
  }
}

const cbSchema = z.object({ ref: z.string(), success: z.boolean() });

export async function depositCallback(c: Context) {
  const body = await c.req.json();
  const parsed = cbSchema.safeParse(body);
  if (!parsed.success) {
    const respFail = fail('Invalid payload', 400, parsed.error);
    return c.json(respFail.body, respFail.status as any);
  }
  await depositQueue.add('callback', parsed.data);
  const respQueued = ok('Queued', { ok: true });
  return c.json(respQueued.body, respQueued.status as any);
} 