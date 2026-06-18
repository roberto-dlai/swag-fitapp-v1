const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

require('dotenv').config();

// Namespace all tables under this schema so FitCheck can share a database.
// Sanitized to a bare identifier since it's interpolated, not parameterized.
const DB_SCHEMA = (process.env.DB_SCHEMA || 'public').replace(/[^a-zA-Z0-9_]/g, '') || 'public';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  options: `-c search_path=${DB_SCHEMA}`,
});

async function ensureSchema() {
  await pool.query(`CREATE SCHEMA IF NOT EXISTS ${DB_SCHEMA}`);
}

async function ensureMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename    VARCHAR(255) PRIMARY KEY,
      executed_at TIMESTAMP DEFAULT NOW()
    )
  `);
}

async function appliedMigrations() {
  const { rows } = await pool.query('SELECT filename FROM schema_migrations');
  return new Set(rows.map(r => r.filename));
}

async function migrate() {
  await ensureSchema();
  await ensureMigrationsTable();
  const applied = await appliedMigrations();

  const migrationsDir = path.join(__dirname, '..', 'src', 'migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  console.log(`Found ${files.length} migration files (${applied.size} already applied)`);

  let ranCount = 0;
  for (const file of files) {
    if (applied.has(file)) {
      console.log(`Skipping (already applied): ${file}`);
      continue;
    }

    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');
    console.log(`Running migration: ${file}`);

    // Run migration and record it in a single transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query(
        'INSERT INTO schema_migrations (filename) VALUES ($1)',
        [file]
      );
      await client.query('COMMIT');
      ranCount++;
      console.log(`  Completed: ${file}`);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  console.log(`All migrations complete (${ranCount} new, ${applied.size} existing)`);
  await pool.end();
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
