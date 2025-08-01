import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  numeric,
  pgEnum,
  text,
  boolean,
  jsonb,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./base";

// Deposit status enums
export const depositRequestStatusEnum = pgEnum("deposit_request_status", [
  "pending",
  "uploaded", 
  "verified",
  "rejected",
  "cancelled",
  "expired"
]);

export const slipRecordStatusEnum = pgEnum("slip_record_status", [
  "pending",
  "verified", 
  "rejected"
]);

// Store Bank Accounts table
export const storeBankAccounts = pgTable(
  "store_bank_accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    
    // Basic bank account info
    accountNumber: varchar("account_number", { length: 20 }).notNull().unique(),
    accountName: varchar("account_name", { length: 200 }).notNull(),
    bankName: varchar("bank_name", { length: 100 }).notNull(),
    promptpayNumber: varchar("promptpay_number", { length: 20 }), // Optional PromptPay number
    isActive: boolean("is_active").notNull().default(true),
    
    // Metadata
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (storeBankAccounts) => {
    return {
      activeIdx: index("idx_store_accounts_active").on(storeBankAccounts.isActive),
      bankNameIdx: index("idx_store_accounts_bank").on(storeBankAccounts.bankName),
    };
  }
);

// Deposit Requests table
export const depositRequests = pgTable(
  "deposit_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    storeAccountId: uuid("store_account_id")
      .notNull()
      .references(() => storeBankAccounts.id),
    
    // Request details
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    status: depositRequestStatusEnum("status").notNull().default("pending"),
    
    // Recovery and Session Management
    recoveryToken: varchar("recovery_token", { length: 255 }).notNull().unique(),
    
    // Expiration Management
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    lastAccessedAt: timestamp("last_accessed_at", { withTimezone: true }).defaultNow(),
    
    // Slip Upload
    slipImageUrl: text("slip_image_url"),
    slipUploadedAt: timestamp("slip_uploaded_at", { withTimezone: true }),
    slipData: jsonb("slip_data"), // Raw data from Slip2Go
    
    // Processing
    processedBy: uuid("processed_by").references(() => users.id),
    processedAt: timestamp("processed_at", { withTimezone: true }),
    rejectionReason: text("rejection_reason"),
    
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (depositRequests) => {
    return {
      userStatusIdx: index("idx_deposit_requests_user_status").on(
        depositRequests.userId,
        depositRequests.status
      ),
      recoveryTokenIdx: uniqueIndex("idx_deposit_requests_recovery_token").on(
        depositRequests.recoveryToken
      ),
      expiresAtIdx: index("idx_deposit_requests_expires_at").on(
        depositRequests.expiresAt
      ),
      storeAccountIdx: index("idx_deposit_requests_store_account").on(
        depositRequests.storeAccountId
      ),
      statusIdx: index("idx_deposit_requests_status").on(depositRequests.status),
    };
  }
);

// Slip Records table
export const slipRecords = pgTable(
  "slip_records",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    depositRequestId: uuid("deposit_request_id")
      .notNull()
      .references(() => depositRequests.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    
    // Slip verification data
    transactionId: varchar("transaction_id", { length: 100 }).notNull().unique(),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    transferDate: timestamp("transfer_date", { withTimezone: true }).notNull(),
    
    // Sender info
    senderAccount: varchar("sender_account", { length: 50 }).notNull(), // Increased for masked accounts
    senderName: varchar("sender_name", { length: 200 }),
    senderBank: varchar("sender_bank", { length: 100 }).notNull(), // Increased for full bank names

    // Receiver info (must match store account)
    receiverAccount: varchar("receiver_account", { length: 50 }).notNull(), // Increased for masked accounts
    receiverName: varchar("receiver_name", { length: 200 }),
    receiverBank: varchar("receiver_bank", { length: 100 }).notNull(), // Increased for full bank names
    
    // Reference numbers
    ref1: varchar("ref1", { length: 50 }),
    ref2: varchar("ref2", { length: 50 }),
    
    // Verification results
    accountMatch: boolean("account_match").notNull().default(false),
    amountMatch: boolean("amount_match").notNull().default(false),
    nameMatch: boolean("name_match"), // nullable because name verification is optional
    
    // Overall verification
    status: slipRecordStatusEnum("status").notNull().default("pending"),
    verificationData: jsonb("verification_data"), // Raw data from Slip2Go
    verificationScore: numeric("verification_score", { precision: 3, scale: 2 }), // 0.00-1.00
    
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (slipRecords) => {
    return {
      transactionIdIdx: uniqueIndex("idx_slip_records_transaction_id").on(
        slipRecords.transactionId
      ),
      verificationIdx: index("idx_slip_records_verification").on(
        slipRecords.accountMatch,
        slipRecords.amountMatch,
        slipRecords.nameMatch
      ),
      statusIdx: index("idx_slip_records_status").on(slipRecords.status),
      userIdx: index("idx_slip_records_user").on(slipRecords.userId),
      depositRequestIdx: index("idx_slip_records_deposit_request").on(
        slipRecords.depositRequestId
      ),
    };
  }
);

// Export types
export type StoreBankAccount = typeof storeBankAccounts.$inferSelect;
export type NewStoreBankAccount = typeof storeBankAccounts.$inferInsert;

export type DepositRequest = typeof depositRequests.$inferSelect;
export type NewDepositRequest = typeof depositRequests.$inferInsert;

export type SlipRecord = typeof slipRecords.$inferSelect;
export type NewSlipRecord = typeof slipRecords.$inferInsert;
