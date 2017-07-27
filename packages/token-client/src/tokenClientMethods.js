import queryString from 'query-string';
import storage from './storage';
import oauthUtil from './oauthUtil';
import util from './util';
import jwtUtil from './jwtUtil';
import {TokenClientError} from './errors';

const tokenClientMethods = {};
export default tokenClientMethods;

tokenClientMethods.signInWithRedirect = async (context, oauthParams) => {
  window.location = oauthUtil.prepareAuthorizationRequest(context, oauthParams);

  // To ensure that no processing happens after this,
  // return a Promise that doesn't resolve
  return new Promise(() => {});
};

tokenClientMethods.handleSignInWithRedirect = async (context, hash = window.location.hash) => {
  const resp = queryString.parse(hash);
  if (!resp.id_token && !resp.access_token && !resp.error) {
    return;
  }

  const tokens = await oauthUtil.handleOAuthResponse(context, resp);
  
  // Remove the hash, per the spec
  if (hash === window.location.hash) {
    window.location.hash = '';
  }

  return tokens;
};

tokenClientMethods.signInWithPopup = async (context, oauthParams) => {
  const supportsPostMessage = oauthUtil.supportsPostMessage(context);

  const paramOverrides = {
    display: 'popup'
  };

  let promise;
  if (supportsPostMessage) {
    paramOverrides.response_mode = 'okta_post_message';
    promise = oauthUtil.waitForPostMessage(context, oauthParams);
  } else {
    paramOverrides.response_mode = 'fragment';
  }
  
  const authorizeUrl = oauthUtil.prepareAuthorizationRequest(context, oauthParams, paramOverrides);

  const popup = oauthUtil.createPopup(authorizeUrl);

  if (!supportsPostMessage) {
    promise = oauthUtil.pollUrlForResponse(context, oauthParams, popup, 'hash');
  }

  let resp;
  try {
    resp = await promise;
  } finally {
    !popup.closed && popup.close();
  }

  // handle the response
  return oauthUtil.handleOAuthResponse(context, resp);
};

tokenClientMethods.signInSilently = async (context, oauthParams) => {
  const supportsPostMessage = oauthUtil.supportsPostMessage(context);

  const paramOverrides = {
    prompt: 'none'
  };

  delete oauthParams.display;

  let promise;
  if (supportsPostMessage) {
    paramOverrides.response_mode = 'okta_post_message';
    promise = oauthUtil.waitForPostMessage(context, oauthParams);
  } else {
    paramOverrides.response_mode = 'fragment';
  }
  
  const authorizeUrl = oauthUtil.prepareAuthorizationRequest(context, oauthParams, paramOverrides);

  const iframe = oauthUtil.createIframe(authorizeUrl);

  if (!supportsPostMessage) {
    promise = oauthUtil.pollUrlForResponse(context, oauthParams, iframe, 'hash');
  }

  let resp;
  try {
    resp = await promise;
  } finally {
    document.body.contains(iframe) && iframe.parentElement.removeChild(iframe);
  }

  // handle the response
  return oauthUtil.handleOAuthResponse(context, resp);
};

tokenClientMethods.signOutWithRedirect = async (context, {post_logout_redirect_uri, state}) => {
  const signOutUrl = oauthUtil.buildSignOutUrl(context, {post_logout_redirect_uri, state});
  oauthUtil.resetStorage(context);
  window.location = signOutUrl;

  // To ensure that no processing happens after this,
  // return a Promise that doesn't resolve
  return new Promise(() => {});
};

tokenClientMethods.handleSignOutWithRedirect = async () => queryString.parse(window.location.search);

tokenClientMethods.signOutSilently = async (context, options = {}) => {
  const {post_logout_redirect_uri, state} = options;
  const isOkta = oauthUtil.supportsPostMessage(context);

  if (isOkta) {
    const oktaUrl = util.getOrigin(context.issuer);
    await fetch(`${oktaUrl}/api/v1/sessions/me`, {
      method: 'delete',
      credentials: 'include'
    });
    // we can't reset the storage until we successfully delete the cookie
    oauthUtil.resetStorage(context);
    return;
  }

  const params = {
    state: state || util.randomString(),
    post_logout_redirect_uri
  };

  const signOutUrl = oauthUtil.buildSignOutUrl(context, params);
  const iframe = oauthUtil.createIframe(signOutUrl);
  const promise = oauthUtil.pollUrlForResponse(context, params, iframe, 'search');

  let resp;
  try {
    resp = await promise;
    oauthUtil.resetStorage(context);
  } finally {
    document.body.contains(iframe) && iframe.parentElement.removeChild(iframe);
  }

  return resp;
};

tokenClientMethods.getAccessToken = async context => {
  const accessToken = context.getAccessToken();
  if (accessToken && accessToken.expiration * 1000 > Date.now()) {
    return accessToken;
  }
  const tokens = await oauthUtil.renewTokens(context);
  return tokens.accessToken;
};

tokenClientMethods.getIdToken = async context => {
  const idToken = context.getIdToken();
  if (idToken && idToken.expiration * 1000 > Date.now()) {
    return idToken;
  }
  const tokens = await oauthUtil.renewTokens(context);
  return tokens.idToken;
};

tokenClientMethods.getUser = async context => {
  let user = context.getUser();
  if (user && user.expiration * 1000 > Date.now()) {
    return user;
  }
  context.removeUser();

  user = {};

  const idToken = await context.getIdTokenMethod();
  const accessToken = await context.getAccessTokenMethod();

  if (!idToken && !accessToken) {
    return;
  }

  if (idToken && accessToken) {
    user.idToken = idToken;
    user.accessToken = accessToken;
    user.expiration = Math.min(idToken.expiration, accessToken.expiration);
  } else if (idToken) {
    user.idToken = idToken;
    user.expiration = idToken.expiration;
  } else {
    user.accessToken = accessToken;
    user.expiration = accessToken.expiration;
  }

  if (idToken && !accessToken) {
    user.profile = util.omit(idToken.claims, [
      'ver',
      'iss',
      'aud',
      'iat',
      'exp',
      'amr',
      'jti',
      'auth_time',
      'nonce',
      'at_hash',
      'c_hash'
    ]);

    return user;
  }

  const userinfo_endpoint = oauthUtil.getEndpoint(context, 'userinfo_endpoint');
  const userInfoResp = await fetch(userinfo_endpoint, {
    headers: {
      'Authorization': `Bearer ${accessToken.string}`
    }
  });

  try {
    user.profile = await userInfoResp.json();
  } catch (e) {
    throw new TokenClientError(`Unable to retrieve userinfo: ${e.message}`);
  }

  context.setUser(user);
  return user;
};
