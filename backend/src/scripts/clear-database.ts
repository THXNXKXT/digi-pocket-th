#!/usr/bin/env bun
/**
 * Database Clear Script
 * ลบข้อมูลทั้งหมดในฐานข้อมูล (ไม่ลบ schema)
 */

import { db } from '../db';
import {
  users,
  userActivityLogs,
  userSessions,
  securityAlerts,
  wallets,
  walletTransactions,
  products,
  productPrices,
  orders,
  announcements,
  announcementReads,
  notifications,
  userNotificationPreferences
} from '../db/schemas';
import {
  storeBankAccounts,
  depositRequests,
  slipRecords
} from '../db/schemas/deposit';

async function clearDatabase() {
  console.log('🗑️  Starting database clear...');
  
  try {
    // ลบข้อมูลตามลำดับ foreign key dependencies
    console.log('📝 Clearing user activity logs...');
    await db.delete(userActivityLogs);
    
    console.log('🔐 Clearing user sessions...');
    await db.delete(userSessions);
    
    console.log('⚠️  Clearing security alerts...');
    await db.delete(securityAlerts);
    
    console.log('💰 Clearing wallet transactions...');
    await db.delete(walletTransactions);
    
    console.log('👛 Clearing wallets...');
    await db.delete(wallets);
    
    console.log('🛒 Clearing orders...');
    await db.delete(orders);
    
    console.log('💰 Clearing product prices...');
    await db.delete(productPrices);
    
    console.log('📦 Clearing products...');
    await db.delete(products);
    
    console.log('📢 Clearing announcement reads...');
    await db.delete(announcementReads);
    
    console.log('📢 Clearing announcements...');
    await db.delete(announcements);
    
    console.log('🔔 Clearing notifications...');
    await db.delete(notifications);
    
    console.log('⚙️  Clearing user notification preferences...');
    await db.delete(userNotificationPreferences);

    // ลบ deposit-related tables ก่อน users (เพราะมี foreign key references)
    console.log('🧾 Clearing slip records...');
    await db.delete(slipRecords);

    console.log('💳 Clearing deposit requests...');
    await db.delete(depositRequests);

    console.log('🏦 Clearing store bank accounts...');
    await db.delete(storeBankAccounts);

    console.log('👤 Clearing users...');
    await db.delete(users);
    
    console.log('✅ Database cleared successfully!');
    console.log('📊 All tables are now empty but schema remains intact.');
    
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    process.exit(1);
  }
}

// รันสคริปต์
if (import.meta.main) {
  await clearDatabase();
  process.exit(0);
}
