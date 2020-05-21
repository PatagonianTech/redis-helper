enum RedisErrorCodes {
  Redis = 1,
  Unexpected = 2,
}

export class RedisError extends Error {
  static Codes = RedisErrorCodes;

  code: RedisErrorCodes;

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
