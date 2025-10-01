/**
 * Safe array utilities to prevent map errors
 * This is a global solution that ensures arrays are always safe to map
 */

/**
 * Safely maps over an array, returning empty array if input is undefined/null
 */
export function safeMap<T, U>(
  array: T[] | undefined | null,
  callback: (item: T, index: number) => U
): U[] {
  if (!Array.isArray(array)) {
    return [];
  }
  return array.map(callback);
}

/**
 * Safely filters an array, returning empty array if input is undefined/null
 */
export function safeFilter<T>(
  array: T[] | undefined | null,
  callback: (item: T, index: number) => boolean
): T[] {
  if (!Array.isArray(array)) {
    return [];
  }
  return array.filter(callback);
}

/**
 * Safely finds an item in an array, returning undefined if input is undefined/null
 */
export function safeFind<T>(
  array: T[] | undefined | null,
  callback: (item: T, index: number) => boolean
): T | undefined {
  if (!Array.isArray(array)) {
    return undefined;
  }
  return array.find(callback);
}

/**
 * Safely gets array length, returning 0 if input is undefined/null
 */
export function safeLength(array: any[] | undefined | null): number {
  if (!Array.isArray(array)) {
    return 0;
  }
  return array.length;
}

/**
 * Ensures a value is always an array
 */
export function ensureArray<T>(value: T[] | undefined | null): T[] {
  if (Array.isArray(value)) {
    return value;
  }
  return [];
}

/**
 * Higher-order function that wraps any array method to be safe
 */
export function withSafeArray<T>(array: T[] | undefined | null) {
  const safeArray = ensureArray(array);
  
  return {
    map: <U>(callback: (item: T, index: number) => U) => safeArray.map(callback),
    filter: (callback: (item: T, index: number) => boolean) => safeArray.filter(callback),
    find: (callback: (item: T, index: number) => boolean) => safeArray.find(callback),
    length: safeArray.length,
    forEach: (callback: (item: T, index: number) => void) => safeArray.forEach(callback),
    some: (callback: (item: T, index: number) => boolean) => safeArray.some(callback),
    every: (callback: (item: T, index: number) => boolean) => safeArray.every(callback),
    reduce: <U>(callback: (acc: U, item: T, index: number) => U, initialValue: U) => 
      safeArray.reduce(callback, initialValue),
    slice: (start?: number, end?: number) => safeArray.slice(start, end),
    concat: (...items: T[][]) => safeArray.concat(...items),
    includes: (item: T) => safeArray.includes(item),
    indexOf: (item: T) => safeArray.indexOf(item),
    join: (separator?: string) => safeArray.join(separator),
    sort: (compareFn?: (a: T, b: T) => number) => safeArray.sort(compareFn),
    reverse: () => safeArray.reverse(),
    push: (...items: T[]) => safeArray.push(...items),
    pop: () => safeArray.pop(),
    shift: () => safeArray.shift(),
    unshift: (...items: T[]) => safeArray.unshift(...items),
    splice: (start: number, deleteCount?: number, ...items: T[]) => 
      safeArray.splice(start, deleteCount, ...items),
    toArray: () => safeArray
  };
}
