const tokens = require('../tokens');
const env = require('../env');
const jwt = env.jwt;
const util = require('../util');

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
      //console.log(JSON.stringify(res, null, 2));
      return jwt.sign({
        claims: tokens.standardClaimsSet,
        jwk: res.privateKey
      })
      .then(signedJwt => {
        //console.log(JSON.stringify(signedJwt, null, 2));
        return jwt.verify({
          token: signedJwt,
          jwk: res.publicKey
        })
      });
    })
    .then(res => expect(res).toEqual(tokens.standardClaimsSet));
  });
});
