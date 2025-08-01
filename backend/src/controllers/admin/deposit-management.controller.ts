import { Context } from 'hono';
import { db } from '../../db';
import { depositRequests, storeBankAccounts, slipRecords } from '../../db/schemas/deposit';
import { users, wallets } from '../../db/schemas/base';
import { eq, and, gte, desc, count, inArray, ilike } from 'drizzle-orm';
import { 
  depositRequestFilterSchema,
  adminDepositActionSchema
} from '../../types/deposit.schemas';
import { 
  AdminDepositFilter,
  AdminDepositAction,
  PaginatedResponse
} from '../../types/deposit.types';
import { 
  DEPOSIT_REQUEST_STATUSES,
  SLIP_RECORD_STATUSES,
  DEPOSIT_ERROR_CODES
} from '../../types/deposit.constants';
import { ok, fail } from '../../utils/response';
import { validateInput } from '../../utils/validation';
import { asyncHandler } from '../../middleware/errorHandler';
import { activityService } from '../../services/activity.service';
import { walletService } from '../../services/wallet.service';

/**
 * Get deposit requests with filtering and pagination
 */
export const listDepositRequests = asyncHandler(async (c: Context) => {
  const query = c.req.query();
  const validatedQuery = validateInput(depositRequestFilterSchema, query);

  const { status, user_id, store_account_id, start_date, end_date, page, limit } = validatedQuery;
  const offset = (page - 1) * limit;

  // Build where conditions
  const whereConditions = [];
  
  if (status) {
    whereConditions.push(eq(depositRequests.status, status));
  }
  
  if (user_id) {
    whereConditions.push(eq(depositRequests.userId, user_id));
  }
  
  if (store_account_id) {
    whereConditions.push(eq(depositRequests.storeAccountId, store_account_id));
  }
  
  if (start_date) {
    whereConditions.push(gte(depositRequests.createdAt, start_date));
  }
  
  if (end_date) {
    whereConditions.push(gte(end_date, depositRequests.createdAt));
  }

  const whereClause = whereConditions.length > 0 
    ? and(...whereConditions) 
    : undefined;

  // Get total count
  const [totalResult] = await db
    .select({ count: count() })
    .from(depositRequests)
    .where(whereClause);

  const total = totalResult.count;

  // Get deposit requests with related data
  const deposits = await db
    .select({
      // Deposit request fields
      id: depositRequests.id,
      amount: depositRequests.amount,
      status: depositRequests.status,
      createdAt: depositRequests.createdAt,
      processedAt: depositRequests.processedAt,
      rejectionReason: depositRequests.rejectionReason,
      slipImageUrl: depositRequests.slipImageUrl,
      slipUploadedAt: depositRequests.slipUploadedAt,
      
      // User info
      userId: users.id,
      username: users.username,
      email: users.email,
      
      // Store account info
      storeAccountNumber: storeBankAccounts.accountNumber,
      storeAccountName: storeBankAccounts.accountName,
      storeBankName: storeBankAccounts.bankName,
      storePromptpayNumber: storeBankAccounts.promptpayNumber,
    })
    .from(depositRequests)
    .leftJoin(users, eq(depositRequests.userId, users.id))
    .leftJoin(storeBankAccounts, eq(depositRequests.storeAccountId, storeBankAccounts.id))
    .where(whereClause)
    .orderBy(desc(depositRequests.createdAt))
    .limit(limit)
    .offset(offset);

  // Get slip records for each deposit request
  const depositIds = deposits.map(d => d.id);
  const slips = depositIds.length > 0 ? await db
    .select({
      depositRequestId: slipRecords.depositRequestId,
      transactionId: slipRecords.transactionId,
      accountMatch: slipRecords.accountMatch,
      amountMatch: slipRecords.amountMatch,
      nameMatch: slipRecords.nameMatch,
      verificationScore: slipRecords.verificationScore,
      status: slipRecords.status,
    })
    .from(slipRecords)
    .where(inArray(slipRecords.depositRequestId, depositIds)) : [];

  // Combine data
  const depositsWithSlips = deposits.map(deposit => {
    const slip = slips.find(s => s.depositRequestId === deposit.id);
    
    return {
      id: deposit.id,
      amount: Number(deposit.amount),
      status: deposit.status,
      created_at: deposit.createdAt?.toISOString(),
      processed_at: deposit.processedAt?.toISOString(),
      rejection_reason: deposit.rejectionReason,
      slip_uploaded_at: deposit.slipUploadedAt?.toISOString(),
      
      user: {
        id: deposit.userId,
        username: deposit.username,
        email: deposit.email
      },
      
      store_account: {
        account_number: deposit.storeAccountNumber,
        account_name: deposit.storeAccountName,
        bank_name: deposit.storeBankName,
        promptpay_number: deposit.storePromptpayNumber
      },
      
      slip_verification: slip ? {
        transaction_id: slip.transactionId,
        account_match: slip.accountMatch,
        amount_match: slip.amountMatch,
        name_match: slip.nameMatch,
        verification_score: slip.verificationScore ? Number(slip.verificationScore) : null,
        status: slip.status
      } : null
    };
  });

  const response: PaginatedResponse<typeof depositsWithSlips[0]> = {
    data: depositsWithSlips,
    pagination: {
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit)
    }
  };

  const { body: responseBody, status: responseStatus } = ok('Deposit requests retrieved successfully', response);
  return c.json(responseBody, responseStatus as any);
});

/**
 * Get a single deposit request with full details
 */
export const getDepositRequest = asyncHandler(async (c: Context) => {
  const depositId = c.req.param('id');

  const [deposit] = await db
    .select({
      // Deposit request fields
      id: depositRequests.id,
      amount: depositRequests.amount,
      status: depositRequests.status,
      createdAt: depositRequests.createdAt,
      processedAt: depositRequests.processedAt,
      rejectionReason: depositRequests.rejectionReason,
      slipImageUrl: depositRequests.slipImageUrl,
      slipUploadedAt: depositRequests.slipUploadedAt,
      slipData: depositRequests.slipData,
      
      // User info
      userId: users.id,
      username: users.username,
      email: users.email,
      
      // Store account info
      storeAccountNumber: storeBankAccounts.accountNumber,
      storeAccountName: storeBankAccounts.accountName,
      storeBankName: storeBankAccounts.bankName,
      storePromptpayNumber: storeBankAccounts.promptpayNumber,
    })
    .from(depositRequests)
    .leftJoin(users, eq(depositRequests.userId, users.id))
    .leftJoin(storeBankAccounts, eq(depositRequests.storeAccountId, storeBankAccounts.id))
    .where(eq(depositRequests.id, depositId))
    .limit(1);

  if (!deposit) {
    const { body: errorBody, status: errorStatus } = fail('Deposit request not found', 404);
    return c.json(errorBody, errorStatus as any);
  }

  // Get slip record if exists
  const [slip] = await db
    .select()
    .from(slipRecords)
    .where(eq(slipRecords.depositRequestId, depositId))
    .limit(1);

  const response = {
    id: deposit.id,
    amount: Number(deposit.amount),
    status: deposit.status,
    created_at: deposit.createdAt?.toISOString(),
    processed_at: deposit.processedAt?.toISOString(),
    rejection_reason: deposit.rejectionReason,
    slip_uploaded_at: deposit.slipUploadedAt?.toISOString(),
    slip_data: deposit.slipData,
    
    user: {
      id: deposit.userId,
      username: deposit.username,
      email: deposit.email
    },
    
    store_account: {
      account_number: deposit.storeAccountNumber,
      account_name: deposit.storeAccountName,
      bank_name: deposit.storeBankName,
      promptpay_number: deposit.storePromptpayNumber
    },
    
    slip_record: slip ? {
      id: slip.id,
      transaction_id: slip.transactionId,
      amount: Number(slip.amount),
      transfer_date: slip.transferDate?.toISOString(),
      sender_account: slip.senderAccount,
      sender_name: slip.senderName,
      sender_bank: slip.senderBank,
      receiver_account: slip.receiverAccount,
      receiver_name: slip.receiverName,
      receiver_bank: slip.receiverBank,
      ref1: slip.ref1,
      ref2: slip.ref2,
      account_match: slip.accountMatch,
      amount_match: slip.amountMatch,
      name_match: slip.nameMatch,
      verification_score: slip.verificationScore ? Number(slip.verificationScore) : null,
      verification_data: slip.verificationData,
      status: slip.status,
      created_at: slip.createdAt?.toISOString()
    } : null
  };

  const { body: responseBody, status: responseStatus } = ok('Deposit request retrieved successfully', response);
  return c.json(responseBody, responseStatus as any);
});

/**
 * Approve a deposit request
 */
export const approveDepositRequest = asyncHandler(async (c: Context) => {
  const admin = c.get('user');
  const depositId = c.req.param('id');
  const requestBody = await c.req.json();

  const validatedData = validateInput(adminDepositActionSchema, requestBody);

  if (validatedData.action !== 'approve') {
    const { body: errorBody, status } = fail('Invalid action', 400);
    return c.json(errorBody, status as any);
  }

  // Get deposit request
  const [depositRequest] = await db
    .select()
    .from(depositRequests)
    .where(eq(depositRequests.id, depositId))
    .limit(1);

  if (!depositRequest) {
    const { body: errorBody, status } = fail('Deposit request not found', 404);
    return c.json(errorBody, status as any);
  }

  // Check if can be approved
  if (depositRequest.status !== DEPOSIT_REQUEST_STATUSES.UPLOADED) {
    const { body: errorBody, status } = fail('Cannot approve this deposit request', 400, {
      current_status: depositRequest.status
    });
    return c.json(errorBody, status as any);
  }

  try {
    await db.transaction(async (tx) => {
      // Update deposit request
      await tx
        .update(depositRequests)
        .set({
          status: DEPOSIT_REQUEST_STATUSES.VERIFIED,
          processedBy: admin.sub,
          processedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(depositRequests.id, depositId));

      // Update slip record if exists
      await tx
        .update(slipRecords)
        .set({ status: SLIP_RECORD_STATUSES.VERIFIED })
        .where(eq(slipRecords.depositRequestId, depositId));

      // Update wallet balance
      await walletService.deposit(depositRequest.userId, Number(depositRequest.amount));
    });

    // Log admin action
    await activityService.logAdminAction(
      admin.sub,
      'wallet',
      'approve_deposit',
      c,
      {
        deposit_id: depositId,
        user_id: depositRequest.userId,
        amount: Number(depositRequest.amount),
        admin_notes: validatedData.admin_notes
      }
    );

    const { body: responseBody, status: responseStatus } = ok('Deposit request approved successfully', {
      deposit_id: depositId,
      status: DEPOSIT_REQUEST_STATUSES.VERIFIED,
      amount: Number(depositRequest.amount)
    });
    return c.json(responseBody, responseStatus as any);

  } catch (error) {
    const { body: errorBody, status: errorStatus } = fail('Failed to approve deposit request', 500, {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return c.json(errorBody, errorStatus as any);
  }
});

/**
 * Reject a deposit request
 */
export const rejectDepositRequest = asyncHandler(async (c: Context) => {
  const admin = c.get('user');
  const depositId = c.req.param('id');
  const requestBody = await c.req.json();

  const validatedData = validateInput(adminDepositActionSchema, requestBody);

  if (validatedData.action !== 'reject') {
    const { body: errorBody, status } = fail('Invalid action', 400);
    return c.json(errorBody, status as any);
  }

  if (!validatedData.rejection_reason) {
    const { body: errorBody, status } = fail('Rejection reason is required', 400);
    return c.json(errorBody, status as any);
  }

  // Get deposit request
  const [depositRequest] = await db
    .select()
    .from(depositRequests)
    .where(eq(depositRequests.id, depositId))
    .limit(1);

  if (!depositRequest) {
    const { body: errorBody, status } = fail('Deposit request not found', 404);
    return c.json(errorBody, status as any);
  }

  // Check if can be rejected
  if (depositRequest.status !== DEPOSIT_REQUEST_STATUSES.UPLOADED) {
    const { body: errorBody, status } = fail('Cannot reject this deposit request', 400, {
      current_status: depositRequest.status
    });
    return c.json(errorBody, status as any);
  }

  try {
    await db.transaction(async (tx) => {
      // Update deposit request
      await tx
        .update(depositRequests)
        .set({
          status: DEPOSIT_REQUEST_STATUSES.REJECTED,
          rejectionReason: validatedData.rejection_reason,
          processedBy: admin.sub,
          processedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(depositRequests.id, depositId));

      // Update slip record if exists
      await tx
        .update(slipRecords)
        .set({ status: SLIP_RECORD_STATUSES.REJECTED })
        .where(eq(slipRecords.depositRequestId, depositId));
    });

    // Log admin action
    await activityService.logAdminAction(
      admin.sub,
      'wallet',
      'reject_deposit',
      c,
      {
        deposit_id: depositId,
        user_id: depositRequest.userId,
        amount: Number(depositRequest.amount),
        rejection_reason: validatedData.rejection_reason,
        admin_notes: validatedData.admin_notes
      }
    );

    const { body: responseBody, status: responseStatus } = ok('Deposit request rejected successfully', {
      deposit_id: depositId,
      status: DEPOSIT_REQUEST_STATUSES.REJECTED,
      rejection_reason: validatedData.rejection_reason
    });
    return c.json(responseBody, responseStatus as any);

  } catch (error) {
    const { body: errorBody, status: errorStatus } = fail('Failed to reject deposit request', 500, {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return c.json(errorBody, errorStatus as any);
  }
});

/**
 * Get deposit statistics
 */
export const getDepositStatistics = asyncHandler(async (c: Context) => {
  const days = Number(c.req.query('days')) || 30;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  // Get basic counts
  const [stats] = await db
    .select({
      total: count(),
    })
    .from(depositRequests)
    .where(gte(depositRequests.createdAt, since));

  // Get status breakdown
  const statusCounts = await db
    .select({
      status: depositRequests.status,
      count: count(),
    })
    .from(depositRequests)
    .where(gte(depositRequests.createdAt, since))
    .groupBy(depositRequests.status);

  // Get amount totals
  const [amountStats] = await db
    .select({
      totalAmount: depositRequests.amount,
    })
    .from(depositRequests)
    .where(
      and(
        gte(depositRequests.createdAt, since),
        eq(depositRequests.status, DEPOSIT_REQUEST_STATUSES.VERIFIED)
      )
    );

  const statusMap = statusCounts.reduce((acc, item) => {
    acc[item.status] = item.count;
    return acc;
  }, {} as Record<string, number>);

  const response = {
    period_days: days,
    total_requests: stats.total,
    pending_requests: statusMap[DEPOSIT_REQUEST_STATUSES.PENDING] || 0,
    uploaded_requests: statusMap[DEPOSIT_REQUEST_STATUSES.UPLOADED] || 0,
    verified_requests: statusMap[DEPOSIT_REQUEST_STATUSES.VERIFIED] || 0,
    rejected_requests: statusMap[DEPOSIT_REQUEST_STATUSES.REJECTED] || 0,
    cancelled_requests: statusMap[DEPOSIT_REQUEST_STATUSES.CANCELLED] || 0,
    expired_requests: statusMap[DEPOSIT_REQUEST_STATUSES.EXPIRED] || 0,
    total_amount_verified: Number(amountStats?.totalAmount || 0),
    verification_rate: stats.total > 0
      ? ((statusMap[DEPOSIT_REQUEST_STATUSES.VERIFIED] || 0) / stats.total) * 100
      : 0,
  };

  const { body: responseBody, status: responseStatus } = ok('Deposit statistics retrieved successfully', response);
  return c.json(responseBody, responseStatus as any);
});
