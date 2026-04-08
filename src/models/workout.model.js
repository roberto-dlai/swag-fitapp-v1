const pool = require('../config/db');

async function findById(id) {
  const { rows } = await pool.query(
    'SELECT * FROM workouts WHERE id = $1',
    [id]
  );
  return rows[0] || null;
}

async function findByUserIdAndDate(userId, date) {
  const { rows } = await pool.query(
    'SELECT * FROM workouts WHERE user_id = $1 AND date = $2 ORDER BY created_at DESC LIMIT 1',
    [userId, date]
  );
  return rows[0] || null;
}

async function findHistoryByUserId(userId) {
  const { rows } = await pool.query(
    'SELECT * FROM workouts WHERE user_id = $1 ORDER BY date DESC',
    [userId]
  );
  return rows;
}

async function countByUserId(userId) {
  const { rows } = await pool.query(
    'SELECT COUNT(*)::int AS count FROM workouts WHERE user_id = $1',
    [userId]
  );
  return rows[0].count;
}

async function create({ userId, date, type, status, durationMin, caloriesBurned, notes, weatherTemp, weatherCond }) {
  const { rows } = await pool.query(
    `INSERT INTO workouts (user_id, date, type, status, duration_min, calories_burned, notes, weather_temp, weather_cond)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [userId, date, type || 'generated', status || 'planned', durationMin, caloriesBurned, notes, weatherTemp, weatherCond]
  );
  return rows[0];
}

async function update(id, updates) {
  const allowedFields = ['status', 'duration_min', 'calories_burned', 'notes', 'type'];
  const setClauses = [];
  const values = [];
  let paramIndex = 1;

  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      setClauses.push(`${field} = $${paramIndex}`);
      values.push(updates[field]);
      paramIndex++;
    }
  }

  if (setClauses.length === 0) {
    return findById(id);
  }

  values.push(id);
  const { rows } = await pool.query(
    `UPDATE workouts SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );
  return rows[0] || null;
}

async function remove(id) {
  const { rowCount } = await pool.query('DELETE FROM workouts WHERE id = $1', [id]);
  return rowCount > 0;
}

async function findExercisesForWorkout(workoutId) {
  const { rows } = await pool.query(
    `SELECT we.*, e.name, e.category, e.muscle_group, e.equipment, e.calories_per_min
     FROM workout_exercises we
     JOIN exercises e ON we.exercise_id = e.id
     WHERE we.workout_id = $1
     ORDER BY we.order_index`,
    [workoutId]
  );
  return rows;
}

async function addExercisesToWorkout(workoutId, exercises) {
  for (const ex of exercises) {
    await pool.query(
      `INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps, duration_min, order_index)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [workoutId, ex.exercise_id, ex.sets, ex.reps, ex.duration_min, ex.order_index]
    );
  }
}

async function getStreak(userId) {
  const { rows } = await pool.query(
    `WITH dates AS (
       SELECT DISTINCT date FROM workouts
       WHERE user_id = $1 AND status = 'completed'
       ORDER BY date DESC
     ),
     numbered AS (
       SELECT date, date - (ROW_NUMBER() OVER (ORDER BY date DESC))::int * INTERVAL '1 day' AS grp
       FROM dates
     )
     SELECT COUNT(*)::int AS streak
     FROM numbered
     WHERE grp = (SELECT grp FROM numbered LIMIT 1)`,
    [userId]
  );
  return rows[0]?.streak || 0;
}

module.exports = {
  findById,
  findByUserIdAndDate,
  findHistoryByUserId,
  countByUserId,
  create,
  update,
  remove,
  findExercisesForWorkout,
  addExercisesToWorkout,
  getStreak,
};
