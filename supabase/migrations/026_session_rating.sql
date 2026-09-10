-- Phase 4.4: Session rating (1-5 emoji scale)
ALTER TABLE workout_sessions ADD COLUMN IF NOT EXISTS rating SMALLINT CHECK (rating >= 1 AND rating <= 5);

-- Phase 4.2: Index for 1RM trend queries
CREATE INDEX IF NOT EXISTS idx_set_logs_user_exercise ON exercise_set_logs(user_id, exercise_id);
