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
    const str = atob(base64url.toBase64(b64uString));
    try {
      // ensures that unicode is handled properly
      return decodeURIComponent(escape(str));
    } catch (e) {
      return str;
    }
  },
  toBuffer(b64uString) {
    return strUtil.toBuffer(base64url.toBase64(b64uString));
  }
};

module.exports = base64url;
