# redis-helper

Redis Helper.

## Usage

```typescript
import RedisHelperConnection from '@patagoniantech/redis-helper';

const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const REDIS_PORT = Number(process.env.REDIS_PORT) || 6379;
const REDIS_CACHE_EXPIRE = 5; // in seconds

const connection = new RedisHelperConnection({
  config: {
    host: REDIS_HOST,
    port: REDIS_PORT,
  },
});

const redisHelper = connection.create('test', REDIS_CACHE_EXPIRE);

const a = await redisHelper.tryGet('a', 123);
console.log('Check if a=123', a);

const b = await redisHelper.tryGet('a', 321);
console.log('Check if b=123', b);

const d = await redisHelper.del('a');
console.log('deleted records:', 1);

// Close Redis connection
await connection.close();
```

## Doc

See [docs/index.html](https://htmlpreview.github.io/?https://github.com/PatagonianTech/redis-helper/blob/master/docs/index.html).
