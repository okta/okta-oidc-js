/*!
 * Copyright (c) 2017-Present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

const fs = require('fs');
const path = require('path');
const qs = require('qs');
const fetch = require('node-fetch');
const url = require('url');
const querystring = require('querystring');
const njwt = require('njwt');
const constants = require('./constants');
const OktaJwtVerifier = require('../lib');

const ISSUER = constants.ISSUER;
const OKTA_TESTING_DISABLEHTTPSCHECK = constants.OKTA_TESTING_DISABLEHTTPSCHECK

const NODE_MODULES = path.resolve(__dirname, '../node_modules');
const publicKeyPath = path.normalize(path.join(NODE_MODULES, '/njwt/test/rsa.pub'));
const privateKeyPath = path.normalize(path.join(NODE_MODULES, '/njwt/test/rsa.priv'));
const wrongPublicKeyPath = path.normalize(path.join(__dirname, '/keys/rsa-fake.pub'));
const rsaKeyPair = {
  public: fs.readFileSync(publicKeyPath, 'utf8'),
  private: fs.readFileSync(privateKeyPath, 'utf8'),
  wrongPublic: fs.readFileSync(wrongPublicKeyPath, 'utf8')
};


function getTokens(options = {}) {
  const {
    ISSUER,
    CLIENT_ID,
    REDIRECT_URI,
    USERNAME,
    PASSWORD,
    NONCE,
    RESPONSE_TYPE
  } = options;

  return new Promise((resolve, reject) => {
    const urlProperties = url.parse(ISSUER);
    const domain = urlProperties.protocol + '//' + urlProperties.host;
    const postUrl = domain + '/api/v1/authn';

    fetch(postUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: USERNAME,
        password: PASSWORD
      })
    }).then(resp => {
      if (!resp.ok) {
        throw new Error(`/api/v1/authn returned error: ${resp.status}`);
      }

      return resp.json();
    }).then(body => {
      if (!body.sessionToken) {
        throw new Error(`Could not pass sessionToken from ${postUrl}`);
      }

      const authorizeParams = {
        sessionToken: body.sessionToken,
        response_type: RESPONSE_TYPE || 'id_token token',
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        scope: 'openid',
        state: 'foo',
        nonce: NONCE || 'foo'
      }
      const authorizeUrl = ISSUER + '/v1/authorize?' + qs.stringify(authorizeParams);

      return fetch(authorizeUrl, { redirect: 'manual' });
    }).then(resp => {
      if (resp.status >= 400) {
        throw new Error(`/api/v1/authorize error: ${resp.status}`);
      }

      const parsedUrl = url.parse(resp.headers.get('location'), true);
      const parsedParams = parsedUrl.hash ? querystring.parse(parsedUrl.hash.slice(1)) : parsedUrl.query;
      
      if (parsedParams.error) {
        throw new Error(`/api/v1/authorize error in query: ${parsedParams.error}`);
      }
      
      resolve({
        accessToken: parsedParams.access_token, 
        idToken: parsedParams.id_token, 
      });
    }).catch(err => {
      console.error(err.message || err);
      reject(err)
    });
  });
}

function getAccessToken(options = {}) {
  return getTokens({...options, RESPONSE_TYPE: 'token'}).then(({accessToken: accessToken}) => {
    if (!accessToken){
      throw new Error('Could not parse access token from URI');
    }
    return accessToken;
  });
}

function getIdToken(options = {}) {
  return getTokens({...options, RESPONSE_TYPE: 'id_token'}).then(({idToken: idToken}) => {
    if (!idToken){
      throw new Error('Could not parse ID token from URI');
    }
    return idToken;
  });
}

function createToken(claims, headers = {}) {
  let token = new njwt.Jwt(claims)
    .setSigningAlgorithm('RS256')
    .setSigningKey(rsaKeyPair.private);
  
  for (const [k, v] of Object.entries(headers)) {
    token = token.setHeader(k, v);
  }
  
  return token.compact();
}

function createVerifier(options = {}) {
  return new OktaJwtVerifier({
    issuer: ISSUER,
    testing: {
      disableHttpsCheck: OKTA_TESTING_DISABLEHTTPSCHECK
    },
    ...options
  });
}

function createCustomClaimsVerifier(customClaims, otherClaims) {
  return {
    verify: function(jwt, cb) {
      cb(null, {
        body: {
          ...otherClaims,
          ...customClaims
        }
      })
    }
  };
}

module.exports = {
  getAccessToken,
  getIdToken,
  createToken,
  createVerifier,
  createCustomClaimsVerifier,
  rsaKeyPair
};
