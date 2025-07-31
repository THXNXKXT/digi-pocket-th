import { z } from 'zod';

// Wallet enums
export type TransactionType = 'deposit' | 'withdraw' | 'refund' | 'bonus' | 'penalty';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';
export type DepositStatus = 'pending' | 'success' | 'failed';

// Base wallet interfaces
export interface Wallet {
  id: string;
  userId: string;
  balance: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewWallet {
  userId: string;
  balance: string;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: string;
  balanceBefore: string;
  balanceAfter: string;
  description: string;
  reference?: string;
  status: TransactionStatus;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

export interface NewWalletTransaction {
  userId: string;
  type: TransactionType;
  amount: string;
  balanceBefore: string;
  balanceAfter: string;
  description: string;
  reference?: string;
  status: TransactionStatus;
  metadata?: Record<string, any>;
}

// Deposit interfaces
export interface Deposit {
  id: string;
  userId: string;
  amount: string;
  status: DepositStatus;
  paymentMethod: string;
  paymentReference?: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

export interface NewDeposit {
  userId: string;
  amount: string;
  status: DepositStatus;
  paymentMethod: string;
  paymentReference?: string;
  metadata?: Record<string, any>;
}

// Request/Response types
export interface DepositRequest {
  amount: number;
  paymentMethod: string;
}

export interface WithdrawRequest {
  amount: number;
  description?: string;
}

export interface TransferRequest {
  toUserId: string;
  amount: number;
  description?: string;
}

export interface WalletFilters {
  page?: number;
  limit?: number;
  type?: TransactionType;
  status?: TransactionStatus;
  startDate?: Date;
  endDate?: Date;
}

export interface PaginatedTransactions {
  transactions: WalletTransaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface WalletBalance {
  userId: string;
  balance: number;
  availableBalance: number;
  pendingAmount: number;
  lastTransactionDate?: Date;
}

// Wallet statistics
export interface WalletStatistics {
  totalBalance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalTransactions: number;
  averageTransactionAmount: number;
  period: string;
  transactionsByType: {
    type: TransactionType;
    count: number;
    totalAmount: number;
  }[];
}

export interface WalletStatsFilters {
  days?: number;
  userId?: string;
}

// Admin wallet operations
export interface AdminWalletAdjustment {
  userId: string;
  amount: number;
  type: 'bonus' | 'penalty';
  reason: string;
  adminId: string;
}

export interface BulkWalletOperation {
  userIds: string[];
  amount: number;
  type: TransactionType;
  description: string;
  adminId: string;
}