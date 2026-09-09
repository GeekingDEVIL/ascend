-- Phase 2.2: RPE rating per set
ALTER TABLE exercise_set_logs ADD COLUMN IF NOT EXISTS rpe SMALLINT CHECK (rpe >= 1 AND rpe <= 10);

-- Phase 2.4: Set type (working, warmup, drop, rest_pause) — replaces is_warmup boolean
ALTER TABLE exercise_set_logs ADD COLUMN IF NOT EXISTS set_type TEXT DEFAULT 'working';

-- Migrate existing is_warmup data
UPDATE exercise_set_logs SET set_type = 'warmup' WHERE is_warmup = true AND set_type = 'working';

-- Phase 2.3: Superset grouping
ALTER TABLE scheduled_exercises ADD COLUMN IF NOT EXISTS superset_group INTEGER;
ALTER TABLE workout_template_exercises ADD COLUMN IF NOT EXISTS superset_group INTEGER;
