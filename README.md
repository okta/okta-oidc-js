# okta-oidc-js
This is a monorepo that contains Okta's OpenID Connect JavaScript resources.

[![build status](https://img.shields.io/travis/okta/okta-oidc-js/master.svg?style=flat-square)](https://travis-ci.org/okta/okta-oidc-js)

**Table of Contents**

- [Getting Started](#getting-started)
- [Packages](#packages)
  - [Monorepo](#monorepo)
  - [Versioning](#versioning)
  - [Public packages](#public-packages)
- [Configuration Reference](#configuration-reference)
- [Testing](#testing)
  - [Prerequisites](#prerequisites)
    - [Create a SPA](#create-a-spa)
    - [Create a Web App](#create-a-web-app)
  - [Test an individual package](#test-an-individual-package)
  - [Test all packages](#test-all-packages)
- [Contributing](#contributing)

## Getting Started

We use Yarn as our node package manager during package development. To install Yarn, check out their [install documentation](https://yarnpkg.com/en/docs/install).

```bash
# Clone the repo and navigate to it
git clone git@github.com:okta/okta-oidc-js.git
cd okta-oidc-js

# Install dependencies
yarn install
```

## Packages

### Monorepo

The okta-oidc-js repo is managed as a **monorepo** using [Lerna](https://lernajs.io/). Each package within the **monorepo** is a separate npm module, each with its own `package.json` and `node_modules` directory.

Packages are parsed from the `packages` property in [lerna.json](lerna.json), and adhere to this structure:

```bash
packages/
  configuration-validation
  jwt-verifier
  oidc-middleware
  okta-angular
```

### Versioning

We've configured Lerna with [independent mode](https://github.com/lerna/lerna/#independent-mode---independent), which means that each package is required to manage its own version number.

### Public packages

| Package                                                            | Status                                                                                                                                                            | Description                                                                                   |
|--------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------|
| [**configuration-validation**](/packages/configuration-validation) | [![npm version](https://img.shields.io/npm/v/@okta/configuration-validation.svg?style=flat-square)](https://www.npmjs.com/package/@okta/configuration-validation) | Standard pattern for validating configuration passed into Okta JavaScript libraries and SDKs. |
| [**jwt-verifier**](/packages/jwt-verifier)                         | [![npm version](https://img.shields.io/npm/v/@okta/jwt-verifier.svg?style=flat-square)](https://www.npmjs.com/package/@okta/jwt-verifier)                         | Easily verify JWTs from Okta                                                                  |
| [**okta-angular**](/packages/okta-angular)                         | [![npm version](https://img.shields.io/npm/v/@okta/okta-angular.svg?style=flat-square)](https://www.npmjs.com/package/@okta/okta-angular)                         | Angular support for Okta                                                                      |
| [**oidc-middleware**](/packages/oidc-middleware)                   | [![npm version](https://img.shields.io/npm/v/@okta/oidc-middleware.svg?style=flat-square)](https://www.npmjs.com/package/@okta/oidc-middleware)                   | Middleware to easily add OpenID Connect to the Node.js framework of your choice               |
| [**okta-react**](/https://github.com/okta/okta-react)                             | [![npm version](https://img.shields.io/npm/v/@okta/okta-react.svg?style=flat-square)](https://www.npmjs.com/package/@okta/okta-react)                             | React support for Okta. This SDK is located in its [own repository](https://github.com/okta/okta-react)                                                                        |
| [**okta-react-native**](https://github.com/okta/okta-react-native)               | [![npm version](https://img.shields.io/npm/v/@okta/okta-react-native.svg?style=flat-square)](https://www.npmjs.com/package/@okta/okta-react-native)               | React Native support for Okta. This SDK is located in its [own repository](https://github.com/okta/okta-react-native)                                                                 |
| [**okta-vue**](https://github.com/okta/okta-vue)                                 | [![npm version](https://img.shields.io/npm/v/@okta/okta-vue.svg?style=flat-square)](https://www.npmjs.com/package/@okta/okta-vue)                                 | Vue.js support for Okta. This SDK is located in its [own repository](https://github.com/okta/okta-vue)                                                                     |

## Configuration Reference

Each package is configured to look for environment variables based on the application type.

```bash
# Navigate into a specific package
cd packages/${packageName}

# Set the following environment variables
#
# ISSUER        - your authorization server
# CLIENT_ID     - the client ID of your app
# CLIENT_SECRET - the client secret of your app, required for the oidc-middleware package
# USERNAME      - username of app user, required for tests
# PASSWORD      - password of app user, required for tests
export ISSUER=https://{yourOktaDomain}/oauth2/default
...
```

## Testing

Since the workspace contains libraries for Single-Page and Web Applications, you will need to have created a SPA and Web App in your Okta org.

### Prerequisites

#### Create a SPA

1. Applications > Add Application
2. Select SPA
3. Add the following **login redirect URI**:
    - `http://localhost:8080/implicit/callback`
    - `http://localhost:8080/pkce/callback`
4. Click Done
5. Users > Add Person
6. Create and activate user

#### Create a Web App

1. Applications > Add Application
2. Select Web
3. Add the following **login redirect URI**:
    - `http://localhost:8080/authorization-code/callback`
4. Click Done
5. Users > Add Person
6. Create and activate user

### Test an individual package

```bash
# Navigate into a specific package
cd packages/${packageName}

# Run the test suite
yarn test
```

### Test all packages

Define the following environment variables at the project root and run the tests:

```bash
# Perform exports at the root of the repository
[okta-oidc-js]$ export ISSUER=https://{yourOktaDomain}/oauth2/default
[okta-oidc-js]$ export SPA_CLIENT_ID={SPAClientID}
[okta-oidc-js]$ export WEB_CLIENT_ID={webAppClientID}
[okta-oidc-js]$ export CLIENT_SECRET={webAppClientSecret}
[okta-oidc-js]$ export USERNAME={username}
[okta-oidc-js]$ export PASSWORD={password}

# Run all tests
[okta-oidc-js]$ yarn test
```

## Contributing

We're happy to accept contributions and PRs! Please see the [contribution guide](/CONTRIBUTING.md) to understand how to structure a contribution.
