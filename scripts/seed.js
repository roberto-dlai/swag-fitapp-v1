const { Pool } = require('pg');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

require('dotenv').config();

// Scope to the same schema migrations use, so seeding hits FitCheck's tables.
const DB_SCHEMA = (process.env.DB_SCHEMA || 'public').replace(/[^a-zA-Z0-9_]/g, '') || 'public';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  options: `-c search_path=${DB_SCHEMA}`,
});
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
      rating: 5,
      title: 'Great beginner workout!',
      body: 'The squat progression felt right for my level. Not too easy, not too hard.',
      createdAt: new Date('2026-04-01'),
    },
    {
      userId: bobId,
      userName: 'Bob Smith',
      rating: 4,
      title: 'Solid full-body session',
      body: 'Loved the combination of deadlifts and kettlebell swings. Great for building power.',
      createdAt: new Date('2026-04-03'),
    },
    {
      userId: aliceId,
      userName: 'Alice Johnson',
      rating: 4,
      title: 'Nice indoor alternative',
      body: 'It was raining so I switched to indoor exercises. The jump rope cardio was intense!',
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
    { user_id: aliceId, date: '2026-04-01', type: 'cardio', duration_min: 30, location: 'New York' },
    { user_id: bobId, date: '2026-04-01', type: 'strength', duration_min: 60, location: 'San Francisco' },
    { user_id: aliceId, date: '2026-04-02', type: 'endurance', duration_min: 30, location: 'Boston' },
    { user_id: aliceId, date: '2026-04-03', type: 'strength', duration_min: 30, location: 'New York' },
    { user_id: bobId, date: '2026-04-03', type: 'endurance', duration_min: 60, location: 'Miami' },
  ];

  for (const w of workoutData) {
    await pool.query(
      `INSERT INTO workouts (user_id, date, type, duration_min, location)
       VALUES ($1, $2, $3, $4, $5)`,
      [w.user_id, w.date, w.type, w.duration_min, w.location]
    );
  }
  console.log(`Seeded ${workoutData.length} workouts`);

  // Seed MongoDB reviews
  const reviewsCollection = db.collection('reviews');

  await reviewsCollection.createIndex({ userId: 1 });

  const sampleReviews = buildSampleReviews(aliceId, bobId);
  // Seed is destructive: deleteMany was already called above, so insertMany is safe.
  await reviewsCollection.insertMany(sampleReviews);
  console.log(`Seeded ${sampleReviews.length} reviews in MongoDB`);

  await pool.end();
  await mongoClient.close();
  console.log('Seeding complete!');
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
