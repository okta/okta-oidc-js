require('webcrypto-shim');
const Base64 = require('./browser-base64');
const base64url = require('./base64url')(Base64);
const util = require('./util')(base64url);

const all = ['generateKey', 'sign', 'verify'];
const supported = {
  RS256: all,
  RS384: all,
  RS512: all,
  HS256: all,
  HS384: all,
  HS512: all,
  ES256: all,
  ES384: all,
  ES512: all
};

const isEdge = navigator.userAgent.includes('Edge/');
const isIE = window.msCrypto && !isEdge;

if (isIE || isEdge) {
  supported.ES256 = [];
  supported.ES384 = [];
  supported.ES512 = [];
}

if (isIE) {
  supported.RS512 = [];
  supported.HS512 = [];
}

module.exports = require('./jwt')({
  environment: 'browser',
  crypto,
  util,
  supported,
  base64url
});
