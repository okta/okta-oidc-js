const strUtil = require('./strUtil');

function toBase64NoPad(b64u) {
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

module.exports = Base64 => {
  return {
    encode(stringOrBuffer) {
      if (strUtil.isString(stringOrBuffer)) {
        return toBase64URL(Base64.toBase64(stringOrBuffer));
      }
      return toBase64URL(Base64.btoa(strUtil.fromBuffer(stringOrBuffer)));
    },
    decode(string) {
      // the js-base64 lib decodes base64url and base64
      // we want to enforce base64url
      if (/=|\+|\//.test(string)) {
        throw new Error(`${string} is not base64url encoded`);
      }
      return Base64.fromBase64(toBase64NoPad(string));
    },
    toBuffer(b64uStr) {
      return strUtil.toBuffer(Base64.atob(toBase64NoPad(b64uStr)));
    }
  }
};
