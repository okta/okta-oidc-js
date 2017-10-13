require('webcrypto-shim');
const browser = require('detect-browser').detect();
const util = require('./util');

const supported = {
  RS256: ['generateKey', 'sign', 'verify'],
  RS384: ['generateKey', 'sign', 'verify'],
  RS512: ['generateKey', 'sign', 'verify'],
  HS256: ['generateKey', 'sign', 'verify'],
  HS384: ['generateKey', 'sign', 'verify'],
  HS512: ['generateKey', 'sign', 'verify'],
  ES256: ['generateKey', 'sign', 'verify'],
  ES384: ['generateKey', 'sign', 'verify'],
  ES512: ['generateKey', 'sign', 'verify']
}

if (browser && ['ie', 'edge'].includes(browser.name)) {
  supported.ES256 = [];
  supported.ES384 = [];
  supported.ES512 = [];
}

if (browser && browser.name === 'ie') {
  supported.RS512 = [];
  supported.HS512 = [];
}

module.exports = require('./jwt')({
  environment: 'browser',
  crypto,
  util,
  supported
});
