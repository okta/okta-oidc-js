const tokens = require('../tokens');
const env = require('../env');
const jwt = env.jwt;
const util = require('../util');

describe('jwt.sign', () => {
  env.supports('RS256').describe('RS256', () => {
    it('should allow signing claims', () => {
      return jwt.sign({
        claims: tokens.standardClaimsSet,
        jwk: tokens.RS256privateKey
      })
      .then(res => expect(res).toEqual(tokens.RS256token));
    });
  });

  env.supports('RS384').describe('RS384', () => {
    it('should allow signing claims', () => {
      return jwt.sign({
        claims: tokens.standardClaimsSet,
        jwk: tokens.RS384privateKey
      })
      .then(res => expect(res).toEqual(tokens.RS384token));
    });
  });

  env.supports('RS512').describe('RS512', () => {
    it('should allow signing claims', () => {
      return jwt.sign({
        claims: tokens.standardClaimsSet,
        jwk: tokens.RS512privateKey
      })
      .then(res => expect(res).toEqual(tokens.RS512token));
    });
  });

  env.supports('HS256').describe('HS256', () => {
    it('should allow signing claims', () => {
      return jwt.sign({
        claims: tokens.standardClaimsSet,
        jwk: tokens.HS256sharedKey
      })
      .then(res => expect(res).toEqual(tokens.HS256token));
    });
  });

  env.supports('HS384').describe('HS384', () => {
    it('should allow signing claims', () => {
      return jwt.sign({
        claims: tokens.standardClaimsSet,
        jwk: tokens.HS384sharedKey
      })
      .then(res => expect(res).toEqual(tokens.HS384token));
    });
  });
});
