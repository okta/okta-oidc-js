# 1.1.1

### Features

- [`3e0666d`](https://github.com/okta/okta-oidc-js/commit/3e0666dc279bbe716e3bb236a051be31aad494c7) - Support PKCE authorization flow

### Other

- [`654550`](https://github.com/okta/okta-oidc-js/commit/6545506921cbe6e8f15076e45e908f285a6e2f1e) - All configuration options are now accepted. See [Configuration Reference](https://github.com/okta/okta-auth-js#configuration-reference). Camel-case (clientId) is now the preferred syntax for all Okta OIDC libraries. Underscore syntax (client_id) will be deprecated in a future release.

- [`a2a7b3e`](https://github.com/okta/okta-oidc-js/commit/a2a7b3e695d40e29d473be89e90340fbf5c4c56b) - Configuration property `scope` (string) is deprecated in favor of `scopes` (array). Normalize config format for the properties `responseType` and `scopes`, used in get token flows. Fully support deprecated config properties `request_type` and `scope` as previously documented and used within the okta-vue samples.

# 1.1.0

### Features

- [`2ae1eff`](https://github.com/okta/okta-oidc-js/commit/2ae1effe948c35d112f58f12fbf3b4730e3a24e4) - Adds TokenManager configuration parameters.

# 1.0.7

### Other

- [`2945461`](https://github.com/okta/okta-oidc-js/pull/338/commits/294546166a41173b699579d7d647ba7d5cab0764) - Updates `@okta/configuration-validation` version.

# 1.0.6

### Bug fixes

- [`6242f2d`](https://github.com/okta/okta-oidc-js/pull/332/commits/6242f2d1586aabd80e60b3b237d5b5136bfd95e9) - Fixes an issue where the library was not correctly building the `/dist` output before publishing to `npm`.

# 1.0.5

### Features

- [`d67a596`](https://github.com/okta/okta-oidc-js/pull/320/commits/d67a59619013c2be6a8ade88db21873c833c606f) - Adds configuration validation for `issuer`, `client_id`, and `redirect_uri` when passed into the security component.

### Other

- [`3582f25`](https://github.com/okta/okta-oidc-js/pull/318/commits/3582f259cf74dbb45b6eed673065c2d3c03e9db3) - Rely on shared environment configuration from project root.
- [`c8b7ab5a`](https://github.com/okta/okta-oidc-js/commit/c8b7ab5aacecf5793efb6a626c0a24a78147ded9#diff-b8cfe5f7aa410fb30a335b09346dc4d2) - Migrate dependencies to project root utilizing [yarn workspaces](https://yarnpkg.com/lang/en/docs/workspaces/).

# 1.0.4

### Bug fixes

- [`95c3e62`](https://github.com/okta/okta-oidc-js/commit/dbfb7de3b41e932559ffa70790eeeca1dd30c270) - Fixes an issue where the library would enter an error state when attempting to renew expired tokens (errorCode: `login_required`).

# 1.0.3

### Other

- Updated `jest` to version ^23.6.0.
- Updated package-lock.json.

# 1.0.2

### Other

- Updated `@okta/okta-auth-js` dependency to version 2.
