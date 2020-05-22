import RedisHelperConnection from '..';
import tests from './src/tests';

const REDIS_HOST = process.env.REDIS_HOST || 'redis-cluster';
const REDIS_PORT = Number(process.env.REDIS_PORT) || 26379;
const REDIS_MASTER = process.env.REDIS_MASTER || 'mymaster';

describe('Redis Cluster', () => {
  const connection = new RedisHelperConnection({
    config: {
      sentinels: [
        {
          host: REDIS_HOST,
          port: REDIS_PORT,
        },
      ],
      name: REDIS_MASTER,
    },
  });

  tests(connection);
});
