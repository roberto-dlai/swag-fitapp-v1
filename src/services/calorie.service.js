const { kgToLbs } = require('../utils/unitConversion');

/**
 * Calculate estimated calories burned for a workout.
 *
 * @param {object} options
 * @param {number} options.caloriesPerMin - Base calories/min (for a 70kg/154lb person)
 * @param {number} options.durationMin - Workout duration in minutes
 * @param {number} options.weight - User's weight
 * @param {string} options.weightUnit - 'imperial' (lbs) or 'metric' (kg)
 * @returns {number} Estimated calories burned, or 0 if inputs are invalid
 */
function calculateCalories({ caloriesPerMin, durationMin, weight, weightUnit }) {
  // Convert kg to lbs for consistent calculation
  let weightInLbs = weight;
  if (weightUnit === 'metric') {
    weightInLbs = kgToLbs(weight);
  }

  // Guard against invalid inputs
  if (!weightInLbs || !caloriesPerMin || !durationMin) return 0;
  if (isNaN(weightInLbs) || isNaN(caloriesPerMin) || isNaN(durationMin)) return 0;
  if (weightInLbs <= 0 || caloriesPerMin <= 0 || durationMin <= 0) return 0;

  // Adjust calories based on user's weight relative to the 154lb reference
  const weightFactor = weightInLbs / 154;
  const calories = caloriesPerMin * durationMin * weightFactor;

  return Math.round(calories * 100) / 100;
}

module.exports = { calculateCalories };
