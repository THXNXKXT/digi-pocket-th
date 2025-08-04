# Product Sync Configuration

## Overview

ระบบ Product Sync ได้รับการปรับปรุงให้สามารถกำหนดค่าได้ผ่าน Environment Variables ทำให้สามารถปรับแต่งการทำงานได้ง่ายๆ โดยไม่ต้องแก้ไขโค้ด

## Environment Variables

### 🔧 **Sync Configuration**

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `SYNC_INTERVAL_MINUTES` | number | `5` | ช่วงเวลาการ sync (นาที) |
| `SYNC_ON_START` | boolean | `true` | รัน sync ทันทีตอน start worker |
| `CLEAR_ALL_DATA` | boolean | `true` | เคลียร์ข้อมูลทั้งหมดหรือเฉพาะเก่า |
| `SYNC_TYPES` | string | `app-premium,preorder,game,mobile,cashcard` | ประเภทสินค้าที่จะ sync |

### 📝 **Configuration Examples**

#### **Development (Fast Sync)**
```env
SYNC_INTERVAL_MINUTES=2
SYNC_ON_START=true
CLEAR_ALL_DATA=true
SYNC_TYPES=game,mobile
```

#### **Production (Stable)**
```env
SYNC_INTERVAL_MINUTES=10
SYNC_ON_START=true
CLEAR_ALL_DATA=false
SYNC_TYPES=app-premium,preorder,game,mobile,cashcard
```

#### **Testing (Manual Control)**
```env
SYNC_INTERVAL_MINUTES=60
SYNC_ON_START=false
CLEAR_ALL_DATA=true
SYNC_TYPES=game
```

## Configuration Details

### **SYNC_INTERVAL_MINUTES**
- **Purpose:** กำหนดช่วงเวลาการ sync อัตโนมัติ
- **Range:** 1-1440 นาที (1 นาที - 24 ชั่วโมง)
- **Recommendations:**
  - **Development:** 2-5 นาที
  - **Production:** 5-15 นาที
  - **Low Traffic:** 30-60 นาที

### **SYNC_ON_START**
- **Purpose:** กำหนดว่าจะรัน sync ทันทีตอน start worker หรือไม่
- **Values:**
  - `true` - รัน sync ทันที (แนะนำ)
  - `false` - รอจนถึงรอบถัดไป
- **Use Cases:**
  - `true`: Production, Development
  - `false`: Testing, Debugging

### **CLEAR_ALL_DATA**
- **Purpose:** กำหนดวิธีการเคลียร์ข้อมูลเก่า
- **Values:**
  - `true` - ลบข้อมูลทั้งหมดแล้วเพิ่มใหม่ (แก้ปัญหา info field)
  - `false` - เก็บข้อมูลล่าสุด 1 record ต่อสินค้า
- **Recommendations:**
  - `true`: เมื่อมีปัญหา info field ไม่ตรงกัน
  - `false`: เมื่อต้องการประหยัด performance

### **SYNC_TYPES**
- **Purpose:** กำหนดประเภทสินค้าที่จะ sync
- **Format:** comma-separated values
- **Available Types:**
  - `app-premium` - แอปพรีเมียม
  - `preorder` - สินค้าพรีออเดอร์
  - `game` - เกม
  - `mobile` - มือถือ
  - `cashcard` - บัตรเงินสด
- **Examples:**
  - `game,mobile` - sync เฉพาะเกมและมือถือ
  - `app-premium` - sync เฉพาะแอปพรีเมียม
  - `app-premium,game,mobile,cashcard` - sync ทุกอย่างยกเว้น preorder

## Usage Examples

### **Quick Configuration Changes**

#### **เปลี่ยนเวลา sync เป็น 10 นาที:**
```bash
# แก้ไข .env
SYNC_INTERVAL_MINUTES=10

# restart worker
bun run product-sync
```

#### **Sync เฉพาะเกม:**
```bash
# แก้ไข .env
SYNC_TYPES=game

# restart worker
bun run product-sync
```

#### **ปิดการ sync ตอน start:**
```bash
# แก้ไข .env
SYNC_ON_START=false

# restart worker
bun run product-sync
```

### **Runtime Configuration Check**

เมื่อ start worker จะแสดง configuration ปัจจุบัน:

```
[product-sync] Product sync worker starting...
[product-sync] Configuration:
  - Sync interval: 5 minutes
  - Sync on start: true
  - Clear all data: true
  - Sync types: [app-premium, preorder, game, mobile, cashcard]
```

## Legacy Environment Variables

### **🗑️ ไม่ใช้แล้ว (สามารถลบได้)**

| Variable | Status | Replacement |
|----------|--------|-------------|
| `PRUNE_KEEP_COUNT` | ❌ Deprecated | ใช้ `CLEAR_ALL_DATA` แทน |
| `PRUNE_MAX_AGE_DAYS` | ❌ Deprecated | ใช้ `SYNC_INTERVAL_MINUTES` แทน |
| `PRUNE_INTERVAL_HOURS` | ❌ Deprecated | ใช้ `SYNC_INTERVAL_MINUTES` แทน |

### **Migration Guide**

#### **เก่า (ไม่ใช้แล้ว):**
```env
PRUNE_KEEP_COUNT=10
PRUNE_MAX_AGE_DAYS=3
PRUNE_INTERVAL_HOURS=24
```

#### **ใหม่ (แนะนำ):**
```env
SYNC_INTERVAL_MINUTES=5
CLEAR_ALL_DATA=true
SYNC_TYPES=app-premium,preorder,game,mobile,cashcard
```

## Monitoring

### **Log Messages**

#### **Configuration Display:**
```
[product-sync] Configuration: interval=5min, clearAll=true, types=[app-premium, preorder, game, mobile, cashcard]
```

#### **Sync Results:**
```
[product-sync] Sync cycle completed - Success: 5, Errors: 0, Cleared: 234 records, Duration: 12500ms
```

### **Performance Monitoring**

#### **Check Sync Performance:**
```bash
# ดู logs
tail -f logs/app.log | grep "product-sync"

# ดู database size
bun run clear-prices:stats
```

## Troubleshooting

### **Common Issues**

#### **1. Sync ช้าเกินไป**
```env
# ลดช่วงเวลา sync
SYNC_INTERVAL_MINUTES=2

# Sync เฉพาะประเภทที่จำเป็น
SYNC_TYPES=game,mobile
```

#### **2. ข้อมูล info field ไม่ตรงกัน**
```env
# เปิดการเคลียร์ข้อมูลทั้งหมด
CLEAR_ALL_DATA=true
```

#### **3. Worker ใช้ memory มาก**
```env
# ปิดการเคลียร์ข้อมูลทั้งหมด
CLEAR_ALL_DATA=false

# เพิ่มช่วงเวลา sync
SYNC_INTERVAL_MINUTES=15
```

#### **4. ต้องการ sync manual**
```env
# ปิด auto sync
SYNC_ON_START=false
SYNC_INTERVAL_MINUTES=999999

# รัน manual
bun run clear-prices:type-all game
```

## Best Practices

### **Production Settings**
```env
SYNC_INTERVAL_MINUTES=10
SYNC_ON_START=true
CLEAR_ALL_DATA=false
SYNC_TYPES=app-premium,preorder,game,mobile,cashcard
```

### **Development Settings**
```env
SYNC_INTERVAL_MINUTES=5
SYNC_ON_START=true
CLEAR_ALL_DATA=true
SYNC_TYPES=game,mobile
```

### **Testing Settings**
```env
SYNC_INTERVAL_MINUTES=60
SYNC_ON_START=false
CLEAR_ALL_DATA=true
SYNC_TYPES=game
```
