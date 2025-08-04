

// Configuration from environment variables
const SYNC_INTERVAL_MINUTES = parseInt(process.env.SYNC_INTERVAL_MINUTES || '5');
const SYNC_ON_START = process.env.SYNC_ON_START !== 'false';
const CLEAR_ALL_DATA = process.env.CLEAR_ALL_DATA !== 'false';
const SYNC_TYPES = process.env.SYNC_TYPES?.split(',') || ['app-premium', 'preorder', 'game', 'mobile', 'cashcard'];

async function syncWithCleanup() {
  const startTime = Date.now();
  console.log(`[product-sync] Starting sync with cleanup at ${new Date().toLocaleString()}`);
  console.log(`[product-sync] Configuration: interval=${SYNC_INTERVAL_MINUTES}min, clearAll=${CLEAR_ALL_DATA}, types=[${SYNC_TYPES.join(', ')}]`);

  const types = SYNC_TYPES;
  let totalCleared = 0;
  let successCount = 0;
  let errorCount = 0;

  for (const type of types) {
    const typeStartTime = Date.now();

    try {
      console.log(`[product-sync] Processing type: ${type}`);

      // 1. เคลียร์ข้อมูลเก่าก่อน sync
      try {
        console.log(`[product-sync] Clearing price data for type: ${type}`);

        // เคลียร์ cache ก่อน
        const { redis } = await import('../config/redis');
        const cacheKey = `products:${type}`;
        await redis.del(cacheKey);
        console.log(`[product-sync] Cleared cache for type: ${type}`);

        // ใช้ raw SQL เพื่อลบข้อมูลเก่า
        const { db } = await import('../db');
        const { sql } = await import('drizzle-orm');

        const deleteQuery = sql`
          DELETE FROM product_prices
          WHERE product_id IN (
            SELECT id FROM products WHERE type = ${type}
          )
        `;

        const result = await db.execute(deleteQuery);
        const deletedCount = result.rowCount || 0;
        totalCleared += deletedCount;

        console.log(`[product-sync] Cleared ${deletedCount} price records for type: ${type}`);

      } catch (clearError) {
        console.error(`[product-sync] Failed to clear data for ${type}:`, clearError);
        // ไม่ throw error เพื่อให้ sync ดำเนินต่อไปได้
      }

      // 2. Sync ข้อมูลใหม่สำหรับประเภทนี้
      const { productService } = await import('../services/product.service');
      const products = await productService.list(type as any, true); // force refresh

      const duration = Date.now() - typeStartTime;
      console.log(`[product-sync] Successfully synced ${products.length} products for ${type} (${duration}ms)`);
      successCount++;

    } catch (err) {
      console.error(`[product-sync] Sync failed for ${type}:`, err);
      errorCount++;
    }
  }

  const totalDuration = Date.now() - startTime;
  console.log(`[product-sync] Sync cycle completed - Success: ${successCount}, Errors: ${errorCount}, Cleared: ${totalCleared} records, Duration: ${totalDuration}ms`);
}

let syncInterval: NodeJS.Timeout | null = null;
let isShuttingDown = false;

async function main() {
  console.log('[product-sync] Product sync worker starting...');
  console.log(`[product-sync] Configuration:`);
  console.log(`  - Sync interval: ${SYNC_INTERVAL_MINUTES} minutes`);
  console.log(`  - Sync on start: ${SYNC_ON_START}`);
  console.log(`  - Clear all data: ${CLEAR_ALL_DATA}`);
  console.log(`  - Sync types: [${SYNC_TYPES.join(', ')}]`);

  // sync ทันทีตอน start (ถ้าเปิดใช้งาน)
  if (SYNC_ON_START) {
    console.log('[product-sync] Running initial sync...');
    await syncWithCleanup();
  } else {
    console.log('[product-sync] Skipping initial sync (SYNC_ON_START=false)');
  }

  // ตั้งเวลา sync ตาม configuration
  const intervalMs = SYNC_INTERVAL_MINUTES * 60 * 1000;
  syncInterval = setInterval(async () => {
    if (!isShuttingDown) {
      await syncWithCleanup();
    }
  }, intervalMs);

  console.log(`[product-sync] Product sync worker started - syncing every ${SYNC_INTERVAL_MINUTES} minutes`);
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[product-sync] Received SIGINT, shutting down gracefully...');
  shutdown();
});

process.on('SIGTERM', () => {
  console.log('\n[product-sync] Received SIGTERM, shutting down gracefully...');
  shutdown();
});

function shutdown() {
  isShuttingDown = true;

  if (syncInterval) {
    clearInterval(syncInterval);
    console.log('[product-sync] Stopped sync interval');
  }

  console.log('[product-sync] Product sync worker stopped');
  process.exit(0);
}

main().catch((err) => {
  console.error('[product-sync] Product sync worker error:', err);
  process.exit(1);
});