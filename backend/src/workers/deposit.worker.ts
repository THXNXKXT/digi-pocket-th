import { db } from '../db';
import { depositRequests } from '../db/schemas/deposit';
import { eq, lt, inArray, and } from 'drizzle-orm';
import { DEPOSIT_REQUEST_STATUSES } from '../types/deposit.constants';

console.log('🔄 Deposit worker started');

// Cleanup expired deposit requests every hour
async function cleanupExpiredRequests() {
  try {
    console.log('🧹 Cleaning up expired deposit requests...');
    
    // Update expired requests
    const result = await db
      .update(depositRequests)
      .set({ 
        status: DEPOSIT_REQUEST_STATUSES.EXPIRED,
        updatedAt: new Date()
      })
      .where(
        and(
          inArray(depositRequests.status, [
            DEPOSIT_REQUEST_STATUSES.PENDING,
            DEPOSIT_REQUEST_STATUSES.UPLOADED
          ]),
          lt(depositRequests.expiresAt, new Date())
        )
      )
      .returning({ id: depositRequests.id });

    const expiredCount = result.length;
    
    if (expiredCount > 0) {
      console.log(`✅ Cleaned up ${expiredCount} expired deposit requests`);
    } else {
      console.log('✅ No expired deposit requests to clean up');
    }
    
    return expiredCount;
  } catch (error) {
    console.error('❌ Error cleaning up expired deposits:', error);
    return 0;
  }
}

// Run cleanup every hour
setInterval(cleanupExpiredRequests, 60 * 60 * 1000);

// Run initial cleanup after 30 seconds
setTimeout(cleanupExpiredRequests, 30 * 1000);

// Heartbeat every 5 minutes
setInterval(() => {
  console.log('💓 Deposit worker heartbeat - ' + new Date().toISOString());
}, 5 * 60 * 1000);

// Graceful shutdown handlers
process.on('SIGINT', () => {
  console.log('🛑 Deposit worker shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🛑 Deposit worker shutting down gracefully...');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception in deposit worker:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection in deposit worker:', reason);
  process.exit(1);
});

console.log('✅ Deposit worker initialized successfully');
