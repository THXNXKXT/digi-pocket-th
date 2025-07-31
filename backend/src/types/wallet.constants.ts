// Transaction type constants
export const TRANSACTION_TYPES = {
  DEPOSIT: 'deposit',
  WITHDRAW: 'withdraw',
  REFUND: 'refund',
  BONUS: 'bonus',
  PENALTY: 'penalty',
} as const;

// Transaction status constants
export const TRANSACTION_STATUSES = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const;

// Deposit status constants
export const DEPOSIT_STATUSES = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
} as const;

// Wallet validation constants
export const WALLET_VALIDATION = {
  MIN_AMOUNT: 1,
  MAX_AMOUNT: 1000000,
  MIN_DEPOSIT: 1,
  MAX_DEPOSIT: 100000,
  MIN_WITHDRAW: 1,
  MAX_WITHDRAW: 50000,
  MIN_TRANSFER: 1,
  MAX_TRANSFER: 10000,
  DESCRIPTION_MAX_LENGTH: 500,
  REASON_MAX_LENGTH: 500,
} as const;

import { PAGINATION_DEFAULTS, TIME_CONSTANTS } from './shared.constants';

// Wallet pagination (using shared constants)
export const WALLET_PAGINATION = PAGINATION_DEFAULTS;

// Payment methods
export const PAYMENT_METHODS = {
  BANK_TRANSFER: 'bank_transfer',
  CREDIT_CARD: 'credit_card',
  DEBIT_CARD: 'debit_card',
  E_WALLET: 'e_wallet',
  QR_CODE: 'qr_code',
  CRYPTO: 'crypto',
} as const;

// Transaction descriptions
export const TRANSACTION_DESCRIPTIONS = {
  [TRANSACTION_TYPES.DEPOSIT]: 'Wallet deposit',
  [TRANSACTION_TYPES.WITHDRAW]: 'Wallet withdrawal',
  [TRANSACTION_TYPES.REFUND]: 'Order refund',
  [TRANSACTION_TYPES.BONUS]: 'Bonus credit',
  [TRANSACTION_TYPES.PENALTY]: 'Penalty deduction',
} as const;

// Wallet statistics constants (using shared time constants)
export const WALLET_STATS = {
  DEFAULT_DAYS: 30,
  MAX_DAYS: TIME_CONSTANTS.MAX_DAYS,
  MIN_DAYS: TIME_CONSTANTS.MIN_DAYS,
} as const;

// Bulk operation limits
export const BULK_OPERATION_LIMITS = {
  MAX_USERS: 100,
  MIN_USERS: 1,
  MAX_AMOUNT: 10000,
  MIN_AMOUNT: 0.01,
} as const;

// Transaction status transitions
export const ALLOWED_TRANSACTION_TRANSITIONS = {
  [TRANSACTION_STATUSES.PENDING]: [TRANSACTION_STATUSES.COMPLETED, TRANSACTION_STATUSES.FAILED, TRANSACTION_STATUSES.CANCELLED],
  [TRANSACTION_STATUSES.COMPLETED]: [], // Final state
  [TRANSACTION_STATUSES.FAILED]: [TRANSACTION_STATUSES.PENDING], // Allow retry
  [TRANSACTION_STATUSES.CANCELLED]: [], // Final state
} as const;

// Deposit status transitions
export const ALLOWED_DEPOSIT_TRANSITIONS = {
  [DEPOSIT_STATUSES.PENDING]: [DEPOSIT_STATUSES.SUCCESS, DEPOSIT_STATUSES.FAILED],
  [DEPOSIT_STATUSES.SUCCESS]: [], // Final state
  [DEPOSIT_STATUSES.FAILED]: [DEPOSIT_STATUSES.PENDING], // Allow retry
} as const;

// Error messages
export const WALLET_ERROR_MESSAGES = {
  INSUFFICIENT_BALANCE: 'Insufficient wallet balance',
  INVALID_AMOUNT: 'Invalid amount',
  AMOUNT_TOO_LOW: 'Amount is too low',
  AMOUNT_TOO_HIGH: 'Amount is too high',
  WALLET_NOT_FOUND: 'Wallet not found',
  TRANSACTION_NOT_FOUND: 'Transaction not found',
  DEPOSIT_NOT_FOUND: 'Deposit not found',
  INVALID_PAYMENT_METHOD: 'Invalid payment method',
  TRANSACTION_FAILED: 'Transaction failed',
  DEPOSIT_FAILED: 'Deposit failed',
  WITHDRAWAL_FAILED: 'Withdrawal failed',
  TRANSFER_FAILED: 'Transfer failed',
  INVALID_USER: 'Invalid user',
  SELF_TRANSFER: 'Cannot transfer to yourself',
  ACCOUNT_LOCKED: 'Account is locked',
  DAILY_LIMIT_EXCEEDED: 'Daily limit exceeded',
  MONTHLY_LIMIT_EXCEEDED: 'Monthly limit exceeded',
} as const;

// Helper functions
export function canTransitionTransactionStatus(currentStatus: string, targetStatus: string): boolean {
  const allowedTransitions = ALLOWED_TRANSACTION_TRANSITIONS[currentStatus as keyof typeof ALLOWED_TRANSACTION_TRANSITIONS];
  if (!allowedTransitions) return false;
  
  return allowedTransitions.includes(targetStatus as typeof allowedTransitions[number]);
}

export function canTransitionDepositStatus(currentStatus: string, targetStatus: string): boolean {
  const allowedTransitions = ALLOWED_DEPOSIT_TRANSITIONS[currentStatus as keyof typeof ALLOWED_DEPOSIT_TRANSITIONS];
  if (!allowedTransitions) return false;
  
  return allowedTransitions.includes(targetStatus as typeof allowedTransitions[number]);
}

export function isValidTransactionType(type: string): type is keyof typeof TRANSACTION_TYPES {
  return Object.values(TRANSACTION_TYPES).includes(type as typeof TRANSACTION_TYPES[keyof typeof TRANSACTION_TYPES]);
}

export function isValidPaymentMethod(method: string): method is keyof typeof PAYMENT_METHODS {
  return Object.values(PAYMENT_METHODS).includes(method as typeof PAYMENT_METHODS[keyof typeof PAYMENT_METHODS]);
}

export function getTransactionDescription(type: string, customDescription?: string): string {
  if (customDescription) {
    return customDescription;
  }
  return TRANSACTION_DESCRIPTIONS[type as keyof typeof TRANSACTION_DESCRIPTIONS] || 'Transaction';
}

// Balance calculation helpers
export function calculateNewBalance(currentBalance: number, amount: number, type: string): number {
  switch (type) {
    case TRANSACTION_TYPES.DEPOSIT:
    case TRANSACTION_TYPES.REFUND:
    case TRANSACTION_TYPES.BONUS:
      return currentBalance + amount;
    case TRANSACTION_TYPES.WITHDRAW:
    case TRANSACTION_TYPES.PENALTY:
      return currentBalance - amount;
    default:
      return currentBalance;
  }
}

export function isDebitTransaction(type: string): boolean {
  const debitTypes = [TRANSACTION_TYPES.WITHDRAW, TRANSACTION_TYPES.PENALTY] as const;
  return debitTypes.includes(type as typeof debitTypes[number]);
}

export function isCreditTransaction(type: string): boolean {
  const creditTypes = [TRANSACTION_TYPES.DEPOSIT, TRANSACTION_TYPES.REFUND, TRANSACTION_TYPES.BONUS] as const;
  return creditTypes.includes(type as typeof creditTypes[number]);
}