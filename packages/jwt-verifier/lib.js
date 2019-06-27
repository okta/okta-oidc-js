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

const {
  assertIssuer,
  assertClientId
} = require('@okta/configuration-validation');

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
    return !operator || operator === 'includes'
  }

  checkAssertions(op, claim, expectedValue, actualValue) {
    if (!op && actualValue !== expectedValue) {
      this.errors.push(`claim '${claim}' value '${actualValue}' does not match expected value '${expectedValue}'`);
    } else if (op === 'includes' && Array.isArray(expectedValue)) {
      expectedValue.forEach(value => {
        if (!actualValue || !actualValue.includes(value)) {
          this.errors.push(`claim '${claim}' value '${actualValue}' does not include expected value '${value}'`);
        }
      })
    } else if (op === 'includes' && (!actualValue || !actualValue.includes(expectedValue))) {
      this.errors.push(`claim '${claim}' value '${actualValue}' does not include expected value '${expectedValue}'`);
    }
  }
}

function verifyAssertedClaims(verifier, claims) {
  const assertedClaimsVerifier = new AssertedClaimsVerifier();
  for (let [claimName, expectedValue] of Object.entries(verifier.claimsToAssert)) {
    const operator = assertedClaimsVerifier.extractOperator(claimName);
    if (!assertedClaimsVerifier.isValidOperator(operator)) {
      throw new Error(`operator: '${operator}' invalid. Supported operators: 'includes'.`);
    }
    const claim = assertedClaimsVerifier.extractClaim(claimName);
    const actualValue = claims[claim];
    assertedClaimsVerifier.checkAssertions(operator, claim, expectedValue, actualValue)
  }
  if (assertedClaimsVerifier.errors.length) {
    throw new Error(assertedClaimsVerifier.errors.join(', '));
  }
}

function verifyAudience(expected, aud) {
  if( !expected ) {
    throw new Error('expected audience is required');
  }

  if ( Array.isArray(expected) && !expected.includes(aud) ) {
    throw new Error(`audience claim ${aud} does not match one of the expected audiences: ${ expected.join(', ') }`);
  }

  if ( !Array.isArray(expected) && aud !== expected ) {
    throw new Error(`audience claim ${aud} does not match expected audience: ${expected}`);
  }
}

function verifyIssuer(expected, issuer) {
  if( issuer !== expected ) {
    throw new Error(`issuer ${issuer} does not match expected issuer: ${expected}`);
  }
}

class OktaJwtVerifier {
  constructor(options = {}) {
    // Assert configuration options exist and are well-formed (not necessarily correct!)
    assertIssuer(options.issuer, options.testing);
    if( options.clientId ) {
      assertClientId(options.clientId);
    }

    this.claimsToAssert = options.assertClaims || {};
    this.issuer = options.issuer;
    this.jwksClient = jwksClient({
      jwksUri: options.issuer + '/v1/keys',
      cache: true,
      cacheMaxAge: options.cacheMaxAge || (60 * 60 * 1000),
      cacheMaxEntries: 3,
      jwksRequestsPerMinute: options.jwksRequestsPerMinute || 10,
      rateLimit: true
    });
    this.verifier = nJwt.createVerifier().setSigningAlgorithm('RS256').withKeyResolver((kid, cb) => {
      this.jwksClient.getSigningKey(kid, (err, key) => {
        cb(err, key && (key.publicKey || key.rsaPublicKey));
      });
    });
  }

  async verifyAsPromise(accessTokenString) {
    return new Promise((resolve, reject) => {
      // Convert to a promise
      this.verifier.verify(accessTokenString, (err, jwt) => {
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
}

module.exports = OktaJwtVerifier;
