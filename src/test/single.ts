import RedisHelperConnection from '..';
import tests from './src/tests';

const REDIS_HOST = process.env.REDIS_HOST || 'redis-single';
const REDIS_PORT = Number(process.env.REDIS_PORT) || 6379;

describe('Redis Single', () => {
  const connection = new RedisHelperConnection({
    config: {
      host: REDIS_HOST,
      port: REDIS_PORT,
    },
  });

  tests(connection);
});
