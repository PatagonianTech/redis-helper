import Redis from 'ioredis';
import { IRedisHelperCoreOptions } from './IRedisHelperCoreOptions';

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
