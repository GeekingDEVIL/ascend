-- Create tdee_estimates table for observed TDEE tracking
CREATE TABLE IF NOT EXISTS tdee_estimates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  date DATE NOT NULL,
  value INTEGER NOT NULL,
  confidence_low INTEGER,
  confidence_high INTEGER,
  adherence_pct INTEGER,
  method TEXT DEFAULT 'observed',
  window_days INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE tdee_estimates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own tdee_estimates"
ON tdee_estimates
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Phase field on user_goals for diet breaks and maintenance holds
ALTER TABLE user_goals ADD COLUMN IF NOT EXISTS phase TEXT DEFAULT 'active';
-- phase values: 'active' | 'maintenance' | 'diet_break' | 'surplus'

-- Adaptive mode flag for blended TDEE
ALTER TABLE user_goals ADD COLUMN IF NOT EXISTS adaptive_mode BOOLEAN DEFAULT false;

-- Cycle tracking for female users (§8.8)
ALTER TABLE user_goals ADD COLUMN IF NOT EXISTS cycle_tracking_enabled BOOLEAN DEFAULT false;

-- Exercise expenditure display on workout sessions
ALTER TABLE workout_sessions ADD COLUMN IF NOT EXISTS estimated_kcal INTEGER;
ALTER TABLE workout_sessions ADD COLUMN IF NOT EXISTS met_value NUMERIC;
