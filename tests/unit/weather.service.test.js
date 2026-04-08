const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { getCurrentWeather, getForecast, DEFAULT_WEATHER } = require('../../src/services/weather.service');

// Mock HTTP client that returns a successful response
function mockHttpSuccess(data) {
  return {
    get: async () => ({ data }),
  };
}

// Mock HTTP client that throws an error
function mockHttpFailure(message = 'Network error') {
  return {
    get: async () => { throw new Error(message); },
  };
}

describe('getCurrentWeather', () => {
  it('parses a successful API response', async () => {
    const mockData = {
      main: { temp: 78, humidity: 45 },
      weather: [{ main: 'Clouds', description: 'partly cloudy' }],
    };

    const result = await getCurrentWeather({
      location: 'New York',
      unit: 'imperial',
      httpClient: mockHttpSuccess(mockData),
    });

    assert.strictEqual(result.temperature, 78);
    assert.strictEqual(result.unit, 'fahrenheit');
    assert.strictEqual(result.condition, 'clouds');
    assert.strictEqual(result.humidity, 45);
    assert.strictEqual(result.isDefault, false);
  });

  it('returns metric unit label when unit is metric', async () => {
    const mockData = {
      main: { temp: 25, humidity: 60 },
      weather: [{ main: 'Clear', description: 'clear sky' }],
    };

    const result = await getCurrentWeather({
      location: 'Berlin',
      unit: 'metric',
      httpClient: mockHttpSuccess(mockData),
    });

    assert.strictEqual(result.unit, 'celsius');
    assert.strictEqual(result.temperature, 25);
  });

  it('returns fallback default when API fails (imperial)', async () => {
    const result = await getCurrentWeather({
      location: 'New York',
      unit: 'imperial',
      httpClient: mockHttpFailure(),
    });

    assert.strictEqual(result.isDefault, true);
    assert.strictEqual(result.temperature, 70);
    assert.strictEqual(result.unit, 'fahrenheit');
  });

  it('returns fallback default when API fails (metric)', async () => {
    const result = await getCurrentWeather({
      location: 'Berlin',
      unit: 'metric',
      httpClient: mockHttpFailure(),
    });

    assert.strictEqual(result.isDefault, true);
    assert.strictEqual(result.temperature, 21);
    assert.strictEqual(result.unit, 'celsius');
  });
});

describe('getForecast', () => {
  it('parses forecast into daily entries', async () => {
    const mockData = {
      list: [
        { dt_txt: '2026-04-09 12:00:00', main: { temp: 72 }, weather: [{ main: 'Clear', description: 'clear' }] },
        { dt_txt: '2026-04-09 18:00:00', main: { temp: 68 }, weather: [{ main: 'Clear', description: 'clear' }] },
        { dt_txt: '2026-04-10 12:00:00', main: { temp: 75 }, weather: [{ main: 'Clouds', description: 'cloudy' }] },
        { dt_txt: '2026-04-11 12:00:00', main: { temp: 65 }, weather: [{ main: 'Rain', description: 'rain' }] },
      ],
    };

    const result = await getForecast({
      location: 'New York',
      unit: 'imperial',
      httpClient: mockHttpSuccess(mockData),
    });

    assert.strictEqual(result.isDefault, false);
    assert.strictEqual(result.unit, 'fahrenheit');
    // Should deduplicate to 3 unique dates
    assert.strictEqual(result.forecasts.length, 3);
    assert.strictEqual(result.forecasts[0].date, '2026-04-09');
    assert.strictEqual(result.forecasts[0].temperature, 72);
  });

  it('returns 7-day default forecast when API fails', async () => {
    const result = await getForecast({
      location: 'New York',
      unit: 'imperial',
      httpClient: mockHttpFailure(),
    });

    assert.strictEqual(result.isDefault, true);
    assert.strictEqual(result.forecasts.length, 7);
    assert.strictEqual(result.forecasts[0].temperature, 70);
  });
});
