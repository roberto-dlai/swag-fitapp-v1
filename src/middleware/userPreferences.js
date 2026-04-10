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
      location: user.location,
      name: user.name,
      email: user.email,
    };

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = userPreferences;
