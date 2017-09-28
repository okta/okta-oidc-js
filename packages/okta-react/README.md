# Secure React Router
Secure React Router makes it easy to integrate [react-router](https://github.com/ReactTraining/react-router) with Okta's [OpenID Connect API](https://developer.okta.com/docs/api/resources/oidc.html).

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
* **Callback** - (required) Handles the implicit flow callback. This will parse the tokens and store them automatically.

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
}));
```

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
6. Start a sample server:
  - `npm start`

## Commands

| Command        | Description                        |
| -------------- | ---------------------------------- |
| `npm start`    | Start the sample app using the SDK |
| `npm test`     | Run integration tests              |
| `npm run lint` | Run eslint linting tests           |
