const Base64 = require('js-base64').Base64;
const b64 = require('base64-js');
const strUtil = require('./strUtil');

const b64uUtil = {
  encode(stringOrBuffer) {
    let string;
    if (!strUtil.isString(stringOrBuffer)) {
      string = b64.fromByteArray(new Uint8Array(stringOrBuffer));
    } else {
      string = stringOrBuffer;
    }
    return Base64.encodeURI(string);
  },
  decode(string) {
    // Ensure that the string is a base64URI
    return Base64.decode(string);
  }
};

module.exports = b64uUtil;
