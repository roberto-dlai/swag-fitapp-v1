const pool = require('../config/db');
const { DEFAULT_WORKOUT_TYPE } = require('../utils/constants');

async function findById(id) {
  const { rows } = await pool.query(
    'SELECT * FROM workouts WHERE id = $1',
    [id]
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

async function deleteByUserIdAndDate(userId, date) {
  await pool.query('DELETE FROM workouts WHERE user_id = $1 AND date = $2', [userId, date]);
}

async function create({ userId, date, type, durationMin, location }) {
  const { rows } = await pool.query(
    `INSERT INTO workouts (user_id, date, type, duration_min, location)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [userId, date, type || DEFAULT_WORKOUT_TYPE, durationMin, location]
  );
  return rows[0];
}

/**
 * Atomically replace any existing workout for this user/date with a new one.
 * Wraps the delete+insert in a transaction so a failed insert cannot lose
 * the previous row.
 */
async function upsertByUserDate({ userId, date, type, durationMin, location }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM workouts WHERE user_id = $1 AND date = $2', [userId, date]);
    const { rows } = await client.query(
      `INSERT INTO workouts (user_id, date, type, duration_min, location)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, date, type || DEFAULT_WORKOUT_TYPE, durationMin, location]
    );
    await client.query('COMMIT');
    return rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function update(id, updates) {
  const allowedFields = ['duration_min', 'type'];
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

module.exports = {
  findById,
  findHistoryByUserId,
  deleteByUserIdAndDate,
  create,
  upsertByUserDate,
  update,
  remove,
};
