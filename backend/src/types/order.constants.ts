import { PRODUCT_TYPES, COMMON_STATUSES } from './shared.constants';

// Order status constants
export const ORDER_STATUSES = {
  PENDING: COMMON_STATUSES.PENDING,
  SUCCESS: COMMON_STATUSES.SUCCESS,
  FAILED: COMMON_STATUSES.FAILED,
  REFUNDED: 'refunded',
} as const;

// Re-export shared product types for convenience
export { PRODUCT_TYPES };

// Order processing constants
export const ORDER_PROCESSING = {
  MAX_QUANTITY: 100,
  MIN_QUANTITY: 1,
  PRICE_TOLERANCE: 0.01, // Allow 1 cent difference
  REFERENCE_LENGTH: 36, // UUID length
} as const;

// Order-specific validation (different from product validation)
export const ORDER_VALIDATION = {
  MOBILE_NUMBER_MIN: 9,
  MOBILE_NUMBER_MAX: 10,
  UID_MIN_LENGTH: 1,
  UID_MAX_LENGTH: 50,
  QUANTITY_MIN: 1,
  QUANTITY_MAX: 100,
} as const;

// Order status transitions
export const ALLOWED_ORDER_TRANSITIONS = {
  [ORDER_STATUSES.PENDING]: [ORDER_STATUSES.SUCCESS, ORDER_STATUSES.FAILED],
  [ORDER_STATUSES.SUCCESS]: [ORDER_STATUSES.REFUNDED],
  [ORDER_STATUSES.FAILED]: [ORDER_STATUSES.PENDING], // Allow retry
  [ORDER_STATUSES.REFUNDED]: [], // Final state
} as const;

// Callback status mapping
export const CALLBACK_STATUS_MAP = {
  success: ORDER_STATUSES.SUCCESS,
  failed: ORDER_STATUSES.FAILED,
} as const;

// Order pagination (using shared constants)
export const ORDER_PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// Statistics constants
export const ORDER_STATS = {
  DEFAULT_DAYS: 7,
  MAX_DAYS: 365,
  MIN_DAYS: 1,
  TOP_PRODUCTS_LIMIT: 10,
} as const;

// Upstream API endpoints
export const UPSTREAM_ENDPOINTS = {
  APP_PREMIUM: '/v2/app-premium',
  PREORDER: '/v2/preorder',
  GAME: '/v2/game',
  MOBILE: '/v2/mobile',
  CASHCARD: '/v2/cashcard',
  DEFAULT: '/v2/order',
} as const;

// Error messages
export const ORDER_ERROR_MESSAGES = {
  PRODUCT_NOT_FOUND: 'Product not found',
  INVALID_QUANTITY: 'Invalid quantity',
  INVALID_PRICE: 'Invalid unit price',
  UID_REQUIRED: 'UID is required for game products',
  PHONE_REQUIRED: 'Phone number is required for mobile products',
  INSUFFICIENT_BALANCE: 'Insufficient wallet balance',
  ORDER_NOT_FOUND: 'Order not found',
  CANNOT_CANCEL: 'Only pending orders can be cancelled',
  PROCESSING_FAILED: 'Order processing failed',
} as const;

// Helper function to check if status transition is allowed
export function canTransitionOrderStatus(
  currentStatus: string,
  targetStatus: string
): boolean {
  const allowedTransitions = ALLOWED_ORDER_TRANSITIONS[currentStatus as keyof typeof ALLOWED_ORDER_TRANSITIONS];
  if (!allowedTransitions) return false;

  // Convert readonly array to regular array for includes check
  return (allowedTransitions as readonly string[]).includes(targetStatus);
}