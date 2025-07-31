# Order API Examples

## การสั่งซื้อสินค้าแต่ละประเภท

### 1. App-Premium (แอคพรีเมียม – ได้ code ทันที)
```json
POST /orders
{
  "productId": "9501a0d0-b478-4131-8edc-a5761101a104",
  "quantity": 1,
  "unitPrice": 10
}
```
- ได้ code ทันทีหลังสั่งซื้อ
- Status จะเป็น "success" ทันที
- Code จะอยู่ในฟิลด์ `code` ของ response

### 2. เติมเกม (Game)
```json
POST /orders
{
  "productId": "e2f59b37-597e-4948-8af9-2c5d71a2ecb0",
  "quantity": 1,
  "unitPrice": 15,
  "uid": "123456789"
}
```
- ต้องระบุ `uid` (UID ผู้เล่น)
- ลูกค้าจะได้ราคา `recommended` (เช่น 15 บาท)
- Status เริ่มต้นเป็น "pending" รอ callback

### 3. Preorder (พรีออเดอร์ – รอ callback อัพเดต)
```json
POST /orders
{
  "productId": "9f80a1a4-1d7c-4eb5-9a3a-cb0a9afe86a7",
  "quantity": 1,
  "unitPrice": 5
}
```
- ไม่ต้องส่ง reference (สร้างอัตโนมัติใน backend)
- ลูกค้าจะได้ราคา `price` (เช่น 5 บาท)
- Status เริ่มต้นเป็น "pending" รอ callback
- เมื่อได้รางวัลจะอัพเดต code ในฟิลด์ `code`

### 4. Mobile (เติมเน็ต / เติมเงินมือถือ)
```json
POST /orders
{
  "productId": "2ad34cbf-0d4e-4d26-9aa3-30ff1f8c1586",
  "quantity": 1,
  "unitPrice": 20,
  "number": "0801234567"
}
```
- ต้องระบุ `number` (เบอร์มือถือ 9-10 หลัก)
- ลูกค้าจะได้ราคา `recommended` (เช่น 20 บาท)
- Status เริ่มต้นเป็น "pending" รอ callback

### 5. Cashcard (บัตรเงินสด)
```json
POST /orders
{
  "productId": "b57e6e3d-7899-4769-ae9f-5ab96d1c0e2e",
  "quantity": 1,
  "unitPrice": 50
}
```
- ลูกค้าจะได้ราคา `recommended` (เช่น 50 บาท)
- Status เริ่มต้นเป็น "pending" รอ callback
- Code จะได้หลัง callback success

## API Endpoints อื่นๆ

### ดูราคาสินค้าก่อนสั่งซื้อ
```
GET /orders/price/{productId}
```
Response:
```json
{
  "success": true,
  "message": "Product price retrieved successfully",
  "data": {
    "productId": "9501a0d0-b478-4131-8edc-a5761101a104",
    "price": 10,
    "userRole": "customer"
  }
}
```

**หมายเหตุ**: ราคาที่ได้จะแตกต่างกันตาม user role และประเภทสินค้า:
- **Admin**: ได้ราคา `agentPrice` (ถ้ามี) หรือ `price` หรือ `recommended`
- **Customer + Game/Mobile/Cashcard**: ได้ราคา `recommended` (ถ้ามี) หรือ `price`
- **Customer + App-Premium/Preorder**: ได้ราคา `price` (ถ้ามี) หรือ `recommended`

### ดูรายการออเดอร์ของตัวเอง
```
GET /orders?page=1&limit=20&status=success
```

### ดูรายละเอียดออเดอร์
```
GET /orders/{orderId}
```

### ยกเลิกออเดอร์ (เฉพาะ pending)
```
PATCH /orders/{orderId}/cancel
```

## Order Status
- `pending`: รอการประมวลผล/callback
- `success`: สำเร็จ (มี code ถ้าเป็นสินค้าที่ให้ code)
- `failed`: ล้มเหลว (เงินจะถูกคืน)
- `refunded`: ถูกคืนเงินโดย admin

## Error Handling
- ระบบจะตรวจสอบราคาที่ส่งมาว่าตรงกับราคาจริงหรือไม่
- ตรวจสอบ required fields ตาม product type
- ตรวจสอบสถานะ user และความพร้อมของสินค้า
- หักเงินก่อนสั่งซื้อ และคืนเงินอัตโนมัติถ้าล้มเหลว

## Pricing Logic

### Customer Pricing
- **Game, Mobile, Cashcard**: ใช้ราคา `recommended` (ราคาแนะนำ)
- **App-Premium, Preorder**: ใช้ราคา `price` (ราคาปกติ)

### Admin Pricing
- ใช้ราคา `agentPrice` (ราคาตัวแทน) ถ้ามี
- ถ้าไม่มี `agentPrice` จะใช้ `price` หรือ `recommended` ตามลำดับ

### Price Validation
- ระบบจะตรวจสอบว่าราคาที่ส่งมาใน `unitPrice` ตรงกับราคาที่คำนวณได้หรือไม่
- ถ้าราคาไม่ตรงกัน (ต่างกันเกิน 0.01 บาท) จะ return error
- ควรเรียก `GET /orders/price/{productId}` ก่อนสั่งซื้อเพื่อดูราคาที่ถูกต้อง

## Admin Features
- ดูรายการออเดอร์ทั้งหมดพร้อม filter
- อัพเดต status ออเดอร์
- ดู statistics และ analytics
- Trigger callback manually