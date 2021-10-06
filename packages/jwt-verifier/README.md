# Okta JWT Verifier for Node.js

[![npm version](https://img.shields.io/npm/v/@okta/jwt-verifier.svg?style=flat-square)](https://www.npmjs.com/package/@okta/jwt-verifier)
[![build status](https://img.shields.io/travis/okta/okta-oidc-js/master.svg?style=flat-square)](https://travis-ci.org/okta/okta-oidc-js)

This library verifies Okta access and ID tokens by fetching the public keys from the JWKS endpoint of the authorization server.

> This library is for Node.js applications and will not compile into a front-end application.  If you need to work with tokens in front-end applications, please see [okta-auth-js](https://github.com/okta/okta-auth-js).

Using Express?  Our [Express Resource Server Example](https://github.com/okta/samples-nodejs-express-4/tree/master/resource-server) will show you how to use this library in your Express application.

## Access Tokens

This library verifies Okta access tokens (issued by [Okta Custom Authorization servers](https://developer.okta.com/docs/concepts/auth-servers/#custom-authorization-server)) by fetching the public keys from the JWKS endpoint of the authorization server. If the access token is valid it will be converted to a JSON object and returned to your code. 

You can learn about [access tokens](https://developer.okta.com/docs/reference/api/oidc/#access-token), [scopes](https://developer.okta.com/docs/reference/api/oidc/#scopes) and [claims](https://developer.okta.com/docs/reference/api/oidc/#claims) in our [OIDC and OAuth 2.0 API Referece](https://developer.okta.com/docs/reference/api/oidc/).

> Okta Custom Authorization Servers require the [API Access Management](https://developer.okta.com/docs/concepts/api-access-management/) license.  If you are using Okta Org Authorization Servers (which don’t require API Access Management) you can manually validate against the /introspect endpoint ( https://developer.okta.com/docs/reference/api/oidc/#introspect ). 

For any access token to be valid, the following are asserted:
* Signature is valid (the token was signed by a private key which has a corresponding public key in the JWKS response from the authorization server).
* Access token is not expired (requires local system time to be in sync with Okta, checks the `exp` claim of the access token).
* The `aud` claim matches any expected `aud` claim passed to `verifyAccessToken()`.
* The `iss` claim matches the issuer the verifier is constructed with.
* Any custom claim assertions that have been configured.

To learn more about verification cases and Okta's tokens please read [Validate Access Tokens](https://developer.okta.com/docs/guides/validate-access-tokens/go/overview/). 

## ID Tokens

This library verifies Okta ID tokens (issued by [Okta Custom Authorization servers](https://developer.okta.com/docs/concepts/auth-servers/#custom-authorization-server) or [Okta Org Authorization Server](https://developer.okta.com/docs/concepts/auth-servers/#org-authorization-server)) by fetching the public keys from the JWKS endpoint of the authorization server. If the token is valid it will be converted to a JSON object and returned to your code. 

You can learn about [ID tokens](https://developer.okta.com/docs/reference/api/oidc/#id-token), [scopes](https://developer.okta.com/docs/reference/api/oidc/#scopes) and [claims](https://developer.okta.com/docs/reference/api/oidc/#claims) in our [OIDC and OAuth 2.0 API Referece](https://developer.okta.com/docs/reference/api/oidc/).

For any ID token to be valid, the following are asserted:
* Signature is valid (the token was signed by a private key which has a corresponding public key in the JWKS response from the authorization server).
* ID token is not expired (requires local system time to be in sync with Okta, checks the `exp` claim of the ID token).
* The `aud` claim matches the expected client ID passed to `verifyIdToken()`.
* The `iss` claim matches the issuer the verifier is constructed with.
* The `nonce` claim matches the expected nonce.
* Any custom claim assertions that have been configured.

To learn more about verification cases and Okta's tokens please read [Validate ID Tokens](https://developer.okta.com/docs/guides/validate-id-tokens/overview/). 

## Upgrading

For information on how to upgrade between versions of the library, see UPGRADING.md

## How to use

```bash
npm install --save @okta/jwt-verifier
```

Create a verifier instance, bound to the issuer (authorization server URL):

```javascript
const OktaJwtVerifier = require('@okta/jwt-verifier');

const oktaJwtVerifier = new OktaJwtVerifier({
  issuer: 'https://{yourOktaDomain}/oauth2/default' // required
});
```

### Verify access tokens

```javascript
oktaJwtVerifier.verifyAccessToken(accessTokenString, expectedAud)
.then(jwt => {
  // the token is valid (per definition of 'valid' above)
  console.log(jwt.claims);
})
.catch(err => {
  // a validation failed, inspect the error
});
```

The expected audience passed to `verifyAccessToken()` is required, and can be either a string (direct match) or an array of strings (the actual `aud` claim in the token must match one of the strings).

```javascript
// Passing a string for expectedAud
oktaJwtVerifier.verifyAccessToken(accessTokenString, 'api://default')
.then(jwt => console.log('token is valid') )
.catch(err => console.warn('token failed validation') );

oktaJwtVerifier.verifyAccessToken(accessTokenString, [ 'api://special', 'api://default'] )
.then(jwt => console.log('token is valid') )
.catch(err => console.warn('token failed validation') );
```

### Verify ID tokens

```javascript
oktaJwtVerifier.verifyIdToken(idTokenString, expectedClientId, expectedNonce)
.then(jwt => {
  // the token is valid (per definition of 'valid' above)
  console.log(jwt.claims);
})
.catch(err => {
  // a validation failed, inspect the error
});
```

The expected client ID passed to `verifyIdToken()` is required. Expected nonce value is optional and required if the claim is present in the token body.


## Custom Claims Assertions

For basic use cases, you can ask the verifier to assert a custom set of claims. For example, if you need to assert that this JWT was issued for a given client id:

```javascript
const verifier = new OktaJwtVerifier({
  issuer: 'https://{yourOktaDomain}/oauth2/default',
  clientId: '{clientId}'
  assertClaims: {
    cid: '{clientId}'
  }
});
```

Validation fails and an error is returned if the token does not have the configured claim.

For more complex use cases, you can ask the verifier to assert that a claim includes one or more values. This is useful for array type claims as well as claims that have space-separated values in a string.

You use the form: `<claim name>.includes` in the `assertClaims` object with an array of values to validate.

For example, if you want to assert that an array claim named `groups` includes (at least) `Everyone` and `Another`, you'd write code like this:

```javascript
const verifier = new OktaJwtVerifier({
  issuer: ISSUER,
  clientId: CLIENT_ID,
  assertClaims: {
    'groups.includes': ['Everyone', 'Another']
  }
});
```

If you want to assert that a space-separated string claim name `scp` includes (at least) `promos:write` and `promos:delete`, you'd write code like this:

```javascript
const verifier = new OktaJwtVerifier({
  issuer: ISSUER,
  clientId: CLIENT_ID,
  assertClaims: {
    'scp.includes': ['promos:write', 'promos:delete']
  }
});
```

The values you want to assert are always represented as an array (the right side of the expression). The claim that you're checking against (the left side of the expression) can have either an array (like `groups`) or a space-separated list in a string (like `scp`) as its value type.

NOTE: Currently, `.includes` is the only supported claim operator.

## Custom JWKS URI

Custom JWKS URI can be provided. It's useful when JWKS URI cannot be based on Issuer URI:

```javascript
const verifier = new OktaJwtVerifier({
  issuer: 'https://{yourOktaDomain}',
  clientId: '{clientId}',
  jwksUri: 'https://{yourOktaDomain}/oauth2/v1/keys'
});
```

## Caching & Rate Limiting

* By default, found keys are cached by key ID for one hour. This can be configured with the `cacheMaxAge` option for cache entries.
* If a key ID is not found in the cache, the JWKs endpoint will be requested. To prevent a DoS if many not-found keys are requested, a rate limit of 10 JWKs requests per minute is enforced. This is configurable with the `jwksRequestsPerMinute` option.

Here is a configuration example that shows the default values:

```javascript
// All values are default files
const oktaJwtVerifier = new OktaJwtVerifier({
  issuer: 'https://{yourOktaDomain}/oauth2/default',
  clientId: '{clientId}',
  cacheMaxAge: 60 * 60 * 1000, // 1 hour
  jwksRequestsPerMinute: 10
});
```

## Testing
Set up a SPA and a Web App in your Okta org and testing environment variables by following the [Testing](https://github.com/okta/okta-oidc-js#testing) section in okta-oidc-js Monorepo's README.

**NOTE:** 

When creating a SPA in your Okta org, please make sure all `Implicit` checks have been checked in the `General Settings -> Application -> Allowed grant types` section.

Command for running unit test:
```
yarn test:unit
```

## Contributing
We welcome contributions to all of our open-source packages. Please see the [contribution guide](https://github.com/okta/okta-oidc-js/blob/master/CONTRIBUTING.md) to understand how to structure a contribution.

### Installing dependencies for contributions
We use [yarn](https://yarnpkg.com) for dependency management when developing this package:
```
yarn install
```
