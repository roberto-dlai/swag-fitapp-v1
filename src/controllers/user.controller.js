const userModel = require('../models/user.model');
const { isValidUnitPref } = require('../utils/validators');

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
