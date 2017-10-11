const crypto = require('@trust/webcrypto');
const util = require('./util');

const supportedAlgorithms = [
  'RS256',
  // 'RS384',
  // 'RS512',
  'HS256',
  'HS384',
  'HS512',
  // 'ES256',
  // 'ES384',
  // 'ES512'
];

module.exports = require('./jwt')({
  environment: 'node',
  crypto,
  util,
  supportedAlgorithms
});
