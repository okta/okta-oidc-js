# Okta React SDK

[![npm version](https://img.shields.io/npm/v/@okta/okta-react.svg?style=flat-square)](https://www.npmjs.com/package/@okta/okta-react)
[![build status](https://img.shields.io/travis/okta/okta-oidc-js/master.svg?style=flat-square)](https://travis-ci.org/okta/okta-oidc-js)

Okta React SDK makes it easy to integrate [react-router](https://github.com/ReactTraining/react-router) with Okta's [OpenID Connect API](https://developer.okta.com/docs/api/resources/oidc.html).

This library currently supports:
  - [OAuth 2.0 Implicit Flow](https://tools.ietf.org/html/rfc6749#section-1.3.2)

## Prerequisites
* If you do not already have a **Developer Edition Account**, you can create one at [https://developer.okta.com/signup/](https://developer.okta.com/signup/).
* If you don't have a React app, or are new to React, please continue with the [React Quickstart](https://facebook.github.io/react/docs/installation.html#creating-a-new-application) guide. It will walk you through the creation of a React app, creating routes, and other application development essentials.

## Add an OpenID Connect Client in Okta
In Okta, applications are OpenID Connect clients that can use Okta Authorization servers to authenticate users.  Your Okta Org already has a default authorization server, so you just need to create an OIDC client that will use it.
* Log into the Okta Developer Dashboard, click **Applications** then **Add Application**.
* Choose **Single Page App (SPA)** as the platform, then submit the form the default values, which should look like this:

| Setting             | Value                                        |
| ------------------- | -------------------------------------------- |
| App Name            | My SPA App                                   |
| Base URIs           | http://localhost:{port}                      |
| Login redirect URIs | http://localhost:{port}/implicit/callback    |
| Grant Types Allowed | Implicit                                     |

After you have created the application there are two more values you will need to gather:

| Setting       | Where to Find                                                                  |
| ------------- | ------------------------------------------------------------------------------ |
| Client ID     | In the applications list, or on the "General" tab of a specific application.    |
| Org URL       | On the home screen of the developer dashboard, in the upper right.             |


These values will be used in your React application to setup the OpenID Connect flow with Okta.

## Installation

This library is available through [npm](https://www.npmjs.com/package/@okta/okta-react). To install it, simply add it to your project:

```bash
npm install --save @okta/okta-react
```

## Usage

`okta-react` works directly with `react-router` and provides four additional components:

* **Security** - (required) Allows you to supply your OpenID Connect client configuration.
* **SecureRoute** - (required) A normal `Route` except authentication is needed to render the component.
* **ImplicitCallback** - (required) Handles the implicit flow callback. This will parse the tokens and store them automatically.

## Create Routes

Here are the minimum requirements for a working example:

* **/** - Anyone can access the home page
* **/protected** - Protected is only visible to authenticated users
* **/implicit/callback** - This is where auth is handled for you after redirection

```typescript
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
                  client_id='{clientId}'
                  redirect_uri={window.location.origin + '/implicit/callback'} >
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

```typescript
// src/Home.js

import React, { Component } from 'react';
import { withAuth } from '@okta/okta-react';

export default withAuth(class Home extends Component {
  constructor(props) {
    super(props);
    this.state = { authenticated: null };
    this.checkAuthentication = this.checkAuthentication.bind(this);
    this.checkAuthentication();
  }

  async checkAuthentication() {
    const authenticated = await this.props.auth.isAuthenticated();
    if (authenticated !== this.state.authenticated) {
      this.setState({ authenticated });
    }
  }

  componentDidUpdate() {
    this.checkAuthentication();
  }

  render() {
    if (this.state.authenticated === null) return null;
    return this.state.authenticated ?
      <button onClick={this.props.auth.logout}>Logout</button> :
      <button onClick={this.props.auth.login}>Login</button>;
  }
});
```

## Use the Access Token

When your users are authenticated, your React application has an access token that was issued by your Okta Authorization server. You can use this token to authenticate requests for resources on your server or API. As a hypothetical example, let's say you have an API that provides messages for a user. You could create a `MessageList` component that gets the access token and uses it to make an authenticated request to your server.

Here is what the React component could look like for this hypothetical example:

```typescript
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

- **issuer** (required) - The OpenId Connect `issuer`
- **client_id** (required) - The OpenId Connect `client_id`
- **redirect_uri** (required) - Where the callback handler is hosted
- **scope** *(optional)*: Reserved or custom claims to be returned in the tokens
- **response_type** *(optional)*: Desired token grant types
- **onAuthRequired** (optional)
- **auth** (optional) - Provide an Auth object instead of the options above. This is helpful when integrating `okta-react` with external libraries that need access to the tokens.

  Accepts a callback to make a decision when authentication is required. If this is not supplied, `okta-react` redirects to Okta. This callback will receive `auth` and `history` parameters. This is triggered when:
    1. `auth.login` is called
    2. SecureRoute is accessed without authentication

#### Example

```typescript
function customAuthHandler({auth, history}) {
  // Redirect to the /login page that has a CustomLoginComponent
  history.push('/login');
}

class App extends Component {
  render() {
    return (
      <Router>
        <Security issuer='https://{yourOktaDomain}.com/oauth2/default'
                  client_id='{clientId}'
                  redirect_uri={window.location.origin + '/implicit/callback'}
                  onAuthRequired={customAuthHandler} >
          <Router path='/login' component={CustomLoginComponent}>
          {/* some routes here */}
        </Security>
      </Router>
    );
  }
}
```

#### Example with Auth object

```typescript
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
  client_id: '{clientId}',
  redirect_uri: window.location.origin + '/implicit/callback',
  onAuthRequired: ({history}) => history.push('/login')
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

#### `auth.login(fromUri)`

Calls `onAuthRequired` or redirects to Okta if `onAuthRequired` is undefined. This method accepts a `fromUri` parameter to push the user to after successful authentication.

#### `auth.logout(uri)`

Terminates the user's session in Okta and clears all stored tokens. Accepts an optional `uri` parameter to push the user to after logout.

#### `auth.redirect({sessionToken})`

Performs a redirect to Okta with an optional `sessionToken`.

```typescript
auth.redirect({
  sessionToken: '{sampleSessionToken}'
});
```

#### `auth.handleAuthentication()`

Parses tokens from the url and stores them.

## Development

1. Clone the repo:
   - `git clone git@github.com:okta/okta-oidc-js.git`
2. Install the dependencies with lerna (install with `npm i lerna -g`):
   - `lerna bootstrap`
3. Navigate into the `okta-react` package:
   - `cd packages/okta-react`
4. Make your changes to `okta-react/src/`
5. Set the following environment variables:
   - `ISSUER` - your authorization server
   - `CLIENT_ID` - the client id of your app
   - `USERNAME` - username of org user, needed if you want to run tests
   - `PASSWORD` - password of org user, needed if you want to run tests
6. Start a sample server:
   - `npm start`

## Commands

| Command        | Description                        |
| -------------- | ---------------------------------- |
| `npm start`    | Start the sample app using the SDK |
| `npm test`     | Run integration tests              |
| `npm run lint` | Run eslint linting tests           |
