const { getCurrentWeather, getForecast } = require('../services/weather.service');

async function getWeather(req, res, next) {
  try {
    const location = req.userPrefs?.location || 'New York';
    const unit = req.userPrefs?.unit_pref || 'imperial';

    const weather = await getCurrentWeather({ location, unit });
    res.json(weather);
  } catch (err) {
    next(err);
  }
}

async function getWeatherForecast(req, res, next) {
  try {
    const location = req.userPrefs?.location || 'New York';
    const unit = req.userPrefs?.unit_pref || 'imperial';

    const forecast = await getForecast({ location, unit });
    res.json(forecast);
  } catch (err) {
    next(err);
  }
}

module.exports = { getWeather, getWeatherForecast };
