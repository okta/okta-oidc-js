okta-ember
==============================================================================
An Ember.js addon that wraps [Okta Auth JS](https://github.com/okta/okta-auth-js). [Okta Auth JS](https://github.com/okta/okta-auth-js) uses Okta's [OpenID Connect API](https://developer.okta.com/docs/api/resources/oidc.html).

Compatibility
------------------------------------------------------------------------------

* Ember.js v2.18 or above
* Ember CLI v2.13 or above


Installation
------------------------------------------------------------------------------

```
ember install @okta/okta-ember
```


Usage
------------------------------------------------------------------------------

To configure the addon to work with Okta, place the following into your config/environment.js

```js
// config/environment.js
ENV['okta'] = {
    issuer: 'https://{{OktaDomain}}.okta.com/oauth2/default',
    clientId: 'clientId',
    redirectUri: 'http://localhost:4200/implicit/callback',
    scope: 'email openid',
    responseType: 'id_token token',
  };
```

### Configuration Settings

- `issuer` **(required)**: The OpenID Connect `issuer`
- `clientId` **(required)**: The OpenID Connect `client_id`
- `redirectUri` **(required)**: Where the callback is hosted
- `scope` *(optional)*: Reserved for custom claims to be returned in the tokens
- `responseType` *(optional)*: Desired token grant types
- `onAuthRequired` *(optional)*: Accepts a callback to make a decision when authentication is required. If not supplied, `okta-ember` will redirect directly to Okta for authentication.
- `storage` *(optional)*:
  Specify the type of storage for tokens.
  The types are:
  - [`localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
  - [`sessionStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage)
  - [`cookie`](https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie)

### `WithAuth` Route

The `WithAuth` route will check that a valid `accessToken` is stored before the user is allowed to access the route. If a valid `accessToken` is not found, then the `onAuthRequired` callback will be called. To use the route:

```js
// routes/my-route.js

import WithAuth from '@okta/okta-ember/routes/with-auth';

export default WithAuth.extend({});
```

### `okta-callback` Component

The `okta-callback` component is used to capture token values returned in the URL after a redirect from Okta. You will need to create a route with a path of `implicit/callback` as the callback URL, and render the `okta-callback` component in the template for the `implicit/callback` route. The name of the route is up to the deveoper, but this documentation assumes it is `implicit-callback`. To set up the route and component:
1. run `ember g route implicit-callback`
2. Update the path in the router
    ```js
    // router.js

    Router.map(function() {
        this.route('implicit-callback', { path: 'implicit/callback' });
    });
    ```
3. Create a template for the route: run `ember g template implicit-callback`
4. Update the template file for the `implicit-callback` route:
    ```hbs
    <!-- templates/implicit-callback.hbs -->
    {{okta-callback}}
    ```

### `okta-login-redirect` Component

The `okta-login-redirect` component redirects the user to the specified Okta organization by default. If you'd like to have the whole application redirect to the Okta org, simply put the following in the `application.hbs`:
```hbs
<!-- templates/application.hbs -->
{{okta-login-redirect}}
```

#### Using a Custom login-page

`okta-ember` supports the session token redirect flow for custom login pages. For more information, [see the basic Okta Sign-in Widget functionality](https://github.com/okta/okta-signin-widget#new-oktasigninconfig).

To handle the session-token redirect flow, you can modify the unauthentication callback functionality by changing the `onAuthRequired` property of the `auth` service:

```js
// application.js

import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default Controller.extend({
  auth: service(),

  init() {
    this._super(...arguments);
    const authService = this.auth;
    authService.set('onAuthRequired', authService => {
      authService.router.transitionTo('login');
    });
  },
});
```

Alternatively, set this behavior globally by adding it to your configuration object in the environment.js file:

```js
// environment.js
ENV['okta'] = {
  issuer: 'https://{{OktaDomain}}.okta.com/oauth2/default',
  ...
  onAuthRequired: onAuthRequired,
};
```

### `auth` Service

You can expose the `auth` service that is included in `okta-ember` in routes, controllers, or components. The following example shows how to use the login and logout buttons in a controller:
```js
// sample-controller.js
import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default Controller.extend({
  auth: service(),
  actions: {
    login() {
        const authService = this.get('auth');
        authService.loginRedirect('/login');
    },
    logout() {
      const authService = this.get('auth');
      authService.logout();
    },
  },
});
```
```hbs
<!-- sample-controller.hbs -->
{{#if auth.authenticated}}
    <button {{action "logout"}}>Logout</button>
{{else}}
    <button {{action "login"}}>Login</button>
{{/if}}
```

#### `auth.loginRedirect(fromRoute, additionalParams)`

Performs a full page redirect to Okta based on the initial configuration. This method accepts a `fromRoute` parameter to push the user to after successful authentication.

The optional parameter `additionalParams` is mapped to the [AuthJS OpenID Connect Options](https://github.com/okta/okta-auth-js#openid-connect-options). This will override any existing [configuration](#configuration). As an example, if you have an Okta `sessionToken`, you can bypass the full-page redirect by passing in this token. This is recommended when using the [Okta Sign-In Widget](https://github.com/okta/okta-signin-widget). Simply pass in a `sessionToken` into the `loginRedirect` method follows:

```js
this.auth.loginRedirect('/profile', {
  sessionToken: /* sessionToken */
})
```

> Note: For information on obtaining a `sessionToken` using the [Okta Sign-In Widget](https://github.com/okta/okta-signin-widget), please see the [`renderEl()` example](https://github.com/okta/okta-signin-widget#rendereloptions-success-error).

#### `auth.isAuthenticated()`

Returns a promise that resolves `true` if there is a valid access token or ID token.

#### `auth.authenticated`

A boolean that is set during the login and logout process. Use `auth.authenticated` in templates, but either `auth.isAuthenticated()` or `auth.authenticated` will work in controllers, routes, etc.

#### `auth.getUser()`

Returns a promise that will resolve with the result of the OpenID Connect `/userinfo` endpoint if an access token is provided, or returns the claims of the ID token if no access token is available.  The returned claims depend on the requested response type, requested scope, and authorization server policies.  For more information see documentation for the [UserInfo endpoint][], [ID Token Claims][], and [Customizing Your Authorization Server][].

#### `auth.getAccessToken() Promise<string>`

Returns a promise that returns the access token string from storage (if it exists).

#### `auth.getIdToken() Promise<string>`

Returns a promise that returns the ID token string from storage (if it exists).

#### `auth.handleAuthentication()`

Parses the tokens returned as hash fragments in the OAuth 2.0 Redirect URI, then redirects to the URL specified when calling `loginRedirect`.  Returns a promise that will be resolved when complete.

#### `auth.logout(route?)`

Terminates the user's session in Okta and clears all stored tokens. Accepts an optional `route` parameter to redirect the user to after logout.

#### `auth.setFromRoute(route, queryParams)`

Used to capture the current route before a redirect occurs.

#### `auth.getFromRoute()`

Returns the stored route and query parameters stored when the `WithAuth` and/or `setFromRoute` was used.

Contributing
------------------------------------------------------------------------------

See the [Contributing](CONTRIBUTING.md) guide for details.

[ID Token Claims]: https://developer.okta.com/docs/api/resources/oidc#id-token-claims
[UserInfo endpoint]: https://developer.okta.com/docs/api/resources/oidc#userinfo
[Customizing Your Authorization Server]: https://developer.okta.com/authentication-guide/implementing-authentication/set-up-authz-server