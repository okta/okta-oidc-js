/*!
 * Copyright (c) 2018-Present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import str2buf from 'str2buf';
import b64u from 'b64u-lite';
import crypto from 'isomorphic-webcrypto';
import * as util from './util';
import * as tokenClientUtil from './token-client-util';
import { OidcError } from './errors';
import { getWellKnown } from './token-client-util';
import delve from 'dlv';

async function createPKCEParams() {
  const code_verifier = util.createRandomString(43);
  const code_challenge_buffer = await crypto.subtle.digest({ name: 'SHA-256' }, code_verifier);
  const code_challenge = b64u.fromBinaryString(str2buf.fromBuffer(code_challenge_buffer));
  return {
    code_verifier,
    code_challenge
  };
}

export async function performPkceCodeFlow(client, options, getAuthCode) {
  await crypto.ensureSecure();
  const wellKnown = await getWellKnown(client);
  let authorization_endpoint = client.authorization_endpoint || options.authorization_endpoint || wellKnown.authorization_endpoint;
  delete options.authorization_endpoint;

  // Create the PKCE requirements
  const {
    code_verifier,
    code_challenge
  } = await createPKCEParams();

  // Create the authorize endpoint params
  const params = Object.assign({
    response_type: 'code',
    scope: 'openid',
    code_challenge_method: 'S256',
    code_challenge,
    state: util.createRandomString(12),
    nonce: util.createRandomString(12)
  }, client.config, options, {
    response_type: 'code'
  });

  // Perform the OIDC redirect (or otherwise)
  const authorizeUri = `${authorization_endpoint}?${util.urlFormEncode(params)}`;
  const oidcResponse = await getAuthCode(authorizeUri, params.redirect_uri);

  // Handle any response errors
  if (oidcResponse.error) {
    throw new OidcError(oidcResponse);
  }

  // Exchange the code for tokens
  const tokenResp = await tokenClientUtil.request(wellKnown.token_endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: util.urlFormEncode({
      grant_type: 'authorization_code',
      client_id: params.client_id,
      redirect_uri: params.redirect_uri,
      code: oidcResponse.code,
      code_verifier
    })
  });

  const authContext = {};

  if (tokenResp.id_token) {
    const tokenVerifier = await tokenClientUtil.getTokenVerifier(client);
    const claims = await tokenVerifier.verify(tokenResp.id_token);
    authContext.idToken = {
      string: tokenResp.id_token,
      expiresAt: claims.exp
    };
  }

  if (tokenResp.access_token) {
    authContext.accessToken = {
      string: tokenResp.access_token,
      expiresAt: Math.floor(Date.now()/1000) + Number.parseInt(tokenResp.expires_in)
    };
  }

  if (tokenResp.refresh_token) {
    authContext.refreshToken = {
      string: tokenResp.refresh_token
    };
  }

  await tokenClientUtil.setAuthContext(client, authContext);

  return tokenResp;
}

export async function refreshAccessToken(client, options) {
  const authContext = await tokenClientUtil.getAuthContext(client);
  if (!authContext || !authContext.refreshToken) return;
  const wellKnown = await tokenClientUtil.getWellKnown(client);

  // Create token endpoint params
  options = Object.assign({
    client_id: client.client_id,
    grant_type: 'refresh_token',
    refresh_token: authContext.refreshToken.string
  }, options);

  // Exchange the refresh token for fresh tokens
  let tokenResp = {};
  try {
    tokenResp = await tokenClientUtil.request(wellKnown.token_endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: util.urlFormEncode(options)
    });
  } catch (e) {
    if (e.name !== 'OidcError') {
      throw e;
    }
    delete authContext.accessToken;
    delete authContext.refreshToken;
  }

  if (tokenResp.access_token) {
    authContext.accessToken = {
      string: tokenResp.access_token,
      expiresAt: Math.floor(Date.now()/1000) + Number.parseInt(tokenResp.expires_in)
    };
  }

  if (tokenResp.refresh_token) {
    authContext.refreshToken = {
      string: tokenResp.refresh_token
    };
  }

  await tokenClientUtil.setAuthContext(client, authContext);

  return delve(authContext, 'accessToken.string');
}
