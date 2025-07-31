import { callPeamsub } from './upstream';
import { redis } from '../config/redis';
import { db } from '../db';
import { products, productPrices } from '../db/schemas';
import { eq, sql } from 'drizzle-orm';

type UpstreamItem = Record<string, any>;

/* -------------------------------------------------------------------------- */
/*                               CONFIG / MAPS                               */
/* -------------------------------------------------------------------------- */

const CACHE_TTL_SECONDS = 3;

const pathMap = {
  'app-premium': '/v2/app-premium',
  preorder: '/v2/preorder',
  game: '/v2/game',
  mobile: '/v2/mobile',
  cashcard: '/v2/cashcard',
} as const;

type ProductType = keyof typeof pathMap;

/* -------------------------------------------------------------------------- */
/*                               UTIL FUNCTIONS                               */
/* -------------------------------------------------------------------------- */

function buildCacheKey(type: ProductType) {
  return `products:list:${type}`;
}

function mapMeta(item: UpstreamItem, type: ProductType) {
  return {
    upstreamId: String(
      item.id ||
      item.productId ||
      item.appId ||
      item.app_id ||
      item.product_id ||
      ''
    ),
    type,
    category: String(item.category ?? ''),
    name: String(item.name ?? item.title ?? item.appName ?? ''),
    img: String(item.img ?? item.icon ?? ''),
    description: String(item.des ?? item.description ?? item.detail ?? ''),
    info: item.info ? String(item.info) : undefined,
    formatId: String(item.format_id ?? ''),
    extra: item.type_app ? { type_app: item.type_app } : undefined,
  } as const;
}

function mapPrice(item: UpstreamItem, productId: string, type: ProductType) {
  // กรณี app-premium หากไม่มี stock ให้ข้ามไม่บันทึก
  if (type === 'app-premium' && (item.stock === null || item.stock === undefined)) return null;

  const priceVipVal = item.pricevip ?? item.priceVip ?? item.price_vip ?? null;
  const recommendedVal = item.recommendedPrice ?? item.recommended_price ?? null;
  const agentPriceVal = item.agent_price ?? item.agentPrice ?? null;

  const base = {
    productId,
    price: String(item.price ?? item.currentPrice ?? 0),
    priceVip: priceVipVal !== null ? String(priceVipVal) : null,
    agentPrice: agentPriceVal !== null ? String(agentPriceVal) : null,
    discount: String(item.discount ?? 0),
    stock: item.stock !== undefined && item.stock !== null ? Number(item.stock) : null,
  } as any;

  if (type !== 'app-premium') {
    base.recommended = recommendedVal !== null ? String(recommendedVal) : null;
  }

  return base;
}

async function queryProducts(type: ProductType) {
  if (type === 'app-premium') {
    const res = await db.execute(sql`
      SELECT p.*, pr.price, pr.price_vip AS "priceVip", pr.agent_price AS "agentPrice", pr.discount, pr.stock
      FROM products p
      /* แถวล่าสุดที่ stock > 0 (ใช้ทั้งราคาและ stock จากแถวเดียวกัน) */
      LEFT JOIN LATERAL (
        SELECT price, price_vip, agent_price, discount, stock
        FROM product_prices
        WHERE product_id = p.id AND stock IS NOT NULL AND stock >= 0
        ORDER BY fetched_at DESC, id DESC
        LIMIT 1
      ) pr ON true
      WHERE p.type = ${type}
      ORDER BY p.upstream_id::numeric ASC;
    `);
    return (res as any).rows ?? res;
  }

  if (type === 'game') {
    return queryGame();
  }

  if (type === 'mobile') {
    return queryMobile();
  }

  if (type === 'cashcard') {
    return queryCashcard();
  }

  // default types
  const res = await db.execute(sql`
    SELECT p.*, pr.price, pr.price_vip AS "priceVip", pr.agent_price AS "agentPrice", pr.discount, pr.stock
    FROM products p
    LEFT JOIN LATERAL (
      SELECT *
      FROM product_prices pr2
      WHERE pr2.product_id = p.id
      ORDER BY pr2.fetched_at DESC, pr2.id DESC
      LIMIT 1
    ) pr ON true
    WHERE p.type = ${type}
    ORDER BY p.upstream_id::numeric ASC;
  `);
  return (res as any).rows ?? res;
}

/* -------------------------------------------------------------------------- */
/*                                GAME QUERY                                  */
/* -------------------------------------------------------------------------- */

function queryGame() {
  return db
    .execute(sql`
      SELECT p.id,
             p.name,
             p.category,
             pr.recommended   AS "recommendedPrice",
             pr.price,
             pr.discount,
             p.info,
             p.img,
             p.format_id
      FROM   products p
      JOIN LATERAL (
        SELECT recommended, price, discount
        FROM   product_prices
        WHERE  product_id = p.id
        ORDER  BY fetched_at DESC, id DESC
        LIMIT 1
      ) pr ON true
      WHERE  p.type = 'game'
      ORDER  BY p.upstream_id::numeric;
    `)
    .then((r) => (r as any).rows);
}

/* --------------------------- MOBILE QUERY --------------------------- */
function queryMobile() {
  return db
    .execute(sql`
      SELECT p.id,
             p.name,
             p.category,
             pr.recommended   AS "recommendedPrice",
             pr.price,
             pr.discount,
             p.info,
             p.img,
             p.format_id
      FROM   products p
      JOIN LATERAL (
        SELECT recommended, price, discount
        FROM   product_prices
        WHERE  product_id = p.id
        ORDER  BY fetched_at DESC, id DESC
        LIMIT 1
      ) pr ON true
      WHERE  p.type = 'mobile'
      ORDER  BY p.upstream_id::numeric;
    `)
    .then((r) => (r as any).rows);
}

/* --------------------------- CASHCARD QUERY --------------------------- */
function queryCashcard() {
  return db
    .execute(sql`
      SELECT p.id,
             p.name,
             p.category,
             pr.recommended   AS "recommendedPrice",
             pr.price,
             pr.discount,
             p.info,
             p.img,
             p.format_id
      FROM   products p
      JOIN LATERAL (
        SELECT recommended, price, discount
        FROM   product_prices
        WHERE  product_id = p.id
        ORDER  BY fetched_at DESC, id DESC
        LIMIT 1
      ) pr ON true
      WHERE  p.type = 'cashcard'
      ORDER  BY p.upstream_id::numeric;
    `)
    .then((r) => (r as any).rows);
}

/* -------------------------------------------------------------------------- */
/*                                  SERVICE                                   */
/* -------------------------------------------------------------------------- */

export const productService = {
  async list(type: ProductType, refresh = false) {
    /* ---------------------------- 1. check cache --------------------------- */
    const cacheKey = buildCacheKey(type);
    if (!refresh) {
      const cached = await redis.get(cacheKey);
      if (cached) return JSON.parse(cached);
    } else {
      await redis.del(cacheKey);
    }

    /* ------------------------------ 2. query ------------------------------ */
    const rows = await queryProducts(type);
    if (rows.length && !refresh) {
      await redis.set(cacheKey, JSON.stringify(rows), 'EX', CACHE_TTL_SECONDS);
      return rows;
    }

    /* ---------------------------- 3. upstream ----------------------------- */
    // ดึงเสมอหาก refresh=true หรือตารางยังว่าง
    const items: UpstreamItem[] = await callPeamsub(pathMap[type]);
    if (!items?.length) return [];

    /* --------------------------- 4. upsert DB ----------------------------- */
    await db.transaction(async (tx) => {
      for (const raw of items) {
        const meta = mapMeta(raw, type);

        await tx
          .insert(products)
          .values(meta)
          .onConflictDoUpdate({
            target: [products.upstreamId, products.type],
            set: {
              name: sql`excluded.name`,
              img: sql`excluded.img`,
              description: sql`excluded.description`,
              category: sql`excluded.category`,
              formatId: sql`excluded.format_id`,
              extra: sql`excluded.extra`,
              updatedAt: sql`now()`,
            },
          });

        const [{ id }] = await tx
          .select({ id: products.id })
          .from(products)
          .where(eq(products.upstreamId, meta.upstreamId));

        const price = mapPrice(raw, id, type);
        if (price) {
          await tx.insert(productPrices).values(price);
        }
      }
    });

    /* ----------------------- 5. query + cache again ----------------------- */
    const refreshed = await queryProducts(type);
    await redis.set(cacheKey, JSON.stringify(refreshed), 'EX', CACHE_TTL_SECONDS);
    return refreshed;
  },
}; 