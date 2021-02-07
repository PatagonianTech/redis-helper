export type TRedisFilterParams<T> = {
  keyPattern?: string;
  filter?: (key: string, value: T) => boolean | Promise<boolean>;
};
