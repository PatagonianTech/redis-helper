/**
 * Function type.
 */
export type TFunc<T = unknown> = () => T;

/**
 * Async function type.
 */
export type TAsyncFunc<T = unknown> = () => PromiseLike<T>;

/**
 * Resolve value type.
 */
export type TResolveValue<T = unknown> =
  | T
  | TFunc<T>
  | PromiseLike<T>
  | TAsyncFunc<T>;
