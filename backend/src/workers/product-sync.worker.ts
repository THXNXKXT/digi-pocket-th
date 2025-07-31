import { productSyncService } from '../services/productSync.service';

async function main() {
  // sync ทันทีตอน start
  await productSyncService.syncAll();

  // ทุก 5 นาที
  setInterval(() => {
    productSyncService.syncAll();
  }, 5 * 60 * 1000);
}

main().catch((err) => {
  console.error('Product sync worker error', err);
  process.exit(1);
}); 