const assert = require('assert');
const fs = require('fs');
const nJwt = require('njwt');
const nock = require('nock');
const path = require('path');
const tk = require('timekeeper');

const OktaJwtVerifier = require('../../lib');
const getAccessToken = require('../util').getAccessToken;

// These need to be exported in the environment, from a working Okta org
const {
  CLIENT_ID,
  ISSUER,
  REDIRECT_URI,
  USERNAME,
  PASSWORD
} = process.env;

// Used to get an access token from the AS
const issuer1AccessTokenParams = {
  ISSUER: ISSUER,
  CLIENT_ID: CLIENT_ID,
  USERNAME: USERNAME,
  PASSWORD: PASSWORD,
  REDIRECT_URI: REDIRECT_URI
};

const rsaKeyPair = {
  public: fs.readFileSync(path.join(__dirname, '..', '..', 'node_modules', 'njwt', 'test', 'rsa.pub'),'utf8'),
  private: fs.readFileSync(path.join(__dirname, '..', '..', 'node_modules', 'njwt', 'test', 'rsa.priv'),'utf8')
};

describe('Jwt Verifier', () => {

  const verifier = new OktaJwtVerifier({
    clientId: CLIENT_ID,
    issuer: ISSUER
  });

  it('should allow me to verify Okta access tokens', () => {
    return getAccessToken(issuer1AccessTokenParams)
      .then((accessToken => {
        return verifier.verifyAccessToken(accessToken)
          .then(jwt => {
            assert.equal(jwt.claims.iss, ISSUER);
            assert.equal(jwt.claims.cid, CLIENT_ID);
          });
      }));
  });

  it('should fail if the signature is invalid', () => {
    return getAccessToken(issuer1AccessTokenParams)
      .then((accessToken => {
        return verifier.verifyAccessToken(accessToken)
          .then(jwt => {
            // Create an access token with the same claims and kid, then re-sign it with another RSA private key - this should fail
            const token = new nJwt.Jwt(jwt.claims)
              .setSigningAlgorithm('RS256')
              .setSigningKey(rsaKeyPair.private)
              .setHeader('kid', jwt.header.kid)
              .compact();
            return verifier.verifyAccessToken(token)
              .catch(err=> {
                assert.equal(err.message, "Signature verification failed");
              });
          });
      }));
  });

  it('should fail if no kid is present in the JWT header', () => {
    return getAccessToken(issuer1AccessTokenParams)
      .then((accessToken => {
        return verifier.verifyAccessToken(accessToken)
          .then(jwt => {
            // Create an access token that does not have a kid
            const token = new nJwt.Jwt(jwt.claims)
              .setSigningAlgorithm('RS256')
              .setSigningKey(rsaKeyPair.private)
              .compact();
            return verifier.verifyAccessToken(token)
              .catch(err=> {
                assert.equal(err.message, 'Error while resolving signing key for kid "undefined"');
              });
          });
      }));
  });

  it('should fail if the kid cannot be found', () => {
    return getAccessToken(issuer1AccessTokenParams)
      .then((accessToken => {
        return verifier.verifyAccessToken(accessToken)
          .then(jwt => {
            // Create an access token with the same claims but a kid that will not resolve
            const token = new nJwt.Jwt(jwt.claims)
              .setSigningAlgorithm('RS256')
              .setSigningKey(rsaKeyPair.private)
              .setHeader('kid', 'foo')
              .compact();
            return verifier.verifyAccessToken(token)
              .catch(err=> {
                assert.equal(err.message, 'Error while resolving signing key for kid "foo"');
              });
          });
      }));
  });

  it('should fail if the token is expired (exp)', () => {
    return getAccessToken(issuer1AccessTokenParams)
      .then((accessToken => {
        return verifier.verifyAccessToken(accessToken)
          .then(jwt => {
            // Now advance time past the exp claim
            const now = new Date();
            const then = new Date((jwt.claims.exp * 1000) + 1000);
            tk.travel(then);
            return verifier.verifyAccessToken(accessToken)
              .then(() => {
                throw new Error('Should have errored');
                tk.travel(now);
              })
              .catch(err=> {
                assert.equal(err.message, 'Jwt is expired');
                tk.travel(now);
              });
          });
      }));
  });

  it('should allow me to assert custom claims', () => {
    return getAccessToken(issuer1AccessTokenParams)
      .then((accessToken => {
        const verifier = new OktaJwtVerifier({
          issuer: ISSUER,
          assertClaims: {
            cid: 'baz',
            foo: 'bar'
          }
        });
        return verifier.verifyAccessToken(accessToken)
          .catch(err=> {
            assert.equal(err.message,
              `claim 'cid' value '${CLIENT_ID}' does not match expected value 'baz', claim 'foo' value 'undefined' does not match expected value 'bar'`
            );
          });
      }));
  });

  it('should cache the jwks for the configured amount of time', () => {
    return getAccessToken(issuer1AccessTokenParams)
      .then((accessToken => {
        nock.recorder.rec({
          output_objects: true,
          dont_print: true
        });
        const verifier = new OktaJwtVerifier({
          clientId: CLIENT_ID,
          issuer: ISSUER,
          cacheMaxAge: 1000
        });
        return verifier.verifyAccessToken(accessToken)
          .then(jwt => {
            const nockCallObjects = nock.recorder.play();
            assert.equal(nockCallObjects.length, 1);
            return verifier.verifyAccessToken(accessToken)
              .then(jwt => {
                assert.equal(nockCallObjects.length, 1);
                return new Promise((resolve, reject) => {
                  setTimeout(() => {
                    verifier.verifyAccessToken(accessToken)
                      .then(jwt => {
                        assert.equal(nockCallObjects.length, 2);
                        resolve();
                      })
                      .catch(reject);
                  },2000);
                });
              })
          })
      }));
  });

  it('should rate limit jwks endpoint requests on cache misses', () => {
    return getAccessToken(issuer1AccessTokenParams)
      .then((accessToken => {
        nock.recorder.clear();
        const verifier = new OktaJwtVerifier({
          clientId: CLIENT_ID,
          issuer: ISSUER,
          jwksRequestsPerMinute: 2,
        });
        return verifier.verifyAccessToken(accessToken)
          .then(jwt => {
            // Create an access token with the same claims but a kid that will not resolve
            const token = new nJwt.Jwt(jwt.claims)
              .setSigningAlgorithm('RS256')
              .setSigningKey(rsaKeyPair.private)
              .setHeader('kid', 'foo')
              .compact();
            return verifier.verifyAccessToken(token)
              .catch(err => {
                return verifier.verifyAccessToken(token)
                  .catch(err => {
                    const nockCallObjects = nock.recorder.play();
                    // Expect 1 request for the valid kid, and 1 request for the 2 attempts with an invalid kid
                    assert.equal(nockCallObjects.length, 2);
                  });
              })
          })
      }));
  });
});
