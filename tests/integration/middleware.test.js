const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { setupTestDb, teardownTestDb, getPool } = require('../helpers/setup');
const { requestFactory } = require('../helpers/http');

const baseDbUrl = process.env.DATABASE_URL || 'postgresql://fitcheck:fitcheck@localhost:5432/fitcheck';
process.env.DATABASE_URL = baseDbUrl.replace(/\/[^/]*$/, '/fitcheck_test');
process.env.JWT_SECRET = 'test-secret-that-is-at-least-32-characters-long';
process.env.WEATHER_API_KEY = 'test-key';
process.env.CORS_ORIGIN = 'http://localhost:3000';

const app = require('../../src/app');
const { hashPassword, createToken } = require('../../src/services/auth.service');

let server;
let request;
let userToken;

describe('Middleware Integration Tests', () => {
  before(async () => {
    await setupTestDb();
    const pool = getPool();

    const hash = await hashPassword('password123');
    const r = await pool.query(
      `INSERT INTO users (email, password_hash, name, unit_pref, location)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      ['middleware@test.com', hash, 'MW User', 'metric', 'New York']
    );
    userToken = createToken(r.rows[0].id);

    server = app.listen(0);
    request = requestFactory(`http://127.0.0.1:${server.address().port}`);
  });

  after(async () => {
    server.close();
    await teardownTestDb();
  });

  it('userPreferences middleware populates req.userPrefs (weather uses user unit_pref)', async () => {
    const res = await request('/api/weather', {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert.strictEqual(res.status, 200);
    // User has metric preference, so weather should return celsius
    assert.strictEqual(res.body.unit, 'celsius');
  });

  it('health endpoint works without auth', async () => {
    const res = await request('/api/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'ok');
  });

  it('error handler returns JSON error for nonexistent workout', async () => {
    const res = await request('/api/workouts/99999', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${userToken}` },
      body: { type: 'strength' },
    });
    assert.ok(typeof res.body === 'object');
    assert.ok(res.body.error);
    // Should not contain stack trace info
    assert.ok(!res.body.error.includes('at '), 'Error should not expose stack trace');
  });
});
