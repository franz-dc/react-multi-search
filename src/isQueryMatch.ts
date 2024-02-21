import {
  type IsBooleanQueryMatchOptions,
  isBooleanQueryMatch,
} from './isBooleanQueryMatch';
import { isDateQueryMatch } from './isDateQueryMatch';
import { isNumberQueryMatch } from './isNumberQueryMatch';
import {
  type IsStringQueryMatchOptions,
  isStringQueryMatch,
} from './isStringQueryMatch';

export type IsQueryMatchOptions = IsStringQueryMatchOptions &
  IsBooleanQueryMatchOptions;

/**
 * Check if the value matches the query.
 *
 * Rules for each data type are defined in their respective functions.
 *
 * @param value The value to check against the query
 * @param q The query string to match
 * @param options Additional options for the comparison
 */
export const isQueryMatch = (
  value: unknown,
  q: string,
  options?: IsQueryMatchOptions
) => {
  if (!options?.caseSensitive) {
    q = q.toLowerCase();
  }

  switch (typeof value) {
    case 'boolean':
      return isBooleanQueryMatch(value as boolean, q, {
        truthyValues: options?.truthyValues,
        falsyValues: options?.falsyValues,
      });
    case 'number':
      return isNumberQueryMatch(value as number, q);
    case 'object':
      if (value instanceof Date) {
        return isDateQueryMatch(value, q);
      }
      break;
  }

  // Fallback to string comparison
  return isStringQueryMatch(value, q, {
    caseSensitive: options?.caseSensitive,
  });
};
