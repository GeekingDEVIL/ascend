-- Add sex column to notifications so they don't bleed across male/female mode
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS sex TEXT NOT NULL DEFAULT 'male';

-- Backfill: tag existing notifications based on the session sex if we can infer it
-- from the metadata, otherwise leave as 'male' (the historical default)
CREATE INDEX IF NOT EXISTS idx_notifications_user_sex ON notifications(user_id, sex);
