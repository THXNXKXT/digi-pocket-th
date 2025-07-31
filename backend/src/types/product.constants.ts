import { PRODUCT_TYPES, COMMON_STATUSES, PAGINATION_DEFAULTS, COMMON_VALIDATION } from './shared.constants';

// Re-export shared product types
export { PRODUCT_TYPES };

// Product status constants
export const PRODUCT_STATUSES = {
  ACTIVE: COMMON_STATUSES.ACTIVE,
  INACTIVE: COMMON_STATUSES.INACTIVE,
} as const;

// Product-specific validation constants
export const PRODUCT_VALIDATION = {
  NAME_MIN_LENGTH: 1,
  NAME_MAX_LENGTH: 200,
  DESCRIPTION_MAX_LENGTH: COMMON_VALIDATION.DESCRIPTION_MAX_LENGTH,
  MIN_PRICE: 0.01,
  MAX_PRICE: 999999.99,
} as const;

// Product pagination (using shared constants)
export const PRODUCT_PAGINATION = PAGINATION_DEFAULTS;

// Product pricing roles
export const PRICING_ROLES = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
} as const;

// Product type descriptions
export const PRODUCT_TYPE_DESCRIPTIONS = {
  [PRODUCT_TYPES.APP_PREMIUM]: 'Premium app subscriptions and features',
  [PRODUCT_TYPES.PREORDER]: 'Pre-order items with future delivery',
  [PRODUCT_TYPES.GAME]: 'Game items, currency, and in-game purchases',
  [PRODUCT_TYPES.MOBILE]: 'Mobile top-up and data packages',
  [PRODUCT_TYPES.CASHCARD]: 'Digital cash cards and vouchers',
} as const;

// Product requirements by type
export const PRODUCT_REQUIREMENTS = {
  [PRODUCT_TYPES.APP_PREMIUM]: [],
  [PRODUCT_TYPES.PREORDER]: [],
  [PRODUCT_TYPES.GAME]: ['uid'],
  [PRODUCT_TYPES.MOBILE]: ['number'],
  [PRODUCT_TYPES.CASHCARD]: [],
} as const;

// Product processing status
export const PRODUCT_PROCESSING_STATUS = {
  [PRODUCT_TYPES.APP_PREMIUM]: 'immediate', // Gets code immediately
  [PRODUCT_TYPES.PREORDER]: 'callback', // Waits for callback
  [PRODUCT_TYPES.GAME]: 'callback', // Waits for callback
  [PRODUCT_TYPES.MOBILE]: 'callback', // Waits for callback
  [PRODUCT_TYPES.CASHCARD]: 'callback', // Waits for callback
} as const;

// Price field mapping by user role and product type
export const PRICE_FIELD_MAP = {
  [PRICING_ROLES.ADMIN]: 'agentPrice',
  [PRICING_ROLES.CUSTOMER]: {
    [PRODUCT_TYPES.GAME]: 'recommended',
    [PRODUCT_TYPES.MOBILE]: 'recommended',
    [PRODUCT_TYPES.CASHCARD]: 'recommended',
    default: 'price',
  },
} as const;

// Product analytics constants
export const PRODUCT_ANALYTICS = {
  DEFAULT_DAYS: 30,
  MAX_DAYS: 365,
  MIN_DAYS: 1,
  POPULARITY_RANK_LIMIT: 100,
} as const;

// Product availability reasons
export const AVAILABILITY_REASONS = {
  OUT_OF_STOCK: 'out_of_stock',
  MAINTENANCE: 'maintenance',
  DISCONTINUED: 'discontinued',
  REGION_RESTRICTED: 'region_restricted',
  TEMPORARY_UNAVAILABLE: 'temporary_unavailable',
} as const;

// Error messages
export const PRODUCT_ERROR_MESSAGES = {
  NOT_FOUND: 'Product not found',
  INVALID_TYPE: 'Invalid product type',
  INVALID_STATUS: 'Invalid product status',
  INVALID_PRICE: 'Invalid price format',
  NAME_REQUIRED: 'Product name is required',
  UPSTREAM_ID_REQUIRED: 'Upstream ID is required',
  PRICE_TOO_LOW: 'Price is too low',
  PRICE_TOO_HIGH: 'Price is too high',
  DESCRIPTION_TOO_LONG: 'Description is too long',
  UNAVAILABLE: 'Product is currently unavailable',
} as const;

// Helper functions
export function getRequiredFieldsForProductType(type: string): string[] {
  const requirements = PRODUCT_REQUIREMENTS[type as keyof typeof PRODUCT_REQUIREMENTS];
  return requirements ? [...requirements] : [];
}

export function getPriceFieldForUser(userRole: string, productType: string): string {
  if (userRole === PRICING_ROLES.ADMIN) {
    return PRICE_FIELD_MAP[PRICING_ROLES.ADMIN];
  }
  
  const customerPricing = PRICE_FIELD_MAP[PRICING_ROLES.CUSTOMER];
  return customerPricing[productType as keyof typeof customerPricing] || customerPricing.default;
}

export function isProductTypeValid(type: string): type is keyof typeof PRODUCT_TYPES {
  return Object.values(PRODUCT_TYPES).includes(type as typeof PRODUCT_TYPES[keyof typeof PRODUCT_TYPES]);
}

export function isProductStatusValid(status: string): status is keyof typeof PRODUCT_STATUSES {
  return Object.values(PRODUCT_STATUSES).includes(status as typeof PRODUCT_STATUSES[keyof typeof PRODUCT_STATUSES]);
}