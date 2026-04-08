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
let user1Token;
let user2Token;
let user1Id;
let user2Id;

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

function authHeader(token) {
  return { Authorization: `Bearer ${token}` };
}

describe('Workout Routes Integration Tests', () => {
  before(async () => {
    await setupTestDb();
    const pool = getPool();

    // Create two test users
    const hash = await hashPassword('password123');
    const r1 = await pool.query(
      `INSERT INTO users (email, password_hash, name, fitness_level, fitness_goal, equipment, account_tier)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      ['user1@test.com', hash, 'User One', 'beginner', 'weight_loss', ['bodyweight'], 'free']
    );
    user1Id = r1.rows[0].id;
    user1Token = createToken(user1Id);

    const r2 = await pool.query(
      `INSERT INTO users (email, password_hash, name, fitness_level, fitness_goal, equipment, account_tier)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      ['user2@test.com', hash, 'User Two', 'advanced', 'strength', ['bodyweight', 'barbell'], 'premium']
    );
    user2Id = r2.rows[0].id;
    user2Token = createToken(user2Id);

    // Seed exercises
    await pool.query(
      `INSERT INTO exercises (name, category, muscle_group, location, difficulty, equipment, calories_per_min)
       VALUES ('Push-ups', 'strength', 'upper_body', 'both', 'beginner', 'bodyweight', 7),
              ('Squats', 'strength', 'lower_body', 'both', 'beginner', 'bodyweight', 6),
              ('Outdoor Run', 'cardio', 'lower_body', 'outdoor', 'beginner', 'bodyweight', 10),
              ('Jump Rope', 'cardio', 'full_body', 'indoor', 'beginner', 'bodyweight', 12)
       ON CONFLICT DO NOTHING`
    );

    // Create a workout owned by user1
    await pool.query(
      `INSERT INTO workouts (user_id, date, type, status, duration_min) VALUES ($1, '2026-04-01', 'generated', 'completed', 30)`,
      [user1Id]
    );

    server = app.listen(0);
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  });

  after(async () => {
    server.close();
    await teardownTestDb();
  });

  it('GET /api/workouts/history returns only own data', async () => {
    const res = await request('/api/workouts/history', { headers: authHeader(user1Token) });
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body.workouts));
    for (const w of res.body.workouts) {
      assert.strictEqual(w.user_id, user1Id);
    }
  });

  it('GET /api/workouts/history for user2 does not include user1 workouts', async () => {
    const res = await request('/api/workouts/history', { headers: authHeader(user2Token) });
    assert.strictEqual(res.status, 200);
    for (const w of res.body.workouts) {
      assert.strictEqual(w.user_id, user2Id);
    }
  });

  it('PATCH /api/workouts/:id on another user workout returns 403', async () => {
    // Get user1's workout id
    const histRes = await request('/api/workouts/history', { headers: authHeader(user1Token) });
    const workoutId = histRes.body.workouts[0].id;

    // User2 tries to update it
    const res = await request(`/api/workouts/${workoutId}`, {
      method: 'PATCH',
      headers: authHeader(user2Token),
      body: { status: 'skipped' },
    });
    assert.strictEqual(res.status, 403);
  });

  it('POST /api/workouts enforces free tier limit', async () => {
    // User1 is free tier, already has 1 workout. Add 2 more to hit limit of 3
    await request('/api/workouts', {
      method: 'POST',
      headers: authHeader(user1Token),
      body: { date: '2026-04-02' },
    });
    await request('/api/workouts', {
      method: 'POST',
      headers: authHeader(user1Token),
      body: { date: '2026-04-03' },
    });

    // 4th should be blocked
    const res = await request('/api/workouts', {
      method: 'POST',
      headers: authHeader(user1Token),
      body: { date: '2026-04-04' },
    });
    assert.strictEqual(res.status, 403);
    assert.ok(res.body.error.includes('Free tier'));
  });

  it('GET /api/workouts/today returns a workout plan', async () => {
    const res = await request('/api/workouts/today', { headers: authHeader(user2Token) });
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.workout);
    assert.ok(Array.isArray(res.body.workout.exercises));
  });
});
