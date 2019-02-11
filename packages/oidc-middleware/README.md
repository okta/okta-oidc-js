[<img src="https://devforum.okta.com/uploads/oktadev/original/1X/bf54a16b5fda189e4ad2706fb57cbb7a1e5b8deb.png" align="right" width="256px"/>](https://devforum.okta.com/)

[![Support](https://img.shields.io/badge/support-developer%20forum-blue.svg)][devforum]
[![npm version](https://img.shields.io/npm/v/@okta/oidc-middleware.svg?style=flat-square)](https://www.npmjs.com/package/@okta/oidc-middleware)
[![build status](https://img.shields.io/travis/okta/okta-oidc-js/master.svg?style=flat-square)](https://travis-ci.org/okta/okta-oidc-js)

# Okta NodeJS OIDC Middleware

* [Release status](#release-status)
* [Need help?](#need-help)
* [Getting started](#getting-started)
* [Usage guide](#usage-guide)
* [API reference](#api-reference)
* [Upgrading](#upgrading)
* [Contributing](#contributing)

This package makes it easy to get your users logged in with Okta using OpenId Connect (OIDC).  It enables your Express application to participate in the [authorization code flow][auth-code-docs] flow by redirecting the user to Okta for authentication and handling the callback from Okta.  Once this flow is complete, a local session is created and the user context is saved for the duration of the session.

## Release status

This library uses semantic versioning and follows Okta's [library version policy](https://developer.okta.com/code/library-versions/).

:heavy_check_mark: The current stable major version series is: 2.x

| Version | Status                    |
| ------- | ------------------------- |
| 2.x     | :heavy_check_mark: Stable |
| 1.x     | :x: Deprecated            |
| 0.x     | :x: Retired               |

The latest release can always be found on the [releases page][github-releases].

## Need help?

If you run into problems using the SDK, you can:

* Ask questions on the [Okta Developer Forums][devforum]
* Post [issues][github-issues] here on GitHub (for code errors)

## Getting started

See [Upgrading](#upgrading) for information on updating to the latest version of the library.

Installing the Okta Node JS OIDC Middlware in your project is simple.

```sh
# npm
npm install --save @okta/oidc-middleware

# yarn
yarn add @okta/oidc-middleware
```

You'll also need:

* An Okta account, called an _organization_ (sign up for a free [developer organization](https://developer.okta.com/signup) if you need one).
* An OIDC application in your Org, configured for Web mode.  If you are new to Okta or this flow, we suggest following the [Express.js Quickstart][express-quickstart].
* This integration depends on sessions to store user information. Ensure the [express-session middleware](https://github.com/expressjs/session) is added before you add `ExpressOIDC`.  By default, the session middleware uses a MemoryStore, which is not designed for production use. Use [another session store](https://github.com/expressjs/session#compatible-session-stores) for production.

## Usage guide

Below is a terse Express application that examples the basic usage of this library.  If you'd like to clone a complete example, please see the [Okta Express Samples Repository](https://github.com/okta/samples-nodejs-express-4).

```javascript
const express = require('express');
const session = require('express-session');
const { ExpressOIDC } = require('@okta/oidc-middleware');

const app = express();
const oidc = new ExpressOIDC({
  issuer: 'https://{yourOktaDomain}/oauth2/default',
  client_id: '{clientId}',
  client_secret: '{clientSecret}',
  appBaseUrl: '{appBaseUrl}',
  scope: 'openid profile'
});

app.use(session({
  secret: 'this-should-be-very-random',
  resave: true,
  saveUninitialized: false
}));
app.use(oidc.router);

app.get('/', (req, res) => {
  if (req.userContext) {
    res.send(`
      Hello ${req.userContext.userinfo.name}!
      <form method="POST" action="/logout">
        <button type="submit">Logout</button>
      </form>
    ');
  } else {
    res.send('Please <a href="/login">login</a>');
  }
});

app.get('/protected', oidc.ensureAuthenticated(), (req, res) => {
  res.send('Top Secret');
});

oidc.on('ready', () => {
  app.listen(3000, () => console.log('app started'));
});

oidc.on('error', err => {
  // An error occurred while setting up OIDC, during token revokation, or during post-logout handling
});
```

## API reference

* [ExpressOIDC API](#expressoidc-api)
  * [new ExpressOIDC(config)](#new-expressoidcconfig)
  * [oidc.router](#oidcrouter)
  * [oidc.on('ready', callback)](#oidconready-callback)
  * [oidc.on('error', callback)](#oidconerror-callback)
  * [oidc.ensureAuthenticated({ redirectTo?: '/uri' })](#oidcensureauthenticated-redirectto-uri-)
  * [oidc.forceLogoutAndRevoke()](#oidcforcelogoutandrevoke)
  * [req.isAuthenticated()](#reqisauthenticated)
  * [req.logout()](#reqlogout)
  * [req.userContext](#requsercontext)
* [Customization](#customization)
  * [Customizing Routes](#customizing-routes)
  * [Using a Custom Login Page](#using-a-custom-login-page)
  * [Extending the User](#extending-the-user)
  * [Using Proxy Servers](#using-proxy-servers)

### ExpressOIDC API

#### new ExpressOIDC(config)

To configure your OIDC integration, create an instance of `ExpressOIDC` and pass options. Most apps will need this basic configuration:

```javascript
const { ExpressOIDC } = require('@okta/oidc-middleware');

const oidc = new ExpressOIDC({
  issuer: 'https://{yourOktaDomain}/oauth2/default',
  client_id: '{clientId}',
  client_secret: '{clientSecret}',
  appBaseUrl: 'https://{yourdomain}',
  scope: 'openid profile'
});
```

Required config:

* **issuer** - The OIDC provider (e.g. `https://{yourOktaDomain}/oauth2/default`)
* **client_id** - An id provided when you create an OIDC app in your Okta Org
* **client_secret** - A secret provided when you create an OIDC app in your Okta Org
* **appBaseUrl** - The base scheme, host, and port (if not 80/443) of your app, not including any path (e.g. http://localhost:3000, not http://localhost:3000/ )  

Optional config:

* **loginRedirectUri** - The URI for your app that Okta will redirect users to after sign in to create the local session.  Locally, this is usually `http://localhost:3000/authorization-code/callback`. When deployed, this should be `https://{yourProductionDomain}/authorization-code/callback`.  This will default to `{appBaseUrl}{routes.loginCallback.path}` if `appBaseUrl` is provided, or the (deprecated) `redirect_uri` if `appBaseUrl` is not provided.  Unless your redirect is to a different application, it is recommended to NOT set this parameter and instead set `appBaseUrl` and (if different than the default of `/authorization-code/callback`) `routes.loginCallback.path`.
* **logoutRedirectUri** - The URI for your app that Okta will redirect users to after sign out to clean up the local session.  Locally this is usually `http://localhost:3000/logout/callback`.  When deployed, this should be `https://{yourProductionDomain}/logout/callback`.  This will default to `{appBaseUrl}{routes.logoutCallback.path}` if `appBaseUrl` is provided.  Unless your redirect is to a different application, it is recommended to NOT set this parameter and instead set `appBaseUrl` and (if different than the default of `/logout/callback`) `routes.logoutCallback.path`.
* **response_type** - Defaults to `code`
* **scope** - Defaults to `openid`, which will only return the `sub` claim. To obtain more information about the user, use `openid profile`. For a list of scopes and claims, please see [Scope-dependent claims](https://developer.okta.com/standards/OIDC/index.html#scope-dependent-claims-not-always-returned) for more information.
* **routes** - Allows customization of the generated routes. See [Customizing Routes](#customizing-routes) for details.
* **maxClockSkew** - Defaults to 120. This is the maximum difference allowed between your server's clock and Okta's in seconds. Setting this to 0 is not recommended, because it increases the likelihood that valid jwts will fail verification due to `nbf` and `exp` issues.
* **timeout** - Defaults to 10000 milliseconds. The HTTP max timeout for any requests to the issuer.  If a timeout exception occurs you can catch it with the `oidc.on('error', fn)` handler.

#### oidc.router

This should be added to your express app to attach the login and callback routes:

```javascript
const { ExpressOIDC } = require('@okta/oidc-middleware');
const express = require('express');

const app = express();
const oidc = new ExpressOIDC({ /* options */ });

app.use(oidc.router);
```

The router is required in order for `ensureAuthenticated`, and `isAuthenticated`, and `forceLogoutAndRevoke` to work and adds the following routes:

* `/login` - redirects to the Okta sign-in page by default
* `/authorization-code/callback` - processes the OIDC response, then attaches userinfo to the session
* `/logout` - revokes any known Okta access/refresh tokens, then redirects to the Okta logout endpoint which then redirects back to a callback url for logout specified in your Okta settings
* `/logout/callback` - the default callback url that Okta will redirect back to after the session at Okta is ended
The paths for these generated routes can be customized using the `routes` config, see [Customizing Routes](#customizing-routes) for details.

#### oidc.on('ready', callback)

The middleware must retrieve some information about your client before starting the server. You **must** wait until ExpressOIDC is ready to start your server.

```javascript
oidc.on('ready', () => {
  app.listen(3000, () => console.log('app started'));
});
```

#### oidc.on('error', callback)

This is triggered if an error occurs
* while ExpressOIDC is trying to start
* if an error occurs while calling the Okta `/revoke` service endpoint on the users tokens while logging out
* if the state value for a logout does not match the current session

```javascript
oidc.on('error', err => {
  // An error occurred 
});
```

#### oidc.ensureAuthenticated({ redirectTo?: '/uri' })

Use this to protect your routes. If not authenticated, this will redirect to the login route and trigger the authentication flow. If the request prefers JSON then a 401 error response will be sent.

```javascript
app.get('/protected', oidc.ensureAuthenticated(), (req, res) => {
  res.send('Protected stuff');
});
```

The `redirectTo` option can be used to redirect the user to a specific URI on your site after a successful authentication callback.

#### oidc.forceLogoutAndRevoke()

Use this to define a route that will force a logout of the user from Okta and the local session.  Because logout involves redirecting to Okta and then to the logout callback URI, the body of this route will never directly execute.  It is recommended to not perform logout on GET queries as it is prone to attacks and/or prefetching misadventures.

```javascript
app.post('/forces-logout', oidc.forceLogoutAndRevoke(), (req, res) => {
  // Nothing here will execute, after the redirects the user will end up wherever the `routes.logoutCallback.afterCallback` specifies (default `/`)
});
```

#### req.isAuthenticated()

This allows you to determine if a user is authenticated.

```javascript
app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    res.send('Logged in');
  } else {
    res.send('Not logged in');
  }
});
```

#### req.logout()

This allows you to end the local session while leaving the user logged in to Okta, meaning that if they attempt to reauthenticate to your app they will not be prompted to re-enter their credentials unless their Okta session has expired.  To end the Okta session, POST to the autogenerated `/logout` route or send the user to a route you defined using the `oidc.forceLogoutAndRevoke()` method above.

```javascript
app.get('/local-logout', (req, res) => {
  req.logout();
  res.redirect('/');
});
```

#### req.userContext

This provides information about the authenticated user and contains the requested tokens. The `userContext` object contains two keys:

1. `userinfo`: The response from the [userinfo endpoint of the authorization server](https://developer.okta.com/docs/api/resources/oidc.html#get-user-information).
2. `tokens`: [TokenSet object](https://github.com/panva/node-openid-client#tokenset) containing the `accessToken`, `idToken`, and/or `refreshToken` requested from the authorization server.

> Note: Claims reflected in the userinfo response and token object depend on the scope requested (see scope option above).

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

### Customization

#### Customizing Routes

If you need to modify the default login and callback routes, the `routes` config option is available.

```javascript
const oidc = new ExpressOIDC({
  // ...
  routes: {
    login: {
      path: '/different/login'
    },
    loginCallback: {
      path: '/different/callback',
      handler: (req, res, next) => {
        // Perform custom logic before final redirect, then call next()
      },
      afterCallback '/home'
    },
    logout: {
      path: '/different/logout'
    },
    logoutCallback: {
      path: '/different/logout-callback',
      afterCallback: '/thank-you'
    }
  }
});
```

* **`loginCallback.afterCallback`** - Where the user is redirected to after a successful authentication callback, if no `redirectTo` value was specified by `oidc.ensureAuthenticated()`. Defaults to `/`.
* **`loginCallback.failureRedirect`** - Where the user is redirected to after authentication failure. Defaults to a page which just shows error message.
* **`loginCallback.handler`** - A function that is called after a successful authentication callback, but before the final redirect within your application. Useful for requirements such as conditional post-authentication redirects, or sending data to logging systems.
* **`loginCallback.path`** - The URI that this library will host the login callback handler on. Defaults to `/authorization-code/callback`.  Must match a value from the Login Redirect Uri list from the Okta console for this application.
* **`login.path`** - The URI that redirects the user to the Okta authorize endpoint. Defaults to `/login`.
* **`logout.path`** - The URI that redirects the user to the Okta logout endpoint.  Defaults to `/logout`.
* **`logoutCallback.afterCallback`** - Where the user is redirected to after a successful logout callback, if no `redirectTo` value was specified by `oidc.forceLogoutAndRevoke()`.  Defaults to `/`.
* **`logoutCallback.path`** - The URI that this library will host the logout callback handler on.  Defaults to `/logout/callback`.  Must match a value from the Logout Redirect Uri list from the Okta console for this application.

#### Using a Custom Login Page

By default the end-user will be redirected to the Okta Sign-In Page when authentication is required, this page is hosted on your Okta Org domain.  It is possible to host this experience within your own application by installing the [Okta Sign-In Widget](https://github.com/okta/okta-signin-widget) into a page in your application.  Please refer to the [test example file](test/e2e/harness/views/login.ejs) for an example of how the widget should be configured for this use case.

Once you have created your login page, you can use the `viewHandler` option to intercept the login page request and render your own custom page:

```javascript

const oidc = new ExpressOIDC({
  { /* options */ }
  routes: {
    login: {
      viewHandler: (req, res, next) => {
        const baseUrl = url.parse(baseConfig.issuer).protocol + '//' + url.parse(baseConfig.issuer).host;
        // Render your custom login page, you must create this view for your application and use the Okta Sign-In Widget
        res.render('login', {
          csrfToken: req.csrfToken(),
          baseUrl: baseUrl
        });
      }
    }
  }
});
```

#### Extending the User

To add additional data about a user from your database, we recommend adding middleware to extend `req`.

```javascript
const { ExpressOIDC } = require('@okta/oidc-middleware');
const express = require('express');
const session = require('express-session');

const app = express();
app.use(session({ /* options */ }));
const oidc = new ExpressOIDC({ /* options */ });
app.use(oidc.router);

function addUserContext(req, res, next) {
  if (!req.userContext) {
    return next();
  }

  // request additional info from your database
  User.findOne({ id: req.userContext.userinfo.sub }, (err, user) => {
    if (err) return next(err);
    req.user = user;
    next();
  });
}

app.use(addUserContext);

{ /* options */ } // add other routes

oidc.on('ready', () => app.listen(3000));
oidc.on('error', err => console.log('could not start', err));
```

[auth-code-docs]: https://developer.okta.com/standards/OAuth/#basic-flows
[express-quickstart]: https://developer.okta.com/quickstart/#/okta-sign-in-page/nodejs/express
[Okta Developer Forum]: https://devforum.okta.com/

#### Using Proxy Servers

The underlying [openid-client][] library can be configured to use the [request][] library.  Do this by adding these lines to your app, before you call `new ExpressOIDC()`:

```javascript
const Issuer = require('openid-client').Issuer;

Issuer.useRequest();

const oidc = new ExpressOIDC({
  ...
});
```

Once you have done that you can read the documentation on the [request][] library to learn which environment variables can be used to define your proxy settings.

[devforum]: https://devforum.okta.com/
[openid-client]: https://github.com/panva/node-openid-client
[request]: https://github.com/request/request

### Upgrading 

#### from 1.x to 2.x

The 2.x improves support for default options without removing flexibility and adds logout functionality that includes Okta logout and token revocation, not just local session destruction.

Specify the `appBaseUrl` property in your config - this is the base scheme + domain + port for your application that will be used for generating the URIs validated against the Okta settings for your application.

Remove the `redirect_uri` property in your config.
  * If you are using the Okta default value (appBaseUrl + /authorization-code/callback) it will be given a route by default, no additional configuration required.
  * If you are NOT using the Okta default value, but are using a route on the same server indicated by your appBaseUrl, you should define your login callback path in your routes.loginCallback.path config (see [the API reference](#expressoidc-api)).

Specify the `appBaseUrl` property in your config - this is the base scheme + domain + port for your application that will be used for generating the URIs validated against the Okta settings for your application.

Remove the `redirect_uri` property in your config.
+  * If you are using the Okta default value (appBaseUrl + /authorization-code/callback) it will be given a route by default, no additional configuration required.
+  * If you are NOT using the Okta default value, but are using a route on the same server indicated by your appBaseUrl, you should define your login callback path in your routes.loginCallback.path config (see [the API reference](#expressoidc-api)).

Any customization previously done to `routes.callback` should now be done to `routes.loginCallback` as the name of that property object has changed.

Any value previously set for `routes.callback.defaultRedirect` should now be done to `routes.loginCallback.afterCallback`.  

##### Straightforward Okta logout for your app

Configure a logout redirect uri for your application in the Okta admin console for your application, if one is not already defined
  * If you do not, logouts will not return to your application but will end on the Okta site
  * Okta recommends `{appBaseUrl}/logout/callback`.  Be sure to fully specify the uri for your application
  * If you chose a different logout redirect uri, specify the path for the local route to create in your routes.logoutCallback.path value (see [the API reference](#expressoidc-api)).

By default the middleware will create a `/logout` (POST only) route.  You should remove any local `/logout` route you have added - if it only destroyed the local session (per the example from the 1.x version of this library) you can simply remove it.  If it did additional post-logout logic, you can change the path of the route and list that path in the route.logoutCallback.afterCallback option (see [the API reference](#expressoidc-api)).

##### Local logout

If you had previously implemented a '/logout' route that called `req.logout()` (performing a local logout for your app) you should remove that route and use the new automatically added `/logout` route.  If you used that route using direct links or GET requests, those will have to become POST requests.  You can create a GET route for /logout, but that as a GET request is open for abuse and/or pre-fetching complications it is not recommended.

If you desire to have a route that performs a local logout while leaving the user logged in to Okta, you can create any route you wish (that does not conflict with automatically created routes) and call `req.logout()` to destroy your local session without altering the status of the user's browser session at Okta.

#### Okta with additional apps

If you had the `redirect_uri` pointing to a different application than this one, replace `redirect_uri` with `loginRedirectUri`, and consider if you need to set `logoutRedirectUri`.

## Contributing

We're happy to accept contributions and PRs! Please see the [contribution guide](https://github.com/okta/okta-oidc-js/blob/master/CONTRIBUTING.md) to understand how to structure a contribution.
