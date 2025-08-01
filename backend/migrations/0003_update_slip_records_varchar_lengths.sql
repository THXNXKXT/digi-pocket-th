-- Migration: Update slip_records table varchar lengths
-- Date: 2025-08-01
-- Description: Increase varchar lengths for bank names and account numbers to accommodate full Thai bank names and masked account numbers

-- Increase sender_account length from 20 to 50
ALTER TABLE slip_records 
ALTER COLUMN sender_account TYPE varchar(50);

-- Increase sender_bank length from 10 to 100  
ALTER TABLE slip_records 
ALTER COLUMN sender_bank TYPE varchar(100);

-- Increase receiver_account length from 20 to 50
ALTER TABLE slip_records 
ALTER COLUMN receiver_account TYPE varchar(50);

-- Increase receiver_bank length from 10 to 100
ALTER TABLE slip_records 
ALTER COLUMN receiver_bank TYPE varchar(100);
