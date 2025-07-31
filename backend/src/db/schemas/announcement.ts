import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  pgEnum,
  text,
  boolean,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { users } from "./base";

// Announcement enums
export const announcementTypeEnum = pgEnum("announcement_type", [
  "general",
  "promotion",
  "maintenance",
  "security",
  "product-update",
]);

export const announcementPriorityEnum = pgEnum("announcement_priority", [
  "low",
  "normal",
  "high",
  "urgent",
]);

export const announcementStatusEnum = pgEnum("announcement_status", [
  "draft",
  "published",
  "archived",
  "deleted",
]);

// Announcements table
export const announcements = pgTable(
  "announcements",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 200 }).notNull(),
    content: text("content").notNull(),
    type: announcementTypeEnum("type").notNull().default("general"),
    priority: announcementPriorityEnum("priority").notNull().default("normal"),
    status: announcementStatusEnum("status").notNull().default("draft"),
    isSticky: boolean("is_sticky").notNull().default(false),
    publishAt: timestamp("publish_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => {
    return {
      statusPublishPriorityIdx: uniqueIndex(
        "announcements_status_publish_priority_idx"
      ).on(table.status, table.publishAt, table.priority),
      createdByIdx: uniqueIndex("announcements_created_by_idx").on(
        table.createdBy
      ),
    };
  }
);

// Announcement reads table
export const announcementReads = pgTable(
  "announcement_reads",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    announcementId: uuid("announcement_id")
      .notNull()
      .references(() => announcements.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    readAt: timestamp("read_at", { withTimezone: true }).defaultNow(),
  },
  (table) => {
    return {
      userAnnouncementIdx: uniqueIndex(
        "announcement_reads_user_announcement_idx"
      ).on(table.userId, table.announcementId),
      announcementIdx: uniqueIndex("announcement_reads_announcement_idx").on(
        table.announcementId
      ),
      userIdx: uniqueIndex("announcement_reads_user_idx").on(table.userId),
    };
  }
);

// Export types
export type Announcement = typeof announcements.$inferSelect;
export type NewAnnouncement = typeof announcements.$inferInsert;

export type AnnouncementRead = typeof announcementReads.$inferSelect;
export type NewAnnouncementRead = typeof announcementReads.$inferInsert;