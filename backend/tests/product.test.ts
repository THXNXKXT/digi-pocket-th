/// <reference types="bun-types" />
import { describe, it, expect } from 'bun:test';

const BASE_URL = `http://localhost:${process.env.PORT ?? 3000}`;

describe('API: /products/:type', () => {
  it('should respond with array of products and required fields', async () => {
    const res = await fetch(`${BASE_URL}/products/app-premium`);

    // ตรวจสอบ HTTP status
    expect(res.status).toBe(200);

    const body = await res.json();

    // โครงสร้าง success
    expect(body.success).toBe(true);
    expect(body.message).toBe('Success');
    expect(Array.isArray(body.data)).toBe(true);

    // ต้องมีสินค้าอย่างน้อย 1 รายการ
    expect(body.data.length).toBeGreaterThan(0);

    const first = body.data[0];

    // ตรวจสอบฟิลด์ที่ API ส่งมาจริง
    const requiredFields = [
      'id',
      'name',
      'price',
      'img',
      'stock',
    ];

    for (const f of requiredFields) {
      expect(first).toHaveProperty(f);
    }

    // ตรวจสอบฟิลด์เพิ่มเติมที่อาจมี
    if (first.pricevip !== undefined) {
      expect(typeof first.pricevip).toBe('number');
    }
    if (first.agent_price !== undefined) {
      expect(typeof first.agent_price).toBe('number');
    }
    if (first.type_app !== undefined) {
      expect(typeof first.type_app).toBe('string');
    }
    if (first.des !== undefined) {
      expect(typeof first.des).toBe('string');
    }

    // stock ต้องเป็นเลข (รวม 0)
    expect(typeof first.stock === 'number').toBe(true);
  });
}); 