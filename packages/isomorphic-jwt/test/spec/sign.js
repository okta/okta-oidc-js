const tokens = require('../tokens');
const jwt = require('../env').jwt;
const util = require('../util');

xdescribe('jwt.sign', () => {
  describe('RS256', () => {
    it('should allow signing claims', () => {
      return jwt.sign({
        claims: tokens.standardClaimsSet,
        jwk: tokens.RS256privateKey
      })
      .then(res => expect(res).toEqual(tokens.RS256token));
    });
  });

  describe('RS384', () => {
    it('should allow signing claims', () => {
      return jwt.sign({
        claims: tokens.standardClaimsSet,
        jwk: tokens.RS384privateKey
      })
      .then(res => expect(res).toEqual(tokens.RS384token));
    });
  });
});
