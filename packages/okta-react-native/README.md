# Okta React Native

[![npm version](https://img.shields.io/npm/v/@okta/okta-react-native.svg?style=flat-square)](https://www.npmjs.com/package/@okta/okta-react-native)
[![build status](https://img.shields.io/travis/okta/okta-oidc-js/master.svg?style=flat-square)](https://travis-ci.org/okta/okta-oidc-js)

The Okta React Native client makes it easy to add authentication to your React Native app with Okta's [OpenID Connect API](https://developer.okta.com/docs/api/resources/oidc.html).

This library currently supports:

* [OAuth 2.0 Authorization Code Flow](https://tools.ietf.org/html/rfc6749#section-1.3.1)
* [Proof Key for Code Exchange (PKCE)](https://tools.ietf.org/html/rfc7636)

## Prerequisites

* If you do not already have a **Developer Edition Account**, you can create one at [https://developer.okta.com/signup/](https://developer.okta.com/signup/).
* If you don't have a React Native app, or are new to React Native, please continue with the [React Native Quickstart](https://github.com/react-community/create-react-native-app#getting-started) guide. It will walk you through the creation of a React Native app and other application development essentials.
* If you are developing with an Android device emulator, make sure to check out the [React Native - Android Development](https://facebook.github.io/react-native/docs/getting-started.html#android-development-environment) setup instructions.

## :warning: :construction: Alpha Preview :construction: :warning:

This library is under development and is currently in 0.x version series.  Breaking changes may be introduced at minor versions in the 0.x range.  Please lock your dependency to a specific version until this library reaches 1.x.

Need help? Contact [developers@okta.com](mailto:developers@okta.com) or use the [Okta Developer Forum](https://devforum.okta.com).

## Add an OpenID Connect Client in Okta

In Okta, applications are OpenID Connect clients that can use Okta Authorization servers to authenticate users.  Your Okta Org already has a default authorization server, so you just need to create an OIDC client that will use it.

* Log into the Okta Developer Dashboard, click **Applications** then **Add Application**.
* Choose **Native** as the platform, then submit the form the default values, which should look like this:

| Setting             | Value                                        |
| ------------------- | -------------------------------------------- |
| App Name            | My Native App                                |
| Login redirect URIs | com.oktapreview.{yourOrg}:/+expo-auth-session|
|                     | exp://localhost:19000/+expo-auth-session     |
| Grant Types Allowed | Authorization Code, Refresh Token            |

After you have created the application there are two more values you will need to gather:

| Setting       | Where to Find                                                                  |
| ------------- | ------------------------------------------------------------------------------ |
| Client ID     | In the applications list, or on the "General" tab of a specific application.   |
| Org URL       | On the home screen of the developer dashboard, in the upper right.             |

**Note:** *As with any Okta application, make sure you assign Users or Groups to the OpenID Connect Client. Otherwise, no one can use it.*

These values will be used in your React application to setup the OpenID Connect flow with Okta.

## Installation

This library is available through [npm](https://www.npmjs.com/package/@okta/okta-react-native). To install it, simply add it to your project:

```bash
npm install --save @okta/okta-react-native
```

## Configuration

Assuming you're using an app created with `create-react-native-app`, modify your `app.json` to add a `scheme`:

```javascript
{
  "expo": {
    "sdkVersion": "25.0.0",
    "scheme": "com.oktapreview.{yourOrg}"
  }
}
```

### Testing on Android Devices

There is a [known issue](https://github.com/okta/okta-sdk-appauth-android/issues/8) when redirecting back to a URI scheme from the browser via Chrome Custom Tabs. This is due to Chrome **not supporting** JavaScript initiated redirects back to native applications.

To handle this, please refer to the workaround recorded in [this issue](https://github.com/okta/okta-sdk-appauth-android/issues/8).

## Usage

You will need the values from the OIDC client that you created in the previous step to instantiate the client. You will also need to know your Okta Org URL, which you can see on the home page of the Okta Developer console.

In your application's controller, create a new instance of the `TokenClient`:

```javascript
import TokenClient from '@okta/okta-react-native';

const tokenClient = new TokenClient({
  issuer: 'https://{yourOktaDomain}.com/oauth2/default',
  client_id: '{clientId}',
  redirect_uri: __DEV__ ?
    'exp://localhost:19000/+expo-auth-session' :
    'com.oktapreview.{yourOrg}:/+expo-auth-session'
});
```

There are additional configuration options you can provide for specialized use cases:

* `authorization_endpoint` - override the authorization endpoint from the well-known endpoint
* `storageKey` - Unique key used to store/retrieve secure data
* `keychainService` - See [Expo - keychainService](https://docs.expo.io/versions/latest/sdk/securestore.html#keychainservice-string-)
* `keychainAccessible` - (iOS only) Specify when the stored item is accessible. See [Expo - keychainAccessible](https://docs.expo.io/versions/latest/sdk/securestore.html#keychainaccessible-enum-)

### `signInWithRedirect`

This method will automatically redirect users to your Okta organziation for authentication.

```javascript
await tokenClient.signInWithRedirect();
```

### `isAuthenticated`

Returns a promise that resolves `true` if there is a valid access token or ID token.

```javascript
await tokenClient.isAuthenticated();
```

### `getAccessToken`

This method returns a promise that will return the access token as a string. It ensures the access token is up-to-date and will automatically refresh expired tokens if a refresh token is available. To ensure your app receives a refresh token, request `offline_access`.

```javascript
await tokenClient.getAccessToken();
```

### `getIdToken`

This method returns a promise that will return the identity token as a string.

```javascript
await tokenClient.getIdToken();
```

### `getUser`

Returns a promise that will fetch the most up-to-date user claims from the [OpenID Connect `/userinfo`](https://developer.okta.com/docs/api/resources/oidc#userinfo) endpoint or parses the identity token claims if an access token isn't provided.

```javascript
await tokenClient.getUser();
```

### `signOut`

Terminates the tokens stored inside of [`SecureStore`](https://docs.expo.io/versions/latest/sdk/securestore.html) to clear the user session.

```javascript
await tokenClient.signOut();
```
