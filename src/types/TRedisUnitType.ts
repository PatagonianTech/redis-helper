/**
 * Default Redis expire unit (Default: EX = seconds)
 * - EX = seconds: Set the specified expire time, in seconds.
 * - PX = milliseconds: Set the specified expire time, in milliseconds.
 */
export type TRedisUnitType = 'EX' | 'PX';
