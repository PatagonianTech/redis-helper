import Redis from 'ioredis';
import RedisHelper from './RedisHelper';
import { TOnErrorHandler } from './types';

export type TRedisHelperConstructor = {
  config?: Redis.RedisOptions | null;
  redisInstance?: Redis.Redis | null;
  onError?: TOnErrorHandler;
};

export default class RedisHelperConnection {
  private _redisInstance: Redis.Redis | null = null;
  private _config: Redis.RedisOptions | null;
  private _onError: TOnErrorHandler;

  constructor({
    config = null,
    redisInstance = null,
    onError = (err) => {
      console.error('Redis unexpected error!', err);
    },
  }: TRedisHelperConstructor) {
    if (redisInstance) {
      this._redisInstance = redisInstance;
    }
    this._config = config;
    this._onError = onError;
  }

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

  create(prefix: string = '', expire: number = 60 * 60 * 24): RedisHelper {
    const instance = this.getInstance();
    return new RedisHelper(prefix, expire, instance);
  }
}
