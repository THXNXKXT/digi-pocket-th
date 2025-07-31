import { Context } from 'hono';
import { z } from 'zod';
import { walletService } from '../services/wallet.service';
import { ok, fail } from '../utils/response';

const amountSchema = z.object({ amount: z.number().positive() });

export async function getBalance(c: Context) {
  const user = c.get('user');
  const balance = await walletService.getBalance(user.sub);
  const resp = ok('Success', { balance });
  return c.json(resp.body, resp.status as any);
}

export async function listTransactions(c: Context) {
  const user = c.get('user');
  const limit = Number(c.req.query('limit') || '20');
  const list = await walletService.listTransactions(user.sub, limit);
  const respList = ok('Success', list);
  return c.json(respList.body, respList.status as any);
}

export async function deposit(c: Context) {
  const user = c.get('user');
  const body = await c.req.json();
  const parsed = amountSchema.safeParse(body);
  if (!parsed.success) {
    const respFail = fail('Invalid amount', 400, parsed.error);
    return c.json(respFail.body, respFail.status as any);
  }
  try {
    const balance = await walletService.deposit(user.sub, parsed.data.amount);
    const respOk = ok('Deposit success', { balance });
    return c.json(respOk.body, respOk.status as any);
  } catch (err) {
    const respFail2 = fail((err as Error).message, 400);
    return c.json(respFail2.body, respFail2.status as any);
  }
}

export async function withdraw(c: Context) {
  const user = c.get('user');
  const body = await c.req.json();
  const parsed = amountSchema.safeParse(body);
  if (!parsed.success) {
    const respFail3 = fail('Invalid amount', 400, parsed.error);
    return c.json(respFail3.body, respFail3.status as any);
  }
  try {
    const balance = await walletService.withdraw(user.sub, parsed.data.amount);
    const respOk2 = ok('Withdraw success', { balance });
    return c.json(respOk2.body, respOk2.status as any);
  } catch (err) {
    const respFail4 = fail((err as Error).message, 400);
    return c.json(respFail4.body, respFail4.status as any);
  }
} 