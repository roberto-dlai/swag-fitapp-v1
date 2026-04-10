const { getCurrentWeather } = require('../services/weather.service');
const { DEFAULT_LOCATION, DEFAULT_UNIT_PREF } = require('../utils/constants');

async function getWeather(req, res, next) {
  try {
    const location = req.userPrefs?.location || DEFAULT_LOCATION;
    const unit = req.userPrefs?.unit_pref || DEFAULT_UNIT_PREF;

    const weather = await getCurrentWeather({ location, unit });
    res.json(weather);
  } catch (err) {
    next(err);
  }
}

module.exports = { getWeather };
