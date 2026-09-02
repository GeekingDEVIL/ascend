-- User module selections: tracks which optional modules each user has enabled.
-- Core modules (gym, progress, xp) are always on and don't need rows here.

CREATE TABLE IF NOT EXISTS user_modules (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_key TEXT NOT NULL,
  enabled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, module_key)
);

ALTER TABLE user_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own user_modules"
  ON user_modules FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own user_modules"
  ON user_modules FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own user_modules"
  ON user_modules FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own user_modules"
  ON user_modules FOR DELETE USING (user_id = auth.uid());

CREATE INDEX idx_user_modules_user ON user_modules (user_id);
