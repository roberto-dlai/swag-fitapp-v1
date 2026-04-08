const { Pool } = require('pg');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const mongoClient = new MongoClient(process.env.MONGODB_URI);

const exercises = [
  // Cardio - Indoor
  { name: 'Jump Rope', category: 'cardio', muscle_group: 'full_body', location: 'indoor', difficulty: 'beginner', equipment: 'jump rope', calories_per_min: 12.0, description: 'Continuous jumping with a rope for cardiovascular endurance' },
  { name: 'Stationary Bike', category: 'cardio', muscle_group: 'lower_body', location: 'indoor', difficulty: 'beginner', equipment: 'stationary bike', calories_per_min: 8.5, description: 'Cycling on a stationary bike at moderate intensity' },
  { name: 'Treadmill Run', category: 'cardio', muscle_group: 'lower_body', location: 'indoor', difficulty: 'intermediate', equipment: 'treadmill', calories_per_min: 11.0, description: 'Running on a treadmill at a steady pace' },
  // Cardio - Outdoor
  { name: 'Outdoor Run', category: 'cardio', muscle_group: 'lower_body', location: 'outdoor', difficulty: 'beginner', equipment: 'bodyweight', calories_per_min: 10.0, description: 'Running outdoors at a comfortable pace' },
  { name: 'Cycling', category: 'cardio', muscle_group: 'lower_body', location: 'outdoor', difficulty: 'intermediate', equipment: 'bicycle', calories_per_min: 9.0, description: 'Outdoor cycling on roads or trails' },
  { name: 'Hiking', category: 'cardio', muscle_group: 'full_body', location: 'outdoor', difficulty: 'beginner', equipment: 'bodyweight', calories_per_min: 7.0, description: 'Walking on trails or inclines for extended periods' },
  // Strength - Indoor
  { name: 'Push-ups', category: 'strength', muscle_group: 'upper_body', location: 'both', difficulty: 'beginner', equipment: 'bodyweight', calories_per_min: 7.0, description: 'Classic bodyweight upper body exercise' },
  { name: 'Squats', category: 'strength', muscle_group: 'lower_body', location: 'both', difficulty: 'beginner', equipment: 'bodyweight', calories_per_min: 6.0, description: 'Bodyweight squats for lower body strength' },
  { name: 'Dumbbell Rows', category: 'strength', muscle_group: 'upper_body', location: 'indoor', difficulty: 'intermediate', equipment: 'dumbbells', calories_per_min: 6.5, description: 'Pulling a dumbbell to work the back muscles' },
  { name: 'Barbell Deadlift', category: 'strength', muscle_group: 'full_body', location: 'indoor', difficulty: 'advanced', equipment: 'barbell', calories_per_min: 8.0, description: 'Compound lift targeting the posterior chain' },
  { name: 'Bench Press', category: 'strength', muscle_group: 'upper_body', location: 'indoor', difficulty: 'intermediate', equipment: 'barbell', calories_per_min: 7.5, description: 'Barbell chest press on a flat bench' },
  { name: 'Lunges', category: 'strength', muscle_group: 'lower_body', location: 'both', difficulty: 'beginner', equipment: 'bodyweight', calories_per_min: 6.0, description: 'Alternating forward lunges for leg strength' },
  { name: 'Plank', category: 'strength', muscle_group: 'core', location: 'both', difficulty: 'beginner', equipment: 'bodyweight', calories_per_min: 4.0, description: 'Isometric core hold in a prone position' },
  { name: 'Russian Twists', category: 'strength', muscle_group: 'core', location: 'both', difficulty: 'intermediate', equipment: 'bodyweight', calories_per_min: 5.0, description: 'Seated rotational core exercise' },
  // Flexibility
  { name: 'Yoga Flow', category: 'flexibility', muscle_group: 'full_body', location: 'both', difficulty: 'beginner', equipment: 'bodyweight', calories_per_min: 4.0, description: 'A series of yoga poses linked with breath' },
  { name: 'Static Stretching', category: 'flexibility', muscle_group: 'full_body', location: 'both', difficulty: 'beginner', equipment: 'bodyweight', calories_per_min: 2.5, description: 'Holding stretches for 20-30 seconds each' },
  // HIIT
  { name: 'Burpees', category: 'hiit', muscle_group: 'full_body', location: 'both', difficulty: 'intermediate', equipment: 'bodyweight', calories_per_min: 14.0, description: 'Full-body explosive movement combining squat, plank, and jump' },
  { name: 'Mountain Climbers', category: 'hiit', muscle_group: 'full_body', location: 'both', difficulty: 'intermediate', equipment: 'bodyweight', calories_per_min: 11.0, description: 'High-intensity alternating leg drives from a plank position' },
  { name: 'Box Jumps', category: 'hiit', muscle_group: 'lower_body', location: 'indoor', difficulty: 'advanced', equipment: 'plyo box', calories_per_min: 12.0, description: 'Explosive jumps onto an elevated platform' },
  { name: 'Kettlebell Swings', category: 'hiit', muscle_group: 'full_body', location: 'indoor', difficulty: 'intermediate', equipment: 'kettlebell', calories_per_min: 13.0, description: 'Hip-hinge swing with a kettlebell for power and conditioning' },
];

const sampleUsers = [
  {
    email: 'alice@example.com',
    password: 'password123',
    name: 'Alice Johnson',
    location: 'New York',
    unit_pref: 'imperial',
    fitness_goal: 'weight_loss',
    fitness_level: 'beginner',
    equipment: ['bodyweight', 'dumbbells'],
    weekly_frequency: 3,
    account_tier: 'free',
  },
  {
    email: 'bob@example.com',
    password: 'password123',
    name: 'Bob Smith',
    location: 'Los Angeles',
    unit_pref: 'metric',
    fitness_goal: 'strength',
    fitness_level: 'advanced',
    equipment: ['bodyweight', 'dumbbells', 'barbell', 'kettlebell'],
    weekly_frequency: 5,
    account_tier: 'premium',
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
      body: 'It was raining so the app switched me to indoor exercises. The jump rope cardio was intense!',
      tags: ['indoor', 'cardio', 'rainy-day'],
      tips: ['Make sure you have enough ceiling clearance for jump rope'],
      createdAt: new Date('2026-04-05'),
    },
  ];
}

async function seed() {
  console.log('Seeding database...');

  // Seed exercises
  for (const ex of exercises) {
    await pool.query(
      `INSERT INTO exercises (name, category, muscle_group, location, difficulty, equipment, calories_per_min, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT DO NOTHING`,
      [ex.name, ex.category, ex.muscle_group, ex.location, ex.difficulty, ex.equipment, ex.calories_per_min, ex.description]
    );
  }
  console.log(`Seeded ${exercises.length} exercises`);

  // Seed users and capture their IDs
  const userIds = [];
  for (const user of sampleUsers) {
    const passwordHash = await bcrypt.hash(user.password, 10);
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name, location, unit_pref, fitness_goal, fitness_level, equipment, weekly_frequency, account_tier)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (email) DO UPDATE SET password_hash = $2
       RETURNING id`,
      [user.email, passwordHash, user.name, user.location, user.unit_pref, user.fitness_goal, user.fitness_level, user.equipment, user.weekly_frequency, user.account_tier]
    );
    userIds.push(result.rows[0].id);
  }
  console.log(`Seeded ${sampleUsers.length} users (IDs: ${userIds.join(', ')})`);

  const aliceId = userIds[0];
  const bobId = userIds[1];

  // Create some sample workouts for the users
  const workoutData = [
    { user_id: aliceId, date: '2026-04-01', type: 'generated', status: 'completed', duration_min: 30, calories_burned: 210, weather_temp: 72, weather_cond: 'clear' },
    { user_id: bobId, date: '2026-04-01', type: 'generated', status: 'completed', duration_min: 45, calories_burned: 380, weather_temp: 78, weather_cond: 'partly cloudy' },
    { user_id: aliceId, date: '2026-04-02', type: 'generated', status: 'completed', duration_min: 25, calories_burned: 175, weather_temp: 55, weather_cond: 'rain' },
    { user_id: aliceId, date: '2026-04-03', type: 'generated', status: 'completed', duration_min: 30, calories_burned: 200, weather_temp: 68, weather_cond: 'clear' },
    { user_id: bobId, date: '2026-04-03', type: 'custom', status: 'completed', duration_min: 60, calories_burned: 520, weather_temp: 75, weather_cond: 'clear' },
  ];

  for (const w of workoutData) {
    await pool.query(
      `INSERT INTO workouts (user_id, date, type, status, duration_min, calories_burned, weather_temp, weather_cond)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [w.user_id, w.date, w.type, w.status, w.duration_min, w.calories_burned, w.weather_temp, w.weather_cond]
    );
  }
  console.log(`Seeded ${workoutData.length} workouts`);

  // Seed MongoDB reviews
  await mongoClient.connect();
  const db = mongoClient.db();
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
