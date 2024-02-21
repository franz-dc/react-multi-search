import { isQueryMatch } from './isQueryMatch';

describe('isQueryMatch', () => {
  it('should support boolean values', () => {
    expect(isQueryMatch(true, 'true')).toBe(true);
  });

  it('should support number values', () => {
    expect(isQueryMatch(123, '123')).toBe(true);
  });

  it('should support date values', () => {
    expect(isQueryMatch(new Date('2021-01-01'), '2021-01-01')).toBe(true);
  });

  it('should support string values', () => {
    expect(isQueryMatch('hello', 'hello')).toBe(true);
  });

  it('should fallback to string comparison', () => {
    expect(isQueryMatch(null, 'null')).toBe(true);
    expect(isQueryMatch(undefined, 'undefined')).toBe(true);
    expect(isQueryMatch([1, 2, 3], '[1,2,3]')).toBe(true);
    expect(isQueryMatch({ a: 1 }, '{"a":1}')).toBe(true);
  });

  // Rest of the tests per data type are covered in their respective test files.
});
