-- Step 1: Extend body_weight_logs with entered_unit and date
ALTER TABLE body_weight_logs ADD COLUMN IF NOT EXISTS entered_unit TEXT DEFAULT 'kg';
ALTER TABLE body_weight_logs ADD COLUMN IF NOT EXISTS date DATE;

-- Backfill date from logged_at for existing rows
UPDATE body_weight_logs SET date = (logged_at AT TIME ZONE 'UTC')::date WHERE date IS NULL;

-- Make context default to 'manual' if missing
ALTER TABLE body_weight_logs ALTER COLUMN context SET DEFAULT 'manual';

-- Step 2: Create weight_trend (materialized EMA, morning entries only)
CREATE TABLE IF NOT EXISTS weight_trend (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  raw_kg NUMERIC NOT NULL,
  ema_kg NUMERIC NOT NULL,
  UNIQUE(user_id, date)
);

ALTER TABLE weight_trend ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own weight trend"
  ON weight_trend FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_weight_trend_user_date ON weight_trend (user_id, date);
CREATE INDEX IF NOT EXISTS idx_body_weight_logs_user_context ON body_weight_logs (user_id, context, logged_at);
