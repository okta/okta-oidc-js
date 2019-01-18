# Okta Configuration Validation

Standard pattern for validating configuration passed into Okta JavaScript libraries and SDKs.

## Installation

```bash
# npm
npm install --save @okta/configuration-validation

# yarn
yarn add @okta/configuration-validation
```

## API

### assertIssuer(issuer, [, testing])

Assert that a valid `issuer` was provided.

```javascript
// Valid
assertIssuer('https://example.okta.com');

// Throws a ConfigurationValidationError
//
// It looks like there's a typo in your Okta domain!
assertIssuer('http://foo.com.com');

// Ignore HTTPS requirement for testing
assertIssuer('http://localhost:8080/', {
  disableHttpsCheck: true
});
```

### assertClientId(clientId)

Assert that a valid `clientId` was provided.

```javascript
assertClientId('abc123');
```

### assertClientSecret(clientSecret)

Assert that a valid `clientSecret` was provided.

```javascript
assertClientSecret('superSecret');
```
### assertRedirectUri(redirectUri)

Assert that a valid `redirectUri` was provided.

```javascript
assertRedirectUri('https://example.com/callback');
```

### assertAppBaseUrl(appBaseUrl)

Assert that a valid `appBaseUrl` was provided.

```javascript
assertAppBaseUrl('https://example.com');
```
