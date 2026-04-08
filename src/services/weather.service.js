const config = require('../config');

const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

const DEFAULT_WEATHER = {
  temperature: 70,
  unit: 'fahrenheit',
  condition: 'clear',
  humidity: 50,
  description: 'Default weather (API unavailable)',
  isDefault: true,
};

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
    const isMetric = unit === 'metric';
    return {
      ...DEFAULT_WEATHER,
      temperature: isMetric ? 21 : 70,
      unit: isMetric ? 'celsius' : 'fahrenheit',
    };
  }
}

/**
 * @param {object} options
 * @param {string} options.location
 * @param {string} options.unit
 * @param {object} [options.httpClient]
 */
async function getForecast({ location, unit = 'imperial', httpClient }) {
  const http = httpClient || require('axios');
  const units = unit === 'metric' ? 'metric' : 'imperial';

  try {
    const response = await http.get(`${OPENWEATHER_BASE_URL}/forecast`, {
      params: {
        q: location,
        units,
        appid: config.weatherApiKey,
      },
    });

    const dailyForecasts = [];
    const seen = new Set();

    for (const item of response.data.list) {
      const date = item.dt_txt.split(' ')[0];
      if (!seen.has(date)) {
        seen.add(date);
        dailyForecasts.push({
          date,
          temperature: Math.round(item.main.temp),
          condition: item.weather[0].main.toLowerCase(),
          description: item.weather[0].description,
        });
      }
      if (dailyForecasts.length >= 7) break;
    }

    return {
      unit: units === 'metric' ? 'celsius' : 'fahrenheit',
      forecasts: dailyForecasts,
      isDefault: false,
    };
  } catch (err) {
    console.warn('Forecast API unavailable, using defaults:', err.message);
    const today = new Date();
    const forecasts = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      return {
        date: date.toISOString().split('T')[0],
        temperature: 70,
        condition: 'clear',
        description: 'Default forecast (API unavailable)',
      };
    });
    const isMetric = unit === 'metric';
    return {
      unit: isMetric ? 'celsius' : 'fahrenheit',
      forecasts: forecasts.map(f => ({ ...f, temperature: isMetric ? 21 : 70 })),
      isDefault: true,
    };
  }
}

module.exports = { getCurrentWeather, getForecast, DEFAULT_WEATHER };
