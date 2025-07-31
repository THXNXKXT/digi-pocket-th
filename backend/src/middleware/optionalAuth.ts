import { verify } from 'jsonwebtoken';
import { env } from '../config/env';
import type { Context, Next } from 'hono';

/**
 * Optional authentication middleware
 * Sets user context if valid token is provided, but doesn't fail if no token
 */
export async function optionalAuthMiddleware(c: Context, next: Next) {
  const bearer = c.req.header('authorization') || '';
  const token = bearer.replace(/Bearer\s+/i, '');

  if (token) {
    try {
      const payload = verify(token, env.jwtSecret) as any;
      c.set('user', payload);
    } catch {
      // Ignore invalid tokens in optional auth
      // User will be undefined, which is fine for optional endpoints
    }
  }

  await next();
}