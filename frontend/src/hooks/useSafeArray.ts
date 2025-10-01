import { useMemo } from 'react';
import { withSafeArray } from '../utils/safeArray';

/**
 * Hook that ensures arrays are always safe to use
 * This prevents map errors globally
 */
export function useSafeArray<T>(array: T[] | undefined | null) {
  return useMemo(() => {
    return withSafeArray(array);
  }, [array]);
}

/**
 * Hook for state that should always be an array
 */
export function useSafeArrayState<T>(initialValue: T[] = []) {
  return useMemo(() => {
    return withSafeArray(initialValue);
  }, [initialValue]);
}
import { withSafeArray } from '../utils/safeArray';

/**
 * Hook that ensures arrays are always safe to use
 * This prevents map errors globally
 */
export function useSafeArray<T>(array: T[] | undefined | null) {
  return useMemo(() => {
    return withSafeArray(array);
  }, [array]);
}

/**
 * Hook for state that should always be an array
 */
export function useSafeArrayState<T>(initialValue: T[] = []) {
  return useMemo(() => {
    return withSafeArray(initialValue);
  }, [initialValue]);
}
