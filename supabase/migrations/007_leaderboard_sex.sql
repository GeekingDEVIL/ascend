-- Add sex column to user_stats for gender-filtered leaderboards
ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS sex TEXT;

-- Add sex column to exercise_leaderboard for per-exercise gender rankings
ALTER TABLE exercise_leaderboard ADD COLUMN IF NOT EXISTS sex TEXT;

-- Backfill sex from profiles
UPDATE user_stats SET sex = profiles.sex
FROM profiles WHERE user_stats.user_id = profiles.id AND user_stats.sex IS NULL;

UPDATE exercise_leaderboard SET sex = profiles.sex
FROM profiles WHERE exercise_leaderboard.user_id = profiles.id AND exercise_leaderboard.sex IS NULL;
