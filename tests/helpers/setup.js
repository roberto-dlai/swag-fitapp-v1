const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Use a separate test database to avoid destroying seed data
const BASE_URL = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;
const TEST_DB_NAME = 'fitcheck_test';

// Parse the base URL to get a connection to the default DB (for creating the test DB)
const adminUrl = BASE_URL.replace(/\/[^/]*$/, '/postgres');
const testUrl = BASE_URL.replace(/\/[^/]*$/, `/${TEST_DB_NAME}`);

let pool;

function getPool() {
  if (!pool) {
    pool = new Pool({ connectionString: testUrl });
  }
  return pool;
}

async function createTestDatabase() {
  const adminPool = new Pool({ connectionString: adminUrl });
  try {
    const { rows } = await adminPool.query(
      "SELECT 1 FROM pg_database WHERE datname = $1", [TEST_DB_NAME]
    );
    if (rows.length === 0) {
      await adminPool.query(`CREATE DATABASE ${TEST_DB_NAME}`);
    }
  } finally {
    await adminPool.end();
  }
}

async function runMigrations() {
  const p = getPool();

  // Ensure tracking table and check which migrations have already run
  await p.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename    VARCHAR(255) PRIMARY KEY,
      executed_at TIMESTAMP DEFAULT NOW()
    )
  `);
  const { rows } = await p.query('SELECT filename FROM schema_migrations');
  const applied = new Set(rows.map(r => r.filename));

  const migrationsDir = path.join(__dirname, '..', '..', 'src', 'migrations');
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    await p.query(sql);
    await p.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
  }
}

async function cleanTables() {
  const p = getPool();
  await p.query('DELETE FROM workouts');
  await p.query('DELETE FROM users');
}

async function setupTestDb() {
  await createTestDatabase();
  await runMigrations();
  await cleanTables();
}

async function teardownTestDb() {
  await cleanTables();
  if (pool) {
    await pool.end();
    pool = null;
  }
}

module.exports = { getPool, setupTestDb, teardownTestDb, runMigrations, cleanTables };
