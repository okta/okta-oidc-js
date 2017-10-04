const { JwtError } = require('./errors');
const strUtil = require('./strUtil');

module.exports = (crypto, util) => {
  return {
    decode(token) {
      return util.decodeJwtString(token).payload;
    },
    verify({token, jwk} = {}) {
      return new Promise((resolve, reject) => {
        if (!token || !jwk) {
          throw new JwtError('jwt.verify requires a token and jwk');
        }
  
        const {
          b64uHeader,
          b64uPayload,
          b64uSignature,
          header,
          payload
        } = util.decodeJwtString(token);
  
        if (!header.alg || header.alg === 'none') {
          throw new JwtError('The jwk must have a defined algorithm');
        }
  
        const format = 'jwk';
        const algo = util.algoMap[header.alg];
        if (!algo) {
          throw new JwtError(`${algo} is an unrecognized algorithm type`);
        }
  
        const extractable = true;
        const usages = ['verify'];
      
        // https://connect.microsoft.com/IE/feedback/details/2242108/webcryptoapi-importing-jwk-with-use-field-fails
        // This is a metadata tag that specifies the intent of how the key should be used.
        // It's not necessary to properly verify the jwt's signature.
        jwk = Object.assign({}, jwk);
        delete jwk.use;

        return crypto.subtle.importKey(
          format,
          jwk,
          algo,
          extractable,
          usages
        )
        .then(cryptoKey => {
          const payloadBuffer = strUtil.toBuffer(b64uHeader + '.' + b64uPayload);
          const signature = util.b64u.toBuffer(b64uSignature);
    
          return crypto.subtle.verify(
            algo,
            cryptoKey,
            signature,
            payloadBuffer
          );
        })
        .then(result => {
          if (result) {
            resolve(payload); 
          } else {
            resolve(false);
          }
        })
        .catch(reject);
      });
    }
  };
};
