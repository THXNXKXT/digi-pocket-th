import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  numeric,
  pgEnum,
  text,
} from "drizzle-orm/pg-core";
import { users } from "./base";

// Order enums
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "success",
  "failed",
  "refunded",
]);

// Orders table
export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  productId: varchar("product_id", { length: 50 }).notNull(),
  quantity: numeric("quantity", { precision: 10, scale: 0 }).notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  status: orderStatusEnum("status").notNull().default("pending"),
  upstreamId: varchar("upstream_id", { length: 50 }).notNull(),
  code: text("code"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Export types
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;