const { UNIT_PREFS, WORKOUT_TYPES } = require('./constants');

function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPassword(password) {
  if (typeof password !== 'string') return false;
  return password.length >= 8;
}

function isValidRating(rating) {
  return Number.isInteger(rating) && rating >= 1 && rating <= 5;
}

function isPositiveInteger(value) {
  return Number.isInteger(value) && value > 0;
}

function isValidUnitPref(unit) {
  return UNIT_PREFS.includes(unit);
}

function isValidWorkoutType(type) {
  return WORKOUT_TYPES.includes(type);
}

/**
 * Sanitize a value to ensure it is a primitive (not an object).
 * Prevents MongoDB operator injection (e.g., { $gt: "" }).
 */
function sanitizePrimitive(value) {
  if (value === null || value === undefined) return value;
  if (typeof value === 'object') {
    throw new Error('Invalid input: objects are not allowed');
  }
  return value;
}

module.exports = {
  isValidEmail,
  isValidPassword,
  isValidRating,
  isPositiveInteger,
  isValidUnitPref,
  isValidWorkoutType,
  sanitizePrimitive,
};
