import snakeCase from 'lodash.snakecase';
import queryString from 'query-string';
import {OAuthError, TokenValidationError} from './errors';
import util from './util';
import jwtUtil from './jwtUtil';

const oauthUtil = {};
export default oauthUtil;

oauthUtil.buildOAuthParams = oauthParams => {
  oauthParams = Object.assign({
    state: util.randomString(),
    nonce: util.randomString(),
    scopes: ['openid'],
    responseTypes: ['id_token', 'token']
  }, oauthParams);

  // add the openid scope if requesting an id_token
  if (oauthParams.responseTypes.includes('id_token') &&
    oauthParams.scopes && !oauthParams.scopes.includes('openid')) {
    oauthParams.scopes.push('openid');
  }

  // determine the most appropriate responseMode if none is provided
  if (!oauthParams.responseMode) {
    if (oauthParams.responseTypes.length === 1 && oauthParams.responseTypes[0] === 'code') {
      oauthParams.responseMode = 'query';
    } else {
      oauthParams.responseMode = 'fragment';
    }
  }

  return oauthParams;
};

oauthUtil.snakeCaseOAuthParams = oauthParams => {
  const snakedParams = {};

  // for each key
  for (let [key, value] of Object.entries(oauthParams)) {
    // convert it to snakeCase unless it's sessionToken
    if (key === 'sessionToken') {
      snakedParams.sessionToken = value;
      continue;
    }

    let snakedKey = snakeCase(key);
    let flatValue = value;
    
    // if it's an array
    if (Array.isArray(value)) {
      // join with a space and remove the trailing 's'
      flatValue = value.join(' ');
      if (snakedKey[snakedKey.length - 1] === 's') {
        snakedKey = snakedKey.slice(0, -1);
      }
    }

    // if it was already snakeCase
    if (key === snakedKey) {
      snakedParams[key] = value;
      continue;
    }

    // if a snakeCase key is in the params
    if (oauthParams[snakedKey]) {
      continue;
    }

    snakedParams[snakedKey] = flatValue;
  }

  return snakedParams;
};

oauthUtil.buildAuthorizeUrl = (context, oauthParams) => {
  const authorizeUrl = context.config['authorization_endpoint'];
  const snakecasedParams = oauthUtil.snakeCaseOAuthParams(oauthParams);
  const query = queryString.stringify(snakecasedParams);
  return `${authorizeUrl}?${query}`;
};

oauthUtil.getWellKnownConfig = async context => {
  if (context.config) {
    return context.config;
  }
  return await (await fetch(context.wellKnownConfiguration)).json();
};

oauthUtil.createIframe = src => {
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.src = src;
  return document.body.appendChild(iframe);
};

oauthUtil.resetStorage = (context, options={}) => {
  // backup current storage
  const existingUser = context.getUser();
  const existingTokens = {
    'accessToken': context.getAccessTokenString(),
    'idToken': context.getIdTokenString()
  };

  // reset the storage
  context.removeUser();
  context.removeAccessToken();
  context.removeIdToken();
  context.removeRequestParams();

  // trigger changes by default
  if (options.emitEvents !== false) {
    context.eventEmitter.emit('user_changed', undefined, existingUser);
    context.eventEmitter.emit('tokens_changed', undefined, existingTokens);
  }
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

  // track these so we can trigger a change event later
  const previousTokens = {
    idToken: context.getIdTokenString(),
    accessToken: context.getAccessTokenString()
  };

  const tokens = {};

  if (resp.id_token) {
    const idToken = await oauthUtil.validateIdToken(context, resp.id_token);

    // estimate our drift using the issued-at time vs now
    const timeDifference = Date.now() - (idToken.payload.iat * 1000);
    
    tokens.idToken = resp.id_token;
    context.setIdToken({
      string: resp.id_token,
      expiresAt: (idToken.payload.exp * 1000) + timeDifference
    });
  }

  if (resp.access_token) {
    tokens.accessToken = resp.access_token;
    context.setAccessToken({
      string: resp.access_token,
      expiresAt: Date.now() + Number.parseInt(resp.expires_in, 10) * 1000,
      tokenType: resp.token_type
    });
  }

  if (resp.code) {
    tokens.code = resp.code;
  }

  if (!tokens.idToken && !tokens.accessToken) {
    oauthUtil.resetStorage(context);
  } else {
    // this will trigger the user_changed event before the tokens_changed event
    await context.refreshUserInfo();
    context.eventEmitter.emit('tokens_changed', util.omit(tokens, ['code']), previousTokens);
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
  if (!claims.aud.includes(requestParams.clientId)) {
    throw new TokenValidationError('The aud of the returned id_token does not include our client\'s clientId.');
  }

  // validate the issuer
  if (claims.iss !== context.config.issuer) {
    throw new TokenValidationError('The iss of the returned id_token is not the issuer we requested an id_token for.');
  }

  // verify the signature
  await jwtUtil.verifyTokenSignature({
    jwksEndpoint: context.config.jwks_uri,
    token: idToken
  });

  return idTokenJwt;
};
