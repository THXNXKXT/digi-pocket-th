import 'dotenv/config'

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT ?? 3000),
  baseUrl: process.env.BASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'change_me',
  peamsubKey: process.env.PEAMSUB_KEY || '',
  peamsubUrl: process.env.PEAMSUB_URL || 'https://api.peamsub24hr.com',
  databaseUrl: process.env.DATABASE_URL || '',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',

  // Slip2Go API Configuration
  slip2goApiUrl: process.env.SLIP2GO_API_URL || 'https://connect.slip2go.com',
  slip2goApiKey: process.env.SLIP2GO_API_KEY || '',
} as const;