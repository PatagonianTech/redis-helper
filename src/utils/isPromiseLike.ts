import { isFunction } from './isFunction';

/**
 * Check if a function is async.
 *
 * @param value
 * @return True if it is async.
 */
export const isPromiseLike = (value: any): boolean => isFunction(value?.then);
