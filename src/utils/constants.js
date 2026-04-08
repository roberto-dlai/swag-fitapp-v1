module.exports = {
  // Account tier limits
  FREE_TIER_MAX_SAVED_PLANS: 3,

  // Weather thresholds (in Fahrenheit)
  INDOOR_TEMP_THRESHOLD: 95,
  HYDRATION_TEMP_THRESHOLD: 85,

  // JWT
  JWT_EXPIRY: '24h',

  // Rate limiting
  AUTH_RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  AUTH_RATE_LIMIT_MAX: 20, // max requests per window

  // Workout statuses
  WORKOUT_STATUSES: ['planned', 'in_progress', 'completed', 'skipped'],

  // Fitness goals
  FITNESS_GOALS: ['weight_loss', 'strength', 'endurance', 'general'],

  // Fitness levels
  FITNESS_LEVELS: ['beginner', 'intermediate', 'advanced'],

  // Unit preferences
  UNIT_PREFS: ['imperial', 'metric'],

  // Account tiers
  ACCOUNT_TIERS: ['free', 'premium'],

  // Exercise categories
  EXERCISE_CATEGORIES: ['cardio', 'strength', 'flexibility', 'hiit'],

  // Exercise locations
  EXERCISE_LOCATIONS: ['indoor', 'outdoor', 'both'],

  // Muscle groups
  MUSCLE_GROUPS: ['upper_body', 'lower_body', 'core', 'full_body'],
};
