-- Cycle period logs: each row = one period start
CREATE TABLE IF NOT EXISTS cycle_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE,
  flow_level TEXT DEFAULT 'medium',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, period_start)
);

-- Daily symptom tracking during cycle
CREATE TABLE IF NOT EXISTS cycle_symptoms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  symptoms TEXT[] DEFAULT '{}',
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 5),
  mood TEXT,
  sleep_quality INTEGER CHECK (sleep_quality BETWEEN 1 AND 5),
  craving TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE cycle_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cycle_symptoms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own cycle logs" ON cycle_logs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own cycle symptoms" ON cycle_symptoms
  FOR ALL USING (auth.uid() = user_id);
