# 1.0.5

### Features

- [`29d04f6`](https://github.com/okta/okta-oidc-js/pull/320/commits/29d04f69a267cac7400475abca1d2b5e474e1730) - Adds configuration validation for `issuer`, `clientId`, and `redirectUri` when passed into the auth service.

### Other

- [`3582f25`](https://github.com/okta/okta-oidc-js/pull/318/commits/3582f259cf74dbb45b6eed673065c2d3c03e9db3) - Rely on shared environment configuration from project root.
- [`c8b7ab5a`](https://github.com/okta/okta-oidc-js/commit/c8b7ab5aacecf5793efb6a626c0a24a78147ded9#diff-b8cfe5f7aa410fb30a335b09346dc4d2) - Migrate dependencies to project root utilizing [yarn workspaces](https://yarnpkg.com/lang/en/docs/workspaces/).

# 1.0.4

### Bug fixes

- [`5862e32`](https://github.com/okta/okta-oidc-js/commit/5862e320547ef5dd24ac5717480514f71f72bab3) - Fixes an issue where the library would enter an error state when attempting to renew expired tokens (errorCode: `login_required`).

# 1.0.3

### Other

- Updated `@okta/okta-auth-js` dependency to version 2.

# 1.0.2

### Other

- The supported range of Angular peer dependencies has been upgraded to include versions 4, 5, and 6.  At the moment we only test on the latest stable version of Angular, currently version 6.
