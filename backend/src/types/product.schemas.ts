import { z } from 'zod';
import { PRODUCT_TYPES, PRODUCT_STATUSES, PRODUCT_VALIDATION, PRODUCT_PAGINATION, PRODUCT_ANALYTICS } from './product.constants';

// Product validation schemas
export const productTypeSchema = z.enum([
  PRODUCT_TYPES.APP_PREMIUM,
  PRODUCT_TYPES.PREORDER,
  PRODUCT_TYPES.GAME,
  PRODUCT_TYPES.MOBILE,
  PRODUCT_TYPES.CASHCARD,
] as const);

export const productStatusSchema = z.enum([
  PRODUCT_STATUSES.ACTIVE,
  PRODUCT_STATUSES.INACTIVE,
] as const);

export const createProductSchema = z.object({
  name: z.string()
    .min(PRODUCT_VALIDATION.NAME_MIN_LENGTH, 'Product name is required')
    .max(PRODUCT_VALIDATION.NAME_MAX_LENGTH, 'Product name too long'),
  description: z.string()
    .max(PRODUCT_VALIDATION.DESCRIPTION_MAX_LENGTH, 'Description too long')
    .optional(),
  type: productTypeSchema,
  status: productStatusSchema.optional().default(PRODUCT_STATUSES.ACTIVE),
  price: z.number()
    .min(PRODUCT_VALIDATION.MIN_PRICE, `Price must be at least ${PRODUCT_VALIDATION.MIN_PRICE}`)
    .max(PRODUCT_VALIDATION.MAX_PRICE, `Price cannot exceed ${PRODUCT_VALIDATION.MAX_PRICE}`),
  upstreamId: z.string().min(1, 'Upstream ID is required'),
});

export const updateProductSchema = z.object({
  name: z.string()
    .min(PRODUCT_VALIDATION.NAME_MIN_LENGTH, 'Product name is required')
    .max(PRODUCT_VALIDATION.NAME_MAX_LENGTH, 'Product name too long')
    .optional(),
  description: z.string()
    .max(PRODUCT_VALIDATION.DESCRIPTION_MAX_LENGTH, 'Description too long')
    .optional(),
  type: productTypeSchema.optional(),
  status: productStatusSchema.optional(),
  price: z.number()
    .min(PRODUCT_VALIDATION.MIN_PRICE, `Price must be at least ${PRODUCT_VALIDATION.MIN_PRICE}`)
    .max(PRODUCT_VALIDATION.MAX_PRICE, `Price cannot exceed ${PRODUCT_VALIDATION.MAX_PRICE}`)
    .optional(),
});

export const productFilterSchema = z.object({
  page: z.coerce.number().min(1).default(PRODUCT_PAGINATION.DEFAULT_PAGE),
  limit: z.coerce.number().min(1).max(PRODUCT_PAGINATION.MAX_LIMIT).default(PRODUCT_PAGINATION.DEFAULT_LIMIT),
  type: productTypeSchema.optional(),
  status: productStatusSchema.optional(),
  search: z.string().optional(),
});

export const productParamSchema = z.object({
  id: z.string().uuid('Invalid product ID format')
});

// Product pricing schemas
export const createProductPriceSchema = z.object({
  productId: z.string().uuid(),
  price: z.number().positive('Price must be positive'),
  recommended: z.number().positive('Recommended price must be positive').optional(),
  agentPrice: z.number().positive('Agent price must be positive').optional(),
});

export const updateProductPriceSchema = z.object({
  price: z.number().positive('Price must be positive').optional(),
  recommended: z.number().positive('Recommended price must be positive').optional(),
  agentPrice: z.number().positive('Agent price must be positive').optional(),
});

// Product analytics schemas
export const productStatsFilterSchema = z.object({
  days: z.coerce.number()
    .min(PRODUCT_ANALYTICS.MIN_DAYS)
    .max(PRODUCT_ANALYTICS.MAX_DAYS)
    .default(PRODUCT_ANALYTICS.DEFAULT_DAYS),
  type: productTypeSchema.optional(),
});

// Product availability schemas
export const updateProductAvailabilitySchema = z.object({
  isAvailable: z.boolean(),
  reason: z.string().optional(),
  estimatedRestockDate: z.coerce.date().optional(),
});

// Bulk operations schemas
export const bulkUpdateProductsSchema = z.object({
  productIds: z.array(z.string().uuid()).min(1, 'At least one product ID required'),
  updates: z.object({
    status: productStatusSchema.optional(),
    price: z.number().positive().optional(),
  }),
});

// Type exports
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductFilterInput = z.infer<typeof productFilterSchema>;
export type ProductParamInput = z.infer<typeof productParamSchema>;
export type CreateProductPriceInput = z.infer<typeof createProductPriceSchema>;
export type UpdateProductPriceInput = z.infer<typeof updateProductPriceSchema>;
export type ProductStatsFilterInput = z.infer<typeof productStatsFilterSchema>;
export type UpdateProductAvailabilityInput = z.infer<typeof updateProductAvailabilitySchema>;
export type BulkUpdateProductsInput = z.infer<typeof bulkUpdateProductsSchema>;