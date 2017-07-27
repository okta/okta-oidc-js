import storage from './storage';
import tokenClientMethods from './tokenClientMethods';
import oauthUtil from './oauthUtil';
import util from './util';
import {TokenClientError} from './errors';

export default class TokenClient {
  constructor(options) {
    const client = this;

    // Manually pull out oauthDefaults until https://github.com/tc39/proposal-object-rest-spread
    // is Finished.
    const {
      client_id,
      issuer,
      redirect_uri,
      end_session_endpoint,
      authorization_endpoint,
      jwks_uri,
      post_logout_redirect_uri,
      userinfo_endpoint,
      maxClockSkew
    } = options;

    // Anything that we don't explicitly ask for will be passed in our oauth requests
    let oauthDefaults = util.omit(options, [
      'client_id',
      'issuer',
      'redirect_uri',
      'end_session_endpoint',
      'authorization_endpoint',
      'jwks_uri',
      'post_logout_redirect_uri',
      'userinfo_endpoint',
      'maxClockSkew'
    ]);

    if (!client_id) throw new TokenClientError('Must provide a client_id');
    if (!redirect_uri) throw new TokenClientError('Must provide a redirect_uri');
    if (!issuer) throw new TokenClientError('Must provide an issuer');

    oauthDefaults = oauthDefaults || {};
    oauthDefaults.client_id = client_id;
    oauthDefaults.redirect_uri = redirect_uri;

    const definedEndpoints = {
      end_session_endpoint,
      authorization_endpoint,
      jwks_uri,
      post_logout_redirect_uri,
      userinfo_endpoint
    };

    // create private methods and properties
    const privateContext = {
      maxClockSkew: maxClockSkew || 300,
      oauthDefaults,
      definedEndpoints,
      issuer
    };

    const idTokenKey = `tc_${client_id}_id_token`;
    privateContext.getIdToken = () => storage.getJSON(idTokenKey);
    privateContext.setIdToken = token => storage.setJSON(idTokenKey, token);
    privateContext.removeIdToken = () => storage.removeItem(idTokenKey);

    const accessTokenKey = `tc_${client_id}_access_token`;
    privateContext.getAccessToken = () => storage.getJSON(accessTokenKey);
    privateContext.setAccessToken = token => storage.setJSON(accessTokenKey, token);
    privateContext.removeAccessToken = () => storage.removeItem(accessTokenKey);

    const userKey = `tc_${client_id}_user`;
    privateContext.getUser = () => storage.getJSON(userKey);
    privateContext.setUser = user => storage.setJSON(userKey, user);
    privateContext.removeUser = () => storage.removeItem(userKey);

    const requestParamsKey = `tc_${client_id}_request_params`;
    privateContext.getRequestParams = () => storage.getJSON(requestParamsKey);
    privateContext.setRequestParams = params => storage.setJSON(requestParamsKey, params);
    privateContext.removeRequestParams = () => storage.removeItem(requestParamsKey);

    function prepFunction(fn) {
      const contextBound = fn.bind(null, privateContext);
      return async function(...args) {
        privateContext.config = await oauthUtil.getWellKnownConfig(privateContext);
        return contextBound.apply(null, args);
      }
    }

    privateContext.signInWithRedirect = prepFunction(tokenClientMethods.signInWithRedirect);
    privateContext.handleSignInWithRedirect = prepFunction(tokenClientMethods.handleSignInWithRedirect);
    privateContext.signInWithPopup = prepFunction(tokenClientMethods.signInWithPopup);
    privateContext.signInSilently = prepFunction(tokenClientMethods.signInSilently);
    privateContext.signOutWithRedirect = prepFunction(tokenClientMethods.signOutWithRedirect);
    privateContext.handleSignOutWithRedirect = prepFunction(tokenClientMethods.handleSignOutWithRedirect);
    privateContext.signOutSilently = prepFunction(tokenClientMethods.signOutSilently);
    privateContext.getAccessTokenMethod = prepFunction(tokenClientMethods.getAccessToken);
    privateContext.getIdTokenMethod = prepFunction(tokenClientMethods.getIdToken);
    privateContext.getUserMethod = prepFunction(tokenClientMethods.getUser);

    // add public methods
    client.signInWithRedirect = privateContext.signInWithRedirect;
    client.handleSignInWithRedirect = privateContext.handleSignInWithRedirect;
    client.signInWithPopup = privateContext.signInWithPopup;
    client.signInSilently = privateContext.signInSilently;
    client.signOutWithRedirect = privateContext.signOutWithRedirect;
    client.handleSignOutWithRedirect = privateContext.handleSignOutWithRedirect;
    client.signOutSilently = privateContext.signOutSilently;
    client.getAccessToken = privateContext.getAccessTokenMethod;
    client.getIdToken = privateContext.getIdTokenMethod;
    client.getUser = privateContext.getUserMethod;
  }
}