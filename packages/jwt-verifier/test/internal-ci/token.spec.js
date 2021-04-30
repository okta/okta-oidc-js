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
const constants = require('../constants')

// These tests involve LIVE network requests and run in a resource-constrained CI environment
const LONG_TIMEOUT = 15000;

const OktaJwtVerifier = require('../../lib');
const { getAccessToken, getIdToken } = require('../util');

// These need to be exported in the environment, from a working Okta org
const ISSUER = constants.ISSUER;
const CLIENT_ID = constants.CLIENT_ID;
const USERNAME = constants.USERNAME;
const PASSWORD = constants.PASSWORD;
const REDIRECT_URI = constants.REDIRECT_URI;
const OKTA_TESTING_DISABLEHTTPSCHECK = constants.OKTA_TESTING_DISABLEHTTPSCHECK;
const NONCE = 'foo';

// Used to get an access token and id token from the AS
const issuer1TokenParams = {
  ISSUER,
  CLIENT_ID,
  USERNAME,
  PASSWORD,
  REDIRECT_URI,
  NONCE
};

describe('Access token test with api call', () => {
  const expectedAud = 'api://default';
  const verifier = new OktaJwtVerifier({
    issuer: ISSUER,
    testing: {
      disableHttpsCheck: OKTA_TESTING_DISABLEHTTPSCHECK
    }
  });

  it('should allow me to verify Okta access tokens', () => {
    return getAccessToken(issuer1TokenParams)
    .then(accessToken => verifier.verifyAccessToken(accessToken, expectedAud))
    .then(jwt => {
      expect(jwt.claims.iss).toBe(ISSUER);
    });
  }, LONG_TIMEOUT);
});

describe('ID token test with api call', () => {
  const expectedClientId = CLIENT_ID;
  const verifier = new OktaJwtVerifier({
    issuer: ISSUER,
    testing: {
      disableHttpsCheck: OKTA_TESTING_DISABLEHTTPSCHECK
    }
  });

  it('should allow me to verify Okta ID tokens', () => {
    return getIdToken(issuer1TokenParams)
    .then(idToken => verifier.verifyIdToken(idToken, expectedClientId, NONCE))
    .then(jwt => {
      expect(jwt.claims.iss).toBe(ISSUER);
    });
  }, LONG_TIMEOUT);
});

