const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { calculateCalories } = require('../../src/services/calorie.service');

describe('calculateCalories', () => {
  it('calculates correctly for imperial (lbs) input', () => {
    const result = calculateCalories({
      caloriesPerMin: 10,
      durationMin: 30,
      weight: 154,
      weightUnit: 'imperial',
    });
    // 154 lbs is the reference weight, so factor = 1.0
    // 10 * 30 * 1.0 = 300
    assert.strictEqual(result, 300);
  });

  it('calculates correctly for metric (kg) input', () => {
    const result = calculateCalories({
      caloriesPerMin: 10,
      durationMin: 30,
      weight: 70,
      weightUnit: 'metric',
    });
    // 70 kg = ~154.32 lbs, factor ~1.002
    // 10 * 30 * 1.002 = ~300.6
    assert.ok(result > 299 && result < 302);
  });

  it('returns 0 for zero weight', () => {
    const result = calculateCalories({
      caloriesPerMin: 10,
      durationMin: 30,
      weight: 0,
      weightUnit: 'imperial',
    });
    assert.strictEqual(result, 0);
  });

  it('returns 0 for negative duration', () => {
    const result = calculateCalories({
      caloriesPerMin: 10,
      durationMin: -5,
      weight: 154,
      weightUnit: 'imperial',
    });
    assert.strictEqual(result, 0);
  });

  it('returns 0 for undefined weight', () => {
    const result = calculateCalories({
      caloriesPerMin: 10,
      durationMin: 30,
      weight: undefined,
      weightUnit: 'imperial',
    });
    assert.strictEqual(result, 0);
  });

  it('returns 0 for NaN caloriesPerMin', () => {
    const result = calculateCalories({
      caloriesPerMin: NaN,
      durationMin: 30,
      weight: 154,
      weightUnit: 'imperial',
    });
    assert.strictEqual(result, 0);
  });

  it('returns 0 for negative weight', () => {
    const result = calculateCalories({
      caloriesPerMin: 10,
      durationMin: 30,
      weight: -70,
      weightUnit: 'imperial',
    });
    assert.strictEqual(result, 0);
  });

  it('scales calories by weight factor', () => {
    const light = calculateCalories({
      caloriesPerMin: 10,
      durationMin: 30,
      weight: 100,
      weightUnit: 'imperial',
    });
    const heavy = calculateCalories({
      caloriesPerMin: 10,
      durationMin: 30,
      weight: 200,
      weightUnit: 'imperial',
    });
    assert.ok(heavy > light);
  });
});
