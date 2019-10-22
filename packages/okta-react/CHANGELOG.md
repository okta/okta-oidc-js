# 1.2.3

### Other
- [`a2a7b3e`](https://github.com/okta/okta-oidc-js/commit/a2a7b3e695d40e29d473be89e90340fbf5c4c56b) - Configuration property `scope` (string) is deprecated in favor of `scopes` (array).

### Bug Fixes

- [`a2a7b3e`](https://github.com/okta/okta-oidc-js/commit/a2a7b3e695d40e29d473be89e90340fbf5c4c56b) - Normalize config format for the properties `responseType` and `scopes`, used in get token flows. Fully support deprecated config properties `request_type` and `scope` as previously documented and used within the okta-react samples.

# 1.2.2

### Features

- [`0453f1d`](https://github.com/okta/okta-oidc-js/commit/0453f1d2ec13695b3ad73b01f5336bb4d606eff5) - Adds support for PKCE flow

### Other

- [`654550`](https://github.com/okta/okta-oidc-js/commit/6545506921cbe6e8f15076e45e908f285a6e2f1e) - All configuration options are now accepted. See [Configuration Reference](https://github.com/okta/okta-auth-js#configuration-reference). Camel-case (clientId) is now the preferred syntax for all Okta OIDC libraries. Underscore syntax (client_id) will be deprecated in a future release.

# 1.2.1

- internal version

# 1.2.0

### Features

- [`2ae1eff`](https://github.com/okta/okta-oidc-js/commit/2ae1effe948c35d112f58f12fbf3b4730e3a24e4) - Adds TokenManager configuration parameters.

# 1.1.4

### Other

- [`2945461`](https://github.com/okta/okta-oidc-js/pull/338/commits/294546166a41173b699579d7d647ba7d5cab0764) - Updates `@okta/configuration-validation` version.

# 1.1.3

### Bug fixes

- [`6242f2d`](https://github.com/okta/okta-oidc-js/pull/332/commits/6242f2d1586aabd80e60b3b237d5b5136bfd95e9) - Fixes an issue where the library was not correctly building the `/dist` output before publishing to `npm`.

# 1.1.2

### Features

- [`4fcbdea`](https://github.com/okta/okta-oidc-js/pull/320/commits/4fcbdea5e6bb626305825699a6f0912c7cdcf318) - Adds configuration validation for `issuer`, `client_id`, and `redirect_uri` when passed into the security component.

### Other

- [`c8b7ab5a`](https://github.com/okta/okta-oidc-js/commit/c8b7ab5aacecf5793efb6a626c0a24a78147ded9#diff-b8cfe5f7aa410fb30a335b09346dc4d2) - Migrate dependencies to project root utilizing [yarn workspaces](https://yarnpkg.com/lang/en/docs/workspaces/).

# 1.1.1

### Bug fixes

- [`dbfb7de`](https://github.com/okta/okta-oidc-js/commit/dbfb7de3b41e932559ffa70790eeeca1dd30c270) - Fixes an issue where the library would enter an error state when attempting to renew expired tokens (errorCode: `login_required`).

# 1.1.0

### Features

- [`30fbdd2`](https://github.com/okta/okta-oidc-js/commit/30fbdd2da7e2d7dec4004b66c994963c056a351f) - Adds `className` prop to `Security` component to allow style overrides.
- [`5603c1f`](https://github.com/okta/okta-oidc-js/commit/5603c1f1924bbf4de271d599b97d0ed187715b74) - Allow additional OAuth 2.0 and OpenID request params to be passed in `login` and `redirect` methods.
- [`fd42b01`](https://github.com/okta/okta-oidc-js/commit/fd42b012595d2d63869a1a512b2cba7da9ad3225) - Allow route params to be passed through the `SecureRouter` into a nested `Route`.

# 1.0.3

### Other

- Updated `@okta/okta-auth-js` dependency to version 2.
