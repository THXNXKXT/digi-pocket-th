import { productService } from './product.service';

export const productSyncService = {
  async syncAll() {
    const types = ['app-premium', 'preorder', 'game', 'mobile', 'cashcard'] as const;
    for (const t of types) {
      try {
        await productService.list(t, true);
        console.log(`Synced products for ${t}`);
      } catch (err) {
        console.error('Sync failed for', t, err);
      }
    }
  },
}; 