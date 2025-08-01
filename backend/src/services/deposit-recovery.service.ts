import { db } from '../db';
import { depositRequests, storeBankAccounts } from '../db/schemas/deposit';
import { eq, and, gte, lt, inArray, desc } from 'drizzle-orm';
import { 
  DepositRequest,
  PendingDepositRequest
} from '../types/deposit.types';
import { 
  DEPOSIT_REQUEST_STATUSES,
  DEPOSIT_VALIDATION,
  DEPOSIT_ERROR_CODES
} from '../types/deposit.constants';
import { AppError } from '../utils/errors';
import { randomBytes } from 'crypto';

export class DepositRecoveryError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, DEPOSIT_ERROR_CODES.RECOVERY_TOKEN_INVALID, details);
  }
}

export class DepositRecoveryService {
  
  /**
   * Get pending deposit requests for a user
   */
  async getPendingRequests(userId: string): Promise<PendingDepositRequest[]> {
    const requests = await db
      .select({
        id: depositRequests.id,
        amount: depositRequests.amount,
        status: depositRequests.status,
        createdAt: depositRequests.createdAt,
        expiresAt: depositRequests.expiresAt,
        storeAccountId: depositRequests.storeAccountId,
        slipImageUrl: depositRequests.slipImageUrl,
        // Store account info
        accountNumber: storeBankAccounts.accountNumber,
        accountName: storeBankAccounts.accountName,
        bankName: storeBankAccounts.bankName,
        promptpayNumber: storeBankAccounts.promptpayNumber,
      })
      .from(depositRequests)
      .leftJoin(storeBankAccounts, eq(depositRequests.storeAccountId, storeBankAccounts.id))
      .where(
        and(
          eq(depositRequests.userId, userId),
          inArray(depositRequests.status, [
            DEPOSIT_REQUEST_STATUSES.PENDING,
            DEPOSIT_REQUEST_STATUSES.UPLOADED
          ]),
          gte(depositRequests.expiresAt, new Date()) // Not expired
        )
      )
      .orderBy(desc(depositRequests.createdAt));

    return requests.map(request => ({
      id: request.id,
      amount: Number(request.amount),
      status: request.status,
      account_info: {
        account_number: request.accountNumber || '',
        account_name: request.accountName || '',
        bank_name: request.bankName || '',
        promptpay_number: request.promptpayNumber || undefined
      },
      created_at: request.createdAt?.toISOString() || '',
      expires_at: request.expiresAt?.toISOString() || '',
      time_remaining: this.calculateTimeRemaining(request.expiresAt),
      can_upload_slip: request.status === DEPOSIT_REQUEST_STATUSES.PENDING || 
                      (request.status === DEPOSIT_REQUEST_STATUSES.UPLOADED && !request.slipImageUrl)
    }));
  }

  /**
   * Resume a deposit request by ID
   */
  async resumeRequest(requestId: string, userId: string): Promise<DepositRequest | null> {
    const [request] = await db
      .select()
      .from(depositRequests)
      .where(
        and(
          eq(depositRequests.id, requestId),
          eq(depositRequests.userId, userId),
          gte(depositRequests.expiresAt, new Date()) // Not expired
        )
      )
      .limit(1);

    if (!request) return null;

    // Update last accessed time
    await db
      .update(depositRequests)
      .set({ 
        lastAccessedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(depositRequests.id, requestId));

    return request;
  }

  /**
   * Resume a deposit request by recovery token
   */
  async resumeRequestByToken(recoveryToken: string): Promise<DepositRequest | null> {
    const [request] = await db
      .select()
      .from(depositRequests)
      .where(
        and(
          eq(depositRequests.recoveryToken, recoveryToken),
          gte(depositRequests.expiresAt, new Date()) // Not expired
        )
      )
      .limit(1);

    if (!request) {
      throw new DepositRecoveryError('Invalid or expired recovery token');
    }

    // Update last accessed time
    await db
      .update(depositRequests)
      .set({ 
        lastAccessedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(depositRequests.id, request.id));

    return request;
  }

  /**
   * Check if a deposit request can be recovered
   */
  async canRecover(requestId: string, userId: string): Promise<boolean> {
    const [request] = await db
      .select({
        id: depositRequests.id,
        status: depositRequests.status,
        expiresAt: depositRequests.expiresAt,
        userId: depositRequests.userId
      })
      .from(depositRequests)
      .where(eq(depositRequests.id, requestId))
      .limit(1);

    if (!request) return false;
    if (request.userId !== userId) return false;
    if (request.expiresAt && request.expiresAt < new Date()) return false;

    // Can recover if status allows it
    const recoverableStatuses = [
      DEPOSIT_REQUEST_STATUSES.PENDING,
      DEPOSIT_REQUEST_STATUSES.UPLOADED,
      DEPOSIT_REQUEST_STATUSES.REJECTED
    ];

    return recoverableStatuses.includes(request.status as any);
  }

  /**
   * Cancel a deposit request
   */
  async cancelRequest(requestId: string, userId: string): Promise<boolean> {
    const canRecover = await this.canRecover(requestId, userId);
    if (!canRecover) return false;

    const [updated] = await db
      .update(depositRequests)
      .set({ 
        status: DEPOSIT_REQUEST_STATUSES.CANCELLED,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(depositRequests.id, requestId),
          eq(depositRequests.userId, userId)
        )
      )
      .returning({ id: depositRequests.id });

    return !!updated;
  }

  /**
   * Cleanup expired deposit requests
   */
  async cleanupExpiredRequests(): Promise<number> {
    const result = await db
      .update(depositRequests)
      .set({ 
        status: DEPOSIT_REQUEST_STATUSES.EXPIRED,
        updatedAt: new Date()
      })
      .where(
        and(
          inArray(depositRequests.status, [
            DEPOSIT_REQUEST_STATUSES.PENDING,
            DEPOSIT_REQUEST_STATUSES.UPLOADED
          ]),
          lt(depositRequests.expiresAt, new Date())
        )
      )
      .returning({ id: depositRequests.id });

    return result.length;
  }

  /**
   * Generate a recovery token
   */
  generateRecoveryToken(): string {
    return randomBytes(DEPOSIT_VALIDATION.RECOVERY_TOKEN_LENGTH / 2).toString('hex');
  }

  /**
   * Calculate time remaining in seconds
   */
  private calculateTimeRemaining(expiresAt: Date | null): number {
    if (!expiresAt) return 0;
    
    const now = new Date();
    const remaining = expiresAt.getTime() - now.getTime();
    
    return Math.max(0, Math.floor(remaining / 1000));
  }

  /**
   * Get recovery statistics
   */
  async getRecoveryStatistics(days: number = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    // Count total requests
    const totalRequests = await db
      .select({ count: depositRequests.id })
      .from(depositRequests)
      .where(gte(depositRequests.createdAt, since));

    // Count recovered requests (accessed after creation)
    const recoveredRequests = await db
      .select({ count: depositRequests.id })
      .from(depositRequests)
      .where(
        and(
          gte(depositRequests.createdAt, since),
          gte(depositRequests.lastAccessedAt, depositRequests.createdAt)
        )
      );

    // Count expired requests
    const expiredRequests = await db
      .select({ count: depositRequests.id })
      .from(depositRequests)
      .where(
        and(
          gte(depositRequests.createdAt, since),
          eq(depositRequests.status, DEPOSIT_REQUEST_STATUSES.EXPIRED)
        )
      );

    const total = totalRequests.length;
    const recovered = recoveredRequests.length;
    const expired = expiredRequests.length;

    return {
      total_requests: total,
      recovered_requests: recovered,
      expired_requests: expired,
      recovery_rate: total > 0 ? (recovered / total) * 100 : 0,
      expiration_rate: total > 0 ? (expired / total) * 100 : 0
    };
  }

  /**
   * Extend expiration time for a deposit request
   */
  async extendExpiration(
    requestId: string, 
    userId: string, 
    additionalHours: number = 24
  ): Promise<boolean> {
    const canRecover = await this.canRecover(requestId, userId);
    if (!canRecover) return false;

    const newExpiresAt = new Date(Date.now() + additionalHours * 60 * 60 * 1000);

    const [updated] = await db
      .update(depositRequests)
      .set({ 
        expiresAt: newExpiresAt,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(depositRequests.id, requestId),
          eq(depositRequests.userId, userId)
        )
      )
      .returning({ id: depositRequests.id });

    return !!updated;
  }

  /**
   * Get deposit request with full details for recovery
   */
  async getRequestWithDetails(requestId: string, userId: string) {
    const [request] = await db
      .select({
        // Deposit request fields
        id: depositRequests.id,
        userId: depositRequests.userId,
        amount: depositRequests.amount,
        status: depositRequests.status,
        recoveryToken: depositRequests.recoveryToken,
        createdAt: depositRequests.createdAt,
        expiresAt: depositRequests.expiresAt,
        slipImageUrl: depositRequests.slipImageUrl,
        slipUploadedAt: depositRequests.slipUploadedAt,
        rejectionReason: depositRequests.rejectionReason,
        
        // Store account fields
        accountNumber: storeBankAccounts.accountNumber,
        accountName: storeBankAccounts.accountName,
        bankName: storeBankAccounts.bankName,
        promptpayNumber: storeBankAccounts.promptpayNumber,
        isActive: storeBankAccounts.isActive,
      })
      .from(depositRequests)
      .leftJoin(storeBankAccounts, eq(depositRequests.storeAccountId, storeBankAccounts.id))
      .where(
        and(
          eq(depositRequests.id, requestId),
          eq(depositRequests.userId, userId)
        )
      )
      .limit(1);

    return request;
  }
}
