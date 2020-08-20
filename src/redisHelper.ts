import Redis from 'ioredis';
import {
  IRedisHelperOptions,
  IRedisHelperOptionsParams,
  IRedisHelperOptionsInternal,
  TRedisKeyValue,
  IRedisHelperCoreOptions,
  TRedisFilterParams,
  TRedisUnitType,
} from './types';
import { RedisError } from './redisError';

/**
 * Redis Helper.
 */
export default class RedisHelper {
  private _prefix: string;
  private _expire: number;
  private _redisInstance: Redis.Redis;
  private _redisExpireUnit: TRedisUnitType;

  /**
   * RedisHelper instance.
   *
   * @param redisInstance Redis instance
   * @param prefix Prefix (Default: empty)
   * @param expire Default expiration time in seconds (Default: 1 day)
   * @param redisExpireUnit Default Redis expire unit (Default: EX = seconds)
   */
  constructor(
    redisInstance: Redis.Redis,
    prefix: string = '',
    expire: number = 0,
    redisExpireUnit: TRedisUnitType = 'EX'
  ) {
    if (!redisInstance || !(redisInstance instanceof Redis)) {
      throw new RedisError(
        RedisError.Codes.InvalidImplementation,
        new Error('Invalid "redisInstance" param')
      );
    }

    if (typeof expire !== 'number' || expire < 0) {
      throw new RedisError(
        RedisError.Codes.InvalidImplementation,
        new Error('Invalid "expire" param')
      );
    }

    if (redisExpireUnit !== 'EX' && redisExpireUnit !== 'PX') {
      throw new RedisError(
        RedisError.Codes.InvalidImplementation,
        new Error('Invalid "redisExpireUnit" param')
      );
    }

    this._prefix = prefix ? `${prefix}:` : '';
    this._expire = expire;
    this._redisInstance = redisInstance;
    this._redisExpireUnit = redisExpireUnit;
  }

  private _options<T extends IRedisHelperCoreOptions>(
    key: string,
    options?: T
  ): IRedisHelperOptionsInternal & T & IRedisHelperOptions {
    const result = {
      useKeyPrefix: !!this._prefix,
      expire: this._expire,
      _key: '',
    };

    if (options) {
      Object.assign(result, options);
    }

    result._key = result.useKeyPrefix ? this.key(key) : key;

    return (result as unknown) as IRedisHelperOptionsInternal &
      T &
      IRedisHelperOptions;
  }

  /**
   * Remove key prefix.
   *
   * @param fullKey Full key
   * @return Key without prefix
   * @see get
   */
  cleanKey(fullKey: string): string {
    let r = fullKey;

    if (this._prefix && this._prefix.length) {
      r = r.substr(this._prefix.length);
    }

    return r;
  }

  /**
   * Get Redis key.
   *
   * @param key Base key
   * @return Redis Key
   * @see cleanKey
   */
  key(key: string) {
    return `${this._prefix}${key}`;
  }

  /**
   * Set record value.
   *
   * @param key Key
   * @param value Value
   * @param options Redis Helper options
   * @return Value
   */
  set<T = any>(
    key: string,
    value: T,
    options?: IRedisHelperOptionsParams
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const o = this._options(key, options);

      try {
        // Parse any type of data to string to will save in Redis
        let v = JSON.stringify(value);

        this._redisInstance.set(
          o._key,
          v,
          this._redisExpireUnit,
          o.expire,
          (error) => {
            if (error) {
              console.error('RedisHelper.set error', o._key, v, value, error);
              reject(new RedisError(RedisError.Codes.Redis, error));
            } else {
              resolve(value);
            }
          }
        );
      } catch (error) {
        console.error('.set general error', o._key, error);
        reject(new RedisError(RedisError.Codes.Unexpected, error));
      }
    });
  }

  /**
   * Get record value by key.
   *
   * @param key Key
   * @param useKeyPrefix Use RedisHelper prefix?
   * @return Value
   */
  get<T = any>(
    key: string,
    options?: IRedisHelperCoreOptions
  ): Promise<T | null> {
    return new Promise((resolve, reject) => {
      const o = this._options(key, options);

      try {
        this._redisInstance.get(o._key, (error, res) => {
          if (error) {
            console.error('.get error', o._key, error);
            reject(new RedisError(RedisError.Codes.Redis, error));
          } else {
            if (res === null) {
              resolve(res);
            } else {
              const result = JSON.parse(res);
              resolve(result);
            }
          }
        });
      } catch (error) {
        console.error('.get general error', o._key, error);
        reject(new RedisError(RedisError.Codes.Unexpected, error));
      }
    });
  }

  /**
   * Try get record value or set new.
   *
   * @param key Key
   * @param value Value
   * @param options Redis Helper options
   * @return Value
   */
  async tryGet<T = any>(
    key: string,
    value: T,
    options?: IRedisHelperOptionsParams
  ): Promise<T> {
    let v = await this.get<T>(key, options);

    if (v === null || v === undefined) {
      v = await this.set<T>(key, value, options);
    }

    return v;
  }

  /**
   * Delete record.
   *
   * @param key Key
   * @param options Redis Helper options
   * @return Redis DEL result
   */
  del(key: string, options?: IRedisHelperCoreOptions): Promise<number> {
    return new Promise((resolve, reject) => {
      const o = this._options(key, options);

      try {
        this._redisInstance.del(o._key, (error, res) => {
          if (error) {
            console.error('._del', o._key, error);
            reject(new RedisError(RedisError.Codes.Redis, error));
          } else {
            resolve(res);
          }
        });
      } catch (error) {
        console.error('._del general error', o._key, error);
        reject(new RedisError(RedisError.Codes.Unexpected, error));
      }
    });
  }

  /**
   * Set record expiration time.
   *
   * @param key Key
   * @param expire Expire time in seconds
   * @param options Redis Helper options
   * @return Redis response
   * @see https://redis.io/commands/expire
   */
  expire(
    key: string,
    expire: number,
    options: IRedisHelperOptionsParams
  ): Promise<Redis.BooleanResponse> {
    return new Promise((resolve, reject) => {
      const o = this._options(key, options);

      try {
        this._redisInstance.expire(o._key, expire, (error, res) => {
          if (error) {
            console.error('.expire error', o._key, expire, error);
            reject(new RedisError(RedisError.Codes.Redis, error));
          } else {
            resolve(res);
          }
        });
      } catch (error) {
        console.error('.expire general error', o._key, expire, error);
        reject(new RedisError(RedisError.Codes.Unexpected, error));
      }
    });
  }

  /**
   * Increment counter.
   *
   * @param key Key
   * @param options Redis Helper options
   * @return Current value before update
   * @see https://redis.io/commands/incr
   */
  incr(key: string, options?: IRedisHelperOptionsParams): Promise<number> {
    return new Promise((resolve, reject) => {
      const o = this._options(key, options);

      try {
        this._redisInstance.incr(o._key, (error, res) => {
          if (error) {
            console.error('.incr error', o._key, error);
            reject(new RedisError(RedisError.Codes.Redis, error));
          } else {
            resolve(res);
          }
        });
      } catch (error) {
        console.error('.incr general error', o._key, error);
        reject(new RedisError(RedisError.Codes.Unexpected, error));
      }
    });
  }

  /**
   * Get redis records by key pattern and/or value pattern.
   *
   * @param keyPattern Key pattern (Wildcard)
   * @param filter Value filter function
   * @param options Redis Helper options
   * @return Results
   * @see http://athlan.pl/redis-delete-keys-prefix-nodejs
   */
  find<T = any>(
    {
      keyPattern = '*',
      filter = (key: string, value: T) => true,
    }: TRedisFilterParams<T>,
    options?: IRedisHelperCoreOptions
  ): Promise<TRedisKeyValue<T>[]> {
    return new Promise((resolve, reject) => {
      const o = this._options(keyPattern, options);

      try {
        this._redisInstance.keys(o._key, (error, rowsKeys) => {
          if (error) {
            console.error('.find error', error);
            reject(new RedisError(RedisError.Codes.Redis, error));
          } else {
            (async () => {
              const results: TRedisKeyValue<T>[] = [];

              for (const fullKey of rowsKeys) {
                const value = await this.get<T>(fullKey, {
                  useKeyPrefix: false,
                });

                if (value !== undefined && value !== null) {
                  let r = filter(fullKey, value);

                  if (typeof r !== 'boolean' && typeof r.then === 'function') {
                    // Resolve promise
                    r = await r;
                  }

                  if (r) {
                    results.push({
                      key: this.cleanKey(fullKey),
                      fullKey,
                      value,
                    });
                  }
                }
              }

              return results;
            })()
              .then(resolve)
              .catch(reject);
          }
        });
      } catch (error) {
        console.error('.find error', error);
        reject(new RedisError(RedisError.Codes.Unexpected, error));
      }
    });
  }

  /**
   * Delete Redis records by key pattern and/or value pattern.
   *
   * @param keyPattern Key pattern (Wildcard)
   * @param filter Value filter function
   * @param options Redis Helper options
   * @return Delete count
   */
  delMany<T = any>(
    {
      keyPattern = '*',
      filter = (key: string, value: T) => true,
    }: TRedisFilterParams<T>,
    options?: IRedisHelperCoreOptions
  ): Promise<number> {
    return new Promise((resolve, reject) => {
      const o = this._options(keyPattern, options);

      try {
        this._redisInstance.keys(o._key, async (error, rowsKeys) => {
          if (error) {
            console.error('.delMany keys error', error);
            reject(new RedisError(RedisError.Codes.Redis, error));
          } else {
            (async () => {
              let result = 0;

              for (const fullKey of rowsKeys) {
                const value = await this.get<T>(fullKey, {
                  useKeyPrefix: false,
                });

                if (value !== undefined && value !== null) {
                  let r = filter(fullKey, value);

                  if (typeof r !== 'boolean' && typeof r.then === 'function') {
                    // Resolve promise
                    r = await r;
                  }

                  if (r) {
                    await this.del(fullKey, { useKeyPrefix: false });
                    result++;
                  }
                }
              }

              return result;
            })()
              .then(resolve)
              .catch(reject);
          }
        });
      } catch (error) {
        console.error('.delMany error', error);
        reject(new RedisError(RedisError.Codes.Unexpected, error));
      }
    });
  }

  /**
   * Delete all RedisHelper instance Redis records.
   *
   * @return Delete count
   */
  async clean() {
    return await this.delMany({ keyPattern: '*' });
  }
}
