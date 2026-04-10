-- Drop columns on `workouts` that the refactored app never reads:
--   * status: only ever set to 'completed' by the UI, filtered by that same
--     value on read, so it's a no-op column
--   * notes: never written, never displayed
--   * weather_temp / weather_cond: written from the OpenWeatherMap API on
--     every POST for an "audit trail" that nothing ever reads. Removing them
--     lets us delete the per-POST weather fetch too.
--
-- Dropping the status CHECK constraint implicitly happens when the column
-- is dropped.

ALTER TABLE workouts
  DROP COLUMN IF EXISTS status,
  DROP COLUMN IF EXISTS notes,
  DROP COLUMN IF EXISTS weather_temp,
  DROP COLUMN IF EXISTS weather_cond;
