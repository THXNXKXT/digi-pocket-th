import { db } from '../db';
import { slipRecords } from '../db/schemas/deposit';
import { 
  SlipVerificationResult,
  DepositRequest,
  StoreBankAccount,
  NewSlipRecord
} from '../types/deposit.types';

/**
 * Mock Slip Verification Service for Development
 * Always returns successful verification
 */
export class MockSlipVerificationService {
  constructor() {
    console.log('🚧 Using Mock Slip Verification Service for Development');
  }

  /**
   * Mock slip verification - always succeeds
   */
  async verifySlipWithSlip2Go(
    slipImage: File,
    depositRequest: DepositRequest,
    storeAccount: StoreBankAccount
  ): Promise<SlipVerificationResult> {
    console.log('🔍 Mock verifying slip for deposit request:', depositRequest.id);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate mock transaction ID
    const mockTransactionId = `MOCK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      success: true,
      confidence_score: 95,
      slip_data: {
        transaction_id: mockTransactionId,
        amount: parseFloat(depositRequest.amount),
        transfer_date: new Date().toISOString(),
        sender_account: '1234567890',
        sender_name: 'Mock Sender',
        sender_bank: 'Mock Bank',
        receiver_account: storeAccount.accountNumber,
        receiver_name: storeAccount.accountName,
        receiver_bank: storeAccount.bankName,
        ref1: 'MOCK_REF1',
        ref2: 'MOCK_REF2'
      },
      verification_result: {
        account_match: true,
        amount_match: true,
        name_match: true,
        verification_score: 0.95
      },
      verification_data: {
        amount_match: true,
        account_match: true,
        date_valid: true,
        duplicate_check: false,
        confidence_details: {
          amount_confidence: 100,
          account_confidence: 100,
          date_confidence: 100
        }
      },
      raw_response: {
        success: true,
        message: 'Mock verification successful',
        data: {
          transactionId: mockTransactionId,
          amount: depositRequest.amount,
          verified: true
        }
      }
    };
  }

  /**
   * Save slip record to database
   */
  async saveSlipRecord(slipData: any): Promise<string> {
    const recordId = crypto.randomUUID();

    const [record] = await db
      .insert(slipRecords)
      .values({
        id: recordId,
        depositRequestId: slipData.depositRequestId,
        userId: slipData.userId,
        transactionId: slipData.transactionId,
        amount: slipData.amount,
        transferDate: new Date(slipData.transferDate),
        senderAccount: slipData.senderAccount || 'mock_sender',
        senderName: slipData.senderName || 'Mock Sender',
        senderBank: slipData.senderBank || 'Mock Bank',
        receiverAccount: slipData.receiverAccount,
        receiverName: slipData.receiverName,
        receiverBank: slipData.receiverBank || 'Mock Bank',
        ref1: slipData.ref1 || 'MOCK_REF1',
        ref2: slipData.ref2 || 'MOCK_REF2',
        accountMatch: slipData.accountMatch !== undefined ? slipData.accountMatch : true,
        amountMatch: slipData.amountMatch !== undefined ? slipData.amountMatch : true,
        nameMatch: slipData.nameMatch !== undefined ? slipData.nameMatch : true,
        verificationScore: slipData.verificationScore || '95',
        verificationData: slipData.verificationData || {},
        status: slipData.status || 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning({ id: slipRecords.id });

    return record.id;
  }

  /**
   * Check for duplicate slips
   */
  async checkDuplicateSlip(transactionId: string): Promise<boolean> {
    // Mock: no duplicates in development
    return false;
  }

  /**
   * Mock auto-approval check - always approve in development
   */
  shouldAutoApprove(verificationData: any, amount: number): boolean {
    console.log('🤖 Mock auto-approval: Always approve in development');
    return true;
  }
}
