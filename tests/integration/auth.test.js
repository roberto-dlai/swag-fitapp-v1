const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { setupTestDb, teardownTestDb } = require('../helpers/setup');
const { requestFactory } = require('../helpers/http');

// Point DATABASE_URL at the test database before requiring app
const baseDbUrl = process.env.DATABASE_URL || 'postgresql://fitcheck:fitcheck@localhost:5432/fitcheck';
process.env.DATABASE_URL = baseDbUrl.replace(/\/[^/]*$/, '/fitcheck_test');
process.env.JWT_SECRET = 'test-secret-that-is-at-least-32-characters-long';
process.env.WEATHER_API_KEY = 'test-key';
process.env.CORS_ORIGIN = 'http://localhost:3000';

const app = require('../../src/app');

let server;
let request;

describe('Auth Integration Tests', () => {
  before(async () => {
    await setupTestDb();
    server = app.listen(0);
    request = requestFactory(`http://127.0.0.1:${server.address().port}`);
  });

  after(async () => {
    server.close();
    await teardownTestDb();
  });

  it('POST /api/auth/signup returns 201 with token', async () => {
    const res = await request('/api/auth/signup', {
      method: 'POST',
      body: { email: 'test1@example.com', password: 'password123', name: 'Test User' },
    });
    assert.strictEqual(res.status, 201);
    assert.ok(res.body.token);
    assert.strictEqual(res.body.user.email, 'test1@example.com');
  });

  it('POST /api/auth/signup returns 409 for duplicate email', async () => {
    const res = await request('/api/auth/signup', {
      method: 'POST',
      body: { email: 'test1@example.com', password: 'password123', name: 'Dup User' },
    });
    assert.strictEqual(res.status, 409);
    assert.ok(res.body.error.includes('already registered'));
  });

  it('POST /api/auth/login returns 200 with token', async () => {
    const res = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'test1@example.com', password: 'password123' },
    });
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.token);
    assert.strictEqual(res.body.user.email, 'test1@example.com');
  });

  it('POST /api/auth/login returns 401 for wrong password', async () => {
    const res = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'test1@example.com', password: 'wrongpassword' },
    });
    assert.strictEqual(res.status, 401);
  });

  it('POST /api/auth/signup returns 400 for invalid email', async () => {
    const res = await request('/api/auth/signup', {
      method: 'POST',
      body: { email: 'notanemail', password: 'password123', name: 'Bad Email' },
    });
    assert.strictEqual(res.status, 400);
  });

  it('POST /api/auth/signup returns 400 for short password', async () => {
    const res = await request('/api/auth/signup', {
      method: 'POST',
      body: { email: 'short@example.com', password: 'short', name: 'Short Pass' },
    });
    assert.strictEqual(res.status, 400);
  });

  it('GET /api/users/me returns 401 without token', async () => {
    const res = await request('/api/users/me');
    assert.strictEqual(res.status, 401);
  });

  it('GET /api/users/me returns 401 with invalid token', async () => {
    const res = await request('/api/users/me', {
      headers: { Authorization: 'Bearer invalid-token' },
    });
    assert.strictEqual(res.status, 401);
  });

  it('GET /api/users/me returns user profile with valid token', async () => {
    const loginRes = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'test1@example.com', password: 'password123' },
    });
    const token = loginRes.body.token;

    const res = await request('/api/users/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.user.email, 'test1@example.com');
  });

  it('PATCH /api/users/me updates unit_pref', async () => {
    const loginRes = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'test1@example.com', password: 'password123' },
    });
    const token = loginRes.body.token;

    const res = await request('/api/users/me', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: { unit_pref: 'metric' },
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.user.unit_pref, 'metric');
  });

  it('PATCH /api/users/me updates location', async () => {
    const loginRes = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'test1@example.com', password: 'password123' },
    });
    const token = loginRes.body.token;

    const res = await request('/api/users/me', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: { location: 'Boston' },
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.user.location, 'Boston');
  });

  it('PATCH /api/users/me returns 400 for invalid unit_pref', async () => {
    const loginRes = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'test1@example.com', password: 'password123' },
    });
    const token = loginRes.body.token;

    const res = await request('/api/users/me', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: { unit_pref: 'kelvin' },
    });
    assert.strictEqual(res.status, 400);
  });

  it('PATCH /api/users/me returns 401 without token', async () => {
    const res = await request('/api/users/me', {
      method: 'PATCH',
      body: { unit_pref: 'metric' },
    });
    assert.strictEqual(res.status, 401);
  });
});
