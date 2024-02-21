/**
 * Check if the date matches the query.
 *
 * The query can be a date, or a range with an operator.
 *
 * Time and timezone are ignored to avoid use of 3rd party libraries.
 *
 * @param value The date to check against the query
 * @param q The query string to match
 */
export const isDateQueryMatch = (value: Date | string, q: string) => {
  if (typeof value === 'string') {
    value = new Date(value);
  }

  // ignore time and timezone
  value.setHours(0, 0, 0, 0);

  // exact or partial match with support for partial date queries
  const operators = ['<', '<=', '>', '>=', '!='];
  if (!operators.some((op) => q.includes(op)) && !isNaN(Date.parse(q))) {
    const qDate = new Date(q);
    qDate.setHours(0, 0, 0, 0);
    return value.toISOString().split('T')[0]!.includes(q) || +value === +qDate;
  }

  // with operator, split the query into operator and operand via regex
  const match = q.match(/([<>]=?|<=?|>=?|!=?)(.*)/);

  // data validation
  if (!match) return false;
  const [, operator, operand] = match;
  if (isNaN(Date.parse(operand!))) return false;

  const convertedOperand = new Date(operand!);
  convertedOperand.setHours(0, 0, 0, 0);

  switch (operator) {
    case '>':
      return value > convertedOperand;
    case '>=':
      return value >= convertedOperand;
    case '<':
      return value < convertedOperand;
    case '<=':
      return value <= convertedOperand;
    case '!=':
      return +value !== +convertedOperand;
    default:
      return false;
  }
};
