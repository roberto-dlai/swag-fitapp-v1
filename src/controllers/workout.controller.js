const workoutModel = require('../models/workout.model');
const { isValidWorkoutType, isPositiveInteger } = require('../utils/validators');
const { DEFAULT_WORKOUT_TYPE } = require('../utils/constants');

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
    const { date, type, duration_min, location } = req.body;

    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    const today = new Date().toISOString().split('T')[0];
    if (date > today) {
      return res.status(400).json({ error: 'Cannot log a workout for a future date' });
    }

    if (duration_min !== undefined && !isPositiveInteger(duration_min)) {
      return res.status(400).json({ error: 'duration_min must be a positive integer' });
    }

    if (type && !isValidWorkoutType(type)) {
      return res.status(400).json({ error: 'Invalid workout type' });
    }

    // Atomic replace: deletes any existing workout for this date and inserts
    // the new one in a single transaction so a failed insert cannot lose data.
    const workout = await workoutModel.upsertByUserDate({
      userId: req.userId,
      date,
      type: type || DEFAULT_WORKOUT_TYPE,
      durationMin: duration_min,
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
