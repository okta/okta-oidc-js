# 1.1.0

### Features
- [`58618c8`](https://github.com/okta/okta-oidc-js/commit/58618c8a3f519c82a41f1cce58918bc98a459a2b) - Added support for React Native 0.60.x

# 1.0.2

### Features
- [`c422f1d`](https://github.com/okta/okta-oidc-js/commit/c422f1d064acaa26f994564ffb2fa5585a83c4be#diff-2c20101038faa8ceda1dda5c3cde79d8) - Add Carthage support

# 1.0.1

### Features
- [`138f068`](https://github.com/okta/okta-oidc-js/commit/138f068a64c62f754567919d79da2c67bbdb8969#diff-2c20101038faa8ceda1dda5c3cde79d8) - Make hardware backed key store configurable on android devices 

### Other
- [`773bc9f`](https://github.com/okta/okta-oidc-js/commit/773bc9ff6bb2a440fb43439d17798224e57c0333#diff-2c20101038faa8ceda1dda5c3cde79d8) - Clears session client on android after user signs out

# 1.0.0

### Features
- [`e8948a8`](https://github.com/okta/okta-oidc-js/commit/e8948a83ce5b0f0213c96739760c219eda250598#diff-2c20101038faa8ceda1dda5c3cde79d8) - Reworks the React Native SDK. This major version upgrade removes Expo/Unimodules dependencies, replaces with Native Modules acting as wrappers around [okta-oidc-android](https://github.com/okta/okta-oidc-android) and [okta-oidc-ios](https://github.com/okta/okta-oidc-ios), and introduces new usages. For more details, refer to the commit. 

# 0.1.2

### Other

- [`2945461`](https://github.com/okta/okta-oidc-js/pull/338/commits/294546166a41173b699579d7d647ba7d5cab0764) - Updates `@okta/configuration-validation` version

# 0.1.1

### Features

- [`1d214b4`](https://github.com/okta/okta-oidc-js/pull/320/commits/1d214b4ff5f51ad59a77cda64af3adfe69cb86ca) - Adds configuration validation for `issuer`, `client_id`, and `redirect_uri` when passed into the security component.

### Other

- [`c8b7ab5a`](https://github.com/okta/okta-oidc-js/commit/c8b7ab5aacecf5793efb6a626c0a24a78147ded9#diff-b8cfe5f7aa410fb30a335b09346dc4d2) - Migrate dependencies to project root utilizing [yarn workspaces](https://yarnpkg.com/lang/en/docs/workspaces/).
- [`c26ffa0`](https://github.com/okta/okta-oidc-js/pull/239/commits/c26ffa05c6d98deb49a8bcc917b1196aae41487e) - Locks react-native dependency to `0.55`.
- [`e1eecba`](https://github.com/okta/okta-oidc-js/pull/219/commits/e1eecba3c484ba38d889e51e7c41b34ae9d6de63) - Callout [Expo](https://expo.io/) dependency.
