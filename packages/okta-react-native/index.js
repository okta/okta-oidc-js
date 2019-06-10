import { NativeModules } from 'react-native';

// const { OktaSdkBridge } = NativeModules;

export const createConfig = async (
    clientId,
    redirectUri, 
    endSessionRedirectUri, 
    discoveryUri,
    scopes) => {
    
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

// export const signOut = async () => {
//     return NativeModules.OktaSdkBridge.signOut();
// }
