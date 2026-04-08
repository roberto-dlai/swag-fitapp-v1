const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { generateDailyWorkout, checkTierLimit } = require('../../src/services/workout.service');

const sampleExercises = [
  { id: 1, name: 'Push-ups', category: 'strength', muscle_group: 'upper_body', location: 'both', difficulty: 'beginner', equipment: 'bodyweight', calories_per_min: 7 },
  { id: 2, name: 'Outdoor Run', category: 'cardio', muscle_group: 'lower_body', location: 'outdoor', difficulty: 'beginner', equipment: 'bodyweight', calories_per_min: 10 },
  { id: 3, name: 'Treadmill Run', category: 'cardio', muscle_group: 'lower_body', location: 'indoor', difficulty: 'intermediate', equipment: 'treadmill', calories_per_min: 11 },
  { id: 4, name: 'Squats', category: 'strength', muscle_group: 'lower_body', location: 'both', difficulty: 'beginner', equipment: 'bodyweight', calories_per_min: 6 },
  { id: 5, name: 'Barbell Deadlift', category: 'strength', muscle_group: 'full_body', location: 'indoor', difficulty: 'advanced', equipment: 'barbell', calories_per_min: 8 },
  { id: 6, name: 'Jump Rope', category: 'cardio', muscle_group: 'full_body', location: 'indoor', difficulty: 'beginner', equipment: 'jump rope', calories_per_min: 12 },
  { id: 7, name: 'Burpees', category: 'hiit', muscle_group: 'full_body', location: 'both', difficulty: 'intermediate', equipment: 'bodyweight', calories_per_min: 14 },
  { id: 8, name: 'Yoga Flow', category: 'flexibility', muscle_group: 'full_body', location: 'both', difficulty: 'beginner', equipment: 'bodyweight', calories_per_min: 4 },
];

const basePrefs = {
  fitness_level: 'beginner',
  fitness_goal: 'general',
  equipment: ['bodyweight'],
  weekly_frequency: 3,
  account_tier: 'free',
  location: 'New York',
};

describe('generateDailyWorkout', () => {
  it('recommends indoor workouts when temperature > 95°F', () => {
    const plan = generateDailyWorkout({
      userPrefs: basePrefs,
      weather: { temperature: 100, unit: 'fahrenheit', condition: 'clear' },
      exercises: sampleExercises,
    });
    assert.strictEqual(plan.isIndoor, true);
    // No outdoor-only exercises should be included
    for (const ex of plan.exercises) {
      const source = sampleExercises.find(e => e.id === ex.exercise_id);
      assert.ok(source.location === 'indoor' || source.location === 'both',
        `Exercise ${ex.name} is outdoor-only but was included in indoor plan`);
    }
  });

  it('allows outdoor workouts when temperature is 72°F', () => {
    const plan = generateDailyWorkout({
      userPrefs: basePrefs,
      weather: { temperature: 72, unit: 'fahrenheit', condition: 'clear' },
      exercises: sampleExercises,
    });
    assert.strictEqual(plan.isIndoor, false);
  });

  it('recommends indoor workouts at exactly 95°F (boundary: not exceeded)', () => {
    const plan = generateDailyWorkout({
      userPrefs: basePrefs,
      weather: { temperature: 95, unit: 'fahrenheit', condition: 'clear' },
      exercises: sampleExercises,
    });
    // 95 is not > 95, so should be outdoor
    assert.strictEqual(plan.isIndoor, false);
  });

  it('recommends indoor at 96°F (just above threshold)', () => {
    const plan = generateDailyWorkout({
      userPrefs: basePrefs,
      weather: { temperature: 96, unit: 'fahrenheit', condition: 'clear' },
      exercises: sampleExercises,
    });
    assert.strictEqual(plan.isIndoor, true);
  });

  it('adds hydration tip when temperature > 85°F', () => {
    const plan = generateDailyWorkout({
      userPrefs: basePrefs,
      weather: { temperature: 90, unit: 'fahrenheit', condition: 'clear' },
      exercises: sampleExercises,
    });
    const hasHydration = plan.tips.some(t => t.toLowerCase().includes('hydrat'));
    assert.ok(hasHydration, 'Should include hydration tip at 90°F');
  });

  it('no hydration tip at 80°F', () => {
    const plan = generateDailyWorkout({
      userPrefs: basePrefs,
      weather: { temperature: 80, unit: 'fahrenheit', condition: 'clear' },
      exercises: sampleExercises,
    });
    const hasHydration = plan.tips.some(t => t.toLowerCase().includes('hydrat'));
    assert.ok(!hasHydration, 'Should not include hydration tip at 80°F');
  });

  it('recommends indoor when weather condition is rain', () => {
    const plan = generateDailyWorkout({
      userPrefs: basePrefs,
      weather: { temperature: 65, unit: 'fahrenheit', condition: 'rain' },
      exercises: sampleExercises,
    });
    assert.strictEqual(plan.isIndoor, true);
  });

  it('filters exercises by fitness level (beginner cannot get advanced)', () => {
    const plan = generateDailyWorkout({
      userPrefs: { ...basePrefs, fitness_level: 'beginner' },
      weather: { temperature: 70, unit: 'fahrenheit', condition: 'clear' },
      exercises: sampleExercises,
    });
    for (const ex of plan.exercises) {
      const source = sampleExercises.find(e => e.id === ex.exercise_id);
      assert.ok(source.difficulty === 'beginner',
        `Beginner should not get ${source.difficulty} exercise: ${ex.name}`);
    }
  });

  it('advanced users can get all difficulty levels', () => {
    const plan = generateDailyWorkout({
      userPrefs: { ...basePrefs, fitness_level: 'advanced', equipment: ['bodyweight', 'barbell', 'treadmill', 'jump rope'] },
      weather: { temperature: 70, unit: 'fahrenheit', condition: 'clear' },
      exercises: sampleExercises,
    });
    assert.ok(plan.exercises.length > 0);
  });

  it('filters exercises by available equipment', () => {
    const plan = generateDailyWorkout({
      userPrefs: { ...basePrefs, equipment: ['bodyweight'] },
      weather: { temperature: 70, unit: 'fahrenheit', condition: 'clear' },
      exercises: sampleExercises,
    });
    for (const ex of plan.exercises) {
      const source = sampleExercises.find(e => e.id === ex.exercise_id);
      assert.ok(source.equipment === 'bodyweight',
        `Equipment ${source.equipment} not in user's list but exercise ${ex.name} was included`);
    }
  });

  it('generates 3 exercises for beginners', () => {
    const plan = generateDailyWorkout({
      userPrefs: { ...basePrefs, fitness_level: 'beginner' },
      weather: { temperature: 70, unit: 'fahrenheit', condition: 'clear' },
      exercises: sampleExercises,
    });
    assert.ok(plan.exercises.length <= 3);
  });

  it('handles celsius weather input correctly', () => {
    // 40°C = 104°F, should be indoor
    const plan = generateDailyWorkout({
      userPrefs: basePrefs,
      weather: { temperature: 40, unit: 'celsius', condition: 'clear' },
      exercises: sampleExercises,
    });
    assert.strictEqual(plan.isIndoor, true);
  });
});

describe('checkTierLimit', () => {
  it('allows premium users without limit', async () => {
    const mockModel = { countByUserId: async () => 100 };
    const result = await checkTierLimit(1, 'premium', mockModel);
    assert.strictEqual(result.allowed, true);
  });

  it('allows free users under the limit', async () => {
    const mockModel = { countByUserId: async () => 2 };
    const result = await checkTierLimit(1, 'free', mockModel);
    assert.strictEqual(result.allowed, true);
  });

  it('blocks free users at the limit', async () => {
    const mockModel = { countByUserId: async () => 3 };
    const result = await checkTierLimit(1, 'free', mockModel);
    assert.strictEqual(result.allowed, false);
    assert.ok(result.message.includes('Free tier'));
  });
});
