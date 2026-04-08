const pool = require('../config/db');

/**
 * Middleware factory that checks if the authenticated user owns the requested resource.
 * Looks up the resource in the specified table and compares user_id to req.userId.
 *
 * @param {string} table - The database table to check (e.g., 'workouts')
 * @param {string} [paramName='id'] - The route parameter containing the resource ID
 */
function authorize(table, paramName = 'id') {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[paramName];

      if (!resourceId) {
        return res.status(400).json({ error: 'Resource ID is required' });
      }

      const { rows } = await pool.query(
        `SELECT user_id FROM ${table} WHERE id = $1`,
        [resourceId]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Resource not found' });
      }

      if (rows[0].user_id !== req.userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = authorize;
