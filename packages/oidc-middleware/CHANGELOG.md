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
