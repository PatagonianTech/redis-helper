import { TAsyncFunc, TFunc, TResolveValue } from '../types/TValues';
import { isAsync } from './isAsync';
import { isFunction } from './isFunction';
import { isPromiseLike } from './isPromiseLike';

/**
 * Get value of...
 *
 * @param value
 * @return Resolved value.
 */
export const resolveValue = <T = unknown>(
  value: TResolveValue<T>
): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    if (value) {
      const fnValue = value as TFunc<T>;
      const plValue = value as PromiseLike<T>;
      const afValue = value as TAsyncFunc<T>;

      // Is a valid value
      if (isPromiseLike(plValue)) {
        // Promise like
        plValue.then(resolve, reject);
      } else if (isAsync(afValue)) {
        // Async Function
        afValue().then(resolve, reject);
      } else if (isFunction(fnValue)) {
        // Function
        try {
          const result = fnValue();
          resolve(result);
        } catch (err) {
          reject(err);
        }
      } else {
        // Other value
        resolve(value as T);
      }
    } else {
      // Empty value
      resolve(value as T);
    }
  });
