-- Habits mega-upgrade: flexible scheduling, negative habits, prestige, skips, contracts, milestones, loot

-- Extend habits table
ALTER TABLE habits ADD COLUMN IF NOT EXISTS is_negative BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE habits ADD COLUMN IF NOT EXISTS prestige_level INTEGER NOT NULL DEFAULT 0;
ALTER TABLE habits ADD COLUMN IF NOT EXISTS frequency_per_week INTEGER DEFAULT NULL;
ALTER TABLE habits ADD COLUMN IF NOT EXISTS best_streak INTEGER NOT NULL DEFAULT 0;
ALTER TABLE habits ADD COLUMN IF NOT EXISTS total_completions INTEGER NOT NULL DEFAULT 0;

-- Update frequency check to include x_per_week
ALTER TABLE habits DROP CONSTRAINT IF EXISTS habits_frequency_check;
ALTER TABLE habits ADD CONSTRAINT habits_frequency_check
  CHECK (frequency IN ('daily', 'weekdays', 'weekends', 'custom', 'x_per_week'));

-- Add note field to completions for habit journal
ALTER TABLE habit_completions ADD COLUMN IF NOT EXISTS note TEXT DEFAULT NULL;

-- Habit skips (excused absences that preserve momentum)
CREATE TABLE IF NOT EXISTS habit_skips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skip_date DATE NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('sick', 'travel', 'rest_day', 'injury', 'other')),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(habit_id, skip_date)
);

CREATE INDEX IF NOT EXISTS idx_habit_skips_user ON habit_skips(user_id, skip_date DESC);

ALTER TABLE habit_skips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own habit skips"
  ON habit_skips FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Habit contracts (21-day or 66-day challenges)
CREATE TABLE IF NOT EXISTS habit_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  duration_days INTEGER NOT NULL CHECK (duration_days IN (21, 66)),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed')),
  xp_reward INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_habit_contracts_user ON habit_contracts(user_id, status);

ALTER TABLE habit_contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own habit contracts"
  ON habit_contracts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Habit milestones achieved
CREATE TABLE IF NOT EXISTS habit_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone_days INTEGER NOT NULL,
  xp_awarded INTEGER NOT NULL DEFAULT 0,
  achieved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(habit_id, milestone_days)
);

CREATE INDEX IF NOT EXISTS idx_habit_milestones_user ON habit_milestones(user_id);

ALTER TABLE habit_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own habit milestones"
  ON habit_milestones FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Habit loot inventory (streak freezes, double XP, etc.)
CREATE TABLE IF NOT EXISTS habit_loot (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  loot_type TEXT NOT NULL CHECK (loot_type IN ('streak_freeze', 'double_xp', 'momentum_boost', 'bonus_xp')),
  quantity INTEGER NOT NULL DEFAULT 1,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_habit_loot_user ON habit_loot(user_id, loot_type);

ALTER TABLE habit_loot ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own habit loot"
  ON habit_loot FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
