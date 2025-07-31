-- Migration: Remove Device Tracking Fields from Users Table
-- Date: 2025-07-31
-- Description: Remove deviceHistory, ipHistory, and loginPatterns fields from users table
-- These fields are now handled by userSessions and userActivityLogs tables

-- Remove the JSONB columns that are no longer needed
ALTER TABLE users DROP COLUMN IF EXISTS device_history;
ALTER TABLE users DROP COLUMN IF EXISTS ip_history;
ALTER TABLE users DROP COLUMN IF EXISTS login_patterns;

-- Keep the basic tracking fields
-- last_login_ip and last_device_fingerprint are still useful for quick access

-- Add comments for remaining fields
COMMENT ON COLUMN users.last_login_ip IS 'Last IP address used for login (for quick access)';
COMMENT ON COLUMN users.last_device_fingerprint IS 'Fingerprint of last used device (for quick access)';

-- Create indexes for better performance on remaining tracking fields
CREATE INDEX IF NOT EXISTS idx_users_last_login_ip ON users(last_login_ip);
CREATE INDEX IF NOT EXISTS idx_users_last_device_fingerprint ON users(last_device_fingerprint);

-- Ensure userSessions table has proper indexes for device tracking queries
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id_created_at ON user_sessions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id_ip ON user_sessions(user_id, ip_address);
CREATE INDEX IF NOT EXISTS idx_user_sessions_device_info ON user_sessions USING GIN(device_info);

-- Ensure userActivityLogs has proper indexes for login pattern queries
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_login ON user_activity_logs(user_id, activity_type, created_at DESC) 
WHERE activity_type = 'login';
