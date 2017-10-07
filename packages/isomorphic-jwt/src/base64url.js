const Base64 = require('js-base64').Base64;
const strUtil = require('./strUtil');

function toBase64(b64u) {
  // Don't pad with equals
  return b64u
    .replace(/-/g, '+')
    .replace(/_/g, '/');
}

function toBase64URL(b64) {
  return b64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

const base64url = {
  encode(stringOrBuffer) {
    if (strUtil.isString(stringOrBuffer)) {
      return Base64.encodeURI(stringOrBuffer);
    }
    return toBase64URL(Base64.btoa(strUtil.fromBuffer(stringOrBuffer)));
  },
  decode(string) {
    // TODO: add check for base64url
    return Base64.decode(string);
  },
  toBuffer(b64uStr) {
    return strUtil.toBuffer(Base64.atob(toBase64(b64uStr)));
  }
};

module.exports = base64url;
