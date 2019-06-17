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

class OktaJwtVerifier {
  constructor(options = {}) {
    // Assert configuration
    assertIssuer(options.issuer, options.testing);
    if( options.clientId ) { 
      assertClientId(options.clientId);
    }

    this.claimsToAssert = options.assertClaims || {};
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

  verifyAccessToken(accessTokenString) {
    return new Promise((resolve, reject) => {
      this.verifier.verify(accessTokenString, (err, jwt) => {
        if (err) {
          return reject(err);
        }
        jwt.claims = jwt.body;
        delete jwt.body;
        let assertedClaimsVerifier = new AssertedClaimsVerifier();
        for (let key of Object.keys(this.claimsToAssert)) {
          const expectedValue = this.claimsToAssert[key];
          let operator = assertedClaimsVerifier.extractOperator(key);
          if (!assertedClaimsVerifier.isValidOperator(operator)) {
            return reject(new Error(`operator: '${operator}' invalid. Supported operators: 'includes'.`));
          }
          let claim = assertedClaimsVerifier.extractClaim(key);
          const actualValue = jwt.claims[claim];
          assertedClaimsVerifier.checkAssertions(operator, claim, expectedValue, actualValue)
        }
        if (assertedClaimsVerifier.errors.length) {
          return reject(new Error(assertedClaimsVerifier.errors.join(', ')));
        }
        resolve(jwt);
      });
    });
  }
}

module.exports = OktaJwtVerifier;
