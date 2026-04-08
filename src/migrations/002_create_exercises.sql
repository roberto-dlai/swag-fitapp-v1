CREATE TABLE IF NOT EXISTS exercises (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(100) NOT NULL,
  category        VARCHAR(50) NOT NULL CHECK (category IN ('cardio', 'strength', 'flexibility', 'hiit')),
  muscle_group    VARCHAR(50) CHECK (muscle_group IN ('upper_body', 'lower_body', 'core', 'full_body')),
  location        VARCHAR(10) NOT NULL CHECK (location IN ('indoor', 'outdoor', 'both')),
  difficulty      VARCHAR(20) NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  equipment       VARCHAR(50) DEFAULT 'bodyweight',
  calories_per_min NUMERIC(5,2) NOT NULL,
  description     TEXT
);
