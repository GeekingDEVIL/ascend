-- Enrich tdee_estimates with confidence, adherence, and method columns
ALTER TABLE tdee_estimates ADD COLUMN IF NOT EXISTS confidence_low INTEGER;
ALTER TABLE tdee_estimates ADD COLUMN IF NOT EXISTS confidence_high INTEGER;
ALTER TABLE tdee_estimates ADD COLUMN IF NOT EXISTS adherence_pct INTEGER;
ALTER TABLE tdee_estimates ADD COLUMN IF NOT EXISTS method TEXT DEFAULT 'observed';
ALTER TABLE tdee_estimates ADD COLUMN IF NOT EXISTS window_days INTEGER;

-- Phase field on user_goals for diet breaks and maintenance holds
ALTER TABLE user_goals ADD COLUMN IF NOT EXISTS phase TEXT DEFAULT 'active';
-- phase values: 'active' | 'maintenance' | 'diet_break' | 'surplus'

-- Cycle tracking for female users (§8.8)
ALTER TABLE user_goals ADD COLUMN IF NOT EXISTS cycle_tracking_enabled BOOLEAN DEFAULT false;

-- Exercise expenditure display on workout sessions
ALTER TABLE workout_sessions ADD COLUMN IF NOT EXISTS estimated_kcal INTEGER;
ALTER TABLE workout_sessions ADD COLUMN IF NOT EXISTS met_value NUMERIC;
