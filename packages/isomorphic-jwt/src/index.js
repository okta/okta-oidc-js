const crypto = require('@trust/webcrypto');
const base64url = require('base64url');
const util = require('./util')(base64url);

module.exports = require('./jwt')(crypto, util);
