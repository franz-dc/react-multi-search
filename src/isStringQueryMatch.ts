export type IsStringQueryMatchOptions = {
  /**
   * Whether the comparison should be case-sensitive.
   */
  caseSensitive?: boolean;
};

/**
 * Check if a string matches a query (case-insensitive).
 * This is also used as a fallback for other data types.
 *
 * This supports exact match, partial match, and partial match with escaped quotes.
 */
export const isStringQueryMatch = (
  value: unknown,
  q: string,
  options?: IsStringQueryMatchOptions
) => {
  let formattedValue = '';

  if (typeof value !== 'string') {
    formattedValue = JSON.stringify(value) || 'undefined';
  } else {
    formattedValue = value as string;
  }

  if (!options?.caseSensitive) {
    formattedValue = formattedValue.toLowerCase();
  }

  // Strings enclosed in double quotes are treated as exact match
  if (q.startsWith('"') && q.endsWith('"')) {
    return formattedValue === q.slice(1, -1);
  }

  // Partial match with escaped quotes
  if (q.startsWith('\\"') && q.endsWith('\\"')) {
    return formattedValue.includes(`"${q.slice(2, -2)}"`);
  }

  return formattedValue.includes(q);
};
