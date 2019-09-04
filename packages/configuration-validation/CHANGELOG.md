# 0.4.1

### Bug Fixes

- [`a2a7b3e`](https://github.com/okta/okta-oidc-js/commit/a2a7b3e695d40e29d473be89e90340fbf5c4c56b) - Normalize config format for the properties `responseType` and `scopes`, used in get token flows.

# 0.4.0

### Features

 - [`654550`](https://github.com/okta/okta-oidc-js/commit/6545506921cbe6e8f15076e45e908f285a6e2f1e) - All configuration options are now accepted. See [Configuration Reference](https://github.com/okta/okta-auth-js#configuration-reference). Camel-case (clientId) is now the preferred syntax for all Okta OIDC libraries. Underscore syntax (client_id) may be deprecated in a future release.

# 0.3.0

### Features

- [`9b04ada`](https://github.com/okta/okta-oidc-js/commit/9b04ada6a01c9d9aca391abf0de3e5ecc9811e64) - Adds `buildConfigObject` function which accepts both camelCase and underscore_case

# 0.2.0

### Features

- [`035607b`](https://github.com/okta/okta-oidc-js/commit/035607bfee231e9a6fef8a43cec172fb75a59839) - Adds assertion function for `appBaseUrl`

# 0.1.1

### Bug Fixes

- [`49e8f60`](https://github.com/okta/okta-oidc-js/commit/49e8f60993cf4f57c33d5ddf8f2e48311caf8cc8) - Use babel to compile for IE 11
