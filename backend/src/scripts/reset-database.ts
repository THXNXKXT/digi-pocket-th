#!/usr/bin/env bun
/**
 * Database Reset Script
 * ลบและสร้าง schema ใหม่ทั้งหมด
 */

import { Pool } from 'pg';
import { env } from '../config/env';

async function resetDatabase() {
  console.log('🔄 Starting database reset...');

  const pool = new Pool({
    connectionString: env.databaseUrl,
  });

  try {
    // ลบ schema ทั้งหมด (DROP CASCADE)
    console.log('🗑️  Dropping all tables...');

    await pool.query('DROP SCHEMA IF EXISTS public CASCADE');
    await pool.query('CREATE SCHEMA public');
    await pool.query('GRANT ALL ON SCHEMA public TO public');

    console.log('✅ Database schema reset successfully!');
    console.log('📝 Run "bun run db:push" to recreate tables.');

  } catch (error) {
    console.error('❌ Error resetting database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// รันสคริปต์
if (import.meta.main) {
  await resetDatabase();
  process.exit(0);
}
