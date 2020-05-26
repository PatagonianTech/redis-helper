import Redis from 'ioredis';

/**
 * Redis instance error handler.
 */
export type TOnErrorHandler = (err: any) => void;

/**
 * RedisHelper options.
 */
export type TRedisHelperOptions = Redis.RedisOptions & { expire: number };

/**
 * RedisHelper key-value.
 */
export type TRedisKeyValue<T> = {
  key: string;
  value: T;
};
