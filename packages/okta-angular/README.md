# Okta Angular SDK
An Angular (4+) wrapper around [Okta Auth JS](https://github.com/okta/okta-auth-js), that builds on top of Okta's [OpenID Connect API](https://developer.okta.com/docs/api/resources/oidc.html).

This library currently supports:
  - [OAuth 2.0 Implicit Flow](https://tools.ietf.org/html/rfc6749#section-1.3.2)

## Getting Started
* If you do not already have a **Developer Edition Account**, you can create one at [https://developer.okta.com/signup/](https://developer.okta.com/signup/).
* An Okta Application, configured for Singe-Page App (SPA) mode. This is done from the Okta Developer Console and you can find instructions [here](https://developer.okta.com/authentication-guide/implementing-authentication/implicit#1-setting-up-your-application). When following the wizard, use the default properties. They are are designed to work with our sample applications.

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
npm install --save @okta/okta-angular
```

## Usage
`okta-angular` works directly with [`@angular/router`](https://angular.io/guide/router) and provides the additional components and services:
- [`OktaAuthModule`](#oktaauthmodule) - Allows you to supply your OpenID Connect client configuration.
- [`OktaAuthGuard`](#oktaauthguard) - A navigation guard using [CanActivate](https://angular.io/api/router/CanActivate) to grant access to a page only after successful authentication.
- [`OktaCallbackComponent`](#oktacallbackcomponent) - Handles the implicit flow callback by parsing tokens from the URL and storing them automatically.
- [`OktaLoginRedirectComponent`](#oktaloginredirectcomponent) - Redirects users to the Okta Hosted Login Page for authentication.
- [`OktaAuthService`](#oktaauthservice) - Highest-level service containing the `okta-angular` public methods.

### `OktaAuthModule`
The `OktaAuthModule` is the initializer for your OpenID Connect client configuration. It accepts the following properties:
  - `issuer` **(required)**: The OpenID Connect `issuer`
  - `clientId` **(required)**: The OpenID Connect `client_id`
  - `redirectUri` **(required)**: Where the callback is hosted
  - `scope` *(optional)*: Reserved for custom claims to be returned in the tokens
  - `onAuthRequired` *(optional)*: Accepts a callback to make a decision when authentication is required. If not supplied, `okta-angular` will redirect directly to Okta for authentication.

```typescript
// myApp.module.ts

import {
  OktaAuthModule
} from '@okta/okta-angular';

const oktaConfig = {
  issuer: 'https://{yourOktaDomain}.com/oauth2/default',
  redirectUri: 'http://localhost:{port}/implicit/callback',
  clientId: '{clientId}'
}

const appRoutes: Routes = [
  ...
]

@NgModule({
  imports: [
    ...
    OktaAuthModule.initAuth(oktaConfig)
  ],
})
export class MyAppModule { }
```

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
  <button *ngIf="!oktaAuth.isAuthenticated()" (click)="oktaAuth.loginRedirect('/profile')> Login </button>
  <button *ngIf="oktaAuth.isAuthenticated()" (click)="oktaAuth.logout('/')"> Logout </button>

  <router-outlet></router-outlet>
  `,
})
export class MyComponent {

  constructor(public oktaAuth: OktaAuthService) {
    // ...
  }
}
```

#### `oktaAuth.loginRedirect(additionalParams?)`
Performs a full page redirect to Okta based on the initial configuration.

The optional parameter `additionalParams` is mapped to the [AuthJS OpenID Connect Options](https://github.com/okta/okta-auth-js#openid-connect-options). This will override any existing [configuration](#configuration). As an example, if you have an Okta `sessionToken`, you can bypass the full-page redirect by passing in this token. This is recommended when using the [Okta Sign-In Widget](https://github.com/okta/okta-signin-widget). Simply pass in a `sessionToken` into the `loginRedirect` method follows:

```typescript
this.oktaAuth.loginRedirect({
  sessionToken: /* sessionToken */
})
```

> Note: For information on obtaining a `sessionToken` using the [Okta Sign-In Widget](https://github.com/okta/okta-signin-widget), please see the [`renderEl()` example](https://github.com/okta/okta-signin-widget#rendereloptions-success-error).

#### `oktaAuth.isAuthenticated()`
Returns `true` if there is a valid access token or ID token.

#### `oktaAuth.getAccessToken()`
Returns the access token from storage (if it exists).

#### `oktaAuth.getIdToken()`
Returns the ID token from storage (if it exists).

#### `oktaAuth.getUser()`
Returns the result of the OpenID Connect `/userinfo` endpoint if an access token exists.

#### `oktaAuth.handleAuthentication()`
Parses the tokens returned as hash fragments in the OAuth 2.0 Redirect URI, then redirects to the URL specified when calling `loginRedirect`.

#### `oktaAuth.logout()`
Terminates the user's session in Okta and clears all stored tokens.

## Development
1. Clone the repo:
    - `git clone git@github.com:okta/okta-oidc-js.git`
2. Navigate into the `okta-angular` package:
    - `cd packages/okta-angular`
3. Install dependencies:
    - Navigate into the sample and install all `@angular` dependencies
    - `cd test/e2e/harness && npm install`
4. Make your changes to `okta-angular/src/`

## Commands

| Command        | Description                        |
| -------------- | ---------------------------------- |
| `npm start`    | Start the sample app using the SDK |
| `npm test`     | Run integration tests              |
| `npm run lint` | Run eslint linting tests           |
| `npm run docs` | Generate typedocs                  |
