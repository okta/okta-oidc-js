import queryString from 'query-string';
import {TokenClientError, OAuthError, TokenValidationError} from './errors';
import util from './util';
import jwtUtil from './jwtUtil';

const oauthUtil = {};
export default oauthUtil;

oauthUtil.getWellKnownConfig = async context => {
  if (context.config) {
    return context.config;
  }

  const wellKnown = context.issuer + '/.well-known/openid-configuration';
  try {
    const resp = await fetch(wellKnown);
    if (!resp.ok) {
      throw Error(resp.statusText);
    }
    return await resp.json();
  } catch (e) {
    console.log(`Unable to get configuration from ${wellKnown}: ${e}`);
    return {};
  }
};

oauthUtil.buildOAuthParams = oauthParams => {
  oauthParams = Object.assign({
    state: util.randomString(),
    nonce: util.randomString(),
    scope: 'openid',
    response_type: 'id_token token'
  }, oauthParams);

  // add the openid scope if requesting an id_token
  if (oauthParams.response_type.includes('id_token') &&
    oauthParams.scope && !oauthParams.scope.includes('openid')) {
    oauthParams.scope += ' openid';
  }

  // determine the most appropriate responseMode if none is provided
  if (!oauthParams.response_mode) {
    if (oauthParams.response_type === 'code') {
      oauthParams.response_mode = 'query';
    } else {
      oauthParams.response_mode = 'fragment';
    }
  }

  return oauthParams;
};

oauthUtil.buildAuthorizeUrl = (context, oauthParams) => {
  const authorization_endpoint = oauthUtil.getEndpoint(context, 'authorization_endpoint');
  const query = queryString.stringify(oauthParams);
  return `${authorization_endpoint}?${query}`;
};

oauthUtil.buildSignOutUrl = (context, {post_logout_redirect_uri, state}) => {
  const end_session_endpoint = oauthUtil.getEndpoint(context, 'end_session_endpoint');

  const idToken = storage.getIdToken(context);
  if (!idToken) {
    throw new TokenClientError('Unable to sign out, because a user is not signed in');
  }

  const queryParams = queryString.stringify({
    id_token_hint: idToken.string,
    post_logout_redirect_uri: post_logout_redirect_uri || context.definedEndpoints.post_logout_redirect_uri,
    state
  });

  return `${end_session_endpoint}?${queryParams}`;
}

oauthUtil.prepareAuthorizationRequest = (context, oauthParams, paramOverrides = {}) => {
  oauthParams = Object.assign(context.oauthDefaults, oauthParams, paramOverrides);
  oauthParams = oauthUtil.buildOAuthParams(oauthParams);
  context.setRequestParams(oauthParams);
  return oauthUtil.buildAuthorizeUrl(context, oauthParams);
};

oauthUtil.getEndpoint = (context, name) => {
  const endpoint = context.definedEndpoints[name] || context.config[name];
  if (!endpoint) {
    throw new TokenClientError(`Unable to discover the ${name}, so it must be provided`);
  }
  return endpoint;
};

oauthUtil.handleOAuthResponse = async (context, resp) => {
  if (resp.error && resp.error_description) {
    throw new OAuthError(resp.error, resp.error_description);
  }

  const requestParams = context.getRequestParams();
  if (!requestParams) {
    throw new TokenValidationError('Unable to validate tokens. There are no request params saved.');
  }

  // validate state
  if (resp.state !== requestParams.state) {
    throw new TokenValidationError('The returned state does not match our expected state.');
  }

  const tokens = {};

  if (resp.id_token) {
    const idToken = await oauthUtil.validateIdToken(context, resp.id_token);

    // estimate our drift using the issued-at time vs now
    const timeDifference = Math.floor(Date.now()/1000) - idToken.payload.iat;
    
    tokens.idToken = {
      string: resp.id_token,
      expiration: idToken.payload.exp + timeDifference,
      claims: idToken.payload
    };
    context.setIdToken(tokens.idToken);
  }

  if (resp.access_token) {
    tokens.accessToken = {
      string: resp.access_token,
      expiration: Math.floor(Date.now()/1000) + Number.parseInt(resp.expires_in, 10),
      tokenType: resp.token_type,
      scope: resp.scope || requestParams.scope
    };
    context.setAccessToken(tokens.accessToken);
  }

  if (resp.code) {
    tokens.code = resp.code;
  }

  return tokens;
};

oauthUtil.validateIdToken = async (context, idToken) => {
  const idTokenJwt = jwtUtil.decode(idToken);
  const claims = idTokenJwt.payload;

  // validate the expiration (exp)
  const adjustedExpiration = claims.exp + context.config.maxClockSkew;
  if (adjustedExpiration * 1000 < Date.now()) {
    throw new TokenValidationError('The returned id_token is already expired.');
  }

  // validate the issued-at time (iat)
  const adjustedIssuedAt = claims.iat - context.config.maxClockSkew;
  if (adjustedIssuedAt * 1000 > Date.now()) {
    throw new TokenValidationError('The returned id_token was issued in the future.');
  }

  // validate the nonce
  const requestParams = context.getRequestParams();
  if (claims.nonce !== requestParams.nonce) {
    throw new TokenValidationError('The nonce of the returned id_token does not match our expected nonce.');
  }

  // validate the audience contains the client_id (aud)
  if (!claims.aud.includes(requestParams.client_id)) {
    throw new TokenValidationError('The aud of the returned id_token does not include our client\'s client_id.');
  }

  // validate the issuer
  if (claims.iss !== context.issuer) {
    throw new TokenValidationError('The iss of the returned id_token is not the issuer we requested an id_token for.');
  }

  // verify the signature
  const jwks_uri = oauthUtil.getEndpoint(context, 'jwks_uri');
  await jwtUtil.verifyTokenSignature(jwks_uri, idToken);

  return idTokenJwt;
};

oauthUtil.createIframe = src => {
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.src = src;
  return document.body.appendChild(iframe);
};

oauthUtil.createPopup = src => {
  const title = 'External Identity Provider User Authentication';
  const appearance = 'toolbar=no, scrollbars=yes, resizable=yes, top=100, left=500, width=600, height=600';
  return window.open(src, title, appearance);
};

oauthUtil.resetStorage = (context) => {
  // reset the storage
  context.removeUser();
  context.removeAccessToken();
  context.removeIdToken();
  context.removeRequestParams();
};

oauthUtil.supportsPostMessage = context => 
  context.config.response_modes_supported &&
  context.config.response_modes_supported.includes('okta_post_message');

oauthUtil.pollUrlForResponse = async (context, oauthParams, windowEl, responseType = 'hash') => {
  return new Promise((resolve, reject) => {
    const windowType = windowEl.location ? 'popup' : 'iframe';
    const pollFrequency = 1000;
    const maxPollTime = 120000;
    let currentPollTime = 0;

    const interval = setInterval(() => {
      currentPollTime += pollFrequency;

      if (windowType === 'popup' && windowEl.closed) {
        clearInterval(interval);
        return reject(new TokenClientError('The popup was closed while polling for an OAuth response'));
      }

      const windowLoc = windowType === 'iframe' ?
        windowEl.contentWindow.location :
        windowEl.location;
      const resp = queryString.parse(windowLoc[responseType]);
      if (resp && resp.state === oauthParams.state) {
        clearInterval(interval);
        return resolve(resp);
      }

      if (currentPollTime >= maxPollTime) {
        clearInterval(interval);
        return reject(new TokenClientError(`Timed out while waiting for the ${windowType} url ${responseType} to change`));
      }
    }, pollFrequency); // Check every second
  });
};

oauthUtil.waitForPostMessage = async (context, oauthParams) => {
  return new Promise((resolve, reject) => {
    window.addEventListener('message', e => {
      try {
        const issuerOrigin = util.getOrigin(context.issuer);
        if (!e.data || e.data.state !== oauthParams.state || e.origin !== issuerOrigin) {
          return;
        }
        resolve(e.data);
      } catch(err) {
        reject(new TokenClientError(`Unable to handle the postMessage response: ${err.message}`));
      }
    });
  });
};

oauthUtil.renewTokens = async context => {
  const requestParams = context.getRequestParams() || {};
  delete requestParams.state;
  delete requestParams.nonce;
  return context.signInSilently(requestParams);
};
