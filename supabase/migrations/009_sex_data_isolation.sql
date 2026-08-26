-- Sex-based data isolation: each mode gets its own workout data

-- 1. workout_sessions: tag sessions with sex
ALTER TABLE workout_sessions ADD COLUMN IF NOT EXISTS sex TEXT DEFAULT 'male';
UPDATE workout_sessions SET sex = 'male' WHERE sex IS NULL;

-- 2. recurring_plans: separate schedules per mode
ALTER TABLE recurring_plans ADD COLUMN IF NOT EXISTS sex TEXT DEFAULT 'male';
UPDATE recurring_plans SET sex = 'male' WHERE sex IS NULL;

-- 3. user_stats: allow one row per user per sex
--    Drop old unique and create new composite unique
ALTER TABLE user_stats DROP CONSTRAINT IF EXISTS user_stats_user_id_key;
ALTER TABLE user_stats DROP CONSTRAINT IF EXISTS user_stats_pkey;
-- Add an id column if not present as primary key
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_stats' AND column_name = 'id'
  ) THEN
    ALTER TABLE user_stats ADD COLUMN id UUID DEFAULT gen_random_uuid() PRIMARY KEY;
  END IF;
END $$;
ALTER TABLE user_stats ADD CONSTRAINT user_stats_user_id_sex_key UNIQUE (user_id, sex);

-- 4. exercise_leaderboard: separate PRs per sex
ALTER TABLE exercise_leaderboard DROP CONSTRAINT IF EXISTS exercise_leaderboard_user_id_exercise_id_key;
ALTER TABLE exercise_leaderboard DROP CONSTRAINT IF EXISTS exercise_leaderboard_pkey;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'exercise_leaderboard' AND column_name = 'id'
  ) THEN
    ALTER TABLE exercise_leaderboard ADD COLUMN id UUID DEFAULT gen_random_uuid() PRIMARY KEY;
  END IF;
END $$;
ALTER TABLE exercise_leaderboard ADD CONSTRAINT exercise_leaderboard_user_exercise_sex_key UNIQUE (user_id, exercise_id, sex);

-- 5. recurring_plans: separate plans per sex
ALTER TABLE recurring_plans DROP CONSTRAINT IF EXISTS recurring_plans_user_id_weekday_key;
ALTER TABLE recurring_plans ADD CONSTRAINT recurring_plans_user_weekday_sex_key UNIQUE (user_id, weekday, sex);
