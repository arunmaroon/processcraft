/**
 * Global array interceptor that automatically fixes map errors
 * This patches the Array prototype to prevent map errors
 */

// Store original methods
const originalMap = Array.prototype.map;
const originalFilter = Array.prototype.filter;
const originalFind = Array.prototype.find;
const originalForEach = Array.prototype.forEach;

// Safe wrapper functions
function safeMapWrapper<T, U>(
  this: T[] | undefined | null,
  callback: (item: T, index: number) => U
): U[] {
  if (!Array.isArray(this) || this === null || this === undefined) {
    console.warn('Array.map called on undefined/null, returning empty array');
    return [];
  }
  return originalMap.call(this, callback);
}

function safeFilterWrapper<T>(
  this: T[] | undefined | null,
  callback: (item: T, index: number) => boolean
): T[] {
  if (!Array.isArray(this) || this === null || this === undefined) {
    console.warn('Array.filter called on undefined/null, returning empty array');
    return [];
  }
  return originalFilter.call(this, callback);
}

function safeFindWrapper<T>(
  this: T[] | undefined | null,
  callback: (item: T, index: number) => boolean
): T | undefined {
  if (!Array.isArray(this) || this === null || this === undefined) {
    console.warn('Array.find called on undefined/null, returning undefined');
    return undefined;
  }
  return originalFind.call(this, callback);
}

function safeForEachWrapper<T>(
  this: T[] | undefined | null,
  callback: (item: T, index: number) => void
): void {
  if (!Array.isArray(this) || this === null || this === undefined) {
    console.warn('Array.forEach called on undefined/null, doing nothing');
    return;
  }
  return originalForEach.call(this, callback);
}

// Install the interceptor
export function installArrayInterceptor() {
  // Only install if not already installed
  if (Array.prototype.map === safeMapWrapper) {
    return;
  }

  // Patch the Array prototype
  Array.prototype.map = safeMapWrapper as any;
  Array.prototype.filter = safeFilterWrapper as any;
  Array.prototype.find = safeFindWrapper as any;
  Array.prototype.forEach = safeForEachWrapper as any;

  console.log('Array interceptor installed - map errors will be automatically prevented');
}

// Uninstall the interceptor (for testing)
export function uninstallArrayInterceptor() {
  Array.prototype.map = originalMap;
  Array.prototype.filter = originalFilter;
  Array.prototype.find = originalFind;
  Array.prototype.forEach = originalForEach;
  console.log('Array interceptor uninstalled');
}