import { z } from 'zod';

// Database enum types
export type AnnouncementType = 'general' | 'promotion' | 'maintenance' | 'security' | 'product-update';
export type AnnouncementPriority = 'low' | 'normal' | 'high' | 'urgent';
export type AnnouncementStatus = 'draft' | 'published' | 'archived' | 'deleted';

// Core data models
export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: AnnouncementType;
  priority: AnnouncementPriority;
  status: AnnouncementStatus;
  isSticky: boolean;
  publishAt?: Date;
  expiresAt?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnnouncementRead {
  id: string;
  announcementId: string;
  userId: string;
  readAt: Date;
}

export interface AnnouncementWithReadStatus extends Announcement {
  isRead: boolean;
  readAt?: Date;
}

export interface AnnouncementAnalytics {
  announcementId: string;
  totalReads: number;
  uniqueReaders: number;
  readRate: number;
  readsByDate: { date: string; count: number }[];
}

// Request/Response models
export interface CreateAnnouncementRequest {
  title: string;
  content: string;
  type: AnnouncementType;
  priority: AnnouncementPriority;
  publishAt?: string;
  expiresAt?: string;
  isSticky?: boolean;
}

export interface UpdateAnnouncementRequest {
  title?: string;
  content?: string;
  type?: AnnouncementType;
  priority?: AnnouncementPriority;
  publishAt?: string;
  expiresAt?: string;
  isSticky?: boolean;
}

export interface AnnouncementFilters {
  page?: number;
  limit?: number;
  priority?: AnnouncementPriority;
  type?: AnnouncementType;
  status?: AnnouncementStatus;
}

export interface PaginatedAnnouncements {
  data: AnnouncementWithReadStatus[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AdminAnnouncementListItem extends Announcement {
  totalReads: number;
  uniqueReaders: number;
  readRate: number;
}

export interface PaginatedAdminAnnouncements {
  data: AdminAnnouncementListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Notification models
export interface NotificationPreferences {
  userId: string;
  enableHighPriority: boolean;
  enableUrgent: boolean;
  enablePromotion: boolean;
  enableMaintenance: boolean;
}

export interface AnnouncementNotification {
  announcementId: string;
  title: string;
  preview: string;
  priority: AnnouncementPriority;
  type: AnnouncementType;
}