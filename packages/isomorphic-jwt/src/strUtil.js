const strUtil = {
  toBuffer(str) {
    const buffer = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
      buffer[i] = str.charCodeAt(i);
    }
    return buffer;
  },
  isString(obj) {
    return typeof obj === 'string';
  }
};

module.exports = strUtil;
