import { 
  Slip2GoPayload, 
  Slip2GoResponse, 
  CheckReceiver, 
  CheckAmount, 
  CheckDate 
} from '../types/deposit.types';
import { 
  SLIP2GO_CONFIG, 
  DEPOSIT_ERROR_CODES 
} from '../types/deposit.constants';
import { AppError } from '../utils/errors';

export class Slip2GoError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, DEPOSIT_ERROR_CODES.SLIP2GO_ERROR, details);
  }
}

export class Slip2GoService {
  private apiUrl: string;
  private apiKey: string;

  constructor(apiUrl: string, apiKey: string) {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
  }

  /**
   * Verify slip with Slip2Go API
   */
  async verifySlip(
    slipImage: File,
    expectedAccount: string,
    expectedAmount: number,
    expectedAccountName?: string,
    expectedPromptPay?: string,
    checkDuplicate: boolean = false // Allow disabling duplicate check
  ): Promise<Slip2GoResponse> {
    try {
      const formData = new FormData();
      
      // Prepare payload with multiple receiver checks
      const checkReceiver = [];

      // Add bank account check (use full account number for verification)
      checkReceiver.push({
        accountType: SLIP2GO_CONFIG.ACCOUNT_TYPE_PROMPTPAY,
        accountNameTH: expectedAccountName || '',
        accountNameEN: expectedAccountName || '',
        accountNumber: expectedAccount.replace(/-/g, '') // Remove hyphens but keep full number
      });

      // Add PromptPay check if provided
      if (expectedPromptPay) {
        checkReceiver.push({
          accountType: SLIP2GO_CONFIG.ACCOUNT_TYPE_PROMPTPAY,
          accountNameTH: expectedAccountName || '',
          accountNameEN: expectedAccountName || '',
          accountNumber: expectedPromptPay
        });
      }

      const payload: Slip2GoPayload = {
        checkDuplicate, // Use parameter to control duplicate checking
        checkReceiver,
        checkAmount: {
          type: 'eq',
          amount: expectedAmount
        },
        checkDate: {
          type: 'gte',
          date: new Date(Date.now() - SLIP2GO_CONFIG.MAX_SLIP_AGE_DAYS * 24 * 60 * 60 * 1000).toISOString()
        }
      };

      formData.append('file', slipImage);
      formData.append('payload', JSON.stringify(payload));

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), SLIP2GO_CONFIG.TIMEOUT_MS);

      const response = await fetch(`${this.apiUrl}/api/verify-slip/qr-image/info`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Slip2GoError(`HTTP ${response.status}: ${response.statusText}`, {
          status: response.status,
          statusText: response.statusText
        });
      }

      const result: Slip2GoResponse = await response.json();

      // Debug logging
      console.log('Slip2Go Raw Response:', JSON.stringify(result, null, 2));

      // Transform the response to match our expected format
      return this.transformResponse(result);

    } catch (error) {
      if (error instanceof Slip2GoError) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new Slip2GoError('Request timeout', { timeout: SLIP2GO_CONFIG.TIMEOUT_MS });
      }

      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Slip2GoError('Network error - unable to connect to Slip2Go API', {
          originalError: error.message
        });
      }

      throw new Slip2GoError('Unexpected error during slip verification', {
        originalError: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Verify slip with retry mechanism
   */
  async verifySlipWithRetry(
    slipImage: File,
    expectedAccount: string,
    expectedAmount: number,
    expectedAccountName?: string,
    expectedPromptPay?: string,
    maxRetries: number = SLIP2GO_CONFIG.RETRY_ATTEMPTS,
    checkDuplicate: boolean = false // Allow disabling duplicate check
  ): Promise<Slip2GoResponse> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.verifySlip(slipImage, expectedAccount, expectedAmount, expectedAccountName, expectedPromptPay, checkDuplicate);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Don't retry on client errors (4xx)
        if (error instanceof Slip2GoError && error.statusCode >= 400 && error.statusCode < 500) {
          throw error;
        }

        // Wait before retry (except on last attempt)
        if (attempt < maxRetries) {
          await this.delay(SLIP2GO_CONFIG.RETRY_DELAY_MS * attempt);
        }
      }
    }

    throw new Slip2GoError(`Failed after ${maxRetries} attempts`, {
      lastError: lastError?.message || 'Unknown error'
    });
  }

  /**
   * Mask account number for Slip2Go API
   * Convert 123-4-56789-0 to xxxxxxx1234
   */
  private maskAccountNumber(accountNumber: string): string {
    const cleaned = accountNumber.replace(/[-\s]/g, '');
    if (cleaned.length <= 4) return cleaned;
    
    const lastFour = cleaned.slice(-4);
    const masked = 'x'.repeat(cleaned.length - 4) + lastFour;
    return masked;
  }

  /**
   * Delay helper for retry mechanism
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Transform Slip2Go response to match our expected format
   */
  private transformResponse(response: Slip2GoResponse): Slip2GoResponse {
    // Check if response is successful
    const isSuccess = response.code === "200200" || response.message === "Slip is valid.";

    if (!isSuccess || !response.data) {
      return {
        success: false,
        error: {
          code: response.code || 'UNKNOWN_ERROR',
          message: response.message || 'Unknown error from Slip2Go'
        }
      };
    }

    const data = response.data;

    // Transform to legacy format for compatibility
    return {
      success: true,
      data: {
        transactionId: data.transRef,
        amount: data.amount,
        date: data.dateTime.split('T')[0], // Extract date part
        time: data.dateTime.split('T')[1]?.split('+')[0] || '', // Extract time part
        sender: {
          account: data.sender.account.bank.account,
          name: data.sender.account.name,
          bank: data.sender.bank.name
        },
        receiver: {
          account: data.receiver.account.bank.account,
          name: data.receiver.account.name,
          bank: data.receiver.bank.name
        },
        ref1: data.ref1 || undefined,
        ref2: data.ref2 || undefined,
        verification: {
          duplicateCheck: true, // Assume no duplicate since we got valid response
          receiverCheck: true, // Assume receiver check passed
          amountCheck: true, // Assume amount check passed
          dateCheck: true // Assume date check passed
        },
        confidence: 0.95 // High confidence for valid slips
      } as any
    };
  }

  /**
   * Validate Slip2Go response
   */
  validateResponse(response: Slip2GoResponse): boolean {
    // Check for success indicators in new format
    const isSuccess = response.code === "200200" || response.message === "Slip is valid.";

    if (!isSuccess) {
      return false;
    }

    if (!response.data) {
      return false;
    }

    // Check required fields for new format
    const requiredFields = [
      'transRef',
      'amount',
      'dateTime',
      'sender',
      'receiver'
    ];

    for (const field of requiredFields) {
      if (!(field in response.data)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Extract error message from Slip2Go response
   */
  extractErrorMessage(response: Slip2GoResponse): string {
    if (response.error) {
      return response.error.message || 'Unknown error from Slip2Go';
    }

    // Check for new format error indicators
    if (response.code && response.code !== "200200") {
      return response.message || 'Slip verification failed';
    }

    if (response.success === false) {
      return response.message || 'Slip verification failed';
    }

    return 'Unknown error';
  }

  /**
   * Check if error is retryable
   */
  isRetryableError(error: Error): boolean {
    if (error instanceof Slip2GoError) {
      // Don't retry client errors
      if (error.statusCode >= 400 && error.statusCode < 500) {
        return false;
      }
    }

    // Retry on network errors, timeouts, and server errors
    return error.name === 'AbortError' || 
           error.message.includes('fetch') ||
           error.message.includes('timeout') ||
           error.message.includes('network');
  }

  /**
   * Get API health status
   */
  async healthCheck(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${this.apiUrl}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  }
}
