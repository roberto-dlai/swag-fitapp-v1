const pool = require('../config/db');

async function findAll() {
  const { rows } = await pool.query('SELECT * FROM exercises ORDER BY id');
  return rows;
}

async function findByFilters({ location, difficulty, category, equipment }) {
  const conditions = [];
  const values = [];
  let paramIndex = 1;

  if (location) {
    conditions.push(`(location = $${paramIndex} OR location = 'both')`);
    values.push(location);
    paramIndex++;
  }

  if (difficulty) {
    conditions.push(`difficulty = $${paramIndex}`);
    values.push(difficulty);
    paramIndex++;
  }

  if (category) {
    conditions.push(`category = $${paramIndex}`);
    values.push(category);
    paramIndex++;
  }

  if (equipment) {
    conditions.push(`(equipment = 'bodyweight' OR equipment = $${paramIndex})`);
    values.push(equipment);
    paramIndex++;
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await pool.query(`SELECT * FROM exercises ${where} ORDER BY id`, values);
  return rows;
}

async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM exercises WHERE id = $1', [id]);
  return rows[0] || null;
}

module.exports = { findAll, findByFilters, findById };
