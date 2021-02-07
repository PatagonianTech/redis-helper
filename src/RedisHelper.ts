import Redis from 'ioredis';
import { RedisError } from './utils/RedisError';
import {
  IRedisHelper,
  IRedisHelperCoreOptions,
  IRedisHelperOptions,
  IRedisHelperOptionsInternal,
  IRedisHelperOptionsParams,
  TRedisFilterParams,
  TRedisHelperValue,
  TRedisKeyValue,
  TRedisSearchValue,
  TRedisUnitType,
} from './types';
import { resolveValue } from './utils';

/**
 * Redis Helper.
 */
export class RedisHelper<B = unknown> implements IRedisHelper<B> {
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
  set<T = B>(
    key: string,
    value: TRedisHelperValue<T>,
    options?: IRedisHelperOptionsParams
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      let redisValue: T;
      let redisValueStr: string;
      const o = this._options(key, options);

      const resultHandler = (error: any) => {
        if (error) {
          console.error(
            'RedisHelper.set error',
            key,
            redisValue,
            redisValueStr,
            value,
            error
          );
          reject(new RedisError(RedisError.Codes.Redis, error));
        } else {
          resolve(redisValue);
        }
      };

      const valueHandler = (v: T) => {
        redisValue = v; // To return/resolve...

        // Parse any type of data to string to will save in Redis
        redisValueStr = JSON.stringify(redisValue);

        this._redisInstance.set(
          o._key,
          redisValueStr,
          this._redisExpireUnit,
          o.expire,
          resultHandler
        );
      };

      try {
        resolveValue<T>(value).then(valueHandler).catch(resultHandler);
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
  get<T = B>(
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
  async tryGet<T = B>(
    key: string,
    value: TRedisHelperValue<T>,
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
   * Find in all Redis DB by value.
   *
   * @param searchPattern Search pattern.
   * @return Results.
   * @see https://stackoverflow.com/a/38247686/717267
   */
  search<T = B>(
    searchPattern: RegExp,
    options?: IRedisHelperCoreOptions
  ): Promise<{
    length: number;
    results: Map<string, TRedisSearchValue<T>>;
  }> {
    const o = this._options('', options);

    return new Promise((resolve, reject) => {
      try {
        const results = new Map<string, TRedisSearchValue<T>>();
        let length = 0;
        let cursor = '0';

        const scan = (callback: Function) => {
          this._redisInstance.scan(
            cursor,
            'MATCH',
            searchPattern.source,
            (err, reply) => {
              if (err) {
                throw err;
              } else {
                cursor = reply[0];
                if (cursor === '0') {
                  return callback();
                } else {
                  reply[1].forEach((key) => {
                    if (!o.useKeyPrefix || key.startsWith(this._prefix)) {
                      length++;

                      results.set(
                        key,
                        async (newValue?: T): Promise<T | null> => {
                          if (newValue === undefined) {
                            return await this.get<T>(key, {
                              ...o,
                              useKeyPrefix: false,
                            });
                          }

                          return await this.set<T>(key, newValue, {
                            ...o,
                            useKeyPrefix: false,
                          });
                        }
                      );
                    }
                  });

                  return scan(callback);
                }
              }
            }
          );
        };

        scan(() => resolve({ length, results }));
      } catch (err) {
        console.error('.findByValue error', err);
        return reject(err);
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
  find<T = B>(
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
  delMany<T = B>(
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
   * WARNING! It will fail if no prefix set and
   * try to delete everything.
   *
   * @return Delete count
   */
  async clear(): Promise<number> {
    if (!this._prefix) {
      // Prevent clear Redis data
      throw new Error('Rejected operation: Clear Redis DB');
    }

    return await this.delMany({ keyPattern: '*' }, { useKeyPrefix: true });
  }
}
