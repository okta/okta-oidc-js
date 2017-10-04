const { JwtTypeError, JwtError } = require('./errors');

const util = module.exports = {};

module.exports = b64uUtil => {
  return {
    b64u: b64uUtil,
    
    decodeJwtString(string) {
      if (!string || typeof string !== 'string') {
        throw new JwtTypeError('A jwt must be provided as a string');
      }
    
      const parts = string.split('.');
      if (parts.length !== 3) {
        throw new JwtError('The jwt must have a header, payload and signature');
      }
    
      const b64uHeader = parts[0];
      const b64uPayload = parts[1];
      const b64uSignature = parts[2];
      
      return {
        header: JSON.parse(b64uUtil.decode(b64uHeader)),
        payload: JSON.parse(b64uUtil.decode(b64uPayload)),
        b64uSignature,
        b64uHeader,
        b64uPayload
      };
    },
    
    algoMap: {
      HS256: {
        name: 'HMAC',
        hash: { name: 'SHA-256' }
      },
      HS384: {
        name: 'HMAC',
        hash: { name: 'SHA-384' }
      },
      RS256: {
        name: 'RSASSA-PKCS1-v1_5',
        hash: { name: 'SHA-256' }
      },
      RS384: {
        name: 'RSASSA-PKCS1-v1_5',
        hash: { name: 'SHA-384' }
      }
    }
  };
};
