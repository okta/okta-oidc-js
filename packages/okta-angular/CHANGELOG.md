# PENDING

### Features

[#776](https://github.com/okta/okta-oidc-js/pull/776) `OktaAuthGuard` now implements `canActivateChild`

# 2.0.0

[#690](https://github.com/okta/okta-oidc-js/pull/690)

### Features

- `OktaCallbackComponent` will catch and display exceptions thrown from `handleAuthentication()`
- `onAuthRequired` callbacks will now receive the Angular injector as the 2nd parameter. This change allows logic using any services available within your application.

### Bug Fixes

- Saved URI is now stored in `sessionStorage` instead of `localStorage`. This fixes an issue which can occur when multiple instances of the app are loading at the same time.
- `OktaCallbackComponent` uses `window.location.replace()` to complete the login flow after `handleAuthentication` completes. This fixes an issue where the user could navigate back to the callback hander.

### Breaking Changes

- Signature for `onAuthRequired` callback functions has changed. Callbacks will receive the `OktaAuthService` as the first argument, and the Angular `Injector` as the second argument.
- Static initializer `OktaAuthModule.initAuth()` has been removed. `OKTA_CONFIG` should be provided directly by your module.
- `getFromUri` now returns an absolute URI as a string
- `setFromUri` takes a string. If it is a relative path, it will be converted to an absolute URI before being saved.
- Legacy config formats are no longer supported. See [Configuration Reference](https://github.com/okta/okta-auth-js#configuration-reference) for supported values.
- The `pkce` option now defaults to `true`, using the Authorization Code w/PKCE flow
  - Those using the (previous default) Implicit Flow should pass `pkce: false` to their config
  - See the [@okta/okta-auth-js README regarding PKCE OAuth2 Flow](https://github.com/okta/okta-auth-js#pkce-oauth-20-flow) for PKCE requirements
    - Which include the Application settings in the Okta Admin Dashboard allowing for PKCE

### Other

- Upgrades `@okta/okta-auth-js` to version 3.0.0

# 1.4.0

### Features

- [#648](https://github.com/okta/okta-oidc-js/pull/648)
  - Adds a default handler for onSessionExpired
  - Adds a new option isAuthenticated which works with onAuthRequired
  - Expose TokenManager
  - Adds documentation for postLogoutRedirectUri

# 1.3.1

### Bug fixes

- [#646](https://github.com/okta/okta-oidc-js/pull/646) - Fixes regression with AOT compilation. Also tested against Angular 9.

# 1.3.0

### Features

- [`558696`](https://github.com/okta/okta-oidc-js/commit/5586962c137d7ef0788744dbf0c1dc9f7d411ad0) - Upgrades to `@okta/okta-auth-js@2.11` which includes new options for signout: [`3e8c65`](https://github.com/okta/okta-auth-js/commit/3e8c654b99de771549775eb566f9349c86ed89b6)

# 1.2.3

### Features

- [`558696`](https://github.com/okta/okta-oidc-js/commit/5586962c137d7ef0788744dbf0c1dc9f7d411ad0) - Upgrades to `@okta/okta-auth-js@2.11` which includes new options for signout: [`3e8c65`](https://github.com/okta/okta-auth-js/commit/3e8c654b99de771549775eb566f9349c86ed89b6)

# 1.2.2

### Features

- [`ef10d85`](https://github.com/okta/okta-oidc-js/commit/ef10d856fb6bceba26fac119f0d17db1aaf66a2c) - Support PKCE authorization flow

### Other

- [`654550`](https://github.com/okta/okta-oidc-js/commit/6545506921cbe6e8f15076e45e908f285a6e2f1e) - All configuration options are now accepted. See [Configuration Reference](https://github.com/okta/okta-auth-js#configuration-reference). Camel-case (clientId) is now the preferred syntax for all Okta OIDC libraries. Underscore syntax (client_id) will be deprecated in a future release.

- [`a2a7b3e`](https://github.com/okta/okta-oidc-js/commit/a2a7b3e695d40e29d473be89e90340fbf5c4c56b) - Configuration property `scope` (string) is deprecated in favor of `scopes` (array). Normalize config format for the properties `responseType` and `scopes`, used in get token flows. Fully support deprecated config properties `request_type` and `scope` as previously documented and used within the okta-angular samples.

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
