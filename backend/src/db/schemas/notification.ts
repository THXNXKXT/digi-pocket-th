import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  pgEnum,
  text,
  boolean,
} from "drizzle-orm/pg-core";
import { users } from "./base";
import { announcements } from "./announcement";

// Notification enums
export const notificationStatusEnum = pgEnum("notification_status", [
  "pending",
  "sent",
  "failed",
  "delivered",
]);

// Notifications table
export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  announcementId: uuid("announcement_id")
    .notNull()
    .references(() => announcements.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 200 }).notNull(),
  message: text("message").notNull(),
  status: notificationStatusEnum("status").notNull().default("pending"),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  deliveredAt: timestamp("delivered_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// User notification preferences table
export const userNotificationPreferences = pgTable("user_notification_preferences", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),
  enableHighPriority: boolean("enable_high_priority").notNull().default(true),
  enableUrgent: boolean("enable_urgent").notNull().default(true),
  enablePromotion: boolean("enable_promotion").notNull().default(true),
  enableMaintenance: boolean("enable_maintenance").notNull().default(true),
  enableSecurity: boolean("enable_security").notNull().default(true),
  enableProductUpdate: boolean("enable_product_update").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Export types
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;

export type UserNotificationPreferences = typeof userNotificationPreferences.$inferSelect;
export type NewUserNotificationPreferences = typeof userNotificationPreferences.$inferInsert;