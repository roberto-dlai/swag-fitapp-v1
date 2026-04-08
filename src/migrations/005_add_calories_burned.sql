ALTER TABLE workouts
  ADD COLUMN IF NOT EXISTS calories_burned NUMERIC(7,2);
