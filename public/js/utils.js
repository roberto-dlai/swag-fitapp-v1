// Shared frontend utilities and constants.

const WORKOUT_TYPE_LABELS = {
  cardio: 'Cardio',
  strength: 'Strength',
  endurance: 'Endurance',
};

const DURATION_MIN_HOURS = 60;
const DURATION_MIN_VALID = 0.5;
const DURATION_MAX_VALID = 2.5;

/**
 * Create a DOM element with className and text content in one call.
 * Usage: createEl('div', 'card-title', 'Hello')
 */
function createEl(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined && text !== null) el.textContent = String(text);
  return el;
}

/**
 * Format a duration in minutes as hours, rounded to the nearest valid dropdown
 * value and clamped to [0.5, 2.5]. Returns e.g. "1 hr" or "1.5 hrs".
 */
function formatDuration(durationMin) {
  const rawHrs = durationMin / DURATION_MIN_HOURS;
  const hrs = Math.round(rawHrs * 2) / 2;
  const clamped = Math.max(DURATION_MIN_VALID, Math.min(DURATION_MAX_VALID, hrs));
  return clamped === 1 ? '1 hr' : `${clamped} hrs`;
}

/**
 * Get the display label for a workout type (e.g. "Cardio"), falling back to Cardio.
 */
function workoutTypeLabel(type) {
  return WORKOUT_TYPE_LABELS[type] || WORKOUT_TYPE_LABELS.cardio;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function dayNameForDate(dateString) {
  return DAY_NAMES[new Date(dateString).getUTCDay()];
}
