# Database Commands

คำสั่งสำหรับจัดการฐานข้อมูล PostgreSQL ในโปรเจกต์ Digi-Pocket Thailand

## 📋 คำสั่งที่มีให้ใช้

### 🔄 Schema Management

```bash
# Push schema changes to database (สร้าง/อัปเดตตาราง)
bun run db:push
```

### 🗑️ Data Management

```bash
# เคลียร์ข้อมูลทั้งหมด (เก็บ schema ไว้)
bun run db:clear

# รีเซ็ตฐานข้อมูลทั้งหมด (ลบ schema + ข้อมูล)
bun run db:reset

# รีเซ็ตและสร้างใหม่ทั้งหมด (reset + push)
bun run db:fresh
```

## 📝 รายละเอียดคำสั่ง

### `bun run db:push`
- **ใช้เมื่อ**: มีการเปลี่ยนแปลง schema (เพิ่ม/ลบ table, column)
- **ทำอะไร**: สร้างหรืออัปเดตตารางตาม schema ใน `src/db/schemas/`
- **ข้อมูล**: ไม่กระทบข้อมูลที่มีอยู่

### `bun run db:clear`
- **ใช้เมื่อ**: ต้องการลบข้อมูลทั้งหมดแต่เก็บโครงสร้างตาราง
- **ทำอะไร**: ลบข้อมูลในทุกตารางตามลำดับ foreign key
- **ข้อมูล**: ลบหมด แต่ตารางยังอยู่

### `bun run db:reset`
- **ใช้เมื่อ**: ต้องการเริ่มต้นใหม่ทั้งหมด
- **ทำอะไร**: ลบ schema ทั้งหมดและสร้าง schema ว่างใหม่
- **ข้อมูล**: ลบหมด รวมทั้งตารางด้วย

### `bun run db:fresh`
- **ใช้เมื่อ**: ต้องการรีเซ็ตและสร้างใหม่ในคำสั่งเดียว
- **ทำอะไร**: รัน `db:reset` แล้วตามด้วย `db:push`
- **ข้อมูล**: ลบหมดและสร้างตารางใหม่ตาม schema

## ⚠️ คำเตือน

- **ระวัง**: คำสั่ง `db:clear`, `db:reset`, `db:fresh` จะลบข้อมูลถาวร
- **Production**: อย่าใช้คำสั่งเหล่านี้ใน production environment
- **Backup**: สำรองข้อมูลก่อนใช้คำสั่งที่ลบข้อมูล

## 🔧 การใช้งานทั่วไป

### Development Workflow
```bash
# เมื่อเปลี่ยน schema
bun run db:push

# เมื่อต้องการข้อมูลใหม่
bun run db:clear

# เมื่อมีปัญหา schema
bun run db:fresh
```

### Testing
```bash
# ก่อนรันเทส
bun run db:clear

# หลังรันเทส (ถ้าต้องการ)
bun run db:clear
```

## 📊 ตารางที่จะได้รับผลกระทบ

เมื่อใช้ `db:clear` ตารางเหล่านี้จะถูกลบข้อมูล:

1. `user_activity_logs`
2. `user_sessions`
3. `security_alerts`
4. `wallet_transactions`
5. `wallets`
6. `orders`
7. `product_prices`
8. `products`
9. `announcement_reads`
10. `announcements`
11. `notifications`
12. `user_notification_preferences`
13. `users`

*ลำดับการลบเรียงตาม foreign key dependencies*
