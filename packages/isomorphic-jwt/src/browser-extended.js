require('webcrypto-shim');
const msrCrypto = require('./msrcrypto.min');
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
  RS384: {
    name: 'RSASSA-PKCS1-v1_5',
    hash: { name: 'SHA-384' }
  }
};

module.exports = require('./jwt')({
  environment: 'browser-extended',
  crypto: crypto || msrCrypto,
  util,
  supportedAlgorithms
});
