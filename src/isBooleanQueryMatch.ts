export type IsBooleanQueryMatchOptions = {
  /**
   * A list of truthy values to match against boolean values.
   *
   * @default ['true', '1', 'on', 'yes', 'y', 't', '✓']
   */
  truthyValues?: string[];
  /**
   * A list of falsy values to match against boolean values.
   *
   * @default ['false', '0', 'off', 'no', 'n', 'f', 'x']
   */
  falsyValues?: string[];
};

/**
 * Check if the boolean value matches the query.
 *
 * The query can be a string that represents a predefined set of boolean values.
 *
 * @param value The string to check against the query
 * @param q The query string to match
 */
export const isBooleanQueryMatch = (
  value: boolean,
  q: string,
  options?: IsBooleanQueryMatchOptions
) => {
  const truthyValues = options?.truthyValues || [
    'true',
    '1',
    'on',
    'yes',
    'y',
    't',
    '✓',
  ];
  const falsyValues = options?.falsyValues || [
    'false',
    '0',
    'off',
    'no',
    'n',
    'f',
    'x',
  ];

  if (value && truthyValues.includes(q)) {
    return true;
  }
  if (!value && falsyValues.includes(q)) {
    return true;
  }
  return false;
};
