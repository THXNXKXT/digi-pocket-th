# 🏪 ดิจิ-พ็อกเก็ต ประเทศไทย

**แพลตฟอร์ม API ตลาดดิจิทัลที่ครบครันสำหรับระบบอีคอมเมิร์ซของประเทศไทย**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=bun&logoColor=white)](https://bun.sh/)
[![Hono](https://img.shields.io/badge/Hono-E36002?style=for-the-badge&logo=hono&logoColor=white)](https://hono.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Drizzle](https://img.shields.io/badge/Drizzle-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black)](https://orm.drizzle.team/)

## 🌟 ภาพรวม

ดิจิ-พ็อกเก็ต ประเทศไทย เป็น API ตลาดดิจิทัลที่แข็งแกร่งและขยายตัวได้ ออกแบบมาเฉพาะสำหรับตลาดอีคอมเมิร์ซของไทย สร้างด้วยเทคโนโลยีที่ทันสมัยและหลักการความปลอดภัยเป็นอันดับแรก ให้แพลตฟอร์มที่ครบครันสำหรับการขายสินค้าดิจิทัล การจัดการผู้ใช้ และธุรกรรมทางการเงิน

### **🚀 เทคโนโลยีที่ใช้**

**Runtime และ Framework**
- **[Bun](https://bun.sh/)** - JavaScript runtime และ package manager ที่เร็วมาก
- **[Hono](https://hono.dev/)** - Web framework ที่เบาและเร็ว
- **[TypeScript](https://www.typescriptlang.org/)** - การพัฒนาที่ปลอดภัยด้วย type

**ฐานข้อมูลและ Caching**
- **[PostgreSQL](https://www.postgresql.org/)** - ฐานข้อมูลหลักที่มี ACID compliance
- **[Drizzle ORM](https://orm.drizzle.team/)** - การจัดการฐานข้อมูลที่ปลอดภัยด้วย type
- **[Redis](https://redis.io/)** - Caching และ session storage ประสิทธิภาพสูง

**ความปลอดภัยและ Validation**
- **[Zod](https://zod.dev/)** - Runtime type validation และ parsing
- **[bcrypt](https://github.com/kelektiv/node.bcrypt.js)** - การเข้ารหัสรหัสผ่าน
- **[jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)** - JWT authentication

**DevOps และ Deployment**
- **[Docker](https://www.docker.com/)** - Containerization
- **[Docker Compose](https://docs.docker.com/compose/)** - การจัดการ multi-container

### **🔥 ฟีเจอร์หลัก**

🔐 **ระบบความปลอดภัยระดับองค์กร**
- การยืนยันตัวตนด้วย JWT พร้อมการจัดการ session
- ระบบควบคุมการเข้าถึงตามบทบาท (RBAC) ที่ละเอียด
- การตรวจสอบและตรวจจับภัยคุกคามขั้นสูง
- การป้องกันการโจมตี brute force และ rate limiting อัจฉริยะ
- การบันทึกและติดตามกิจกรรมอย่างครบถ้วน
- การระบุอุปกรณ์และตรวจจับกิจกรรมที่น่าสงสัย

💰 **ระบบกระเป๋าเงินดิจิทัลขั้นสูง**
- การจัดการยอดเงินแบบ real-time ด้วย atomic transactions
- การประมวลผลธุรกรรมที่ปลอดภัยด้วย double-entry bookkeeping
- ระบบตรวจสอบการฝากเงินด้วยสลิปพร้อมการประมวลผลภาพ
- รองรับบัญชีธนาคารหลายแห่งสำหรับการฝากเงินที่สะดวก
- ประวัติธุรกรรมพร้อมการวิเคราะห์ข้อมูลโดยละเอียด
- การตรวจจับการฉ้อโกงและการกระทบยอดอัตโนมัติ

🛒 **แพลตฟอร์มอีคอมเมิร์ซที่ครบครัน**
- แคตตาล็อกสินค้าหลายหมวดหมู่ (แอป, เกม, เติมเงินมือถือ, บัตรเงินสด)
- เครื่องมือกำหนดราคาแบบไดนามิกพร้อมการจัดการสต็อกแบบ real-time
- การประมวลผลคำสั่งซื้อพร้อมการเชื่อมต่อกับบริการภายนอก (Peamsub API)
- ขั้นตอนการดำเนินการอัตโนมัติพร้อมการจัดการ callback
- การติดตามคำสั่งซื้อและการจัดการสถานะอย่างครบถ้วน
- การซิงค์สินค้ากับผู้ให้บริการภายนอก

👥 **การจัดการผู้ใช้ขั้นสูง**
- ระบบผู้ใช้หลายบทบาท (ลูกค้า, ผู้ดูแลระบบ, ผู้ดูแลระบบสูงสุด)
- การจัดการโปรไฟล์และการตั้งค่าผู้ใช้อย่างครบถ้วน
- การติดตามอุปกรณ์และตำแหน่งพร้อม geolocation
- การตรวจสอบกิจกรรมแบบ real-time และการวิเคราะห์พฤติกรรม
- ระบบการแจ้งเตือนอัจฉริยะพร้อมการตั้งค่า
- การจัดการ session ผู้ใช้ในหลายอุปกรณ์

📊 **แดชบอร์ดผู้ดูแลระบบที่ทรงพลัง**
- การวิเคราะห์แบบ real-time และ business intelligence
- การจัดการวงจรชีวิตผู้ใช้และคำสั่งซื้อ
- การตรวจสอบความปลอดภัยพร้อมระบบแจ้งเตือน
- การดูแลธุรกรรมทางการเงินและการรายงาน
- การกำหนดค่าระบบและการสลับฟีเจอร์
- การติดตามการตรวจสอบและการปฏิบัติตามกฎระเบียบอย่างครบถ้วน

📢 **ระบบการสื่อสาร**
- การจัดการประกาศทั่วระบบ
- การตั้งค่าการแจ้งเตือนผู้ใช้และการส่ง
- การแจ้งเตือนแบบ real-time และการอัพเดทสถานะ
- รองรับการแจ้งเตือนหลายช่องทาง

## 🚀 เริ่มต้นใช้งาน

### **ข้อกำหนดเบื้องต้น**
- [Bun](https://bun.sh/) >= 1.0.0
- [PostgreSQL](https://www.postgresql.org/) >= 14
- [Redis](https://redis.io/) >= 6.0
- [Docker](https://www.docker.com/) (ไม่บังคับ)

### **การติดตั้ง**

1. **โคลน repository**
```bash
git clone https://github.com/THXNXKXT/digi-pocket-th.git
cd digi-pocket-th
```

2. **ติดตั้ง dependencies**
```bash
cd backend
bun install
```

3. **ตั้งค่า Environment**
```bash
cp .env.example .env
# แก้ไข .env ตามการกำหนดค่าของคุณ
```

4. **ตั้งค่าฐานข้อมูล**
```bash
# เริ่ม PostgreSQL และ Redis (ใช้ Docker)
docker-compose up -d postgres redis

# รัน database migrations
bun run db:push

# เพิ่มข้อมูลเริ่มต้น (ไม่บังคับ)
bun run db:seed
```

5. **เริ่ม Development Server**
```bash
bun run dev
```

API จะพร้อมใช้งานที่ `http://localhost:3031`

### **การตั้งค่า Docker**
```bash
# เริ่มบริการทั้งหมด
docker-compose up -d

# ดู logs
docker-compose logs -f backend
```

## 📚 เอกสาร API

### **เอกสารแบบโต้ตอบ**
- **Swagger UI**: `http://localhost:3031/swagger`
- **OpenAPI JSON**: `http://localhost:3031/doc`
- **Health Check**: `http://localhost:3031/`

### **API Endpoints ทั้งหมด (74+ endpoints)**

#### **🌐 System Routes**
```http
GET  /                    # ตรวจสอบสถานะ API
GET  /doc                 # เอกสาร OpenAPI JSON  
GET  /swagger             # อินเทอร์เฟซ Swagger UI
```

#### **🔐 การยืนยันตัวตน (3 endpoints)**
```http
POST /auth/register       # ลงทะเบียนผู้ใช้
POST /auth/login          # เข้าสู่ระบบ
POST /auth/logout         # ออกจากระบบ (ต้องยืนยันตัวตน)
```

#### **📦 สินค้า (5 endpoints)**
```http
GET /products/app-premium # รายการสินค้าแอปพรีเมียม
GET /products/preorder    # รายการสินค้าพรีออเดอร์
GET /products/game        # รายการสินค้าเกม
GET /products/mobile      # รายการสินค้ามือถือ
GET /products/cashcard    # รายการบัตรเงินสด
```

#### **🛒 คำสั่งซื้อ (7 endpoints)**
```http
# คำสั่งซื้อของลูกค้า (ต้องยืนยันตัวตน)
POST   /orders                  # สร้างคำสั่งซื้อใหม่
GET    /orders                  # ดูคำสั่งซื้อของผู้ใช้ (พร้อม pagination)
GET    /orders/price/:productId # ดูราคาสินค้า
GET    /orders/:id              # ดูรายละเอียดคำสั่งซื้อ
PATCH  /orders/:id/cancel       # ยกเลิกคำสั่งซื้อ

# Public Webhooks (ไม่ต้องยืนยันตัวตน)
POST /orders/callback           # Peamsub payment callback
POST /orders/preorder-callback  # Preorder payment callback
```

#### **💰 ระบบกระเป๋าเงิน (11 endpoints)**
```http
# กระเป๋าเงินพื้นฐาน (ต้องยืนยันตัวตน)
GET  /wallet/balance      # ดูยอดเงินในกระเป๋า
GET  /wallet/transactions # รายการธุรกรรมกระเป๋าเงิน
POST /wallet/deposit      # ฝากเงินพื้นฐาน (เก่า)
POST /wallet/withdraw     # ถอนเงิน

# ระบบฝากเงินด้วยสลิป (ต้องยืนยันตัวตน)
GET    /wallet/deposit/accounts                    # ดูบัญชีร้านค้าที่มี
POST   /wallet/deposit/request                     # สร้างคำขอฝากเงิน
POST   /wallet/deposit/request/:requestId/slip     # อัพโหลดภาพสลิป
GET    /wallet/deposit/request/:requestId/status   # ตรวจสอบสถานะการฝาก
GET    /wallet/deposit/requests                    # ดูคำขอที่รอดำเนินการ
GET    /wallet/deposit/request/:requestId          # กลับมาดำเนินการคำขอ
DELETE /wallet/deposit/request/:requestId          # ยกเลิกคำขอ
```

#### **📢 ประกาศ (6 endpoints)**
```http
# Public Routes (ยืนยันตัวตนไม่บังคับ)
GET /announcements        # รายการประกาศที่เผยแพร่
GET /announcements/:id    # ดูประกาศเฉพาะ

# Authenticated Routes
GET /announcements/unread-count                    # ดูจำนวนที่ยังไม่อ่าน
GET /announcements/notifications/preferences       # ดูการตั้งค่าการแจ้งเตือน
PUT /announcements/notifications/preferences       # อัพเดทการตั้งค่าการแจ้งเตือน  
GET /announcements/notifications                   # ดูการแจ้งเตือนผู้ใช้
```

#### **👤 การติดตามผู้ใช้ (4 endpoints)**
```http
# ทั้งหมดต้องยืนยันตัวตน
GET /user/tracking/devices          # ประวัติอุปกรณ์ของผู้ใช้
GET /user/tracking/locations        # ประวัติ IP/ตำแหน่งของผู้ใช้  
GET /user/tracking/patterns         # รูปแบบการเข้าสู่ระบบ
GET /user/tracking/security-summary # สรุปความปลอดภัย
```

### **👨‍💼 Admin Routes (35+ endpoints)**
**การยืนยันตัวตน:** ต้องมี (บทบาทผู้ดูแลระบบ)

#### **การจัดการผู้ใช้ (6 endpoints)**
```http
GET    /admin/users           # รายการผู้ใช้ทั้งหมด
POST   /admin/users           # สร้างผู้ใช้ใหม่
GET    /admin/users/:id       # ดูผู้ใช้เฉพาะ
PATCH  /admin/users/:id       # อัพเดทผู้ใช้
DELETE /admin/users/:id       # ลบผู้ใช้
```

#### **การจัดการสินค้า (2 endpoints)**
```http
PATCH  /admin/products/:id    # อัพเดทสินค้า
DELETE /admin/products/:id    # ลบสินค้า
```

#### **การจัดการคำสั่งซื้อ (5 endpoints)**
```http
GET   /admin/orders              # รายการคำสั่งซื้อทั้งหมด (พร้อมตัวกรอง)
GET   /admin/orders/statistics   # สถิติคำสั่งซื้อ
GET   /admin/orders/:id          # รายละเอียดคำสั่งซื้อ
PATCH /admin/orders/:id/status   # อัพเดทสถานะคำสั่งซื้อ
POST  /admin/orders/:id/callback # เรียก callback คำสั่งซื้อ
```

#### **การจัดการประกาศ (8 endpoints)**
```http
GET    /admin/announcements           # รายการประกาศทั้งหมด
POST   /admin/announcements           # สร้างประกาศ
GET    /admin/announcements/:id       # รายละเอียดประกาศ
PATCH  /admin/announcements/:id       # อัพเดทประกาศ
DELETE /admin/announcements/:id       # ลบประกาศ
POST   /admin/announcements/:id/publish # เผยแพร่ประกาศ
POST   /admin/announcements/:id/archive # เก็บประกาศ
GET    /admin/announcements/analytics # การวิเคราะห์ประกาศ
```

#### **การตรวจสอบความปลอดภัย (9 endpoints)**
```http
GET  /admin/security/stats              # สถิติความปลอดภัย
GET  /admin/security/events             # เหตุการณ์ความปลอดภัย
GET  /admin/security/alerts             # การแจ้งเตือนความปลอดภัย
POST /admin/security/alerts/:alertId/resolve # แก้ไขการแจ้งเตือน
GET  /admin/security/activity           # บันทึกกิจกรรมทั้งหมด
POST /admin/security/unlock/:userId     # ปลดล็อคบัญชีผู้ใช้
GET  /admin/security/users/:userId/logs # บันทึกกิจกรรมผู้ใช้
```

#### **การจัดการการฝากเงิน (12 endpoints)**
```http
# การจัดการบัญชีร้านค้า
GET    /admin/deposits/store-accounts                    # รายการบัญชีร้านค้า
GET    /admin/deposits/store-accounts/:id                # ดูบัญชีร้านค้า
POST   /admin/deposits/store-accounts                    # สร้างบัญชีร้านค้า
PUT    /admin/deposits/store-accounts/:id                # อัพเดทบัญชีร้านค้า
PATCH  /admin/deposits/store-accounts/:id/toggle-status  # สลับสถานะบัญชี
DELETE /admin/deposits/store-accounts/:id                # ลบบัญชีร้านค้า

# การจัดการคำขอฝากเงิน
GET  /admin/deposits/requests              # รายการคำขอฝากเงิน (พร้อมตัวกรอง)
GET  /admin/deposits/requests/:id          # รายละเอียดคำขอฝากเงิน
POST /admin/deposits/requests/:id/approve  # อนุมัติคำขอฝากเงิน
POST /admin/deposits/requests/:id/reject   # ปฏิเสธคำขอฝากเงิน
GET  /admin/deposits/statistics            # สถิติการฝากเงิน
```

## 🛡️ สถาปัตยกรรมความปลอดภัย

### **การยืนยันตัวตนและการอนุญาต**
- **JWT Tokens**: การยืนยันตัวตนที่ปลอดภัยด้วย token พร้อม refresh rotation
- **การจัดการ Session**: การเก็บ session ด้วย Redis พร้อม TTL
- **ระบบควบคุมการเข้าถึงตามบทบาท**: ระบบอนุญาตที่ละเอียด
- **การล็อคบัญชี**: การป้องกันการโจมตี brute force
- **การระบุอุปกรณ์**: การระบุอุปกรณ์ขั้นสูง

### **การตรวจสอบและทำความสะอาดข้อมูลนำเข้า**
- **Zod Validation**: การตรวจสอบ type แบบ runtime
- **การป้องกัน SQL Injection**: การใช้ parameterized queries ด้วย Drizzle ORM
- **การป้องกัน XSS**: การทำความสะอาดข้อมูลนำเข้าและการเข้ารหัสข้อมูลส่งออก
- **การป้องกัน CSRF**: การป้องกันการปลอมแปลงคำขอข้ามไซต์
- **Rate Limiting**: การควบคุมคำขออย่างชาญฉลาดและการป้องกันการใช้งานในทางที่ผิด

### **การตรวจสอบความปลอดภัย**
- **การบันทึกกิจกรรม**: การติดตามกิจกรรมผู้ใช้อย่างครบถ้วน
- **การตรวจจับภัยคุกคาม**: การตรวจสอบกิจกรรมที่น่าสงสัยแบบ real-time
- **การแจ้งเตือนความปลอดภัย**: ระบบแจ้งเตือนอัตโนมัติสำหรับเหตุการณ์ความปลอดภัย
- **การติดตามการตรวจสอบ**: การบันทึกทางนิติวิทยาศาสตร์ที่สมบูรณ์เพื่อการปฏิบัติตามกฎระเบียบ
- **การวิเคราะห์ IP**: การตรวจสอบตำแหน่งและชื่อเสียง

## 📊 โครงสร้างฐานข้อมูล

### **ตารางหลัก**
```sql
-- การจัดการผู้ใช้
users                    # บัญชีผู้ใช้และการยืนยันตัวตน
user_sessions           # การจัดการ session ที่ใช้งานอยู่
user_activity_logs      # การติดตามกิจกรรมอย่างครบถ้วน
security_alerts         # การตรวจสอบและแจ้งเตือนความปลอดภัย

-- อีคอมเมิร์ซ
products               # แคตตาล็อกสินค้าและ metadata
product_prices         # การกำหนดราคาแบบไดนามิกและสต็อก
orders                 # การประมวลผลและดำเนินการคำสั่งซื้อ

-- การเงิน
wallets               # ยอดเงินกระเป๋าผู้ใช้
wallet_transactions   # ประวัติธุรกรรม
deposit_requests      # ระบบฝากเงินด้วยสลิป
store_bank_accounts   # รองรับบัญชีธนาคารหลายแห่ง
slip_records          # การตรวจสอบสลิปการฝากเงิน

-- การสื่อสาร
announcements         # ประกาศระบบ
announcement_reads    # การติดตามสถานะการอ่าน
notifications         # การแจ้งเตือนผู้ใช้
user_notification_preferences # การตั้งค่าการแจ้งเตือน
```

## 🧪 การทดสอบ

### **ชุดทดสอบที่ครบถ้วน**
- **54+ ฟังก์ชันความปลอดภัย** ทดสอบและตรวจสอบแล้ว
- **ระบบการยืนยันตัวตน** พร้อมการครอบคลุมที่สมบูรณ์
- **การติดตามอุปกรณ์** และการทดสอบการระบุอุปกรณ์
- **ขั้นตอนการทำงานอีคอมเมิร์ซ** การทดสอบแบบ end-to-end
- **การทดสอบประสิทธิภาพ** พร้อมการจำลองโหลด

### **การรันการทดสอบ**
```bash
# รันการทดสอบทั้งหมด
bun run test:all

# ชุดทดสอบเฉพาะ
bun run test:auth      # การทดสอบการยืนยันตัวตน
bun run test:security  # การทดสอบความปลอดภัย
bun run test:device    # การทดสอบการติดตามอุปกรณ์
bun run test:ecommerce # การทดสอบอีคอมเมิร์ซ
bun run test:performance # การทดสอบประสิทธิภาพ

# โหมด watch
bun run test:watch

# รายงานการครอบคลุม
bun run test:coverage
```

## 🚀 การ Deploy

### **การตั้งค่าสำหรับ Production**
```bash
# Build สำหรับ production
bun run build

# เริ่ม production server
bun run start

# ใช้ Docker
docker-compose -f docker-compose.prod.yml up -d
```

### **ตัวแปร Environment**
```env
# ฐานข้อมูล
DATABASE_URL=postgresql://user:pass@localhost:5432/digi_pocket
REDIS_URL=redis://localhost:6379

# ความปลอดภัย
JWT_SECRET=your-super-secret-jwt-key
BCRYPT_ROUNDS=12

# API
PORT=3031
NODE_ENV=production

# บริการภายนอก
PEAMSUB_API_URL=https://api.peamsub.com
PEAMSUB_API_KEY=your-api-key
PEAMSUB_USERNAME=your-username
PEAMSUB_PASSWORD=your-password
```

## 📁 โครงสร้างโปรเจกต์

```
backend/
├── src/
│   ├── app.ts              # จุดเริ่มต้นแอปพลิเคชันหลัก
│   ├── controllers/        # ตัวจัดการคำขอ
│   │   ├── admin/          # Controllers เฉพาะผู้ดูแลระบบ
│   │   ├── auth.controller.ts
│   │   ├── order.controller.ts
│   │   ├── wallet.controller.ts
│   │   └── ...
│   ├── services/           # ตรรกะทางธุรกิจ
│   │   ├── auth.service.ts
│   │   ├── security.service.ts
│   │   ├── wallet.service.ts
│   │   └── ...
│   ├── middleware/         # Middleware ที่กำหนดเอง
│   │   ├── auth.ts
│   │   ├── admin.ts
│   │   ├── errorHandler.ts
│   │   └── ...
│   ├── routes/             # เส้นทาง API
│   │   ├── admin.route.ts
│   │   ├── auth.route.ts
│   │   ├── order.route.ts
│   │   └── ...
│   ├── db/                 # ชั้นฐานข้อมูล
│   │   ├── schemas/        # Drizzle schemas
│   │   ├── migrations/     # Database migrations
│   │   └── index.ts
│   ├── utils/              # ฟังก์ชันยูทิลิตี้
│   │   ├── security.utils.ts
│   │   ├── validation.ts
│   │   └── ...
│   ├── types/              # คำจำกัดความ TypeScript
│   ├── config/             # ไฟล์การกำหนดค่า
│   ├── docs/               # เอกสาร API
│   └── workers/            # Background workers
├── tests/                  # ชุดทดสอบ
├── docker/                 # การกำหนดค่า Docker
├── package.json
├── tsconfig.json
├── drizzle.config.ts
└── docker-compose.yml
```

## 🔧 คำสั่งที่ใช้ได้

```bash
# การพัฒนา
bun run dev          # เริ่ม development server พร้อม hot reload
bun run start        # เริ่ม production server
bun run worker       # เริ่ม background worker
bun run product-sync # เริ่ม product sync worker

# ฐานข้อมูล
bun run db:push      # Push การเปลี่ยนแปลง schema ไปยังฐานข้อมูล
bun run db:clear     # ล้างข้อมูลทั้งหมด (เก็บ schema)
bun run db:reset     # รีเซ็ตฐานข้อมูล (drop + recreate)
bun run db:fresh     # รีเซ็ตและ push schema

# การทดสอบ
bun run test         # รันการทดสอบทั้งหมด
bun run test:all     # รันชุดทดสอบที่ครบถ้วน
bun run test:auth    # รันการทดสอบการยืนยันตัวตน
bun run test:security # รันการทดสอบความปลอดภัย
bun run test:watch   # รันการทดสอบในโหมด watch
bun run test:coverage # รันการทดสอบพร้อมการครอบคลุม

# ยูทิลิตี้
bun run lint         # รัน ESLint
bun run type-check   # รันการตรวจสอบ TypeScript type
```

## 🤝 การมีส่วนร่วม

1. Fork repository
2. สร้าง feature branch ของคุณ (`git checkout -b feature/amazing-feature`)
3. Commit การเปลี่ยนแปลงของคุณ (`git commit -m 'Add some amazing feature'`)
4. Push ไปยัง branch (`git push origin feature/amazing-feature`)
5. เปิด Pull Request

## 📄 ใบอนุญาต

โปรเจกต์นี้ได้รับอนุญาตภายใต้ MIT License - ดูไฟล์ [LICENSE](LICENSE) สำหรับรายละเอียด

## 🙏 การขอบคุณ

- [Bun](https://bun.sh/) สำหรับ JavaScript runtime ที่น่าทึ่ง
- [Hono](https://hono.dev/) สำหรับ web framework ที่เบา
- [Drizzle ORM](https://orm.drizzle.team/) สำหรับการจัดการฐานข้อมูลที่ปลอดภัยด้วย type
- [Zod](https://zod.dev/) สำหรับการตรวจสอบ type แบบ runtime
- [Redis](https://redis.io/) สำหรับ caching ประสิทธิภาพสูง
- [PostgreSQL](https://www.postgresql.org/) สำหรับการเก็บข้อมูลที่เชื่อถือได้

## 📞 การสนับสนุน

- **เอกสาร**: [API Docs](http://localhost:3031/swagger)
- **Issues**: [GitHub Issues](https://github.com/THXNXKXT/digi-pocket-th/issues)
- **การสนทนา**: [GitHub Discussions](https://github.com/THXNXKXT/digi-pocket-th/discussions)

---

**สร้างด้วย ❤️ สำหรับระบบนิเวศตลาดดิจิทัลไทย**
