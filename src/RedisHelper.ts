import Redis from 'ioredis'
import { TParamMayFilter, TRedisHelperOptions, TRedisKeyValue } from './types'
import { RedisError } from './RedisError'

/**
 * Default Redis expire unit (in seconds).
 * https://redis.io/commands/set
 * EX seconds -- Set the specified expire time, in seconds.
 * PX milliseconds -- Set the specified expire time, in milliseconds.
 */
const REDIS_EXPIRE_UNIT = 'EX'

export default class RedisHelper {
  _prefix: string
  _expire: number
  _redisInstance: Redis.Redis

  /**
   * RedisHelper instance.
   *
   * @param prefix Prefix (empty)
   * @param expire Default expiration time in seconds (1 day)
   */
  constructor(
    prefix: string = '',
    expire: number = 60 * 60 * 24,
    redisInstance: Redis.Redis
  ) {
    this._prefix = prefix
    this._expire = expire
    this._redisInstance = redisInstance
  }

  /**
   * Get Redis key.
   *
   * @param k Base key
   * @return Redis Key
   */
  key(k: string) {
    return `${this._prefix}:${k}`
  }

  /**
   * Set record value.
   *
   * @param key Key
   * @param value Value
   * @param options Redis options
   * @return Value
   */
  set<T = any>(
    key: string,
    value: T,
    options: TRedisHelperOptions
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      try {
        const o: TRedisHelperOptions = Object.assign(
          {
            expire: this._expire,
          },
          options
        )

        // Parse any type of data to string to will save in Redis
        let v = JSON.stringify(value)

        this._redisInstance.set(
          this.key(key),
          v,
          REDIS_EXPIRE_UNIT,
          o.expire,
          (error) => {
            if (error) {
              console.error('RedisHelper.set error', key, v, value, error)
              reject(new RedisError(RedisError.Codes.Redis, error))
            } else {
              resolve(value)
            }
          }
        )
      } catch (error) {
        console.error('.set general error', key, error)
        reject(new RedisError(RedisError.Codes.Unexpected, error))
      }
    })
  }

  /**
   * Get record value by key.
   *
   * @param key Key
   * @param useKeyPrefix Use RedisHelper prefix?
   * @return Value
   */
  get<T = any>(key: string, useKeyPrefix: boolean = true): Promise<T | null> {
    return new Promise((resolve, reject) => {
      try {
        if (useKeyPrefix) {
          key = this.key(key)
        }

        this._redisInstance.get(key, (error, res) => {
          if (error) {
            console.error('.get error', key, error)
            reject(new RedisError(RedisError.Codes.Redis, error))
          } else {
            if (res === null) {
              resolve(res)
            } else {
              const result = JSON.parse(res)
              resolve(result)
            }
          }
        })
      } catch (error) {
        console.error('.get general error', key, error)
        reject(new RedisError(RedisError.Codes.Unexpected, error))
      }
    })
  }

  /**
   * Try get record value or set new.
   *
   * @param key Key
   * @param value Value
   * @param options Redis options
   * @return Value
   */
  async tryGet<T = any>(
    key: string,
    value: T,
    options: TRedisHelperOptions
  ): Promise<T> {
    let v = await this.get<T>(key)

    if (v === null || v === undefined) {
      v = await this.set<T>(key, value, options)
    }

    return v
  }

  /**
   * Delete record.
   *
   * @param key Key
   * @param useKeyPrefix
   */
  del(key: string, useKeyPrefix: boolean = true): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this._redisInstance.del(this.key(key), (error) => {
          if (useKeyPrefix) {
            key = this.key(key)
          }
          if (error) {
            console.error('._del', key, error)
            reject(new RedisError(RedisError.Codes.Redis, error))
          } else {
            resolve()
          }
        })
      } catch (error) {
        console.error('._del general error', key, error)
        reject(new RedisError(RedisError.Codes.Unexpected, error))
      }
    })
  }

  /**
   * Set record expiration time.
   *
   * @param key Key
   * @param expire Expire time in seconds
   * @return Redis response
   * @see https://redis.io/commands/expire
   */
  expire(key: string, expire: number): Promise<Redis.BooleanResponse> {
    return new Promise((resolve, reject) => {
      try {
        if (!expire) {
          expire = this._expire
        }

        this._redisInstance.expire(key, expire, (error, res) => {
          if (error) {
            console.error('.expire error', key, expire, error)
            reject(new RedisError(RedisError.Codes.Redis, error))
          } else {
            resolve(res)
          }
        })
      } catch (error) {
        console.error('.expire general error', key, expire, error)
        reject(new RedisError(RedisError.Codes.Unexpected, error))
      }
    })
  }

  /**
   * Increment counter.
   *
   * @param key
   * @return Current value
   * @see https://redis.io/commands/incr
   */
  incr(key: string): Promise<number> {
    return new Promise((resolve, reject) => {
      try {
        this._redisInstance.incr(this.key(key), (error, res) => {
          if (error) {
            console.error('.incr error', key, error)
            reject(new RedisError(RedisError.Codes.Redis, error))
          } else {
            resolve(res)
          }
        })
      } catch (error) {
        console.error('.incr general error', key, error)
        reject(new RedisError(RedisError.Codes.Unexpected, error))
      }
    })
  }

  /**
   * Get redis records by key pattern and/or value pattern.
   *
   * @param keyPattern Key pattern (Wildcard)
   * @param valueFilter Value filter function
   * @param useKeyPrefix
   * @return Results
   * @see http://athlan.pl/redis-delete-keys-prefix-nodejs
   */
  find<T = any>({
    keyPattern = '*',
    valueFilter = (key: string, value: T) => true,
    useKeyPrefix = true,
  }: TParamMayFilter<T>): Promise<TRedisKeyValue<T>[]> {
    return new Promise((resolve, reject) => {
      try {
        if (useKeyPrefix) {
          keyPattern = this.key(keyPattern)
        }

        this._redisInstance.keys(keyPattern, async (error, rowsKeys) => {
          if (error) {
            console.error('.findByKey keys error', error)
            reject(new RedisError(RedisError.Codes.Redis, error))
          } else {
            const results: TRedisKeyValue<T>[] = []

            for (const key of rowsKeys) {
              const value = await this.get(key, false)

              if (valueFilter(key, value)) {
                results.push({ key, value })
              }
            }

            resolve(results)
          }
        })
      } catch (error) {
        console.error('.findByKey error', error)
        reject(new RedisError(RedisError.Codes.Unexpected, error))
      }
    })
  }

  /**
   * Delete Redis records by key pattern and/or value pattern.
   *
   * @param keyPattern Key pattern (Wildcard)
   * @param valueFilter Value filter function
   * @param useKeyPrefix
   * @return Delete count
   */
  async delMany<T = any>({
    keyPattern = '*',
    valueFilter = (key: string, value: T) => true,
    useKeyPrefix = true,
  }: TParamMayFilter<T>): Promise<number> {
    return new Promise((resolve, reject) => {
      try {
        if (useKeyPrefix) {
          keyPattern = this.key(keyPattern)
        }

        this._redisInstance.keys(keyPattern, async (error, rowsKeys) => {
          if (error) {
            console.error('.delMany keys error', error)
            reject(new RedisError(RedisError.Codes.Redis, error))
          } else {
            let result = 0

            for (const key of rowsKeys) {
              const value = await this.get(key, false)

              if (valueFilter(key, value)) {
                await this.del(key, false)
                result++
              }
            }

            resolve(result)
          }
        })
      } catch (error) {
        console.error('.delMany error', error)
        reject(new RedisError(RedisError.Codes.Unexpected, error))
      }
    })
  }
}
