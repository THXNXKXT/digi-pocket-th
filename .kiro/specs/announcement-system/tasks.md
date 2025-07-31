# Implementation Plan

- [x] 1. เพิ่ม database schema สำหรับระบบประกาศ



  - เพิ่ม enums สำหรับ announcement_type, announcement_priority, announcement_status
  - สร้างตาราง announcements พร้อม fields ทั้งหมดตาม design
  - สร้างตาราง announcement_reads สำหรับติดตามการอ่าน
  - เพิ่ม indexes สำหรับ performance optimization



  - _Requirements: 1.1, 1.2, 1.3, 1.5, 3.3, 4.1_

- [ ] 2. สร้าง TypeScript types และ interfaces
  - สร้าง types สำหรับ Announcement, AnnouncementRead, AnnouncementAnalytics



  - สร้าง request/response interfaces สำหรับ API endpoints
  - สร้าง validation schemas ด้วย Zod สำหรับ input validation
  - เพิ่ม types ใน existing schema exports
  - _Requirements: 1.6, 2.1, 5.3_




- [ ] 3. สร้าง AnnouncementService สำหรับ business logic
  - สร้าง service class พร้อม methods สำหรับ CRUD operations
  - implement getPublishedAnnouncements พร้อม filtering และ pagination
  - implement markAsRead และ getUnreadCount สำหรับ read tracking
  - implement admin methods: create, update, delete, publish, archive



  - เพิ่ม error handling และ validation logic
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 3.1, 3.3, 4.1_

- [ ] 4. สร้าง public announcement routes และ controllers
  - สร้าง announcement.route.ts สำหรับ public endpoints
  - implement GET /announcements controller พร้อม filtering
  - implement GET /announcements/:id controller พร้อม read tracking



  - implement GET /announcements/unread-count controller
  - เพิ่ม authentication middleware สำหรับ read tracking
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 5. สร้าง admin announcement routes และ controllers



  - เพิ่ม admin announcement endpoints ใน admin.route.ts
  - implement POST /admin/announcements controller สำหรับสร้างประกาศ
  - implement PUT /admin/announcements/:id controller สำหรับแก้ไข
  - implement DELETE /admin/announcements/:id controller สำหรับลบ
  - implement POST /admin/announcements/:id/publish controller



  - implement POST /admin/announcements/:id/archive controller
  - เพิ่ม admin role validation middleware
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4_

- [x] 6. สร้าง analytics และ reporting functionality

  - implement GET /admin/announcements/:id/analytics controller
  - สร้าง AnalyticsService สำหรับคำนวณ metrics
  - implement read count, read rate, และ engagement calculations
  - เพิ่ม analytics data ใน admin announcement list
  - สร้าง helper functions สำหรับ date grouping และ statistics
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_


- [ ] 7. เพิ่ม notification system สำหรับประกาศสำคัญ
  - สร้าง NotificationService สำหรับจัดการการแจ้งเตือน
  - implement notification logic สำหรับ high และ urgent priority
  - เพิ่ม notification preferences ใน user model (optional)
  - integrate notification service กับ announcement publishing
  - เพิ่ม notification delivery tracking
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [ ] 8. เพิ่ม caching layer สำหรับ performance
  - implement Redis caching สำหรับ published announcements


  - เพิ่ม cache invalidation เมื่อมีการเปลี่ยนแปลง status
  - implement caching สำหรับ unread counts
  - เพิ่ม cache warming strategies สำหรับ frequently accessed data
  - เพิ่ม cache monitoring และ metrics


  - _Requirements: 3.1, 3.5, performance optimization_

- [ ] 9. เพิ่ม rich text content support
  - เพิ่ม content validation สำหรับ markdown format
  - implement content sanitization สำหรับ security
  - เพิ่ม image upload support สำหรับ announcement content
  - implement content preview functionality สำหรับ admin
  - เพิ่ม content length limits และ validation
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [ ] 10. สร้าง comprehensive tests
  - เขียน unit tests สำหรับ AnnouncementService methods
  - เขียน integration tests สำหรับ API endpoints
  - เขียน tests สำหรับ authentication และ authorization
  - เขียน tests สำหรับ analytics calculations
  - เขียน tests สำหรับ notification delivery
  - เขียน performance tests สำหรับ caching layer
  - _Requirements: ทุก requirements, testing strategy_

- [ ] 11. เพิ่ม announcement routes ใน main application
  - เพิ่ม announcement route ใน app.ts
  - update OpenAPI documentation สำหรับ new endpoints
  - เพิ่ม announcement endpoints ใน swagger documentation
  - test integration กับ existing middleware และ error handling
  - verify rate limiting และ security headers work correctly
  - _Requirements: integration with existing system_

- [ ] 12. เพิ่ม database migration และ seeding
  - สร้าง migration script สำหรับ new tables และ enums
  - เพิ่ม seed data สำหรับ testing และ development
  - สร้าง rollback procedures สำหรับ schema changes
  - test migration ใน development environment
  - document deployment procedures สำหรับ production
  - _Requirements: database setup และ deployment_