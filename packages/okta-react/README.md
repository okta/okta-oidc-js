[Okta Auth SDK]: https://github.com/okta/okta-auth-js
[react-router]: https://github.com/ReactTraining/react-router
[reach-router]: https://reach.tech/router
[higher-order component]: https://reactjs.org/docs/higher-order-components.html
[React Hook]: https://reactjs.org/docs/hooks-intro.html
[Auth service]: #authservice
[Migrating from 1.x]: #migrating


# Okta React SDK

[![npm version](https://img.shields.io/npm/v/@okta/okta-react.svg?style=flat-square)](https://www.npmjs.com/package/@okta/okta-react)
[![build status](https://img.shields.io/travis/okta/okta-oidc-js/master.svg?style=flat-square)](https://travis-ci.org/okta/okta-oidc-js)

Okta React SDK builds on top of the [Okta Auth SDK][]. 

This SDK is a toolkit to build Okta integration with many common "router" packages, such as [react-router][], [reach-router][], and others.

Users migrating from version 1.x of this SDK that required [react-router][] should see [Migrating from 1.x](#migrating-from-1x-to-20) to learn what changes are necessary.

With the [Okta Auth SDK][], you can:

- Login and logout from Okta using the [OAuth 2.0 API](https://developer.okta.com/docs/api/resources/oidc)
- Retrieve user information
- Determine authentication status
- Validate the current user's session

All of these features are supported by this SDK. Additionally, using this SDK, you can:

- Add "secure" routes, which will require authentication before render
- Define custom logic/behavior when authentication is required
- Provide an instance of the [Auth service][] to your components using a [React Hook][] or a [higher-order component][] 

> This SDK does not provide any UI components.

> This SDK does not currently support Server Side Rendering (SSR)

This library currently supports:

- [OAuth 2.0 Implicit Flow](https://tools.ietf.org/html/rfc6749#section-1.3.2)
- [OAuth 2.0 Authorization Code Flow](https://tools.ietf.org/html/rfc6749#section-1.3.1) with [Proof Key for Code Exchange (PKCE)](https://tools.ietf.org/html/rfc7636) 

## Getting Started

- If you do not already have a **Developer Edition Account**, you can create one at [https://developer.okta.com/signup/](https://developer.okta.com/signup/).
- An Okta Application, configured for Single-Page App (SPA) mode. This is done from the [Okta Developer Console](https://developer.okta.com/authentication-guide/implementing-authentication/implicit#1-setting-up-your-application). When following the wizard, use the default properties. They are are designed to work with our sample applications.

### Helpful Links

- [React Quickstart](https://facebook.github.io/react/docs/installation.html#creating-a-new-application)
  - If you don't have a React app, or are new to React, please start with this guide. It will walk you through the creation of a React app, creating routes, and other application development essentials.
- [Okta Sample Application](https://github.com/okta/samples-js-react)
  - A fully functional sample application built using this SDK.
- [Okta Guide: Sign users into your single-page application](https://developer.okta.com/docs/guides/sign-into-spa/react/before-you-begin/)
  - Step-by-step guide to integrating an existing React application with Okta login.

## Installation

This library is available through [npm](https://www.npmjs.com/package/@okta/okta-react). To install it, simply add it to your project:

```bash
npm install --save @okta/okta-react
```

## Usage

`okta-react` provides the means to connect a React SPA with Okta OIDC information.  Most commonly, you will connect to a router library such as [react-router][].

### React-Router components (optional)

`okta-react` provides a number of pre-built components to connect a `react-router`-based SPA to Okta OIDC information.  You can use these components directly, or use them as a basis for building your own components.
- [SecureRoute](#secureroute) - A normal `Route` except authentication is needed to render the component.  

### General components

`okta-react` provides the necessary tools to build an integration with most common React-based SPA routers.

- [Security](#security) - Allows you to supply your OpenID Connect client [configuration](#configuration-options). Includes React context providers to allow the use of the [useOktaAuth](#useoktaauth) React Hook, or the [withOktaAuth](#useoktaauth) Higher Order Component wrapper.
- [LoginCallback](#logincallback) - A simple component which handles the login callback when the user is redirected back to the application from the Okta login site.  `<LoginCallback>` accepts an optional prop `errorComponent` that will be used to format the output for any error in handling the callback.  This component will be passed an `error` prop that is an error describing the problem.  (see the `<OktaError>` component for the default rendering)

Users of routers other than `react-router` can use [useOktaAuth](#useoktaauth) to see if a `authState.isPending` is false and `authState.isAuthenticated` is true.  If both are false, you can send them to login via `authService.login(...)`.  See the implementation of `<LoginCallback>` as an example.

### Available Hooks

These hooks can be used in a component that is a descendant of a `Security` component (`<Security>` provides the necessary context).  Class-based components can gain access to the same information via the `withOktaAuth` Higher Order Component, which provides `authService` and `authState` as props to the wrapped component.

- [useOktaAuth](#useoktaauth) - gives an object with two properties:
  - `authService` - the [Auth service](#authservice) object.
  - `authState` - the [Auth State](#authstate) object that shows the current authentication state of the user to your app

### Minimal Example in React Router
#### Create Routes
This example defines 3 routes:

- **/** - Anyone can access the home page
- **/protected** - Protected is only visible to authenticated users
- **/implicit/callback** - This is where auth is handled for you after redirection

> A common mistake is to try and apply an authentication requirement to all pages, THEN add an exception for the login page.  This often fails because of how routes are evaluated in most routing packages.  To avoid this problem, declare specific routes or branches of routes that require authentication without exceptions.

#### Creating React Router Routes with class-based components

```jsx
// src/App.js

import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { SecureRoute, Security, LoginCallback } from '@okta/okta-react';
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
          <Route path='/implicit/callback' component={LoginCallback} />
        </Security>
      </Router>
    );
  }
}

export default App;
```

#### Creating React Router Routes with function-based components

```jsx
import React from 'react';
import { SecureRoute, Security, LoginCallback } from '@okta/okta-react';
import Home from './Home';
import Protected from './Protected';

const App = () => (
  <Router>
    <Security
      issuer='https://{yourOktaDomain}.com/oauth2/default'
      clientId='{clientId}'
      redirectUri={window.location.origin + '/implicit/callback'}
    >
      <Route path='/' exact={true} component={Home}/>
      <SecureRoute path='/protected' component={Protected}/>
      <Route path='/implicit/callback' component={LoginCallback} />
    </Security>
  </Router>
);

export default App;
```

#### Show Login and Logout Buttons (class-based)
```jsx
// src/Home.js

import React, { Component } from 'react';
import { withOktaAuth } from '@okta/okta-react';

export default withOktaAuth(class Home extends Component {
  constructor(props) {
    super(props);
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
  }

  async login() {
    this.props.authService.login('/');
  }

  async logout() {
    this.props.authService.logout('/');
  }

  render() {
    if (this.props.authState.isPending) return <div>Loading...</div>;
    return this.props.authState.isAuthenticated ?
      <button onClick={this.logout}>Logout</button> :
      <button onClick={this.login}>Login</button>;
  }
});
```
#### Show Login and Logout Buttons (function-based)
```jsx
// src/Home.js

const Home = () => {
  const { authService, authState } = useOktaAuth();

  const login = async () => { authService.login('/'); };
  const logout = async () => { authService.logout('/'); };

  if(authState.isPending) { 
    return <div>Loading...</div>;
  }

  if(!authState.isAuthenticated) {
    return (
      <div>
        <p>Not Logged in yet</p>
        <button onClick={login}>Login</button>
      </div>
    );
  }

  return (
    <div>
      <p>Logged in!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default Home;
```
#### Use the Access Token (class-based)
When your users are authenticated, your React application has an access token that was issued by your Okta Authorization server. You can use this token to authenticate requests for resources on your server or API. As a hypothetical example, let's say you have an API that provides messages for a user. You could create a `MessageList` component that gets the access token and uses it to make an authenticated request to your server.

Here is what the React component could look like for this hypothetical example:

```jsx
import fetch from 'isomorphic-fetch';
import React, { Component } from 'react';
import { withOktaAuth } from '@okta/okta-react';

export default withOktaAuth(class MessageList extends Component {
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
          Authorization: 'Bearer ' + this.props.authState.accessToken
        }
      });
      const data = await response.json();
      this.setState({ messages: data.messages });
    } catch (err) {
      // handle error as needed
    }
  }

  render() {
    if (!this.state.messages) return <div>Loading...</div>;
    const items = this.state.messages.map(message =>
      <li key={message}>{message}</li>
    );
    return <ul>{items}</ul>;
  }
});
```
#### Use the Access Token (function-based)
When your users are authenticated, your React application has an access token that was issued by your Okta Authorization server. You can use this token to authenticate requests for resources on your server or API. As a hypothetical example, let's say you have an API that provides messages for a user. You could create a `MessageList` component that gets the access token and uses it to make an authenticated request to your server.

Here is what the React component could look like for this hypothetical example:
```jsx
import fetch from 'isomorphic-fetch';
import React, { useState, useEffect } from 'react';
import { useOktaAuth } from '@okta/okta-react';

export default MessageList = () => {
  const { authState } = useOktaAuth();
  const [messages, setMessages] = useState(null);

  useEffect( () => { 
    if(authState.isAuthenticated) { 
      try {
        const response = await fetch('http://localhost:{serverPort}/api/messages', {
          headers: {
            Authorization: 'Bearer ' + authState.accessToken
          }
        });
        const data = await response.json();
        setMessages( data.messages );
      } catch (err) {
        // handle error as needed
      }
    }
  }, [authState] );

  if (!messages) return <div>Loading...</div>;
  const items = messages.map(message =>
    <li key={message}>{message}</li>
  );
  return <ul>{items}</ul>;
};
```
## Reference

### `Security`

`<Security>` is the top-most component of okta-react. This is where most of the configuration is provided. 

#### Configuration options

These options are used by `Security` to configure the [Auth service][]. The most commonly used options are shown here. See [Configuration Reference](https://github.com/okta/okta-auth-js#configuration-reference) for an extended set of supported options.

- **issuer** (required) - The OpenId Connect `issuer`
- **clientId** (required) - The OpenId Connect `client_id`
- **redirectUri** (required) - Where the callback handler is hosted
- **postLogoutRedirectUri** | Specify the url where the browser should be redirected after [logout](#authservicelogouturi). This url must be added to the list of `Logout redirect URIs` on the application's `General Settings` tab.
- **scopes** *(optional)* - Reserved for custom claims to be returned in the tokens. Default: `['openid', 'email', 'profile']`. For a list of scopes and claims, please see [Scope-dependent claims](https://developer.okta.com/standards/OIDC/index.html#scope-dependent-claims-not-always-returned) for more information.
- **responseType** *(optional)* - Desired token types. Default: `['id_token', 'token']`.
  - For PKCE flow, this should be left undefined or set to `['code']`.
- **pkce** *(optional)* - If `true`, Authorization Code w/PKCE Flow will be used.  See the [@okta/okta-auth-js README regarding PKCE OAuth2 Flow](https://github.com/okta/okta-auth-js#pkce-oauth-20-flow) for requirements, including any required polyfills.  If you are using the Implicit Flow, you should set `pkce: false`. Default: `true`.
- **onAuthRequired** *(optional)* - callback function. Called when authentication is required. If this is not supplied, `okta-react` redirects to Okta. This callback will receive `authService` as the first function parameter. This is triggered when:
    1. [login](#authserviceloginfromuri-additionalparams) is called
    2. A `SecureRoute` is accessed without authentication
- **onSessionExpired** *(optional)* - callback function. Called when the Okta SSO session has expired or was ended outside of the application. This SDK adds a default handler which will call [login](#authserviceloginfromuri-additionalparams) to initiate a login flow. Passing a function here will disable the default handler.
- **isAuthenticated** *(optional)* - callback function. By default, `authService` will consider a user authenticated if both `getIdToken()` and `getAccessToken()` return a value. Setting a `isAuthenticated` function on the config will skip the default logic and call the supplied function instead. The function should return a Promise and resolve to either true or false.  Note that this is only evaluated when the `auth` code has reason to think the authentication state has changed.  You can call the `authService.updateAuthState()` method to trigger a re-evaluation.
- **tokenManager** *(optional)*: An object containing additional properties used to configure the internal token manager. See [AuthJS TokenManager](https://github.com/okta/okta-auth-js#the-tokenmanager) for more detailed information.
  - `autoRenew` *(optional)*:
  By default, the library will attempt to renew expired tokens. When an expired token is requested by the library, a renewal request is executed to update the token. If you wish to  to disable auto renewal of tokens, set autoRenew to false.
  - `secure`: If `true` then only "secure" https cookies will be stored. This option will prevent cookies from being stored on an HTTP connection. This option is only relevant if `storage` is set to `cookie`, or if the client browser does not support `localStorage` or `sessionStorage`, in which case `cookie` storage will be used.
  - `storage` *(optional)*:
    Specify the type of storage for tokens.
    The types are:
    - [`localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
    - [`sessionStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage)
    - [`cookie`](https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie)

#### Example
```jsx
function customAuthHandler(authService) {
  // Redirect to the /login page that has a CustomLoginComponent
  // This example is specific to React-Router
  this.props.history.push('/login');
}

class App extends Component {
  render() {
    return (
        <Security issuer='https://{yourOktaDomain}.com/oauth2/default'
                  clientId='{clientId}'
                  redirectUri={window.location.origin + '/implicit/callback'}
                  onAuthRequired={customAuthHandler} >
          <Router path='/login' component={CustomLoginComponent}>
          {/* some routes here */}
        </Security>
    );
  }
}

export default withRouter(App);
```

#### Alternate configuration using `AuthService` instance

When the `authService` option is passed, all other configuration options passed to `Security` will be ignored.

- **authService** *(optional)* - Provide an [Auth service][] instance instead of the options above. This is the most direct way to use methods on the [Auth service][] instance *outside* of your components and is helpful when integrating `okta-react` with external libraries that need access to the tokens.

#### Example with AuthService object

Configure an instance of the [Auth service][] and pass it to the `Security` component.

```jsx
// src/App.js

import React, { Component } from 'react';
import { Router, Route } from 'react-router-dom';
import { AuthService, Security, LoginCallback, SecureRoute } from '@okta/okta-react';
import Home from './Home';
import Protected from './Protected';

const authService = new AuthService({
  issuer: 'https://{yourOktaDomain}.com/oauth2/default',
  clientId: '{clientId}',
  redirectUri: window.location.origin + '/implicit/callback',
});

class App extends Component {
  render() {
    return (
      <Router>
        <Security authService={authService} >
          <Route path='/' exact={true} component={Home}/>
          <SecureRoute path='/protected' component={Protected}/>
          <Route path='/implicit/callback' component={LoginCallback} />
        </Security>
      </Router>
    );
  }
}

export default App;
```

#### PKCE Example

Assuming you have configured your application to allow the `Authorization code` grant type, simply pass `pkce=true` to the `Security` component. This will configure the [Auth service][] to perform PKCE flow for both login and token refresh.  

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

You may also configure an instance of the [Auth service][] directly and pass it to the Security component.

```jsx

const authService = new AuthService({
  issuer: 'https://{yourOktaDomain}.com/oauth2/default',
  clientId: '{clientId}',
  pkce: true,
  redirectUri: window.location.origin + '/implicit/callback',
});

class App extends Component {
  render() {
    return (
      <Router>
        <Security authService={authService} >
          <Route path='/' exact={true} component={Home}/>
          <Route path='/implicit/callback' component={LoginCallback} />
        </Security>
      </Router>
    );
  }
}

```

### `SecureRoute`

`SecureRoute` ensures that a route is only rendered if the user is authenticated. If the user is not authenticated, it calls `onAuthRequired` if it exists, otherwise, it redirects to Okta.
  
`SecureRoute` integrates with `react-router`.  Other routers will need their own methods to ensure authentication using the hooks/HOC props provided by this SDK.

### `LoginCallback`

`LoginCallback` handles the callback after the redirect to and back from the Okta-hosted login page. By default, it parses the tokens from the uri, stores them, then redirects to `/`. If a `SecureRoute` caused the redirect, then the callback redirects to the secured route. For more advanced cases, this component can be copied to your own source tree and modified as needed.

### `withOktaAuth`

`withOktaAuth` is a [higher-order component][] which injects an `authService` prop and an `authState` prop into the component. Function-based components will want to use the `useOktaAuth` hook instead.  These props provide a way for components to make decisions based on auth state or to call [Auth Service][] methods, such as `.login()` or `.logout()`.  Components wrapped in `withOktaAuth()` need to be a child or descendant of a `<Security>` component to have the necessary context.

### `useOktaAuth`

`useOktaAuth()` is a React Hook that returns an object containing the [authState](#authState) object and the [authService](#authService) object.  Class-based components will want to use the [withOktaAuth](#withoktaauth) HOC instead.  Using this hook will trigger a re-render when the authState object updates.  Components calling this hook need to be a child or descendant of a `<Security>` component to have the necessary context.

#### Using `useOktaAuth`
```jsx
import React from 'react';
import { useOktaAuth } from '@okta/okta-react';

export default MyComponent = () => { 
  const { authState } = useOktaAuth();
  if( authState.isPending ) { 
    return <div>Loading...</div>;
  }
  if( authState.isAuthenticated ) { 
    return <div>Hello User!</div>;
  }
  return <div>You need to login</div>;
};
```

### `authState`

Components get this object as a passed prop using the [withOktaAuth](#withoktaauth) HOC or using the [useOktaAuth](#useoktauth) React Hook.  The `authState` object provides synchronous access to the following properties:
- `.isPending` 
    - true in the time after page load (first render) but before the asynchronous methods to see if the tokenManager is aware of a current authentication.  
- `.isAuthenticated`
    - true if the user is considered authenticated.  Normally this is true if either an idToken or an accessToken is present in the tokenManager, but this behavior can be overriden if you passed an `isAuthenticated` callback to the Security component (or to the Auth instance you passed to the Security component)
- `.idToken`
    - the JWT idToken for the currently authenticated user (if provided by the `scopes`)
- `.accessToken`
    - the JWT accessToken for the currently authenticated user (if provided by the `scopes`)
- `.error` 
    - contains the error returned if an error occurs in `authService.handleAuthentication()` or `authService.updateAuthState()` (which includes any errors encountered when calling the optional `isAuthRequired()` callback provided to `<Security>`)

### `authService`

Components can get this object as a passed prop using the [withOktaAuth](#withoktaauth) HOC or using the [useOktaAuth](#useoktaauth) React Hook.  The `authService` object provides methods for managing tokens and auth state. 

#### `authService.getAuthState()`

(synchronous method) Returns the last known `authState`.  The [authState](#authstate) is re-evaluated when `authService.updateAuthState()` is called.  View logic using the `<Security>` component and either the `useOktaAuth()` hook or the `withOktaAuth()` HOC will automatically receive the updated `authState`.  Other code will need to subscribe to `authStateChange` events using the [`authService.on()`](#authserviceon) method.

#### `authService.getUser()`

(async method) Resolves with the result of the OpenID Connect `/userinfo` endpoint if an access token exists.

#### `authService.getIdToken()`

(async method) Resolves with the id token retrieved from storage if it exists.  Devs should prefer to consult the synchronous results emitted from subscribing to the `authStateChange` event using [authService.on()](#authserviceon)

#### `authService.getAccessToken()`

(async method) Resolves with the access token retrieved from storage if it exists.  Devs should prefer to consult the synchronous results emitted from subscribing to the `authStateChange` event.

#### `authService.login(fromUri, additionalParams)`

(async method) Resolves with the result of calling the optional `onAuthRequired` passed to `<Security>` or redirects to Okta if `onAuthRequired` is undefined. This method accepts a `fromUri` parameter to push the user to after successful authentication, and an optional `additionalParams` object.

For more information on `additionalParams`, see the [`authService.redirect`](#authredirectadditionalparams) method below.

#### `authService.logout(uri)`

(async method) Terminates the user's session in Okta and clears all stored tokens. Accepts an optional `uri` parameter to push the user to after logout.

#### `authService.redirect(additionalParams)`

(async method) Performs a full-page redirect to Okta with optional request parameters.

The `additionalParams` are mapped to Okta's [`/authorize` request parameters](https://developer.okta.com/docs/api/resources/oidc#authorize). This will override any existing [configuration](#configuration-options). As an example, if you have an Okta `sessionToken`, you can bypass the full-page redirect by passing in this token. This is recommended when using the [Okta Sign-In Widget](https://github.com/okta/okta-signin-widget). Simply pass in a `sessionToken` into the `redirect` method as follows:

```jsx
authService.redirect({
  sessionToken: '{sampleSessionToken}'
});
```

> Note: For information on obtaining a `sessionToken` using the [Okta Sign-In Widget](https://github.com/okta/okta-signin-widget), please see the [`renderEl()` example](https://github.com/okta/okta-signin-widget#rendereloptions-success-error).

#### `authService.handleAuthentication()`

(async method) Parses tokens from the url and stores them.  Done when handling a redirect back to the application from the issuer.  See the `LoginCallback` component for an example of use.

### `authService.setFromUri(uri)`

(synchronous method) Store the current URL state before a redirect occurs.  Called internally by `authService.login`.  If a relative path is passed it will be converted to an absolute URI before storage.

#### `authService.getFromUri()`

(synchronous method) Returns the stored URI string stored by `setFromUri` and removes it from storage.  See the `LoginCallback` component for an example of use.  

#### `authService.getTokenManager()`

(async method) Resolves with the internal [TokenManager](https://github.com/okta/okta-auth-js#tokenmanager).

#### `authService.updateAuthState()`

(async method) Triggers a re-evaluation of whether a user is considered authenticated.  Might be need to be triggered manually for users that pass overrides to `onAuthRequired` to the Security component or to the `Auth` constructor.  Does NOT perform a login, simply re-evaluates the current authenticated status. An 'authStateChange' event is emitted once the re-evaluation is complete. 

#### `authService.on(eventName, callback)`

(synchronous method) Subscribes a callback that will be called when the named event happens.  Returns a function to remove the callback from the list of subscribers.  The `<Security>` component manages this and supplies updates via the [withOktaAuth()](#withoktauth) HOC and the [useAuthState()](#useoktaauth) React Hook, so Devs normally don't need to subscribe to any events and instead rely on the re-renders that automatically trigger from changes in props/hook state.

Known events:
- 'authStateChange' - Emitted when the authState is re-evalated.  The callback will be called when the `authState` has been updated.  The updated [authState](#authstate) MUST be read from [authService.getAuthState](#authservicegetauthstate) after the `authStateChange` event to get the new state.

#### `authService.clearAuthState()`

(synchronous method) Resets the authentication status to pending and forgets any tokens `auth` is aware of.  Does NOT perform a logout, nor does it trigger a login.  Use [authService.logout()](#authservicelogouturi) or [authService.login()](#authserviceloginfromuri-additionalparams) for those results.

## Migrating between versions

### Migrating from 1.x to 2.0

The 1.x series for this SDK required the use of [react-router][].  These instructions assume you are moving to version 2.0 of this SDK and are still using React Router (v5+)

#### Replacing Security component

The `<Security>` component is now a generic (not router-specific) provider of Okta context for child components and is required to be an ancestor of any components using the `useOktaAuth` hook, as well as any components using the `withOktaAuth` Higher Order Component.

`Auth.js` has been renamed `AuthService.js`.

The `auth` prop to the `<Security>` component is now `authService`.  The other prop options to `<Security>` have not changed from the 1.x series to the 2.0.x series

#### Replacing the withAuth Higher-Order Component wrapper

This SDK now provides authentication information via React Hooks (see [useOktaAuth](#useOktaAuth)).  If you want a component to receive the auth information as a direct prop to your class-based component, you can use the `withOktaAuth` wrapper where you previously used the `withAuth` wrapper.  The exact props provided have changed to allow for synchronous access to authentication information.  In addition to the `authService` object prop (previously `auth`), there is also an `authState` object prop that has properties for the current authentication state.  

#### Replacing `.isAuthenticated()`, `.getAccessToken()`, and `.getIdToken()` inside a component

Two complications of the 1.x series of this SDK have been simplified in the 2.x series:
- These functions were asynchronous (because the retrieval layer underneath them can be asynchronous) which made avoiding race conditions in renders/re-renders tricky.
- Recognizing when authentication had yet to be decided versus when it had been decided and was not authenticated was an unclear difference between `null`, `true`, and `false`.

To resolve these the `authService` object holds the authentication information and provides it synchronously (following the first async determination) as an `authState` object.  While waiting on that first determination, the `authState` object has an explicit `.isPending` property.  When the authentication updates the [authService](#authservice) object will emit an `authStateChange` event after which a new [authState](#authstate) object is available.

Any component that was using `withAuth()` to get the `auth` object and called the properties above has two options to migrate to the new SDK:
1. Replace the use of `withAuth()` with [withOktaAuth()](#withoktaauth), and replace any of these asynchronous calls to the `auth` methods with the values of the related [authState](#authstate) properties. 
**OR**
2. Remove the use of `withAuth()` and instead use the [useOktaAuth()](#useoktaauth) React Hook to get the [authService](#authservice) and [authState](#authstate) objects.  Any use of the `auth` methods (`.isAuthenticated()`, `.getAccessToken()`, and `.getIdToken()`) should change to use the already calculated properties of [authState](#authstate).

To use either of these options, your component must be a descendant of a `<Security>` component, in order to have the necessary context.

These changes should result in less complexity within your components as these values are now syncrhonously available after the initial determination.

If you need access to the `authService` instance directly, it is provided by [withOktaAuth()](#withoktaauth) as a prop or is available via the [useOktaAuth()](#useoktaauth) React Hook.  You can use the examples in this README to see how to use [authService](#authservice) to perform common tasks such as login/logout, or inspect the provided `<LoginCallback>` component to see an example of the use of the `authService` managing the redirect from the Okta site.  

#### Updating your ImplicitCallback component

- If you were using the provided ImplicitCallback component, you can replace it with `LoginCallback` 
- If you were using a modified version of the provided ImplicitCallback component, you will need to examine the new version to see the changes.  It may be easier to start with a copy of the new LoginCallback component and copy your changes to it.  If you want to use a class-based version of LoginCallback, wrap the component in the [withOktaAuth][] HOC to have the [authService](#authservice) and [authState](#authstate) properties passed as props.
- If you had your own component that handled the redirect-back-to-the-application after authentication, you should examine the new LoginCallback component as well as the notes in this migration section about the changes to `.isAuthenticated()`, `.getAccessToken()`, and `.getIdToken()`.

## Contributing

We welcome contributions to all of our open-source packages. Please see the [contribution guide](https://github.com/okta/okta-oidc-js/blob/master/CONTRIBUTING.md) to understand how to structure a contribution.

## Development

### Installing dependencies for contributions

We use [yarn](https://yarnpkg.com) for dependency management when developing this package:

```bash
yarn install
```

### Commands

| Command      | Description                        |
|--------------|------------------------------------|
| `yarn install`| Install dependencies |
| `yarn start` | Start the sample app using the SDK |
| `yarn test`  | Run unit and integration tests     |
| `yarn lint`  | Run eslint linting tests           |
