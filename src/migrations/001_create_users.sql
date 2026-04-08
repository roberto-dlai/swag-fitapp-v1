CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name          VARCHAR(100) NOT NULL,
  location      VARCHAR(100) DEFAULT 'New York',
  unit_pref     VARCHAR(10) DEFAULT 'imperial' CHECK (unit_pref IN ('imperial', 'metric')),
  fitness_goal  VARCHAR(50) DEFAULT 'general' CHECK (fitness_goal IN ('weight_loss', 'strength', 'endurance', 'general')),
  fitness_level VARCHAR(20) DEFAULT 'beginner' CHECK (fitness_level IN ('beginner', 'intermediate', 'advanced')),
  equipment     TEXT[] DEFAULT '{}',
  weekly_frequency INT DEFAULT 3 CHECK (weekly_frequency BETWEEN 1 AND 7),
  account_tier  VARCHAR(10) DEFAULT 'free' CHECK (account_tier IN ('free', 'premium')),
  created_at    TIMESTAMP DEFAULT NOW()
);
