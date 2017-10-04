require('webcrypto-shim');
const base64url = require('./browser-base64url');
const util = require('./util')(base64url);

module.exports = require('./jwt')(crypto, util);
