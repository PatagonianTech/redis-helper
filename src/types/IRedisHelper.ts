import Redis from 'ioredis';
import { IFindParams } from './IFindParams';
import { IRedisHelperCoreOptions } from './IRedisHelperCoreOptions';
import { IRedisHelperOptions } from './IRedisHelperOptions';
import { IRedisHelperOptionsParams } from './IRedisHelperOptionsParams';
import { TRedisHelperValue } from './TRedisHelperValue';
import { TRedisKeyValue } from './TRedisKeyValue';

/**
 * Redis Helper interface.
 */
export interface IRedisHelper<B = unknown> {
  /**
   * Get Redis key.
   *
   * @param k Base key.
   * @return Redis Key.
   */
  key(k: string): string;

  /**
   * Set record value.
   *
   * @param key Key.
   * @param value Value.
   * @param options Options.
   * @return Value.
   */
  set<T = B>(
    key: string,
    value: TRedisHelperValue<T>,
    options?: IRedisHelperOptions
  ): Promise<T>;

  /**
   * Get record value by key.
   *
   * @param key Key.
   * @param options Options.
   * @return Value.
   */
  get<T = B>(key: string, options?: IRedisHelperCoreOptions): Promise<T | null>;

  /**
   * Try get record value or set new.
   *
   * @param key Key.
   * @param value Value.
   * @param options Redis Helper options.
   * @return Value.
   */
  tryGet<T = B>(
    key: string,
    value: TRedisHelperValue<T>,
    options?: IRedisHelperOptions
  ): Promise<T>;

  /**
   * Delete record.
   *
   * @param key Key.
   * @param options Redis Helper options.
   * @return Redis DEL result.
   */
  del(key: string, options?: IRedisHelperCoreOptions): Promise<number>;

  /**
   * Set record expiration time.
   *
   * @param key Key.
   * @param expire Expire time in seconds.
   * @param options Redis Helper options.
   * @return Redis response.
   * @see https://redis.io/commands/expire
   */
  expire(
    key: string,
    expire: number,
    options?: IRedisHelperOptionsParams
  ): Promise<Redis.BooleanResponse>;

  /**
   * Increment counter.
   *
   * @param key Key.
   * @return Current value.
   * @see https://redis.io/commands/incr
   */
  incr(key: string): Promise<number>;

  /**
   * Get redis records by key pattern and/or value pattern.
   *
   * @param params Find parameters.
   * @return Results.
   * @see http://athlan.pl/redis-delete-keys-prefix-nodejs
   */
  find<T = B>(params: IFindParams<T>): Promise<TRedisKeyValue<T>[]>;

  /**
   * Delete Redis records by key pattern and/or value pattern.
   *
   * @param params Find parameters.
   * @return Delete count.
   */
  delMany<T = B>(params: IFindParams<T>): Promise<number>;

  /**
   * Delete all Redis records by key prefix.
   *
   * WARNING! It will fail if no prefix set and
   * try to delete everything.
   *
   * @return Delete count.
   */
  clear(): Promise<number>;
}
