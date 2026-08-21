-- Step 9: Saved foods for quick re-logging

CREATE TABLE IF NOT EXISTS my_foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  label TEXT NOT NULL,
  kcal INTEGER NOT NULL,
  protein_g NUMERIC DEFAULT 0,
  carbs_g NUMERIC DEFAULT 0,
  fat_g NUMERIC DEFAULT 0,
  use_count INTEGER DEFAULT 1,
  last_used_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE my_foods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own saved foods"
  ON my_foods FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_my_foods_user ON my_foods (user_id, use_count DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_my_foods_user_label ON my_foods (user_id, lower(label));
