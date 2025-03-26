import { matchWithError } from './matching';

describe('matchWithError', () => {
  test('matches exact prefix', () => {
    expect(matchWithError('Ap', 'Apple')).toBe(true);
    expect(matchWithError('Ap', 'Apricot')).toBe(true);
  });

  test('matches with one error', () => {
    expect(matchWithError('Ao', 'Apple')).toBe(true);
    expect(matchWithError('Appk', 'Apple')).toBe(true);
    expect(matchWithError('Mabg', 'Mango')).toBe(true);
  });

  test('does not match with two or more errors', () => {
    expect(matchWithError('Aii', 'Apple')).toBe(false);
    expect(matchWithError('Xyz', 'Apple')).toBe(false);
  });

  test('is case insensitive', () => {
    expect(matchWithError('ap', 'APPLE')).toBe(true);
    expect(matchWithError('AP', 'apple')).toBe(true);
  });

  test('throws error for non-string inputs', () => {
    expect(() => matchWithError(null, 'Apple')).toThrow(TypeError);
    expect(() => matchWithError('Apple', null)).toThrow(TypeError);
    expect(() => matchWithError(undefined, 'Apple')).toThrow(TypeError);
    expect(() => matchWithError('Apple', undefined)).toThrow(TypeError);
    expect(() => matchWithError(123, 'Apple')).toThrow(TypeError);
    expect(() => matchWithError('Apple', 123)).toThrow(TypeError);
  });

  test('handles empty strings', () => {
    expect(matchWithError('', 'Apple')).toBe(true);
    expect(matchWithError('Ap', '')).toBe(false);
    expect(matchWithError('', '')).toBe(true);
  });
}); 