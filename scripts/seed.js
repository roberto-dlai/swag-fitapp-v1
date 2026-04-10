const { Pool } = require('pg');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const mongoClient = new MongoClient(process.env.MONGODB_URI);

const sampleUsers = [
  {
    email: 'alice@example.com',
    password: 'password123',
    name: 'Alice Johnson',
    location: 'New York',
    unit_pref: 'imperial',
  },
  {
    email: 'bob@example.com',
    password: 'password123',
    name: 'Bob Smith',
    location: 'Los Angeles',
    unit_pref: 'imperial',
  },
];

function buildSampleReviews(aliceId, bobId) {
  return [
    {
      userId: aliceId,
      userName: 'Alice Johnson',
      workoutId: 1,
      rating: 5,
      title: 'Great beginner workout!',
      body: 'The squat progression felt right for my level. Not too easy, not too hard.',
      tags: ['beginner-friendly', 'lower-body'],
      tips: ['Start with bodyweight squats before adding weight', 'Focus on form over reps'],
      createdAt: new Date('2026-04-01'),
    },
    {
      userId: bobId,
      userName: 'Bob Smith',
      workoutId: 2,
      rating: 4,
      title: 'Solid full-body session',
      body: 'Loved the combination of deadlifts and kettlebell swings. Great for building power.',
      tags: ['advanced', 'full-body', 'strength'],
      tips: ['Warm up thoroughly before heavy lifts', 'Keep rest periods short between swings'],
      createdAt: new Date('2026-04-03'),
    },
    {
      userId: aliceId,
      userName: 'Alice Johnson',
      workoutId: 3,
      rating: 4,
      title: 'Nice indoor alternative',
      body: 'It was raining so I switched to indoor exercises. The jump rope cardio was intense!',
      tags: ['indoor', 'cardio', 'rainy-day'],
      tips: ['Make sure you have enough ceiling clearance for jump rope'],
      createdAt: new Date('2026-04-05'),
    },
  ];
}

async function seed() {
  console.log('Seeding database...');

  // Clear existing data
  await pool.query('DELETE FROM workouts');
  await pool.query('DELETE FROM users');

  await mongoClient.connect();
  const db = mongoClient.db();
  await db.collection('reviews').deleteMany({});
  console.log('Cleared existing data (PostgreSQL + MongoDB)');

  // Seed users and capture their IDs
  const userIds = [];
  for (const user of sampleUsers) {
    const passwordHash = await bcrypt.hash(user.password, 10);
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name, location, unit_pref)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO UPDATE SET password_hash = $2
       RETURNING id`,
      [user.email, passwordHash, user.name, user.location, user.unit_pref]
    );
    userIds.push(result.rows[0].id);
  }
  console.log(`Seeded ${sampleUsers.length} users (IDs: ${userIds.join(', ')})`);

  const aliceId = userIds[0];
  const bobId = userIds[1];

  // Create some sample workouts for the users
  const workoutData = [
    { user_id: aliceId, date: '2026-04-01', type: 'cardio', status: 'completed', duration_min: 30, weather_temp: 72, weather_cond: 'clear', location: 'New York' },
    { user_id: bobId, date: '2026-04-01', type: 'strength', status: 'completed', duration_min: 60, weather_temp: 78, weather_cond: 'partly cloudy', location: 'San Francisco' },
    { user_id: aliceId, date: '2026-04-02', type: 'endurance', status: 'completed', duration_min: 30, weather_temp: 55, weather_cond: 'rain', location: 'Boston' },
    { user_id: aliceId, date: '2026-04-03', type: 'strength', status: 'completed', duration_min: 30, weather_temp: 68, weather_cond: 'clear', location: 'New York' },
    { user_id: bobId, date: '2026-04-03', type: 'endurance', status: 'completed', duration_min: 60, weather_temp: 75, weather_cond: 'clear', location: 'Miami' },
  ];

  for (const w of workoutData) {
    await pool.query(
      `INSERT INTO workouts (user_id, date, type, status, duration_min, weather_temp, weather_cond, location)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [w.user_id, w.date, w.type, w.status, w.duration_min, w.weather_temp, w.weather_cond, w.location]
    );
  }
  console.log(`Seeded ${workoutData.length} workouts`);

  // Seed MongoDB reviews
  const reviewsCollection = db.collection('reviews');

  await reviewsCollection.createIndex({ userId: 1 });
  await reviewsCollection.createIndex({ workoutId: 1 });

  const sampleReviews = buildSampleReviews(aliceId, bobId);
  for (const review of sampleReviews) {
    await reviewsCollection.updateOne(
      { userId: review.userId, workoutId: review.workoutId },
      { $set: review },
      { upsert: true }
    );
  }
  console.log(`Seeded ${sampleReviews.length} reviews in MongoDB`);

  await pool.end();
  await mongoClient.close();
  console.log('Seeding complete!');
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
