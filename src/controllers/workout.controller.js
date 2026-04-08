const workoutModel = require('../models/workout.model');
const exerciseModel = require('../models/exercise.model');
const { generateDailyWorkout, generateWeeklyPlan, checkTierLimit } = require('../services/workout.service');
const { getCurrentWeather, getForecast } = require('../services/weather.service');
const { calculateCalories } = require('../services/calorie.service');
const { isValidWorkoutStatus, isPositiveInteger } = require('../utils/validators');

async function getTodayWorkout(req, res, next) {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Check if there's already a workout for today
    const existing = await workoutModel.findByUserIdAndDate(req.userId, today);
    if (existing) {
      const exercises = await workoutModel.findExercisesForWorkout(existing.id);
      return res.json({ workout: { ...existing, exercises } });
    }

    // Generate a new workout
    const weather = await getCurrentWeather({
      location: req.userPrefs.location,
      unit: req.userPrefs.unit_pref,
    });
    const allExercises = await exerciseModel.findAll();

    const plan = generateDailyWorkout({
      userPrefs: req.userPrefs,
      weather,
      exercises: allExercises,
    });

    // Save the generated workout
    const workout = await workoutModel.create({
      userId: req.userId,
      date: today,
      type: 'generated',
      status: 'planned',
      durationMin: plan.duration_min,
      weatherTemp: weather.temperature,
      weatherCond: weather.condition,
    });

    // Save the exercises
    if (plan.exercises.length > 0) {
      await workoutModel.addExercisesToWorkout(workout.id, plan.exercises);
    }

    const streak = await workoutModel.getStreak(req.userId);

    res.json({
      workout: {
        ...workout,
        exercises: plan.exercises,
        tips: plan.tips,
        isIndoor: plan.isIndoor,
      },
      streak,
    });
  } catch (err) {
    next(err);
  }
}

async function getWeeklyPlan(req, res, next) {
  try {
    const [currentWeather, forecast] = await Promise.all([
      getCurrentWeather({ location: req.userPrefs.location, unit: req.userPrefs.unit_pref }),
      getForecast({ location: req.userPrefs.location, unit: req.userPrefs.unit_pref }),
    ]);
    const allExercises = await exerciseModel.findAll();

    // Use current weather for today, forecast for the rest
    const todayStr = new Date().toISOString().split('T')[0];
    const todayForecast = {
      date: todayStr,
      temperature: currentWeather.temperature,
      condition: currentWeather.condition,
    };
    const futureDays = forecast.forecasts.filter(f => f.date !== todayStr);
    const combinedForecasts = [todayForecast, ...futureDays];

    const plan = generateWeeklyPlan({
      userPrefs: req.userPrefs,
      forecasts: combinedForecasts,
      exercises: allExercises,
    });

    res.json({ plan, forecastUnit: forecast.unit });
  } catch (err) {
    next(err);
  }
}

async function customizeToday(req, res, next) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { workout_type } = req.body;

    if (!workout_type) {
      return res.status(400).json({ error: 'workout_type is required' });
    }

    // Get or create today's workout
    let workout = await workoutModel.findByUserIdAndDate(req.userId, today);

    const weather = await getCurrentWeather({
      location: req.userPrefs.location,
      unit: req.userPrefs.unit_pref,
    });
    const allExercises = await exerciseModel.findAll();

    // Override fitness goal with the requested type for generation
    const customPrefs = { ...req.userPrefs, fitness_goal: workout_type };
    const plan = generateDailyWorkout({
      userPrefs: customPrefs,
      weather,
      exercises: allExercises,
    });

    if (workout) {
      // Clear old exercises and update
      await workoutModel.clearExercises(workout.id);
      workout = await workoutModel.update(workout.id, {
        type: 'custom',
        duration_min: plan.duration_min,
      });
    } else {
      // Create new
      workout = await workoutModel.create({
        userId: req.userId,
        date: today,
        type: 'custom',
        status: 'planned',
        durationMin: plan.duration_min,
        weatherTemp: weather.temperature,
        weatherCond: weather.condition,
      });
    }

    if (plan.exercises.length > 0) {
      await workoutModel.addExercisesToWorkout(workout.id, plan.exercises);
    }

    res.json({
      workout: {
        ...workout,
        exercises: plan.exercises,
        tips: plan.tips,
        isIndoor: plan.isIndoor,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function getHistory(req, res, next) {
  try {
    const workouts = await workoutModel.findHistoryByUserId(req.userId);
    const streak = await workoutModel.getStreak(req.userId);
    res.json({ workouts, streak });
  } catch (err) {
    next(err);
  }
}

async function createWorkout(req, res, next) {
  try {
    // Check tier limit
    const tierCheck = await checkTierLimit(req.userId, req.userPrefs.account_tier, workoutModel);
    if (!tierCheck.allowed) {
      return res.status(403).json({ error: tierCheck.message });
    }

    const { date, type, status, duration_min, notes } = req.body;

    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    if (duration_min !== undefined && !isPositiveInteger(duration_min)) {
      return res.status(400).json({ error: 'duration_min must be a positive integer' });
    }

    if (status && !isValidWorkoutStatus(status)) {
      return res.status(400).json({ error: 'Invalid workout status' });
    }

    const workout = await workoutModel.create({
      userId: req.userId,
      date,
      type: type || 'custom',
      status: status || 'planned',
      durationMin: duration_min,
      notes,
    });

    res.status(201).json({ workout });
  } catch (err) {
    next(err);
  }
}

async function updateWorkout(req, res, next) {
  try {
    const { id } = req.params;
    const updates = {};

    if (req.body.status !== undefined) {
      if (!isValidWorkoutStatus(req.body.status)) {
        return res.status(400).json({ error: 'Invalid workout status' });
      }
      updates.status = req.body.status;
    }

    if (req.body.duration_min !== undefined) {
      updates.duration_min = req.body.duration_min;
    }

    if (req.body.calories_burned !== undefined) {
      updates.calories_burned = req.body.calories_burned;
    }

    if (req.body.notes !== undefined) {
      updates.notes = req.body.notes;
    }

    if (req.body.type !== undefined) {
      updates.type = req.body.type;
    }

    const workout = await workoutModel.update(id, updates);
    if (!workout) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    res.json({ workout });
  } catch (err) {
    next(err);
  }
}

async function deleteWorkout(req, res, next) {
  try {
    const deleted = await workoutModel.remove(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Workout not found' });
    }
    res.json({ message: 'Workout deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getTodayWorkout,
  getWeeklyPlan,
  customizeToday,
  getHistory,
  createWorkout,
  updateWorkout,
  deleteWorkout,
};
