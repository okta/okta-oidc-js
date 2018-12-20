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

const EventEmitter = require('events').EventEmitter;
const _ = require('lodash');
const oidcUtil = require('./oidcUtil');
const connectUtil = require('./connectUtil');
const {
  assertIssuer,
  assertClientId,
  assertClientSecret,
  assertRedirectUri
} = require('@okta/configuration-validation');

/**
 * Class to easily integrate OpenId Connect with Express
 *
 * @class ExpressOIDC
 */
module.exports = class ExpressOIDC extends EventEmitter {

  /**
   * Creates an instance of ExpressOIDC
   *
   * @param {Object} options
   * @param {string} options.issuer The OpenId Connect issuer
   * @param {string} options.client_id This app's OpenId Connect client id
   * @param {string} options.client_secret This app's OpenId Connect client secret
   * @param {string} options.redirect_uri The location of the authorization callback
   * @param {string} [options.scope=openid] The scopes that will determine the claims on the tokens
   * @param {string} [options.response_type=code] The OpenId Connect response type
   * @param {number} [options.maxClockSkew=120] The maximum discrepancy allowed between server clocks in seconds
   * @param {Object} [options.testing] Testing overrides for disabling configuration validation
   * @param {Object} [options.routes]
   * @param {Object} [options.routes.login]
   * @param {string} [options.routes.login.path=/login] Path where the login middleware is hosted
   * @param {Object} [options.routes.callback]
   * @param {string} [options.routes.callback.path=/authorization-code] Path where the callback middleware is hosted
   * @param {string} [options.routes.callback.defaultRedirect=/] Where to redirect if there is no returnTo path defined
   * @param {Function} [options.routes.callback.handler] This handles responses from the OpenId Connect callback
   */
  constructor(options = {}) {
    super();

    const {
      issuer,
      client_id,
      client_secret,
      redirect_uri,
      sessionKey
    } = options;

    // Validate the issuer param
    assertIssuer(issuer, options.testing);

    // Validate the client_id param
    assertClientId(client_id);

    // Validate the client_secret param
    assertClientSecret(client_secret);

    // Validate the redirect_uri param
    assertRedirectUri(redirect_uri);

    // Add defaults to the options
    options = _.merge({
      response_type: 'code',
      scope: 'openid',
      routes: {
        login: {
          path: '/login'
        },
        callback: {
          path: '/authorization-code/callback',
          defaultRedirect: '/'
        }
      },
      sessionKey: sessionKey || `oidc:${options.issuer}`,
      maxClockSkew: 120
    }, options)

    const context = {
      options
    };

    /**
     * Construct an Express router that should be added to an app
     *
     * @instance
     * @property
     * @memberof ExpressOIDC
     */
    this.router = connectUtil.createOIDCRouter(context);

    /**
     * Ensure that a user is authenticated before continuing.
     * If not authenticated, then redirects to the login route.
     * If not authenticated and not requesting text/html, return a 401.
     *
     * @instance
     * @function
     * @memberof ExpressOIDC
     */
    this.ensureAuthenticated = oidcUtil.ensureAuthenticated.bind(null, context);

    // create client
    oidcUtil.createClient(context)
    .then(client => {
      context.client = client;
      oidcUtil.bootstrapPassportStrategy(context);
      this.emit('ready');
    })
    .catch(err => this.emit('error', err));
  }
};
