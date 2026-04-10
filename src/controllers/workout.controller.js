const workoutModel = require('../models/workout.model');
const { getCurrentWeather } = require('../services/weather.service');
const {
  isValidWorkoutStatus,
  isValidWorkoutType,
  isPositiveInteger,
} = require('../utils/validators');
const { DEFAULT_WORKOUT_TYPE, DEFAULT_WORKOUT_STATUS } = require('../utils/constants');

async function getHistory(req, res, next) {
  try {
    const workouts = await workoutModel.findHistoryByUserId(req.userId);
    res.json({ workouts });
  } catch (err) {
    next(err);
  }
}

async function createWorkout(req, res, next) {
  try {
    const { date, type, status, duration_min, notes, location } = req.body;

    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    if (duration_min !== undefined && !isPositiveInteger(duration_min)) {
      return res.status(400).json({ error: 'duration_min must be a positive integer' });
    }

    if (status && !isValidWorkoutStatus(status)) {
      return res.status(400).json({ error: 'Invalid workout status' });
    }

    if (type && !isValidWorkoutType(type)) {
      return res.status(400).json({ error: 'Invalid workout type' });
    }

    // Fetch current weather in imperial for audit trail (optional)
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

    // Atomic replace: deletes any existing workout for this date and inserts
    // the new one in a single transaction so a failed insert cannot lose data.
    const workout = await workoutModel.upsertByUserDate({
      userId: req.userId,
      date,
      type: type || DEFAULT_WORKOUT_TYPE,
      status: status || DEFAULT_WORKOUT_STATUS,
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

    if (req.body.type !== undefined) {
      if (!isValidWorkoutType(req.body.type)) {
        return res.status(400).json({ error: 'Invalid workout type' });
      }
      updates.type = req.body.type;
    }

    if (req.body.duration_min !== undefined) {
      if (!isPositiveInteger(req.body.duration_min)) {
        return res.status(400).json({ error: 'duration_min must be a positive integer' });
      }
      updates.duration_min = req.body.duration_min;
    }

    if (req.body.notes !== undefined) {
      if (typeof req.body.notes !== 'string') {
        return res.status(400).json({ error: 'notes must be a string' });
      }
      updates.notes = req.body.notes;
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
  getHistory,
  createWorkout,
  updateWorkout,
  deleteWorkout,
};
