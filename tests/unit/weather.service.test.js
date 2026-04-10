const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

process.env.JWT_SECRET = 'test-secret-that-is-at-least-32-characters-long';
process.env.WEATHER_API_KEY = 'test-key';

const { getCurrentWeather } = require('../../src/services/weather.service');

function mockHttpSuccess(data) {
  return { get: async () => ({ data }) };
}

function mockHttpFailure(message = 'Network error') {
  return { get: async () => { throw new Error(message); } };
}

describe('getCurrentWeather', () => {
  it('parses a successful API response (imperial)', async () => {
    const result = await getCurrentWeather({
      location: 'New York',
      unit: 'imperial',
      httpClient: mockHttpSuccess({
        main: { temp: 78, humidity: 45 },
        weather: [{ main: 'Clouds', description: 'partly cloudy' }],
      }),
    });

    assert.strictEqual(result.temperature, 78);
    assert.strictEqual(result.unit, 'fahrenheit');
    assert.strictEqual(result.condition, 'clouds');
    assert.strictEqual(result.humidity, 45);
    assert.strictEqual(result.isDefault, false);
  });

  it('returns metric unit label when requested', async () => {
    const result = await getCurrentWeather({
      location: 'Berlin',
      unit: 'metric',
      httpClient: mockHttpSuccess({
        main: { temp: 25, humidity: 60 },
        weather: [{ main: 'Clear', description: 'clear sky' }],
      }),
    });

    assert.strictEqual(result.unit, 'celsius');
    assert.strictEqual(result.temperature, 25);
  });

  it('returns imperial fallback when API fails', async () => {
    const result = await getCurrentWeather({
      location: 'New York',
      unit: 'imperial',
      httpClient: mockHttpFailure(),
    });

    assert.strictEqual(result.isDefault, true);
    assert.strictEqual(result.temperature, 70);
    assert.strictEqual(result.unit, 'fahrenheit');
  });

  it('returns metric fallback when API fails', async () => {
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
