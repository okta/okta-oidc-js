# Okta React Native

The Okta React Native client makes it easy to add authentication to your React Native app with Okta's [OpenID Connect API](https://developer.okta.com/docs/api/resources/oidc.html).

This library currently supports:

* [OAuth 2.0 Authorization Code Flow](https://tools.ietf.org/html/rfc6749#section-1.3.1)
* [Proof Key for Code Exchange (PKCE)](https://tools.ietf.org/html/rfc7636)

## Prerequisites
* If you do not already have a **Developer Edition Account**, you can create one at [https://developer.okta.com/signup/](https://developer.okta.com/signup/).
* If you don't have a React Native app, or are new to React Native, please continue with the [React Native Quickstart](https://github.com/react-community/create-react-native-app#getting-started) guide. It will walk you through the creation of a React Native app and other application development essentials.

## Add an OpenID Connect Client in Okta
In Okta, applications are OpenID Connect clients that can use Okta Authorization servers to authenticate users.  Your Okta Org already has a default authorization server, so you just need to create an OIDC client that will use it.
* Log into the Okta Developer Dashboard, click **Applications** then **Add Application**.
* Choose **Native** as the platform, then submit the form the default values, which should look like this:

| Setting             | Value                                        |
| ------------------- | -------------------------------------------- |
| App Name            | My Native App                                |
| Base URIs           | http://localhost:{port}                      |
| Login redirect URIs | com.oktapreview.{yourOrg}:/callback          |
|                     | exp://localhost:19000/+expo-auth-session     |
| Grant Types Allowed | Authorization Code, Refresh Token            |

After you have created the application there are two more values you will need to gather:

| Setting       | Where to Find                                                                  |
| ------------- | ------------------------------------------------------------------------------ |
| Client ID     | In the applications list, or on the "General" tab of a specific application.   |
| Org URL       | On the home screen of the developer dashboard, in the upper right.             |

**Note:** *As with any Okta application, make sure you assign Users or Groups to the OpenID Connect Client. Otherwise, no one can use it.*

> If using the [Resource Owner Password Grant](https://tools.ietf.org/html/rfc6749#section-1.3.3), make sure to select it in the **Allowed Grant Types** and select **Client authentication**.

These values will be used in your React application to setup the OpenID Connect flow with Okta.

## Installation

This library is available through [npm](https://www.npmjs.com/package/@okta/okta-react-native). To install it, simply add it to your project:

```bash
npm install --save @okta/okta-react-native
```

## Configuration

Assuming you're using an app created with `create-react-native-app`, you should modify your `app.json` to add a `scheme`:

```javascript
{
  "expo": {
    "sdkVersion": "25.0.0",
    "scheme": "com.oktapreview.{yourOrg}"
  }
}
```

## Usage

`okta-react-native` exposes methods to enable authentication in your React Native app.


