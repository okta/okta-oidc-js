# 3.0.1

### Features

- [#738] `<LoginCallback/>` now accepts an optional `errorComponent` prop that accepts a component that can be passed an `error` object.
  - By default `<LoginCallback/>` will render with the `<OktaError/>` component

### Bug Fixes

- `<LoginCallback>` now triggers only after `authState.isPending` is false, removing the problem of as error message from parsing the tokens from the url being cleared by the pending `authState` determination. See [#719](https://github.com/okta/okta-oidc-js/issues/719)
- [#738] `<Security>` now memoizes if it creates an instance of `AuthService` so as to not create new instances on re-renders

# 3.0.0

### Breaking Changes
- Uses/requires @okta/okta-auth-js 3.x
  - Notably, this means `pkce` now defaults to `true` 
    - See the [@okta/okta-auth-js README regarding PKCE OAuth2 Flow](https://github.com/okta/okta-auth-js#pkce-oauth-20-flow) for requirements
    - The settings for the Application on your Okta Admin Dashboard must include allowing PKCE
    - If you are using the (previous default) Implicit Flow, you should set `pkce: false`
- `<Security>` no longer creates a `<div>` wrapper around its children
  - The `className` property of `<Security>` is no longer used
  - Existing applications that rely on this `<div>` can add it themselves as a parent or direct child of `<Security>`

# 2.0.1

### Bug Fixes

- [#700](https://github.com/okta/okta-oidc-js/pull/700) LoginCallback: render error as string

# 2.0.0

### Features

- Now offers synchronous access to the authentication state (after the first asynchronous determination)
- Now offers the following React Hook (2.x requires React 16.8+)
  - `useOktaAuth` 
- Now can be used with other routers than react-router
  - React Router 5 continues to be supported, but is now optional
  - Routers other than React-Router will have to write their own version of `LoginCallback` component 

### Breaking Changes
- Requires React 16.8+
- If using react-router, requires react-router 5+
- See the `Migration from 1.x to 2.0` section of the README for details on migrating your applications
  - `Auth.js` and the `auth` parameter to `<Security>` have been renamed to `AuthService.js` and `authService`
  - `<ImplicitCallback>` has been replaced with `<LoginCallback>`
  - `auth.IsAuthenticated()` has been removed
    - instead use the `.isAuthenticated` property of the `authState` object
  - `withAuth` has been replaced with `withOktaAuth`, which gives slightly different parameters
    - provides `authService` instead of `auth`
    - also provides the `authState` object
  - the arguments passed to the optional `onAuthRequired()` callback provided to the `<Security>` component have changed
  - error handling for authentication is now handled by putting the error into the `authState.error` property
  - `auth.setFromUri()` is now `authService.setFromUri()` and is passed a string (instead of an object)
  - `auth.getFromUri()` is now `authService.getFromUri()` and returns a string (instead of an object)

# 1.4.1

### Bug Fixes

- [#669](https://github.com/okta/okta-oidc-js/pull/669) - Fixes ImplicitCallback component so it will not attempt redirect unless `getFromUri` returns a value. This can occur if multiple instances of the component are mounted.

# 1.4.0

### Features

- [#648](https://github.com/okta/okta-oidc-js/pull/648)
  - Adds a default handler for onSessionExpired
  - Adds a new option isAuthenticated which works with onAuthRequired
  - Expose TokenManager
  - Adds documentation for postLogoutRedirectUri

# 1.3.1

### Bug Fixes

- [`3b95ed`](https://github.com/okta/okta-oidc-js/commit/3b95ed3533ad969bf96194933769f6091e018c3b) -  Changes from deprecated 'componentWillMount' to 'componentDidMount'

# 1.3.0

### Features

- [`558696`](https://github.com/okta/okta-oidc-js/commit/5586962c137d7ef0788744dbf0c1dc9f7d411ad0) - Upgrades to `@okta/okta-auth-js@2.11` which includes new options for signout: [`3e8c65`](https://github.com/okta/okta-auth-js/commit/3e8c654b99de771549775eb566f9349c86ed89b6)

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
