const strUtil = require('./strUtil');

const b64Util = {

};

const b64uUtil = {
  toBase64(b64uString) {
    const paddingRequired = 4 - (b64uString % 4);
    if (paddingRequired === 3) {
      throw new Error('Not a valid base64url');
    }
    return (b64uString + '=='.slice(0, paddingRequired))
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
  },
  decode(b64uString) {
    const str = atob(b64uUtil.toBase64(b64uString));
    try {
      // ensures that unicode is handled properly
      return decodeURIComponent(escape(str));
    } catch (e) {
      return str;
    }
  },
  encode(str) {
    const b64 = strUtil.toBase64(str);
    return b64Util.toBase64Url(b64);
  },
  toBuffer(b64uString) {
    return strUtil.toBuffer(b64uUtil.decode(b64uString));
  }
};

module.exports = b64uUtil;
