import { isBooleanQueryMatch } from './isBooleanQueryMatch';

describe('isBooleanQueryMatch', () => {
  it('should return true if the value is true and the query is truthy', () => {
    expect(isBooleanQueryMatch(true, 'true')).toBe(true);
    expect(isBooleanQueryMatch(true, 'yes')).toBe(true);
  });

  it('should return true if the value is false and the query is falsy', () => {
    expect(isBooleanQueryMatch(false, 'false')).toBe(true);
    expect(isBooleanQueryMatch(false, 'no')).toBe(true);
  });

  it('should return false if the query is not a truthy or falsy value', () => {
    expect(isBooleanQueryMatch(true, 'maybe')).toBe(false);
  });

  it('should support custom truthy and falsy values', () => {
    expect(isBooleanQueryMatch(true, 'yay', { truthyValues: ['yay'] })).toBe(
      true
    );
    expect(isBooleanQueryMatch(false, 'nay', { falsyValues: ['nay'] })).toBe(
      true
    );
  });
});
