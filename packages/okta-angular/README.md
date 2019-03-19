# Okta Angular SDK

[![npm version](https://img.shields.io/npm/v/@okta/okta-angular.svg?style=flat-square)](https://www.npmjs.com/package/@okta/okta-angular)
[![build status](https://img.shields.io/travis/okta/okta-oidc-js/master.svg?style=flat-square)](https://travis-ci.org/okta/okta-oidc-js)

An Angular wrapper around [Okta Auth JS](https://github.com/okta/okta-auth-js), that builds on top of Okta's [OpenID Connect API](https://developer.okta.com/docs/api/resources/oidc.html).

This library currently supports:

- [OAuth 2.0 Implicit Flow](https://tools.ietf.org/html/rfc6749#section-1.3.2)

This library is tested against the latest version of Angular (currently 6), and is currently known to be compatible with Angular 4, 5, and 6.

`okta-angular` works directly with [`@angular/router`](https://angular.io/guide/router). 

## Getting Started

- If you do not already have a **Developer Edition Account**, you can create one at [https://developer.okta.com/signup/](https://developer.okta.com/signup/).
- An Okta Application, configured for Singe-Page App (SPA) mode. This is done from the Okta Developer Console and you can find instructions [here](https://developer.okta.com/authentication-guide/implementing-authentication/implicit#1-setting-up-your-application). When following the wizard, use the default properties. They are are designed to work with our sample applications.

### Helpful Links

- [Angular Quickstart](https://angular.io/guide/quickstart)
  - If you don't have an Angular app, or are new to Angular, please start with this guide. It will walk you through the creation of an Angular app, creating routes, and other application development essentials.
- [Okta Sample Application](https://github.com/okta/samples-js-angular)
  - A fully functional sample application.
- [Okta Angular Quickstart](https://okta.github.io/quickstart/#/angular/nodejs/generic)
  - Helpful resource for integrating an existing Angular application into Okta.

## Installation

This library is available through [npm](https://www.npmjs.com/package/@okta/okta-angular). To install it, simply add it to your project:

```bash
# npm
npm install --save @okta/okta-angular

# yarn
yarn add @okta/okta-angular
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
  redirectUri: 'http://localhost:{port}/implicit/callback'
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
- `scope` *(optional)*: Reserved for custom claims to be returned in the tokens
- `responseType` *(optional)*: Desired token grant types
- `onAuthRequired` *(optional)*: Accepts a callback to make a decision when authentication is required. If not supplied, `okta-angular` will redirect directly to Okta for authentication.
- `storage` *(optional)*:
  Specify the type of storage for tokens.
  The types are:
  - [`localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
  - [`sessionStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage)
  - [`cookie`](https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie)

  Defaults to `localStorage`. If [local storage](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Local_storage) is not available, falls back to `sessionStorage` or `cookie`.
- `autoRenew` *(optional)*:
  By default, the library will attempt to renew expired tokens. When an expired token is requested by the library, a renewal request is executed to update the token. If you wish to  to disable auto renewal of tokens, set autoRenew to false.

### `OktaAuthModule`

The top-level Angular module which provides these components and services:

- [`OktaAuthGuard`](#oktaauthguard) - A navigation guard using [CanActivate](https://angular.io/api/router/CanActivate) to grant access to a page only after successful authentication.
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
    canActivate: [ OktaAuthGuard ]
  },
  ...
]
```

If a user does not have a valid session, they will be redirected to the Okta Login Page for authentication. Once authenticated, they will be redirected back to your application's **protected** page.

### `OktaCallbackComponent`

In order to handle the redirect back from Okta, you need to capture the token values from the URL. You'll use `/implicit/callback` as the callback URL, and specify the default `OktaCallbackComponent` and declare it in your `NgModule`.

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

By default, the `OktaLoginRedirect` component redirects users to your Okta organization for login. Simply import and add it to your `appRoutes` to offset authentication to Okta entirely:

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

To handle the session-token redirect flow, you can modify the unauthentication callback functionality by adding a `data` attribute directly to your `Route`:

```typescript
// myApp.module.ts

import {
  OktaAuthGuard,
  ...
} from '@okta/okta-angular';

export function onAuthRequired({oktaAuth, router}) {
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

Returns a promise that will resolve with the result of the OpenID Connect `/userinfo` endpoint if an access token is provided, or returns the claims of the ID token if no access token is available.  The returned claims depend on the requested response type, requested scope, and authorization server policies.  For more information see documentation for the [UserInfo endpoint][], [ID Token Claims][], and [Customizing Your Authorization Server][].

#### `oktaAuth.getAccessToken() Promise<string>`

Returns a promise that returns the access token string from storage (if it exists).

#### `oktaAuth.getIdToken() Promise<string>`

Returns a promise that returns the ID token string from storage (if it exists).

#### `oktaAuth.handleAuthentication()`

Parses the tokens returned as hash fragments in the OAuth 2.0 Redirect URI, then redirects to the URL specified when calling `loginRedirect`.  Returns a promise that will be resolved when complete.

#### `oktaAuth.logout(uri?)`

Terminates the user's session in Okta and clears all stored tokens. Accepts an optional `uri` parameter to push the user to after logout.

#### `oktaAuth.setFromUri(uri, queryParams)`

Used to capture the current URL state before a redirect occurs. Used primarily for custom [`canActivate`](https://angular.io/api/router/CanActivate) navigation guards.

#### `oktaAuth.getFromUri()`

Returns the stored URI and query parameters stored when the `OktaAuthGuard` and/or `setFromUri` was used.

## Development

See the [getting started](/README.md#getting-started) section for step-by-step instructions.

## Commands

| Command      | Description                        |
|--------------|------------------------------------|
| `yarn start` | Start the sample app using the SDK |
| `yarn test`  | Run unit and integration tests     |
| `yarn lint`  | Run eslint linting tests           |

[ID Token Claims]: https://developer.okta.com/docs/api/resources/oidc#id-token-claims
[UserInfo endpoint]: https://developer.okta.com/docs/api/resources/oidc#userinfo
[Customizing Your Authorization Server]: https://developer.okta.com/authentication-guide/implementing-authentication/set-up-authz-server
