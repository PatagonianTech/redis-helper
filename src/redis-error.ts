/**
 * RedisHelper error codes.
 */
enum RedisErrorCodes {
  /**
   * Expected Redis error.
   */
  Redis = 1,

  /**
   * Unexpected error.
   */
  Unexpected = 2,
}

/**
 * RedisHelper error.
 */
export class RedisError extends Error {
  /**
   * Error codes reference.
   */
  static Codes = RedisErrorCodes;

  /**
   * Error code.
   */
  code: RedisErrorCodes;

  /**
   * RedisHelper error.
   *
   * @param code Error code.
   * @param error Error reference.
   * @param message Error message.
   */
  constructor(
    code: RedisErrorCodes,
    error: Error,
    message: string | null = null
  ) {
    super(`RedisHelper error! [${message}]: ${error.message}`);

    this.code = code;

    if (error.stack) {
      this.stack += `\n\n${error.name}: ${error.stack}`;
    }
  }
}
