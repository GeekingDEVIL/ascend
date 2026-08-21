-- Step 1: Create user_goals table
CREATE TABLE IF NOT EXISTS user_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  goal_type TEXT NOT NULL,

  target_weight_kg NUMERIC,
  target_date DATE,
  rate_per_week_kg NUMERIC,
  target_body_fat_pct NUMERIC,

  workouts_per_week INTEGER DEFAULT 4,
  session_length_minutes INTEGER DEFAULT 60,
  preferred_days TEXT[],
  available_equipment TEXT[],

  calorie_target_override INTEGER,
  protein_target_g INTEGER,
  diet_preference TEXT,

  preferred_weight_unit TEXT DEFAULT 'kg',
  preferred_height_unit TEXT DEFAULT 'cm',

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own goals"
  ON user_goals FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE UNIQUE INDEX IF NOT EXISTS one_active_goal_per_user
  ON user_goals (user_id) WHERE is_active = true;

-- Add columns to profiles if missing
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS height_cm NUMERIC;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sex TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS activity_level TEXT DEFAULT 'moderate';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
