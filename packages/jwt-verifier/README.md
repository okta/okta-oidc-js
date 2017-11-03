# Okta JWT Verifier

This library verifies Okta access tokens (issued by Okta authorization servers) by fetching the public keys from the JWKS endpoint of the authorization server. If the access token is valid it will be converted to a JSON object and returned to your code. For an access token to be valid, the following are asserted:

* Signature is valid (the token was signed by a private key which has a corresponding public key in the JWKS response from the authorization server).
* Access token is not expired (requires local system time to be in sync with Okta, checks the `exp` claim of the access token).
* Any custom claim assertions that have been configured.

To learn more about verification cases and Okta's tokens please read [Working With OAuth 2.0 Tokens](https://developer.okta.com/authentication-guide/tokens/)

## How to use

Install this library from npm:

```bash
npm install --save @okta/jwt-verifier
```

Create a verifier instance, bound to the issuer (authorization server URL) and the client ID (the Okta application that will use this authorization server):

```javascript
const OktaJwtVerifier = require('@okta/jwt-verifier');

const oktaJwtVerifier = new OktaJwtVerifier({
  issuer: 'http://{your-okta-org-url}/oauth2/default'
})
```

With a verifier, you can now verify access tokens:

```javascript
oktaJwtVerifier.verifyAccessToken(accessTokenString)
.then(jwt => {
  // the token is valid
  console.log(jwt.claims);
})
.catch(err => {
  // a validation failed, inspect the error
});
```

## Custom Claims Assertions

For basic use cases, you can ask the verifier to assert a custom set of claims. For example, if you need to assert that this JWT was issued for a given client id:

```javascript
const verifier = new OktaJwtVerifier({
  issuer: ISSUER,
  assertClaims: {
    cid: 'myKnownClientId'
  }
});
```

Validation will fail and an error returned if an access token does not have the configured claim.

## Caching & Rate Limiting

* By default, found keys are cached by key ID for one hour. This can be configured with the `cacheMaxAge` option for cache entries.
* If a key ID is not found in the cache, the JWKs endpoint will be requested. To prevent a DoS if many not-found keys are requested, a rate limit of 10 JWKs requests per minute is enforced. This is configurable with the `jwksRequestsPerMinute` option.

Here is a configuration example that shows the default values:

```javascript
// All values are default files
const oktaJwtVerifier = new OktaJwtVerifier({
  cacheMaxAge: 60 * 60 * 1000, // 1 hour
  jwksRequestsPerMinute: 10
});
```
