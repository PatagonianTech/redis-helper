import Redis from 'ioredis';

export type TOnErrorHandler = (err: any) => void;

export type TRedisHelperOptions = Redis.RedisOptions & { expire: number };

export type TRedisKeyValue<T> = {
  key: string;
  value: T;
};
