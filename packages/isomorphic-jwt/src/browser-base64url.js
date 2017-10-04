const strUtil = require('./strUtil');

const base64url = {
  toBase64(b64uString) {
    const paddingRequired = b64uString % 4;
    if (paddingRequired === 1) {
      throw new Error('Not a valid Base64Url');
    }
    return (b64uString + '=='.slice(0, paddingRequired))
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
  },
  decode(b64uString) {
    const b64 = base64url.toBase64(b64uString);
    const utf8 = atob(b64);
    try {
      return decodeURIComponent(escape(utf8));
    } catch (e) {
      return utf8;
    }
  },
  toBuffer(b64uString) {
    const b64 = base64url.toBase64(b64uString);
    return strUtil.toBuffer(b64);
  }
};

module.exports = base64url;
