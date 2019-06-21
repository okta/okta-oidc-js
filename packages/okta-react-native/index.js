import { NativeModules } from 'react-native';
import {
    assertIssuer,
    assertClientId,
    assertRedirectUri
  } from '@okta/configuration-validation';


export const createConfig = async (
    clientId,
    redirectUri, 
    endSessionRedirectUri, 
    discoveryUri,
    scopes) => {

    assertIssuer(discoveryUri);
    assertClientId(clientId);
    assertRedirectUri(redirectUri);
    assertRedirectUri(endSessionRedirectUri);
    
    return NativeModules.OktaSdkBridge.createConfig(
        clientId,
        redirectUri,
        endSessionRedirectUri,
        discoveryUri,
        scopes
        );
} 

export const signIn = async () => {
    return NativeModules.OktaSdkBridge.signIn();
}

export const signOut = async () => {
    return NativeModules.OktaSdkBridge.signOut();
}

export const getAccessToken = async () => {
    return NativeModules.OktaSdkBridge.getAccessToken();
}

export const getIdToken = async () => {
    return NativeModules.OktaSdkBridge.getIdToken();
}

export const getUser = async () => {
    return NativeModules.OktaSdkBridge.getUser();
}

export const isAuthenticated = async () => {
    return NativeModules.OktaSdkBridge.isAuthenticated();
}

export const sampleMethod = async () => {
    return NativeModules.OktaSdkBridge.sampleMethod();
}

// export const NativeModules;
