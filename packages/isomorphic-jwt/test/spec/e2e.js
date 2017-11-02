const tokens = require('../tokens');
const env = require('../env');
const jwt = env.jwt;
const util = require('../util');

describe('using jwt operations end-to-end', () => {
  describe('RSA algos', () => {
    ['RS256', 'RS384', 'RS512'].map(algo => {
      env.supports({
        [algo]: ['generateKey', 'sign', 'verify']}
      )
      .it(`should allow generating, signing and verifying using ${algo}`, () => {
        return jwt.generateKey({
          alg: algo
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
    });
  });

  describe('HSA algos', () => {
    ['HS256', 'HS384', 'HS512'].map(algo => {
      env.supports({
        [algo]: ['generateKey', 'sign', 'verify']}
      )
      .it(`should allow generating, signing and verifying using ${algo}`, () => {
        return jwt.generateKey({
          alg: algo
        })
        .then(res => {
          return jwt.sign({
            claims: tokens.standardClaimsSet,
            jwk: res.sharedKey
          })
          .then(signedJwt => {
            return jwt.verify({
              token: signedJwt,
              jwk: res.sharedKey
            })
          });
        })
        .then(res => expect(res).toEqual(tokens.standardClaimsSet));
      });
    });
  });
  
  describe('Elliptic curve algos', () => {
    ['ES256', 'ES384', 'ES512'].map(algo => {
      env.supports({
        [algo]: ['generateKey', 'sign', 'verify']}
      )
      .it(`should allow generating, signing and verifying using ${algo}`, () => {
        return jwt.generateKey({
          alg: algo
        })
        .then(res => {
          return jwt.sign({
            claims: tokens.standardClaimsSet,
            jwk: res.privateKey,
            alg: algo
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
    });
  });
});
