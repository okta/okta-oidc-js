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

const nock = require('nock');
const tk = require('timekeeper');
const constants = require('../constants');

const { getAccessToken, createToken, createVerifier, createCustomClaimsVerifier, rsaKeyPair } = require('../util');

// These need to be exported in the environment, from a working Okta org
const ISSUER = constants.ISSUER;
const CLIENT_ID = constants.CLIENT_ID;
const USERNAME = constants.USERNAME;
const PASSWORD = constants.PASSWORD;
const REDIRECT_URI = constants.REDIRECT_URI;

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

describe('Jwt Verifier - Verify Access Token', () => {
  describe('Access token tests with api calls', () => {
    const expectedAud = 'api://default';
    const verifier = createVerifier();

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
        const token = createToken(jwt.claims, { kid: jwt.header.kid });
        return verifier.verifyAccessToken(token, expectedAud)
        .catch(err => expect(err.message).toBe('Signature verification failed'));
      });
    }, LONG_TIMEOUT);

    it('should fail if no kid is present in the JWT header', () => {
      return getAccessToken(issuer1AccessTokenParams)
      .then(accessToken => verifier.verifyAccessToken(accessToken, expectedAud))
      .then(jwt => {
        // Create an access token that does not have a kid
        const token = createToken(jwt.claims);
        return verifier.verifyAccessToken(token, expectedAud)
        .catch(err => expect(err.message).toBe('Error while resolving signing key for kid "undefined"'));
      });
    }, LONG_TIMEOUT);

    it('should fail if the kid cannot be found', () => {
      return getAccessToken(issuer1AccessTokenParams)
      .then(accessToken => verifier.verifyAccessToken(accessToken, expectedAud))
      .then(jwt => {
        // Create an access token with the same claims but a kid that will not resolve
        const token = createToken(jwt.claims, { kid: 'foo' });
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
      const verifier = createVerifier({
        assertClaims: {
          cid: 'baz',
          foo: 'bar'
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
      const verifier = createVerifier({
        cacheMaxAge: 500
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
      const verifier = createVerifier({
        jwksRequestsPerMinute: 2
      });
      return getAccessToken(issuer1AccessTokenParams)
      .then((accessToken => {
        nock.recorder.clear();
        return verifier.verifyAccessToken(accessToken, expectedAud)
        .then(jwt => {
          // Create an access token with the same claims but a kid that will not resolve
          const token = createToken(jwt.claims, { kid: 'foo' });
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
      const token = createToken({
        aud: 'http://myapp.com/',
        iss: ISSUER,
      }, {
        kid: rsaKeyPair.wrongPublic,
      });

      const verifier = createVerifier();
      mockKidAsKeyFetch(verifier);

      return verifier.verifyAccessToken(token, 'http://myapp.com/')
        .then( () => { throw new Error('Invalid Signature was accepted'); } )
        .catch( err => {
          expect(err.message).toBe('Signature verification failed');
        });
    });

    it('passes if the signature is valid', () => {
      const token = createToken({
        aud: 'http://myapp.com/',
        iss: ISSUER,
      }, {
        kid: rsaKeyPair.public
      });

      const verifier = createVerifier();
      mockKidAsKeyFetch(verifier);

      return verifier.verifyAccessToken(token, 'http://myapp.com/');
    });

    it('fails if iss claim does not match verifier issuer', () => {
      const token = createToken({
        aud: 'http://myapp.com/',
        iss: 'not-the-issuer',
      }, {
        kid: rsaKeyPair.public // For override of key retrieval below
      });

      const verifier = createVerifier();
      mockKidAsKeyFetch(verifier);

      return verifier.verifyAccessToken(token, 'http://myapp.com/')
        .then( () => { throw new Error('invalid issuer did not throw an error'); } )
        .catch( err => {
          expect(err.message).toBe(`issuer not-the-issuer does not match expected issuer: ${ISSUER}`);
        });
    });

    it('fails when no audience expectation is passed', () => {
      const token = createToken({
        aud: 'http://any-aud.com/',
        iss: ISSUER,
      }, {
        kid: rsaKeyPair.public // For override of key retrieval below
      });

      const verifier = createVerifier();
      mockKidAsKeyFetch(verifier);

      return verifier.verifyAccessToken(token)
        .then( () => { throw new Error('expected audience should be required, but was not'); } )
        .catch( err => {
          expect(err.message).toBe(`expected audience is required`);
        });
    });

    it('passes when given an audience matching expectation string', () => {
      const token = createToken({
        aud: 'http://myapp.com/',
        iss: ISSUER,
      }, {
        kid: rsaKeyPair.public // For override of key retrieval below
      });

      const verifier = createVerifier();
      mockKidAsKeyFetch(verifier);

      return verifier.verifyAccessToken(token, 'http://myapp.com/');
    });

    it('passes when given an audience matching expectation array', () => {
      const token = createToken({
        aud: 'http://myapp.com/',
        iss: ISSUER,
      }, {
        kid: rsaKeyPair.public // For override of key retrieval below
      });

      const verifier = createVerifier();
      mockKidAsKeyFetch(verifier);

      return verifier.verifyAccessToken(token, [ 'one', 'http://myapp.com/', 'three'] );
    });

    it('fails with a invalid audience when given a valid expectation', () => {
      const token = createToken({
        aud: 'http://wrong-aud.com/',
        iss: ISSUER,
      }, {
        kid: rsaKeyPair.public // For override of key retrieval below
      });

      const verifier = createVerifier();
      mockKidAsKeyFetch(verifier);

      return verifier.verifyAccessToken(token, 'http://myapp.com/')
        .then( () => { throw new Error('Invalid audience claim was accepted') } )
        .catch(err => {
          expect(err.message).toBe(`audience claim http://wrong-aud.com/ does not match expected audience: http://myapp.com/`);
        });
    });

    it('fails with a invalid audience when given an array of expectations', () => {
      const token = createToken({
        aud: 'http://wrong-aud.com/',
        iss: ISSUER,
      }, {
        kid: rsaKeyPair.public // For override of key retrieval below
      });

      const verifier = createVerifier();
      mockKidAsKeyFetch(verifier);

      return verifier.verifyAccessToken(token, ['one', 'http://myapp.com/', 'three'])
        .then( () => { throw new Error('Invalid audience claim was accepted') } )
        .catch(err => {
          expect(err.message).toBe(`audience claim http://wrong-aud.com/ does not match one of the expected audiences: one, http://myapp.com/, three`);
        });
    });

    it('fails when given an empty array of audience expectations', () => {
      const token = createToken({
        aud: 'http://any-aud.com/',
        iss: ISSUER,
      }, {
        kid: rsaKeyPair.public // For override of key retrieval below
      });

      const verifier = createVerifier();
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

    const verifier = createVerifier();

    it('should only allow includes operator for custom claims', () => {
      verifier.claimsToAssert = {'groups.blarg': 'Everyone'};
      verifier.verifier = createCustomClaimsVerifier({
        groups: ['Everyone', 'Another']
      }, otherClaims);

      return verifier.verifyAccessToken('anything', otherClaims.aud)
      .catch(err => expect(err.message).toBe(
        `operator: 'blarg' invalid. Supported operators: 'includes'.`
      ));
    });

    it('should succeed in asserting claims where includes is flat, claim is array', () => {
      verifier.claimsToAssert = {'groups.includes': 'Everyone'};
      verifier.verifier = createCustomClaimsVerifier({
        groups: ['Everyone', 'Another']
      }, otherClaims);

      return verifier.verifyAccessToken('anything', otherClaims.aud)
      .then(jwt => expect(jwt.claims.groups).toEqual(['Everyone', 'Another']));
    });

    it('should succeed in asserting claims where includes is flat, claim is flat', () => {
      verifier.claimsToAssert = {'scp.includes': 'promos:read'};
      verifier.verifier = createCustomClaimsVerifier({
        scp: 'promos:read promos:write'
      }, otherClaims);

      return verifier.verifyAccessToken('anything', otherClaims.aud)
      .then(jwt => expect(jwt.claims.scp).toBe('promos:read promos:write'));
    });

    it('should fail in asserting claims where includes is flat, claim is array', () => {
      verifier.claimsToAssert = {'groups.includes': 'Yet Another'};
      verifier.verifier = createCustomClaimsVerifier({
        groups: ['Everyone', 'Another']
      }, otherClaims);

      return verifier.verifyAccessToken('anything', otherClaims.aud)
      .then( () => { throw new Error(`Invalid 'groups' claim was accepted`) } )
      .catch(err => expect(err.message).toBe(
        `claim 'groups' value 'Everyone,Another' does not include expected value 'Yet Another'`
      ));
    });

    it('should fail in asserting claims where includes is flat, claim is flat', () => {
      const expectedAud = 'http://myapp.com/';
      verifier.claimsToAssert = {'scp.includes': 'promos:delete'};
      verifier.verifier = createCustomClaimsVerifier({
        scp: 'promos:read promos:write'
      }, otherClaims);

      return verifier.verifyAccessToken('anything', otherClaims.aud)
      .then( () => { throw new Error(`Invalid 'scp' claim was accepted`) } )
      .catch(err => expect(err.message).toBe(
        `claim 'scp' value 'promos:read promos:write' does not include expected value 'promos:delete'`
      ));
    });

    it('should succeed in asserting claims where includes is array, claim is array', () => {
      verifier.claimsToAssert = {'groups.includes': ['Everyone', 'Yet Another']};
      verifier.verifier = createCustomClaimsVerifier({
        groups: ['Everyone', 'Another', 'Yet Another']
      }, otherClaims);

      return verifier.verifyAccessToken('anything', otherClaims.aud)
      .then(jwt => expect(jwt.claims.groups).toEqual(['Everyone', 'Another', 'Yet Another']));
    });

    it('should succeed in asserting claims where includes is array, claim is flat', () => {
      verifier.claimsToAssert = {'scp.includes': ['promos:read', 'promos:delete']};
      verifier.verifier = createCustomClaimsVerifier({
        scp: 'promos:read promos:write promos:delete'
      }, otherClaims);

      return verifier.verifyAccessToken('anything', otherClaims.aud)
      .then(jwt => expect(jwt.claims.scp).toBe('promos:read promos:write promos:delete'));
    });

    it('should fail in asserting claims where includes is array, claim is array', () => {
      verifier.claimsToAssert = {'groups.includes': ['Yet Another']};
      verifier.verifier = createCustomClaimsVerifier({
        groups: ['Everyone', 'Another']
      }, otherClaims);

      return verifier.verifyAccessToken('anything', otherClaims.aud)
      .then( () => { throw new Error(`Invalid 'groups' claim was accepted`) } )
      .catch(err => expect(err.message).toBe(
        `claim 'groups' value 'Everyone,Another' does not include expected value 'Yet Another'`
      ));
    });

    it('should fail in asserting claims where includes is array, claim is flat', () => {
      verifier.claimsToAssert = {'scp.includes': ['promos:delete']};
      verifier.verifier = createCustomClaimsVerifier({
        scp: 'promos:read promos:write'
      }, otherClaims);

      return verifier.verifyAccessToken('anything', otherClaims.aud)
      .then( () => { throw new Error(`Invalid 'scp' claim was accepted`) } )
      .catch(err => expect(err.message).toBe(
        `claim 'scp' value 'promos:read promos:write' does not include expected value 'promos:delete'`
      ));
    });
  });
});
