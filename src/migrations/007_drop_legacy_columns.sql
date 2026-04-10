-- Drop legacy tables and columns no longer used by the simplified UI.
-- Exercises catalog and the workout_exercises join table were used by the
-- workout generator, which has been removed. User fitness metadata
-- (fitness_goal, fitness_level, equipment, weekly_frequency, account_tier)
-- is no longer editable or displayed. calories_burned was never actually
-- calculated.

DROP TABLE IF EXISTS workout_exercises;
DROP TABLE IF EXISTS exercises;

ALTER TABLE workouts DROP COLUMN IF EXISTS calories_burned;

ALTER TABLE users
  DROP COLUMN IF EXISTS fitness_goal,
  DROP COLUMN IF EXISTS fitness_level,
  DROP COLUMN IF EXISTS equipment,
  DROP COLUMN IF EXISTS weekly_frequency,
  DROP COLUMN IF EXISTS account_tier;
