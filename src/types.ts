import Redis from 'ioredis'

export type TParamMayFilter<T = any> = {
  /**
   * Key pattern (Wildcard).
   *
   * @default keyPattern = '*'
   */
  keyPattern: string

  /**
   * Value filter function.
   *
   * @default valueFilter = (key, value) => true
   */
  valueFilter: (key: string, value: T) => boolean

  /**
   * Use RedisHelper prefix?
   *
   * @default useKeyPrefix = true
   */
  useKeyPrefix: boolean
}

export type TOnErrorHandler = (err: any) => void

export type TRedisHelperOptions = Redis.RedisOptions & { expire: number }

export type TRedisKeyValue<T> = {
  key: string
  value: T
}
