// Deposit request status constants
export const DEPOSIT_REQUEST_STATUSES = {
  PENDING: 'pending',
  UPLOADED: 'uploaded', 
  VERIFIED: 'verified',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired'
} as const;

// Slip record status constants
export const SLIP_RECORD_STATUSES = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected'
} as const;

// Deposit validation constants
export const DEPOSIT_VALIDATION = {
  MIN_AMOUNT: 1,
  MAX_AMOUNT: 100000,
  ACCOUNT_NUMBER_MIN_LENGTH: 10,
  ACCOUNT_NUMBER_MAX_LENGTH: 20,
  ACCOUNT_NAME_MAX_LENGTH: 200,
  BANK_NAME_MAX_LENGTH: 100,
  REJECTION_REASON_MAX_LENGTH: 1000,
  RECOVERY_TOKEN_LENGTH: 64,
} as const;

// Deposit request expiration
export const DEPOSIT_EXPIRATION = {
  DEFAULT_HOURS: 24,
  MAX_HOURS: 72,
  CLEANUP_INTERVAL_HOURS: 1,
} as const;

// Auto-approval rules - Balanced approach for real-world usage
export const AUTO_APPROVAL_RULES = {
  MIN_CONFIDENCE_SCORE: 0.80, // Realistic confidence threshold
  MAX_AUTO_APPROVE_AMOUNT: 10000, // Reasonable amount limit
  REQUIRE_ACCOUNT_MATCH: true,
  REQUIRE_AMOUNT_MATCH: true,
  ALLOW_NAME_MISMATCH: true, // Allow name mismatch due to formatting differences
  MAX_SLIP_AGE_HOURS: 24, // Slip must be recent
} as const;

// Verification scoring weights - Prioritize account and amount matching
export const VERIFICATION_WEIGHTS = {
  ACCOUNT_MATCH: 0.45,     // 45% - Most important
  AMOUNT_MATCH: 0.35,      // 35% - Very important
  NAME_MATCH: 0.05,        // 5% - Less important due to formatting issues
  SLIP2GO_CONFIDENCE: 0.10, // 10% - Reduced weight
  DUPLICATE_CHECK: 0.05,   // 5% - Same
} as const;

// Slip2Go API constants
export const SLIP2GO_CONFIG = {
  ACCOUNT_TYPE_PROMPTPAY: '01004',
  MAX_SLIP_AGE_DAYS: 7,
  TIMEOUT_MS: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 1000,
} as const;

// Bank codes mapping
export const BANK_CODES = {
  SCB: 'SCB',
  KBANK: 'KBANK', 
  BBL: 'BBL',
  KTB: 'KTB',
  TTB: 'TTB',
  BAY: 'BAY',
  GSB: 'GSB',
  CIMB: 'CIMB',
  UOB: 'UOB',
  TBANK: 'TBANK',
} as const;

// Error codes
export const DEPOSIT_ERROR_CODES = {
  SLIP2GO_ERROR: 'SLIP2GO_ERROR',
  SLIP_VERIFICATION_FAILED: 'SLIP_VERIFICATION_FAILED',
  ACCOUNT_MISMATCH: 'ACCOUNT_MISMATCH',
  AMOUNT_MISMATCH: 'AMOUNT_MISMATCH',
  DUPLICATE_SLIP: 'DUPLICATE_SLIP',
  SLIP_TOO_OLD: 'SLIP_TOO_OLD',
  DEPOSIT_EXPIRED: 'DEPOSIT_EXPIRED',
  DEPOSIT_NOT_FOUND: 'DEPOSIT_NOT_FOUND',
  STORE_ACCOUNT_NOT_FOUND: 'STORE_ACCOUNT_NOT_FOUND',
  STORE_ACCOUNT_INACTIVE: 'STORE_ACCOUNT_INACTIVE',
  INVALID_SLIP_IMAGE: 'INVALID_SLIP_IMAGE',
  RECOVERY_TOKEN_INVALID: 'RECOVERY_TOKEN_INVALID',
} as const;

// Status transitions
export const ALLOWED_DEPOSIT_TRANSITIONS = {
  [DEPOSIT_REQUEST_STATUSES.PENDING]: [
    DEPOSIT_REQUEST_STATUSES.UPLOADED,
    DEPOSIT_REQUEST_STATUSES.CANCELLED,
    DEPOSIT_REQUEST_STATUSES.EXPIRED
  ],
  [DEPOSIT_REQUEST_STATUSES.UPLOADED]: [
    DEPOSIT_REQUEST_STATUSES.VERIFIED,
    DEPOSIT_REQUEST_STATUSES.REJECTED,
    DEPOSIT_REQUEST_STATUSES.CANCELLED
  ],
  [DEPOSIT_REQUEST_STATUSES.VERIFIED]: [], // Final state
  [DEPOSIT_REQUEST_STATUSES.REJECTED]: [
    DEPOSIT_REQUEST_STATUSES.UPLOADED // Allow re-upload
  ],
  [DEPOSIT_REQUEST_STATUSES.CANCELLED]: [], // Final state
  [DEPOSIT_REQUEST_STATUSES.EXPIRED]: [], // Final state
} as const;

export const ALLOWED_SLIP_TRANSITIONS = {
  [SLIP_RECORD_STATUSES.PENDING]: [
    SLIP_RECORD_STATUSES.VERIFIED,
    SLIP_RECORD_STATUSES.REJECTED
  ],
  [SLIP_RECORD_STATUSES.VERIFIED]: [], // Final state
  [SLIP_RECORD_STATUSES.REJECTED]: [
    SLIP_RECORD_STATUSES.PENDING // Allow re-verification
  ],
} as const;

// Helper functions
export function canTransitionDepositStatus(
  currentStatus: string, 
  targetStatus: string
): boolean {
  const allowedTransitions = ALLOWED_DEPOSIT_TRANSITIONS[
    currentStatus as keyof typeof ALLOWED_DEPOSIT_TRANSITIONS
  ];
  if (!allowedTransitions) return false;
  
  return allowedTransitions.includes(
    targetStatus as typeof allowedTransitions[number]
  );
}

export function canTransitionSlipStatus(
  currentStatus: string, 
  targetStatus: string
): boolean {
  const allowedTransitions = ALLOWED_SLIP_TRANSITIONS[
    currentStatus as keyof typeof ALLOWED_SLIP_TRANSITIONS
  ];
  if (!allowedTransitions) return false;
  
  return allowedTransitions.includes(
    targetStatus as typeof allowedTransitions[number]
  );
}

// Pagination constants
export const DEPOSIT_PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;
