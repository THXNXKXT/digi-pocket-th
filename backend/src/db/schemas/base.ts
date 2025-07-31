import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  numeric,
  pgEnum,
  text,
  integer,
  jsonb,
  uniqueIndex,
  boolean,
} from "drizzle-orm/pg-core";

// Common enums
export const roleEnum = pgEnum("user_role", ["admin", "customer"]);
export const statusEnum = pgEnum("user_status", [
  "active",
  "suspended",
  "banned",
  "pending",
]);

// Activity logging enums
export const activityTypeEnum = pgEnum("activity_type", [
  "login",
  "logout",
  "register",
  "password_change",
  "password_reset",
  "profile_update",
  "role_change",
  "status_change",
  "failed_login",
  "account_locked",
  "account_unlocked",
  "suspicious_activity",
  "api_access",
  "data_export",
  "admin_action"
]);

export const severityEnum = pgEnum("severity", [
  "low",
  "medium",
  "high",
  "critical"
]);

// Order status enum
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded"
]);

// Users table
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  email: varchar("email", { length: 100 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 200 }).notNull(),
  role: roleEnum("role").notNull().default("customer"),
  status: statusEnum("status").notNull().default("active"),

  // Security fields
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  failedLoginAttempts: integer("failed_login_attempts").default(0),
  lockedUntil: timestamp("locked_until", { withTimezone: true }),

  // Basic tracking fields (summary only)
  lastLoginIp: varchar("last_login_ip", { length: 45 }),
  lastDeviceFingerprint: varchar("last_device_fingerprint", { length: 32 }),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// User Activity Logs table
export const userActivityLogs = pgTable("user_activity_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  activityType: activityTypeEnum("activity_type").notNull(),
  description: text("description").notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  location: jsonb("location"), // { country, city, region }
  metadata: jsonb("metadata"), // Additional context data
  severity: severityEnum("severity").notNull().default("low"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Security Alerts table
export const securityAlerts = pgTable("security_alerts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  alertType: varchar("alert_type", { length: 50 }).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  severity: severityEnum("severity").notNull(),
  isResolved: boolean("is_resolved").notNull().default(false),
  resolvedBy: uuid("resolved_by").references(() => users.id),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// User Sessions table for tracking active sessions
export const userSessions = pgTable("user_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  sessionToken: varchar("session_token", { length: 255 }).notNull().unique(),
  deviceInfo: jsonb("device_info"), // { device, browser, os }
  ipAddress: varchar("ip_address", { length: 45 }),
  location: jsonb("location"),
  isActive: boolean("is_active").notNull().default(true),
  lastActivityAt: timestamp("last_activity_at", { withTimezone: true }).defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Products table
export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  stock: integer("stock").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Orders table
export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  status: orderStatusEnum("status").notNull().default("pending"),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
  items: jsonb("items").notNull(), // Array of order items
  shippingInfo: jsonb("shipping_info").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Export types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserActivityLog = typeof userActivityLogs.$inferSelect;
export type NewUserActivityLog = typeof userActivityLogs.$inferInsert;
export type SecurityAlert = typeof securityAlerts.$inferSelect;
export type NewSecurityAlert = typeof securityAlerts.$inferInsert;
export type UserSession = typeof userSessions.$inferSelect;
export type NewUserSession = typeof userSessions.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;