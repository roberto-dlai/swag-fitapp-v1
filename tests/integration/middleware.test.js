const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { setupTestDb, teardownTestDb, getPool } = require('../helpers/setup');

const baseDbUrl = process.env.DATABASE_URL || 'postgresql://fitcheck:fitcheck@localhost:5432/fitcheck';
process.env.DATABASE_URL = baseDbUrl.replace(/\/[^/]*$/, '/fitcheck_test');
process.env.JWT_SECRET = 'test-secret-that-is-at-least-32-characters-long';
process.env.WEATHER_API_KEY = 'test-key';
process.env.CORS_ORIGIN = 'http://localhost:3000';

const app = require('../../src/app');
const { hashPassword, createToken } = require('../../src/services/auth.service');

let server;
let baseUrl;
let userToken;

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const body = options.body ? JSON.stringify(options.body) : null;
    const req = http.request(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

describe('Middleware Integration Tests', () => {
  before(async () => {
    await setupTestDb();
    const pool = getPool();

    const hash = await hashPassword('password123');
    const r = await pool.query(
      `INSERT INTO users (email, password_hash, name, unit_pref, fitness_level, fitness_goal, equipment)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      ['middleware@test.com', hash, 'MW User', 'metric', 'beginner', 'general', ['bodyweight']]
    );
    userToken = createToken(r.rows[0].id);

    // Seed an exercise
    await pool.query(
      `INSERT INTO exercises (name, category, muscle_group, location, difficulty, equipment, calories_per_min)
       VALUES ('Push-ups', 'strength', 'upper_body', 'both', 'beginner', 'bodyweight', 7)
       ON CONFLICT DO NOTHING`
    );

    server = app.listen(0);
    baseUrl = `http://127.0.0.1:${server.address().port}`;
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

  it('error handler returns JSON error, not stack trace', async () => {
    // Request a nonexistent workout to trigger a controlled path
    const res = await request('/api/workouts/99999', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${userToken}` },
      body: { status: 'completed' },
    });
    // Should get JSON error, not HTML
    assert.ok(typeof res.body === 'object');
    assert.ok(res.body.error);
    // Should not contain stack trace info
    assert.ok(!res.body.error.includes('at '), 'Error should not expose stack trace');
  });
});
