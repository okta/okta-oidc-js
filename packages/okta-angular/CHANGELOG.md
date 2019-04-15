# 1.2.1

### Other
- [`0703aff`](https://github.com/okta/okta-oidc-js/commit/0703afff55d9ab3a3c3ec608e45e06c969542d73) - Relaxes peerDependency to include latest versions of Angular

# 1.2.0

### Other
- [`f972822`](https://github.com/okta/okta-oidc-js/commit/f972822542792275bfe645813c8487dcef45de36) - Deprecates 'initAuth' method.

# 1.1.0

### Features

- [`2ae1eff`](https://github.com/okta/okta-oidc-js/commit/2ae1effe948c35d112f58f12fbf3b4730e3a24e4) - Adds TokenManager configuration parameters.

# 1.0.7

### Other

- [`2945461`](https://github.com/okta/okta-oidc-js/pull/338/commits/294546166a41173b699579d7d647ba7d5cab0764) - Updates `@okta/configuration-validation` version

# 1.0.6

### Bug fixes

- [`6242f2d`](https://github.com/okta/okta-oidc-js/pull/332/commits/6242f2d1586aabd80e60b3b237d5b5136bfd95e9) - Fixes an issue where the library was not correctly building the `/dist` output before publishing to `npm`.

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
