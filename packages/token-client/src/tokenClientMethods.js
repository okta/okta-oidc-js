/* eslint no-restricted-globals: 0 */ // for the location references

import queryString from 'query-string';
import storage from './storage';
import oauthUtil from './oauthUtil';
import util from './util';
import jwtUtil from './jwtUtil';
import {TokenClientError} from './errors';

const tokenClientMethods = {};
export default tokenClientMethods;

tokenClientMethods.loginWithRedirect = async (context, oauthParams) => {
  context.config = await oauthUtil.getWellKnownConfig(context);
  oauthParams = Object.assign(context.oauthDefaults, oauthParams);
  oauthParams = oauthUtil.buildOAuthParams(oauthParams);
  context.setRequestParams(oauthParams);
  window.location = oauthUtil.buildAuthorizeUrl(context, oauthParams);

  // To ensure that no processing happens after this,
  // return a Promise that doesn't resolve
  return new Promise(() => {});
};

tokenClientMethods.loginSilently = async (context, oauthParams) => {
  context.config = await oauthUtil.getWellKnownConfig(context);
  oauthParams = Object.assign(context.oauthDefaults, oauthParams);
  oauthParams = oauthUtil.buildOAuthParams(oauthParams);
  context.setRequestParams(oauthParams);

  oauthParams.prompt = 'none';
  oauthParams.responseMode = 'okta_post_message';

  // listen on postMessage
  const promise = new Promise((resolve, reject) => {
    window.addEventListener('message', e => {
      try {
        const issuerOrigin = util.getOrigin(context.config.issuer);
        if (!e.data || e.data.state !== oauthParams.state || e.origin !== issuerOrigin) {
          return;
        }
        resolve(e.data);
      } catch(err) {
        reject(new TokenClientError(`Unable to handle the postMessage response: ${err.message}`));
      }
    });
  });

  const authorizeUrl = oauthUtil.buildAuthorizeUrl(oauthParams);
  const iframe = oauthUtil.createIframe(authorizeUrl);
  const resp = await promise;
  if (document.body.contains(iframe)) {
    iframe.parentElement.removeChild(iframe);
  }

  // handle the response
  return oauthUtil.handleOAuthResponse(context, resp);
};

tokenClientMethods.logoutWithRedirect = async (context, {postLogoutRedirectUri, state}) => {
  context.config = await oauthUtil.getWellKnownConfig(context);
  if (!context.config.end_session_endpoint) {
    throw new TokenClientError('No end_session_endpoint is defined to redirect to');
  }
  const idToken = storage.getIdToken(context);
  if (!idToken) {
    throw new TokenClientError('Unable to log out, because a user is not logged in');
  }
  oauthUtil.resetStorage(context, {
    emitEvents: false
  });
  const queryParams = queryString.stringify({
    id_token_hint: idToken,
    post_logout_redirect_uri: postLogoutRedirectUri,
    state
  });
  window.location = `${context.config.end_session_endpoint}?${queryParams}`;

  // To ensure that no processing happens after this,
  // return a Promise that doesn't resolve
  return new Promise(() => {});
};

tokenClientMethods.logoutSilently = async context => {
  context.config = await oauthUtil.getWellKnownConfig(context);
  const oktaUrl = util.getOrigin(context.config.issuer);
  await fetch(`${oktaUrl}/api/v1/sessions/me`, {
    method: 'delete',
    credentials: 'include'
  });
  // we can't reset the storage until we successfully delete the cookie
  oauthUtil.resetStorage(context);
};

tokenClientMethods.parseFromUri = async context => {
  context.config = await oauthUtil.getWellKnownConfig(context);
  const resp = queryString.parse(location.hash);
  if (!resp.id_token && !resp.access_token && !resp.error) {
    return;
  }
  const tokens = await oauthUtil.handleOAuthResponse(context, resp);
  location.hash = '';
  return tokens;
};

tokenClientMethods.isAccessTokenExpired = context => {
  const accessToken = context.getAccessToken();
  if (accessToken && Date.now() < accessToken.expiresAt) {
    return false;
  }
  return true;
};

tokenClientMethods.isIdTokenExpired = context => {
  const idToken = context.getIdToken();
  if (idToken && Date.now() < idToken.expiresAt) {
    return false;
  }
  return true;
};

tokenClientMethods.renewTokens = async context => {
  return await oauthUtil.renewTokens(context);
};

tokenClientMethods.refreshUserInfo = async context => {
  context.config = await oauthUtil.getWellKnownConfig(context);
  if (!context.isAccessTokenExpired() && context.isIdTokenExpired()) {
    await context.renewTokens();
  }
  let userInfo;
  // if we have everything to hit the userinfo endpoint
  const accessToken = context.getAccessTokenString();
  if (accessToken && context.config.userinfo_endpoint) {
    const userInfoResp = await fetch(context.config.userinfo_endpoint, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    try {
      userInfo = await userInfoResp.json();
    } catch (e) {
      throw new TokenClientError(`Unable to retrieve userinfo: ${e.message}`);
    }
  // if we only have an idToken
  } else if (context.getIdToken()) {
    const idTokenJwt = jwtUtil.decode(context.getIdToken().string);
    const claims = idTokenJwt.payload;
    userInfo = util.omit(claims, [
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
  }
  const existingUserInfo = context.getUser();
  if (userInfo) {
    context.setUser(userInfo);
  } else {
    context.removeUser();
  }
  context.eventEmitter.emit('user_changed', userInfo, existingUserInfo);
  return userInfo;
};
