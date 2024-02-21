/**
 * Check if the number matches the query.
 *
 * The query can be a single number, or a range with an operator.
 *
 * @param value The number to check against the query
 * @param q The query string to match
 */
export const isNumberQueryMatch = (value: number, q: string) => {
  // exact match
  if (!isNaN(Number(q))) return value === Number(q);

  // with operator, split the query into operator and operand via regex
  const match = q.match(/([<>]=?|<=?|>=?|!=?)(.*)/);

  // data validation
  if (!match) return false;
  const [, operator, operand] = match;
  if (isNaN(Number(operand))) return false;

  switch (operator) {
    case '>':
      return value > Number(operand);
    case '>=':
      return value >= Number(operand);
    case '<':
      return value < Number(operand);
    case '<=':
      return value <= Number(operand);
    case '!=':
      return value !== Number(operand);
    default:
      return false;
  }
};
