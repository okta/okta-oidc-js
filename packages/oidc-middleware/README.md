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
* [Contributing](#contributing)

This package makes it easy to get your users logged in with Okta using OpenId Connect (OIDC).  It enables your Express application to participate in the [authorization code flow][auth-code-docs] flow by redirecting the user to Okta for authentication and handling the callback from Okta.  Once this flow is complete, a local session is created and the user context is saved for the duration of the session.

## Release status

This library uses semantic versioning and follows Okta's [library version policy](https://developer.okta.com/code/library-versions/).

:heavy_check_mark: The current stable major version series is: 1.x

| Version | Status                    |
| ------- | ------------------------- |
| 1.x     | :heavy_check_mark: Stable |
| 0.x     | :x: Retired               |

The latest release can always be found on the [releases page][github-releases].

## Need help?

If you run into problems using the SDK, you can:

* Ask questions on the [Okta Developer Forums][devforum]
* Post [issues][github-issues] here on GitHub (for code errors)

## Getting started

Installing the Okta Node JS OIDC MIddlware in your project is simple.

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
  redirect_uri: 'http://localhost:3000/authorization-code/callback',
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
    res.send(`Hello ${req.userContext.userinfo.name}! <a href="logout">Logout</a>`);
  } else {
    res.send('Please <a href="/login">login</a>');
  }
});
app.get('/protected', oidc.ensureAuthenticated(), (req, res) => {
  res.send('Top Secret');
});
app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});
oidc.on('ready', () => {
  app.listen(3000, () => console.log('app started'));
});
oidc.on('error', err => {
  // An error occurred while setting up OIDC
});
```

## API reference

* [ExpressOIDC API](#expressoidc-api)
  * [new ExpressOIDC(config)](#new-expressoidcconfig)
  * [oidc.router](#oidcrouter)
  * [oidc.on('ready', callback)](#oidconready-callback)
  * [oidc.on('error', callback)](#oidconerror-callback)
  * [oidc.ensureAuthenticated({ redirectTo?: '/uri' })](#oidcensureauthenticated-redirectto-uri)
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
  redirect_uri: '{redirectUri}',
  scope: 'openid profile'
});
```

Required config:

* **issuer** - The OIDC provider (e.g. `https://{yourOktaDomain}/oauth2/default`)
* **client_id** - An id provided when you create an OIDC app in your Okta Org
* **client_secret** - A secret provided when you create an OIDC app in your Okta Org
* **redirect_uri** - The callback for your app. Locally, this is usually `http://localhost:3000/authorization-code/callback`. When deployed, this should be `https://{yourProductionDomain}/authorization-code/callback`.

Optional config:

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

It's required in order for `ensureAuthenticated` and `isAuthenticated` to work and adds the following routes:

* `/login` - redirects to the Okta sign-in page by default
* `/authorization-code/callback` - processes the OIDC response, then attaches userinfo to the session

#### oidc.on('ready', callback)

The middleware must retrieve some information about your client before starting the server. You **must** wait until ExpressOIDC is ready to start your server.

```javascript
oidc.on('ready', () => {
  app.listen(3000, () => console.log('app started'));
});
```

#### oidc.on('error', callback)

This is triggered if an error occurs while ExpressOIDC is trying to start.

```javascript
oidc.on('error', err => {
  // An error occurred while setting up OIDC
});
```

#### oidc.ensureAuthenticated({ redirectTo?: '/uri' })

Use this to protect your routes. If not authenticated, this will redirect to the login route and trigger the authentication flow. If the request prefers JSON then a 401 error response will be sent.

```javascript
app.get('/protected', oidc.ensureAuthenticated(), (req, res) => {
  res.send('Protected stuff');
});
```

The `redirectTo` option can be used to redirect the user to a specific URI on your site, after a successful authentication callback.

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

This allows you to end the session.

```javascript
app.get('/logout', (req, res) => {
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
    callback: {
      path: '/different/callback',
      handler: (req, res, next) => {
        // Perform custom logic before final redirect, then call next()
      },
      defaultRedirect: '/home'
    }
  }
});
```

* **`callback.defaultRedirect`** - Where the user is redirected to after a successful authentication callback, if no `returnTo` value was specified by `oidc.ensureAuthenticated()`. Defaults to `/`.
* **`callback.failureRedirect`** - Where the user is redirected to after authentication failure, defaults to a page which just shows error message.
* **`callback.handler`** - A function that is called after a successful authentication callback, but before the final redirect within your application. Useful for requirements such as conditional post-authentication redirects, or sending data to logging systems.
* **`callback.path`** - The URI that this library will host the callback handler on. Defaults to `/authorization-code/callback`
* **`login.path`** - The URI that redirects the user to the authorize endpoint. Defaults to `/login`.

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

## Contributing

We're happy to accept contributions and PRs! Please see the [contribution guide](https://github.com/okta/okta-oidc-js/blob/master/CONTRIBUTING.md) to understand how to structure a contribution.
