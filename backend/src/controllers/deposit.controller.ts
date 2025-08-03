import { Context } from 'hono';
import { db } from '../db';
import { depositRequests, storeBankAccounts, slipRecords } from '../db/schemas/deposit';
import { wallets, walletTransactions } from '../db/schemas/wallet';
import { eq, and, gte, desc } from 'drizzle-orm';
import { 
  createDepositRequestSchema,
  uploadSlipSchema
} from '../types/deposit.schemas';
import { 
  CreateDepositRequestInput,
  DepositRequestResponse,
  SlipUploadResponse,
  PendingDepositRequest
} from '../types/deposit.types';
import { 
  DEPOSIT_REQUEST_STATUSES,
  DEPOSIT_EXPIRATION,
  DEPOSIT_ERROR_CODES
} from '../types/deposit.constants';
import { ok, fail } from '../utils/response';
import { validateInput } from '../utils/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { DepositRecoveryService } from '../services/deposit-recovery.service';
import { SlipVerificationService } from '../services/slip-verification.service';
import { walletService } from '../services/wallet.service';
import { env } from '../config/env';

const recoveryService = new DepositRecoveryService();
const verificationService = new SlipVerificationService(
  env.slip2goApiUrl,
  env.slip2goApiKey
);

/**
 * Get available store bank accounts for deposit
 */
export const getAvailableAccounts = asyncHandler(async (c: Context) => {
  const accounts = await db
    .select({
      id: storeBankAccounts.id,
      account_number: storeBankAccounts.accountNumber,
      account_name: storeBankAccounts.accountName,
      bank_name: storeBankAccounts.bankName,
      promptpay_number: storeBankAccounts.promptpayNumber
    })
    .from(storeBankAccounts)
    .where(eq(storeBankAccounts.isActive, true))
    .orderBy(storeBankAccounts.bankName, storeBankAccounts.accountName);

  const { body, status } = ok('Available accounts retrieved successfully', {
    accounts
  });
  return c.json(body, status as any);
});

/**
 * Create a new deposit request
 */
export const createDepositRequest = asyncHandler(async (c: Context) => {
  const user = c.get('user');
  const requestBody = await c.req.json();
  
  const validatedData = validateInput(createDepositRequestSchema, requestBody);

  // Check if store account exists and is active
  const [storeAccount] = await db
    .select()
    .from(storeBankAccounts)
    .where(
      and(
        eq(storeBankAccounts.id, validatedData.store_account_id),
        eq(storeBankAccounts.isActive, true)
      )
    )
    .limit(1);

  if (!storeAccount) {
    const { body: errorBody, status } = fail('Store account not found or inactive', 400, {
      code: DEPOSIT_ERROR_CODES.STORE_ACCOUNT_NOT_FOUND
    });
    return c.json(errorBody, status as any);
  }

  // Generate recovery token and expiration
  const recoveryToken = recoveryService.generateRecoveryToken();
  const expiresAt = new Date(Date.now() + DEPOSIT_EXPIRATION.DEFAULT_HOURS * 60 * 60 * 1000);

  // Create deposit request
  const [newRequest] = await db
    .insert(depositRequests)
    .values({
      userId: user.sub,
      storeAccountId: validatedData.store_account_id,
      amount: validatedData.amount.toString(),
      status: DEPOSIT_REQUEST_STATUSES.PENDING,
      recoveryToken,
      expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastAccessedAt: new Date()
    })
    .returning();

  const response: DepositRequestResponse = {
    request_id: newRequest.id,
    amount: validatedData.amount,
    status: newRequest.status,
    account_info: {
      account_number: storeAccount.accountNumber,
      account_name: storeAccount.accountName,
      bank_name: storeAccount.bankName,
      promptpay_number: storeAccount.promptpayNumber || undefined
    },
    recovery_token: recoveryToken,
    expires_at: expiresAt.toISOString(),
    instructions: [
      "โอนเงินไปยังบัญชีที่แสดง",
      "โอนตามจำนวนเงินที่ระบุ",
      "อัพโหลดสลิปการโอนเงิน",
      "รอการตรวจสอบและอนุมัติ"
    ]
  };

  const { body, status } = ok('Deposit request created successfully', response);
  return c.json(body, status as any);
});

/**
 * Upload slip for verification
 */
export const uploadSlip = asyncHandler(async (c: Context) => {
  const user = c.get('user');
  const requestId = c.req.param('requestId');
  
  // Get multipart form data
  const formData = await c.req.formData();
  const slipImage = formData.get('slip_image') as File;
  
  if (!slipImage) {
    const { body, status } = fail('Slip image is required', 400, {
      code: DEPOSIT_ERROR_CODES.INVALID_SLIP_IMAGE
    });
    return c.json(body, status as any);
  }

  // Get deposit request
  const [depositRequest] = await db
    .select()
    .from(depositRequests)
    .where(
      and(
        eq(depositRequests.id, requestId),
        eq(depositRequests.userId, user.sub),
        gte(depositRequests.expiresAt, new Date()) // Not expired
      )
    )
    .limit(1);

  if (!depositRequest) {
    const { body, status } = fail('Deposit request not found or expired', 404, {
      code: DEPOSIT_ERROR_CODES.DEPOSIT_NOT_FOUND
    });
    return c.json(body, status as any);
  }

  // Check if request can accept slip upload
  const allowedStatuses = [
    DEPOSIT_REQUEST_STATUSES.PENDING,
    DEPOSIT_REQUEST_STATUSES.REJECTED
  ];

  if (!allowedStatuses.includes(depositRequest.status as any)) {
    const { body, status } = fail('Cannot upload slip for this request', 400, {
      current_status: depositRequest.status
    });
    return c.json(body, status as any);
  }

  // Get store account
  const [storeAccount] = await db
    .select()
    .from(storeBankAccounts)
    .where(eq(storeBankAccounts.id, depositRequest.storeAccountId))
    .limit(1);

  if (!storeAccount) {
    const { body, status } = fail('Store account not found', 400, {
      code: DEPOSIT_ERROR_CODES.STORE_ACCOUNT_NOT_FOUND
    });
    return c.json(body, status as any);
  }

  try {
    // Verify slip with Slip2Go
    const verificationResult = await verificationService.verifySlipWithSlip2Go(
      slipImage,
      depositRequest,
      storeAccount
    );

    if (!verificationResult.success) {
      // Update request status to uploaded but failed verification
      await db
        .update(depositRequests)
        .set({
          status: DEPOSIT_REQUEST_STATUSES.UPLOADED,
          slipImageUrl: 'failed_verification', // Placeholder
          slipUploadedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(depositRequests.id, requestId));

      const { body, status } = fail('Slip verification failed', 400, {
        code: DEPOSIT_ERROR_CODES.SLIP_VERIFICATION_FAILED,
        error: verificationResult.error,
        details: verificationResult.verification_data
      });
      return c.json(body, status as any);
    }

    // Save slip record
    const slipRecordId = await verificationService.saveSlipRecord({
      depositRequestId: requestId,
      userId: user.sub,
      transactionId: verificationResult.slip_data!.transaction_id,
      amount: verificationResult.slip_data!.amount.toString(),
      transferDate: verificationResult.slip_data!.transfer_date,
      senderAccount: verificationResult.slip_data!.sender_account,
      senderName: verificationResult.slip_data!.sender_name,
      senderBank: verificationResult.slip_data!.sender_bank,
      receiverAccount: verificationResult.slip_data!.receiver_account,
      receiverName: verificationResult.slip_data!.receiver_name,
      receiverBank: verificationResult.slip_data!.receiver_bank,
      ref1: verificationResult.slip_data!.ref1,
      ref2: verificationResult.slip_data!.ref2,
      accountMatch: verificationResult.verification_result!.account_match,
      amountMatch: verificationResult.verification_result!.amount_match,
      nameMatch: verificationResult.verification_result!.name_match,
      verificationScore: verificationResult.verification_result!.verification_score.toString(),
      verificationData: verificationResult.verification_data,
      status: 'pending'
    });

    // Check if should auto-approve
    const verificationData = verificationResult.verification_result!;
    console.log('Auto-approval check:', {
      account_match: verificationData.account_match,
      amount_match: verificationData.amount_match,
      name_match: verificationData.name_match,
      verification_score: verificationData.verification_score,
      amount: Number(depositRequest.amount),
      min_score_required: 0.9,
      max_amount_allowed: 10000
    });

    const shouldAutoApprove = verificationService.shouldAutoApprove(
      verificationData,
      Number(depositRequest.amount)
    );

    console.log('Should auto-approve:', shouldAutoApprove);

    if (shouldAutoApprove) {
      // Auto-approve and update wallet
      await db.transaction(async (tx) => {
        // Update deposit request status
        await tx
          .update(depositRequests)
          .set({
            status: DEPOSIT_REQUEST_STATUSES.VERIFIED,
            slipImageUrl: 'auto_approved',
            slipUploadedAt: new Date(),
            processedAt: new Date(),
            updatedAt: new Date()
          })
          .where(eq(depositRequests.id, requestId));

        // Update slip record status
        await tx
          .update(slipRecords)
          .set({ status: 'verified' })
          .where(eq(slipRecords.id, slipRecordId));

        // Update wallet balance
        await walletService.deposit(user.sub, Number(depositRequest.amount));
      });

      const response: SlipUploadResponse = {
        slip_id: slipRecordId,
        status: 'approved',
        message: 'Slip verified and deposit approved automatically',
        verification_score: verificationResult.verification_result!.verification_score,
        wallet_updated: true
      };

      const { body, status } = ok('Slip verified and deposit approved', response);
      return c.json(body, status as any);
    } else {
      // Send for manual review
      await db
        .update(depositRequests)
        .set({
          status: DEPOSIT_REQUEST_STATUSES.UPLOADED,
          slipImageUrl: 'pending_review',
          slipUploadedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(depositRequests.id, requestId));

      const response: SlipUploadResponse = {
        slip_id: slipRecordId,
        status: 'pending_review',
        message: 'Slip uploaded for manual review',
        verification_score: verificationResult.verification_result!.verification_score
      };

      const { body, status } = ok('Slip uploaded for review', response);
      return c.json(body, status as any);
    }

  } catch (error) {
    const { body, status } = fail('Failed to process slip', 500, {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return c.json(body, status as any);
  }
});

/**
 * Check deposit request status
 */
export const checkDepositStatus = asyncHandler(async (c: Context) => {
  const user = c.get('user');
  const requestId = c.req.param('requestId');

  const [request] = await db
    .select({
      id: depositRequests.id,
      amount: depositRequests.amount,
      status: depositRequests.status,
      createdAt: depositRequests.createdAt,
      processedAt: depositRequests.processedAt,
      rejectionReason: depositRequests.rejectionReason,
      expiresAt: depositRequests.expiresAt,
    })
    .from(depositRequests)
    .where(
      and(
        eq(depositRequests.id, requestId),
        eq(depositRequests.userId, user.sub)
      )
    )
    .limit(1);

  if (!request) {
    const { body, status } = fail('Deposit request not found', 404);
    return c.json(body, status as any);
  }

  // Get current wallet balance if verified
  let walletBalance;
  if (request.status === DEPOSIT_REQUEST_STATUSES.VERIFIED) {
    const [wallet] = await db
      .select({ balance: wallets.balance })
      .from(wallets)
      .where(eq(wallets.userId, user.sub))
      .limit(1);

    walletBalance = wallet ? Number(wallet.balance) : 0;
  }

  const response = {
    request_id: request.id,
    amount: Number(request.amount),
    status: request.status,
    created_at: request.createdAt?.toISOString(),
    processed_at: request.processedAt?.toISOString(),
    expires_at: request.expiresAt?.toISOString(),
    rejection_reason: request.rejectionReason,
    wallet_balance: walletBalance,
    message: getStatusMessage(request.status)
  };

  const { body, status } = ok('Deposit status retrieved successfully', response);
  return c.json(body, status as any);
});

/**
 * Get pending deposit requests for recovery
 */
export const getPendingRequests = asyncHandler(async (c: Context) => {
  const user = c.get('user');

  const pendingRequests = await recoveryService.getPendingRequests(user.sub);

  const { body, status } = ok('Pending requests retrieved successfully', {
    requests: pendingRequests
  });
  return c.json(body, status as any);
});

/**
 * Resume a deposit request by ID
 */
export const resumeDepositRequest = asyncHandler(async (c: Context) => {
  const user = c.get('user');
  const requestId = c.req.param('requestId');

  const request = await recoveryService.resumeRequest(requestId, user.sub);

  if (!request) {
    const { body, status } = fail('Deposit request not found or expired', 404, {
      code: DEPOSIT_ERROR_CODES.DEPOSIT_NOT_FOUND
    });
    return c.json(body, status as any);
  }

  // Get store account details
  const [storeAccount] = await db
    .select()
    .from(storeBankAccounts)
    .where(eq(storeBankAccounts.id, request.storeAccountId))
    .limit(1);

  const response: DepositRequestResponse = {
    request_id: request.id,
    amount: Number(request.amount),
    status: request.status,
    account_info: {
      account_number: storeAccount?.accountNumber || '',
      account_name: storeAccount?.accountName || '',
      bank_name: storeAccount?.bankName || '',
      promptpay_number: storeAccount?.promptpayNumber || undefined
    },
    recovery_token: request.recoveryToken,
    expires_at: request.expiresAt?.toISOString() || '',
    instructions: [
      "โอนเงินไปยังบัญชีที่แสดง",
      "โอนตามจำนวนเงินที่ระบุ",
      "อัพโหลดสลิปการโอนเงิน",
      "รอการตรวจสอบและอนุมัติ"
    ]
  };

  const { body, status } = ok('Deposit request resumed successfully', response);
  return c.json(body, status as any);
});

/**
 * Cancel a deposit request
 */
export const cancelDepositRequest = asyncHandler(async (c: Context) => {
  const user = c.get('user');
  const requestId = c.req.param('requestId');

  const success = await recoveryService.cancelRequest(requestId, user.sub);

  if (!success) {
    const { body, status } = fail('Cannot cancel this deposit request', 400);
    return c.json(body, status as any);
  }

  const { body, status } = ok('Deposit request cancelled successfully', {
    cancelled_id: requestId
  });
  return c.json(body, status as any);
});

/**
 * Helper function to get status message
 */
function getStatusMessage(status: string): string {
  switch (status) {
    case DEPOSIT_REQUEST_STATUSES.PENDING:
      return 'รอการอัพโหลดสลิป';
    case DEPOSIT_REQUEST_STATUSES.UPLOADED:
      return 'รอการตรวจสอบ';
    case DEPOSIT_REQUEST_STATUSES.VERIFIED:
      return 'เติมเงินสำเร็จ';
    case DEPOSIT_REQUEST_STATUSES.REJECTED:
      return 'ถูกปฏิเสธ';
    case DEPOSIT_REQUEST_STATUSES.CANCELLED:
      return 'ยกเลิกแล้ว';
    case DEPOSIT_REQUEST_STATUSES.EXPIRED:
      return 'หมดอายุ';
    default:
      return 'ไม่ทราบสถานะ';
  }
}
