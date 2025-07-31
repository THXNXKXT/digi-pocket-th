import {
  eq,
  and,
  desc,
  asc,
  sql,
  count,
  isNull,
  or,
  gte,
  lte,
} from "drizzle-orm";
import { db } from "../db";
import { announcements, announcementReads, users } from "../db/schemas";
import { notificationService } from "./notification.service";
import { cacheService } from "./cache.service";
import {
  type Announcement,
  type AnnouncementWithReadStatus,
  type AnnouncementFilters,
  type PaginatedAnnouncements,
  type AdminAnnouncementListItem,
  type PaginatedAdminAnnouncements,
  type AnnouncementAnalytics,
  type CreateAnnouncementRequest,
  type UpdateAnnouncementRequest,
  ANNOUNCEMENT_CONSTANTS,
  ANNOUNCEMENT_ERROR_CODES,
  canTransitionTo,
} from "../types";

export class AnnouncementService {
  // Public methods for users
  async getPublishedAnnouncements(
    filters: AnnouncementFilters,
    userId?: string
  ): Promise<PaginatedAnnouncements> {
    const {
      page = ANNOUNCEMENT_CONSTANTS.DEFAULT_PAGE,
      limit = ANNOUNCEMENT_CONSTANTS.DEFAULT_LIMIT,
      priority,
      type,
    } = filters;

    // Create cache key based on filters and user
    const filterKey = JSON.stringify({ page, limit, priority, type, userId });
    
    // Try to get from cache first (only for non-authenticated requests to avoid user-specific data leaks)
    if (!userId) {
      const cached = await cacheService.getCachedPublishedAnnouncements<PaginatedAnnouncements>(filterKey);
      if (cached) {
        return cached;
      }
    }

    const offset = (page - 1) * limit;
    const now = new Date();

    // Build where conditions
    const whereConditions = [
      eq(announcements.status, "published"),
      or(isNull(announcements.publishAt), lte(announcements.publishAt, now)),
      or(isNull(announcements.expiresAt), gte(announcements.expiresAt, now)),
    ];

    if (priority) {
      whereConditions.push(eq(announcements.priority, priority));
    }

    if (type) {
      whereConditions.push(eq(announcements.type, type));
    }

    // Get total count
    const [{ total }] = await db
      .select({ total: count() })
      .from(announcements)
      .where(and(...whereConditions));

    // Get announcements with read status
    const query = db
      .select({
        id: announcements.id,
        title: announcements.title,
        content: announcements.content,
        type: announcements.type,
        priority: announcements.priority,
        status: announcements.status,
        isSticky: announcements.isSticky,
        publishAt: announcements.publishAt,
        expiresAt: announcements.expiresAt,
        createdBy: announcements.createdBy,
        createdAt: announcements.createdAt,
        updatedAt: announcements.updatedAt,
        isRead: userId
          ? sql<boolean>`CASE WHEN ${announcementReads.id} IS NOT NULL THEN true ELSE false END`
          : sql<boolean>`false`,
        readAt: userId ? announcementReads.readAt : sql<Date | null>`null`,
      })
      .from(announcements);

    if (userId) {
      query.leftJoin(
        announcementReads,
        and(
          eq(announcementReads.announcementId, announcements.id),
          eq(announcementReads.userId, userId)
        )
      );
    }

    const data = await query
      .where(and(...whereConditions))
      .orderBy(
        desc(announcements.isSticky),
        sql`CASE 
          WHEN ${announcements.priority} = 'urgent' THEN 4
          WHEN ${announcements.priority} = 'high' THEN 3
          WHEN ${announcements.priority} = 'normal' THEN 2
          ELSE 1
        END DESC`,
        desc(announcements.publishAt),
        desc(announcements.createdAt)
      )
      .limit(limit)
      .offset(offset);

    const result = {
      data: data as AnnouncementWithReadStatus[],
      pagination: {
        page,
        limit,
        total: Number(total),
        totalPages: Math.ceil(Number(total) / limit),
      },
    };

    // Cache the result (only for non-authenticated requests)
    if (!userId) {
      await cacheService.cachePublishedAnnouncements(filterKey, result);
    }

    return result;
  }

  async getAnnouncementById(
    id: string,
    userId?: string
  ): Promise<AnnouncementWithReadStatus> {
    const query = db
      .select({
        id: announcements.id,
        title: announcements.title,
        content: announcements.content,
        type: announcements.type,
        priority: announcements.priority,
        status: announcements.status,
        isSticky: announcements.isSticky,
        publishAt: announcements.publishAt,
        expiresAt: announcements.expiresAt,
        createdBy: announcements.createdBy,
        createdAt: announcements.createdAt,
        updatedAt: announcements.updatedAt,
        isRead: userId
          ? sql<boolean>`CASE WHEN ${announcementReads.id} IS NOT NULL THEN true ELSE false END`
          : sql<boolean>`false`,
        readAt: userId ? announcementReads.readAt : sql<Date | null>`null`,
      })
      .from(announcements);

    if (userId) {
      query.leftJoin(
        announcementReads,
        and(
          eq(announcementReads.announcementId, announcements.id),
          eq(announcementReads.userId, userId)
        )
      );
    }

    const [announcement] = await query.where(eq(announcements.id, id)).limit(1);

    if (!announcement) {
      throw new Error(ANNOUNCEMENT_ERROR_CODES.ANNOUNCEMENT_NOT_FOUND);
    }

    // Check if announcement is published and not expired
    const now = new Date();
    if (
      announcement.status !== "published" ||
      (announcement.publishAt && announcement.publishAt > now) ||
      (announcement.expiresAt && announcement.expiresAt < now)
    ) {
      throw new Error(ANNOUNCEMENT_ERROR_CODES.ANNOUNCEMENT_EXPIRED);
    }

    return announcement as AnnouncementWithReadStatus;
  }

  async markAsRead(announcementId: string, userId: string): Promise<void> {
    // Check if already read
    const [existing] = await db
      .select()
      .from(announcementReads)
      .where(
        and(
          eq(announcementReads.announcementId, announcementId),
          eq(announcementReads.userId, userId)
        )
      )
      .limit(1);

    if (!existing) {
      await db.insert(announcementReads).values({
        announcementId,
        userId,
      });

      // Invalidate user's unread count cache
      await cacheService.invalidateUserCache(userId);
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    // Try to get from cache first
    const cached = await cacheService.getCachedUnreadCount(userId);
    if (cached !== null) {
      return cached;
    }

    const now = new Date();

    const [{ unreadCount }] = await db
      .select({
        unreadCount: sql<number>`COUNT(DISTINCT ${announcements.id})`,
      })
      .from(announcements)
      .leftJoin(
        announcementReads,
        and(
          eq(announcementReads.announcementId, announcements.id),
          eq(announcementReads.userId, userId)
        )
      )
      .where(
        and(
          eq(announcements.status, "published"),
          or(
            isNull(announcements.publishAt),
            lte(announcements.publishAt, now)
          ),
          or(
            isNull(announcements.expiresAt),
            gte(announcements.expiresAt, now)
          ),
          isNull(announcementReads.id)
        )
      );

    const count = Number(unreadCount);
    
    // Cache the result
    await cacheService.cacheUnreadCount(userId, count);
    
    return count;
  }

  // Admin methods
  async createAnnouncement(
    data: CreateAnnouncementRequest,
    createdBy: string
  ): Promise<Announcement> {
    const publishAt = data.publishAt ? new Date(data.publishAt) : null;
    const expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;

    // Validate dates
    if (publishAt && publishAt <= new Date()) {
      throw new Error(ANNOUNCEMENT_ERROR_CODES.INVALID_PUBLISH_DATE);
    }

    if (publishAt && expiresAt && publishAt >= expiresAt) {
      throw new Error(ANNOUNCEMENT_ERROR_CODES.INVALID_EXPIRY_DATE);
    }

    const [announcement] = await db
      .insert(announcements)
      .values({
        title: data.title,
        content: data.content,
        type: data.type,
        priority: data.priority,
        isSticky: data.isSticky || false,
        publishAt,
        expiresAt,
        createdBy,
      })
      .returning();

    return announcement;
  }

  async updateAnnouncement(
    id: string,
    data: UpdateAnnouncementRequest
  ): Promise<Announcement> {
    const [existing] = await db
      .select()
      .from(announcements)
      .where(eq(announcements.id, id))
      .limit(1);

    if (!existing) {
      throw new Error(ANNOUNCEMENT_ERROR_CODES.ANNOUNCEMENT_NOT_FOUND);
    }

    const updateData: any = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.isSticky !== undefined) updateData.isSticky = data.isSticky;

    if (data.publishAt !== undefined) {
      const publishAt = new Date(data.publishAt);
      if (publishAt <= new Date()) {
        throw new Error(ANNOUNCEMENT_ERROR_CODES.INVALID_PUBLISH_DATE);
      }
      updateData.publishAt = publishAt;
    }

    if (data.expiresAt !== undefined) {
      updateData.expiresAt = new Date(data.expiresAt);
    }

    // Validate date relationship
    const finalPublishAt = updateData.publishAt || existing.publishAt;
    const finalExpiresAt = updateData.expiresAt || existing.expiresAt;

    if (finalPublishAt && finalExpiresAt && finalPublishAt >= finalExpiresAt) {
      throw new Error(ANNOUNCEMENT_ERROR_CODES.INVALID_EXPIRY_DATE);
    }

    updateData.updatedAt = new Date();

    const [updated] = await db
      .update(announcements)
      .set(updateData)
      .where(eq(announcements.id, id))
      .returning();

    // Invalidate caches
    await cacheService.invalidateAnnouncementCaches(id);

    return updated;
  }

  async deleteAnnouncement(id: string): Promise<void> {
    const [existing] = await db
      .select()
      .from(announcements)
      .where(eq(announcements.id, id))
      .limit(1);

    if (!existing) {
      throw new Error(ANNOUNCEMENT_ERROR_CODES.ANNOUNCEMENT_NOT_FOUND);
    }

    if (existing.status === "published") {
      throw new Error(ANNOUNCEMENT_ERROR_CODES.CANNOT_DELETE_PUBLISHED);
    }

    await db
      .update(announcements)
      .set({ status: "deleted", updatedAt: new Date() })
      .where(eq(announcements.id, id));

    // Invalidate caches
    await cacheService.invalidateAnnouncementCaches(id);
  }

  async publishAnnouncement(id: string): Promise<void> {
    const [existing] = await db
      .select()
      .from(announcements)
      .where(eq(announcements.id, id))
      .limit(1);

    if (!existing) {
      throw new Error(ANNOUNCEMENT_ERROR_CODES.ANNOUNCEMENT_NOT_FOUND);
    }

    if (!canTransitionTo(existing.status, "published")) {
      throw new Error(
        `Cannot publish announcement with status: ${existing.status}`
      );
    }

    // Check if announcement is expired
    if (existing.expiresAt && existing.expiresAt < new Date()) {
      throw new Error(ANNOUNCEMENT_ERROR_CODES.ANNOUNCEMENT_EXPIRED);
    }

    await db
      .update(announcements)
      .set({ status: "published", updatedAt: new Date() })
      .where(eq(announcements.id, id));

    // Send notifications for high and urgent priority announcements
    if (['high', 'urgent'].includes(existing.priority)) {
      try {
        await notificationService.sendAnnouncementNotification(existing);
      } catch (error) {
        // Log error but don't fail the publish operation
        console.error('Failed to send notifications:', error);
      }
    }

    // Invalidate caches
    await cacheService.invalidateAnnouncementCaches(id);
  }

  async archiveAnnouncement(id: string): Promise<void> {
    const [existing] = await db
      .select()
      .from(announcements)
      .where(eq(announcements.id, id))
      .limit(1);

    if (!existing) {
      throw new Error(ANNOUNCEMENT_ERROR_CODES.ANNOUNCEMENT_NOT_FOUND);
    }

    if (!canTransitionTo(existing.status, "archived")) {
      throw new Error(
        `Cannot archive announcement with status: ${existing.status}`
      );
    }

    await db
      .update(announcements)
      .set({ status: "archived", updatedAt: new Date() })
      .where(eq(announcements.id, id));

    // Invalidate caches
    await cacheService.invalidateAnnouncementCaches(id);
  }

  async getAdminAnnouncements(
    filters: AnnouncementFilters
  ): Promise<PaginatedAdminAnnouncements> {
    const {
      page = ANNOUNCEMENT_CONSTANTS.DEFAULT_PAGE,
      limit = ANNOUNCEMENT_CONSTANTS.DEFAULT_LIMIT,
      priority,
      type,
      status,
    } = filters;

    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = [];

    if (priority) {
      whereConditions.push(eq(announcements.priority, priority));
    }

    if (type) {
      whereConditions.push(eq(announcements.type, type));
    }

    if (status) {
      whereConditions.push(eq(announcements.status, status));
    } else {
      // Exclude deleted by default
      whereConditions.push(sql`${announcements.status} != 'deleted'`);
    }

    // Get total count
    const [{ total }] = await db
      .select({ total: count() })
      .from(announcements)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

    // Get announcements with analytics
    const data = await db
      .select({
        id: announcements.id,
        title: announcements.title,
        content: announcements.content,
        type: announcements.type,
        priority: announcements.priority,
        status: announcements.status,
        isSticky: announcements.isSticky,
        publishAt: announcements.publishAt,
        expiresAt: announcements.expiresAt,
        createdBy: announcements.createdBy,
        createdAt: announcements.createdAt,
        updatedAt: announcements.updatedAt,
        totalReads: sql<number>`COUNT(${announcementReads.id})`,
        uniqueReaders: sql<number>`COUNT(DISTINCT ${announcementReads.userId})`,
      })
      .from(announcements)
      .leftJoin(
        announcementReads,
        eq(announcementReads.announcementId, announcements.id)
      )
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .groupBy(announcements.id)
      .orderBy(desc(announcements.createdAt))
      .limit(limit)
      .offset(offset);

    // Calculate read rate
    const dataWithReadRate = data.map((item) => ({
      ...item,
      readRate:
        item.totalReads > 0 ? (item.uniqueReaders / item.totalReads) * 100 : 0,
    }));

    return {
      data: dataWithReadRate as AdminAnnouncementListItem[],
      pagination: {
        page,
        limit,
        total: Number(total),
        totalPages: Math.ceil(Number(total) / limit),
      },
    };
  }

  async getAnnouncementAnalytics(id: string): Promise<AnnouncementAnalytics> {
    const [announcement] = await db
      .select()
      .from(announcements)
      .where(eq(announcements.id, id))
      .limit(1);

    if (!announcement) {
      throw new Error(ANNOUNCEMENT_ERROR_CODES.ANNOUNCEMENT_NOT_FOUND);
    }

    // Get basic metrics
    const [metrics] = await db
      .select({
        totalReads: sql<number>`COUNT(${announcementReads.id})`,
        uniqueReaders: sql<number>`COUNT(DISTINCT ${announcementReads.userId})`,
      })
      .from(announcementReads)
      .where(eq(announcementReads.announcementId, id));

    // Get reads by date (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const readsByDate = await db
      .select({
        date: sql<string>`DATE(${announcementReads.readAt})`,
        count: sql<number>`COUNT(*)`,
      })
      .from(announcementReads)
      .where(
        and(
          eq(announcementReads.announcementId, id),
          gte(announcementReads.readAt, thirtyDaysAgo)
        )
      )
      .groupBy(sql`DATE(${announcementReads.readAt})`)
      .orderBy(sql`DATE(${announcementReads.readAt})`);

    const readRate =
      metrics.totalReads > 0
        ? (metrics.uniqueReaders / metrics.totalReads) * 100
        : 0;

    return {
      announcementId: id,
      totalReads: Number(metrics.totalReads),
      uniqueReaders: Number(metrics.uniqueReaders),
      readRate,
      readsByDate: readsByDate.map((item) => ({
        date: item.date,
        count: Number(item.count),
      })),
    };
  }
}

export const announcementService = new AnnouncementService();
