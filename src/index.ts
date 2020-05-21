import RedisHelperInstance, {
  TRedisHelperConstructor,
} from './RedisHelperInstance'

export default (options: TRedisHelperConstructor) =>
  new RedisHelperInstance(options)
