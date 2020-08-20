import Redis from 'ioredis';

/**
 * Default Redis expire unit (Default: EX = seconds)
 * - EX = seconds: Set the specified expire time, in seconds.
 * - PX = milliseconds: Set the specified expire time, in milliseconds.
 */
export type TRedisUnitType = 'EX' | 'PX';

/**
 * Redis instance error handler.
 */
export type TOnErrorHandler = (err: Error) => void;

/**
 * RedisHelper Core Options.
 */
export interface IRedisHelperCoreOptions {
  /**
   * Add key prefix?
   */
  useKeyPrefix?: boolean;
}

/**
 * RedisHelper options.
 */
export interface IRedisHelperOptionsParams
  extends Redis.RedisOptions,
    IRedisHelperCoreOptions {
  /**
   * Expiration time in seconds.
   */
  expire?: number;
}

/**
 * RedisHelper options.
 */
export interface IRedisHelperOptions extends IRedisHelperOptionsParams {
  expire: number;
}

export interface IRedisHelperOptionsInternal {
  _key: string;
}

/**
 * RedisHelper key-value.
 */
export type TRedisKeyValue<T> = {
  key: string;
  fullKey: string;
  value: T;
};

export type TRedisFilterParams<T> = {
  keyPattern?: string;
  filter?: (key: string, value: T) => boolean | Promise<boolean>;
};
