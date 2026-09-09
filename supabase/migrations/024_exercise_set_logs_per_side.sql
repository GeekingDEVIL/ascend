-- Add is_per_side flag for dumbbell/cable dual-weight logging
ALTER TABLE exercise_set_logs ADD COLUMN IF NOT EXISTS is_per_side BOOLEAN DEFAULT false;
