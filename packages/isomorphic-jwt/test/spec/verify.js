const tokens = require('../tokens');
const env = require('../env');
const jwt = env.jwt;
const util = require('../util');

describe('jwt.verify', () => {
  it('should throw an error for an unsecured jwt', () => {
    return util.expectPromiseError(jwt.verify({
      token: tokens.unsecuredJWT,
      jwk: {}
    }), 'The jwk must have a defined algorithm to verify');
  });

  it('should throw an error if neither token nor jwk are provided', () => {
    return util.expectPromiseError(jwt.verify(), 'jwt.verify requires a token and jwk');
  });

  it('should throw an error if no token is provided', () => {
    return util.expectPromiseError(jwt.verify({jwk: {}}),
      'jwt.verify requires a token and jwk');
  });

  it('should throw an error if no jwk is provided', () => {
    return util.expectPromiseError(jwt.verify({token: {}}),
      'jwt.verify requires a token and jwk');
  });
  
  it('should throw an error if there is no alg in the header', () => {
    return util.expectPromiseError(jwt.verify({
      token: tokens.noAlgInHeader,
      jwk: {}
    }), 'The jwk must have a defined algorithm to verify');
  });

  it('should throw an error for a token and jwk signature mismatch', () => {
    return util.expectPromiseError(jwt.verify({
      token: tokens.unicodeToken,
      jwk: tokens.standardKey
    }), 'The jwt has an alg of HS256, but the key is for RS256');
  });

  it('should throw an error for a token and jwk signature mismatch ' +
      'even if there is no alg on the jwk', () => {
    return util.expectPromiseError(jwt.verify({
      token: tokens.unicodeToken,
      jwk: tokens.keyWithoutAlg
    }), new RegExp('Unable to import key:'));
  });

  describe('RSA and Elliptic curve algos', () => {
    ['RS256', 'RS384', 'RS512', 'ES256', 'ES384', 'ES512'].map(algo => {
      env.supports({ [algo]: ['verify'] })
      .it(`should return claims set on success for ${algo}`, () => {
        return jwt.verify({
          token: tokens.algos[algo].token,
          jwk: tokens.algos[algo].publicKey
        })
        .then(res => expect(res).toEqual(tokens.standardClaimsSet));
      });

      env.supports({ [algo]: ['verify'] })
      .it(`should return false on failure for ${algo}`, () => {
        return jwt.verify({
          token: tokens.algos[algo].invalidToken,
          jwk: tokens.algos[algo].publicKey
        })
        .then(res => expect(res).toBe(false));
      });
    });
  });

  describe('HSA algos', () => {
    ['HS256', 'HS384', 'HS512'].map(algo => {
      env.supports({ [algo]: ['verify'] })
      .it(`should return claims set on success for ${algo}`, () => {
        return jwt.verify({
          token: tokens.algos[algo].token,
          jwk: tokens.algos[algo].sharedKey
        })
        .then(res => expect(res).toEqual(tokens.standardClaimsSet));
      });
      
      env.supports({ [algo]: ['verify'] })
      .it(`should return false on failure for ${algo}`, () => {
        return jwt.verify({
          token: tokens.algos[algo].invalidToken,
          jwk: tokens.algos[algo].sharedKey
        })
        .then(res => expect(res).toBe(false));
      });
    });
  });
});
