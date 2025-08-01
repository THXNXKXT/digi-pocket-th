import { db } from '../db';
import { slipRecords } from '../db/schemas/deposit';
import { eq } from 'drizzle-orm';
import { Slip2GoService } from './slip2go.service';
import { 
  SlipVerificationResult,
  Slip2GoResponse,
  DepositRequest,
  StoreBankAccount,
  NewSlipRecord
} from '../types/deposit.types';
import { 
  VERIFICATION_WEIGHTS,
  AUTO_APPROVAL_RULES,
  DEPOSIT_ERROR_CODES
} from '../types/deposit.constants';
import { AppError } from '../utils/errors';

export class SlipVerificationError extends AppError {
  constructor(message: string, verificationDetails?: any) {
    super(message, 400, DEPOSIT_ERROR_CODES.SLIP_VERIFICATION_FAILED, verificationDetails);
  }
}

export class SlipVerificationService {
  private slip2go: Slip2GoService;

  constructor(slip2goApiUrl: string, slip2goApiKey: string) {
    this.slip2go = new Slip2GoService(slip2goApiUrl, slip2goApiKey);
  }

  /**
   * Verify slip with Slip2Go and process results
   *
   * Note: We disable Slip2Go's duplicate check because:
   * 1. Slip2Go checks duplicates across ALL their clients, not just our system
   * 2. This can cause false positives when testing with the same slip
   * 3. We handle duplicate checking ourselves using our database
   */
  async verifySlipWithSlip2Go(
    slipImage: File,
    depositRequest: DepositRequest,
    storeAccount: StoreBankAccount
  ): Promise<SlipVerificationResult> {
    try {
      // Call Slip2Go API with both account number and PromptPay
      // Disable Slip2Go duplicate check since we handle it ourselves
      const slip2goResult = await this.slip2go.verifySlipWithRetry(
        slipImage,
        storeAccount.accountNumber,
        Number(depositRequest.amount),
        storeAccount.accountName,
        storeAccount.promptpayNumber || undefined,
        3, // maxRetries
        false // checkDuplicate - disable Slip2Go duplicate check
      );

      if (!slip2goResult.success || !slip2goResult.data) {
        return {
          success: false,
          error: this.slip2go.extractErrorMessage(slip2goResult),
          verification_data: slip2goResult
        };
      }

      // Process verification results
      const verificationResult = await this.processSlip2GoResult(
        slip2goResult,
        depositRequest,
        storeAccount
      );

      return verificationResult;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect to slip verification service';
      return {
        success: false,
        error: errorMessage,
        verification_data: { error: errorMessage }
      };
    }
  }

  /**
   * Process Slip2Go result and calculate verification scores
   */
  private async processSlip2GoResult(
    slip2goResult: Slip2GoResponse,
    depositRequest: DepositRequest,
    storeAccount: StoreBankAccount
  ): Promise<SlipVerificationResult> {
    const data = slip2goResult.data!;

    // Check for duplicate transaction using transactionId (legacy) or transRef (new format)
    const transactionId = (data as any).transactionId || (data as any).transRef;
    const isDuplicate = await this.checkDuplicateTransaction(transactionId);
    if (isDuplicate) {
      throw new SlipVerificationError('Duplicate slip detected', {
        transaction_id: transactionId,
        code: DEPOSIT_ERROR_CODES.DUPLICATE_SLIP
      });
    }

    // Handle both legacy and new format
    let account_match: boolean;
    let amount_match: boolean;
    let name_match: boolean | null;
    let sender_account: string;
    let sender_name: string;
    let sender_bank: string;
    let receiver_account: string;
    let receiver_name: string;
    let receiver_bank: string;
    let transfer_date: Date;
    let confidence: number;
    let duplicate_check: boolean;

    if ((data as any).verification) {
      // Legacy format
      const legacyData = data as any;
      account_match = legacyData.verification.receiverCheck;
      amount_match = legacyData.verification.amountCheck;
      name_match = this.checkNameMatch(legacyData.receiver.name, storeAccount.accountName);
      sender_account = legacyData.sender.account;
      sender_name = legacyData.sender.name;
      sender_bank = legacyData.sender.bank;
      receiver_account = legacyData.receiver.account;
      receiver_name = legacyData.receiver.name;
      receiver_bank = legacyData.receiver.bank;
      transfer_date = new Date(`${legacyData.date}T${legacyData.time}`);
      confidence = legacyData.confidence;
      duplicate_check = legacyData.verification.duplicateCheck;
    } else {
      // New format - we need to perform our own verification
      const newData = data as any;

      // Check amount match
      amount_match = Math.abs(newData.amount - Number(depositRequest.amount)) < 0.01;

      // Check account match (compare with store account)
      const receiverAccount = newData.receiver.account.bank.account;
      const storeAccountFormatted = storeAccount.accountNumber.replace(/[-\s]/g, '');
      const receiverAccountFormatted = receiverAccount.replace(/[x-]/g, '');

      console.log('Account matching:', {
        receiverAccount,
        storeAccount: storeAccount.accountNumber,
        storeAccountFormatted,
        receiverAccountFormatted
      });

      account_match = storeAccountFormatted.includes(receiverAccountFormatted) ||
                     receiverAccountFormatted.includes(storeAccountFormatted);

      console.log('Account match result:', account_match);

      // Check name match
      name_match = this.checkNameMatch(newData.receiver.account.name, storeAccount.accountName);

      // Extract other data
      sender_account = newData.sender.account.bank.account;
      sender_name = newData.sender.account.name;
      sender_bank = newData.sender.bank.name;
      receiver_account = newData.receiver.account.bank.account;
      receiver_name = newData.receiver.account.name;
      receiver_bank = newData.receiver.bank.name;
      transfer_date = new Date(newData.dateTime);
      confidence = 0.95; // High confidence for valid slips
      duplicate_check = true; // We handle this ourselves
    }

    // Calculate overall confidence
    const verification_score = this.calculateConfidenceScore({
      account_match,
      amount_match,
      name_match,
      slip2go_confidence: confidence,
      duplicate_check
    });

    return {
      success: true,
      slip_data: {
        transaction_id: transactionId,
        amount: (data as any).amount,
        transfer_date,
        sender_account,
        sender_name,
        sender_bank,
        receiver_account,
        receiver_name,
        receiver_bank,
        ref1: (data as any).ref1,
        ref2: (data as any).ref2
      },
      verification_result: {
        account_match,
        amount_match,
        name_match,
        verification_score,
        duplicate_check
      },
      verification_data: slip2goResult
    };
  }

  /**
   * Check if transaction ID already exists
   */
  private async checkDuplicateTransaction(transactionId: string): Promise<boolean> {
    const [existingRecord] = await db
      .select()
      .from(slipRecords)
      .where(eq(slipRecords.transactionId, transactionId))
      .limit(1);

    return !!existingRecord;
  }

  /**
   * Check name matching with fuzzy logic
   */
  private checkNameMatch(receivedName: string, expectedName: string): boolean | null {
    console.log('Name matching:', { receivedName, expectedName });

    if (!receivedName || !expectedName) return null;

    // Normalize names for comparison
    const normalize = (name: string) =>
      name.toLowerCase()
          .replace(/\s+/g, '')
          .replace(/[^\u0E00-\u0E7Fa-z]/g, '');

    const normalizedReceived = normalize(receivedName);
    const normalizedExpected = normalize(expectedName);

    console.log('Normalized names:', { normalizedReceived, normalizedExpected });

    // Exact match
    if (normalizedReceived === normalizedExpected) {
      console.log('Exact name match found');
      return true;
    }

    // Partial match (50% similarity - more lenient for Thai names)
    const similarity = this.calculateStringSimilarity(normalizedReceived, normalizedExpected);
    console.log('Name similarity:', similarity);
    const isMatch = similarity >= 0.5; // Lowered from 0.7 to 0.5
    console.log('Name match result:', isMatch);
    return isMatch;
  }

  /**
   * Calculate string similarity using Levenshtein distance
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    const matrix = [];
    const len1 = str1.length;
    const len2 = str2.length;

    if (len1 === 0) return len2 === 0 ? 1 : 0;
    if (len2 === 0) return 0;

    // Initialize matrix
    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }

    // Fill matrix
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,      // deletion
          matrix[i][j - 1] + 1,      // insertion
          matrix[i - 1][j - 1] + cost // substitution
        );
      }
    }

    const distance = matrix[len1][len2];
    const maxLength = Math.max(len1, len2);
    return (maxLength - distance) / maxLength;
  }

  /**
   * Calculate confidence score based on verification results
   */
  private calculateConfidenceScore(checks: {
    account_match: boolean;
    amount_match: boolean;
    name_match: boolean | null;
    slip2go_confidence: number;
    duplicate_check: boolean;
  }): number {
    let score = 0;
    let maxScore = 0;

    console.log('Calculating confidence score with checks:', checks);

    // Account match (40% weight)
    if (checks.account_match) score += VERIFICATION_WEIGHTS.ACCOUNT_MATCH;
    maxScore += VERIFICATION_WEIGHTS.ACCOUNT_MATCH;

    // Amount match (30% weight)
    if (checks.amount_match) score += VERIFICATION_WEIGHTS.AMOUNT_MATCH;
    maxScore += VERIFICATION_WEIGHTS.AMOUNT_MATCH;

    // Name match (10% weight, optional)
    // Always add to maxScore, but only add to score if name_match is true
    maxScore += VERIFICATION_WEIGHTS.NAME_MATCH;
    if (checks.name_match === true) {
      score += VERIFICATION_WEIGHTS.NAME_MATCH;
    }

    // Slip2Go confidence (15% weight)
    // slip2go_confidence is already a decimal (0.0-1.0), no need to divide by 100
    score += checks.slip2go_confidence * VERIFICATION_WEIGHTS.SLIP2GO_CONFIDENCE;
    maxScore += VERIFICATION_WEIGHTS.SLIP2GO_CONFIDENCE;

    // Duplicate check (5% weight)
    if (checks.duplicate_check) score += VERIFICATION_WEIGHTS.DUPLICATE_CHECK;
    maxScore += VERIFICATION_WEIGHTS.DUPLICATE_CHECK;

    const finalScore = maxScore > 0 ? score / maxScore : 0;
    console.log('Confidence calculation:', {
      score,
      maxScore,
      finalScore,
      weights: VERIFICATION_WEIGHTS
    });

    return finalScore;
  }

  /**
   * Determine if slip should be auto-approved
   */
  shouldAutoApprove(verificationResult: {
    account_match: boolean;
    amount_match: boolean;
    name_match: boolean | null;
    verification_score: number;
  }, amount: number): boolean {
    // Check all required conditions
    const meetsBasicRequirements =
      verificationResult.account_match === AUTO_APPROVAL_RULES.REQUIRE_ACCOUNT_MATCH &&
      verificationResult.amount_match === AUTO_APPROVAL_RULES.REQUIRE_AMOUNT_MATCH;

    const meetsScoreRequirement =
      verificationResult.verification_score >= AUTO_APPROVAL_RULES.MIN_CONFIDENCE_SCORE;

    const meetsAmountRequirement =
      amount <= AUTO_APPROVAL_RULES.MAX_AUTO_APPROVE_AMOUNT;

    // Name requirement - allow mismatch if configured
    const meetsNameRequirement =
      AUTO_APPROVAL_RULES.ALLOW_NAME_MISMATCH ||
      verificationResult.name_match === true;

    console.log('Auto-approval requirements check:', {
      meetsBasicRequirements,
      meetsScoreRequirement,
      meetsAmountRequirement,
      meetsNameRequirement,
      finalDecision: meetsBasicRequirements && meetsScoreRequirement && meetsAmountRequirement && meetsNameRequirement
    });

    return meetsBasicRequirements &&
           meetsScoreRequirement &&
           meetsAmountRequirement &&
           meetsNameRequirement;
  }

  /**
   * Save slip record to database
   */
  async saveSlipRecord(slipRecordData: Omit<NewSlipRecord, 'id' | 'createdAt'>): Promise<string> {
    const [record] = await db
      .insert(slipRecords)
      .values({
        ...slipRecordData,
        createdAt: new Date()
      })
      .returning({ id: slipRecords.id });

    return record.id;
  }

  /**
   * Get verification statistics
   */
  async getVerificationStatistics(days: number = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    // This would need proper SQL aggregation queries
    // Implementation depends on your specific requirements
    return {
      total_verifications: 0,
      auto_approved: 0,
      manual_review: 0,
      rejected: 0,
      average_confidence_score: 0,
      auto_approval_rate: 0
    };
  }
}
