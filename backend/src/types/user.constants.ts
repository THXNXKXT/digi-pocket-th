// User role constants
export const USER_ROLES = {
  ADMIN: 'admin',
  CUSTOMER: 'customer',
} as const;

// User status constants
export const USER_STATUSES = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  BANNED: 'banned',
  PENDING: 'pending',
} as const;

import { SEVERITY_LEVELS, PAGINATION_DEFAULTS, COMMON_VALIDATION } from './shared.constants';

// Activity severity levels (using shared constants)
export const ACTIVITY_SEVERITY = SEVERITY_LEVELS;

// Common activity types
export const ACTIVITY_TYPES = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  PASSWORD_CHANGE: 'password_change',
  PROFILE_UPDATE: 'profile_update',
  ORDER_CREATE: 'order_create',
  WALLET_DEPOSIT: 'wallet_deposit',
  WALLET_WITHDRAW: 'wallet_withdraw',
  ADMIN_ACTION: 'admin_action',
  SECURITY_ALERT: 'security_alert',
  FAILED_LOGIN: 'failed_login',
  ACCOUNT_LOCKED: 'account_locked',
  ACCOUNT_UNLOCKED: 'account_unlocked',
} as const;

// Security alert types
export const SECURITY_ALERT_TYPES = {
  MULTIPLE_FAILED_LOGINS: 'multiple_failed_logins',
  SUSPICIOUS_ACTIVITY: 'suspicious_activity',
  UNUSUAL_LOCATION: 'unusual_location',
  ACCOUNT_COMPROMISE: 'account_compromise',
  BRUTE_FORCE_ATTEMPT: 'brute_force_attempt',
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
} as const;

// User validation constants
export const USER_VALIDATION = {
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 50,
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 128,
  EMAIL_MAX_LENGTH: COMMON_VALIDATION.EMAIL_MAX_LENGTH,
} as const;

// Default pagination (using shared constants)
export const USER_PAGINATION = PAGINATION_DEFAULTS;

// Session constants
export const SESSION_CONSTANTS = {
  DEFAULT_EXPIRY_HOURS: 24,
  REMEMBER_ME_EXPIRY_DAYS: 30,
  MAX_SESSIONS_PER_USER: 5,
} as const;