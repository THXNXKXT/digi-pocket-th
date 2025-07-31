/// <reference types="node" />
import 'dotenv/config'

// drizzle-kit config (รันใน NodeJS)

// ใช้ DATABASE_URL จาก env หากมี (สำหรับเครื่องโฮสต์)
const databaseUrl =
  process.env.DATABASE_URL ??
  'postgres://digiuser:qniCrDWiPa@db:5434/digipocket'

export default {
  dialect: 'postgresql',
  // ชี้ไปยัง schema ภายใต้ backend/src/db ทั้งหมด
  schema: './src/db/**/*.ts',
  // เก็บไฟล์ migration ไว้ใน backend/migrations
  out: './migrations',
  dbCredentials: {
    url: databaseUrl,
  },
} as const;