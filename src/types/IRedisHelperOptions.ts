import { IRedisHelperOptionsParams } from './IRedisHelperOptionsParams';

/**
 * RedisHelper options.
 */
export interface IRedisHelperOptions extends IRedisHelperOptionsParams {
  expire: number;
}
