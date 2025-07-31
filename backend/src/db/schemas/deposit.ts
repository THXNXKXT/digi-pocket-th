import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  numeric,
  pgEnum,
} from "drizzle-orm/pg-core";
import { users } from "./base";

// Deposit enums
export const depositStatusEnum = pgEnum("deposit_status", [
  "pending",
  "success",
  "failed",
]);

// Deposits table
export const deposits = pgTable("deposits", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  gateway: varchar("gateway", { length: 20 }).notNull(),
  status: depositStatusEnum("status").notNull().default("pending"),
  ref: varchar("ref", { length: 100 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Export types
export type Deposit = typeof deposits.$inferSelect;
export type NewDeposit = typeof deposits.$inferInsert;