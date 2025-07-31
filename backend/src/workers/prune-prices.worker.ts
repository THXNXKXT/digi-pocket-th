import { db } from '../db';
import { sql } from 'drizzle-orm';

const KEEP_COUNT = Number(process.env.PRUNE_KEEP_COUNT ?? 10); // เก็บล่าสุด X แถวต่อ product
const MAX_AGE_DAYS = Number(process.env.PRUNE_MAX_AGE_DAYS ?? 7); // ลบข้อมูลเก่ากว่า 7 วัน
const INTERVAL_HOURS = Number(process.env.PRUNE_INTERVAL_HOURS ?? 24); // ความถี่รัน (ชั่วโมง)

async function pruneOnce() {
  console.log('[prune-prices] start prune');
  try {
    const query = `
      DELETE FROM product_prices pr
      USING (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY product_id ORDER BY fetched_at DESC) AS rn, fetched_at
        FROM product_prices
      ) t
      WHERE pr.id = t.id
        AND (t.rn > ${KEEP_COUNT} OR pr.fetched_at < now() - interval '${MAX_AGE_DAYS} days');
    `;
    await db.execute(sql.raw(query));
    console.log('[prune-prices] prune completed');
  } catch (err) {
    console.error('[prune-prices] error', err);
  }
}

// รันรอบแรกทันที แล้วตั้ง interval
await pruneOnce();
setInterval(pruneOnce, INTERVAL_HOURS * 60 * 60 * 1000); 