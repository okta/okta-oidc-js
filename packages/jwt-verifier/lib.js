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

class OktaJwtVerifier {
  constructor(options = {}) {
    // Assert configuration
    assertIssuer(options.issuer, options.testing);
    assertClientId(options.clientId);

    this.clientId = options.clientId;
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
        const errors = [];
        for (let claim of Object.keys(this.claimsToAssert)) {
          const actualValue = jwt.claims[claim];
          const expectedValue = this.claimsToAssert[claim];
          if (actualValue !== expectedValue) {
            errors.push(`claim '${claim}' value '${actualValue}' does not match expected value '${expectedValue}'`);
          }
        }
        if (errors.length) {
          return reject(new Error(errors.join(', ')));
        }
        resolve(jwt);
      });
    });
  }
}

module.exports = OktaJwtVerifier;
