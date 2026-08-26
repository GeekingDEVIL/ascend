-- Sex-based isolation for body stats, nutrition, and goals
-- Extends migration 009 which isolated workout data

-- 1. body_weight_logs: separate weight tracking per mode
ALTER TABLE body_weight_logs ADD COLUMN IF NOT EXISTS sex TEXT DEFAULT 'male';
UPDATE body_weight_logs SET sex = 'male' WHERE sex IS NULL;

-- 2. weight_trend: separate trend per mode
ALTER TABLE weight_trend ADD COLUMN IF NOT EXISTS sex TEXT DEFAULT 'male';
UPDATE weight_trend SET sex = 'male' WHERE sex IS NULL;

-- 3. user_goals: separate goals per mode
ALTER TABLE user_goals ADD COLUMN IF NOT EXISTS sex TEXT DEFAULT 'male';
UPDATE user_goals SET sex = 'male' WHERE sex IS NULL;

-- 4. food_entries: separate food diary per mode
ALTER TABLE food_entries ADD COLUMN IF NOT EXISTS sex TEXT DEFAULT 'male';
UPDATE food_entries SET sex = 'male' WHERE sex IS NULL;

-- 5. daily_intake: separate intake totals per mode
ALTER TABLE daily_intake ADD COLUMN IF NOT EXISTS sex TEXT DEFAULT 'male';
UPDATE daily_intake SET sex = 'male' WHERE sex IS NULL;
-- Update unique constraint to include sex
ALTER TABLE daily_intake DROP CONSTRAINT IF EXISTS daily_intake_user_id_date_key;
ALTER TABLE daily_intake ADD CONSTRAINT daily_intake_user_date_sex_key UNIQUE (user_id, date, sex);

-- 6. tdee_estimates: separate TDEE tracking per mode
ALTER TABLE tdee_estimates ADD COLUMN IF NOT EXISTS sex TEXT DEFAULT 'male';
UPDATE tdee_estimates SET sex = 'male' WHERE sex IS NULL;

-- 7. profile_body_stats: sex-specific body stats (height, activity, etc.)
CREATE TABLE IF NOT EXISTS profile_body_stats (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sex TEXT NOT NULL DEFAULT 'male',
  height_cm NUMERIC,
  activity_level TEXT DEFAULT 'moderate',
  goal TEXT,
  experience TEXT DEFAULT 'beginner',
  training_frequency INTEGER DEFAULT 5,
  workout_time_pref TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, sex)
);

ALTER TABLE profile_body_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own profile_body_stats"
  ON profile_body_stats FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Seed profile_body_stats from existing profiles data (as male)
INSERT INTO profile_body_stats (user_id, sex, height_cm, activity_level, goal, experience, training_frequency, workout_time_pref)
SELECT id, 'male', height_cm, activity_level, goal, experience, training_frequency, workout_time_pref
FROM profiles
WHERE id IS NOT NULL
ON CONFLICT (user_id, sex) DO NOTHING;
