import { isDateQueryMatch } from './isDateQueryMatch';

describe('isDateQueryMatch', () => {
  it('should support date value', () => {
    expect(isDateQueryMatch(new Date('2021-01-01'), '2021-01-01')).toBe(true);
  });

  it('should support string value', () => {
    expect(isDateQueryMatch('2021-01-01', '2021-01-01')).toBe(true);
  });

  it('should match exact date', () => {
    expect(isDateQueryMatch(new Date('2021-01-01'), '2021-01-01')).toBe(true);
  });

  it('should match partial date', () => {
    expect(isDateQueryMatch(new Date('2021-01-01'), '2021')).toBe(true);
  });

  it('should match range with >', () => {
    expect(isDateQueryMatch(new Date('2021-01-01'), '>2020-12-31')).toBe(true);
  });

  it('should match range with >=', () => {
    expect(isDateQueryMatch(new Date('2021-01-01'), '>=2021-01-01')).toBe(true);
  });

  it('should match range with <', () => {
    expect(isDateQueryMatch(new Date('2021-01-01'), '<2021-01-02')).toBe(true);
  });

  it('should match range with <=', () => {
    expect(isDateQueryMatch(new Date('2021-01-01'), '<=2021-01-01')).toBe(true);
  });

  it('should match range with !=', () => {
    expect(isDateQueryMatch(new Date('2021-01-01'), '!=2021-01-02')).toBe(true);
    expect(isDateQueryMatch(new Date('2021-01-01'), '!=2021-01-01')).toBe(
      false
    );
  });

  it('should not match invalid range', () => {
    expect(
      isDateQueryMatch(new Date('2021-01-01'), '2021-01-01-2021-01-02')
    ).toBe(false);
  });

  it('should not match invalid operator', () => {
    expect(isDateQueryMatch(new Date('2021-01-01'), '><2021-01-02')).toBe(
      false
    );
    expect(isDateQueryMatch(new Date('2021-01-01'), '==2021-01-02')).toBe(
      false
    );
  });

  it('should not match invalid operand', () => {
    expect(isDateQueryMatch(new Date('2021-01-01'), '>abc')).toBe(false);
  });

  it('should not match invalid date', () => {
    expect(isDateQueryMatch(new Date('2021-01-01'), 'abc')).toBe(false);
  });

  it('should support spaces', () => {
    expect(isDateQueryMatch(new Date('2021-01-01'), '>   2020-12-31')).toBe(
      true
    );
  });

  it('should ignore time and timezone', () => {
    expect(
      isDateQueryMatch(new Date('2021-01-01T12:34:56Z'), '2021-01-01')
    ).toBe(true);
  });
});
