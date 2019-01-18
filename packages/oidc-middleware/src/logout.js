/*!
 * Copyright (c) 2019-Present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */
const fetch = require('node-fetch');
const querystring = require('querystring');
const uuid = require('uuid');

const logout = module.exports;

const makeErrorHandler = emitter => err => { 
  if (err.type) { 
    emitter.emit('error', `${err.type} - ${err.text}`);
  } else {
    emitter.emit('error', err);
  }
};

const makeAuthorizationHeader = ({ client_id, client_secret }) => 
  'Basic ' + Buffer.from(`${client_id}:${client_secret}`).toString('base64');

const makeTokenRevoker = ({ issuer, client_id, client_secret, errorHandler }) => { 
  const revokeEndpoint = `${issuer}/v1/revoke`;

  return ({ token_hint, token }) => { 
    return fetch(revokeEndpoint, { 
      method: 'POST',
      headers: { 
        'accepts': 'application/json',
        'content-type': 'application/x-www-form-urlencoded',
        'authorization': makeAuthorizationHeader({ client_id, client_secret }),
      },
      body: querystring.stringify({token, token_type_hint: token_hint}),
    })
      .then( r => r.ok ? r : r.text().then( e => Promise.reject({type: 'revokeError', message: e}) ))
      .catch( errorHandler ); // catch and emit - this promise chain can never fail
  };
};


logout.forceLogoutAndRevoke = context => { 
  const emitter = context.emitter;
  const { issuer, client_id, client_secret } = context.options;
  const REVOKABLE_TOKENS = ['refresh_token', 'access_token'];

  const revokeToken = makeTokenRevoker({ issuer, client_id, client_secret, errorHandler: makeErrorHandler(emitter) });
  return async (req, res, next) => { 
    const tokens = req.userContext.tokens;
    const revokeIfExists = token_hint => tokens[token_hint] ? revokeToken({token_hint, token: tokens[token_hint]}) : null;
    const revokes = REVOKABLE_TOKENS.map( revokeIfExists );
    // attempt all revokes before logout
    await Promise.all(revokes); // these capture (emit) all rejections, no wrapping catch needed, no early fail of .all()

    const state = uuid.v4();
    const params = {
      state,
      id_token_hint: tokens.id_token,
      post_logout_redirect_uri: context.options.logoutRedirectUri,
    };
    req.session[context.options.sessionKey] = { state };

    const endOktaSessionEndpoint = `${context.options.issuer}/v1/logout?${querystring.stringify(params)}`;
    return res.redirect(endOktaSessionEndpoint);
  };
};


