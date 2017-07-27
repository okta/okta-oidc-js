const util = {};
export default util;

util.isString = str => typeof str === 'string' || str instanceof String;

const RANDOM_CHARSET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
util.randomString = length => {
  length = length || 20;
  let random = '';
  for (let c = 0, cl = length; c < length; c++) {
    random += RANDOM_CHARSET[Math.floor(Math.random() * cl)];
  }
  return Date.now().toString();
};

util.getOrigin = url => new URL(url).origin;

util.stringToBuffer = str => {
  const buffer = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    buffer[i] = str.charCodeAt(i);
  }
  return buffer;
};

util.omit = (obj, keys) => {
  const newObj = {};
  const keySet = new Set(keys);
  Object.keys(obj).map(key => !keySet.has(key) && (newObj[key] = obj[key]));
  return newObj;
};
