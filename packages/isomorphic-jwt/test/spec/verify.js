const jwt = require('../../dist/index');
const errors = require('../../src/errors');
const tokens = require('../tokens');

function expectError(promise, errorMessage) {
  let error = {};
  return promise
    .catch(err => error = err)
    .then(() => expect(error.message).toEqual(errorMessage));
}

describe('jwt.verify', () => {
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
    }), 'The jwk must have a defined algorithm');
  });

  it('should throw an error if the alg is "none"', () => {
    return expectError(jwt.verify({
      token: tokens.algIsNone,
      jwk: {}
    }), 'The jwk must have a defined algorithm');
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
    it('should return payload on success', () => {
      return jwt.verify({
        token: tokens.RS256token,
        jwk: tokens.RS256key
      })
      .then(res => expect(res).toEqual(tokens.standardPayload));
    });

    it('should return false on failure', () => {
      return jwt.verify({
        token: tokens.RS256invalidToken,
        jwk: tokens.RS256key
      })
      .then(res => expect(res).toBe(false));
    });
  });
});
