module.exports = {
  // JWT
  JWT_EXPIRY: '24h',

  // Rate limiting
  AUTH_RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  AUTH_RATE_LIMIT_MAX: 20, // max requests per window

  // Workout statuses
  WORKOUT_STATUSES: ['planned', 'in_progress', 'completed', 'skipped'],

  // Unit preferences
  UNIT_PREFS: ['imperial', 'metric'],
};
