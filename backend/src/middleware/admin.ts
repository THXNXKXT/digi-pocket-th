import type { Context, Next } from 'hono';
import { fail } from '../utils/response';

export async function adminMiddleware(c: Context, next: Next) {
  const user = c.get('user');
  if (!user || user.role !== 'admin') {
    const resp = fail('Forbidden', 403);
    return c.json(resp.body, resp.status as any);
  }
  await next();
} 