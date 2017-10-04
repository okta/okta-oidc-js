function JwtTypeError(message) {
  this.name = 'JwtTypeError';
  this.message = message;
  this.stack = (new TypeError()).stack;
}
JwtTypeError.prototype = new TypeError;

function JwtError(message) {
  this.name = 'JwtError';
  this.message = message;
  this.stack = (new Error()).stack;
}
JwtError.prototype = new Error;

module.exports = {
  JwtTypeError,
  JwtError
};
