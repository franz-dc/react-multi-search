import { isStringQueryMatch } from './isStringQueryMatch';

describe('isStringQueryMatch', () => {
  it('should match exact string', () => {
    expect(isStringQueryMatch('hello', '"hello"')).toBe(true);
  });

  it('should match partial string', () => {
    expect(isStringQueryMatch('hello world', 'world')).toBe(true);
  });

  it('should match case-insensitive', () => {
    expect(isStringQueryMatch('Hello', 'hello')).toBe(true);
  });

  it('should match case-insensitive with exact string', () => {
    expect(isStringQueryMatch('Hello', '"hello"')).toBe(true);
  });

  it('should match case-insensitive with partial string', () => {
    expect(isStringQueryMatch('Hello World', 'world')).toBe(true);
  });

  it('should match with quoted value', () => {
    expect(isStringQueryMatch('"World"', '""world""')).toBe(true);
  });

  it('should match with escaped quotes', () => {
    expect(isStringQueryMatch('Hello "World"', '\\"world\\"')).toBe(true);
  });
});
