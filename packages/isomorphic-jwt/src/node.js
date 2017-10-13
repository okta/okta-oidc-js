const crypto = require('@trust/webcrypto');
const util = require('./util');

const supported = {
  RS256: ['generateKey', 'sign', 'verify'],
  HS256: ['generateKey', 'sign', 'verify'],
  HS384: ['generateKey', 'sign', 'verify'],
  HS512: ['generateKey', 'sign', 'verify']
}

module.exports = require('./jwt')({
  environment: 'node',
  crypto,
  util,
  supported
});
