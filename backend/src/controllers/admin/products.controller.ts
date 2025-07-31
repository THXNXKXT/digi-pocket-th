import { Context } from 'hono';
import { z } from 'zod';
import { db } from '../../db';
import { products } from '../../db/schemas';
import { eq } from 'drizzle-orm';
import { ok, fail } from '../../utils/response';

// Validation schema
const productUpdateSchema = z.object({ 
  name: z.string().optional(), 
  price: z.number().positive().optional() 
});

// Controllers
export async function updateProduct(c: Context) {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const parsed = productUpdateSchema.safeParse(body);
    
    if (!parsed.success) {
      const resp = fail('Invalid input', 400, parsed.error);
      return c.json(resp.body, resp.status as any);
    }

    const dataToUpdate: any = { ...parsed.data };
    if (dataToUpdate.price !== undefined) {
      dataToUpdate.price = dataToUpdate.price.toString();
    }

    await db.update(products).set(dataToUpdate).where(eq(products.id, id));
    const resp = ok('Updated', { ok: true });
    return c.json(resp.body, resp.status as any);
  } catch (error) {
    const resp = fail((error as Error).message, 400);
    return c.json(resp.body, resp.status as any);
  }
}

export async function deleteProduct(c: Context) {
  try {
    const id = c.req.param('id');
    await db.delete(products).where(eq(products.id, id));
    
    const resp = ok('Deleted', { ok: true });
    return c.json(resp.body, resp.status as any);
  } catch (error) {
    const resp = fail((error as Error).message, 400);
    return c.json(resp.body, resp.status as any);
  }
}