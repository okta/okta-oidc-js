# 1.0.0
### Features
- https://github.com/okta/okta-oidc-js/commit/9d76c9f952506d3a51bb912a87a8da592dd7201d - Adds verifications to verifyAccessToken() (#481)

### Fixes
- https://github.com/okta/okta-oidc-js/commit/2f2d39fd27f88f43c20e5f0e568e428ce7e7ea74 - Removes check of client_id from access tokens (#477)
- https://github.com/okta/okta-oidc-js/commit/0d5afa7854d0d5653b8541ebe68de6099a841c12 - Updates dev deps to remove vulns (#484)

# 0.0.16

### Features

- [`213e092`](https://github.com/okta/okta-oidc-js/commit/213e092c1f26d7f818a7e838c5b7eb996d9c9e3d) - Added support for an includes operator for assertClaims [#436](https://github.com/okta/okta-oidc-js/pull/436)

# 0.0.15

### Fixes

- [`7fc3ebf`](https://github.com/okta/okta-oidc-js/pull/450/commits/7fc3ebfde56ac0defbd6a0587d7e48edcbd80634) - Pins jkws-rsa at 1.4.0 to work around a dependency problem (see #448 )

# 0.0.14

### Other

- [`2945461`](https://github.com/okta/okta-oidc-js/pull/338/commits/294546166a41173b699579d7d647ba7d5cab0764) - Updates `@okta/configuration-validation` version.

# 0.0.13

### Features

- [`1ae19d1`](https://github.com/okta/okta-oidc-js/pull/320/commits/1ae19d1c08ecc41a1f31ee617ea6580c6f9804d5) - Adds configuration validation for `issuer` and `clientId` when passed into the verifier.

### Other

- [`3582f25`](https://github.com/okta/okta-oidc-js/pull/318/commits/3582f259cf74dbb45b6eed673065c2d3c03e9db3) - Rely on shared environment configuration from project root.
- [`c37b9cf`](https://github.com/okta/okta-oidc-js/pull/326/commits/c37b9cf483e17720b233800b8b5609c3383b8167) - Updates the TCK version to support new integration tests.
- [`c8b7ab5a`](https://github.com/okta/okta-oidc-js/commit/c8b7ab5aacecf5793efb6a626c0a24a78147ded9#diff-b8cfe5f7aa410fb30a335b09346dc4d2) - Migrate dependencies to project root utilizing [yarn workspaces](https://yarnpkg.com/lang/en/docs/workspaces/).
- [`6b6aca4`](https://github.com/okta/okta-oidc-js/pull/293/commits/6b6aca40787a99e021e8e06ea2f92628b9cc8855) - Migrates mocha tests to jest.
- [`0a504a6`](https://github.com/okta/okta-oidc-js/pull/223/commits/0a504a6a6d91b1c7586a48623eab3d7b0a1b926c) - Add note that this library is only for NodeJS
