// Base types from database schemas
export type {
  StoreBankAccount,
  NewStoreBankAccount,
  DepositRequest,
  NewDepositRequest,
  SlipRecord,
  NewSlipRecord,
} from '../db/schemas/deposit';

// Slip2Go API types
export interface Slip2GoPayload {
  checkDuplicate: boolean;
  checkReceiver: CheckReceiver[];
  checkAmount: CheckAmount;
  checkDate: CheckDate;
}

export interface CheckReceiver {
  accountType: string;      // '01004' = PromptPay
  accountNameTH: string;    // ชื่อบัญชีภาษาไทย
  accountNameEN: string;    // ชื่อบัญชีภาษาอังกฤษ
  accountNumber: string;    // เลขบัญชี (masked: 'xxxxxxx1234')
}

export interface CheckAmount {
  type: 'eq' | 'gte' | 'lte';  // equal, greater than or equal, less than or equal
  amount: number;              // จำนวนเงิน
}

export interface CheckDate {
  type: 'eq' | 'gte' | 'lte';
  date: string;                // ISO 8601 format
}

// Updated Slip2Go Response interface to match actual API response
export interface Slip2GoResponse {
  success?: boolean;
  code?: string;
  message?: string;
  data?: {
    transRef: string;
    dateTime: string;
    amount: number;
    ref1?: string | null;
    ref2?: string | null;
    ref3?: string | null;
    receiver: {
      account: {
        name: string;
        bank: {
          account: string;
        };
        proxy?: {
          type: string;
          account: string;
        };
      };
      bank: {
        id: string;
        name: string;
      };
    };
    sender: {
      account: {
        name: string;
        bank: {
          account: string;
        };
      };
      bank: {
        id: string;
        name: string;
      };
    };
    decode?: string;
    referenceId?: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

// Legacy interface for backward compatibility
export interface LegacySlip2GoResponse {
  success: boolean;
  data?: {
    // Slip information
    transactionId: string;
    amount: number;
    date: string;
    time: string;

    // Sender information
    sender: {
      account: string;
      name: string;
      bank: string;
    };

    // Receiver information
    receiver: {
      account: string;
      name: string;
      bank: string;
    };

    // Reference numbers
    ref1?: string;
    ref2?: string;

    // Verification results
    verification: {
      duplicateCheck: boolean;
      receiverCheck: boolean;
      amountCheck: boolean;
      dateCheck: boolean;
    };

    // Confidence score
    confidence: number;
  };
  error?: {
    code: string;
    message: string;
  };
}

// Slip verification result types
export interface SlipVerificationResult {
  success: boolean;
  slip_data?: {
    transaction_id: string;
    amount: number;
    transfer_date: Date;
    sender_account: string;
    sender_name?: string;
    sender_bank: string;
    receiver_account: string;
    receiver_name?: string;
    receiver_bank: string;
    ref1?: string;
    ref2?: string;
  };
  verification_result?: {
    account_match: boolean;
    amount_match: boolean;
    name_match: boolean | null;
    verification_score: number;
    duplicate_check: boolean;
  };
  verification_data?: any;
  error?: string;
}

// Deposit request creation types
export interface CreateDepositRequestInput {
  store_account_id: string;
  amount: number;
}

export interface DepositRequestResponse {
  request_id: string;
  amount: number;
  status: string;
  account_info: {
    account_number: string;
    account_name: string;
    bank_name: string;
    promptpay_number?: string;
  };
  recovery_token: string;
  expires_at: string;
  instructions: string[];
}

// Slip upload types
export interface SlipUploadInput {
  request_id: string;
  slip_image: File;
}

export interface SlipUploadResponse {
  slip_id: string;
  status: string;
  message: string;
  verification_score?: number;
  wallet_updated?: boolean;
}

// Admin management types
export interface AdminDepositFilter {
  status?: string;
  user_id?: string;
  store_account_id?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}

export interface AdminDepositAction {
  action: 'approve' | 'reject';
  rejection_reason?: string;
  admin_notes?: string;
}

// Store account management types
export interface CreateStoreAccountInput {
  account_number: string;
  account_name: string;
  bank_name: string;
  promptpay_number?: string;
  is_active?: boolean;
}

export interface UpdateStoreAccountInput {
  account_number?: string;
  account_name?: string;
  bank_name?: string;
  promptpay_number?: string;
  is_active?: boolean;
}

// Recovery types
export interface PendingDepositRequest {
  id: string;
  amount: number;
  status: string;
  account_info: {
    account_number: string;
    account_name: string;
    bank_name: string;
    promptpay_number?: string;
  };
  created_at: string;
  expires_at: string;
  time_remaining: number; // seconds
  can_upload_slip: boolean;
}

// Statistics types
export interface DepositStatistics {
  total_requests: number;
  pending_requests: number;
  verified_requests: number;
  rejected_requests: number;
  total_amount: number;
  average_verification_score: number;
  auto_approval_rate: number;
}

// Error types
export interface DepositError {
  code: string;
  message: string;
  details?: any;
  field?: string;
}

// Pagination types
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}
