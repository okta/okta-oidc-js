const { JwtTypeError, JwtError } = require('./errors');

const util = module.exports = {};

module.exports = (b64uUtil, algoMap) => {
  return {
    b64u: b64uUtil,
    algoMap,
    
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
      
      let header;
      try {
        header = JSON.parse(b64uUtil.decode(b64uHeader));
      } catch (e) {
        throw new JwtError('The jwt header is malformed');
      }

      let payload;
      try {
        payload = JSON.parse(b64uUtil.decode(b64uPayload));
      } catch (e) {
        throw new JwtError('The jwt payload is malformed');
      }
      
      return {
        header,
        payload,
        b64uSignature,
        b64uHeader,
        b64uPayload
      };
    }
  };
};
