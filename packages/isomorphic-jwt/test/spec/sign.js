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
});
