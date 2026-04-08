const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  fahrenheitToCelsius,
  celsiusToFahrenheit,
  lbsToKg,
  kgToLbs,
} = require('../../src/utils/unitConversion');

describe('fahrenheitToCelsius', () => {
  it('converts 32°F to 0°C', () => {
    assert.strictEqual(fahrenheitToCelsius(32), 0);
  });

  it('converts 212°F to 100°C', () => {
    assert.strictEqual(fahrenheitToCelsius(212), 100);
  });

  it('converts 95°F to 35°C', () => {
    assert.strictEqual(fahrenheitToCelsius(95), 35);
  });

  it('converts 0°F to approximately -17.78°C', () => {
    assert.ok(Math.abs(fahrenheitToCelsius(0) - (-17.7778)) < 0.01);
  });

  it('handles negative values', () => {
    assert.ok(fahrenheitToCelsius(-40) === -40);
  });
});

describe('celsiusToFahrenheit', () => {
  it('converts 0°C to 32°F', () => {
    assert.strictEqual(celsiusToFahrenheit(0), 32);
  });

  it('converts 100°C to 212°F', () => {
    assert.strictEqual(celsiusToFahrenheit(100), 212);
  });

  it('converts 35°C to 95°F', () => {
    assert.strictEqual(celsiusToFahrenheit(35), 95);
  });

  it('handles negative values', () => {
    assert.strictEqual(celsiusToFahrenheit(-40), -40);
  });
});

describe('lbsToKg', () => {
  it('converts 0 lbs to 0 kg', () => {
    assert.strictEqual(lbsToKg(0), 0);
  });

  it('converts 154 lbs to approximately 69.85 kg', () => {
    assert.ok(Math.abs(lbsToKg(154) - 69.85) < 0.1);
  });

  it('handles negative values', () => {
    assert.ok(lbsToKg(-10) < 0);
  });
});

describe('kgToLbs', () => {
  it('converts 0 kg to 0 lbs', () => {
    assert.strictEqual(kgToLbs(0), 0);
  });

  it('converts 70 kg to approximately 154.32 lbs', () => {
    assert.ok(Math.abs(kgToLbs(70) - 154.32) < 0.1);
  });

  it('handles negative values', () => {
    assert.ok(kgToLbs(-10) < 0);
  });
});
