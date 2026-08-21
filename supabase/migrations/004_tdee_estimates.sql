-- Step 6: TDEE estimates for adaptive mode

CREATE TABLE IF NOT EXISTS tdee_estimates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  days INTEGER NOT NULL,
  avg_daily_intake INTEGER NOT NULL,
  weight_change_kg NUMERIC NOT NULL,
  observed_tdee INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE tdee_estimates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own TDEE estimates"
  ON tdee_estimates FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_tdee_estimates_user ON tdee_estimates (user_id, created_at DESC);

-- Add adaptive mode flag to user_goals
ALTER TABLE user_goals ADD COLUMN IF NOT EXISTS adaptive_mode BOOLEAN DEFAULT false;
