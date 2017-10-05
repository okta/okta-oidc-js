const jwt = require('../../dist/node');
const errors = require('../../src/errors');
const tokens = require('../tokens');

function expectError(promise, errorMessage) {
  let error = {};
  return promise
    .catch(err => error = err)
    .then(() => expect(error.message).toEqual(errorMessage));
}

describe('jwt.verify', () => {
  it('should throw an error for an unsecured jwt', () => {
    return expectError(jwt.verify({
      token: tokens.unsecuredJWT,
      jwk: {}
    }), 'The jwk must have a defined algorithm to verify');
  });

  it('should throw an error if neither token nor jwk are provided', () => {
    return expectError(jwt.verify(), 'jwt.verify requires a token and jwk');
  });

  it('should throw an error if no token is provided', () => {
    return expectError(jwt.verify({jwk: {}}),
      'jwt.verify requires a token and jwk');
  });

  it('should throw an error if no jwk is provided', () => {
    return expectError(jwt.verify({token: {}}),
      'jwt.verify requires a token and jwk');
  });
  
  it('should throw an error if there is no alg in the header', () => {
    return expectError(jwt.verify({
      token: tokens.noAlgInHeader,
      jwk: {}
    }), 'The jwk must have a defined algorithm to verify');
  });

  it('should throw an error for a token and jwk signature mismatch', () => {
    return expectError(jwt.verify({
      token: tokens.unicodeToken,
      jwk: tokens.standardKey
    }), 'The jwt has an alg of HS256, but the key is for RS256');
  });

  it('should throw an error for a token and jwk signature mismatch ' +
      'even if there is no alg on the jwk', () => {
    return expectError(jwt.verify({
      token: tokens.unicodeToken,
      jwk: tokens.keyWithoutAlg
    }), 'Unable to import key');
  });

  describe('RS256', () => {
    it('should return claims set on success', () => {
      return jwt.verify({
        token: tokens.RS256token,
        jwk: tokens.RS256publicKey
      })
      .then(res => expect(res).toEqual(tokens.standardClaimsSet));
    });

    it('should return false on failure', () => {
      return jwt.verify({
        token: tokens.RS256invalidToken,
        jwk: tokens.RS256publicKey
      })
      .then(res => expect(res).toBe(false));
    });
  });

  xdescribe('RS384', () => {
    it('should return claims set on success', () => {
      return jwt.verify({
        token: tokens.RS384token,
        jwk: tokens.RS384publicKey
      })
      .then(res => expect(res).toEqual(tokens.standardClaimsSet));
    });

    it('should return false on failure', () => {
      return jwt.verify({
        token: tokens.RS384invalidToken,
        jwk: tokens.RS384publicKey
      })
      .then(res => expect(res).toBe(false));
    });
  });

  xdescribe('HS256', () => {
    it('should return claims set on success', () => {
      return jwt.verify({
        token: tokens.HS256token,
        jwk: tokens.HS256sharedKey
      })
      .then(res => expect(res).toEqual(tokens.standardClaimsSet));
    });

    it('should return false on failure', () => {
      return jwt.verify({
        token: tokens.HS256invalidToken,
        jwk: tokens.HS256sharedKey
      })
      .then(res => expect(res).toBe(false));
    });
  });

  xdescribe('HS384', () => {
    it('should return claims set on success', () => {
      return jwt.verify({
        token: tokens.HS384token,
        jwk: tokens.HS384sharedKey
      })
      .then(res => expect(res).toEqual(tokens.standardClaimsSet));
    });

    it('should return false on failure', () => {
      return jwt.verify({
        token: tokens.HS384invalidToken,
        jwk: tokens.HS384sharedKey
      })
      .then(res => expect(res).toBe(false));
    });
  });
});
