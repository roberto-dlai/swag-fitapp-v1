CREATE TABLE IF NOT EXISTS workout_exercises (
  id          SERIAL PRIMARY KEY,
  workout_id  INT REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id INT REFERENCES exercises(id),
  sets        INT,
  reps        INT,
  duration_min INT,
  order_index INT
);

CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout_id ON workout_exercises(workout_id);
