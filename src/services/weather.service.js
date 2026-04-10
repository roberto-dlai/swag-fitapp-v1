const config = require('../config');

const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

const DEFAULT_TEMP_F = 70;
const DEFAULT_TEMP_C = 21;

const DEFAULT_WEATHER = {
  temperature: DEFAULT_TEMP_F,
  unit: 'fahrenheit',
  condition: 'clear',
  humidity: 50,
  description: 'Default weather (API unavailable)',
  isDefault: true,
};

function fallbackWeather(unit) {
  const isMetric = unit === 'metric';
  return {
    ...DEFAULT_WEATHER,
    temperature: isMetric ? DEFAULT_TEMP_C : DEFAULT_TEMP_F,
    unit: isMetric ? 'celsius' : 'fahrenheit',
  };
}

/**
 * @param {object} options
 * @param {string} options.location - City name
 * @param {string} options.unit - 'imperial' or 'metric'
 * @param {object} [options.httpClient] - Injectable HTTP client (defaults to axios)
 */
async function getCurrentWeather({ location, unit = 'imperial', httpClient }) {
  const http = httpClient || require('axios');
  const units = unit === 'metric' ? 'metric' : 'imperial';

  try {
    const response = await http.get(`${OPENWEATHER_BASE_URL}/weather`, {
      params: {
        q: location,
        units,
        appid: config.weatherApiKey,
      },
    });

    const data = response.data;
    return {
      temperature: Math.round(data.main.temp),
      unit: units === 'metric' ? 'celsius' : 'fahrenheit',
      condition: data.weather[0].main.toLowerCase(),
      humidity: data.main.humidity,
      description: data.weather[0].description,
      isDefault: false,
    };
  } catch (err) {
    console.warn('Weather API unavailable, using defaults:', err.message);
    return fallbackWeather(unit);
  }
}

module.exports = { getCurrentWeather, DEFAULT_WEATHER };
