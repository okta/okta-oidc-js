# Okta React SDK

[![npm version](https://img.shields.io/npm/v/@okta/okta-react.svg?style=flat-square)](https://www.npmjs.com/package/@okta/okta-react)
[![build status](https://img.shields.io/travis/okta/okta-oidc-js/master.svg?style=flat-square)](https://travis-ci.org/okta/okta-oidc-js)

Okta React SDK makes it easy to integrate [react-router](https://github.com/ReactTraining/react-router) with Okta's [OpenID Connect API](https://developer.okta.com/docs/api/resources/oidc.html).

This library currently supports:
  - [OAuth 2.0 Implicit Flow](https://tools.ietf.org/html/rfc6749#section-1.3.2)

## Getting Started

- If you do not already have a **Developer Edition Account**, you can create one at [https://developer.okta.com/signup/](https://developer.okta.com/signup/).
- An Okta Application, configured for Single-Page App (SPA) mode. This is done from the Okta Developer Console and you can find instructions [here](https://developer.okta.com/authentication-guide/implementing-authentication/implicit#1-setting-up-your-application). When following the wizard, use the default properties. They are are designed to work with our sample applications.

### Helpful Links

- [React Quickstart](https://facebook.github.io/react/docs/installation.html#creating-a-new-application)
  - If you don't have a React app, or are new to React, please start with this guide. It will walk you through the creation of a React app, creating routes, and other application development essentials.
- [Okta Sample Application](https://github.com/okta/samples-js-react)
  - A fully functional sample application.
- [Okta React Quickstart](https://developer.okta.com/quickstart/#/react/nodejs/express)
  - Helpful resource for integrating an existing React application into Okta.

## Installation

This library is available through [npm](https://www.npmjs.com/package/@okta/okta-react). To install it, simply add it to your project:

```bash
# npm
npm install --save @okta/okta-react

# yarn
yarn add @okta/okta-react
```

## Usage

`okta-react` works directly with `react-router` and provides four additional components:

* **Security** - (required) Allows you to supply your OpenID Connect client configuration.
* **SecureRoute** - (required) A normal `Route` except authentication is needed to render the component.
* **ImplicitCallback** - (required) Handles the implicit flow callback. This will parse the tokens and store them automatically.

## Create Routes

Here is a minimal working example. This example defines 3 routes:

* **/** - Anyone can access the home page
* **/protected** - Protected is only visible to authenticated users
* **/implicit/callback** - This is where auth is handled for you after redirection

```jsx
// src/App.js

import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Security, SecureRoute, ImplicitCallback } from '@okta/okta-react';
import Home from './Home';
import Protected from './Protected';

class App extends Component {
  render() {
    return (
      <Router>
        <Security issuer='https://{yourOktaDomain}.com/oauth2/default'
                  clientId='{clientId}'
                  redirectUri={window.location.origin + '/implicit/callback'} >
          <Route path='/' exact={true} component={Home}/>
          <SecureRoute path='/protected' component={Protected}/>
          <Route path='/implicit/callback' component={ImplicitCallback} />
        </Security>
      </Router>
    );
  }
}

export default App;
```

## Show Login and Logout Buttons
In the relevant location in your application, you will want to provide `Login` and `Logout` buttons for the user. You can show/hide the correct button by using the `auth.isAuthenticated()` method. For example:

```jsx
// src/Home.js

import React, { Component } from 'react';
import { withAuth } from '@okta/okta-react';

export default withAuth(class Home extends Component {
  constructor(props) {
    super(props);
    this.state = { authenticated: null };
    this.checkAuthentication = this.checkAuthentication.bind(this);
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
  }

  async checkAuthentication() {
    const authenticated = await this.props.auth.isAuthenticated();
    if (authenticated !== this.state.authenticated) {
      this.setState({ authenticated });
    }
  }

  async login() {
    this.props.auth.login('/');
  }

  async logout() {
    this.props.auth.logout('/');
  }

  async componentDidMount() {
    this.checkAuthentication();
  }

  async componentDidUpdate() {
    this.checkAuthentication();
  }

  render() {
    if (this.state.authenticated === null) return null;
    return this.state.authenticated ?
      <button onClick={this.logout}>Logout</button> :
      <button onClick={this.login}>Login</button>;
  }
});
```

## Use the Access Token

When your users are authenticated, your React application has an access token that was issued by your Okta Authorization server. You can use this token to authenticate requests for resources on your server or API. As a hypothetical example, let's say you have an API that provides messages for a user. You could create a `MessageList` component that gets the access token and uses it to make an authenticated request to your server.

Here is what the React component could look like for this hypothetical example:

```jsx
import fetch from 'isomorphic-fetch';
import React, { Component } from 'react';
import { withAuth } from '@okta/okta-react';

export default withAuth(class MessageList extends Component {
  constructor(props) {
    super(props)
    this.state = {
      messages: null
    }
  }

  async componentDidMount() {
    try {
      const response = await fetch('http://localhost:{serverPort}/api/messages', {
        headers: {
          Authorization: 'Bearer ' + await this.props.auth.getAccessToken()
        }
      });
      const data = await response.json();
      this.setState({ messages: data.messages });
    } catch (err) {
      // handle error as needed
    }
  }

  render() {
    if (!this.state.messages) return <div>Loading..</div>;
    const items = this.state.messages.map(message =>
      <li key={message}>{message}</li>
    );
    return <ul>{items}</ul>;
  }
});
```

## Reference

### `Security`

Security is the top-most component of okta-react. This is where most of the configuration is provided.

#### Configuration options

These options are used by `Security` to configure the [Auth](https://github.com/okta/okta-oidc-js/blob/master/packages/okta-react/src/Auth.js) object. The most commonly used options are shown here. See [Configuration Reference](https://github.com/okta/okta-auth-js#configuration-reference) for an extended set of supported options.

- **issuer** (required) - The OpenId Connect `issuer`
- **clientId** (required) - The OpenId Connect `client_id`
- **redirectUri** (required) - Where the callback handler is hosted
- **scope** *(deprecated in v1.2.3)*: Use `scopes` instead
- **scopes** *(optional)* - Reserved for custom claims to be returned in the tokens. Default: `['openid', 'email', 'profile']`. For a list of scopes and claims, please see [Scope-dependent claims](https://developer.okta.com/standards/OIDC/index.html#scope-dependent-claims-not-always-returned) for more information.
- **responseType** *(optional)* - Desired token types. Default: `['id_token', 'token']`.
For PKCE flow, this should be left undefined or set to `['code']`.
- **pkce** *(optional)* - If `true`, PKCE flow will be used
- **onAuthRequired** *(optional)* - callback function

  Accepts a callback to make a decision when authentication is required. If this is not supplied, `okta-react` redirects to Okta. This callback will receive `auth` and `history` parameters. This is triggered when:
    1. `auth.login` is called
    2. SecureRoute is accessed without authentication

#### Example

```jsx
function customAuthHandler({auth, history}) {
  // Redirect to the /login page that has a CustomLoginComponent
  history.push('/login');
}

class App extends Component {
  render() {
    return (
      <Router>
        <Security issuer='https://{yourOktaDomain}.com/oauth2/default'
                  clientId='{clientId}'
                  redirectUri={window.location.origin + '/implicit/callback'}
                  onAuthRequired={customAuthHandler} >
          <Router path='/login' component={CustomLoginComponent}>
          {/* some routes here */}
        </Security>
      </Router>
    );
  }
}
```

#### Alternate configuration using `Auth` object

When the `auth` option is passed, all other configuration options passed to `Security` will be ignored. The `Auth` object should be configured directly before being passed to `Security`.

- **auth** *(optional)* - Provide an [Auth](https://github.com/okta/okta-oidc-js/blob/master/packages/okta-react/src/Auth.js) object instead of the options above. This is the most direct way to use methods on the `Auth` object outside of your components and is helpful when integrating `okta-react` with external libraries that need access to the tokens.


#### Example with Auth object

Configure an instance of the `Auth` object and pass it to the `Security` component.

```jsx
// src/App.js

import React, { Component } from 'react';
import { Router, Route } from 'react-router-dom';
import { Security, SecureRoute, ImplicitCallback, Auth } from '@okta/okta-react';
import Home from './Home';
import Protected from './Protected';
import { createBrowserHistory } from 'history'

const history = createBrowserHistory();

const auth = new Auth({
  history,
  issuer: 'https://{yourOktaDomain}.com/oauth2/default',
  clientId: '{clientId}',
  redirectUri: window.location.origin + '/implicit/callback',
});

class App extends Component {
  render() {
    return (
      <Router history={history}>
        <Security auth={auth} >
          <Route path='/' exact={true} component={Home}/>
          <SecureRoute path='/protected' component={Protected}/>
          <Route path='/implicit/callback' component={ImplicitCallback} />
        </Security>
      </Router>
    );
  }
}

export default App;
```

#### PKCE Example

Assuming you have configured your application to allow the `Authorization code` grant type, simply pass `pkce=true` to the `Security` component. This will configure the `Auth` object to perform PKCE flow for both login and token refresh.

```jsx

class App extends Component {
  render() {
    return (
      <Router>
        <Security issuer='https://{yourOktaDomain}.com/oauth2/default'
                  clientId='{clientId}'
                  pkce={true}
                  redirectUri={window.location.origin + '/implicit/callback'}>
          <Router path='/login' component={CustomLoginComponent}>
          {/* some routes here */}
        </Security>
      </Router>
    );
  }
}
```

You may also configure an `Auth` object directly and pass it to the Security component.

```jsx

const auth = new Auth({
  issuer: 'https://{yourOktaDomain}.com/oauth2/default',
  clientId: '{clientId}',
  pkce: true,
  redirectUri: window.location.origin + '/implicit/callback',
});

class App extends Component {
  render() {
    return (
      <Router history={history}>
        <Security auth={auth} >
          <Route path='/' exact={true} component={Home}/>
          <Route path='/implicit/callback' component={ImplicitCallback} />
        </Security>
      </Router>
    );
  }
}

```

### `SecureRoute`

`SecureRoute` ensures that a route is only rendered if the user is authenticated. If the user is not authenticated, it calls `onAuthRequired` if it exists, otherwise, it redirects to Okta.

### `ImplicitCallback`

`ImplicitCallback` handles the callback after the redirect. By default, it parses the tokens from the uri, stores them, then redirects to `/`. If a `SecureRoute` caused the redirect, then the callback redirects to the secured route.

### `withAuth`

`withAuth` provides a way for components to make decisions based on auth state. It injects an `auth` prop into the component.

### `auth`

`auth` provides methods that allow managing tokens and auth state. All of the methods return Promises.

#### `auth.isAuthenticated()`

Returns `true` or `false`, depending on whether the user has an active access or id token.

#### `auth.getUser()`

Returns the result of the OpenID Connect `/userinfo` endpoint if an access token exists.

#### `auth.getIdToken()`

Retrieves the id token from storage if it exists.

#### `auth.getAccessToken()`

Retrieves the access token from storage if it exists.

#### `auth.login(fromUri, additionalParams)`

Calls `onAuthRequired` or redirects to Okta if `onAuthRequired` is undefined. This method accepts a `fromUri` parameter to push the user to after successful authentication, and an optional `additionalParams` object.

For more information on `additionalParams`, see the [`auth.redirect`](#authredirectadditionalparams) method below.

#### `auth.logout(uri)`

Terminates the user's session in Okta and clears all stored tokens. Accepts an optional `uri` parameter to push the user to after logout.

#### `auth.redirect(additionalParams)`

Performs a full-page redirect to Okta with optional request parameters.

The `additionalParams` are mapped to Okta's [`/authorize` request parameters](https://developer.okta.com/docs/api/resources/oidc#authorize). This will override any existing [configuration](#configuration-options). As an example, if you have an Okta `sessionToken`, you can bypass the full-page redirect by passing in this token. This is recommended when using the [Okta Sign-In Widget](https://github.com/okta/okta-signin-widget). Simply pass in a `sessionToken` into the `redirect` method as follows:

```jsx
auth.redirect({
  sessionToken: '{sampleSessionToken}'
});
```

> Note: For information on obtaining a `sessionToken` using the [Okta Sign-In Widget](https://github.com/okta/okta-signin-widget), please see the [`renderEl()` example](https://github.com/okta/okta-signin-widget#rendereloptions-success-error).

#### `auth.handleAuthentication()`

Parses tokens from the url and stores them.

## Development

See the [getting started](/README.md#getting-started) section for step-by-step instructions.

## Commands

| Command      | Description                        |
|--------------|------------------------------------|
| `yarn install`| Install dependencies |
| `yarn start` | Start the sample app using the SDK |
| `yarn test`  | Run unit and integration tests     |
| `yarn lint`  | Run eslint linting tests           |
