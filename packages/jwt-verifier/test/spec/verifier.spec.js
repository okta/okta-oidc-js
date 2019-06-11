/*!
 * Copyright (c) 2017-Present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

const fs = require('fs');
const nJwt = require('njwt');
const nock = require('nock');
const path = require('path');
const tk = require('timekeeper');
const constants = require('../constants')

const OktaJwtVerifier = require('../../lib');
const getAccessToken = require('../util').getAccessToken;

// These need to be exported in the environment, from a working Okta org
const ISSUER = constants.ISSUER;
const CLIENT_ID = constants.CLIENT_ID;
const USERNAME = constants.USERNAME;
const PASSWORD = constants.PASSWORD;
const REDIRECT_URI = constants.REDIRECT_URI
const OKTA_TESTING_DISABLEHTTPSCHECK = constants.OKTA_TESTING_DISABLEHTTPSCHECK

// Used to get an access token from the AS
const issuer1AccessTokenParams = {
  ISSUER,
  CLIENT_ID,
  USERNAME,
  PASSWORD,
  REDIRECT_URI
};

const publicKeyPath = path.normalize(path.join(__dirname, '../../../../node_modules/njwt/test/rsa.pub'));
const privateKeyPath = path.normalize(path.join(__dirname, '../../../../node_modules/njwt/test/rsa.priv'));
const rsaKeyPair = {
  public: fs.readFileSync(publicKeyPath, 'utf8'),
  private: fs.readFileSync(privateKeyPath, 'utf8')
};

describe('Jwt Verifier', () => {
  describe('tests with api calls', () => {
    const verifier = new OktaJwtVerifier({
      clientId: CLIENT_ID,
      issuer: ISSUER,
      testing: {
        disableHttpsCheck: OKTA_TESTING_DISABLEHTTPSCHECK
      }
    });
  
    it('should allow me to verify Okta access tokens', () => {
      return getAccessToken(issuer1AccessTokenParams)
      .then(accessToken => verifier.verifyAccessToken(accessToken))
      .then(jwt => {
        expect(jwt.claims.iss).toBe(ISSUER);
        expect(jwt.claims.cid).toBe(CLIENT_ID);
      });
    });
  
    it('should fail if the signature is invalid', () => {
      return getAccessToken(issuer1AccessTokenParams)
      .then(accessToken => verifier.verifyAccessToken(accessToken))
      .then(jwt => {
        // Create an access token with the same claims and kid, then re-sign it with another RSA private key - this should fail
        const token = new nJwt.Jwt(jwt.claims)
          .setSigningAlgorithm('RS256')
          .setSigningKey(rsaKeyPair.private)
          .setHeader('kid', jwt.header.kid)
          .compact();
        return verifier.verifyAccessToken(token)
        .catch(err => expect(err.message).toBe('Signature verification failed'));
      });
    });
  
    it('should fail if no kid is present in the JWT header', () => {
      return getAccessToken(issuer1AccessTokenParams)
      .then(accessToken => verifier.verifyAccessToken(accessToken))
      .then(jwt => {
        // Create an access token that does not have a kid
        const token = new nJwt.Jwt(jwt.claims)
          .setSigningAlgorithm('RS256')
          .setSigningKey(rsaKeyPair.private)
          .compact();
        return verifier.verifyAccessToken(token)
        .catch(err => expect(err.message).toBe('Error while resolving signing key for kid "undefined"'));
      });
    });
  
    it('should fail if the kid cannot be found', () => {
      return getAccessToken(issuer1AccessTokenParams)
      .then(accessToken => verifier.verifyAccessToken(accessToken))
      .then(jwt => {
        // Create an access token with the same claims but a kid that will not resolve
        const token = new nJwt.Jwt(jwt.claims)
          .setSigningAlgorithm('RS256')
          .setSigningKey(rsaKeyPair.private)
          .setHeader('kid', 'foo')
          .compact();
        return verifier.verifyAccessToken(token)
        .catch(err => expect(err.message).toBe('Error while resolving signing key for kid "foo"'));
      });
    });
  
    it('should fail if the token is expired (exp)', () => {
      return getAccessToken(issuer1AccessTokenParams)
      .then(accessToken =>
        verifier.verifyAccessToken(accessToken)
        .then(jwt => {
          // Now advance time past the exp claim
          const now = new Date();
          const then = new Date((jwt.claims.exp * 1000) + 1000);
          tk.travel(then);
          return verifier.verifyAccessToken(accessToken)
          .then(() => {
            throw new Error('Should have errored');
          })
          .catch(err => {
            tk.travel(now);
            expect(err.message).toBe('Jwt is expired');
          });
        }));
    });
  
    it('should allow me to assert custom claims', () => {
      const verifier = new OktaJwtVerifier({
        issuer: ISSUER,
        clientId: CLIENT_ID,
        assertClaims: {
          cid: 'baz',
          foo: 'bar'
        },
        testing: {
          disableHttpsCheck: OKTA_TESTING_DISABLEHTTPSCHECK
        }
      });
      return getAccessToken(issuer1AccessTokenParams)
      .then(accessToken =>
        verifier.verifyAccessToken(accessToken)
        .catch(err => {
          // Extra debugging for an intermittent issue
          const result = typeof accessToken === 'string' ? 'accessToken is a string' : accessToken;
          expect(result).toBe('accessToken is a string');
          expect(err.message).toBe(
            `claim 'cid' value '${CLIENT_ID}' does not match expected value 'baz', claim 'foo' value 'undefined' does not match expected value 'bar'`
          );
        })
      );
    });
  
    it('should cache the jwks for the configured amount of time', () => {
      const verifier = new OktaJwtVerifier({
        clientId: CLIENT_ID,
        issuer: ISSUER,
        cacheMaxAge: 500,
        testing: {
          disableHttpsCheck: OKTA_TESTING_DISABLEHTTPSCHECK
        }
      });
      return getAccessToken(issuer1AccessTokenParams)
      .then(accessToken => {
        nock.recorder.rec({
          output_objects: true,
          dont_print: true
        });
        const nockCallObjects = nock.recorder.play();
        return verifier.verifyAccessToken(accessToken)
        .then(jwt => {
          expect(nockCallObjects.length).toBe(1);
          return verifier.verifyAccessToken(accessToken);
        })
        .then(jwt => {
          expect(nockCallObjects.length).toBe(1);
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              verifier.verifyAccessToken(accessToken)
              .then(jwt => {
                expect(nockCallObjects.length).toBe(2);
                resolve();
              })
              .catch(reject);
            }, 1000);
          });
        })
      });
    });
  
    it('should rate limit jwks endpoint requests on cache misses', () => {
      const verifier = new OktaJwtVerifier({
        clientId: CLIENT_ID,
        issuer: ISSUER,
        jwksRequestsPerMinute: 2,
        testing: {
          disableHttpsCheck: OKTA_TESTING_DISABLEHTTPSCHECK
        }
      });
      return getAccessToken(issuer1AccessTokenParams)
      .then((accessToken => {
        nock.recorder.clear();
        return verifier.verifyAccessToken(accessToken)
        .then(jwt => {
          // Create an access token with the same claims but a kid that will not resolve
          const token = new nJwt.Jwt(jwt.claims)
            .setSigningAlgorithm('RS256')
            .setSigningKey(rsaKeyPair.private)
            .setHeader('kid', 'foo')
            .compact();
          return verifier.verifyAccessToken(token)
          .catch(err => verifier.verifyAccessToken(token))
          .catch(err => {
            const nockCallObjects = nock.recorder.play();
            // Expect 1 request for the valid kid, and 1 request for the 2 attempts with an invalid kid
            expect(nockCallObjects.length).toBe(2);
          });
        })
      }));
    });  
  });

  describe('tests with stubs', () => {

    const verifier = new OktaJwtVerifier({
      issuer: ISSUER,
      clientId: CLIENT_ID,
      testing: {
        disableHttpsCheck: OKTA_TESTING_DISABLEHTTPSCHECK
      }
    });

    it('should only allow includes operator for custom claims', () => {
      verifier.claimsToAssert = {'groups.blarg': 'Everyone'};
      verifier.verifier = {
        verify: function(jwt, cb) {
          cb(null, {
            body: {
              groups: ['Everyone', 'Another']
            }
          })
        }
      };
      
      return verifier.verifyAccessToken('anything')
      .catch(err => expect(err.message).toBe(
        `operator: 'blarg' invalid. Supported operators: 'includes'.`
      ));
    });

    it('should succeed in asserting claims where includes is flat, claim is array', () => {
      verifier.claimsToAssert = {'groups.includes': 'Everyone'};
      verifier.verifier = {
        verify: function(jwt, cb) {
          cb(null, {
            body: {
              groups: ['Everyone', 'Another']
            }
          })
        }
      };
  
      return verifier.verifyAccessToken('anything')
      .then(jwt => expect(jwt.claims.groups).toEqual(['Everyone', 'Another']));
    });
  
    it('should succeed in asserting claims where includes is flat, claim is flat', () => {
      verifier.claimsToAssert = {'scp.includes': 'promos:read'};
      verifier.verifier = {
        verify: function(jwt, cb) {
          cb(null, {
            body: {
              scp: 'promos:read promos:write'
            }
          })
        }
      };
  
      return verifier.verifyAccessToken('anything')
      .then(jwt => expect(jwt.claims.scp).toBe('promos:read promos:write'));
    });
  
    it('should fail in asserting claims where includes is flat, claim is array', () => {
      verifier.claimsToAssert = {'groups.includes': 'Yet Another'};
      verifier.verifier = {
        verify: function(jwt, cb) {
          cb(null, {
            body: {
              groups: ['Everyone', 'Another']
            }
          })
        }
      };
  
      return verifier.verifyAccessToken('anything')
      .catch(err => expect(err.message).toBe(
        `claim 'groups' value 'Everyone,Another' does not include expected value 'Yet Another'`
      ));
    });
  
    it('should fail in asserting claims where includes is flat, claim is flat', () => {
      verifier.claimsToAssert = {'scp.includes': 'promos:delete'};
      verifier.verifier = {
        verify: function(jwt, cb) {
          cb(null, {
            body: {
              scp: 'promos:read promos:write'
            }
          })
        }
      };
  
      return verifier.verifyAccessToken('anything')
      .catch(err => expect(err.message).toBe(
        `claim 'scp' value 'promos:read promos:write' does not include expected value 'promos:delete'`
      ));
    });
  
    it('should succeed in asserting claims where includes is array, claim is array', () => {
      verifier.claimsToAssert = {'groups.includes': ['Everyone', 'Yet Another']};
      verifier.verifier = {
        verify: function(jwt, cb) {
          cb(null, {
            body: {
              groups: ['Everyone', 'Another', 'Yet Another']
            }
          })
        }
      };
  
      return verifier.verifyAccessToken('anything')
      .then(jwt => expect(jwt.claims.groups).toEqual(['Everyone', 'Another', 'Yet Another']));
    });
  
    it('should succeed in asserting claims where includes is array, claim is flat', () => {
      verifier.claimsToAssert = {'scp.includes': ['promos:read', 'promos:delete']};
      verifier.verifier = {
        verify: function(jwt, cb) {
          cb(null, {
            body: {
              scp: 'promos:read promos:write promos:delete'
            }
          })
        }
      };
  
      return verifier.verifyAccessToken('anything')
      .then(jwt => expect(jwt.claims.scp).toBe('promos:read promos:write promos:delete'));
    });
  
    it('should fail in asserting claims where includes is array, claim is array', () => {
      verifier.claimsToAssert = {'groups.includes': ['Yet Another']};
      verifier.verifier = {
        verify: function(jwt, cb) {
          cb(null, {
            body: {
              groups: ['Everyone', 'Another']
            }
          })
        }
      };
  
      return verifier.verifyAccessToken('anything')
      .catch(err => expect(err.message).toBe(
        `claim 'groups' value 'Everyone,Another' does not include expected value 'Yet Another'`
      ));
    });
  
    it('should fail in asserting claims where includes is array, claim is flat', () => {
      verifier.claimsToAssert = {'scp.includes': ['promos:delete']};
      verifier.verifier = {
        verify: function(jwt, cb) {
          cb(null, {
            body: {
              scp: 'promos:read promos:write'
            }
          })
        }
      };
  
      return verifier.verifyAccessToken('anything')
      .catch(err => expect(err.message).toBe(
        `claim 'scp' value 'promos:read promos:write' does not include expected value 'promos:delete'`
      ));
    });  
  });
});
