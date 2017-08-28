const jwksClient = require('jwks-rsa');
const nJwt = require('njwt');

class OktaJwtVerifier {
  constructor(options = {}) {

		// TODO parameter validation
		this.clientId = options.clientId;
		this.claimsToAssert = options.assertClaims || {};
		this.jwksClient = jwksClient({
			jwksUri: options.issuer + '/v1/keys',
			cache: true,
			cacheMaxAge: options.cacheMaxAge || (60 * 60 * 1000),
			cacheMaxEntries: options.cacheMaxEntries || 10,
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
		var self = this;
		return new Promise((resolve, reject) => {
			this.verifier.verify(accessTokenString, function(err, jwt) {
				if (err) {
					return reject(err);
				}
				jwt.claims = jwt.body;
				delete jwt.body;
				let errors = [];
				Object.keys(self.claimsToAssert).forEach(claim => {
					const actualValue = jwt.claims[claim];
					const expectedValue = self.claimsToAssert[claim];
					if (actualValue !== expectedValue) {
						errors.push(`claim '${claim}' value '${actualValue}' does not match expected value '${expectedValue}'`);
					}
				})
				if (errors.length) {
					return reject(new Error(errors.join(', ')));
				}
				resolve(jwt);
			});
		});
  }
}

module.exports = OktaJwtVerifier;