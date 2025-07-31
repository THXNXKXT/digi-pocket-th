// Shared constants across domains

// Product type constants (shared between order and product domains)
export const PRODUCT_TYPES = {
  APP_PREMIUM: 'app-premium',
  PREORDER: 'preorder',
  GAME: 'game',
  MOBILE: 'mobile',
  CASHCARD: 'cashcard',
} as const;

// Common pagination constants
export const PAGINATION_DEFAULTS = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// Common validation constants
export const COMMON_VALIDATION = {
  UUID_REGEX: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  EMAIL_MAX_LENGTH: 255,
  DESCRIPTION_MAX_LENGTH: 1000,
} as const;

// Common severity levels
export const SEVERITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

// Common status patterns
export const COMMON_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
} as const;

// Date/time constants
export const TIME_CONSTANTS = {
  DEFAULT_DAYS: 7,
  MAX_DAYS: 365,
  MIN_DAYS: 1,
  HOURS_IN_DAY: 24,
  MINUTES_IN_HOUR: 60,
  SECONDS_IN_MINUTE: 60,
} as const;

// Helper functions
export function isValidUUID(uuid: string): boolean {
  return COMMON_VALIDATION.UUID_REGEX.test(uuid);
}

export function isValidSeverity(severity: string): severity is keyof typeof SEVERITY_LEVELS {
  return Object.values(SEVERITY_LEVELS).includes(severity as typeof SEVERITY_LEVELS[keyof typeof SEVERITY_LEVELS]);
}

export function isValidProductType(type: string): type is keyof typeof PRODUCT_TYPES {
  return Object.values(PRODUCT_TYPES).includes(type as typeof PRODUCT_TYPES[keyof typeof PRODUCT_TYPES]);
}