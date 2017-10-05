const { JwtError } = require('./errors');
const strUtil = require('./strUtil');

module.exports = ({environment, crypto, util, supportedAlgorithms}) => {
  return {
    decode(token) {
      return util.decodeJwtString(token).claimsSet;
    },
    generateKey({alg}) {

    },
    sign({claims, jwk}) {
      return new Promise((resolve, reject) => {
        if (!claims) {
          throw new JwtError('Must provide claims to sign');
        }

        if (!jwk) {
          throw new JwtError('Must provide a jwk to sign with');
        }

        // 7.1.1
        const string = strUtil.isString(claims) ? claims : JSON.stringify(claims);

        if (!strUtil.representsObject(string)) {
          throw new JwtError('Provided claims must be JSON');
        }

        // 7.1.2
        const message = strUtil.toBuffer(string);

        // 7.1.3
        if (!jwk.alg) {
          throw new JwtError('An alg is currently required to sign using a jwk');
        }
        const algo = supportedAlgorithms[jwk.alg];
        if (!algo) {
          throw new JwtError(`jwt in ${environment} does not support ${algo}`);
        }

        // 7.1.4
        const format = 'jwk';
        const extractable = false;
        const usages = ['sign'];

        jwk = Object.assign({}, jwk);
        delete jwk.use;

        return crypto.subtle.importKey(
          format,
          jwk,
          algo,
          extractable,
          usages
        )
        .catch(err => reject(new JwtError('Unable to import key: ' + err.message)))
        .then(cryptoKey => {
          if (!cryptoKey) return;
          return crypto.subtle.sign({
            algo,
            cryptoKey,
            message
          });
        })
        .then(signatureBuffer => {
          resolve(signatureBuffer.toString());
        })
        .catch(() => reject(new JwtError('Unable to sign the claims')))
      });
    },
    verify({token, jwk} = {}) {
      return new Promise((resolve, reject) => {
        if (!token || !jwk) {
          throw new JwtError('jwt.verify requires a token and jwk');
        }
  
        const {
          b64uHeader,
          b64uClaimsSet,
          b64uSignature,
          header,
          claimsSet
        } = util.decodeJwtString(token);
  
        if (!header.alg || header.alg === 'none') {
          throw new JwtError('The jwk must have a defined algorithm to verify');
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
        .catch(err => {
          reject(new JwtError('Unable to import key'))
        })
        .then(cryptoKey => {
          if (!cryptoKey) return;

          const claimsSetBuffer = strUtil.toBuffer(b64uHeader + '.' + b64uClaimsSet);
          const signature = util.b64u.toBuffer(b64uSignature);
    
          return crypto.subtle.verify(
            algo,
            cryptoKey,
            signature,
            claimsSetBuffer
          )
          .then(result => {
            if (result) {
              resolve(claimsSet); 
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
