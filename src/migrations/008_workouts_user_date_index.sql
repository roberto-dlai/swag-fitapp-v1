-- Composite index to speed up upsertByUserDate and findByUserIdAndDate queries
-- which always filter by (user_id, date) together.
CREATE INDEX IF NOT EXISTS idx_workouts_user_date ON workouts(user_id, date);
