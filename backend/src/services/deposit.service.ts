import { db } from '../db';
import { deposits } from '../db/schemas';
import { walletService } from './wallet.service';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';

export const depositService = {
  async create(userId: string, amount: number, gateway: string) {
    if (amount <= 0) throw new Error('Amount must be positive');
    const ref = randomUUID();
    const [dep] = await db
      .insert(deposits)
      .values({ userId, amount: amount.toString(), gateway, ref })
      .returning();
    const paymentUrl = `https://pay.mock/${gateway}/${ref}`;
    return { ...dep, paymentUrl };
  },

  async handleCallback(ref: string, success: boolean) {
    const [dep] = await db.select().from(deposits).where(eq(deposits.ref, ref)).limit(1);
    if (!dep) throw new Error('Deposit not found');
    if (dep.status !== 'pending') return;

    if (success) {
      await db.update(deposits).set({ status: 'success' }).where(eq(deposits.id, dep.id));
      await walletService.deposit(dep.userId, Number(dep.amount));
    } else {
      await db.update(deposits).set({ status: 'failed' }).where(eq(deposits.id, dep.id));
    }
  },

  async get(userId: string, id: string) {
    const [dep] = await db.select().from(deposits).where(eq(deposits.id, id)).limit(1);
    if (!dep || dep.userId !== userId) throw new Error('Not found');
    return dep;
  },
}; 