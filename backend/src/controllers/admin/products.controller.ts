import { Context } from 'hono';
import { z } from 'zod';
import { db } from '../../db';
import { products } from '../../db/schemas';
import { eq } from 'drizzle-orm';
import { ok, fail } from '../../utils/response';
import { productService } from '../../services/product.service';
import { asyncHandler } from '../../middleware/errorHandler';

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

/**
 * Admin: ดูสินค้าทั้งหมด รวมทั้งที่ไม่มีราคา
 * สำหรับตรวจสอบข้อมูลและ debug
 */
export const listAllProducts = asyncHandler(async (c: Context) => {
  const type = c.req.param('type') as any;

  // Validate product type
  const validTypes = ['game', 'mobile', 'cashcard', 'app-premium', 'preorder'];
  if (!validTypes.includes(type)) {
    const { body, status } = fail('Invalid product type', 400, {
      validTypes,
      received: type
    });
    return c.json(body, status as any);
  }

  // Get all products including those without prices
  const allProducts = await productService.listAll(type);

  // Add metadata for admin
  const productsWithMeta = allProducts.map(product => ({
    ...product,
    _meta: {
      hasPrice: product.price !== null,
      hasStock: product.stock !== null,
      isAvailable: product.price !== null && (product.stock === null || product.stock > 0)
    }
  }));

  const { body, status } = ok(`All ${type} products retrieved`, {
    products: productsWithMeta,
    summary: {
      total: allProducts.length,
      withPrice: allProducts.filter(p => p.price !== null).length,
      withoutPrice: allProducts.filter(p => p.price === null).length,
      available: allProducts.filter(p => p.price !== null && (p.stock === null || p.stock > 0)).length
    }
  });

  return c.json(body, status as any);
});