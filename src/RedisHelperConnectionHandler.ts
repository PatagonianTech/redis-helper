import Redis from 'ioredis';
import { RedisHelper } from './RedisHelper';
import {
  TOnErrorHandler,
  TRedisUnitType,
  TRedisHelperConstructorParams,
} from './types';

/**
 * Redis connection handler.
 */
export class RedisHelperConnectionHandler {
  private _redisInstance: Redis.Redis | null = null;
  private _config: Redis.RedisOptions | null;
  private _onError: TOnErrorHandler;

  static RedisHelper = RedisHelper;

  constructor({
    config = null,
    redisInstance = null,
    onError = (err) => {
      console.error('Redis unexpected error!', err);
    },
  }: TRedisHelperConstructorParams) {
    if (redisInstance) {
      this._redisInstance = redisInstance;
    }
    this._config = config;
    this._onError = onError;
  }

  /**
   * Get Redis instance.
   */
  getInstance(): Redis.Redis {
    if (!this._redisInstance) {
      if (!this._config) {
        throw new Error('No redis configuration defined');
      }

      this._redisInstance = new Redis(this._config);
      this._redisInstance.on('error', this._onError);
    }

    return this._redisInstance;
  }

  /**
   * Close Redis connection.
   */
  async close(): Promise<void> {
    if (this._redisInstance) {
      if (!this._config) {
        throw new Error("I can't close external Redis connection");
      }

      try {
        this._redisInstance.disconnect();
      } catch (err) {
        console.error('Error disconnecting Redis', err);
      }

      try {
        await this._redisInstance.quit();
      } catch (err) {
        console.error('Error closing Redis', err);
      }

      this._redisInstance = null;
    }
  }

  /**
   * Create a RedisHelper instance.
   *
   * @param prefix Prefix
   * @param expire Expire time in seconds
   * @param redisExpireUnit Default Redis expire unit (Default: EX = seconds)
   */
  create(
    prefix: string = '',
    expire: number = 0,
    redisExpireUnit: TRedisUnitType = 'EX'
  ): RedisHelper {
    const instance = this.getInstance();
    return new RedisHelper(instance, prefix, expire, redisExpireUnit);
  }
}
