require('webcrypto-shim');
const util = require('./util');

const supportedAlgorithms = {
  HS256: {
    name: 'HMAC',
    hash: { name: 'SHA-256' }
  },
  HS384: {
    name: 'HMAC',
    hash: { name: 'SHA-384' }
  },
  HS512: {
    name: 'HMAC',
    hash: { name: 'SHA-512' }
  },
  RS256: {
    name: 'RSASSA-PKCS1-v1_5',
    hash: { name: 'SHA-256' }
  },
  RS384: {
    name: 'RSASSA-PKCS1-v1_5',
    hash: { name: 'SHA-384' }
  },
  RS512: {
    name: 'RSASSA-PKCS1-v1_5',
    hash: { name: 'SHA-512' }
  },
  ES256: {
    name: 'ECDSA',
    hash: { name: 'SHA-256' }
  },
  ES384: {
    name: 'ECDSA',
    hash: { name: 'SHA-384' }
  },
  ES512: {
    name: 'ECDSA',
    hash: { name: 'SHA-512' }
  }
};

module.exports = require('./jwt')({
  environment: 'browser',
  crypto,
  util,
  supportedAlgorithms
});
