const dotenv = require('dotenv');

dotenv.config();

const required = ['DATABASE_URL', 'MONGODB_URI', 'JWT_SECRET', 'WEATHER_API_KEY'];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

if (process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters long');
}

// Optional Postgres schema to namespace all tables, so FitCheck can share a
// database with other apps without table-name collisions. Sanitized to a bare
// identifier since it can't be passed as a query parameter. Defaults to 'public'.
const dbSchema = (process.env.DB_SCHEMA || 'public').replace(/[^a-zA-Z0-9_]/g, '') || 'public';

const config = {
  port: parseInt(process.env.PORT, 10) || 3000,
  databaseUrl: process.env.DATABASE_URL,
  dbSchema,
  mongodbUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  weatherApiKey: process.env.WEATHER_API_KEY,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  nodeEnv: process.env.NODE_ENV || 'development',
};

module.exports = config;
