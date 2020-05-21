import RedisHelperConnection from '../';
import tests from './tests';

const REDIS_HOST = 'redis-cluster';
const REDIS_PORT = 26379;
const REDIS_MASTER = 'mymaster';

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
