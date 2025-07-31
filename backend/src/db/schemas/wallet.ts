import {
  pgTable,
  uuid,
  timestamp,
  numeric,
  pgEnum,
} from "drizzle-orm/pg-core";
import { users } from "./base";

// Wallet enums
export const txnTypeEnum = pgEnum("wallet_txn_type", ["deposit", "withdraw"]);

// Wallets table
export const wallets = pgTable("wallets", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  balance: numeric("balance", { precision: 12, scale: 2 })
    .notNull()
    .default("0"),
});

// Wallet transactions table
export const walletTransactions = pgTable("wallet_transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  walletId: uuid("wallet_id")
    .notNull()
    .references(() => wallets.id, { onDelete: "cascade" }),
  type: txnTypeEnum("type").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Export types
export type Wallet = typeof wallets.$inferSelect;
export type NewWallet = typeof wallets.$inferInsert;

export type WalletTransaction = typeof walletTransactions.$inferSelect;
export type NewWalletTransaction = typeof walletTransactions.$inferInsert;