-- Move date_of_birth into profile_body_stats so it's sex-isolated
ALTER TABLE profile_body_stats ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- Seed from existing profiles data
UPDATE profile_body_stats pbs
SET date_of_birth = p.date_of_birth
FROM profiles p
WHERE pbs.user_id = p.id
  AND p.date_of_birth IS NOT NULL
  AND pbs.date_of_birth IS NULL;
