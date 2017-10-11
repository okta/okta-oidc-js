const tokens = require('../tokens');
const env = require('../env');
const jwt = env.jwt;
const util = require('../util');
//
describe('using jwt operations end-to-end', () => {
  env.supports('RS256').it('should allow generating, signing and verifying using RS256', () => {
    return jwt.generateKey({
      alg: 'RS256'
    })
    .then(res => {
      return jwt.sign({
        claims: tokens.standardClaimsSet,
        jwk: res.privateKey
      })
      .then(signedJwt => {
        return jwt.verify({
          token: signedJwt,
          jwk: res.publicKey
        })
      });
    })
    .then(res => expect(res).toEqual(tokens.standardClaimsSet));
  });

  env.supports('RS384').it('should allow generating, signing and verifying using RS384', () => {
    return jwt.generateKey({
      alg: 'RS384'
    })
    .then(res => {
      return jwt.sign({
        claims: tokens.standardClaimsSet,
        jwk: res.privateKey
      })
      .then(signedJwt => {
        return jwt.verify({
          token: signedJwt,
          jwk: res.publicKey
        })
      });
    })
    .then(res => expect(res).toEqual(tokens.standardClaimsSet));
  });

  env.supports('RS512').it('should allow generating, signing and verifying using RS512', () => {
    return jwt.generateKey({
      alg: 'RS512'
    })
    .then(res => {
      return jwt.sign({
        claims: tokens.standardClaimsSet,
        jwk: res.privateKey
      })
      .then(signedJwt => {
        return jwt.verify({
          token: signedJwt,
          jwk: res.publicKey
        })
      });
    })
    .then(res => expect(res).toEqual(tokens.standardClaimsSet));
  });

  env.supports('HS256').it('should allow generating, signing and verifying using HS256', () => {
    return jwt.generateKey({
      alg: 'HS256'
    })
    .then(res => {
      return jwt.sign({
        claims: tokens.standardClaimsSet,
        jwk: res.sharedKey
      })
      .then(signedJwt => {
        return jwt.verify({
          token: signedJwt,
          jwk: res.sharedKey
        })
      });
    })
    .then(res => expect(res).toEqual(tokens.standardClaimsSet));
  });

  env.supports('HS384').it('should allow generating, signing and verifying using HS384', () => {
    return jwt.generateKey({
      alg: 'HS384'
    })
    .then(res => {
      return jwt.sign({
        claims: tokens.standardClaimsSet,
        jwk: res.sharedKey
      })
      .then(signedJwt => {
        return jwt.verify({
          token: signedJwt,
          jwk: res.sharedKey
        })
      });
    })
    .then(res => expect(res).toEqual(tokens.standardClaimsSet));
  });

  env.supports('HS512').it('should allow generating, signing and verifying using HS512', () => {
    return jwt.generateKey({
      alg: 'HS512'
    })
    .then(res => {
      return jwt.sign({
        claims: tokens.standardClaimsSet,
        jwk: res.sharedKey
      })
      .then(signedJwt => {
        return jwt.verify({
          token: signedJwt,
          jwk: res.sharedKey
        })
      });
    })
    .then(res => expect(res).toEqual(tokens.standardClaimsSet));
  });

  env.supports('ES256').it('should allow generating, signing and verifying using ES256', () => {
    return jwt.generateKey({
      alg: 'ES256'
    })
    .then(res => {
      return jwt.sign({
        claims: tokens.standardClaimsSet,
        jwk: res.privateKey,
        alg: 'ES256'
      })
      .then(signedJwt => {
        return jwt.verify({
          token: signedJwt,
          jwk: res.publicKey
        })
      });
    })
    .then(res => expect(res).toEqual(tokens.standardClaimsSet));
  });

  env.supports('ES384').it('should allow generating, signing and verifying using ES384', () => {
    return jwt.generateKey({
      alg: 'ES384'
    })
    .then(res => {
      return jwt.sign({
        claims: tokens.standardClaimsSet,
        jwk: res.privateKey,
        alg: 'ES384'
      })
      .then(signedJwt => {
        return jwt.verify({
          token: signedJwt,
          jwk: res.publicKey
        })
      });
    })
    .then(res => expect(res).toEqual(tokens.standardClaimsSet));
  });

  env.supports('ES512').it('should allow generating, signing and verifying using ES512', () => {
    return jwt.generateKey({
      alg: 'ES512'
    })
    .then(res => {
      return jwt.sign({
        claims: tokens.standardClaimsSet,
        jwk: res.privateKey,
        alg: 'ES512'
      })
      .then(signedJwt => {
        return jwt.verify({
          token: signedJwt,
          jwk: res.publicKey
        })
      });
    })
    .then(res => expect(res).toEqual(tokens.standardClaimsSet));
  });
});
