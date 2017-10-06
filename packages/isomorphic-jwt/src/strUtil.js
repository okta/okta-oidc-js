const base64ArrayBuffer = require('./base64ArrayBuffer');

const strUtil = {
  fromBuffer(buffer) {
    return base64ArrayBuffer(buffer);
  },
  toBuffer(str) {
    const buffer = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
      buffer[i] = str.charCodeAt(i);
    }
    return buffer;
  },
  isString(obj) {
    return typeof obj === 'string';
  },
  representsObject(str) {
    try {
      const result = JSON.parse(str);
      if (result && typeof result === 'object') {
        return true;
      }
      return false;
    } catch(e) {
      return false;
    }
  }
};

module.exports = strUtil;
