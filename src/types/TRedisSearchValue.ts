/**
 * Redis search result values.
 */
export type TRedisSearchValue<T> = (newValue?: T) => Promise<T | null>;
