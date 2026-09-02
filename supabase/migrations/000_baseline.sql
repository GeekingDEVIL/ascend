-- Baseline schema: captures all tables that existed before migration tracking began.
-- These tables were created manually in the Supabase dashboard.
-- Using IF NOT EXISTS so this is safe to run on an existing database.

-- ═══════════════════════════════════════════════════════════════
-- 1. Independent tables (no foreign keys to other app tables)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  goal TEXT,
  height_cm NUMERIC,
  target_weight NUMERIC,
  experience TEXT DEFAULT 'beginner',
  training_frequency INTEGER DEFAULT 5,
  date_of_birth DATE,
  unit_preference TEXT DEFAULT 'metric',
  workout_time_pref TEXT,
  injury_notes TEXT,
  social_instagram TEXT,
  social_twitter TEXT,
  profile_visibility TEXT DEFAULT 'public',
  avatar_color TEXT DEFAULT '#22d3ee',
  avatar_url TEXT,
  onboarding_completed_at TIMESTAMPTZ,
  gender TEXT,
  gym_type TEXT,
  equipment_access TEXT[],
  session_duration_pref TEXT,
  onboarding_step INTEGER NOT NULL DEFAULT 0,
  training_challenge TEXT,
  training_focus TEXT,
  sex TEXT,
  activity_level TEXT DEFAULT 'moderate',
  onboarding_completed BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  primary_muscle TEXT NOT NULL,
  equipment TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  body_segment TEXT,
  secondary_muscles TEXT[] DEFAULT '{}',
  movement_pattern TEXT,
  equipment_type TEXT,
  difficulty TEXT DEFAULT 'Intermediate',
  is_unilateral BOOLEAN DEFAULT false,
  instructions TEXT,
  tracking_method TEXT,
  image_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  is_approved BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  metadata JSONB DEFAULT '{}',
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_key TEXT NOT NULL,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL DEFAULT '',
  level INTEGER NOT NULL DEFAULT 1,
  total_xp INTEGER NOT NULL DEFAULT 0,
  rank_name TEXT NOT NULL DEFAULT 'INITIATE',
  total_workouts INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  total_volume NUMERIC NOT NULL DEFAULT 0,
  achievement_count INTEGER NOT NULL DEFAULT 0,
  best_streak INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  avatar_url TEXT,
  sex TEXT
);

CREATE TABLE IF NOT EXISTS body_weight_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weight NUMERIC NOT NULL,
  context TEXT NOT NULL DEFAULT 'manual',
  logged_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  entered_unit TEXT DEFAULT 'kg',
  date DATE,
  sex TEXT DEFAULT 'male'
);

CREATE TABLE IF NOT EXISTS weight_trend (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  raw_kg NUMERIC NOT NULL,
  ema_kg NUMERIC NOT NULL,
  sex TEXT DEFAULT 'male'
);

CREATE TABLE IF NOT EXISTS body_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  value_cm NUMERIC NOT NULL,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

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
  date_of_birth DATE,
  PRIMARY KEY (user_id, sex)
);

-- ═══════════════════════════════════════════════════════════════
-- 2. Tables with FK to exercises
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS target_lifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  target_weight NUMERIC NOT NULL,
  achieved BOOLEAN NOT NULL DEFAULT false,
  achieved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS favorite_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS exercise_leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,
  username TEXT,
  avatar_url TEXT,
  best_weight NUMERIC NOT NULL,
  best_reps INTEGER NOT NULL,
  best_e1rm NUMERIC NOT NULL,
  achieved_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sex TEXT
);

CREATE TABLE IF NOT EXISTS exercise_goals (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  goal_weight NUMERIC NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, exercise_id)
);

-- ═══════════════════════════════════════════════════════════════
-- 3. Schedule & template tables
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS scheduled_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  title TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  is_rest BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS scheduled_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheduled_day_id UUID NOT NULL REFERENCES scheduled_days(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 0,
  target_sets INTEGER DEFAULT 3,
  target_reps TEXT DEFAULT '8-10',
  created_at TIMESTAMPTZ DEFAULT now(),
  target_weight NUMERIC,
  rest_seconds INTEGER,
  notes TEXT,
  target_duration_minutes INTEGER,
  target_incline NUMERIC,
  target_speed NUMERIC
);

CREATE TABLE IF NOT EXISTS workout_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS workout_template_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES workout_templates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 0,
  target_sets INTEGER NOT NULL DEFAULT 3,
  target_reps TEXT NOT NULL DEFAULT '8-10',
  target_weight NUMERIC,
  rest_seconds INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  target_duration_minutes INTEGER,
  target_incline NUMERIC,
  target_speed NUMERIC
);

CREATE TABLE IF NOT EXISTS recurring_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weekday INTEGER NOT NULL CHECK (weekday >= 0 AND weekday <= 6),
  template_id UUID REFERENCES workout_templates(id) ON DELETE SET NULL,
  is_rest BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sex TEXT DEFAULT 'male'
);

-- ═══════════════════════════════════════════════════════════════
-- 4. Workout session tables (depend on scheduled_days, exercises)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scheduled_day_id UUID REFERENCES scheduled_days(id) ON DELETE SET NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  title TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  total_volume NUMERIC,
  total_sets INTEGER,
  xp_earned INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  estimated_kcal INTEGER,
  met_value NUMERIC,
  sex TEXT DEFAULT 'male'
);

CREATE TABLE IF NOT EXISTS exercise_set_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_session_id UUID NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  scheduled_exercise_id UUID REFERENCES scheduled_exercises(id) ON DELETE SET NULL,
  set_index INTEGER NOT NULL,
  weight NUMERIC,
  reps INTEGER,
  duration_seconds INTEGER,
  distance NUMERIC,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_warmup BOOLEAN DEFAULT false
);

-- ═══════════════════════════════════════════════════════════════
-- 5. RLS policies (enable on all tables)
-- ═══════════════════════════════════════════════════════════════

DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN
    SELECT unnest(ARRAY[
      'profiles','exercises','notifications','achievements','user_stats',
      'body_weight_logs','weight_trend','body_measurements','profile_body_stats',
      'target_lifts','favorite_exercises','exercise_leaderboard','exercise_goals',
      'scheduled_days','scheduled_exercises','workout_templates',
      'workout_template_exercises','recurring_plans','workout_sessions',
      'exercise_set_logs'
    ])
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
  END LOOP;
END $$;

-- Basic user-isolation RLS (users can only see their own rows)
-- exercises table has a special policy: users see all approved + their own custom

DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN
    SELECT unnest(ARRAY[
      'profiles','notifications','achievements','user_stats',
      'body_weight_logs','weight_trend','body_measurements','profile_body_stats',
      'target_lifts','favorite_exercises','exercise_leaderboard','exercise_goals',
      'scheduled_days','scheduled_exercises','workout_templates',
      'workout_template_exercises','recurring_plans','workout_sessions',
      'exercise_set_logs'
    ])
  LOOP
    EXECUTE format(
      'CREATE POLICY IF NOT EXISTS "Users can view own %1$s" ON %1$I FOR SELECT USING (user_id = auth.uid())',
      t
    );
    EXECUTE format(
      'CREATE POLICY IF NOT EXISTS "Users can insert own %1$s" ON %1$I FOR INSERT WITH CHECK (user_id = auth.uid())',
      t
    );
    EXECUTE format(
      'CREATE POLICY IF NOT EXISTS "Users can update own %1$s" ON %1$I FOR UPDATE USING (user_id = auth.uid())',
      t
    );
    EXECUTE format(
      'CREATE POLICY IF NOT EXISTS "Users can delete own %1$s" ON %1$I FOR DELETE USING (user_id = auth.uid())',
      t
    );
  END LOOP;
END $$;

-- profiles uses id instead of user_id
DROP POLICY IF EXISTS "Users can view own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profiles" ON profiles;
CREATE POLICY "Users can view own profiles" ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can insert own profiles" ON profiles FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "Users can update own profiles" ON profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Users can delete own profiles" ON profiles FOR DELETE USING (id = auth.uid());

-- exercises: all users see approved exercises + their own custom ones
DROP POLICY IF EXISTS "Users can view own exercises" ON exercises;
DROP POLICY IF EXISTS "Users can insert own exercises" ON exercises;
DROP POLICY IF EXISTS "Users can update own exercises" ON exercises;
DROP POLICY IF EXISTS "Users can delete own exercises" ON exercises;
CREATE POLICY "Users can view exercises" ON exercises FOR SELECT USING (is_approved = true OR created_by = auth.uid());
CREATE POLICY "Users can insert own exercises" ON exercises FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY "Users can update own exercises" ON exercises FOR UPDATE USING (created_by = auth.uid());
CREATE POLICY "Users can delete own exercises" ON exercises FOR DELETE USING (created_by = auth.uid());

-- exercise_leaderboard: all users can read for rankings
DROP POLICY IF EXISTS "Users can view own exercise_leaderboard" ON exercise_leaderboard;
CREATE POLICY "Users can view all leaderboard" ON exercise_leaderboard FOR SELECT USING (true);

-- user_stats: all users can read for rankings
DROP POLICY IF EXISTS "Users can view own user_stats" ON user_stats;
CREATE POLICY "Users can view all user_stats" ON user_stats FOR SELECT USING (true);
