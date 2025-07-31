import { Context } from 'hono';
import { z } from 'zod';
import { productService } from '../services/product.service';
import { ok } from '../utils/response';

const typeSchema = z.enum(['app-premium', 'preorder', 'game', 'mobile', 'cashcard']);

export async function listProducts(c: Context) {
  const parse = typeSchema.safeParse(c.req.param('type'));
  if (!parse.success) return c.json({ message: 'Unknown type' }, 400);

  try {
    const rows = await productService.list(parse.data as any);

    const toNum = (v: any) => (v !== null ? Number(v) : null);
    function mapRow(row: any) {
      switch (row.type) {
        case 'app-premium':
          return {
            id: row.id,
            name: row.name,
            price: toNum(row.price),
            pricevip: toNum(row.priceVip),
            agent_price: toNum(row.agentPrice),
            type_app: row.extra?.type_app ?? '',
            img: row.img,
            des: row.description,
            stock: row.stock ?? 0,
          };
        case 'preorder':
          return {
            id: row.id,
            name: row.name,
            price: toNum(row.price),
            pricevip: toNum(row.priceVip),
            agent_price: toNum(row.agentPrice),
            type_app: row.extra?.type_app ?? '',
            img: row.img,
            des: row.description,
          };
        case 'game':
          return {
            id: row.id,
            name: row.name,
            category: row.category ?? null,
            recommendedPrice: row.recommendedPrice ?? null,
            price: row.price ?? null,
            discount: row.discount ?? null,
            info: row.info ?? null,
            img: row.img,
            format_id: row.format_id ?? null,
          };
        case 'mobile':
          return {
            id: row.id,
            name: row.name,
            category: row.category ?? null,
            recommendedPrice: row.recommendedPrice ?? null,
            price: row.price ?? null,
            discount: row.discount ?? null,
            info: row.info ?? null,
            img: row.img,
            format_id: row.format_id ?? null,
          };
        case 'cashcard':
          return {
            id: row.id,
            name: row.name,
            category: row.category ?? null,
            recommendedPrice: row.recommendedPrice ?? null,
            price: row.price ?? null,
            discount: row.discount ?? null,
            info: row.info ?? null,
            img: row.img,
            format_id: row.format_id ?? null,
          }
        default:
          return row;
      }
    }

    const data = rows.map(mapRow);
    const resp = ok('Success', data);
    return c.json(resp.body, resp.status as any);
  } catch (err) {

  }
} 