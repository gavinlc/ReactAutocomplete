/**
 * Matches a value against a possible value with error tolerance
 * @param {string} value - The input value to match
 * @param {string} possible - The possible value to match against
 * @returns {boolean} - Whether the value matches with error tolerance
 * @throws {TypeError} If either value or possible is not a string
 */
export const matchWithError = (value, possible) => {
  if (typeof value !== 'string' || typeof possible !== 'string') {
    throw new TypeError('Both value and possible must be strings');
  }

  const valueLower = value.toLowerCase();
  const possibleLower = possible.toLowerCase();

  if (possibleLower.startsWith(valueLower)) return true;
  const valueLetters = valueLower.split("");
  const possibleLetters = possibleLower.split("");

  let numberOfMatchingLetters = 0;

  valueLetters.forEach((letter, idx) => {
    if (letter === possibleLetters[idx]) {
      numberOfMatchingLetters++;
    }
  });

  return numberOfMatchingLetters >= value.length - 1;
}; 