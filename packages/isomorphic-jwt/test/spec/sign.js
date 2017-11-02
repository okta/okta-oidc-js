const tokens = require('../tokens');
const env = require('../env');
const jwt = env.jwt;
const util = require('../util');

describe('jwt.sign', () => {

  // Cannot check elliptic curve signatures against existing
  // signatures, because they change every time.

  describe('RSA algos', () => {
    ['RS256', 'RS384', 'RS512'].map(algo => {
      env.supports({ [algo]: ['generateKey'] })
      .it(`should allow signing claims for ${algo}`, () => {
        return jwt.sign({
          claims: tokens.standardClaimsSet,
          jwk: tokens.algos[algo].privateKey
        })
        .then(res => expect(res).toEqual(tokens.algos[algo].token));
      });
    });
  });

  describe('HSA algos', () => {
    ['HS256', 'HS384', 'HS512'].map(algo => {
      env.supports({ [algo]: ['generateKey'] })
      .it(`should allow signing claims for ${algo}`, () => {
        return jwt.sign({
          claims: tokens.standardClaimsSet,
          jwk: tokens.algos[algo].sharedKey
        })
        .then(res => expect(res).toEqual(tokens.algos[algo].token));
      });
    });
  });
});
