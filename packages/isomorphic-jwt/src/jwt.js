const { JwtError } = require('./errors');
const strUtil = require('./strUtil');

module.exports = ({environment, crypto, util, supportedAlgorithms}) => {
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
        const algo = supportedAlgorithms[header.alg];
        if (!algo) {
          throw new JwtError(`jwt in ${environment} does not support ${algo}`);
        }

        // alg is optional, but we'll use it to provide a better error message
        // https://tools.ietf.org/html/rfc7517#section-4.4
        if (jwk.alg && jwk.alg !== header.alg) {
          throw new JwtError(`The jwt has an alg of ${header.alg}, but the key is for ${jwk.alg}`);
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
        .catch(() => reject(new JwtError('Unable to import key')))
        .then(cryptoKey => {
          if (!cryptoKey) return;

          const payloadBuffer = strUtil.toBuffer(b64uHeader + '.' + b64uPayload);
          const signature = util.b64u.toBuffer(b64uSignature);
    
          return crypto.subtle.verify(
            algo,
            cryptoKey,
            signature,
            payloadBuffer
          )
          .then(result => {
            if (result) {
              resolve(payload); 
            } else {
              resolve(false);
            }
          })
          .catch(() => reject(new JwtError('Unable to verify key')));
        });
      });
    }
  };
};
