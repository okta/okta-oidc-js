# Okta Angular SDK
The Okta Angular SDK is a wrapper around [Okta Auth JS](https://github.com/okta/okta-auth-js), that builds on top of Okta's [OpenID Connect API](https://developer.okta.com/docs/api/resources/oidc.html).

This library currently supports:
  - [OAuth 2.0 Implicit Flow](https://tools.ietf.org/html/rfc6749#section-1.3.2)

## Getting Started
* If you do not already have a **Developer Edition Account**, you can create one at [https://developer.okta.com/signup/](https://developer.okta.com/signup/).
* If you don't have an Angular app, or are new to Angular, please start with the [Angular Quickstart](https://angular.io/guide/quickstart) guide. It will walk you through the creation of an Angular app, creating routes, and other application development essentials.

### Add an OpenID Connect Client in Okta
In Okta, applications are OpenID Connect clients that can use Okta Authorization servers to authenticate users.  Your Okta Org already has a default authorization server, so you just need to create an OIDC client that will use it.
* Log into the Okta Developer Dashboard, click **Applications** > **Add Application**.
* Choose **Single Page App (SPA)** as the platform, then submit the form the default values, which should look like this:

| Setting             | Value                                          |
| ------------------- | ---------------------------------------------- |
| App Name            | My SPA App                                     |
| Base URIs           | http://localhost:{port}                        |
| Login redirect URIs | http://localhost:{port}/implicit/callback      |
| Grant Types Allowed | Implicit                                       |

After you have created the application there are two more values you will need to gather:

| Setting       | Where to Find                                                                  |
| ------------- | ------------------------------------------------------------------------------ |
| Client ID     | In the applications list, or on the "General" tab of a specific application.   |
| Org URL       | On the home screen of the developer dashboard, in the upper right.             |


These values will be used in your Angular application to setup the OpenID Connect flow with Okta.

## Installation

This library is available through [npm](https://www.npmjs.com/package/@okta/okta-angular). To install it, simply add it to your project:

```bash
npm install --save @okta/okta-angular
```

### Configuration
You will need the values from the OIDC client that you created in the previous step to instantiate the middleware. You will also need to know your Okta Org URL, which you can see on the home page of the Okta Developer console.

In your application's `module.ts` file, create a configuration object:

```typescript
// myApp.module.ts

const oktaConfig = {
  issuer: 'https://{yourOktaDomain}.com/oauth2/default',
  redirectUri: 'http://localhost:{port}/implicit/callback',
  clientId: '{clientId}'
}
```

### Create the Callback Handler
In order to handle the redirect back from Okta, you need to capture the token values from the URL. You'll use `/implicit/callback` as the callback URL, and specify the default `OktaCallbackComponent` and declare it in your `NgModule`.

```typescript
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

### Add a Protected Route
Routes are protected by the `OktaAuthGuard`, which verifies there is a valid `accessToken` stored. To ensure the user has been authenticated before accessing your route, add the `canActivate` guard:

```typescript
{
  path: 'protected',
  component: MyProtectedComponent,
  canActivate: [ OktaAuthGuard ]
}
```

If a user does not have a valid session, they will be redirected to the Okta Login Page for authentication. Once authenticated, they will be redirected back to your application's **protected** page.

### Update your `NgModule`
Finally, import the `OktaAuthModule` into your `NgModule`, and instantiate it by passing in your configuration object:

```typescript
@NgModule({
  imports: [
    ...
    RouterModule.forRoot(appRoutes),
    OktaAuthModule.initAuth(oktaConfig)
  ],
})
export class MyAppModule { }
```

## Use the Access Token
When your users are authenticated, your Angular application has an access token that was issued by your Okta Authorization server. You can use this token to authenticate requests for resources on your server or API. As a hypothetical example, let's say you have an API that provides messages for a user. You could create a `MessageList` component that gets the access token and uses it to make an authenticated request to your server.

Here is what the Angular component could look like for this hypothetical example:

```typescript
// messagelist.component.ts

import { Component } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { OktaAuthService } from '@okta/okta-angular';
import 'rxjs/Rx';

@Component({
  template: `
    <div *ngIf="messages.length">
      <li *ngFor="let message of messages">{{message.message}}</li>
    </div>
  `
})
export class MessageListComponent {
  messages = [];
  constructor(private oktaAuth: OktaAuthService, private http: Http) {
    const headers = new Headers({ Authorization: 'Bearer ' + oktaAuth.getAccessToken().accessToken });
    // Make request
    this.http.get(
      'http://localhost:{serverPort}/api/messages',
      new RequestOptions({ headers: headers })
    )
    .map(res => res.json())
    .subscribe((messages: Array<Object>) => messages.forEach(message => this.messages.push(message)));
  }
}
```

### Using a custom login-page
The `okta-angular` SDK supports the session token redirect flow for custom login pages. For more information, [see the basic Okta Sign-in Widget functionality](https://github.com/okta/okta-signin-widget#new-oktasigninconfig).

To handle the session-token redirect flow, you can modify the unauthentication callback functionality by adding a `data` attribute directly to your `Route`:

```typescript
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

## Reference
### Service Module
In your main `NgModule`, your can take advantage of all of `okta-angular`'s features by importing the following:

```typescript
import {
  OktaAuthGuard,
  OktaAuthModule,
  OktaCallbackComponent,
  OktaLoginRedirectComponent
} from '@okta/okta-angular';
```

#### Configuration Options
  - `issuer` **(required)**: The OpenID Connect `issuer`
  - `clientId` **(required)**: The OpenID Connect `client_id`
  - `redirectUri` **(required)**: Where the callback is hosted
  - `scope` *(optional)*: Reserved or custom claims to be returned in the tokens
  - `onAuthRequired` *(optional)*: Accepts a callback to make a decision when authentication is required. If not supplied, `okta-angular` will redirect directly to Okta for authentication.

> An example of this configuration can be seen [above](#configuration).

### Component Usage
All the methods mentioned below are available in your components. Simply import them in as shown:

```typescript
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

#### `oktaAuth.loginRedirect(uri, additionalParams?)`
Performs a full page redirect to Okta based on the initial configuration.  On successful authentication, the router will navigate to the path specified with the `uri` parameter. 

The optional parameter `additionalParams` is mapped to the [AuthJS OpenID Connect Options](https://github.com/okta/okta-auth-js#openid-connect-options). This will override any existing [configuration](#configuration). As an example, if you have an Okta `sessionToken`, you can bypass the full-page redirect by passing in this token. This is recommended when using the [Okta Sign-In Widget](https://github.com/okta/okta-signin-widget). Simply pass in a `sessionToken` into the `loginRedirect` method follows:

```typescript
// Navigate to "/profile" on login success
this.oktaAuth.loginRedirect('/profile', {
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
Parses the tokens returned as hash fragments in the OAuth 2.0 Redirect URI.

#### `oktaAuth.logout(uri?)`
Terminates the user's session in Okta and clears all stored tokens.  Takes an optional `uri` parameter (defaults to `/`) for navigation once complete.

#### `oktaAuth.getOktaAuth()`
Returns the instance of [Okta Auth JS](https://github.com/okta/okta-auth-js) to handle flows not currently covered by this library.

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
