/**
 * Utility functions for handling MySQL decimal fields
 * MySQL decimal fields are returned as strings to preserve precision
 * These utilities convert them to numbers for use in the application
 */

/**
 * Convert a decimal string to a number
 * Returns 0 if the value is null, undefined, or not a valid number
 */
export function decimalToNumber(value: string | null | undefined): number {
  if (value === null || value === undefined) return 0;
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
}

/**
 * Convert decimal fields in an object to numbers
 * Useful for transforming database query results
 */
export function convertDecimals<T extends Record<string, any>>(
  obj: T,
  fields: (keyof T)[]
): T {
  const result = { ...obj };
  for (const field of fields) {
    if (field in result) {
      result[field] = decimalToNumber(result[field] as any) as any;
    }
  }
  return result;
}

/**
 * Convert decimal fields in an array of objects
 */
export function convertDecimalsInArray<T extends Record<string, any>>(
  arr: T[],
  fields: (keyof T)[]
): T[] {
  return arr.map(obj => convertDecimals(obj, fields));
}
