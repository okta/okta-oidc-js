export class TokenClientError extends Error {
  constructor(...args) {
    super(...args);
    this.name = 'TokenClientError';
  }
}

export class TokenValidationError extends Error {
  constructor(...args) {
    super(...args);
    this.name = 'TokenValidationError';
  }}

export class OAuthError extends Error {
  constructor(error, errorDescription) {
    super(errorDescription);
    this.name = 'OAuthError';
    this.error = error;
    this.errorDescription = errorDescription;
  }
}
