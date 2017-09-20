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

const config = {
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

If a user does not have a valid session, they will redirect to the Okta Login Page for authentication. Once authenticated, they will be redirected back to your application's **protected** page.

### Update your `NgModule`
Finally, import the `OktaAuthModule` into your `NgModule`, and instantiate it by passing in your configuration object:

```typescript
@NgModule({
  imports: [
    ...
    RouterModule.forRoot(appRoutes),
    OktaAuthModule.initAuth(config)
  ],
})
export class MyAppModule { }
```

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