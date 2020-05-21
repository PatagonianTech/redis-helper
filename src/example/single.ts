import RedisHelperConnection from '../';
import tests from './tests';

const REDIS_HOST = 'redis-single';
const REDIS_PORT = 6379;

(async () => {
  console.info('Test single Redis instance connection');

  const connection = new RedisHelperConnection({
    config: {
      host: REDIS_HOST,
      port: REDIS_PORT,
    },
  });

  await tests(connection);
})()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
