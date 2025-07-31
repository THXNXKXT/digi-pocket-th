-- Migration: Add Device Tracking Fields to Users Table
-- Date: 2024-01-31
-- Description: Add fields for tracking IP addresses, devices, and login patterns

-- Add new columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_ip VARCHAR(45);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_device_fingerprint VARCHAR(32);
ALTER TABLE users ADD COLUMN IF NOT EXISTS device_history JSONB DEFAULT '[]';
ALTER TABLE users ADD COLUMN IF NOT EXISTS ip_history JSONB DEFAULT '[]';
ALTER TABLE users ADD COLUMN IF NOT EXISTS login_patterns JSONB DEFAULT '{}';

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_last_login_ip ON users(last_login_ip);
CREATE INDEX IF NOT EXISTS idx_users_device_fingerprint ON users(last_device_fingerprint);

-- Add indexes on activity logs for device tracking queries
CREATE INDEX IF NOT EXISTS idx_activity_logs_ip_address ON user_activity_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_agent ON user_activity_logs USING gin(to_tsvector('english', user_agent));
CREATE INDEX IF NOT EXISTS idx_activity_logs_metadata ON user_activity_logs USING gin(metadata);

-- Comments for documentation
COMMENT ON COLUMN users.last_login_ip IS 'Last IP address used for login';
COMMENT ON COLUMN users.last_device_fingerprint IS 'Fingerprint of last used device';
COMMENT ON COLUMN users.device_history IS 'Array of known devices with fingerprints and metadata';
COMMENT ON COLUMN users.ip_history IS 'Array of recent IP addresses with timestamps';
COMMENT ON COLUMN users.login_patterns IS 'JSON object storing login behavior patterns';
