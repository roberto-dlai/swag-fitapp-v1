const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { setupTestDb, teardownTestDb, getPool } = require('../helpers/setup');
const { requestFactory, authHeader } = require('../helpers/http');

const baseDbUrl = process.env.DATABASE_URL || 'postgresql://fitcheck:fitcheck@localhost:5432/fitcheck';
process.env.DATABASE_URL = baseDbUrl.replace(/\/[^/]*$/, '/fitcheck_test');
process.env.JWT_SECRET = 'test-secret-that-is-at-least-32-characters-long';
process.env.WEATHER_API_KEY = 'test-key';
process.env.CORS_ORIGIN = 'http://localhost:3000';

const app = require('../../src/app');
const { hashPassword, createToken } = require('../../src/services/auth.service');

let server;
let request;
let user1Token;
let user2Token;
let user1Id;
let user2Id;

describe('Workout Routes Integration Tests', () => {
  before(async () => {
    await setupTestDb();
    const pool = getPool();

    const hash = await hashPassword('password123');
    const r1 = await pool.query(
      `INSERT INTO users (email, password_hash, name, location)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      ['user1@test.com', hash, 'User One', 'New York']
    );
    user1Id = r1.rows[0].id;
    user1Token = createToken(user1Id);

    const r2 = await pool.query(
      `INSERT INTO users (email, password_hash, name, location)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      ['user2@test.com', hash, 'User Two', 'Boston']
    );
    user2Id = r2.rows[0].id;
    user2Token = createToken(user2Id);

    // Seed a workout owned by user1
    await pool.query(
      `INSERT INTO workouts (user_id, date, type, status, duration_min, location)
       VALUES ($1, '2026-04-01', 'cardio', 'completed', 30, 'New York')`,
      [user1Id]
    );

    server = app.listen(0);
    request = requestFactory(`http://127.0.0.1:${server.address().port}`);
  });

  after(async () => {
    server.close();
    await teardownTestDb();
  });

  it('POST /api/workouts rejects a future date with 400', async () => {
    const res = await request('/api/workouts', {
      method: 'POST',
      headers: authHeader(user2Token),
      body: {
        date: '2099-01-01',
        type: 'cardio',
        status: 'completed',
        duration_min: 60,
        location: 'Boston',
      },
    });
    assert.strictEqual(res.status, 400);
    assert.match(res.body.error, /future/i);
  });

  it('POST /api/workouts creates a new workout (happy path)', async () => {
    const res = await request('/api/workouts', {
      method: 'POST',
      headers: authHeader(user2Token),
      body: {
        date: '2026-04-05',
        type: 'strength',
        status: 'completed',
        duration_min: 60,
        location: 'Boston',
      },
    });
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.workout.type, 'strength');
    assert.strictEqual(res.body.workout.duration_min, 60);
    assert.strictEqual(res.body.workout.location, 'Boston');
  });

  it('POST /api/workouts overwrites an existing workout for the same date', async () => {
    // Create first workout
    await request('/api/workouts', {
      method: 'POST',
      headers: authHeader(user2Token),
      body: { date: '2026-04-06', type: 'cardio', status: 'completed', duration_min: 30 },
    });
    // Overwrite
    const res = await request('/api/workouts', {
      method: 'POST',
      headers: authHeader(user2Token),
      body: { date: '2026-04-06', type: 'endurance', status: 'completed', duration_min: 90 },
    });
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.workout.type, 'endurance');

    // Verify only one workout exists for that date
    const hist = await request('/api/workouts/history', { headers: authHeader(user2Token) });
    const sameDate = hist.body.workouts.filter(w => w.date.startsWith('2026-04-06'));
    assert.strictEqual(sameDate.length, 1);
  });

  it('GET /api/workouts/history returns only own data', async () => {
    const res = await request('/api/workouts/history', { headers: authHeader(user1Token) });
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body.workouts));
    for (const w of res.body.workouts) {
      assert.strictEqual(w.user_id, user1Id);
    }
  });

  it('PATCH /api/workouts/:id on another user workout returns 403', async () => {
    const hist = await request('/api/workouts/history', { headers: authHeader(user1Token) });
    const workoutId = hist.body.workouts[0].id;

    const res = await request(`/api/workouts/${workoutId}`, {
      method: 'PATCH',
      headers: authHeader(user2Token),
      body: { status: 'skipped' },
    });
    assert.strictEqual(res.status, 403);
  });

  it('DELETE /api/workouts/:id on own workout succeeds', async () => {
    const hist = await request('/api/workouts/history', { headers: authHeader(user2Token) });
    const workoutId = hist.body.workouts[0].id;

    const res = await request(`/api/workouts/${workoutId}`, {
      method: 'DELETE',
      headers: authHeader(user2Token),
    });
    assert.strictEqual(res.status, 200);
  });

  it('DELETE /api/workouts/:id on another user workout returns 403', async () => {
    const hist = await request('/api/workouts/history', { headers: authHeader(user1Token) });
    const workoutId = hist.body.workouts[0].id;

    const res = await request(`/api/workouts/${workoutId}`, {
      method: 'DELETE',
      headers: authHeader(user2Token),
    });
    assert.strictEqual(res.status, 403);
  });
});
