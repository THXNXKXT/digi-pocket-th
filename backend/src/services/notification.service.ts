import { eq, and, sql, inArray } from 'drizzle-orm';
import { db } from '../db';
import {
    users,
    announcements,
    notifications,
    userNotificationPreferences
} from '../db/schemas';
import {
    type Announcement,
    type NotificationPreferences,
    type AnnouncementNotification,
    ANNOUNCEMENT_CONSTANTS,
} from '../types';

export interface NotificationDeliveryResult {
    success: boolean;
    notificationId: string;
    userId: string;
    error?: string;
}

export interface NotificationStats {
    totalSent: number;
    totalDelivered: number;
    totalFailed: number;
    deliveryRate: number;
}

export class NotificationService {
    async sendAnnouncementNotification(announcement: Announcement): Promise<NotificationDeliveryResult[]> {
        // Only send notifications for high and urgent priority announcements
        if (!['high', 'urgent'].includes(announcement.priority)) {
            return [];
        }

        // Get all active users
        const activeUsers = await db
            .select({
                id: users.id,
                username: users.username,
                email: users.email,
            })
            .from(users)
            .where(eq(users.status, 'active'));

        const results: NotificationDeliveryResult[] = [];

        for (const user of activeUsers) {
            try {
                // Check user notification preferences
                const shouldSendNotification = await this.shouldSendNotification(
                    user.id,
                    announcement.priority,
                    announcement.type
                );

                if (!shouldSendNotification) {
                    continue;
                }

                // Create notification record
                const [notification] = await db
                    .insert(notifications)
                    .values({
                        userId: user.id,
                        announcementId: announcement.id,
                        title: announcement.title,
                        message: this.generateNotificationMessage(announcement),
                        status: 'pending',
                    })
                    .returning();

                // Simulate notification delivery (in real app, this would integrate with push notification service)
                const deliveryResult = await this.deliverNotification(notification.id, user, announcement);

                results.push(deliveryResult);
            } catch (error) {
                results.push({
                    success: false,
                    notificationId: '',
                    userId: user.id,
                    error: (error as Error).message,
                });
            }
        }

        return results;
    }

    private async shouldSendNotification(
        userId: string,
        priority: string,
        type: string
    ): Promise<boolean> {
        // Urgent notifications always go through (unless user explicitly disabled)
        if (priority === 'urgent') {
            const [prefs] = await db
                .select({ enableUrgent: userNotificationPreferences.enableUrgent })
                .from(userNotificationPreferences)
                .where(eq(userNotificationPreferences.userId, userId))
                .limit(1);

            return prefs?.enableUrgent ?? true; // Default to true if no preferences set
        }

        // For high priority, check both priority and type preferences
        if (priority === 'high') {
            const [prefs] = await db
                .select({
                    enableHighPriority: userNotificationPreferences.enableHighPriority,
                    enablePromotion: userNotificationPreferences.enablePromotion,
                    enableMaintenance: userNotificationPreferences.enableMaintenance,
                    enableSecurity: userNotificationPreferences.enableSecurity,
                    enableProductUpdate: userNotificationPreferences.enableProductUpdate,
                })
                .from(userNotificationPreferences)
                .where(eq(userNotificationPreferences.userId, userId))
                .limit(1);

            // Default to true if no preferences set
            const enableHighPriority = prefs?.enableHighPriority ?? true;
            if (!enableHighPriority) return false;

            // Check type-specific preferences
            switch (type) {
                case 'promotion':
                    return prefs?.enablePromotion ?? true;
                case 'maintenance':
                    return prefs?.enableMaintenance ?? true;
                case 'security':
                    return prefs?.enableSecurity ?? true;
                case 'product-update':
                    return prefs?.enableProductUpdate ?? true;
                default:
                    return true;
            }
        }

        return false;
    }

    private generateNotificationMessage(announcement: Announcement): string {
        const preview = announcement.content.length > ANNOUNCEMENT_CONSTANTS.NOTIFICATION.PREVIEW_LENGTH
            ? announcement.content.substring(0, ANNOUNCEMENT_CONSTANTS.NOTIFICATION.PREVIEW_LENGTH) + '...'
            : announcement.content;

        return preview;
    }

    private async deliverNotification(
        notificationId: string,
        user: { id: string; username: string; email: string },
        announcement: Announcement
    ): Promise<NotificationDeliveryResult> {
        try {
            // Simulate delivery delay and potential failure
            await new Promise(resolve => setTimeout(resolve, Math.random() * 100));

            // Simulate 95% success rate
            const isSuccess = Math.random() > 0.05;

            if (isSuccess) {
                // Update notification status to sent and delivered
                await db
                    .update(notifications)
                    .set({
                        status: 'delivered',
                        sentAt: new Date(),
                        deliveredAt: new Date(),
                    })
                    .where(eq(notifications.id, notificationId));

                // In a real application, this would integrate with:
                // - Push notification services (Firebase, APNs)
                // - Email services (SendGrid, SES)
                // - SMS services (Twilio)
                // - WebSocket for real-time notifications

                return {
                    success: true,
                    notificationId,
                    userId: user.id,
                };
            } else {
                // Update notification status to failed
                await db
                    .update(notifications)
                    .set({
                        status: 'failed',
                        sentAt: new Date(),
                    })
                    .where(eq(notifications.id, notificationId));

                return {
                    success: false,
                    notificationId,
                    userId: user.id,
                    error: 'Delivery failed',
                };
            }
        } catch (error) {
            // Update notification status to failed
            await db
                .update(notifications)
                .set({
                    status: 'failed',
                    sentAt: new Date(),
                })
                .where(eq(notifications.id, notificationId));

            return {
                success: false,
                notificationId,
                userId: user.id,
                error: (error as Error).message,
            };
        }
    }

    async getNotificationPreferences(userId: string): Promise<NotificationPreferences> {
        const [prefs] = await db
            .select()
            .from(userNotificationPreferences)
            .where(eq(userNotificationPreferences.userId, userId))
            .limit(1);

        if (!prefs) {
            // Create default preferences if none exist
            const [newPrefs] = await db
                .insert(userNotificationPreferences)
                .values({ userId })
                .returning();

            return {
                userId: newPrefs.userId,
                enableHighPriority: newPrefs.enableHighPriority,
                enableUrgent: newPrefs.enableUrgent,
                enablePromotion: newPrefs.enablePromotion,
                enableMaintenance: newPrefs.enableMaintenance,
            };
        }

        return {
            userId: prefs.userId,
            enableHighPriority: prefs.enableHighPriority,
            enableUrgent: prefs.enableUrgent,
            enablePromotion: prefs.enablePromotion,
            enableMaintenance: prefs.enableMaintenance,
        };
    }

    async updateNotificationPreferences(
        userId: string,
        preferences: Partial<NotificationPreferences>
    ): Promise<NotificationPreferences> {
        const updateData: any = {
            updatedAt: new Date(),
        };

        if (preferences.enableHighPriority !== undefined) {
            updateData.enableHighPriority = preferences.enableHighPriority;
        }
        if (preferences.enableUrgent !== undefined) {
            updateData.enableUrgent = preferences.enableUrgent;
        }
        if (preferences.enablePromotion !== undefined) {
            updateData.enablePromotion = preferences.enablePromotion;
        }
        if (preferences.enableMaintenance !== undefined) {
            updateData.enableMaintenance = preferences.enableMaintenance;
        }

        // Try to update existing preferences
        const [updated] = await db
            .update(userNotificationPreferences)
            .set(updateData)
            .where(eq(userNotificationPreferences.userId, userId))
            .returning();

        if (!updated) {
            // Create new preferences if none exist
            const [created] = await db
                .insert(userNotificationPreferences)
                .values({
                    userId,
                    ...updateData,
                })
                .returning();

            return {
                userId: created.userId,
                enableHighPriority: created.enableHighPriority,
                enableUrgent: created.enableUrgent,
                enablePromotion: created.enablePromotion,
                enableMaintenance: created.enableMaintenance,
            };
        }

        return {
            userId: updated.userId,
            enableHighPriority: updated.enableHighPriority,
            enableUrgent: updated.enableUrgent,
            enablePromotion: updated.enablePromotion,
            enableMaintenance: updated.enableMaintenance,
        };
    }

    async getUserNotifications(userId: string, limit: number = 50): Promise<AnnouncementNotification[]> {
        const userNotifications = await db
            .select({
                id: notifications.id,
                announcementId: notifications.announcementId,
                title: notifications.title,
                message: notifications.message,
                status: notifications.status,
                sentAt: notifications.sentAt,
                deliveredAt: notifications.deliveredAt,
                createdAt: notifications.createdAt,
                announcementType: announcements.type,
                announcementPriority: announcements.priority,
            })
            .from(notifications)
            .innerJoin(announcements, eq(announcements.id, notifications.announcementId))
            .where(eq(notifications.userId, userId))
            .orderBy(sql`${notifications.createdAt} DESC`)
            .limit(limit);

        return userNotifications.map((notification) => ({
            announcementId: notification.announcementId,
            title: notification.title,
            preview: notification.message,
            priority: notification.announcementPriority as any,
            type: notification.announcementType as any,
        }));
    }

    async getNotificationStats(announcementId?: string): Promise<NotificationStats> {
        const baseQuery = db
            .select({
                totalSent: sql<number>`COUNT(*)`,
                totalDelivered: sql<number>`COUNT(CASE WHEN status = 'delivered' THEN 1 END)`,
                totalFailed: sql<number>`COUNT(CASE WHEN status = 'failed' THEN 1 END)`,
            })
            .from(notifications);

        const [stats] = announcementId
            ? await baseQuery.where(eq(notifications.announcementId, announcementId))
            : await baseQuery;

        const totalSent = Number(stats.totalSent);
        const totalDelivered = Number(stats.totalDelivered);
        const totalFailed = Number(stats.totalFailed);
        const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;

        return {
            totalSent,
            totalDelivered,
            totalFailed,
            deliveryRate,
        };
    }

    async retryFailedNotifications(announcementId: string): Promise<NotificationDeliveryResult[]> {
        // Get failed notifications for the announcement
        const failedNotifications = await db
            .select({
                id: notifications.id,
                userId: notifications.userId,
                announcementId: notifications.announcementId,
            })
            .from(notifications)
            .where(
                and(
                    eq(notifications.announcementId, announcementId),
                    eq(notifications.status, 'failed')
                )
            );

        if (failedNotifications.length === 0) {
            return [];
        }

        // Get announcement details
        const [announcement] = await db
            .select()
            .from(announcements)
            .where(eq(announcements.id, announcementId))
            .limit(1);

        if (!announcement) {
            throw new Error('Announcement not found');
        }

        // Get user details for failed notifications
        const userIds = failedNotifications.map(n => n.userId);
        const userList = await db
            .select({
                id: users.id,
                username: users.username,
                email: users.email,
            })
            .from(users)
            .where(inArray(users.id, userIds));

        const results: NotificationDeliveryResult[] = [];

        for (const notification of failedNotifications) {
            const user = userList.find(u => u.id === notification.userId);
            if (!user) continue;

            try {
                const deliveryResult = await this.deliverNotification(
                    notification.id,
                    user,
                    announcement
                );
                results.push(deliveryResult);
            } catch (error) {
                results.push({
                    success: false,
                    notificationId: notification.id,
                    userId: user.id,
                    error: (error as Error).message,
                });
            }
        }

        return results;
    }
}

export const notificationService = new NotificationService();