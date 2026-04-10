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
const { connectMongo, getDb, closeMongo } = require('../../src/config/mongo');

let server;
let request;
let userToken;
let userId;

describe('Review Routes Integration Tests', () => {
  before(async () => {
    await setupTestDb();
    const pool = getPool();

    const hash = await hashPassword('password123');
    const r = await pool.query(
      `INSERT INTO users (email, password_hash, name, location)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      ['reviewer@test.com', hash, 'Reviewer User', 'New York']
    );
    userId = r.rows[0].id;
    userToken = createToken(userId);

    // Ensure Mongo is connected and the reviews collection is clean
    await connectMongo();
    await getDb().collection('reviews').deleteMany({});

    server = app.listen(0);
    request = requestFactory(`http://127.0.0.1:${server.address().port}`);
  });

  after(async () => {
    server.close();
    await getDb().collection('reviews').deleteMany({});
    await closeMongo();
    await teardownTestDb();
  });

  it('POST /api/reviews creates a review (happy path)', async () => {
    const res = await request('/api/reviews', {
      method: 'POST',
      headers: authHeader(userToken),
      body: {
        rating: 5,
        title: 'Solid session',
        body: 'Really enjoyed this one',
        tags: ['legs', 'strength'],
      },
    });
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.review.rating, 5);
    assert.strictEqual(res.body.review.title, 'Solid session');
    assert.strictEqual(res.body.review.userName, 'Reviewer User');
  });

  it('POST /api/reviews returns 400 for invalid rating', async () => {
    const res = await request('/api/reviews', {
      method: 'POST',
      headers: authHeader(userToken),
      body: { rating: 6, body: 'Too high' },
    });
    assert.strictEqual(res.status, 400);
  });

  it('POST /api/reviews returns 400 when body is missing', async () => {
    const res = await request('/api/reviews', {
      method: 'POST',
      headers: authHeader(userToken),
      body: { rating: 4 },
    });
    assert.strictEqual(res.status, 400);
  });

  it('GET /api/reviews returns reviews list', async () => {
    const res = await request('/api/reviews', { headers: authHeader(userToken) });
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body.reviews));
    assert.ok(res.body.reviews.length >= 1);
  });

  it('GET /api/reviews returns 401 without token', async () => {
    const res = await request('/api/reviews');
    assert.strictEqual(res.status, 401);
  });
});
