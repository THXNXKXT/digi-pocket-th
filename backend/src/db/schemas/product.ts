import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  numeric,
  pgEnum,
  text,
  integer,
  jsonb,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// Product enums
export const productTypeEnum = pgEnum("product_type", [
  "app-premium",
  "preorder",
  "game",
  "mobile",
  "cashcard",
]);

// Products table
export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    upstreamId: varchar("upstream_id", { length: 50 }).notNull(),
    type: productTypeEnum("type").notNull(),
    category: varchar("category", { length: 50 }),
    name: varchar("name", { length: 120 }).notNull(),
    img: text("img"),
    description: text("description"),
    info: text("info"),
    formatId: text("format_id"),
    extra: jsonb("extra"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (products) => {
    return {
      upstreamTypeIdx: uniqueIndex("products_upstream_type_idx").on(
        products.upstreamId,
        products.type
      ),
    };
  }
);

// Product prices table
export const productPrices = pgTable("product_prices", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  recommended: numeric("recommended", { precision: 12, scale: 2 }),
  price: numeric("price", { precision: 12, scale: 2 }),
  priceVip: numeric("price_vip", { precision: 12, scale: 2 }),
  agentPrice: numeric("agent_price", { precision: 12, scale: 2 }),
  discount: numeric("discount", { precision: 12, scale: 2 }),
  stock: integer("stock"),
  fetchedAt: timestamp("fetched_at", { withTimezone: true }).defaultNow(),
});

// Export types
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export type ProductPrice = typeof productPrices.$inferSelect;
export type NewProductPrice = typeof productPrices.$inferInsert;