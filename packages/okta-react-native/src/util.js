import crypto from 'isomorphic-webcrypto';

export function urlFormEncode(object) {
  const pairs = [];
  for (let key in object) {
    const val = object[key];
    if (val !== undefined) {
      pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(val)}`);
    }
  }
  return pairs.join('&');
}

export function urlFormDecode(form) {
  const pairs = form.split('&');
  const object = {};
  for (let pair of pairs) {
    const [key, val] = pair.split('=');
    object[decodeURIComponent(key)] = decodeURIComponent(val.replace(/\+/g, ' '));
  }
  return object;
}

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
export function createRandomString(length) {
  const random = new Uint8Array(length);
  crypto.getRandomValues(random);
  return Array.from(random).map(c => alphabet[c % alphabet.length]).join('');
}
