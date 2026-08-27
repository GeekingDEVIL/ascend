ALTER TABLE exercise_set_logs ADD COLUMN IF NOT EXISTS is_warmup BOOLEAN DEFAULT false;
