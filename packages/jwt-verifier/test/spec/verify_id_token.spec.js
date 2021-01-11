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
const constants = require('../constants')

const { getIdToken, createToken, createVerifier, createCustomClaimsVerifier, rsaKeyPair } = require('../util');

// These need to be exported in the environment, from a working Okta org
const ISSUER = constants.ISSUER;
const CLIENT_ID = constants.CLIENT_ID;
const USERNAME = constants.USERNAME;
const PASSWORD = constants.PASSWORD;
const REDIRECT_URI = constants.REDIRECT_URI;
const NONCE = 'foo';

// Some tests makes LIVE requests using getIdToken(). These may take much longer than normal tests
const LONG_TIMEOUT = 60000;

// Used to get an ID token and id token from the AS
const issuer1IdTokenParams = {
  ISSUER,
  CLIENT_ID,
  USERNAME,
  PASSWORD,
  REDIRECT_URI,
  NONCE
};


describe('Jwt Verifier - Verify ID Token', () => {

  describe('ID token tests with api calls', () => {
    const expectedClientId = CLIENT_ID;
    const verifier = createVerifier();

    it('should allow me to verify Okta ID tokens', () => {
      return getIdToken(issuer1IdTokenParams)
      .then(idToken => {
        return verifier.verifyIdToken(idToken, expectedClientId, NONCE);
      })
      .then(jwt => {
        expect(jwt.claims.iss).toBe(ISSUER);
      });
    }, LONG_TIMEOUT);

    it('should fail if the signature is invalid', () => {
      return getIdToken(issuer1IdTokenParams)
      .then(idToken => verifier.verifyIdToken(idToken, expectedClientId, NONCE))
      .then(jwt => {
        // Create an ID token with the same claims and kid, then re-sign it with another RSA private key - this should fail
        const token = createToken(jwt.claims, { kid: jwt.header.kid });
        
        return verifier.verifyIdToken(token, expectedClientId, NONCE)
        .catch(err => expect(err.message).toBe('Signature verification failed'));
      });
    }, LONG_TIMEOUT);

    it('should fail if no kid is present in the JWT header', () => {
      return getIdToken(issuer1IdTokenParams)
      .then(idToken => verifier.verifyIdToken(idToken, expectedClientId, NONCE))
      .then(jwt => {
        // Create an ID token that does not have a kid
        const token = createToken(jwt.claims);
        return verifier.verifyIdToken(token, expectedClientId, NONCE)
        .catch(err => expect(err.message).toBe('Error while resolving signing key for kid "undefined"'));
      });
    }, LONG_TIMEOUT);

    it('should fail if the kid cannot be found', () => {
      return getIdToken(issuer1IdTokenParams)
      .then(idToken => verifier.verifyIdToken(idToken, expectedClientId, NONCE))
      .then(jwt => {
        // Create an ID token with the same claims but a kid that will not resolve
        const token = createToken(jwt.claims, { kid: 'foo' });
        return verifier.verifyIdToken(token, expectedClientId, NONCE)
        .catch(err => expect(err.message).toBe('Error while resolving signing key for kid "foo"'));
      });
    }, LONG_TIMEOUT);

    it('should fail if the token is expired (exp)', () => {
      return getIdToken(issuer1IdTokenParams)
      .then(idToken =>
        verifier.verifyIdToken(idToken, expectedClientId, NONCE)
        .then(jwt => {
          // Now advance time past the exp claim
          const now = new Date();
          const then = new Date((jwt.claims.exp * 1000) + 1000);
          tk.travel(then);
          return verifier.verifyIdToken(idToken, expectedClientId, NONCE)
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
          aud: 'baz',
          foo: 'bar'
        }
      });
      return getIdToken(issuer1IdTokenParams)
      .then(idToken =>
        verifier.verifyIdToken(idToken, expectedClientId, NONCE)
        .catch(err => {
          // Extra debugging for an intermittent issue
          const result = typeof idToken === 'string' ? 'idToken is a string' : idToken;
          expect(result).toBe('idToken is a string');
          expect(err.message).toBe(
            `claim 'aud' value '${CLIENT_ID}' does not match expected value 'baz', claim 'foo' value 'undefined' does not match expected value 'bar'`
          );
        })
      );
    }, LONG_TIMEOUT);

    it('should cache the jwks for the configured amount of time', () => {
      const verifier = createVerifier({
        cacheMaxAge: 500
      });
      return getIdToken(issuer1IdTokenParams)
      .then(idToken => {
        nock.recorder.rec({
          output_objects: true,
          dont_print: true
        });
        const nockCallObjects = nock.recorder.play();
        return verifier.verifyIdToken(idToken, expectedClientId, NONCE)
        .then(jwt => {
          expect(nockCallObjects.length).toBe(1);
          return verifier.verifyIdToken(idToken, expectedClientId, NONCE);
        })
        .then(jwt => {
          expect(nockCallObjects.length).toBe(1);
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              verifier.verifyIdToken(idToken, expectedClientId, NONCE)
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
      return getIdToken(issuer1IdTokenParams)
      .then((idToken => {
        nock.recorder.clear();
        return verifier.verifyIdToken(idToken, expectedClientId, NONCE)
        .then(jwt => {
          // Create an ID token with the same claims but a kid that will not resolve
          const token = createToken(jwt.claims, { kid: 'foo' });
          return verifier.verifyIdToken(token, expectedClientId, NONCE)
          .catch(err => verifier.verifyIdToken(token, expectedClientId, NONCE))
          .catch(err => {
            const nockCallObjects = nock.recorder.play();
            // Expect 1 request for the valid kid, and 1 request for the 2 attempts with an invalid kid
            expect(nockCallObjects.length).toBe(2);
          });
        })
      }));
    });

  }, LONG_TIMEOUT);

  describe('ID Token basic validation', () => {
    const mockKidAsKeyFetch = (verifier) => {
      verifier.jwksClient.getSigningKey = jest.fn( ( kid, onKeyResolve ) => {
        onKeyResolve(null, { publicKey: kid } );
      });
    };

    it('fails if the signature is invalid', () => {
      const token = createToken({
        aud: '0oaoesxtxmPf08QHk0h7',
        iss: ISSUER,
      }, {
        kid: rsaKeyPair.wrongPublic,
      });

      const verifier = createVerifier();
      mockKidAsKeyFetch(verifier);

      return verifier.verifyIdToken(token, '0oaoesxtxmPf08QHk0h7')
        .then( () => { throw new Error('Invalid Signature was accepted'); } )
        .catch( err => {
          expect(err.message).toBe('Signature verification failed');
        });
    });

    it('passes if the signature is valid', () => {
      const token = createToken({
        aud: '0oaoesxtxmPf08QHk0h7',
        iss: ISSUER,
      }, {
        kid: rsaKeyPair.public
      });

      const verifier = createVerifier();
      mockKidAsKeyFetch(verifier);

      return verifier.verifyIdToken(token, '0oaoesxtxmPf08QHk0h7');
    });

    it('fails if iss claim does not match verifier issuer', () => {
      const token = createToken({
        aud: '0oaoesxtxmPf08QHk0h7',
        iss: 'not-the-issuer',
      }, {
        kid: rsaKeyPair.public // For override of key retrieval below
      });

      const verifier = createVerifier();
      mockKidAsKeyFetch(verifier);

      return verifier.verifyIdToken(token, '0oaoesxtxmPf08QHk0h7')
        .then( () => { throw new Error('invalid issuer did not throw an error'); } )
        .catch( err => {
          expect(err.message).toBe(`issuer not-the-issuer does not match expected issuer: ${ISSUER}`);
        });
    });

    it('fails when no audience expectation is passed', () => {
      const token = createToken({
        aud: 'any_client_id',
        iss: ISSUER,
      }, {
        kid: rsaKeyPair.public // For override of key retrieval below
      });

      const verifier = createVerifier();
      mockKidAsKeyFetch(verifier);

      return verifier.verifyIdToken(token)
        .then( () => { throw new Error('expected client id should be required, but was not'); } )
        .catch( err => {
          expect(err.message).toBe(`expected client id is required`);
        });
    });

    it('passes when given an audience matching expectation string', () => {
      const token = createToken({
        aud: '0oaoesxtxmPf08QHk0h7',
        iss: ISSUER,
      }, {
        kid: rsaKeyPair.public // For override of key retrieval below
      });

      const verifier = createVerifier();
      mockKidAsKeyFetch(verifier);

      return verifier.verifyIdToken(token, '0oaoesxtxmPf08QHk0h7');
    });

    it('fails with a invalid audience when given a valid expectation', () => {
      const token = createToken({
        aud: 'wrong_client_id',
        iss: ISSUER,
      }, {
        kid: rsaKeyPair.public // For override of key retrieval below
      });

      const verifier = createVerifier();
      mockKidAsKeyFetch(verifier);

      return verifier.verifyIdToken(token, '0oaoesxtxmPf08QHk0h7')
        .then( () => { throw new Error('Invalid audience claim was accepted') } )
        .catch(err => {
          expect(err.message).toBe(`audience claim wrong_client_id does not match expected client id: 0oaoesxtxmPf08QHk0h7`);
        });
    });

    it('fails with a invalid client id', () => {
      const token = createToken({
        aud: '{clientId}',
        iss: ISSUER,
      }, {
        kid: rsaKeyPair.public // For override of key retrieval below
      });

      const verifier = createVerifier();
      mockKidAsKeyFetch(verifier);

      return verifier.verifyIdToken(token, '{clientId}')
        .then( () => { throw new Error('Invalid client id was accepted') } )
        .catch(err => {
          expect(err.message).toBe("Replace {clientId} with the client ID of your Application. You can copy it from the Okta Developer Console in the details for the Application you created. Follow these instructions to find it: https://bit.ly/finding-okta-app-credentials");
        });
    });

    it('fails when no nonce expectation is passed', () => {
      const token = createToken({
        aud: '0oaoesxtxmPf08QHk0h7',
        iss: ISSUER,
        nonce: 'foo'
      }, {
        kid: rsaKeyPair.public // For override of key retrieval below
      });

      const verifier = createVerifier();
      mockKidAsKeyFetch(verifier);

      return verifier.verifyIdToken(token, '0oaoesxtxmPf08QHk0h7')
        .then( () => { throw new Error('expected nonce should be required, but was not'); } )
        .catch( err => {
          expect(err.message).toBe(`expected nonce is required`);
        });
    });

    it('fails when an nonce expectation is passed but claim is missing', () => {
      const token = createToken({
        aud: '0oaoesxtxmPf08QHk0h7',
        iss: ISSUER
      }, {
        kid: rsaKeyPair.public // For override of key retrieval below
      });

      const verifier = createVerifier();
      mockKidAsKeyFetch(verifier);

      return verifier.verifyIdToken(token, '0oaoesxtxmPf08QHk0h7', 'some')
        .then( () => { throw new Error('should not pass verification'); } )
        .catch( err => {
          expect(err.message).toBe(`nonce claim is missing but expected: some`);
        });
    });

    it('passes when given an nonce matching expectation string', () => {
      const token = createToken({
        aud: '0oaoesxtxmPf08QHk0h7',
        iss: ISSUER,
        nonce: 'foo'
      }, {
        kid: rsaKeyPair.public // For override of key retrieval below
      });
  
      const verifier = createVerifier();
      mockKidAsKeyFetch(verifier);
  
      return verifier.verifyIdToken(token, '0oaoesxtxmPf08QHk0h7', 'foo');
    });
  
    it('fails with an invalid nonce when given a valid expectation', () => {
      const token = createToken({
        aud: '0oaoesxtxmPf08QHk0h7',
        iss: ISSUER,
        nonce: 'foo'
      }, {
        kid: rsaKeyPair.public // For override of key retrieval below
      });
  
      const verifier = createVerifier();
      mockKidAsKeyFetch(verifier);
  
      // Not valid expectation
      return verifier.verifyIdToken(token, '0oaoesxtxmPf08QHk0h7', 'bar')
        .then( () => { throw new Error('Invalid nonce claim was accepted') } )
        .catch(err => {
          expect(err.message).toBe(`nonce claim foo does not match expected nonce: bar`);
        })
      // Expectation matches claim but in different case
      .then( () => verifier.verifyIdToken(token, '0oaoesxtxmPf08QHk0h7', 'FOO') )
        .then( () => { throw new Error('Invalid nonce claim was accepted') } )
        .catch(err => {
          expect(err.message).toBe(`nonce claim foo does not match expected nonce: FOO`);
        })
      // Value is not a string
      .then( () => verifier.verifyIdToken(token, '0oaoesxtxmPf08QHk0h7', {}) )
        .then( () => { throw new Error('Invalid nonce claim was accepted') } )
        .catch(err => {
          expect(err.message).toBe(`nonce claim foo does not match expected nonce: [object Object]`);
        })
    });
  
  });


  describe('ID Token custom claim tests with stubs', () => {
    const otherClaims = { 
      iss: ISSUER,
      aud: '0oaoesxtxmPf08QHk0h7',
    };

    const verifier = createVerifier();

    it('should only allow includes operator for custom claims', () => {
      verifier.claimsToAssert = {'groups.blarg': 'Everyone'};
      verifier.verifier = createCustomClaimsVerifier({
        groups: ['Everyone', 'Another']
      }, otherClaims);

      return verifier.verifyIdToken('anything', otherClaims.aud)
      .catch(err => expect(err.message).toBe(
        `operator: 'blarg' invalid. Supported operators: 'includes'.`
      ));
    });

    it('should succeed in asserting claims where includes is flat, claim is array', () => {
      verifier.claimsToAssert = {'groups.includes': 'Everyone'};
      verifier.verifier = createCustomClaimsVerifier({
        groups: ['Everyone', 'Another']
      }, otherClaims);

      return verifier.verifyIdToken('anything', otherClaims.aud)
      .then(jwt => expect(jwt.claims.groups).toEqual(['Everyone', 'Another']));
    });

    it('should succeed in asserting claims where includes is flat, claim is flat', () => {
      verifier.claimsToAssert = {'scp.includes': 'promos:read'};
      verifier.verifier = createCustomClaimsVerifier({
        scp: 'promos:read promos:write'
      }, otherClaims);

      return verifier.verifyIdToken('anything', otherClaims.aud)
      .then(jwt => expect(jwt.claims.scp).toBe('promos:read promos:write'));
    });

    it('should fail in asserting claims where includes is flat, claim is array', () => {
      verifier.claimsToAssert = {'groups.includes': 'Yet Another'};
      verifier.verifier = createCustomClaimsVerifier({
        groups: ['Everyone', 'Another']
      }, otherClaims);

      return verifier.verifyIdToken('anything', otherClaims.aud)
      .then( () => { throw new Error(`Invalid 'groups' claim was accepted`) } )
      .catch(err => expect(err.message).toBe(
        `claim 'groups' value 'Everyone,Another' does not include expected value 'Yet Another'`
      ));
    });

    it('should fail in asserting claims where includes is flat, claim is flat', () => {
      const expectedAud = '0oaoesxtxmPf08QHk0h7';
      verifier.claimsToAssert = {'scp.includes': 'promos:delete'};
      verifier.verifier = createCustomClaimsVerifier({
        scp: 'promos:read promos:write'
      }, otherClaims);

      return verifier.verifyIdToken('anything', otherClaims.aud)
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

      return verifier.verifyIdToken('anything', otherClaims.aud)
      .then(jwt => expect(jwt.claims.groups).toEqual(['Everyone', 'Another', 'Yet Another']));
    });

    it('should succeed in asserting claims where includes is array, claim is flat', () => {
      verifier.claimsToAssert = {'scp.includes': ['promos:read', 'promos:delete']};
      verifier.verifier = createCustomClaimsVerifier({
        scp: 'promos:read promos:write promos:delete'
      }, otherClaims);

      return verifier.verifyIdToken('anything', otherClaims.aud)
      .then(jwt => expect(jwt.claims.scp).toBe('promos:read promos:write promos:delete'));
    });

    it('should fail in asserting claims where includes is array, claim is array', () => {
      verifier.claimsToAssert = {'groups.includes': ['Yet Another']};
      verifier.verifier = createCustomClaimsVerifier({
        groups: ['Everyone', 'Another']
      }, otherClaims);

      return verifier.verifyIdToken('anything', otherClaims.aud)
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

      return verifier.verifyIdToken('anything', otherClaims.aud)
      .then( () => { throw new Error(`Invalid 'scp' claim was accepted`) } )
      .catch(err => expect(err.message).toBe(
        `claim 'scp' value 'promos:read promos:write' does not include expected value 'promos:delete'`
      ));
    });
  });
  
});
