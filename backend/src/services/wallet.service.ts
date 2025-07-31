import { db } from '../db';
import { wallets, walletTransactions, txnTypeEnum } from '../db/schemas';
import { eq, desc } from 'drizzle-orm';

export const walletService = {
  async getWallet(userId: string) {
    const [wallet] = await db.select().from(wallets).where(eq(wallets.userId, userId)).limit(1);
    if (!wallet) throw new Error('Wallet not found');
    return wallet;
  },

  async getBalance(userId: string) {
    const wallet = await this.getWallet(userId);
    return wallet.balance;
  },

  async listTransactions(userId: string, limit = 20) {
    const wallet = await this.getWallet(userId);
    return db
      .select()
      .from(walletTransactions)
      .where(eq(walletTransactions.walletId, wallet.id))
      .orderBy(desc(walletTransactions.createdAt))
      .limit(limit);
  },

  async deposit(userId: string, amount: number) {
    if (amount <= 0) throw new Error('Amount must be positive');
    return db.transaction(async (tx) => {
      const wallet = await this.getWallet(userId);
      const newBalance = Number(wallet.balance) + amount;
      await tx.update(wallets).set({ balance: newBalance.toString() }).where(eq(wallets.id, wallet.id));
      await tx.insert(walletTransactions).values({
        walletId: wallet.id,
        type: 'deposit',
        amount: amount.toString(),
      });
      return newBalance;
    });
  },

  async withdraw(userId: string, amount: number) {
    if (amount <= 0) throw new Error('Amount must be positive');
    return db.transaction(async (tx) => {
      const wallet = await this.getWallet(userId);
      if (Number(wallet.balance) < amount) throw new Error('Insufficient balance');
      const newBalance = Number(wallet.balance) - amount;
      await tx.update(wallets).set({ balance: newBalance.toString() }).where(eq(wallets.id, wallet.id));
      await tx.insert(walletTransactions).values({
        walletId: wallet.id,
        type: 'withdraw',
        amount: amount.toString(),
      });
      return newBalance;
    });
  },
}; 