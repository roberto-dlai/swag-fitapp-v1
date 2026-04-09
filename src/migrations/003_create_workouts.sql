CREATE TABLE IF NOT EXISTS workouts (
  id             SERIAL PRIMARY KEY,
  user_id        INT REFERENCES users(id) NOT NULL,
  date           DATE NOT NULL,
  type           VARCHAR(50) DEFAULT 'cardio',
  status         VARCHAR(20) DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'skipped')),
  duration_min   INT,
  notes          TEXT,
  weather_temp   NUMERIC(5,1),
  weather_cond   VARCHAR(50),
  created_at     TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_date ON workouts(date);
