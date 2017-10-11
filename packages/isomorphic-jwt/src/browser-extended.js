//require('webcrypto-shim');
const msrCrypto = require('./msrcrypto.min');
msrCrypto.subtle.forceSync = true;
const util = require('./util');

const supportedAlgorithms = [
  'RS256',
  'RS384',
  'RS512',
  'HS256',
  'HS384',
  'HS512',
  // 'ES256',
  // 'ES384',
  // 'ES512'
];

module.exports = require('./jwt')({
  environment: 'browser-extended',
  crypto: msrCrypto, //crypto || msrCrypto,
  util,
  supportedAlgorithms
});
