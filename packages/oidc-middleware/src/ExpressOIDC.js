const EventEmitter = require('events').EventEmitter;
const uuid = require('uuid');
const _ = require('lodash');
const oidcUtil = require('./oidcUtil');
const connectUtil = require('./connectUtil');

class OIDCMiddlewareError extends Error {}

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
      redirect_uri
    } = options;

    const missing = [];
    if (!issuer) missing.push('issuer');
    if (!client_id) missing.push('client_id');
    if (!client_secret) missing.push('client_secret');
    if (!redirect_uri) missing.push('redirect_uri');
    if (missing.length) {
      throw new OIDCMiddlewareError(`${missing.join(', ')} must be defined`);
    }

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
      }
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
