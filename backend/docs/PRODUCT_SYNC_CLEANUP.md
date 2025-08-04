# Product Sync with Automatic Cleanup

## Overview

ระบบ sync ราคาสินค้าได้รับการปรับปรุงให้มีการเคลียร์ข้อมูลเก่าออกทันทีทุกครั้งที่มีการ sync ข้อมูลใหม่ เพื่อแก้ไขปัญหาข้อมูลใน field `info` ที่ไม่ตรงกับความเป็นจริงสำหรับสินค้าประเภทเกม

## Problem Statement

### ปัญหาเดิม:
- สินค้าประเภทเกมมีปัญหาที่เมื่อมีข้อมูลใหม่เข้ามา ข้อมูลใน field `info` จะไม่ตรงกับความเป็นจริง
- ข้อมูลราคาเก่าที่ไม่เกี่ยวข้องยังคงอยู่ในระบบ
- การแสดงผลข้อมูลอาจไม่สอดคล้องกับข้อมูลล่าสุด

### วิธีแก้ไข:
- เพิ่มการเคลียร์ข้อมูลราคาเก่าทันทีก่อนบันทึกข้อมูลใหม่
- เคลียร์เฉพาะข้อมูลของประเภทสินค้าที่กำลัง sync
- เก็บเฉพาะข้อมูลล่าสุด (1 record ต่อสินค้า)

## Implementation

### 1. Enhanced ProductPricesCleaner

เพิ่มฟังก์ชันใหม่ใน `ProductPricesCleaner`:

```typescript
// เคลียร์ข้อมูลทั้งหมดของประเภทสินค้า
static async clearByProductType(productType: string): Promise<{ deletedCount: number }>

// เคลียร์ข้อมูลเก่าของประเภทสินค้า (เก็บเฉพาะล่าสุด)
static async clearOldPricesByType(productType: string, keepLatest: number = 1): Promise<{ deletedCount: number }>
```

### 2. Modified Product Service

แก้ไข `productService.list()` ให้มีการเคลียร์ข้อมูลเก่าก่อน sync:

```typescript
// ขั้นตอนที่ 4: เคลียร์ข้อมูลเก่า
try {
  console.log(`[product-service] Clearing old price data for type: ${type}`);
  const clearResult = await ProductPricesCleaner.clearOldPricesByType(type, 1);
  console.log(`[product-service] Cleared ${clearResult.deletedCount} old price records for type: ${type}`);
} catch (error) {
  console.error(`[product-service] Failed to clear old price data for type ${type}:`, error);
  // ไม่ throw error เพื่อให้ sync ดำเนินต่อไปได้
}

// ขั้นตอนที่ 5: บันทึกข้อมูลใหม่
await db.transaction(async (tx) => {
  // ... upsert logic
});
```

## Usage

### Automatic Cleanup (ในระบบ)

การเคลียร์ข้อมูลเก่าจะทำงานอัตโนมัติทุกครั้งที่มีการ sync:

```typescript
// เมื่อเรียก API หรือ refresh
const products = await productService.list('game', true); // refresh=true
// ระบบจะเคลียร์ข้อมูลเก่าของเกมก่อนบันทึกข้อมูลใหม่
```

### Manual Cleanup Commands

```bash
# เคลียร์ข้อมูลทั้งหมดของประเภทสินค้า
bun run clear-prices:type game
bun run clear-prices:type mobile
bun run clear-prices:type cashcard
bun run clear-prices:type app-premium

# เคลียร์ข้อมูลเก่า (เก็บเฉพาะล่าสุด)
bun run clear-prices:type-old game 1
bun run clear-prices:type-old mobile 1

# ใช้ worker โดยตรง
bun run src/workers/clear-product-prices.worker.ts type game
bun run src/workers/clear-product-prices.worker.ts type-old game 1
```

### Package.json Scripts

```json
{
  "clear-prices:type": "bun run src/workers/clear-product-prices.worker.ts type",
  "clear-prices:type-old": "bun run src/workers/clear-product-prices.worker.ts type-old"
}
```

## Benefits

### 1. Data Consistency
- ข้อมูลใน field `info` จะตรงกับความเป็นจริงเสมอ
- ไม่มีข้อมูลราคาเก่าที่ไม่เกี่ยวข้อง
- การแสดงผลสอดคล้องกับข้อมูลล่าสุด

### 2. Performance
- ลดขนาดข้อมูลในตาราง `product_prices`
- Query เร็วขึ้นเนื่องจากข้อมูลน้อยลง
- ลด memory usage

### 3. Maintenance
- ไม่ต้องเคลียร์ข้อมูลเก่าด้วยตนเอง
- ระบบดูแลตัวเองอัตโนมัติ
- ลดความซับซ้อนในการจัดการข้อมูล

## Error Handling

### Graceful Degradation
```typescript
try {
  // เคลียร์ข้อมูลเก่า
  await ProductPricesCleaner.clearOldPricesByType(type, 1);
} catch (error) {
  console.error(`Failed to clear old data:`, error);
  // ไม่ throw error เพื่อให้ sync ดำเนินต่อไปได้
}
```

### Logging
- บันทึก log ทุกครั้งที่เคลียร์ข้อมูล
- แสดงจำนวน records ที่ถูกลบ
- บันทึก error หากเกิดปัญหา

## Monitoring

### Check Cleanup Results
```bash
# ดูสถิติข้อมูล
bun run clear-prices:stats

# ดูจำนวน records ต่อประเภท
bun run src/workers/clear-product-prices.worker.ts stats
```

### Expected Output
```
📊 Product Prices Statistics:
Total records: 1,234
Unique products: 1,234
Oldest record: 2024-01-15 14:30:00
Newest record: 2024-01-15 15:30:00

Top products by record count:
1. game-product-1: 1 records
2. mobile-product-1: 1 records
3. cashcard-product-1: 1 records
```

## Configuration

### Cleanup Settings
```typescript
// เก็บข้อมูลล่าสุด 1 record ต่อสินค้า (default)
await ProductPricesCleaner.clearOldPricesByType('game', 1);

// เก็บข้อมูลล่าสุด 3 records ต่อสินค้า
await ProductPricesCleaner.clearOldPricesByType('game', 3);
```

### Product Types
- `game` - เกม
- `mobile` - มือถือ
- `cashcard` - บัตรเงินสด
- `app-premium` - แอปพรีเมียม

## Troubleshooting

### Common Issues

1. **Cleanup ล้มเหลว**
   ```bash
   # ตรวจสอบ database connection
   bun run db:push
   
   # ลองเคลียร์ด้วยตนเอง
   bun run clear-prices:type-old game 1
   ```

2. **ข้อมูลยังไม่ตรงกัน**
   ```bash
   # Force refresh
   curl "http://localhost:3000/api/products/game?refresh=true"
   
   # ตรวจสอบ logs
   tail -f logs/app.log
   ```

3. **Performance ช้า**
   ```bash
   # ตรวจสอบจำนวนข้อมูล
   bun run clear-prices:stats
   
   # เคลียร์ข้อมูลเก่าทั้งหมด
   bun run clear-prices:type-old game 1
   ```

## Alternative Solutions

หากไม่ต้องการเคลียร์ข้อมูลเก่าทันที สามารถใช้วิธีอื่น:

### 1. Query Optimization
```sql
-- ใช้ DISTINCT ON เพื่อเลือกข้อมูลล่าสุด
SELECT DISTINCT ON (p.id) p.*, pr.*
FROM products p
JOIN product_prices pr ON pr.product_id = p.id
WHERE p.type = 'game'
ORDER BY p.id, pr.fetched_at DESC, pr.id DESC;
```

### 2. View-based Approach
```sql
-- สร้าง view สำหรับข้อมูลล่าสุด
CREATE VIEW latest_product_prices AS
SELECT DISTINCT ON (product_id) *
FROM product_prices
ORDER BY product_id, fetched_at DESC, id DESC;
```

### 3. Scheduled Cleanup
```bash
# ใช้ task scheduler เคลียร์ทุก 6 ชั่วโมง
bun run scheduler:start
```
