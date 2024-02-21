import { isNumberQueryMatch } from './isNumberQueryMatch';

describe('isNumberQueryMatch', () => {
  it('should match exact number', () => {
    expect(isNumberQueryMatch(123, '123')).toBe(true);
  });

  it('should match range with >', () => {
    expect(isNumberQueryMatch(123, '>100')).toBe(true);
  });

  it('should match range with >=', () => {
    expect(isNumberQueryMatch(123, '>=100')).toBe(true);
  });

  it('should match range with <', () => {
    expect(isNumberQueryMatch(123, '<200')).toBe(true);
  });

  it('should match range with <=', () => {
    expect(isNumberQueryMatch(123, '<=200')).toBe(true);
  });

  it('should match range with !=', () => {
    expect(isNumberQueryMatch(123, '!=100')).toBe(true);
    expect(isNumberQueryMatch(123, '!=123')).toBe(false);
  });

  it('should not match invalid range', () => {
    expect(isNumberQueryMatch(123, '100-200')).toBe(false);
  });

  it('should not match invalid operator', () => {
    expect(isNumberQueryMatch(123, '><100')).toBe(false);
    expect(isNumberQueryMatch(123, '==100')).toBe(false);
  });

  it('should not match invalid operand', () => {
    expect(isNumberQueryMatch(123, '>abc')).toBe(false);
  });

  it('should not match invalid number', () => {
    expect(isNumberQueryMatch(123, 'abc')).toBe(false);
  });

  it('should support spaces', () => {
    expect(isNumberQueryMatch(123, '>   100')).toBe(true);
  });
});
