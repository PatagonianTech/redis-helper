/**
 * RedisHelper key-value.
 */
export type TRedisKeyValue<T> = {
  /**
   * Key without prefix.
   */
  key: string;

  /**
   * Full Redis key.
   */
  fullKey: string;

  /**
   * Value.
   */
  value: T;
};
