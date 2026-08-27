-- Add hormonal BC flag to profiles for contraception mode
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hormonal_bc BOOLEAN DEFAULT false;

-- Add cycle phase tagging to workout sessions
ALTER TABLE workout_sessions ADD COLUMN IF NOT EXISTS cycle_phase TEXT;
ALTER TABLE workout_sessions ADD COLUMN IF NOT EXISTS cycle_day INTEGER;
