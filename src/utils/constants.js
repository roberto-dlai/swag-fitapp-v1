module.exports = {
  // JWT
  JWT_EXPIRY: '24h',

  // Rate limiting
  AUTH_RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  AUTH_RATE_LIMIT_MAX: 20, // max requests per window

  // Workout type values (API contract with frontend)
  WORKOUT_TYPES: ['cardio', 'strength', 'endurance'],
  DEFAULT_WORKOUT_TYPE: 'cardio',

  // Unit preferences
  UNIT_PREFS: ['imperial', 'metric'],
  DEFAULT_UNIT_PREF: 'imperial',
  DEFAULT_LOCATION: 'New York',
};
