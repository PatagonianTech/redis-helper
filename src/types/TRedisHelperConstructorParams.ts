import Redis from 'ioredis';
import { TOnErrorHandler } from './TOnErrorHandler';

/**
 * RedisHelper constructor object.
 */
export type TRedisHelperConstructorParams = {
  /**
   * Redis configuration to connect using `ioredis`.
   *
   * If used, `redisInstance` is not required.
   */
  config?: Redis.RedisOptions | null;

  /**
   * Custom Redis instance.
   *
   * If used, `config` is not required.
   */
  redisInstance?: Redis.Redis | null;

  /**
   * On error handler.
   */
  onError?: TOnErrorHandler;
};
