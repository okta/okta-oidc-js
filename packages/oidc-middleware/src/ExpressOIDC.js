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
const merge = require('lodash/merge');
const oidcUtil = require('./oidcUtil');
const connectUtil = require('./connectUtil');
const logout = require('./logout');
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
   * @param {string} options.appBaseUrl The protocol + domain + post of this app
   * @param {string} options.issuer The OpenId Connect issuer
   * @param {string} options.client_id This app's OpenId Connect client id
   * @param {string} options.client_secret This app's OpenId Connect client secret
   * @param {string} options.loginRedirectUri The location of the login authorization callback if not redirecting to this app
   * @param {string} options.logoutRedirectUri The location of the logout callback if not redirecting to this app
   * @param {string} [options.scope=openid] The scopes that will determine the claims on the tokens
   * @param {string} [options.response_type=code] The OpenId Connect response type
   * @param {number} [options.maxClockSkew=120] The maximum discrepancy allowed between server clocks in seconds
   * @param {Object} [options.testing] Testing overrides for disabling configuration validation
   * @param {Object} [options.routes]
   * @param {Object} [options.routes.login]
   * @param {string} [options.routes.login.path=/login] Path where the login middleware is hosted
   * @param {Object} [options.routes.loginCallback]
   * @param {string} [options.routes.loginCallback.afterCallback=/] Where to redirect to once callback is complete
   * @param {Function} [options.routes.loginCallback.handler] This handles responses from the OpenId Connect callback
   * @param {string} [options.routes.loginCallback.path=/authorization-code/callback] Path where the callback middleware is hosted
   * @param {Object} [options.routes.logout]
   * @param {string} [options.routes.logout.path=/logout] Path where the login middleware is hosted
   * @param {Object} [options.routes.logoutCallback]
   * @param {string} [options.routes.logoutCallback.afterCallback=/] Where to redirect to once callback is complete
   * @param {string} [options.routes.logoutCallback.path=/logout/callback] Path where the callback middleware is hosted
   */
  constructor(options = {}) {
    super();

    const {
      issuer,
      client_id,
      client_secret,
      appBaseUrl,
      redirect_uri, // DEPRECATED in favor of `loginRedirectUri` or automatic determination via `appBaseUrl` and `routes.postLoginCallback`
      loginRedirectUri,
      logoutRedirectUri,
      sessionKey
    } = options;

    // Validate the issuer param
    assertIssuer(issuer, options.testing);

    // Validate the client_id param
    assertClientId(client_id);

    // Validate the client_secret param
    assertClientSecret(client_secret);

    
    // DEPRECATED: options.routes.callback is deprecated in favor of options.routes.loginCallback
    // Fallbacks for deprecated options will be removed in a future update
    if(options.routes) { 
      options.routes.loginCallback = options.routes.loginCallback || options.routes.callback;
    }

    // Add defaults to the options
    options = merge({
      response_type: 'code',
      scope: 'openid',
      routes: {
        login: {
          path: '/login'
        },
        loginCallback: {
          path: '/authorization-code/callback',
          afterCallback: '/'
        },
        logout: { 
          path: '/logout'
        },
        logoutCallback: { 
          path: '/logout/callback',
          afterCallback: '/'
        },
      },
      sessionKey: sessionKey || `oidc:${issuer}`,
      maxClockSkew: 120
    }, options);

    // Build redirect uris unless they were explicitly set
    // DEPRECATED: `redirect_uri` is deprecated in favor of `loginRedirectUri` (and most users will just set `appBaseUrl` and not set either of these)
    // DEPRECATED: `options.routes.callback` is deprecated in favor of `options.routes.loginCallback`
    // Fallbacks for deprecated options will be removed in a future update
    options.loginRedirectUri = loginRedirectUri || redirect_uri || `${appBaseUrl}${options.routes.loginCallback.path}` || `${appBaseUrl}${options.routes.callback.path}`;
    options.logoutRedirectUri = logoutRedirectUri || `${appBaseUrl}${options.routes.logoutCallback.path}`;
    options.routes.loginCallback.afterCallback = options.routes.loginCallback.afterCallback || options.routes.loginCallback.defaultRedirect;

    // Validate the redirect_uri param now that appBaseUrl applied
    assertRedirectUri(options.loginRedirectUri); 

    const context = {
      options,
      emitter: this
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

    /**
     * Perform a logout at the Okta side and revoke the id/access tokens
     * Will 200 even if user is not logged in
     *
     * @instance
     * @function
     * @memberof ExpressOIDC
     */
    this.forceLogoutAndRevoke = logout.forceLogoutAndRevoke.bind(null, context);

    // create client
    oidcUtil.createClient(context)
    .then(client => {
      context.client = client;
      oidcUtil.bootstrapPassportStrategy(context);
      context.emitter.emit('ready');
    })
    .catch(err => context.emitter.emit('error', err));
  }
};
