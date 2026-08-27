-- Add columns for custom exercise support
ALTER TABLE exercises ADD COLUMN created_by UUID REFERENCES auth.users(id);
ALTER TABLE exercises ADD COLUMN is_approved BOOLEAN DEFAULT true;

-- Drop the old permissive SELECT policy
DROP POLICY IF EXISTS "Anyone can view exercises" ON exercises;

-- Users can see system exercises (created_by IS NULL) and their own custom exercises
CREATE POLICY "Users can view exercises"
  ON exercises FOR SELECT
  USING (created_by IS NULL OR created_by = auth.uid());

-- Users can insert exercises they own
CREATE POLICY "Users can create custom exercises"
  ON exercises FOR INSERT
  WITH CHECK (created_by = auth.uid());
