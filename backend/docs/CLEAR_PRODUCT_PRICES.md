# Product Prices Cleaner

เครื่องมือสำหรับจัดการและลบข้อมูล `product_prices` ในฐานข้อมูล

## 🚀 การใช้งาน

### คำสั่งพื้นฐาน

```bash
# ดูสถิติข้อมูล
bun run clear-prices:stats

# ลบข้อมูลทั้งหมด (ระวัง!)
bun run clear-prices:all

# ดูคำสั่งทั้งหมด
bun run clear-prices
```

### คำสั่งแบบละเอียด

```bash
# ลบข้อมูลของ product ที่กำหนด
bun run clear-prices product <product-id>

# ลบข้อมูลเก่ากว่า X วัน
bun run clear-prices older <days>

# เก็บข้อมูลล่าสุด X แถวต่อ product (ลบที่เหลือ)
bun run clear-prices keep <count>

# ดูสถิติข้อมูล
bun run clear-prices stats
```

## 📋 ตัวอย่างการใช้งาน

### 1. ดูสถิติข้อมูลก่อนลบ

```bash
bun run clear-prices stats
```

ผลลัพธ์:
```
📊 Product Prices Statistics:
Total records: 15,432
Unique products: 234
Oldest record: 1/15/2024, 10:30:00 AM
Newest record: 1/31/2024, 3:45:00 PM

Top products by record count:
1. abc-123: 1,234 records
2. def-456: 987 records
3. ghi-789: 654 records
...
```

### 2. ลบข้อมูลเก่ากว่า 30 วัน

```bash
bun run clear-prices older 30
```

### 3. เก็บข้อมูลล่าสุด 10 แถวต่อ product

```bash
bun run clear-prices keep 10
```

### 4. ลบข้อมูลของ product ที่กำหนด

```bash
bun run clear-prices product abc-123-def-456
```

### 5. ลบข้อมูลทั้งหมด (ระวัง!)

```bash
bun run clear-prices all
```

## ⚠️ คำเตือน

### การลบข้อมูลทั้งหมด
- คำสั่ง `all` จะลบข้อมูล product_prices ทั้งหมด
- **ไม่สามารถกู้คืนได้** หลังจากลบแล้ว
- แนะนำให้ backup ฐานข้อมูลก่อนใช้คำสั่งนี้

### การใช้งานใน Production
- ควรทดสอบคำสั่งใน development environment ก่อน
- ใช้คำสั่ง `stats` เพื่อดูข้อมูลก่อนลบ
- พิจารณาใช้คำสั่ง `keep` แทน `all` เพื่อความปลอดภัย

## 🔧 การทำงานภายใน

### โครงสร้าง ProductPricesCleaner Class

```typescript
class ProductPricesCleaner {
  // ลบทั้งหมด
  static async clearAll(): Promise<{ deletedCount: number }>
  
  // ลบตาม product ID
  static async clearByProductId(productId: string): Promise<{ deletedCount: number }>
  
  // ลบข้อมูลเก่ากว่า X วัน
  static async clearOlderThan(days: number): Promise<{ deletedCount: number }>
  
  // เก็บข้อมูลล่าสุด X แถว
  static async keepLatestOnly(keepCount: number): Promise<{ deletedCount: number }>
  
  // ลบข้อมูลก่อนวันที่กำหนด
  static async clearBeforeDate(date: Date): Promise<{ deletedCount: number }>
  
  // ดูสถิติ
  static async getStats(): Promise<StatsResult>
}
```

### SQL Queries ที่ใช้

#### ลบข้อมูลเก่ากว่า X วัน
```sql
DELETE FROM product_prices 
WHERE fetched_at < now() - interval 'X days'
```

#### เก็บข้อมูลล่าสุด X แถวต่อ product
```sql
DELETE FROM product_prices pr
USING (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY product_id ORDER BY fetched_at DESC) AS rn
  FROM product_prices
) t
WHERE pr.id = t.id AND t.rn > X
```

## 🔄 การใช้งานร่วมกับ Prune Worker

โปรเจกต์มี worker อื่นสำหรับ prune ข้อมูลอัตโนมัติ:

```bash
# Prune worker (ทำงานอัตโนมัติ)
bun run prune-prices
```

### ความแตกต่าง:
- **Prune Worker**: ทำงานอัตโนมัติตาม schedule, ลบข้อมูลเก่าและเก็บจำนวนที่กำหนด
- **Clear Worker**: ใช้งานแบบ manual, มีตัวเลือกการลบที่หลากหลาย

## 📊 การ Monitor และ Logging

เครื่องมือจะแสดง log ระหว่างการทำงาน:

```
[clear-product-prices] Clearing prices older than 30 days
[clear-product-prices] Deleted 5,432 records older than 30 days
```

### Log Levels:
- `console.log`: ข้อมูลการทำงานปกติ
- `console.error`: ข้อผิดพลาด
- `console.warn`: คำเตือน

## 🛠️ การ Customize

### เพิ่มฟังก์ชันใหม่

```typescript
// เพิ่มใน ProductPricesCleaner class
static async clearByDateRange(startDate: Date, endDate: Date) {
  // Implementation here
}
```

### เพิ่มคำสั่ง CLI

```typescript
// เพิ่มใน main() function
case 'range':
  const startDate = new Date(args[1]);
  const endDate = new Date(args[2]);
  await ProductPricesCleaner.clearByDateRange(startDate, endDate);
  break;
```

## 🔗 เอกสารที่เกี่ยวข้อง

- [Database Schema](../DATABASE_SCHEMA.md)
- [Prune Prices Worker](../src/workers/prune-prices.worker.ts)
- [Product Schema](../src/db/schemas/product.ts)

## 📞 การขอความช่วยเหลือ

หากมีปัญหาหรือข้อสงสัย:
1. ตรวจสอบ log ข้อผิดพลาด
2. ใช้คำสั่ง `stats` เพื่อดูสถานะข้อมูล
3. ตรวจสอบการเชื่อมต่อฐานข้อมูล
4. ติดต่อทีมพัฒนา
