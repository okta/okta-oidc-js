[Okta Auth SDK]: https://github.com/okta/okta-auth-js
[@angular/router]: https://angular.io/guide/router
[Observable]: https://angular.io/guide/observables
[Dependency Injection]: https://angular.io/guide/dependency-injection
[Auth service]: #oktaauthservice

# Okta Angular SDK

[![npm version](https://img.shields.io/npm/v/@okta/okta-angular.svg?style=flat-square)](https://www.npmjs.com/package/@okta/okta-angular)
[![build status](https://img.shields.io/travis/okta/okta-oidc-js/master.svg?style=flat-square)](https://travis-ci.org/okta/okta-oidc-js)

Okta Angular SDK builds on top of the [Okta Auth SDK][]. This SDK adds integration with [@angular/router][] and provides additional logic and components designed to help you quickly add authentication and authorization to your Angular single-page web application.

With the [Okta Auth SDK][], you can:

- Login and logout from Okta using the [OAuth 2.0 API](https://developer.okta.com/docs/api/resources/oidc)
- Retrieve user information
- Determine authentication status
- Validate the current user's session

All of these features are supported by this SDK. Additionally, using this SDK, you can:

- Add "protected" routes, which will require authentication before render
- Define custom logic/behavior when authentication is required
- Subscribe to changes in authentication state using an [Observable] property
- Provide an instance of the [Auth service][] to your components using [Dependency Injection][]

> This SDK does not provide any UI components.

> This SDK does not currently support Server Side Rendering (SSR)

This library currently supports:

- [OAuth 2.0 Implicit Flow](https://tools.ietf.org/html/rfc6749#section-1.3.2)
- [OAuth 2.0 Authorization Code Flow](https://tools.ietf.org/html/rfc6749#section-1.3.1) with [Proof Key for Code Exchange (PKCE)](https://tools.ietf.org/html/rfc7636) 

> This library has been tested for compatibility with the following Angular versions: 4, 5, 6, 7, 8, 9

## Getting Started

- If you do not already have a **Developer Edition Account**, you can create one at [https://developer.okta.com/signup/](https://developer.okta.com/signup/).
- An Okta Application, configured for Single-Page App (SPA) mode. This is done from the Okta Developer Console and you can find instructions [here](https://developer.okta.com/authentication-guide/implementing-authentication/implicit#1-setting-up-your-application). When following the wizard, use the default properties. They are are designed to work with our sample applications.

### Helpful Links

- [Angular Quickstart](https://angular.io/guide/quickstart)
  - If you don't have an Angular app, or are new to Angular, please start with this guide. It will walk you through the creation of an Angular app, creating routes, and other application development essentials.
- [Okta Sample Application](https://github.com/okta/samples-js-angular)
  - A fully functional sample application.
- [Okta Guide: Sign users into your single-page application](https://developer.okta.com/docs/guides/sign-into-spa/angular/before-you-begin/)
  - Step-by-step guide to integrating an existing Angular application with Okta login.

## Installation

This library is available through [npm](https://www.npmjs.com/package/@okta/okta-angular). To install it, simply add it to your project:

```bash
npm install --save @okta/okta-angular
```

## Usage

Add [`OktaAuthModule`](#oktaauthmodule) to your module's imports.
Create a configuration object and provide this as [`OKTA_CONFIG`](#okta_config).


```typescript
// myApp.module.ts

import {
  OKTA_CONFIG,
  OktaAuthModule
} from '@okta/okta-angular';

const oktaConfig = {
  issuer: 'https://{yourOktaDomain}.com/oauth2/default',
  clientId: '{clientId}',
  redirectUri: 'http://localhost:{port}/implicit/callback',
  pkce: true
}

@NgModule({
  imports: [
    ...
    OktaAuthModule
  ],
  providers: [
    { provide: OKTA_CONFIG, useValue: oktaConfig }
  ],
})
export class MyAppModule { }
```

### `OKTA_CONFIG`

An Angular InjectionToken used to configure the OktaAuthService. This value must be provided by your own application. It is initialized by a plain object which can have the following properties:

- `issuer` **(required)**: The OpenID Connect `issuer`
- `clientId` **(required)**: The OpenID Connect `client_id`
- `redirectUri` **(required)**: Where the callback is hosted
- `postLogoutRedirectUri` | Specify the url where the browser should be redirected after [logout](#oktaauthlogouturi). This url must be added to the list of `Logout redirect URIs` on the application's `General Settings` tab.
- `scope` *(deprecated in v1.2.2)*: Use `scopes` instead
- `scopes` *(optional)*: Reserved for custom claims to be returned in the tokens. Defaults to `['openid']`, which will only return the `sub` claim. To obtain more information about the user, use `openid profile`. For a list of scopes and claims, please see [Scope-dependent claims](https://developer.okta.com/standards/OIDC/index.html#scope-dependent-claims-not-always-returned) for more information.
- `responseType` *(optional)*: Desired token grant types. Default: `['id_token', 'token']`.
For PKCE flow, this should be left undefined or set to `['code']`.
- **pkce** *(optional)* - If `true`, Authorization Code w/PKCE Flow will be used.  See the [@okta/okta-auth-js README regarding PKCE OAuth2 Flow](https://github.com/okta/okta-auth-js#pkce-oauth-20-flow) for requirements, including any required polyfills.  If you are using the Implicit Flow, you should set `pkce: false`. Default: `true`.
- `onAuthRequired` *(optional)*: - callback function. Called when authentication is required. If not supplied, `okta-angular` will redirect directly to Okta for authentication. This is triggered when:
    1. [login](#oktaauthloginfromuri-additionalparams) is called
    2. A route protected by `OktaAuthGuard` is accessed without authentication
- `onSessionExpired` *(optional)* - callback function. Called when the Okta SSO session has expired or was ended outside of the application. This SDK adds a default handler which will call [login](#oktaauthloginfromuri-additionalparams) to initiate a login flow. Passing a function here will disable the default handler.
- `isAuthenticated` *(optional)* - callback function. By default, `OktaAuthService.isAuthenticated` will return true if both `getIdToken()` and `getAccessToken()` return a value. Setting a `isAuthenticated` function on the config will skip the default logic and call the supplied function instead. The function should return a Promise and resolve to either true or false.
- `tokenManager` *(optional)*: An object containing additional properties used to configure the internal token manager. See [AuthJS TokenManager](https://github.com/okta/okta-auth-js#the-tokenmanager) for more detailed information.

  - `autoRenew` *(optional)*:
    By default, the library will attempt to renew expired tokens. When an expired token is requested by the library, a renewal request is executed to update the token. If you wish to  to disable auto renewal of tokens, set autoRenew to false.
  
  - `secure`: If `true` then only "secure" https cookies will be stored. This option will prevent cookies from being stored on an HTTP connection. This option is only relevant if `storage` is set to `cookie`, or if the client browser does not support `localStorage` or `sessionStorage`, in which case `cookie` storage will be used.
  
  - `storage` *(optional)*:
    Specify the type of storage for tokens.
    The types are:
    - [`localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
    - [`sessionStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage)
    - [`cookie`](https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie)


### `OktaAuthModule`

The top-level Angular module which provides these components and services:

- [`OktaAuthGuard`](#oktaauthguard) - A navigation guard implementing [CanActivate](https://angular.io/api/router/CanActivate) and [CanActivateChild](https://angular.io/api/router/CanActivateChild) to grant access to a page (and/or its children) only after successful authentication.
- [`OktaCallbackComponent`](#oktacallbackcomponent) - Handles the implicit flow callback by parsing tokens from the URL and storing them automatically.
- [`OktaLoginRedirectComponent`](#oktaloginredirectcomponent) - Redirects users to the Okta Hosted Login Page for authentication.
- [`OktaAuthService`](#oktaauthservice) - Highest-level service containing the `okta-angular` public methods.

### `OktaAuthGuard`

Routes are protected by the `OktaAuthGuard`, which verifies there is a valid `accessToken` stored. To ensure the user has been authenticated before accessing your route, add the `canActivate` guard to one of your routes:

```typescript
// myApp.module.ts

import {
  OktaAuthGuard,
  ...
} from '@okta/okta-angular';

const appRoutes: Routes = [
  {
    path: 'protected',
    component: MyProtectedComponent,
    canActivate: [ OktaAuthGuard ],
    children: [{
      // children of a protected route are also protected
      path: 'also-protected'
    }]
  },
  ...
]
```

You can use `canActivateChild` to protect children of an unprotected route:

```typescript
// myApp.module.ts

import {
  OktaAuthGuard,
  ...
} from '@okta/okta-angular';

const appRoutes: Routes = [
  {
    path: 'public',
    component: MyPublicComponent,
    canActivateChild: [ OktaAuthGuard ],
    children: [{
      path: 'protected',
      component: MyProtectedComponent
    }]
  },
  ...
]
```

If a user does not have a valid session, they will be redirected to the Okta Login Page for authentication. Once authenticated, they will be redirected back to your application's **protected** page.

### `OktaCallbackComponent`

Handles the callback after the redirect. By default, it parses the tokens from the uri, stores them, then redirects to `/`. If a protected route (using [`OktaAuthGuard`](#oktaauthguard)) caused the redirect, then the callback will redirect back to the protected route. If an error is thrown while processing tokens, the component will display the error and not perform any redirect. This logic can be customized by copying the component to your own source tree and modified as needed. For example, you may want to capture or display errors differently or provide a helpful link for your users in case they encounter an error on the callback route. The most common error is the user does not have permission to access the application. In this case, they may be able to contact an administrator to obtain access.

You should define a route to handle the callback URL (`/implicit/callback` by default). Also add `OktaCallbackComponent` to the declarations section of in your `NgModule`.

```typescript
// myApp.module.ts
import {
  OktaCallbackComponent,
  ...
} from '@okta/okta-angular';

const appRoutes: Routes = [
  {
    path: 'implicit/callback',
    component: OktaCallbackComponent
  },
  ...
]

@NgModule({
  ...
  declarations: [
    ...
    OktaCallbackComponent
  ]
})
```

### `OktaLoginRedirectComponent`

The `OktaLoginRedirect` component redirects the user's browser to the Okta-hosted login page for your organization. For more advanced cases, this component can be copied to your own source tree and modified as needed.

```typescript
// myApp.module.ts
import {
  OktaLoginRedirectComponent,
  ...
} from '@okta/okta-angular';

const appRoutes: Routes = [
  {
    path: 'login',
    component: OktaLoginRedirectComponent
  },
  ...
]
```

#### Using a custom login-page

The `okta-angular` SDK supports the session token redirect flow for custom login pages. For more information, [see the basic Okta Sign-in Widget functionality](https://github.com/okta/okta-signin-widget#new-oktasigninconfig).

To handle the session-token redirect flow, you can set an `onAuthRequired` callback by adding a `data` attribute directly to your `Route`:

```typescript
// myApp.module.ts

import {
  OktaAuthGuard,
  ...
} from '@okta/okta-angular';

export function onAuthRequired(oktaAuth, injector) {
  // Use injector to access any service available within your application
  const router = injector.get(Router);

  // Redirect the user to your custom login page
  router.navigate(['/custom-login']);
}

const appRoutes: Routes = [
  ...
  {
    path: 'protected',
    component: MyProtectedComponent,
    canActivate: [ OktaAuthGuard ],
    data: {
      onAuthRequired: onAuthRequired
    }
  }
]
```

Alternatively, set this behavior globally by adding it to your configuration object:

```typescript
const oktaConfig = {
  issuer: environment.ISSUER,
  ...
  onAuthRequired: onAuthRequired
};
```

### `OktaAuthService`

In your components, your can take advantage of all of `okta-angular`'s features by importing the `OktaAuthService`. The example below shows connecting two buttons to handle **login** and **logout**:

```typescript
// sample.component.ts

import { OktaAuthService } from '@okta/okta-angular';

@Component({
  selector: 'app-component',
  template: `
    <button *ngIf="!isAuthenticated" (click)="login()">Login</button>
    <button *ngIf="isAuthenticated" (click)="logout()">Logout</button>

    <router-outlet></router-outlet>
  `,
})
export class MyComponent {
  isAuthenticated: boolean;
  constructor(public oktaAuth: OktaAuthService) {
    // get authentication state for immediate use
    await this.isAuthenticated = this.oktaAuth.isAuthenticated();

    // subscribe to authentication state changes
    this.oktaAuth.$authenticatedState.subscribe(
      (isAuthenticated: boolean)  => this.isAuthenticated = isAuthenticated
    );
  }
  login() {
    this.oktaAuth.loginRedirect('/profile');
  }
  logout() {
    this.oktaAuth.logout('/');
  }
}
```

#### `oktaAuth.login(fromUri?, additionalParams?)`

Calls `onAuthRequired` function if it was set on the initial configuration. Otherwise, it will call `loginRedirect`. This method accepts a `fromUri` parameter to push the user to after successful authentication, and an optional `additionalParams` object.

For more information on `additionalParams`, see the [oktaAuth.loginRedirect](#oktaauthloginredirectfromuri-additionalparams) method below.

#### `oktaAuth.loginRedirect(fromUri?, additionalParams?)`

Performs a full page redirect to Okta based on the initial configuration. This method accepts a `fromUri` parameter to push the user to after successful authentication.

The optional parameter `additionalParams` is mapped to the [AuthJS OpenID Connect Options](https://github.com/okta/okta-auth-js#openid-connect-options). This will override any existing [configuration](#configuration). As an example, if you have an Okta `sessionToken`, you can bypass the full-page redirect by passing in this token. This is recommended when using the [Okta Sign-In Widget](https://github.com/okta/okta-signin-widget). Simply pass in a `sessionToken` into the `loginRedirect` method follows:

```typescript
this.oktaAuth.loginRedirect('/profile', {
  sessionToken: /* sessionToken */
})
```

> Note: For information on obtaining a `sessionToken` using the [Okta Sign-In Widget](https://github.com/okta/okta-signin-widget), please see the [`renderEl()` example](https://github.com/okta/okta-signin-widget#rendereloptions-success-error).

#### `oktaAuth.isAuthenticated()`

Returns a promise that resolves `true` if there is a valid access token or ID token.

#### `oktaAuth.$authenticationState`

An observable that returns true/false when the authenticate state changes.  This will happen after a successful login via `oktaAuth.handleAuthentication()` or logout via `oktaAuth.logout()`.

#### `oktaAuth.getUser()`

Returns a promise that will resolve with the result of the OpenID Connect `/userinfo` endpoint if an access token is provided, or returns the claims of the ID token if no access token is available.  The returned claims depend on the requested response type, requested scopes, and authorization server policies.  For more information see documentation for the [UserInfo endpoint][], [ID Token Claims][], and [Customizing Your Authorization Server][].

#### `oktaAuth.getAccessToken() Promise<string>`

Returns a promise that returns the access token string from storage (if it exists).

#### `oktaAuth.getIdToken() Promise<string>`

Returns a promise that returns the ID token string from storage (if it exists).

#### `oktaAuth.handleAuthentication()`

Parses the tokens returned as hash fragments in the OAuth 2.0 Redirect URI, then redirects to the URL specified when calling `loginRedirect`.  Returns a promise that will be resolved when complete.

#### `oktaAuth.logout(uri?)`

Terminates the user's session in Okta and clears all stored tokens. Accepts an optional `uri` parameter to push the user to after logout.

#### `oktaAuth.setFromUri(uri)`

Used to capture the current URL state before a redirect occurs. Used by custom [`canActivate`](https://angular.io/api/router/CanActivate) navigation guards.

#### `oktaAuth.getFromUri()`

Returns the URI stored when the `OktaAuthGuard` and/or `setFromUri` was used.

#### `oktaAuth.getTokenManager()`

Returns the internal [TokenManager](https://github.com/okta/okta-auth-js#tokenmanager).

## Contributing

We welcome contributions to all of our open-source packages. Please see the [contribution guide](https://github.com/okta/okta-oidc-js/blob/master/CONTRIBUTING.md) to understand how to structure a contribution.

### Installing dependencies for contributions

We use [yarn](https://yarnpkg.com) for dependency management when developing this package:

```bash
yarn install
```

### Commands

| Command      | Description                        |
|--------------|------------------------------------|
| `yarn start` | Start the sample app using the SDK |
| `yarn test`  | Run unit and integration tests     |
| `yarn lint`  | Run eslint linting tests           |

[ID Token Claims]: https://developer.okta.com/docs/api/resources/oidc#id-token-claims
[UserInfo endpoint]: https://developer.okta.com/docs/api/resources/oidc#userinfo
[Customizing Your Authorization Server]: https://developer.okta.com/authentication-guide/implementing-authentication/set-up-authz-server
