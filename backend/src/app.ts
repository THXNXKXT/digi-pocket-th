import { Hono } from 'hono';
import pino from 'pino';
import { secureHeaders } from 'hono/secure-headers';
// @ts-ignore - package has no typings
import { rateLimiter } from 'hono-rate-limiter';
import { cors } from 'hono/cors';
import { bodyLimit } from 'hono/body-limit';
import { requestId } from 'hono/request-id';
import type { Context } from 'hono';
import { env } from './config/env';
import { productRoute } from './routes/product.route';
import { authRoute } from './routes/auth.route';
import { walletRoute } from './routes/wallet.route';
import { orderRoute } from './routes/order.route';
import { adminRoute } from './routes/admin.route';
import { profileRoutes } from './routes/profile.routes';
import { depositRoutes } from './routes/deposit.routes';

import { announcementRoute } from './routes/announcement.route';
import userTrackingRoutes from './routes/user-tracking.routes';
import { swaggerUI } from '@hono/swagger-ui';
import { openApiDoc } from './docs/openapi';
import { fail, ok } from './utils/response';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';


const app = new Hono();

// Apply security headers
app.use('*', secureHeaders());

// Generate unique X-Request-ID header
app.use(requestId());

// CORS allow specific origin (default *)
app.use('*', cors({ origin: '*', credentials: false }));

// Global body size limit 1 MB
app.use('*', bodyLimit({ maxSize: 1024 * 1024, onError: (c) => c.text('Payload too large', 413) }));

// Rate limiting (100 req/min per IP)
app.use(
  '*',
  rateLimiter({
    windowMs: 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-6',
    keyGenerator: (c: Context) =>
      c.req.header('x-real-ip') || c.req.header('x-forwarded-for') || (c.req.raw as any)?.remoteAddress || 'unknown',
  })
);

// Pino logger (pretty in dev)
const pinoLogger = pino({
  transport: {
    target: 'pino-pretty',
    options: { colorize: true, translateTime: 'HH:MM:ss.l' },
  },
});

// Log unhandled errors
app.onError((err, c) => {
  pinoLogger.error({
    err: err.message,
    stack: err.stack,
    path: c.req.url,
    method: c.req.method,
    reqId: c.req.header('x-request-id') || '-',
  }, 'Unhandled error');
  const resp = fail('Internal Server Error', 500);
  return c.json(resp.body, resp.status as any);
});

// 404 handler
app.notFound((c) => {
  pinoLogger.warn({ path: c.req.url, method: c.req.method }, 'Route not found');
  const respNF = fail('Not Found', 404);
  return c.json(respNF.body, respNF.status as any);
});

app.use('*', async (c, next) => {
  const start = Date.now();
  await next();
  const duration = Date.now() - start;
  pinoLogger.info({
    method: c.req.method,
    path: c.req.url,
    status: c.res.status,
    durationMs: duration,
  });
});

app.get('/', (c) => c.text('API is running'));

// OpenAPI JSON
app.get('/doc', (c) => c.json(openApiDoc));

// Swagger UI
app.get('/swagger', swaggerUI({ url: '/doc' }));

app.route('/products', productRoute);
app.route('/auth', authRoute);
app.route('/wallet', walletRoute);
app.route('/orders', orderRoute);
app.route('/profile', profileRoutes);
app.route('/wallet/deposit', depositRoutes);

app.route('/admin', adminRoute);
app.route('/announcements', announcementRoute);
app.route('/user/tracking', userTrackingRoutes);

// Error handlers
app.onError(errorHandler);
app.notFound(notFoundHandler);

export default {
  port: env.port,
  fetch: app.fetch,
};

console.log(`🚀 Digi-Pocket API running on http://localhost:${env.port}`);
console.log(`📄 Swagger UI: http://localhost:${env.port}/swagger`);
console.log(`📄 OpenAPI JSON: http://localhost:${env.port}/doc`);