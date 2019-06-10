# react-native-okta-sdk-bridge

## Getting started

`$ npm install react-native-okta-sdk-bridge --save`

### Mostly automatic installation

`$ react-native link react-native-okta-sdk-bridge`

### Manual installation


#### iOS

1. In XCode, in the project navigator, right click `Libraries` ➜ `Add Files to [your project's name]`
2. Go to `node_modules` ➜ `react-native-okta-sdk-bridge` and add `OktaSdkBridge.xcodeproj`
3. In XCode, in the project navigator, select your project. Add `libOktaSdkBridge.a` to your project's `Build Phases` ➜ `Link Binary With Libraries`
4. Run your project (`Cmd+R`)<

#### Android

1. Open up `android/app/src/main/java/[...]/MainApplication.java`
  - Add `import com.reactlibrary.OktaSdkBridgePackage;` to the imports at the top of the file
  - Add `new OktaSdkBridgePackage()` to the list returned by the `getPackages()` method
2. Append the following lines to `android/settings.gradle`:
  	```
  	include ':react-native-okta-sdk-bridge'
  	project(':react-native-okta-sdk-bridge').projectDir = new File(rootProject.projectDir, 	'../node_modules/react-native-okta-sdk-bridge/android')
  	```
3. Insert the following lines inside the dependencies block in `android/app/build.gradle`:
  	```
      compile project(':react-native-okta-sdk-bridge')
  	```


## Usage
```javascript
import OktaSdkBridge from 'react-native-okta-sdk-bridge';

// TODO: What to do with the module?
OktaSdkBridge;
```
