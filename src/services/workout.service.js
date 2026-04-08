const { INDOOR_TEMP_THRESHOLD, HYDRATION_TEMP_THRESHOLD, FREE_TIER_MAX_SAVED_PLANS } = require('../utils/constants');
const { fahrenheitToCelsius } = require('../utils/unitConversion');

/**
 * Generate a single day's workout plan based on user preferences and weather.
 *
 * @param {object} options
 * @param {object} options.userPrefs - User preferences from DB
 * @param {object} options.weather - Weather data { temperature, unit, condition }
 * @param {Array}  options.exercises - Available exercises from DB
 * @returns {object} Generated workout plan
 */
function generateDailyWorkout({ userPrefs, weather, exercises }) {
  const plan = {
    exercises: [],
    tips: [],
    isIndoor: false,
    weather: null,
  };

  // Determine temperature in Fahrenheit for threshold checks
  let tempF = weather.temperature;
  if (weather.unit === 'celsius') {
    tempF = (weather.temperature * 9 / 5) + 32;
  }

  // Check if we should recommend indoor workouts
  try {
    if (tempF > INDOOR_TEMP_THRESHOLD || weather.condition === 'rain' || weather.condition === 'thunderstorm' || weather.condition === 'snow') {
      plan.isIndoor = true;
      if (tempF > INDOOR_TEMP_THRESHOLD) {
        plan.tips.push(`Temperature is ${Math.round(tempF)}°F — recommending indoor workouts.`);
      } else {
        plan.tips.push(`Weather is ${weather.condition} — recommending indoor workouts.`);
      }
    }
  } catch (err) {
    // If temperature check fails, default to indoor for safety
    plan.isIndoor = true;
    plan.tips.push('Unable to check weather conditions — defaulting to indoor workouts.');
  }

  // Hydration reminder
  if (tempF > HYDRATION_TEMP_THRESHOLD) {
    plan.tips.push('Stay hydrated! Temperature is high — drink water before, during, and after your workout.');
  }

  // Filter exercises by location
  let available = exercises.filter(ex => {
    if (plan.isIndoor) {
      return ex.location === 'indoor' || ex.location === 'both';
    }
    return true;
  });

  // Filter by difficulty/fitness level
  const levelOrder = { beginner: 0, intermediate: 1, advanced: 2 };
  const userLevel = levelOrder[userPrefs.fitness_level] ?? 0;
  available = available.filter(ex => {
    const exLevel = levelOrder[ex.difficulty] ?? 0;
    return exLevel <= userLevel;
  });

  // Filter by equipment the user has
  if (userPrefs.equipment && userPrefs.equipment.length > 0) {
    available = available.filter(ex =>
      ex.equipment === 'bodyweight' || userPrefs.equipment.includes(ex.equipment)
    );
  }

  // Select exercises based on fitness goal
  let selected = [];
  const goalMapping = {
    weight_loss: ['cardio', 'hiit'],
    strength: ['strength'],
    endurance: ['cardio', 'hiit'],
    general: ['cardio', 'strength', 'flexibility', 'hiit'],
  };
  const preferredCategories = goalMapping[userPrefs.fitness_goal] || goalMapping.general;

  // Prefer exercises matching the user's goal
  const goalExercises = available.filter(ex => preferredCategories.includes(ex.category));
  const otherExercises = available.filter(ex => !preferredCategories.includes(ex.category));

  // Pick 4-6 exercises depending on fitness level
  const exerciseCount = userPrefs.fitness_level === 'beginner' ? 4 :
                        userPrefs.fitness_level === 'intermediate' ? 5 : 6;

  // Shuffle and select
  const shuffled = [...goalExercises].sort(() => Math.random() - 0.5);
  const shuffledOther = [...otherExercises].sort(() => Math.random() - 0.5);

  selected = shuffled.slice(0, exerciseCount);
  if (selected.length < exerciseCount) {
    selected = selected.concat(shuffledOther.slice(0, exerciseCount - selected.length));
  }

  // Build exercise list with sets/reps/duration
  plan.exercises = selected.map((ex, index) => {
    const base = {
      exercise_id: ex.id,
      name: ex.name,
      category: ex.category,
      muscle_group: ex.muscle_group,
      equipment: ex.equipment,
      calories_per_min: ex.calories_per_min,
      order_index: index + 1,
    };

    if (ex.category === 'cardio' || ex.category === 'hiit') {
      base.duration_min = userPrefs.fitness_level === 'beginner' ? 10 :
                          userPrefs.fitness_level === 'intermediate' ? 15 : 20;
      base.sets = null;
      base.reps = null;
    } else if (ex.category === 'flexibility') {
      base.duration_min = 10;
      base.sets = null;
      base.reps = null;
    } else {
      base.sets = userPrefs.fitness_level === 'beginner' ? 2 :
                  userPrefs.fitness_level === 'intermediate' ? 3 : 4;
      base.reps = userPrefs.fitness_level === 'beginner' ? 10 :
                  userPrefs.fitness_level === 'intermediate' ? 12 : 15;
      base.duration_min = null;
    }

    return base;
  });

  // Estimate total duration
  let totalDuration = 0;
  for (const ex of plan.exercises) {
    if (ex.duration_min) {
      totalDuration += ex.duration_min;
    } else if (ex.sets && ex.reps) {
      // Rough estimate: ~45 seconds per set including rest
      totalDuration += Math.ceil(ex.sets * 0.75);
    }
  }
  plan.duration_min = totalDuration;

  // Weather info in response
  plan.weather = {
    temperature: weather.temperature,
    unit: weather.unit,
    condition: weather.condition,
  };

  return plan;
}

/**
 * Generate a 7-day workout plan.
 */
function generateWeeklyPlan({ userPrefs, forecasts, exercises }) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const today = new Date();
  const todayDayIndex = (today.getDay() + 6) % 7; // Monday = 0

  const plan = [];
  let workoutDaysCount = 0;
  let consecutiveWorkouts = 0;

  for (let i = 0; i < 7; i++) {
    const dayIndex = (todayDayIndex + i) % 7;
    const dayName = days[dayIndex];
    const forecast = forecasts[i] || { temperature: 70, condition: 'clear' };

    // Schedule rest days: after 3 consecutive workouts, or if weekly_frequency reached
    if (consecutiveWorkouts >= 3 || workoutDaysCount >= userPrefs.weekly_frequency) {
      plan.push({
        day: dayName,
        date: forecast.date,
        type: 'rest',
        exercises: [],
        tips: ['Rest day — recovery is essential for progress!'],
        isIndoor: false,
        weather: { temperature: forecast.temperature, condition: forecast.condition },
        duration_min: 0,
      });
      consecutiveWorkouts = 0;
      continue;
    }

    const weather = {
      temperature: forecast.temperature,
      unit: 'fahrenheit',
      condition: forecast.condition,
    };

    const dailyPlan = generateDailyWorkout({ userPrefs, weather, exercises });
    dailyPlan.day = dayName;
    dailyPlan.date = forecast.date;
    dailyPlan.type = 'workout';
    plan.push(dailyPlan);

    workoutDaysCount++;
    consecutiveWorkouts++;
  }

  return plan;
}

/**
 * Check if a user on the free tier has reached the saved plan limit.
 */
async function checkTierLimit(userId, accountTier, workoutModel) {
  if (accountTier === 'premium') return { allowed: true };

  const count = await workoutModel.countByUserId(userId);
  if (count >= FREE_TIER_MAX_SAVED_PLANS) {
    return {
      allowed: false,
      message: `Free tier is limited to ${FREE_TIER_MAX_SAVED_PLANS} saved workout plans. Upgrade to premium for unlimited plans.`,
    };
  }
  return { allowed: true };
}

module.exports = { generateDailyWorkout, generateWeeklyPlan, checkTierLimit };
