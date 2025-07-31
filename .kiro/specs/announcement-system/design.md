# Design Document - ระบบประชาสัมพันธ์และการประกาศ

## Overview

ระบบประชาสัมพันธ์และการประกาศจะเป็นส่วนเสริมของ Digi-Pocket API ที่ช่วยให้ admin สามารถสร้าง จัดการ และเผยแพร่ประกาศต่างๆ ให้กับผู้ใช้งานทุกคน ระบบจะรองรับการจัดการเนื้อหาแบบ rich text, การกำหนดระดับความสำคัญ, การจัดตารางเผยแพร่, และการติดตามสถิติการอ่าน

## Architecture

### Database Layer
- เพิ่มตาราง `announcements` และ `announcement_reads` ใน schema ปัจจุบัน
- ใช้ PostgreSQL เป็น primary storage
- ใช้ Redis สำหรับ caching ประกาศที่ active และ notification counters

### API Layer
- เพิ่ม `/announcements` route สำหรับ public endpoints
- เพิ่ม `/admin/announcements` route สำหรับ admin management
- ใช้ Hono framework ตามโครงสร้างปัจจุบัน
- ใช้ JWT authentication และ role-based authorization

### Service Layer
- `AnnouncementService` - จัดการ business logic
- `NotificationService` - จัดการการแจ้งเตือน
- `AnalyticsService` - จัดการสถิติและ metrics

## Components and Interfaces

### Database Schema

```typescript
// เพิ่ม enums ใหม่
export const announcementTypeEnum = pgEnum('announcement_type', [
  'general', 'promotion', 'maintenance', 'security', 'product-update'
]);

export const announcementPriorityEnum = pgEnum('announcement_priority', [
  'low', 'normal', 'high', 'urgent'
]);

export const announcementStatusEnum = pgEnum('announcement_status', [
  'draft', 'published', 'archived', 'deleted'
]);

// ตารางประกาศ
export const announcements = pgTable('announcements', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  content: text('content').notNull(),
  type: announcementTypeEnum('type').notNull().default('general'),
  priority: announcementPriorityEnum('priority').notNull().default('normal'),
  status: announcementStatusEnum('status').notNull().default('draft'),
  isSticky: boolean('is_sticky').notNull().default(false),
  publishAt: timestamp('publish_at', { withTimezone: true }),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ตารางติดตามการอ่าน
export const announcementReads = pgTable('announcement_reads', {
  id: uuid('id').defaultRandom().primaryKey(),
  announcementId: uuid('announcement_id').notNull().references(() => announcements.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  readAt: timestamp('read_at', { withTimezone: true }).defaultNow(),
}, (table) => {
  return {
    userAnnouncementIdx: uniqueIndex('announcement_reads_user_announcement_idx')
      .on(table.userId, table.announcementId),
  };
});
```

### API Endpoints

#### Public Endpoints (สำหรับ users)
```typescript
GET /announcements
- Query params: page, limit, priority, type
- Response: paginated list of published announcements
- Sort: sticky first, then by priority and publish date

GET /announcements/:id
- Response: full announcement content
- Side effect: mark as read for authenticated user

GET /announcements/unread-count
- Requires authentication
- Response: count of unread announcements for user
```

#### Admin Endpoints
```typescript
GET /admin/announcements
- Query params: page, limit, status, type, priority
- Response: paginated list of all announcements with analytics

POST /admin/announcements
- Body: title, content, type, priority, publishAt, expiresAt, isSticky
- Response: created announcement

PUT /admin/announcements/:id
- Body: partial announcement update
- Response: updated announcement

DELETE /admin/announcements/:id
- Soft delete (status = 'deleted')
- Response: success message

POST /admin/announcements/:id/publish
- Change status to 'published'
- Trigger notifications if high/urgent priority

POST /admin/announcements/:id/archive
- Change status to 'archived'

GET /admin/announcements/:id/analytics
- Response: read count, read rate, user engagement metrics
```

### Service Interfaces

```typescript
interface AnnouncementService {
  // Public methods
  getPublishedAnnouncements(filters: AnnouncementFilters): Promise<PaginatedAnnouncements>;
  getAnnouncementById(id: string, userId?: string): Promise<AnnouncementWithReadStatus>;
  markAsRead(announcementId: string, userId: string): Promise<void>;
  getUnreadCount(userId: string): Promise<number>;
  
  // Admin methods
  createAnnouncement(data: CreateAnnouncementData, createdBy: string): Promise<Announcement>;
  updateAnnouncement(id: string, data: UpdateAnnouncementData): Promise<Announcement>;
  deleteAnnouncement(id: string): Promise<void>;
  publishAnnouncement(id: string): Promise<void>;
  archiveAnnouncement(id: string): Promise<void>;
  getAnnouncementAnalytics(id: string): Promise<AnnouncementAnalytics>;
}

interface NotificationService {
  sendAnnouncementNotification(announcement: Announcement): Promise<void>;
  getNotificationPreferences(userId: string): Promise<NotificationPreferences>;
}
```

## Data Models

### Core Models
```typescript
interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'general' | 'promotion' | 'maintenance' | 'security' | 'product-update';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'draft' | 'published' | 'archived' | 'deleted';
  isSticky: boolean;
  publishAt?: Date;
  expiresAt?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AnnouncementRead {
  id: string;
  announcementId: string;
  userId: string;
  readAt: Date;
}

interface AnnouncementWithReadStatus extends Announcement {
  isRead: boolean;
  readAt?: Date;
}

interface AnnouncementAnalytics {
  announcementId: string;
  totalReads: number;
  uniqueReaders: number;
  readRate: number;
  readsByDate: { date: string; count: number }[];
}
```

### Request/Response Models
```typescript
interface CreateAnnouncementRequest {
  title: string;
  content: string;
  type: AnnouncementType;
  priority: AnnouncementPriority;
  publishAt?: string;
  expiresAt?: string;
  isSticky?: boolean;
}

interface AnnouncementFilters {
  page?: number;
  limit?: number;
  priority?: AnnouncementPriority;
  type?: AnnouncementType;
  status?: AnnouncementStatus;
}

interface PaginatedAnnouncements {
  data: AnnouncementWithReadStatus[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

## Error Handling

### Validation Errors
- Title length validation (max 200 characters)
- Content required validation
- Date validation (publishAt < expiresAt)
- Enum validation for type, priority, status

### Authorization Errors
- Admin role required for management endpoints
- User authentication required for read tracking

### Business Logic Errors
- Cannot publish expired announcements
- Cannot delete published announcements (must archive first)
- Cannot modify announcements created by other admins (optional)

### Error Response Format
```typescript
interface ErrorResponse {
  success: false;
  message: string;
  errors?: ValidationError[];
  code?: string;
}
```

## Testing Strategy

### Unit Tests
- Service layer business logic
- Data validation and transformation
- Error handling scenarios
- Date/time calculations for scheduling

### Integration Tests
- Database operations with transactions
- API endpoint functionality
- Authentication and authorization
- Cache invalidation

### End-to-End Tests
- Complete announcement lifecycle (create → publish → read → archive)
- Notification delivery
- Analytics data accuracy
- Performance with large datasets

### Test Data Management
- Factory functions for test announcements
- Database seeding for consistent test environments
- Mock external dependencies (Redis, notification services)

## Performance Considerations

### Caching Strategy
- Cache published announcements in Redis (TTL: 5 minutes)
- Cache unread counts per user (TTL: 1 minute)
- Invalidate cache on announcement status changes

### Database Optimization
- Index on (status, publishAt, priority) for listing queries
- Index on (userId, readAt) for read tracking
- Pagination to limit query results

### Notification Optimization
- Queue high-priority notifications for immediate delivery
- Batch normal priority notifications
- Rate limiting for notification delivery

### Content Optimization
- Limit content size (max 10KB per announcement)
- Support for markdown rendering on frontend
- Image upload size limits and compression