const userModel = require('../models/user.model');

async function userPreferences(req, res, next) {
  try {
    if (!req.userId) {
      return next();
    }

    const user = await userModel.findById(req.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.userPrefs = {
      unit_pref: user.unit_pref,
      fitness_goal: user.fitness_goal,
      fitness_level: user.fitness_level,
      equipment: user.equipment,
      weekly_frequency: user.weekly_frequency,
      account_tier: user.account_tier,
      location: user.location,
      name: user.name,
    };

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = userPreferences;
