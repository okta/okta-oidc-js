# oidc-middleware

This package makes it easy to get your users logged in with Okta using OpenId Connect (OIDC).

## Installation

```sh
npm install @okta/oidc-middleware
```

## ExpressOIDC API

This module makes it easy to get users logged in to your Express app.

### Prerequisites

This integration depends on sessions to store user information. Ensure the [express-session middleware](https://github.com/expressjs/session) is added before you add `ExpressOIDC`.

```javascript
const express = require('express');
const session = require('express-session');
const { ExpressOIDC } = require('@okta/oidc-middleware');

const app = express();
app.use(session({ /* options */ })); // ensure this is before ExpressOIDC

const oidc = new ExpressOIDC({ /* options */ });
app.use(oidc.router);
oidc.on('ready', () => {
  app.listen(3000, () => console.log('app started'));
});
oidc.on('error', err => {
  // An error occurred while setting up OIDC
})
```

> By default, the session middleware uses a MemoryStore, which is not designed for production use. Use [another session store](https://github.com/expressjs/session#compatible-session-stores) for production.

### new ExpressOIDC(config)

Configures your OIDC integration.

```javascript
const { ExpressOIDC } = require('@okta/oidc-middleware');

const oidc = new ExpressOIDC({
  issuer: YOUR_ISSUER,
  client_id: YOUR_CLIENT_ID,
  client_secret: YOUR_CLIENT_SECRET,
  redirect_uri: YOUR_REDIRECT_URI
});
```

Required config:

* **issuer** - The OIDC provider (e.g. `https://YOUR_ORG.oktapreview.com/oauth2/default`)
* **client_id** - An id provided when you create an OIDC app
* **client_secret** - A secret provided when you create an OIDC app
* **redirect_uri** - The callback for your app. Locally, this is usually `http://localhost:3000/authorization-code/callback`. When deployed, this should be `https://YOUR_PROD_DOMAIN/authorization-code/callback`.

Optional config:

* **response_type** - Defaults to `code`
* **scope** - Defaults to `openid`
* **routes** - Allows customization of the generated routes. See [#customizing-routes](#customizing-routes) for details.

### oidc.router

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

### oidc.on('ready', callback)

The middleware must retrieve some information about your client before starting the server. You **must** wait until ExpressOIDC is ready to start your server.

```javascript
oidc.on('ready', () => {
  app.listen(3000, () => console.log('app started'));
});
```

### oidc.on('error', callback)

This is triggered if an error occurs while ExpressOIDC is trying to start.

```javascript
oidc.on('error', err => {
  // An error occurred while setting up OIDC
});
```

### oidc.ensureAuthenticated(redirectTo)

Use this to protect your routes. If not authenticated, this will redirect to the login route. If not authenticated and the protected route should not return html, this will return a 401 instead.

```javascript
app.get('/protected', oidc.ensureAuthenticated(), (req, res) => {
  res.send('Protected stuff');
});
```

** redirectTo ** - the path to return to after login

### req.isAuthenticated()

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

### req.logout()

This allows you to end the session.

```javascript
app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});
```

### req.userinfo

This provides information about the authenticated user.

```javascript
app.get('/', (req, res) => {
  if (req.userinfo) {
    res.send(`Hi ${req.userinfo.sub}!`);
  } else {
    res.send('Hi!');
  }
});
```

Note: The default scope of `openid` will only return the `sub` claim.  To obtain more information about the user, set the `scope` option to `openid profile` when creating the middleware.  For a list of scopes and claims, please see [Scope-dependent claims](https://developer.okta.com/standards/OIDC/index.html#scope-dependent-claims-not-always-returned) for more information.

### Customizing routes

If you need to modify the default login and callback routes, the `routes` config option is available.

```javascript
const oidc = new ExpressOIDC({
  { /* options */ }
  routes: {
    login: {
      path: '/different/login'
    },
    callback: {
      path: '/different/callback',
      handler: (req, res, next) => {
        // my customer async handler
      },
      // this is where we'll redirect if we don't have a route to return to
      defaultRedirect: '/home'
    }
  }
});
```

* **path** - where our middleware attaches
* **handler** - additional middleware for after we validate the OpenId Connect response
* **defaultRedirect** - where we redirect to after login when there's no protected route to return to

### Using a Custom Login Page

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

### Extending the User

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
  if (!req.userinfo) return next();

  // request additional info from your database
  User.findOne({ id: req.userinfo.sub }, (err, user) => {
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
