import RedisHelperConnection from '..';
import tests from './src/tests';

const REDIS_HOST = process.env.REDIS_HOST || 'redis-cluster';
const REDIS_PORT = Number(process.env.REDIS_PORT) || 26379;
const REDIS_MASTER = process.env.REDIS_MASTER || 'mymaster';

(async () => {
  console.info('Test Cluster Redis instance connection');

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

  await tests(connection);
})()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
