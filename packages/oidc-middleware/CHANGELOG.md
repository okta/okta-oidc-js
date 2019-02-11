# 2.0.0

### Features

- [`a4b54f7`](https://github.com/okta/okta-oidc-js/commit/a4b54f771e19f2eeece46a39ded135550061f2a1) - adds Okta logout capability

- [`a999b95`](https://github.com/okta/okta-oidc-js/commit/a999b959c98bfea2f138281b2f93efb2d2d5fac7) - adds appBaseUrl, removes redirect_uri

- Adds Okta logout capability (informing Okta that the session is ended rather than just locally forgetting the current session) ([#162](https://github.com/okta/okta-oidc-js/issues/162))

### Breaking Changes 

See "Updating" in the README for migration steps

- `redirect_uri` config option is dropped.  The value is either automatically derived from the `appBaseUrl` and the appropriate `routes` option, or explicitly set as `loginRedirectUri`
- Two new routes are automatically generated and will override manually created routes of the same path.  Unless `routes` is customized, they are `/logout` (POST only) and `/logout/callback`
- `routes.callback` is renamed to `routes.loginCallback`
- `routes.callback.defaultRedirect` is renamed to `routes.loginCallback.afterCallback`

# 1.0.2

### Other

- [`2945461`](https://github.com/okta/okta-oidc-js/pull/338/commits/294546166a41173b699579d7d647ba7d5cab0764) - Updates `@okta/configuration-validation` version.

# 1.0.1

### Features

- [`ed29bf5`](https://github.com/okta/okta-oidc-js/pull/320/commits/ed29bf5f1618a7b6941b8a4d47160fac7fb3f749) - Adds configuration validation for `issuer`, `client_id`, `client_secret`, and `redirect_uri` when passed into the middleware.

### Other

- [`c37b9cf`](https://github.com/okta/okta-oidc-js/pull/326/commits/c37b9cf483e17720b233800b8b5609c3383b8167) - Updates the TCK version to support new integration tests.
- [`3582f25`](https://github.com/okta/okta-oidc-js/pull/318/commits/3582f259cf74dbb45b6eed673065c2d3c03e9db3) - Rely on shared environment configuration from project root.
- [`c8b7ab5a`](https://github.com/okta/okta-oidc-js/commit/c8b7ab5aacecf5793efb6a626c0a24a78147ded9#diff-b8cfe5f7aa410fb30a335b09346dc4d2) - Migrate dependencies to project root utilizing [yarn workspaces](https://yarnpkg.com/lang/en/docs/workspaces/).
- [`8494be0`](https://github.com/okta/okta-oidc-js/pull/292/commits/8494be0ec98887d19870941d2a0ddbf653dbbb6c) - Migrate mocha tests to jest.

# 1.0.0

### Features

- Attach the requested tokens to the user context object ([#226](https://github.com/okta/okta-oidc-js/issues/226))

  ```javascript
  app.get('/', (req, res) => {
    if (req.userContext) {
      const tokenSet = req.userContext.tokens;
      const userinfo = req.userContext.userinfo;

      console.log(`Access Token: ${tokenSet.access_token}`);
      console.log(`Id Token: ${tokenSet.id_token}`);
      console.log(`Claims: ${tokenSet.claims}`);
      console.log(`Userinfo Response: ${userinfo}`);

      res.send(`Hi ${userinfo.sub}!`);
    } else {
      res.send('Hi!');
    }
  });
  ```

- Basic configuration validation for catching common input mistakes.

### Breaking Changes

- `req.userinfo` is now nested within `req.userContext` ([#226](https://github.com/okta/okta-oidc-js/issues/226)). Please update any use of `req.userinfo` to `req.userContext.userinfo`.

# 0.1.3

### Bug Fixes

- Removed next() in ensureAuthenticated ([#224](https://github.com/okta/okta-oidc-js/issues/224)) ([592ec42](https://github.com/okta/okta-oidc-js/commit/592ec420a4afcf12cbae5d04774502820e326b98))

### Other

- Updating openid-client dependency ([#222](https://github.com/okta/okta-oidc-js/issues/222)) ([8047386](https://github.com/okta/okta-oidc-js/commit/8047386519ca34ac4b6674d7e6a9b0e60a95de06/))
