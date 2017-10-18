const tokens = require('../tokens');
const env = require('../env');
const jwt = env.jwt;
const util = require('../util');

describe('jwt.sign', () => {

  // Cannot check elliptic curve signatures against existing
  // signatures, because they change every time.

  env.supports({ RS256: ['sign'] })
  .it('should allow signing claims for RS256', () => {
    return jwt.sign({
      claims: tokens.standardClaimsSet,
      jwk: tokens.RS256privateKey
    })
    .then(res => expect(res).toEqual(tokens.RS256token));
  });

  env.supports({ RS384: ['sign'] })
  .it('should allow signing claims for RS384', () => {
    return jwt.sign({
      claims: tokens.standardClaimsSet,
      jwk: tokens.RS384privateKey
    })
    .then(res => expect(res).toEqual(tokens.RS384token));
  });

  env.supports({ RS512: ['sign'] })
  .it('should allow signing claims for RS512', () => {
    return jwt.sign({
      claims: tokens.standardClaimsSet,
      jwk: tokens.RS512privateKey
    })
    .then(res => expect(res).toEqual(tokens.RS512token));
  });

  env.supports({ HS256: ['sign'] })
  .it('should allow signing claims for HS256', () => {
    return jwt.sign({
      claims: tokens.standardClaimsSet,
      jwk: tokens.HS256sharedKey
    })
    .then(res => expect(res).toEqual(tokens.HS256token));
  });

  env.supports({ HS384: ['sign'] })
  .it('should allow signing claims for HS384', () => {
    return jwt.sign({
      claims: tokens.standardClaimsSet,
      jwk: tokens.HS384sharedKey
    })
    .then(res => expect(res).toEqual(tokens.HS384token));
  });

  env.supports({ HS512: ['sign'] })
  .it('should allow signing claims for HS512', () => {
    return jwt.sign({
      claims: tokens.standardClaimsSet,
      jwk: tokens.HS512sharedKey
    })
    .then(res => expect(res).toEqual(tokens.HS512token));
  });
});
