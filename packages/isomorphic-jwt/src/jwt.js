const { JwtError } = require('./errors');
const strUtil = require('./strUtil');
const base64url = require('./base64url');

const algorithms = {
  HS256: {
    name: 'HMAC',
    hash: { name: 'SHA-256' }
  },
  HS384: {
    name: 'HMAC',
    hash: { name: 'SHA-384' }
  },
  HS512: {
    name: 'HMAC',
    hash: { name: 'SHA-512' }
  },
  RS256: {
    name: 'RSASSA-PKCS1-v1_5',
    hash: { name: 'SHA-256' }
  },
  RS384: {
    name: 'RSASSA-PKCS1-v1_5',
    hash: { name: 'SHA-384' }
  },
  RS512: {
    name: 'RSASSA-PKCS1-v1_5',
    hash: { name: 'SHA-512' }
  },
  ES256: {
    name: 'ECDSA',
    hash: { name: 'SHA-256' }
  },
  ES384: {
    name: 'ECDSA',
    hash: { name: 'SHA-384' }
  },
  ES512: {
    name: 'ECDSA',
    hash: { name: 'SHA-512' }
  }
};

module.exports = ({environment, crypto, util, supportedAlgorithms}) => {
  return {
    decode(token) {
      return util.decodeJwtString(token).claimsSet;
    },
    generateKey({alg, namedCurve, modulusLength, publicExponent}) {
      return new Promise((resolve, reject) => {
        if (!supportedAlgorithms.includes(alg)) {
          throw new JwtError(`jwt in ${environment} cannot generate ${alg} keys`);
        }
        const supportedAlgo = algorithms[alg];

        // Shallow clone supportedAlgo
        const algo = Object.assign({}, supportedAlgo);

        if (supportedAlgo.name === 'RSASSA-PKCS1-v1_5') {
          algo.modulusLength = modulusLength || 2048;
          algo.publicExponent = publicExponent || new Uint8Array([0x01, 0x00, 0x01]); // 65537
        }

        if (supportedAlgo.name === 'ECDSA') {
          algo.namedCurve = namedCurve || 'P-256';
          delete algo.hash;
        }

        const extractable = true;
        const usages = ['sign', 'verify'];

        crypto.subtle.generateKey(
          algo,
          extractable,
          usages
        )
        .catch(err => reject(new JwtError(`Unable to generate key: ${err.message}`)))
        .then(key => {
          if (!key) return;

          if (key && key.algorithm && key.algorithm.name === 'HMAC') {
            return crypto.subtle.exportKey('jwk', key)
            .then(sharedKey => {
              if (!sharedKey.key_ops) {
                sharedKey.key_ops = usages;
              }
              resolve({ sharedKey })
            });
          }

          return Promise.all([
            crypto.subtle.exportKey('jwk', key.publicKey),
            crypto.subtle.exportKey('jwk', key.privateKey)
          ])
          .then(([publicKey, privateKey] = []) => resolve({ publicKey, privateKey }));
        })
        .catch(err => reject(new JwtError(`Unable to export key: ${err.message}`)));
      });
    },
    sign({claims, jwk, alg}) {
      return new Promise((resolve, reject) => {
        if (!claims) {
          throw new JwtError('Must provide claims to sign');
        }

        if (!jwk) {
          throw new JwtError('Must provide a jwk to sign with');
        }

        const al = alg || jwk.alg;
        if (!al) {
          throw new JwtError('An alg is currently required to sign using a jwk');
        }

        // JSON Web Signature (JWS) - rfc7515
        // 5.1  Message Signature or MAC Computation

        // 5.1.1
        // Create the content to be used as the JWS Payload.
        let string;
        try {
          string = JSON.stringify(claims);
        } catch (e) {
          throw new JwtError(`Unable to stringify claims: ${e.message}`);
        }

        // 5.1.2
        // Compute the encoded payload value BASE64URL(JWS Payload).
        let b64uPayload;
        try {
          b64uPayload = base64url.encode(string);
        } catch(e) {
          throw new JwtError(`Unable to encode payload: ${e.message}`);
        }

        // 5.1.3
        // Create the JSON object(s) containing the desired set of Header
        // Parameters, which together comprise the JOSE Header (the JWS
        // Protected Header and/or the JWS Unprotected Header).
        if (!supportedAlgorithms.includes(al)) {
          throw new JwtError(`jwt in ${environment} cannot generate ${al} keys`);
        }
        const algo = algorithms[al];

        let importingAlgo = algo;
        if (jwk.kty === 'EC') {
          importingAlgo = Object.assign({}, algo);
          importingAlgo.namedCurve = jwk.crv;
          delete importingAlgo.hash;
        }

        const header = {
          alg: al
        };

        // 5.1.4
        // Compute the encoded header value BASE64URL(UTF8(JWS Protected
        // Header)).  If the JWS Protected Header is not present (which can
        // only happen when using the JWS JSON Serialization and no
        // "protected" member is present), let this value be the empty
        // string.
        let b64uHeader;
        try {
          b64uHeader = base64url.encode(JSON.stringify(header));
        } catch (e) {
          throw new JwtError(`Unable to encode header: ${e.message}`);
        }

        // 5.1.5
        // Compute the JWS Signature in the manner defined for the
        // particular algorithm being used over the JWS Signing Input
        // ASCII(BASE64URL(UTF8(JWS Protected Header)) || '.' ||
        // BASE64URL(JWS Payload)).  The "alg" (algorithm) Header Parameter
        // MUST be present in the JOSE Header, with the algorithm value
        // accurately representing the algorithm used to construct the JWS
        // Signature.
        const claimsSetBuffer = strUtil.toBuffer(b64uHeader + '.' + b64uPayload);
        const format = 'jwk';
        const extractable = false;
        const usages = ['sign'];

        return crypto.subtle.importKey(
          format,
          jwk,
          importingAlgo,
          extractable,
          usages
        )
        .catch(err => reject(new JwtError(`Unable to import key: ${err.message}`)))
        .then(cryptoKey => {
          if (!cryptoKey) return;
          return crypto.subtle.sign(
            algo,
            cryptoKey,
            claimsSetBuffer
          );
        })
        .then(signatureBuffer => {

          // 5.1.6
          // Compute the encoded signature value BASE64URL(JWS Signature).
          const b64uSignature = base64url.encode(signatureBuffer);

          // 5.1.7
          // If the JWS JSON Serialization is being used, repeat this process
          // (steps 3-6) for each digital signature or MAC operation being
          // performed.
          // TODO: currently unsupported

          // 5.1.8
          // Create the desired serialized output.  The JWS Compact
          // Serialization of this result is BASE64URL(UTF8(JWS Protected
          // Header)) || '.' || BASE64URL(JWS Payload) || '.' || BASE64URL(JWS
          // Signature).  The JWS JSON Serialization is described in
          // Section 7.2.
          resolve(`${b64uHeader}.${b64uPayload}.${b64uSignature}`);
        })
        .catch(err => reject(new JwtError(`Unable to sign the claims: ${err.message}`)));
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
        if (!supportedAlgorithms.includes(header.alg)) {
          throw new JwtError(`jwt in ${environment} cannot generate ${header.alg} keys`);
        }
        const algo = algorithms[header.alg];

        let importingAlgo = algo;
        if (jwk.kty === 'EC') {
          importingAlgo = Object.assign({}, algo);
          importingAlgo.namedCurve = jwk.crv;
          delete importingAlgo.hash;
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
          importingAlgo,
          extractable,
          usages
        )
        .catch(err => reject(new JwtError(`Unable to import key: ${err.message}`)))
        .then(cryptoKey => {
          if (!cryptoKey) return;

          const claimsSetBuffer = strUtil.toBuffer(b64uHeader + '.' + b64uClaimsSet);
          const signature = base64url.toBuffer(b64uSignature);
    
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
