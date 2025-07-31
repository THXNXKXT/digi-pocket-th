import { z } from 'zod';
import { ORDER_STATUSES, ORDER_PROCESSING, ORDER_VALIDATION, ORDER_PAGINATION, ORDER_STATS } from './order.constants';

// Order validation schemas
export const orderStatusSchema = z.enum([
  ORDER_STATUSES.PENDING,
  ORDER_STATUSES.SUCCESS,
  ORDER_STATUSES.FAILED,
  ORDER_STATUSES.REFUNDED,
] as const);

export const createOrderSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z.number().int()
    .min(ORDER_PROCESSING.MIN_QUANTITY, `Quantity must be at least ${ORDER_PROCESSING.MIN_QUANTITY}`)
    .max(ORDER_PROCESSING.MAX_QUANTITY, `Quantity cannot exceed ${ORDER_PROCESSING.MAX_QUANTITY}`),
  unitPrice: z.number().positive('Unit price must be positive'),
  uid: z.string()
    .min(ORDER_VALIDATION.UID_MIN_LENGTH)
    .max(ORDER_VALIDATION.UID_MAX_LENGTH)
    .optional(), // For game products
  number: z.string()
    .regex(new RegExp(`^[0-9]{${ORDER_VALIDATION.MOBILE_NUMBER_MIN},${ORDER_VALIDATION.MOBILE_NUMBER_MAX}}$`), 'Invalid phone number format')
    .optional(), // For mobile products
});

export const updateOrderStatusSchema = z.object({
  status: orderStatusSchema,
  reason: z.string().optional(),
});

export const orderCallbackSchema = z.object({
  status: z.enum(['success', 'failed']),
  code: z.string().optional(),
});

export const orderFilterSchema = z.object({
  page: z.coerce.number().min(1).default(ORDER_PAGINATION.DEFAULT_PAGE),
  limit: z.coerce.number().min(1).max(ORDER_PAGINATION.MAX_LIMIT).default(ORDER_PAGINATION.DEFAULT_LIMIT),
  status: orderStatusSchema.optional(),
});

export const adminOrderFilterSchema = z.object({
  page: z.coerce.number().min(1).default(ORDER_PAGINATION.DEFAULT_PAGE),
  limit: z.coerce.number().min(1).max(ORDER_PAGINATION.MAX_LIMIT).default(ORDER_PAGINATION.DEFAULT_LIMIT),
  status: orderStatusSchema.optional(),
  userId: z.string().uuid().optional(),
  productId: z.string().uuid().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  search: z.string().optional(),
});

export const orderStatsFilterSchema = z.object({
  days: z.coerce.number().min(ORDER_STATS.MIN_DAYS).max(ORDER_STATS.MAX_DAYS).default(ORDER_STATS.DEFAULT_DAYS),
});

export const orderParamSchema = z.object({
  id: z.string().uuid('Invalid order ID format')
});

// Game order specific validation
export const gameOrderSchema = z.object({
  uid: z.string()
    .min(ORDER_VALIDATION.UID_MIN_LENGTH, 'UID is required for game products')
    .max(ORDER_VALIDATION.UID_MAX_LENGTH, 'UID too long'),
});

// Mobile order specific validation
export const mobileOrderSchema = z.object({
  number: z.string()
    .regex(new RegExp(`^[0-9]{${ORDER_VALIDATION.MOBILE_NUMBER_MIN},${ORDER_VALIDATION.MOBILE_NUMBER_MAX}}$`), 
           `Phone number must be ${ORDER_VALIDATION.MOBILE_NUMBER_MIN}-${ORDER_VALIDATION.MOBILE_NUMBER_MAX} digits`),
});

// Preorder callback validation
export const preorderCallbackSchema = z.object({
  reference: z.string().uuid(),
  status: z.enum(['success', 'failed']),
  prize: z.string().optional(),
});

// Type exports
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type OrderCallbackInput = z.infer<typeof orderCallbackSchema>;
export type OrderFilterInput = z.infer<typeof orderFilterSchema>;
export type AdminOrderFilterInput = z.infer<typeof adminOrderFilterSchema>;
export type OrderStatsFilterInput = z.infer<typeof orderStatsFilterSchema>;
export type OrderParamInput = z.infer<typeof orderParamSchema>;
export type GameOrderInput = z.infer<typeof gameOrderSchema>;
export type MobileOrderInput = z.infer<typeof mobileOrderSchema>;
export type PreorderCallbackInput = z.infer<typeof preorderCallbackSchema>;