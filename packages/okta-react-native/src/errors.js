export class ApiError extends Error {
  constructor(options) {
    super(options.errorSummary);
    this.name = 'ApiError';
    /* istanbul ignore next */
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    } else {
      /* istanbul ignore next */
      this.stack = (new Error(message)).stack; 
    }
    Object.assign(this, options);
  }
}

export class OidcError extends Error {
  constructor(options) {
    super(options.error_description);
    this.name = 'OidcError';
    /* istanbul ignore next */
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    } else {
      /* istanbul ignore next */
      this.stack = (new Error(message)).stack; 
    }
    Object.assign(this, options);
  }
}
