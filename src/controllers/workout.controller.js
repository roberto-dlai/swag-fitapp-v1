const workoutModel = require('../models/workout.model');
const exerciseModel = require('../models/exercise.model');
const { generateDailyWorkout, generateWeeklyPlan, checkTierLimit } = require('../services/workout.service');
const { getCurrentWeather, getForecast } = require('../services/weather.service');
const { calculateCalories } = require('../services/calorie.service');
const { isValidWorkoutStatus, isPositiveInteger } = require('../utils/validators');

async function getTodayWorkout(req, res, next) {
  try {
    // Generate a workout suggestion (not saved to DB)
    const weather = await getCurrentWeather({
      location: req.userPrefs.location,
      unit: 'imperial',
    });
    const allExercises = await exerciseModel.findAll();

    const plan = generateDailyWorkout({
      userPrefs: req.userPrefs,
      weather,
      exercises: allExercises,
    });

    res.json({
      workout: {
        exercises: plan.exercises,
        tips: plan.tips,
        isIndoor: plan.isIndoor,
        weather_temp: weather.temperature,
        weather_cond: weather.condition,
      },
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
    const { workout_type } = req.body;

    if (!workout_type) {
      return res.status(400).json({ error: 'workout_type is required' });
    }

    const weather = await getCurrentWeather({
      location: req.userPrefs.location,
      unit: 'imperial',
    });
    const allExercises = await exerciseModel.findAll();

    const customPrefs = { ...req.userPrefs, fitness_goal: workout_type };
    const plan = generateDailyWorkout({
      userPrefs: customPrefs,
      weather,
      exercises: allExercises,
    });

    res.json({
      workout: {
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

    // Attach exercises to each workout for category display
    const enriched = await Promise.all(workouts.map(async (w) => {
      const exercises = await workoutModel.findExercisesForWorkout(w.id);
      return { ...w, exercises };
    }));

    res.json({ workouts: enriched, streak });
  } catch (err) {
    next(err);
  }
}

async function createWorkout(req, res, next) {
  try {
    const { date, type, status, duration_min, notes, location } = req.body;

    // Skip tier limit for completed workouts (logging past workouts)
    if (status !== 'completed') {
      const tierCheck = await checkTierLimit(req.userId, req.userPrefs.account_tier, workoutModel);
      if (!tierCheck.allowed) {
        return res.status(403).json({ error: tierCheck.message });
      }
    }

    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    // Remove existing workout for this date (overwrite)
    await workoutModel.deleteByUserIdAndDate(req.userId, date);

    if (duration_min !== undefined && !isPositiveInteger(duration_min)) {
      return res.status(400).json({ error: 'duration_min must be a positive integer' });
    }

    if (status && !isValidWorkoutStatus(status)) {
      return res.status(400).json({ error: 'Invalid workout status' });
    }

    // Fetch current weather in imperial for storage
    let weatherTemp = null;
    let weatherCond = null;
    try {
      const weather = await getCurrentWeather({
        location: location || req.userPrefs.location,
        unit: 'imperial',
      });
      weatherTemp = weather.temperature;
      weatherCond = weather.condition;
    } catch (e) {
      // Weather fetch is optional
    }

    const workout = await workoutModel.create({
      userId: req.userId,
      date,
      type: type || 'custom',
      status: status || 'planned',
      durationMin: duration_min,
      notes,
      weatherTemp,
      weatherCond,
      location: location || req.userPrefs.location,
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
