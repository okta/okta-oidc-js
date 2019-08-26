/*
 * Copyright (c) 2019, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { NativeModules, Platform, DeviceEventEmitter, NativeEventEmitter } from 'react-native';
import { assertIssuer, assertClientId, assertRedirectUri } from '@okta/configuration-validation';
import jwt from 'jwt-lite';

export const createConfig = async({
  clientId,
  redirectUri, 
  endSessionRedirectUri, 
  discoveryUri,
  scopes,
  requireHardwareBackedKeyStore
}) => {

  assertIssuer(discoveryUri);
  assertClientId(clientId);
  assertRedirectUri(redirectUri);
  assertRedirectUri(endSessionRedirectUri);

  if (Platform.OS === 'ios') {
    scopes = scopes.join(' ');
    return NativeModules.OktaSdkBridge.createConfig(
      clientId,
      redirectUri,
      endSessionRedirectUri,
      discoveryUri,
      scopes
    );
  }
    
  return NativeModules.OktaSdkBridge.createConfig(
    clientId,
    redirectUri,
    endSessionRedirectUri,
    discoveryUri,
    scopes,
    requireHardwareBackedKeyStore
  );
} 

export const signIn = async() => {
  return NativeModules.OktaSdkBridge.signIn();
}

export const signOut = async() => {
  return NativeModules.OktaSdkBridge.signOut();
}

export const getAccessToken = async() => {
  return NativeModules.OktaSdkBridge.getAccessToken();
}

export const getIdToken = async() => {
  return NativeModules.OktaSdkBridge.getIdToken();
}

export const getUser = async() => {
  return NativeModules.OktaSdkBridge.getUser();
}

export const getUserFromIdToken = async() => {
  let idTokenResponse = await getIdToken();
  return jwt.decode(idTokenResponse.id_token).claimsSet;
}

export const isAuthenticated = async() => {
  return NativeModules.OktaSdkBridge.isAuthenticated();
}

export const revokeAccessToken = async() => {
  return NativeModules.OktaSdkBridge.revokeAccessToken();
}

export const revokeIdToken = async() => {
  return NativeModules.OktaSdkBridge.revokeIdToken();
}

export const revokeRefreshToken = async() => {
  return NativeModules.OktaSdkBridge.revokeRefreshToken();
}

export const introspectAccessToken = async() => {
  return NativeModules.OktaSdkBridge.introspectAccessToken(); 
}

export const introspectIdToken = async() => {
  return NativeModules.OktaSdkBridge.introspectIdToken(); 
}

export const introspectRefreshToken = async() => {
  return NativeModules.OktaSdkBridge.introspectRefreshToken(); 
}

export const refreshTokens = async() => {
  return NativeModules.OktaSdkBridge.refreshTokens(); 
}

export const EventEmitter = new NativeEventEmitter(NativeModules.OktaSdkBridge);