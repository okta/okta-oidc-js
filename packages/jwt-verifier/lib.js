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

const jwksClient = require('jwks-rsa');
const nJwt = require('njwt');

class ConfigurationValidationError extends Error {}

const findDomainURL = 'https://bit.ly/finding-okta-domain';
const findAppCredentialsURL = 'https://bit.ly/finding-okta-app-credentials';

const assertIssuer = (issuer, testing = {}) => {
  const isHttps = new RegExp('^https://');
  const hasDomainAdmin = /-admin.(okta|oktapreview|okta-emea).com/;
  const copyMessage = 'You can copy your domain from the Okta Developer ' +
    'Console. Follow these instructions to find it: ' + findDomainURL;

  if (testing.disableHttpsCheck) {
    const httpsWarning = 'Warning: HTTPS check is disabled. ' +
      'This allows for insecure configurations and is NOT recommended for production use.';
    /* eslint-disable-next-line no-console */
    console.warn(httpsWarning);
  }

  if (!issuer) {
    throw new ConfigurationValidationError('Your Okta URL is missing. ' + copyMessage);
  } else if (!testing.disableHttpsCheck && !issuer.match(isHttps)) {
    throw new ConfigurationValidationError(
      'Your Okta URL must start with https. ' +
      `Current value: ${issuer}. ${copyMessage}`
    );
  } else if (issuer.match(/{yourOktaDomain}/)) {
    throw new ConfigurationValidationError('Replace {yourOktaDomain} with your Okta domain. ' + copyMessage);
  } else if (issuer.match(hasDomainAdmin)) {
    throw new ConfigurationValidationError(
      'Your Okta domain should not contain -admin. ' +
      `Current value: ${issuer}. ${copyMessage}`
    );
  }
};

const assertClientId = (clientId) => {
  const copyCredentialsMessage = 'You can copy it from the Okta Developer Console ' +
    'in the details for the Application you created. ' +
    `Follow these instructions to find it: ${findAppCredentialsURL}`;

  if (!clientId) {
    throw new ConfigurationValidationError('Your client ID is missing. ' + copyCredentialsMessage);
  } else if (clientId.match(/{clientId}/)) {
    throw new ConfigurationValidationError('Replace {clientId} with the client ID of your Application. ' + copyCredentialsMessage);
  }
};

class AssertedClaimsVerifier {
  constructor() {
    this.errors = [];
  }

  extractOperator(claim) {
    const idx = claim.indexOf('.');
    if (idx >= 0) {
      return claim.substring(idx + 1);
    }
    return undefined;
  }

  extractClaim(claim) {
    const idx = claim.indexOf('.');
    if (idx >= 0) {
      return claim.substring(0, idx);
    }
    return claim;
  }

  isValidOperator(operator) {
    // may support more operators in the future
    return !operator || operator === 'includes';
  }

  checkAssertions(op, claim, expectedValue, actualValue) {
    if (!op && actualValue !== expectedValue) {
      this.errors.push(`claim '${claim}' value '${actualValue}' does not match expected value '${expectedValue}'`);
    } else if (op === 'includes' && Array.isArray(expectedValue)) {
      expectedValue.forEach((value) => {
        if (!actualValue || !actualValue.includes(value)) {
          this.errors.push(`claim '${claim}' value '${actualValue}' does not include expected value '${value}'`);
        }
      });
    } else if (op === 'includes' && (!actualValue || !actualValue.includes(expectedValue))) {
      this.errors.push(`claim '${claim}' value '${actualValue}' does not include expected value '${expectedValue}'`);
    }
  }
}

function verifyAssertedClaims(verifier, claims) {
  const assertedClaimsVerifier = new AssertedClaimsVerifier();
  for (const [claimName, expectedValue] of Object.entries(verifier.claimsToAssert)) {
    const operator = assertedClaimsVerifier.extractOperator(claimName);
    if (!assertedClaimsVerifier.isValidOperator(operator)) {
      throw new Error(`operator: '${operator}' invalid. Supported operators: 'includes'.`);
    }
    const claim = assertedClaimsVerifier.extractClaim(claimName);
    const actualValue = claims[claim];
    assertedClaimsVerifier.checkAssertions(operator, claim, expectedValue, actualValue);
  }
  if (assertedClaimsVerifier.errors.length) {
    throw new Error(assertedClaimsVerifier.errors.join(', '));
  }
}

function verifyAudience(expected, aud) {
  if (!expected) {
    throw new Error('expected audience is required');
  }

  if (Array.isArray(expected) && !expected.includes(aud)) {
    throw new Error(`audience claim ${aud} does not match one of the expected audiences: ${expected.join(', ')}`);
  }

  if (!Array.isArray(expected) && aud !== expected) {
    throw new Error(`audience claim ${aud} does not match expected audience: ${expected}`);
  }
}

function verifyClientId(expected, aud) {
  if (!expected) {
    throw new Error('expected client id is required');
  }

  assertClientId(expected);

  if (aud !== expected) {
    throw new Error(`audience claim ${aud} does not match expected client id: ${expected}`);
  }
}

function verifyIssuer(expected, issuer) {
  if (issuer !== expected) {
    throw new Error(`issuer ${issuer} does not match expected issuer: ${expected}`);
  }
}

function verifyNonce(expected, nonce) {
  if (nonce && !expected) {
    throw new Error('expected nonce is required');
  }
  if (!nonce && expected) {
    throw new Error(`nonce claim is missing but expected: ${expected}`);
  }
  if (nonce && expected && nonce !== expected) {
    throw new Error(`nonce claim ${nonce} does not match expected nonce: ${expected}`);
  }
}

function getJwksUri(options) {
  return options.jwksUri ? options.jwksUri : options.issuer + '/v1/keys';
}

class OktaJwtVerifier {
  constructor(options = {}) {
    // Assert configuration options exist and are well-formed (not necessarily correct!)
    assertIssuer(options.issuer, options.testing);
    if (options.clientId) {
      assertClientId(options.clientId);
    }

    this.claimsToAssert = options.assertClaims || {};
    this.issuer = options.issuer;
    this.jwksUri = getJwksUri(options);
    this.jwksClient = jwksClient({
      jwksUri: this.jwksUri,
      cache: true,
      cacheMaxAge: options.cacheMaxAge || (60 * 60 * 1000),
      cacheMaxEntries: 3,
      jwksRequestsPerMinute: options.jwksRequestsPerMinute || 10,
      rateLimit: true,
    });
    this.verifier = nJwt.createVerifier().setSigningAlgorithm('RS256').withKeyResolver((kid, cb) => {
      if (kid) {
        this.jwksClient.getSigningKey(kid, (err, key) => {
          cb(err, key && (key.publicKey || key.rsaPublicKey));
        });
      } else {
        cb('No KID specified', null);
      }
    });
  }

  async verifyAsPromise(tokenString) {
    return new Promise((resolve, reject) => {
      // Convert to a promise
      this.verifier.verify(tokenString, (err, jwt) => {
        if (err) {
          return reject(err);
        }

        jwt.claims = jwt.body;
        delete jwt.body;

        resolve(jwt);
      });
    });
  }

  async verifyAccessToken(accessTokenString, expectedAudience) {
    // njwt verifies expiration and signature.
    // We require RS256 in the base verifier.
    // Remaining to verify:
    // - audience claim
    // - issuer claim
    // - any custom claims passed in

    const jwt = await this.verifyAsPromise(accessTokenString);
    verifyAudience(expectedAudience, jwt.claims.aud);
    verifyIssuer(this.issuer, jwt.claims.iss);
    verifyAssertedClaims(this, jwt.claims);

    return jwt;
  }

  async verifyIdToken(idTokenString, expectedClientId, expectedNonce) {
    // njwt verifies expiration and signature.
    // We require RS256 in the base verifier.
    // Remaining to verify:
    // - audience claim (must match client id)
    // - issuer claim
    // - nonce claim (if present)
    // - any custom claims passed in

    const jwt = await this.verifyAsPromise(idTokenString);
    verifyClientId(expectedClientId, jwt.claims.aud);
    verifyIssuer(this.issuer, jwt.claims.iss);
    verifyNonce(expectedNonce, jwt.claims.nonce);
    verifyAssertedClaims(this, jwt.claims);

    return jwt;
  }
}

module.exports = OktaJwtVerifier;
