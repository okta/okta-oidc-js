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
const njwt = require('njwt');
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

// Some tests makes LIVE requests using getAccessToken(). These may take much longer than normal tests
const LONG_TIMEOUT = 60000;

// Used to get an access token from the AS
const issuer1AccessTokenParams = {
  ISSUER,
  CLIENT_ID,
  USERNAME,
  PASSWORD,
  REDIRECT_URI
};

const NODE_MODULES = path.resolve(__dirname, '../../node_modules');
const publicKeyPath = path.normalize(path.join(NODE_MODULES, '/njwt/test/rsa.pub'));
const privateKeyPath = path.normalize(path.join(NODE_MODULES, '/njwt/test/rsa.priv'));
const wrongPublicKeyPath = path.normalize(path.join(__dirname, '../keys/rsa-fake.pub'));
const rsaKeyPair = {
  public: fs.readFileSync(publicKeyPath, 'utf8'),
  private: fs.readFileSync(privateKeyPath, 'utf8'),
  wrongPublic: fs.readFileSync(wrongPublicKeyPath, 'utf8')
};

describe('Jwt Verifier', () => {
  describe('Access token tests with api calls', () => {
    const expectedAud = 'api://default';
    const verifier = new OktaJwtVerifier({
      issuer: ISSUER,
      testing: {
        disableHttpsCheck: OKTA_TESTING_DISABLEHTTPSCHECK
      }
    });

    it('should allow me to verify Okta access tokens', () => {
      return getAccessToken(issuer1AccessTokenParams)
      .then(accessToken => {
        return verifier.verifyAccessToken(accessToken, expectedAud);
      })
      .then(jwt => {
        expect(jwt.claims.iss).toBe(ISSUER);
      });
    }, LONG_TIMEOUT);

    it('should fail if the signature is invalid', () => {
      return getAccessToken(issuer1AccessTokenParams)
      .then(accessToken => verifier.verifyAccessToken(accessToken, expectedAud))
      .then(jwt => {
        // Create an access token with the same claims and kid, then re-sign it with another RSA private key - this should fail
        const token = new njwt.Jwt(jwt.claims)
          .setSigningAlgorithm('RS256')
          .setSigningKey(rsaKeyPair.private)
          .setIssuer(ISSUER)
          .setHeader('kid', jwt.header.kid)
          .compact();
        return verifier.verifyAccessToken(token, expectedAud)
        .catch(err => expect(err.message).toBe('Signature verification failed'));
      });
    }, LONG_TIMEOUT);

    it('should fail if no kid is present in the JWT header', () => {
      return getAccessToken(issuer1AccessTokenParams)
      .then(accessToken => verifier.verifyAccessToken(accessToken, expectedAud))
      .then(jwt => {
        // Create an access token that does not have a kid
        const token = new njwt.Jwt(jwt.claims)
          .setIssuer(ISSUER)
          .setSigningAlgorithm('RS256')
          .setSigningKey(rsaKeyPair.private)
          .compact();
        return verifier.verifyAccessToken(token, expectedAud)
        .catch(err => expect(err.message).toBe('Error while resolving signing key for kid "undefined"'));
      });
    }, LONG_TIMEOUT);

    it('should fail if the kid cannot be found', () => {
      return getAccessToken(issuer1AccessTokenParams)
      .then(accessToken => verifier.verifyAccessToken(accessToken, expectedAud))
      .then(jwt => {
        // Create an access token with the same claims but a kid that will not resolve
        const token = new njwt.Jwt(jwt.claims)
          .setSigningAlgorithm('RS256')
          .setSigningKey(rsaKeyPair.private)
          .setHeader('kid', 'foo')
          .compact();
        return verifier.verifyAccessToken(token, expectedAud)
        .catch(err => expect(err.message).toBe('Error while resolving signing key for kid "foo"'));
      });
    }, LONG_TIMEOUT);

    it('should fail if the token is expired (exp)', () => {
      return getAccessToken(issuer1AccessTokenParams)
      .then(accessToken =>
        verifier.verifyAccessToken(accessToken, expectedAud)
        .then(jwt => {
          // Now advance time past the exp claim
          const now = new Date();
          const then = new Date((jwt.claims.exp * 1000) + 1000);
          tk.travel(then);
          return verifier.verifyAccessToken(accessToken, expectedAud)
          .then(() => {
            throw new Error('Should have errored');
          })
          .catch(err => {
            tk.travel(now);
            expect(err.message).toBe('Jwt is expired');
          });
        }));
    }, LONG_TIMEOUT);

    it('should allow me to assert custom claims', () => {
      const verifier = new OktaJwtVerifier({
        issuer: ISSUER,
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
        verifier.verifyAccessToken(accessToken, expectedAud)
        .catch(err => {
          // Extra debugging for an intermittent issue
          const result = typeof accessToken === 'string' ? 'accessToken is a string' : accessToken;
          expect(result).toBe('accessToken is a string');
          expect(err.message).toBe(
            `claim 'cid' value '${CLIENT_ID}' does not match expected value 'baz', claim 'foo' value 'undefined' does not match expected value 'bar'`
          );
        })
      );
    }, LONG_TIMEOUT);

    it('should cache the jwks for the configured amount of time', () => {
      const verifier = new OktaJwtVerifier({
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
        return verifier.verifyAccessToken(accessToken, expectedAud)
        .then(jwt => {
          expect(nockCallObjects.length).toBe(1);
          return verifier.verifyAccessToken(accessToken, expectedAud);
        })
        .then(jwt => {
          expect(nockCallObjects.length).toBe(1);
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              verifier.verifyAccessToken(accessToken, expectedAud)
              .then(jwt => {
                expect(nockCallObjects.length).toBe(2);
                resolve();
              })
              .catch(reject);
            }, 1000);
          });
        })
      });
    }, LONG_TIMEOUT);

    it('should rate limit jwks endpoint requests on cache misses', () => {
      const verifier = new OktaJwtVerifier({
        issuer: ISSUER,
        jwksRequestsPerMinute: 2,
        testing: {
          disableHttpsCheck: OKTA_TESTING_DISABLEHTTPSCHECK
        }
      });
      return getAccessToken(issuer1AccessTokenParams)
      .then((accessToken => {
        nock.recorder.clear();
        return verifier.verifyAccessToken(accessToken, expectedAud)
        .then(jwt => {
          // Create an access token with the same claims but a kid that will not resolve
          const token = new njwt.Jwt(jwt.claims)
            .setSigningAlgorithm('RS256')
            .setSigningKey(rsaKeyPair.private)
            .setHeader('kid', 'foo')
            .compact();
          return verifier.verifyAccessToken(token, expectedAud)
          .catch(err => verifier.verifyAccessToken(token, expectedAud))
          .catch(err => {
            const nockCallObjects = nock.recorder.play();
            // Expect 1 request for the valid kid, and 1 request for the 2 attempts with an invalid kid
            expect(nockCallObjects.length).toBe(2);
          });
        })
      }));
    });
  }, LONG_TIMEOUT);

  describe('Access Token basic validation', () => {
    const mockKidAsKeyFetch = (verifier) => {
      verifier.jwksClient.getSigningKey = jest.fn( ( kid, onKeyResolve ) => {
        onKeyResolve(null, { publicKey: kid } );
      });
    };

    it('fails if the signature is invalid', () => {
      const claims = {
        aud: 'http://myapp.com/',
      };
      const token = new njwt.Jwt(claims)
        .setIssuer(ISSUER)
        .setSigningAlgorithm('RS256')
        .setSigningKey(rsaKeyPair.private)
        .setHeader('kid', rsaKeyPair.wrongPublic)
        .compact();

      const verifier = new OktaJwtVerifier({
        issuer: ISSUER,
        testing: {
          disableHttpsCheck: OKTA_TESTING_DISABLEHTTPSCHECK
        }
      });
      mockKidAsKeyFetch(verifier);

      return verifier.verifyAccessToken(token, 'http://myapp.com/')
        .then( () => { throw new Error('Invalid Signature was accepted'); } )
        .catch( err => {
          expect(err.message).toBe('Signature verification failed');
        });
    });

    it('passes if the signature is valid', () => {
      const claims = {
        aud: 'http://myapp.com/',
        iss: ISSUER,
      };
      const token = new njwt.Jwt(claims)
        .setSigningAlgorithm('RS256')
        .setSigningKey(rsaKeyPair.private)
        .setHeader('kid', rsaKeyPair.public)
        .compact();

      const verifier = new OktaJwtVerifier({
        issuer: ISSUER,
        testing: {
          disableHttpsCheck: OKTA_TESTING_DISABLEHTTPSCHECK
        }
      });
      mockKidAsKeyFetch(verifier);

      return verifier.verifyAccessToken(token, 'http://myapp.com/');
    });

    it('fails if iss claim does not match verifier issuer', () => {
      const claims = {
        aud: 'http://myapp.com/',
        iss: 'not-the-issuer',
      };

      const token = new njwt.Jwt(claims)
        .setSigningAlgorithm('RS256')
        .setSigningKey(rsaKeyPair.private)
        .setHeader('kid', rsaKeyPair.public) // For override of key retrieval below
        .compact();

      const verifier = new OktaJwtVerifier({
        issuer: ISSUER,
        testing: {
          disableHttpsCheck: OKTA_TESTING_DISABLEHTTPSCHECK
        }
      });
      mockKidAsKeyFetch(verifier);

      return verifier.verifyAccessToken(token, claims.aud)
        .then( () => { throw new Error('invalid issuer did not throw an error'); } )
        .catch( err => {
          expect(err.message).toBe(`issuer not-the-issuer does not match expected issuer: ${ISSUER}`);
        });
    });

    it('fails when no audience expectation is passed', () => {
      const claims = {
        aud: 'http://any-aud.com/',
        iss: ISSUER,
      };

      const token = new njwt.Jwt(claims)
        .setSigningAlgorithm('RS256')
        .setSigningKey(rsaKeyPair.private)
        .setHeader('kid', rsaKeyPair.public) // For override of key retrieval below
        .compact();

      const verifier = new OktaJwtVerifier({
        issuer: ISSUER,
        testing: {
          disableHttpsCheck: OKTA_TESTING_DISABLEHTTPSCHECK
        }
      });
      mockKidAsKeyFetch(verifier);

      return verifier.verifyAccessToken(token)
        .then( () => { throw new Error('expected audience should be required, but was not'); } )
        .catch( err => {
          expect(err.message).toBe(`expected audience is required`);
        });
    });

    it('passes when given an audience matching expectation string', () => {
      const claims = {
        aud: 'http://myapp.com/',
        iss: ISSUER,
      };

      const token = new njwt.Jwt(claims)
        .setSigningAlgorithm('RS256')
        .setSigningKey(rsaKeyPair.private)
        .setHeader('kid', rsaKeyPair.public) // For override of key retrieval below
        .compact();

      const verifier = new OktaJwtVerifier({
        issuer: ISSUER,
        testing: {
          disableHttpsCheck: OKTA_TESTING_DISABLEHTTPSCHECK
        }
      });
      mockKidAsKeyFetch(verifier);

      return verifier.verifyAccessToken(token, 'http://myapp.com/');
    });

    it('passes when given an audience matching expectation array', () => {
      const claims = {
        aud: 'http://myapp.com/',
        iss: ISSUER,
      };

      const token = new njwt.Jwt(claims)
        .setSigningAlgorithm('RS256')
        .setSigningKey(rsaKeyPair.private)
        .setHeader('kid', rsaKeyPair.public) // For override of key retrieval below
        .compact();

      const verifier = new OktaJwtVerifier({
        issuer: ISSUER,
        testing: {
          disableHttpsCheck: OKTA_TESTING_DISABLEHTTPSCHECK
        }
      });
      mockKidAsKeyFetch(verifier);

      return verifier.verifyAccessToken(token, [ 'one', 'http://myapp.com/', 'three'] );
    });

    it('fails with a invalid audience when given a valid expectation', () => {
      const claims = {
        aud: 'http://wrong-aud.com/',
        iss: ISSUER,
      };

      const token = new njwt.Jwt(claims)
        .setSigningAlgorithm('RS256')
        .setSigningKey(rsaKeyPair.private)
        .setHeader('kid', rsaKeyPair.public) // For override of key retrieval below
        .compact();

      const verifier = new OktaJwtVerifier({
        issuer: ISSUER,
        testing: {
          disableHttpsCheck: OKTA_TESTING_DISABLEHTTPSCHECK
        }
      });
      mockKidAsKeyFetch(verifier);

      return verifier.verifyAccessToken(token, 'http://myapp.com/')
        .then( () => { throw new Error('Invalid audience claim was accepted') } )
        .catch(err => {
          expect(err.message).toBe(`audience claim http://wrong-aud.com/ does not match expected audience: http://myapp.com/`);
        });
    });

    it('fails with a invalid audience when given an array of expectations', () => {
      const claims = {
        aud: 'http://wrong-aud.com/',
        iss: ISSUER,
      };

      const token = new njwt.Jwt(claims)
        .setSigningAlgorithm('RS256')
        .setSigningKey(rsaKeyPair.private)
        .setHeader('kid', rsaKeyPair.public) // For override of key retrieval below
        .compact();

      const verifier = new OktaJwtVerifier({
        issuer: ISSUER,
        testing: {
          disableHttpsCheck: OKTA_TESTING_DISABLEHTTPSCHECK
        }
      });
      mockKidAsKeyFetch(verifier);

      return verifier.verifyAccessToken(token, ['one', 'http://myapp.com/', 'three'])
        .then( () => { throw new Error('Invalid audience claim was accepted') } )
        .catch(err => {
          expect(err.message).toBe(`audience claim http://wrong-aud.com/ does not match one of the expected audiences: one, http://myapp.com/, three`);
        });
    });

    it('fails when given an empty array of audience expectations', () => {
      const claims = {
        aud: 'http://any-aud.com/',
        iss: ISSUER,
      };

      const token = new njwt.Jwt(claims)
        .setSigningAlgorithm('RS256')
        .setSigningKey(rsaKeyPair.private)
        .setHeader('kid', rsaKeyPair.public) // For override of key retrieval below
        .compact();

      const verifier = new OktaJwtVerifier({
        issuer: ISSUER,
        testing: {
          disableHttpsCheck: OKTA_TESTING_DISABLEHTTPSCHECK
        }
      });
      mockKidAsKeyFetch(verifier);

      return verifier.verifyAccessToken(token, [])
        .then( () => { throw new Error('Invalid audience claim was accepted') } )
        .catch(err => {
          expect(err.message).toBe(`audience claim http://any-aud.com/ does not match one of the expected audiences: `);
        });
    });
  });


  describe('Access Token custom claim tests with stubs', () => {

    const otherClaims = { 
      iss: ISSUER,
      aud: 'http://myapp.com/',
    };

    const verifier = new OktaJwtVerifier({
      issuer: ISSUER,
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
              ...otherClaims,
              groups: ['Everyone', 'Another']
            }
          })
        }
      };

      return verifier.verifyAccessToken('anything', otherClaims.aud)
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
              ...otherClaims,
              groups: ['Everyone', 'Another']
            }
          })
        }
      };

      return verifier.verifyAccessToken('anything', otherClaims.aud)
      .then(jwt => expect(jwt.claims.groups).toEqual(['Everyone', 'Another']));
    });

    it('should succeed in asserting claims where includes is flat, claim is flat', () => {
      verifier.claimsToAssert = {'scp.includes': 'promos:read'};
      verifier.verifier = {
        verify: function(jwt, cb) {
          cb(null, {
            body: {
              ...otherClaims,
              scp: 'promos:read promos:write'
            }
          })
        }
      };

      return verifier.verifyAccessToken('anything', otherClaims.aud)
      .then(jwt => expect(jwt.claims.scp).toBe('promos:read promos:write'));
    });

    it('should fail in asserting claims where includes is flat, claim is array', () => {
      verifier.claimsToAssert = {'groups.includes': 'Yet Another'};
      verifier.verifier = {
        verify: function(jwt, cb) {
          cb(null, {
            body: {
              ...otherClaims,
              groups: ['Everyone', 'Another']
            }
          })
        }
      };

      return verifier.verifyAccessToken('anything', otherClaims.aud)
      .catch(err => expect(err.message).toBe(
        `claim 'groups' value 'Everyone,Another' does not include expected value 'Yet Another'`
      ));
    });

    it('should fail in asserting claims where includes is flat, claim is flat', () => {
      const expectedAud = 'http://myapp.com/';
      verifier.claimsToAssert = {'scp.includes': 'promos:delete'};
      verifier.verifier = {
        verify: function(jwt, cb) {
          cb(null, {
            body: {
              ...otherClaims,
              scp: 'promos:read promos:write'
            }
          })
        }
      };

      return verifier.verifyAccessToken('anything', otherClaims.aud)
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
              ...otherClaims,
              groups: ['Everyone', 'Another', 'Yet Another']
            }
          })
        }
      };

      return verifier.verifyAccessToken('anything', otherClaims.aud)
      .then(jwt => expect(jwt.claims.groups).toEqual(['Everyone', 'Another', 'Yet Another']));
    });

    it('should succeed in asserting claims where includes is array, claim is flat', () => {
      verifier.claimsToAssert = {'scp.includes': ['promos:read', 'promos:delete']};
      verifier.verifier = {
        verify: function(jwt, cb) {
          cb(null, {
            body: {
              ...otherClaims,
              scp: 'promos:read promos:write promos:delete'
            }
          })
        }
      };

      return verifier.verifyAccessToken('anything', otherClaims.aud)
      .then(jwt => expect(jwt.claims.scp).toBe('promos:read promos:write promos:delete'));
    });

    it('should fail in asserting claims where includes is array, claim is array', () => {
      verifier.claimsToAssert = {'groups.includes': ['Yet Another']};
      verifier.verifier = {
        verify: function(jwt, cb) {
          cb(null, {
            body: {
              ...otherClaims,
              groups: ['Everyone', 'Another']
            }
          })
        }
      };

      return verifier.verifyAccessToken('anything', otherClaims.aud)
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
              ...otherClaims,
              scp: 'promos:read promos:write'
            }
          })
        }
      };

      return verifier.verifyAccessToken('anything', otherClaims.aud)
      .catch(err => expect(err.message).toBe(
        `claim 'scp' value 'promos:read promos:write' does not include expected value 'promos:delete'`
      ));
    });
  });
});
