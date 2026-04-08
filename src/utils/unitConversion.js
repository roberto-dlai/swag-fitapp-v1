/**
 * Convert Fahrenheit to Celsius
 * Formula: (F - 32) * 5/9
 */
function fahrenheitToCelsius(f) {
  return (f - 32) * 5 / 9;
}

/**
 * Convert Celsius to Fahrenheit
 * Formula: (C * 9/5) + 32
 */
function celsiusToFahrenheit(c) {
  return (c * 9 / 5) + 32;
}

/**
 * Convert pounds to kilograms
 * 1 lb = 0.453592 kg
 */
function lbsToKg(lbs) {
  return lbs * 0.453592;
}

/**
 * Convert kilograms to pounds
 * 1 kg = 2.20462 lbs
 */
function kgToLbs(kg) {
  return kg * 2.20462;
}

module.exports = {
  fahrenheitToCelsius,
  celsiusToFahrenheit,
  lbsToKg,
  kgToLbs,
};
