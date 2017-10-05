const jwt = require('../../dist/universal');
const errors = require('../../src/errors');
const tokens = require('../tokens');

function expectError(promise, errorMessage) {
  let error = {};
  return promise
    .catch(err => error = err)
    .then(() => expect(error.message).toEqual(errorMessage));
}

describe('jwt.sign', () => {
  describe('RS384', () => {
    it('should allow signing claims', () => {
      return jwt.sign({
        claims: tokens.standardClaimsSet,
        jwk: tokens.RS384privateKey
      })
      .then(res => expect(res).toEqual(''));
    });
  });
});
