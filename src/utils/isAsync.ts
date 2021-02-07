import { isPromiseLike } from './isPromiseLike';

/**
 * Check if a function is async.
 *
 * @param fn
 * @return True if it is async.
 */
export const isAsync = (fn: any): boolean =>
  fn && (fn[Symbol.toStringTag] === 'AsyncFunction' || isPromiseLike(fn));
