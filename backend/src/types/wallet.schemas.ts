import { z } from 'zod';
import { 
  TRANSACTION_TYPES, 
  TRANSACTION_STATUSES, 
  DEPOSIT_STATUSES, 
  WALLET_VALIDATION, 
  WALLET_PAGINATION, 
  WALLET_STATS,
  BULK_OPERATION_LIMITS 
} from './wallet.constants';

// Wallet validation schemas
export const transactionTypeSchema = z.enum([
  TRANSACTION_TYPES.DEPOSIT,
  TRANSACTION_TYPES.WITHDRAW,
  TRANSACTION_TYPES.REFUND,
  TRANSACTION_TYPES.BONUS,
  TRANSACTION_TYPES.PENALTY,
] as const);

export const transactionStatusSchema = z.enum([
  TRANSACTION_STATUSES.PENDING,
  TRANSACTION_STATUSES.COMPLETED,
  TRANSACTION_STATUSES.FAILED,
  TRANSACTION_STATUSES.CANCELLED,
] as const);

export const depositStatusSchema = z.enum([
  DEPOSIT_STATUSES.PENDING,
  DEPOSIT_STATUSES.SUCCESS,
  DEPOSIT_STATUSES.FAILED,
] as const);

export const depositRequestSchema = z.object({
  amount: z.number()
    .min(WALLET_VALIDATION.MIN_DEPOSIT, `Minimum deposit is ${WALLET_VALIDATION.MIN_DEPOSIT}`)
    .max(WALLET_VALIDATION.MAX_DEPOSIT, `Maximum deposit is ${WALLET_VALIDATION.MAX_DEPOSIT}`),
  paymentMethod: z.string().min(1, 'Payment method is required'),
});

export const withdrawRequestSchema = z.object({
  amount: z.number()
    .min(WALLET_VALIDATION.MIN_WITHDRAW, `Minimum withdrawal is ${WALLET_VALIDATION.MIN_WITHDRAW}`)
    .max(WALLET_VALIDATION.MAX_WITHDRAW, `Maximum withdrawal is ${WALLET_VALIDATION.MAX_WITHDRAW}`),
  description: z.string()
    .max(WALLET_VALIDATION.DESCRIPTION_MAX_LENGTH, 'Description too long')
    .optional(),
});

export const transferRequestSchema = z.object({
  toUserId: z.string().uuid('Invalid user ID'),
  amount: z.number()
    .min(WALLET_VALIDATION.MIN_TRANSFER, `Minimum transfer is ${WALLET_VALIDATION.MIN_TRANSFER}`)
    .max(WALLET_VALIDATION.MAX_TRANSFER, `Maximum transfer is ${WALLET_VALIDATION.MAX_TRANSFER}`),
  description: z.string()
    .max(WALLET_VALIDATION.DESCRIPTION_MAX_LENGTH, 'Description too long')
    .optional(),
});

export const walletFilterSchema = z.object({
  page: z.coerce.number().min(1).default(WALLET_PAGINATION.DEFAULT_PAGE),
  limit: z.coerce.number().min(1).max(WALLET_PAGINATION.MAX_LIMIT).default(WALLET_PAGINATION.DEFAULT_LIMIT),
  type: transactionTypeSchema.optional(),
  status: transactionStatusSchema.optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const walletStatsFilterSchema = z.object({
  days: z.coerce.number()
    .min(WALLET_STATS.MIN_DAYS)
    .max(WALLET_STATS.MAX_DAYS)
    .default(WALLET_STATS.DEFAULT_DAYS),
  userId: z.string().uuid().optional(),
});

// Admin wallet operation schemas
export const adminWalletAdjustmentSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  amount: z.number()
    .min(WALLET_VALIDATION.MIN_AMOUNT, `Amount must be at least ${WALLET_VALIDATION.MIN_AMOUNT}`)
    .max(WALLET_VALIDATION.MAX_AMOUNT, `Amount cannot exceed ${WALLET_VALIDATION.MAX_AMOUNT}`),
  type: z.enum([TRANSACTION_TYPES.BONUS, TRANSACTION_TYPES.PENALTY] as const),
  reason: z.string()
    .min(1, 'Reason is required')
    .max(WALLET_VALIDATION.REASON_MAX_LENGTH, 'Reason too long'),
});

export const bulkWalletOperationSchema = z.object({
  userIds: z.array(z.string().uuid())
    .min(BULK_OPERATION_LIMITS.MIN_USERS, `At least ${BULK_OPERATION_LIMITS.MIN_USERS} user ID required`)
    .max(BULK_OPERATION_LIMITS.MAX_USERS, `Too many users (max ${BULK_OPERATION_LIMITS.MAX_USERS})`),
  amount: z.number()
    .min(BULK_OPERATION_LIMITS.MIN_AMOUNT, `Amount must be at least ${BULK_OPERATION_LIMITS.MIN_AMOUNT}`)
    .max(BULK_OPERATION_LIMITS.MAX_AMOUNT, `Amount cannot exceed ${BULK_OPERATION_LIMITS.MAX_AMOUNT}`),
  type: transactionTypeSchema,
  description: z.string()
    .min(1, 'Description is required')
    .max(WALLET_VALIDATION.DESCRIPTION_MAX_LENGTH, 'Description too long'),
});

// Deposit callback schema
export const depositCallbackSchema = z.object({
  depositId: z.string().uuid(),
  status: depositStatusSchema,
  paymentReference: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

// Transaction creation schema
export const createTransactionSchema = z.object({
  userId: z.string().uuid(),
  type: transactionTypeSchema,
  amount: z.number()
    .min(WALLET_VALIDATION.MIN_AMOUNT, `Amount must be at least ${WALLET_VALIDATION.MIN_AMOUNT}`)
    .max(WALLET_VALIDATION.MAX_AMOUNT, `Amount cannot exceed ${WALLET_VALIDATION.MAX_AMOUNT}`),
  description: z.string()
    .min(1)
    .max(WALLET_VALIDATION.DESCRIPTION_MAX_LENGTH, 'Description too long'),
  reference: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

// Wallet parameter schemas
export const walletParamSchema = z.object({
  userId: z.string().uuid('Invalid user ID format')
});

export const transactionParamSchema = z.object({
  id: z.string().uuid('Invalid transaction ID format')
});

export const depositParamSchema = z.object({
  id: z.string().uuid('Invalid deposit ID format')
});

// Type exports
export type DepositRequestInput = z.infer<typeof depositRequestSchema>;
export type WithdrawRequestInput = z.infer<typeof withdrawRequestSchema>;
export type TransferRequestInput = z.infer<typeof transferRequestSchema>;
export type WalletFilterInput = z.infer<typeof walletFilterSchema>;
export type WalletStatsFilterInput = z.infer<typeof walletStatsFilterSchema>;
export type AdminWalletAdjustmentInput = z.infer<typeof adminWalletAdjustmentSchema>;
export type BulkWalletOperationInput = z.infer<typeof bulkWalletOperationSchema>;
export type DepositCallbackInput = z.infer<typeof depositCallbackSchema>;
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type WalletParamInput = z.infer<typeof walletParamSchema>;
export type TransactionParamInput = z.infer<typeof transactionParamSchema>;
export type DepositParamInput = z.infer<typeof depositParamSchema>;