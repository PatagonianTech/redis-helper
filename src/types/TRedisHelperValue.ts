import { TAsyncFunc, TFunc } from './TValues';

export type TRedisHelperValue<T> =
  | T
  | PromiseLike<T>
  | TFunc<T>
  | TAsyncFunc<T>;
