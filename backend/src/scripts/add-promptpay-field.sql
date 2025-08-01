-- Add PromptPay number field to store_bank_accounts table
-- Run this SQL in pgweb or your database client

ALTER TABLE store_bank_accounts 
ADD COLUMN promptpay_number VARCHAR(20);

-- Add comment for documentation
COMMENT ON COLUMN store_bank_accounts.promptpay_number IS 'PromptPay number for receiving payments (optional)';

-- Update existing account with PromptPay number if needed
-- Example: UPDATE store_bank_accounts SET promptpay_number = '0398099915' WHERE account_number = '0398099915';
