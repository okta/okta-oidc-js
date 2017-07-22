import EventEmitter from 'eventemitter3';
import storage from './storage';
import tokenClientMethods from './tokenClientMethods';
import {TokenClientError} from './errors';

export default class TokenClient {
  constructor({clientId, issuer, wellKnownConfiguration, redirectUri, maxClockSkew, ...oauthDefaults}) {
    const client = this;
    if (!clientId) throw new TokenClientError('Must provide a clientId');
    if (!redirectUri) throw new TokenClientError('Must provide a redirectUri');
    if (!issuer && !wellKnownConfiguration) {
      throw new TokenClientError('Must provide an issuer or wellKnownConfiguration');
    }

    oauthDefaults = oauthDefaults || {};
    oauthDefaults.clientId = clientId;
    oauthDefaults.redirectUri = redirectUri;

    // create private methods and properties
    const privateContext = {
      wellKnownConfiguration: wellKnownConfiguration || `${issuer}/.well-known/openid-configuration`,
      maxClockSkew: maxClockSkew || 300,
      eventEmitter: new EventEmitter(),
      oauthDefaults
    };

    const idTokenKey = `tc_${clientId}_id_token`;
    privateContext.getIdToken = () => storage.getJSON(idTokenKey);
    privateContext.getIdTokenString = () => {
      const idToken = privateContext.getIdToken();
      return idToken && idToken.string;
    };
    privateContext.setIdToken = token => storage.setJSON(idTokenKey, token);
    privateContext.removeIdToken = () => storage.removeItem(idTokenKey);

    const accessTokenKey = `tc_${clientId}_access_token`;
    privateContext.getAccessToken = () => storage.getJSON(accessTokenKey);
    privateContext.getAccessTokenString = () => {
      const accessToken = privateContext.getAccessToken();
      return accessToken && accessToken.string;
    };
    privateContext.setAccessToken = token => storage.setJSON(accessTokenKey, token);
    privateContext.removeAccessToken = () => storage.removeItem(accessTokenKey);

    const userKey = `tc_${clientId}_user`;
    privateContext.getUser = () => storage.getJSON(userKey);
    privateContext.setUser = user => storage.setJSON(userKey, user);
    privateContext.removeUser = () => storage.removeItem(userKey);

    const requestParamsKey = `tc_${clientId}_request_params`;
    privateContext.getRequestParams = () => storage.getJSON(requestParamsKey);
    privateContext.setRequestParams = params => storage.setJSON(requestParamsKey, params);
    privateContext.removeRequestParams = () => storage.removeItem(requestParamsKey);

    privateContext.loginWithRedirect = tokenClientMethods.loginWithRedirect.bind(null, privateContext);
    privateContext.loginSilently = tokenClientMethods.loginSilently.bind(null, privateContext);
    privateContext.logoutWithRedirect = tokenClientMethods.logoutWithRedirect.bind(null, privateContext);
    privateContext.logoutSilently = tokenClientMethods.logoutSilently.bind(null, privateContext);
    privateContext.parseFromUri = tokenClientMethods.parseFromUri.bind(null, privateContext);
    privateContext.isAccessTokenExpired = tokenClientMethods.isAccessTokenExpired.bind(null, privateContext);
    privateContext.isIdTokenExpired = tokenClientMethods.isIdTokenExpired.bind(null, privateContext);
    privateContext.renewTokens = tokenClientMethods.renewTokens.bind(null, privateContext);
    privateContext.refreshUserInfo = tokenClientMethods.refreshUserInfo.bind(null, privateContext);

    // add public methods
    client.on = privateContext.eventEmitter.on.bind(privateContext.eventEmitter);
    client.loginWithRedirect = privateContext.loginWithRedirect;
    client.loginSilently = privateContext.loginSilently;
    client.logoutWithRedirect = privateContext.logoutWithRedirect;
    client.logoutSilently = privateContext.logoutSilently;
    client.parseFromUri = privateContext.parseFromUri;
    client.isAccessTokenExpired = privateContext.isAccessTokenExpired;
    client.isIdTokenExpired = privateContext.isIdTokenExpired;
    client.renewTokens = privateContext.renewTokens;
    client.refreshUserInfo = privateContext.refreshUserInfo;

    Object.defineProperties(client, {
      currentAccessToken: {
        get: privateContext.getAccessTokenString,
        enumerable: true
      },
      currentIdToken: {
        get: privateContext.getIdTokenString,
        enumerable: true
      },
      currentUser: {
        get: privateContext.getUser,
        enumerable: true
      }
    });
  }
}