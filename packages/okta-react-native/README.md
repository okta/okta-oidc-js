# Okta React Native

[![npm version](https://img.shields.io/npm/v/@okta/okta-react-native.svg?style=flat-square)](https://www.npmjs.com/package/@okta/okta-react-native)
[![build status](https://img.shields.io/travis/okta/okta-oidc-js/master.svg?style=flat-square)](https://travis-ci.org/okta/okta-oidc-js)

The Okta React Native library makes it easy to add authentication to your React Native app. This library is a wrapper around [Okta OIDC Android](https://github.com/okta/okta-oidc-android) and [Okta OIDC iOS](https://github.com/okta/okta-oidc-ios).

This library follows the current best practice for native apps using:

* [OAuth 2.0 Authorization Code Flow](https://tools.ietf.org/html/rfc6749#section-1.3.1)
* [Proof Key for Code Exchange (PKCE)](https://tools.ietf.org/html/rfc7636)

## Prerequisites

* If you do not already have a **Developer Edition Account**, you can create one at [https://developer.okta.com/signup/](https://developer.okta.com/signup/).
* If you don't have a React Native app, or are new to React Native, please continue with the [React Native CLI Quickstart](https://facebook.github.io/react-native/docs/getting-started) guide. It will walk you through the creation of a React Native app and other application development essentials.
* If you are developing with an Android device emulator, make sure to check out the [React Native - Android Development](https://facebook.github.io/react-native/docs/getting-started.html#android-development-environment) setup instructions.

## Add an OpenID Connect Client in Okta

In Okta, applications are OpenID Connect clients that can use Okta Authorization servers to authenticate users.  Your Okta Org already has a default authorization server, so you just need to create an OIDC client that will use it.

* Log into the Okta Developer Dashboard, click **Applications** then **Add Application**.
* Choose **Native** as the platform, then submit the form the default values, which should look like this:

| Setting             | Value                                        |
| ------------------- | -------------------------------------------- |
| App Name            | {YOUR APP NAME}                              |
| Login redirect URIs | {YOUR_REDIRECT_URL}                          |
| Grant Types Allowed | {PICK_YOUR_SCOPES}                           |

After you have created the application there are two more values you will need to gather:

| Setting       | Where to Find                                                                  |
| ------------- | ------------------------------------------------------------------------------ |
| Client ID     | In the applications list, or on the "General" tab of a specific application.   |
| Org URL       | On the home screen of the developer dashboard, in the upper right.             |

**Note:** *As with any Okta application, make sure you assign Users or Groups to the OpenID Connect Client. Otherwise, no one can use it.*

These values will be used in your React application to setup the OpenID Connect flow with Okta.

## Getting started

This library is available through [npm](https://www.npmjs.com/package/@okta/okta-react-native). To install it, simply add it to your project:

```
$ npm install @okta/okta-react-native --save
$ react-native link @okta/okta-react-native
```

Perform the following Manual installation steps if you're not using `react-native link`.

### Manual installation

#### iOS

1. In XCode, in the project navigator, right click `Libraries` ➜ `Add Files to [your project's name]`
2. Go to `node_modules` ➜ `@okta/okta-react-native` and add `ReactNativeOktaSdkBridge.xcodeproj`
3. In XCode, in the project navigator, select your project. Add `libReactNativeOktaSdkBridge.a` to your project's `Build Phases` ➜ `Link Binary With Libraries`
4. Run your project (`Cmd+R`)<

#### Android

1. Open up `android/app/src/main/java/[...]/MainApplication.java`
  - Add `import com.oktareactnative.OktaSdkBridgePackage;` to the imports at the top of the file
  - Add `new OktaSdkBridgePackage()` to the list returned by the `getPackages()` method
2. Append the following lines to `android/settings.gradle`:
  	```
  	include ':@okta/okta-react-native'
  	project(':@okta/okta-react-native').projectDir = new File(rootProject.projectDir, '../node_modules/@okta/okta-react-native/android')
  	```
3. Insert the following lines inside the dependencies block in `android/app/build.gradle`:
  	```
      compile project(':@okta_okta-react-native')
  	```

## Setup

### iOS Setup

#### Install Okta Open ID Connect iOS
This library depends on the native [Okta OIDC iOS](https://github.com/okta/okta-oidc-ios) library. This library is not distributed as part of the React Native library to keep your dependency management consistent. 

There are three ways to add Okta OIDC iOS to your dependencies:

1. **CocoaPods**
   With [CocoaPods](https://guides.cocoapods.org/using/getting-started.html), add the following line to
   your `Podfile`:
       
		pod 'OktaOidc'
			 
   Then run `pod install`.

2. **Carthage**
	 To integrate this SDK into your Xcode project using [Carthage](https://github.com/Carthage/Carthage), specify it in your `Cartfile`:
 		 
		github "okta/okta-oidc-ios"		 

	 Then run `carthage update --platform iOS`.

   Drag and drop `OktaOidc.framework` from `ios/Carthage/Build/iOS` to `Frameworks` in Xcode.

   Add a copy files build step for `OktaOidc.framework`: open Build Phases on Xcode, add a new "Cope Files" phase, choose "Frameworks" as destination, add `OktaOidc.framework` and ensure "Code Sign on Copy" is checked.			

3. **Static Library**
 	 This requires linking the Okta OIDC iOS and your project, and including the headers. 
	 Suggested configuration:

   1. Create an XCode Workspace.
   2. Add `okta-oidc.xcodeproj` to your Workspace.
   3. Include `OktaOidc.framework` as a linked framework for your target (in the "General -> Linked Framework and
      Libraries" section of your target).
   4. Add `okta-oidc/okta-oidc/Okta` to your search paths of your target ("Build Settings -> "Header Search
      Paths").

#### Swift Configuration
Since React Native uses Objective-C, and Okta React Native library is a swift wrapper, you will need to have at least one Swift file in your iOS project for the project to compile. To do this, follow the following steps:

1. Right click on your project, then `New file`.
2. Select `Swift file`, enter a title, and save.
3. Go to `Build Settings`, look for `Swift Compiler - Language`, set `Swift Language Version` to `4.2`.

<!-- #### Register redirect URL scheme
If you intend to support iOS 10 and older, you must specify a unique URI to your app:

1. Open the iOS folder in Xcode
2. Open `info.plist`, and create a new row called `URL types`
3. Expand `URL types`, and expand `Item 0`, then choose `URL Schemes`
4. Under `URL Schemes`, add your scheme to `Item 0` -->

### Android Setup

#### Install Okta Open ID Connect Android
This library depends on the native [Okta OIDC Android](https://github.com/okta/okta-oidc-android) library. You have to add this library through Gradle. Follow the following steps:

1. Add this line to `android/build.gradle`, under `allprojects` -> `repositories`.

		maven {
			url  "https://dl.bintray.com/okta/com.okta.android"
			}
		
2. Make sure your `minSdkVersion` is `19` in `android/build.gradle`.

#### Add redirect scheme

Defining a redirect scheme to capture the authorization redirect. In `android/app/build.gradle`, under `android` -> `defaultConfig, add:
```
manifestPlaceholders = [
  appAuthRedirectScheme: '{YOUR_REDIRECT_SCHEME}'
]
```

## Usage

You will need the values from the OIDC client that you created in the previous step to instantiate the client. You will also need to know your Okta Org URL, which you can see on the home page of the Okta Developer console.

Before calling any other method, it is important that you call `createConfig` to set up the configuration properly on the native modules.

Importing methods would follow this pattern: 

```javascript
import { createConfig, signIn, signOut, getAccessToken } from '@okta/okta-react-native';
```

### `createConfig`

This method will create a configured client on the native modules.

```javascript
await createConfig(
	'<YOUR_CLIENT_ID>', 
	'<YOUR_REDIRECT_URL>', 
	'<YOUR_END_SESSION_REDIRECT_URL>', 
	'<YOUR_ISSUER_URL>', 
	['<YOUR_SCOPES_ARRAY>']);
``` 

### `signIn`

This method will automatically redirect users to your Okta organziation for authentication.

```javascript
await signIn();
```

### `isAuthenticated`

Returns a promise that resolves `true` if there is a valid access token or ID token.

```javascript
await isAuthenticated();
```

### `getAccessToken`

This method returns a promise that will return the access token as a string. It ensures the access token is up-to-date and will automatically refresh expired tokens if a refresh token is available. To ensure your app receives a refresh token, request `offline_access`.

```javascript
await getAccessToken();
```

### `getIdToken`

This method returns a promise that will return the identity token as a string.

```javascript
await getIdToken();
```

### `getUser`

Returns a promise that will fetch the most up-to-date user claims from the [OpenID Connect `/userinfo`](https://developer.okta.com/docs/api/resources/oidc#userinfo) endpoint.

```javascript
await getUser();
```

### `getUserFromIdToken`

Returns the user claims decoded from the identity token.

```javascript
await getUserFromIdToken();
```

### `signOut`

Clear the browser session and clear the app session (stored tokens) in memory. 

```javascript
await signOut();
```

### `revokeAccessToken`

Revoke the access token to make it inactive.

```javascript
await revokeAccessToken();
```

### `revokeIdToken`

Revoke the identity token to make it inactive.

```javascript
await revokeIdToken();
```

### `revokeRefreshToken`

Revoke the refresh token to make it inactive.

```javascript
await revokeRefreshToken();
```