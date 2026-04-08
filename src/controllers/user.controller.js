const userModel = require('../models/user.model');
const {
  isValidFitnessGoal,
  isValidFitnessLevel,
  isValidUnitPref,
  isPositiveInteger,
} = require('../utils/validators');

async function getProfile(req, res, next) {
  try {
    const user = await userModel.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

async function updatePreferences(req, res, next) {
  try {
    const updates = {};
    const errors = [];

    if (req.body.name !== undefined) {
      if (typeof req.body.name !== 'string' || req.body.name.trim().length === 0) {
        errors.push('Name must be a non-empty string');
      } else {
        updates.name = req.body.name.trim();
      }
    }

    if (req.body.location !== undefined) {
      if (typeof req.body.location !== 'string') {
        errors.push('Location must be a string');
      } else {
        updates.location = req.body.location;
      }
    }

    if (req.body.unit_pref !== undefined) {
      if (!isValidUnitPref(req.body.unit_pref)) {
        errors.push('unit_pref must be "imperial" or "metric"');
      } else {
        updates.unit_pref = req.body.unit_pref;
      }
    }

    if (req.body.fitness_goal !== undefined) {
      if (!isValidFitnessGoal(req.body.fitness_goal)) {
        errors.push('Invalid fitness_goal');
      } else {
        updates.fitness_goal = req.body.fitness_goal;
      }
    }

    if (req.body.fitness_level !== undefined) {
      if (!isValidFitnessLevel(req.body.fitness_level)) {
        errors.push('Invalid fitness_level');
      } else {
        updates.fitness_level = req.body.fitness_level;
      }
    }

    if (req.body.equipment !== undefined) {
      if (!Array.isArray(req.body.equipment)) {
        errors.push('Equipment must be an array');
      } else {
        updates.equipment = req.body.equipment;
      }
    }

    if (req.body.weekly_frequency !== undefined) {
      if (!isPositiveInteger(req.body.weekly_frequency) || req.body.weekly_frequency > 7) {
        errors.push('weekly_frequency must be between 1 and 7');
      } else {
        updates.weekly_frequency = req.body.weekly_frequency;
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const user = await userModel.updatePreferences(req.userId, updates);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (err) {
    next(err);
  }
}

module.exports = { getProfile, updatePreferences };
