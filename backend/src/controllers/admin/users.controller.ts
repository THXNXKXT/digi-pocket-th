import { Context } from 'hono';
import { z } from 'zod';
import { userService } from '../../services/user.service';
import { ok, fail } from '../../utils/response';

// Validation schemas
const userStatusSchema = z.enum(['active', 'suspended', 'banned', 'pending']);

const createUserSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['admin', 'customer']).optional(),
  status: userStatusSchema.optional(),
});

const updateUserSchema = z.object({
  email: z.string().email().optional(),
  role: z.enum(['admin', 'customer']).optional(),
  status: userStatusSchema.optional(),
});

const updateUserStatusSchema = z.object({
  status: userStatusSchema
});

// Controllers
export async function listUsers(c: Context) {
  try {
    const users = await userService.list();
    const resp = ok('Success', users);
    return c.json(resp.body, resp.status as any);
  } catch (error) {
    const resp = fail((error as Error).message, 500);
    return c.json(resp.body, resp.status as any);
  }
}

export async function createUser(c: Context) {
  try {
    const body = await c.req.json();
    const parsed = createUserSchema.safeParse(body);
    
    if (!parsed.success) {
      const resp = fail('Invalid input', 400, parsed.error);
      return c.json(resp.body, resp.status as any);
    }

    const user = await userService.create(parsed.data);
    const resp = ok('Created', user);
    return c.json(resp.body, resp.status as any);
  } catch (error) {
    const resp = fail((error as Error).message, 400);
    return c.json(resp.body, resp.status as any);
  }
}

export async function getUser(c: Context) {
  try {
    const id = c.req.param('id');
    const user = await userService.detail(id);
    
    if (!user) {
      const resp = fail('Not Found', 404);
      return c.json(resp.body, resp.status as any);
    }

    const resp = ok('Success', user);
    return c.json(resp.body, resp.status as any);
  } catch (error) {
    const resp = fail((error as Error).message, 500);
    return c.json(resp.body, resp.status as any);
  }
}

export async function updateUser(c: Context) {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const parsed = updateUserSchema.safeParse(body);
    
    if (!parsed.success) {
      const resp = fail('Invalid input', 400, parsed.error);
      return c.json(resp.body, resp.status as any);
    }

    const [user] = await userService.update(id, parsed.data);
    const resp = ok('Updated', user);
    return c.json(resp.body, resp.status as any);
  } catch (error) {
    const resp = fail((error as Error).message, 400);
    return c.json(resp.body, resp.status as any);
  }
}

export async function updateUserStatus(c: Context) {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const parsed = updateUserStatusSchema.safeParse(body);
    
    if (!parsed.success) {
      const resp = fail('Invalid input', 400, parsed.error);
      return c.json(resp.body, resp.status as any);
    }

    const [user] = await userService.updateStatus(id, parsed.data.status);
    const resp = ok('Updated', user);
    return c.json(resp.body, resp.status as any);
  } catch (error) {
    const resp = fail((error as Error).message, 400);
    return c.json(resp.body, resp.status as any);
  }
}

export async function deleteUser(c: Context) {
  try {
    const id = c.req.param('id');
    await userService.delete(id);
    
    const resp = ok('Deleted', { ok: true });
    return c.json(resp.body, resp.status as any);
  } catch (error) {
    const resp = fail((error as Error).message, 400);
    return c.json(resp.body, resp.status as any);
  }
}