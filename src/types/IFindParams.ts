/**
 * Find parameters.
 */
export interface IFindParams<T> {
  /**
   * Key pattern (Wildcard).
   */
  keyPattern?: string;

  /**
   * Value filter function.
   */
  valueFilter?: (key: string, value: T) => boolean;

  /**
   * Use Key prefix?
   */
  useKeyPrefix?: boolean;
}
