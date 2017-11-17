const crypto = require('@trust/webcrypto');
const Base64 = require('js-base64').Base64;
const base64url = require('./base64url')(Base64);
const util = require('./util')(base64url);

const supported = {
  RS256: ['generateKey', 'sign', 'verify'],
  RS384: ['generateKey', 'sign', 'verify'],
  RS512: ['generateKey', 'sign', 'verify'],
  HS256: ['generateKey', 'sign', 'verify'],
  HS384: ['generateKey', 'sign', 'verify'],
  HS512: ['generateKey', 'sign', 'verify']
}

module.exports = require('./jwt')({
  environment: 'node',
  crypto,
  util,
  supported,
  base64url
});
