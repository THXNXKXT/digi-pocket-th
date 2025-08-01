import { z } from 'zod';
import { 
  DEPOSIT_REQUEST_STATUSES,
  SLIP_RECORD_STATUSES,
  DEPOSIT_VALIDATION,
  BANK_CODES,
  DEPOSIT_PAGINATION
} from './deposit.constants';

// Enum schemas
export const depositRequestStatusSchema = z.enum([
  DEPOSIT_REQUEST_STATUSES.PENDING,
  DEPOSIT_REQUEST_STATUSES.UPLOADED,
  DEPOSIT_REQUEST_STATUSES.VERIFIED,
  DEPOSIT_REQUEST_STATUSES.REJECTED,
  DEPOSIT_REQUEST_STATUSES.CANCELLED,
  DEPOSIT_REQUEST_STATUSES.EXPIRED,
] as const);

export const slipRecordStatusSchema = z.enum([
  SLIP_RECORD_STATUSES.PENDING,
  SLIP_RECORD_STATUSES.VERIFIED,
  SLIP_RECORD_STATUSES.REJECTED,
] as const);

export const bankCodeSchema = z.enum([
  BANK_CODES.SCB,
  BANK_CODES.KBANK,
  BANK_CODES.BBL,
  BANK_CODES.KTB,
  BANK_CODES.TTB,
  BANK_CODES.BAY,
  BANK_CODES.GSB,
  BANK_CODES.CIMB,
  BANK_CODES.UOB,
  BANK_CODES.TBANK,
] as const);

// Store bank account schemas
export const createStoreAccountSchema = z.object({
  account_number: z.string()
    .min(DEPOSIT_VALIDATION.ACCOUNT_NUMBER_MIN_LENGTH, 'Account number too short')
    .max(DEPOSIT_VALIDATION.ACCOUNT_NUMBER_MAX_LENGTH, 'Account number too long')
    .regex(/^[0-9-]+$/, 'Account number can only contain numbers and hyphens'),
  account_name: z.string()
    .min(1, 'Account name is required')
    .max(DEPOSIT_VALIDATION.ACCOUNT_NAME_MAX_LENGTH, 'Account name too long')
    .trim(),
  bank_name: z.string()
    .min(1, 'Bank name is required')
    .max(DEPOSIT_VALIDATION.BANK_NAME_MAX_LENGTH, 'Bank name too long')
    .trim(),
  promptpay_number: z.string()
    .regex(/^[0-9]+$/, 'PromptPay number can only contain numbers')
    .min(10, 'PromptPay number must be at least 10 digits')
    .max(13, 'PromptPay number must be at most 13 digits')
    .optional(),
  is_active: z.boolean().optional().default(true)
});

export const updateStoreAccountSchema = createStoreAccountSchema.partial();

export const storeAccountFilterSchema = z.object({
  is_active: z.coerce.boolean().optional(),
  bank_name: z.string().optional(),
  page: z.coerce.number().int().min(1).default(DEPOSIT_PAGINATION.DEFAULT_PAGE),
  limit: z.coerce.number().int().min(1).max(DEPOSIT_PAGINATION.MAX_LIMIT).default(DEPOSIT_PAGINATION.DEFAULT_LIMIT),
});

// Deposit request schemas
export const createDepositRequestSchema = z.object({
  store_account_id: z.string().uuid('Invalid store account ID'),
  amount: z.number()
    .min(DEPOSIT_VALIDATION.MIN_AMOUNT, `Minimum deposit amount is ${DEPOSIT_VALIDATION.MIN_AMOUNT} baht`)
    .max(DEPOSIT_VALIDATION.MAX_AMOUNT, `Maximum deposit amount is ${DEPOSIT_VALIDATION.MAX_AMOUNT} baht`)
    .multipleOf(0.01, 'Amount must be in valid currency format')
});

export const depositRequestFilterSchema = z.object({
  status: depositRequestStatusSchema.optional(),
  user_id: z.string().uuid().optional(),
  store_account_id: z.string().uuid().optional(),
  start_date: z.coerce.date().optional(),
  end_date: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).default(DEPOSIT_PAGINATION.DEFAULT_PAGE),
  limit: z.coerce.number().int().min(1).max(DEPOSIT_PAGINATION.MAX_LIMIT).default(DEPOSIT_PAGINATION.DEFAULT_LIMIT),
});

// Slip upload schemas
export const uploadSlipSchema = z.object({
  request_id: z.string().uuid('Invalid request ID'),
  // slip_image handled by multipart middleware
});

// Admin action schemas
export const adminDepositActionSchema = z.object({
  action: z.enum(['approve', 'reject']),
  rejection_reason: z.string()
    .max(DEPOSIT_VALIDATION.REJECTION_REASON_MAX_LENGTH, 'Rejection reason too long')
    .optional(),
  admin_notes: z.string()
    .max(500, 'Admin notes too long')
    .optional()
});

// Slip verification schemas
export const slip2GoPayloadSchema = z.object({
  checkDuplicate: z.boolean(),
  checkReceiver: z.array(z.object({
    accountType: z.string(),
    accountNameTH: z.string(),
    accountNameEN: z.string(),
    accountNumber: z.string()
  })),
  checkAmount: z.object({
    type: z.enum(['eq', 'gte', 'lte']),
    amount: z.number()
  }),
  checkDate: z.object({
    type: z.enum(['eq', 'gte', 'lte']),
    date: z.string()
  })
});

export const slip2GoResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    transactionId: z.string(),
    amount: z.number(),
    date: z.string(),
    time: z.string(),
    sender: z.object({
      account: z.string(),
      name: z.string(),
      bank: z.string()
    }),
    receiver: z.object({
      account: z.string(),
      name: z.string(),
      bank: z.string()
    }),
    ref1: z.string().optional(),
    ref2: z.string().optional(),
    verification: z.object({
      duplicateCheck: z.boolean(),
      receiverCheck: z.boolean(),
      amountCheck: z.boolean(),
      dateCheck: z.boolean()
    }),
    confidence: z.number()
  }).optional(),
  error: z.object({
    code: z.string(),
    message: z.string()
  }).optional()
});

// Slip record creation schema
export const createSlipRecordSchema = z.object({
  deposit_request_id: z.string().uuid(),
  user_id: z.string().uuid(),
  transaction_id: z.string().min(1).max(100),
  amount: z.number().positive(),
  transfer_date: z.coerce.date(),
  
  // Sender info
  sender_account: z.string().min(1).max(20),
  sender_name: z.string().max(200).optional(),
  sender_bank: z.string().min(1).max(10),
  
  // Receiver info
  receiver_account: z.string().min(1).max(20),
  receiver_name: z.string().max(200).optional(),
  receiver_bank: z.string().min(1).max(10),
  
  // Reference numbers
  ref1: z.string().max(50).optional(),
  ref2: z.string().max(50).optional(),
  
  // Verification results
  account_match: z.boolean(),
  amount_match: z.boolean(),
  name_match: z.boolean().nullable(),
  verification_score: z.number().min(0).max(1).optional(),
  verification_data: z.record(z.any()).optional()
});

// Recovery schemas
export const recoveryTokenSchema = z.object({
  recovery_token: z.string().length(DEPOSIT_VALIDATION.RECOVERY_TOKEN_LENGTH)
});

// Pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(DEPOSIT_PAGINATION.DEFAULT_PAGE),
  limit: z.coerce.number().int().min(1).max(DEPOSIT_PAGINATION.MAX_LIMIT).default(DEPOSIT_PAGINATION.DEFAULT_LIMIT),
});

// Statistics schema
export const depositStatisticsSchema = z.object({
  days: z.coerce.number().int().min(1).max(365).default(30)
});
