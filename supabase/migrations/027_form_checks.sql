-- Form Check history: stores analysis results (no video)
CREATE TABLE IF NOT EXISTS form_checks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    exercise_name TEXT NOT NULL,
    exercise_type TEXT NOT NULL DEFAULT 'general',
    overall_score SMALLINT NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
    duration_s SMALLINT NOT NULL,
    frame_count INT NOT NULL,
    rep_count SMALLINT DEFAULT 0,
    depth_angle SMALLINT,
    depth_passed BOOLEAN,
    symmetry_diff SMALLINT,
    symmetry_passed BOOLEAN,
    knee_cave_detected BOOLEAN,
    knee_cave_side TEXT,
    reps JSONB,
    tips TEXT[],
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE form_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own form checks"
    ON form_checks FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own form checks"
    ON form_checks FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_form_checks_user ON form_checks(user_id, created_at DESC);
