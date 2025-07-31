import { db } from '../db';
import { productPrices } from '../db/schemas/product';
import { sql } from 'drizzle-orm';

/**
 * Worker สำหรับ clear ข้อมูล product_prices
 * รองรับการลบข้อมูลแบบต่างๆ:
 * - ลบทั้งหมด
 * - ลบตาม product ID
 * - ลบข้อมูลเก่ากว่าวันที่กำหนด
 * - ลบข้อมูลเก่าแต่เก็บจำนวนล่าสุดไว้
 */

interface ClearOptions {
  // ลบทั้งหมด
  all?: boolean;
  
  // ลบตาม product ID
  productId?: string;
  
  // ลบข้อมูลเก่ากว่า X วัน
  olderThanDays?: number;
  
  // เก็บข้อมูลล่าสุด X แถวต่อ product (ลบที่เหลือ)
  keepLatest?: number;
  
  // ลบข้อมูลก่อนวันที่กำหนด
  beforeDate?: Date;
}

export class ProductPricesCleaner {
  /**
   * ลบข้อมูล product_prices ทั้งหมด
   */
  static async clearAll(): Promise<{ deletedCount: number }> {
    console.log('[clear-product-prices] Clearing all product prices...');
    
    try {
      const result = await db.delete(productPrices);
      const deletedCount = result.rowCount || 0;
      
      console.log(`[clear-product-prices] Deleted ${deletedCount} records`);
      return { deletedCount };
    } catch (error) {
      console.error('[clear-product-prices] Error clearing all:', error);
      throw error;
    }
  }

  /**
   * ลบข้อมูลของ product ที่กำหนด
   */
  static async clearByProductId(productId: string): Promise<{ deletedCount: number }> {
    console.log(`[clear-product-prices] Clearing prices for product: ${productId}`);
    
    try {
      const result = await db.delete(productPrices)
        .where(sql`product_id = ${productId}`);
      
      const deletedCount = result.rowCount || 0;
      console.log(`[clear-product-prices] Deleted ${deletedCount} records for product ${productId}`);
      return { deletedCount };
    } catch (error) {
      console.error(`[clear-product-prices] Error clearing product ${productId}:`, error);
      throw error;
    }
  }

  /**
   * ลบข้อมูลเก่ากว่าจำนวนวันที่กำหนด
   */
  static async clearOlderThan(days: number): Promise<{ deletedCount: number }> {
    console.log(`[clear-product-prices] Clearing prices older than ${days} days`);
    
    try {
      const query = sql`
        DELETE FROM product_prices 
        WHERE fetched_at < now() - interval '${sql.raw(days.toString())} days'
      `;
      
      const result = await db.execute(query);
      const deletedCount = result.rowCount || 0;
      
      console.log(`[clear-product-prices] Deleted ${deletedCount} records older than ${days} days`);
      return { deletedCount };
    } catch (error) {
      console.error(`[clear-product-prices] Error clearing old data:`, error);
      throw error;
    }
  }

  /**
   * เก็บข้อมูลล่าสุด X แถวต่อ product และลบที่เหลือ
   */
  static async keepLatestOnly(keepCount: number): Promise<{ deletedCount: number }> {
    console.log(`[clear-product-prices] Keeping only latest ${keepCount} records per product`);
    
    try {
      const query = sql`
        DELETE FROM product_prices pr
        USING (
          SELECT id, ROW_NUMBER() OVER (PARTITION BY product_id ORDER BY fetched_at DESC) AS rn
          FROM product_prices
        ) t
        WHERE pr.id = t.id AND t.rn > ${sql.raw(keepCount.toString())}
      `;
      
      const result = await db.execute(query);
      const deletedCount = result.rowCount || 0;
      
      console.log(`[clear-product-prices] Deleted ${deletedCount} records, kept latest ${keepCount} per product`);
      return { deletedCount };
    } catch (error) {
      console.error(`[clear-product-prices] Error keeping latest only:`, error);
      throw error;
    }
  }

  /**
   * ลบข้อมูลก่อนวันที่กำหนด
   */
  static async clearBeforeDate(date: Date): Promise<{ deletedCount: number }> {
    console.log(`[clear-product-prices] Clearing prices before ${date.toISOString()}`);
    
    try {
      const result = await db.delete(productPrices)
        .where(sql`fetched_at < ${date.toISOString()}`);
      
      const deletedCount = result.rowCount || 0;
      console.log(`[clear-product-prices] Deleted ${deletedCount} records before ${date.toISOString()}`);
      return { deletedCount };
    } catch (error) {
      console.error(`[clear-product-prices] Error clearing before date:`, error);
      throw error;
    }
  }

  /**
   * ฟังก์ชันหลักสำหรับ clear ข้อมูลตาม options
   */
  static async clear(options: ClearOptions): Promise<{ deletedCount: number }> {
    if (options.all) {
      return this.clearAll();
    }
    
    if (options.productId) {
      return this.clearByProductId(options.productId);
    }
    
    if (options.olderThanDays) {
      return this.clearOlderThan(options.olderThanDays);
    }
    
    if (options.keepLatest) {
      return this.keepLatestOnly(options.keepLatest);
    }
    
    if (options.beforeDate) {
      return this.clearBeforeDate(options.beforeDate);
    }
    
    throw new Error('No clear option specified');
  }

  /**
   * ดูสถิติข้อมูล product_prices
   */
  static async getStats(): Promise<{
    totalRecords: number;
    uniqueProducts: number;
    oldestRecord: Date | null;
    newestRecord: Date | null;
    recordsPerProduct: Array<{ productId: string; count: number }>;
  }> {
    try {
      // นับจำนวนรวม
      const totalResult = await db.execute(sql`SELECT COUNT(*) as count FROM product_prices`);
      const totalRecords = Number(totalResult.rows[0]?.count || 0);

      // นับจำนวน product ที่ไม่ซ้ำ
      const uniqueResult = await db.execute(sql`SELECT COUNT(DISTINCT product_id) as count FROM product_prices`);
      const uniqueProducts = Number(uniqueResult.rows[0]?.count || 0);

      // หาวันที่เก่าสุดและใหม่สุด
      const dateResult = await db.execute(sql`
        SELECT 
          MIN(fetched_at) as oldest,
          MAX(fetched_at) as newest
        FROM product_prices
      `);
      
      const oldestRecord = dateResult.rows[0]?.oldest ? new Date(dateResult.rows[0].oldest as string) : null;
      const newestRecord = dateResult.rows[0]?.newest ? new Date(dateResult.rows[0].newest as string) : null;

      // นับจำนวนต่อ product
      const perProductResult = await db.execute(sql`
        SELECT 
          product_id,
          COUNT(*) as count
        FROM product_prices
        GROUP BY product_id
        ORDER BY count DESC
        LIMIT 20
      `);

      const recordsPerProduct = perProductResult.rows.map(row => ({
        productId: row.product_id as string,
        count: Number(row.count)
      }));

      return {
        totalRecords,
        uniqueProducts,
        oldestRecord,
        newestRecord,
        recordsPerProduct
      };
    } catch (error) {
      console.error('[clear-product-prices] Error getting stats:', error);
      throw error;
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case 'all':
        await ProductPricesCleaner.clearAll();
        break;
        
      case 'product':
        const productId = args[1];
        if (!productId) {
          console.error('Usage: bun run clear-product-prices.worker.ts product <product-id>');
          process.exit(1);
        }
        await ProductPricesCleaner.clearByProductId(productId);
        break;
        
      case 'older':
        const days = parseInt(args[1]);
        if (!days || days <= 0) {
          console.error('Usage: bun run clear-product-prices.worker.ts older <days>');
          process.exit(1);
        }
        await ProductPricesCleaner.clearOlderThan(days);
        break;
        
      case 'keep':
        const keepCount = parseInt(args[1]);
        if (!keepCount || keepCount <= 0) {
          console.error('Usage: bun run clear-product-prices.worker.ts keep <count>');
          process.exit(1);
        }
        await ProductPricesCleaner.keepLatestOnly(keepCount);
        break;
        
      case 'stats':
        const stats = await ProductPricesCleaner.getStats();
        console.log('\n📊 Product Prices Statistics:');
        console.log(`Total records: ${stats.totalRecords.toLocaleString()}`);
        console.log(`Unique products: ${stats.uniqueProducts.toLocaleString()}`);
        console.log(`Oldest record: ${stats.oldestRecord?.toLocaleString() || 'N/A'}`);
        console.log(`Newest record: ${stats.newestRecord?.toLocaleString() || 'N/A'}`);
        console.log('\nTop products by record count:');
        stats.recordsPerProduct.forEach((item, index) => {
          console.log(`${index + 1}. ${item.productId}: ${item.count.toLocaleString()} records`);
        });
        break;
        
      default:
        console.log(`
🧹 Product Prices Cleaner

Usage:
  bun run src/workers/clear-product-prices.worker.ts <command> [options]

Commands:
  all                    - Clear all product prices
  product <product-id>   - Clear prices for specific product
  older <days>          - Clear prices older than X days
  keep <count>          - Keep only latest X records per product
  stats                 - Show statistics

Examples:
  bun run src/workers/clear-product-prices.worker.ts all
  bun run src/workers/clear-product-prices.worker.ts product abc-123
  bun run src/workers/clear-product-prices.worker.ts older 30
  bun run src/workers/clear-product-prices.worker.ts keep 5
  bun run src/workers/clear-product-prices.worker.ts stats
        `);
        break;
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// รันเมื่อเรียกไฟล์โดยตรง
if (import.meta.main) {
  await main();
}
