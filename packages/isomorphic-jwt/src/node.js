const crypto = require('@trust/webcrypto');
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
  RS256: {
    name: 'RSASSA-PKCS1-v1_5',
    hash: { name: 'SHA-256' }
  },
  // RS384: {
  //   name: 'RSASSA-PKCS1-v1_5',
  //   hash: { name: 'SHA-384' }
  // },
  // RS512: {
  //   name: 'RSASSA-PKCS1-v1_5',
  //   hash: { name: 'SHA-512' }
  // },
};

module.exports = require('./jwt')({
  environment: 'node',
  crypto,
  util,
  supportedAlgorithms
});
