# Announcement System API Documentation

## Overview
ระบบประกาศสำหรับ Digi-Pocket ที่ช่วยให้ admin สามารถสร้างและจัดการประกาศ และผู้ใช้สามารถดูประกาศได้

## Public Endpoints

### GET /announcements
ดึงรายการประกาศที่เผยแพร่แล้ว

**Query Parameters:**
- `page` (optional): หน้าที่ต้องการ (default: 1)
- `limit` (optional): จำนวนรายการต่อหน้า (default: 20, max: 100)
- `priority` (optional): กรองตาม priority (low, normal, high, urgent)
- `type` (optional): กรองตาม type (general, promotion, maintenance, security, product-update)

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "data": [
      {
        "id": "uuid",
        "title": "ประกาศ",
        "content": "เนื้อหาประกาศ",
        "type": "general",
        "priority": "normal",
        "isSticky": false,
        "publishAt": "2024-01-01T00:00:00Z",
        "isRead": false,
        "readAt": null
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

### GET /announcements/:id
ดึงประกาศเฉพาะ (จะ mark as read อัตโนมัติถ้า login)

### GET /announcements/unread-count
ดึงจำนวนประกาศที่ยังไม่ได้อ่าน (ต้อง login)

### GET /announcements/notifications/preferences
ดูการตั้งค่าการแจ้งเตือน (ต้อง login)

### PUT /announcements/notifications/preferences
แก้ไขการตั้งค่าการแจ้งเตือน (ต้อง login)

## Admin Endpoints

### GET /admin/announcements
ดึงรายการประกาศทั้งหมดสำหรับ admin

### POST /admin/announcements
สร้างประกาศใหม่

**Request Body:**
```json
{
  "title": "หัวข้อประกาศ",
  "content": "เนื้อหาประกาศ",
  "type": "general",
  "priority": "normal",
  "publishAt": "2024-01-01T00:00:00Z",
  "expiresAt": "2024-12-31T23:59:59Z",
  "isSticky": false
}
```

### PUT /admin/announcements/:id
แก้ไขประกาศ

### DELETE /admin/announcements/:id
ลบประกาศ (soft delete)

### POST /admin/announcements/:id/publish
เผยแพร่ประกาศ

### POST /admin/announcements/:id/archive
เก็บประกาศ

### GET /admin/announcements/:id/analytics
ดูสถิติการอ่านของประกาศ

## Features

### ✅ Core Features
- CRUD operations สำหรับประกาศ
- User/Admin role-based access
- Read tracking
- Basic notifications สำหรับ urgent announcements
- Simple caching สำหรับ performance

### ✅ Priority System
- `low` - ประกาศทั่วไป
- `normal` - ประกาศปกติ
- `high` - ประกาศสำคัญ (ส่ง notification)
- `urgent` - ประกาศด่วน (ส่ง notification บังคับ)

### ✅ Announcement Types
- `general` - ประกาศทั่วไป
- `promotion` - โปรโมชั่น
- `maintenance` - การบำรุงรักษา
- `security` - ความปลอดภัย
- `product-update` - อัปเดตสินค้า

### ✅ Status Flow
- `draft` → `published` → `archived`
- `draft` → `deleted`
- `archived` → `published`

## Authentication
- Public endpoints: ไม่ต้อง login (แต่จะมี features เพิ่มเติมถ้า login)
- Admin endpoints: ต้อง login และมี role = 'admin'

## Caching
- Published announcements: cached 5 นาที
- Unread counts: cached 1 นาที
- Auto-invalidation เมื่อมีการเปลี่ยนแปลง

## Notifications
- ส่งเฉพาะ high และ urgent priority
- ตรวจสอบ user preferences
- Urgent notifications bypass preferences