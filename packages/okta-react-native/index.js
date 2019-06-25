import { NativeModules, Platform } from 'react-native';
import {
    assertIssuer,
    assertClientId,
    assertRedirectUri
  } from '@okta/configuration-validation';
import jwt from 'jwt-lite';

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

    if (Platform.OS === 'ios') {
        scopes = scopes.join();
        scopes = scopes.replace(/,/g, ' ');
    }
    
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

export const getUserFromIdToken = async() => {
    try {
        let idTokenResponse = await getIdToken();
        return jwt.decode(idTokenResponse.id_token).claimsSet;
    } catch(error) {
        throw error;
    } 
}

export const isAuthenticated = async () => {
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