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
